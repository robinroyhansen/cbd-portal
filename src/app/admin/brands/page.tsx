'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { COUNTRIES, getCountryName, getCountryWithFlag, getDomainFromUrl } from '@/lib/utils/brand-helpers';

interface Brand {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  logo_url: string | null;
  headquarters_country: string | null; // ISO code
  founded_year: number | null;
  short_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  has_review: boolean;
  review_score: number | null;
  review_published: boolean;
  review_id: string | null;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<string>('');
  const [counts, setCounts] = useState({ total: 0, published: 0, draft: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Brand>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [researching, setResearching] = useState(false);
  const [researchComplete, setResearchComplete] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (publishedFilter) params.set('published', publishedFilter);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/admin/brands?${params.toString()}`);
      const data = await res.json();

      setBrands(data.brands || []);
      setCounts({
        total: data.total || 0,
        published: data.publishedCount || 0,
        draft: data.draftCount || 0
      });
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  }, [publishedFilter, searchQuery]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setFormData({
      name: '',
      website_url: '',
      logo_url: '',
      headquarters_country: '',
      founded_year: undefined,
      short_description: '',
      is_published: false
    });
    setError(null);
    setResearchComplete(false);
  };

  const handleResearch = async () => {
    if (!formData.name || !formData.website_url) {
      setError('Please enter brand name and website URL first');
      return;
    }

    setResearching(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/brands/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          websiteUrl: formData.website_url
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Research failed');
      }

      // Auto-populate fields from research
      setFormData(prev => ({
        ...prev,
        headquarters_country: data.data.headquarters_country || prev.headquarters_country,
        founded_year: data.data.founded_year || prev.founded_year,
        short_description: data.data.short_description || prev.short_description
      }));

      setResearchComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to research brand');
    } finally {
      setResearching(false);
    }
  };

  const handleRefetch = async () => {
    if (!formData.website_url) {
      setError('Please enter a website URL first');
      return;
    }

    setResearching(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/brands/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          websiteUrl: formData.website_url
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Research failed');
      }

      // Only update fields if they have new data (don't overwrite with null)
      setFormData(prev => ({
        ...prev,
        headquarters_country: data.data.headquarters_country || prev.headquarters_country,
        founded_year: data.data.founded_year || prev.founded_year,
        short_description: data.data.short_description || prev.short_description
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brand info');
    } finally {
      setResearching(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setIsEditing(brand.id);
    setIsCreating(false);
    setFormData({ ...brand });
    setError(null);
    setResearchComplete(true); // Skip research step when editing
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(null);
    setFormData({});
    setError(null);
    setResearchComplete(false);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    try {
      const method = isCreating ? 'POST' : 'PATCH';
      const body = isCreating ? formData : { id: isEditing, ...formData };

      const res = await fetch('/api/admin/brands', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save brand');
      }

      handleCancel();
      fetchBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand? This will also delete its review. This cannot be undone.')) return;

    try {
      const res = await fetch('/api/admin/brands', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });

      if (!res.ok) {
        throw new Error('Failed to delete brand');
      }

      fetchBrands();
    } catch (err) {
      console.error('Error deleting brand:', err);
      alert('Failed to delete brand');
    }
  };

  const getScoreBadgeColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-500';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600 mt-2">
            Manage CBD brands for reviews ({counts.total} brands)
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
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Brand
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Brands ({counts.total})</option>
          <option value="true">Published ({counts.published})</option>
          <option value="false">Drafts ({counts.draft})</option>
        </select>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isCreating ? 'Add New Brand' : 'Edit Brand'}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Step 1: Basic info for new brands */}
          {isCreating && !researchComplete && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter the brand name and website, then click &quot;Fetch Brand Info&quot; to auto-populate details using AI.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Charlotte's Web"
                    disabled={researching}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.website_url || ''}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="https://charlottesweb.com"
                    disabled={researching}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCancel}
                  disabled={researching}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResearch}
                  disabled={researching || !formData.name || !formData.website_url}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {researching ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Researching...
                    </>
                  ) : (
                    <>Fetch Brand Info</>
                  )}
                </button>
                <button
                  onClick={() => setResearchComplete(true)}
                  disabled={researching}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Full form after research or when editing */}
          {(researchComplete || isEditing) && (
            <div className="space-y-4">
              {isCreating && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm mb-4">
                  Review the auto-populated information below and make any corrections before creating the brand.
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Charlotte's Web"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Headquarters Country
                  </label>
                  <select
                    value={formData.headquarters_country || ''}
                    onChange={(e) => setFormData({ ...formData, headquarters_country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                  <span className="text-gray-500 font-normal ml-1">(not displayed publicly - domain extracted automatically)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.website_url || ''}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="https://charlottesweb.com"
                    disabled={researching}
                  />
                  <button
                    type="button"
                    onClick={handleRefetch}
                    disabled={researching || !formData.website_url}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap flex items-center gap-1"
                    title="Re-fetch brand info from website"
                  >
                    {researching ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Fetching...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Fetch Info
                      </>
                    )}
                  </button>
                </div>
                {formData.website_url && (
                  <p className="text-xs text-gray-500 mt-1">
                    Will display as: <span className="font-medium">{getDomainFromUrl(formData.website_url)}</span>
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                    <span className="text-gray-500 font-normal ml-1">(manual upload)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url || ''}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={formData.founded_year || ''}
                    onChange={(e) => setFormData({ ...formData, founded_year: e.target.value ? parseInt(e.target.value) : undefined })}
                    min={1900}
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 2014"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  value={formData.short_description || ''}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-y"
                  placeholder="Brief description of the brand..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published || false}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                  Published (brand visible on public site)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                {isCreating && (
                  <button
                    onClick={() => setResearchComplete(false)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : isCreating ? 'Create Brand' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brands List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900">No brands yet</h3>
          <p className="text-gray-600 mt-1">
            {searchQuery || publishedFilter
              ? 'No brands match your filters'
              : 'Get started by adding your first CBD brand'}
          </p>
          {!searchQuery && !publishedFilter && (
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add First Brand
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Brand</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Website</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Score</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {brands.map(brand => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-10 h-10 rounded-lg object-contain bg-gray-50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-bold">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{brand.name}</div>
                        {brand.headquarters_country && (
                          <div className="text-xs text-gray-500">{getCountryWithFlag(brand.headquarters_country)}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {brand.website_url && (
                      <span className="text-sm text-gray-600">{getDomainFromUrl(brand.website_url)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {brand.has_review ? (
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreBadgeColor(brand.review_score)}`}>
                        {brand.review_score}/100
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No review</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      brand.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {brand.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/brands/${brand.id}`}
                      className="px-3 py-1 text-sm text-green-600 hover:text-green-800"
                    >
                      {brand.has_review ? 'Edit Review' : 'Create Review'}
                    </Link>
                    <button
                      onClick={() => handleEdit(brand)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 ml-2"
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
