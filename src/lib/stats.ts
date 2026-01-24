import { createClient } from '@/lib/supabase/server';

export interface StudySubjectDistribution {
  human: number;
  review: number;
  animal: number;
  in_vitro: number;
}

export interface HomePageStats {
  // Primary impressive stats
  totalScannedStudies: number;  // All studies ever scanned (queue total)
  researchStudies: number;      // Approved/published studies
  humanParticipants: number;
  humanParticipantsDisplay: string;
  expertAnalyses: number;
  healthTopics: number;
  glossaryTerms: number;
  yearsOfResearch: number;
  yearRange: string;

  // Study subject distribution
  studySubjectDistribution: StudySubjectDistribution;

  // Geographic reach
  countryCount: number;

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
    totalScannedResult,
    topicsResult,
    glossaryResult,
    articlesResult,
    brandsResult,
    humanSampleSizeResult,
    animalStudiesResult,
    expertAnalysesResult,
    yearResult,
    studySubjectResult,
    countryResult,
  ] = await Promise.all([
    // Total approved research studies
    supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),

    // Total scanned studies (all statuses - entire queue)
    supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true }),

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
      .from('kb_articles')
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

    // Count of animal/preclinical studies (by sample_type or title keywords)
    supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .or('sample_type.eq.animal,title.ilike.%mice%,title.ilike.%mouse%,title.ilike.%rat%,title.ilike.%rats%,title.ilike.%murine%,title.ilike.%rodent%'),

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

    // Study subject distribution
    supabase
      .from('kb_research_queue')
      .select('study_subject')
      .eq('status', 'approved'),

    // Distinct countries (from all studies with country data)
    supabase
      .from('kb_research_queue')
      .select('country')
      .not('country', 'is', null),
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

  // Format human participants display with full numbers
  const humanParticipantsDisplay = `${humanParticipants.toLocaleString()}+`;

  // Calculate year range
  const years = yearResult.data?.map(y => y.year).filter(Boolean) as number[] || [];
  const minYear = years.length > 0 ? Math.min(...years) : 2000;
  const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  const yearRange = `${minYear}–${maxYear}`;
  const yearsOfResearch = maxYear - minYear;

  // Calculate study subject distribution
  const studySubjectDistribution: StudySubjectDistribution = {
    human: 0,
    review: 0,
    animal: 0,
    in_vitro: 0,
  };
  studySubjectResult.data?.forEach(study => {
    const subject = study.study_subject as keyof StudySubjectDistribution;
    if (subject && subject in studySubjectDistribution) {
      studySubjectDistribution[subject]++;
    }
  });

  // Calculate distinct country count
  const uniqueCountries = new Set<string>();
  countryResult.data?.forEach(study => {
    if (study.country) {
      uniqueCountries.add(study.country);
    }
  });
  const countryCount = uniqueCountries.size;

  return {
    totalScannedStudies: totalScannedResult.count || 0,
    researchStudies: studiesResult.count || 0,
    humanParticipants,
    humanParticipantsDisplay,
    expertAnalyses: expertAnalysesResult.count || 0,
    healthTopics: uniqueTopics.size,
    glossaryTerms: glossaryResult.count || 0,
    yearsOfResearch,
    yearRange,
    studySubjectDistribution,
    countryCount,
    animalStudyCount: animalStudiesResult.count || 0,
    articles: articlesResult.count || 0,
    brandReviews: brandsResult.count || 0,
    // Legacy fields
    totalParticipants: humanParticipants,
    participantsDisplay: humanParticipantsDisplay,
  };
}
