-- Phase 3: E-E-A-T Enhancement with Multi-Author System
-- Create comprehensive authors table with full E-E-A-T support

-- Drop existing if needed and recreate with full E-E-A-T fields
DROP TABLE IF EXISTS kb_authors CASCADE;

CREATE TABLE kb_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),

  -- Professional titles
  title VARCHAR(150),
  credentials VARCHAR(255),

  -- Bio content
  bio_short VARCHAR(300),
  bio_full TEXT,

  -- Experience details
  years_experience INT,
  expertise_areas TEXT[],

  -- Companies & affiliations
  companies JSONB,
  affiliations JSONB,

  -- External profiles
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  website_url VARCHAR(255),

  -- Media & proof
  image_url VARCHAR(500),
  publications JSONB,
  media_mentions JSONB,
  speaking_engagements JSONB,
  certifications JSONB,

  -- Trust signals
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Stats
  article_count INT DEFAULT 0,

  -- SEO
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_authors_slug ON kb_authors(slug);
CREATE INDEX idx_authors_active ON kb_authors(is_active);
CREATE INDEX idx_authors_primary ON kb_authors(is_primary);
CREATE INDEX idx_authors_verified ON kb_authors(is_verified);

-- Enable RLS
ALTER TABLE kb_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read authors" ON kb_authors FOR SELECT USING (is_active = true);

-- Add author_id to articles if not exists
ALTER TABLE kb_articles ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES kb_authors(id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON kb_articles(author_id);

-- Insert Robin as primary author with full E-E-A-T details
INSERT INTO kb_authors (
  name,
  slug,
  title,
  credentials,
  bio_short,
  bio_full,
  years_experience,
  expertise_areas,
  companies,
  affiliations,
  linkedin_url,
  image_url,
  publications,
  is_verified,
  is_primary,
  meta_title,
  meta_description
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
  NULL,
  NULL,
  '[]'::jsonb,
  true,
  true,
  'Robin Roy Krigslund-Hansen | CBD Industry Expert & Researcher',
  'Robin Roy Krigslund-Hansen is a CBD industry pioneer with 12+ years experience. Co-founder of Formula Swiss, he has helped develop hundreds of CBD products.'
);

-- Function to update author article counts
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

CREATE TRIGGER trigger_update_author_counts
AFTER INSERT OR UPDATE OR DELETE ON kb_articles
FOR EACH ROW EXECUTE FUNCTION update_author_article_count();

-- Link existing articles to Robin
UPDATE kb_articles
SET author_id = (SELECT id FROM kb_authors WHERE slug = 'robin-krigslund-hansen')
WHERE author_id IS NULL;

-- Update author article counts
UPDATE kb_authors
SET article_count = (
  SELECT COUNT(*) FROM kb_articles
  WHERE author_id = kb_authors.id AND status = 'published'
);

-- Log migration completion
INSERT INTO public.migrations (name, executed_at)
VALUES ('20251231_create_authors_system', NOW())
ON CONFLICT (name) DO UPDATE SET executed_at = NOW();