import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { ConditionsHub } from '@/components/conditions';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { getLanguage } from '@/lib/get-language';
import { getConditionsWithTranslations } from '@/lib/translations';
import { getLocaleSync } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { getHreflangAlternates } from '@/components/HreflangTags';

export const revalidate = 3600; // Revalidate every 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const locale = getLocaleSync(lang as LanguageCode);

  return {
    title: locale.conditions?.pageTitle || 'Health Conditions | CBD Portal',
    description: locale.conditions?.pageDescription || 'Explore research-backed information on how CBD may help with anxiety, pain, sleep, inflammation, and 300+ other health conditions.',
    alternates: getHreflangAlternates('/conditions'),
  };
}

export default async function ConditionsPage() {
  const supabase = await createClient();
  const lang = await getLanguage();

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
