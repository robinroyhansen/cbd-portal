import { createClient } from '@/lib/supabase/server';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { CollapsibleScoreBreakdown } from '@/components/CollapsibleScoreBreakdown';
import { MarkdownContent } from '@/components/MarkdownContent';
import { StarRating, OverallStarRating, CategoryStarRating, InlineStarRating } from '@/components/StarRating';
import { ReadingProgress, BackToTopButton } from '@/components/ReadingProgress';
import { RelatedReviews } from '@/components/RelatedReviews';
import { FAQAccordion } from '@/components/FAQAccordion';
import { TableOfContents } from '@/components/TableOfContents';
import { getDomainFromUrl } from '@/lib/utils/brand-helpers';
import { generateFAQs, generateFAQSchema } from '@/lib/utils/faq-generator';
import { formatDate } from '@/lib/locale';
import { getHreflangAlternates } from '@/components/HreflangTags';

export const revalidate = 86400; // Revalidate every 24 hours

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbd-portal.vercel.app';

// Convert criterion name to section ID for TOC linking
// e.g., "Quality & Testing" -> "section-quality-testing"
function getSectionId(name: string): string {
  return 'section-' + name
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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

// Using formatDate from @/lib/locale - wrapper to handle null
function formatDateSafe(dateString: string | null): string {
  if (!dateString) return '';
  return formatDate(dateString);
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
    .select('overall_score, summary, meta_title, meta_description, last_reviewed_at, published_at')
    .eq('brand_id', brand.id)
    .eq('is_published', true)
    .single();

  // Determine review year: last_reviewed_at → published_at → current year
  const reviewYear = review?.last_reviewed_at
    ? new Date(review.last_reviewed_at).getFullYear()
    : review?.published_at
    ? new Date(review.published_at).getFullYear()
    : new Date().getFullYear();

  // SEO-optimized title: curiosity-driven, don't reveal score (higher CTR)
  const defaultTitle = `${brand.name} CBD Review ${reviewYear}: Is It Worth It? (Honest Analysis)`;
  const title = review?.meta_title || defaultTitle;

  // SEO-optimized description: curiosity-driven, 145-155 chars
  const defaultDescription = `We tested ${brand.name} CBD products and analyzed their lab reports, pricing, and customer reviews. Read our honest verdict before buying.`;
  const description = review?.meta_description || defaultDescription;

  const canonicalUrl = `${SITE_URL}/reviews/${slug}`;
  const ogImage = brand.logo_url || `${SITE_URL}/og-default.png`;

  // Get hreflang alternates with canonical
  const hreflangAlternates = getHreflangAlternates(`/reviews/${slug}`);

  return {
    title: `${title} | CBD Portal`,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangAlternates.languages,
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

  // Determine review year: last_reviewed_at → published_at → current year
  const reviewYear = review.last_reviewed_at
    ? new Date(review.last_reviewed_at).getFullYear()
    : review.published_at
    ? new Date(review.published_at).getFullYear()
    : new Date().getFullYear();

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

  // Fetch related reviews - prioritize same country, then similar score range
  const { data: relatedBrands } = await supabase
    .from('kb_brands')
    .select(`
      id,
      name,
      slug,
      logo_url,
      headquarters_country,
      kb_brand_reviews!inner (
        overall_score,
        is_published
      )
    `)
    .eq('is_published', true)
    .eq('kb_brand_reviews.is_published', true)
    .neq('id', brand.id)
    .limit(8);

  // Transform and sort related brands (same country first, then by score proximity)
  const transformedRelated = (relatedBrands || []).map(b => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo_url: b.logo_url,
    headquarters_country: b.headquarters_country,
    overall_score: (b.kb_brand_reviews as unknown as { overall_score: number })?.overall_score || 0
  })).sort((a, b) => {
    // Prioritize same country
    const aCountry = a.headquarters_country === brand.headquarters_country ? 0 : 1;
    const bCountry = b.headquarters_country === brand.headquarters_country ? 0 : 1;
    if (aCountry !== bCountry) return aCountry - bCountry;
    // Then by score proximity
    const aDiff = Math.abs(a.overall_score - review.overall_score);
    const bDiff = Math.abs(b.overall_score - review.overall_score);
    return aDiff - bDiff;
  });

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

  // Generate FAQs for SEO
  const faqs = generateFAQs(
    {
      name: brand.name,
      headquarters_country: brand.headquarters_country,
      founded_year: brand.founded_year,
      certifications: brand.certifications,
      website_url: brand.website_url
    },
    {
      overall_score: review.overall_score,
      trustpilot_score: review.trustpilot_score,
      summary: review.summary
    }
  );
  const faqSchema = generateFAQSchema(faqs);

  // Get score-based accent color for the review
  const getScoreAccentColor = (score: number) => {
    if (score >= 80) return { from: 'from-emerald-600', via: 'via-green-500', to: 'to-teal-400', accent: 'emerald' };
    if (score >= 60) return { from: 'from-yellow-500', via: 'via-amber-500', to: 'to-orange-400', accent: 'amber' };
    if (score >= 40) return { from: 'from-orange-500', via: 'via-amber-500', to: 'to-yellow-400', accent: 'orange' };
    return { from: 'from-red-500', via: 'via-rose-500', to: 'to-pink-400', accent: 'red' };
  };

  const scoreColors = getScoreAccentColor(review.overall_score);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Back to Top Button */}
      <BackToTopButton />

      {/* Sticky Table of Contents (desktop only) */}
      <TableOfContents />

      {/* Schema.org JSON-LD - Review */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      {/* Schema.org JSON-LD - FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section with Animated Gradient */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${scoreColors.from} ${scoreColors.via} ${scoreColors.to} animate-gradient-shift`} style={{ backgroundSize: '200% 200%' }} />

        {/* Botanical pattern overlay */}
        <div className="absolute inset-0 botanical-pattern opacity-[0.08]" />

        {/* Grain texture */}
        <div className="absolute inset-0 grain-overlay" />

        {/* Breadcrumbs */}
        <div className="relative border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="[&_a]:text-white/80 [&_a]:hover:text-white [&_span]:text-white/60 [&_svg]:text-white/40">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            {/* Brand Logo */}
            <div className="flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              {brand.logo_url ? (
                <div className="p-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl">
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-20 h-20 md:w-28 md:h-28 rounded-xl object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-display font-bold text-gray-700">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div className="flex-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-sm">
                {brand.name} CBD Review {reviewYear}
              </h1>

              {review.kb_authors && (
                <p className="text-white/80 hub-body-text text-lg">
                  by{' '}
                  <Link
                    href={`/authors/${review.kb_authors.slug}`}
                    className="text-white hover:text-white/90 underline underline-offset-2"
                  >
                    {review.kb_authors.name}
                  </Link>
                </p>
              )}

              {/* Quick Score Badge */}
              <div className="mt-4 inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <span className="font-mono text-2xl font-bold text-gray-900">{review.overall_score}</span>
                <span className="text-gray-400">/100</span>
                <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${getScoreBadgeColor(review.overall_score)}`}>
                  {getScoreLabel(review.overall_score)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="rgb(249 250 251)" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8 md:space-y-12">
          {/* Summary */}
          {review.summary && (
            <div id="summary" className="relative bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm overflow-hidden animate-fade-in-up">
              {/* Accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${scoreColors.from} ${scoreColors.to}`} />

              <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900 mb-5">{brand.name} Review Summary</h2>

              {/* Score Display - Enhanced design */}
              <div className="flex items-center gap-4 md:gap-6 mb-6 pb-6 border-b border-gray-100">
                {/* Score Box */}
                <div className={`relative flex-shrink-0 flex flex-col items-center justify-center px-5 py-4 md:px-6 md:py-5 rounded-2xl ${
                  review.overall_score >= 70 ? 'bg-gradient-to-br from-emerald-50 to-green-50' :
                  review.overall_score >= 50 ? 'bg-gradient-to-br from-yellow-50 to-amber-50' :
                  'bg-gradient-to-br from-orange-50 to-amber-50'
                }`}>
                  <span className="font-mono text-4xl md:text-5xl font-bold text-gray-900">{review.overall_score}</span>
                  <span className="text-sm text-gray-500 font-medium">/100</span>
                </div>

                {/* Stars and Label */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <OverallStarRating score={review.overall_score} />
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBadgeColor(review.overall_score)}`}>
                      {getScoreLabel(review.overall_score)}
                    </span>
                  </div>
                  {review.last_reviewed_at && (
                    <span className="text-sm text-gray-500 hub-body-text">
                      Last reviewed {formatDateSafe(review.last_reviewed_at)}
                    </span>
                  )}
                </div>
              </div>

              <p className="hub-body-text text-base md:text-lg text-gray-700 leading-relaxed">{review.summary}</p>
            </div>
          )}

          {/* About the Brand */}
          {review.about_content && (
            <div id="about" className="relative bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '50ms' }}>
              {/* Decorative corner */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full opacity-50" />

              <h2 className="relative font-display text-xl md:text-2xl font-bold text-gray-900 mb-4">About {brand.name}</h2>

              {/* Brand details if available */}
              <div className="relative flex flex-wrap gap-3 mb-4">
                {brand.founded_year && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Est. {brand.founded_year}
                  </span>
                )}
                {brand.headquarters_country && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {brand.headquarters_country}
                  </span>
                )}
                {brand.website_url && (
                  <a
                    href={brand.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {getDomainFromUrl(brand.website_url)}
                  </a>
                )}
              </div>

              {/* Certifications */}
              {brand.certifications && brand.certifications.length > 0 && (
                <div className="relative flex flex-wrap gap-2 mb-4">
                  {brand.certifications.map((cert) => {
                    const certInfo = CERTIFICATION_LABELS[cert] || { name: cert, icon: '✓' };
                    return (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700"
                      >
                        <span>{certInfo.icon}</span>
                        {certInfo.name}
                      </span>
                    );
                  })}
                </div>
              )}

              <p className="relative hub-body-text text-gray-700 leading-relaxed">{review.about_content}</p>
            </div>
          )}

          {/* Best For / Not Ideal For */}
          {((review.best_for && review.best_for.length > 0) || (review.not_ideal_for && review.not_ideal_for.length > 0)) && (
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              {review.best_for && review.best_for.length > 0 && (
                <div className="relative bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60 p-6 shadow-sm overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200/30 rounded-full blur-xl" />

                  <h2 className="relative font-display text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg text-lg">👍</span>
                    Best For
                  </h2>
                  <ul className="relative space-y-3">
                    {review.best_for.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="flex-shrink-0 w-5 h-5 mt-0.5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="hub-body-text text-blue-900 group-hover:text-blue-700 transition-colors">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.not_ideal_for && review.not_ideal_for.length > 0 && (
                <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-200/60 p-6 shadow-sm overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-200/30 rounded-full blur-xl" />

                  <h2 className="relative font-display text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg text-lg">👎</span>
                    Not Ideal For
                  </h2>
                  <ul className="relative space-y-3">
                    {review.not_ideal_for.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="flex-shrink-0 w-5 h-5 mt-0.5 bg-amber-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                        <span className="hub-body-text text-amber-900 group-hover:text-amber-700 transition-colors">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Third-Party Reviews */}
          {(review.trustpilot_score || review.google_score) && (
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-100 to-transparent rounded-bl-full opacity-50" />

              <h2 className="relative font-display text-xl md:text-2xl font-bold text-gray-900 mb-2">{brand.name} Customer Reviews</h2>
              <p className="relative hub-body-text text-sm text-gray-500 mb-6">What customers are saying on third-party review platforms</p>

              <div className="relative grid sm:grid-cols-2 gap-4">
                {review.trustpilot_score && (
                  <a
                    href={review.trustpilot_url || `https://www.trustpilot.com/review/${brand.website_url ? new URL(brand.website_url).hostname.replace('www.', '') : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-[#00B67A] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-105 transition-transform">
                      <span className="text-white text-2xl font-bold">★</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                        Trustpilot
                        <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-3xl font-bold text-gray-900">{review.trustpilot_score}</span>
                        <span className="text-gray-400 font-medium">/5</span>
                      </div>
                      {review.trustpilot_count && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Based on {review.trustpilot_count.toLocaleString()} reviews
                        </div>
                      )}
                    </div>
                  </a>
                )}
                {review.google_score && (
                  <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                      <span className="text-white text-2xl font-bold">G</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium">Google Reviews</div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-3xl font-bold text-gray-900">{review.google_score}</span>
                        <span className="text-gray-400 font-medium">/5</span>
                      </div>
                      {review.google_count && (
                        <div className="text-xs text-gray-500 mt-0.5">
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
          <div id="score-breakdown" className="relative bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {/* Accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${scoreColors.from} ${scoreColors.to}`} />

            {/* Decorative background */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-gray-100 to-transparent rounded-full opacity-40" />

            <h2 className="relative font-display text-xl md:text-2xl font-bold text-gray-900 mb-2">Score Breakdown of {brand.name}</h2>
            <p className="relative hub-body-text text-sm text-gray-500 mb-6">Click on a category to see sub-scores and details</p>

            <div className="relative">
              <CollapsibleScoreBreakdown scoreBreakdown={scoreBreakdown} />
            </div>

            <div className="relative mt-6 pt-4 border-t border-gray-100">
              <Link
                href="/reviews/methodology"
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 group"
              >
                Learn about our 100-point scoring methodology
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Pros and Cons */}
          {(review.pros?.length > 0 || review.cons?.length > 0) && (
            <div id="pros-cons" className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              {review.pros?.length > 0 && (
                <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl border border-emerald-200/60 p-6 shadow-sm overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-200/30 rounded-full blur-xl" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />

                  <h2 className="relative font-display text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {brand.name} Pros
                  </h2>
                  <ul className="relative space-y-3">
                    {review.pros.map((pro: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="flex-shrink-0 w-5 h-5 mt-0.5 bg-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="hub-body-text text-emerald-900 group-hover:text-emerald-700 transition-colors">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.cons?.length > 0 && (
                <div className="relative bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 rounded-2xl border border-rose-200/60 p-6 shadow-sm overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-200/30 rounded-full blur-xl" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-red-400 to-pink-400" />

                  <h2 className="relative font-display text-lg font-bold text-rose-800 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-rose-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    {brand.name} Cons
                  </h2>
                  <ul className="relative space-y-3">
                    {review.cons.map((con: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="flex-shrink-0 w-5 h-5 mt-0.5 bg-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                        <span className="hub-body-text text-rose-900 group-hover:text-rose-700 transition-colors">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Review Sections - Each category as standalone section */}
          {(review.section_content && Object.keys(review.section_content).length > 0) ? (
            <>
              {scoreBreakdown.map((criterion, index) => {
                const sectionText = (review.section_content as Record<string, string>)[criterion.id];
                if (!sectionText) return null;

                // Get score-based colors for the section
                const scorePercent = (criterion.score / criterion.max_points) * 100;
                const sectionColorClass = scorePercent >= 70 ? 'from-emerald-500 to-green-500' :
                  scorePercent >= 50 ? 'from-amber-500 to-yellow-500' : 'from-rose-500 to-red-500';

                return (
                  <div
                    key={criterion.id}
                    id={getSectionId(criterion.name)}
                    className="relative bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    {/* Accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${sectionColorClass}`} />

                    {/* Header with Score - Responsive layout */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900">
                        {criterion.name}
                      </h2>
                      <div className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-3 sm:p-4">
                        <CategoryStarRating
                          score={criterion.score}
                          maxScore={criterion.max_points}
                          colorCode={true}
                        />
                      </div>
                    </div>

                    {/* Sub-scores - Responsive layout */}
                    {criterion.subcriteria && criterion.subcriteria.length > 0 && Object.keys(criterion.sub_scores || {}).length > 0 && (
                      <div className="space-y-2 mb-5 p-4 bg-gray-50 rounded-xl text-sm">
                        {criterion.subcriteria.map(sub => {
                          const subScore = criterion.sub_scores[sub.id] ?? 0;
                          return (
                            <div key={sub.id} className="flex flex-wrap items-center justify-between gap-2">
                              <span className="hub-body-text text-gray-700">{sub.name}</span>
                              <div className="flex items-center gap-2">
                                <InlineStarRating score={subScore} maxScore={sub.max_points} colorCode={true} />
                                <span className="font-mono text-gray-400 text-xs">
                                  {subScore}/{sub.max_points}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <MarkdownContent
                      className="prose prose-sm max-w-none prose-green prose-p:text-gray-700 prose-p:hub-body-text prose-headings:font-display"
                      brandName={brand.name}
                      trustpilotUrl={review.trustpilot_url}
                      websiteDomain={brand.website_url ? getDomainFromUrl(brand.website_url) : null}
                    >
                      {stripMarkdownTables(sectionText)}
                    </MarkdownContent>
                  </div>
                );
              })}
            </>
          ) : review.full_review && (
            <>
              {/* Parse full_review by section headers - legacy fallback */}
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

                  if (!headerName || !criterion) return null;

                  // Get score-based colors for the section
                  const scorePercent = (criterion.score / criterion.max_points) * 100;
                  const sectionColorClass = scorePercent >= 70 ? 'from-emerald-500 to-green-500' :
                    scorePercent >= 50 ? 'from-amber-500 to-yellow-500' : 'from-rose-500 to-red-500';

                  return (
                    <div
                      key={idx}
                      id={getSectionId(criterion.name)}
                      className="relative bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm overflow-hidden animate-fade-in-up"
                      style={{ animationDelay: `${300 + idx * 50}ms` }}
                    >
                      {/* Accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${sectionColorClass}`} />

                      {/* Header with Score - Responsive layout */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900">
                          {criterion.name}
                        </h2>
                        <div className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-3 sm:p-4">
                          <CategoryStarRating
                            score={criterion.score}
                            maxScore={criterion.max_points}
                            colorCode={true}
                          />
                        </div>
                      </div>

                      {/* Sub-scores - Responsive layout */}
                      {criterion.subcriteria && criterion.subcriteria.length > 0 && Object.keys(criterion.sub_scores || {}).length > 0 && (
                        <div className="space-y-2 mb-5 p-4 bg-gray-50 rounded-xl text-sm">
                          {criterion.subcriteria.map(sub => {
                            const subScore = criterion.sub_scores[sub.id] ?? 0;
                            return (
                              <div key={sub.id} className="flex flex-wrap items-center justify-between gap-2">
                                <span className="hub-body-text text-gray-700">{sub.name}</span>
                                <div className="flex items-center gap-2">
                                  <InlineStarRating score={subScore} maxScore={sub.max_points} colorCode={true} />
                                  <span className="font-mono text-gray-400 text-xs">
                                    {subScore}/{sub.max_points}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <MarkdownContent
                        className="prose prose-sm max-w-none prose-green prose-p:text-gray-700 prose-p:hub-body-text prose-headings:font-display"
                        brandName={brand.name}
                        trustpilotUrl={review.trustpilot_url}
                        websiteDomain={brand.website_url ? getDomainFromUrl(brand.website_url) : null}
                      >
                        {stripMarkdownTables(contentWithoutHeader)}
                      </MarkdownContent>
                    </div>
                  );
                });
              })()}
            </>
          )}

          {/* Verdict */}
          {review.verdict && (
            <div id="verdict" className="relative overflow-hidden rounded-2xl shadow-xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              {/* Dynamic gradient based on score */}
              <div className={`absolute inset-0 bg-gradient-to-br ${scoreColors.from} ${scoreColors.via} ${scoreColors.to} animate-gradient-shift`} style={{ backgroundSize: '200% 200%' }} />

              {/* Botanical pattern overlay */}
              <div className="absolute inset-0 botanical-pattern opacity-[0.08]" />

              {/* Grain texture */}
              <div className="absolute inset-0 grain-overlay" />

              {/* Content */}
              <div className="relative p-6 md:p-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <h2 className="font-display text-xl md:text-2xl font-bold text-white">My Final Verdict on {brand.name}</h2>
                </div>

                {/* Score display */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-white/20">
                  <div className="flex items-baseline gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                    <span className="font-mono text-5xl md:text-6xl font-bold text-white">{review.overall_score}</span>
                    <span className="text-white/60 text-xl">/100</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <OverallStarRating score={review.overall_score} />
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-sm">
                      {getScoreLabel(review.overall_score)}
                    </span>
                  </div>
                </div>

                <p className="hub-body-text text-lg md:text-xl text-white/90 leading-relaxed">{review.verdict}</p>

                {/* CTA if high score */}
                {review.overall_score >= 70 && brand.website_url && (
                  <div className="mt-8">
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                    >
                      Visit {brand.name}
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Author Attribution */}
          {review.kb_authors && (
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '450ms' }}>
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-50" />

              <div className="relative flex flex-col sm:flex-row items-start gap-5">
                {/* Author image */}
                {review.kb_authors.image_url ? (
                  <div className="relative flex-shrink-0">
                    <img
                      src={review.kb_authors.image_url}
                      alt={review.kb_authors.name}
                      className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-display font-bold text-emerald-600">
                      {review.kb_authors.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Author info */}
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1 hub-body-text">Reviewed by</div>
                  <Link
                    href={`/authors/${review.kb_authors.slug}`}
                    className="inline-block font-display text-xl font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                  >
                    {review.kb_authors.name}
                  </Link>
                  {review.kb_authors.title && (
                    <div className="text-sm text-emerald-600 font-medium mt-0.5">{review.kb_authors.title}</div>
                  )}

                  {review.kb_authors.bio_short && (
                    <p className="mt-3 hub-body-text text-gray-600 leading-relaxed">{review.kb_authors.bio_short}</p>
                  )}

                  <Link
                    href={`/authors/${review.kb_authors.slug}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 group"
                  >
                    View all reviews
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div id="faqs" className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <FAQAccordion faqs={faqs} brandName={brand.name} />
          </div>

          {/* Related Reviews */}
          <div className="animate-fade-in-up" style={{ animationDelay: '550ms' }}>
            <RelatedReviews brands={transformedRelated} currentBrandId={brand.id} />
          </div>

          {/* Back to Reviews */}
          <div className="text-center pt-8 pb-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:text-emerald-600 hover:border-emerald-300 font-medium transition-all shadow-sm hover:shadow group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to All Reviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
