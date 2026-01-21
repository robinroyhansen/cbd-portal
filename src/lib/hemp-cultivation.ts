export type HempCategory = 'growing' | 'processing' | 'sustainability' | 'industry' | 'history';

export interface HempTopic {
  id: HempCategory;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const HEMP_CATEGORIES: HempTopic[] = [
  {
    id: 'growing',
    name: 'Growing Hemp',
    icon: '🌱',
    description: 'Hemp cultivation, farming practices, and plant care',
    keywords: ['grow', 'farm', 'cultivat', 'plant', 'seed', 'harvest', 'soil', 'organic', 'indoor', 'outdoor'],
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'processing',
    name: 'Processing & Extraction',
    icon: '🏭',
    description: 'How CBD is extracted and processed from hemp',
    keywords: ['extract', 'process', 'co2', 'ethanol', 'distillat', 'isolat', 'refin', 'manufactur'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'sustainability',
    name: 'Sustainability',
    icon: '♻️',
    description: 'Environmental benefits and sustainable practices',
    keywords: ['sustainab', 'environment', 'eco', 'carbon', 'regenerat', 'organic', 'green', 'planet'],
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'industry',
    name: 'Hemp Industry',
    icon: '📈',
    description: 'The business side of hemp - market trends and applications',
    keywords: ['industry', 'market', 'business', 'commercial', 'product', 'application', 'use', 'textile', 'fiber'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'history',
    name: 'Hemp History',
    icon: '📜',
    description: 'The history and cultural significance of hemp',
    keywords: ['history', 'historical', 'ancient', 'tradition', 'origin', 'evolution', 'past'],
    color: 'text-stone-700',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-200',
  },
];

export const HEMP_CATEGORY_META: Record<HempCategory, HempTopic> = Object.fromEntries(
  HEMP_CATEGORIES.map(cat => [cat.id, cat])
) as Record<HempCategory, HempTopic>;

// Hemp facts for display
export const HEMP_FACTS = [
  { icon: '🌍', fact: 'Hemp grows in almost any climate' },
  { icon: '💧', fact: 'Requires 50% less water than cotton' },
  { icon: '🌿', fact: 'Naturally resistant to most pests' },
  { icon: '🔄', fact: 'Fully biodegradable plant material' },
];

export interface CategorizedHempArticles {
  byCategory: Record<HempCategory, any[]>;
}

export function categorizeHempArticles(articles: any[]): CategorizedHempArticles {
  const byCategory: Record<HempCategory, any[]> = {
    growing: [],
    processing: [],
    sustainability: [],
    industry: [],
    history: [],
  };

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    let assigned = false;
    for (const category of HEMP_CATEGORIES) {
      for (const keyword of category.keywords) {
        if (searchText.includes(keyword)) {
          byCategory[category.id].push(article);
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      // Default to industry
      byCategory.industry.push(article);
    }
  }

  return { byCategory };
}

export function getHempStats(categorized: CategorizedHempArticles) {
  return {
    total: Object.values(categorized.byCategory).flat().length,
    growing: categorized.byCategory.growing.length,
    processing: categorized.byCategory.processing.length,
    sustainability: categorized.byCategory.sustainability.length,
    byCategory: Object.fromEntries(
      Object.entries(categorized.byCategory).map(([cat, articles]) => [cat, articles.length])
    ) as Record<HempCategory, number>,
  };
}
