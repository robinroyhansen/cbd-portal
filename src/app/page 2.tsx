import { Hero } from '@/components/home/Hero';
import { BrowseByCondition } from '@/components/home/BrowseByCondition';
import { FeaturedArticles } from '@/components/home/FeaturedArticles';
import { LatestResearch } from '@/components/home/LatestResearch';
import { BrowseByProduct } from '@/components/home/BrowseByProduct';
import { AuthorTrust } from '@/components/home/AuthorTrust';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { getHomePageStats } from '@/lib/stats';

// Revalidate stats every hour
export const revalidate = 3600;

export default async function HomePage() {
  const stats = await getHomePageStats();

  return (
    <>
      <Hero stats={stats} />
      <BrowseByCondition />
      <FeaturedArticles />
      <BrowseByProduct />
      <LatestResearch />
      <AuthorTrust />
      <NewsletterSignup />
    </>
  );
}