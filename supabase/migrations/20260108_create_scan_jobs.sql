-- Create scan jobs table for tracking background research scans
CREATE TABLE IF NOT EXISTS kb_scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  -- Progress tracking
  current_source VARCHAR(50),
  sources_completed TEXT[] DEFAULT '{}',
  sources_total TEXT[] NOT NULL,

  -- Results tracking
  items_found INT DEFAULT 0,
  items_added INT DEFAULT 0,
  items_skipped INT DEFAULT 0,
  items_rejected INT DEFAULT 0,

  -- Configuration
  scan_depth VARCHAR(20) DEFAULT 'standard',
  custom_keywords TEXT[],

  -- Error tracking
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status ON kb_scan_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_created ON kb_scan_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE kb_scan_jobs ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (admin-only page)
DROP POLICY IF EXISTS "Admin full access to scan jobs" ON kb_scan_jobs;
CREATE POLICY "Admin full access to scan jobs" ON kb_scan_jobs FOR ALL USING (true);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE kb_scan_jobs;

-- Also enable realtime for research queue so UI updates when new items are added
ALTER PUBLICATION supabase_realtime ADD TABLE kb_research_queue;
