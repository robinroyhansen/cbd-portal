'use client';

import Link from 'next/link';
import {
  CANNABINOIDS,
  getMajorCannabinoids,
  getCannabinoidsByType,
  Cannabinoid,
} from '@/lib/cannabinoids';
import { CannabinoidFeatureCard } from './CannabinoidFeatureCard';
import { CannabinoidCompactCard } from './CannabinoidCompactCard';
import { CannabinoidTable } from './CannabinoidTable';
import { FindYourCannabinoid } from './FindYourCannabinoid';
import { BiosynthesisDiagram } from './BiosynthesisDiagram';
import { SafetyTierLegend } from './SafetyTierBadge';
import { EffectComparisonMatrix } from './EffectComparisonMatrix';
import { CannabinoidStacks } from './CannabinoidStacks';
import { ResearchOverview } from './ResearchConfidence';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  reading_time?: number;
  updated_at: string;
}

interface CannabinoidHubProps {
  articles: Article[];
  studyCounts?: Record<string, number>;
  totalStudyCount?: number;
}

// Map article slugs to cannabinoids
function findArticleForCannabinoid(cannabinoid: Cannabinoid, articles: Article[]): string | undefined {
  // Check explicit article slugs first
  if (cannabinoid.articleSlugs) {
    for (const slug of cannabinoid.articleSlugs) {
      if (articles.some(a => a.slug === slug)) {
        return slug;
      }
    }
  }

  // Try to find an article by pattern matching
  const patterns = [
    `what-is-${cannabinoid.slug}`,
    `${cannabinoid.slug}-guide`,
    `${cannabinoid.slug}-explained`,
    cannabinoid.slug,
  ];

  for (const pattern of patterns) {
    const found = articles.find(a =>
      a.slug === pattern ||
      a.slug.includes(cannabinoid.slug) ||
      a.title.toLowerCase().includes(cannabinoid.abbreviation.toLowerCase())
    );
    if (found) return found.slug;
  }

  return undefined;
}

// Categorize articles
function categorizeArticles(articles: Article[]) {
  const comparisons: Article[] = [];
  const guides: Article[] = [];
  const other: Article[] = [];

  articles.forEach(article => {
    if (article.slug.includes('-vs-') || article.title.toLowerCase().includes(' vs ')) {
      comparisons.push(article);
    } else if (
      article.slug.includes('guide') ||
      article.slug.includes('what-is') ||
      article.title.toLowerCase().includes('what is')
    ) {
      guides.push(article);
    } else {
      other.push(article);
    }
  });

  return { comparisons, guides, other };
}

export function CannabinoidHub({ articles, studyCounts = {}, totalStudyCount = 0 }: CannabinoidHubProps) {
  // Get cannabinoid groupings
  const majorCannabinoids = getMajorCannabinoids();
  const acidicCannabinoids = getCannabinoidsByType('acidic');
  const syntheticCannabinoids = getCannabinoidsByType('synthetic');
  const minorCannabinoids = getCannabinoidsByType('minor').filter(
    c => !['cbn', 'cbc'].includes(c.slug) // These are shown in major
  );
  const rareCannabinoids = getCannabinoidsByType('rare');

  // Build article slug map
  const articleSlugs: Record<string, string> = {};
  CANNABINOIDS.forEach(c => {
    const slug = findArticleForCannabinoid(c, articles);
    if (slug) articleSlugs[c.slug] = slug;
  });

  // Categorize remaining articles
  const { comparisons, guides, other } = categorizeArticles(articles);

  // Count intoxicating vs non-intoxicating
  const intoxicatingCount = CANNABINOIDS.filter(c => c.intoxicating).length;
  const nonIntoxicatingCount = CANNABINOIDS.filter(c => !c.intoxicating).length;

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
          <span>🧬</span>
          Cannabinoid Encyclopedia
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Understanding Cannabinoids
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Cannabinoids are the active compounds found in cannabis and hemp plants.
          Explore {CANNABINOIDS.length} cannabinoids with detailed profiles, effects comparison,
          and evidence-based research.
        </p>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{CANNABINOIDS.length}</p>
          <p className="text-sm text-gray-600">Cannabinoids Covered</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{nonIntoxicatingCount}</p>
          <p className="text-sm text-gray-600">Non-Intoxicating</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{intoxicatingCount}</p>
          <p className="text-sm text-gray-600">Intoxicating</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">
            {totalStudyCount > 0 ? `${totalStudyCount}+` : '700+'}
          </p>
          <p className="text-sm text-gray-600">Research Studies</p>
        </div>
      </section>

      {/* Find Your Cannabinoid - Interactive */}
      <section>
        <FindYourCannabinoid cannabinoids={CANNABINOIDS} />
      </section>

      {/* Major Cannabinoids - Prominent Display */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 -mx-4 px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">The Big 6 Cannabinoids</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The most researched and widely used cannabinoids that form the foundation of cannabis science
          </p>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {majorCannabinoids.slice(0, 6).map(cannabinoid => (
            <CannabinoidFeatureCard
              key={cannabinoid.slug}
              cannabinoid={cannabinoid}
              articleSlug={articleSlugs[cannabinoid.slug]}
              studyCount={studyCounts[cannabinoid.slug]}
            />
          ))}
        </div>
      </section>

      {/* Biosynthesis Diagram */}
      <section>
        <BiosynthesisDiagram articleSlugs={articleSlugs} />
      </section>

      {/* Cannabinoid Stacks - Build Your Stack */}
      <section>
        <CannabinoidStacks articleSlugs={articleSlugs} />
      </section>

      {/* Effect Comparison Matrix */}
      <section>
        <EffectComparisonMatrix articleSlugs={articleSlugs} />
      </section>

      {/* Acidic Cannabinoids */}
      {acidicCannabinoids.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Acidic Cannabinoids</h2>
            <p className="text-gray-600">
              Raw, unheated forms found in fresh cannabis. They convert to their neutral (active)
              forms when heated through decarboxylation.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {acidicCannabinoids.map(cannabinoid => (
              <CannabinoidCompactCard
                key={cannabinoid.slug}
                cannabinoid={cannabinoid}
                articleSlug={articleSlugs[cannabinoid.slug]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Minor Cannabinoids */}
      {minorCannabinoids.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Minor Cannabinoids</h2>
            <p className="text-gray-600">
              Lesser-known cannabinoids found in smaller quantities but with unique properties
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {minorCannabinoids.map(cannabinoid => (
              <CannabinoidCompactCard
                key={cannabinoid.slug}
                cannabinoid={cannabinoid}
                articleSlug={articleSlugs[cannabinoid.slug]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Synthetic/Novel */}
      {syntheticCannabinoids.length > 0 && (
        <section>
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Synthetic & Novel Cannabinoids</h2>
                <p className="text-gray-600">
                  Lab-derived or converted cannabinoids with limited research. Check local laws before use.
                </p>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {syntheticCannabinoids.map(cannabinoid => (
              <CannabinoidCompactCard
                key={cannabinoid.slug}
                cannabinoid={cannabinoid}
                articleSlug={articleSlugs[cannabinoid.slug]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Rare Cannabinoids */}
      {rareCannabinoids.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Rare & Research Cannabinoids</h2>
            <p className="text-gray-600">
              Obscure cannabinoids with minimal research. Included for completeness.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rareCannabinoids.map(cannabinoid => (
              <CannabinoidCompactCard
                key={cannabinoid.slug}
                cannabinoid={cannabinoid}
                articleSlug={articleSlugs[cannabinoid.slug]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Safety Tier Legend */}
      <section>
        <SafetyTierLegend />
      </section>

      {/* Research Overview */}
      <section>
        <ResearchOverview />
      </section>

      {/* Quick Reference Table */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Reference Table</h2>
          <p className="text-gray-600">
            Compare all {CANNABINOIDS.length} cannabinoids at a glance - click column headers to sort
          </p>
        </div>
        <CannabinoidTable cannabinoids={CANNABINOIDS} articleSlugs={articleSlugs} />
      </section>

      {/* Comparison Articles */}
      {comparisons.length > 0 && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cannabinoid Comparisons</h2>
            <p className="text-gray-600">
              Side-by-side comparisons to help you understand the differences
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {comparisons.map(article => (
              <ArticleCard key={article.slug} article={article} variant="comparison" />
            ))}
          </div>
        </section>
      )}

      {/* Deep Dive Articles */}
      {(guides.length > 0 || other.length > 0) && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Deep Dive Articles</h2>
            <p className="text-gray-600">
              Comprehensive guides and detailed explorations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...guides, ...other].map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to Learn More?</h2>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
          Explore our glossary for detailed definitions, or dive into our research database
          with {totalStudyCount > 0 ? `${totalStudyCount}+` : '700+'} peer-reviewed studies.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/glossary/category/cannabinoids"
            className="px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
          >
            Browse Glossary
          </Link>
          <Link
            href="/research"
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
          >
            View Research
          </Link>
        </div>
      </section>
    </div>
  );
}

// Article card component
function ArticleCard({ article, variant }: { article: Article; variant?: 'comparison' }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-lg transition-all group"
    >
      {variant === 'comparison' && (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded mb-3">
          ⚖️ Comparison
        </span>
      )}
      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        {article.reading_time && <span>{article.reading_time} min read</span>}
        <span>•</span>
        <span>{new Date(article.updated_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
      </div>
    </Link>
  );
}
