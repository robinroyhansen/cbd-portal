'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getDomainFromUrl } from '@/lib/utils/brand-helpers';

interface Brand {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  logo_url: string | null;
  short_description: string | null;
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

const SCORE_RANGES = [
  { label: 'All Scores', min: 0, max: 100 },
  { label: 'Excellent (80+)', min: 80, max: 100 },
  { label: 'Good (60-79)', min: 60, max: 79 },
  { label: 'Average (40-59)', min: 40, max: 59 },
  { label: 'Below Average (<40)', min: 0, max: 39 }
];

const SORT_OPTIONS = [
  { value: 'score', label: 'Highest Score' },
  { value: 'name', label: 'Brand Name' },
  { value: 'date', label: 'Most Recent' }
];

export default function ReviewsIndexPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreFilter, setScoreFilter] = useState(0);
  const [sortBy, setSortBy] = useState('score');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('sort', sortBy);

      const range = SCORE_RANGES[scoreFilter];
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

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Below Average';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              CBD Brand Reviews
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Independent & unbiased reviews of CBD brands. We evaluate quality, transparency, value, and more using our comprehensive 100-point scoring system.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-3">
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(parseInt(e.target.value))}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {SCORE_RANGES.map((range, i) => (
                <option key={i} value={i}>{range.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {reviews.length} brand{reviews.length !== 1 ? 's' : ''} reviewed
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {scoreFilter > 0
                ? 'No brands match your score filter. Try a different range.'
                : 'Check back soon for new brand reviews.'}
            </p>
            {scoreFilter > 0 && (
              <button
                onClick={() => setScoreFilter(0)}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
              <Link
                key={review.id}
                href={`/reviews/${review.brand.slug}`}
                className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all group overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {review.brand.logo_url ? (
                      <img
                        src={review.brand.logo_url}
                        alt={review.brand.name}
                        className="w-16 h-16 rounded-xl object-contain bg-gray-50"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                        {review.brand.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">
                        {review.brand.name}
                      </h2>
                      {review.brand.website_url && (
                        <p className="text-sm text-gray-500 truncate">{getDomainFromUrl(review.brand.website_url)}</p>
                      )}
                    </div>
                  </div>

                  {/* Score Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`px-4 py-2 rounded-lg border ${getScoreBadgeColor(review.overall_score)}`}>
                      <span className="text-2xl font-bold">{review.overall_score}</span>
                      <span className="text-sm">/100</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {getScoreLabel(review.overall_score)}
                    </span>
                  </div>

                  {/* Summary */}
                  {review.summary && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {review.summary}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                    {review.author && (
                      <span>By {review.author.name}</span>
                    )}
                    {review.last_reviewed_at && (
                      <span>Updated {formatDate(review.last_reviewed_at)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Scoring System Info */}
        <div className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Scoring System</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
            Each brand is evaluated across 9 categories totaling 100 points. Our comprehensive review process ensures fair, consistent, and transparent evaluations.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Quality & Testing', points: 20, desc: 'Lab testing, potency, purity' },
              { name: 'Transparency', points: 15, desc: 'COAs, labeling, ingredients' },
              { name: 'Reputation', points: 12, desc: 'Reviews, track record, recognition' },
              { name: 'Value & Pricing', points: 12, desc: 'Price per mg, discounts, shipping' },
              { name: 'Customer Experience', points: 10, desc: 'Website, shipping, support' },
              { name: 'Product Range', points: 10, desc: 'Formats, spectrum, strengths' },
              { name: 'Certifications', points: 10, desc: 'GMP, organic, third-party' },
              { name: 'Sourcing', points: 6, desc: 'Hemp origin, farming practices' },
              { name: 'Education', points: 5, desc: 'Dosing guides, content, research' }
            ].map(cat => (
              <div key={cat.name} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-sm">
                  {cat.points}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{cat.name}</div>
                  <div className="text-sm text-gray-500">{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
