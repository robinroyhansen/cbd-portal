/**
 * RAG Context Builder for Chat
 * Fetches relevant data from conditions, research, glossary, and articles
 */

import { createClient } from '@supabase/supabase-js';
import type { ChatContext, ConditionContext, StudyContext, GlossaryContext, ArticleContext } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Common CBD-related keywords for intent detection
const CONDITION_KEYWORDS: Record<string, string[]> = {
  anxiety: ['anxiety', 'anxious', 'worry', 'stress', 'nervous', 'panic', 'gad'],
  sleep: ['sleep', 'insomnia', 'rest', 'tired', 'fatigue', 'circadian'],
  pain: ['pain', 'ache', 'hurt', 'chronic pain', 'discomfort', 'sore'],
  depression: ['depression', 'depressed', 'mood', 'sad', 'mental health'],
  epilepsy: ['epilepsy', 'seizure', 'convulsion', 'dravet', 'lennox-gastaut'],
  inflammation: ['inflammation', 'inflammatory', 'swelling', 'inflamed'],
  arthritis: ['arthritis', 'joint', 'rheumatoid', 'osteoarthritis'],
  skin: ['skin', 'acne', 'eczema', 'psoriasis', 'dermatitis'],
  cancer: ['cancer', 'tumor', 'oncology', 'chemotherapy', 'nausea'],
  ptsd: ['ptsd', 'trauma', 'post-traumatic', 'flashback'],
  migraine: ['migraine', 'headache', 'head pain'],
  neuropathy: ['neuropathy', 'nerve pain', 'neuropathic', 'numbness'],
  fibromyalgia: ['fibromyalgia', 'fibro', 'widespread pain'],
  ibs: ['ibs', 'irritable bowel', 'digestive', 'gut'],
  autism: ['autism', 'asd', 'spectrum'],
  adhd: ['adhd', 'attention', 'hyperactivity', 'focus'],
  addiction: ['addiction', 'withdrawal', 'substance', 'craving'],
  pets: ['pet', 'dog', 'cat', 'animal', 'veterinary'],
};

/**
 * Extract keywords and potential conditions from user message
 */
function extractKeywords(message: string): string[] {
  const messageLower = message.toLowerCase();
  const keywords: string[] = [];

  // Check for condition-related keywords
  for (const [condition, terms] of Object.entries(CONDITION_KEYWORDS)) {
    for (const term of terms) {
      if (messageLower.includes(term)) {
        keywords.push(condition);
        break; // Only add condition once
      }
    }
  }

  // Extract other meaningful words (>3 chars, not common words)
  const stopWords = new Set(['what', 'does', 'help', 'with', 'about', 'have', 'this', 'that', 'from', 'they', 'been', 'some', 'would', 'could', 'should', 'there', 'their', 'which', 'your', 'more', 'other', 'were', 'than', 'them', 'will', 'into', 'only', 'very', 'just', 'take', 'taking', 'using', 'used']);

  const words = messageLower.match(/\b[a-z]{4,}\b/g) || [];
  for (const word of words) {
    if (!stopWords.has(word) && !keywords.includes(word)) {
      keywords.push(word);
    }
  }

  return [...new Set(keywords)].slice(0, 10); // Limit to 10 keywords
}

/**
 * Search for relevant conditions
 */
async function searchConditions(keywords: string[], language: string = 'en'): Promise<ConditionContext[]> {
  if (keywords.length === 0) return [];

  // Build search query for condition names and slugs
  const searchTerms = keywords.join(' | ');

  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, description')
    .eq('is_published', true)
    .or(`name.ilike.%${keywords[0]}%,slug.ilike.%${keywords[0]}%`)
    .limit(5);

  if (!conditions || conditions.length === 0) {
    // Fallback: try each keyword
    for (const keyword of keywords.slice(0, 3)) {
      const { data } = await supabase
        .from('kb_conditions')
        .select('slug, name, description')
        .eq('is_published', true)
        .or(`name.ilike.%${keyword}%,slug.ilike.%${keyword}%`)
        .limit(3);

      if (data && data.length > 0) {
        // Get research counts for each condition
        const withCounts = await Promise.all(
          data.map(async (c) => {
            const { count } = await supabase
              .from('kb_research_queue')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'approved')
              .or(`primary_topic.ilike.%${c.slug}%,relevant_topics.cs.{${c.slug}}`);

            return {
              slug: c.slug,
              name: c.name,
              description: c.description,
              research_count: count || 0,
            };
          })
        );
        return withCounts;
      }
    }
    return [];
  }

  // Get research counts for each condition
  const withCounts = await Promise.all(
    conditions.map(async (c) => {
      const { count } = await supabase
        .from('kb_research_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .or(`primary_topic.ilike.%${c.slug}%,relevant_topics.cs.{${c.slug}}`);

      return {
        slug: c.slug,
        name: c.name,
        description: c.description,
        research_count: count || 0,
      };
    })
  );

  return withCounts;
}

/**
 * Get relevant research studies
 */
async function getRelevantResearch(
  conditions: ConditionContext[],
  options: { limit?: number; minQuality?: number; preferHuman?: boolean } = {}
): Promise<StudyContext[]> {
  const { limit = 5, minQuality = 50, preferHuman = true } = options;

  if (conditions.length === 0) {
    // Return top-quality general CBD studies
    const { data } = await supabase
      .from('kb_research_queue')
      .select('id, title, plain_summary, year, quality_score, study_type, study_subject, slug')
      .eq('status', 'approved')
      .gte('quality_score', minQuality)
      .in('study_subject', preferHuman ? ['human', 'review'] : ['human', 'review', 'animal'])
      .order('quality_score', { ascending: false })
      .limit(limit);

    return (data || []) as StudyContext[];
  }

  // Get studies for the matched conditions
  const conditionSlugs = conditions.map(c => c.slug);
  const studies: StudyContext[] = [];

  for (const slug of conditionSlugs.slice(0, 3)) {
    const { data } = await supabase
      .from('kb_research_queue')
      .select('id, title, plain_summary, year, quality_score, study_type, study_subject, slug')
      .eq('status', 'approved')
      .gte('quality_score', minQuality)
      .or(`primary_topic.ilike.%${slug}%,relevant_topics.cs.{${slug}}`)
      .order('quality_score', { ascending: false })
      .limit(Math.ceil(limit / conditionSlugs.length));

    if (data) {
      studies.push(...(data as StudyContext[]));
    }
  }

  // Deduplicate and sort by quality
  const unique = Array.from(new Map(studies.map(s => [s.id, s])).values());
  return unique
    .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
    .slice(0, limit);
}

/**
 * Match glossary terms mentioned in the message
 */
async function matchGlossaryTerms(message: string, language: string = 'en'): Promise<GlossaryContext[]> {
  const messageLower = message.toLowerCase();

  // Get glossary terms that might be in the message
  const { data: terms } = await supabase
    .from('kb_glossary')
    .select('slug, term, short_definition')
    .limit(100);

  if (!terms) return [];

  // Find terms mentioned in the message
  const matched = terms.filter(t =>
    messageLower.includes(t.term.toLowerCase()) ||
    messageLower.includes(t.slug.replace(/-/g, ' '))
  );

  return matched.slice(0, 5) as GlossaryContext[];
}

/**
 * Get related articles
 */
async function getRelatedArticles(
  conditions: ConditionContext[],
  language: string = 'en',
  limit: number = 3
): Promise<ArticleContext[]> {
  if (conditions.length === 0) {
    // Return popular general articles
    const { data } = await supabase
      .from('kb_articles')
      .select('slug, title, excerpt')
      .eq('status', 'published')
      .eq('language', language)
      .limit(limit);

    return (data || []) as ArticleContext[];
  }

  // Get articles for matched conditions
  const conditionSlugs = conditions.map(c => c.slug);

  const { data } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt')
    .eq('status', 'published')
    .eq('language', language)
    .in('condition_slug', conditionSlugs)
    .limit(limit);

  return (data || []) as ArticleContext[];
}

/**
 * Build complete context for a user message
 */
export async function buildContext(
  userMessage: string,
  language: string = 'en'
): Promise<ChatContext> {
  const keywords = extractKeywords(userMessage);

  // Fetch all data in parallel
  const [conditions, glossaryTerms] = await Promise.all([
    searchConditions(keywords, language),
    matchGlossaryTerms(userMessage, language),
  ]);

  // Fetch studies and articles based on conditions
  const [studies, articles] = await Promise.all([
    getRelevantResearch(conditions, { limit: 5, minQuality: 50, preferHuman: true }),
    getRelatedArticles(conditions, language, 3),
  ]);

  // Calculate stats
  const humanStudies = studies.filter(s => s.study_subject === 'human' || s.study_subject === 'review');
  const qualityScores = studies.map(s => s.quality_score || 0).filter(q => q > 0);
  const avgQuality = qualityScores.length > 0
    ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
    : 0;

  return {
    conditions,
    studies,
    glossaryTerms,
    articles,
    stats: {
      totalStudies: studies.length,
      humanStudies: humanStudies.length,
      avgQuality,
    },
  };
}

/**
 * Format context for Claude prompt
 */
export function formatContextForPrompt(context: ChatContext): string {
  const parts: string[] = [];

  if (context.conditions.length > 0) {
    parts.push('## Relevant Conditions');
    for (const c of context.conditions) {
      parts.push(`- **${c.name}** (/conditions/${c.slug}): ${c.research_count} studies available`);
      if (c.description) {
        parts.push(`  ${c.description.slice(0, 200)}...`);
      }
    }
    parts.push('');
  }

  if (context.studies.length > 0) {
    parts.push('## Relevant Research Studies');
    for (const s of context.studies) {
      parts.push(`- **${s.title}** (${s.year || 'n.d.'}, Quality: ${s.quality_score || 'N/A'}/100)`);
      parts.push(`  Type: ${s.study_type || 'Unknown'}, Subject: ${s.study_subject || 'Unknown'}`);
      if (s.plain_summary) {
        parts.push(`  Summary: ${s.plain_summary.slice(0, 300)}...`);
      }
      parts.push(`  Link: /research/study/${s.slug}`);
    }
    parts.push('');
  }

  if (context.articles.length > 0) {
    parts.push('## Related Articles');
    for (const a of context.articles) {
      parts.push(`- [${a.title}](/articles/${a.slug})`);
      if (a.excerpt) {
        parts.push(`  ${a.excerpt.slice(0, 150)}...`);
      }
    }
    parts.push('');
  }

  if (context.glossaryTerms.length > 0) {
    parts.push('## Glossary Terms');
    for (const t of context.glossaryTerms) {
      parts.push(`- **${t.term}** (/glossary/${t.slug}): ${t.short_definition || ''}`);
    }
    parts.push('');
  }

  if (context.stats.totalStudies > 0) {
    parts.push('## Research Statistics');
    parts.push(`- Total studies found: ${context.stats.totalStudies}`);
    parts.push(`- Human/review studies: ${context.stats.humanStudies}`);
    parts.push(`- Average quality score: ${context.stats.avgQuality}/100`);
  }

  return parts.join('\n');
}
