import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { CollapsibleScoreBreakdown } from '@/components/CollapsibleScoreBreakdown';
import { MarkdownContent } from '@/components/MarkdownContent';
import { StarRating, OverallStarRating, CategoryStarRating, InlineStarRating } from '@/components/StarRating';
import { KeyHighlights } from '@/components/KeyHighlights';
import { getDomainFromUrl, getCountryWithFlag } from '@/lib/utils/brand-helpers';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbd-portal.vercel.app';

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
  certifications: string[] | null;
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
  about_content: string | null;
  full_review: string | null;
  section_content: Record<string, string> | null;
  pros: string[];
  cons: string[];
  best_for: string[];
  not_ideal_for: string[];
  verdict: string | null;
  recommendation_status: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  last_reviewed_at: string | null;
  trustpilot_score: number | null;
  trustpilot_count: number | null;
  trustpilot_url: string | null;
  google_score: number | null;
  google_count: number | null;
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

function getScoreBadgeColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

const CERTIFICATION_LABELS: Record<string, { name: string; icon: string }> = {
  // Universal certifications
  'gmp': { name: 'GMP Certified', icon: '🏭' },
  'third_party_tested': { name: 'Third-Party Tested', icon: '🔬' },
  'iso_certified': { name: 'ISO Certified', icon: '📜' },
  'non_gmo': { name: 'Non-GMO', icon: '🌱' },
  'vegan': { name: 'Vegan', icon: '🌿' },
  'cruelty_free': { name: 'Cruelty-Free', icon: '🐰' },
  // US-specific
  'usda_organic': { name: 'USDA Organic', icon: '🌿' },
  'us_hemp_authority': { name: 'US Hemp Authority', icon: '✓' },
  // EU/UK-specific
  'eu_organic': { name: 'EU Organic', icon: '🌿' },
  'novel_food': { name: 'Novel Food', icon: '🇪🇺' },
};

// Strip markdown tables from section content (stars are now displayed via React components)
function stripMarkdownTables(text: string): string {
  // Remove markdown table lines (lines starting with | or containing |---|)
  return text
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      // Skip table header/separator lines
      if (trimmed.match(/^\|[\s\-:]+\|$/)) return false;
      // Skip table rows
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) return false;
      return true;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n'); // Clean up extra newlines
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  // Get brand with logo
  const { data: brand } = await supabase
    .from('kb_brands')
    .select('id, name, slug, logo_url')
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
  const { data: review } = await supabase
    .from('kb_brand_reviews')
    .select('overall_score, summary, meta_title, meta_description')
    .eq('brand_id', brand.id)
    .eq('is_published', true)
    .single();

  const currentYear = new Date().getFullYear();
  const score = review?.overall_score || 0;

  // SEO-optimized title: "[Brand] CBD Review 2026 - Rated [X]/100 | CBD Portal"
  const title = review?.meta_title || `${brand.name} CBD Review ${currentYear} - Rated ${score}/100`;

  // SEO-optimized description: 145-155 chars including "[brand] review" keyword
  const defaultDescription = `Read our ${brand.name} review. We tested their CBD products and rated them ${score}/100. See our detailed analysis of quality, testing, and value.`;
  const description = review?.meta_description || defaultDescription;

  const canonicalUrl = `${SITE_URL}/reviews/${slug}`;
  const ogImage = brand.logo_url || `${SITE_URL}/og-default.png`;

  return {
    title: `${title} | CBD Portal`,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      siteName: 'CBD Portal',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${brand.name} CBD Review`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
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
    .select('id, name, slug, website_url, logo_url, headquarters_country, founded_year, short_description, certifications')
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
      about_content,
      full_review,
      section_content,
      pros,
      cons,
      best_for,
      not_ideal_for,
      verdict,
      recommendation_status,
      meta_title,
      meta_description,
      published_at,
      last_reviewed_at,
      trustpilot_score,
      trustpilot_count,
      trustpilot_url,
      google_score,
      google_count,
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

  // Schema.org Review markup - comprehensive for SEO
  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    'name': `${brand.name} CBD Review`,
    'url': `${SITE_URL}/reviews/${slug}`,
    'itemReviewed': {
      '@type': 'Organization',
      'name': brand.name,
      '@id': `${SITE_URL}/reviews/${slug}#organization`,
      ...(brand.logo_url && { 'logo': brand.logo_url }),
      ...(brand.website_url && { 'url': brand.website_url })
    },
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': review.overall_score,
      'bestRating': 100,
      'worstRating': 0
    },
    'author': review.kb_authors ? {
      '@type': 'Person',
      'name': review.kb_authors.name,
      'url': `${SITE_URL}/authors/${review.kb_authors.slug}`
    } : {
      '@type': 'Organization',
      'name': 'CBD Portal',
      'url': SITE_URL
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'CBD Portal',
      'url': SITE_URL,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_URL}/logo.png`
      }
    },
    ...(review.published_at && { 'datePublished': review.published_at }),
    ...(review.last_reviewed_at && { 'dateModified': review.last_reviewed_at }),
    ...(review.summary && { 'reviewBody': review.summary })
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

              {/* Score Badge with Stars */}
              <div className="flex flex-wrap items-center gap-4">
                <div className={`inline-flex items-center px-6 py-3 rounded-xl border-2 ${getScoreBadgeColor(review.overall_score)}`}>
                  <span className="text-4xl font-bold">{review.overall_score}</span>
                  <span className="text-lg ml-1">/100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{getScoreLabel(review.overall_score)}</span>
                    <OverallStarRating score={review.overall_score} />
                  </div>
                  {review.last_reviewed_at && (
                    <div className="text-sm text-gray-500">
                      Last reviewed {formatDate(review.last_reviewed_at)}
                    </div>
                  )}
                </div>

                {/* Trustpilot Badge */}
                {review.trustpilot_score && (
                  <a
                    href={review.trustpilot_url || `https://www.trustpilot.com/review/${brand.website_url ? new URL(brand.website_url).hostname.replace('www.', '') : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#00B67A] text-white rounded-lg hover:bg-[#00a06b] transition-colors"
                    title="View on Trustpilot"
                  >
                    <span className="text-lg font-bold">★ {review.trustpilot_score}</span>
                    <span className="text-sm opacity-90">Trustpilot</span>
                  </a>
                )}
              </div>

              {/* Trust Badges */}
              {brand.certifications && brand.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {brand.certifications.map((cert: string) => {
                    const certInfo = CERTIFICATION_LABELS[cert];
                    if (!certInfo) return null;
                    return (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm border border-green-200"
                        title={certInfo.name}
                      >
                        <span>{certInfo.icon}</span>
                        <span>{certInfo.name}</span>
                      </span>
                    );
                  })}
                </div>
              )}
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

          {/* Key Highlights - for quick scanning */}
          <KeyHighlights scoreBreakdown={scoreBreakdown} />

          {/* About the Brand */}
          {review.about_content && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {brand.name}</h2>
              <p className="text-gray-700 leading-relaxed">{review.about_content}</p>
            </div>
          )}

          {/* Best For / Not Ideal For */}
          {((review.best_for && review.best_for.length > 0) || (review.not_ideal_for && review.not_ideal_for.length > 0)) && (
            <div className="grid md:grid-cols-2 gap-6">
              {review.best_for && review.best_for.length > 0 && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                  <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">👍</span>
                    Best For
                  </h2>
                  <ul className="space-y-3">
                    {review.best_for.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span className="text-blue-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.not_ideal_for && review.not_ideal_for.length > 0 && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                  <h2 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">👎</span>
                    Not Ideal For
                  </h2>
                  <ul className="space-y-3">
                    {review.not_ideal_for.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span className="text-amber-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Third-Party Reviews */}
          {(review.trustpilot_score || review.google_score) && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
              <p className="text-sm text-gray-500 mb-4">What customers are saying on third-party review platforms</p>
              <div className="grid sm:grid-cols-2 gap-6">
                {review.trustpilot_score && (
                  <a
                    href={review.trustpilot_url || `https://www.trustpilot.com/review/${brand.website_url ? new URL(brand.website_url).hostname.replace('www.', '') : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-[#00B67A] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl font-bold">★</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        Trustpilot
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{review.trustpilot_score}</span>
                        <span className="text-gray-500">/5</span>
                      </div>
                      {review.trustpilot_count && (
                        <div className="text-xs text-gray-400">
                          Based on {review.trustpilot_count.toLocaleString()} reviews
                        </div>
                      )}
                    </div>
                  </a>
                )}
                {review.google_score && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl font-bold">G</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Google Reviews</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{review.google_score}</span>
                        <span className="text-gray-500">/5</span>
                      </div>
                      {review.google_count && (
                        <div className="text-xs text-gray-400">
                          Based on {review.google_count.toLocaleString()} reviews
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Score Breakdown</h2>
            <p className="text-sm text-gray-500 mb-4">Click on a category to see sub-scores and details</p>
            <CollapsibleScoreBreakdown scoreBreakdown={scoreBreakdown} />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href="/reviews/methodology" className="text-sm text-green-600 hover:text-green-700">
                Learn about our 100-point scoring methodology →
              </Link>
            </div>
          </div>

          {/* Pros and Cons */}
          {(review.pros?.length > 0 || review.cons?.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              {review.pros?.length > 0 && (
                <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                  <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    Pros
                  </h2>
                  <ul className="space-y-3">
                    {review.pros.map((pro: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-green-600 mt-0.5 text-lg">✅</span>
                        <span className="text-green-900">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.cons?.length > 0 && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">❌</span>
                    Cons
                  </h2>
                  <ul className="space-y-3">
                    {review.cons.map((con: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-red-600 mt-0.5 text-lg">❌</span>
                        <span className="text-red-900">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Full Review - Section Based */}
          {(review.section_content && Object.keys(review.section_content).length > 0) ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Full Review</h2>
              <div className="space-y-10">
                {scoreBreakdown.map(criterion => {
                  const sectionText = (review.section_content as Record<string, string>)[criterion.id];
                  if (!sectionText) return null;
                  return (
                    <div key={criterion.id} className="relative">
                      {/* Floated Star Summary Box */}
                      <div className="float-right ml-4 mb-3 bg-gray-50 rounded-lg border border-gray-200 p-3 w-auto">
                        <CategoryStarRating
                          score={criterion.score}
                          maxScore={criterion.max_points}
                          colorCode={true}
                        />
                      </div>

                      {/* Section Header */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {criterion.name}
                      </h3>

                      {/* Sub-scores with compact inline format */}
                      {criterion.subcriteria && criterion.subcriteria.length > 0 && Object.keys(criterion.sub_scores || {}).length > 0 && (
                        <div className="space-y-1.5 mb-4 clear-right">
                          {criterion.subcriteria.map(sub => (
                            <div key={sub.id} className="flex items-center gap-2 text-sm">
                              <span className="text-gray-700">{sub.name}</span>
                              <InlineStarRating
                                score={criterion.sub_scores[sub.id] ?? 0}
                                maxScore={sub.max_points}
                                colorCode={true}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="clear-both">
                        <MarkdownContent className="prose prose-sm max-w-none prose-green prose-p:text-gray-700">
                          {stripMarkdownTables(sectionText)}
                        </MarkdownContent>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : review.full_review && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Full Review</h2>
              {/* Parse full_review by section headers and add stars */}
              <div className="space-y-10">
                {(() => {
                  // Split markdown by ## headers
                  const sections = review.full_review.split(/(?=^## )/m).filter(Boolean);
                  return sections.map((section: string, idx: number) => {
                    // Extract header name (e.g., "Quality & Testing" from "## Quality & Testing — 8/20")
                    const headerMatch = section.match(/^## ([^—\n]+)/);
                    const headerName = headerMatch?.[1]?.trim();

                    // Find matching criterion by name
                    const criterion = headerName
                      ? scoreBreakdown.find(c => c.name.toLowerCase() === headerName.toLowerCase())
                      : null;

                    // Remove the header line from section content (we'll render it ourselves)
                    const contentWithoutHeader = section.replace(/^## [^\n]+\n*/, '');

                    return (
                      <div key={idx} className="relative">
                        {headerName && criterion && (
                          <>
                            {/* Floated Star Summary Box */}
                            <div className="float-right ml-4 mb-3 bg-gray-50 rounded-lg border border-gray-200 p-3 w-auto">
                              <CategoryStarRating
                                score={criterion.score}
                                maxScore={criterion.max_points}
                                colorCode={true}
                              />
                            </div>

                            {/* Section Header */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              {criterion.name}
                            </h3>

                            {/* Sub-scores with compact inline format */}
                            {criterion.subcriteria && criterion.subcriteria.length > 0 && Object.keys(criterion.sub_scores || {}).length > 0 && (
                              <div className="space-y-1.5 mb-4 clear-right">
                                {criterion.subcriteria.map(sub => (
                                  <div key={sub.id} className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-700">{sub.name}</span>
                                    <InlineStarRating
                                      score={criterion.sub_scores[sub.id] ?? 0}
                                      maxScore={sub.max_points}
                                      colorCode={true}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                        <div className="clear-both">
                          <MarkdownContent className="prose prose-sm max-w-none prose-green prose-p:text-gray-700">
                            {stripMarkdownTables(contentWithoutHeader)}
                          </MarkdownContent>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Verdict */}
          {review.verdict && (
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 text-white">
              <h2 className="text-xl font-bold mb-4">My Final Verdict on {brand.name}</h2>

              {/* Score display */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-green-500/30">
                <div className="text-5xl font-bold">{review.overall_score}/100</div>
                <div>
                  <OverallStarRating score={review.overall_score} />
                  <div className="text-green-200 mt-1">{getScoreLabel(review.overall_score)}</div>
                </div>
              </div>

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
