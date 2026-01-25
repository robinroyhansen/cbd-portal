import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/translation-service';

// Exclude English from translation targets (it's the source language)
const TARGET_LANGUAGES = Object.keys(SUPPORTED_LANGUAGES).filter(
  (lang) => lang !== 'en'
) as LanguageCode[];

export interface ContentTypeStats {
  total: number;
  translated: Record<LanguageCode, number>;
  missing: Record<LanguageCode, number>;
  percentage: Record<LanguageCode, number>;
}

export interface TranslationStatusResponse {
  conditions: ContentTypeStats;
  glossary: ContentTypeStats;
  articles: ContentTypeStats;
  research: ContentTypeStats;
  overall: {
    totalItems: number;
    totalTranslations: number;
    averagePercentage: number;
    byLanguage: Record<
      LanguageCode,
      {
        total: number;
        translated: number;
        percentage: number;
      }
    >;
  };
  languages: Array<{
    code: LanguageCode;
    name: string;
    nativeName: string;
    domain: string;
  }>;
}

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type') as
      | 'conditions'
      | 'glossary'
      | 'articles'
      | 'research'
      | null;
    const language = searchParams.get('language') as LanguageCode | null;

    // Get total counts for source content
    const [
      conditionsCount,
      glossaryCount,
      articlesCount,
      researchCount,
    ] = await Promise.all([
      supabase
        .from('kb_conditions')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true),
      supabase
        .from('kb_glossary')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('kb_articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .not('plain_summary', 'is', null),
    ]);

    const totals = {
      conditions: conditionsCount.count || 0,
      glossary: glossaryCount.count || 0,
      articles: articlesCount.count || 0,
      research: researchCount.count || 0,
    };

    // Helper to get translation counts by language
    async function getTranslationCounts(
      tableName: string,
      languageColumn: string = 'language'
    ): Promise<Record<string, number>> {
      const { data } = await supabase
        .from(tableName)
        .select(languageColumn);

      const counts: Record<string, number> = {};
      TARGET_LANGUAGES.forEach((lang) => {
        counts[lang] = 0;
      });

      if (data) {
        data.forEach((row: Record<string, string>) => {
          const lang = row[languageColumn];
          if (lang && counts[lang] !== undefined) {
            counts[lang]++;
          }
        });
      }

      return counts;
    }

    // Get translation counts for each content type
    const [
      conditionTranslations,
      glossaryTranslations,
      articleTranslations,
      researchTranslations,
    ] = await Promise.all([
      getTranslationCounts('condition_translations'),
      getTranslationCounts('glossary_translations'),
      getTranslationCounts('article_translations'),
      getTranslationCounts('research_translations'),
    ]);

    // Build stats for each content type
    function buildStats(
      total: number,
      translations: Record<string, number>
    ): ContentTypeStats {
      const translated: Record<string, number> = {};
      const missing: Record<string, number> = {};
      const percentage: Record<string, number> = {};

      TARGET_LANGUAGES.forEach((lang) => {
        const count = translations[lang] || 0;
        translated[lang] = count;
        missing[lang] = Math.max(0, total - count);
        percentage[lang] = total > 0 ? Math.round((count / total) * 100) : 0;
      });

      return {
        total,
        translated: translated as Record<LanguageCode, number>,
        missing: missing as Record<LanguageCode, number>,
        percentage: percentage as Record<LanguageCode, number>,
      };
    }

    const conditionsStats = buildStats(totals.conditions, conditionTranslations);
    const glossaryStats = buildStats(totals.glossary, glossaryTranslations);
    const articlesStats = buildStats(totals.articles, articleTranslations);
    const researchStats = buildStats(totals.research, researchTranslations);

    // Calculate overall stats
    const totalItems =
      totals.conditions + totals.glossary + totals.articles + totals.research;

    const byLanguage: Record<
      string,
      { total: number; translated: number; percentage: number }
    > = {};
    let totalTranslationsSum = 0;
    let totalPossibleTranslations = 0;

    TARGET_LANGUAGES.forEach((lang) => {
      const translated =
        (conditionTranslations[lang] || 0) +
        (glossaryTranslations[lang] || 0) +
        (articleTranslations[lang] || 0) +
        (researchTranslations[lang] || 0);
      const total = totalItems;

      byLanguage[lang] = {
        total,
        translated,
        percentage: total > 0 ? Math.round((translated / total) * 100) : 0,
      };

      totalTranslationsSum += translated;
      totalPossibleTranslations += total;
    });

    const averagePercentage =
      totalPossibleTranslations > 0
        ? Math.round((totalTranslationsSum / totalPossibleTranslations) * 100)
        : 0;

    // Build response
    const response: TranslationStatusResponse = {
      conditions: conditionsStats,
      glossary: glossaryStats,
      articles: articlesStats,
      research: researchStats,
      overall: {
        totalItems,
        totalTranslations: totalTranslationsSum,
        averagePercentage,
        byLanguage: byLanguage as Record<
          LanguageCode,
          { total: number; translated: number; percentage: number }
        >,
      },
      languages: TARGET_LANGUAGES.map((code) => ({
        code,
        name: SUPPORTED_LANGUAGES[code].name,
        nativeName: SUPPORTED_LANGUAGES[code].nativeName,
        domain: SUPPORTED_LANGUAGES[code].domain,
      })),
    };

    // If specific content type requested, return filtered response
    if (contentType && response[contentType]) {
      return NextResponse.json({
        [contentType]: response[contentType],
        languages: response.languages,
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get translation status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get translation status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
