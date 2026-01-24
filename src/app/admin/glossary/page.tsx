'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/admin-auth';

interface GlossaryTerm {
  id: string;
  term: string;
  display_name: string;
  slug: string;
  definition: string;
  short_definition: string;
  category: string;
  synonyms: string[];
  related_terms: string[];
  related_research: string[];
  sources: string[];
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { key: 'cannabinoids', label: 'Cannabinoids' },
  { key: 'terpenes', label: 'Terpenes' },
  { key: 'products', label: 'Products' },
  { key: 'extraction', label: 'Extraction' },
  { key: 'medical', label: 'Medical' },
  { key: 'conditions', label: 'Conditions' },
  { key: 'legal', label: 'Legal' },
  { key: 'dosing', label: 'Dosing' }
];

export default function AdminGlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<GlossaryTerm>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAdminAuth();

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/admin/glossary?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      setTerms(data.terms || []);
      setCategoryCounts(data.categoryCounts || {});
    } catch (err) {
      console.error('Error fetching glossary:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, getAuthHeaders]);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const handleCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setFormData({
      term: '',
      display_name: '',
      definition: '',
      short_definition: '',
      category: 'cannabinoids',
      synonyms: [],
      related_terms: [],
      related_research: [],
      sources: []
    });
    setError(null);
  };

  const handleEdit = (term: GlossaryTerm) => {
    setIsEditing(term.id);
    setIsCreating(false);
    setFormData({ ...term });
    setError(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(null);
    setFormData({});
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    try {
      const method = isCreating ? 'POST' : 'PATCH';
      const body = isCreating ? formData : { id: isEditing, ...formData };

      const res = await fetch('/api/admin/glossary', {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save term');
      }

      handleCancel();
      fetchTerms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save term');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this glossary term? This cannot be undone.')) return;

    try {
      const res = await fetch('/api/admin/glossary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ids: [id] })
      });

      if (!res.ok) {
        throw new Error('Failed to delete term');
      }

      fetchTerms();
    } catch (err) {
      console.error('Error deleting term:', err);
      alert('Failed to delete term');
    }
  };

  const totalTerms = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Glossary</h1>
          <p className="text-gray-600 mt-2">
            Manage CBD & cannabis terminology ({totalTerms} terms)
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/glossary"
            target="_blank"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            View Public Page
          </Link>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Term
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Categories ({totalTerms})</option>
          {CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>
              {cat.label} ({categoryCounts[cat.key] || 0})
            </option>
          ))}
        </select>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isCreating ? 'Create New Term' : 'Edit Term'}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.term || ''}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., CBD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category || 'cannabinoids'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
                <span className="text-gray-500 font-normal ml-1">(shown as card title, e.g., "CBD (Cannabidiol)")</span>
              </label>
              <input
                type="text"
                value={formData.display_name || ''}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Leave blank to use term as display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Definition <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-1">(for tooltips, max 300 chars)</span>
              </label>
              <input
                type="text"
                value={formData.short_definition || ''}
                onChange={(e) => setFormData({ ...formData, short_definition: e.target.value })}
                maxLength={300}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="One-line definition for tooltips and previews"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Definition <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-1">(supports markdown)</span>
              </label>
              <textarea
                value={formData.definition || ''}
                onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-y"
                placeholder="Detailed definition with markdown support..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Synonyms
                <span className="text-gray-500 font-normal ml-1">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={(formData.synonyms || []).join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  synonyms: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="CBD, hemp extract, cannabidiol"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sources
                <span className="text-gray-500 font-normal ml-1">(one URL per line)</span>
              </label>
              <textarea
                value={(formData.sources || []).join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  sources: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-y"
                placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : isCreating ? 'Create Term' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : terms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900">No glossary terms</h3>
          <p className="text-gray-600 mt-1">
            {searchQuery || selectedCategory
              ? 'No terms match your filters'
              : 'Get started by adding your first term'}
          </p>
          {!searchQuery && !selectedCategory && (
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add First Term
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Term</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden lg:table-cell">Short Definition</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {terms.map(term => (
                <tr key={term.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{term.display_name || term.term}</div>
                    {term.display_name && term.display_name !== term.term && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        slug: {term.term}
                      </div>
                    )}
                    {term.synonyms && term.synonyms.length > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Also: {term.synonyms.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {CATEGORIES.find(c => c.key === term.category)?.label || term.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm text-gray-600 line-clamp-1">{term.short_definition}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(term)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(term.id)}
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
