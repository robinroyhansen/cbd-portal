'use client';

import { useState } from 'react';
import {
  SAFETY_CATEGORIES,
  SAFETY_CATEGORY_META,
  IMPORTANCE_META,
  categorizeSafetyArticles,
  getSafetyStats,
  SafetyTopic,
} from '@/lib/safety';
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

interface SafetyHubProps {
  articles: Article[];
}

export function SafetyHub({ articles }: SafetyHubProps) {
  const [activeTopic, setActiveTopic] = useState<SafetyTopic | null>(null);

  const categorized = categorizeSafetyArticles(articles);
  const stats = getSafetyStats(categorized);

  const filteredArticles = activeTopic ? categorized.byTopic[activeTopic] : articles;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="🛡️"
        title="CBD Safety & Quality"
        subtitle="Everything You Need to Know to Use CBD Safely"
        description={`Access ${stats.total} comprehensive guides on side effects, drug interactions, quality indicators, and more. Your safety is our priority.`}
        badgeText="Safety Center"
        badgeColor="bg-red-100 text-red-700"
        gradientFrom="from-red-50"
        gradientTo="to-rose-50"
      />

      {/* Important Safety Notice */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-red-800 mb-2">Important Safety Information</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• Always consult a healthcare provider before starting CBD, especially if you take medications</li>
              <li>• CBD can interact with many common medications including blood thinners and antidepressants</li>
              <li>• Pregnant or breastfeeding individuals should avoid CBD</li>
              <li>• This information is educational only and not medical advice</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Safety Articles', color: 'text-red-600' },
          { value: stats.byTopic.interactions, label: 'Drug Interactions', color: 'text-amber-600' },
          { value: stats.byTopic.quality, label: 'Quality Guides', color: 'text-green-600' },
          { value: stats.byTopic.testing, label: 'Testing Guides', color: 'text-blue-600' },
        ]}
      />

      {/* Safety Topic Navigator */}
      <HubSection
        title="Safety Topics"
        description="Explore CBD safety information by category"
        icon="📑"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAFETY_CATEGORIES.map(category => {
            const importanceMeta = IMPORTANCE_META[category.importance];
            return (
              <button
                key={category.id}
                onClick={() => setActiveTopic(activeTopic === category.id ? null : category.id)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  activeTopic === category.id
                    ? `${category.bgColor} ${category.borderColor} ring-2 ring-offset-2`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className={`font-semibold ${activeTopic === category.id ? category.color : 'text-gray-900'}`}>
                      {category.name}
                    </h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${importanceMeta.bgColor} ${importanceMeta.color}`}>
                    {importanceMeta.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                <span className="text-xs text-gray-500">
                  {categorized.byTopic[category.id].length} articles
                </span>
              </button>
            );
          })}
        </div>
      </HubSection>

      {/* Filter Notice */}
      {activeTopic && (
        <div className={`${SAFETY_CATEGORY_META[activeTopic].bgColor} border ${SAFETY_CATEGORY_META[activeTopic].borderColor} rounded-xl p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{SAFETY_CATEGORY_META[activeTopic].icon}</span>
            <div>
              <h3 className={`font-semibold ${SAFETY_CATEGORY_META[activeTopic].color}`}>
                {SAFETY_CATEGORY_META[activeTopic].name}
              </h3>
              <p className="text-sm text-gray-600">{filteredArticles.length} articles available</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTopic(null)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Show all safety topics
          </button>
        </div>
      )}

      {/* Articles Display */}
      {activeTopic ? (
        <HubSection title="Articles">
          {filteredArticles.length > 0 ? (
            <HubArticleGrid columns={3}>
              {filteredArticles.map(article => (
                <HubArticleCard
                  key={article.slug}
                  article={article}
                  borderColor={SAFETY_CATEGORY_META[activeTopic].borderColor}
                  hoverBorderColor={`hover:${SAFETY_CATEGORY_META[activeTopic].borderColor.replace('200', '400')}`}
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon={SAFETY_CATEGORY_META[activeTopic].icon}
              title="Coming Soon"
              description={`We're developing ${SAFETY_CATEGORY_META[activeTopic].name.toLowerCase()} content.`}
            />
          )}
        </HubSection>
      ) : (
        <>
          {/* Critical Safety - Drug Interactions */}
          {categorized.byTopic.interactions.length > 0 && (
            <HubSection
              title="Drug Interactions"
              description="Critical information about CBD and medication interactions"
              icon="💊"
              headerRight={
                <button
                  onClick={() => setActiveTopic('interactions')}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  View all {categorized.byTopic.interactions.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byTopic.interactions.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    badge="Critical"
                    badgeColor="bg-red-100 text-red-700"
                    borderColor="border-red-200"
                    hoverBorderColor="hover:border-red-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Side Effects */}
          {categorized.byTopic['side-effects'].length > 0 && (
            <HubSection
              title="Side Effects"
              description="Understanding potential side effects and how to manage them"
              icon="⚠️"
              headerRight={
                <button
                  onClick={() => setActiveTopic('side-effects')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all {categorized.byTopic['side-effects'].length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byTopic['side-effects'].slice(0, 6).map(article => (
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

          {/* Contraindications */}
          {categorized.byTopic.contraindications.length > 0 && (
            <HubSection
              title="Who Should Avoid CBD"
              description="Important contraindications and precautions"
              icon="🚫"
              headerRight={
                <button
                  onClick={() => setActiveTopic('contraindications')}
                  className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                >
                  View all {categorized.byTopic.contraindications.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byTopic.contraindications.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    badge="Important"
                    badgeColor="bg-rose-100 text-rose-700"
                    borderColor="border-rose-200"
                    hoverBorderColor="hover:border-rose-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Quality & Purity */}
          {categorized.byTopic.quality.length > 0 && (
            <HubSection
              title="Quality & Purity"
              description="How to identify quality CBD and avoid contaminated products"
              icon="✅"
              headerRight={
                <button
                  onClick={() => setActiveTopic('quality')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View all {categorized.byTopic.quality.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byTopic.quality.slice(0, 6).map(article => (
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

          {/* Lab Testing */}
          {categorized.byTopic.testing.length > 0 && (
            <HubSection
              title="Lab Testing & COAs"
              description="Understanding third-party testing and certificates of analysis"
              icon="🔬"
              headerRight={
                <button
                  onClick={() => setActiveTopic('testing')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {categorized.byTopic.testing.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byTopic.testing.slice(0, 6).map(article => (
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
        title="Have Questions?"
        description="Consult with a healthcare provider for personalized advice. Our guides are educational resources, not medical recommendations."
        gradientFrom="from-red-600"
        gradientTo="to-rose-600"
        buttons={[
          { label: 'Browse Glossary', href: '/glossary' },
          { label: 'View Research', href: '/research', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
