/**
 * Conversation Memory for CBD Chat
 * Extracts and maintains context from conversation history
 * to provide personalized, contextual responses
 */

import type { ChatMessage } from './types';

/**
 * Context extracted from the conversation
 */
export interface ConversationContext {
  mentionedConditions: string[];
  mentionedMedications: string[];
  userWeight?: string;
  userExperience?: 'new' | 'some' | 'regular';
  preferredFormat?: string;
  primaryConcern?: string;
  mentionedSymptoms: string[];
  previousIntents: string[];
  questionsAsked: number;
  lastTopics: string[];
}

/**
 * Condition patterns for extraction
 */
const CONDITION_PATTERNS: Record<string, RegExp[]> = {
  anxiety: [/\banxi(?:ety|ous)\b/i, /\bworr(?:y|ied)\b/i, /\bstress(?:ed)?\b/i, /\bpanic\b/i, /\bgad\b/i, /\bnervous(?:ness)?\b/i],
  sleep: [/\bsleep\b/i, /\binsomnia\b/i, /\btired\b/i, /\bfatigue\b/i, /\brest(?:less)?\b/i, /\bcircadian\b/i],
  pain: [/\bpain\b/i, /\bach(?:e|ing)\b/i, /\bhurt(?:s|ing)?\b/i, /\bsore(?:ness)?\b/i, /\bdiscomfort\b/i],
  depression: [/\bdepress(?:ion|ed)\b/i, /\bmood\b/i, /\bsad(?:ness)?\b/i, /\bmental health\b/i],
  epilepsy: [/\bepilepsy\b/i, /\bseizure\b/i, /\bconvulsion\b/i, /\bdravet\b/i, /\blennox[-\s]gastaut\b/i],
  inflammation: [/\binflam(?:mation|matory|med)\b/i, /\bswell(?:ing|ed)\b/i],
  arthritis: [/\barthritis\b/i, /\bjoint\b/i, /\brheumatoid\b/i, /\bosteoarthritis\b/i],
  skin: [/\bskin\b/i, /\bacne\b/i, /\beczema\b/i, /\bpsoriasis\b/i, /\bdermatitis\b/i],
  cancer: [/\bcancer\b/i, /\btumor\b/i, /\boncology\b/i, /\bchemotherapy\b/i, /\bchemo\b/i],
  ptsd: [/\bptsd\b/i, /\btrauma\b/i, /\bpost[-\s]traumatic\b/i, /\bflashback\b/i],
  migraine: [/\bmigraine\b/i, /\bheadache\b/i],
  neuropathy: [/\bneuropath(?:y|ic)\b/i, /\bnerve pain\b/i, /\bnumb(?:ness)?\b/i],
  fibromyalgia: [/\bfibromyalgia\b/i, /\bfibro\b/i, /\bwidespread pain\b/i],
  ibs: [/\bibs\b/i, /\birritable bowel\b/i, /\bdigestive\b/i, /\bgut\b/i],
  autism: [/\bautis(?:m|tic)\b/i, /\basd\b/i, /\bspectrum\b/i],
  adhd: [/\badhd\b/i, /\battention\b/i, /\bhyperactivity\b/i, /\bfocus\b/i],
  addiction: [/\baddiction\b/i, /\bwithdrawal\b/i, /\bsubstance\b/i, /\bcraving\b/i],
  nausea: [/\bnausea\b/i, /\bvomit(?:ing)?\b/i],
  appetite: [/\bappetite\b/i, /\bhunger\b/i, /\beating\b/i],
  multiple_sclerosis: [/\bmultiple sclerosis\b/i, /\bms\b/i, /\bspasticity\b/i],
};

/**
 * Medication patterns
 */
const MEDICATION_PATTERNS: RegExp[] = [
  /\b(aspirin|ibuprofen|acetaminophen|tylenol|advil|motrin)\b/i,
  /\b(warfarin|coumadin|blood thinner)\b/i,
  /\b(prozac|zoloft|lexapro|paxil|celexa|ssri|antidepressant)\b/i,
  /\b(xanax|valium|klonopin|ativan|benzodiazepine)\b/i,
  /\b(lisinopril|metoprolol|amlodipine|blood pressure)\b/i,
  /\b(metformin|insulin|diabetes med)\b/i,
  /\b(gabapentin|lyrica|pregabalin)\b/i,
  /\b(opioid|morphine|oxycodone|hydrocodone|fentanyl|tramadol)\b/i,
  /\b(prednisone|steroid|corticosteroid)\b/i,
  /\b(synthroid|levothyroxine|thyroid)\b/i,
  /\b(statin|lipitor|atorvastatin|simvastatin)\b/i,
  /\b(omeprazole|prilosec|nexium|ppi)\b/i,
  /\b(medication|medicine|drug|prescription|rx)\b/i,
];

/**
 * Symptom patterns
 */
const SYMPTOM_PATTERNS: RegExp[] = [
  /\b(chronic|acute|severe|mild|moderate)\s+(pain|discomfort|symptoms?)\b/i,
  /\b(muscle|joint|back|neck|knee|shoulder|hip)\s+(pain|ache)\b/i,
  /\b(can't|cannot|trouble|difficulty|hard to)\s+(sleep|focus|concentrate|relax)\b/i,
  /\b(racing|intrusive)\s+(thoughts?|mind)\b/i,
  /\b(panic|anxiety)\s+attack\b/i,
  /\b(low|no)\s+(energy|motivation|appetite)\b/i,
  /\b(headache|migraine|tension)\b/i,
  /\b(nausea|vomiting|stomach)\b/i,
  /\b(tremor|shaking|spasm)\b/i,
  /\b(swelling|inflammation|redness)\b/i,
];

/**
 * Experience level patterns
 */
const EXPERIENCE_PATTERNS = {
  new: [
    /\bnever (?:tried|used|taken)\b/i,
    /\bfirst time\b/i,
    /\bnew to (?:cbd|cannabidiol)\b/i,
    /\bbeginne?r\b/i,
    /\bstarting out\b/i,
    /\bwant to try\b/i,
    /\bthinking (?:of|about) (?:try|start)ing\b/i,
    /\bno experience\b/i,
  ],
  some: [
    /\btried (?:it )?(?:once|before|a few times)\b/i,
    /\bsome experience\b/i,
    /\bused (?:it )?(?:occasionally|sometimes)\b/i,
    /\bnot (?:very )?often\b/i,
  ],
  regular: [
    /\buse (?:cbd )?(?:regularly|daily|every day)\b/i,
    /\bbeen using (?:for|since)\b/i,
    /\bregular(?:ly)? (?:use|take)\b/i,
    /\b(?:take|use) (?:it )?every\b/i,
    /\bexperienced (?:user|with)\b/i,
    /\byears?\b/i,
    /\bmonths?\b/i,
  ],
};

/**
 * Product format patterns
 */
const FORMAT_PATTERNS: Record<string, RegExp[]> = {
  oil: [/\boil\b/i, /\btincture\b/i, /\bdrop\b/i, /\bsublingual\b/i],
  edible: [/\bgumm(?:y|ies)\b/i, /\bedible\b/i, /\bchocolate\b/i, /\bcapsule\b/i, /\bpill\b/i],
  topical: [/\btopical\b/i, /\bcream\b/i, /\bbalm\b/i, /\blotion\b/i, /\bsalve\b/i],
  vape: [/\bvape\b/i, /\bvaping\b/i, /\binhale\b/i, /\bcartridge\b/i],
  isolate: [/\bisolate\b/i, /\bpure\b/i, /\bcrystal\b/i],
  full_spectrum: [/\bfull[\s-]?spectrum\b/i, /\bentourage\b/i],
  broad_spectrum: [/\bbroad[\s-]?spectrum\b/i],
};

/**
 * Weight patterns
 */
const WEIGHT_PATTERNS = [
  /\b(\d{2,3})\s*(?:lb|lbs|pound|pounds)\b/i,
  /\b(\d{2,3})\s*(?:kg|kilo|kilogram)\b/i,
  /\bweigh\s*(?:about|around|approximately)?\s*(\d{2,3})\b/i,
];

/**
 * Extract mentioned conditions from text
 */
function extractConditions(text: string): string[] {
  const conditions: Set<string> = new Set();

  for (const [condition, patterns] of Object.entries(CONDITION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        conditions.add(condition);
        break;
      }
    }
  }

  return Array.from(conditions);
}

/**
 * Extract mentioned medications from text
 */
function extractMedications(text: string): string[] {
  const medications: string[] = [];

  for (const pattern of MEDICATION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      medications.push(match[1] || match[0]);
    }
  }

  return Array.from(new Set(medications));
}

/**
 * Extract symptoms from text
 */
function extractSymptoms(text: string): string[] {
  const symptoms: string[] = [];

  for (const pattern of SYMPTOM_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      symptoms.push(match[0].toLowerCase());
    }
  }

  return Array.from(new Set(symptoms));
}

/**
 * Detect user experience level
 */
function detectExperienceLevel(text: string): 'new' | 'some' | 'regular' | undefined {
  for (const pattern of EXPERIENCE_PATTERNS.new) {
    if (pattern.test(text)) return 'new';
  }

  for (const pattern of EXPERIENCE_PATTERNS.regular) {
    if (pattern.test(text)) return 'regular';
  }

  for (const pattern of EXPERIENCE_PATTERNS.some) {
    if (pattern.test(text)) return 'some';
  }

  return undefined;
}

/**
 * Detect preferred product format
 */
function detectPreferredFormat(text: string): string | undefined {
  for (const [format, patterns] of Object.entries(FORMAT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return format;
      }
    }
  }

  return undefined;
}

/**
 * Extract weight from text
 */
function extractWeight(text: string): string | undefined {
  for (const pattern of WEIGHT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return undefined;
}

/**
 * Determine primary concern from conditions
 */
function determinePrimaryConcern(conditions: string[]): string | undefined {
  if (conditions.length === 0) return undefined;

  // The first mentioned condition is likely the primary concern
  return conditions[0];
}

/**
 * Extract context from an array of chat messages
 */
export function extractContextFromMessages(messages: ChatMessage[]): ConversationContext {
  const context: ConversationContext = {
    mentionedConditions: [],
    mentionedMedications: [],
    mentionedSymptoms: [],
    previousIntents: [],
    questionsAsked: 0,
    lastTopics: [],
  };

  // Track unique items
  const conditionsSet = new Set<string>();
  const medicationsSet = new Set<string>();
  const symptomsSet = new Set<string>();
  const topicsFromRecent: string[] = [];

  // Process each message
  for (const message of messages) {
    const text = message.content;

    // Count user questions
    if (message.role === 'user') {
      context.questionsAsked++;
    }

    // Extract conditions
    const conditions = extractConditions(text);
    conditions.forEach(c => conditionsSet.add(c));

    // Track recent topics (last 3 messages)
    if (messages.indexOf(message) >= messages.length - 3) {
      topicsFromRecent.push(...conditions);
    }

    // Extract medications (only from user messages)
    if (message.role === 'user') {
      const medications = extractMedications(text);
      medications.forEach(m => medicationsSet.add(m));

      // Extract symptoms
      const symptoms = extractSymptoms(text);
      symptoms.forEach(s => symptomsSet.add(s));

      // Detect experience level (prefer most recent)
      const experience = detectExperienceLevel(text);
      if (experience) {
        context.userExperience = experience;
      }

      // Detect preferred format (prefer most recent)
      const format = detectPreferredFormat(text);
      if (format) {
        context.preferredFormat = format;
      }

      // Extract weight (prefer most recent)
      const weight = extractWeight(text);
      if (weight) {
        context.userWeight = weight;
      }
    }
  }

  // Compile final context
  context.mentionedConditions = Array.from(conditionsSet);
  context.mentionedMedications = Array.from(medicationsSet);
  context.mentionedSymptoms = Array.from(symptomsSet);
  context.lastTopics = Array.from(new Set(topicsFromRecent)).slice(-3);

  // Determine primary concern
  context.primaryConcern = determinePrimaryConcern(context.mentionedConditions);

  return context;
}

/**
 * Build a personalized prompt addition based on conversation context
 */
export function buildPersonalizedPrompt(context: ConversationContext): string {
  const parts: string[] = [];

  // Add conversation continuity header
  if (context.questionsAsked > 1) {
    parts.push('## Conversation Context');
    parts.push('This is an ongoing conversation. Use the context below to provide continuity.\n');
  }

  // Add previously discussed conditions
  if (context.mentionedConditions.length > 0) {
    parts.push(`**Previously discussed conditions:** ${context.mentionedConditions.join(', ')}`);
  }

  // Add primary concern
  if (context.primaryConcern) {
    parts.push(`**Primary concern:** ${context.primaryConcern}`);
  }

  // Add mentioned medications (important for safety)
  if (context.mentionedMedications.length > 0) {
    parts.push(`**Mentioned medications:** ${context.mentionedMedications.join(', ')}`);
    parts.push('*Note: The user has mentioned medications. Be especially careful about drug interactions.*');
  }

  // Add mentioned symptoms
  if (context.mentionedSymptoms.length > 0) {
    parts.push(`**Symptoms mentioned:** ${context.mentionedSymptoms.join(', ')}`);
  }

  // Add user experience level
  if (context.userExperience) {
    const experienceLabels = {
      new: 'New to CBD - provide beginner-friendly explanations',
      some: 'Some CBD experience - moderate detail is appropriate',
      regular: 'Regular CBD user - can use more technical terms',
    };
    parts.push(`**User experience:** ${experienceLabels[context.userExperience]}`);
  }

  // Add preferred format
  if (context.preferredFormat) {
    parts.push(`**Preferred product format:** ${context.preferredFormat}`);
  }

  // Add weight if relevant for dosing questions
  if (context.userWeight) {
    parts.push(`**User weight:** ${context.userWeight}`);
  }

  // Add instructions for continuity
  if (parts.length > 0) {
    parts.push('\n**Instructions:**');
    parts.push('- Do not re-ask about information already provided');
    parts.push('- Reference previous context naturally when relevant');
    parts.push('- Build on the existing conversation');
    if (context.mentionedMedications.length > 0) {
      parts.push('- Consider medication interactions in any recommendations');
    }
  }

  return parts.join('\n');
}

/**
 * Check if a topic has already been discussed
 */
export function hasDiscussedTopic(context: ConversationContext, topic: string): boolean {
  const normalizedTopic = topic.toLowerCase();
  return context.mentionedConditions.some(c => c.toLowerCase() === normalizedTopic) ||
    context.lastTopics.some(t => t.toLowerCase() === normalizedTopic);
}

/**
 * Get suggested follow-up topics based on context
 */
export function getSuggestedTopics(context: ConversationContext): string[] {
  const suggestions: string[] = [];

  // If they mentioned conditions, suggest related topics
  for (const condition of context.mentionedConditions.slice(0, 2)) {
    if (!context.lastTopics.includes(condition)) {
      suggestions.push(`dosage for ${condition}`);
    }
  }

  // If they mentioned medications but no safety discussion
  if (context.mentionedMedications.length > 0 && !context.mentionedConditions.includes('safety')) {
    suggestions.push('CBD drug interactions');
  }

  // If they're new, suggest basics
  if (context.userExperience === 'new') {
    suggestions.push('how to start with CBD');
    suggestions.push('CBD types explained');
  }

  return suggestions.slice(0, 3);
}
