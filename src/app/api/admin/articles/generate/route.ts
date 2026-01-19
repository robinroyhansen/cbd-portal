import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120; // 2 minutes for AI generation

interface GenerateRequest {
  conditionSlug: string;
  articleType?: 'condition_guide' | 'research_summary' | 'dosage_guide';
  language?: string;
}

interface ResearchStudy {
  id: string;
  title: string;
  authors: string | null;
  publication: string | null;
  year: number | null;
  abstract: string | null;
  plain_summary: string | null;
  relevant_topics: string[] | null;
  relevance_score: number | null;
}

interface Condition {
  id: string;
  name: string;
  display_name: string;
  slug: string;
  description: string | null;
  seo_title_template: string | null;
  seo_description_template: string | null;
  research_count: number;
}

/**
 * POST /api/admin/articles/generate
 *
 * Generate an article draft using AI based on a condition and related research
 */
export async function POST(request: NextRequest) {
  // Require admin authentication
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body: GenerateRequest = await request.json();
    const { conditionSlug, articleType = 'condition_guide', language = 'en' } = body;

    if (!conditionSlug) {
      return NextResponse.json({ error: 'conditionSlug is required' }, { status: 400 });
    }

    // Check for Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch the condition
    const { data: condition, error: conditionError } = await supabase
      .from('kb_conditions')
      .select('*')
      .eq('slug', conditionSlug)
      .single();

    if (conditionError || !condition) {
      return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
    }

    // 2. Fetch approved research for this condition
    const { data: research, error: researchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, authors, publication, year, abstract, plain_summary, relevant_topics, relevance_score')
      .eq('status', 'approved')
      .contains('relevant_topics', [condition.name.toLowerCase()])
      .order('relevance_score', { ascending: false })
      .limit(20);

    if (researchError) {
      console.error('Error fetching research:', researchError);
    }

    const studies = research || [];

    // 3. Build the prompt for Claude
    const articlePrompt = buildArticlePrompt(condition as Condition, studies, articleType, language);

    // 4. Generate article using Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: articlePrompt,
        },
      ],
    });

    // Extract the generated content
    const generatedContent = message.content[0].type === 'text' ? message.content[0].text : '';

    // 5. Parse the generated content
    const { title, content, excerpt, faqItems, keyTakeaways } = parseGeneratedContent(generatedContent, condition);

    // 6. Generate slug
    const slug = `cbd-for-${conditionSlug}-${language}`;

    // 7. Check if article already exists
    const { data: existingArticle } = await supabase
      .from('kb_articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingArticle) {
      return NextResponse.json({
        error: 'Article already exists for this condition',
        existingSlug: slug,
        suggestion: `Update the existing article or use a different slug`
      }, { status: 409 });
    }

    // 8. Insert the draft article
    const { data: article, error: insertError } = await supabase
      .from('kb_articles')
      .insert({
        slug,
        title,
        content,
        excerpt,
        condition_id: condition.id,
        category: articleType,
        status: 'draft',
        language,
        meta_title: `${title} | CBD Portal`,
        meta_description: excerpt?.substring(0, 155) || '',
        faq_items: faqItems,
        key_takeaways: keyTakeaways,
        related_research_ids: studies.slice(0, 10).map(s => s.id),
        source_references: studies.map(s => s.title),
        target_keywords: [
          `cbd ${condition.name.toLowerCase()}`,
          `cannabidiol ${condition.name.toLowerCase()}`,
          `cbd oil ${condition.name.toLowerCase()}`,
        ],
        internal_notes: `Auto-generated from ${studies.length} research studies on ${new Date().toISOString()}`,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting article:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        status: article.status,
        wordCount: article.word_count,
        readingTime: article.reading_time,
      },
      generation: {
        researchUsed: studies.length,
        model: 'claude-sonnet-4-20250514',
        faqCount: faqItems?.length || 0,
        takeawaysCount: keyTakeaways?.length || 0,
      },
      message: 'Article draft generated successfully. Review and edit before publishing.',
    });

  } catch (error) {
    console.error('[Article Generate] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

/**
 * Build the prompt for Claude to generate the article
 */
function buildArticlePrompt(
  condition: Condition,
  studies: ResearchStudy[],
  articleType: string,
  language: string
): string {
  // Build research context
  const researchContext = studies.length > 0
    ? studies.map((s, i) => `
Study ${i + 1}: "${s.title}"
- Authors: ${s.authors || 'Unknown'}
- Publication: ${s.publication || 'Unknown'} (${s.year || 'N/A'})
- Key findings: ${s.plain_summary || s.abstract?.substring(0, 500) || 'No summary available'}
`).join('\n')
    : 'No specific research studies available. Use general CBD knowledge.';

  const prompt = `You are a medical content writer for a CBD educational portal. Generate a comprehensive article about using CBD for ${condition.display_name || condition.name}.

CONDITION INFORMATION:
- Name: ${condition.display_name || condition.name}
- Description: ${condition.description || 'A medical condition where CBD may provide benefits'}
- Research Available: ${studies.length} peer-reviewed studies

RESEARCH STUDIES TO REFERENCE:
${researchContext}

ARTICLE REQUIREMENTS:
1. Article Type: ${articleType.replace('_', ' ')}
2. Language: ${language === 'en' ? 'English' : language}
3. Tone: Educational, evidence-based, accessible to general readers
4. Include medical disclaimer where appropriate

STRUCTURE YOUR RESPONSE EXACTLY AS FOLLOWS (use these exact headings):

---TITLE---
[Write an SEO-optimized title like "CBD for ${condition.display_name}: Evidence-Based Guide 2026"]

---CONTENT---
[Write the full article in Markdown format with these sections:
- Introduction (explain the condition and why CBD is being studied)
- How CBD Works (mechanism of action, endocannabinoid system)
- What the Research Shows (cite specific studies from above)
- Potential Benefits (based on research)
- Dosage Considerations (general guidance, not medical advice)
- Safety and Side Effects
- How to Choose CBD Products (for this condition)
- Conclusion
]

---EXCERPT---
[Write a 150-200 character summary for SEO]

---FAQ---
[Write 5 frequently asked questions and answers in this format:
Q: Question text?
A: Answer text.
]

---TAKEAWAYS---
[Write 5-7 bullet point key takeaways, one per line starting with "- "]

IMPORTANT GUIDELINES:
- Always mention that users should consult healthcare providers
- Reference specific studies when making claims
- Avoid absolute claims; use phrases like "research suggests," "may help," "studies indicate"
- Include a medical disclaimer in the introduction
- Focus on education, not product promotion`;

  return prompt;
}

/**
 * Parse the generated content into structured fields
 */
function parseGeneratedContent(
  content: string,
  condition: Condition
): {
  title: string;
  content: string;
  excerpt: string | null;
  faqItems: Array<{ question: string; answer: string }>;
  keyTakeaways: string[];
} {
  // Default values
  let title = `CBD for ${condition.display_name || condition.name}: Complete Guide`;
  let articleContent = content;
  let excerpt: string | null = null;
  const faqItems: Array<{ question: string; answer: string }> = [];
  const keyTakeaways: string[] = [];

  // Parse title
  const titleMatch = content.match(/---TITLE---\n([\s\S]*?)(?=---)/);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Parse main content
  const contentMatch = content.match(/---CONTENT---\n([\s\S]*?)(?=---EXCERPT---|---FAQ---|$)/);
  if (contentMatch) {
    articleContent = contentMatch[1].trim();
  }

  // Parse excerpt
  const excerptMatch = content.match(/---EXCERPT---\n([\s\S]*?)(?=---FAQ---|---TAKEAWAYS---|$)/);
  if (excerptMatch) {
    excerpt = excerptMatch[1].trim().substring(0, 250);
  }

  // Parse FAQ
  const faqMatch = content.match(/---FAQ---\n([\s\S]*?)(?=---TAKEAWAYS---|$)/);
  if (faqMatch) {
    const faqText = faqMatch[1];
    const qaPairs = faqText.split(/\nQ: /).filter(Boolean);

    for (const pair of qaPairs) {
      const [question, ...answerParts] = pair.split(/\nA: /);
      if (question && answerParts.length > 0) {
        faqItems.push({
          question: question.replace(/^Q: /, '').trim(),
          answer: answerParts.join('\nA: ').trim(),
        });
      }
    }
  }

  // Parse takeaways
  const takeawaysMatch = content.match(/---TAKEAWAYS---\n([\s\S]*?)$/);
  if (takeawaysMatch) {
    const lines = takeawaysMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
    for (const line of lines) {
      keyTakeaways.push(line.replace(/^-\s*/, '').trim());
    }
  }

  return {
    title,
    content: articleContent,
    excerpt,
    faqItems,
    keyTakeaways,
  };
}

/**
 * GET /api/admin/articles/generate
 *
 * Returns available conditions for article generation
 */
export async function GET(request: NextRequest) {
  // Require admin authentication
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get conditions with their research counts
    const { data: conditions, error } = await supabase
      .from('kb_conditions')
      .select('slug, name, display_name, research_count')
      .eq('is_published', true)
      .order('research_count', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get existing articles to show which conditions already have content
    const { data: existingArticles } = await supabase
      .from('kb_articles')
      .select('condition_id, status')
      .not('condition_id', 'is', null);

    const articlesMap = new Map();
    existingArticles?.forEach(article => {
      articlesMap.set(article.condition_id, article.status);
    });

    // Enrich conditions with article status
    const enrichedConditions = conditions?.map(c => ({
      ...c,
      hasArticle: articlesMap.has(c.slug),
      articleStatus: articlesMap.get(c.slug) || null,
    }));

    return NextResponse.json({
      conditions: enrichedConditions || [],
      articleTypes: [
        { id: 'condition_guide', name: 'Condition Guide', description: 'Comprehensive guide for CBD and the condition' },
        { id: 'research_summary', name: 'Research Summary', description: 'Summary of latest research findings' },
        { id: 'dosage_guide', name: 'Dosage Guide', description: 'Dosing recommendations and considerations' },
      ],
      languages: [
        { code: 'en', name: 'English' },
        { code: 'de', name: 'German' },
        { code: 'es', name: 'Spanish' },
      ],
    });

  } catch (error) {
    console.error('[Article Generate GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conditions' },
      { status: 500 }
    );
  }
}
