'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArticleTypeBadge } from '@/components/ArticleTypeBadge';
import { ArticleType, articleTemplates } from '@/lib/article-templates';

type StatusTab = 'all' | 'published' | 'scheduled' | 'draft';
type SortField = 'created_at' | 'title' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 25;

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
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

  // Filter articles based on all criteria
  const filteredArticles = useMemo(() => {
    const now = new Date();
    let result = articles;

    // Filter by status tab
    switch (activeTab) {
      case 'published':
        result = result.filter(a => a.status === 'published' && (!a.published_at || new Date(a.published_at) <= now));
        break;
      case 'scheduled':
        result = result.filter(a => a.status === 'published' && a.published_at && new Date(a.published_at) > now);
        break;
      case 'draft':
        result = result.filter(a => a.status === 'draft');
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title?.toLowerCase().includes(query) ||
        a.slug?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category_id === selectedCategory);
    }

    // Filter by article type
    if (selectedType !== 'all') {
      result = result.filter(a => a.article_type === selectedType);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'title') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      } else {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });

    return result;
  }, [articles, activeTab, searchQuery, selectedCategory, selectedType, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCategory, selectedType]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('kb_articles')
      .select(`
        *,
        category:kb_categories(id, name)
      `)
      .order('created_at', { ascending: false });

    setArticles(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('kb_categories')
      .select('id, name')
      .order('name');
    setCategories(data || []);
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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white min-w-[160px]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white min-w-[140px]"
          >
            <option value="all">All Types</option>
            {Object.entries(articleTemplates).map(([key, template]) => (
              <option key={key} value={key}>{template.name}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filter Results Summary */}
        {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all') && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
            Showing {filteredArticles.length} of {articles.length} articles
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          </div>
        )}
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
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Title
                  {sortField === 'title' && (
                    <span className="text-primary-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
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
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Created
                  {sortField === 'created_at' && (
                    <span className="text-primary-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedArticles?.map((article) => {
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

        {/* Pagination */}
        {filteredArticles.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredArticles.length)} of {filteredArticles.length} articles
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                ? '🔍'
                : activeTab === 'published' ? '✅' : activeTab === 'scheduled' ? '📅' : activeTab === 'draft' ? '📝' : '📄'}
            </div>
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                ? 'No articles match your filters'
                : activeTab === 'all'
                  ? 'No articles found'
                  : `No ${activeTab} articles`}
            </p>
            {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
            )}
            {activeTab !== 'all' && !searchQuery && selectedCategory === 'all' && selectedType === 'all' && (
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