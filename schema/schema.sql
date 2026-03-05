-- Status logs table for tracking system health and tool versions
CREATE TABLE IF NOT EXISTS status_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  check_date DATE NOT NULL,
  system TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('healthy', 'warning', 'critical')),
  issues TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_check_date ON status_logs(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_system ON status_logs(system);
CREATE INDEX IF NOT EXISTS idx_status ON status_logs(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON status_logs(created_at DESC);

-- Sample data (optional, for testing)
-- INSERT INTO status_logs (check_date, system, status, issues)
-- VALUES ('2026-03-05', 'website', 'healthy', NULL);
