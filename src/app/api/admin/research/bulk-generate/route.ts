import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface StudyData {
  id: string;
  title: string;
  year?: number;
  relevant_topics?: string[];
  plain_summary?: string;
  abstract?: string;
}

interface GeneratedContent {
  display_title: string;
  key_findings: Array<{ type: string; text: string }>;
  limitations: Array<{ type: string; text: string }>;
  meta_title: string;
  meta_description: string;
}

async function generateStudyContent(study: StudyData, apiKey: string): Promise<GeneratedContent> {
  const topics = study.relevant_topics?.join(', ') || 'CBD research';
  const primaryTopic = study.relevant_topics?.[0] || 'health';

  const prompt = `You are generating SEO content for a CBD research study page.

STUDY DATA:
Title: ${study.title}
Year: ${study.year || 'Unknown'}
Topics: ${topics}
Summary: ${study.plain_summary || 'Not available'}
Abstract: ${study.abstract || 'Not available'}

Generate the following:

1. DISPLAY_TITLE (readable H1, max 80 chars)
Format: "CBD for [Condition]: [Year] [Study Type] Results"
Example: "CBD for Social Anxiety: 2024 Clinical Trial Results"

2. KEY_FINDINGS (3-5 findings as JSON array)
Each finding: { "type": "finding", "text": "..." }
Focus on: methodology, dosage, sample size, outcomes
Example: { "type": "finding", "text": "Participants received 300mg CBD daily for 4 weeks" }

3. LIMITATIONS (2-3 limitations as JSON array)
Each limitation: { "type": "limitation", "text": "..." }
Common limitations: small sample, short duration, specific population, ongoing study
Example: { "type": "limitation", "text": "Limited to adults aged 18-65" }

4. META_TITLE (50-60 characters)
Format: "CBD for [Condition]: [Year] [Type] | CBD Portal"
Must include primary topic and year

5. META_DESCRIPTION (145-155 characters)
Include: study type, sample size if known, key finding or quality note
End with action phrase like "Expert analysis" or "See the evidence"

Return as JSON only, no markdown code blocks:
{
  "display_title": "...",
  "key_findings": [...],
  "limitations": [...],
  "meta_title": "...",
  "meta_description": "..."
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text?.trim();

  if (!content) {
    throw new Error('No content generated');
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from response');
  }

  try {
    return JSON.parse(jsonMatch[0]) as GeneratedContent;
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${content.substring(0, 200)}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { batchSize = 10, startFrom = 0 } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch studies needing content generation
    // key_findings is NULL or empty array
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, year, relevant_topics, plain_summary, abstract')
      .eq('status', 'approved')
      .or('key_findings.is.null,key_findings.eq.[]')
      .order('created_at', { ascending: true })
      .range(startFrom, startFrom + batchSize - 1);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({
        processed: 0,
        successful: 0,
        failed: 0,
        remaining: 0,
        message: 'No studies need content generation'
      });
    }

    const results: Array<{ id: string; status: string; error?: string; title?: string }> = [];

    for (const study of studies) {
      try {
        console.log(`[BulkGenerate] Processing study ${study.id}: ${study.title?.substring(0, 50)}...`);

        // Generate content
        const content = await generateStudyContent(study as StudyData, apiKey);

        // Update database
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({
            display_title: content.display_title,
            key_findings: content.key_findings,
            limitations: content.limitations,
            meta_title: content.meta_title,
            meta_description: content.meta_description,
          })
          .eq('id', study.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        results.push({ id: study.id, status: 'success', title: study.title?.substring(0, 50) });
        console.log(`[BulkGenerate] Success: ${study.id}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ id: study.id, status: 'error', error: errorMessage, title: study.title?.substring(0, 50) });
        console.error(`[BulkGenerate] Failed: ${study.id}:`, errorMessage);
      }

      // Small delay to avoid rate limits (200ms)
      await new Promise(r => setTimeout(r, 200));
    }

    // Get remaining count
    const { count } = await supabase
      .from('kb_research_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .or('key_findings.is.null,key_findings.eq.[]');

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      processed: results.length,
      successful,
      failed,
      remaining: count || 0,
      results
    });

  } catch (error) {
    console.error('[BulkGenerate] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Count total approved
    const { count: totalApproved } = await supabase
      .from('kb_research_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Count needing content
    const { count: needsContent } = await supabase
      .from('kb_research_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .or('key_findings.is.null,key_findings.eq.[]');

    // Count completed
    const completed = (totalApproved || 0) - (needsContent || 0);
    const percentage = totalApproved ? ((completed / totalApproved) * 100).toFixed(1) : '0';

    return NextResponse.json({
      totalApproved: totalApproved || 0,
      needsContent: needsContent || 0,
      completed,
      percentage: parseFloat(percentage)
    });

  } catch (error) {
    console.error('[BulkGenerate] Status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
