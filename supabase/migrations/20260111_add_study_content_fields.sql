-- Add missing content fields for research studies
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS limitations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS display_title VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN kb_research_queue.limitations IS 'Array of study limitations [{type: "limitation", text: "..."}]';
COMMENT ON COLUMN kb_research_queue.display_title IS 'Human-readable H1 title for the study page';
