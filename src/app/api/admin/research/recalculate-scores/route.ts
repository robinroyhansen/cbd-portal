import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateRelevance, ScoreBreakdown } from '@/lib/research-scanner';

interface StudyForRecalc {
  id: string;
  title: string;
  abstract: string | null;
  year: number | null;
}

export async function POST() {
  try {
    const supabase = createServiceClient();

    // Get all studies
    const { data: studies, error: studiesError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, year');

    if (studiesError) {
      console.error('Error fetching studies:', studiesError);
      return NextResponse.json({ error: 'Failed to fetch studies' }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({ updated: 0, message: 'No studies to recalculate' });
    }

    let updated = 0;
    let errors = 0;
    const scoreDistribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    // Process in batches
    const batchSize = 50;
    for (let i = 0; i < studies.length; i += batchSize) {
      const batch = studies.slice(i, i + batchSize);

      for (const study of batch) {
        const { score, topics, breakdown } = calculateRelevance({
          title: study.title,
          abstract: study.abstract || undefined,
          year: study.year || undefined,
          url: '', // Required by interface but not used in scoring
          source_site: '',
        });

        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({
            relevance_score: score,
            relevant_topics: topics,
            score_breakdown: breakdown,
          })
          .eq('id', study.id);

        if (updateError) {
          console.error(`Error updating study ${study.id}:`, updateError);
          errors++;
        } else {
          updated++;

          // Track distribution
          if (score <= 20) scoreDistribution['0-20']++;
          else if (score <= 40) scoreDistribution['21-40']++;
          else if (score <= 60) scoreDistribution['41-60']++;
          else if (score <= 80) scoreDistribution['61-80']++;
          else scoreDistribution['81-100']++;
        }
      }

      console.log(`[Recalculate] Processed ${Math.min(i + batchSize, studies.length)} of ${studies.length} studies`);
    }

    return NextResponse.json({
      updated,
      errors,
      total: studies.length,
      distribution: scoreDistribution,
      message: `Recalculated ${updated} study scores (${errors} errors)`,
    });
  } catch (error) {
    console.error('Error recalculating scores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
