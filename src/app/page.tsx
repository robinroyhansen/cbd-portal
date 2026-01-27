import { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
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
import { detectLanguage } from '@/lib/language';

// Force dynamic rendering to support language switching via ?lang= parameter
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: getHreflangAlternates('/'),
  };
}

export default async function HomePage() {
  const stats = await getHomePageStats();
  const headersList = await headers();
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const lang = detectLanguage(headersList, localeCookie);

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