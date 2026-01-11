-- Migration: Add sample_size column for research participant counts
-- Date: 2026-01-11

-- Add sample_size column to store number of participants in the study
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS sample_size INTEGER;

-- Create index for faster SUM queries
CREATE INDEX IF NOT EXISTS idx_research_queue_sample_size
ON kb_research_queue(sample_size)
WHERE status = 'approved' AND sample_size IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN kb_research_queue.sample_size IS 'Number of participants/subjects in the study, extracted from title/abstract/summary';

-- Log migration
INSERT INTO migrations (name, executed_at)
VALUES ('20260111_add_sample_size', NOW())
ON CONFLICT (name) DO NOTHING;
