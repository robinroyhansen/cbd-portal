import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Migration endpoint to check/add sample_size column
 *
 * POST: Check column status and provide migration instructions
 * GET: Show status info
 */
export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if column exists by trying to select it
    const { error: columnCheck } = await supabase
      .from('kb_research_queue')
      .select('sample_size')
      .limit(1);

    if (columnCheck && columnCheck.message?.includes('does not exist')) {
      // Column doesn't exist - Supabase JS client cannot run DDL statements
      return NextResponse.json({
        success: false,
        columnExists: false,
        message: 'Column sample_size does not exist yet.',
        instructions: 'Run this SQL in Supabase Dashboard > SQL Editor:',
        sql: `-- Add sample_size column for research participant counts
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS sample_size INTEGER;

-- Create index for faster SUM queries
CREATE INDEX IF NOT EXISTS idx_research_queue_sample_size
ON kb_research_queue(sample_size)
WHERE status = 'approved' AND sample_size IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN kb_research_queue.sample_size IS 'Number of participants/subjects in the study';`,
        nextStep: 'After running the SQL, call /api/admin/research/backfill-sample-size to populate existing studies'
      });
    }

    if (columnCheck) {
      // Some other error occurred
      return NextResponse.json({
        success: false,
        error: columnCheck.message
      }, { status: 500 });
    }

    // Column exists - check current stats
    const { data: stats, error: statsError } = await supabase
      .from('kb_research_queue')
      .select('sample_size')
      .eq('status', 'approved');

    if (statsError) {
      return NextResponse.json({
        success: true,
        columnExists: true,
        message: 'Column exists but could not fetch stats',
        error: statsError.message
      });
    }

    const withSampleSize = stats?.filter(s => s.sample_size && s.sample_size > 0) || [];
    const totalParticipants = withSampleSize.reduce((sum, s) => sum + (s.sample_size || 0), 0);

    return NextResponse.json({
      success: true,
      columnExists: true,
      message: 'Column sample_size already exists!',
      stats: {
        totalApprovedStudies: stats?.length || 0,
        studiesWithSampleSize: withSampleSize.length,
        studiesNeedingBackfill: (stats?.length || 0) - withSampleSize.length,
        totalParticipants,
        displayValue: totalParticipants >= 1000
          ? `${Math.floor(totalParticipants / 1000)}K+`
          : `${totalParticipants}+`
      },
      nextStep: withSampleSize.length < (stats?.length || 0)
        ? 'Run /api/admin/research/backfill-sample-size to populate missing sample sizes'
        : 'All done! Sample sizes are populated.'
    });

  } catch (error) {
    console.error('[Migrate Sample Size] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/research/migrate-sample-size',
    method: 'POST',
    description: 'Check if sample_size column exists and get migration instructions if needed',
    workflow: [
      '1. POST to this endpoint to check column status',
      '2. If column missing, run the provided SQL in Supabase Dashboard',
      '3. POST to /api/admin/research/backfill-sample-size to populate existing studies',
      '4. New studies will auto-populate sample_size on approval'
    ]
  });
}
