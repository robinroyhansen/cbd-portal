# Manual Database Setup for Author Management System

## 🚨 CRITICAL: Run This SQL in Supabase

If the Author Management System shows "Database connection error", you need to manually create the authors table.

## 📋 STEP 1: Open Supabase SQL Editor

1. **Go to:** https://supabase.com/dashboard/project/yyjuneubsrrqzlcueews/sql
2. **Click:** "New Query"
3. **Paste the SQL below** and click "RUN"

## 💾 STEP 2: Run This SQL

```sql
-- Create authors table with comprehensive schema
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
  display_order INT DEFAULT 0
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
DROP TRIGGER IF EXISTS authors_updated_at_trigger ON authors;
CREATE TRIGGER authors_updated_at_trigger
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_authors_updated_at();

-- Insert Robin as the primary author
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
  is_primary,
  is_verified,
  is_active,
  social_links,
  meta_title,
  meta_description
) VALUES (
  'robin-roy-krigslund-hansen',
  'Robin Roy Krigslund-Hansen',
  'CBD Industry Pioneer & Entrepreneur',
  'robin@cbd-portal.com',
  'Danish entrepreneur who has been pioneering the European CBD industry since 2013. With 12+ years of hands-on experience in product development, manufacturing, and regulatory compliance.',
  'Robin Roy Krigslund-Hansen is a Danish entrepreneur and CBD industry pioneer who founded his first CBD company in 2013, making him one of the earliest players in the European cannabinoid market.

Over the past 12 years, Robin has built extensive hands-on experience across every aspect of the CBD industry — from organic hemp cultivation and CO2 extraction to product formulation, GMP manufacturing, and navigating the complex European regulatory landscape.

**Product Development & Manufacturing**
Robin has overseen the development of over 300 different CBD products, including full-spectrum and broad-spectrum CBD oils, CBG oils, CBN oils, CBD skincare, and pet products. He has direct experience with CO2 extraction processes, winterization, and decarboxylation techniques that ensure optimal cannabinoid profiles.

**Quality Standards & Certifications**
Under Robin''s leadership, his companies have achieved GMP (Good Manufacturing Practice) and ISO 22716-2007 certifications — the highest standards in the industry. Every production batch undergoes third-party laboratory testing in Switzerland, with a perfect track record of zero failed tests.

**Regulatory Expertise**
Robin has navigated CBD regulations across 16+ European countries and invested significantly in EU Novel Food compliance. He is a shareholder in the EIHA Novel Food Consortium, a €3.5 million initiative to establish comprehensive safety data for CBD products in Europe.

Through this portal, Robin shares his decade-plus of practical experience to provide accurate, evidence-based information about CBD.',
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
    'MEDCAN supporter (Swiss Medical Cannabis Association)'
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
  true,
  true,
  true,
  '{
    "website": "https://cbd-portal.vercel.app",
    "linkedin": "https://linkedin.com/in/robinroykrigslundhansen"
  }',
  'Robin Roy Krigslund-Hansen - CBD Industry Expert & Entrepreneur',
  'Danish CBD industry pioneer with 12+ years of experience. Learn from Robin''s expertise in product development, GMP manufacturing, and European regulations.'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample expert author
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
  is_primary,
  is_verified,
  is_active,
  meta_title,
  meta_description
) VALUES (
  'dr-emma-williams',
  'Dr. Emma Williams',
  'Cannabis Research Scientist & Medical Advisor',
  'emma@cbd-portal.com',
  'Dr. Emma Williams is a leading cannabis researcher with over 10 years of experience in cannabinoid science and medical applications.',
  'Dr. Emma Williams, PhD in Pharmacology, is a dedicated cannabis research scientist with extensive experience in cannabinoid research and clinical applications. Her work focuses on the therapeutic potential of CBD and other cannabinoids for various medical conditions.

**Research Background**
Dr. Williams has published numerous peer-reviewed papers on cannabinoid science, with particular expertise in the endocannabinoid system, CBD bioavailability, and therapeutic applications. Her research has contributed to the understanding of how CBD interacts with various biological pathways.

**Clinical Experience**
She has worked closely with medical professionals to evaluate the efficacy and safety of CBD products in clinical settings, providing scientific guidance for evidence-based CBD recommendations.

**Education & Credentials**
- PhD in Pharmacology, University of Edinburgh
- Postdoctoral Research, Harvard Medical School
- Member, International Association for Cannabinoid Medicines
- Scientific Advisory Board Member, Cannabis Research Institute',
  ARRAY[
    'PhD in Pharmacology',
    'Harvard Medical School Postdoc',
    'Published 25+ peer-reviewed papers',
    'IACM Member',
    'Clinical Research Experience',
    'Scientific Advisory Board Member'
  ],
  ARRAY[
    'Cannabinoid Science',
    'Endocannabinoid System',
    'CBD Bioavailability',
    'Clinical Research',
    'Pharmacology',
    'Medical Applications',
    'Research Methodology',
    'Scientific Writing'
  ],
  10,
  'Edinburgh, Scotland',
  false,
  true,
  true,
  'Dr. Emma Williams - Cannabis Research Scientist',
  'Cannabis research scientist with 10+ years experience. Expert in cannabinoid science, CBD research, and therapeutic applications.'
)
ON CONFLICT (slug) DO NOTHING;
```

## 🗄️ STEP 3: Create Storage Bucket

```sql
-- Create storage bucket for author images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
```

## ✅ STEP 4: Verify Setup

After running the SQL:

1. **Visit:** https://cbd-portal.vercel.app/admin
2. **Login:** Password = `Robin`
3. **Click:** "Authors" in the sidebar
4. **Should see:** 2 sample authors (Robin + Dr. Emma)

## 🚀 STEP 5: Test Full System

- ✅ **Create Author:** Click "Create Author" and add a new author
- ✅ **Edit Author:** Click edit icon and modify an author
- ✅ **Upload Image:** Test the image upload functionality
- ✅ **Public View:** Visit `/authors` to see the public author listing

## 🐛 If Still Not Working

Check these common issues:

1. **Environment Variables Missing:**
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

2. **Supabase Project Paused:**
   - Check if your project is active in the Supabase dashboard

3. **Network Issues:**
   - Try refreshing the page
   - Check browser console for errors

## 📞 Success Indicators

You'll know it's working when:
- ✅ Authors appear in `/admin/authors`
- ✅ No red error messages
- ✅ Can create/edit authors
- ✅ Public pages at `/authors` show the data

The Author Management System will be fully functional once this SQL is executed!