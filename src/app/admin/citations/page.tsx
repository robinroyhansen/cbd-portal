'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminCitationsPage() {
  const [citations, setCitations] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [citationsRes, articlesRes] = await Promise.all([
      supabase
        .from('citations')
        .select(`
          *,
          article:articles(title, slug)
        `)
        .order('accessed_at', { ascending: false }),
      supabase
        .from('articles')
        .select('id, title')
        .order('title')
    ]);

    setCitations(citationsRes.data || []);
    setArticles(articlesRes.data || []);
    setLoading(false);
  };

  const deleteCitation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this citation?')) return;

    const { error } = await supabase
      .from('citations')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchData();
    } else {
      alert('Failed to delete citation');
    }
  };

  const filteredCitations = selectedArticle
    ? citations.filter(c => c.article_id === selectedArticle)
    : citations;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Citations</h1>
        <Link
          href="/admin/citations/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          ➕ New Citation
        </Link>
      </div>

      {/* Filter by Article */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Article
        </label>
        <select
          value={selectedArticle}
          onChange={(e) => setSelectedArticle(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Articles</option>
          {articles.map((article) => (
            <option key={article.id} value={article.id}>
              {article.title}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {filteredCitations.map((citation) => (
            <div
              key={citation.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {citation.title}
                  </h3>
                  {citation.authors && (
                    <p className="text-sm text-gray-600 mb-1">
                      {citation.authors}
                    </p>
                  )}
                  <div className="text-sm text-gray-500 space-x-4">
                    {citation.publication && (
                      <span>{citation.publication}</span>
                    )}
                    {citation.year && <span>({citation.year})</span>}
                    {citation.doi && (
                      <span>DOI: {citation.doi}</span>
                    )}
                  </div>
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                    >
                      View source →
                    </a>
                  )}
                  <div className="mt-2">
                    <Link
                      href={`/articles/${(citation.article as any)?.slug}`}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Article: {(citation.article as any)?.title}
                    </Link>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/admin/citations/${citation.id}/edit`}
                    className="text-primary-600 hover:text-primary-900 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteCitation(citation.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCitations.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">
                {selectedArticle
                  ? 'No citations found for this article'
                  : 'No citations found'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}