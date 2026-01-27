import { Metadata } from 'next';
import { headers } from 'next/headers';
import { Hero } from '@/components/home/Hero';
import { TrendingTopics } from '@/components/home/TrendingTopics';
import { BrowseByCondition } from '@/components/home/BrowseByCondition';
import { FeaturedArticles } from '@/components/home/FeaturedArticles';
import { LatestResearch } from '@/components/home/LatestResearch';
import { GlossaryTeaser } from '@/components/home/GlossaryTeaser';
import { BrowseByProduct } from '@/components/home/BrowseByProduct';
import { AuthorTrust } from '@/components/home/AuthorTrust';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { getHomePageStats } from '@/lib/stats';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLanguageFromHostname } from '@/lib/language';

// Force dynamic rendering to support language switching via ?lang= parameter
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: getHreflangAlternates('/'),
  };
}

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const stats = await getHomePageStats();
  const params = await searchParams;

  // Get language from URL param, or fall back to hostname-based detection
  let lang = params.lang;
  if (!lang) {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost';
    lang = getLanguageFromHostname(host.split(':')[0]);
  }

  return (
    <>
      <Hero stats={stats} />
      <TrendingTopics lang={lang} />
      <BrowseByCondition lang={lang} />
      <FeaturedArticles lang={lang} />
      <LatestResearch lang={lang} />
      <GlossaryTeaser lang={lang} />
      <BrowseByProduct lang={lang} />
      <AuthorTrust lang={lang} />
      <NewsletterSignup />
    </>
  );
}