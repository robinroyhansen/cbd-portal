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
  about_content: string; // Factual intro about the brand
  section_content: Record<string, string>; // { criterion_id: "section text..." }
  pros: string[];
  cons: string[];
  best_for: string[]; // User types this brand is good for
  not_ideal_for: string[]; // User types this brand is not good for
  verdict: string;
  recommendation_status: 'recommended' | 'cautiously_recommended' | 'not_recommended';
  score_deviation_reason?: string; // Only if AI couldn't meet target score
  trustpilot_score?: number;
  trustpilot_count?: number;
  google_score?: number;
  google_count?: number;
  certifications?: string[];
}

// Available certifications - International list
const CERTIFICATIONS = [
  // Universal certifications
  { id: 'third_party_tested', name: 'Third-Party Tested', keywords: ['third party tested', 'third-party tested', 'independent lab', 'coa', 'certificate of analysis', 'lab tested'], market: 'all' },
  { id: 'gmp', name: 'GMP Certified', keywords: ['gmp', 'good manufacturing practice', 'cgmp', 'eu gmp'], market: 'all' },
  { id: 'iso_certified', name: 'ISO Certified', keywords: ['iso certified', 'iso 9001', 'iso 17025', 'iso certification'], market: 'all' },
  { id: 'non_gmo', name: 'Non-GMO', keywords: ['non-gmo', 'non gmo', 'no gmo', 'gmo free'], market: 'all' },
  { id: 'vegan', name: 'Vegan', keywords: ['vegan', 'plant-based', 'plant based'], market: 'all' },
  { id: 'cruelty_free', name: 'Cruelty-Free', keywords: ['cruelty free', 'cruelty-free', 'not tested on animals'], market: 'all' },
  // US-specific
  { id: 'usda_organic', name: 'USDA Organic', keywords: ['usda organic'], market: 'US' },
  { id: 'us_hemp_authority', name: 'US Hemp Authority', keywords: ['us hemp authority', 'u.s. hemp authority'], market: 'US' },
  // EU/UK-specific
  { id: 'eu_organic', name: 'EU Organic', keywords: ['eu organic', 'organic certified eu', 'bio', 'ecocert'], market: 'EU' },
  { id: 'novel_food', name: 'Novel Food Authorized', keywords: ['novel food', 'novel food authorized', 'fsa validated', 'fsa approved'], market: 'EU' },
];

// Browser-like headers to avoid being blocked
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

// Alternative headers if first attempt fails
const ALT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Fetch Trustpilot data (works globally)
async function fetchTrustpilotData(brandName: string, websiteDomain: string): Promise<{ score: number; count: number; url: string } | null> {
  try {
    // Try to fetch Trustpilot page
    const trustpilotUrl = `https://www.trustpilot.com/review/${websiteDomain}`;
    const response = await fetch(trustpilotUrl, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract rating from Trustpilot page - multiple patterns
    const scoreMatch = html.match(/TrustScore[^\d]*(\d+\.?\d*)/i) ||
                       html.match(/"ratingValue":\s*"?(\d+\.?\d*)"?/i) ||
                       html.match(/data-rating="(\d+\.?\d*)"/i) ||
                       html.match(/"score":\s*(\d+\.?\d*)/i);

    const countMatch = html.match(/"numberOfReviews":\s*"?(\d+,?\d*)"?/i) ||
                       html.match(/"reviewCount":\s*"?(\d+,?\d*)"?/i) ||
                       html.match(/(\d+,?\d*)\s*reviews?/i);

    if (scoreMatch && countMatch) {
      return {
        score: parseFloat(scoreMatch[1]),
        count: parseInt(countMatch[1].replace(/,/g, ''), 10),
        url: trustpilotUrl
      };
    }
    return null;
  } catch {
    return null;
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

const SYSTEM_PROMPT = `You are a CBD industry expert who has reviewed hundreds of CBD brands globally. Write like a real human reviewer - confident, opinionated, and specific.

INTERNATIONAL AWARENESS:
- Brands operate in different markets: US, EU, UK, Canada, Australia
- Use appropriate currency ($/€/£) based on brand's market
- Reference relevant regulations: Novel Food (EU/UK), FDA (US)
- Certifications vary by market: USDA Organic (US), EU Organic (EU), etc.
- Compare prices relative to that market, not globally

CRITICAL WRITING RULES - NEVER DO THESE:
- NEVER say "I couldn't access" or "I couldn't verify"
- NEVER mention "content provided" or "available content"
- NEVER use "based on my analysis" or "upon review" or "it's worth noting"
- NEVER start sentences with "However," "Additionally," "Furthermore," "Moreover,"
- NEVER use hedging: "appears to", "seems to", "may be", "could be"
- NEVER overuse hyphens or em-dashes

WRITE LIKE A HUMAN:
- Use contractions: "don't", "isn't", "they've", "I'd", "won't"
- Be specific: "€0.06 per mg", "47 products", "founded in 2016"
- Mix sentence lengths. Short sentences punch.
- Have opinions: "This is one of the better testing pages I've seen"
- Be conversational: "Look," "Here's the thing," "Bottom line:"
- Reference specific things: product names, lab names, prices

ABOUT CONTENT:
Write a factual 2-3 sentence intro about the brand. Include: when founded, where based, what they're known for. No opinions, just facts.

BEST FOR / NOT IDEAL FOR:
Be specific about user types:
- Best for: "Budget-conscious first-time users", "Athletes seeking recovery products"
- Not ideal for: "Those wanting THC-free options only", "People needing high-potency products"

VERDICT:
Write 150+ words. Be definitive. Give a clear recommendation with specific reasons.

RECOMMENDATION STATUS:
- "recommended": Score 60+, no major concerns
- "cautiously_recommended": Score 40-59 or has some concerns
- "not_recommended": Score <40 or serious issues

SECTION CONTENT:
Write 2-3 paragraphs per category. No markdown formatting, no tables, no headers - just prose.

Return valid JSON only, no markdown code blocks.`;

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

async function fetchWebsiteContent(url: string): Promise<string | null> {
  try {
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

    for (const pageUrl of urls) {
      // Try with primary headers first
      let content = await fetchSinglePage(pageUrl, BROWSER_HEADERS);

      // If failed, try with alternative headers
      if (!content) {
        content = await fetchSinglePage(pageUrl, ALT_HEADERS);
      }

      if (content && content.length > 100) {
        combinedContent += `\n\n--- Content from ${pageUrl} ---\n${content}`;
      }
    }

    return combinedContent.slice(0, 50000) || null;
  } catch (error) {
    console.error('Error fetching website:', error);
    return null;
  }
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

    // Fetch website content
    let websiteContent = '';
    let websiteAccessible = true;
    if (brand.website_url) {
      websiteContent = await fetchWebsiteContent(brand.website_url) || '';
    }

    // Soft requirement - warn but don't block if we have other data sources
    const hasLimitedWebsiteData = !websiteContent || websiteContent.trim().length < 500;
    if (hasLimitedWebsiteData) {
      websiteAccessible = false;
      console.log(`Warning: Limited website content for ${brand.name}. Will use available data.`);
    }

    // Extract domain from URL for Trustpilot lookup
    let websiteDomain = '';
    try {
      const url = new URL(brand.website_url);
      websiteDomain = url.hostname.replace('www.', '');
    } catch {
      websiteDomain = brand.website_domain || '';
    }

    // Fetch Trustpilot data in parallel with AI generation
    const trustpilotPromise = fetchTrustpilotData(brand.name, websiteDomain);

    // Detect certifications from website content
    const detectedCertifications = detectCertifications(websiteContent);

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

    // Wait for Trustpilot data
    const trustpilotData = await trustpilotPromise;

    // Build certification info for prompt
    const certificationInfo = detectedCertifications.length > 0
      ? `DETECTED CERTIFICATIONS: ${detectedCertifications.map(id => CERTIFICATIONS.find(c => c.id === id)?.name).join(', ')}`
      : 'DETECTED CERTIFICATIONS: None found';

    // Build Trustpilot info for prompt
    const trustpilotInfo = trustpilotData
      ? `TRUSTPILOT: ${trustpilotData.score}/5 from ${trustpilotData.count.toLocaleString()} reviews`
      : 'TRUSTPILOT: No data found';

    // Build website access warning
    const websiteWarning = !websiteAccessible
      ? `\nNOTE: Website was difficult to access during research. Score conservatively for areas that require website verification (transparency, lab reports). Focus on what IS available: Trustpilot data, brand description, and any content that was accessible. DO NOT mention access issues in the review text - write as if you researched the brand normally, just be conservative with scores.`
      : '';

    // Build the user prompt
    const userPrompt = `Research and review this CBD brand:

BRAND: ${brand.name}
WEBSITE: ${brand.website_url || 'Not provided'}
${brand.short_description ? `DESCRIPTION: ${brand.short_description}` : ''}
${brand.headquarters_country ? `LOCATION: ${brand.headquarters_country}` : ''}
${brand.founded_year ? `FOUNDED: ${brand.founded_year}` : ''}

${trustpilotInfo}
${certificationInfo}${websiteWarning}

WEBSITE CONTENT:
${websiteContent || 'Limited content available - use brand description and Trustpilot data.'}

REVIEW CRITERIA - Score EACH sub-criterion individually:
${criteriaPrompt}
${targetMin !== null && targetMax !== null ? `
AUTHOR'S TARGET SCORE: ${targetMin}-${targetMax}
The reviewing author has assessed this brand and determined it should score in the ${targetMin}-${targetMax} range based on their research and expertise. Generate scores that total within this range.

Important targeting guidelines:
- All facts must be accurate and verifiable from the provided content
- Distribute sub-scores proportionally to reach the target total
- If you cannot find facts to support this score range, include a "score_deviation_reason" field in your response explaining why
- Frame the review to reflect the author's editorial judgment while maintaining factual accuracy
- If the evidence strongly contradicts the target range, generate honest scores and explain in score_deviation_reason
` : ''}${generation_instructions ? `
ADDITIONAL INSTRUCTIONS FROM AUTHOR:
${generation_instructions}
` : ''}
IMPORTANT:
- The "score" for each criterion MUST equal the sum of its sub_scores
- Each sub_score must not exceed its max_points
- Write section_content for EACH of the 9 categories (keyed by criterion_id)
- Each section should be 2-3 paragraphs of prose - NO markdown headings or tables
- The prose should explain WHY you gave those scores, with specific findings
- For the "customer_experience" section, ALWAYS mention the Trustpilot rating if available (e.g., "${brand.name} has a X/5 rating on Trustpilot from Y reviews...")
- NEVER mention "couldn't access" or "limited data" - write confidently about what you found

Return ONLY valid JSON in this exact format:
{
  "scores": [
    ${scoresStructure}
  ],
  "summary": "<2-3 sentence overview for listing pages - personal voice>",
  "about_content": "<2-3 factual sentences about the brand: when founded, where based, what they're known for>",
  "section_content": {
    "<criterion_id_1>": "<2-3 paragraphs explaining this category's scores>",
    "<criterion_id_2>": "<2-3 paragraphs explaining this category's scores>",
    ... (one entry for each of the 9 criteria)
  },
  "pros": ["<specific pro 1>", "<specific pro 2>", "<specific pro 3>", ...],
  "cons": ["<specific con 1>", "<specific con 2>", ...],
  "best_for": ["<specific user type 1>", "<specific user type 2>", ...],
  "not_ideal_for": ["<specific user type 1>", "<specific user type 2>", ...],
  "verdict": "<final recommendation in personal voice, 150+ words>",
  "recommendation_status": "<recommended | cautiously_recommended | not_recommended>",
  "score_deviation_reason": "<ONLY include if you could not meet the target score range - explain why>"
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
        max_tokens: 8000, // Increased for detailed review
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
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
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const generated: GeneratedReview = JSON.parse(jsonMatch[0]);

      // Validate and fix scores
      const validatedScores = generated.scores.map(score => {
        const criterion = (criteria as Criterion[]).find(c => c.id === score.criterion_id);
        if (!criterion) return score;

        // Validate sub_scores
        const validatedSubScores = (score.sub_scores || []).map(subScore => {
          const subCriterion = criterion.subcriteria?.find(s => s.id === subScore.id);
          const maxPoints = subCriterion?.max_points || 0;
          return {
            ...subScore,
            score: Math.min(Math.max(0, subScore.score), maxPoints)
          };
        });

        // Calculate total from sub_scores
        const calculatedTotal = validatedSubScores.reduce((sum, s) => sum + s.score, 0);
        const maxPoints = criterion.max_points;

        return {
          ...score,
          sub_scores: validatedSubScores,
          score: Math.min(calculatedTotal, maxPoints) // Use calculated total, capped at max
        };
      });

      // Calculate overall score
      const overallScore = validatedScores.reduce((sum, s) => sum + s.score, 0);

      // Generate full_review from sections for backward compatibility
      const fullReview = (criteria as Criterion[]).map(c => {
        const score = validatedScores.find(s => s.criterion_id === c.id);
        const sectionText = generated.section_content?.[c.id] || '';
        const totalScore = score?.score || 0;

        return `## ${c.name} — ${totalScore}/${c.max_points}\n\n${sectionText}`;
      }).join('\n\n');

      // Auto-generate SEO meta fields
      const currentYear = new Date().getFullYear();
      const metaTitle = `${brand.name} Review ${currentYear} - Score ${overallScore}/100`;
      const metaDescription = `Independent ${brand.name} review with ${overallScore}/100 score. We analyze quality, testing, transparency, pricing and more. See full breakdown.`;

      // Build warning message
      const warnings: string[] = [];
      if (!websiteAccessible) {
        warnings.push('Website was difficult to access. Scores may be conservative.');
      }
      if (generated.score_deviation_reason) {
        warnings.push(`Target score adjustment: ${generated.score_deviation_reason}`);
      } else if (targetMin !== null && targetMax !== null) {
        // Check if score fell outside target range
        if (overallScore < targetMin || overallScore > targetMax) {
          warnings.push(`Generated score (${overallScore}) is outside the target range (${targetMin}-${targetMax}). Review the scores and adjust if needed.`);
        }
      }

      return NextResponse.json({
        success: true,
        warning: warnings.length > 0 ? warnings.join(' ') : undefined,
        data: {
          ...generated,
          scores: validatedScores,
          overall_score: overallScore,
          section_content: generated.section_content || {},
          full_review: fullReview, // Auto-generated from sections
          about_content: generated.about_content || null,
          best_for: generated.best_for || [],
          not_ideal_for: generated.not_ideal_for || [],
          recommendation_status: generated.recommendation_status || 'recommended',
          target_score_range: target_score_range || null,
          generation_instructions: generation_instructions || null,
          trustpilot_score: trustpilotData?.score || null,
          trustpilot_count: trustpilotData?.count || null,
          trustpilot_url: trustpilotData?.url || null,
          certifications: detectedCertifications,
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
