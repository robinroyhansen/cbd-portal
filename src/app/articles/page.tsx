import { Metadata } from 'next';
import { getArticles, getCategories } from '@/lib/articles';
import { getLanguage } from '@/lib/get-language';
import { ArticlesHub } from '@/components/articles/ArticlesHub';
import { getHreflangAlternates } from '@/components/HreflangTags';

// Force dynamic to support language persistence via cookies
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CBD Articles & Guides | Evidence-Based Information',
    description:
      'Browse our complete collection of evidence-based articles about CBD, cannabidiol research, dosage guides, and wellness information.',
    alternates: getHreflangAlternates('/articles'),
  };
}

interface ArticlesPageProps {
  searchParams: Promise<{ lang?: string }>;
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
