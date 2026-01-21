'use client';

import { useState } from 'react';
import {
  SCIENCE_CATEGORIES,
  SCIENCE_CATEGORY_META,
  categorizeScienceArticles,
  getScienceStats,
  ScienceCategory,
} from '@/lib/cbd-science';
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

interface ScienceHubProps {
  articles: Article[];
}

export function ScienceHub({ articles }: ScienceHubProps) {
  const [activeCategory, setActiveCategory] = useState<ScienceCategory | null>(null);

  const categorized = categorizeScienceArticles(articles);
  const stats = getScienceStats(categorized);

  const filteredArticles = activeCategory ? categorized.byCategory[activeCategory] : articles;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="🔬"
        title="CBD Science"
        subtitle="Understanding the Science Behind Cannabidiol"
        description={`Explore ${stats.total} in-depth articles on CBD research, the endocannabinoid system, pharmacology, and clinical applications.`}
        badgeText="Science Library"
        badgeColor="bg-purple-100 text-purple-700"
        gradientFrom="from-purple-50"
        gradientTo="to-indigo-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Science Articles', color: 'text-purple-600' },
          { value: stats.endocannabinoid, label: 'ECS Guides', color: 'text-blue-600' },
          { value: stats.research, label: 'Research', color: 'text-emerald-600' },
          { value: stats.mechanisms, label: 'Mechanisms', color: 'text-amber-600' },
        ]}
      />

      {/* Science Note */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🧬</span>
          <div>
            <h3 className="font-semibold text-purple-800 mb-2">Evidence-Based Information</h3>
            <p className="text-purple-700 text-sm">
              Our science articles are based on peer-reviewed research and clinical studies.
              We cite sources and distinguish between established findings and emerging research.
            </p>
          </div>
        </div>
      </div>

      {/* Category Navigator */}
      <HubSection
        title="Browse by Topic"
        description="Explore CBD science by research area"
        icon="📑"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCIENCE_CATEGORIES.map(category => (
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
        <div className={`${SCIENCE_CATEGORY_META[activeCategory].bgColor} border ${SCIENCE_CATEGORY_META[activeCategory].borderColor} rounded-xl p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{SCIENCE_CATEGORY_META[activeCategory].icon}</span>
            <div>
              <h3 className={`font-semibold ${SCIENCE_CATEGORY_META[activeCategory].color}`}>
                {SCIENCE_CATEGORY_META[activeCategory].name}
              </h3>
              <p className="text-sm text-gray-600">{filteredArticles.length} articles available</p>
            </div>
          </div>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Show all science topics
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
                  borderColor={SCIENCE_CATEGORY_META[activeCategory].borderColor}
                  hoverBorderColor={`hover:${SCIENCE_CATEGORY_META[activeCategory].borderColor.replace('200', '400')}`}
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon={SCIENCE_CATEGORY_META[activeCategory].icon}
              title="Coming Soon"
              description={`We're developing ${SCIENCE_CATEGORY_META[activeCategory].name.toLowerCase()} content.`}
            />
          )}
        </HubSection>
      ) : (
        <>
          {/* Endocannabinoid System */}
          {categorized.byCategory.endocannabinoid.length > 0 && (
            <HubSection
              title="Endocannabinoid System"
              description="The biological system that CBD interacts with"
              icon="🧠"
              headerRight={
                <button
                  onClick={() => setActiveCategory('endocannabinoid')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all {categorized.byCategory.endocannabinoid.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.endocannabinoid.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    badge="Foundation"
                    badgeColor="bg-purple-100 text-purple-700"
                    borderColor="border-purple-200"
                    hoverBorderColor="hover:border-purple-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* How CBD Works */}
          {categorized.byCategory.mechanisms.length > 0 && (
            <HubSection
              title="How CBD Works"
              description="Mechanisms of action and biological pathways"
              icon="⚙️"
              headerRight={
                <button
                  onClick={() => setActiveCategory('mechanisms')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {categorized.byCategory.mechanisms.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.mechanisms.slice(0, 6).map(article => (
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

          {/* Research */}
          {categorized.byCategory.research.length > 0 && (
            <HubSection
              title="Research & Studies"
              description="Scientific findings and clinical trial results"
              icon="📊"
              headerRight={
                <button
                  onClick={() => setActiveCategory('research')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View all {categorized.byCategory.research.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.research.slice(0, 6).map(article => (
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

          {/* Pharmacology */}
          {categorized.byCategory.pharmacology.length > 0 && (
            <HubSection
              title="Pharmacology"
              description="Drug interactions and metabolism"
              icon="💊"
              headerRight={
                <button
                  onClick={() => setActiveCategory('pharmacology')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all {categorized.byCategory.pharmacology.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byCategory.pharmacology.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    badge="Advanced"
                    badgeColor="bg-amber-100 text-amber-700"
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
        title="Explore Our Research Database"
        description="Access 771+ peer-reviewed studies on CBD and cannabinoids from our comprehensive research library."
        gradientFrom="from-purple-600"
        gradientTo="to-indigo-600"
        buttons={[
          { label: 'Browse Research', href: '/research' },
          { label: 'View Glossary', href: '/glossary', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
