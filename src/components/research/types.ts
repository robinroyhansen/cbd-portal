import { QualityTier, StudyType } from '@/lib/quality-tiers';

export interface ResearchItem {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  abstract?: string;
  plain_summary?: string;
  url: string;
  doi?: string;
  source_site?: string;
  source_type: 'research_queue' | 'citation';
  relevant_topics?: string[] | string;
  relevance_score?: number;
  slug?: string;
  country?: string;
  display_title?: string;
}

export type SortOption = 'quality' | 'year' | 'title' | 'relevance';
export type ViewMode = 'cards' | 'table' | 'timeline';
export type StudyCategory = 'all' | 'cbd' | 'cannabinoids' | 'cannabis' | 'medical-cannabis';
export type SubjectType = 'all' | 'human' | 'animal';

export interface SampleInfo {
  size: number;
  subjectType: 'humans' | 'mice' | 'rats' | 'animals' | 'cells' | 'dogs' | 'cats' | 'unknown';
  label: string;
}

export type StudyOutcome = 'positive' | 'mixed' | 'negative' | 'ongoing' | null;

export interface StudyWithQuality extends ResearchItem {
  qualityTier: QualityTier;
  qualityScore: number;
  studyType: StudyType;
  assessment: any;
  sampleInfo: SampleInfo | null;
  treatment: string | null;
  studyStatus: 'completed' | 'ongoing' | 'recruiting' | null;
  primaryCondition: { key: ConditionKey; data: typeof CONDITIONS[ConditionKey] } | null;
  outcome: StudyOutcome;
  cannabinoids: CannabinoidKey[];
}

// Condition category groupings for UI organization
export const CONDITION_CATEGORIES = {
  'Neurological & Mental Health': ['anxiety', 'depression', 'ptsd', 'sleep', 'epilepsy', 'parkinsons', 'alzheimers', 'autism', 'adhd', 'schizophrenia', 'addiction', 'tourettes'],
  'Pain & Inflammation': ['chronic_pain', 'neuropathic_pain', 'arthritis', 'fibromyalgia', 'ms', 'inflammation', 'migraines'],
  'Gastrointestinal': ['crohns', 'ibs', 'nausea'],
  'Cancer': ['cancer', 'chemo_side_effects'],
  'Skin': ['acne', 'psoriasis', 'eczema'],
  'Cardiovascular': ['heart', 'blood_pressure'],
  'Other': ['diabetes', 'obesity', 'athletic', 'veterinary']
} as const;

export const CONDITIONS = {
  anxiety: { label: 'Anxiety', keywords: ['anxiety', 'anxiolytic'], icon: '😰', color: 'purple', category: 'Neurological & Mental Health', description: 'Research on CBD for anxiety disorders and stress relief' },
  depression: { label: 'Depression', keywords: ['depression', 'depressive', 'antidepressant'], icon: '😔', color: 'blue', category: 'Neurological & Mental Health', description: 'Research on CBD for depression and mood disorders' },
  ptsd: { label: 'PTSD', keywords: ['ptsd', 'post-traumatic', 'trauma'], icon: '🎖️', color: 'slate', category: 'Neurological & Mental Health', description: 'Studies on CBD for PTSD and trauma-related disorders' },
  sleep: { label: 'Sleep & Insomnia', keywords: ['sleep', 'insomnia', 'circadian'], icon: '😴', color: 'indigo', category: 'Neurological & Mental Health', description: 'Research on CBD effects on sleep quality and insomnia' },
  epilepsy: { label: 'Epilepsy & Seizures', keywords: ['epilepsy', 'seizure', 'dravet'], icon: '⚡', color: 'yellow', category: 'Neurological & Mental Health', description: 'Clinical studies on CBD for epilepsy and seizure disorders' },
  parkinsons: { label: "Parkinson's", keywords: ['parkinson', 'dopamine', 'tremor'], icon: '🧠', color: 'teal', category: 'Neurological & Mental Health', description: "Research on CBD for Parkinson's disease symptoms" },
  alzheimers: { label: "Alzheimer's & Dementia", keywords: ['alzheimer', 'dementia', 'cognitive'], icon: '🧓', color: 'gray', category: 'Neurological & Mental Health', description: "Studies on CBD for Alzheimer's and dementia" },
  autism: { label: 'Autism & ASD', keywords: ['autism', 'asd', 'spectrum'], icon: '🧩', color: 'cyan', category: 'Neurological & Mental Health', description: 'Research on CBD for autism spectrum disorders' },
  adhd: { label: 'ADHD', keywords: ['adhd', 'attention deficit'], icon: '🎯', color: 'orange', category: 'Neurological & Mental Health', description: 'Studies on CBD for ADHD and attention disorders' },
  schizophrenia: { label: 'Schizophrenia', keywords: ['schizophrenia', 'psychosis'], icon: '🌀', color: 'violet', category: 'Neurological & Mental Health', description: 'Research on CBD antipsychotic effects' },
  addiction: { label: 'Addiction', keywords: ['addiction', 'substance abuse'], icon: '🔄', color: 'green', category: 'Neurological & Mental Health', description: 'Research on CBD for addiction treatment and withdrawal' },
  tourettes: { label: "Tourette's", keywords: ['tourette', 'tic disorder'], icon: '💬', color: 'lime', category: 'Neurological & Mental Health', description: "Studies on CBD for Tourette's syndrome" },
  chronic_pain: { label: 'Chronic Pain', keywords: ['chronic pain', 'pain syndrome'], icon: '💪', color: 'red', category: 'Pain & Inflammation', description: 'Studies on CBD for chronic pain management' },
  neuropathic_pain: { label: 'Neuropathic Pain', keywords: ['neuropathic', 'nerve pain'], icon: '⚡', color: 'amber', category: 'Pain & Inflammation', description: 'Research on CBD for nerve-related pain' },
  arthritis: { label: 'Arthritis', keywords: ['arthritis', 'osteoarthritis', 'rheumatoid'], icon: '🦴', color: 'stone', category: 'Pain & Inflammation', description: 'Studies on CBD for arthritis and joint conditions' },
  fibromyalgia: { label: 'Fibromyalgia', keywords: ['fibromyalgia', 'widespread pain'], icon: '🌡️', color: 'fuchsia', category: 'Pain & Inflammation', description: 'Research on CBD for fibromyalgia' },
  ms: { label: 'Multiple Sclerosis', keywords: ['multiple sclerosis', 'spasticity'], icon: '🧬', color: 'orange', category: 'Pain & Inflammation', description: 'Studies on CBD for MS symptoms and spasticity' },
  inflammation: { label: 'Inflammation', keywords: ['anti-inflammatory', 'inflammation'], icon: '🔥', color: 'orange', category: 'Pain & Inflammation', description: 'Research on CBD anti-inflammatory effects' },
  migraines: { label: 'Migraines & Headaches', keywords: ['migraine', 'headache'], icon: '🤕', color: 'red', category: 'Pain & Inflammation', description: 'Studies on CBD for migraines and headaches' },
  crohns: { label: "Crohn's Disease", keywords: ['crohn', 'inflammatory bowel'], icon: '🫃', color: 'amber', category: 'Gastrointestinal', description: "Research on CBD for Crohn's and IBD" },
  ibs: { label: 'IBS', keywords: ['ibs', 'irritable bowel'], icon: '🌀', color: 'yellow', category: 'Gastrointestinal', description: 'Studies on CBD for irritable bowel syndrome' },
  nausea: { label: 'Nausea & Vomiting', keywords: ['nausea', 'vomiting', 'antiemetic'], icon: '🤢', color: 'green', category: 'Gastrointestinal', description: 'Research on CBD antiemetic effects' },
  cancer: { label: 'Cancer', keywords: ['cancer', 'tumor', 'oncology'], icon: '🎗️', color: 'pink', category: 'Cancer', description: 'Research on CBD in cancer treatment' },
  chemo_side_effects: { label: 'Chemotherapy Side Effects', keywords: ['chemotherapy', 'palliative'], icon: '💊', color: 'rose', category: 'Cancer', description: 'Studies on CBD for chemotherapy side effects' },
  acne: { label: 'Acne', keywords: ['acne', 'sebaceous'], icon: '✨', color: 'sky', category: 'Skin', description: 'Research on CBD for acne treatment' },
  psoriasis: { label: 'Psoriasis', keywords: ['psoriasis', 'psoriatic'], icon: '🧴', color: 'rose', category: 'Skin', description: 'Studies on CBD for psoriasis' },
  eczema: { label: 'Eczema & Dermatitis', keywords: ['eczema', 'dermatitis'], icon: '🩹', color: 'pink', category: 'Skin', description: 'Research on CBD for eczema and skin conditions' },
  heart: { label: 'Heart Health', keywords: ['cardiovascular', 'cardiac'], icon: '❤️', color: 'red', category: 'Cardiovascular', description: 'Research on CBD cardiovascular effects' },
  blood_pressure: { label: 'Blood Pressure', keywords: ['blood pressure', 'hypertension'], icon: '🩺', color: 'red', category: 'Cardiovascular', description: 'Studies on CBD blood pressure effects' },
  diabetes: { label: 'Diabetes', keywords: ['diabetes', 'glucose', 'insulin'], icon: '🩸', color: 'blue', category: 'Other', description: 'Research on CBD for diabetes management' },
  obesity: { label: 'Obesity & Weight', keywords: ['obesity', 'weight loss'], icon: '⚖️', color: 'emerald', category: 'Other', description: 'Studies on CBD and weight management' },
  athletic: { label: 'Athletic Performance', keywords: ['athlete', 'athletic', 'sports'], icon: '🏃', color: 'green', category: 'Other', description: 'Research on CBD for athletic performance and recovery' },
  veterinary: { label: 'Veterinary & Pets', keywords: ['veterinary', 'pet', 'animal'], icon: '🐕', color: 'amber', category: 'Other', description: 'Studies on CBD for pets and animals' }
} as const;

export type ConditionKey = keyof typeof CONDITIONS;

export const CANNABINOIDS = {
  CBD: { label: 'CBD', fullName: 'Cannabidiol', patterns: ['cannabidiol', 'cbd'], color: 'green' },
  THC: { label: 'THC', fullName: 'Tetrahydrocannabinol', patterns: ['tetrahydrocannabinol', 'thc'], color: 'purple' },
  CBG: { label: 'CBG', fullName: 'Cannabigerol', patterns: ['cannabigerol', 'cbg'], color: 'blue' },
  CBN: { label: 'CBN', fullName: 'Cannabinol', patterns: ['cannabinol', 'cbn'], color: 'amber' },
  CBC: { label: 'CBC', fullName: 'Cannabichromene', patterns: ['cannabichromene', 'cbc'], color: 'cyan' },
  THCV: { label: 'THCV', fullName: 'Tetrahydrocannabivarin', patterns: ['tetrahydrocannabivarin', 'thcv'], color: 'orange' },
  CBDV: { label: 'CBDV', fullName: 'Cannabidivarin', patterns: ['cannabidivarin', 'cbdv'], color: 'teal' },
  'Delta-8': { label: 'Delta-8 THC', fullName: 'Delta-8-Tetrahydrocannabinol', patterns: ['delta-8-thc', 'delta-8 thc'], color: 'pink' },
  THCA: { label: 'THCA', fullName: 'Tetrahydrocannabinolic acid', patterns: ['tetrahydrocannabinolic acid', 'thca'], color: 'indigo' },
  CBDA: { label: 'CBDA', fullName: 'Cannabidiolic acid', patterns: ['cannabidiolic acid', 'cbda'], color: 'lime' }
} as const;

export type CannabinoidKey = keyof typeof CANNABINOIDS;

// Condition badge colors (Tailwind classes)
export const CONDITION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  anxiety: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  depression: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  ptsd: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
  sleep: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  epilepsy: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  parkinsons: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  alzheimers: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  autism: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  adhd: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  schizophrenia: { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
  addiction: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  tourettes: { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200' },
  chronic_pain: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  neuropathic_pain: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  arthritis: { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-200' },
  fibromyalgia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-200' },
  ms: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  inflammation: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  migraines: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  crohns: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  ibs: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  nausea: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  cancer: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  chemo_side_effects: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  acne: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  psoriasis: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  eczema: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  heart: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  blood_pressure: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  diabetes: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  obesity: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  athletic: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  veterinary: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
};
