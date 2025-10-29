import z from "zod";

export const TaskSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.number().min(1).max(5),
  estimated_duration: z.number().nullable(),
  deadline_at: z.string().nullable(),
  subject: z.string().nullable(),
  is_completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.number().min(1).max(5).default(3),
  estimated_duration: z.number().positive().optional(),
  deadline_at: z.string().optional(),
  subject: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const StudySessionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  task_id: z.number().nullable(),
  scheduled_start_at: z.string(),
  scheduled_end_at: z.string(),
  actual_start_at: z.string().nullable(),
  actual_end_at: z.string().nullable(),
  is_completed: z.boolean(),
  ai_suggested: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  task_title: z.string().optional(),
  subject: z.string().optional(),
});

export const CreateStudySessionSchema = z.object({
  task_id: z.number().optional(),
  scheduled_start_at: z.string(),
  scheduled_end_at: z.string(),
  ai_suggested: z.boolean().default(false),
});

export const UserPreferencesSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  preferred_study_start_time: z.string(),
  preferred_study_end_time: z.string(),
  break_duration: z.number(),
  max_session_duration: z.number(),
  notification_enabled: z.boolean(),
  timezone: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const UpdateUserPreferencesSchema = z.object({
  preferred_study_start_time: z.string().optional(),
  preferred_study_end_time: z.string().optional(),
  break_duration: z.number().positive().optional(),
  max_session_duration: z.number().positive().optional(),
  notification_enabled: z.boolean().optional(),
  timezone: z.string().optional(),
});

export const AIStudyTimeRequestSchema = z.object({
  tasks: z.array(z.object({
    id: z.number(),
    title: z.string(),
    priority: z.number(),
    estimated_duration: z.number(),
    deadline_at: z.string().nullable(),
    subject: z.string().nullable(),
  })),
  existing_sessions: z.array(z.object({
    scheduled_start_at: z.string(),
    scheduled_end_at: z.string(),
  })),
  preferences: z.object({
    preferred_study_start_time: z.string(),
    preferred_study_end_time: z.string(),
    break_duration: z.number(),
    max_session_duration: z.number(),
  }),
});

export type TaskType = z.infer<typeof TaskSchema>;
export type CreateTaskType = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskType = z.infer<typeof UpdateTaskSchema>;
export type StudySessionType = z.infer<typeof StudySessionSchema>;
export type CreateStudySessionType = z.infer<typeof CreateStudySessionSchema>;
export type UserPreferencesType = z.infer<typeof UserPreferencesSchema>;
export type UpdateUserPreferencesType = z.infer<typeof UpdateUserPreferencesSchema>;
export type AIStudyTimeRequestType = z.infer<typeof AIStudyTimeRequestSchema>;
