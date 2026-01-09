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
  section_content: Record<string, string>; // { criterion_id: "section text..." }
  pros: string[];
  cons: string[];
  verdict: string;
  trustpilot_score?: number;
  trustpilot_count?: number;
  google_score?: number;
  google_count?: number;
  certifications?: string[];
}

// Available certifications
const CERTIFICATIONS = [
  { id: 'gmp', name: 'GMP Certified', keywords: ['gmp', 'good manufacturing practice'] },
  { id: 'usda_organic', name: 'USDA Organic', keywords: ['usda organic', 'certified organic'] },
  { id: 'us_hemp_authority', name: 'US Hemp Authority', keywords: ['us hemp authority', 'u.s. hemp authority'] },
  { id: 'third_party_tested', name: 'Third-Party Tested', keywords: ['third party tested', 'third-party tested', 'independent lab', 'coa', 'certificate of analysis'] },
  { id: 'non_gmo', name: 'Non-GMO', keywords: ['non-gmo', 'non gmo', 'no gmo'] },
  { id: 'vegan', name: 'Vegan', keywords: ['vegan', 'plant-based'] },
  { id: 'cruelty_free', name: 'Cruelty-Free', keywords: ['cruelty free', 'cruelty-free', 'not tested on animals'] },
  { id: 'iso_certified', name: 'ISO Certified', keywords: ['iso certified', 'iso 9001', 'iso certification'] },
];

// Fetch Trustpilot data
async function fetchTrustpilotData(brandName: string, websiteDomain: string): Promise<{ score: number; count: number } | null> {
  try {
    // Try to fetch Trustpilot page
    const searchUrl = `https://www.trustpilot.com/review/${websiteDomain}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CBDPortal/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract rating from Trustpilot page
    const scoreMatch = html.match(/TrustScore[^\d]*(\d+\.?\d*)/i) ||
                       html.match(/"ratingValue":\s*"?(\d+\.?\d*)"?/i) ||
                       html.match(/data-rating="(\d+\.?\d*)"/i);

    const countMatch = html.match(/(\d+,?\d*)\s*reviews?/i) ||
                       html.match(/"reviewCount":\s*"?(\d+,?\d*)"?/i);

    if (scoreMatch && countMatch) {
      return {
        score: parseFloat(scoreMatch[1]),
        count: parseInt(countMatch[1].replace(/,/g, ''), 10)
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

const SYSTEM_PROMPT = `You are a CBD industry expert who has personally tested hundreds of CBD products. Write like a real human reviewer - confident, opinionated, and specific.

CRITICAL WRITING RULES - NEVER DO THESE:
- NEVER say "I couldn't access" or "I couldn't verify" - you HAVE researched this brand
- NEVER mention "content provided" or "available content" or "based on the information"
- NEVER use "based on my analysis" or "upon review" or "it's worth noting"
- NEVER start sentences with "However," "Additionally," "Furthermore," "Moreover,"
- NEVER use hedging: "appears to", "seems to", "may be", "could be"
- NEVER overuse hyphens or em-dashes
- NEVER write generic filler like "in today's CBD market" or "as a consumer"

WRITE LIKE A HUMAN:
- Use contractions: "don't", "isn't", "they've", "I'd", "won't"
- Be specific with numbers: "$0.08 per mg", "47 products", "founded in 2016"
- Mix sentence lengths. Short sentences punch. Longer ones explain the nuance and give context.
- Have opinions: "This is one of the better testing pages I've seen" or "Frankly, this isn't good enough"
- Be conversational: "Look," "Here's the thing," "Bottom line:"
- Reference specific things you saw: product names, page sections, lab names

GOOD EXAMPLES:
"Their lab reports come from ProVerde Labs and they're easy to find - just click the COA link on any product page. I checked three different products and each had current, batch-specific results."

"Pricing sits at $0.07 per mg for their 1000mg tincture. That's competitive, especially with free shipping over $75."

"The site's a bit cluttered, but the product pages have everything you need: dosing info, ingredients, and lab results all in one place."

BAD EXAMPLES (never write like this):
"Based on the available information, the brand appears to demonstrate adequate commitment to quality."
"I couldn't access their website to verify these claims, which is concerning."
"Additionally, it's worth noting that their pricing seems competitive in the current market."

SCORING:
- Score based on what you found during research
- Be specific about WHY you gave each score
- Reference actual things: lab names, certifications, specific products, prices

SECTION CONTENT:
Write 2-3 paragraphs per category. No markdown formatting, no tables, no headers, no score breakdowns - just prose.

Return valid JSON only, no markdown code blocks.`;

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
    ];

    let combinedContent = '';

    for (const pageUrl of urls) {
      try {
        const response = await fetch(pageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CBDPortal/1.0; +https://cbd-portal.vercel.app)',
            'Accept': 'text/html,application/xhtml+xml',
          },
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

          combinedContent += `\n\n--- Content from ${pageUrl} ---\n${textContent}`;
        }
      } catch {
        // Continue to next URL
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
    const { brand_id } = body;

    if (!brand_id) {
      return NextResponse.json({
        success: false,
        error: 'Brand ID is required'
      }, { status: 400 });
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
    if (brand.website_url) {
      websiteContent = await fetchWebsiteContent(brand.website_url) || '';
    }

    if (!websiteContent || websiteContent.trim().length < 500) {
      return NextResponse.json({
        success: false,
        error: 'Could not access brand website. Please try again later or add review information manually. Reviews cannot be generated without proper website research.'
      }, { status: 400 });
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

    // Build the user prompt
    const userPrompt = `Research and review this CBD brand:

BRAND: ${brand.name}
WEBSITE: ${brand.website_url || 'Not provided'}
${brand.short_description ? `DESCRIPTION: ${brand.short_description}` : ''}
${brand.headquarters_country ? `LOCATION: ${brand.headquarters_country}` : ''}
${brand.founded_year ? `FOUNDED: ${brand.founded_year}` : ''}

${trustpilotInfo}
${certificationInfo}

WEBSITE CONTENT:
${websiteContent}

REVIEW CRITERIA - Score EACH sub-criterion individually:
${criteriaPrompt}

IMPORTANT:
- The "score" for each criterion MUST equal the sum of its sub_scores
- Each sub_score must not exceed its max_points
- Write section_content for EACH of the 9 categories (keyed by criterion_id)
- Each section should be 2-3 paragraphs of prose - NO markdown headings or tables
- The prose should explain WHY you gave those scores, with specific findings
- For the "customer_experience" section, ALWAYS mention the Trustpilot rating if available (e.g., "${brand.name} has a X/5 rating on Trustpilot from Y reviews...")

Return ONLY valid JSON in this exact format:
{
  "scores": [
    ${scoresStructure}
  ],
  "summary": "<2-3 sentence overview for listing pages - personal voice>",
  "section_content": {
    "<criterion_id_1>": "<2-3 paragraphs explaining this category's scores>",
    "<criterion_id_2>": "<2-3 paragraphs explaining this category's scores>",
    ... (one entry for each of the 9 criteria)
  },
  "pros": ["<specific pro 1>", "<specific pro 2>", "<specific pro 3>", ...],
  "cons": ["<specific con 1>", "<specific con 2>", ...],
  "verdict": "<final recommendation in personal voice, 2-3 sentences>"
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

      // Generate full_review from sections for backward compatibility
      const fullReview = (criteria as Criterion[]).map(c => {
        const score = validatedScores.find(s => s.criterion_id === c.id);
        const sectionText = generated.section_content?.[c.id] || '';
        const totalScore = score?.score || 0;

        return `## ${c.name} — ${totalScore}/${c.max_points}\n\n${sectionText}`;
      }).join('\n\n');

      return NextResponse.json({
        success: true,
        data: {
          ...generated,
          scores: validatedScores,
          section_content: generated.section_content || {},
          full_review: fullReview, // Auto-generated from sections
          trustpilot_score: trustpilotData?.score || null,
          trustpilot_count: trustpilotData?.count || null,
          certifications: detectedCertifications
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
