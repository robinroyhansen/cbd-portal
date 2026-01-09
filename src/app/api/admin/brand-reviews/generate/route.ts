import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface GeneratedReview {
  scores: {
    criterion_id: string;
    score: number;
    reasoning: string;
  }[];
  summary: string;
  full_review: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

const SYSTEM_PROMPT = `You are an expert CBD product reviewer. Your task is to research and evaluate CBD brands based on their website content and generate comprehensive, honest reviews.

You will be given:
1. Brand information (name, website URL, description)
2. Website content from the brand's pages
3. Review criteria with max points for each

Your job is to:
1. Score each criterion based on evidence found in the website content
2. Write a professional, balanced review
3. Identify specific pros and cons
4. Provide a final verdict

SCORING GUIDELINES:
- Only give high scores if there's clear evidence on the website
- Be conservative - if information is missing, give moderate scores
- Look for: lab testing info, ingredient transparency, company background, customer reviews, certifications
- Deduct points for missing information, vague claims, or red flags

REVIEW STYLE:
- Professional but accessible
- Evidence-based - cite specific findings
- Balanced - acknowledge both strengths and weaknesses
- Helpful for consumers making purchase decisions

Return your response as valid JSON only, no markdown formatting.`;

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

    // Build the criteria prompt
    const criteriaPrompt = criteria.map(c => {
      const subcriteria = c.subcriteria?.map((s: { name: string; max_points: number }) =>
        `  - ${s.name} (${s.max_points} pts)`
      ).join('\n') || '';

      return `${c.name} (max ${c.max_points} points): ${c.description}
${subcriteria ? 'Subcriteria:\n' + subcriteria : ''}`;
    }).join('\n\n');

    // Build the user prompt
    const userPrompt = `Research and review this CBD brand:

BRAND: ${brand.name}
WEBSITE: ${brand.website_url || 'Not provided'}
${brand.short_description ? `DESCRIPTION: ${brand.short_description}` : ''}
${brand.headquarters_country ? `LOCATION: ${brand.headquarters_country}` : ''}
${brand.founded_year ? `FOUNDED: ${brand.founded_year}` : ''}

WEBSITE CONTENT:
${websiteContent}

REVIEW CRITERIA (score each one):
${criteriaPrompt}

Generate a comprehensive review. Return ONLY valid JSON in this exact format:
{
  "scores": [
    {"criterion_id": "${criteria[0].id}", "score": <number>, "reasoning": "<brief explanation>"},
    ... (one for each criterion)
  ],
  "summary": "<2-3 sentence overview for listing pages>",
  "full_review": "<detailed markdown review, 3-5 paragraphs>",
  "pros": ["<pro 1>", "<pro 2>", ...],
  "cons": ["<con 1>", "<con 2>", ...],
  "verdict": "<final recommendation, 2-3 sentences>"
}

Important:
- Scores must not exceed max points for each criterion
- Be honest and evidence-based
- If info is missing, mention it and score conservatively
- Include criterion IDs exactly as provided`;

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
        max_tokens: 4000,
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

      // Validate scores don't exceed max points
      const validatedScores = generated.scores.map(score => {
        const criterion = criteria.find(c => c.id === score.criterion_id);
        const maxPoints = criterion?.max_points || 0;
        return {
          ...score,
          score: Math.min(Math.max(0, score.score), maxPoints)
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          ...generated,
          scores: validatedScores
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
