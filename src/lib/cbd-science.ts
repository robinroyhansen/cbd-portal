export type ScienceCategory = 'endocannabinoid' | 'mechanisms' | 'research' | 'pharmacology' | 'clinical';

export interface ScienceTopic {
  id: ScienceCategory;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const SCIENCE_CATEGORIES: ScienceTopic[] = [
  {
    id: 'endocannabinoid',
    name: 'Endocannabinoid System',
    icon: '🧠',
    description: 'Understanding the ECS and how cannabinoids interact with the body',
    keywords: ['endocannabinoid', 'ecs', 'cb1', 'cb2', 'receptor', 'anandamide', '2-ag'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'mechanisms',
    name: 'How CBD Works',
    icon: '⚙️',
    description: 'The biological mechanisms and pathways of CBD action',
    keywords: ['mechanism', 'works', 'action', 'pathway', 'modulate', 'interact', 'binding'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'research',
    name: 'Research & Studies',
    icon: '📊',
    description: 'Scientific research, clinical trials, and study findings',
    keywords: ['research', 'study', 'studies', 'trial', 'evidence', 'finding', 'data', 'peer-reviewed'],
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    icon: '💊',
    description: 'Drug interactions, metabolism, and bioavailability',
    keywords: ['pharmacology', 'metabolism', 'bioavailability', 'half-life', 'absorption', 'cytochrome', 'liver'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'clinical',
    name: 'Clinical Applications',
    icon: '🏥',
    description: 'Medical uses and therapeutic applications of CBD',
    keywords: ['clinical', 'medical', 'therapeutic', 'treatment', 'therapy', 'patient', 'doctor'],
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
];

export const SCIENCE_CATEGORY_META: Record<ScienceCategory, ScienceTopic> = Object.fromEntries(
  SCIENCE_CATEGORIES.map(cat => [cat.id, cat])
) as Record<ScienceCategory, ScienceTopic>;

export interface CategorizedScienceArticles {
  byCategory: Record<ScienceCategory, any[]>;
}

export function categorizeScienceArticles(articles: any[]): CategorizedScienceArticles {
  const byCategory: Record<ScienceCategory, any[]> = {
    endocannabinoid: [],
    mechanisms: [],
    research: [],
    pharmacology: [],
    clinical: [],
  };

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    let assigned = false;
    for (const category of SCIENCE_CATEGORIES) {
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
      // Default to research
      byCategory.research.push(article);
    }
  }

  return { byCategory };
}

export function getScienceStats(categorized: CategorizedScienceArticles) {
  return {
    total: Object.values(categorized.byCategory).flat().length,
    endocannabinoid: categorized.byCategory.endocannabinoid.length,
    mechanisms: categorized.byCategory.mechanisms.length,
    research: categorized.byCategory.research.length,
    byCategory: Object.fromEntries(
      Object.entries(categorized.byCategory).map(([cat, articles]) => [cat, articles.length])
    ) as Record<ScienceCategory, number>,
  };
}
