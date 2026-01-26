-- D1 schema for labour-hire platform MVP
-- Tables are intentionally compact; adjust indexes once real traffic patterns are known.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT CHECK (role IN ('client','worker','staff')) NOT NULL,
  next_path TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS clients (
  client_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  org_name TEXT,
  contact_name TEXT,
  contact_mobile TEXT,
  contact_email TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS requests (
  request_id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('draft','submitted','candidates_proposed','contract_signed','released','active','completed')) NOT NULL,
  role_id TEXT NOT NULL,
  required_tickets TEXT, -- JSON array
  min_years_experience INTEGER NOT NULL DEFAULT 0,
  site_address TEXT,
  site_lat REAL,
  site_lng REAL,
  site_place_id TEXT,
  site_map_url TEXT,
  shift_start_time TEXT,
  shift_end_time TEXT,
  headcount INTEGER NOT NULL DEFAULT 1,
  start_date TEXT,
  end_date TEXT,
  notes TEXT,
  urgency_level TEXT,
  contract_signed INTEGER NOT NULL DEFAULT 0,
  release_to_client INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  created_by TEXT,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS workers (
  worker_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  company_number TEXT UNIQUE,
  name TEXT,
  mobile TEXT,
  role_id TEXT NOT NULL,
  years_experience INTEGER NOT NULL DEFAULT 0,
  verified_status TEXT CHECK (verified_status IN ('unverified','pending','verified')) NOT NULL DEFAULT 'unverified',
  last_verification_date TEXT,
  base_lat REAL,
  base_lng REAL,
  preferred_radius_km INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS worker_tickets (
  ticket_id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES workers(worker_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  front_image_key TEXT,
  back_image_key TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  visible_to_clients INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS worker_availability (
  availability_id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES workers(worker_id) ON DELETE CASCADE,
  start_datetime TEXT NOT NULL,
  end_datetime TEXT NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS assignments (
  assignment_id TEXT PRIMARY KEY,
  request_id TEXT REFERENCES requests(request_id) ON DELETE CASCADE,
  worker_id TEXT REFERENCES workers(worker_id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('proposed','contracted','released','active','completed')) NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  created_by TEXT,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS timesheets (
  timesheet_id TEXT PRIMARY KEY,
  assignment_id TEXT REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  hours REAL NOT NULL,
  status TEXT CHECK (status IN ('pending','confirmed','queried')) NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  confirmed_at TEXT,
  queried_at TEXT
);

CREATE TABLE IF NOT EXISTS incidents (
  incident_id TEXT PRIMARY KEY,
  assignment_id TEXT REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  type TEXT,
  severity TEXT,
  date TEXT,
  description TEXT,
  evidence_urls TEXT, -- JSON array
  status TEXT CHECK (status IN ('logged','under_review','resolved')) NOT NULL DEFAULT 'logged',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS praise (
  praise_id TEXT PRIMARY KEY,
  assignment_id TEXT REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  tag TEXT,
  note TEXT,
  date TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  worker_id TEXT PRIMARY KEY REFERENCES workers(worker_id) ON DELETE CASCADE,
  on_time_rate REAL,
  safety_score REAL,
  teamwork_score REAL,
  incident_rate REAL,
  reliability_index REAL,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS performance_history (
  metric_id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES workers(worker_id) ON DELETE CASCADE,
  period_start TEXT,
  period_end TEXT,
  values_json TEXT,
  narrative_highlights TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_role TEXT,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  timestamp INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  diff_json TEXT
);

-- Simple indexes
CREATE INDEX IF NOT EXISTS idx_requests_client ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_assignments_request ON assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_assignments_worker ON assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_assignment ON timesheets(assignment_id);
