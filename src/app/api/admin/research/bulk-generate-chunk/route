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

// Truncate content to safe lengths for database
function truncateContent(content: GeneratedContent): GeneratedContent {
  return {
    ...content,
    display_title: content.display_title?.slice(0, 250) || '',
    meta_title: content.meta_title?.slice(0, 60) || '',
    meta_description: content.meta_description?.slice(0, 155) || '',
  };
}

// Generate content with retry logic for rate limits
async function generateStudyContent(
  study: StudyData,
  apiKey: string,
  maxRetries: number = 3
): Promise<GeneratedContent> {
  const topics = study.relevant_topics?.join(', ') || 'CBD research';

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

4. META_TITLE (50-60 characters max)
Format: "CBD for [Condition]: [Year] [Type] | CBD Portal"
Must include primary topic and year

5. META_DESCRIPTION (145-155 characters max)
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

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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

      // Handle rate limit (429)
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000 * attempt;
        console.log(`[BulkGenerateChunk] Rate limited, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }

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
        const parsed = JSON.parse(jsonMatch[0]) as GeneratedContent;
        return truncateContent(parsed);
      } catch {
        throw new Error(`Failed to parse JSON: ${content.substring(0, 200)}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        console.log(`[BulkGenerateChunk] Attempt ${attempt} failed, retrying...`);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// POST - Process a chunk of studies (designed to be called repeatedly)
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const chunkSize = Math.min(body.chunkSize || 5, 10); // Max 10 per chunk
    const delayMs = body.delayMs || 2000; // 2 second delay between API calls

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get remaining count first
    const { count: totalRemaining } = await supabase
      .from('kb_research_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .or('key_findings.is.null,key_findings.eq.[]');

    if (totalRemaining === 0) {
      return NextResponse.json({
        done: true,
        processed: 0,
        successful: 0,
        failed: 0,
        remaining: 0,
        message: 'All studies have been processed!'
      });
    }

    // Fetch chunk of studies needing content
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, year, relevant_topics, plain_summary, abstract, relevance_score')
      .eq('status', 'approved')
      .or('key_findings.is.null,key_findings.eq.[]')
      .order('relevance_score', { ascending: false, nullsFirst: false })
      .limit(chunkSize);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({
        done: true,
        processed: 0,
        successful: 0,
        failed: 0,
        remaining: 0,
        message: 'No studies need content generation'
      });
    }

    const results: Array<{ id: string; status: string; error?: string; title?: string }> = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < studies.length; i++) {
      const study = studies[i];

      try {
        console.log(`[BulkGenerateChunk] Processing ${i + 1}/${studies.length}: ${study.title?.substring(0, 50)}...`);

        const content = await generateStudyContent(study as StudyData, apiKey);

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
        successful++;
        console.log(`[BulkGenerateChunk] Success: ${study.id}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ id: study.id, status: 'error', error: errorMessage, title: study.title?.substring(0, 50) });
        failed++;
        console.error(`[BulkGenerateChunk] Failed: ${study.id}:`, errorMessage);
      }

      // Delay between API calls (except after last one)
      if (i < studies.length - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    // Get updated remaining count
    const { count: newRemaining } = await supabase
      .from('kb_research_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .or('key_findings.is.null,key_findings.eq.[]');

    const remaining = newRemaining || 0;
    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      done: remaining === 0,
      processed: results.length,
      successful,
      failed,
      remaining,
      elapsedMs: elapsed,
      results
    });

  } catch (error) {
    console.error('[BulkGenerateChunk] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Check current status
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [
      { count: totalApproved },
      { count: needsContent },
      { count: withContent }
    ] = await Promise.all([
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .or('key_findings.is.null,key_findings.eq.[]'),
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .not('key_findings', 'is', null)
        .neq('key_findings', '[]')
    ]);

    const total = totalApproved || 0;
    const completed = withContent || 0;
    const remaining = needsContent || 0;
    const percentage = total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      total,
      completed,
      remaining,
      percentage,
      done: remaining === 0,
      estimatedChunksRemaining: Math.ceil(remaining / 5)
    });

  } catch (error) {
    console.error('[BulkGenerateChunk] Status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
