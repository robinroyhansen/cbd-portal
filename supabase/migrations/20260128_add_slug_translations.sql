-- Migration: Add slug columns to condition and glossary translations
-- Date: 2026-01-28
-- Description: Enables localized URLs by adding slug columns and updating lookup functions

-- ============================================================
-- ADD SLUG COLUMN TO CONDITION TRANSLATIONS
-- ============================================================
ALTER TABLE condition_translations
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_condition_translations_slug
ON condition_translations(slug) WHERE slug IS NOT NULL;

-- Create composite index for slug + language lookups
CREATE INDEX IF NOT EXISTS idx_condition_translations_slug_lang
ON condition_translations(slug, language) WHERE slug IS NOT NULL;

-- ============================================================
-- ADD SLUG COLUMN TO GLOSSARY TRANSLATIONS
-- ============================================================
ALTER TABLE glossary_translations
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_glossary_translations_slug
ON glossary_translations(slug) WHERE slug IS NOT NULL;

-- Create composite index for slug + language lookups
CREATE INDEX IF NOT EXISTS idx_glossary_translations_slug_lang
ON glossary_translations(slug, language) WHERE slug IS NOT NULL;

-- ============================================================
-- UPDATE CONDITION TRANSLATION LOOKUP FUNCTION
-- ============================================================
-- Supports lookup by either English slug or translated slug
CREATE OR REPLACE FUNCTION get_condition_with_translation(
  p_slug TEXT,
  p_language VARCHAR(5) DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  translated_slug TEXT,
  name TEXT,
  display_name TEXT,
  short_description TEXT,
  long_description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  language VARCHAR(5),
  is_translated BOOLEAN
) AS $$
BEGIN
  IF p_language != 'en' THEN
    RETURN QUERY
    SELECT
      c.id,
      c.slug,
      t.slug as translated_slug,
      COALESCE(t.name, c.name) as name,
      COALESCE(t.display_name, c.display_name) as display_name,
      COALESCE(t.short_description, c.short_description) as short_description,
      COALESCE(t.long_description, c.long_description) as long_description,
      COALESCE(t.meta_title, c.meta_title) as meta_title,
      COALESCE(t.meta_description, c.meta_description) as meta_description,
      COALESCE(t.language, 'en'::VARCHAR(5)) as language,
      (t.id IS NOT NULL) as is_translated
    FROM kb_conditions c
    LEFT JOIN condition_translations t ON c.id = t.condition_id AND t.language = p_language
    WHERE c.slug = p_slug OR t.slug = p_slug
    LIMIT 1;
  ELSE
    RETURN QUERY
    SELECT
      c.id,
      c.slug,
      NULL::TEXT as translated_slug,
      c.name,
      c.display_name,
      c.short_description,
      c.long_description,
      c.meta_title,
      c.meta_description,
      'en'::VARCHAR(5) as language,
      false as is_translated
    FROM kb_conditions c
    WHERE c.slug = p_slug
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- CREATE GLOSSARY TRANSLATION LOOKUP FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION get_glossary_with_translation(
  p_slug TEXT,
  p_language VARCHAR(5) DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  translated_slug TEXT,
  term TEXT,
  definition TEXT,
  simple_definition TEXT,
  language VARCHAR(5),
  is_translated BOOLEAN
) AS $$
BEGIN
  IF p_language != 'en' THEN
    RETURN QUERY
    SELECT
      g.id,
      g.slug,
      t.slug as translated_slug,
      COALESCE(t.term, g.term) as term,
      COALESCE(t.definition, g.definition) as definition,
      COALESCE(t.simple_definition, g.simple_definition) as simple_definition,
      COALESCE(t.language, 'en'::VARCHAR(5)) as language,
      (t.id IS NOT NULL) as is_translated
    FROM kb_glossary g
    LEFT JOIN glossary_translations t ON g.id = t.term_id AND t.language = p_language
    WHERE g.slug = p_slug OR t.slug = p_slug
    LIMIT 1;
  ELSE
    RETURN QUERY
    SELECT
      g.id,
      g.slug,
      NULL::TEXT as translated_slug,
      g.term,
      g.definition,
      g.simple_definition,
      'en'::VARCHAR(5) as language,
      false as is_translated
    FROM kb_glossary g
    WHERE g.slug = p_slug
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- HELPER FUNCTION: Generate slug from text
-- ============================================================
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          -- Replace Danish/Nordic characters
          translate(input_text, 'æøåÆØÅäöüÄÖÜ', 'aoaaoaaouaou'),
          '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
        ),
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'  -- Remove multiple hyphens
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- GENERATE SLUGS FOR EXISTING DANISH TRANSLATIONS
-- ============================================================
-- Update condition translations with generated slugs
UPDATE condition_translations
SET slug = generate_slug(name)
WHERE language = 'da' AND slug IS NULL AND name IS NOT NULL;

-- Update glossary translations with generated slugs
UPDATE glossary_translations
SET slug = generate_slug(term)
WHERE language = 'da' AND slug IS NULL AND term IS NOT NULL;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON COLUMN condition_translations.slug IS 'Localized URL slug for the condition (e.g., "angst" for Danish translation of "anxiety")';
COMMENT ON COLUMN glossary_translations.slug IS 'Localized URL slug for the glossary term';
COMMENT ON FUNCTION generate_slug(TEXT) IS 'Generates URL-safe slugs from text, handling Nordic characters';
