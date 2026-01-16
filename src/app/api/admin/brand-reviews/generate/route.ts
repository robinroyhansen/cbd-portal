import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface SubScore {
  id: string;
  score: number;
}

interface GeneratedScore {
  criterion_id: string;
  score: number;
  sub_scores: SubScore[];
  reasoning: string;
}

interface GeneratedReview {
  scores: GeneratedScore[];
  summary: string;
  about_content: string;
  section_content: Record<string, string>;
  pros: string[];
  cons: string[];
  best_for: string[];
  not_ideal_for: string[];
  verdict: string;
  recommendation_status: 'recommended' | 'cautiously_recommended' | 'not_recommended';
  score_deviation_reason?: string;
  certifications?: string[];
}

// Track what data was successfully scraped
interface ScrapedDataReport {
  trustpilot: {
    success: boolean;
    score: number | null;
    count: number | null;
    url: string;
    method: 'json-ld' | 'regex' | 'none';
    error?: string;
  };
  website: {
    success: boolean;
    pages_fetched: string[];
    total_content_length: number;
    error?: string;
  };
  certifications: {
    detected: string[];
    source: 'website' | 'none';
  };
}

// Available certifications - International list
const CERTIFICATIONS = [
  { id: 'third_party_tested', name: 'Third-Party Tested', keywords: ['third party tested', 'third-party tested', 'independent lab', 'coa', 'certificate of analysis', 'lab tested'], market: 'all' },
  { id: 'gmp', name: 'GMP Certified', keywords: ['gmp', 'good manufacturing practice', 'cgmp', 'eu gmp'], market: 'all' },
  { id: 'iso_certified', name: 'ISO Certified', keywords: ['iso certified', 'iso 9001', 'iso 17025', 'iso certification'], market: 'all' },
  { id: 'non_gmo', name: 'Non-GMO', keywords: ['non-gmo', 'non gmo', 'no gmo', 'gmo free'], market: 'all' },
  { id: 'vegan', name: 'Vegan', keywords: ['vegan', 'plant-based', 'plant based'], market: 'all' },
  { id: 'cruelty_free', name: 'Cruelty-Free', keywords: ['cruelty free', 'cruelty-free', 'not tested on animals'], market: 'all' },
  { id: 'usda_organic', name: 'USDA Organic', keywords: ['usda organic'], market: 'US' },
  { id: 'us_hemp_authority', name: 'US Hemp Authority', keywords: ['us hemp authority', 'u.s. hemp authority'], market: 'US' },
  { id: 'eu_organic', name: 'EU Organic', keywords: ['eu organic', 'organic certified eu', 'bio', 'ecocert'], market: 'EU' },
  { id: 'novel_food', name: 'Novel Food Authorized', keywords: ['novel food', 'novel food authorized', 'fsa validated', 'fsa approved'], market: 'EU' },
];

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

const ALT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * Scrape Trustpilot data using multiple methods
 * Priority: 1. JSON-LD structured data, 2. HTML patterns, 3. Fail gracefully
 */
async function scrapeTrustpilot(websiteDomain: string): Promise<ScrapedDataReport['trustpilot']> {
  const trustpilotUrl = `https://www.trustpilot.com/review/${websiteDomain}`;

  try {
    console.log(`[Trustpilot] Scraping: ${trustpilotUrl}`);

    const response = await fetch(trustpilotUrl, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.log(`[Trustpilot] HTTP ${response.status} for ${websiteDomain}`);
      return {
        success: false,
        score: null,
        count: null,
        url: trustpilotUrl,
        method: 'none',
        error: `HTTP ${response.status}`
      };
    }

    const html = await response.text();
    console.log(`[Trustpilot] Got ${html.length} bytes of HTML`);

    // METHOD 1: Parse JSON-LD structured data (most reliable)
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
          const parsed = JSON.parse(jsonContent);

          // Handle array of JSON-LD objects
          const objects = Array.isArray(parsed) ? parsed : [parsed];

          for (const obj of objects) {
            // Look for Organization or LocalBusiness with aggregateRating
            if ((obj['@type'] === 'Organization' || obj['@type'] === 'LocalBusiness') && obj.aggregateRating) {
              const rating = obj.aggregateRating;
              const score = parseFloat(rating.ratingValue);
              const count = parseInt(rating.reviewCount, 10);

              if (!isNaN(score) && !isNaN(count)) {
                console.log(`[Trustpilot] JSON-LD found: ${score}/5 from ${count} reviews`);
                return {
                  success: true,
                  score,
                  count,
                  url: trustpilotUrl,
                  method: 'json-ld'
                };
              }
            }
          }
        } catch (e) {
          // Continue to next JSON-LD block
        }
      }
    }

    // METHOD 2: Parse HTML patterns as fallback
    // Trustpilot typically has rating in specific data attributes or visible elements
    const patterns = [
      // Data attribute patterns
      /data-rating="(\d+\.?\d*)"/i,
      // JSON patterns in page data
      /"ratingValue":\s*"?(\d+\.?\d*)"?/i,
      /"score":\s*(\d+\.?\d*)/i,
      // Text patterns
      /TrustScore\s*(\d+\.?\d*)/i,
    ];

    const countPatterns = [
      /"reviewCount":\s*"?(\d+,?\d*)"?/i,
      /"numberOfReviews":\s*"?(\d+,?\d*)"?/i,
      /(\d{1,3}(?:,\d{3})*)\s*(?:total\s+)?reviews?/i,
    ];

    let score: number | null = null;
    let count: number | null = null;

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const parsed = parseFloat(match[1]);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 5) {
          score = parsed;
          console.log(`[Trustpilot] Regex found score: ${score}`);
          break;
        }
      }
    }

    for (const pattern of countPatterns) {
      const match = html.match(pattern);
      if (match) {
        const parsed = parseInt(match[1].replace(/,/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) {
          count = parsed;
          console.log(`[Trustpilot] Regex found count: ${count}`);
          break;
        }
      }
    }

    if (score !== null && count !== null) {
      return {
        success: true,
        score,
        count,
        url: trustpilotUrl,
        method: 'regex'
      };
    }

    // Check if this is a "not found" page
    if (html.includes('We couldn\'t find') || html.includes('isn\'t on Trustpilot')) {
      console.log(`[Trustpilot] Brand not found on Trustpilot`);
      return {
        success: false,
        score: null,
        count: null,
        url: trustpilotUrl,
        method: 'none',
        error: 'Brand not found on Trustpilot'
      };
    }

    console.log(`[Trustpilot] Could not extract rating from page`);
    return {
      success: false,
      score: null,
      count: null,
      url: trustpilotUrl,
      method: 'none',
      error: 'Could not parse rating from page'
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Trustpilot] Error scraping ${websiteDomain}:`, errorMsg);
    return {
      success: false,
      score: null,
      count: null,
      url: trustpilotUrl,
      method: 'none',
      error: errorMsg
    };
  }
}

// Detect certifications from website content
function detectCertifications(websiteContent: string): string[] {
  const content = websiteContent.toLowerCase();
  const detected: string[] = [];

  for (const cert of CERTIFICATIONS) {
    if (cert.keywords.some(keyword => content.includes(keyword))) {
      detected.push(cert.id);
    }
  }

  return detected;
}

async function fetchSinglePage(pageUrl: string, headers: Record<string, string>): Promise<string | null> {
  try {
    const response = await fetch(pageUrl, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const html = await response.text();
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 10000);
      return textContent;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchWebsiteContent(url: string): Promise<{ content: string; pages: string[] }> {
  const urls = [
    url,
    url.replace(/\/$/, '') + '/about',
    url.replace(/\/$/, '') + '/about-us',
    url.replace(/\/$/, '') + '/lab-results',
    url.replace(/\/$/, '') + '/lab-reports',
    url.replace(/\/$/, '') + '/third-party-testing',
    url.replace(/\/$/, '') + '/certificates',
    url.replace(/\/$/, '') + '/pages/lab-results',
    url.replace(/\/$/, '') + '/pages/about',
  ];

  let combinedContent = '';
  const pagesFetched: string[] = [];

  for (const pageUrl of urls) {
    let content = await fetchSinglePage(pageUrl, BROWSER_HEADERS);
    if (!content) {
      content = await fetchSinglePage(pageUrl, ALT_HEADERS);
    }

    if (content && content.length > 100) {
      combinedContent += `\n\n--- Content from ${pageUrl} ---\n${content}`;
      pagesFetched.push(pageUrl);
    }
  }

  return {
    content: combinedContent.slice(0, 50000),
    pages: pagesFetched
  };
}

interface SubCriterion {
  id: string;
  name: string;
  max_points: number;
  description: string;
}

interface Criterion {
  id: string;
  name: string;
  description: string;
  max_points: number;
  subcriteria: SubCriterion[];
}

// System prompt that emphasizes factual accuracy
const SYSTEM_PROMPT = `You are a CBD industry expert writing reviews. Your reviews must be FACTUALLY ACCURATE.

CRITICAL DATA INTEGRITY RULES:
- You will be provided with VERIFIED DATA in the prompt (Trustpilot scores, certifications, etc.)
- ONLY use data that is explicitly provided to you
- If data says "NOT AVAILABLE" or "No data", do NOT mention it or make up alternatives
- NEVER invent, guess, or fabricate any statistics, scores, or numbers
- If you don't have data for something, simply don't mention it

INTERNATIONAL AWARENESS:
- Brands operate in different markets: US, EU, UK, Canada, Australia
- Use appropriate currency ($/€/£) based on brand's market
- Reference relevant regulations: Novel Food (EU/UK), FDA (US)

WRITING STYLE:
- Use contractions: "don't", "isn't", "they've", "I'd", "won't"
- Be specific with data you HAVE: "€0.06 per mg", "47 products"
- Mix sentence lengths. Short sentences punch.
- Be conversational: "Look," "Here's the thing," "Bottom line:"
- NEVER use hedging: "appears to", "seems to", "may be"
- NEVER start with "Additionally," "Furthermore," "Moreover,"

ABOUT CONTENT (REQUIRED):
Write a factual 3-4 sentence company background. This is NOT a review - just facts:
- When the company was founded (if known)
- Where they're headquartered (country/city if known)
- What products they specialize in
- Any notable certifications or focus areas (organic, vegan, etc.)
Example: "Raw Organics is a Swedish CBD company founded in 2018, headquartered in Stockholm. They specialize in handmade, vegan full-spectrum cannabis products including oils, gummies, and topicals. The company emphasizes organic ingredients and sustainable practices."

SECTION CONTENT:
Write 2-3 paragraphs per category. No markdown formatting - just prose.
Only mention data you were explicitly given. If Trustpilot data wasn't provided, don't mention Trustpilot at all.

Return valid JSON only, no markdown code blocks.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'ANTHROPIC_API_KEY not configured'
      }, { status: 500 });
    }

    const body = await request.json();
    const { brand_id, target_score_range, generation_instructions } = body;

    if (!brand_id) {
      return NextResponse.json({
        success: false,
        error: 'Brand ID is required'
      }, { status: 400 });
    }

    // Parse target score range if provided
    let targetMin: number | null = null;
    let targetMax: number | null = null;
    if (target_score_range) {
      const [min, max] = target_score_range.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        targetMin = min;
        targetMax = max;
      }
    }

    const supabase = createServiceClient();

    // Fetch brand info
    const { data: brand, error: brandError } = await supabase
      .from('kb_brands')
      .select('*')
      .eq('id', brand_id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({
        success: false,
        error: 'Brand not found'
      }, { status: 404 });
    }

    // Fetch review criteria
    const { data: criteria, error: criteriaError } = await supabase
      .from('kb_review_criteria')
      .select('*')
      .order('display_order', { ascending: true });

    if (criteriaError || !criteria?.length) {
      return NextResponse.json({
        success: false,
        error: 'Review criteria not found'
      }, { status: 500 });
    }

    // Initialize data report
    const dataReport: ScrapedDataReport = {
      trustpilot: { success: false, score: null, count: null, url: '', method: 'none' },
      website: { success: false, pages_fetched: [], total_content_length: 0 },
      certifications: { detected: [], source: 'none' }
    };

    // Extract domain from URL
    let websiteDomain = '';
    try {
      const url = new URL(brand.website_url);
      websiteDomain = url.hostname.replace('www.', '');
    } catch {
      websiteDomain = brand.website_domain || '';
    }

    // Fetch website content
    let websiteContent = '';
    if (brand.website_url) {
      const result = await fetchWebsiteContent(brand.website_url);
      websiteContent = result.content;
      dataReport.website = {
        success: result.content.length > 500,
        pages_fetched: result.pages,
        total_content_length: result.content.length
      };
    }

    // Scrape Trustpilot data
    if (websiteDomain) {
      dataReport.trustpilot = await scrapeTrustpilot(websiteDomain);
    }

    // Detect certifications from website content
    if (websiteContent.length > 0) {
      const detected = detectCertifications(websiteContent);
      dataReport.certifications = {
        detected,
        source: detected.length > 0 ? 'website' : 'none'
      };
    }

    console.log('[DataReport]', JSON.stringify(dataReport, null, 2));

    // Build detailed criteria prompt with all sub-criteria
    const criteriaPrompt = (criteria as Criterion[]).map(c => {
      const subcriteriaList = c.subcriteria?.map((s: SubCriterion) =>
        `    - ${s.id}: "${s.name}" (max ${s.max_points} pts) - ${s.description}`
      ).join('\n') || '';

      return `${c.id}: "${c.name}" (max ${c.max_points} points total)
  Description: ${c.description}
  Sub-criteria (score each one):
${subcriteriaList}`;
    }).join('\n\n');

    // Build JSON structure for expected response
    const scoresStructure = (criteria as Criterion[]).map(c => {
      const subScoresStructure = c.subcriteria?.map((s: SubCriterion) =>
        `{"id": "${s.id}", "score": <0-${s.max_points}>}`
      ).join(', ') || '';

      return `{
      "criterion_id": "${c.id}",
      "score": <total 0-${c.max_points}>,
      "sub_scores": [${subScoresStructure}],
      "reasoning": "<1-2 sentence explanation>"
    }`;
    }).join(',\n    ');

    // Build VERIFIED DATA section - be explicit about what we have and don't have
    const verifiedDataLines: string[] = [];
    verifiedDataLines.push('=== VERIFIED DATA (USE ONLY THIS DATA) ===');

    // Trustpilot - explicit about availability
    if (dataReport.trustpilot.success && dataReport.trustpilot.score !== null) {
      verifiedDataLines.push(`TRUSTPILOT: ${dataReport.trustpilot.score} out of 5 from ${dataReport.trustpilot.count?.toLocaleString()} reviews (VERIFIED - mention as "${dataReport.trustpilot.score} out of 5 Trustpilot rating" in Customer Experience section)`);
    } else {
      verifiedDataLines.push(`TRUSTPILOT: NOT AVAILABLE - DO NOT mention Trustpilot in the review at all`);
    }

    // Certifications
    if (dataReport.certifications.detected.length > 0) {
      const certNames = dataReport.certifications.detected.map(id =>
        CERTIFICATIONS.find(c => c.id === id)?.name
      ).filter(Boolean);
      verifiedDataLines.push(`CERTIFICATIONS (VERIFIED): ${certNames.join(', ')}`);
    } else {
      verifiedDataLines.push(`CERTIFICATIONS: None detected - only mention certifications if visible in website content below`);
    }

    // Website data availability
    if (dataReport.website.success) {
      verifiedDataLines.push(`WEBSITE DATA: Available (${dataReport.website.pages_fetched.length} pages fetched)`);
    } else {
      verifiedDataLines.push(`WEBSITE DATA: Limited - score conservatively for transparency/lab reports`);
    }

    // Brand info
    if (brand.headquarters_country) {
      verifiedDataLines.push(`LOCATION (VERIFIED): ${brand.headquarters_country}`);
    }
    if (brand.founded_year) {
      verifiedDataLines.push(`FOUNDED (VERIFIED): ${brand.founded_year}`);
    }

    verifiedDataLines.push('===========================================');

    // Build the user prompt
    const userPrompt = `Review this CBD brand using ONLY the verified data provided below.

BRAND: ${brand.name}
WEBSITE: ${brand.website_url || 'Not provided'}
${brand.short_description ? `DESCRIPTION: ${brand.short_description}` : ''}

${verifiedDataLines.join('\n')}

WEBSITE CONTENT (for reference - extract facts from here):
${websiteContent || 'Limited content available.'}

REVIEW CRITERIA - Score EACH sub-criterion:
${criteriaPrompt}
${targetMin !== null && targetMax !== null ? `
TARGET SCORE RANGE: ${targetMin}-${targetMax}
Generate scores within this range. If evidence doesn't support this range, include "score_deviation_reason".
` : ''}${generation_instructions ? `
ADDITIONAL INSTRUCTIONS: ${generation_instructions}
` : ''}
IMPORTANT REMINDERS:
- The "score" for each criterion MUST equal the sum of its sub_scores
- Each sub_score must not exceed its max_points
- Write section_content for EACH of the 9 categories (keyed by criterion_id)
- ONLY mention Trustpilot if marked as VERIFIED above
- ONLY mention certifications that are VERIFIED above
- DO NOT invent any statistics, ratings, or numerical data

Return ONLY valid JSON in this exact format:
{
  "scores": [
    ${scoresStructure}
  ],
  "summary": "<2-3 sentence overview>",
  "about_content": "<3-4 factual sentences: company background, founded year, location, products, certifications - NO opinions>",
  "section_content": {
    "<criterion_id_1>": "<2-3 paragraphs>",
    ... (one entry for each of the 9 criteria)
  },
  "pros": ["<specific pro>", ...],
  "cons": ["<specific con>", ...],
  "best_for": ["<user type>", ...],
  "not_ideal_for": ["<user type>", ...],
  "verdict": "<150+ words final recommendation>",
  "recommendation_status": "<recommended | cautiously_recommended | not_recommended>",
  "score_deviation_reason": "<ONLY if couldn't meet target range>"
}`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return NextResponse.json({
        success: false,
        error: 'AI generation failed. Please try again.'
      }, { status: 500 });
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text?.trim();

    if (!responseText) {
      return NextResponse.json({
        success: false,
        error: 'Empty response from AI'
      }, { status: 500 });
    }

    // Parse the JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const generated: GeneratedReview = JSON.parse(jsonMatch[0]);

      // Validate and fix scores
      const validatedScores = generated.scores.map(score => {
        const criterion = (criteria as Criterion[]).find(c => c.id === score.criterion_id);
        if (!criterion) return score;

        const validatedSubScores = (score.sub_scores || []).map(subScore => {
          const subCriterion = criterion.subcriteria?.find(s => s.id === subScore.id);
          const maxPoints = subCriterion?.max_points || 0;
          return {
            ...subScore,
            score: Math.min(Math.max(0, subScore.score), maxPoints)
          };
        });

        const calculatedTotal = validatedSubScores.reduce((sum, s) => sum + s.score, 0);
        const maxPoints = criterion.max_points;

        return {
          ...score,
          sub_scores: validatedSubScores,
          score: Math.min(calculatedTotal, maxPoints)
        };
      });

      const overallScore = validatedScores.reduce((sum, s) => sum + s.score, 0);

      // Generate full_review from sections
      const fullReview = (criteria as Criterion[]).map(c => {
        const score = validatedScores.find(s => s.criterion_id === c.id);
        const sectionText = generated.section_content?.[c.id] || '';
        const totalScore = score?.score || 0;
        return `## ${c.name} — ${totalScore}/${c.max_points}\n\n${sectionText}`;
      }).join('\n\n');

      // Auto-generate SEO meta fields
      // META TITLE: 50-58 chars, format: "[Brand] CBD Review [Year]: [Short Hook]"
      // META DESC: 140-152 chars, start with hook, mention quality/testing/verdict
      const currentYear = new Date().getFullYear();
      const brandNameLen = brand.name.length;

      // Generate title variants that fit within 50-58 chars
      // Base format: "[Brand] CBD Review [Year]: [Hook]" = brand + ~25 chars for " CBD Review 2026: "
      // So hook should be ~(50-25-brand) to ~(58-25-brand) chars
      const titleHooks = [
        'Worth Your Money?',        // 17 chars
        'Legit or Hype?',           // 14 chars
        'Quality Tested',           // 14 chars
        'Our Verdict',              // 11 chars
        'Honest Review',            // 13 chars
      ];

      // Pick hook based on brand name length to stay within limits
      let hookIndex = 0;
      const baseLen = brandNameLen + 18; // " CBD Review 2026: " = 18 chars
      if (baseLen + 17 <= 58) hookIndex = 0; // Can fit longest hook
      else if (baseLen + 14 <= 58) hookIndex = 1;
      else if (baseLen + 13 <= 58) hookIndex = 4;
      else hookIndex = 3; // Shortest hook

      const metaTitle = `${brand.name} CBD Review ${currentYear}: ${titleHooks[hookIndex]}`;

      // Generate description variants that fit within 140-152 chars
      const descVariants = [
        `Is ${brand.name} CBD worth it? We tested their products, verified lab reports, and analyzed customer feedback. Read our independent verdict.`,
        `${brand.name} CBD review: We examine product quality, third-party testing, and real customer experiences. See if this brand delivers.`,
        `Considering ${brand.name} CBD? Our expert review covers lab testing, product quality, and value. Find out if they meet our standards.`,
      ];

      // Pick description that fits within limits
      let metaDescription = descVariants[0];
      for (const desc of descVariants) {
        if (desc.length >= 140 && desc.length <= 152) {
          metaDescription = desc;
          break;
        }
        if (desc.length <= 152) {
          metaDescription = desc;
        }
      }

      // Build warning messages
      const warnings: string[] = [];

      if (!dataReport.trustpilot.success) {
        warnings.push(`Trustpilot: ${dataReport.trustpilot.error || 'Could not scrape'}`);
      }
      if (!dataReport.website.success) {
        warnings.push('Website data was limited. Scores may be conservative.');
      }
      if (generated.score_deviation_reason) {
        warnings.push(`Score deviation: ${generated.score_deviation_reason}`);
      } else if (targetMin !== null && targetMax !== null) {
        if (overallScore < targetMin || overallScore > targetMax) {
          warnings.push(`Generated score (${overallScore}) is outside target range (${targetMin}-${targetMax}).`);
        }
      }

      return NextResponse.json({
        success: true,
        warning: warnings.length > 0 ? warnings.join(' | ') : undefined,
        data_report: dataReport, // Include full data report for transparency
        data: {
          ...generated,
          scores: validatedScores,
          overall_score: overallScore,
          section_content: generated.section_content || {},
          full_review: fullReview,
          about_content: generated.about_content || null,
          best_for: generated.best_for || [],
          not_ideal_for: generated.not_ideal_for || [],
          recommendation_status: generated.recommendation_status || 'recommended',
          target_score_range: target_score_range || null,
          generation_instructions: generation_instructions || null,
          // Use ONLY scraped data, never AI-generated
          trustpilot_score: dataReport.trustpilot.score,
          trustpilot_count: dataReport.trustpilot.count,
          trustpilot_url: dataReport.trustpilot.success ? dataReport.trustpilot.url : null,
          certifications: dataReport.certifications.detected,
          meta_title: metaTitle,
          meta_description: metaDescription
        }
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, responseText);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Review generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
