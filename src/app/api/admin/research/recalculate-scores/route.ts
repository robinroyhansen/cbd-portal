import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { calculateQualityScore } from '@/lib/research-scanner';

function getBucket(score: number): string {
  if (score <= 10) return '0-10';
  if (score <= 20) return '11-20';
  if (score <= 30) return '21-30';
  if (score <= 40) return '31-40';
  if (score <= 50) return '41-50';
  if (score <= 60) return '51-60';
  if (score <= 70) return '61-70';
  if (score <= 80) return '71-80';
  if (score <= 90) return '81-90';
  return '91-100';
}

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createServiceClient();

    // Get ALL studies
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
    const allScores: number[] = [];
    const distribution: Record<string, number> = {
      '0-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0,
      '61-70': 0,
      '71-80': 0,
      '81-90': 0,
      '91-100': 0,
    };

    // Process all studies
    for (const study of studies) {
      const { score, topics, breakdown } = calculateQualityScore({
        title: study.title,
        abstract: study.abstract || undefined,
        year: study.year || undefined,
        url: '',
        source_site: '',
      });

      const { error: updateError } = await supabase
        .from('kb_research_queue')
        .update({
          quality_score: score,
          relevant_topics: topics,
          quality_breakdown: breakdown,
        })
        .eq('id', study.id);

      if (!updateError) {
        updated++;
        allScores.push(score);
        const bucket = getBucket(score);
        distribution[bucket]++;
      }
    }

    // Calculate stats
    const sortedScores = [...allScores].sort((a, b) => a - b);
    const stats = {
      average: allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0,
      median: allScores.length > 0 ? sortedScores[Math.floor(sortedScores.length / 2)] : 0,
      min: allScores.length > 0 ? Math.min(...allScores) : 0,
      max: allScores.length > 0 ? Math.max(...allScores) : 0,
    };

    console.log(`[Recalculate] Completed: ${updated}/${studies.length} studies, avg=${stats.average}, range=${stats.min}-${stats.max}`);

    return NextResponse.json({
      success: true,
      updated,
      total: studies.length,
      distribution,
      stats,
    });
  } catch (error) {
    console.error('Error recalculating scores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
