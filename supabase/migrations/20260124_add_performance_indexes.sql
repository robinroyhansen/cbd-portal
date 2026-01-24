-- Performance Indexes for Common Admin Queries
-- Run this migration to improve query performance

-- Research Queue Indexes
-- These indexes support common filtering and sorting operations
CREATE INDEX IF NOT EXISTS idx_research_queue_status ON kb_research_queue(status);
CREATE INDEX IF NOT EXISTS idx_research_queue_relevance ON kb_research_queue(relevance_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_research_queue_quality ON kb_research_queue(quality_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_research_queue_year ON kb_research_queue(year DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_research_queue_discovered ON kb_research_queue(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_queue_reviewed ON kb_research_queue(reviewed_at DESC NULLS LAST);

-- Composite index for queue page filters (status + relevance score ordering)
CREATE INDEX IF NOT EXISTS idx_research_queue_status_relevance
  ON kb_research_queue(status, relevance_score DESC NULLS LAST);

-- Composite index for approved studies by topic (public research pages)
CREATE INDEX IF NOT EXISTS idx_research_queue_approved_topic
  ON kb_research_queue(status, primary_topic)
  WHERE status = 'approved';

-- Full-text search index on title and abstract
CREATE INDEX IF NOT EXISTS idx_research_queue_search
  ON kb_research_queue USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(abstract, '')));

-- Articles Indexes
CREATE INDEX IF NOT EXISTS idx_articles_author ON kb_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON kb_articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON kb_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_created ON kb_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_updated ON kb_articles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_condition ON kb_articles(condition_id) WHERE condition_id IS NOT NULL;

-- Composite index for published articles by category
CREATE INDEX IF NOT EXISTS idx_articles_published_category
  ON kb_articles(category, updated_at DESC)
  WHERE is_published = true;

-- Brand Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_brand_reviews_brand ON kb_brand_reviews(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_published ON kb_brand_reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_brand_reviews_score ON kb_brand_reviews(overall_score DESC NULLS LAST);

-- Comments Indexes
CREATE INDEX IF NOT EXISTS idx_comments_article ON kb_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON kb_comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created ON kb_comments(created_at DESC);

-- Composite index for comment moderation queue
CREATE INDEX IF NOT EXISTS idx_comments_pending
  ON kb_comments(created_at DESC)
  WHERE status = 'pending';

-- Glossary Indexes
CREATE INDEX IF NOT EXISTS idx_glossary_category ON kb_glossary(category);
CREATE INDEX IF NOT EXISTS idx_glossary_term_lower ON kb_glossary(lower(term));

-- Scanner Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status ON kb_scan_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_created ON kb_scan_jobs(created_at DESC);

-- Composite index for active jobs
CREATE INDEX IF NOT EXISTS idx_scan_jobs_active
  ON kb_scan_jobs(created_at ASC)
  WHERE status IN ('pending', 'queued', 'running');

-- Conditions Indexes
CREATE INDEX IF NOT EXISTS idx_conditions_category ON kb_conditions(category);
CREATE INDEX IF NOT EXISTS idx_conditions_featured ON kb_conditions(is_featured) WHERE is_featured = true;

-- Blacklist Indexes
CREATE INDEX IF NOT EXISTS idx_blacklist_term ON research_blacklist(lower(term));
CREATE INDEX IF NOT EXISTS idx_blacklist_match_type ON research_blacklist(match_type);

-- Add comments for documentation
COMMENT ON INDEX idx_research_queue_status IS 'Speeds up queue filtering by status';
COMMENT ON INDEX idx_research_queue_status_relevance IS 'Speeds up queue page with status filter and relevance sorting';
COMMENT ON INDEX idx_research_queue_search IS 'Full-text search on research titles and abstracts';
COMMENT ON INDEX idx_articles_published_category IS 'Speeds up public article listings by category';
COMMENT ON INDEX idx_comments_pending IS 'Speeds up comment moderation queue';
COMMENT ON INDEX idx_scan_jobs_active IS 'Speeds up finding active scanner jobs';
