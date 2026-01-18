-- Migration: Add English translation fields for foreign language studies
-- Many PubMed/Europe PMC studies have English abstracts even when the paper is in another language
-- This allows us to capture and display the English version when available

-- Add title_english column
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS title_english TEXT;

-- Add abstract_english column
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS abstract_english TEXT;

-- Add index on detected_language for filtering
CREATE INDEX IF NOT EXISTS idx_research_queue_language ON kb_research_queue(detected_language);

COMMENT ON COLUMN kb_research_queue.title_english IS 'English translation of title when available from source API (e.g., VernacularTitle from PubMed)';
COMMENT ON COLUMN kb_research_queue.abstract_english IS 'English translation of abstract when available from source API';
