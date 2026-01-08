/**
 * AI-powered plain-language summary generator for research studies
 * Uses Claude API to generate accessible summaries for general audiences
 */

export interface StudyData {
  id: string;
  title: string;
  abstract?: string;
  authors?: string;
  year?: number;
  publication?: string;
  url?: string;
  source_site?: string;
}

export interface SummaryResult {
  success: boolean;
  summary?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a science writer who translates complex medical research into simple, accessible language for an 18-year-old audience.

Your task is to write plain-language summaries of CBD/cannabis research studies.

RULES:
1. Maximum 100 words
2. No medical jargon - use simple terms (e.g., "CBD oil" not "cannabidiol oral solution")
3. Structure: What was tested → Who participated → How it was done → What they found
4. If results aren't available or the study is ongoing, say "Results pending" or "Study in progress"
5. Be accurate - don't overstate findings
6. Use active voice and short sentences

EXAMPLES:
- Instead of "randomized double-blind placebo-controlled trial" say "a carefully designed study where neither patients nor doctors knew who got CBD"
- Instead of "statistically significant reduction in anxiety symptoms" say "noticeable improvement in anxiety"
- Instead of "participants" say "people in the study" or just give the number`;

export async function generatePlainSummary(study: StudyData): Promise<SummaryResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'ANTHROPIC_API_KEY not configured' };
  }

  // Build the study context
  const studyContext = buildStudyContext(study);

  if (!studyContext) {
    return { success: false, error: 'Insufficient study data for summary' };
  }

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
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Write a plain-language summary (max 100 words) for this research study:\n\n${studyContext}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[SummaryGenerator] API error:', response.status, errorData);
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text?.trim();

    if (!summary) {
      return { success: false, error: 'No summary generated' };
    }

    // Validate summary length (roughly 100 words max)
    const wordCount = summary.split(/\s+/).length;
    if (wordCount > 120) {
      // Try to truncate at a sentence boundary
      const sentences = summary.split(/(?<=[.!?])\s+/);
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence).split(/\s+/).length > 100) break;
        truncated += (truncated ? ' ' : '') + sentence;
      }
      return { success: true, summary: truncated || summary.split(/\s+/).slice(0, 100).join(' ') + '...' };
    }

    return { success: true, summary };

  } catch (error) {
    console.error('[SummaryGenerator] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function buildStudyContext(study: StudyData): string | null {
  const parts: string[] = [];

  if (study.title) {
    parts.push(`TITLE: ${study.title}`);
  }

  if (study.abstract) {
    parts.push(`ABSTRACT: ${study.abstract}`);
  }

  if (study.authors) {
    parts.push(`AUTHORS: ${study.authors}`);
  }

  if (study.year) {
    parts.push(`YEAR: ${study.year}`);
  }

  if (study.publication) {
    parts.push(`PUBLICATION: ${study.publication}`);
  }

  if (study.source_site) {
    parts.push(`SOURCE: ${study.source_site}`);
  }

  // Must have at least title and some content
  if (!study.title || (!study.abstract && parts.length < 3)) {
    return null;
  }

  return parts.join('\n\n');
}

/**
 * Generate summaries for multiple studies with rate limiting
 */
export async function generateSummariesBatch(
  studies: StudyData[],
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<Map<string, SummaryResult>> {
  const results = new Map<string, SummaryResult>();
  const total = studies.length;

  for (let i = 0; i < studies.length; i++) {
    const study = studies[i];

    if (onProgress) {
      onProgress(i, total, study.title);
    }

    const result = await generatePlainSummary(study);
    results.set(study.id, result);

    // Rate limiting: 1 request per second to stay well under limits
    if (i < studies.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (onProgress) {
    onProgress(total, total, 'Complete');
  }

  return results;
}
