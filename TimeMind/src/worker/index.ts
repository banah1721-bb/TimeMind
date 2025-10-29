import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import OpenAI from "openai";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  CreateStudySessionSchema,
  UpdateUserPreferencesSchema,
  AIStudyTimeRequestSchema,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Task management endpoints
app.get('/api/tasks', authMiddleware, async (c) => {
  const user = c.get('user')!;
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY priority DESC, deadline_at ASC, created_at DESC'
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/tasks', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  
  const validatedData = CreateTaskSchema.parse(body);
  
  const result = await c.env.DB.prepare(
    `INSERT INTO tasks (user_id, title, description, priority, estimated_duration, deadline_at, subject, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(
    user.id,
    validatedData.title,
    validatedData.description || null,
    validatedData.priority,
    validatedData.estimated_duration || null,
    validatedData.deadline_at || null,
    validatedData.subject || null
  ).run();

  const newTask = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE id = ?'
  ).bind(result.meta.last_row_id).first();

  return c.json(newTask, 201);
});

app.put('/api/tasks/:id', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const taskId = c.req.param('id');
  const body = await c.req.json();
  
  const validatedData = UpdateTaskSchema.parse(body);
  
  const updateFields = [];
  const updateValues = [];
  
  Object.entries(validatedData).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    }
  });
  
  if (updateFields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }
  
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(user.id, taskId);
  
  await c.env.DB.prepare(
    `UPDATE tasks SET ${updateFields.join(', ')} WHERE user_id = ? AND id = ?`
  ).bind(...updateValues).run();

  const updatedTask = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE user_id = ? AND id = ?'
  ).bind(user.id, taskId).first();

  if (!updatedTask) {
    return c.json({ error: 'Task not found' }, 404);
  }

  return c.json(updatedTask);
});

app.delete('/api/tasks/:id', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const taskId = c.req.param('id');
  
  await c.env.DB.prepare(
    'DELETE FROM tasks WHERE user_id = ? AND id = ?'
  ).bind(user.id, taskId).run();

  return c.json({ success: true });
});

// Delete study session
app.delete('/api/study-sessions/:id', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const sessionId = c.req.param('id');
  
  await c.env.DB.prepare(
    'DELETE FROM study_sessions WHERE user_id = ? AND id = ?'
  ).bind(user.id, sessionId).run();

  return c.json({ success: true });
});

// Study sessions endpoints
app.get('/api/study-sessions', authMiddleware, async (c) => {
  const user = c.get('user')!;
  
  const { results } = await c.env.DB.prepare(
    `SELECT s.*, t.title as task_title, t.subject 
     FROM study_sessions s 
     LEFT JOIN tasks t ON s.task_id = t.id 
     WHERE s.user_id = ? 
     ORDER BY s.scheduled_start_at ASC`
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/study-sessions', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  
  const validatedData = CreateStudySessionSchema.parse(body);
  
  const result = await c.env.DB.prepare(
    `INSERT INTO study_sessions (user_id, task_id, scheduled_start_at, scheduled_end_at, ai_suggested, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(
    user.id,
    validatedData.task_id || null,
    validatedData.scheduled_start_at,
    validatedData.scheduled_end_at,
    validatedData.ai_suggested
  ).run();

  const newSession = await c.env.DB.prepare(
    `SELECT s.*, t.title as task_title, t.subject 
     FROM study_sessions s 
     LEFT JOIN tasks t ON s.task_id = t.id 
     WHERE s.id = ?`
  ).bind(result.meta.last_row_id).first();

  return c.json(newSession, 201);
});

// User preferences endpoints
app.get('/api/preferences', authMiddleware, async (c) => {
  const user = c.get('user')!;
  
  let preferences = await c.env.DB.prepare(
    'SELECT * FROM user_preferences WHERE user_id = ?'
  ).bind(user.id).first();

  if (!preferences) {
    // Create default preferences
    const result = await c.env.DB.prepare(
      `INSERT INTO user_preferences (user_id, updated_at) VALUES (?, CURRENT_TIMESTAMP)`
    ).bind(user.id).run();
    
    preferences = await c.env.DB.prepare(
      'SELECT * FROM user_preferences WHERE id = ?'
    ).bind(result.meta.last_row_id).first();
  }

  return c.json(preferences);
});

app.put('/api/preferences', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();
  
  const validatedData = UpdateUserPreferencesSchema.parse(body);
  
  const updateFields = [];
  const updateValues = [];
  
  Object.entries(validatedData).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    }
  });
  
  if (updateFields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }
  
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(user.id);
  
  await c.env.DB.prepare(
    `UPDATE user_preferences SET ${updateFields.join(', ')} WHERE user_id = ?`
  ).bind(...updateValues).run();

  const updatedPreferences = await c.env.DB.prepare(
    'SELECT * FROM user_preferences WHERE user_id = ?'
  ).bind(user.id).first();

  return c.json(updatedPreferences);
});

// AI study time suggestions endpoint
app.post('/api/ai/suggest-study-times', authMiddleware, async (c) => {
  const body = await c.req.json();
  
  const validatedData = AIStudyTimeRequestSchema.parse(body);
  
  const openai = new OpenAI({
    apiKey: (c.env as any).OPENAI_API_KEY,
  });

  const prompt = `You are an AI study scheduler. Based on the following information, suggest optimal study times for the user's tasks.

User's preferences:
- Study hours: ${validatedData.preferences.preferred_study_start_time} to ${validatedData.preferences.preferred_study_end_time}
- Break duration: ${validatedData.preferences.break_duration} minutes
- Max session duration: ${validatedData.preferences.max_session_duration} minutes

Tasks to schedule:
${validatedData.tasks.map(task => `
- ${task.title} (Priority: ${task.priority}/5, Duration: ${task.estimated_duration || 60} minutes, Deadline: ${task.deadline_at || 'No deadline'}, Subject: ${task.subject || 'General'})
`).join('')}

Existing scheduled sessions:
${validatedData.existing_sessions.map(session => `
- ${session.scheduled_start_at} to ${session.scheduled_end_at}
`).join('')}

Please suggest optimal study times for today and tomorrow, considering:
1. Task priorities and deadlines
2. User's preferred study hours
3. Avoiding conflicts with existing sessions
4. Including appropriate breaks
5. Grouping similar subjects when possible

Return a JSON array of suggested study sessions with this structure:
[
  {
    "task_id": number,
    "task_title": "string",
    "scheduled_start_at": "ISO datetime string",
    "scheduled_end_at": "ISO datetime string",
    "reasoning": "Brief explanation for this timing"
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const suggestions = JSON.parse(response.choices[0].message.content || '{"sessions": []}');
    
    return c.json(suggestions);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return c.json({ error: 'Failed to generate AI suggestions' }, 500);
  }
});

export default app;
