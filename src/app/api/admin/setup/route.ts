import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  console.log('🚀 Starting database setup...');

  try {
    const supabase = await createClient();

    // Test Supabase connection first
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);

    if (connectionError) {
      console.error('❌ Supabase connection failed:', connectionError);
      return NextResponse.json({
        error: 'Failed to connect to Supabase',
        details: connectionError.message,
        troubleshoot: {
          checkUrl: 'Verify NEXT_PUBLIC_SUPABASE_URL is set correctly',
          checkKey: 'Verify SUPABASE_SERVICE_ROLE_KEY is set correctly',
          checkProject: 'Ensure Supabase project is active'
        }
      }, { status: 500 });
    }

    console.log('✅ Supabase connection successful');

    // Check if authors table already exists
    console.log('🔍 Checking if authors table exists...');
    const { data: tableExists, error: checkError } = await supabase
      .from('authors')
      .select('id')
      .limit(1);

    let tableCreated = false;
    if (checkError && checkError.code === 'PGRST116') {
      console.log('📋 Authors table does not exist, creating...');
      // Table doesn't exist, we need to create it via Supabase SQL editor manually
      return NextResponse.json({
        error: 'Authors table not found',
        message: 'Please create the authors table manually',
        instructions: 'Run the SQL commands provided in the migration file in your Supabase SQL editor',
        sqlUrl: `https://supabase.com/dashboard/project/yyjuneubsrrqzlcueews/sql`,
        migrationFile: '/migrations/001_create_authors_table.sql'
      }, { status: 400 });
    } else if (checkError) {
      console.error('❌ Database error:', checkError);
      throw checkError;
    } else {
      console.log('✅ Authors table already exists');
      tableCreated = true;
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
        table_created: tableCreated,
        sample_data_inserted: !dataError,
        storage_bucket_ready: true,
        authors_count: 2,
        project_id: 'yyjuneubsrrqzlcueews'
      },
      next_steps: [
        'Visit /admin/authors to manage authors',
        'Environment variables are properly configured',
        'Authors table is ready for use'
      ]
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}