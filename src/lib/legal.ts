export type LegalCategory = 'regulations' | 'compliance' | 'travel' | 'workplace';

export interface LegalTopic {
  id: LegalCategory;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const LEGAL_CATEGORIES: LegalTopic[] = [
  {
    id: 'regulations',
    name: 'CBD Regulations',
    icon: '⚖️',
    description: 'Laws and regulations governing CBD products',
    keywords: ['law', 'legal', 'regulation', 'act', 'bill', 'legislation', 'federal', 'state'],
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: '📋',
    description: 'Product labeling, testing requirements, and industry standards',
    keywords: ['compliance', 'label', 'testing', 'standard', 'requirement', 'certified'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'travel',
    name: 'Travel with CBD',
    icon: '✈️',
    description: 'Traveling domestically and internationally with CBD products',
    keywords: ['travel', 'fly', 'airport', 'tsa', 'international', 'border', 'country'],
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 'workplace',
    name: 'Workplace & Drug Testing',
    icon: '💼',
    description: 'CBD use, employment, and drug testing considerations',
    keywords: ['work', 'job', 'employ', 'drug test', 'workplace', 'employer'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
];

export const LEGAL_CATEGORY_META: Record<LegalCategory, LegalTopic> = Object.fromEntries(
  LEGAL_CATEGORIES.map(cat => [cat.id, cat])
) as Record<LegalCategory, LegalTopic>;

export interface CategorizedLegalArticles {
  byCategory: Record<LegalCategory, any[]>;
}

export function categorizeLegalArticles(articles: any[]): CategorizedLegalArticles {
  const byCategory: Record<LegalCategory, any[]> = {
    regulations: [],
    compliance: [],
    travel: [],
    workplace: [],
  };

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    let assigned = false;
    for (const category of LEGAL_CATEGORIES) {
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
      // Default to regulations
      byCategory.regulations.push(article);
    }
  }

  return { byCategory };
}

export function getLegalStats(categorized: CategorizedLegalArticles) {
  return {
    total: Object.values(categorized.byCategory).flat().length,
    byCategory: Object.fromEntries(
      Object.entries(categorized.byCategory).map(([cat, articles]) => [cat, articles.length])
    ) as Record<LegalCategory, number>,
  };
}
