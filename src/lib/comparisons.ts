export type ComparisonCategory = 'cbd-vs-thc' | 'cannabinoid-comparisons' | 'product-comparisons' | 'brand-comparisons' | 'method-comparisons';

export interface ComparisonTopic {
  id: ComparisonCategory;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const COMPARISON_CATEGORIES: ComparisonTopic[] = [
  {
    id: 'cbd-vs-thc',
    name: 'CBD vs THC',
    icon: '⚖️',
    description: 'Understanding the differences between CBD and THC',
    keywords: ['cbd vs thc', 'thc vs cbd', 'difference between', 'cbd and thc'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'cannabinoid-comparisons',
    name: 'Cannabinoid Comparisons',
    icon: '🧬',
    description: 'Comparing CBD with other cannabinoids like CBG, CBN, CBC, and more',
    keywords: ['cbg', 'cbn', 'cbc', 'cbda', 'delta-8', 'delta 8', 'cannabinoid'],
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'product-comparisons',
    name: 'Product Comparisons',
    icon: '🧴',
    description: 'Comparing different CBD product types and formats',
    keywords: ['oil vs', 'gummies vs', 'capsules vs', 'tincture vs', 'topical vs', 'edibles vs', 'isolate vs', 'full spectrum vs', 'broad spectrum vs'],
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'brand-comparisons',
    name: 'Brand Comparisons',
    icon: '🏷️',
    description: 'Comparing CBD brands, quality, and value',
    keywords: ['brand', 'best', 'top', 'review', 'compare brands'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'method-comparisons',
    name: 'Method Comparisons',
    icon: '📊',
    description: 'Comparing consumption methods and delivery systems',
    keywords: ['sublingual vs', 'oral vs', 'inhale vs', 'vape vs', 'smoke vs', 'method', 'delivery', 'absorption'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

export const COMPARISON_CATEGORY_META: Record<ComparisonCategory, ComparisonTopic> = Object.fromEntries(
  COMPARISON_CATEGORIES.map(cat => [cat.id, cat])
) as Record<ComparisonCategory, ComparisonTopic>;

// Popular comparison topics
export const POPULAR_COMPARISONS = [
  { title: 'CBD vs THC', description: 'The most common comparison - understand the key differences' },
  { title: 'Full Spectrum vs Isolate', description: 'Which CBD type is right for you?' },
  { title: 'Oil vs Gummies', description: 'Compare the two most popular product formats' },
  { title: 'CBD vs CBG', description: 'Emerging cannabinoid comparison' },
];

export interface CategorizedComparisonArticles {
  byCategory: Record<ComparisonCategory, any[]>;
  featured: any[];
}

export function categorizeComparisonArticles(articles: any[]): CategorizedComparisonArticles {
  const byCategory: Record<ComparisonCategory, any[]> = {
    'cbd-vs-thc': [],
    'cannabinoid-comparisons': [],
    'product-comparisons': [],
    'brand-comparisons': [],
    'method-comparisons': [],
  };

  const featured: any[] = [];

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    let assigned = false;
    for (const category of COMPARISON_CATEGORIES) {
      for (const keyword of category.keywords) {
        if (searchText.includes(keyword)) {
          byCategory[category.id].push(article);
          assigned = true;

          // Add to featured if it's a primary comparison
          if (category.id === 'cbd-vs-thc' || searchText.includes('vs')) {
            featured.push(article);
          }
          break;
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      // Default to product comparisons
      byCategory['product-comparisons'].push(article);
    }
  }

  return { byCategory, featured: featured.slice(0, 6) };
}

export function getComparisonStats(categorized: CategorizedComparisonArticles) {
  return {
    total: Object.values(categorized.byCategory).flat().length,
    cbdVsThc: categorized.byCategory['cbd-vs-thc'].length,
    cannabinoids: categorized.byCategory['cannabinoid-comparisons'].length,
    products: categorized.byCategory['product-comparisons'].length,
    byCategory: Object.fromEntries(
      Object.entries(categorized.byCategory).map(([cat, articles]) => [cat, articles.length])
    ) as Record<ComparisonCategory, number>,
  };
}
