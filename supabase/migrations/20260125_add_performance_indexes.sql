-- Performance Indexes for CBD Portal Query Optimization
-- Date: 2026-01-25
-- Description: Additional indexes for common query patterns across kb_articles,
-- kb_conditions, kb_research_queue, condition_translations, and glossary_translations

-- ============================================================
-- KB_ARTICLES INDEXES
-- Optimizing article lookups by slug and language
-- ============================================================

-- Index for slug lookups (getArticleBySlug)
CREATE INDEX IF NOT EXISTS idx_articles_slug ON kb_articles(slug);

-- Index for language filtering (multi-language support)
CREATE INDEX IF NOT EXISTS idx_articles_language ON kb_articles(language);

-- Composite index for published article lookups by slug and status
CREATE INDEX IF NOT EXISTS idx_articles_slug_status
  ON kb_articles(slug, status)
  WHERE status = 'published';

-- Composite index for articles by condition_slug (condition pages)
CREATE INDEX IF NOT EXISTS idx_articles_condition_slug
  ON kb_articles(condition_slug)
  WHERE condition_slug IS NOT NULL;

-- Index for created_at ordering (article listings)
CREATE INDEX IF NOT EXISTS idx_articles_created_desc
  ON kb_articles(created_at DESC);

-- ============================================================
-- KB_CONDITIONS INDEXES
-- Optimizing condition page queries
-- ============================================================

-- Index for slug lookups (getConditionWithTranslation)
CREATE INDEX IF NOT EXISTS idx_conditions_slug ON kb_conditions(slug);

-- Index for is_published filtering
CREATE INDEX IF NOT EXISTS idx_conditions_published ON kb_conditions(is_published);

-- Composite index for published condition lookups by slug
CREATE INDEX IF NOT EXISTS idx_conditions_slug_published
  ON kb_conditions(slug)
  WHERE is_published = true;

-- Index for display_order sorting (getConditionsWithTranslations)
CREATE INDEX IF NOT EXISTS idx_conditions_display_order
  ON kb_conditions(display_order ASC NULLS LAST);

-- Composite index for category + published (category pages)
CREATE INDEX IF NOT EXISTS idx_conditions_category_published
  ON kb_conditions(category, is_published)
  WHERE is_published = true;

-- ============================================================
-- KB_RESEARCH_QUEUE INDEXES
-- Optimizing research database queries
-- ============================================================

-- Index for primary_topic filtering (condition research pages)
CREATE INDEX IF NOT EXISTS idx_research_primary_topic
  ON kb_research_queue(primary_topic);

-- Composite index for status + quality_score (research pages with quality sorting)
CREATE INDEX IF NOT EXISTS idx_research_status_quality
  ON kb_research_queue(status, quality_score DESC NULLS LAST);

-- Index for study_subject filtering (human/animal/review studies)
CREATE INDEX IF NOT EXISTS idx_research_study_subject
  ON kb_research_queue(study_subject);

-- Composite index for approved + study_subject (study type filtering)
CREATE INDEX IF NOT EXISTS idx_research_approved_subject
  ON kb_research_queue(status, study_subject)
  WHERE status = 'approved';

-- Index for sample_type (human participants queries)
CREATE INDEX IF NOT EXISTS idx_research_sample_type
  ON kb_research_queue(sample_type);

-- GIN index for relevant_topics array searches (overlaps queries)
CREATE INDEX IF NOT EXISTS idx_research_relevant_topics
  ON kb_research_queue USING gin(relevant_topics);

-- Composite index for approved + year ordering (research page default sort)
CREATE INDEX IF NOT EXISTS idx_research_approved_year
  ON kb_research_queue(status, year DESC NULLS LAST)
  WHERE status = 'approved';

-- ============================================================
-- CONDITION_TRANSLATIONS INDEXES
-- Optimizing multi-language condition queries
-- ============================================================

-- Composite index for condition_id + language lookups (primary query pattern)
CREATE INDEX IF NOT EXISTS idx_condition_trans_condition_lang
  ON condition_translations(condition_id, language);

-- Index for batch language queries (getConditionsWithTranslations)
CREATE INDEX IF NOT EXISTS idx_condition_trans_language
  ON condition_translations(language);

-- ============================================================
-- GLOSSARY_TRANSLATIONS INDEXES
-- Optimizing multi-language glossary queries
-- ============================================================

-- Composite index for term_id + language lookups (primary query pattern)
CREATE INDEX IF NOT EXISTS idx_glossary_trans_term_lang
  ON glossary_translations(term_id, language);

-- Index for batch language queries (getGlossaryTermsWithTranslations)
CREATE INDEX IF NOT EXISTS idx_glossary_trans_language
  ON glossary_translations(language);

-- ============================================================
-- KB_GLOSSARY ADDITIONAL INDEXES
-- Optimizing glossary term queries
-- ============================================================

-- Index for slug lookups (getGlossaryTermWithTranslation)
CREATE INDEX IF NOT EXISTS idx_glossary_slug ON kb_glossary(slug);

-- Index for view_count ordering (popular terms)
CREATE INDEX IF NOT EXISTS idx_glossary_view_count
  ON kb_glossary(view_count DESC NULLS LAST);

-- ============================================================
-- ARTICLE_TRANSLATIONS INDEXES
-- Optimizing multi-language article queries
-- ============================================================

-- Composite index for article_id + language lookups
CREATE INDEX IF NOT EXISTS idx_article_trans_article_lang
  ON article_translations(article_id, language);

-- ============================================================
-- RESEARCH_TRANSLATIONS INDEXES
-- Optimizing multi-language research queries
-- ============================================================

-- Composite index for research_id + language lookups
CREATE INDEX IF NOT EXISTS idx_research_trans_research_lang
  ON research_translations(research_id, language);

-- ============================================================
-- ANALYZE TABLES
-- Update table statistics for query planner
-- ============================================================
ANALYZE kb_articles;
ANALYZE kb_conditions;
ANALYZE kb_research_queue;
ANALYZE kb_glossary;
ANALYZE condition_translations;
ANALYZE glossary_translations;
ANALYZE article_translations;
ANALYZE research_translations;

-- ============================================================
-- DOCUMENTATION
-- ============================================================
COMMENT ON INDEX idx_articles_slug IS 'Fast article lookup by slug';
COMMENT ON INDEX idx_articles_slug_status IS 'Fast published article lookup by slug';
COMMENT ON INDEX idx_conditions_slug IS 'Fast condition lookup by slug';
COMMENT ON INDEX idx_conditions_slug_published IS 'Fast published condition lookup by slug';
COMMENT ON INDEX idx_research_primary_topic IS 'Filter research by primary topic/condition';
COMMENT ON INDEX idx_research_relevant_topics IS 'GIN index for array overlap queries on relevant_topics';
COMMENT ON INDEX idx_condition_trans_condition_lang IS 'Fast condition translation lookup by ID and language';
COMMENT ON INDEX idx_glossary_trans_term_lang IS 'Fast glossary translation lookup by term ID and language';
