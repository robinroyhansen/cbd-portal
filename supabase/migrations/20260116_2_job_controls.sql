-- Job Controls: Add resume_state for pause/resume functionality

-- Add resume_state column to track cursor/page info for each source when paused
-- Example: {"pubmed": {"offset": 100, "totalResults": 5000}, "pmc": {"offset": 0, "totalResults": 0}}
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS resume_state JSONB DEFAULT '{}';

-- Add paused_at timestamp to track when job was paused
ALTER TABLE kb_scan_jobs ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- Add index on resume_state for faster queries (if needed)
CREATE INDEX IF NOT EXISTS idx_scan_jobs_resume_state ON kb_scan_jobs USING gin(resume_state);
