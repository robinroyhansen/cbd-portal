-- Research Scanner Database Migration - CORE TABLES ONLY
CREATE TABLE IF NOT EXISTS kb_research_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT,
  publication TEXT,
  year INT,
  abstract TEXT,
  url TEXT NOT NULL UNIQUE,
  doi TEXT,
  source_site TEXT,
  relevance_score INT,
  relevant_topics TEXT[],
  search_term_matched TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_queue_status ON kb_research_queue(status);
CREATE INDEX IF NOT EXISTS idx_research_queue_discovered ON kb_research_queue(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_queue_score ON kb_research_queue(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_research_queue_topics ON kb_research_queue USING gin(relevant_topics);

-- Enable RLS with correct policy syntax
ALTER TABLE kb_research_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON kb_research_queue;
CREATE POLICY "Admin full access" ON kb_research_queue
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS kb_article_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  research_id UUID REFERENCES kb_research_queue(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, research_id)
);

CREATE INDEX IF NOT EXISTS idx_article_research_article ON kb_article_research(article_id);
CREATE INDEX IF NOT EXISTS idx_article_research_research ON kb_article_research(research_id);

-- Enable RLS with correct policy syntax
ALTER TABLE kb_article_research ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON kb_article_research;
DROP POLICY IF EXISTS "Admin write access" ON kb_article_research;
CREATE POLICY "Public read access" ON kb_article_research
  FOR SELECT
  USING (true);
CREATE POLICY "Admin write access" ON kb_article_research
  FOR INSERT
  WITH CHECK (true);