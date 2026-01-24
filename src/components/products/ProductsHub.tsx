'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_META,
  categorizeProductArticles,
  getProductStats,
  ProductType,
} from '@/lib/products';
import {
  HubHero,
  HubQuickStats,
  HubSection,
  HubArticleCard,
  HubArticleGrid,
  HubFeatureCard,
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

interface ProductsHubProps {
  articles: Article[];
}

export function ProductsHub({ articles }: ProductsHubProps) {
  const [activeType, setActiveType] = useState<ProductType | null>(null);

  const categorized = categorizeProductArticles(articles);
  const stats = getProductStats(categorized);

  const filteredArticles = activeType ? categorized.byType[activeType] : articles;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="🧴"
        title="CBD Products"
        subtitle="Complete Guide to CBD Product Types"
        description={`Explore ${stats.total} comprehensive guides covering oils, edibles, topicals, vapes, and more. Find the perfect CBD product for your needs.`}
        badgeText="Product Encyclopedia"
        badgeColor="bg-emerald-100 text-emerald-700 border-emerald-200"
        gradientFrom="from-emerald-50"
        gradientVia="via-green-50"
        gradientTo="to-teal-50"
        pattern="botanical"
        accentColor="text-emerald-600"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Product Guides', color: 'text-emerald-600' },
          { value: stats.byType.oils, label: 'Oils & Tinctures', color: 'text-green-600' },
          { value: stats.byType.edibles, label: 'Edibles', color: 'text-pink-600' },
          { value: stats.comparisons, label: 'Comparisons', color: 'text-amber-600' },
        ]}
      />

      {/* Product Type Selector */}
      <HubSection
        title="Browse by Product Type"
        description="Select a product type to find relevant guides and information"
        icon="🎯"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCT_CATEGORIES.filter(cat => cat.id !== 'other').map(category => (
            <button
              key={category.id}
              onClick={() => setActiveType(activeType === category.id ? null : category.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                activeType === category.id
                  ? `${category.bgColor} ${category.borderColor} ring-2 ring-offset-2`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{category.icon}</span>
                <h3 className={`font-semibold text-sm ${activeType === category.id ? category.color : 'text-gray-900'}`}>
                  {category.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-2">{categorized.byType[category.id].length} articles</p>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {category.onsetTime}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {category.bioavailability}
                </span>
              </div>
            </button>
          ))}
        </div>
      </HubSection>

      {/* Product Comparison Table */}
      {!activeType && (
        <HubSection
          title="Quick Comparison"
          description="Compare onset times, duration, and bioavailability at a glance"
          icon="📊"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-700 border-b">Product Type</th>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b">Onset</th>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b">Duration</th>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b">Bioavailability</th>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b">Best For</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCT_CATEGORIES.filter(cat => cat.id !== 'other').map((category, index) => (
                  <tr
                    key={category.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 cursor-pointer transition-colors`}
                    onClick={() => setActiveType(category.id)}
                  >
                    <td className="p-4 border-b">
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className={`font-medium ${category.color}`}>{category.name}</span>
                      </div>
                    </td>
                    <td className="p-4 border-b text-gray-600">{category.onsetTime}</td>
                    <td className="p-4 border-b text-gray-600">{category.duration}</td>
                    <td className="p-4 border-b text-gray-600">{category.bioavailability}</td>
                    <td className="p-4 border-b">
                      <div className="flex flex-wrap gap-1">
                        {category.bestFor.slice(0, 2).map(use => (
                          <span key={use} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {use}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </HubSection>
      )}

      {/* Filter notice */}
      {activeType && (
        <div className={`${PRODUCT_CATEGORY_META[activeType].bgColor} border ${PRODUCT_CATEGORY_META[activeType].borderColor} rounded-xl p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{PRODUCT_CATEGORY_META[activeType].icon}</span>
            <div>
              <h3 className={`font-semibold ${PRODUCT_CATEGORY_META[activeType].color}`}>
                {PRODUCT_CATEGORY_META[activeType].name}
              </h3>
              <p className="text-sm text-gray-600">{PRODUCT_CATEGORY_META[activeType].description}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveType(null)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Show all products
          </button>
        </div>
      )}

      {/* Product Info Card when filtered */}
      {activeType && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Onset Time</h4>
            <p className="text-xl font-bold text-gray-900">{PRODUCT_CATEGORY_META[activeType].onsetTime}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Duration</h4>
            <p className="text-xl font-bold text-gray-900">{PRODUCT_CATEGORY_META[activeType].duration}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Bioavailability</h4>
            <p className="text-xl font-bold text-gray-900">{PRODUCT_CATEGORY_META[activeType].bioavailability}</p>
          </div>
        </div>
      )}

      {/* Articles Display */}
      {activeType ? (
        <HubSection
          title={`${PRODUCT_CATEGORY_META[activeType].name} Articles`}
          description={`${filteredArticles.length} guides about ${PRODUCT_CATEGORY_META[activeType].name.toLowerCase()}`}
        >
          {filteredArticles.length > 0 ? (
            <HubArticleGrid columns={3}>
              {filteredArticles.map(article => (
                <HubArticleCard
                  key={article.slug}
                  article={article}
                  borderColor={PRODUCT_CATEGORY_META[activeType].borderColor}
                  hoverBorderColor={`hover:${PRODUCT_CATEGORY_META[activeType].borderColor.replace('200', '400')}`}
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon={PRODUCT_CATEGORY_META[activeType].icon}
              title="Coming Soon"
              description={`We're working on comprehensive ${PRODUCT_CATEGORY_META[activeType].name.toLowerCase()} guides.`}
            />
          )}
        </HubSection>
      ) : (
        <>
          {/* Comparisons Section */}
          {categorized.comparisons.length > 0 && (
            <HubSection
              title="Product Comparisons"
              description="Side-by-side comparisons to help you choose"
              icon="⚖️"
            >
              <HubArticleGrid columns={2}>
                {categorized.comparisons.slice(0, 4).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    variant="featured"
                    badge="Comparison"
                    badgeColor="bg-amber-100 text-amber-700"
                    borderColor="border-amber-200"
                    hoverBorderColor="hover:border-amber-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Oils Section */}
          {categorized.byType.oils.length > 0 && (
            <HubSection
              title="CBD Oils & Tinctures"
              description="The most popular CBD delivery method"
              icon="🧴"
              headerRight={
                <button
                  onClick={() => setActiveType('oils')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View all {categorized.byType.oils.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byType.oils.slice(0, 6).map(article => (
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

          {/* Edibles Section */}
          {categorized.byType.edibles.length > 0 && (
            <HubSection
              title="Edibles & Gummies"
              description="Tasty CBD options for discreet use"
              icon="🍬"
              headerRight={
                <button
                  onClick={() => setActiveType('edibles')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  View all {categorized.byType.edibles.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byType.edibles.slice(0, 6).map(article => (
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

          {/* Topicals Section */}
          {categorized.byType.topicals.length > 0 && (
            <HubSection
              title="Topicals & Skincare"
              description="CBD for external application"
              icon="🧪"
              headerRight={
                <button
                  onClick={() => setActiveType('topicals')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all {categorized.byType.topicals.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byType.topicals.slice(0, 6).map(article => (
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

          {/* Vapes Section */}
          {categorized.byType.vapes.length > 0 && (
            <HubSection
              title="Vapes & Inhalables"
              description="Fast-acting CBD delivery"
              icon="💨"
              headerRight={
                <button
                  onClick={() => setActiveType('vapes')}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  View all {categorized.byType.vapes.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byType.vapes.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-sky-200"
                    hoverBorderColor="hover:border-sky-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}
        </>
      )}

      {/* CTA */}
      <HubCTA
        title="Need Help Choosing?"
        description="Check out our dosing guides or explore the research behind different CBD products."
        gradientFrom="from-emerald-600"
        gradientTo="to-teal-600"
        buttons={[
          { label: 'Dosing Guides', href: '/categories/guides' },
          { label: 'View Research', href: '/research', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
