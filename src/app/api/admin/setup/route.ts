import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();

    // Create the authors table with the comprehensive schema
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (tableError && !tableError.message.includes('already exists')) {
      console.error('Error creating authors table:', tableError);
      throw tableError;
    }

    // Insert sample data
    const { error: dataError } = await supabase
      .from('authors')
      .upsert([
        {
          slug: 'dr-jane-smith',
          name: 'Dr. Jane Smith',
          title: 'Senior Cannabis Researcher & Medical Director',
          email: 'jane.smith@example.com',
          bio_short: 'Dr. Jane Smith is a leading expert in cannabis research with over 15 years of experience in medical cannabis applications.',
          bio_full: 'Dr. Jane Smith, MD, PhD, is a board-certified physician and researcher specializing in cannabis medicine. With over 15 years of experience in both clinical practice and research, she has published numerous peer-reviewed studies on the therapeutic applications of cannabis compounds.',
          credentials: ['MD', 'PhD', 'Board Certified Internal Medicine'],
          expertise_areas: ['Medical Cannabis', 'Clinical Research', 'Patient Care', 'Regulatory Affairs'],
          years_experience: 15,
          location: 'California, USA',
          is_primary: true,
          is_verified: true,
          is_active: true,
          social_links: {
            linkedin: 'https://linkedin.com/in/janesmith',
            twitter: '@DrJaneSmith',
            website: 'https://janesmith-research.com'
          },
          meta_title: 'Dr. Jane Smith - Cannabis Research Expert',
          meta_description: 'Leading cannabis researcher with 15+ years experience in medical cannabis applications and clinical research.'
        },
        {
          slug: 'mike-johnson',
          name: 'Mike Johnson',
          title: 'Cannabis Industry Analyst',
          email: 'mike.johnson@example.com',
          bio_short: 'Mike Johnson is a cannabis industry expert with deep knowledge of market trends and regulatory developments.',
          bio_full: 'Mike Johnson brings over a decade of experience in cannabis industry analysis and business development. His expertise spans market research, regulatory compliance, and strategic business planning for cannabis companies.',
          credentials: ['MBA', 'Cannabis Business Certification'],
          expertise_areas: ['Market Analysis', 'Regulatory Compliance', 'Business Strategy', 'Industry Trends'],
          years_experience: 10,
          location: 'Colorado, USA',
          is_primary: false,
          is_verified: true,
          is_active: true,
          social_links: {
            linkedin: 'https://linkedin.com/in/mikejohnson',
            website: 'https://cannabisinsights.co'
          },
          meta_title: 'Mike Johnson - Cannabis Industry Analyst',
          meta_description: 'Cannabis industry expert with 10+ years experience in market analysis and regulatory compliance.'
        }
      ], {
        onConflict: 'slug'
      });

    if (dataError) {
      console.error('Error inserting sample data:', dataError);
      // Don't throw error for sample data issues
    }

    // Create storage bucket for images if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw bucketsError;
    }

    const imagesBucketExists = buckets?.some(bucket => bucket.name === 'images');

    if (!imagesBucketExists) {
      const { error: bucketError } = await supabase
        .storage
        .createBucket('images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        });

      if (bucketError) {
        console.error('Error creating images bucket:', bucketError);
        throw bucketError;
      }
    }

    return NextResponse.json({
      message: 'Database setup completed successfully',
      details: {
        table_created: true,
        sample_data_inserted: !dataError,
        storage_bucket_ready: true
      }
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}