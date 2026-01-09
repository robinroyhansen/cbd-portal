import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import ReactMarkdown from 'react-markdown';
import { getDomainFromUrl, getCountryWithFlag } from '@/lib/utils/brand-helpers';

interface Props {
  params: Promise<{ slug: string }>;
}

interface ScoreBreakdown {
  id: string;
  name: string;
  description: string;
  max_points: number;
  score: number;
  subcriteria: { id: string; name: string; max_points: number; description: string }[];
  sub_scores: Record<string, number>;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  logo_url: string | null;
  headquarters_country: string | null; // ISO code
  founded_year: number | null;
  short_description: string | null;
}

interface Author {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  image_url: string | null;
  bio_short: string | null;
}

interface Review {
  id: string;
  overall_score: number;
  summary: string | null;
  full_review: string | null;
  pros: string[];
  cons: string[];
  verdict: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  last_reviewed_at: string | null;
  kb_authors: Author | null;
  scoreBreakdown: ScoreBreakdown[];
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Below Average';
}

function getScoreColor(score: number, maxPoints: number): string {
  const percentage = (score / maxPoints) * 100;
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-yellow-500';
  if (percentage >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreBadgeColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  // Get brand
  const { data: brand } = await supabase
    .from('kb_brands')
    .select('name, slug')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!brand) {
    return {
      title: 'Review Not Found | CBD Portal',
      robots: { index: false, follow: false }
    };
  }

  // Get review
  const { data: brandWithId } = await supabase
    .from('kb_brands')
    .select('id')
    .eq('slug', slug)
    .single();

  const { data: review } = await supabase
    .from('kb_brand_reviews')
    .select('overall_score, meta_title, meta_description')
    .eq('brand_id', brandWithId?.id)
    .eq('is_published', true)
    .single();

  const title = review?.meta_title || `${brand.name} Review ${new Date().getFullYear()} - Score ${review?.overall_score || 0}/100`;
  const description = review?.meta_description || `Independent review of ${brand.name} CBD products. Overall score: ${review?.overall_score || 0}/100. Read our detailed analysis of quality, value, and transparency.`;

  return {
    title: `${title} | CBD Portal`,
    description,
    alternates: {
      canonical: `/reviews/${slug}`
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/reviews/${slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function BrandReviewPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the review data from API-style query
  const { data: brand } = await supabase
    .from('kb_brands')
    .select('id, name, slug, website_url, logo_url, headquarters_country, founded_year, short_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!brand) {
    notFound();
  }

  // Get the review
  const { data: review } = await supabase
    .from('kb_brand_reviews')
    .select(`
      id,
      overall_score,
      summary,
      full_review,
      pros,
      cons,
      verdict,
      meta_title,
      meta_description,
      published_at,
      last_reviewed_at,
      kb_authors (
        id,
        name,
        slug,
        title,
        image_url,
        bio_short
      )
    `)
    .eq('brand_id', brand.id)
    .eq('is_published', true)
    .single();

  if (!review) {
    notFound();
  }

  // Get criteria and scores
  const { data: criteria } = await supabase
    .from('kb_review_criteria')
    .select('id, name, description, max_points, display_order, subcriteria')
    .order('display_order', { ascending: true });

  const { data: scores } = await supabase
    .from('kb_brand_review_scores')
    .select('criterion_id, score, sub_scores')
    .eq('brand_review_id', review.id);

  // Map scores to criteria
  const scoreMap: Record<string, { score: number; sub_scores: Record<string, number> }> = {};
  scores?.forEach(s => {
    scoreMap[s.criterion_id] = {
      score: s.score,
      sub_scores: (s.sub_scores as Record<string, number>) || {}
    };
  });

  const scoreBreakdown: ScoreBreakdown[] = (criteria || []).map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    max_points: c.max_points,
    score: scoreMap[c.id]?.score || 0,
    subcriteria: c.subcriteria || [],
    sub_scores: scoreMap[c.id]?.sub_scores || {}
  }));

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Reviews', href: '/reviews' },
    { name: brand.name, href: `/reviews/${slug}` }
  ];

  // Schema.org Review markup
  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    'itemReviewed': {
      '@type': 'Brand',
      'name': brand.name,
      ...(brand.logo_url && { 'logo': brand.logo_url })
    },
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': review.overall_score,
      'bestRating': 100,
      'worstRating': 0
    },
    ...(review.kb_authors && {
      'author': {
        '@type': 'Person',
        'name': review.kb_authors.name
      }
    }),
    ...(review.published_at && {
      'datePublished': review.published_at
    }),
    ...(review.last_reviewed_at && {
      'dateModified': review.last_reviewed_at
    }),
    'publisher': {
      '@type': 'Organization',
      'name': 'CBD Portal'
    },
    ...(review.summary && { 'description': review.summary })
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Brand Logo */}
            <div className="flex-shrink-0">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-contain bg-gray-50 border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                  {brand.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {brand.name} Review
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-gray-500 mb-4">
                {brand.website_url && (
                  <span className="text-sm">{getDomainFromUrl(brand.website_url)}</span>
                )}
                {brand.headquarters_country && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm">{getCountryWithFlag(brand.headquarters_country)}</span>
                  </>
                )}
                {brand.founded_year && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm">Est. {brand.founded_year}</span>
                  </>
                )}
              </div>

              {/* Score Badge */}
              <div className="flex items-center gap-4">
                <div className={`inline-flex items-center px-6 py-3 rounded-xl border-2 ${getScoreBadgeColor(review.overall_score)}`}>
                  <span className="text-4xl font-bold">{review.overall_score}</span>
                  <span className="text-lg ml-1">/100</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{getScoreLabel(review.overall_score)}</div>
                  {review.last_reviewed_at && (
                    <div className="text-sm text-gray-500">
                      Last reviewed {formatDate(review.last_reviewed_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Summary */}
          {review.summary && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
              <p className="text-lg text-gray-700 leading-relaxed">{review.summary}</p>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Score Breakdown</h2>
            <div className="space-y-6">
              {scoreBreakdown.map(criterion => (
                <div key={criterion.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{criterion.name}</span>
                      <span className="text-sm text-gray-400">({criterion.max_points} pts max)</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {criterion.score}/{criterion.max_points}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreColor(criterion.score, criterion.max_points)}`}
                      style={{ width: `${(criterion.score / criterion.max_points) * 100}%` }}
                    />
                  </div>
                  {/* Sub-scores */}
                  {criterion.subcriteria && criterion.subcriteria.length > 0 && Object.keys(criterion.sub_scores).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
                      {criterion.subcriteria.map(sub => (
                        <div key={sub.id} className="bg-gray-50 rounded-lg px-3 py-2">
                          <div className="text-xs text-gray-500 truncate" title={sub.name}>{sub.name}</div>
                          <div className="text-sm font-medium text-gray-900">
                            {criterion.sub_scores[sub.id] ?? 0}/{sub.max_points}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {criterion.description && (
                    <p className="text-sm text-gray-500 mt-2">{criterion.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pros and Cons */}
          {(review.pros?.length > 0 || review.cons?.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              {review.pros?.length > 0 && (
                <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                  <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <span className="text-green-600 text-xl">+</span>
                    Pros
                  </h2>
                  <ul className="space-y-3">
                    {review.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span className="text-green-900">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.cons?.length > 0 && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                    <span className="text-red-600 text-xl">-</span>
                    Cons
                  </h2>
                  <ul className="space-y-3">
                    {review.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-red-600 mt-0.5">✗</span>
                        <span className="text-red-900">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Full Review */}
          {review.full_review && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Full Review</h2>
              <div className="prose max-w-none prose-green prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-green-600">
                <ReactMarkdown>{review.full_review}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Verdict */}
          {review.verdict && (
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 text-white">
              <h2 className="text-xl font-bold mb-4">Our Verdict</h2>
              <p className="text-lg text-green-50 leading-relaxed">{review.verdict}</p>
            </div>
          )}

          {/* Author Attribution */}
          {review.kb_authors && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                {review.kb_authors.image_url ? (
                  <img
                    src={review.kb_authors.image_url}
                    alt={review.kb_authors.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-400">
                    {review.kb_authors.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Reviewed by</div>
                  <Link
                    href={`/authors/${review.kb_authors.slug}`}
                    className="font-semibold text-gray-900 hover:text-green-600"
                  >
                    {review.kb_authors.name}
                  </Link>
                  {review.kb_authors.title && (
                    <div className="text-sm text-gray-500">{review.kb_authors.title}</div>
                  )}
                </div>
              </div>
              {review.kb_authors.bio_short && (
                <p className="mt-4 text-sm text-gray-600">{review.kb_authors.bio_short}</p>
              )}
            </div>
          )}

          {/* Back to Reviews */}
          <div className="text-center pt-8">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to All Reviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
