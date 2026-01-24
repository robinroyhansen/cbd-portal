'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArticleTypeBadge } from '@/components/ArticleTypeBadge';
import { ArticleType } from '@/lib/article-templates';

type StatusTab = 'all' | 'published' | 'scheduled' | 'draft';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const router = useRouter();
  const supabase = createClient();

  // Count articles by status
  const statusCounts = useMemo(() => {
    const now = new Date();
    return {
      all: articles.length,
      published: articles.filter(a => a.status === 'published' && (!a.published_at || new Date(a.published_at) <= now)).length,
      scheduled: articles.filter(a => a.status === 'published' && a.published_at && new Date(a.published_at) > now).length,
      draft: articles.filter(a => a.status === 'draft').length,
    };
  }, [articles]);

  // Filter articles based on active tab
  const filteredArticles = useMemo(() => {
    const now = new Date();
    switch (activeTab) {
      case 'published':
        return articles.filter(a => a.status === 'published' && (!a.published_at || new Date(a.published_at) <= now));
      case 'scheduled':
        return articles.filter(a => a.status === 'published' && a.published_at && new Date(a.published_at) > now);
      case 'draft':
        return articles.filter(a => a.status === 'draft');
      default:
        return articles;
    }
  }, [articles, activeTab]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('kb_articles')
      .select(`
        *,
        category:kb_categories(name)
      `)
      .order('created_at', { ascending: false });

    setArticles(data || []);
    setLoading(false);
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    const response = await fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchArticles();
    } else {
      alert('Failed to delete article');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">Manage your CBD content with structured templates</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/articles/new"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <span>📝</span>
            <span>Create Article</span>
          </Link>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-4" aria-label="Tabs">
            {([
              { key: 'all', label: 'All Articles', icon: '📄' },
              { key: 'published', label: 'Published', icon: '✅' },
              { key: 'scheduled', label: 'Scheduled', icon: '📅' },
              { key: 'draft', label: 'Drafts', icon: '📝' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`
                  ml-1 px-2 py-0.5 rounded-full text-xs font-semibold
                  ${activeTab === tab.key
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {statusCounts[tab.key]}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Articles Table */}
      {!loading && (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredArticles?.map((article) => {
              const now = new Date();
              const isScheduled = article.status === 'published' && article.published_at && new Date(article.published_at) > now;
              const displayStatus = isScheduled ? 'scheduled' : article.status;

              return (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        /{article.slug}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ArticleTypeBadge type={article.article_type as ArticleType || 'standard'} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {(article.category as any)?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        displayStatus === 'published'
                          ? 'bg-green-100 text-green-800'
                          : displayStatus === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {displayStatus === 'scheduled' && <span>📅</span>}
                      {displayStatus}
                    </span>
                    {isScheduled && article.published_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(article.published_at).toLocaleDateString('en-GB', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/articles/${article.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-900 mr-4"
                    >
                      View
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => deleteArticle(article.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {activeTab === 'published' ? '✅' : activeTab === 'scheduled' ? '📅' : activeTab === 'draft' ? '📝' : '📄'}
            </div>
            <p className="text-gray-500">
              {activeTab === 'all'
                ? 'No articles found'
                : `No ${activeTab} articles`}
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                View all articles
              </button>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}