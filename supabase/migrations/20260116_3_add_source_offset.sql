-- Add current_source_offset column to track pagination within each source
-- This fixes the bug where offset was cumulative across all sources

ALTER TABLE kb_scan_jobs
ADD COLUMN IF NOT EXISTS current_source_offset INT DEFAULT 0;

-- Add comment explaining the column
COMMENT ON COLUMN kb_scan_jobs.current_source_offset IS 'Tracks pagination offset within the current source. Reset to 0 when moving to next source.';
