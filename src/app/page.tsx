import { Hero } from '@/components/home/Hero';
import { BrowseByCondition } from '@/components/home/BrowseByCondition';
import { FeaturedArticles } from '@/components/home/FeaturedArticles';
import { LatestResearch } from '@/components/home/LatestResearch';
import { BrowseByProduct } from '@/components/home/BrowseByProduct';
import { AuthorTrust } from '@/components/home/AuthorTrust';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrowseByCondition />
      <FeaturedArticles />
      <BrowseByProduct />
      <LatestResearch />
      <AuthorTrust />
      <NewsletterSignup />
    </>
  );
}