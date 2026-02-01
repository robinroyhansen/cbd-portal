'use client';

import { useState } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';
import {
  PET_CATEGORIES,
  PET_CATEGORY_META,
  categorizePetArticles,
  getPetCategoryStats,
  PetType,
} from '@/lib/pets';
import {
  HubHero,
  HubQuickStats,
  HubSection,
  HubArticleCard,
  HubArticleGrid,
  HubFeatureCard,
  HubCategoryNav,
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

interface PetsHubProps {
  articles: Article[];
}

export function PetsHub({ articles }: PetsHubProps) {
  const [activeCategory, setActiveCategory] = useState<PetType | null>(null);

  const categorized = categorizePetArticles(articles);
  const stats = getPetCategoryStats(categorized);

  // Filter articles based on active category
  const displayedArticles = activeCategory
    ? categorized[activeCategory]
    : articles;

  // Category nav items
  const categoryNavItems = PET_CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    count: categorized[cat.id].length,
  }));

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="🐾"
        title="CBD for Pets"
        subtitle="Complete Guide to CBD for Dogs, Cats, Horses & More"
        description={`Explore ${stats.total} comprehensive guides on CBD for pets. Learn about safety, dosing, product selection, and condition-specific information for your animal companions.`}
        badgeText="Pet CBD Encyclopedia"
        badgeColor="bg-orange-100 text-orange-700"
        gradientFrom="from-orange-50"
        gradientTo="to-amber-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: stats.total, label: 'Pet Articles', color: 'text-orange-600' },
          { value: stats.dogs, label: 'Dog Guides', color: 'text-amber-600' },
          { value: stats.cats, label: 'Cat Guides', color: 'text-purple-600' },
          { value: stats.horses + stats.birds + stats.smallPets, label: 'Other Pets', color: 'text-emerald-600' },
        ]}
      />

      {/* Safety Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">Important Safety Notice</h3>
            <p className="text-amber-700 text-sm">
              Always consult with a veterinarian before giving CBD to any pet. Animal metabolism varies significantly between species.
              Never use human CBD products for pets without professional guidance. The information here is educational and not veterinary advice.
            </p>
          </div>
        </div>
      </div>

      {/* Pet Type Selector Cards */}
      <HubSection
        title="Choose Your Pet"
        description="Select your pet type to find relevant CBD information"
        icon="🎯"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PET_CATEGORIES.filter(cat => cat.id !== 'general').map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                activeCategory === category.id
                  ? `${category.bgColor} ${category.borderColor} ring-2 ring-offset-2 ring-${category.color.replace('text-', '')}`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className={`font-semibold ${activeCategory === category.id ? category.color : 'text-gray-900'}`}>
                    {category.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {categorized[category.id].length} articles
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{category.description}</p>
            </button>
          ))}
        </div>
      </HubSection>

      {/* Featured Articles by Pet Type */}
      {!activeCategory && (
        <>
          {/* Dogs Section */}
          {categorized.dogs.length > 0 && (
            <HubSection
              title="CBD for Dogs"
              description="Complete guides for canine CBD use"
              icon="🐕"
              headerRight={
                <button
                  onClick={() => setActiveCategory('dogs')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all {categorized.dogs.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.dogs.slice(0, 6).map(article => (
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

          {/* Cats Section */}
          {categorized.cats.length > 0 && (
            <HubSection
              title="CBD for Cats"
              description="Feline-specific CBD information and guides"
              icon="🐈"
              headerRight={
                <button
                  onClick={() => setActiveCategory('cats')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all {categorized.cats.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.cats.slice(0, 6).map(article => (
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

          {/* Horses Section */}
          {categorized.horses.length > 0 && (
            <HubSection
              title="CBD for Horses"
              description="Equine CBD guides and information"
              icon="🐴"
              headerRight={
                <button
                  onClick={() => setActiveCategory('horses')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View all {categorized.horses.length} →
                </button>
              }
            >
              <HubArticleGrid columns={3}>
                {categorized.horses.slice(0, 6).map(article => (
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

          {/* Birds & Small Pets Combined */}
          {(categorized.birds.length > 0 || categorized['small-pets'].length > 0) && (
            <HubSection
              title="Birds & Small Pets"
              description="CBD for parrots, rabbits, guinea pigs, and other small animals"
              icon="🐰"
            >
              <HubArticleGrid columns={3}>
                {[...categorized.birds, ...categorized['small-pets']].slice(0, 6).map(article => (
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

          {/* General Pet CBD */}
          {categorized.general.length > 0 && (
            <HubSection
              title="General Pet CBD Guides"
              description="Universal pet CBD information - safety, dosing, and product selection"
              icon="🐾"
            >
              <HubArticleGrid columns={3}>
                {categorized.general.slice(0, 6).map(article => (
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
        </>
      )}

      {/* Filtered View when category is selected */}
      {activeCategory && (
        <HubSection
          title={`${PET_CATEGORY_META[activeCategory].icon} ${PET_CATEGORY_META[activeCategory].name} Articles`}
          description={PET_CATEGORY_META[activeCategory].description}
          headerRight={
            <button
              onClick={() => setActiveCategory(null)}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Show all pets
            </button>
          }
        >
          {/* Safety note for selected category */}
          <div className={`${PET_CATEGORY_META[activeCategory].bgColor} border ${PET_CATEGORY_META[activeCategory].borderColor} rounded-lg p-4 mb-6`}>
            <p className={`text-sm ${PET_CATEGORY_META[activeCategory].color}`}>
              <strong>Note:</strong> {PET_CATEGORY_META[activeCategory].safetyNote}
            </p>
          </div>

          {displayedArticles.length > 0 ? (
            <HubArticleGrid columns={3}>
              {displayedArticles.map(article => (
                <HubArticleCard
                  key={article.slug}
                  article={article}
                  borderColor={PET_CATEGORY_META[activeCategory].borderColor}
                  hoverBorderColor={`hover:${PET_CATEGORY_META[activeCategory].borderColor.replace('border-', 'border-').replace('200', '400')}`}
                />
              ))}
            </HubArticleGrid>
          ) : (
            <HubEmptyState
              icon={PET_CATEGORY_META[activeCategory].icon}
              title="Coming Soon"
              description={`We're working on comprehensive ${PET_CATEGORY_META[activeCategory].name.toLowerCase()} CBD guides.`}
              actionLabel="View all pet articles"
              actionHref="/categories/pets"
            />
          )}
        </HubSection>
      )}

      {/* CTA */}
      <HubCTA
        title="Questions About Pet CBD?"
        description="Explore our glossary for definitions, or check our research database for the latest studies on cannabinoids and animal health."
        gradientFrom="from-orange-600"
        gradientTo="to-amber-600"
        buttons={[
          { label: 'Browse Glossary', href: '/glossary' },
          { label: 'View Research', href: '/research', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
