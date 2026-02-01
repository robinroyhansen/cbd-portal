'use client';

import { useState, useMemo } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { TOPIC_CLUSTERS, groupArticlesByTopic, getClusterById, getStartHereArticles, TopicCluster } from '@/lib/utils/topic-clusters';
import { ScienceArticleCard } from './ScienceArticleCard';

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  reading_time: number | null;
  updated_at: string;
}

interface ScienceCategoryViewProps {
  articles: Article[];
}

export function ScienceCategoryView({ articles }: ScienceCategoryViewProps) {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

  // Group articles by topic
  const articlesByTopic = useMemo(() => groupArticlesByTopic(articles), [articles]);

  // Get Start Here articles
  const startHereArticles = useMemo(() => getStartHereArticles(articles), [articles]);

  // Filter articles based on search and difficulty
  const filteredArticles = useMemo(() => {
    let filtered = selectedCluster
      ? articlesByTopic.get(selectedCluster) || []
      : articles;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCluster, searchQuery, articles, articlesByTopic]);

  // Get clusters with counts (only show clusters with articles)
  const clustersWithCounts = useMemo(() => {
    return TOPIC_CLUSTERS
      .map(cluster => ({
        ...cluster,
        count: (articlesByTopic.get(cluster.id) || []).length,
      }))
      .filter(c => c.count > 0)
      .sort((a, b) => a.priority - b.priority);
  }, [articlesByTopic]);

  const selectedClusterInfo = selectedCluster ? getClusterById(selectedCluster) : null;

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search science articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Mode */}
      {searchQuery ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Clear search
            </button>
          </div>
          <div className="grid gap-4">
            {filteredArticles.map((article) => (
              <ScienceArticleCard
                key={article.slug}
                article={article}
                borderColor="border-purple-200"
              />
            ))}
          </div>
          {filteredArticles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No articles found matching your search.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-purple-600 hover:text-purple-800"
              >
                Clear search and browse topics
              </button>
            </div>
          )}
        </div>
      ) : selectedCluster ? (
        /* Single Cluster View */
        <div>
          {/* Back button and cluster header */}
          <div className="mb-6">
            <button
              onClick={() => setSelectedCluster(null)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all topics
            </button>

            {selectedClusterInfo && (
              <div className={`rounded-xl p-6 ${selectedClusterInfo.bgColor} border-2 border-opacity-50`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selectedClusterInfo.icon}</span>
                  <div>
                    <h2 className={`text-2xl font-bold ${selectedClusterInfo.color}`}>
                      {selectedClusterInfo.name}
                    </h2>
                    <p className="text-gray-600">{selectedClusterInfo.description}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {filteredArticles.length} articles in this topic
                </p>
              </div>
            )}
          </div>

          {/* Articles in this cluster */}
          <div className="grid gap-4">
            {filteredArticles.map((article) => (
              <ScienceArticleCard
                key={article.slug}
                article={article}
                borderColor="border-purple-200"
              />
            ))}
          </div>
        </div>
      ) : (
        /* Topic Clusters Overview */
        <>
          {/* Start Here Section */}
          {startHereArticles.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚀</span>
                <h2 className="text-xl font-bold text-gray-900">Start Here</h2>
                <span className="text-sm text-gray-500">— New to CBD? Begin with these guides</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {startHereArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-md hover:border-green-300 transition-all"
                  >
                    <span className="text-3xl">📚</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                      <span className="inline-block mt-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        Recommended for beginners
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Topic Clusters Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Browse by Topic</h2>
              <span className="text-sm text-gray-500">{articles.length} total articles</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clustersWithCounts.map((cluster) => (
                <button
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster.id)}
                  className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-lg hover:-translate-y-0.5 ${cluster.bgColor} border-opacity-50 hover:border-opacity-100`}
                  style={{ borderColor: `var(--${cluster.color.replace('text-', '')})` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{cluster.icon}</span>
                    <span className={`text-sm font-semibold ${cluster.color} bg-white/80 px-2 py-0.5 rounded-full`}>
                      {cluster.count}
                    </span>
                  </div>
                  <h3 className={`font-bold text-lg ${cluster.color} mb-1`}>{cluster.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{cluster.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600">{articles.length}</div>
                <div className="text-sm text-gray-500">Total Articles</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{clustersWithCounts.length}</div>
                <div className="text-sm text-gray-500">Topics Covered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(articles.reduce((sum, a) => sum + (a.reading_time || 0), 0) / 60)}h
                </div>
                <div className="text-sm text-gray-500">Total Reading</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {(articlesByTopic.get('cannabinoids') || []).length}
                </div>
                <div className="text-sm text-gray-500">Cannabinoid Guides</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
