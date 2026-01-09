import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  calculateQualityScoreWithBreakdown,
  classifyQualityTier,
  QualityTier
} from '@/lib/quality-tiers';

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { dryRun = true } = await request.json().catch(() => ({ dryRun: true }));

    // Fetch all studies
    const { data: studies, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, authors, publication, year, url, doi, quality_score, quality_tier')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track score changes
    const results = {
      totalStudies: studies?.length || 0,
      scoreChanges: {
        increased: 0,
        decreased: 0,
        unchanged: 0
      },
      tierChanges: {
        upgraded: 0,
        downgraded: 0,
        unchanged: 0
      },
      tierDistribution: {
        before: {} as Record<string, number>,
        after: {} as Record<string, number>
      },
      averageScore: {
        before: 0,
        after: 0
      },
      sampleUpdates: [] as Array<{
        id: string;
        title: string;
        oldScore: number;
        newScore: number;
        scoreDiff: number;
        oldTier: string;
        newTier: string;
        breakdown: any;
      }>,
      updatedCount: 0
    };

    // Initialize tier distribution
    Object.values(QualityTier).forEach(tier => {
      results.tierDistribution.before[tier] = 0;
      results.tierDistribution.after[tier] = 0;
    });

    let totalOldScore = 0;
    let totalNewScore = 0;

    for (const study of studies || []) {
      const breakdown = calculateQualityScoreWithBreakdown(study);
      const newScore = breakdown.total;
      const newTier = classifyQualityTier(newScore);
      const oldScore = study.quality_score || 0;
      const oldTier = study.quality_tier || QualityTier.PRELIMINARY;

      totalOldScore += oldScore;
      totalNewScore += newScore;

      // Track tier distribution
      results.tierDistribution.before[oldTier] = (results.tierDistribution.before[oldTier] || 0) + 1;
      results.tierDistribution.after[newTier] = (results.tierDistribution.after[newTier] || 0) + 1;

      // Track score changes
      if (newScore > oldScore) {
        results.scoreChanges.increased++;
      } else if (newScore < oldScore) {
        results.scoreChanges.decreased++;
      } else {
        results.scoreChanges.unchanged++;
      }

      // Track tier changes
      const tierOrder = [
        QualityTier.PRELIMINARY,
        QualityTier.LIMITED_EVIDENCE,
        QualityTier.MODERATE_QUALITY,
        QualityTier.HIGH_QUALITY,
        QualityTier.GOLD_STANDARD
      ];
      const oldTierIndex = tierOrder.indexOf(oldTier as QualityTier);
      const newTierIndex = tierOrder.indexOf(newTier);

      if (newTierIndex > oldTierIndex) {
        results.tierChanges.upgraded++;
      } else if (newTierIndex < oldTierIndex) {
        results.tierChanges.downgraded++;
      } else {
        results.tierChanges.unchanged++;
      }

      // Collect samples with significant changes
      const scoreDiff = newScore - oldScore;
      if (Math.abs(scoreDiff) >= 5 && results.sampleUpdates.length < 20) {
        results.sampleUpdates.push({
          id: study.id,
          title: study.title?.substring(0, 80) + (study.title?.length > 80 ? '...' : ''),
          oldScore,
          newScore,
          scoreDiff,
          oldTier,
          newTier,
          breakdown
        });
      }

      // Update database if not dry run
      if (!dryRun) {
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({
            quality_score: newScore,
            quality_tier: newTier,
            score_breakdown: breakdown
          })
          .eq('id', study.id);

        if (!updateError) {
          results.updatedCount++;
        }
      }
    }

    // Calculate averages
    results.averageScore.before = Math.round(totalOldScore / (studies?.length || 1));
    results.averageScore.after = Math.round(totalNewScore / (studies?.length || 1));

    // Sort samples by absolute score difference
    results.sampleUpdates.sort((a, b) => Math.abs(b.scoreDiff) - Math.abs(a.scoreDiff));

    return NextResponse.json({
      success: true,
      dryRun,
      ...results
    });

  } catch (error) {
    console.error('Recalculation error:', error);
    return NextResponse.json({ error: 'Recalculation failed' }, { status: 500 });
  }
}

export async function GET() {
  // Run as dry run by default for GET requests
  const response = await POST(new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ dryRun: true })
  }));
  return response;
}
