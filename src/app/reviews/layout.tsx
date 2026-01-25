import { Metadata } from 'next';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CBD Brand Reviews | Independent Expert Ratings',
    description: 'Independent CBD brand reviews with our 100-point scoring system. Compare quality, transparency, value, and customer experience across top brands.',
    alternates: getHreflangAlternates('/reviews'),
  };
}

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
