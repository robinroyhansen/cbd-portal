-- Create authors table with comprehensive schema for CBD Portal
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Core profile information
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(300),
  email VARCHAR(200),

  -- Biography content
  bio_short TEXT,
  bio_full TEXT,

  -- Professional information
  credentials TEXT[] DEFAULT array[]::text[],
  expertise_areas TEXT[] DEFAULT array[]::text[],
  years_experience INT DEFAULT 0,
  location VARCHAR(200),

  -- Media and images
  image_url TEXT,
  image_alt VARCHAR(300),

  -- Social media links (stored as JSON)
  social_links JSONB DEFAULT '{}',

  -- SEO fields
  meta_title VARCHAR(200),
  meta_description TEXT,

  -- Status and settings
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,

  -- Indexes for performance
  CONSTRAINT unique_slug UNIQUE (slug),
  CONSTRAINT unique_primary_author UNIQUE NULLS NOT DISTINCT (CASE WHEN is_primary THEN true END)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors (slug);
CREATE INDEX IF NOT EXISTS idx_authors_active ON authors (is_active);
CREATE INDEX IF NOT EXISTS idx_authors_primary ON authors (is_primary);
CREATE INDEX IF NOT EXISTS idx_authors_verified ON authors (is_verified);
CREATE INDEX IF NOT EXISTS idx_authors_display_order ON authors (display_order, created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_authors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER authors_updated_at_trigger
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_authors_updated_at();

-- Add some sample data for testing
INSERT INTO authors (
  slug, name, title, email, bio_short, bio_full, credentials, expertise_areas,
  years_experience, location, is_primary, is_verified, is_active
) VALUES
(
  'dr-jane-smith',
  'Dr. Jane Smith',
  'Senior Cannabis Researcher & Medical Director',
  'jane.smith@example.com',
  'Dr. Jane Smith is a leading expert in cannabis research with over 15 years of experience in medical cannabis applications.',
  'Dr. Jane Smith, MD, PhD, is a board-certified physician and researcher specializing in cannabis medicine. With over 15 years of experience in both clinical practice and research, she has published numerous peer-reviewed studies on the therapeutic applications of cannabis compounds.',
  ARRAY['MD', 'PhD', 'Board Certified Internal Medicine'],
  ARRAY['Medical Cannabis', 'Clinical Research', 'Patient Care', 'Regulatory Affairs'],
  15,
  'California, USA',
  true,
  true,
  true
),
(
  'mike-johnson',
  'Mike Johnson',
  'Cannabis Industry Analyst',
  'mike.johnson@example.com',
  'Mike Johnson is a cannabis industry expert with deep knowledge of market trends and regulatory developments.',
  'Mike Johnson brings over a decade of experience in cannabis industry analysis and business development. His expertise spans market research, regulatory compliance, and strategic business planning for cannabis companies.',
  ARRAY['MBA', 'Cannabis Business Certification'],
  ARRAY['Market Analysis', 'Regulatory Compliance', 'Business Strategy', 'Industry Trends'],
  10,
  'Colorado, USA',
  false,
  true,
  true
);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Grant appropriate permissions
-- GRANT SELECT ON authors TO anon;
-- GRANT ALL ON authors TO authenticated;