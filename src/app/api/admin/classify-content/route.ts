import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/admin-api-auth';

/**
 * POST /api/admin/classify-content
 * Classify studies by content type (medical, legal, economic, agricultural, other)
 *
 * Query params:
 *   ?status=pending|approved|all (default: all)
 *   ?dryRun=true (preview without updating)
 *   ?limit=1000 (max studies to process)
 */

// Classification keywords
const LEGAL_KEYWORDS = {
  strong: [
    'legalization', 'legislation', 'decriminalization',
    'criminal justice', 'drug policy', 'cannabis policy', 'marijuana policy',
    'legal status', 'prohibition', 'drug law', 'controlled substance act',
    'descheduling', 'law enforcement', 'prosecution', 'incarceration',
    'cannabis law', 'marijuana law', 'drug enforcement'
  ],
  moderate: [
    'legal framework', 'policy reform', 'criminal penalty', 'drug court',
    'sentencing', 'arrest rate', 'conviction rate', 'possession charge',
    'drug offense', 'cannabis regulation'
  ]
};

const ECONOMIC_KEYWORDS = {
  strong: [
    'market analysis', 'economic impact', 'cannabis industry', 'marijuana market',
    'dispensary business', 'retail cannabis', 'cannabis business',
    'tax revenue', 'market size', 'industry growth', 'cannabis investment',
    'supply chain analysis', 'price analysis', 'market dynamics',
    'commercial cannabis market', 'cannabis entrepreneurship'
  ],
  moderate: [
    'economic analysis', 'market research', 'cannabis commerce', 'cannabis trade',
    'dispensary sales', 'retail sales data', 'commercial production'
  ]
};

const AGRICULTURAL_KEYWORDS = {
  strong: [
    'hemp cultivation', 'cannabis cultivation', 'crop yield',
    'hemp fiber', 'industrial hemp production', 'hemp seed oil',
    'phytoremediation', 'soil contamination', 'crop production',
    'hemp farming', 'cannabis harvest', 'outdoor cultivation',
    'hemp textile', 'fiber extraction', 'hemp biomass'
  ],
  moderate: [
    'cultivation technique', 'growing condition', 'plant breeding',
    'agronomic trait', 'seed production', 'biomass yield',
    'hemp processing', 'fiber quality'
  ]
};

const MEDICAL_KEYWORDS = {
  strong: [
    'clinical trial', 'randomized controlled', 'double-blind', 'placebo-controlled',
    'therapeutic', 'treatment outcome', 'patients with', 'efficacy', 'safety profile',
    'pharmacokinetics', 'pharmacodynamics', 'dose-response', 'adverse events',
    'medical cannabis', 'medicinal cannabis', 'pain management', 'symptom relief',
    'disease', 'disorder', 'syndrome', 'diagnosis', 'prognosis',
    'pilot study', 'cohort study', 'case study', 'prospective study', 'retrospective',
    'breast milk', 'plasma concentration', 'blood concentration', 'serum level',
    'bioavailability', 'metabolism', 'receptor', 'endocannabinoid'
  ],
  moderate: [
    'patient', 'therapy', 'clinical', 'health outcome', 'symptom',
    'pain', 'anxiety', 'depression', 'epilepsy', 'cancer', 'inflammation',
    'nausea', 'appetite', 'sleep', 'cognitive', 'neurological',
    'treatment', 'dosing', 'tolerability', 'side effect'
  ]
};

function classifyContent(title: string, abstract: string): { type: string; confidence: string } {
  const text = `${title || ''} ${abstract || ''}`.toLowerCase();

  // Pre-filter: Check if this is about "Central Business District"
  const cbdBusinessPatterns = [
    'cbd development', 'cbd of ', 'major cbds', 'urban cbd', 'city cbd',
    'cbd area', 'downtown cbd', 'cbd planning', 'commercial cbd'
  ];
  if (cbdBusinessPatterns.some(p => text.includes(p))) {
    return { type: 'other', confidence: 'high' };
  }

  // Pre-filter: Clear medical indicators in title
  const titleLower = (title || '').toLowerCase();
  const clearMedicalTitlePatterns = [
    'fetal', 'prenatal', 'pregnancy', 'pregnant', 'perinatal', 'neonatal',
    'patients', 'clinical trial', 'randomized', 'placebo',
    'treatment of', 'therapy for', 'efficacy of', 'effect on',
    'in children', 'in adults', 'in humans', 'in mice', 'in rats',
    'pharmacokinetics', 'pharmacodynamics', 'bioavailability',
    'brain', 'cognitive', 'behavioral', 'psychiatric', 'neurological'
  ];
  if (clearMedicalTitlePatterns.some(p => titleLower.includes(p))) {
    return { type: 'medical', confidence: 'high' };
  }

  const scores = { medical: 0, legal: 0, economic: 0, agricultural: 0 };

  function scoreCategory(keywords: { strong: string[]; moderate: string[] }, category: keyof typeof scores) {
    for (const kw of keywords.strong) {
      if (text.includes(kw.toLowerCase())) scores[category] += 3;
    }
    for (const kw of keywords.moderate) {
      if (text.includes(kw.toLowerCase())) scores[category] += 1;
    }
  }

  scoreCategory(MEDICAL_KEYWORDS, 'medical');
  scoreCategory(LEGAL_KEYWORDS, 'legal');
  scoreCategory(ECONOMIC_KEYWORDS, 'economic');
  scoreCategory(AGRICULTURAL_KEYWORDS, 'agricultural');

  // Strong medical signal = definitely medical
  if (scores.medical >= 3) {
    return { type: 'medical', confidence: 'high' };
  }

  // Any medical signal with no strong non-medical = medical
  if (scores.medical >= 1) {
    const nonMedicalMax = Math.max(scores.legal, scores.economic, scores.agricultural);
    if (nonMedicalMax > scores.medical * 3 && nonMedicalMax >= 4) {
      if (scores.legal === nonMedicalMax) return { type: 'legal', confidence: 'high' };
      if (scores.economic === nonMedicalMax) return { type: 'economic', confidence: 'high' };
      if (scores.agricultural === nonMedicalMax) return { type: 'agricultural', confidence: 'high' };
    }
    return { type: 'medical', confidence: 'medium' };
  }

  // No medical signal - classify by strongest non-medical
  if (scores.legal >= 3) return { type: 'legal', confidence: 'high' };
  if (scores.economic >= 3) return { type: 'economic', confidence: 'high' };
  if (scores.agricultural >= 3) return { type: 'agricultural', confidence: 'high' };
  if (scores.legal >= 1) return { type: 'legal', confidence: 'low' };
  if (scores.economic >= 1) return { type: 'economic', confidence: 'low' };
  if (scores.agricultural >= 1) return { type: 'agricultural', confidence: 'low' };

  return { type: 'other', confidence: 'low' };
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const targetStatus = searchParams.get('status') || 'all';
    const dryRun = searchParams.get('dryRun') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10000');

    // Check if content_type column exists
    const { error: columnCheck } = await supabase
      .from('kb_research_queue')
      .select('content_type')
      .limit(1);

    if (columnCheck) {
      return NextResponse.json({
        error: 'content_type column does not exist',
        instructions: 'Run the SQL in supabase/migrations/APPLY_NOW.sql first'
      }, { status: 400 });
    }

    // Fetch studies
    let query = supabase
      .from('kb_research_queue')
      .select('id, title, abstract, status')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (targetStatus !== 'all') {
      query = query.eq('status', targetStatus);
    }

    const { data: studies, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Classify each study
    const results: Record<string, { ids: string[]; count: number }> = {
      medical: { ids: [], count: 0 },
      legal: { ids: [], count: 0 },
      economic: { ids: [], count: 0 },
      agricultural: { ids: [], count: 0 },
      other: { ids: [], count: 0 }
    };

    for (const study of studies || []) {
      const { type } = classifyContent(study.title, study.abstract);
      results[type].ids.push(study.id);
      results[type].count++;
    }

    // Update database if not dry run
    if (!dryRun) {
      for (const [type, data] of Object.entries(results)) {
        if (data.ids.length === 0) continue;

        // Update in batches of 500
        for (let i = 0; i < data.ids.length; i += 500) {
          const batch = data.ids.slice(i, i + 500);
          await supabase
            .from('kb_research_queue')
            .update({ content_type: type })
            .in('id', batch);
        }
      }
    }

    // Build summary
    const summary: Record<string, number> = {};
    for (const [type, data] of Object.entries(results)) {
      summary[type] = data.count;
    }

    return NextResponse.json({
      mode: dryRun ? 'dry-run' : 'applied',
      studiesProcessed: studies?.length || 0,
      classification: summary,
      nonMedicalCount: summary.legal + summary.economic + summary.agricultural
    });

  } catch (error) {
    console.error('[Classify Content] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    usage: 'POST /api/admin/classify-content',
    params: {
      status: 'pending | approved | all (default: all)',
      dryRun: 'true | false (default: false)',
      limit: 'number (default: 10000)'
    },
    description: 'Classifies studies as medical, legal, economic, agricultural, or other based on title/abstract analysis'
  });
}
