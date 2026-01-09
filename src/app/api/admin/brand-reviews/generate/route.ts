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
}

const SYSTEM_PROMPT = `You are an experienced CBD industry expert who has personally tested and reviewed dozens of CBD brands. Write reviews in first person with a personal, authentic voice - like a trusted friend who happens to be an expert.

VOICE & TONE:
- First person perspective: "I've tested dozens of CBD brands, and..." / "In my experience..."
- Personal observations: "What struck me about this brand..." / "I was impressed by..."
- Expert opinions: "In my years reviewing CBD companies..." / "Here's what I look for..."
- Specific recommendations: "I'd recommend their full-spectrum oil for..." / "If you're new to CBD, start with..."
- Honest critiques: "Where they fall short is..." / "My main concern is..."
- Comparisons: "Compared to other brands I've reviewed..." / "This puts them in the top tier for..."
- Direct language: "Here's the bottom line..." / "Let me be real about..."

EXAMPLES OF GOOD WRITING:
Instead of: "The company demonstrates adequate transparency in their testing practices."
Write: "I was impressed by how easy it was to find their lab reports - something too many brands hide behind customer service requests."

Instead of: "Product variety meets industry standards."
Write: "Their product range covers all the basics, but I'd love to see more innovative formats like nano CBD or targeted formulas."

SCORING GUIDELINES:
- Score each sub-criterion individually - they must add up to the category total
- Only give high scores if there's clear evidence on the website
- Be conservative - if information is missing, give moderate/low scores
- If you can't find something, say so: "I couldn't find any lab reports on their site"

SECTION CONTENT:
For each scoring category, write 2-3 paragraphs of review text in first person. Do NOT include markdown headings or tables in the section text - just the prose explanation. The headings and sub-scores will be added automatically by the system.

Example section_content for "quality_testing":
"I was pleasantly surprised by how easy it was to find CBDistillery's lab reports. They've got batch-specific COAs from ProVerde Labs right on each product page - no hunting required. That's exactly what I want to see.

Where they lose points is on the recency of some reports. A few products I checked had COAs that were several months old. In my experience, the best brands update these quarterly at minimum. The extraction method isn't clearly stated either, which left me with a few unanswered questions about their process."

Return your response as valid JSON only, no markdown code blocks.`;

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

    if (!websiteContent) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch website content. Please ensure the brand has a valid website URL.'
      }, { status: 400 });
    }

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

    // Build the user prompt
    const userPrompt = `Research and review this CBD brand:

BRAND: ${brand.name}
WEBSITE: ${brand.website_url || 'Not provided'}
${brand.short_description ? `DESCRIPTION: ${brand.short_description}` : ''}
${brand.headquarters_country ? `LOCATION: ${brand.headquarters_country}` : ''}
${brand.founded_year ? `FOUNDED: ${brand.founded_year}` : ''}

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
          full_review: fullReview // Auto-generated from sections
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
