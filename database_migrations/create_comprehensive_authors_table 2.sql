-- Comprehensive Authors Table for CBD Portal Admin Management
-- This needs to be run manually in Supabase SQL editor

-- Drop existing table if exists and recreate with full schema
DROP TABLE IF EXISTS authors CASCADE;

CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(300),
  email VARCHAR(200),

  -- Bio Content
  bio_short TEXT,  -- For bylines (150-200 chars)
  bio_full TEXT,   -- For author page (full markdown)

  -- Professional Info
  credentials TEXT[],  -- Array of credential strings
  expertise_areas TEXT[],  -- Array of expertise areas
  years_experience INT,
  location VARCHAR(200),

  -- Profile Image
  image_url TEXT,  -- Supabase storage URL
  image_alt VARCHAR(300),

  -- Social Media Links
  social_links JSONB DEFAULT '{}',
  -- Structure: {
  --   "linkedin": "https://linkedin.com/in/...",
  --   "twitter": "https://twitter.com/...",
  --   "website": "https://...",
  --   "facebook": "https://facebook.com/...",
  --   "instagram": "https://instagram.com/...",
  --   "youtube": "https://youtube.com/..."
  -- }

  -- SEO
  meta_title VARCHAR(200),
  meta_description TEXT,

  -- Display Settings
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);
CREATE INDEX IF NOT EXISTS idx_authors_active ON authors(is_active);
CREATE INDEX IF NOT EXISTS idx_authors_primary ON authors(is_primary);
CREATE INDEX IF NOT EXISTS idx_authors_display_order ON authors(display_order);

-- Enable RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read access" ON authors;
CREATE POLICY "Public read access" ON authors
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access" ON authors;
CREATE POLICY "Admin full access" ON authors
  FOR ALL USING (true);

-- Insert Robin Roy Krigslund-Hansen as the primary author
INSERT INTO authors (
  slug,
  name,
  title,
  email,
  bio_short,
  bio_full,
  credentials,
  expertise_areas,
  years_experience,
  location,
  social_links,
  meta_title,
  meta_description,
  is_primary,
  is_verified,
  is_active,
  display_order
) VALUES (
  'robin-roy-krigslund-hansen',
  'Robin Roy Krigslund-Hansen',
  'CBD Industry Pioneer & Entrepreneur',
  'robin@cbd-portal.app',
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
  '{}',
  'Robin Roy Krigslund-Hansen - CBD Industry Expert | CBD Portal',
  'Meet Robin Roy Krigslund-Hansen, Danish entrepreneur and CBD industry pioneer with 12+ years of hands-on experience in the European CBD market since 2013.',
  true,
  true,
  true,
  0
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  email = EXCLUDED.email,
  bio_short = EXCLUDED.bio_short,
  bio_full = EXCLUDED.bio_full,
  credentials = EXCLUDED.credentials,
  expertise_areas = EXCLUDED.expertise_areas,
  years_experience = EXCLUDED.years_experience,
  location = EXCLUDED.location,
  social_links = EXCLUDED.social_links,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_primary = EXCLUDED.is_primary,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Update kb_articles table to link to authors if not already done
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'kb_articles' AND column_name = 'author_id') THEN
        ALTER TABLE kb_articles ADD COLUMN author_id UUID REFERENCES authors(id);
    END IF;

    -- Update all articles to reference Robin as the author
    UPDATE kb_articles
    SET author_id = (SELECT id FROM authors WHERE slug = 'robin-roy-krigslund-hansen')
    WHERE author_id IS NULL;
END $$;

-- Create storage bucket for author images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'images');