-- Create glossary system for CBD/cannabis terminology

-- Create enums
DO $$ BEGIN
  CREATE TYPE glossary_category AS ENUM (
    'cannabinoids',
    'terpenes',
    'products',
    'extraction',
    'medical',
    'conditions',
    'legal',
    'dosing'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE glossary_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create glossary table
CREATE TABLE IF NOT EXISTS kb_glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  short_definition VARCHAR(300) NOT NULL,
  category glossary_category NOT NULL,
  synonyms TEXT[] DEFAULT '{}',
  related_terms TEXT[] DEFAULT '{}',
  related_research UUID[] DEFAULT '{}',
  difficulty glossary_difficulty DEFAULT 'beginner',
  sources TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_glossary_slug ON kb_glossary(slug);
CREATE INDEX IF NOT EXISTS idx_glossary_category ON kb_glossary(category);
CREATE INDEX IF NOT EXISTS idx_glossary_term ON kb_glossary(term);
CREATE INDEX IF NOT EXISTS idx_glossary_difficulty ON kb_glossary(difficulty);
CREATE INDEX IF NOT EXISTS idx_glossary_synonyms ON kb_glossary USING GIN (synonyms);
CREATE INDEX IF NOT EXISTS idx_glossary_first_letter ON kb_glossary(UPPER(LEFT(term, 1)));

-- Enable RLS
ALTER TABLE kb_glossary ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read glossary" ON kb_glossary
  FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role full access to glossary" ON kb_glossary
  FOR ALL USING (auth.role() = 'service_role');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_glossary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_glossary_updated ON kb_glossary;
CREATE TRIGGER trigger_glossary_updated
  BEFORE UPDATE ON kb_glossary
  FOR EACH ROW EXECUTE FUNCTION update_glossary_timestamp();

-- Function to generate slug from term
CREATE OR REPLACE FUNCTION generate_glossary_slug(term_text TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(term_text, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Comment for documentation
COMMENT ON TABLE kb_glossary IS 'CBD and cannabis glossary terms with definitions, categories, and related content';
