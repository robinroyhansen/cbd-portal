-- Add pronunciation column for phonetic guides
ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS pronunciation VARCHAR(255);

-- Add is_advanced column for filtering complex terms
ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS is_advanced BOOLEAN DEFAULT false;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_kb_glossary_is_advanced ON kb_glossary(is_advanced);
