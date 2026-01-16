-- =====================================================
-- RESEARCH SCANNER SETUP SCRIPT
-- Run this in Supabase SQL Editor to create all required tables
-- =====================================================

-- =====================================================
-- 1. CREATE kb_research_queue TABLE
-- =====================================================

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
  relevance_signals TEXT[],
  relevant_topics TEXT[],
  detected_language VARCHAR(20),
  search_term_matched TEXT,
  study_subject TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_research_queue_status ON kb_research_queue(status);
CREATE INDEX IF NOT EXISTS idx_research_queue_discovered ON kb_research_queue(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_queue_score ON kb_research_queue(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_research_queue_topics ON kb_research_queue USING gin(relevant_topics);
CREATE INDEX IF NOT EXISTS idx_research_queue_doi ON kb_research_queue(doi);
CREATE INDEX IF NOT EXISTS idx_research_queue_url ON kb_research_queue(url);

-- Enable RLS
ALTER TABLE kb_research_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON kb_research_queue;
CREATE POLICY "Admin full access" ON kb_research_queue FOR ALL USING (true);

-- =====================================================
-- 2. CREATE kb_scan_jobs TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS kb_scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'running', 'completed', 'failed', 'cancelled', 'cancelling', 'paused')),

  -- Sources and search configuration
  sources TEXT[],
  search_terms TEXT[],
  date_range_start TEXT,
  date_range_end TEXT,

  -- Progress tracking
  current_source VARCHAR(50),
  current_source_index INT DEFAULT 0,
  current_source_offset INT DEFAULT 0,

  -- Results tracking
  items_found INT DEFAULT 0,
  items_added INT DEFAULT 0,
  items_skipped INT DEFAULT 0,
  items_rejected INT DEFAULT 0,

  -- Pause/Resume support
  resume_state JSONB,
  paused_at TIMESTAMPTZ,

  -- Error tracking
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status ON kb_scan_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_created ON kb_scan_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE kb_scan_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access to scan jobs" ON kb_scan_jobs;
CREATE POLICY "Admin full access to scan jobs" ON kb_scan_jobs FOR ALL USING (true);

-- Enable realtime for these tables
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE kb_scan_jobs;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE kb_research_queue;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- =====================================================
-- 3. CREATE kb_article_research JUNCTION TABLE
-- =====================================================

-- This table links approved research to articles
-- Only create if kb_articles exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kb_articles') THEN
    CREATE TABLE IF NOT EXISTS kb_article_research (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
      research_id UUID REFERENCES kb_research_queue(id) ON DELETE CASCADE,
      added_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(article_id, research_id)
    );

    CREATE INDEX IF NOT EXISTS idx_article_research_article ON kb_article_research(article_id);
    CREATE INDEX IF NOT EXISTS idx_article_research_research ON kb_article_research(research_id);

    ALTER TABLE kb_article_research ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read access" ON kb_article_research;
    CREATE POLICY "Public read access" ON kb_article_research FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write access" ON kb_article_research;
    CREATE POLICY "Admin write access" ON kb_article_research FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- =====================================================
-- 4. TEXT CLEANUP FUNCTIONS
-- =====================================================

-- Function to decode HTML entities
CREATE OR REPLACE FUNCTION decode_html_entities(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT := text_input;
BEGIN
  IF result IS NULL THEN RETURN NULL; END IF;

  -- Named entities
  result := REPLACE(result, '&amp;', '&');
  result := REPLACE(result, '&lt;', '<');
  result := REPLACE(result, '&gt;', '>');
  result := REPLACE(result, '&quot;', '"');
  result := REPLACE(result, '&#39;', '''');
  result := REPLACE(result, '&apos;', '''');
  result := REPLACE(result, '&nbsp;', ' ');
  result := REPLACE(result, '&ndash;', '-');
  result := REPLACE(result, '&mdash;', '--');
  result := REPLACE(result, '&hellip;', '...');
  result := REPLACE(result, '&lsquo;', '''');
  result := REPLACE(result, '&rsquo;', '''');
  result := REPLACE(result, '&ldquo;', '"');
  result := REPLACE(result, '&rdquo;', '"');

  -- Remove unrecognized numeric entities
  result := REGEXP_REPLACE(result, '&#\d+;', '', 'g');
  result := REGEXP_REPLACE(result, '&#x[0-9a-fA-F]+;', '', 'g');

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to strip HTML tags
CREATE OR REPLACE FUNCTION strip_html_tags(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT := text_input;
BEGIN
  IF result IS NULL THEN RETURN NULL; END IF;

  -- Replace <br> tags with newlines
  result := REGEXP_REPLACE(result, '<br\s*/?\s*>', E'\n', 'gi');
  -- Replace closing block tags with newlines
  result := REGEXP_REPLACE(result, '</(p|div|li|tr|h[1-6])>', E'\n', 'gi');
  -- Replace <li> with bullet
  result := REGEXP_REPLACE(result, '<li[^>]*>', '- ', 'gi');
  -- Remove all other HTML tags
  result := REGEXP_REPLACE(result, '<[^>]+>', '', 'g');

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to clean text (decode entities, strip tags, normalize whitespace)
CREATE OR REPLACE FUNCTION clean_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT := text_input;
BEGIN
  IF result IS NULL THEN RETURN NULL; END IF;

  -- Decode HTML entities twice for double-encoded content
  result := decode_html_entities(result);
  result := decode_html_entities(result);
  -- Strip HTML tags
  result := strip_html_tags(result);
  -- Normalize whitespace
  result := REGEXP_REPLACE(result, '[ \t]+', ' ', 'g');
  result := REGEXP_REPLACE(result, '\n{3,}', E'\n\n', 'g');
  result := TRIM(result);

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to clean titles
CREATE OR REPLACE FUNCTION clean_title(title_input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  IF title_input IS NULL THEN RETURN NULL; END IF;

  result := clean_text(title_input);
  result := REGEXP_REPLACE(result, '\n', ' ', 'g');
  result := REGEXP_REPLACE(result, '\s+', ' ', 'g');
  result := TRIM(result);
  result := REGEXP_REPLACE(result, '\.{2,}$', '.', 'g');

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 5. VERIFY SETUP
-- =====================================================

DO $$
DECLARE
  table_count INT;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('kb_research_queue', 'kb_scan_jobs');

  RAISE NOTICE 'Research scanner tables created: %/2', table_count;

  IF table_count = 2 THEN
    RAISE NOTICE 'Setup complete! You can now use the research scanner.';
  ELSE
    RAISE WARNING 'Some tables may not have been created. Please check for errors above.';
  END IF;
END $$;
