CREATE TABLE IF NOT EXISTS contacts (
  email TEXT PRIMARY KEY,
  name TEXT,
  status TEXT DEFAULT 'pending',
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_config (
  id TEXT PRIMARY KEY,
  dailyLimit INTEGER DEFAULT 20,
  isPaused BOOLEAN DEFAULT 1
);

INSERT OR IGNORE INTO campaign_config (id, dailyLimit, isPaused) VALUES ('settings', 20, 1);
