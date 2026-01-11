import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Migration endpoint to check/add sample_type column
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
      .select('sample_type')
      .limit(1);

    if (columnCheck && columnCheck.message?.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        columnExists: false,
        message: 'Column sample_type does not exist yet.',
        instructions: 'Run this SQL in Supabase Dashboard > SQL Editor:',
        sql: `-- Add sample_type column to distinguish human vs animal studies
ALTER TABLE kb_research_queue
ADD COLUMN IF NOT EXISTS sample_type VARCHAR(20) DEFAULT 'unknown';

-- Create index for faster queries by sample type
CREATE INDEX IF NOT EXISTS idx_research_queue_sample_type
ON kb_research_queue(sample_type)
WHERE status = 'approved';

-- Add comment for documentation
COMMENT ON COLUMN kb_research_queue.sample_type IS 'Type of study subjects: human, animal, or unknown';`,
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

    // Column exists - check current distribution
    const { data: humanData } = await supabase
      .from('kb_research_queue')
      .select('sample_size')
      .eq('status', 'approved')
      .eq('sample_type', 'human')
      .not('sample_size', 'is', null)
      .gt('sample_size', 0);

    const { data: animalData } = await supabase
      .from('kb_research_queue')
      .select('sample_size')
      .eq('status', 'approved')
      .eq('sample_type', 'animal')
      .not('sample_size', 'is', null)
      .gt('sample_size', 0);

    const { data: unknownData } = await supabase
      .from('kb_research_queue')
      .select('sample_size')
      .eq('status', 'approved')
      .or('sample_type.is.null,sample_type.eq.unknown');

    const humanParticipants = humanData?.reduce((sum, s) => sum + (s.sample_size || 0), 0) || 0;
    const animalSubjects = animalData?.reduce((sum, s) => sum + (s.sample_size || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      columnExists: true,
      message: 'Column sample_type already exists!',
      stats: {
        humanStudies: humanData?.length || 0,
        humanParticipants,
        humanDisplay: humanParticipants >= 1000
          ? `${Math.floor(humanParticipants / 1000)}K+`
          : `${humanParticipants}+`,
        animalStudies: animalData?.length || 0,
        animalSubjects,
        unknownStudies: unknownData?.length || 0
      },
      nextStep: (unknownData?.length || 0) > 0
        ? 'Run /api/admin/research/backfill-sample-size to classify unknown studies'
        : 'All done! Studies are classified.'
    });

  } catch (error) {
    console.error('[Migrate Sample Type] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/research/migrate-sample-type',
    method: 'POST',
    description: 'Check if sample_type column exists and get migration instructions if needed',
    workflow: [
      '1. POST to this endpoint to check column status',
      '2. If column missing, run the provided SQL in Supabase Dashboard',
      '3. POST to /api/admin/research/backfill-sample-size to classify studies',
      '4. Homepage will show "X Human Participants" separately from animal studies'
    ]
  });
}
