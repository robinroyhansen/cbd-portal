import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Backfill country data for research studies
 *
 * Strategies:
 * 1. OpenAlex studies: Fetch from API using DOI
 * 2. PubMed studies: Fetch affiliations via efetch API
 * 3. Fallback: Pattern matching on text (title, abstract, authors)
 *
 * Query params:
 * - source: Filter by source (openalex, pubmed, all)
 * - limit: Max records to process (default: 100)
 * - dryRun: Preview only, don't update (default: false)
 */

const COUNTRY_PATTERNS: { pattern: RegExp; code: string }[] = [
  { pattern: /\b(United States|USA|U\.S\.A?\.?)\b/i, code: 'US' },
  { pattern: /\b(United Kingdom|Britain|England|Scotland|Wales)\b/i, code: 'GB' },
  { pattern: /\bUK\b/, code: 'GB' }, // Case sensitive to avoid false positives
  { pattern: /\b(Germany|Deutschland)\b/i, code: 'DE' },
  { pattern: /\bGerman\b/i, code: 'DE' },
  { pattern: /\b(Australia|Australian)\b/i, code: 'AU' },
  { pattern: /\b(Canada|Canadian)\b/i, code: 'CA' },
  { pattern: /\b(France|French)\b/i, code: 'FR' },
  { pattern: /\b(Italy|Italian)\b/i, code: 'IT' },
  { pattern: /\b(Spain|Spanish)\b/i, code: 'ES' },
  { pattern: /\b(Netherlands|Dutch)\b/i, code: 'NL' },
  { pattern: /\b(Switzerland|Swiss)\b/i, code: 'CH' },
  { pattern: /\b(Israel|Israeli)\b/i, code: 'IL' },
  { pattern: /\b(Japan|Japanese)\b/i, code: 'JP' },
  { pattern: /\b(China|Chinese)\b/i, code: 'CN' },
  { pattern: /\b(Brazil|Brazilian)\b/i, code: 'BR' },
  { pattern: /\b(Poland|Polish)\b/i, code: 'PL' },
  { pattern: /\b(Sweden|Swedish)\b/i, code: 'SE' },
  { pattern: /\b(Denmark|Danish)\b/i, code: 'DK' },
  { pattern: /\b(Norway|Norwegian)\b/i, code: 'NO' },
  { pattern: /\b(Finland|Finnish)\b/i, code: 'FI' },
  { pattern: /\b(Austria|Austrian)\b/i, code: 'AT' },
  { pattern: /\b(Belgium|Belgian)\b/i, code: 'BE' },
  { pattern: /\b(Ireland|Irish)\b/i, code: 'IE' },
  { pattern: /\bNew Zealand\b/i, code: 'NZ' },
  { pattern: /\b(South Korea|Korean)\b/i, code: 'KR' },
  { pattern: /\b(India|Indian)\b/i, code: 'IN' },
  { pattern: /\bPortugal\b/i, code: 'PT' },
  { pattern: /\bGreece\b/i, code: 'GR' },
  { pattern: /\b(Czech|Czechia)\b/i, code: 'CZ' },
  { pattern: /\b(Hungary|Hungarian)\b/i, code: 'HU' },
  { pattern: /\b(Romania|Romanian)\b/i, code: 'RO' },
  { pattern: /\b(Turkey|Turkish)\b/i, code: 'TR' },
  { pattern: /\b(Russia|Russian)\b/i, code: 'RU' },
  { pattern: /\b(Mexico|Mexican)\b/i, code: 'MX' },
  { pattern: /\b(Argentina|Argentine)\b/i, code: 'AR' },
  { pattern: /\b(Colombia|Colombian)\b/i, code: 'CO' },
  { pattern: /\bSouth Africa\b/i, code: 'ZA' },
];

function extractCountryFromText(text: string): string | null {
  for (const { pattern, code } of COUNTRY_PATTERNS) {
    if (pattern.test(text)) {
      return code;
    }
  }
  return null;
}

async function fetchOpenAlexCountry(doi: string): Promise<string | null> {
  try {
    const url = `https://api.openalex.org/works/doi:${doi}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CBD-Portal/1.0 (mailto:contact@cbdportal.com)'
      }
    });

    if (!response.ok) return null;

    const work = await response.json();

    // Extract country from authorships
    for (const authorship of (work.authorships || [])) {
      if (authorship.countries?.length > 0) {
        return authorship.countries[0];
      }
      if (authorship.institutions?.[0]?.country_code) {
        return authorship.institutions[0].country_code;
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchPubMedAffiliations(pmid: string): Promise<string | null> {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml&rettype=abstract`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const xml = await response.text();

    // Extract affiliations from XML
    const affiliationMatches = xml.match(/<Affiliation>([^<]+)<\/Affiliation>/g);
    if (affiliationMatches) {
      const affiliationText = affiliationMatches
        .map(m => m.replace(/<\/?Affiliation>/g, ''))
        .join(' ');
      return extractCountryFromText(affiliationText);
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchPmcAffiliations(pmcId: string): Promise<string | null> {
  try {
    // Use Europe PMC API (returns JSON with affiliations)
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=PMCID:${pmcId}&format=json&resultType=core`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    const article = data.resultList?.result?.[0];

    if (article?.affiliation) {
      return extractCountryFromText(article.affiliation);
    }

    // Try author affiliations
    if (article?.authorList?.author) {
      const affiliations = article.authorList.author
        .map((a: { affiliation?: string }) => a.affiliation)
        .filter(Boolean)
        .join(' ');
      if (affiliations) return extractCountryFromText(affiliations);
    }

    return null;
  } catch {
    return null;
  }
}

function extractPmidFromUrl(url: string): string | null {
  const match = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
  return match ? match[1] : null;
}

function extractPmcIdFromUrl(url: string): string | null {
  const match = url.match(/PMC(\d+)/);
  return match ? `PMC${match[1]}` : null;
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceFilter = searchParams.get('source') || 'all';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const dryRun = searchParams.get('dryRun') === 'true';

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query for studies missing country
    let query = supabase
      .from('kb_research_queue')
      .select('id, title, abstract, authors, source_site, doi, url, country')
      .is('country', null)
      .limit(limit);

    // Filter by source if specified
    if (sourceFilter === 'openalex') {
      query = query.eq('source_site', 'OpenAlex');
    } else if (sourceFilter === 'pubmed') {
      query = query.eq('source_site', 'PubMed');
    } else if (sourceFilter === 'pmc') {
      query = query.eq('source_site', 'PMC');
    }

    const { data: studies, error: fetchError } = await query;

    if (fetchError) {
      console.error('[Backfill Countries] Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const results = {
      processed: 0,
      updated: 0,
      apiMatches: 0,
      textMatches: 0,
      noMatch: 0,
      errors: 0,
      updates: [] as { id: string; title: string; country: string; source: string }[]
    };

    for (const study of studies || []) {
      results.processed++;
      let detectedCountry: string | null = null;
      let matchSource = '';

      // Strategy 1: OpenAlex API for studies with DOI
      if (study.doi && (study.source_site === 'OpenAlex' || sourceFilter === 'all')) {
        detectedCountry = await fetchOpenAlexCountry(study.doi);
        if (detectedCountry) {
          matchSource = 'openalex-api';
          results.apiMatches++;
        }
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Strategy 2: PubMed efetch for PubMed studies
      if (!detectedCountry && study.source_site === 'PubMed') {
        const pmid = extractPmidFromUrl(study.url);
        if (pmid) {
          detectedCountry = await fetchPubMedAffiliations(pmid);
          if (detectedCountry) {
            matchSource = 'pubmed-api';
            results.apiMatches++;
          }
          // Rate limit - NCBI requires max 3 req/sec without API key
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }

      // Strategy 3: Europe PMC API for PMC studies
      if (!detectedCountry && study.source_site === 'PMC') {
        const pmcId = extractPmcIdFromUrl(study.url);
        if (pmcId) {
          detectedCountry = await fetchPmcAffiliations(pmcId);
          if (detectedCountry) {
            matchSource = 'europepmc-api';
            results.apiMatches++;
          }
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Strategy 4: Text pattern matching fallback
      if (!detectedCountry) {
        const text = `${study.authors || ''} ${study.title || ''} ${study.abstract || ''}`;
        detectedCountry = extractCountryFromText(text);
        if (detectedCountry) {
          matchSource = 'text-pattern';
          results.textMatches++;
        }
      }

      if (detectedCountry) {
        results.updates.push({
          id: study.id,
          title: study.title?.substring(0, 60) || 'Unknown',
          country: detectedCountry,
          source: matchSource
        });
        results.updated++;

        if (!dryRun) {
          const { error: updateError } = await supabase
            .from('kb_research_queue')
            .update({ country: detectedCountry })
            .eq('id', study.id);

          if (updateError) {
            console.error(`[Backfill] Update error for ${study.id}:`, updateError);
            results.errors++;
          }
        }
      } else {
        results.noMatch++;
      }
    }

    console.log('[Backfill Countries] Complete:', {
      processed: results.processed,
      updated: results.updated,
      apiMatches: results.apiMatches,
      textMatches: results.textMatches,
      noMatch: results.noMatch,
      dryRun
    });

    return NextResponse.json({
      success: true,
      dryRun,
      sourceFilter,
      ...results
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
    description: 'Fetches country from OpenAlex API (via DOI), PubMed efetch (via PMID), Europe PMC API (via PMC ID), or text pattern matching',
    strategies: [
      '1. OpenAlex API - uses DOI to fetch author country codes',
      '2. PubMed efetch - uses PMID to fetch author affiliations',
      '3. Europe PMC API - uses PMC ID to fetch affiliations',
      '4. Text pattern matching - fallback using authors/title/abstract'
    ],
    usage: {
      dryRun: '?dryRun=true - Preview matches without updating',
      source: '?source=openalex|pubmed|pmc|all - Filter by source',
      limit: '?limit=100 - Max records to process (default: 100)'
    },
    examples: [
      'POST ?dryRun=true&source=openalex&limit=10',
      'POST ?source=pubmed&limit=50',
      'POST ?source=pmc&limit=100',
      'POST ?limit=200'
    ]
  });
}
