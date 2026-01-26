/**
 * Topics Library
 * Provides topic aggregation pages for CBD research topics
 *
 * Topics are research areas like anxiety, depression, sleep, etc.
 * They aggregate studies, articles, and glossary terms.
 */

import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

export type TopicCategory =
  | 'Mental Health'
  | 'Pain & Inflammation'
  | 'Neurological'
  | 'Gastrointestinal'
  | 'Cancer'
  | 'Skin'
  | 'Cardiovascular'
  | 'Metabolic'
  | 'Other';

export interface Topic {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: TopicCategory;
  keywords: string[];
}

export interface TopicWithDetails extends Topic {
  studyCount: number;
  articleCount: number;
  glossaryTermCount: number;
}

export interface TopicStats {
  totalStudies: number;
  humanStudiesPercent: number;
  reviewsPercent: number;
  animalStudiesPercent: number;
  inVitroPercent: number;
  averageQualityScore: number;
  latestStudyYear: number | null;
  highQualityCount: number; // quality_score >= 70
}

export interface RelatedCondition {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  short_description: string | null;
  research_count: number;
}

export interface RelatedStudy {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  study_type: string | null;
  study_subject: string | null;
  quality_score: number | null;
  plain_summary: string | null;
  doi: string | null;
  pmid: string | null;
}

export interface RelatedGlossaryTerm {
  id: string;
  slug: string;
  term: string;
  short_definition: string | null;
  category: string | null;
}

export interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
}

export interface TopicDetail extends TopicWithDetails {
  stats: TopicStats;
  relatedConditions: RelatedCondition[];
  studies: RelatedStudy[];
  glossaryTerms: RelatedGlossaryTerm[];
  articles: RelatedArticle[];
}

// ============================================================================
// Topic Configuration
// ============================================================================

export const TOPICS: Topic[] = [
  // Mental Health
  {
    slug: 'anxiety',
    name: 'Anxiety',
    description: 'Research on CBD for anxiety disorders, including generalized anxiety, social anxiety, and panic disorder.',
    icon: 'brain',
    color: 'purple',
    category: 'Mental Health',
    keywords: ['anxiety', 'anxiolytic', 'gad', 'social anxiety', 'panic disorder'],
  },
  {
    slug: 'depression',
    name: 'Depression',
    description: 'Studies exploring CBD\'s potential antidepressant effects and mood regulation properties.',
    icon: 'cloud',
    color: 'blue',
    category: 'Mental Health',
    keywords: ['depression', 'depressive', 'antidepressant', 'mood disorder'],
  },
  {
    slug: 'sleep',
    name: 'Sleep & Insomnia',
    description: 'Research on CBD for sleep disorders, insomnia, and improving sleep quality.',
    icon: 'moon',
    color: 'indigo',
    category: 'Mental Health',
    keywords: ['sleep', 'insomnia', 'circadian', 'sleep quality', 'sleep disorder'],
  },
  {
    slug: 'ptsd',
    name: 'PTSD',
    description: 'Studies on CBD for post-traumatic stress disorder and trauma-related conditions.',
    icon: 'shield',
    color: 'slate',
    category: 'Mental Health',
    keywords: ['ptsd', 'post-traumatic', 'trauma', 'traumatic stress'],
  },
  {
    slug: 'addiction',
    name: 'Addiction',
    description: 'Research on CBD for substance use disorders, withdrawal symptoms, and relapse prevention.',
    icon: 'refresh',
    color: 'green',
    category: 'Mental Health',
    keywords: ['addiction', 'substance abuse', 'withdrawal', 'opioid', 'alcohol'],
  },
  {
    slug: 'stress',
    name: 'Chronic Stress',
    description: 'Studies on CBD for stress management, cortisol regulation, and stress relief.',
    icon: 'zap',
    color: 'orange',
    category: 'Mental Health',
    keywords: ['stress', 'chronic stress', 'cortisol', 'burnout'],
  },

  // Pain & Inflammation
  {
    slug: 'pain',
    name: 'Chronic Pain',
    description: 'Research on CBD for chronic pain management and analgesic effects.',
    icon: 'activity',
    color: 'red',
    category: 'Pain & Inflammation',
    keywords: ['chronic pain', 'pain', 'analgesic', 'pain management'],
  },
  {
    slug: 'inflammation',
    name: 'Inflammation',
    description: 'Studies on CBD\'s anti-inflammatory properties and effects on inflammatory conditions.',
    icon: 'flame',
    color: 'orange',
    category: 'Pain & Inflammation',
    keywords: ['inflammation', 'anti-inflammatory', 'inflammatory'],
  },
  {
    slug: 'arthritis',
    name: 'Arthritis',
    description: 'Research on CBD for arthritis, joint pain, and rheumatic conditions.',
    icon: 'bone',
    color: 'amber',
    category: 'Pain & Inflammation',
    keywords: ['arthritis', 'osteoarthritis', 'rheumatoid', 'joint pain'],
  },
  {
    slug: 'fibromyalgia',
    name: 'Fibromyalgia',
    description: 'Studies on CBD for fibromyalgia, widespread pain, and related symptoms.',
    icon: 'sparkles',
    color: 'fuchsia',
    category: 'Pain & Inflammation',
    keywords: ['fibromyalgia', 'widespread pain', 'tender points'],
  },
  {
    slug: 'neuropathic-pain',
    name: 'Neuropathic Pain',
    description: 'Research on CBD for nerve pain, neuropathy, and neuralgia.',
    icon: 'zap',
    color: 'yellow',
    category: 'Pain & Inflammation',
    keywords: ['neuropathic', 'neuropathy', 'nerve pain', 'neuralgia'],
  },
  {
    slug: 'migraines',
    name: 'Migraines & Headaches',
    description: 'Studies on CBD for migraine prevention and headache relief.',
    icon: 'alert-circle',
    color: 'red',
    category: 'Pain & Inflammation',
    keywords: ['migraine', 'headache', 'cluster headache'],
  },

  // Neurological
  {
    slug: 'epilepsy',
    name: 'Epilepsy & Seizures',
    description: 'Clinical research on CBD for epilepsy, including FDA-approved treatments like Epidiolex.',
    icon: 'zap',
    color: 'yellow',
    category: 'Neurological',
    keywords: ['epilepsy', 'seizure', 'dravet', 'lennox-gastaut', 'epidiolex'],
  },
  {
    slug: 'parkinsons',
    name: 'Parkinson\'s Disease',
    description: 'Research on CBD for Parkinson\'s disease symptoms and neuroprotection.',
    icon: 'brain',
    color: 'teal',
    category: 'Neurological',
    keywords: ['parkinson', 'tremor', 'dopamine', 'dyskinesia'],
  },
  {
    slug: 'alzheimers',
    name: 'Alzheimer\'s & Dementia',
    description: 'Studies on CBD for Alzheimer\'s disease, dementia, and cognitive decline.',
    icon: 'brain',
    color: 'gray',
    category: 'Neurological',
    keywords: ['alzheimer', 'dementia', 'cognitive decline', 'memory loss'],
  },
  {
    slug: 'multiple-sclerosis',
    name: 'Multiple Sclerosis',
    description: 'Research on CBD for MS symptoms, spasticity, and neuroprotection.',
    icon: 'dna',
    color: 'orange',
    category: 'Neurological',
    keywords: ['multiple sclerosis', 'ms', 'spasticity', 'nabiximols'],
  },
  {
    slug: 'autism',
    name: 'Autism Spectrum',
    description: 'Studies on CBD for autism spectrum disorders and related symptoms.',
    icon: 'puzzle',
    color: 'cyan',
    category: 'Neurological',
    keywords: ['autism', 'asd', 'spectrum disorder', 'neurodevelopmental'],
  },

  // Gastrointestinal
  {
    slug: 'nausea',
    name: 'Nausea & Vomiting',
    description: 'Research on CBD\'s antiemetic effects for nausea and vomiting.',
    icon: 'droplet',
    color: 'green',
    category: 'Gastrointestinal',
    keywords: ['nausea', 'vomiting', 'antiemetic', 'chemotherapy-induced'],
  },
  {
    slug: 'ibs',
    name: 'IBS',
    description: 'Studies on CBD for irritable bowel syndrome and gut health.',
    icon: 'activity',
    color: 'yellow',
    category: 'Gastrointestinal',
    keywords: ['ibs', 'irritable bowel', 'gastrointestinal'],
  },
  {
    slug: 'crohns',
    name: 'Crohn\'s & IBD',
    description: 'Research on CBD for Crohn\'s disease and inflammatory bowel disease.',
    icon: 'shield',
    color: 'amber',
    category: 'Gastrointestinal',
    keywords: ['crohn', 'ibd', 'colitis', 'inflammatory bowel'],
  },

  // Cancer
  {
    slug: 'cancer',
    name: 'Cancer Research',
    description: 'Studies on CBD\'s potential anticancer effects and tumor research.',
    icon: 'ribbon',
    color: 'pink',
    category: 'Cancer',
    keywords: ['cancer', 'tumor', 'oncology', 'apoptosis', 'antitumor'],
  },
  {
    slug: 'chemotherapy',
    name: 'Chemotherapy Side Effects',
    description: 'Research on CBD for managing chemotherapy side effects like nausea and pain.',
    icon: 'pill',
    color: 'rose',
    category: 'Cancer',
    keywords: ['chemotherapy', 'chemo-induced', 'palliative', 'cachexia'],
  },

  // Skin
  {
    slug: 'acne',
    name: 'Acne',
    description: 'Studies on CBD for acne treatment and sebum regulation.',
    icon: 'sparkles',
    color: 'sky',
    category: 'Skin',
    keywords: ['acne', 'sebaceous', 'sebum', 'skin'],
  },
  {
    slug: 'psoriasis',
    name: 'Psoriasis',
    description: 'Research on CBD for psoriasis and other skin conditions.',
    icon: 'droplet',
    color: 'rose',
    category: 'Skin',
    keywords: ['psoriasis', 'psoriatic', 'keratinocyte'],
  },
  {
    slug: 'eczema',
    name: 'Eczema & Dermatitis',
    description: 'Studies on CBD for eczema, atopic dermatitis, and skin inflammation.',
    icon: 'shield',
    color: 'pink',
    category: 'Skin',
    keywords: ['eczema', 'dermatitis', 'atopic', 'skin rash'],
  },

  // Cardiovascular
  {
    slug: 'heart-health',
    name: 'Heart Health',
    description: 'Research on CBD\'s cardiovascular effects and cardioprotective properties.',
    icon: 'heart',
    color: 'red',
    category: 'Cardiovascular',
    keywords: ['cardiovascular', 'cardiac', 'heart', 'cardioprotective'],
  },
  {
    slug: 'blood-pressure',
    name: 'Blood Pressure',
    description: 'Studies on CBD\'s effects on blood pressure and vascular health.',
    icon: 'activity',
    color: 'red',
    category: 'Cardiovascular',
    keywords: ['blood pressure', 'hypertension', 'vascular'],
  },

  // Metabolic
  {
    slug: 'diabetes',
    name: 'Diabetes',
    description: 'Research on CBD for diabetes management and glucose regulation.',
    icon: 'droplet',
    color: 'blue',
    category: 'Metabolic',
    keywords: ['diabetes', 'glucose', 'insulin', 'metabolic'],
  },
  {
    slug: 'obesity',
    name: 'Obesity & Weight',
    description: 'Studies on CBD for weight management and metabolic health.',
    icon: 'scale',
    color: 'emerald',
    category: 'Metabolic',
    keywords: ['obesity', 'weight', 'metabolic syndrome'],
  },

  // Other
  {
    slug: 'pets',
    name: 'Pets & Animals',
    description: 'Veterinary research on CBD for pets and companion animals.',
    icon: 'paw',
    color: 'amber',
    category: 'Other',
    keywords: ['veterinary', 'canine', 'feline', 'pets', 'dogs', 'cats'],
  },
  {
    slug: 'athletic-performance',
    name: 'Athletic Performance',
    description: 'Studies on CBD for sports recovery, inflammation, and performance.',
    icon: 'running',
    color: 'green',
    category: 'Other',
    keywords: ['athlete', 'athletic', 'sports', 'recovery'],
  },
  {
    slug: 'womens-health',
    name: 'Women\'s Health',
    description: 'Research on CBD for menstrual pain, menopause, and women\'s health issues.',
    icon: 'female',
    color: 'pink',
    category: 'Other',
    keywords: ['women', 'menstrual', 'menopause', 'endometriosis'],
  },
  {
    slug: 'glaucoma',
    name: 'Glaucoma',
    description: 'Studies on CBD for glaucoma and intraocular pressure.',
    icon: 'eye',
    color: 'cyan',
    category: 'Other',
    keywords: ['glaucoma', 'intraocular pressure', 'eye'],
  },
];

// Map topic slugs to research topic keys for database queries
const TOPIC_TO_RESEARCH_KEYS: Record<string, string[]> = {
  'anxiety': ['anxiety'],
  'depression': ['depression'],
  'sleep': ['sleep'],
  'ptsd': ['ptsd'],
  'addiction': ['addiction'],
  'stress': ['stress'],
  'pain': ['chronic_pain', 'pain'],
  'inflammation': ['inflammation'],
  'arthritis': ['arthritis'],
  'fibromyalgia': ['fibromyalgia'],
  'neuropathic-pain': ['neuropathic_pain'],
  'migraines': ['migraines'],
  'epilepsy': ['epilepsy'],
  'parkinsons': ['parkinsons'],
  'alzheimers': ['alzheimers'],
  'multiple-sclerosis': ['ms'],
  'autism': ['autism'],
  'nausea': ['nausea'],
  'ibs': ['ibs'],
  'crohns': ['crohns'],
  'cancer': ['cancer'],
  'chemotherapy': ['chemo_side_effects'],
  'acne': ['acne'],
  'psoriasis': ['psoriasis'],
  'eczema': ['eczema'],
  'heart-health': ['heart'],
  'blood-pressure': ['blood_pressure'],
  'diabetes': ['diabetes'],
  'obesity': ['obesity'],
  'pets': ['veterinary'],
  'athletic-performance': ['athletic'],
  'womens-health': ['womens'],
  'glaucoma': ['glaucoma'],
};

// Category display order and colors
export const TOPIC_CATEGORIES: { name: TopicCategory; color: string }[] = [
  { name: 'Mental Health', color: 'purple' },
  { name: 'Pain & Inflammation', color: 'red' },
  { name: 'Neurological', color: 'blue' },
  { name: 'Gastrointestinal', color: 'amber' },
  { name: 'Cancer', color: 'pink' },
  { name: 'Skin', color: 'sky' },
  { name: 'Cardiovascular', color: 'rose' },
  { name: 'Metabolic', color: 'emerald' },
  { name: 'Other', color: 'gray' },
];

// ============================================================================
// Data Functions
// ============================================================================

/**
 * Get all topics with study and article counts
 */
export const getTopics = cache(async (): Promise<TopicWithDetails[]> => {
  const supabase = await createClient();

  // Get study counts per topic from kb_research_queue
  const { data: studies } = await supabase
    .from('kb_research_queue')
    .select('primary_topic, relevant_topics')
    .eq('status', 'approved');

  // Count studies per research topic key
  const studyCounts: Record<string, number> = {};
  studies?.forEach(study => {
    if (study.primary_topic) {
      studyCounts[study.primary_topic] = (studyCounts[study.primary_topic] || 0) + 1;
    }
    if (study.relevant_topics) {
      study.relevant_topics.forEach((topic: string) => {
        studyCounts[topic] = (studyCounts[topic] || 0) + 1;
      });
    }
  });

  // Get article counts per condition_slug
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('condition_slug')
    .eq('status', 'published')
    .not('condition_slug', 'is', null);

  const articleCounts: Record<string, number> = {};
  articles?.forEach(article => {
    if (article.condition_slug) {
      articleCounts[article.condition_slug] = (articleCounts[article.condition_slug] || 0) + 1;
    }
  });

  // Get glossary term counts by category (approximate mapping)
  const { data: glossaryTerms } = await supabase
    .from('kb_glossary')
    .select('category');

  const glossaryCounts: Record<string, number> = {};
  glossaryTerms?.forEach(term => {
    if (term.category) {
      glossaryCounts[term.category.toLowerCase()] = (glossaryCounts[term.category.toLowerCase()] || 0) + 1;
    }
  });

  // Map topics with counts
  return TOPICS.map(topic => {
    const researchKeys = TOPIC_TO_RESEARCH_KEYS[topic.slug] || [];
    const studyCount = researchKeys.reduce((sum, key) => sum + (studyCounts[key] || 0), 0);

    // Map topic slug to potential condition slugs for article counts
    const articleCount = articleCounts[topic.slug] || articleCounts[topic.slug.replace(/-/g, '_')] || 0;

    // Approximate glossary count based on topic category
    const glossaryTermCount = glossaryCounts[topic.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')] || 0;

    return {
      ...topic,
      studyCount,
      articleCount,
      glossaryTermCount,
    };
  });
});

/**
 * Get a topic by slug with full details
 */
export const getTopicBySlug = cache(async (slug: string): Promise<TopicDetail | null> => {
  const topic = TOPICS.find(t => t.slug === slug);
  if (!topic) return null;

  const supabase = await createClient();
  const researchKeys = TOPIC_TO_RESEARCH_KEYS[slug] || [];

  // Build OR filter for primary_topic and relevant_topics
  const topicFilter = researchKeys.length > 0
    ? researchKeys.map(key => `primary_topic.eq.${key},relevant_topics.cs.{${key}}`).join(',')
    : 'primary_topic.eq.INVALID_KEY';

  // Get related studies
  const { data: studies } = await supabase
    .from('kb_research_queue')
    .select('id, slug, title, year, study_type, study_subject, quality_score, plain_summary, doi, pmid')
    .eq('status', 'approved')
    .or(topicFilter)
    .order('quality_score', { ascending: false })
    .limit(50);

  // Get related conditions from kb_conditions
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name, short_description, research_count')
    .eq('is_published', true)
    .or(topic.keywords.map(k => `name.ilike.%${k}%,topic_keywords.cs.{${k}}`).join(','))
    .order('research_count', { ascending: false })
    .limit(10);

  // Get related glossary terms
  const { data: glossaryTerms } = await supabase
    .from('kb_glossary')
    .select('id, slug, term, short_definition, category')
    .or(topic.keywords.map(k => `term.ilike.%${k}%,definition.ilike.%${k}%`).join(','))
    .order('view_count', { ascending: false })
    .limit(15);

  // Get related articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, slug, title, excerpt, reading_time_minutes, published_at')
    .eq('status', 'published')
    .or(`condition_slug.eq.${slug},condition_slug.eq.${slug.replace(/-/g, '_')},title.ilike.%${topic.name}%`)
    .order('published_at', { ascending: false })
    .limit(12);

  // Calculate stats
  const stats = calculateTopicStats(studies || []);

  return {
    ...topic,
    studyCount: studies?.length || 0,
    articleCount: articles?.length || 0,
    glossaryTermCount: glossaryTerms?.length || 0,
    stats,
    relatedConditions: (conditions || []).map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      display_name: c.display_name,
      short_description: c.short_description,
      research_count: c.research_count,
    })),
    studies: (studies || []).map(s => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      year: s.year,
      study_type: s.study_type,
      study_subject: s.study_subject,
      quality_score: s.quality_score,
      plain_summary: s.plain_summary,
      doi: s.doi,
      pmid: s.pmid,
    })),
    glossaryTerms: (glossaryTerms || []).map(t => ({
      id: t.id,
      slug: t.slug,
      term: t.term,
      short_definition: t.short_definition,
      category: t.category,
    })),
    articles: (articles || []).map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      reading_time_minutes: a.reading_time_minutes,
      published_at: a.published_at,
    })),
  };
});

/**
 * Get topic statistics
 */
export const getTopicStats = cache(async (slug: string): Promise<TopicStats | null> => {
  const topic = TOPICS.find(t => t.slug === slug);
  if (!topic) return null;

  const supabase = await createClient();
  const researchKeys = TOPIC_TO_RESEARCH_KEYS[slug] || [];

  const topicFilter = researchKeys.length > 0
    ? researchKeys.map(key => `primary_topic.eq.${key},relevant_topics.cs.{${key}}`).join(',')
    : 'primary_topic.eq.INVALID_KEY';

  const { data: studies } = await supabase
    .from('kb_research_queue')
    .select('study_subject, quality_score, year')
    .eq('status', 'approved')
    .or(topicFilter);

  return calculateTopicStats(studies || []);
});

/**
 * Calculate statistics from an array of studies
 */
function calculateTopicStats(studies: Array<{ study_subject?: string | null; quality_score?: number | null; year?: number | null }>): TopicStats {
  const total = studies.length;

  if (total === 0) {
    return {
      totalStudies: 0,
      humanStudiesPercent: 0,
      reviewsPercent: 0,
      animalStudiesPercent: 0,
      inVitroPercent: 0,
      averageQualityScore: 0,
      latestStudyYear: null,
      highQualityCount: 0,
    };
  }

  const humanCount = studies.filter(s => s.study_subject === 'human').length;
  const reviewCount = studies.filter(s => s.study_subject === 'review').length;
  const animalCount = studies.filter(s => s.study_subject === 'animal').length;
  const inVitroCount = studies.filter(s => s.study_subject === 'in_vitro').length;

  const qualityScores = studies.filter(s => s.quality_score != null).map(s => s.quality_score!);
  const averageQuality = qualityScores.length > 0
    ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
    : 0;

  const years = studies.filter(s => s.year != null).map(s => s.year!);
  const latestYear = years.length > 0 ? Math.max(...years) : null;

  const highQualityCount = studies.filter(s => (s.quality_score || 0) >= 70).length;

  return {
    totalStudies: total,
    humanStudiesPercent: Math.round((humanCount / total) * 100),
    reviewsPercent: Math.round((reviewCount / total) * 100),
    animalStudiesPercent: Math.round((animalCount / total) * 100),
    inVitroPercent: Math.round((inVitroCount / total) * 100),
    averageQualityScore: Math.round(averageQuality),
    latestStudyYear: latestYear,
    highQualityCount,
  };
}

/**
 * Get total research count across all topics
 */
export const getTotalTopicResearchCount = cache(async (): Promise<number> => {
  const supabase = await createClient();
  const { count } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');
  return count || 0;
});

/**
 * Get topics grouped by category
 */
export const getTopicsByCategory = cache(async (): Promise<Record<TopicCategory, TopicWithDetails[]>> => {
  const topics = await getTopics();

  const grouped: Record<TopicCategory, TopicWithDetails[]> = {
    'Mental Health': [],
    'Pain & Inflammation': [],
    'Neurological': [],
    'Gastrointestinal': [],
    'Cancer': [],
    'Skin': [],
    'Cardiovascular': [],
    'Metabolic': [],
    'Other': [],
  };

  topics.forEach(topic => {
    grouped[topic.category].push(topic);
  });

  return grouped;
});
