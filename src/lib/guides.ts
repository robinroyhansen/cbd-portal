export type GuideCategory = 'getting-started' | 'dosing' | 'usage' | 'buying' | 'quality' | 'lifestyle';

export interface GuideTopic {
  id: GuideCategory;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: '🚀',
    description: 'Your first steps with CBD - from choosing products to taking your first dose',
    keywords: ['start', 'begin', 'first', 'new', 'getting started', 'beginner'],
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'dosing',
    name: 'Dosing Guides',
    icon: '💊',
    description: 'How to find your optimal CBD dose - by weight, condition, and product type',
    keywords: ['dose', 'dosage', 'dosing', 'mg', 'how much', 'amount', 'titration', 'microdose'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'usage',
    name: 'Usage Methods',
    icon: '📋',
    description: 'How to take CBD - sublingual, oral, topical, inhaled, and more',
    keywords: ['how to', 'take', 'use', 'apply', 'sublingual', 'oral', 'topical', 'vape', 'method'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'buying',
    name: 'Buying Guides',
    icon: '🛒',
    description: 'How to buy CBD safely - online shopping, store visits, and avoiding scams',
    keywords: ['buy', 'buying', 'purchase', 'shop', 'online', 'store', 'choose', 'brand'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'quality',
    name: 'Quality & Labels',
    icon: '🔍',
    description: 'Understanding CBD quality - lab reports, labels, and certifications',
    keywords: ['quality', 'label', 'lab', 'coa', 'report', 'test', 'potency', 'verify'],
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  {
    id: 'lifestyle',
    name: 'CBD Lifestyle',
    icon: '🌿',
    description: 'CBD in daily life - timing, storage, travel, and integration tips',
    keywords: ['store', 'storage', 'travel', 'time', 'when', 'best time', 'dispose', 'shelf'],
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
];

export const GUIDE_TOPIC_META: Record<GuideCategory, GuideTopic> = Object.fromEntries(
  GUIDE_TOPICS.map(topic => [topic.id, topic])
) as Record<GuideCategory, GuideTopic>;

export interface CategorizedGuideArticles {
  byTopic: Record<GuideCategory, any[]>;
  quickReads: any[];
  comprehensive: any[];
}

export function categorizeGuideArticles(articles: any[]): CategorizedGuideArticles {
  const byTopic: Record<GuideCategory, any[]> = {
    'getting-started': [],
    dosing: [],
    usage: [],
    buying: [],
    quality: [],
    lifestyle: [],
  };

  const quickReads: any[] = [];
  const comprehensive: any[] = [];

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    // Categorize by reading time
    if (article.reading_time && article.reading_time <= 5) {
      quickReads.push(article);
    } else if (article.reading_time && article.reading_time >= 10) {
      comprehensive.push(article);
    }

    // Categorize by topic
    let assigned = false;
    for (const topic of GUIDE_TOPICS) {
      for (const keyword of topic.keywords) {
        if (searchText.includes(keyword)) {
          byTopic[topic.id].push(article);
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      // Default to usage if no match
      byTopic.usage.push(article);
    }
  }

  return { byTopic, quickReads, comprehensive };
}

export function getGuideStats(categorized: CategorizedGuideArticles) {
  return {
    total: Object.values(categorized.byTopic).flat().length,
    quickReads: categorized.quickReads.length,
    comprehensive: categorized.comprehensive.length,
    byTopic: Object.fromEntries(
      Object.entries(categorized.byTopic).map(([topic, articles]) => [topic, articles.length])
    ) as Record<GuideCategory, number>,
  };
}
