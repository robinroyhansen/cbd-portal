-- Add plain_summary column for AI-generated plain-language summaries
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS plain_summary TEXT;

-- Add index for finding studies without summaries
CREATE INDEX IF NOT EXISTS idx_research_queue_plain_summary_null
ON kb_research_queue(id)
WHERE plain_summary IS NULL AND status = 'approved';

COMMENT ON COLUMN kb_research_queue.plain_summary IS 'AI-generated plain-language summary (max 100 words, written for general audience)';
