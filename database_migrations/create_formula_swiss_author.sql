-- Create authors table for Formula Swiss CBD Portal
-- This needs to be run manually in Supabase SQL editor

CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(300),
  bio TEXT,
  credentials TEXT[],
  expertise_areas TEXT[],
  years_experience INT,
  image_url TEXT,
  email VARCHAR(200),
  website_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS with public read
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON authors;
CREATE POLICY "Public read access" ON authors FOR SELECT USING (true);

-- Insert Formula Swiss Author Profile
INSERT INTO authors (
  slug,
  name,
  title,
  bio,
  credentials,
  expertise_areas,
  years_experience,
  website_url,
  is_primary,
  is_active
) VALUES (
  'formula-swiss',
  'Formula Swiss',
  'European CBD Industry Pioneer Since 2013',
  'Formula Swiss is one of Europe''s most established CBD companies, operating since 2013 when the European CBD market was still in its infancy. What started as a small operation has grown into a group of companies serving consumers, retailers, and medical professionals across Europe and beyond.

The Formula Swiss group includes:

- **Formula Swiss AG** – The flagship Swiss company focusing on premium CBD consumer products, manufactured under strict Swiss quality standards.

- **Formula Swiss Wholesale AG** – Dedicated B2B division supplying CBD products to retailers, pharmacies, and white-label partners throughout Europe.

- **Formula Swiss UK Ltd.** – UK operations ensuring continued service and compliance following Brexit, with products tailored to British regulations.

- **Formula Swiss Europe Ltd.** – European distribution hub managing logistics and compliance across EU member states.

- **Formula Swiss Medical Ltd.** – Specialized division focused on medical-grade CBD products and collaboration with healthcare professionals.

Over more than a decade in the CBD industry, Formula Swiss has invested heavily in regulatory compliance, including over €1 million in Novel Food applications and product registrations across European markets. The company works with certified laboratories for third-party testing and maintains relationships with organic hemp farmers and state-of-the-art extraction facilities.

CBD Portal was founded by the Formula Swiss team to provide consumers with honest, evidence-based information about CBD – cutting through marketing hype to deliver research-backed guidance that helps people make informed decisions about CBD products.',
  ARRAY[
    'Operating in the CBD industry since 2013',
    'Over €1 million invested in EU regulatory compliance',
    'Novel Food applications submitted and approved',
    'Five specialized companies across Europe and UK',
    'Partnerships with certified testing laboratories',
    'Direct relationships with organic hemp farmers',
    'GMP-compliant manufacturing processes',
    'Medical-grade product development expertise'
  ],
  ARRAY[
    'CBD Oils & Tinctures',
    'CBD Capsules & Edibles',
    'CBD Topicals & Skincare',
    'CBD for Pets',
    'Medical CBD Applications',
    'European CBD Regulations',
    'Product Quality & Testing',
    'Hemp Cultivation & Extraction'
  ],
  12,
  'https://formulaswiss.com',
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  credentials = EXCLUDED.credentials,
  expertise_areas = EXCLUDED.expertise_areas,
  years_experience = EXCLUDED.years_experience,
  website_url = EXCLUDED.website_url,
  is_primary = EXCLUDED.is_primary,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Remove any other authors that might exist
DELETE FROM authors WHERE slug != 'formula-swiss';

-- Link Articles to Formula Swiss (if kb_articles has author_id column)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'kb_articles' AND column_name = 'author_id') THEN
        UPDATE kb_articles
        SET author_id = (SELECT id FROM authors WHERE slug = 'formula-swiss')
        WHERE author_id IS NULL OR author_id != (SELECT id FROM authors WHERE slug = 'formula-swiss');
    ELSE
        ALTER TABLE kb_articles ADD COLUMN author_id UUID REFERENCES authors(id);
        UPDATE kb_articles
        SET author_id = (SELECT id FROM authors WHERE slug = 'formula-swiss');
    END IF;
END $$;