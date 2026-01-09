-- Add display_name column for flexible term naming
ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

-- Remove difficulty column (no longer needed)
ALTER TABLE kb_glossary DROP COLUMN IF EXISTS difficulty;

-- Update display_name to default to term value for existing rows
UPDATE kb_glossary SET display_name = term WHERE display_name IS NULL;
