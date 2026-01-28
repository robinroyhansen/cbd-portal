'use client';

import { useState, useMemo } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';
import Image from 'next/image';
import { useLocale } from '@/hooks/useLocale';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  meta_description?: string;
  featured_image?: string;
  reading_time?: string;
  published_at?: string;
  updated_at?: string;
  created_at?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  article_count?: number;
}

interface ArticlesHubProps {
  articles: Article[];
  categories: Category[];
  lang?: string;
}

const categoryStyles: Record<string, { icon: string; color: string; bgColor: string }> = {
  'basics': { icon: '📚', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  'dosage': { icon: '💊', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  'conditions': { icon: '🏥', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  'research': { icon: '🔬', color: 'text-cyan-700', bgColor: 'bg-cyan-50' },
  'products': { icon: '🧴', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  'legal': { icon: '⚖️', color: 'text-slate-700', bgColor: 'bg-slate-50' },
  'pets': { icon: '🐕', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  'wellness': { icon: '🌿', color: 'text-green-700', bgColor: 'bg-green-50' },
  'safety': { icon: '🛡️', color: 'text-red-700', bgColor: 'bg-red-50' },
  'news': { icon: '📰', color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
};

function getCategoryStyle(slug: string) {
  return categoryStyles[slug] || { icon: '📄', color: 'text-gray-700', bgColor: 'bg-gray-50' };
}

function formatDate(dateString: string, lang: string) {
  const locale = lang === 'en' ? 'en-GB' : lang;
  return new Date(dateString).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ArticlesHub({ articles, categories }: ArticlesHubProps) {
  const { t, lang } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const featuredArticles = useMemo(() => articles.slice(0, 3), [articles]);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((a) =>
        a.title.toLowerCase().includes(query) ||
        a.excerpt?.toLowerCase().includes(query) ||
        a.meta_description?.toLowerCase().includes(query) ||
        a.category?.name.toLowerCase().includes(query)
      );
    }
    if (selectedCategory) {
      result = result.filter((a) => a.category?.slug === selectedCategory);
    }
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at || 0).getTime();
      const dateB = new Date(b.published_at || b.created_at || 0).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [articles, searchQuery, selectedCategory, sortBy]);

  const totalArticles = articles.length;
  const totalCategories = categories.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {t('articlesPage.knowledgeBase')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('articlesPage.title')}
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
              {t('articlesPage.subtitle')}
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalArticles}</p>
                  <p className="text-sm text-white/70">{t('articlesPage.articles')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCategories}</p>
                  <p className="text-sm text-white/70">{t('articlesPage.topics')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Search and Filter Bar */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm mb-8 -mt-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t('articlesPage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="newest">{t('articlesPage.newest')}</option>
              <option value="oldest">{t('articlesPage.oldest')}</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('articlesPage.allArticles')}
            </button>
            {categories.map((category) => {
              const style = getCategoryStyle(category.slug);
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.slug ? null : category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${selectedCategory === category.slug ? `${style.bgColor} ${style.color} ring-2 ring-offset-1 ring-current` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <span>{style.icon}</span>
                  <span className="hidden sm:inline">{t(`articlesPage.categories.${category.slug}`) || category.name}</span>
                  {category.article_count !== undefined && <span className="text-xs opacity-60">({category.article_count})</span>}
                </button>
              );
            })}
          </div>

          {(searchQuery || selectedCategory) && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {t('articlesPage.showingOf')} <span className="font-semibold text-gray-900">{filteredArticles.length}</span> {t('articlesPage.of')} {totalArticles} {t('common.articles')}
                {selectedCategory && <> {t('articlesPage.articlesIn')} <span className="font-medium">{t(`articlesPage.categories.${selectedCategory}`) || categories.find((c) => c.slug === selectedCategory)?.name}</span></>}
              </span>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {t('articlesPage.clearFilters')}
              </button>
            </div>
          )}
        </section>

        {/* Featured Articles */}
        {!searchQuery && !selectedCategory && featuredArticles.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('articlesPage.featuredArticles')}</h2>
                <p className="text-gray-500 text-sm">{t('articlesPage.featuredSubtitle')}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredArticles.map((article, index) => {
                const categoryStyle = article.category ? getCategoryStyle(article.category.slug) : getCategoryStyle('');
                return (
                  <Link key={article.id} href={`/articles/${article.slug}`}
                    className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <div className={`relative overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 ${index === 0 ? 'aspect-[2/1]' : 'aspect-video'}`}>
                      {article.featured_image ? (
                        <Image
                          src={article.featured_image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-blue-300/50">
                            <svg className={`${index === 0 ? 'w-20 h-20' : 'w-12 h-12'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`p-5 ${index === 0 ? 'md:p-8' : ''}`}>
                      {article.category && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${categoryStyle.bgColor} ${categoryStyle.color} text-xs font-medium rounded-full mb-3`}>
                          <span>{categoryStyle.icon}</span>{article.category.slug ? t(`articlesPage.categories.${article.category.slug}`) || article.category.name : article.category.name}
                        </span>
                      )}
                      <h3 className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 ${index === 0 ? 'text-xl md:text-2xl' : 'text-lg'}`}>{article.title}</h3>
                      {(article.excerpt || article.meta_description) && (
                        <p className={`text-gray-500 mb-4 ${index === 0 ? 'line-clamp-3' : 'line-clamp-2 text-sm'}`}>{article.excerpt || article.meta_description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-3">
                          {article.reading_time && <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{article.reading_time}</span>}
                          {(article.published_at || article.created_at) && <span>{formatDate(article.published_at || article.created_at || '', lang)}</span>}
                        </div>
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* All Articles Grid */}
        <section>
          {!searchQuery && !selectedCategory && (
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('articlesPage.allArticlesTitle')}</h2>
                <p className="text-gray-500 text-sm">{t('articlesPage.allArticlesSubtitle')}</p>
              </div>
            </div>
          )}

          {filteredArticles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchQuery || selectedCategory ? filteredArticles : filteredArticles.slice(3)).map((article) => {
                const categoryStyle = article.category ? getCategoryStyle(article.category.slug) : getCategoryStyle('');
                return (
                  <Link key={article.id} href={`/articles/${article.slug}`}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {article.featured_image ? (
                        <Image
                          src={article.featured_image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-gray-300">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      {article.category && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 ${categoryStyle.bgColor} ${categoryStyle.color} text-xs font-medium rounded-full mb-3`}>
                          <span>{categoryStyle.icon}</span>{article.category.slug ? t(`articlesPage.categories.${article.category.slug}`) || article.category.name : article.category.name}
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">{article.title}</h3>
                      {(article.excerpt || article.meta_description) && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{article.excerpt || article.meta_description}</p>}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          {article.reading_time && <span>{article.reading_time}</span>}
                          {article.reading_time && (article.published_at || article.created_at) && <span>•</span>}
                          {(article.published_at || article.created_at) && <span>{formatDate(article.published_at || article.created_at || '', lang)}</span>}
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('articlesPage.noArticlesFound')}</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">{t('articlesPage.noArticlesDesc')}</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {t('articlesPage.resetFilters')}
              </button>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-12 text-white">
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('articlesPage.exploreConditions')}</h2>
            <p className="text-gray-300 mb-8 text-lg">{t('articlesPage.exploreConditionsDesc')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/conditions" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {t('articlesPage.browseConditions')}
              </Link>
              <Link href="/research" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {t('articlesPage.viewResearch')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
