'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ConditionStatus {
  slug: string;
  name: string;
  hasContent: boolean;
  contentLength: number;
  researchCount: number;
  lastUpdated: string | null;
}

interface Stats {
  total: number;
  withContent: number;
  needsContent: number;
  conditions: ConditionStatus[];
}

export default function ConditionGeneratePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewCondition, setPreviewCondition] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/conditions/generate-content');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch conditions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleGenerate = async (slug: string, preview: boolean = false) => {
    setGenerating(slug);
    setError(null);
    setPreviewContent(null);

    try {
      const res = await fetch('/api/admin/conditions/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditionSlug: slug, preview })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (preview) {
        setPreviewContent(data.content);
        setPreviewCondition(data.condition);
      } else {
        await fetchStats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(null);
    }
  };

  const handleBulkGenerate = async (slugs: string[]) => {
    for (const slug of slugs) {
      await handleGenerate(slug, false);
      // Small delay between generations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  // Sort conditions: prioritize those with research but no content
  const sortedConditions = stats?.conditions?.slice().sort((a, b) => {
    // First, conditions needing content with research
    if (!a.hasContent && !b.hasContent) {
      return b.researchCount - a.researchCount;
    }
    if (!a.hasContent) return -1;
    if (!b.hasContent) return 1;
    return b.researchCount - a.researchCount;
  });

  // Get top priority conditions (need content, have research)
  const priorityConditions = sortedConditions?.filter(c => !c.hasContent && c.researchCount > 0).slice(0, 10) || [];

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Condition Content Generator</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive research-backed articles for condition pages</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{stats?.total || 0}</div>
          <div className="text-sm text-gray-500">Total Conditions</div>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="text-3xl font-bold text-green-700">{stats?.withContent || 0}</div>
          <div className="text-sm text-green-600">With Content</div>
        </div>
        <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6">
          <div className="text-3xl font-bold text-amber-700">{stats?.needsContent || 0}</div>
          <div className="text-sm text-amber-600">Needs Content</div>
        </div>
      </div>

      {/* Priority Queue */}
      {priorityConditions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Priority Queue</h2>
            <button
              onClick={() => handleBulkGenerate(priorityConditions.map(c => c.slug))}
              disabled={!!generating}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Generate All ({priorityConditions.length})
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Conditions with the most research but no comprehensive content yet
          </p>

          <div className="grid gap-3">
            {priorityConditions.map((condition) => (
              <div
                key={condition.slug}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-700 font-bold text-sm">{condition.researchCount}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{condition.name}</p>
                    <p className="text-sm text-gray-500">{condition.researchCount} studies available</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerate(condition.slug, true)}
                    disabled={!!generating}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleGenerate(condition.slug, false)}
                    disabled={!!generating}
                    className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {generating === condition.slug ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Preview: {previewCondition}</h3>
              <button
                onClick={() => {
                  setPreviewContent(null);
                  setPreviewCondition(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div
                className="condition-article prose max-w-none"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setPreviewContent(null);
                  setPreviewCondition(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const slug = sortedConditions?.find(c => c.name === previewCondition)?.slug;
                  if (slug) {
                    setPreviewContent(null);
                    setPreviewCondition(null);
                    await handleGenerate(slug, false);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Conditions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Conditions</h2>

        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Condition</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Studies</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Content</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Last Updated</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedConditions?.map((condition) => (
                <tr key={condition.slug} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link
                      href={`/conditions/${condition.slug}`}
                      className="font-medium text-gray-900 hover:text-emerald-600"
                      target="_blank"
                    >
                      {condition.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      condition.researchCount >= 20 ? 'bg-emerald-100 text-emerald-800' :
                      condition.researchCount >= 10 ? 'bg-green-100 text-green-800' :
                      condition.researchCount >= 5 ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {condition.researchCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {condition.hasContent ? (
                      <span className="text-green-600">✓ {Math.round(condition.contentLength / 1000)}k chars</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-500">
                    {condition.lastUpdated
                      ? new Date(condition.lastUpdated).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleGenerate(condition.slug, true)}
                        disabled={!!generating}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleGenerate(condition.slug, false)}
                        disabled={!!generating}
                        className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {generating === condition.slug ? '...' : condition.hasContent ? 'Regenerate' : 'Generate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
