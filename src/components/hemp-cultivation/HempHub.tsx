'use client';

import { useState } from 'react';
import {
  HEMP_CATEGORIES,
  HEMP_CATEGORY_META,
  HEMP_FACTS,
  categorizeHempArticles,
  getHempStats,
  HempCategory,
} from '@/lib/hemp-cultivation';
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

interface HempHubProps {
  articles: Article[];
}

export function HempHub({ articles }: HempHubProps) {
  const [activeCategory, setActiveCategory] = useState<HempCategory | null>(null);

  const categorized = categorizeHempArticles(articles);
  const stats = getHempStats(categorized);

  const filteredArticles = activeCategory ? categorized.byCategory[activeCategory] : articles;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="🌱"
        title="Hemp & Cultivation"
        subtitle="From Seed to CBD Product"
        description={`Explore ${stats.total} comprehensive guides on hemp farming, processing, sustainability, and the growing industry behind CBD products.`}
        badgeText="Hemp Encyclopedia"
        badgeColor="bg-green-100 text-green-700"
        gradientFrom="from-green-50"
        gradientTo="to-emerald-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Hemp Guides', color: 'text-green-600' },
          { value: stats.growing, label: 'Growing Guides', color: 'text-emerald-600' },
          { value: stats.processing, label: 'Processing', color: 'text-blue-600' },
          { value: stats.sustainability, label: 'Sustainability', color: 'text-teal-600' },
        ]}
      />

      {/* Hemp Facts */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
          <span>🌿</span> Did You Know?
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HEMP_FACTS.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-sm text-green-700">{item.fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Navigator */}
      <HubSection
        title="Browse by Topic"
        description="Explore hemp content by category"
        icon="📑"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEMP_CATEGORIES.map(category => (
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
        <div className={`${HEMP_CATEGORY_META[activeCategory].bgColor} border ${HEMP_CATEGORY_META[activeCategory].borderColor} rounded-xl p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{HEMP_CATEGORY_META[activeCategory].icon}</span>
            <div>
              <h3 className={`font-semibold ${HEMP_CATEGORY_META[activeCategory].color}`}>
                {HEMP_CATEGORY_META[activeCategory].name}
              </h3>
              <p className="text-sm text-gray-600">{filteredArticles.length} articles available</p>
            </div>
          </div>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Show all hemp topics
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
                  borderColor={HEMP_CATEGORY_META[activeCategory].borderColor}
                  hoverBorderColor={`hover:${HEMP_CATEGORY_META[activeCategory].borderColor.replace('200', '400')}`}
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon={HEMP_CATEGORY_META[activeCategory].icon}
              title="Coming Soon"
              description={`We're developing ${HEMP_CATEGORY_META[activeCategory].name.toLowerCase()} content.`}
            />
          )}
        </HubSection>
      ) : (
        <>
          {/* Growing Hemp */}
          {categorized.byCategory.growing.length > 0 && (
            <HubSection
              title="Growing Hemp"
              description="Learn about hemp cultivation and farming practices"
              icon="🌱"
              headerRight={
                <button
                  onClick={() => setActiveCategory('growing')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View all {categorized.byCategory.growing.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.growing.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-green-200"
                    hoverBorderColor="hover:border-green-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Processing */}
          {categorized.byCategory.processing.length > 0 && (
            <HubSection
              title="Processing & Extraction"
              description="How CBD is extracted and refined from hemp plants"
              icon="🏭"
              headerRight={
                <button
                  onClick={() => setActiveCategory('processing')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {categorized.byCategory.processing.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.processing.slice(0, 6).map(article => (
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

          {/* Sustainability */}
          {categorized.byCategory.sustainability.length > 0 && (
            <HubSection
              title="Sustainability"
              description="Environmental benefits of hemp cultivation"
              icon="♻️"
              headerRight={
                <button
                  onClick={() => setActiveCategory('sustainability')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View all {categorized.byCategory.sustainability.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.sustainability.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    badge="Eco-Friendly"
                    badgeColor="bg-emerald-100 text-emerald-700"
                    borderColor="border-emerald-200"
                    hoverBorderColor="hover:border-emerald-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Industry */}
          {categorized.byCategory.industry.length > 0 && (
            <HubSection
              title="Hemp Industry"
              description="Market trends and commercial applications"
              icon="📈"
              headerRight={
                <button
                  onClick={() => setActiveCategory('industry')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all {categorized.byCategory.industry.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.industry.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-amber-200"
                    hoverBorderColor="hover:border-amber-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}
        </>
      )}

      {/* CTA */}
      <HubCTA
        title="Interested in CBD Products?"
        description="Learn how hemp becomes the CBD products you use every day."
        gradientFrom="from-green-600"
        gradientTo="to-emerald-600"
        buttons={[
          { label: 'Explore Products', href: '/categories/products' },
          { label: 'Learn CBD Basics', href: '/categories/cbd-basics', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
