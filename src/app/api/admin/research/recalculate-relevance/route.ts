import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { calculateRelevanceScore } from '@/lib/utils/relevance-scorer';

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createServiceClient();

    const { data: studies, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract');

    if (error || !studies) {
      return NextResponse.json({ error: 'Failed to fetch studies' }, { status: 500 });
    }

    let updated = 0;
    const distribution = {
      high: 0,     // 70+
      medium: 0,   // 40-69
      low: 0,      // 20-39
      irrelevant: 0 // <20
    };

    const scores: number[] = [];

    for (const study of studies) {
      const result = calculateRelevanceScore({
        title: study.title || '',
        abstract: study.abstract || ''
      });

      scores.push(result.score);
      distribution[result.category]++;

      const { error: updateError } = await supabase
        .from('kb_research_queue')
        .update({
          relevance_score: result.score,
          relevance_signals: result.signals
        })
        .eq('id', study.id);

      if (!updateError) {
        updated++;
      }
    }

    // Calculate stats
    const sortedScores = scores.sort((a, b) => a - b);
    const stats = {
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      median: sortedScores[Math.floor(sortedScores.length / 2)],
      min: sortedScores[0],
      max: sortedScores[sortedScores.length - 1]
    };

    return NextResponse.json({
      updated,
      total: studies.length,
      distribution,
      stats,
      summary: {
        highRelevance: distribution.high,
        mediumRelevance: distribution.medium,
        lowRelevance: distribution.low,
        irrelevant: distribution.irrelevant
      },
      message: `Recalculated relevance for ${updated} studies`
    });
  } catch (error) {
    console.error('Recalculate relevance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
// Preview without updating
    const supabase = createServiceClient();

    const { data: studies } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract')
      .limit(100);

    if (!studies) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    const samples: {
      title: string;
      score: number;
      category: string;
      signals: string[];
    }[] = [];
    const distribution = { high: 0, medium: 0, low: 0, irrelevant: 0 };

    for (const study of studies) {
      const result = calculateRelevanceScore({
        title: study.title || '',
        abstract: study.abstract || ''
      });

      distribution[result.category]++;

      // Include some samples from each category
      if (samples.filter(s => s.category === result.category).length < 3) {
        samples.push({
          title: study.title?.slice(0, 80) || '',
          score: result.score,
          category: result.category,
          signals: result.signals
        });
      }
    }

    return NextResponse.json({
      preview: true,
      sampled: studies.length,
      distribution,
      samples
    });
  } catch (error) {
    console.error('Preview relevance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
