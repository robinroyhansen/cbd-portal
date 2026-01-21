'use client';

import { useState } from 'react';
import {
  AUDIENCE_CATEGORIES,
  AUDIENCE_CATEGORY_META,
  categorizeDemographicsArticles,
  getDemographicsStats,
  AudienceType,
} from '@/lib/demographics';
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

interface DemographicsHubProps {
  articles: Article[];
}

export function DemographicsHub({ articles }: DemographicsHubProps) {
  const [activeAudience, setActiveAudience] = useState<AudienceType | null>(null);

  const categorized = categorizeDemographicsArticles(articles);
  const stats = getDemographicsStats(categorized);

  const filteredArticles = activeAudience ? categorized.byAudience[activeAudience] : articles;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="👥"
        title="CBD for You"
        subtitle="Find CBD Information Tailored to Your Needs"
        description={`Explore ${stats.total} guides written for specific groups - seniors, athletes, professionals, and more. Find CBD information that speaks to your situation.`}
        badgeText="Personalized Guides"
        badgeColor="bg-teal-100 text-teal-700"
        gradientFrom="from-teal-50"
        gradientTo="to-cyan-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Total Guides', color: 'text-teal-600' },
          { value: stats.byAudience.seniors, label: 'For Seniors', color: 'text-blue-600' },
          { value: stats.byAudience.athletes, label: 'For Athletes', color: 'text-orange-600' },
          { value: stats.byAudience.professionals, label: 'For Professionals', color: 'text-slate-600' },
        ]}
      />

      {/* "I am a..." Selector */}
      <HubSection
        title="I am a..."
        description="Select your group to find relevant CBD information"
        icon="🎯"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AUDIENCE_CATEGORIES.filter(cat => cat.id !== 'other').map(category => (
            <button
              key={category.id}
              onClick={() => setActiveAudience(activeAudience === category.id ? null : category.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                activeAudience === category.id
                  ? `${category.bgColor} ${category.borderColor} ring-2 ring-offset-2`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className={`font-semibold ${activeAudience === category.id ? category.color : 'text-gray-900'}`}>
                    {category.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {categorized.byAudience[category.id].length} articles
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic mb-2">{category.tagline}</p>
              <div className="flex flex-wrap gap-1">
                {category.primaryConcerns.slice(0, 3).map(concern => (
                  <span key={concern} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {concern}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </HubSection>

      {/* Filter Notice */}
      {activeAudience && (
        <div className={`${AUDIENCE_CATEGORY_META[activeAudience].bgColor} border ${AUDIENCE_CATEGORY_META[activeAudience].borderColor} rounded-xl p-5`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{AUDIENCE_CATEGORY_META[activeAudience].icon}</span>
              <div>
                <h3 className={`text-xl font-semibold ${AUDIENCE_CATEGORY_META[activeAudience].color}`}>
                  CBD for {AUDIENCE_CATEGORY_META[activeAudience].name}
                </h3>
                <p className="text-gray-600">{AUDIENCE_CATEGORY_META[activeAudience].description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm text-gray-500">Key topics:</span>
                  {AUDIENCE_CATEGORY_META[activeAudience].primaryConcerns.map(concern => (
                    <span key={concern} className={`text-sm ${AUDIENCE_CATEGORY_META[activeAudience].color} font-medium`}>
                      {concern}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveAudience(null)}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium whitespace-nowrap"
            >
              ← Show all
            </button>
          </div>
        </div>
      )}

      {/* Articles Display */}
      {activeAudience ? (
        <HubSection title={`Articles for ${AUDIENCE_CATEGORY_META[activeAudience].name}`}>
          {filteredArticles.length > 0 ? (
            <HubArticleGrid columns={3}>
              {filteredArticles.map(article => (
                <HubArticleCard
                  key={article.slug}
                  article={article}
                  borderColor={AUDIENCE_CATEGORY_META[activeAudience].borderColor}
                  hoverBorderColor={`hover:${AUDIENCE_CATEGORY_META[activeAudience].borderColor.replace('200', '400')}`}
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon={AUDIENCE_CATEGORY_META[activeAudience].icon}
              title="Coming Soon"
              description={`We're developing content specifically for ${AUDIENCE_CATEGORY_META[activeAudience].name.toLowerCase()}.`}
            />
          )}
        </HubSection>
      ) : (
        <>
          {/* Seniors Section */}
          {categorized.byAudience.seniors.length > 0 && (
            <HubSection
              title="For Seniors"
              description="CBD guidance for adults over 50"
              icon="👴"
              headerRight={
                <button
                  onClick={() => setActiveAudience('seniors')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {categorized.byAudience.seniors.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byAudience.seniors.slice(0, 3).map(article => (
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

          {/* Athletes Section */}
          {categorized.byAudience.athletes.length > 0 && (
            <HubSection
              title="For Athletes & Fitness"
              description="Recovery, performance, and active lifestyles"
              icon="🏃"
              headerRight={
                <button
                  onClick={() => setActiveAudience('athletes')}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  View all {categorized.byAudience.athletes.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byAudience.athletes.slice(0, 3).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-orange-200"
                    hoverBorderColor="hover:border-orange-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Women Section */}
          {categorized.byAudience.women.length > 0 && (
            <HubSection
              title="For Women"
              description="Women's health and wellness"
              icon="👩"
              headerRight={
                <button
                  onClick={() => setActiveAudience('women')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  View all {categorized.byAudience.women.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byAudience.women.slice(0, 3).map(article => (
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

          {/* Professionals Section */}
          {categorized.byAudience.professionals.length > 0 && (
            <HubSection
              title="For Professionals"
              description="Managing work stress and maintaining performance"
              icon="💼"
              headerRight={
                <button
                  onClick={() => setActiveAudience('professionals')}
                  className="text-sm text-slate-600 hover:text-slate-700 font-medium"
                >
                  View all {categorized.byAudience.professionals.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byAudience.professionals.slice(0, 3).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-slate-200"
                    hoverBorderColor="hover:border-slate-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}

          {/* Beginners Section */}
          {categorized.byAudience.beginners.length > 0 && (
            <HubSection
              title="For First-Time Users"
              description="Essential guidance for CBD beginners"
              icon="🌱"
              headerRight={
                <button
                  onClick={() => setActiveAudience('beginners')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View all {categorized.byAudience.beginners.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.byAudience.beginners.slice(0, 3).map(article => (
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

          {/* Other Groups */}
          {categorized.byAudience.other.length > 0 && (
            <HubSection
              title="Other Groups"
              description="CBD for specific lifestyles and needs"
              icon="👥"
            >
              <HubArticleGrid columns={3}>
                {categorized.byAudience.other.slice(0, 6).map(article => (
                  <HubArticleCard
                    key={article.slug}
                    article={article}
                    borderColor="border-teal-200"
                    hoverBorderColor="hover:border-teal-400"
                  />
                ))}
              </HubArticleGrid>
            </HubSection>
          )}
        </>
      )}

      {/* CTA */}
      <HubCTA
        title="Ready to Get Started?"
        description="Check our beginner guides for step-by-step instructions, or explore safety information for important considerations."
        gradientFrom="from-teal-600"
        gradientTo="to-cyan-600"
        buttons={[
          { label: 'Getting Started', href: '/categories/guides' },
          { label: 'Safety Info', href: '/categories/safety-quality', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
