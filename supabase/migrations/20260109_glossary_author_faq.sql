-- Add author_id column for E-E-A-T signals
ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES kb_authors(id);

-- Add faq column for FAQ schema markup
ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS faq JSONB;

-- Create index for author lookups
CREATE INDEX IF NOT EXISTS idx_kb_glossary_author_id ON kb_glossary(author_id);

-- Set all existing terms to Robin's author_id
UPDATE kb_glossary SET author_id = 'e81ce9e2-d10f-427b-8d43-6cc63e2761ba' WHERE author_id IS NULL;
