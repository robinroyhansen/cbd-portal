-- Admin Audit Log Table
-- Tracks all admin actions for accountability and debugging

-- Create the audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,           -- Action performed (e.g., 'approve_study', 'delete_article')
  resource_type VARCHAR(50) NOT NULL,    -- Type of resource (e.g., 'research', 'article', 'brand')
  resource_id UUID,                      -- ID of the affected resource (nullable for bulk operations)
  admin_identifier VARCHAR(100),         -- IP address or future user ID
  details JSONB,                         -- Additional context (changed fields, old/new values, etc.)
  ip_address INET,                       -- Client IP address
  user_agent TEXT,                       -- Client user agent string
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON admin_audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_id ON admin_audit_log(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_identifier);

-- Composite index for filtering
CREATE INDEX IF NOT EXISTS idx_audit_log_type_action ON admin_audit_log(resource_type, action);

-- Add comment
COMMENT ON TABLE admin_audit_log IS 'Tracks all admin actions for accountability and debugging';
COMMENT ON COLUMN admin_audit_log.action IS 'Action performed (approve_study, delete_article, etc.)';
COMMENT ON COLUMN admin_audit_log.resource_type IS 'Type of resource affected (research, article, brand, etc.)';
COMMENT ON COLUMN admin_audit_log.resource_id IS 'UUID of affected resource, NULL for bulk operations';
COMMENT ON COLUMN admin_audit_log.admin_identifier IS 'Admin identifier (IP for now, user ID when multi-user is implemented)';
COMMENT ON COLUMN admin_audit_log.details IS 'Additional context as JSON (changed fields, counts, etc.)';

-- Enable RLS (admin audit logs should be read-only for service role)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/read
-- No updates or deletes allowed (audit logs are immutable)
CREATE POLICY "Service role can insert audit logs"
  ON admin_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read audit logs"
  ON admin_audit_log
  FOR SELECT
  TO service_role
  USING (true);

-- Optional: Auto-cleanup old logs (keep last 90 days)
-- Uncomment if you want automatic cleanup
-- CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM admin_audit_log
--   WHERE created_at < NOW() - INTERVAL '90 days';
-- END;
-- $$ LANGUAGE plpgsql;
