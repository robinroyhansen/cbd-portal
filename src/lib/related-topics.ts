// Comprehensive condition relationship mapping
// Organized by category with cross-category links for maximum internal linking

// Category-based condition groups for automatic relationship building
const CATEGORY_GROUPS: Record<string, string[]> = {
  // Mental Health & Neurological
  mental_health: ['anxiety', 'depression', 'stress', 'ptsd', 'panic-disorder', 'social-anxiety',
    'ocd', 'bipolar', 'mood-disorders', 'emotional-wellness'],
  neurological: ['epilepsy', 'seizures', 'parkinsons', 'alzheimers', 'dementia', 'neuropathy',
    'multiple-sclerosis', 'ms', 'tourettes', 'tremors', 'brain-health', 'cognitive-function'],
  sleep: ['sleep', 'insomnia', 'sleep-disorders', 'sleep-quality', 'rem-sleep', 'circadian-rhythm'],
  attention: ['adhd', 'add', 'focus', 'concentration', 'autism', 'asd'],
  addiction: ['addiction', 'substance-abuse', 'withdrawal', 'alcohol-addiction', 'opioid-addiction',
    'smoking-cessation', 'cannabis-dependence'],

  // Pain & Inflammation
  chronic_pain: ['pain', 'chronic-pain', 'back-pain', 'neck-pain', 'joint-pain',
    'muscle-pain', 'pain-management', 'pain-relief'],
  neuropathic: ['neuropathic-pain', 'nerve-pain', 'sciatica', 'diabetic-neuropathy',
    'peripheral-neuropathy', 'neuralgia'],
  inflammatory: ['inflammation', 'anti-inflammatory', 'swelling', 'chronic-inflammation'],
  arthritis: ['arthritis', 'rheumatoid-arthritis', 'osteoarthritis', 'joint-health',
    'joint-inflammation', 'gout'],
  fibromyalgia: ['fibromyalgia', 'fibro', 'widespread-pain', 'tender-points'],
  headaches: ['migraine', 'migraines', 'headaches', 'tension-headaches', 'cluster-headaches'],

  // Gastrointestinal
  digestive: ['ibs', 'irritable-bowel', 'crohns', 'colitis', 'ulcerative-colitis', 'ibd',
    'gut-health', 'digestion', 'digestive-health'],
  nausea: ['nausea', 'vomiting', 'motion-sickness', 'morning-sickness', 'appetite'],

  // Skin Conditions
  skin: ['acne', 'eczema', 'psoriasis', 'dermatitis', 'rosacea', 'skin-conditions',
    'skin-health', 'atopic-dermatitis', 'dry-skin', 'itching', 'pruritus'],
  wounds: ['wound-healing', 'scars', 'burns', 'skin-repair'],

  // Cardiovascular
  cardiovascular: ['heart', 'heart-health', 'blood-pressure', 'hypertension', 'circulation',
    'cardiovascular-health', 'cholesterol'],

  // Cancer & Serious Illness
  cancer: ['cancer', 'tumor', 'oncology', 'chemotherapy', 'cancer-pain', 'cancer-treatment',
    'palliative-care'],

  // Metabolic
  metabolic: ['diabetes', 'blood-sugar', 'insulin-resistance', 'obesity', 'weight-management',
    'metabolism', 'metabolic-syndrome'],

  // Women's Health
  womens: ['menstrual', 'pms', 'menopause', 'endometriosis', 'cramps', 'hormonal-balance',
    'womens-health', 'fertility'],

  // Immune & Respiratory
  immune: ['immune-system', 'autoimmune', 'immunity', 'allergies', 'inflammation'],
  respiratory: ['asthma', 'copd', 'breathing', 'respiratory', 'lung-health'],

  // Pets & Animals
  pets: ['pets', 'dogs', 'cats', 'horses', 'pet-anxiety', 'pet-pain', 'pet-seizures',
    'veterinary', 'animal-health'],

  // Wellness & Lifestyle
  wellness: ['general-wellness', 'daily-wellness', 'preventive', 'homeostasis', 'balance'],
  athletic: ['athletic-performance', 'sports', 'recovery', 'exercise', 'muscle-recovery',
    'sports-injuries', 'workout'],
  aging: ['aging', 'anti-aging', 'longevity', 'elderly', 'senior-health', 'age-related'],

  // Eye & Dental
  eyes: ['glaucoma', 'eye-health', 'eye-pressure', 'vision'],
  dental: ['dental', 'tooth-pain', 'gum-disease', 'oral-health']
};

// Cross-category relationships (conditions that commonly co-occur or are related)
const CROSS_CATEGORY_LINKS: Record<string, string[]> = {
  // Mental health often co-occurs with pain and sleep issues
  'anxiety': ['sleep', 'pain', 'inflammation', 'heart', 'ibs'],
  'depression': ['sleep', 'pain', 'fatigue', 'appetite', 'inflammation'],
  'stress': ['sleep', 'anxiety', 'heart', 'inflammation', 'digestion'],
  'ptsd': ['sleep', 'anxiety', 'depression', 'nightmares', 'pain'],

  // Sleep issues often linked to mental health and pain
  'sleep': ['anxiety', 'pain', 'depression', 'stress', 'restless-legs'],
  'insomnia': ['anxiety', 'depression', 'pain', 'stress'],

  // Pain conditions interconnect
  'pain': ['sleep', 'inflammation', 'anxiety', 'depression', 'mobility'],
  'chronic-pain': ['sleep', 'depression', 'anxiety', 'opioid-addiction', 'inflammation'],
  'arthritis': ['inflammation', 'pain', 'mobility', 'sleep', 'aging'],
  'fibromyalgia': ['sleep', 'fatigue', 'depression', 'anxiety', 'pain'],

  // Inflammation links many conditions
  'inflammation': ['pain', 'arthritis', 'skin', 'heart', 'gut-health', 'aging'],

  // Neurological conditions
  'epilepsy': ['anxiety', 'depression', 'sleep', 'brain-health'],
  'parkinsons': ['sleep', 'anxiety', 'tremors', 'mobility', 'depression'],
  'alzheimers': ['sleep', 'anxiety', 'inflammation', 'aging'],
  'multiple-sclerosis': ['pain', 'spasticity', 'fatigue', 'inflammation'],

  // Skin conditions often have inflammatory component
  'eczema': ['inflammation', 'allergies', 'immune', 'sleep'],
  'psoriasis': ['inflammation', 'arthritis', 'stress', 'immune'],
  'acne': ['inflammation', 'hormonal', 'stress', 'skin-health'],

  // Digestive issues
  'ibs': ['stress', 'anxiety', 'inflammation', 'gut-health'],
  'crohns': ['inflammation', 'immune', 'pain', 'nausea'],
  'nausea': ['cancer', 'chemotherapy', 'appetite', 'digestion'],

  // Cancer-related
  'cancer': ['pain', 'nausea', 'sleep', 'anxiety', 'appetite'],
  'chemotherapy': ['nausea', 'pain', 'appetite', 'sleep', 'fatigue'],

  // Cardiovascular links
  'heart': ['inflammation', 'blood-pressure', 'stress', 'cholesterol'],
  'blood-pressure': ['stress', 'anxiety', 'heart', 'inflammation'],

  // Metabolic conditions
  'diabetes': ['neuropathy', 'inflammation', 'weight-management', 'heart'],
  'obesity': ['inflammation', 'diabetes', 'heart', 'joint-pain', 'sleep-apnea'],

  // Addiction often co-occurs with mental health
  'addiction': ['anxiety', 'depression', 'pain', 'sleep', 'stress'],

  // Pet conditions mirror human ones
  'pet-anxiety': ['pet-pain', 'pet-seizures', 'pet-mobility'],
  'pet-pain': ['pet-arthritis', 'pet-mobility', 'pet-aging']
};

// Build complete relationship map
function buildRelatedTopics(): Record<string, string[]> {
  const related: Record<string, string[]> = {};

  // First, add intra-category relationships (conditions in same category relate to each other)
  for (const [category, conditions] of Object.entries(CATEGORY_GROUPS)) {
    for (const condition of conditions) {
      if (!related[condition]) {
        related[condition] = [];
      }
      // Add other conditions from same category
      const siblings = conditions.filter(c => c !== condition).slice(0, 4);
      related[condition].push(...siblings);
    }
  }

  // Then, add cross-category relationships
  for (const [condition, links] of Object.entries(CROSS_CATEGORY_LINKS)) {
    if (!related[condition]) {
      related[condition] = [];
    }
    // Add cross-category links, avoiding duplicates
    for (const link of links) {
      if (!related[condition].includes(link)) {
        related[condition].push(link);
      }
    }
    // Limit to 6 related topics max
    related[condition] = related[condition].slice(0, 6);
  }

  return related;
}

export const relatedTopics = buildRelatedTopics();

// Normalize slug to topic (handles various slug formats)
function normalizeToTopic(slug: string): string {
  return slug
    .replace(/^cbd[-\s](?:and|for|oil[-\s]for)[-\s]/i, '')
    .replace(/[-\s]guide$/i, '')
    .replace(/[-\s]benefits$/i, '')
    .replace(/[-\s]treatment$/i, '')
    .replace(/[-\s]relief$/i, '')
    .toLowerCase()
    .trim();
}

// Find best matching topic for a slug
function findMatchingTopic(slug: string): string | null {
  const normalized = normalizeToTopic(slug);

  // Direct match
  if (relatedTopics[normalized]) {
    return normalized;
  }

  // Try partial matches
  for (const topic of Object.keys(relatedTopics)) {
    if (normalized.includes(topic) || topic.includes(normalized)) {
      return topic;
    }
  }

  // Check category groups for broader matches
  for (const [, conditions] of Object.entries(CATEGORY_GROUPS)) {
    for (const condition of conditions) {
      if (normalized.includes(condition) || condition.includes(normalized)) {
        return condition;
      }
    }
  }

  return null;
}

export function getRelatedTopics(slug: string): string[] {
  const topic = findMatchingTopic(slug);
  if (!topic) return [];
  return relatedTopics[topic] || [];
}

export function getRelatedSlugs(slug: string): string[] {
  const topics = getRelatedTopics(slug);
  // Try both slug formats
  return topics.flatMap(t => [`cbd-and-${t}`, `cbd-for-${t}`]);
}

// Export categories for potential UI use
export { CATEGORY_GROUPS, CROSS_CATEGORY_LINKS };