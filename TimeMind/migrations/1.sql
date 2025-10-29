
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 3,
  estimated_duration INTEGER,
  deadline_at DATETIME,
  subject TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  task_id INTEGER,
  scheduled_start_at DATETIME NOT NULL,
  scheduled_end_at DATETIME NOT NULL,
  actual_start_at DATETIME,
  actual_end_at DATETIME,
  is_completed BOOLEAN DEFAULT FALSE,
  ai_suggested BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  preferred_study_start_time TEXT DEFAULT '09:00',
  preferred_study_end_time TEXT DEFAULT '21:00',
  break_duration INTEGER DEFAULT 15,
  max_session_duration INTEGER DEFAULT 120,
  notification_enabled BOOLEAN DEFAULT TRUE,
  timezone TEXT DEFAULT 'UTC',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline_at);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_schedule ON study_sessions(scheduled_start_at);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
