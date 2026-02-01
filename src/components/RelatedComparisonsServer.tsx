import { createClient } from '@/lib/supabase/server';
import { getRelatedComparisons, getRelatedConditionsForComparison, isComparisonArticle } from '@/lib/related-topics';
import { RelatedComparisons } from './RelatedComparisons';
import { LocaleLink as Link } from '@/components/LocaleLink';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
}

export async function RelatedComparisonsServer({ currentSlug }: { currentSlug: string }) {
  // Check if this is a comparison article
  if (!isComparisonArticle(currentSlug)) {
    return null;
  }

  const supabase = await createClient();

  // Get related comparison slugs
  const relatedSlugs = getRelatedComparisons(currentSlug);

  if (relatedSlugs.length === 0) return null;

  // Fetch the related comparison articles
  const { data: comparisons } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt')
    .in('slug', relatedSlugs)
    .eq('status', 'published')
    .limit(3);

  if (!comparisons || comparisons.length === 0) return null;

  return (
    <RelatedComparisons
      comparisons={comparisons as Article[]}
      title="More Comparisons"
    />
  );
}

// Show related condition articles for comparison pages
export async function RelatedConditionsForComparison({ currentSlug }: { currentSlug: string }) {
  if (!isComparisonArticle(currentSlug)) {
    return null;
  }

  const supabase = await createClient();

  // Get related condition slugs
  const conditionSlugs = getRelatedConditionsForComparison(currentSlug);

  if (conditionSlugs.length === 0) return null;

  // Fetch the related condition articles
  const { data: conditions } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt')
    .in('slug', conditionSlugs)
    .eq('status', 'published')
    .limit(3);

  if (!conditions || conditions.length === 0) return null;

  return (
    <section className="mt-8 p-6 bg-blue-50 rounded-xl">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Related Condition Guides
      </h3>
      <ul className="space-y-3">
        {conditions.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-700">{article.title}</p>
                <p className="text-sm text-gray-600 line-clamp-1">{article.excerpt}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// All comparisons widget for sidebars or condition pages
export async function AllComparisonsWidget() {
  const supabase = await createClient();

  const { data: comparisons } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt')
    .eq('article_type', 'comparison')
    .eq('status', 'published')
    .order('title')
    .limit(10);

  if (!comparisons || comparisons.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
      <h3 className="text-lg font-bold text-gray-900 mb-1">CBD Comparisons</h3>
      <p className="text-sm text-gray-600 mb-4">Find out which option is right for you</p>
      <ul className="space-y-2">
        {comparisons.map((article) => {
          // Parse comparison items from title
          const match = article.title.match(/^(.+?)\s+vs\.?\s+(.+?)(?:\s*[:|-]|$)/i);
          const itemA = match ? match[1].trim() : '';
          const itemB = match ? match[2].split(':')[0].trim() : '';

          return (
            <li key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors group"
              >
                <span className="w-6 h-6 bg-green-600 rounded text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  VS
                </span>
                <span className="text-sm text-gray-700 group-hover:text-green-700 font-medium">
                  {itemA} vs {itemB}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href="/categories/comparisons"
        className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 mt-4"
      >
        View all comparisons
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
