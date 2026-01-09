'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  slug: string;
  website_domain: string | null;
  logo_url: string | null;
}

interface Author {
  id: string;
  name: string;
  slug: string;
}

interface Review {
  id: string;
  brand_id: string;
  overall_score: number;
  summary: string | null;
  is_published: boolean;
  published_at: string | null;
  last_reviewed_at: string | null;
  updated_at: string;
  kb_brands: Brand;
  kb_authors: Author | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishedFilter, setPublishedFilter] = useState<string>('');
  const [counts, setCounts] = useState({ total: 0, published: 0, draft: 0 });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (publishedFilter) params.set('published', publishedFilter);

      const res = await fetch(`/api/admin/brand-reviews?${params.toString()}`);
      const data = await res.json();

      setReviews(data.reviews || []);
      setCounts({
        total: data.total || 0,
        published: data.publishedCount || 0,
        draft: data.draftCount || 0
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [publishedFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;

    try {
      const res = await fetch('/api/admin/brand-reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });

      if (!res.ok) {
        throw new Error('Failed to delete review');
      }

      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Reviews</h1>
          <p className="text-gray-600 mt-2">
            Manage all brand reviews ({counts.total} reviews)
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/reviews"
            target="_blank"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            View Public Page
          </Link>
          <Link
            href="/admin/brands"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Manage Brands
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Reviews ({counts.total})</option>
          <option value="true">Published ({counts.published})</option>
          <option value="false">Drafts ({counts.draft})</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
          <p className="text-gray-600 mt-1">
            {publishedFilter
              ? 'No reviews match your filter'
              : 'Create a brand first, then add a review'}
          </p>
          <Link
            href="/admin/brands"
            className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Brands
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Brand</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Score</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Author</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden lg:table-cell">Published</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map(review => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {review.kb_brands?.logo_url ? (
                        <img
                          src={review.kb_brands.logo_url}
                          alt={review.kb_brands.name}
                          className="w-10 h-10 rounded-lg object-contain bg-gray-50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-bold">
                          {review.kb_brands?.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{review.kb_brands?.name || 'Unknown'}</div>
                        {review.kb_brands?.website_domain && (
                          <div className="text-xs text-gray-500">{review.kb_brands.website_domain}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(review.overall_score)}`}>
                      {review.overall_score}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {review.kb_authors?.name || (
                      <span className="text-gray-400 text-sm">No author</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      review.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {review.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="text-sm text-gray-600">{formatDate(review.published_at)}</div>
                    {review.last_reviewed_at && (
                      <div className="text-xs text-gray-400">
                        Reviewed: {formatDate(review.last_reviewed_at)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/brands/${review.brand_id}`}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    {review.is_published && review.kb_brands?.slug && (
                      <Link
                        href={`/reviews/${review.kb_brands.slug}`}
                        target="_blank"
                        className="px-3 py-1 text-sm text-green-600 hover:text-green-800"
                      >
                        View
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
