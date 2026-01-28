'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getDomainFromUrl, getCountryFlag } from '@/lib/utils/brand-helpers';
import { formatDate } from '@/lib/locale';
import { useLocale } from '@/hooks/useLocale';

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

// Keys for translation - labels will be resolved in component
const SCORE_RANGE_KEYS = [
  { key: 'allScores', min: 0, max: 100 },
  { key: 'excellent80', min: 80, max: 100 },
  { key: 'good60', min: 60, max: 79 },
  { key: 'average40', min: 40, max: 59 },
  { key: 'belowAverage', min: 0, max: 39 }
];

const SORT_OPTION_KEYS = [
  { value: 'score', key: 'highestScore' },
  { value: 'name', key: 'brandName' },
  { value: 'date', key: 'mostRecent' }
];

interface ReviewsClientProps {
  initialReviews: Review[];
}

export function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const { t } = useLocale();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [scoreFilter, setScoreFilter] = useState(0);
  const [sortBy, setSortBy] = useState('score');

  // Translated score ranges
  const scoreRanges = SCORE_RANGE_KEYS.map(range => ({
    ...range,
    label: t(`reviewsPage.${range.key}`)
  }));

  // Translated sort options
  const sortOptions = SORT_OPTION_KEYS.map(opt => ({
    ...opt,
    label: t(`reviewsPage.${opt.key}`)
  }));

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('sort', sortBy);

      const range = SCORE_RANGE_KEYS[scoreFilter];
      if (scoreFilter > 0) {
        params.set('min_score', range.min.toString());
        params.set('max_score', range.max.toString());
      }

      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();

      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [scoreFilter, sortBy]);

  // Only fetch when filters change (not on initial load since we have initialReviews)
  useEffect(() => {
    if (scoreFilter !== 0 || sortBy !== 'score') {
      fetchReviews();
    }
  }, [scoreFilter, sortBy, fetchReviews]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500' };
    if (score >= 60) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500' };
    if (score >= 40) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'bg-orange-500' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', accent: 'bg-red-500' };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('reviewsPage.excellent');
    if (score >= 60) return t('reviewsPage.good');
    if (score >= 40) return t('reviewsPage.average');
    return t('reviewsPage.belowAverage');
  };

  const formatDateSafe = (dateStr: string | null) => {
    if (!dateStr) return '';
    return formatDate(dateStr);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white">
        {/* Decorative pattern */}
        <div className="absolute inset-0 botanical-pattern opacity-10" />

        {/* Gradient mesh overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
                         radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.2) 0%, transparent 40%)`,
          }}
        />

        {/* Decorative elements */}
        <div className="absolute top-8 right-12 text-4xl opacity-20 hidden lg:block">✦</div>
        <div className="absolute bottom-16 right-24 text-2xl opacity-10 hidden lg:block">✦</div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <span>⭐</span>
              {t('reviewsPage.independentReviews')}
            </span>

            <h1 className="hub-display-heading text-4xl md:text-5xl lg:text-6xl font-normal mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              {t('reviewsPage.title')}
            </h1>

            <p className="hub-body-text text-xl text-emerald-100 max-w-2xl mx-auto mb-8 leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              {t('reviewsPage.subtitle')}
            </p>

            <Link
              href="/reviews/methodology"
              className="inline-flex items-center gap-2 text-emerald-200 hover:text-white transition-colors text-sm font-medium opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
            >
              {t('reviewsPage.learnHowWeScore')}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path d="M0,120 C300,60 600,100 900,60 C1050,30 1150,80 1200,80 L1200,120 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-3">
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(parseInt(e.target.value))}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hub-body-text shadow-sm"
            >
              {scoreRanges.map((range, i) => (
                <option key={i} value={i}>{range.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hub-body-text shadow-sm"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500 hub-stat-number">
            {reviews.length === 1
              ? t('reviewsPage.brandsReviewed').replace('{{count}}', '1')
              : t('reviewsPage.brandsReviewedPlural').replace('{{count}}', reviews.length.toString())}
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl skeleton-shimmer"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-100 rounded-lg w-3/4 mb-2 skeleton-shimmer"></div>
                    <div className="h-4 bg-gray-50 rounded-lg w-1/2 skeleton-shimmer"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-50 rounded-lg w-full mb-2 skeleton-shimmer"></div>
                <div className="h-4 bg-gray-50 rounded-lg w-2/3 skeleton-shimmer"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="hub-display-heading text-2xl text-gray-900 mb-3">{t('reviewsPage.noReviewsFound')}</h3>
            <p className="text-gray-600 hub-body-text max-w-md mx-auto">
              {scoreFilter > 0
                ? t('reviewsPage.noMatchFilter')
                : t('reviewsPage.checkBackSoon')}
            </p>
            {scoreFilter > 0 && (
              <button
                onClick={() => setScoreFilter(0)}
                className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                {t('reviewsPage.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => {
              const colors = getScoreColor(review.overall_score);
              return (
                <Link
                  key={review.id}
                  href={`/reviews/${review.brand.slug}`}
                  className="group relative bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  {/* Accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.accent} transition-all duration-200 group-hover:w-1.5`} />

                  <div className="p-6 pl-7">
                    <div className="flex items-start gap-4 mb-5">
                      {review.brand.logo_url ? (
                        <img
                          src={review.brand.logo_url}
                          alt={review.brand.name}
                          className="w-16 h-16 rounded-xl object-contain bg-gray-50 border border-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                          {review.brand.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="hub-body-text text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                          {review.brand.name}
                        </h2>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                          {review.brand.headquarters_country && (
                            <span>{getCountryFlag(review.brand.headquarters_country)}</span>
                          )}
                          {review.brand.website_url && (
                            <span className="text-gray-400">{getDomainFromUrl(review.brand.website_url)}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`px-4 py-3 rounded-xl border ${colors.bg} ${colors.border}`}>
                        <span className={`hub-stat-number text-2xl font-bold ${colors.text}`}>{review.overall_score}</span>
                        <span className={`text-sm ${colors.text} opacity-70`}>/100</span>
                      </div>
                      <div>
                        <span className={`text-sm font-semibold ${colors.text}`}>
                          {getScoreLabel(review.overall_score)}
                        </span>
                        {review.last_reviewed_at && (
                          <p className="text-xs text-gray-400 hub-stat-number mt-0.5">
                            {t('reviewsPage.updated')} {formatDateSafe(review.last_reviewed_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {review.summary && (
                      <p className="hub-body-text text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {review.summary}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
                      {review.author && (
                        <span className="text-xs text-gray-400">{t('reviewsPage.by')} {review.author.name}</span>
                      )}
                      <span className="text-sm font-medium text-emerald-600 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                        {t('reviewsPage.readReview')} →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Scoring System Info */}
        <div className="mt-20 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl border border-green-100 p-10">
          {/* Decorative pattern */}
          <div className="absolute inset-0 botanical-pattern opacity-40" />

          <div className="relative z-10">
            <h2 className="hub-display-heading text-2xl sm:text-3xl text-gray-900 mb-4 text-center">{t('reviewsPage.ourScoringSystem')}</h2>
            <p className="hub-body-text text-gray-600 text-center max-w-2xl mx-auto mb-6 leading-relaxed">
              {t('reviewsPage.scoringDescription')}
            </p>
            <div className="text-center mb-10">
              <Link
                href="/reviews/methodology"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                {t('reviewsPage.seeMethodology')} →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: t('reviewsPage.qualityTesting'), points: 20, desc: t('reviewsPage.qualityTestingDesc'), color: 'emerald' },
                { name: t('reviewsPage.transparency'), points: 15, desc: t('reviewsPage.transparencyDesc'), color: 'blue' },
                { name: t('reviewsPage.reputation'), points: 12, desc: t('reviewsPage.reputationDesc'), color: 'purple' },
                { name: t('reviewsPage.valuePricing'), points: 12, desc: t('reviewsPage.valuePricingDesc'), color: 'amber' },
                { name: t('reviewsPage.customerExperience'), points: 10, desc: t('reviewsPage.customerExperienceDesc'), color: 'pink' },
                { name: t('reviewsPage.productRange'), points: 10, desc: t('reviewsPage.productRangeDesc'), color: 'cyan' },
                { name: t('reviewsPage.certifications'), points: 10, desc: t('reviewsPage.certificationsDesc'), color: 'green' },
                { name: t('reviewsPage.sourcing'), points: 6, desc: t('reviewsPage.sourcingDesc'), color: 'lime' },
                { name: t('reviewsPage.education'), points: 5, desc: t('reviewsPage.educationDesc'), color: 'orange' }
              ].map((cat, index) => (
                <div
                  key={cat.name}
                  className="group relative flex items-start gap-4 p-5 bg-white/80 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
                >
                  <div className={`flex-shrink-0 w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold hub-stat-number`}>
                    {cat.points}
                  </div>
                  <div>
                    <div className="hub-body-text font-semibold text-gray-900">{cat.name}</div>
                    <div className="text-sm text-gray-500">{cat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
