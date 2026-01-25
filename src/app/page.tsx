import { Metadata } from 'next';
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

// Revalidate stats every 5 minutes
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: getHreflangAlternates('/'),
  };
}

export default async function HomePage() {
  const stats = await getHomePageStats();

  return (
    <>
      <Hero stats={stats} />
      <TrendingTopics />
      <BrowseByCondition />
      <FeaturedArticles />
      <LatestResearch />
      <GlossaryTeaser />
      <BrowseByProduct />
      <AuthorTrust />
      <NewsletterSignup />
    </>
  );
}