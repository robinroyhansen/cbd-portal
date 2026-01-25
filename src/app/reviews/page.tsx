import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ReviewsClient } from './ReviewsClient';

export const revalidate = 3600; // Revalidate every 1 hour

export const metadata: Metadata = {
  title: 'CBD Brand Reviews | Independent Expert Analysis | CBD Portal',
  description: 'Independent, expert CBD brand reviews using our comprehensive 100-point scoring system. We evaluate quality, transparency, value, and more.',
  openGraph: {
    title: 'CBD Brand Reviews',
    description: 'Independent, expert CBD brand reviews using our comprehensive 100-point scoring system.',
    type: 'website',
  },
};

interface Brand {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  logo_url: string | null;
  short_description: string | null;
  headquarters_country: string | null;
}

interface Author {
  id: string;
  name: string;
  slug: string;
}

interface Review {
  id: string;
  overall_score: number;
  summary: string | null;
  published_at: string | null;
  last_reviewed_at: string | null;
  brand: Brand;
  author: Author | null;
}

export default async function ReviewsPage() {
  const supabase = await createClient();

  // Fetch initial reviews (sorted by score, no filter)
  const { data: reviewsData } = await supabase
    .from('kb_brand_reviews')
    .select(`
      id,
      overall_score,
      summary,
      published_at,
      last_reviewed_at,
      kb_brands!inner (
        id,
        name,
        slug,
        website_url,
        logo_url,
        short_description,
        headquarters_country
      ),
      kb_authors (
        id,
        name,
        slug
      )
    `)
    .eq('is_published', true)
    .order('overall_score', { ascending: false });

  // Transform data to match expected format
  const reviews: Review[] = (reviewsData || []).map((review: any) => ({
    id: review.id,
    overall_score: review.overall_score,
    summary: review.summary,
    published_at: review.published_at,
    last_reviewed_at: review.last_reviewed_at,
    brand: {
      id: review.kb_brands.id,
      name: review.kb_brands.name,
      slug: review.kb_brands.slug,
      website_url: review.kb_brands.website_url,
      logo_url: review.kb_brands.logo_url,
      short_description: review.kb_brands.short_description,
      headquarters_country: review.kb_brands.headquarters_country,
    },
    author: review.kb_authors ? {
      id: review.kb_authors.id,
      name: review.kb_authors.name,
      slug: review.kb_authors.slug,
    } : null,
  }));

  return <ReviewsClient initialReviews={reviews} />;
}
