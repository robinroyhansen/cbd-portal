/**
 * Keyword Detection for CBD Chat
 * Detects medications, dosage questions, and safety concerns
 * Used to generate smart follow-up suggestions and tool recommendations
 */

import type { ChatContext } from './types';

// Common medication/drug keywords
const MEDICATION_KEYWORDS = [
  // General terms
  'medication', 'medications', 'medicine', 'medicines', 'drug', 'drugs',
  'prescription', 'prescriptions', 'pharmaceutical', 'pharmaceuticals',
  'pill', 'pills', 'tablet', 'tablets', 'capsule', 'capsules',

  // Common drug classes
  'antidepressant', 'antidepressants', 'ssri', 'snri', 'maoi',
  'blood thinner', 'blood thinners', 'anticoagulant', 'anticoagulants',
  'warfarin', 'coumadin', 'aspirin', 'ibuprofen', 'naproxen',
  'antibiotic', 'antibiotics',
  'statin', 'statins', 'cholesterol',
  'blood pressure', 'beta blocker', 'beta blockers',
  'benzodiazepine', 'benzodiazepines', 'benzo', 'benzos',
  'opioid', 'opioids', 'opiate', 'opiates', 'painkiller', 'painkillers',
  'anticonvulsant', 'anticonvulsants', 'anti-seizure',
  'immunosuppressant', 'immunosuppressants',
  'steroid', 'steroids', 'corticosteroid', 'corticosteroids', 'prednisone',
  'insulin', 'metformin', 'diabetes medication',
  'thyroid', 'levothyroxine', 'synthroid',
  'sleep aid', 'sleeping pill', 'ambien', 'lunesta',

  // Specific common medications
  'prozac', 'zoloft', 'lexapro', 'paxil', 'celexa', 'effexor', 'cymbalta',
  'xanax', 'valium', 'ativan', 'klonopin', 'lorazepam', 'diazepam',
  'lipitor', 'crestor', 'atorvastatin', 'simvastatin',
  'lisinopril', 'metoprolol', 'amlodipine', 'losartan',
  'gabapentin', 'pregabalin', 'lyrica', 'neurontin',
  'tramadol', 'hydrocodone', 'oxycodone', 'morphine', 'fentanyl',
  'adderall', 'ritalin', 'vyvanse', 'concerta',

  // Interaction-related terms
  'interaction', 'interactions', 'interact', 'mix', 'mixing', 'combine', 'combining',
  'take with', 'taking with', 'together with', 'alongside',
  'safe to take', 'safe to use', 'can i take', 'can i use',
];

// Dosage-related keywords
const DOSAGE_KEYWORDS = [
  // Direct dosage terms
  'dose', 'doses', 'dosage', 'dosing', 'dosed',
  'milligram', 'milligrams', 'mg', 'gram', 'grams',
  'milliliter', 'milliliters', 'ml', 'drop', 'drops',

  // Amount questions
  'how much', 'how many', 'amount', 'amounts',
  'quantity', 'concentration', 'strength', 'potency',
  'starting dose', 'start with', 'begin with', 'recommended dose',
  'maximum dose', 'max dose', 'minimum dose', 'min dose',
  'optimal dose', 'best dose', 'right dose', 'correct dose',
  'low dose', 'high dose', 'micro dose', 'microdose',

  // Frequency terms
  'how often', 'frequency', 'daily', 'twice daily', 'per day',
  'once a day', 'twice a day', 'three times', 'morning', 'night', 'bedtime',
  'before meals', 'after meals', 'with food', 'empty stomach',

  // Titration terms
  'titrate', 'titration', 'increase', 'decrease', 'adjust',
  'work up', 'ramp up', 'build up', 'taper',

  // Method terms
  'sublingual', 'under tongue', 'swallow', 'topical', 'apply',
  'vape', 'vaping', 'inhale', 'inhalation', 'edible', 'edibles',
];

// Safety concern keywords
const SAFETY_KEYWORDS = [
  // Pregnancy and nursing
  'pregnant', 'pregnancy', 'expecting', 'conceiving', 'conception',
  'nursing', 'breastfeeding', 'breast feeding', 'lactating', 'lactation',
  'baby', 'infant', 'newborn', 'fetus', 'prenatal', 'postnatal',

  // Children and minors
  'child', 'children', 'kid', 'kids', 'minor', 'minors',
  'teenager', 'teen', 'adolescent', 'pediatric', 'youth',
  'toddler', 'young', 'under 18', 'school age',

  // Elderly
  'elderly', 'senior', 'seniors', 'older adult', 'older adults',
  'aging', 'aged', 'geriatric', 'over 65',

  // Medical conditions requiring caution
  'liver', 'hepatic', 'kidney', 'renal', 'heart', 'cardiac',
  'surgery', 'operation', 'procedure', 'anesthesia',
  'transplant', 'chemotherapy', 'radiation',

  // Driving and machinery
  'drive', 'driving', 'operate', 'operating', 'machinery',
  'vehicle', 'car', 'work', 'job', 'impair', 'impairment',

  // Allergies and reactions
  'allergy', 'allergies', 'allergic', 'reaction', 'reactions',
  'sensitive', 'sensitivity', 'intolerance',

  // Addiction and abuse
  'addictive', 'addiction', 'habit forming', 'dependence', 'dependent',
  'abuse', 'misuse', 'withdrawal',

  // General safety terms
  'safe', 'safety', 'risk', 'risks', 'danger', 'dangerous',
  'harmful', 'harm', 'side effect', 'side effects', 'adverse',
  'warning', 'caution', 'contraindication',
];

/**
 * Check if a message mentions medications or drugs
 */
export function detectMedicationKeywords(message: string): boolean {
  const messageLower = message.toLowerCase();
  return MEDICATION_KEYWORDS.some(keyword =>
    messageLower.includes(keyword.toLowerCase())
  );
}

/**
 * Check if a message is asking about dosage
 */
export function detectDosageKeywords(message: string): boolean {
  const messageLower = message.toLowerCase();
  return DOSAGE_KEYWORDS.some(keyword =>
    messageLower.includes(keyword.toLowerCase())
  );
}

/**
 * Check if a message contains safety concerns
 */
export function detectSafetyKeywords(message: string): boolean {
  const messageLower = message.toLowerCase();
  return SAFETY_KEYWORDS.some(keyword =>
    messageLower.includes(keyword.toLowerCase())
  );
}

/**
 * Get detected keyword categories for a message
 */
export interface KeywordDetectionResult {
  hasMedicationKeywords: boolean;
  hasDosageKeywords: boolean;
  hasSafetyKeywords: boolean;
  detectedMedications: string[];
  detectedSafetyTopics: string[];
}

export function analyzeMessage(message: string): KeywordDetectionResult {
  const messageLower = message.toLowerCase();

  const detectedMedications = MEDICATION_KEYWORDS.filter(keyword =>
    messageLower.includes(keyword.toLowerCase())
  );

  const detectedSafetyTopics = SAFETY_KEYWORDS.filter(keyword =>
    messageLower.includes(keyword.toLowerCase())
  );

  return {
    hasMedicationKeywords: detectedMedications.length > 0,
    hasDosageKeywords: detectDosageKeywords(message),
    hasSafetyKeywords: detectedSafetyTopics.length > 0,
    detectedMedications,
    detectedSafetyTopics,
  };
}

/**
 * Generate smart follow-up questions based on message content and context
 */
export function generateSmartFollowUps(
  message: string,
  context: ChatContext
): string[] {
  const followUps: string[] = [];
  const messageLower = message.toLowerCase();
  const analysis = analyzeMessage(message);

  // If medications mentioned, suggest interaction checker
  if (analysis.hasMedicationKeywords) {
    followUps.push('Check CBD drug interactions');
    followUps.push('What medications should I avoid with CBD?');
  }

  // If dosage mentioned, suggest dosage calculator
  if (analysis.hasDosageKeywords) {
    followUps.push('Use the CBD dosage calculator');
    followUps.push('What factors affect CBD dosage?');
  }

  // If safety concerns mentioned
  if (analysis.hasSafetyKeywords) {
    // Pregnancy/nursing specific
    if (messageLower.includes('pregnant') || messageLower.includes('pregnancy') ||
        messageLower.includes('nursing') || messageLower.includes('breastfeeding')) {
      followUps.push('Is CBD safe during pregnancy?');
      followUps.push('CBD and breastfeeding research');
    }
    // Children specific
    else if (messageLower.includes('child') || messageLower.includes('kid') ||
             messageLower.includes('pediatric') || messageLower.includes('teen')) {
      followUps.push('CBD research for children');
      followUps.push('Pediatric CBD safety studies');
    }
    // General safety
    else {
      followUps.push('What are CBD side effects?');
      followUps.push('Who should avoid CBD?');
    }
  }

  // Condition-specific follow-ups
  if (context.conditions.length > 0) {
    const topCondition = context.conditions[0];

    // Only add condition-specific if we don't have too many follow-ups
    if (followUps.length < 2) {
      followUps.push(`View all ${topCondition.name} research`);

      if (topCondition.research_count > 10) {
        followUps.push(`What's the evidence level for ${topCondition.name}?`);
      }
    }
  }

  // Research-related follow-ups if studies found
  if (context.studies.length > 0 && followUps.length < 3) {
    const humanStudies = context.studies.filter(s =>
      s.study_subject === 'human' || s.study_subject === 'review'
    );

    if (humanStudies.length > 0) {
      followUps.push('Show human clinical trials');
    }
  }

  // General educational follow-ups as fallback
  if (followUps.length === 0) {
    // Check what type of question was asked
    if (messageLower.includes('what is') || messageLower.includes('what are') ||
        messageLower.includes('explain') || messageLower.includes('tell me about')) {
      followUps.push('How does CBD work in the body?');
      followUps.push('What forms of CBD are available?');
    } else if (messageLower.includes('help') || messageLower.includes('treat') ||
               messageLower.includes('condition')) {
      followUps.push('What conditions has CBD been studied for?');
      followUps.push('How strong is the research evidence?');
    } else {
      followUps.push('Browse all researched conditions');
      followUps.push('Learn about CBD basics');
    }
  }

  // Return unique follow-ups, limited to 3
  return [...new Set(followUps)].slice(0, 3);
}

/**
 * Get tool suggestions based on detected keywords
 */
export interface ToolSuggestion {
  tool: 'interaction-checker' | 'dosage-calculator' | 'condition-browser';
  label: string;
  href: string;
  reason: string;
}

export function getToolSuggestions(message: string): ToolSuggestion[] {
  const suggestions: ToolSuggestion[] = [];
  const analysis = analyzeMessage(message);

  if (analysis.hasMedicationKeywords) {
    suggestions.push({
      tool: 'interaction-checker',
      label: 'Check Drug Interactions',
      href: '/tools/interaction-checker',
      reason: 'You mentioned medications - check for potential interactions',
    });
  }

  if (analysis.hasDosageKeywords) {
    suggestions.push({
      tool: 'dosage-calculator',
      label: 'Calculate Your Dose',
      href: '/tools/dosage-calculator',
      reason: 'Get personalized dosage recommendations',
    });
  }

  return suggestions;
}
