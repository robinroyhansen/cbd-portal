import { createClient } from '@/lib/supabase/server';

export interface HomePageStats {
  // Primary impressive stats
  researchStudies: number;
  humanParticipants: number;
  humanParticipantsDisplay: string;
  expertAnalyses: number;
  healthTopics: number;
  glossaryTerms: number;
  yearsOfResearch: number;
  yearRange: string;

  // Secondary stats
  animalStudyCount: number;
  articles: number;
  brandReviews: number;

  // Legacy (for backwards compatibility)
  totalParticipants: number;
  participantsDisplay: string;
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
    topicsResult,
    glossaryResult,
    articlesResult,
    brandsResult,
    humanSampleSizeResult,
    animalStudiesResult,
    expertAnalysesResult,
    yearResult,
  ] = await Promise.all([
    // Total approved research studies
    supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),

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

    // Brand reviews with content
    supabase
      .from('brands')
      .select('*', { count: 'exact', head: true })
      .not('review_content', 'is', null),

    // Human participants only (for main display)
    supabase
      .from('kb_research_queue')
      .select('sample_size')
      .eq('status', 'approved')
      .eq('sample_type', 'human')
      .not('sample_size', 'is', null)
      .gt('sample_size', 0),

    // Count of animal/preclinical studies
    supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('sample_type', 'animal'),

    // Studies with expert analysis (plain_summary not null)
    supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .not('plain_summary', 'is', null),

    // Year range
    supabase
      .from('kb_research_queue')
      .select('year')
      .eq('status', 'approved')
      .not('year', 'is', null),
  ]);

  // Calculate unique health topics
  const uniqueTopics = new Set<string>();
  topicsResult.data?.forEach(study => {
    if (Array.isArray(study.relevant_topics)) {
      study.relevant_topics.forEach((topic: string) => uniqueTopics.add(topic));
    }
  });

  // Calculate human participants
  const humanParticipants = humanSampleSizeResult.data?.reduce(
    (sum, s) => sum + (s.sample_size || 0),
    0
  ) || 0;

  // Format human participants display - show full number up to 99,999
  let humanParticipantsDisplay: string;
  if (humanParticipants >= 1000000) {
    humanParticipantsDisplay = `${(humanParticipants / 1000000).toFixed(1)}M+`;
  } else if (humanParticipants >= 100000) {
    humanParticipantsDisplay = `${Math.floor(humanParticipants / 1000)}K+`;
  } else {
    humanParticipantsDisplay = `${humanParticipants.toLocaleString()}+`;
  }

  // Calculate year range
  const years = yearResult.data?.map(y => y.year).filter(Boolean) as number[] || [];
  const minYear = years.length > 0 ? Math.min(...years) : 2000;
  const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  const yearRange = `${minYear}–${maxYear}`;
  const yearsOfResearch = maxYear - minYear;

  return {
    researchStudies: studiesResult.count || 0,
    humanParticipants,
    humanParticipantsDisplay,
    expertAnalyses: expertAnalysesResult.count || 0,
    healthTopics: uniqueTopics.size,
    glossaryTerms: glossaryResult.count || 0,
    yearsOfResearch,
    yearRange,
    animalStudyCount: animalStudiesResult.count || 0,
    articles: articlesResult.count || 0,
    brandReviews: brandsResult.count || 0,
    // Legacy fields
    totalParticipants: humanParticipants,
    participantsDisplay: humanParticipantsDisplay,
  };
}
