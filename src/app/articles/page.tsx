import { Metadata } from 'next';
import { getArticles, getCategories } from '@/lib/articles';
import { getLanguage } from '@/lib/get-language';
import { ArticlesHub } from '@/components/articles/ArticlesHub';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

// Force dynamic to support language persistence via cookies
export const dynamic = 'force-dynamic';

interface ArticlesPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const lang = (params.lang || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  return {
    title: t('articlesPage.pageTitle') || 'CBD Articles & Guides | Evidence-Based Information',
    description: t('articlesPage.pageDescription') || 'Browse our complete collection of evidence-based articles about CBD, cannabidiol research, dosage guides, and wellness information.',
    alternates: getHreflangAlternates('/articles'),
  };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;

  // Get language from URL param, or fall back to cookie/hostname detection
  const language = params.lang || await getLanguage();

  // Fetch articles and categories for the detected language
  const { data: articles } = await getArticles(language);
  const { data: categories } = await getCategories(language);

  return (
    <ArticlesHub
      articles={articles || []}
      categories={categories || []}
      lang={language}
    />
  );
}
