export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type TopicArea = 'fundamentals' | 'types' | 'science' | 'usage' | 'lifestyle';

export interface CBDBasicsTopic {
  id: TopicArea;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CBD_BASICS_TOPICS: CBDBasicsTopic[] = [
  {
    id: 'fundamentals',
    name: 'CBD Fundamentals',
    icon: '🌱',
    description: 'What CBD is, where it comes from, and the basics everyone should know',
    keywords: ['what is', 'introduction', 'beginner', 'basics', 'cannabidiol'],
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'types',
    name: 'Types of CBD',
    icon: '🔬',
    description: 'Full spectrum, broad spectrum, isolate - understand the different CBD types',
    keywords: ['full spectrum', 'broad spectrum', 'isolate', 'type', 'extract'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'science',
    name: 'CBD Science',
    icon: '🧬',
    description: 'How CBD works, the endocannabinoid system, and the science behind it',
    keywords: ['endocannabinoid', 'ecs', 'works', 'body', 'system', 'science', 'psychoactive'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'usage',
    name: 'Using CBD',
    icon: '💊',
    description: 'Why people use CBD, what to expect, and who it\'s suitable for',
    keywords: ['use', 'take', 'feel', 'effect', 'expect'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'lifestyle',
    name: 'CBD & Lifestyle',
    icon: '🌿',
    description: 'CBD in daily life - vegan options, religious considerations, and more',
    keywords: ['vegan', 'halal', 'kosher', 'natural', 'lifestyle', 'organic'],
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
];

export const CBD_BASICS_TOPIC_META: Record<TopicArea, CBDBasicsTopic> = Object.fromEntries(
  CBD_BASICS_TOPICS.map(topic => [topic.id, topic])
) as Record<TopicArea, CBDBasicsTopic>;

export const DIFFICULTY_META: Record<DifficultyLevel, { label: string; icon: string; color: string; bgColor: string; description: string }> = {
  beginner: {
    label: 'Beginner',
    icon: '🌱',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'New to CBD? Start here',
  },
  intermediate: {
    label: 'Intermediate',
    icon: '📚',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Building on the basics',
  },
  advanced: {
    label: 'Advanced',
    icon: '🎓',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Deep dive into CBD science',
  },
};

export interface CategorizedBasicsArticles {
  byDifficulty: Record<DifficultyLevel, any[]>;
  byTopic: Record<TopicArea, any[]>;
  startHere: any[];
}

// Keywords that indicate difficulty level
const BEGINNER_KEYWORDS = ['what is', 'beginner', 'introduction', 'guide', 'basics', 'first', 'start', 'simple', 'explained'];
const ADVANCED_KEYWORDS = ['advanced', 'research', 'science', 'clinical', 'mechanism', 'pharmacology', 'deep dive'];

export function categorizeCBDBasicsArticles(articles: any[]): CategorizedBasicsArticles {
  const byDifficulty: Record<DifficultyLevel, any[]> = {
    beginner: [],
    intermediate: [],
    advanced: [],
  };

  const byTopic: Record<TopicArea, any[]> = {
    fundamentals: [],
    types: [],
    science: [],
    usage: [],
    lifestyle: [],
  };

  const startHere: any[] = [];

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    // Determine difficulty level
    let difficulty: DifficultyLevel = 'intermediate'; // default
    if (BEGINNER_KEYWORDS.some(kw => searchText.includes(kw))) {
      difficulty = 'beginner';
    } else if (ADVANCED_KEYWORDS.some(kw => searchText.includes(kw))) {
      difficulty = 'advanced';
    }
    byDifficulty[difficulty].push(article);

    // Determine topic area
    let topicAssigned = false;
    for (const topic of CBD_BASICS_TOPICS) {
      if (topic.keywords.some(kw => searchText.includes(kw))) {
        byTopic[topic.id].push(article);
        topicAssigned = true;
        break;
      }
    }
    if (!topicAssigned) {
      byTopic.fundamentals.push(article); // Default to fundamentals
    }

    // Start here articles - key beginner content
    const isStartHere = ['what-is-cbd', 'introduction-to-cbd', 'beginners-guide', 'complete-guide'].some(
      pattern => slugLower.includes(pattern)
    );
    if (isStartHere) {
      startHere.push(article);
    }
  }

  return { byDifficulty, byTopic, startHere };
}

export function getCBDBasicsStats(categorized: CategorizedBasicsArticles) {
  return {
    total: Object.values(categorized.byDifficulty).flat().length,
    beginner: categorized.byDifficulty.beginner.length,
    intermediate: categorized.byDifficulty.intermediate.length,
    advanced: categorized.byDifficulty.advanced.length,
    startHere: categorized.startHere.length,
  };
}
