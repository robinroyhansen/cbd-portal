'use client';

import {
  LEGAL_CATEGORIES,
  categorizeLegalArticles,
  getLegalStats,
} from '@/lib/legal';
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

interface LegalHubProps {
  articles: Article[];
}

export function LegalHub({ articles }: LegalHubProps) {
  const categorized = categorizeLegalArticles(articles);
  const stats = getLegalStats(categorized);

  // Get all articles that have been categorized
  const allCategorizedArticles = Object.values(categorized.byCategory).flat();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="⚖️"
        title="Legal & Regulations"
        subtitle="Understanding CBD Laws and Compliance"
        description={`Navigate the legal landscape of CBD with ${stats.total} comprehensive guides on regulations, compliance, and legal considerations.`}
        badgeText="Legal Guide"
        badgeColor="bg-slate-100 text-slate-700"
        gradientFrom="from-slate-50"
        gradientTo="to-gray-50"
      />

      {/* Legal Disclaimer Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Legal Disclaimer</h3>
            <p className="text-amber-700 text-sm">
              This information is for educational purposes only and does not constitute legal advice.
              CBD laws vary by jurisdiction and change frequently. Always consult with a qualified
              legal professional for advice specific to your situation.
            </p>
          </div>
        </div>
      </div>

      {/* Topic Categories */}
      <HubSection
        title="Legal Topics"
        description="Explore different aspects of CBD legality"
        icon="📑"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEGAL_CATEGORIES.map(category => {
            const count = categorized.byCategory[category.id].length;
            return (
              <div
                key={category.id}
                className={`p-5 rounded-xl border-2 ${category.bgColor} ${category.borderColor}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className={`font-semibold ${category.color}`}>
                    {category.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                <span className="text-xs text-gray-500">
                  {count > 0 ? `${count} articles` : 'Coming soon'}
                </span>
              </div>
            );
          })}
        </div>
      </HubSection>

      {/* All Articles */}
      <HubSection
        title="All Legal Guides"
        description="Browse all available legal and regulatory content"
        icon="📚"
      >
        {allCategorizedArticles.length > 0 ? (
          <HubArticleGrid columns={2}>
            {allCategorizedArticles.map(article => (
              <HubArticleCard
                key={article.slug}
                article={article}
                variant="featured"
                borderColor="border-slate-200"
                hoverBorderColor="hover:border-slate-400"
              />
            ))}
          </HubArticleGrid>
        ) : (
          <HubEmptyState
            icon="⚖️"
            title="Content Coming Soon"
            description="We're developing comprehensive legal guides for CBD. Check back soon."
          />
        )}
      </HubSection>

      {/* CTA */}
      <HubCTA
        title="Have Safety Questions?"
        description="Our safety and quality section covers drug interactions, side effects, and quality verification."
        gradientFrom="from-slate-600"
        gradientTo="to-gray-600"
        buttons={[
          { label: 'Safety & Quality', href: '/categories/safety-quality' },
          { label: 'Browse All Topics', href: '/categories', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
