-- Add article template support to kb_articles table
-- Phase 2C: Article Templates by Content Type

-- Add article_type column for template categorization
ALTER TABLE kb_articles
ADD COLUMN IF NOT EXISTS article_type VARCHAR(30) DEFAULT 'standard';

-- Add template_data column for structured content
ALTER TABLE kb_articles
ADD COLUMN IF NOT EXISTS template_data JSONB;

-- Add column comments for documentation
COMMENT ON COLUMN kb_articles.article_type IS 'Types: condition, product-guide, science-explainer, beginner-guide, comparison, news, standard';
COMMENT ON COLUMN kb_articles.template_data IS 'Structured template section data in JSONB format';

-- Update existing articles based on patterns
UPDATE kb_articles
SET article_type = 'condition'
WHERE (
  LOWER(title) LIKE '%cbd for%'
  OR LOWER(title) LIKE '%anxiety%'
  OR LOWER(title) LIKE '%depression%'
  OR LOWER(title) LIKE '%pain%'
  OR LOWER(title) LIKE '%arthritis%'
  OR LOWER(title) LIKE '%sleep%'
  OR LOWER(title) LIKE '%insomnia%'
  OR category_id IN (
    SELECT id FROM kb_categories WHERE LOWER(name) LIKE '%condition%' OR LOWER(name) LIKE '%health%'
  )
);

UPDATE kb_articles
SET article_type = 'product-guide'
WHERE (
  LOWER(title) LIKE '%guide%'
  OR LOWER(title) LIKE '%how to choose%'
  OR LOWER(title) LIKE '%best%'
  OR LOWER(title) LIKE '%reviews%'
  OR category_id IN (
    SELECT id FROM kb_categories WHERE LOWER(name) LIKE '%product%'
  )
);

UPDATE kb_articles
SET article_type = 'beginner-guide'
WHERE (
  LOWER(title) LIKE '%beginner%'
  OR LOWER(title) LIKE '%getting started%'
  OR LOWER(title) LIKE '%introduction%'
  OR LOWER(title) LIKE '%what is%'
);

UPDATE kb_articles
SET article_type = 'science-explainer'
WHERE (
  LOWER(title) LIKE '%how does%'
  OR LOWER(title) LIKE '%science%'
  OR LOWER(title) LIKE '%research%'
  OR LOWER(title) LIKE '%study%'
  OR LOWER(title) LIKE '%mechanism%'
  OR category_id IN (
    SELECT id FROM kb_categories WHERE LOWER(name) LIKE '%science%'
  )
);

UPDATE kb_articles
SET article_type = 'comparison'
WHERE (
  LOWER(title) LIKE '%vs%'
  OR LOWER(title) LIKE '%compare%'
  OR LOWER(title) LIKE '%difference%'
  OR LOWER(title) LIKE '%full spectrum%'
  OR LOWER(title) LIKE '%broad spectrum%'
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_articles_type ON kb_articles(article_type);

-- Log migration completion
INSERT INTO public.migrations (name, executed_at)
VALUES ('20251231_add_article_templates', NOW())
ON CONFLICT (name) DO UPDATE SET executed_at = NOW();