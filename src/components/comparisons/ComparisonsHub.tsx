'use client';

import { useState } from 'react';
import {
  COMPARISON_CATEGORIES,
  COMPARISON_CATEGORY_META,
  categorizeComparisonArticles,
  getComparisonStats,
  ComparisonCategory,
} from '@/lib/comparisons';
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

interface ComparisonsHubProps {
  articles: Article[];
}

export function ComparisonsHub({ articles }: ComparisonsHubProps) {
  const [activeCategory, setActiveCategory] = useState<ComparisonCategory | null>(null);

  const categorized = categorizeComparisonArticles(articles);
  const stats = getComparisonStats(categorized);

  const filteredArticles = activeCategory ? categorized.byCategory[activeCategory] : articles;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="⚖️"
        title="CBD Comparisons"
        subtitle="Side-by-Side Guides to Help You Choose"
        description={`Browse ${stats.total} detailed comparison guides. From CBD vs THC to product type showdowns, find the information you need to make informed decisions.`}
        badgeText="Comparison Center"
        badgeColor="bg-amber-100 text-amber-700"
        gradientFrom="from-amber-50"
        gradientTo="to-orange-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Comparisons', color: 'text-amber-600' },
          { value: stats.cbdVsThc, label: 'CBD vs THC', color: 'text-indigo-600' },
          { value: stats.cannabinoids, label: 'Cannabinoid', color: 'text-purple-600' },
          { value: stats.products, label: 'Product', color: 'text-emerald-600' },
        ]}
      />

      {/* Category Navigator */}
      <HubSection
        title="Browse by Comparison Type"
        description="Select a category to find specific comparisons"
        icon="📑"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMPARISON_CATEGORIES.map(category => (
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
                    {categorized.byCategory[category.id].length} comparisons
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
        <div className={`${COMPARISON_CATEGORY_META[activeCategory].bgColor} border ${COMPARISON_CATEGORY_META[activeCategory].borderColor} rounded-xl p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{COMPARISON_CATEGORY_META[activeCategory].icon}</span>
            <div>
              <h3 className={`font-semibold ${COMPARISON_CATEGORY_META[activeCategory].color}`}>
                {COMPARISON_CATEGORY_META[activeCategory].name}
              </h3>
              <p className="text-sm text-gray-600">{filteredArticles.length} comparisons available</p>
            </div>
          </div>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Show all comparisons
          </button>
        </div>
      )}

      {/* Articles Display */}
      {activeCategory ? (
        <HubSection title="Comparisons">
          {filteredArticles.length > 0 ? (
            <HubArticleGrid columns={3}>
              {filteredArticles.map(article => (
                <HubArticleCard
                  key={article.slug}
                  article={article}
                  borderColor={COMPARISON_CATEGORY_META[activeCategory].borderColor}
                  hoverBorderColor={`hover:${COMPARISON_CATEGORY_META[activeCategory].borderColor.replace('200', '400')}`}
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon={COMPARISON_CATEGORY_META[activeCategory].icon}
              title="Coming Soon"
              description={`We're developing ${COMPARISON_CATEGORY_META[activeCategory].name.toLowerCase()} content.`}
            />
          )}
        </HubSection>
      ) : (
        <>
          {/* CBD vs THC */}
          {categorized.byCategory['cbd-vs-thc'].length > 0 && (
            <HubSection
              title="CBD vs THC"
              description="The fundamental comparison everyone asks about"
              icon="⚖️"
              headerRight={
                <button
                  onClick={() => setActiveCategory('cbd-vs-thc')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all {categorized.byCategory['cbd-vs-thc'].length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory['cbd-vs-thc'].slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    badge="Popular"
                    badgeColor="bg-amber-100 text-amber-700"
                    borderColor="border-amber-200"
                    hoverBorderColor="hover:border-amber-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Cannabinoid Comparisons */}
          {categorized.byCategory['cannabinoid-comparisons'].length > 0 && (
            <HubSection
              title="Cannabinoid Comparisons"
              description="Compare CBD with CBG, CBN, CBC, and other cannabinoids"
              icon="🧬"
              headerRight={
                <button
                  onClick={() => setActiveCategory('cannabinoid-comparisons')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all {categorized.byCategory['cannabinoid-comparisons'].length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory['cannabinoid-comparisons'].slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-indigo-200"
                    hoverBorderColor="hover:border-indigo-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Product Comparisons */}
          {categorized.byCategory['product-comparisons'].length > 0 && (
            <HubSection
              title="Product Comparisons"
              description="Compare different CBD product types and formats"
              icon="🧴"
              headerRight={
                <button
                  onClick={() => setActiveCategory('product-comparisons')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View all {categorized.byCategory['product-comparisons'].length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory['product-comparisons'].slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-emerald-200"
                    hoverBorderColor="hover:border-emerald-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Method Comparisons */}
          {categorized.byCategory['method-comparisons'].length > 0 && (
            <HubSection
              title="Method Comparisons"
              description="Compare consumption methods and delivery systems"
              icon="📊"
              headerRight={
                <button
                  onClick={() => setActiveCategory('method-comparisons')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all {categorized.byCategory['method-comparisons'].length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory['method-comparisons'].slice(0, 6).map(article => (
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
        </>
      )}

      {/* CTA */}
      <HubCTA
        title="Still Unsure What's Right for You?"
        description="Our product finder tool can help you discover the best CBD product based on your needs and preferences."
        gradientFrom="from-amber-600"
        gradientTo="to-orange-600"
        buttons={[
          { label: 'Product Finder', href: '/tools/product-finder' },
          { label: 'Browse Products', href: '/categories/products', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
