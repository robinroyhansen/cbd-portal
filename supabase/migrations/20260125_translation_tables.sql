-- Migration: Create Translation Tables for Multi-Language Support
-- Date: 2026-01-25
-- Description: Creates tables to store translations for articles, conditions, and glossary terms

-- ============================================================
-- ARTICLE TRANSLATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  translated_at TIMESTAMPTZ DEFAULT NOW(),
  source_updated_at TIMESTAMPTZ,
  translation_quality VARCHAR(20) DEFAULT 'ai', -- 'ai', 'human_reviewed', 'professional'
  UNIQUE(article_id, language)
);

-- Indexes for article translations
CREATE INDEX IF NOT EXISTS idx_article_translations_lang ON article_translations(language);
CREATE INDEX IF NOT EXISTS idx_article_translations_slug ON article_translations(slug);
CREATE INDEX IF NOT EXISTS idx_article_translations_article_id ON article_translations(article_id);

-- ============================================================
-- CONDITION TRANSLATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS condition_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id UUID NOT NULL REFERENCES kb_conditions(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  short_description TEXT,
  long_description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  translated_at TIMESTAMPTZ DEFAULT NOW(),
  translation_quality VARCHAR(20) DEFAULT 'ai',
  UNIQUE(condition_id, language)
);

-- Indexes for condition translations
CREATE INDEX IF NOT EXISTS idx_condition_translations_lang ON condition_translations(language);
CREATE INDEX IF NOT EXISTS idx_condition_translations_condition_id ON condition_translations(condition_id);

-- ============================================================
-- GLOSSARY TRANSLATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS glossary_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id UUID NOT NULL REFERENCES kb_glossary(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  simple_definition TEXT,
  translated_at TIMESTAMPTZ DEFAULT NOW(),
  translation_quality VARCHAR(20) DEFAULT 'ai',
  UNIQUE(term_id, language)
);

-- Indexes for glossary translations
CREATE INDEX IF NOT EXISTS idx_glossary_translations_lang ON glossary_translations(language);
CREATE INDEX IF NOT EXISTS idx_glossary_translations_term_id ON glossary_translations(term_id);

-- ============================================================
-- RESEARCH TRANSLATIONS (for plain summaries only)
-- ============================================================
CREATE TABLE IF NOT EXISTS research_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID NOT NULL REFERENCES kb_research_queue(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  plain_summary TEXT NOT NULL,
  translated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(research_id, language)
);

-- Index for research translations
CREATE INDEX IF NOT EXISTS idx_research_translations_lang ON research_translations(language);

-- ============================================================
-- UI STRINGS TABLE (for dynamic UI strings not in JSON files)
-- ============================================================
CREATE TABLE IF NOT EXISTS ui_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  language VARCHAR(5) NOT NULL,
  value TEXT NOT NULL,
  context TEXT, -- Where this string is used (e.g., "homepage.hero", "nav.menu")
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, language)
);

-- Index for UI translations
CREATE INDEX IF NOT EXISTS idx_ui_translations_lang ON ui_translations(language);
CREATE INDEX IF NOT EXISTS idx_ui_translations_key ON ui_translations(key);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_translations ENABLE ROW LEVEL SECURITY;

-- Public read access for all translations
CREATE POLICY "Allow public read access on article_translations"
  ON article_translations FOR SELECT USING (true);

CREATE POLICY "Allow public read access on condition_translations"
  ON condition_translations FOR SELECT USING (true);

CREATE POLICY "Allow public read access on glossary_translations"
  ON glossary_translations FOR SELECT USING (true);

CREATE POLICY "Allow public read access on research_translations"
  ON research_translations FOR SELECT USING (true);

CREATE POLICY "Allow public read access on ui_translations"
  ON ui_translations FOR SELECT USING (true);

-- Service role can do everything
CREATE POLICY "Allow service role full access on article_translations"
  ON article_translations FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on condition_translations"
  ON condition_translations FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on glossary_translations"
  ON glossary_translations FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on research_translations"
  ON research_translations FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on ui_translations"
  ON ui_translations FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to get article with translation fallback
CREATE OR REPLACE FUNCTION get_article_with_translation(
  p_slug TEXT,
  p_language VARCHAR(5) DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  language VARCHAR(5),
  is_translated BOOLEAN
) AS $$
BEGIN
  -- Try to get translation first
  IF p_language != 'en' THEN
    RETURN QUERY
    SELECT
      a.id,
      COALESCE(t.slug, a.slug) as slug,
      COALESCE(t.title, a.title) as title,
      COALESCE(t.content, a.content) as content,
      COALESCE(t.excerpt, a.meta_description) as excerpt,
      COALESCE(t.meta_title, a.meta_title) as meta_title,
      COALESCE(t.meta_description, a.meta_description) as meta_description,
      COALESCE(t.language, 'en'::VARCHAR(5)) as language,
      (t.id IS NOT NULL) as is_translated
    FROM kb_articles a
    LEFT JOIN article_translations t ON a.id = t.article_id AND t.language = p_language
    WHERE a.slug = p_slug OR t.slug = p_slug
    LIMIT 1;
  ELSE
    -- English - return original
    RETURN QUERY
    SELECT
      a.id,
      a.slug,
      a.title,
      a.content,
      a.meta_description as excerpt,
      a.meta_title,
      a.meta_description,
      'en'::VARCHAR(5) as language,
      false as is_translated
    FROM kb_articles a
    WHERE a.slug = p_slug
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get condition with translation fallback
CREATE OR REPLACE FUNCTION get_condition_with_translation(
  p_slug TEXT,
  p_language VARCHAR(5) DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  display_name TEXT,
  short_description TEXT,
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
      COALESCE(t.name, c.name) as name,
      COALESCE(t.display_name, c.display_name) as display_name,
      COALESCE(t.short_description, c.short_description) as short_description,
      COALESCE(t.meta_title, c.meta_title) as meta_title,
      COALESCE(t.meta_description, c.meta_description) as meta_description,
      COALESCE(t.language, 'en'::VARCHAR(5)) as language,
      (t.id IS NOT NULL) as is_translated
    FROM kb_conditions c
    LEFT JOIN condition_translations t ON c.id = t.condition_id AND t.language = p_language
    WHERE c.slug = p_slug
    LIMIT 1;
  ELSE
    RETURN QUERY
    SELECT
      c.id,
      c.slug,
      c.name,
      c.display_name,
      c.short_description,
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
-- COMMENTS
-- ============================================================
COMMENT ON TABLE article_translations IS 'Stores translated versions of kb_articles content';
COMMENT ON TABLE condition_translations IS 'Stores translated versions of kb_conditions content';
COMMENT ON TABLE glossary_translations IS 'Stores translated versions of kb_glossary terms';
COMMENT ON TABLE research_translations IS 'Stores translated plain summaries of research studies';
COMMENT ON TABLE ui_translations IS 'Stores dynamic UI string translations';
