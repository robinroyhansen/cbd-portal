import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Backfill country data for research studies
 * - Sets country = 'US' for ClinicalTrials.gov studies
 * - Extracts country from text for other studies
 *
 * Run with: curl -X POST https://cbd-portal.vercel.app/api/admin/research/backfill-countries
 */

const countryPatterns = [
  { pattern: /\bClinicalTrials\.gov\b/i, code: 'US' },
  { pattern: /\b(United States|USA|U\.S\.A?\.?|American)\b/i, code: 'US' },
  { pattern: /\b(United Kingdom|UK|Britain|British|England|Scotland|Wales)\b/i, code: 'GB' },
  { pattern: /\b(Germany|German|Deutschland|Berlin|Munich)\b/i, code: 'DE' },
  { pattern: /\b(Australia|Australian|Sydney|Melbourne)\b/i, code: 'AU' },
  { pattern: /\b(Canada|Canadian|Toronto|Vancouver)\b/i, code: 'CA' },
  { pattern: /\b(France|French|Paris)\b/i, code: 'FR' },
  { pattern: /\b(Italy|Italian|Rome|Milan)\b/i, code: 'IT' },
  { pattern: /\b(Spain|Spanish|Madrid|Barcelona)\b/i, code: 'ES' },
  { pattern: /\b(Netherlands|Dutch|Amsterdam)\b/i, code: 'NL' },
  { pattern: /\b(Switzerland|Swiss|Zurich|Geneva)\b/i, code: 'CH' },
  { pattern: /\b(Israel|Israeli|Tel Aviv)\b/i, code: 'IL' },
  { pattern: /\b(Japan|Japanese|Tokyo)\b/i, code: 'JP' },
  { pattern: /\b(China|Chinese|Beijing|Shanghai)\b/i, code: 'CN' },
  { pattern: /\b(Brazil|Brazilian|Sao Paulo)\b/i, code: 'BR' },
  { pattern: /\b(Poland|Polish|Warsaw)\b/i, code: 'PL' },
  { pattern: /\b(Sweden|Swedish|Stockholm)\b/i, code: 'SE' },
  { pattern: /\b(Denmark|Danish|Copenhagen)\b/i, code: 'DK' },
  { pattern: /\b(Norway|Norwegian|Oslo)\b/i, code: 'NO' },
  { pattern: /\b(Finland|Finnish|Helsinki)\b/i, code: 'FI' },
  { pattern: /\b(Austria|Austrian|Vienna)\b/i, code: 'AT' },
  { pattern: /\b(Belgium|Belgian|Brussels)\b/i, code: 'BE' },
  { pattern: /\b(Ireland|Irish|Dublin)\b/i, code: 'IE' },
  { pattern: /\b(New Zealand|Kiwi|Auckland)\b/i, code: 'NZ' },
  { pattern: /\b(South Korea|Korean|Seoul)\b/i, code: 'KR' },
  { pattern: /\b(India|Indian|Mumbai|Delhi)\b/i, code: 'IN' },
];

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all approved studies
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, source_site, country')
      .eq('status', 'approved');

    if (fetchError) {
      console.error('[Backfill Countries] Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const results = { updated: 0, skipped: 0, noMatch: 0 };
    const updates: { id: string; country: string }[] = [];

    for (const study of studies || []) {
      // Skip if already has country
      if (study.country) {
        results.skipped++;
        continue;
      }

      let detectedCountry: string | null = null;

      // Check source first (ClinicalTrials.gov = US)
      if (study.source_site?.toLowerCase().includes('clinicaltrials')) {
        detectedCountry = 'US';
      } else {
        // Check title + abstract for country patterns
        const text = `${study.title || ''} ${study.abstract || ''} ${study.source_site || ''}`;

        for (const { pattern, code } of countryPatterns) {
          if (pattern.test(text)) {
            detectedCountry = code;
            break;
          }
        }
      }

      if (detectedCountry) {
        updates.push({ id: study.id, country: detectedCountry });
        results.updated++;
      } else {
        results.noMatch++;
      }
    }

    // Batch update
    for (const { id, country } of updates) {
      const { error: updateError } = await supabase
        .from('kb_research_queue')
        .update({ country })
        .eq('id', id);

      if (updateError) {
        console.error(`[Backfill Countries] Update error for ${id}:`, updateError);
      }
    }

    console.log('[Backfill Countries] Complete:', results);

    return NextResponse.json({
      success: true,
      ...results,
      total: studies?.length || 0,
    });

  } catch (error) {
    console.error('[Backfill Countries] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to backfill country data for research studies',
    description: 'Sets country = US for ClinicalTrials.gov studies, extracts country from text for others',
  });
}
