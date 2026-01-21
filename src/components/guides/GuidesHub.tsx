'use client';

import { useState } from 'react';
import {
  GUIDE_TOPICS,
  GUIDE_TOPIC_META,
  categorizeGuideArticles,
  getGuideStats,
  GuideCategory,
} from '@/lib/guides';
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

interface GuidesHubProps {
  articles: Article[];
}

export function GuidesHub({ articles }: GuidesHubProps) {
  const [activeTopic, setActiveTopic] = useState<GuideCategory | null>(null);

  const categorized = categorizeGuideArticles(articles);
  const stats = getGuideStats(categorized);

  const filteredArticles = activeTopic ? categorized.byTopic[activeTopic] : articles;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="📖"
        title="CBD Guides & How-To"
        subtitle="Practical Guides for Every Step of Your CBD Journey"
        description={`Access ${stats.total} step-by-step guides covering dosing, usage methods, buying tips, and more. From quick reads to comprehensive deep dives.`}
        badgeText="How-To Library"
        badgeColor="bg-orange-100 text-orange-700"
        gradientFrom="from-orange-50"
        gradientTo="to-amber-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Total Guides', color: 'text-orange-600' },
          { value: stats.byTopic.dosing, label: 'Dosing Guides', color: 'text-blue-600' },
          { value: stats.byTopic.usage, label: 'Usage Guides', color: 'text-purple-600' },
          { value: stats.quickReads, label: 'Quick Reads', color: 'text-green-600' },
        ]}
      />

      {/* Topic Navigator */}
      <HubSection
        title="Browse by Topic"
        description="Find guides organized by what you need to learn"
        icon="🎯"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDE_TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                activeTopic === topic.id
                  ? `${topic.bgColor} ${topic.borderColor} ring-2 ring-offset-2`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{topic.icon}</span>
                <div>
                  <h3 className={`font-semibold ${activeTopic === topic.id ? topic.color : 'text-gray-900'}`}>
                    {topic.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {categorized.byTopic[topic.id].length} guides
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{topic.description}</p>
            </button>
          ))}
        </div>
      </HubSection>

      {/* Filter Notice */}
      {activeTopic && (
        <div className={`${GUIDE_TOPIC_META[activeTopic].bgColor} border ${GUIDE_TOPIC_META[activeTopic].borderColor} rounded-xl p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{GUIDE_TOPIC_META[activeTopic].icon}</span>
            <div>
              <h3 className={`font-semibold ${GUIDE_TOPIC_META[activeTopic].color}`}>
                {GUIDE_TOPIC_META[activeTopic].name}
              </h3>
              <p className="text-sm text-gray-600">{filteredArticles.length} guides available</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTopic(null)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Show all guides
          </button>
        </div>
      )}

      {/* Articles Display */}
      {activeTopic ? (
        <HubSection title="Guides">
          {filteredArticles.length > 0 ? (
            <HubArticleGrid columns={3}>
              {filteredArticles.map(article => (
                <HubArticleCard
                  key={article.slug}
                  article={article}
                  borderColor={GUIDE_TOPIC_META[activeTopic].borderColor}
                  hoverBorderColor={`hover:${GUIDE_TOPIC_META[activeTopic].borderColor.replace('200', '400')}`}
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon={GUIDE_TOPIC_META[activeTopic].icon}
              title="Coming Soon"
              description={`We're working on ${GUIDE_TOPIC_META[activeTopic].name.toLowerCase()} guides.`}
            />
          )}
        </HubSection>
      ) : (
        <>
          {/* Getting Started */}
          {categorized.byTopic['getting-started'].length > 0 && (
            <HubSection
              title="Getting Started"
              description="New to CBD? Start here"
              icon="🚀"
              headerRight={
                <button
                  onClick={() => setActiveTopic('getting-started')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View all {categorized.byTopic['getting-started'].length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byTopic['getting-started'].slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    badge="Start Here"
                    badgeColor="bg-green-100 text-green-700"
                    borderColor="border-green-200"
                    hoverBorderColor="hover:border-green-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Dosing Guides */}
          {categorized.byTopic.dosing.length > 0 && (
            <HubSection
              title="Dosing Guides"
              description="Find your optimal CBD dose"
              icon="💊"
              headerRight={
                <button
                  onClick={() => setActiveTopic('dosing')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {categorized.byTopic.dosing.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byTopic.dosing.slice(0, 6).map(article => (
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

          {/* Usage Methods */}
          {categorized.byTopic.usage.length > 0 && (
            <HubSection
              title="Usage Methods"
              description="How to take CBD effectively"
              icon="📋"
              headerRight={
                <button
                  onClick={() => setActiveTopic('usage')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all {categorized.byTopic.usage.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byTopic.usage.slice(0, 6).map(article => (
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

          {/* Buying Guides */}
          {categorized.byTopic.buying.length > 0 && (
            <HubSection
              title="Buying Guides"
              description="Shop for CBD safely and wisely"
              icon="🛒"
              headerRight={
                <button
                  onClick={() => setActiveTopic('buying')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all {categorized.byTopic.buying.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byTopic.buying.slice(0, 6).map(article => (
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

          {/* Quality & Labels */}
          {categorized.byTopic.quality.length > 0 && (
            <HubSection
              title="Quality & Labels"
              description="Understanding CBD quality indicators"
              icon="🔍"
              headerRight={
                <button
                  onClick={() => setActiveTopic('quality')}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
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
                    borderColor="border-cyan-200"
                    hoverBorderColor="hover:border-cyan-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}
        </>
      )}

      {/* CTA */}
      <HubCTA
        title="Have More Questions?"
        description="Check our CBD basics section for foundational knowledge, or explore safety information for important considerations."
        gradientFrom="from-orange-600"
        gradientTo="to-amber-600"
        buttons={[
          { label: 'CBD Basics', href: '/categories/cbd-basics' },
          { label: 'Safety Info', href: '/categories/safety-quality', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
