export type TerpeneCategory = 'profiles' | 'effects' | 'science' | 'products' | 'combinations';

export interface TerpeneTopic {
  id: TerpeneCategory;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const TERPENE_CATEGORIES: TerpeneTopic[] = [
  {
    id: 'profiles',
    name: 'Terpene Profiles',
    icon: '🌸',
    description: 'Individual terpene guides - learn about specific terpenes and their properties',
    keywords: ['myrcene', 'limonene', 'pinene', 'linalool', 'caryophyllene', 'humulene', 'terpinolene', 'ocimene', 'bisabolol', 'profile'],
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  {
    id: 'effects',
    name: 'Terpene Effects',
    icon: '✨',
    description: 'How terpenes affect mood, relaxation, energy, and wellness',
    keywords: ['effect', 'benefit', 'relaxing', 'energizing', 'calming', 'uplifting', 'sedating', 'mood', 'anxiety', 'sleep'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'science',
    name: 'Terpene Science',
    icon: '🔬',
    description: 'The science behind terpenes, entourage effect, and research',
    keywords: ['science', 'research', 'entourage', 'synergy', 'mechanism', 'study', 'receptor', 'pharmacology'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'products',
    name: 'Terpene Products',
    icon: '🧴',
    description: 'Finding and using terpene-rich CBD products',
    keywords: ['product', 'oil', 'strain', 'hemp', 'extract', 'full spectrum', 'broad spectrum'],
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'combinations',
    name: 'Terpene Combinations',
    icon: '🎨',
    description: 'Combining terpenes for enhanced effects',
    keywords: ['combination', 'blend', 'mix', 'together', 'stack', 'pair', 'synergy'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
];

export const TERPENE_CATEGORY_META: Record<TerpeneCategory, TerpeneTopic> = Object.fromEntries(
  TERPENE_CATEGORIES.map(cat => [cat.id, cat])
) as Record<TerpeneCategory, TerpeneTopic>;

// Common terpenes for featured display
export const FEATURED_TERPENES = [
  { name: 'Myrcene', icon: '🥭', aroma: 'Earthy, musky', effects: 'Relaxing, sedating' },
  { name: 'Limonene', icon: '🍋', aroma: 'Citrus, lemon', effects: 'Uplifting, energizing' },
  { name: 'Linalool', icon: '💜', aroma: 'Floral, lavender', effects: 'Calming, anti-anxiety' },
  { name: 'Pinene', icon: '🌲', aroma: 'Pine, forest', effects: 'Alertness, memory' },
  { name: 'Caryophyllene', icon: '🌶️', aroma: 'Spicy, peppery', effects: 'Anti-inflammatory' },
  { name: 'Humulene', icon: '🍺', aroma: 'Hoppy, earthy', effects: 'Appetite suppressant' },
];

export interface CategorizedTerpeneArticles {
  byCategory: Record<TerpeneCategory, any[]>;
  featured: any[];
}

export function categorizeTerpeneArticles(articles: any[]): CategorizedTerpeneArticles {
  const byCategory: Record<TerpeneCategory, any[]> = {
    profiles: [],
    effects: [],
    science: [],
    products: [],
    combinations: [],
  };

  const featured: any[] = [];

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    let assigned = false;
    for (const category of TERPENE_CATEGORIES) {
      for (const keyword of category.keywords) {
        if (searchText.includes(keyword)) {
          byCategory[category.id].push(article);
          assigned = true;

          // Add to featured if it's a main terpene profile
          if (category.id === 'profiles') {
            featured.push(article);
          }
          break;
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      // Default to profiles
      byCategory.profiles.push(article);
    }
  }

  return { byCategory, featured: featured.slice(0, 6) };
}

export function getTerpeneStats(categorized: CategorizedTerpeneArticles) {
  return {
    total: Object.values(categorized.byCategory).flat().length,
    profiles: categorized.byCategory.profiles.length,
    effects: categorized.byCategory.effects.length,
    science: categorized.byCategory.science.length,
    byCategory: Object.fromEntries(
      Object.entries(categorized.byCategory).map(([cat, articles]) => [cat, articles.length])
    ) as Record<TerpeneCategory, number>,
  };
}
