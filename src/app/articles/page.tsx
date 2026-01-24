import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getArticles, getCategories } from '@/lib/articles';
import { getLanguageFromHostname } from '@/lib/language';
import { ArticlesHub } from '@/components/articles/ArticlesHub';

export const metadata: Metadata = {
  title: 'CBD Articles & Guides | Evidence-Based Information',
  description:
    'Browse our complete collection of evidence-based articles about CBD, cannabidiol research, dosage guides, and wellness information.',
};

export default async function ArticlesPage() {
  // Get hostname from headers to detect language
  const headersList = headers();
  const host = headersList.get('host') || 'localhost';
  const language = getLanguageFromHostname(host);

  // Fetch articles and categories for the detected language
  const { data: articles } = await getArticles(language);
  const { data: categories } = await getCategories(language);

  return (
    <ArticlesHub
      articles={articles || []}
      categories={categories || []}
    />
  );
}
