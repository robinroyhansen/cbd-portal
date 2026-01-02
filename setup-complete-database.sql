-- CBD Portal Database Setup - Complete Schema
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for article status if not exists
DO $$ BEGIN
    CREATE TYPE article_status AS ENUM ('draft', 'pending_review', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Categories table
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  article_count INTEGER DEFAULT 0 NOT NULL
);

-- Articles table
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  status article_status DEFAULT 'draft' NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,
  author_id UUID,
  published_at TIMESTAMPTZ,
  reading_time INTEGER,
  meta_title TEXT,
  meta_description TEXT
);

-- Tags table
CREATE TABLE IF NOT EXISTS kb_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  article_count INTEGER DEFAULT 0 NOT NULL
);

-- Many-to-many relationship between articles and tags
CREATE TABLE IF NOT EXISTS kb_article_tags (
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES kb_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Citations/References table
CREATE TABLE IF NOT EXISTS kb_citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT,
  publication TEXT,
  year INTEGER,
  url TEXT,
  doi TEXT,
  citation_text TEXT,
  order_index INTEGER DEFAULT 0
);

-- Research scanning system tables
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
  status VARCHAR(20) DEFAULT 'pending',
  priority INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kb_article_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  research_queue_id UUID NOT NULL REFERENCES kb_research_queue(id) ON DELETE CASCADE,
  integration_status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO kb_categories (id, name, slug, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'CBD Basics', 'cbd-basics', 'Fundamental information about CBD'),
  ('22222222-2222-2222-2222-222222222222', 'Health & Wellness', 'health-wellness', 'CBD applications for health and wellness'),
  ('33333333-3333-3333-3333-333333333333', 'Mental Health', 'mental-health', 'CBD for anxiety, depression, and mental health'),
  ('44444444-4444-4444-4444-444444444444', 'Product Guides', 'product-guides', 'Guides to different CBD product types'),
  ('55555555-5555-5555-5555-555555555555', 'Safety', 'safety', 'CBD safety information and drug interactions')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_research_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_research ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to categories" ON kb_categories;
DROP POLICY IF EXISTS "Allow public read access to articles" ON kb_articles;
DROP POLICY IF EXISTS "Allow public read access to tags" ON kb_tags;
DROP POLICY IF EXISTS "Allow public read access to article_tags" ON kb_article_tags;
DROP POLICY IF EXISTS "Allow public read access to citations" ON kb_citations;
DROP POLICY IF EXISTS "Allow public read access to research_queue" ON kb_research_queue;
DROP POLICY IF EXISTS "Allow public read access to article_research" ON kb_article_research;

-- Create RLS policies that allow public read access and service role full access
CREATE POLICY "Allow public read access to categories" ON kb_categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to articles" ON kb_articles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to tags" ON kb_tags
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to article_tags" ON kb_article_tags
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to citations" ON kb_citations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to research_queue" ON kb_research_queue
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to article_research" ON kb_article_research
  FOR ALL USING (true) WITH CHECK (true);

-- Grant comprehensive permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant read access to public roles
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Explicitly grant permissions on specific tables
GRANT ALL ON kb_categories TO service_role;
GRANT ALL ON kb_articles TO service_role;
GRANT ALL ON kb_tags TO service_role;
GRANT ALL ON kb_article_tags TO service_role;
GRANT ALL ON kb_citations TO service_role;
GRANT ALL ON kb_research_queue TO service_role;
GRANT ALL ON kb_article_research TO service_role;

-- Grant read permissions to anon/authenticated
GRANT SELECT ON kb_categories TO anon, authenticated;
GRANT SELECT ON kb_articles TO anon, authenticated;
GRANT SELECT ON kb_tags TO anon, authenticated;
GRANT SELECT ON kb_article_tags TO anon, authenticated;
GRANT SELECT ON kb_citations TO anon, authenticated;
GRANT SELECT ON kb_research_queue TO anon, authenticated;
GRANT SELECT ON kb_article_research TO anon, authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON kb_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_published_at ON kb_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_kb_articles_category_id ON kb_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_featured ON kb_articles(featured);
CREATE INDEX IF NOT EXISTS idx_kb_articles_slug ON kb_articles(slug);
CREATE INDEX IF NOT EXISTS idx_kb_categories_slug ON kb_categories(slug);

-- Success message
SELECT 'Database setup completed successfully!' as status;