/**
 * Translation data fetching utilities
 * Fetches translated content from condition_translations and glossary_translations tables
 */

import { createClient } from '@/lib/supabase/server';
import type { LanguageCode } from './translation-service';

// Types for translated content
export interface TranslatedCondition {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  short_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  // Original fields that don't need translation
  category: string;
  research_count: number;
  is_featured: boolean;
  topic_keywords: string[];
}

export interface TranslatedGlossaryTerm {
  id: string;
  slug: string;
  term: string;
  definition: string;
  simple_definition: string | null;
  // Original fields
  category: string;
  synonyms: string[] | null;
  pronunciation: string | null;
  related_terms: string[] | null;
  view_count: number;
}

/**
 * Fetch a single condition with translation applied
 */
export async function getConditionWithTranslation(
  slug: string,
  language: LanguageCode
): Promise<TranslatedCondition | null> {
  const supabase = await createClient();

  // Always fetch the base condition first
  const { data: condition, error } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name, short_description, meta_title_template, meta_description_template, category, research_count, is_featured, topic_keywords')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !condition) return null;

  // If English, return as-is
  if (language === 'en') {
    return {
      id: condition.id,
      slug: condition.slug,
      name: condition.name,
      display_name: condition.display_name,
      short_description: condition.short_description,
      meta_title: condition.meta_title_template,
      meta_description: condition.meta_description_template,
      category: condition.category,
      research_count: condition.research_count,
      is_featured: condition.is_featured,
      topic_keywords: condition.topic_keywords || [],
    };
  }

  // Fetch translation
  const { data: translation } = await supabase
    .from('condition_translations')
    .select('name, display_name, short_description, meta_title, meta_description')
    .eq('condition_id', condition.id)
    .eq('language', language)
    .single();

  // Merge translation with base condition
  return {
    id: condition.id,
    slug: condition.slug,
    name: translation?.name || condition.name,
    display_name: translation?.display_name || condition.display_name,
    short_description: translation?.short_description || condition.short_description,
    meta_title: translation?.meta_title || condition.meta_title_template,
    meta_description: translation?.meta_description || condition.meta_description_template,
    category: condition.category,
    research_count: condition.research_count,
    is_featured: condition.is_featured,
    topic_keywords: condition.topic_keywords || [],
  };
}

/**
 * Fetch all conditions with translations applied
 */
export async function getConditionsWithTranslations(
  language: LanguageCode,
  limit: number = 500
): Promise<TranslatedCondition[]> {
  const supabase = await createClient();

  // Fetch all published conditions with reasonable limit
  const { data: conditions, error } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name, short_description, meta_title_template, meta_description_template, category, research_count, is_featured, topic_keywords, display_order')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error || !conditions) return [];

  // If English, return as-is
  if (language === 'en') {
    return conditions.map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      display_name: c.display_name,
      short_description: c.short_description,
      meta_title: c.meta_title_template,
      meta_description: c.meta_description_template,
      category: c.category,
      research_count: c.research_count,
      is_featured: c.is_featured,
      topic_keywords: c.topic_keywords || [],
    }));
  }

  // Fetch all translations for this language
  const conditionIds = conditions.map(c => c.id);
  const { data: translations } = await supabase
    .from('condition_translations')
    .select('condition_id, name, display_name, short_description, meta_title, meta_description')
    .eq('language', language)
    .in('condition_id', conditionIds);

  // Create a map for quick lookup
  const translationMap = new Map(
    (translations || []).map(t => [t.condition_id, t])
  );

  // Merge translations with base conditions
  return conditions.map(c => {
    const trans = translationMap.get(c.id);
    return {
      id: c.id,
      slug: c.slug,
      name: trans?.name || c.name,
      display_name: trans?.display_name || c.display_name,
      short_description: trans?.short_description || c.short_description,
      meta_title: trans?.meta_title || c.meta_title_template,
      meta_description: trans?.meta_description || c.meta_description_template,
      category: c.category,
      research_count: c.research_count,
      is_featured: c.is_featured,
      topic_keywords: c.topic_keywords || [],
    };
  });
}

/**
 * Fetch a single glossary term with translation applied
 */
export async function getGlossaryTermWithTranslation(
  slug: string,
  language: LanguageCode
): Promise<TranslatedGlossaryTerm | null> {
  const supabase = await createClient();

  // Fetch the base term
  const { data: term, error } = await supabase
    .from('kb_glossary')
    .select('id, slug, term, definition, short_definition, category, synonyms, pronunciation, related_terms, view_count')
    .eq('slug', slug)
    .single();

  if (error || !term) return null;

  // If English, return as-is
  if (language === 'en') {
    return {
      id: term.id,
      slug: term.slug,
      term: term.term,
      definition: term.definition,
      simple_definition: term.short_definition,
      category: term.category,
      synonyms: term.synonyms,
      pronunciation: term.pronunciation,
      related_terms: term.related_terms,
      view_count: term.view_count || 0,
    };
  }

  // Fetch translation
  const { data: translation } = await supabase
    .from('glossary_translations')
    .select('term, definition, simple_definition')
    .eq('term_id', term.id)
    .eq('language', language)
    .single();

  return {
    id: term.id,
    slug: term.slug,
    term: translation?.term || term.term,
    definition: translation?.definition || term.definition,
    simple_definition: translation?.simple_definition || term.short_definition,
    category: term.category,
    synonyms: term.synonyms,
    pronunciation: term.pronunciation,
    related_terms: term.related_terms,
    view_count: term.view_count || 0,
  };
}

/**
 * Fetch all glossary terms with translations applied
 */
export async function getGlossaryTermsWithTranslations(
  language: LanguageCode,
  limit: number = 1000
): Promise<TranslatedGlossaryTerm[]> {
  const supabase = await createClient();

  // Fetch all terms with reasonable limit
  const { data: terms, error } = await supabase
    .from('kb_glossary')
    .select('id, slug, term, definition, short_definition, category, synonyms, pronunciation, related_terms, view_count')
    .order('term', { ascending: true })
    .limit(limit);

  if (error || !terms) return [];

  // If English, return as-is
  if (language === 'en') {
    return terms.map(t => ({
      id: t.id,
      slug: t.slug,
      term: t.term,
      definition: t.definition,
      simple_definition: t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    }));
  }

  // Fetch all translations for this language
  const termIds = terms.map(t => t.id);
  const { data: translations } = await supabase
    .from('glossary_translations')
    .select('term_id, term, definition, simple_definition')
    .eq('language', language)
    .in('term_id', termIds);

  // Create a map for quick lookup
  const translationMap = new Map(
    (translations || []).map(t => [t.term_id, t])
  );

  // Merge translations with base terms
  return terms.map(t => {
    const trans = translationMap.get(t.id);
    return {
      id: t.id,
      slug: t.slug,
      term: trans?.term || t.term,
      definition: trans?.definition || t.definition,
      simple_definition: trans?.simple_definition || t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    };
  });
}

/**
 * Get popular glossary terms with translations
 */
export async function getPopularGlossaryTermsWithTranslations(
  language: LanguageCode,
  limit: number = 15
): Promise<TranslatedGlossaryTerm[]> {
  const supabase = await createClient();

  // Fetch popular terms
  const { data: terms, error } = await supabase
    .from('kb_glossary')
    .select('id, slug, term, definition, short_definition, category, synonyms, pronunciation, related_terms, view_count')
    .order('view_count', { ascending: false, nullsFirst: false })
    .gt('view_count', 0)
    .limit(limit);

  if (error || !terms) return [];

  // If English, return as-is
  if (language === 'en') {
    return terms.map(t => ({
      id: t.id,
      slug: t.slug,
      term: t.term,
      definition: t.definition,
      simple_definition: t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    }));
  }

  // Fetch translations
  const termIds = terms.map(t => t.id);
  const { data: translations } = await supabase
    .from('glossary_translations')
    .select('term_id, term, definition, simple_definition')
    .eq('language', language)
    .in('term_id', termIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.term_id, t])
  );

  return terms.map(t => {
    const trans = translationMap.get(t.id);
    return {
      id: t.id,
      slug: t.slug,
      term: trans?.term || t.term,
      definition: trans?.definition || t.definition,
      simple_definition: trans?.simple_definition || t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    };
  });
}

/**
 * Get related glossary terms with translations
 */
export async function getRelatedGlossaryTermsWithTranslations(
  slugs: string[],
  language: LanguageCode
): Promise<TranslatedGlossaryTerm[]> {
  if (!slugs || slugs.length === 0) return [];

  const supabase = await createClient();

  const { data: terms, error } = await supabase
    .from('kb_glossary')
    .select('id, slug, term, definition, short_definition, category, synonyms, pronunciation, related_terms, view_count')
    .in('slug', slugs)
    .limit(8);

  if (error || !terms) return [];

  if (language === 'en') {
    return terms.map(t => ({
      id: t.id,
      slug: t.slug,
      term: t.term,
      definition: t.definition,
      simple_definition: t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    }));
  }

  const termIds = terms.map(t => t.id);
  const { data: translations } = await supabase
    .from('glossary_translations')
    .select('term_id, term, definition, simple_definition')
    .eq('language', language)
    .in('term_id', termIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.term_id, t])
  );

  return terms.map(t => {
    const trans = translationMap.get(t.id);
    return {
      id: t.id,
      slug: t.slug,
      term: trans?.term || t.term,
      definition: trans?.definition || t.definition,
      simple_definition: trans?.simple_definition || t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    };
  });
}

/**
 * Fetch featured conditions with translations applied (for homepage)
 */
export async function getFeaturedConditionsWithTranslations(
  language: LanguageCode,
  limit: number = 6
): Promise<TranslatedCondition[]> {
  const supabase = await createClient();

  // Fetch featured published conditions
  const { data: conditions, error } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name, short_description, meta_title_template, meta_description_template, category, research_count, is_featured, topic_keywords, display_order')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error || !conditions) return [];

  // If English, return as-is
  if (language === 'en') {
    return conditions.map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      display_name: c.display_name,
      short_description: c.short_description,
      meta_title: c.meta_title_template,
      meta_description: c.meta_description_template,
      category: c.category,
      research_count: c.research_count,
      is_featured: c.is_featured,
      topic_keywords: c.topic_keywords || [],
    }));
  }

  // Fetch all translations for this language
  const conditionIds = conditions.map(c => c.id);
  const { data: translations } = await supabase
    .from('condition_translations')
    .select('condition_id, name, display_name, short_description, meta_title, meta_description')
    .eq('language', language)
    .in('condition_id', conditionIds);

  // Create a map for quick lookup
  const translationMap = new Map(
    (translations || []).map(t => [t.condition_id, t])
  );

  // Merge translations with base conditions
  return conditions.map(c => {
    const trans = translationMap.get(c.id);
    return {
      id: c.id,
      slug: c.slug,
      name: trans?.name || c.name,
      display_name: trans?.display_name || c.display_name,
      short_description: trans?.short_description || c.short_description,
      meta_title: trans?.meta_title || c.meta_title_template,
      meta_description: trans?.meta_description || c.meta_description_template,
      category: c.category,
      research_count: c.research_count,
      is_featured: c.is_featured,
      topic_keywords: c.topic_keywords || [],
    };
  });
}

/**
 * Fetch recent glossary terms with translations (for homepage teaser)
 */
export async function getRecentGlossaryTermsWithTranslations(
  language: LanguageCode,
  limit: number = 8
): Promise<TranslatedGlossaryTerm[]> {
  const supabase = await createClient();

  // Fetch recently updated terms
  const { data: terms, error } = await supabase
    .from('kb_glossary')
    .select('id, slug, term, definition, short_definition, category, synonyms, pronunciation, related_terms, view_count')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error || !terms) return [];

  // If English, return as-is
  if (language === 'en') {
    return terms.map(t => ({
      id: t.id,
      slug: t.slug,
      term: t.term,
      definition: t.definition,
      simple_definition: t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    }));
  }

  // Fetch translations
  const termIds = terms.map(t => t.id);
  const { data: translations } = await supabase
    .from('glossary_translations')
    .select('term_id, term, definition, simple_definition')
    .eq('language', language)
    .in('term_id', termIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.term_id, t])
  );

  return terms.map(t => {
    const trans = translationMap.get(t.id);
    return {
      id: t.id,
      slug: t.slug,
      term: trans?.term || t.term,
      definition: trans?.definition || t.definition,
      simple_definition: trans?.simple_definition || t.short_definition,
      category: t.category,
      synonyms: t.synonyms,
      pronunciation: t.pronunciation,
      related_terms: t.related_terms,
      view_count: t.view_count || 0,
    };
  });
}

/**
 * Get related conditions with translations
 */
export async function getRelatedConditionsWithTranslations(
  slugs: string[],
  language: LanguageCode
): Promise<TranslatedCondition[]> {
  if (!slugs || slugs.length === 0) return [];

  const supabase = await createClient();

  const { data: conditions, error } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name, short_description, category, research_count, is_featured, topic_keywords')
    .in('slug', slugs)
    .eq('is_published', true);

  if (error || !conditions) return [];

  if (language === 'en') {
    return conditions.map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      display_name: c.display_name,
      short_description: c.short_description,
      meta_title: null,
      meta_description: null,
      category: c.category,
      research_count: c.research_count,
      is_featured: c.is_featured,
      topic_keywords: c.topic_keywords || [],
    }));
  }

  const conditionIds = conditions.map(c => c.id);
  const { data: translations } = await supabase
    .from('condition_translations')
    .select('condition_id, name, display_name, short_description')
    .eq('language', language)
    .in('condition_id', conditionIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.condition_id, t])
  );

  return conditions.map(c => {
    const trans = translationMap.get(c.id);
    return {
      id: c.id,
      slug: c.slug,
      name: trans?.name || c.name,
      display_name: trans?.display_name || c.display_name,
      short_description: trans?.short_description || c.short_description,
      meta_title: null,
      meta_description: null,
      category: c.category,
      research_count: c.research_count,
      is_featured: c.is_featured,
      topic_keywords: c.topic_keywords || [],
    };
  });
}

// ============================================================
// ARTICLE TRANSLATIONS
// ============================================================

export interface TranslatedArticle {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  reading_time: number | null;
  updated_at: string;
  featured_image: string | null;
  category: { name: string; slug: string } | null;
}

/**
 * Fetch featured articles with translations (for homepage)
 */
export async function getFeaturedArticlesWithTranslations(
  language: LanguageCode,
  limit: number = 5
): Promise<TranslatedArticle[]> {
  const supabase = await createClient();

  // Fetch published articles
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select(`
      id, slug, title, meta_description, reading_time, updated_at, featured_image,
      category:kb_categories(name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error || !articles) return [];

  // If English, return as-is
  if (language === 'en') {
    return articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      meta_description: a.meta_description,
      reading_time: a.reading_time,
      updated_at: a.updated_at,
      featured_image: a.featured_image,
      category: a.category as { name: string; slug: string } | null,
    }));
  }

  // Fetch translations for non-English
  const articleIds = articles.map(a => a.id);
  const { data: translations } = await supabase
    .from('article_translations')
    .select('article_id, title, meta_description')
    .eq('language', language)
    .in('article_id', articleIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.article_id, t])
  );

  return articles.map(a => {
    const trans = translationMap.get(a.id);
    return {
      id: a.id,
      slug: a.slug,
      title: trans?.title || a.title,
      meta_description: trans?.meta_description || a.meta_description,
      reading_time: a.reading_time,
      updated_at: a.updated_at,
      featured_image: a.featured_image,
      category: a.category as { name: string; slug: string } | null,
    };
  });
}

/**
 * Fetch articles for a condition with translations
 */
export async function getArticlesForConditionWithTranslations(
  conditionSlug: string,
  conditionName: string,
  language: LanguageCode,
  limit: number = 12
): Promise<Array<{
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
  reading_time?: number;
}>> {
  const supabase = await createClient();
  const articleFilter = `condition_slug.eq.${conditionSlug},title.ilike.%${conditionName}%`;

  // Fetch articles
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt, featured_image, published_at, reading_time')
    .or(articleFilter)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error || !articles) return [];

  // If English, return as-is
  if (language === 'en') return articles;

  // Fetch translations for non-English
  const articleIds = articles.map(a => a.id);
  const { data: translations } = await supabase
    .from('article_translations')
    .select('article_id, title, excerpt')
    .eq('language', language)
    .in('article_id', articleIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.article_id, t])
  );

  return articles.map(a => {
    const trans = translationMap.get(a.id);
    return {
      ...a,
      title: trans?.title || a.title,
      excerpt: trans?.excerpt || a.excerpt,
    };
  });
}

/**
 * Fetch research studies with translated summaries
 */
export async function getResearchWithTranslations(
  keywords: string[],
  language: LanguageCode,
  limit: number = 8
): Promise<Array<{
  id: string;
  title: string;
  slug: string;
  year: number;
  study_type?: string;
  study_subject?: string;
  sample_size?: number;
  quality_score?: number;
  plain_summary?: string;
}>> {
  const supabase = await createClient();

  // Fetch research
  const { data: research, error } = await supabase
    .from('kb_research_queue')
    .select('id, title, slug, year, study_type, study_subject, sample_size, quality_score, plain_summary')
    .eq('status', 'approved')
    .overlaps('relevant_topics', keywords)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error || !research) return [];

  // If English, return as-is
  if (language === 'en') return research;

  // Fetch translations for non-English
  const researchIds = research.map(r => r.id);
  const { data: translations } = await supabase
    .from('research_translations')
    .select('research_id, plain_summary')
    .eq('language', language)
    .in('research_id', researchIds);

  const translationMap = new Map(
    (translations || []).map(t => [t.research_id, t])
  );

  return research.map(r => {
    const trans = translationMap.get(r.id);
    return {
      ...r,
      plain_summary: trans?.plain_summary || r.plain_summary,
    };
  });
}
