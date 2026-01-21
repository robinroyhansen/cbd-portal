'use client';

import { useState } from 'react';
import {
  TERPENE_CATEGORIES,
  TERPENE_CATEGORY_META,
  FEATURED_TERPENES,
  categorizeTerpeneArticles,
  getTerpeneStats,
  TerpeneCategory,
} from '@/lib/terpenes';
import {
  HubHero,
  HubQuickStats,
  HubSection,
  HubArticleCard,
  HubArticleGrid,
  HubCTA,
  HubEmptyState,
} from '@/components/hub';

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  reading_time: number | null;
  updated_at: string;
}

interface TerpenesHubProps {
  articles: Article[];
}

export function TerpenesHub({ articles }: TerpenesHubProps) {
  const [activeCategory, setActiveCategory] = useState<TerpeneCategory | null>(null);

  const categorized = categorizeTerpeneArticles(articles);
  const stats = getTerpeneStats(categorized);

  const filteredArticles = activeCategory ? categorized.byCategory[activeCategory] : articles;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="🌸"
        title="Terpenes"
        subtitle="The Aromatic Compounds Behind CBD's Effects"
        description={`Explore ${stats.total} comprehensive guides on terpenes - the aromatic compounds that shape CBD's aroma, flavor, and therapeutic effects through the entourage effect.`}
        badgeText="Terpene Encyclopedia"
        badgeColor="bg-pink-100 text-pink-700"
        gradientFrom="from-pink-50"
        gradientTo="to-purple-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Terpene Guides', color: 'text-pink-600' },
          { value: stats.profiles, label: 'Terpene Profiles', color: 'text-purple-600' },
          { value: stats.effects, label: 'Effects Guides', color: 'text-blue-600' },
          { value: FEATURED_TERPENES.length, label: 'Major Terpenes', color: 'text-emerald-600' },
        ]}
      />

      {/* Featured Terpenes Quick Reference */}
      <HubSection
        title="Common Terpenes"
        description="Quick reference for the most prevalent terpenes in CBD products"
        icon="🎯"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_TERPENES.map(terpene => (
            <div
              key={terpene.name}
              className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:border-pink-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{terpene.icon}</span>
                <h3 className="font-semibold text-gray-900">{terpene.name}</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-500">
                  <span className="font-medium text-gray-700">Aroma:</span> {terpene.aroma}
                </p>
                <p className="text-gray-500">
                  <span className="font-medium text-gray-700">Effects:</span> {terpene.effects}
                </p>
              </div>
            </div>
          ))}
        </div>
      </HubSection>

      {/* Category Navigator */}
      <HubSection
        title="Browse by Topic"
        description="Explore terpene content by category"
        icon="📑"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TERPENE_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                activeCategory === category.id
                  ? `${category.bgColor} ${category.borderColor} ring-2 ring-offset-2`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className={`font-semibold ${activeCategory === category.id ? category.color : 'text-gray-900'}`}>
                    {category.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {categorized.byCategory[category.id].length} articles
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{category.description}</p>
            </button>
          ))}
        </div>
      </HubSection>

      {/* Filter Notice */}
      {activeCategory && (
        <div className={`${TERPENE_CATEGORY_META[activeCategory].bgColor} border ${TERPENE_CATEGORY_META[activeCategory].borderColor} rounded-xl p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{TERPENE_CATEGORY_META[activeCategory].icon}</span>
            <div>
              <h3 className={`font-semibold ${TERPENE_CATEGORY_META[activeCategory].color}`}>
                {TERPENE_CATEGORY_META[activeCategory].name}
              </h3>
              <p className="text-sm text-gray-600">{filteredArticles.length} articles available</p>
            </div>
          </div>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Show all terpene topics
          </button>
        </div>
      )}

      {/* Articles Display */}
      {activeCategory ? (
        <HubSection title="Articles">
          {filteredArticles.length > 0 ? (
            <HubArticleGrid columns={3}>
              {filteredArticles.map(article => (
                <HubArticleCard
                  key={article.slug}
                  article={article}
                  borderColor={TERPENE_CATEGORY_META[activeCategory].borderColor}
                  hoverBorderColor={`hover:${TERPENE_CATEGORY_META[activeCategory].borderColor.replace('200', '400')}`}
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon={TERPENE_CATEGORY_META[activeCategory].icon}
              title="Coming Soon"
              description={`We're developing ${TERPENE_CATEGORY_META[activeCategory].name.toLowerCase()} content.`}
            />
          )}
        </HubSection>
      ) : (
        <>
          {/* Terpene Profiles */}
          {categorized.byCategory.profiles.length > 0 && (
            <HubSection
              title="Terpene Profiles"
              description="Deep dives into individual terpenes"
              icon="🌸"
              headerRight={
                <button
                  onClick={() => setActiveCategory('profiles')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  View all {categorized.byCategory.profiles.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.profiles.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-pink-200"
                    hoverBorderColor="hover:border-pink-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Effects */}
          {categorized.byCategory.effects.length > 0 && (
            <HubSection
              title="Terpene Effects"
              description="Understanding how terpenes affect your experience"
              icon="✨"
              headerRight={
                <button
                  onClick={() => setActiveCategory('effects')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all {categorized.byCategory.effects.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.effects.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-purple-200"
                    hoverBorderColor="hover:border-purple-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Science */}
          {categorized.byCategory.science.length > 0 && (
            <HubSection
              title="Terpene Science"
              description="Research and mechanisms behind terpene effects"
              icon="🔬"
              headerRight={
                <button
                  onClick={() => setActiveCategory('science')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {categorized.byCategory.science.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.science.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-blue-200"
                    hoverBorderColor="hover:border-blue-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}
        </>
      )}

      {/* CTA */}
      <HubCTA
        title="Learn About the Entourage Effect"
        description="Discover how terpenes work synergistically with cannabinoids to enhance therapeutic benefits."
        gradientFrom="from-pink-600"
        gradientTo="to-purple-600"
        buttons={[
          { label: 'Explore Cannabinoids', href: '/categories/cannabinoids' },
          { label: 'Browse Products', href: '/categories/products', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
