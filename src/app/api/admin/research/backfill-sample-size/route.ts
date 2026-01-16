import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSampleSize } from '@/lib/utils/extract-sample-size';

/**
 * Backfill sample_size and sample_type for existing approved studies
 *
 * Run with: curl -X POST https://cbd-portal.vercel.app/api/admin/research/backfill-sample-size
 */
export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all approved studies
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, plain_summary, sample_size, sample_type')
      .eq('status', 'approved');

    if (fetchError) {
      console.error('[Backfill Sample Size] Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const results = {
      total: studies?.length || 0,
      updated: 0,
      skipped: 0,
      alreadySet: 0,
      byType: {
        human: 0,
        animal: 0,
        unknown: 0
      },
      examples: [] as { title: string; size: number; type: string }[],
      animalExamples: [] as { title: string; size: number }[],
    };

    for (const study of studies || []) {
      // Re-classify all studies to fix detection issues
      // Only skip if sample_type is explicitly set to human or animal (not unknown/null)

      const result = extractSampleSize(study.title, study.abstract, study.plain_summary);

      if (result) {
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({
            sample_size: result.size,
            sample_type: result.type
          })
          .eq('id', study.id);

        if (!updateError) {
          results.updated++;
          results.byType[result.type]++;
          // Store first 5 examples of each type
          if (results.examples.length < 5) {
            results.examples.push({
              title: study.title?.substring(0, 60) + '...',
              size: result.size,
              type: result.type
            });
          }
          // Store animal examples separately for debugging
          if (result.type === 'animal' && results.animalExamples.length < 10) {
            results.animalExamples.push({
              title: study.title?.substring(0, 80) + '...',
              size: result.size
            });
          }
        }
      } else {
        results.skipped++;
      }
    }

    // Get totals for verification
    const { data: humanData } = await supabase
      .from('kb_research_queue')
      .select('sample_size')
      .eq('status', 'approved')
      .eq('sample_type', 'human')
      .not('sample_size', 'is', null)
      .gt('sample_size', 0);

    // Count all animal studies (including those with size=0)
    const { data: animalData } = await supabase
      .from('kb_research_queue')
      .select('sample_size')
      .eq('status', 'approved')
      .eq('sample_type', 'animal');

    const humanParticipants = humanData?.reduce((sum, s) => sum + (s.sample_size || 0), 0) || 0;
    const animalSubjects = animalData?.reduce((sum, s) => sum + (s.sample_size || 0), 0) || 0;

    console.log('[Backfill Sample Size] Complete:', results);

    return NextResponse.json({
      success: true,
      ...results,
      totals: {
        humanStudies: humanData?.length || 0,
        humanParticipants,
        animalStudies: animalData?.length || 0,
        animalSubjects
      },
      display: {
        human: humanParticipants >= 1000
          ? `${Math.floor(humanParticipants / 1000)}K+`
          : `${humanParticipants.toLocaleString()}+`,
        animal: `${animalData?.length || 0} preclinical studies`
      }
    });

  } catch (error) {
    console.error('[Backfill Sample Size] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to backfill sample_size and sample_type for approved studies',
    description: 'Extracts participant counts and classifies as human/animal/unknown',
    workflow: [
      '1. First run /api/admin/research/migrate-sample-type to ensure column exists',
      '2. Then POST to this endpoint to backfill existing studies',
      '3. New studies will auto-populate on approval'
    ]
  });
}
