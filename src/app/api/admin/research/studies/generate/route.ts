import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface StudyData {
  id: string;
  title: string;
  abstract?: string;
  authors?: string;
  year?: number;
  publication?: string;
  relevant_topics?: string[];
  source_site?: string;
}

const PROMPTS: Record<string, { system: string; user: (study: StudyData) => string }> = {
  meta_title: {
    system: `You are an SEO expert creating meta titles for medical research pages.
Rules:
- Exactly 50-60 characters
- Include key condition/topic and "CBD" if relevant
- Include year if available
- End with "| CBD Portal"
- Be descriptive and click-worthy
- No quotes in your response`,
    user: (study) => `Create a meta title for this research study:
Title: ${study.title}
Year: ${study.year || 'Unknown'}
Topics: ${study.relevant_topics?.join(', ') || 'Unknown'}

Return ONLY the meta title, no explanation.`
  },

  meta_description: {
    system: `You are an SEO expert creating meta descriptions for medical research pages.
Rules:
- Exactly 145-155 characters
- Summarize what the study tested, who participated, and key findings
- Include CBD if relevant
- Be informative and encourage clicks
- No quotes in your response`,
    user: (study) => `Create a meta description for this research study:
Title: ${study.title}
Abstract: ${study.abstract?.substring(0, 500) || 'Not available'}
Year: ${study.year || 'Unknown'}
Topics: ${study.relevant_topics?.join(', ') || 'Unknown'}

Return ONLY the meta description, no explanation.`
  },

  display_title: {
    system: `You are a science writer creating readable titles for research studies.
Rules:
- Maximum 70 characters
- Format: "CBD for [Condition]: [Study Type] Results" or similar
- Make it accessible to general audience
- No scientific jargon
- Capitalize properly
- No quotes in your response`,
    user: (study) => `Create a readable display title for this research study:
Original Title: ${study.title}
Topics: ${study.relevant_topics?.join(', ') || 'Unknown'}

Return ONLY the display title, no explanation.`
  },

  plain_summary: {
    system: `You are a science writer translating medical research for a general audience.
Rules:
- Maximum 100 words
- No medical jargon
- Structure: What was tested → Who participated → What they found
- If results pending, say so
- Use simple, active language
- No quotes around your response`,
    user: (study) => `Write a plain-language summary for this research study:
Title: ${study.title}
Abstract: ${study.abstract || 'Not available'}
Authors: ${study.authors || 'Unknown'}
Year: ${study.year || 'Unknown'}

Return ONLY the summary, no explanation.`
  },

  key_findings: {
    system: `You are a science writer extracting key findings from research studies.
Rules:
- Extract 3-5 key findings from the study
- Each finding should be 1 short sentence
- Use simple language accessible to general audience
- Focus on what was discovered, tested, or concluded
- Return as JSON array of objects with "text" and "type": "finding"`,
    user: (study) => `Extract key findings from this research study:
Title: ${study.title}
Abstract: ${study.abstract || 'Not available'}

Return ONLY a JSON array like: [{"text": "Finding 1", "type": "finding"}, {"text": "Finding 2", "type": "finding"}]`
  },

  limitations: {
    system: `You are a science writer identifying study limitations.
Rules:
- Identify 2-4 limitations of the study
- Each limitation should be 1 short sentence
- Common limitations: sample size, study duration, lack of control group, specific population
- Use simple language
- Return as JSON array of objects with "text" and "type": "limitation"`,
    user: (study) => `Identify limitations of this research study:
Title: ${study.title}
Abstract: ${study.abstract || 'Not available'}

Return ONLY a JSON array like: [{"text": "Limitation 1", "type": "limitation"}, {"text": "Limitation 2", "type": "limitation"}]`
  }
};

export async function POST(request: NextRequest) {
  try {
    const { studyId, field } = await request.json();

    if (!studyId || !field) {
      return NextResponse.json({ error: 'studyId and field required' }, { status: 400 });
    }

    if (!PROMPTS[field]) {
      return NextResponse.json({ error: `Unknown field: ${field}` }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the study
    const { data: study, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, authors, year, publication, relevant_topics, source_site')
      .eq('id', studyId)
      .single();

    if (fetchError || !study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    const prompt = PROMPTS[field];

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: prompt.system,
        messages: [
          {
            role: 'user',
            content: prompt.user(study as StudyData)
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Generate] API error:', response.status, errorData);
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    let content = data.content?.[0]?.text?.trim();

    if (!content) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    // Parse JSON for findings/limitations
    if (field === 'key_findings' || field === 'limitations') {
      try {
        // Extract JSON from response if wrapped in other text
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          content = JSON.parse(jsonMatch[0]);
        } else {
          content = JSON.parse(content);
        }
      } catch (e) {
        console.error('[Generate] JSON parse error:', e);
        return NextResponse.json({ error: 'Failed to parse generated content' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      content,
      field
    });

  } catch (error) {
    console.error('[Generate] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
