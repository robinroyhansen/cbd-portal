import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

type ToneType = 'very_critical' | 'critical' | 'balanced' | 'positive' | 'very_positive';

interface SubScore {
  id: string;
  score: number;
}

interface AdjustSectionRequest {
  brand_id: string;
  criterion_id: string;
  criterion_name: string;
  old_score: number;
  new_score: number;
  max_points: number;
  sub_scores: SubScore[];
  current_text: string;
  tone: ToneType;
}

const TONE_PROMPTS: Record<ToneType, string> = {
  very_critical: "Be harsh but fair. Point out every flaw and limitation. Express disappointment where warranted. Don't sugarcoat issues - be direct about problems. However, remain professional and factual.",
  critical: "Focus on weaknesses and areas for improvement while briefly acknowledging any minor positives. Maintain a skeptical, scrutinizing perspective. Point out what's missing or could be better.",
  balanced: "Be objective and fair. Weigh positives and negatives equally based on the evidence. Present both strengths and weaknesses honestly without bias in either direction.",
  positive: "Focus on strengths and achievements while briefly noting minor areas for improvement. Maintain an encouraging tone that highlights what the brand does well.",
  very_positive: "Be enthusiastic about what the brand excels at. Highlight excellence and noteworthy achievements. Mention any negatives only briefly and constructively. Express genuine appreciation for strong points."
};

const SYSTEM_PROMPT = `You are an experienced CBD industry expert who writes authentic, first-person reviews. Your task is to rewrite a section of a brand review to match updated scores.

VOICE & TONE:
- First person perspective: "I found...", "In my experience...", "What impressed me..."
- Personal observations with specific examples
- Expert opinions backed by evidence from the brand's website/products
- Honest and direct language

IMPORTANT:
- The section you're rewriting MUST reflect the NEW scores, not the old ones
- If the score decreased, explain what factors led to the lower rating
- If the score increased, explain what the brand does well to earn the higher rating
- Reference specific sub-scores in your explanation
- Maintain the same approximate length as the original text
- Keep the same markdown structure (headings, tables if present, paragraphs)

Return ONLY the rewritten section text, no additional commentary or JSON wrapping.`;

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'ANTHROPIC_API_KEY not configured'
      }, { status: 500 });
    }

    const body: AdjustSectionRequest = await request.json();
    const {
      brand_id,
      criterion_id,
      criterion_name,
      old_score,
      new_score,
      max_points,
      sub_scores,
      current_text,
      tone = 'balanced'
    } = body;

    // Validation
    if (!brand_id || !criterion_id || !current_text) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: brand_id, criterion_id, current_text'
      }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch brand info for context
    const { data: brand, error: brandError } = await supabase
      .from('kb_brands')
      .select('name, website_url, short_description')
      .eq('id', brand_id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({
        success: false,
        error: 'Brand not found'
      }, { status: 404 });
    }

    // Fetch criterion details including subcriteria
    const { data: criterion, error: criterionError } = await supabase
      .from('kb_review_criteria')
      .select('name, description, max_points, subcriteria')
      .eq('id', criterion_id)
      .single();

    if (criterionError || !criterion) {
      return NextResponse.json({
        success: false,
        error: 'Criterion not found'
      }, { status: 404 });
    }

    // Build sub-scores context
    const subScoresContext = sub_scores.map(s => {
      const subCriterion = criterion.subcriteria?.find((sc: { id: string; name: string; max_points: number }) => sc.id === s.id);
      return subCriterion
        ? `${subCriterion.name}: ${s.score}/${subCriterion.max_points}`
        : `${s.id}: ${s.score}`;
    }).join('\n');

    // Determine score direction
    const scoreDirection = new_score > old_score ? 'increased' : new_score < old_score ? 'decreased' : 'unchanged';
    const scoreDiff = new_score - old_score;

    // Build the user prompt
    const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.balanced;

    const userPrompt = `Rewrite this review section for "${brand.name}" to reflect the UPDATED scores.

BRAND: ${brand.name}
WEBSITE: ${brand.website_url || 'Not available'}
${brand.short_description ? `DESCRIPTION: ${brand.short_description}` : ''}

CATEGORY: ${criterion_name || criterion.name}
CATEGORY DESCRIPTION: ${criterion.description}

SCORE CHANGE:
- Old Score: ${old_score}/${max_points}
- New Score: ${new_score}/${max_points} (${scoreDirection}${scoreDiff !== 0 ? ` by ${Math.abs(scoreDiff)} points` : ''})

CURRENT SUB-SCORES:
${subScoresContext || 'No sub-scores provided'}

WRITING TONE: ${tone.replace('_', ' ').toUpperCase()}
${toneInstruction}

CURRENT SECTION TEXT:
${current_text}

---

Rewrite this section to accurately reflect the new score of ${new_score}/${max_points}. ${
  scoreDirection === 'decreased'
    ? 'Explain what factors led to this lower rating. Be specific about weaknesses or concerns.'
    : scoreDirection === 'increased'
    ? 'Explain what the brand does well to earn this higher rating. Highlight specific strengths.'
    : 'Maintain the current assessment while potentially rephrasing for clarity.'
}

Keep the same markdown structure (## heading with score, table if present, explanatory paragraphs).
The heading should read: ## ${criterion_name || criterion.name} — ${new_score}/${max_points}`;

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
        max_tokens: 2000,
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
    const newText = data.content?.[0]?.text?.trim();

    if (!newText) {
      return NextResponse.json({
        success: false,
        error: 'Empty response from AI'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        original_text: current_text,
        adjusted_text: newText,
        criterion_id,
        old_score,
        new_score,
        tone
      }
    });

  } catch (error) {
    console.error('Section adjustment error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
