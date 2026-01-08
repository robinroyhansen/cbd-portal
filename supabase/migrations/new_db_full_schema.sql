-- ============================================
-- CBD Portal - Full Schema for New Database
-- Combined from all migrations
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE article_status AS ENUM ('draft', 'pending_review', 'published');

-- ============================================
-- CORE TABLES
-- ============================================

-- Categories table
CREATE TABLE kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  article_count INTEGER DEFAULT 0 NOT NULL,
  language VARCHAR(10) DEFAULT 'en'
);

-- Authors table (E-E-A-T support)
CREATE TABLE kb_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  title VARCHAR(150),
  credentials VARCHAR(255),
  bio_short VARCHAR(300),
  bio_full TEXT,
  years_experience INT,
  expertise_areas TEXT[],
  companies JSONB,
  affiliations JSONB,
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  website_url VARCHAR(255),
  image_url VARCHAR(500),
  publications JSONB,
  media_mentions JSONB,
  speaking_engagements JSONB,
  certifications JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  article_count INT DEFAULT 0,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  author_id UUID REFERENCES kb_authors(id),
  published_at TIMESTAMPTZ,
  reading_time INTEGER,
  meta_title TEXT,
  meta_description TEXT,
  language VARCHAR(10) DEFAULT 'en',
  original_article_id UUID REFERENCES kb_articles(id),
  article_type VARCHAR(30) DEFAULT 'standard',
  template_data JSONB
);

-- Add comments for documentation
COMMENT ON COLUMN kb_articles.article_type IS 'Types: condition, product-guide, science-explainer, beginner-guide, comparison, news, standard';
COMMENT ON COLUMN kb_articles.template_data IS 'Structured template section data in JSONB format';

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

-- Tags table
CREATE TABLE kb_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- Article-Tags junction table
CREATE TABLE kb_article_tags (
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES kb_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Languages reference table
CREATE TABLE kb_languages (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  native_name VARCHAR(50) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  logo_text VARCHAR(50) NOT NULL,
  flag_emoji VARCHAR(10),
  is_swiss_variant BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media library table
CREATE TABLE kb_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  file_size INT,
  mime_type VARCHAR(100),
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(255) DEFAULT 'admin'
);

-- Research queue table
CREATE TABLE kb_research_queue (
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

-- Article-Research junction table
CREATE TABLE kb_article_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  research_id UUID REFERENCES kb_research_queue(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, research_id)
);

-- Migrations tracking table
CREATE TABLE IF NOT EXISTS migrations (
  name VARCHAR(255) PRIMARY KEY,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_articles_status ON kb_articles(status);
CREATE INDEX idx_articles_slug ON kb_articles(slug);
CREATE INDEX idx_articles_category ON kb_articles(category_id);
CREATE INDEX idx_articles_published_at ON kb_articles(published_at DESC);
CREATE INDEX idx_articles_featured ON kb_articles(featured) WHERE featured = TRUE;
CREATE INDEX idx_articles_language ON kb_articles(language);
CREATE INDEX idx_articles_author ON kb_articles(author_id);
CREATE INDEX idx_articles_type ON kb_articles(article_type);
CREATE INDEX idx_citations_article ON kb_citations(article_id);
CREATE INDEX idx_categories_slug ON kb_categories(slug);
CREATE INDEX idx_categories_language ON kb_categories(language);
CREATE INDEX idx_authors_slug ON kb_authors(slug);
CREATE INDEX idx_authors_active ON kb_authors(is_active);
CREATE INDEX idx_authors_primary ON kb_authors(is_primary);
CREATE INDEX idx_authors_verified ON kb_authors(is_verified);
CREATE INDEX idx_kb_media_created_at ON kb_media(created_at DESC);
CREATE INDEX idx_kb_media_filename ON kb_media(filename);
CREATE INDEX idx_research_queue_status ON kb_research_queue(status);
CREATE INDEX idx_research_queue_discovered ON kb_research_queue(discovered_at DESC);
CREATE INDEX idx_research_queue_score ON kb_research_queue(relevance_score DESC);
CREATE INDEX idx_research_queue_topics ON kb_research_queue USING gin(relevant_topics);
CREATE INDEX idx_article_research_article ON kb_article_research(article_id);
CREATE INDEX idx_article_research_research ON kb_article_research(research_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update category article count
CREATE OR REPLACE FUNCTION update_category_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE kb_categories SET article_count = article_count + 1
    WHERE id = NEW.category_id AND NEW.status = 'published';
  ELSIF TG_OP = 'UPDATE' THEN
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

-- Update author article count
CREATE OR REPLACE FUNCTION update_author_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.author_id IS NOT NULL THEN
      UPDATE kb_authors SET article_count = (
        SELECT COUNT(*) FROM kb_articles WHERE author_id = OLD.author_id AND status = 'published'
      ) WHERE id = OLD.author_id;
    END IF;
  END IF;
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.author_id IS NOT NULL THEN
      UPDATE kb_authors SET article_count = (
        SELECT COUNT(*) FROM kb_articles WHERE author_id = NEW.author_id AND status = 'published'
      ) WHERE id = NEW.author_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trigger_articles_updated_at
BEFORE UPDATE ON kb_articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_category_count
AFTER INSERT OR UPDATE OR DELETE ON kb_articles
FOR EACH ROW EXECUTE FUNCTION update_category_article_count();

CREATE TRIGGER trigger_update_author_counts
AFTER INSERT OR UPDATE OR DELETE ON kb_articles
FOR EACH ROW EXECUTE FUNCTION update_author_article_count();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_research_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_authors ENABLE ROW LEVEL SECURITY;

-- Public read policies
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

CREATE POLICY "Public read access" ON kb_languages
  FOR SELECT USING (true);

CREATE POLICY "Public read" ON kb_media
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write" ON kb_media
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access" ON kb_research_queue
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access" ON kb_article_research
  FOR SELECT USING (true);

CREATE POLICY "Admin write access" ON kb_article_research
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read authors" ON kb_authors
  FOR SELECT USING (is_active = true);

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert CBD categories
INSERT INTO kb_categories (name, slug, description) VALUES
  ('CBD Basics', 'cbd-basics', 'Foundational information about CBD, how it works, and what to expect'),
  ('Health & Wellness', 'health-wellness', 'CBD applications for general health, sleep, stress, and daily wellness'),
  ('Pain Management', 'pain-management', 'Research and information on CBD for chronic pain and inflammation'),
  ('Mental Health', 'mental-health', 'CBD research related to anxiety, depression, and psychological well-being'),
  ('Research & Studies', 'research-studies', 'Latest scientific research and clinical trials on cannabidiol'),
  ('Dosage & Usage', 'dosage-usage', 'Practical guidance on CBD dosing, methods of consumption, and best practices'),
  ('Legal & Regulatory', 'legal-regulatory', 'Legal status of CBD across different regions and regulatory updates'),
  ('Product Types', 'product-types', 'Information about different CBD products: oils, capsules, topicals, and more');

-- Insert all 15 languages (all active)
INSERT INTO kb_languages (code, name, native_name, domain, logo_text, flag_emoji, is_swiss_variant, is_active, display_order) VALUES
  ('en', 'English', 'English', 'swissorganic.co.uk', 'CBD.uk', '🇬🇧', false, true, 1),
  ('da', 'Danish', 'Dansk', 'cbd.dk', 'CBD.dk', '🇩🇰', false, true, 2),
  ('sv', 'Swedish', 'Svenska', 'cbd.se', 'CBD.se', '🇸🇪', false, true, 3),
  ('no', 'Norwegian', 'Norsk', 'cbd.no', 'CBD.no', '🇳🇴', false, true, 4),
  ('fi', 'Finnish', 'Suomi', 'cbd.fi', 'CBD.fi', '🇫🇮', false, true, 5),
  ('de', 'German', 'Deutsch', 'cbd.de', 'CBD.de', '🇩🇪', false, true, 6),
  ('it', 'Italian', 'Italiano', 'cbd.it', 'CBD.it', '🇮🇹', false, true, 7),
  ('pt', 'Portuguese', 'Português', 'cbd.pt', 'CBD.pt', '🇵🇹', false, true, 8),
  ('nl', 'Dutch', 'Nederlands', 'cbdportaal.nl', 'CBDportaal.nl', '🇳🇱', false, true, 9),
  ('fr', 'French', 'Français', 'cbdportail.fr', 'CBDportail.fr', '🇫🇷', false, true, 10),
  ('ro', 'Romanian', 'Română', 'cbdportal.ro', 'CBDportal.ro', '🇷🇴', false, true, 11),
  ('es', 'Spanish', 'Español', 'cbdportal.es', 'CBDportal.es', '🇪🇸', false, true, 12),
  ('de-CH', 'Swiss German', 'Deutsch (Schweiz)', 'cbdportal.ch', 'CBDportal.ch', '🇨🇭', true, true, 13),
  ('fr-CH', 'Swiss French', 'Français (Suisse)', 'cbdportal.ch', 'CBDportal.ch', '🇨🇭', true, true, 14),
  ('it-CH', 'Swiss Italian', 'Italiano (Svizzera)', 'cbdportal.ch', 'CBDportal.ch', '🇨🇭', true, true, 15);

-- Insert Robin as primary author
INSERT INTO kb_authors (
  name, slug, title, credentials, bio_short, bio_full, years_experience,
  expertise_areas, companies, affiliations, is_verified, is_primary,
  meta_title, meta_description
) VALUES (
  'Robin Roy Krigslund-Hansen',
  'robin-krigslund-hansen',
  'CBD Industry Pioneer & Independent Researcher',
  'Co-founder Formula Swiss AG, 12+ Years CBD Industry Experience',
  'Robin is a CBD industry pioneer with over 12 years of experience. He has co-founded multiple companies in the CBD space and helped develop hundreds of CBD products sold to over 100,000 customers in 60+ countries.',
  E'Robin Roy Krigslund-Hansen is one of the pioneers of the European CBD industry with over 12 years of hands-on experience in cannabinoid research, product development, and business operations.

## Professional Background

Robin has co-founded and led multiple companies in the CBD and wellness space:

- **Formula Swiss AG** (Switzerland) - Premium CBD products
- **Formula Swiss UK Ltd.** (United Kingdom)
- **Formula Swiss Medical Ltd.** - Medical-grade CBD research
- **Formula Swiss Europe Ltd.** - European distribution

## Industry Impact

Through his companies, Robin has:
- Developed hundreds of CBD product formulations
- Served over 100,000 customers across 60+ countries
- Invested over €1 million in product registrations and compliance
- Built one of Europe''s most recognized CBD brands

## Research Approach

Robin takes an evidence-based approach to CBD education, combining:
- Hands-on industry experience
- Continuous monitoring of peer-reviewed research
- Real-world customer feedback and outcomes
- Collaboration with medical professionals

## Expertise Areas

- CBD product formulation and development
- European CBD regulations and compliance
- Cannabinoid science and the endocannabinoid system
- CBD for various health conditions
- Quality control and third-party testing standards

## Disclaimer

The views and opinions expressed in Robin''s articles are his personal expert opinions based on extensive industry experience and independent research. They do not represent the official position of Formula Swiss AG or any affiliated organization.',
  12,
  ARRAY['CBD Products', 'Cannabinoid Science', 'European Regulations', 'Product Development', 'Quality Standards'],
  '[
    {"name": "Formula Swiss AG", "role": "Co-founder", "location": "Switzerland", "description": "Premium CBD products company"},
    {"name": "Formula Swiss UK Ltd.", "role": "Co-founder", "location": "United Kingdom", "description": "UK CBD operations"},
    {"name": "Formula Swiss Medical Ltd.", "role": "Co-founder", "location": "Europe", "description": "Medical-grade CBD research"},
    {"name": "Formula Swiss Europe Ltd.", "role": "Co-founder", "location": "Europe", "description": "European distribution"}
  ]'::jsonb,
  '[]'::jsonb,
  true,
  true,
  'Robin Roy Krigslund-Hansen | CBD Industry Expert & Researcher',
  'Robin Roy Krigslund-Hansen is a CBD industry pioneer with 12+ years experience. Co-founder of Formula Swiss, he has helped develop hundreds of CBD products.'
);

-- ============================================
-- STORAGE BUCKET (run separately if needed)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('media', 'media', true)
-- ON CONFLICT (id) DO NOTHING;

-- Log migration completion
INSERT INTO migrations (name, executed_at) VALUES
  ('new_db_full_schema', NOW());
