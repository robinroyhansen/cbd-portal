-- CBD Knowledge Base Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for article status
CREATE TYPE article_status AS ENUM ('draft', 'pending_review', 'published');

-- Categories table
CREATE TABLE kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  article_count INTEGER DEFAULT 0 NOT NULL
);

-- Articles table
CREATE TABLE kb_articles (
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

-- Citations/References table
CREATE TABLE kb_citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT,
  publication TEXT,
  year INTEGER,
  url TEXT,
  doi TEXT,
  accessed_at DATE
);

-- Article tags (many-to-many)
CREATE TABLE kb_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE kb_article_tags (
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES kb_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_articles_status ON kb_articles(status);
CREATE INDEX idx_articles_slug ON kb_articles(slug);
CREATE INDEX idx_articles_category ON kb_articles(category_id);
CREATE INDEX idx_articles_published_at ON kb_articles(published_at DESC);
CREATE INDEX idx_articles_featured ON kb_articles(featured) WHERE featured = TRUE;
CREATE INDEX idx_citations_article ON kb_citations(article_id);
CREATE INDEX idx_categories_slug ON kb_categories(slug);

-- Function to update article_count in categories
CREATE OR REPLACE FUNCTION update_category_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE kb_categories SET article_count = article_count + 1
    WHERE id = NEW.category_id AND NEW.status = 'published';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrement old category if changed
    IF OLD.category_id IS DISTINCT FROM NEW.category_id OR OLD.status IS DISTINCT FROM NEW.status THEN
      IF OLD.status = 'published' AND OLD.category_id IS NOT NULL THEN
        UPDATE kb_categories SET article_count = article_count - 1 WHERE id = OLD.category_id;
      END IF;
      IF NEW.status = 'published' AND NEW.category_id IS NOT NULL THEN
        UPDATE kb_categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'published' AND OLD.category_id IS NOT NULL THEN
      UPDATE kb_categories SET article_count = article_count - 1 WHERE id = OLD.category_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_count
AFTER INSERT OR UPDATE OR DELETE ON kb_articles
FOR EACH ROW EXECUTE FUNCTION update_category_article_count();

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_articles_updated_at
BEFORE UPDATE ON kb_articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_tags ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can read published articles" ON kb_articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read categories" ON kb_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read citations" ON kb_citations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kb_articles
      WHERE kb_articles.id = kb_citations.article_id
      AND kb_articles.status = 'published'
    )
  );

CREATE POLICY "Public can read tags" ON kb_tags
  FOR SELECT USING (true);

CREATE POLICY "Public can read article_tags" ON kb_article_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kb_articles
      WHERE kb_articles.id = kb_article_tags.article_id
      AND kb_articles.status = 'published'
    )
  );

-- Service role has full access (for your content generation system)
-- This is handled automatically by Supabase service_role key

-- Insert some initial categories
INSERT INTO kb_categories (name, slug, description) VALUES
  ('CBD Basics', 'cbd-basics', 'Foundational information about CBD, how it works, and what to expect'),
  ('Health & Wellness', 'health-wellness', 'CBD applications for general health, sleep, stress, and daily wellness'),
  ('Pain Management', 'pain-management', 'Research and information on CBD for chronic pain and inflammation'),
  ('Mental Health', 'mental-health', 'CBD research related to anxiety, depression, and psychological well-being'),
  ('Research & Studies', 'research-studies', 'Latest scientific research and clinical trials on cannabidiol'),
  ('Dosage & Usage', 'dosage-usage', 'Practical guidance on CBD dosing, methods of consumption, and best practices'),
  ('Legal & Regulatory', 'legal-regulatory', 'Legal status of CBD across different regions and regulatory updates'),
  ('Product Types', 'product-types', 'Information about different CBD products: oils, capsules, topicals, and more');
