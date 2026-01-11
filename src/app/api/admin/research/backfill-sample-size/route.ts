import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSampleSize } from '@/lib/utils/extract-sample-size';

/**
 * Backfill sample_size for existing approved studies
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
      .select('id, title, abstract, plain_summary, sample_size')
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
      examples: [] as { title: string; sampleSize: number }[],
    };

    for (const study of studies || []) {
      // Skip if already has valid sample_size
      if (study.sample_size && study.sample_size > 0) {
        results.alreadySet++;
        continue;
      }

      const sampleSize = extractSampleSize(study.title, study.abstract, study.plain_summary);

      if (sampleSize) {
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({ sample_size: sampleSize })
          .eq('id', study.id);

        if (!updateError) {
          results.updated++;
          // Store first 5 examples
          if (results.examples.length < 5) {
            results.examples.push({
              title: study.title?.substring(0, 60) + '...',
              sampleSize,
            });
          }
        }
      } else {
        results.skipped++;
      }
    }

    // Get totals for verification
    const { data: withSize } = await supabase
      .from('kb_research_queue')
      .select('sample_size')
      .eq('status', 'approved')
      .not('sample_size', 'is', null)
      .gt('sample_size', 0);

    const totalParticipants = withSize?.reduce((sum, s) => sum + (s.sample_size || 0), 0) || 0;

    console.log('[Backfill Sample Size] Complete:', results);

    return NextResponse.json({
      success: true,
      ...results,
      studiesWithSampleSize: withSize?.length || 0,
      totalParticipants,
      displayValue: totalParticipants >= 1000
        ? `${Math.floor(totalParticipants / 1000)}K+`
        : `${totalParticipants}+`,
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
    message: 'POST to this endpoint to backfill sample_size for approved studies',
    description: 'Extracts participant counts from title, abstract, and plain_summary',
  });
}
