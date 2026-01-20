/**
 * Comprehensive Cannabinoid Data
 *
 * This file contains structured data for all cannabinoids featured on the site.
 * Used by the Cannabinoid Hub page for displaying cards, tables, and filters.
 */

export type CannabinoidType = 'major' | 'minor' | 'acidic' | 'synthetic' | 'rare';
export type CannabinoidFamily = 'CBD-type' | 'THC-type' | 'CBG-type' | 'CBN-type' | 'CBC-type' | 'other';
export type LegalStatus = 'federally-legal' | 'legal-most-states' | 'state-varies' | 'restricted';
export type ResearchLevel = 'extensive' | 'moderate' | 'emerging' | 'limited';
export type PrimaryEffect = 'calm' | 'sleep' | 'focus' | 'energy' | 'pain' | 'mood' | 'appetite' | 'nausea' | 'inflammation';
export type SafetyTier = 'safe' | 'moderate' | 'caution' | 'high-risk';

export interface Cannabinoid {
  // Identity
  abbreviation: string;
  fullName: string;
  slug: string;

  // Classification
  type: CannabinoidType;
  family: CannabinoidFamily;
  parentCompound?: string; // e.g., CBDA's parent is CBD

  // Key Properties
  psychoactive: boolean;
  intoxicating: boolean; // Distinction: CBD is psychoactive but not intoxicating
  legalStatus: LegalStatus;

  // Effects
  primaryEffects: PrimaryEffect[];
  effectStrength: Record<PrimaryEffect, number>; // 1-5 scale

  // Research
  researchLevel: ResearchLevel;
  yearDiscovered?: number;

  // Safety
  safetyTier: SafetyTier;

  // Content
  tagline: string;
  shortDescription: string;
  keyBenefits: string[];
  considerations: string[];

  // Relationships
  relatedCannabinoids: string[]; // slugs
  convertedFrom?: string; // e.g., CBD is converted from CBDA

  // Links (slugs)
  glossarySlug?: string;
  articleSlugs?: string[];
}

// Effect metadata for UI
export const EFFECT_META: Record<PrimaryEffect, { icon: string; label: string; color: string }> = {
  calm: { icon: '😌', label: 'Calming', color: 'blue' },
  sleep: { icon: '😴', label: 'Sleep', color: 'indigo' },
  focus: { icon: '🎯', label: 'Focus', color: 'amber' },
  energy: { icon: '⚡', label: 'Energy', color: 'yellow' },
  pain: { icon: '💪', label: 'Pain Relief', color: 'red' },
  mood: { icon: '😊', label: 'Mood', color: 'pink' },
  appetite: { icon: '🍽️', label: 'Appetite', color: 'orange' },
  nausea: { icon: '🤢', label: 'Anti-nausea', color: 'green' },
  inflammation: { icon: '🔥', label: 'Anti-inflammatory', color: 'rose' },
};

// Legal status metadata
export const LEGAL_STATUS_META: Record<LegalStatus, { label: string; color: string; description: string }> = {
  'federally-legal': {
    label: 'Federally Legal',
    color: 'green',
    description: 'Legal under the 2018 Farm Bill when derived from hemp (<0.3% THC)'
  },
  'legal-most-states': {
    label: 'Legal in Most States',
    color: 'emerald',
    description: 'Legal in most US states, some restrictions may apply'
  },
  'state-varies': {
    label: 'Varies by State',
    color: 'amber',
    description: 'Legal status varies significantly by state - check local laws'
  },
  'restricted': {
    label: 'Restricted',
    color: 'red',
    description: 'Federally restricted or controlled substance in many jurisdictions'
  },
};

// Research level metadata
export const RESEARCH_LEVEL_META: Record<ResearchLevel, { label: string; stars: number; description: string }> = {
  extensive: {
    label: 'Extensive Research',
    stars: 5,
    description: '1000+ published studies, including large clinical trials'
  },
  moderate: {
    label: 'Moderate Research',
    stars: 3,
    description: '100-1000 studies, some clinical evidence'
  },
  emerging: {
    label: 'Emerging Research',
    stars: 2,
    description: '10-100 studies, mostly preclinical'
  },
  limited: {
    label: 'Limited Research',
    stars: 1,
    description: 'Few studies available, early-stage research'
  },
};

// Type metadata
export const TYPE_META: Record<CannabinoidType, { label: string; color: string; bgGradient: string }> = {
  major: {
    label: 'Major Cannabinoid',
    color: 'green',
    bgGradient: 'from-green-500 to-emerald-600'
  },
  minor: {
    label: 'Minor Cannabinoid',
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600'
  },
  acidic: {
    label: 'Acidic Form',
    color: 'orange',
    bgGradient: 'from-orange-500 to-amber-600'
  },
  synthetic: {
    label: 'Synthetic/Novel',
    color: 'purple',
    bgGradient: 'from-purple-500 to-violet-600'
  },
  rare: {
    label: 'Rare/Research',
    color: 'slate',
    bgGradient: 'from-slate-500 to-gray-600'
  },
};

// Safety tier metadata
export const SAFETY_TIER_META: Record<SafetyTier, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
}> = {
  safe: {
    label: 'Well Researched',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '✓',
    description: 'Extensive research, federally legal, well-established safety profile'
  },
  moderate: {
    label: 'Moderate Research',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '◐',
    description: 'Some research available, generally considered safe, legal in most areas'
  },
  caution: {
    label: 'Use Caution',
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: '⚠',
    description: 'Limited research, legal status varies, exercise caution'
  },
  'high-risk': {
    label: 'High Risk',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '⛔',
    description: 'Very limited research, potential safety concerns, legal restrictions likely'
  },
};

// Cannabinoid stacks (popular combinations)
export interface CannabinoidStack {
  id: string;
  name: string;
  goal: string;
  icon: string;
  cannabinoids: string[]; // slugs
  description: string;
  ratio?: string;
}

export const CANNABINOID_STACKS: CannabinoidStack[] = [
  {
    id: 'sleep',
    name: 'Sleep Stack',
    goal: 'Better Sleep',
    icon: '🌙',
    cannabinoids: ['cbd', 'cbn', 'thc'],
    description: 'CBD for relaxation, CBN for sedation, low-dose THC to enhance effects',
    ratio: '3:2:1'
  },
  {
    id: 'focus',
    name: 'Focus Stack',
    goal: 'Mental Clarity',
    icon: '🎯',
    cannabinoids: ['cbd', 'cbg', 'thcv'],
    description: 'CBG for focus, THCV for energy, CBD to balance',
    ratio: '2:2:1'
  },
  {
    id: 'pain',
    name: 'Pain Relief Stack',
    goal: 'Pain Management',
    icon: '💪',
    cannabinoids: ['cbd', 'cbc', 'thc'],
    description: 'Full spectrum approach targeting multiple pain pathways',
    ratio: '2:1:1'
  },
  {
    id: 'wellness',
    name: 'Daily Wellness Stack',
    goal: 'Overall Balance',
    icon: '☀️',
    cannabinoids: ['cbd', 'cbg', 'cbc', 'cbn'],
    description: 'Non-intoxicating full spectrum for entourage effect',
    ratio: '4:2:1:1'
  },
  {
    id: 'mood',
    name: 'Mood Support Stack',
    goal: 'Emotional Balance',
    icon: '😊',
    cannabinoids: ['cbd', 'cbg', 'cbc'],
    description: 'Uplifting and mood-stabilizing without intoxication',
    ratio: '3:2:1'
  },
  {
    id: 'recovery',
    name: 'Recovery Stack',
    goal: 'Post-Workout',
    icon: '🏃',
    cannabinoids: ['cbd', 'cbc', 'cbda'],
    description: 'Anti-inflammatory focus for faster recovery',
    ratio: '3:1:1'
  },
];

/**
 * Complete Cannabinoid Database
 */
export const CANNABINOIDS: Cannabinoid[] = [
  // ============ MAJOR CANNABINOIDS ============
  {
    abbreviation: 'CBD',
    fullName: 'Cannabidiol',
    slug: 'cbd',
    type: 'major',
    family: 'CBD-type',
    psychoactive: true, // Affects mood/anxiety but...
    intoxicating: false, // ...doesn't cause a "high"
    legalStatus: 'federally-legal',
    primaryEffects: ['calm', 'pain', 'sleep', 'inflammation'],
    effectStrength: { calm: 5, sleep: 3, focus: 2, energy: 1, pain: 4, mood: 4, appetite: 1, nausea: 2, inflammation: 4 },
    researchLevel: 'extensive',
    yearDiscovered: 1940,
    safetyTier: 'safe',
    tagline: 'The wellness cannabinoid',
    shortDescription: 'The most popular non-intoxicating cannabinoid, CBD is widely used for relaxation, sleep support, and managing everyday stress without any "high" effect.',
    keyBenefits: [
      'Non-intoxicating - no "high" effect',
      'Extensively researched for anxiety and stress',
      'May support healthy sleep cycles',
      'Anti-inflammatory properties',
      'FDA-approved for certain epilepsies (Epidiolex)',
    ],
    considerations: [
      'May interact with certain medications',
      'Effects can take 2-4 weeks of consistent use',
      'Quality varies widely between products',
    ],
    relatedCannabinoids: ['cbda', 'cbg', 'cbn'],
    convertedFrom: 'cbda',
    glossarySlug: 'cbd',
    articleSlugs: ['what-is-cbd', 'cbd-benefits', 'cbd-vs-thc'],
  },
  {
    abbreviation: 'THC',
    fullName: 'Delta-9-Tetrahydrocannabinol',
    slug: 'thc',
    type: 'major',
    family: 'THC-type',
    psychoactive: true,
    intoxicating: true,
    legalStatus: 'state-varies',
    primaryEffects: ['mood', 'pain', 'appetite', 'nausea', 'sleep'],
    effectStrength: { calm: 3, sleep: 4, focus: 1, energy: 2, pain: 5, mood: 5, appetite: 5, nausea: 5, inflammation: 3 },
    researchLevel: 'extensive',
    yearDiscovered: 1964,
    safetyTier: 'moderate',
    tagline: 'The primary psychoactive cannabinoid',
    shortDescription: 'The main intoxicating compound in cannabis, THC produces the classic "high" and has significant medical applications for pain, nausea, and appetite stimulation.',
    keyBenefits: [
      'Powerful pain relief properties',
      'Effective anti-nausea (FDA-approved: Marinol)',
      'Appetite stimulation for medical conditions',
      'May help with PTSD symptoms',
      'Studied for multiple sclerosis spasticity',
    ],
    considerations: [
      'Causes intoxication - affects coordination and cognition',
      'May increase anxiety in some individuals',
      'Legal restrictions in many jurisdictions',
      'Can cause dependence with heavy use',
    ],
    relatedCannabinoids: ['thca', 'delta-8-thc', 'thcv'],
    convertedFrom: 'thca',
    glossarySlug: 'thc',
    articleSlugs: ['cbd-vs-thc', 'thc-effects'],
  },
  {
    abbreviation: 'CBG',
    fullName: 'Cannabigerol',
    slug: 'cbg',
    type: 'major',
    family: 'CBG-type',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['focus', 'mood', 'inflammation', 'pain'],
    effectStrength: { calm: 3, sleep: 1, focus: 4, energy: 3, pain: 3, mood: 4, appetite: 2, nausea: 2, inflammation: 4 },
    researchLevel: 'emerging',
    yearDiscovered: 1964,
    safetyTier: 'safe',
    tagline: 'The mother cannabinoid',
    shortDescription: 'Known as the "mother cannabinoid" because other cannabinoids are synthesized from it. CBG shows promise for focus, mood support, and inflammation without any intoxicating effects.',
    keyBenefits: [
      'Precursor to CBD, THC, and other cannabinoids',
      'May support focus and mental clarity',
      'Preliminary antibacterial properties',
      'Non-intoxicating',
      'May support eye health (intraocular pressure)',
    ],
    considerations: [
      'More expensive due to low plant concentrations',
      'Research still in early stages',
      'Best combined with other cannabinoids',
    ],
    relatedCannabinoids: ['cbd', 'cbc', 'cbga'],
    glossarySlug: 'cbg',
    articleSlugs: ['what-is-cbg'],
  },
  {
    abbreviation: 'CBN',
    fullName: 'Cannabinol',
    slug: 'cbn',
    type: 'minor',
    family: 'CBN-type',
    psychoactive: false,
    intoxicating: false, // Very mildly at high doses
    legalStatus: 'federally-legal',
    primaryEffects: ['sleep', 'calm', 'pain'],
    effectStrength: { calm: 4, sleep: 5, focus: 1, energy: 0, pain: 3, mood: 2, appetite: 2, nausea: 1, inflammation: 2 },
    researchLevel: 'emerging',
    yearDiscovered: 1896,
    safetyTier: 'safe',
    tagline: 'The sleep cannabinoid',
    shortDescription: 'Formed when THC ages and oxidizes, CBN is most known for its sedative properties. Often called the "sleepy cannabinoid," it\'s popular in nighttime formulas.',
    keyBenefits: [
      'Strong sedative reputation - popular for sleep',
      'May extend sleep duration',
      'Gentle, non-intoxicating effects',
      'Works well combined with CBD for sleep',
      'First cannabinoid to be isolated (1896)',
    ],
    considerations: [
      'Sedative claims need more research validation',
      'Effects may be from aged terpenes, not just CBN',
      'Lower potency than CBD or THC',
    ],
    relatedCannabinoids: ['thc', 'cbd', 'cbc'],
    glossarySlug: 'cbn',
    articleSlugs: ['what-is-cbn', 'cbn-for-sleep'],
  },
  {
    abbreviation: 'CBC',
    fullName: 'Cannabichromene',
    slug: 'cbc',
    type: 'minor',
    family: 'CBC-type',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['mood', 'pain', 'inflammation'],
    effectStrength: { calm: 3, sleep: 2, focus: 2, energy: 1, pain: 4, mood: 4, appetite: 1, nausea: 1, inflammation: 5 },
    researchLevel: 'emerging',
    yearDiscovered: 1966,
    safetyTier: 'safe',
    tagline: 'The mood and inflammation cannabinoid',
    shortDescription: 'One of the "big six" cannabinoids, CBC shows particular promise for mood support and inflammation. It may enhance the effects of other cannabinoids through the entourage effect.',
    keyBenefits: [
      'Potent anti-inflammatory in studies',
      'May support mood and brain health',
      'Enhances effects of other cannabinoids',
      'Non-intoxicating',
      'Third most abundant cannabinoid in some strains',
    ],
    considerations: [
      'Less studied than CBD or THC',
      'Rarely sold as isolate - usually in full spectrum',
      'Research mostly preclinical',
    ],
    relatedCannabinoids: ['cbd', 'cbg', 'thc'],
    glossarySlug: 'cbc',
    articleSlugs: ['what-is-cbc'],
  },

  // ============ ACIDIC FORMS ============
  {
    abbreviation: 'CBDA',
    fullName: 'Cannabidiolic Acid',
    slug: 'cbda',
    type: 'acidic',
    family: 'CBD-type',
    parentCompound: 'cbd',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['nausea', 'inflammation', 'calm'],
    effectStrength: { calm: 4, sleep: 2, focus: 2, energy: 1, pain: 3, mood: 3, appetite: 1, nausea: 5, inflammation: 5 },
    researchLevel: 'emerging',
    safetyTier: 'safe',
    tagline: 'The raw, unheated form of CBD',
    shortDescription: 'The acidic precursor to CBD found in raw cannabis. CBDA converts to CBD when heated (decarboxylation). Early research suggests it may be more potent than CBD for certain applications.',
    keyBenefits: [
      'May be more bioavailable than CBD',
      'Strong anti-nausea potential (research ongoing)',
      'Potent anti-inflammatory in studies',
      'Found in raw/unheated cannabis products',
      'May enhance CBD effectiveness',
    ],
    considerations: [
      'Unstable - converts to CBD with heat/time',
      'Requires special extraction and storage',
      'Less available than CBD products',
    ],
    relatedCannabinoids: ['cbd', 'cbga', 'thca'],
    glossarySlug: 'cbda',
    articleSlugs: ['raw-vs-decarboxylated-cannabinoids'],
  },
  {
    abbreviation: 'THCA',
    fullName: 'Tetrahydrocannabinolic Acid',
    slug: 'thca',
    type: 'acidic',
    family: 'THC-type',
    parentCompound: 'thc',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'state-varies', // Gray area - converts to THC
    primaryEffects: ['inflammation', 'nausea', 'pain'],
    effectStrength: { calm: 2, sleep: 2, focus: 1, energy: 1, pain: 4, mood: 2, appetite: 1, nausea: 4, inflammation: 5 },
    researchLevel: 'emerging',
    safetyTier: 'caution',
    tagline: 'The non-intoxicating precursor to THC',
    shortDescription: 'Found in raw cannabis, THCA doesn\'t cause intoxication until heated (converting to THC). Gaining interest for anti-inflammatory and neuroprotective properties.',
    keyBenefits: [
      'Non-intoxicating in raw form',
      'Strong anti-inflammatory potential',
      'May support neuroprotection',
      'Anti-nausea properties',
      'Found abundantly in fresh cannabis',
    ],
    considerations: [
      'Easily converts to THC with heat',
      'Legal gray area in some jurisdictions',
      'Requires careful handling and storage',
    ],
    relatedCannabinoids: ['thc', 'cbda', 'cbga'],
    glossarySlug: 'thca',
    articleSlugs: ['raw-vs-decarboxylated-cannabinoids', 'thca-guide'],
  },
  {
    abbreviation: 'CBGA',
    fullName: 'Cannabigerolic Acid',
    slug: 'cbga',
    type: 'acidic',
    family: 'CBG-type',
    parentCompound: 'cbg',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['inflammation', 'mood'],
    effectStrength: { calm: 2, sleep: 1, focus: 2, energy: 1, pain: 2, mood: 3, appetite: 1, nausea: 1, inflammation: 4 },
    researchLevel: 'limited',
    safetyTier: 'moderate',
    tagline: 'The ultimate parent cannabinoid',
    shortDescription: 'The acidic precursor to CBG and the starting point for all other cannabinoids. Called the "stem cell" or "grandfather" cannabinoid.',
    keyBenefits: [
      'Precursor to all other cannabinoids',
      'Early metabolic studies show promise',
      'Non-intoxicating',
      'Rare but increasingly available',
    ],
    considerations: [
      'Very limited research',
      'Unstable and converts easily',
      'Expensive and hard to source',
    ],
    relatedCannabinoids: ['cbg', 'cbda', 'thca'],
    glossarySlug: 'cbga',
  },

  // ============ MINOR & NOVEL CANNABINOIDS ============
  {
    abbreviation: 'THCV',
    fullName: 'Tetrahydrocannabivarin',
    slug: 'thcv',
    type: 'minor',
    family: 'THC-type',
    psychoactive: true,
    intoxicating: true, // At high doses
    legalStatus: 'state-varies',
    primaryEffects: ['energy', 'focus', 'appetite'],
    effectStrength: { calm: 1, sleep: 0, focus: 5, energy: 5, pain: 2, mood: 3, appetite: -3, nausea: 2, inflammation: 2 }, // Negative = suppresses
    researchLevel: 'emerging',
    safetyTier: 'caution',
    tagline: 'The energizing, appetite-suppressing cannabinoid',
    shortDescription: 'A unique cannabinoid that provides energy and focus while potentially suppressing appetite - the opposite of THC\'s "munchies." Popular for daytime use and weight management.',
    keyBenefits: [
      'May suppress appetite (opposite of THC)',
      'Energizing and focusing effects',
      'Shorter duration than THC',
      'May help regulate blood sugar',
      'Clear-headed experience',
    ],
    considerations: [
      'Can be intoxicating at higher doses',
      'Effects vary significantly by dose',
      'Rare and expensive',
      'Legal status unclear in some areas',
    ],
    relatedCannabinoids: ['thc', 'cbdv', 'cbg'],
    glossarySlug: 'thcv',
    articleSlugs: ['what-is-thcv'],
  },
  {
    abbreviation: 'CBDV',
    fullName: 'Cannabidivarin',
    slug: 'cbdv',
    type: 'minor',
    family: 'CBD-type',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['nausea', 'calm'],
    effectStrength: { calm: 3, sleep: 2, focus: 2, energy: 1, pain: 2, mood: 2, appetite: 1, nausea: 4, inflammation: 3 },
    researchLevel: 'emerging',
    safetyTier: 'moderate',
    tagline: 'CBD\'s lesser-known cousin',
    shortDescription: 'A close relative of CBD with similar non-intoxicating properties. Being researched for nausea relief and potential neurological applications.',
    keyBenefits: [
      'Non-intoxicating like CBD',
      'Being studied for nausea relief',
      'Potential neurological benefits',
      'May work synergistically with CBD',
    ],
    considerations: [
      'Limited research and availability',
      'Rarely found in high concentrations',
      'Often present only in full spectrum products',
    ],
    relatedCannabinoids: ['cbd', 'thcv', 'cbg'],
    glossarySlug: 'cbdv',
  },
  {
    abbreviation: 'Delta-8',
    fullName: 'Delta-8-Tetrahydrocannabinol',
    slug: 'delta-8-thc',
    type: 'synthetic', // Often synthesized from CBD
    family: 'THC-type',
    psychoactive: true,
    intoxicating: true,
    legalStatus: 'state-varies',
    primaryEffects: ['calm', 'mood', 'pain', 'appetite'],
    effectStrength: { calm: 4, sleep: 3, focus: 2, energy: 1, pain: 3, mood: 4, appetite: 4, nausea: 3, inflammation: 2 },
    researchLevel: 'limited',
    safetyTier: 'caution',
    tagline: 'The milder THC alternative',
    shortDescription: 'A THC isomer that produces milder intoxication than Delta-9 THC. Often synthesized from CBD, it exists in a legal gray area and has become popular as a "legal high."',
    keyBenefits: [
      'Milder intoxication than Delta-9 THC',
      'May cause less anxiety than Delta-9',
      'Similar benefits with reduced intensity',
      'Widely available in many states',
    ],
    considerations: [
      'Legal status rapidly changing',
      'Often synthetically derived',
      'Quality control concerns',
      'Still intoxicating - impairs driving',
      'May not pass drug tests',
    ],
    relatedCannabinoids: ['thc', 'delta-10-thc', 'hhc'],
    glossarySlug: 'delta-8-thc',
    articleSlugs: ['delta-8-vs-delta-9'],
  },

  // ============ SYNTHETIC & NOVEL CANNABINOIDS ============
  {
    abbreviation: 'HHC',
    fullName: 'Hexahydrocannabinol',
    slug: 'hhc',
    type: 'synthetic',
    family: 'THC-type',
    psychoactive: true,
    intoxicating: true,
    legalStatus: 'state-varies',
    primaryEffects: ['mood', 'calm', 'pain'],
    effectStrength: { calm: 4, sleep: 3, focus: 2, energy: 2, pain: 3, mood: 4, appetite: 3, nausea: 2, inflammation: 2 },
    researchLevel: 'limited',
    safetyTier: 'caution',
    tagline: 'The hydrogenated THC variant',
    shortDescription: 'A hydrogenated form of THC that occurs naturally in trace amounts but is typically synthesized. HHC offers THC-like effects with a potentially longer shelf life and contested legal status.',
    keyBenefits: [
      'Similar relaxation to Delta-9 THC',
      'More stable molecule - longer shelf life',
      'May produce less anxiety than Delta-9',
      'Milder effects for some users',
    ],
    considerations: [
      'Very limited research on safety',
      'Typically synthetically produced',
      'Legal status rapidly changing',
      'Quality varies widely between products',
      'May fail drug tests',
    ],
    relatedCannabinoids: ['thc', 'delta-8-thc', 'delta-10-thc'],
    glossarySlug: 'hhc',
  },
  {
    abbreviation: 'THC-O',
    fullName: 'THC-O-Acetate',
    slug: 'thc-o',
    type: 'synthetic',
    family: 'THC-type',
    psychoactive: true,
    intoxicating: true,
    legalStatus: 'restricted',
    primaryEffects: ['mood', 'calm', 'pain'],
    effectStrength: { calm: 3, sleep: 4, focus: 1, energy: 1, pain: 4, mood: 5, appetite: 4, nausea: 3, inflammation: 2 },
    researchLevel: 'limited',
    safetyTier: 'high-risk',
    tagline: 'The potent synthetic THC acetate',
    shortDescription: 'A synthetic acetate ester of THC, reported to be 2-3x more potent than Delta-9 THC. THC-O is entirely lab-made and raises significant safety and legal concerns.',
    keyBenefits: [
      'Reported stronger effects than THC',
      'Some users report more "psychedelic" experience',
    ],
    considerations: [
      'No natural occurrence - fully synthetic',
      'DEA has stated it is federally illegal',
      'No safety research available',
      'Acetate compounds may pose respiratory risks',
      'Production process involves hazardous chemicals',
      'Not recommended - significant safety concerns',
    ],
    relatedCannabinoids: ['thc', 'delta-8-thc', 'thcp'],
    glossarySlug: 'thc-o',
  },
  {
    abbreviation: 'Delta-10',
    fullName: 'Delta-10-Tetrahydrocannabinol',
    slug: 'delta-10-thc',
    type: 'synthetic',
    family: 'THC-type',
    psychoactive: true,
    intoxicating: true,
    legalStatus: 'state-varies',
    primaryEffects: ['energy', 'focus', 'mood'],
    effectStrength: { calm: 2, sleep: 1, focus: 4, energy: 4, pain: 2, mood: 4, appetite: 2, nausea: 2, inflammation: 1 },
    researchLevel: 'limited',
    safetyTier: 'caution',
    tagline: 'The energizing THC isomer',
    shortDescription: 'A THC isomer typically synthesized from CBD. Delta-10 is known for more energizing, uplifting effects compared to Delta-8 or Delta-9, making it popular for daytime use.',
    keyBenefits: [
      'Reported energizing effects',
      'May enhance focus and creativity',
      'Generally milder than Delta-9',
      'Less anxiety than other THC forms for some',
    ],
    considerations: [
      'Almost always synthetically produced',
      'Very limited safety research',
      'Legal status uncertain',
      'Quality control issues with some products',
      'May fail drug tests',
    ],
    relatedCannabinoids: ['thc', 'delta-8-thc', 'hhc'],
    glossarySlug: 'delta-10-thc',
  },
  {
    abbreviation: 'THCP',
    fullName: 'Tetrahydrocannabiphorol',
    slug: 'thcp',
    type: 'minor',
    family: 'THC-type',
    psychoactive: true,
    intoxicating: true,
    legalStatus: 'state-varies',
    primaryEffects: ['pain', 'mood', 'sleep'],
    effectStrength: { calm: 4, sleep: 5, focus: 1, energy: 1, pain: 5, mood: 5, appetite: 5, nausea: 4, inflammation: 3 },
    researchLevel: 'limited',
    yearDiscovered: 2019,
    safetyTier: 'high-risk',
    tagline: 'The ultra-potent natural cannabinoid',
    shortDescription: 'Discovered in 2019, THCP naturally occurs in trace amounts and has a longer alkyl chain, allowing it to bind CB1 receptors 33x more efficiently than THC. Extreme potency requires caution.',
    keyBenefits: [
      'Naturally occurring (though rare)',
      'May explain varying effects between strains',
      'Strong potential for pain management',
    ],
    considerations: [
      'Extremely potent - 33x THC receptor binding',
      'Very little safety data',
      'Easy to overconsume',
      'Legal gray area',
      'Not recommended for inexperienced users',
    ],
    relatedCannabinoids: ['thc', 'thcv', 'cbdp'],
    glossarySlug: 'thcp',
  },

  // ============ VARIN CANNABINOIDS ============
  {
    abbreviation: 'CBGV',
    fullName: 'Cannabigerovarin',
    slug: 'cbgv',
    type: 'minor',
    family: 'CBG-type',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['inflammation', 'mood'],
    effectStrength: { calm: 2, sleep: 1, focus: 3, energy: 2, pain: 2, mood: 3, appetite: 1, nausea: 1, inflammation: 3 },
    researchLevel: 'limited',
    safetyTier: 'moderate',
    tagline: 'The varin form of CBG',
    shortDescription: 'The propyl (varin) analogue of CBG with a shorter side chain. Like CBG, it serves as a precursor to other varin cannabinoids and shows early promise for similar applications.',
    keyBenefits: [
      'Non-intoxicating',
      'May enhance skin health',
      'Precursor to THCV and CBDV',
      'Early anti-inflammatory potential',
    ],
    considerations: [
      'Very limited research',
      'Rare in most cannabis strains',
      'Difficult to source',
    ],
    relatedCannabinoids: ['cbg', 'thcv', 'cbdv'],
    glossarySlug: 'cbgv',
  },
  {
    abbreviation: 'CBCV',
    fullName: 'Cannabichromevarin',
    slug: 'cbcv',
    type: 'minor',
    family: 'CBC-type',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['inflammation', 'mood'],
    effectStrength: { calm: 2, sleep: 1, focus: 1, energy: 1, pain: 2, mood: 3, appetite: 1, nausea: 1, inflammation: 3 },
    researchLevel: 'limited',
    safetyTier: 'moderate',
    tagline: 'The varin form of CBC',
    shortDescription: 'The propyl analogue of CBC, CBCV has a shorter carbon side chain. Early research suggests it may share CBC\'s anti-inflammatory properties but with potentially different pharmacokinetics.',
    keyBenefits: [
      'Non-intoxicating',
      'Potential mood support',
      'Anti-inflammatory potential',
      'May contribute to entourage effect',
    ],
    considerations: [
      'Very limited research',
      'Extremely rare cannabinoid',
      'Not commercially available',
    ],
    relatedCannabinoids: ['cbc', 'cbdv', 'cbgv'],
    glossarySlug: 'cbcv',
  },

  // ============ ADDITIONAL ACIDIC FORMS ============
  {
    abbreviation: 'CBCA',
    fullName: 'Cannabichromenic Acid',
    slug: 'cbca',
    type: 'acidic',
    family: 'CBC-type',
    parentCompound: 'cbc',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['inflammation', 'pain'],
    effectStrength: { calm: 2, sleep: 1, focus: 1, energy: 1, pain: 3, mood: 2, appetite: 1, nausea: 2, inflammation: 4 },
    researchLevel: 'limited',
    safetyTier: 'moderate',
    tagline: 'The raw form of CBC',
    shortDescription: 'The acidic precursor to CBC found in raw cannabis. CBCA decarboxylates to CBC when heated and may have its own therapeutic potential in raw form.',
    keyBenefits: [
      'Non-intoxicating',
      'Found in raw cannabis',
      'Potential anti-inflammatory properties',
      'May be more bioavailable than CBC',
    ],
    considerations: [
      'Unstable - converts to CBC with heat',
      'Very limited research',
      'Requires careful extraction',
    ],
    relatedCannabinoids: ['cbc', 'cbda', 'cbga'],
    glossarySlug: 'cbca',
  },
  {
    abbreviation: 'CBNA',
    fullName: 'Cannabinolic Acid',
    slug: 'cbna',
    type: 'acidic',
    family: 'CBN-type',
    parentCompound: 'cbn',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['sleep', 'calm'],
    effectStrength: { calm: 3, sleep: 3, focus: 1, energy: 0, pain: 2, mood: 1, appetite: 1, nausea: 1, inflammation: 2 },
    researchLevel: 'limited',
    safetyTier: 'moderate',
    tagline: 'The acidic form of CBN',
    shortDescription: 'CBNA forms when THCA oxidizes over time and decarboxylates to CBN when heated. Found in aged cannabis, it may have sedative potential even before conversion.',
    keyBenefits: [
      'Non-intoxicating',
      'May support sleep before conversion to CBN',
      'Found in aged cannabis',
    ],
    considerations: [
      'Very limited research',
      'Forms through degradation',
      'Unstable compound',
    ],
    relatedCannabinoids: ['cbn', 'thca', 'cbda'],
    glossarySlug: 'cbna',
  },

  // ============ RARE CANNABINOIDS ============
  {
    abbreviation: 'CBE',
    fullName: 'Cannabielsoin',
    slug: 'cbe',
    type: 'rare',
    family: 'CBD-type',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['inflammation'],
    effectStrength: { calm: 1, sleep: 1, focus: 1, energy: 1, pain: 2, mood: 1, appetite: 1, nausea: 1, inflammation: 2 },
    researchLevel: 'limited',
    safetyTier: 'moderate',
    tagline: 'The CBD metabolite',
    shortDescription: 'CBE is a metabolite of CBD, formed when CBD is processed by the body. It\'s found in trace amounts in cannabis and is one of the least studied cannabinoids.',
    keyBenefits: [
      'Non-intoxicating',
      'Natural CBD metabolite',
    ],
    considerations: [
      'Almost no research available',
      'Not commercially available',
      'Unknown therapeutic profile',
    ],
    relatedCannabinoids: ['cbd', 'cbl', 'cbt'],
    glossarySlug: 'cbe',
  },
  {
    abbreviation: 'CBL',
    fullName: 'Cannabicyclol',
    slug: 'cbl',
    type: 'rare',
    family: 'other',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['inflammation'],
    effectStrength: { calm: 1, sleep: 1, focus: 1, energy: 1, pain: 1, mood: 1, appetite: 1, nausea: 1, inflammation: 2 },
    researchLevel: 'limited',
    safetyTier: 'moderate',
    tagline: 'The light-converted cannabinoid',
    shortDescription: 'CBL forms when CBC is exposed to light and heat over time. It\'s found in aged or improperly stored cannabis and is one of the lesser-known degradation products.',
    keyBenefits: [
      'Non-intoxicating',
      'Non-psychoactive',
    ],
    considerations: [
      'Minimal research available',
      'Forms through degradation',
      'No known therapeutic uses established',
    ],
    relatedCannabinoids: ['cbc', 'cbn', 'cbt'],
    glossarySlug: 'cbl',
  },
  {
    abbreviation: 'CBT',
    fullName: 'Cannabitriol',
    slug: 'cbt',
    type: 'rare',
    family: 'other',
    psychoactive: false,
    intoxicating: false,
    legalStatus: 'federally-legal',
    primaryEffects: ['inflammation'],
    effectStrength: { calm: 1, sleep: 1, focus: 1, energy: 1, pain: 1, mood: 1, appetite: 1, nausea: 1, inflammation: 2 },
    researchLevel: 'limited',
    yearDiscovered: 1966,
    safetyTier: 'moderate',
    tagline: 'The obscure triol cannabinoid',
    shortDescription: 'One of the rarest cannabinoids, CBT was first identified in 1966. It\'s structurally similar to THC but non-intoxicating. Research is extremely limited.',
    keyBenefits: [
      'Non-intoxicating',
      'Naturally occurring',
    ],
    considerations: [
      'Almost no research available',
      'Unknown therapeutic profile',
      'Not commercially available',
    ],
    relatedCannabinoids: ['thc', 'cbl', 'cbe'],
    glossarySlug: 'cbt',
  },
];

// ============ HELPER FUNCTIONS ============

/**
 * Get cannabinoids by type
 */
export function getCannabinoidsByType(type: CannabinoidType): Cannabinoid[] {
  return CANNABINOIDS.filter(c => c.type === type);
}

/**
 * Get cannabinoids by primary effect
 */
export function getCannabinoidsByEffect(effect: PrimaryEffect): Cannabinoid[] {
  return CANNABINOIDS.filter(c => c.primaryEffects.includes(effect))
    .sort((a, b) => (b.effectStrength[effect] || 0) - (a.effectStrength[effect] || 0));
}

/**
 * Get major cannabinoids (featured)
 */
export function getMajorCannabinoids(): Cannabinoid[] {
  return CANNABINOIDS.filter(c => c.type === 'major' || (c.type === 'minor' && ['cbn', 'cbc'].includes(c.slug)));
}

/**
 * Get cannabinoid by slug
 */
export function getCannabinoidBySlug(slug: string): Cannabinoid | undefined {
  return CANNABINOIDS.find(c => c.slug === slug);
}

/**
 * Get non-intoxicating cannabinoids
 */
export function getNonIntoxicatingCannabinoids(): Cannabinoid[] {
  return CANNABINOIDS.filter(c => !c.intoxicating);
}

/**
 * Get cannabinoids grouped by effect
 */
export function getCannabinoidsByEffectGrouped(): Record<PrimaryEffect, Cannabinoid[]> {
  const effects: PrimaryEffect[] = ['sleep', 'calm', 'focus', 'energy', 'pain', 'mood', 'inflammation', 'nausea', 'appetite'];
  const grouped: Record<PrimaryEffect, Cannabinoid[]> = {} as Record<PrimaryEffect, Cannabinoid[]>;

  effects.forEach(effect => {
    grouped[effect] = getCannabinoidsByEffect(effect).slice(0, 4); // Top 4 for each
  });

  return grouped;
}

/**
 * Get related cannabinoids for a given slug
 */
export function getRelatedCannabinoids(slug: string): Cannabinoid[] {
  const cannabinoid = getCannabinoidBySlug(slug);
  if (!cannabinoid) return [];

  return cannabinoid.relatedCannabinoids
    .map(s => getCannabinoidBySlug(s))
    .filter((c): c is Cannabinoid => c !== undefined);
}
