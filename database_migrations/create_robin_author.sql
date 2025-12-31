-- Create authors table for Robin Roy Krigslund-Hansen CBD Portal
-- This needs to be run manually in Supabase SQL editor

CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(300),
  bio_short TEXT,
  bio_full TEXT,
  credentials TEXT[],
  expertise_areas TEXT[],
  years_experience INT,
  location VARCHAR(200),
  image_url TEXT,
  email VARCHAR(200),
  website_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS with public read
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON authors;
CREATE POLICY "Public read access" ON authors FOR SELECT USING (true);

-- Remove any existing authors first
DELETE FROM authors;

-- Insert Robin Roy Krigslund-Hansen Complete Author Profile with Full E-E-A-T
INSERT INTO authors (
  slug,
  name,
  title,
  bio_short,
  bio_full,
  credentials,
  expertise_areas,
  years_experience,
  location,
  website_url,
  is_primary,
  is_verified,
  is_active
) VALUES (
  'robin-roy-krigslund-hansen',
  'Robin Roy Krigslund-Hansen',
  'CBD Industry Pioneer & Entrepreneur',
  'Danish entrepreneur who has been pioneering the European CBD industry since 2013. With over a decade of hands-on experience in product development, manufacturing, and regulatory compliance, he shares evidence-based insights to help consumers make informed decisions.',
  'Robin Roy Krigslund-Hansen is a Danish entrepreneur and CBD industry pioneer who founded his first CBD company in 2013, making him one of the earliest players in the European cannabinoid market.

Over the past 12 years, Robin has built extensive hands-on experience across every aspect of the CBD industry — from organic hemp cultivation and CO2 extraction to product formulation, GMP manufacturing, and navigating the complex European regulatory landscape.

**Product Development & Manufacturing**
Robin has overseen the development of over 300 different CBD products, including full-spectrum and broad-spectrum CBD oils, CBG oils, CBN oils, CBD skincare, and pet products. He has direct experience with CO2 extraction processes, winterization, and decarboxylation techniques that ensure optimal cannabinoid profiles.

**Quality Standards & Certifications**
Under Robin''s leadership, his companies have achieved GMP (Good Manufacturing Practice) and ISO 22716-2007 certifications — the highest standards in the industry. Every production batch undergoes third-party laboratory testing in Switzerland, with a perfect track record of zero failed tests.

**Regulatory Expertise**
Robin has navigated CBD regulations across 16+ European countries and invested significantly in EU Novel Food compliance. He is a shareholder in the EIHA Novel Food Consortium, a €3.5 million initiative to establish comprehensive safety data for CBD products in Europe.

**Scientific Research Collaboration**
Robin has established research partnerships with the University of Bologna''s Department of Veterinary Medical Sciences for CBD studies in animals, and has supported human clinical research including double-blind, placebo-controlled trials in the Netherlands.

**Sustainability Commitment**
Robin''s operations use 100% renewable energy (solar and hydro), state-of-the-art LED growing technology, and follow organic cultivation principles without pesticides or artificial fertilizers. Hemp''s natural CO2 absorption makes his operations carbon-negative.

**Industry Leadership**
Robin is an active member of leading industry associations including:
- European Industrial Hemp Association (EIHA)
- EIHA Novel Food Consortium (shareholder)
- Swiss Medical Cannabis Association (MEDCAN)
- Swiss Hemp Producer Association (IG Hanf)
- Arge Canna (Austria)

Through this portal, Robin shares his decade-plus of practical experience to provide accurate, evidence-based information about CBD products, helping consumers separate fact from marketing hype.',
  ARRAY[
    '12+ years in CBD industry (since 2013)',
    'Developed 300+ CBD product formulations',
    'GMP & ISO 22716 certified operations',
    'EU Novel Food Consortium shareholder',
    'University research collaborations',
    'Zero failed third-party lab tests',
    'Operations in 16+ European countries',
    '100% renewable energy production',
    'EIHA member (European Industrial Hemp Association)',
    'MEDCAN supporter (Swiss Medical Cannabis Association)',
    'Organic cultivation expertise',
    'CO2 extraction specialist'
  ],
  ARRAY[
    'CBD Oils (Full-spectrum & Broad-spectrum)',
    'CBG & CBN Cannabinoids',
    'CBD for Pets (Dogs, Cats, Horses)',
    'CBD Skincare & Cosmetics',
    'CO2 Extraction Methods',
    'GMP Manufacturing Standards',
    'EU Novel Food Regulations',
    'Third-party Lab Testing',
    'Organic Hemp Cultivation',
    'European CBD Market',
    'Product Quality Control',
    'Cannabinoid Science'
  ],
  12,
  'Zug, Switzerland',
  '',
  true,
  true,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  bio_short = EXCLUDED.bio_short,
  bio_full = EXCLUDED.bio_full,
  credentials = EXCLUDED.credentials,
  expertise_areas = EXCLUDED.expertise_areas,
  years_experience = EXCLUDED.years_experience,
  location = EXCLUDED.location,
  website_url = EXCLUDED.website_url,
  is_primary = EXCLUDED.is_primary,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Link Articles to Robin Roy Krigslund-Hansen (if kb_articles has author_id column)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'kb_articles' AND column_name = 'author_id') THEN
        UPDATE kb_articles
        SET author_id = (SELECT id FROM authors WHERE slug = 'robin-roy-krigslund-hansen')
        WHERE author_id IS NULL OR author_id != (SELECT id FROM authors WHERE slug = 'robin-roy-krigslund-hansen');
    ELSE
        ALTER TABLE kb_articles ADD COLUMN author_id UUID REFERENCES authors(id);
        UPDATE kb_articles
        SET author_id = (SELECT id FROM authors WHERE slug = 'robin-roy-krigslund-hansen');
    END IF;
END $$;