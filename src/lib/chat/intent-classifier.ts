/**
 * Intent Classifier for CBD Chat
 * Classifies user messages into predefined intent categories
 * to provide more targeted responses and better RAG retrieval
 */

export type Intent =
  | 'definition'    // "What is CBD?"
  | 'condition'     // "Does CBD help with X?"
  | 'dosage'        // "How much should I take?"
  | 'safety'        // "Is CBD safe with X?"
  | 'product'       // "What's the best CBD for X?"
  | 'comparison'    // "CBD vs THC?"
  | 'legal'         // "Is CBD legal in X?"
  | 'general';      // Everything else

/**
 * Intent patterns with keywords and phrases
 * Each intent has an array of patterns that indicate that intent
 */
const INTENT_PATTERNS: Record<Intent, RegExp[]> = {
  definition: [
    /what (?:is|are) (?:cbd|cannabidiol|cannabinoid|terpene|endocannabinoid)/i,
    /define (?:cbd|cannabidiol)/i,
    /explain (?:what )?(?:cbd|cannabidiol)/i,
    /(?:cbd|cannabidiol) (?:definition|meaning)/i,
    /how does (?:cbd|cannabidiol) work/i,
    /what does (?:cbd|cannabidiol) (?:do|mean)/i,
    /^what(?:'s| is) (?:the )?(?:difference between|meaning of)/i,
  ],
  condition: [
    /(?:does|can|will|could|would|might) (?:cbd|cannabidiol) help (?:with|for|treat|improve)/i,
    /cbd (?:for|and) (?:\w+\s)*(?:pain|anxiety|sleep|depression|stress|inflammation|arthritis|epilepsy|seizure|cancer|acne|skin|migraine|headache|nausea|ptsd|autism|adhd|fibromyalgia|ibs|crohn|colitis)/i,
    /(?:help|treat|cure|manage|improve|reduce|relieve) (?:my |the )?(?:\w+\s)*(?:pain|anxiety|sleep|depression|stress|inflammation|symptoms|condition)/i,
    /research (?:on|about|for) cbd (?:and|for)/i,
    /studies (?:on|about|for) cbd (?:and|for)/i,
    /evidence (?:for|that) cbd/i,
    /(?:is there|are there|any) (?:research|studies|evidence)/i,
    /what conditions/i,
    /which conditions/i,
  ],
  dosage: [
    /how much (?:cbd|cannabidiol)/i,
    /(?:cbd|cannabidiol) (?:dose|dosage|dosing)/i,
    /what (?:dose|dosage|amount)/i,
    /how (?:many|often)/i,
    /(?:recommended|typical|average|starting|optimal|right) (?:dose|dosage|amount)/i,
    /(?:mg|milligram)/i,
    /how (?:to|should i) take/i,
    /when (?:to|should i) take/i,
    /how long (?:to|before|until)/i,
  ],
  safety: [
    /is (?:cbd|cannabidiol) safe/i,
    /(?:cbd|cannabidiol) (?:safe|safety|risk|danger|dangerous|harmful)/i,
    /side effect/i,
    /interact(?:ion)? (?:with|between)/i,
    /drug interaction/i,
    /take (?:cbd )?with (?:my )?(?:medication|medicine|drug)/i,
    /(?:cbd|cannabidiol) (?:and|with) (?:\w+\s)*(?:medication|medicine|drug|prescription)/i,
    /pregnant|pregnancy|breastfeeding|nursing/i,
    /(?:liver|kidney|heart) (?:damage|problem|issue|safe)/i,
    /overdose/i,
    /addictive|addiction/i,
    /contraindication/i,
  ],
  product: [
    /(?:best|good|recommended|which) (?:cbd|cannabidiol) (?:product|oil|tincture|gummy|cream|capsule|vape)/i,
    /what (?:type|kind|form) of (?:cbd|cannabidiol)/i,
    /(?:full|broad) spectrum/i,
    /(?:cbd|cannabidiol) (?:isolate|extract)/i,
    /how (?:to )?choose (?:cbd|cannabidiol)/i,
    /where (?:to|can i) buy/i,
    /(?:oil|tincture|gummy|cream|capsule|vape|topical|edible)(?:s)? (?:vs|or|versus|compared)/i,
    /quality (?:cbd|cannabidiol)/i,
    /reputable (?:brand|company|source)/i,
  ],
  comparison: [
    /(?:cbd|cannabidiol) (?:vs|versus|compared to|or|and) (?:thc|marijuana|cannabis|hemp)/i,
    /(?:thc|marijuana|cannabis) (?:vs|versus|compared to|or|and) (?:cbd|cannabidiol)/i,
    /difference(?:s)? between/i,
    /(?:cbd|cannabidiol) (?:vs|versus|compared to|or) (?:\w+)/i,
    /(?:better|worse) than/i,
    /how (?:does|do) .+ compare/i,
  ],
  legal: [
    /(?:is|are) (?:cbd|cannabidiol) legal/i,
    /(?:cbd|cannabidiol) (?:legal|legality|law)/i,
    /(?:legal|law|regulation) (?:in|for|about) (?:\w+\s)*(?:cbd|cannabidiol)/i,
    /can i (?:buy|use|possess|travel with)/i,
    /(?:federal|state|country|europe|usa|uk|canada) (?:law|legal|regulation)/i,
    /(?:illegal|banned|prohibited|allowed|permitted)/i,
    /travel(?:ing)? with (?:cbd|cannabidiol)/i,
    /(?:prescription|license) (?:for|to|required)/i,
  ],
  general: [], // Default fallback
};

/**
 * Intent scoring weights
 * Some intents are more specific and should be weighted higher
 */
const INTENT_PRIORITY: Record<Intent, number> = {
  safety: 1.2,      // Safety questions are critical
  dosage: 1.1,      // Dosage is specific
  legal: 1.1,       // Legal is specific
  comparison: 1.0,
  condition: 1.0,
  definition: 0.9,
  product: 0.8,
  general: 0.0,     // Default
};

/**
 * Additional keyword boosters for intents
 */
const INTENT_KEYWORDS: Record<Intent, string[]> = {
  definition: ['what', 'define', 'explain', 'meaning', 'how does it work'],
  condition: ['help', 'treat', 'cure', 'research', 'studies', 'evidence', 'symptoms'],
  dosage: ['dose', 'dosage', 'mg', 'milligram', 'amount', 'much', 'often', 'timing'],
  safety: ['safe', 'side effect', 'interaction', 'risk', 'dangerous', 'medication', 'pregnant'],
  product: ['product', 'oil', 'tincture', 'gummy', 'cream', 'capsule', 'buy', 'quality', 'brand'],
  comparison: ['vs', 'versus', 'compare', 'difference', 'better', 'worse'],
  legal: ['legal', 'law', 'regulation', 'allowed', 'banned', 'travel', 'prescription'],
  general: [],
};

/**
 * Classify a user message into an intent category
 * Uses pattern matching and keyword analysis
 */
export function classifyIntent(message: string): Intent {
  const normalizedMessage = message.toLowerCase().trim();
  const scores: Record<Intent, number> = {
    definition: 0,
    condition: 0,
    dosage: 0,
    safety: 0,
    product: 0,
    comparison: 0,
    legal: 0,
    general: 0,
  };

  // Score based on regex pattern matches
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [Intent, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedMessage)) {
        scores[intent] += 2; // Strong match
      }
    }
  }

  // Score based on keyword presence
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
    for (const keyword of keywords) {
      if (normalizedMessage.includes(keyword)) {
        scores[intent] += 0.5; // Weak match
      }
    }
  }

  // Apply priority weights
  for (const intent of Object.keys(scores) as Intent[]) {
    scores[intent] *= INTENT_PRIORITY[intent];
  }

  // Find highest scoring intent
  let maxScore = 0;
  let bestIntent: Intent = 'general';

  for (const [intent, score] of Object.entries(scores) as [Intent, number][]) {
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }

  // If no clear winner, default to general
  if (maxScore < 1) {
    return 'general';
  }

  return bestIntent;
}

/**
 * Get intent-specific search boost terms
 * Returns additional keywords to improve RAG retrieval for this intent
 */
export function getIntentSearchBoost(intent: Intent): string[] {
  const boosts: Record<Intent, string[]> = {
    definition: ['mechanism', 'endocannabinoid', 'receptor', 'pharmacology', 'biochemistry'],
    condition: ['clinical trial', 'efficacy', 'treatment', 'therapeutic', 'outcome'],
    dosage: ['dosage', 'titration', 'bioavailability', 'pharmacokinetics', 'administration'],
    safety: ['safety', 'adverse', 'interaction', 'contraindication', 'toxicity', 'side effect'],
    product: ['formulation', 'delivery', 'absorption', 'bioavailability', 'product'],
    comparison: ['comparison', 'versus', 'difference', 'similar', 'advantage'],
    legal: ['regulation', 'legal', 'law', 'FDA', 'DEA', 'schedule', 'compliance'],
    general: [],
  };

  return boosts[intent];
}

/**
 * Get intent-specific response guidance
 * Returns hints for how to structure the response for this intent
 */
export function getIntentGuidance(intent: Intent): string {
  const guidance: Record<Intent, string> = {
    definition: 'Provide a clear, educational explanation. Define the term and explain how it works.',
    condition: 'Focus on research evidence. Mention study counts, evidence levels, and link to condition pages.',
    dosage: 'Be careful - recommend consulting a healthcare provider. Discuss general ranges from research but emphasize individual variation.',
    safety: 'Prioritize safety information. Strongly recommend consulting a healthcare provider. Be thorough about known risks and interactions.',
    product: 'Provide general guidance on product types. Do not recommend specific brands. Discuss factors to consider.',
    comparison: 'Present a balanced comparison. Highlight key differences and similarities with evidence.',
    legal: 'Note that laws vary by location and change frequently. Recommend checking local regulations.',
    general: 'Provide helpful, evidence-based information. Guide to relevant resources.',
  };

  return guidance[intent];
}
