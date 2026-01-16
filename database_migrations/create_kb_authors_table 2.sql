-- Create kb_authors table for CBD Portal
-- This needs to be run manually in Supabase SQL editor

CREATE TABLE IF NOT EXISTS kb_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(300),
  credentials TEXT,
  bio_short TEXT,
  bio_full TEXT,
  years_experience INTEGER,
  expertise_areas TEXT[],
  article_count INTEGER DEFAULT 0,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  companies JSONB,
  publications JSONB,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE kb_authors ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Public read access" ON kb_authors;
CREATE POLICY "Public read access" ON kb_authors FOR SELECT USING (true);

-- Insert Robin's author profile
INSERT INTO kb_authors (
  slug,
  name,
  title,
  credentials,
  bio_short,
  bio_full,
  expertise_areas,
  years_experience,
  article_count,
  is_primary,
  is_verified,
  is_active,
  linkedin_url,
  website_url,
  companies,
  meta_title,
  meta_description
) VALUES (
  'robin-roy-krigslund-hansen',
  'Robin Roy Krigslund-Hansen',
  'CBD Industry Expert & Founder of FormulaSwiss',
  'Founder of FormulaSwiss (10+ years), 27+ years in online marketing & e-commerce, Over €1 million invested in EU CBD product compliance',
  'Robin Roy Krigslund-Hansen brings over 12 years of hands-on experience in the CBD and cannabis industry, having developed hundreds of CBD-based products sold to more than 100,000 customers across 60+ countries worldwide.',
  'Robin Roy Krigslund-Hansen is the founder of FormulaSwiss, one of Europe''s leading CBD companies established over 10 years ago. With 27+ years of experience in online marketing and e-commerce, Robin has been at the forefront of the European CBD industry since its early days.

As the driving force behind FormulaSwiss, Robin has navigated the complex regulatory landscape of CBD products across Europe, investing over €1 million in product registrations and compliance. His hands-on experience spans product development, quality control, and consumer education.

Robin''s expertise in CBD is grounded in real-world business experience. He has overseen the development of hundreds of CBD products, worked with laboratories across Europe for third-party testing, and built relationships with hemp farmers and extraction facilities.

Beyond FormulaSwiss, Robin''s entrepreneurial journey includes founding Swiss Nutri GmbH (Tyrexin) in 2013, serving over 60,000 customers in the health supplement space. His experience across multiple health and wellness brands gives him unique insight into product quality, consumer needs, and industry best practices.

Robin founded CBD Portal to share evidence-based CBD information with consumers, cutting through marketing hype to provide honest, research-backed guidance on CBD products and their potential benefits.',
  ARRAY[
    'CBD Products',
    'CBD Regulations',
    'Product Quality',
    'European CBD Market',
    'E-commerce',
    'Health Supplements',
    'Consumer Education',
    'Cannabis Industry'
  ],
  27,
  0, -- Will be updated automatically based on articles
  true, -- is_primary
  true, -- is_verified
  true, -- is_active
  'https://linkedin.com/in/robin-roy-krigslund-hansen', -- Replace with actual if available
  'https://formulaswiss.com', -- Company website
  '[
    {
      "name": "FormulaSwiss",
      "role": "Founder & CEO",
      "location": "Switzerland",
      "description": "One of Europe''s leading CBD companies, serving 100,000+ customers across 60+ countries"
    },
    {
      "name": "Swiss Nutri GmbH (Tyrexin)",
      "role": "Founder",
      "location": "Switzerland",
      "description": "Health supplement company serving over 60,000 customers since 2013"
    }
  ]'::jsonb,
  'Robin Roy Krigslund-Hansen - CBD Industry Expert | CBD Portal',
  'Meet Robin Roy Krigslund-Hansen, founder of FormulaSwiss and CBD industry expert with 12+ years of hands-on experience in CBD product development and European market regulations.'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  credentials = EXCLUDED.credentials,
  bio_short = EXCLUDED.bio_short,
  bio_full = EXCLUDED.bio_full,
  expertise_areas = EXCLUDED.expertise_areas,
  years_experience = EXCLUDED.years_experience,
  is_primary = EXCLUDED.is_primary,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  linkedin_url = EXCLUDED.linkedin_url,
  website_url = EXCLUDED.website_url,
  companies = EXCLUDED.companies,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();

-- Update article count for Robin
UPDATE kb_authors
SET article_count = (
  SELECT COUNT(*)
  FROM kb_articles
  WHERE author_id = kb_authors.id
  AND status = 'published'
)
WHERE slug = 'robin-roy-krigslund-hansen';

-- Link all published articles to Robin (if no author assigned)
UPDATE kb_articles
SET author_id = (SELECT id FROM kb_authors WHERE slug = 'robin-roy-krigslund-hansen')
WHERE author_id IS NULL
AND status = 'published';