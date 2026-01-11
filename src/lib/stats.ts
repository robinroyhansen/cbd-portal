import { createClient } from '@/lib/supabase/server';

export interface HomePageStats {
  // Primary stats (always shown)
  researchStudies: number;
  glossaryTerms: number;
  healthTopics: number;
  highQualityStudies: number;

  // Secondary stats (shown if > 0)
  articles: number;
  expertAnalyses: number;
  countriesStudied: number;
  brandReviews: number;
}

/**
 * Fetch all stats for the homepage
 * Uses server-side Supabase client
 */
export async function getHomePageStats(): Promise<HomePageStats> {
  const supabase = await createClient();

  // Run all queries in parallel for performance
  const [
    studiesResult,
    highQualityResult,
    topicsResult,
    glossaryResult,
    articlesResult,
    countriesResult,
    brandsResult,
  ] = await Promise.all([
    // Total approved research studies
    supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),

    // High quality studies (score >= 70)
    supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('relevance_score', 70),

    // Get unique health topics
    supabase
      .from('kb_research_queue')
      .select('relevant_topics')
      .eq('status', 'approved'),

    // Glossary terms
    supabase
      .from('kb_glossary')
      .select('*', { count: 'exact', head: true }),

    // Published articles
    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),

    // Countries with research
    supabase
      .from('kb_research_queue')
      .select('country')
      .eq('status', 'approved')
      .not('country', 'is', null),

    // Brand reviews with content
    supabase
      .from('brands')
      .select('*', { count: 'exact', head: true })
      .not('review_content', 'is', null),
  ]);

  // Calculate unique health topics
  const uniqueTopics = new Set<string>();
  topicsResult.data?.forEach(study => {
    if (Array.isArray(study.relevant_topics)) {
      study.relevant_topics.forEach((topic: string) => uniqueTopics.add(topic));
    }
  });

  // Calculate unique countries
  const uniqueCountries = new Set<string>();
  countriesResult.data?.forEach(study => {
    if (study.country) {
      uniqueCountries.add(study.country);
    }
  });

  return {
    researchStudies: studiesResult.count || 0,
    glossaryTerms: glossaryResult.count || 0,
    healthTopics: uniqueTopics.size,
    highQualityStudies: highQualityResult.count || 0,
    articles: articlesResult.count || 0,
    expertAnalyses: 0, // Placeholder - update when expert analyses table exists
    countriesStudied: uniqueCountries.size,
    brandReviews: brandsResult.count || 0,
  };
}
