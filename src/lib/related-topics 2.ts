// Define relationships between health conditions
export const relatedTopics: Record<string, string[]> = {
  'anxiety': ['stress', 'ptsd', 'depression', 'sleep'],
  'stress': ['anxiety', 'sleep', 'depression'],
  'ptsd': ['anxiety', 'stress', 'depression', 'sleep'],
  'depression': ['anxiety', 'stress', 'sleep'],
  'sleep': ['anxiety', 'stress', 'pain'],
  'pain': ['inflammation', 'arthritis', 'fibromyalgia', 'sleep'],
  'inflammation': ['pain', 'arthritis'],
  'arthritis': ['pain', 'inflammation'],
  'fibromyalgia': ['pain', 'sleep', 'inflammation'],
  'epilepsy': ['neurological'],
  'addiction': ['anxiety', 'depression'],
  'nausea': ['cancer', 'pain'],
  'cancer': ['pain', 'nausea', 'sleep'],
  'migraine': ['pain', 'inflammation'],
  'ibs': ['inflammation', 'stress'],
  'crohns': ['inflammation', 'ibs'],
  'eczema': ['inflammation'],
  'heart-disease': ['inflammation', 'stress'],
  'diabetes': ['inflammation'],
  'alzheimers': ['neurological', 'inflammation'],
  'parkinsons': ['neurological', 'sleep'],
  'multiple-sclerosis': ['neurological', 'pain', 'inflammation'],
  'adhd': ['anxiety', 'sleep'],
  'glaucoma': ['neurological']
};

export function getRelatedTopics(slug: string): string[] {
  // Extract topic from slug (e.g., 'cbd-and-anxiety' -> 'anxiety')
  const topic = slug.replace('cbd-and-', '').replace('cbd-for-', '');
  return relatedTopics[topic] || [];
}

export function getRelatedSlugs(slug: string): string[] {
  const topics = getRelatedTopics(slug);
  return topics.map(t => `cbd-and-${t}`);
}