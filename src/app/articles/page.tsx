import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getArticles, getCategories } from '@/lib/articles';
import { getLanguageFromHostname } from '@/lib/language';
import { ArticlesHub } from '@/components/articles/ArticlesHub';
import { getHreflangAlternates } from '@/components/HreflangTags';

export const revalidate = 1800; // Revalidate every 30 minutes

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

  // Get language from URL param first, then fallback to hostname
  let language = params.lang;
  if (!language) {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost';
    language = getLanguageFromHostname(host);
  }

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
