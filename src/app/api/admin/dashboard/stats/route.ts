import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface DashboardStats {
  content: {
    articles: number;
    conditions: number;
    studies: number;
    glossaryTerms: number;
    brands: number;
  };
  research: {
    pending: number;
    approved: number;
    rejected: number;
    todayAdded: number;
    withSummaries: number;
    highQuality: number;
  };
  translations: {
    languages: {
      code: string;
      name: string;
      conditionsCoverage: number;
      glossaryCoverage: number;
      totalConditions: number;
      totalGlossary: number;
    }[];
    totalConditions: number;
    totalGlossary: number;
  };
  contentGrowth: {
    month: string;
    studies: number;
    articles: number;
  }[];
  topContent: {
    id: string;
    title: string;
    type: string;
    views: number;
    slug: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    action: string;
    timestamp: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    // Parallel fetch all stats
    const [
      articlesResult,
      conditionsResult,
      studiesResult,
      glossaryResult,
      brandsResult,
      pendingResult,
      approvedResult,
      rejectedResult,
      todayResult,
      withSummariesResult,
      highQualityResult,
      translationStatsResult,
      contentGrowthResult,
      topContentResult,
      recentActivityResult,
    ] = await Promise.all([
      // Content counts
      supabase.from('kb_articles').select('*', { count: 'exact', head: true }),
      supabase.from('kb_conditions').select('*', { count: 'exact', head: true }),
      supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('kb_glossary').select('*', { count: 'exact', head: true }),
      supabase.from('kb_brands').select('*', { count: 'exact', head: true }).eq('is_published', true),

      // Research queue stats
      supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('kb_research_queue').select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gte('discovered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('kb_research_queue').select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .not('plain_summary', 'is', null),
      supabase.from('kb_research_queue').select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('relevance_score', 70),

      // Translation stats
      getTranslationStats(),

      // Content growth (last 6 months)
      getContentGrowth(),

      // Top performing content
      getTopContent(),

      // Recent activity
      getRecentActivity(),
    ]);

    const stats: DashboardStats = {
      content: {
        articles: articlesResult.count || 0,
        conditions: conditionsResult.count || 0,
        studies: studiesResult.count || 0,
        glossaryTerms: glossaryResult.count || 0,
        brands: brandsResult.count || 0,
      },
      research: {
        pending: pendingResult.count || 0,
        approved: approvedResult.count || 0,
        rejected: rejectedResult.count || 0,
        todayAdded: todayResult.count || 0,
        withSummaries: withSummariesResult.count || 0,
        highQuality: highQualityResult.count || 0,
      },
      translations: translationStatsResult,
      contentGrowth: contentGrowthResult,
      topContent: topContentResult,
      recentActivity: recentActivityResult,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Dashboard Stats API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getTranslationStats() {
  const languages = [
    { code: 'da', name: 'Danish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'de', name: 'German' },
    { code: 'nl', name: 'Dutch' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'it', name: 'Italian' },
  ];

  try {
    // Get total counts
    const { count: totalConditions } = await supabase
      .from('kb_conditions')
      .select('*', { count: 'exact', head: true });

    const { count: totalGlossary } = await supabase
      .from('kb_glossary')
      .select('*', { count: 'exact', head: true });

    // Get translation counts per language
    const languageStats = await Promise.all(
      languages.map(async (lang) => {
        try {
          const [conditionsResult, glossaryResult] = await Promise.all([
            supabase
              .from('condition_translations')
              .select('*', { count: 'exact', head: true })
              .eq('language', lang.code),
            supabase
              .from('glossary_translations')
              .select('*', { count: 'exact', head: true })
              .eq('language', lang.code),
          ]);

          return {
            code: lang.code,
            name: lang.name,
            conditionsCoverage: conditionsResult.count || 0,
            glossaryCoverage: glossaryResult.count || 0,
            totalConditions: totalConditions || 0,
            totalGlossary: totalGlossary || 0,
          };
        } catch {
          // If translation tables don't exist, return 0 counts
          return {
            code: lang.code,
            name: lang.name,
            conditionsCoverage: 0,
            glossaryCoverage: 0,
            totalConditions: totalConditions || 0,
            totalGlossary: totalGlossary || 0,
          };
        }
      })
    );

    return {
      languages: languageStats,
      totalConditions: totalConditions || 0,
      totalGlossary: totalGlossary || 0,
    };
  } catch {
    // Fallback if tables don't exist
    return {
      languages: languages.map((lang) => ({
        code: lang.code,
        name: lang.name,
        conditionsCoverage: 0,
        glossaryCoverage: 0,
        totalConditions: 0,
        totalGlossary: 0,
      })),
      totalConditions: 0,
      totalGlossary: 0,
    };
  }
}

async function getContentGrowth() {
  // Get studies approved in the last 6 months, grouped by month
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: studies } = await supabase
    .from('kb_research_queue')
    .select('reviewed_at')
    .eq('status', 'approved')
    .gte('reviewed_at', sixMonthsAgo.toISOString())
    .not('reviewed_at', 'is', null);

  const { data: articles } = await supabase
    .from('kb_articles')
    .select('created_at')
    .gte('created_at', sixMonthsAgo.toISOString());

  // Group by month
  const months: { [key: string]: { studies: number; articles: number } } = {};

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
    months[monthKey] = { studies: 0, articles: 0 };
  }

  // Count studies per month
  studies?.forEach((study) => {
    if (study.reviewed_at) {
      const monthKey = study.reviewed_at.substring(0, 7);
      if (months[monthKey]) {
        months[monthKey].studies++;
      }
    }
  });

  // Count articles per month
  articles?.forEach((article) => {
    if (article.created_at) {
      const monthKey = article.created_at.substring(0, 7);
      if (months[monthKey]) {
        months[monthKey].articles++;
      }
    }
  });

  return Object.entries(months).map(([month, counts]) => ({
    month,
    studies: counts.studies,
    articles: counts.articles,
  }));
}

async function getTopContent() {
  // Try to get view counts from glossary (has view_count field)
  const { data: glossaryViews } = await supabase
    .from('kb_glossary')
    .select('id, term, slug, view_count')
    .not('view_count', 'is', null)
    .order('view_count', { ascending: false })
    .limit(5);

  // Also get conditions with potential view tracking
  const { data: conditionViews } = await supabase
    .from('kb_conditions')
    .select('id, name, slug')
    .limit(5);

  const topContent: DashboardStats['topContent'] = [];

  glossaryViews?.forEach((item) => {
    topContent.push({
      id: item.id,
      title: item.term,
      type: 'glossary',
      views: item.view_count || 0,
      slug: item.slug,
    });
  });

  // Add conditions (without view counts for now)
  conditionViews?.forEach((item) => {
    topContent.push({
      id: item.id,
      title: item.name,
      type: 'condition',
      views: 0, // View tracking to be added
      slug: item.slug,
    });
  });

  return topContent.sort((a, b) => b.views - a.views).slice(0, 10);
}

async function getRecentActivity() {
  const activities: DashboardStats['recentActivity'] = [];

  // Recent approved studies
  const { data: recentStudies } = await supabase
    .from('kb_research_queue')
    .select('id, title, reviewed_at, status')
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false })
    .limit(5);

  recentStudies?.forEach((study) => {
    activities.push({
      id: study.id,
      type: 'study',
      title: study.title?.substring(0, 60) + (study.title?.length > 60 ? '...' : ''),
      action: 'approved',
      timestamp: study.reviewed_at || new Date().toISOString(),
    });
  });

  // Recent articles
  const { data: recentArticles } = await supabase
    .from('kb_articles')
    .select('id, title, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5);

  recentArticles?.forEach((article) => {
    activities.push({
      id: article.id,
      type: 'article',
      title: article.title?.substring(0, 60) + (article.title?.length > 60 ? '...' : ''),
      action: article.status === 'published' ? 'published' : 'created',
      timestamp: article.created_at,
    });
  });

  // Recent glossary terms
  const { data: recentGlossary } = await supabase
    .from('kb_glossary')
    .select('id, term, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  recentGlossary?.forEach((term) => {
    activities.push({
      id: term.id,
      type: 'glossary',
      title: term.term,
      action: 'added',
      timestamp: term.created_at,
    });
  });

  // Sort by timestamp and return top 10
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
}
