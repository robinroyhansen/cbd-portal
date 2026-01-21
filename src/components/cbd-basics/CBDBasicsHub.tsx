'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CBD_BASICS_TOPICS,
  CBD_BASICS_TOPIC_META,
  DIFFICULTY_META,
  categorizeCBDBasicsArticles,
  getCBDBasicsStats,
  TopicArea,
  DifficultyLevel,
} from '@/lib/cbd-basics';
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

interface CBDBasicsHubProps {
  articles: Article[];
}

export function CBDBasicsHub({ articles }: CBDBasicsHubProps) {
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicArea | null>(null);

  const categorized = categorizeCBDBasicsArticles(articles);
  const stats = getCBDBasicsStats(categorized);

  // Get filtered articles
  const getFilteredArticles = () => {
    if (activeDifficulty && activeTopic) {
      return categorized.byDifficulty[activeDifficulty].filter(a =>
        categorized.byTopic[activeTopic].some(t => t.slug === a.slug)
      );
    }
    if (activeDifficulty) {
      return categorized.byDifficulty[activeDifficulty];
    }
    if (activeTopic) {
      return categorized.byTopic[activeTopic];
    }
    return articles;
  };

  const filteredArticles = getFilteredArticles();
  const hasFilter = activeDifficulty || activeTopic;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="📚"
        title="CBD Basics"
        subtitle="Everything You Need to Know About Cannabidiol"
        description={`Master the fundamentals of CBD with ${stats.total} comprehensive guides. From complete beginners to those seeking deeper scientific understanding, find your learning path here.`}
        badgeText="CBD Learning Center"
        badgeColor="bg-blue-100 text-blue-700"
        gradientFrom="from-blue-50"
        gradientTo="to-indigo-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Total Guides', color: 'text-blue-600' },
          { value: stats.beginner, label: 'Beginner Guides', color: 'text-green-600' },
          { value: stats.intermediate, label: 'Intermediate', color: 'text-amber-600' },
          { value: stats.advanced, label: 'Advanced', color: 'text-purple-600' },
        ]}
      />

      {/* Start Here - Featured Content */}
      {categorized.startHere.length > 0 && !hasFilter && (
        <HubSection
          title="Start Here"
          description="New to CBD? These essential guides will get you up to speed"
          icon="🚀"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {categorized.startHere.slice(0, 4).map(article => (
              <HubArticleCard
                key={article.slug}
                article={article}
                variant="featured"
                badge="Essential Reading"
                badgeColor="bg-green-100 text-green-700"
                borderColor="border-green-200"
                hoverBorderColor="hover:border-green-400"
              />
            ))}
          </div>
        </HubSection>
      )}

      {/* Learning Path Selector */}
      <HubSection
        title="Choose Your Learning Path"
        description="Select your experience level to find the right content for you"
        icon="🎯"
      >
        <div className="grid sm:grid-cols-3 gap-4">
          {(Object.entries(DIFFICULTY_META) as [DifficultyLevel, typeof DIFFICULTY_META.beginner][]).map(([level, meta]) => (
            <button
              key={level}
              onClick={() => setActiveDifficulty(activeDifficulty === level ? null : level)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                activeDifficulty === level
                  ? `${meta.bgColor} border-current ring-2 ring-offset-2`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{meta.icon}</span>
                <div>
                  <h3 className={`font-semibold ${activeDifficulty === level ? meta.color : 'text-gray-900'}`}>
                    {meta.label}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {categorized.byDifficulty[level].length} articles
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{meta.description}</p>
            </button>
          ))}
        </div>
      </HubSection>

      {/* Topic Areas */}
      <HubSection
        title="Browse by Topic"
        description="Explore specific areas of CBD knowledge"
        icon="📑"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CBD_BASICS_TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                activeTopic === topic.id
                  ? `${topic.bgColor} ${topic.borderColor} ring-2 ring-offset-2`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{topic.icon}</span>
                <h3 className={`font-semibold ${activeTopic === topic.id ? topic.color : 'text-gray-900'}`}>
                  {topic.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                {categorized.byTopic[topic.id].length} articles
              </p>
            </button>
          ))}
        </div>
      </HubSection>

      {/* Active Filter Notice & Clear */}
      {hasFilter && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">Filtering:</span>
            {activeDifficulty && (
              <span className={`px-2 py-1 rounded text-sm ${DIFFICULTY_META[activeDifficulty].bgColor} ${DIFFICULTY_META[activeDifficulty].color}`}>
                {DIFFICULTY_META[activeDifficulty].label}
              </span>
            )}
            {activeTopic && (
              <span className={`px-2 py-1 rounded text-sm ${CBD_BASICS_TOPIC_META[activeTopic].bgColor} ${CBD_BASICS_TOPIC_META[activeTopic].color}`}>
                {CBD_BASICS_TOPIC_META[activeTopic].name}
              </span>
            )}
            <span className="text-gray-500">({filteredArticles.length} articles)</span>
          </div>
          <button
            onClick={() => {
              setActiveDifficulty(null);
              setActiveTopic(null);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters ×
          </button>
        </div>
      )}

      {/* Articles Display */}
      {hasFilter ? (
        <HubSection
          title="Filtered Results"
          description={`Showing ${filteredArticles.length} articles matching your criteria`}
        >
          {filteredArticles.length > 0 ? (
            <HubArticleGrid columns={3}>
              {filteredArticles.map(article => (
                <HubArticleCard
                  key={article.slug}
                  article={article}
                  borderColor="border-blue-200"
                  hoverBorderColor="hover:border-blue-400"
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon="🔍"
              title="No articles found"
              description="Try adjusting your filters to find more content"
            />
          )}
        </HubSection>
      ) : (
        <>
          {/* Beginner Section */}
          {categorized.byDifficulty.beginner.length > 0 && (
            <HubSection
              title="Beginner Guides"
              description="Perfect starting points for CBD newcomers"
              icon="🌱"
              headerRight={
                <button
                  onClick={() => setActiveDifficulty('beginner')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View all {categorized.byDifficulty.beginner.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byDifficulty.beginner.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    badge="Beginner"
                    badgeColor="bg-green-100 text-green-700"
                    borderColor="border-green-200"
                    hoverBorderColor="hover:border-green-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Intermediate Section */}
          {categorized.byDifficulty.intermediate.length > 0 && (
            <HubSection
              title="Intermediate Content"
              description="Build on your CBD knowledge with these guides"
              icon="📚"
              headerRight={
                <button
                  onClick={() => setActiveDifficulty('intermediate')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all {categorized.byDifficulty.intermediate.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byDifficulty.intermediate.slice(0, 6).map(article => (
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

          {/* Advanced Section */}
          {categorized.byDifficulty.advanced.length > 0 && (
            <HubSection
              title="Advanced Topics"
              description="Deep dives into CBD science and research"
              icon="🎓"
              headerRight={
                <button
                  onClick={() => setActiveDifficulty('advanced')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all {categorized.byDifficulty.advanced.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byDifficulty.advanced.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    badge="Advanced"
                    badgeColor="bg-purple-100 text-purple-700"
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
        title="Ready to Go Deeper?"
        description="Explore our complete glossary for detailed definitions, or dive into our research database with peer-reviewed studies."
        gradientFrom="from-blue-600"
        gradientTo="to-indigo-600"
        buttons={[
          { label: 'Browse Glossary', href: '/glossary' },
          { label: 'View Research', href: '/research', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
