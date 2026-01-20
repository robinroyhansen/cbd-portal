/**
 * Topic Clustering Utility
 * Auto-detect and group articles into browsable topic clusters
 */

export interface TopicCluster {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  keywords: string[];
  priority: number; // Lower = higher priority in display
}

export interface ArticleWithTopic {
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string;
  reading_time: number | null;
  updated_at: string;
  detectedTopic: string;
}

// Define topic clusters with detection keywords
export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: '🚀',
    description: 'Essential guides for CBD beginners',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    keywords: ['beginner', 'first-time', 'introduction', 'getting started', 'what is cbd', 'start taking', 'complete guide to cbd'],
    priority: 1,
  },
  {
    id: 'cannabinoids',
    name: 'Cannabinoids',
    icon: '🧬',
    description: 'CBD, THC, CBG, CBN and other cannabinoids explained',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    keywords: ['cannabinoid', 'cbd vs', 'thc', 'cbg', 'cbn', 'cbc', 'thca', 'thcv', 'cbda', 'cbdv', 'delta-8', 'delta-9', 'delta-10', 'hhc', 'endocannabinoid', 'cb1', 'cb2', 'receptor', 'gpr55', 'anandamide', '2-ag'],
    priority: 2,
  },
  {
    id: 'how-it-works',
    name: 'How CBD Works',
    icon: '🧠',
    description: 'The science behind CBD and your body',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    keywords: ['how cbd works', 'endocannabinoid system', 'bioavailability', 'metabolism', 'receptor', 'serotonin', 'adenosine', 'ppar', 'trpv', 'faah', 'magl', 'homeostasis'],
    priority: 3,
  },
  {
    id: 'terpenes',
    name: 'Terpenes',
    icon: '🌸',
    description: 'Aromatic compounds that enhance CBD effects',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    keywords: ['terpene', 'myrcene', 'limonene', 'linalool', 'pinene', 'caryophyllene', 'humulene', 'bisabolol', 'eucalyptol', 'ocimene', 'terpinolene', 'entourage effect'],
    priority: 4,
  },
  {
    id: 'products',
    name: 'Product Types',
    icon: '🧴',
    description: 'Oils, gummies, topicals, vapes and more',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    keywords: ['cbd oil', 'cbd gummies', 'cbd capsules', 'cbd cream', 'cbd balm', 'cbd salve', 'cbd topical', 'cbd vape', 'cbd tincture', 'cbd patch', 'cbd edible', 'cbd flower', 'cbd isolate', 'full spectrum', 'broad spectrum', 'cbd softgel', 'cbd e-liquid', 'cbd concentrate', 'what is cbd'],
    priority: 5,
  },
  {
    id: 'how-to-use',
    name: 'How to Use CBD',
    icon: '📖',
    description: 'Practical guides for taking CBD',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    keywords: ['how to take', 'how to use', 'how to apply', 'sublingual', 'topical application', 'dosing', 'dropper guide'],
    priority: 6,
  },
  {
    id: 'dosing',
    name: 'Dosing Guides',
    icon: '⚖️',
    description: 'Finding your optimal CBD dose',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    keywords: ['dosage', 'dose', 'how much', 'titration', 'mg/ml', 'potency', 'strength guide', 'microdosing'],
    priority: 7,
  },
  {
    id: 'comparisons',
    name: 'Comparisons',
    icon: '🔄',
    description: 'CBD compared to other supplements and treatments',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    keywords: ['vs', 'versus', 'compared', 'comparison', 'difference between', 'better for'],
    priority: 8,
  },
  {
    id: 'safety',
    name: 'Safety & Quality',
    icon: '🛡️',
    description: 'Side effects, interactions, and quality testing',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    keywords: ['side effect', 'safety', 'drug interaction', 'contraindication', 'overdose', 'addictive', 'withdrawal', 'drug test', 'liver', 'quality', 'coa', 'lab report', 'third-party testing', 'contaminant', 'heavy metal', 'pesticide', 'fake', 'scam'],
    priority: 9,
  },
  {
    id: 'pets',
    name: 'CBD for Pets',
    icon: '🐾',
    description: 'Safe CBD use for dogs, cats, and other animals',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    keywords: ['dog', 'cat', 'pet', 'canine', 'feline', 'horse', 'equine', 'bird', 'parrot', 'rabbit', 'ferret', 'hamster', 'guinea pig', 'veterinar'],
    priority: 10,
  },
  {
    id: 'hemp',
    name: 'Hemp & Cultivation',
    icon: '🌱',
    description: 'Hemp plant, farming, and processing',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    keywords: ['hemp', 'cultivation', 'farming', 'harvest', 'seed', 'strain', 'plant anatomy', 'organic farming', 'sustainable', 'biomass', 'processing', 'extraction'],
    priority: 11,
  },
  {
    id: 'audiences',
    name: 'CBD for You',
    icon: '👥',
    description: 'Guides for specific groups and lifestyles',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    keywords: ['for athletes', 'for seniors', 'for women', 'for men', 'for students', 'for parents', 'for beginners', 'for professionals', 'for runners', 'for cyclists', 'for swimmers', 'for weightlifters', 'for musicians', 'for creatives', 'for vegans', 'for travelers'],
    priority: 12,
  },
  {
    id: 'buying',
    name: 'Buying CBD',
    icon: '🛒',
    description: 'How to choose and buy quality CBD products',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    keywords: ['buying', 'buy cbd', 'choose', 'shopping', 'brand', 'label', 'verify', 'store cbd', 'shelf life'],
    priority: 13,
  },
];

/**
 * Detect which topic cluster an article belongs to
 */
export function detectArticleTopic(title: string, content?: string): string {
  const titleLower = title.toLowerCase();
  const contentLower = (content || '').toLowerCase().slice(0, 3000); // First 3000 chars
  const combined = `${titleLower} ${contentLower}`;

  // Score each cluster based on keyword matches
  let bestMatch = { id: 'general', score: 0 };

  for (const cluster of TOPIC_CLUSTERS) {
    let score = 0;

    for (const keyword of cluster.keywords) {
      // Title matches are weighted 3x
      if (titleLower.includes(keyword)) {
        score += 3;
      }
      // Content matches
      if (contentLower.includes(keyword)) {
        score += 1;
      }
    }

    // Boost for exact phrase matches in title
    if (cluster.keywords.some(kw => titleLower.startsWith(kw) || titleLower.includes(`: ${kw}`))) {
      score += 2;
    }

    if (score > bestMatch.score) {
      bestMatch = { id: cluster.id, score };
    }
  }

  return bestMatch.score > 0 ? bestMatch.id : 'general';
}

/**
 * Group articles by detected topic
 */
export function groupArticlesByTopic(articles: any[]): Map<string, any[]> {
  const groups = new Map<string, any[]>();

  // Initialize all clusters
  for (const cluster of TOPIC_CLUSTERS) {
    groups.set(cluster.id, []);
  }
  groups.set('general', []);

  // Assign articles to clusters
  for (const article of articles) {
    const topic = detectArticleTopic(article.title, article.content);
    const group = groups.get(topic) || [];
    group.push({ ...article, detectedTopic: topic });
    groups.set(topic, group);
  }

  return groups;
}

/**
 * Get cluster by ID
 */
export function getClusterById(id: string): TopicCluster | undefined {
  return TOPIC_CLUSTERS.find(c => c.id === id);
}

/**
 * Get featured "Start Here" articles for beginners
 */
export function getStartHereArticles(articles: any[]): any[] {
  const starterTitles = [
    'what is cbd',
    'beginner\'s guide',
    'introduction to cbd',
    'getting started',
    'first-time user',
    'complete guide',
  ];

  return articles
    .filter(a => {
      const titleLower = a.title.toLowerCase();
      return starterTitles.some(t => titleLower.includes(t));
    })
    .slice(0, 4);
}
