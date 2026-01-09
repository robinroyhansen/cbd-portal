-- Add score_breakdown JSON column to kb_research_queue
-- Stores detailed scoring breakdown for transparency

ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS score_breakdown JSONB;

-- Add index for querying by specific breakdown components
CREATE INDEX IF NOT EXISTS idx_research_queue_score_breakdown ON kb_research_queue USING GIN (score_breakdown);

-- Comment
COMMENT ON COLUMN kb_research_queue.score_breakdown IS 'Detailed quality score breakdown: studyDesign, methodology, sampleSize, relevance components';
