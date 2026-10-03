-- Fauxdoo pricing catalog, settings, and captured leads.
-- Money is stored as integer cents.

CREATE TABLE tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  replaces TEXT NOT NULL,
  category TEXT NOT NULL,
  per_user_cents INTEGER NOT NULL DEFAULT 0,
  flat_cents INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  users INTEGER NOT NULL,
  tool_slugs TEXT NOT NULL,              -- JSON array string
  current_monthly_cents INTEGER NOT NULL,
  suite_monthly_cents INTEGER NOT NULL,
  annual_savings_cents INTEGER NOT NULL,
  consent INTEGER NOT NULL,              -- 1 = agreed to marketing emails
  created_at TEXT NOT NULL               -- ISO 8601 UTC
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created ON leads(created_at);
