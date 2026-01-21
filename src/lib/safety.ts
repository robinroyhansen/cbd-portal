export type SafetyTopic = 'side-effects' | 'interactions' | 'contraindications' | 'quality' | 'testing' | 'special-populations';

export interface SafetyCategory {
  id: SafetyTopic;
  name: string;
  icon: string;
  description: string;
  importance: 'critical' | 'important' | 'informational';
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const SAFETY_CATEGORIES: SafetyCategory[] = [
  {
    id: 'side-effects',
    name: 'Side Effects',
    icon: '⚠️',
    description: 'Potential side effects, how to minimize them, and what to watch for',
    importance: 'important',
    keywords: ['side effect', 'adverse', 'reaction', 'drowsy', 'fatigue', 'tolerance'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'interactions',
    name: 'Drug Interactions',
    icon: '💊',
    description: 'How CBD interacts with medications and supplements',
    importance: 'critical',
    keywords: ['interaction', 'medication', 'drug', 'blood thinner', 'antidepressant', 'blood pressure'],
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 'contraindications',
    name: 'Who Should Avoid CBD',
    icon: '🚫',
    description: 'Conditions and situations where CBD may not be appropriate',
    importance: 'critical',
    keywords: ['avoid', 'should not', 'contraindication', 'pregnancy', 'breastfeeding', 'liver', 'children'],
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  {
    id: 'quality',
    name: 'Quality & Purity',
    icon: '✅',
    description: 'How to identify quality CBD products and avoid contamination',
    importance: 'important',
    keywords: ['quality', 'pure', 'contamination', 'heavy metal', 'pesticide', 'fake', 'red flag'],
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'testing',
    name: 'Lab Testing & COAs',
    icon: '🔬',
    description: 'Understanding certificates of analysis and third-party testing',
    importance: 'important',
    keywords: ['test', 'lab', 'coa', 'certificate', 'third-party', 'potency', 'verify'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'special-populations',
    name: 'Special Populations',
    icon: '👶',
    description: 'Safety considerations for seniors, children, pregnant women, and others',
    importance: 'critical',
    keywords: ['senior', 'elderly', 'children', 'child', 'pregnancy', 'pregnant', 'breastfeeding', 'nursing'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

export const SAFETY_CATEGORY_META: Record<SafetyTopic, SafetyCategory> = Object.fromEntries(
  SAFETY_CATEGORIES.map(cat => [cat.id, cat])
) as Record<SafetyTopic, SafetyCategory>;

export const IMPORTANCE_META = {
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  important: {
    label: 'Important',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  informational: {
    label: 'Info',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
};

export interface CategorizedSafetyArticles {
  byTopic: Record<SafetyTopic, any[]>;
  critical: any[];
}

export function categorizeSafetyArticles(articles: any[]): CategorizedSafetyArticles {
  const byTopic: Record<SafetyTopic, any[]> = {
    'side-effects': [],
    interactions: [],
    contraindications: [],
    quality: [],
    testing: [],
    'special-populations': [],
  };

  const critical: any[] = [];

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    let assigned = false;
    for (const category of SAFETY_CATEGORIES) {
      for (const keyword of category.keywords) {
        if (searchText.includes(keyword)) {
          byTopic[category.id].push(article);
          assigned = true;

          // Also add to critical if category is critical
          if (category.importance === 'critical') {
            critical.push(article);
          }
          break;
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      // Default to quality
      byTopic.quality.push(article);
    }
  }

  return { byTopic, critical };
}

export function getSafetyStats(categorized: CategorizedSafetyArticles) {
  return {
    total: Object.values(categorized.byTopic).flat().length,
    critical: categorized.critical.length,
    byTopic: Object.fromEntries(
      Object.entries(categorized.byTopic).map(([topic, articles]) => [topic, articles.length])
    ) as Record<SafetyTopic, number>,
  };
}
