export type AudienceType = 'seniors' | 'athletes' | 'women' | 'men' | 'professionals' | 'students' | 'travelers' | 'beginners' | 'other';

export interface AudienceCategory {
  id: AudienceType;
  name: string;
  icon: string;
  description: string;
  tagline: string;
  primaryConcerns: string[];
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const AUDIENCE_CATEGORIES: AudienceCategory[] = [
  {
    id: 'seniors',
    name: 'Seniors',
    icon: '👴',
    description: 'CBD guidance for adults over 50 with age-specific considerations',
    tagline: 'Gentle wellness for the golden years',
    primaryConcerns: ['Drug interactions', 'Sleep', 'Joint comfort', 'Cognitive support'],
    keywords: ['senior', 'elderly', 'older', 'over 50', 'over 60', '65+', 'aging'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'athletes',
    name: 'Athletes & Fitness',
    icon: '🏃',
    description: 'CBD for recovery, performance support, and active lifestyles',
    tagline: 'Support your active lifestyle',
    primaryConcerns: ['Recovery', 'Muscle soreness', 'Sleep quality', 'Competition rules'],
    keywords: ['athlete', 'fitness', 'runner', 'cyclist', 'swimmer', 'weightlifter', 'sport', 'exercise'],
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'women',
    name: 'Women',
    icon: '👩',
    description: 'CBD information for women\'s health, hormones, and wellness',
    tagline: 'Wellness support through every stage',
    primaryConcerns: ['Hormonal balance', 'Menstrual comfort', 'Pregnancy safety', 'Skin health'],
    keywords: ['women', 'female', 'woman', 'hormones', 'menstrual', 'pregnancy'],
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  {
    id: 'men',
    name: 'Men',
    icon: '👨',
    description: 'CBD guidance tailored for men\'s health and wellness needs',
    tagline: 'Targeted support for men\'s wellness',
    primaryConcerns: ['Stress management', 'Recovery', 'Sleep', 'Focus'],
    keywords: ['men', 'male', 'man'],
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'professionals',
    name: 'Professionals',
    icon: '💼',
    description: 'CBD for workplace stress, focus, and maintaining performance',
    tagline: 'Balance in a demanding world',
    primaryConcerns: ['Work stress', 'Focus', 'Sleep quality', 'Drug testing'],
    keywords: ['professional', 'work', 'office', 'career', 'job', 'healthcare worker', 'teacher'],
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
  {
    id: 'students',
    name: 'Students',
    icon: '🎓',
    description: 'CBD information for students managing academic pressure',
    tagline: 'Support through academic challenges',
    primaryConcerns: ['Study stress', 'Focus', 'Sleep', 'Anxiety'],
    keywords: ['student', 'academic', 'study', 'college', 'university'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'travelers',
    name: 'Travelers',
    icon: '✈️',
    description: 'CBD guidance for flying, international travel, and jet lag',
    tagline: 'Wellness on the go',
    primaryConcerns: ['Travel legality', 'Jet lag', 'Travel anxiety', 'Packing CBD'],
    keywords: ['travel', 'traveler', 'flying', 'flight', 'international', 'jet lag'],
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 'beginners',
    name: 'First-Time Users',
    icon: '🌱',
    description: 'Essential guidance for those new to CBD',
    tagline: 'Start your CBD journey confidently',
    primaryConcerns: ['Where to start', 'What to expect', 'Safety basics', 'Dosing'],
    keywords: ['beginner', 'first time', 'new', 'curious', 'hesitant'],
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'other',
    name: 'Other Groups',
    icon: '👥',
    description: 'CBD guides for specific groups and lifestyles',
    tagline: 'CBD for diverse needs',
    primaryConcerns: ['Specific needs', 'Lifestyle fit'],
    keywords: ['parent', 'caregiver', 'vegan', 'creative', 'musician', 'yoga'],
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
];

export const AUDIENCE_CATEGORY_META: Record<AudienceType, AudienceCategory> = Object.fromEntries(
  AUDIENCE_CATEGORIES.map(cat => [cat.id, cat])
) as Record<AudienceType, AudienceCategory>;

export interface CategorizedDemographicsArticles {
  byAudience: Record<AudienceType, any[]>;
}

export function categorizeDemographicsArticles(articles: any[]): CategorizedDemographicsArticles {
  const byAudience: Record<AudienceType, any[]> = {
    seniors: [],
    athletes: [],
    women: [],
    men: [],
    professionals: [],
    students: [],
    travelers: [],
    beginners: [],
    other: [],
  };

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    let assigned = false;
    for (const category of AUDIENCE_CATEGORIES) {
      if (category.id === 'other') continue;

      for (const keyword of category.keywords) {
        if (searchText.includes(keyword)) {
          byAudience[category.id].push(article);
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      byAudience.other.push(article);
    }
  }

  return { byAudience };
}

export function getDemographicsStats(categorized: CategorizedDemographicsArticles) {
  return {
    total: Object.values(categorized.byAudience).flat().length,
    byAudience: Object.fromEntries(
      Object.entries(categorized.byAudience).map(([audience, articles]) => [audience, articles.length])
    ) as Record<AudienceType, number>,
  };
}
