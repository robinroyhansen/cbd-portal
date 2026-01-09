-- Add country field to kb_research_queue
-- Stores ISO 2-letter country code (e.g., US, UK, CA)

ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS country VARCHAR(5);

-- Add index for country filtering
CREATE INDEX IF NOT EXISTS idx_research_queue_country ON kb_research_queue(country);

-- Comment
COMMENT ON COLUMN kb_research_queue.country IS 'ISO 2-letter country code of study origin (extracted from ClinicalTrials.gov location or author affiliations)';
