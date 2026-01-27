import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { ConditionsHub } from '@/components/conditions';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { getLanguage } from '@/lib/get-language';
import { getConditionsWithTranslations } from '@/lib/translations';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLanguageFromHostname } from '@/lib/language';

// Force dynamic rendering to support language switching via ?lang= parameter
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const locale = getLocaleSync(lang as LanguageCode);

  return {
    title: locale.conditions?.pageTitle || 'Health Conditions | CBD Portal',
    description: locale.conditions?.pageDescription || 'Explore research-backed information on how CBD may help with anxiety, pain, sleep, inflammation, and 300+ other health conditions.',
    alternates: getHreflangAlternates('/conditions'),
  };
}

export default async function ConditionsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  // Get language from URL param, or fall back to hostname-based detection
  let lang: LanguageCode = (params.lang as LanguageCode) || 'en';
  if (!params.lang) {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost';
    lang = getLanguageFromHostname(host.split(':')[0]) as LanguageCode;
  }

  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  // Get all published conditions with translations applied
  const conditions = await getConditionsWithTranslations(lang as LanguageCode);

  // Get total research studies count
  const { count: totalStudies } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  // Get article counts per condition (using condition_slug field)
  const { data: articleCountsData } = await supabase
    .from('kb_articles')
    .select('condition_slug')
    .eq('status', 'published')
    .not('condition_slug', 'is', null);

  // Count articles per condition slug
  const articleCounts: Record<string, number> = {};
  if (articleCountsData) {
    articleCountsData.forEach(article => {
      if (article.condition_slug) {
        // Find condition with matching slug
        const condition = conditions.find(c => c.slug === article.condition_slug);
        if (condition) {
          articleCounts[condition.id] = (articleCounts[condition.id] || 0) + 1;
        }
      }
    });
  }

  // Merge article counts into conditions
  const conditionsWithCounts = conditions.map(condition => ({
    ...condition,
    // research_count is already set in the database
    article_count: articleCounts[condition.id] || 0,
  }));

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Health Conditions', url: 'https://cbd-portal.vercel.app/conditions' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />
      <ConditionsHub
        conditions={conditionsWithCounts}
        totalStudies={totalStudies || 0}
      />
    </div>
  );
}
