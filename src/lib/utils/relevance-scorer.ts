interface RelevanceResult {
  score: number;
  signals: string[];
  category: 'high' | 'medium' | 'low' | 'irrelevant';
}

export function calculateRelevanceScore(study: {
  title: string;
  abstract?: string
}): RelevanceResult {
  let score = 50; // Start neutral
  const signals: string[] = [];

  const title = (study.title || '').toLowerCase();
  const abstract = (study.abstract || '').toLowerCase();
  const text = `${title} ${abstract}`;

  // ============================================
  // NEGATIVE SIGNALS (likely NOT about CBD health)
  // ============================================

  // Policy/Legal papers without medical context
  if (/\b(policy|legislation|legalization|regulatory|legal framework|government|law reform|criminal|decriminalization)\b/i.test(text)) {
    if (!/\b(patient|treatment|medical|therapeutic|clinical)\b/i.test(text)) {
      score -= 35;
      signals.push('Policy/legal focus without medical context');
    }
  }

  // Economic/Market analysis
  if (/\b(market|industry|retail|economic|business|commerce|sales|pricing|consumer behavior|investment|trade)\b/i.test(text)) {
    score -= 30;
    signals.push('Economic/market focus');
  }

  // Agricultural/Cultivation
  if (/\b(cultivation|agriculture|farming|crop|harvest|yield|grow room|hemp fiber|hemp seed|seed oil|biofuel)\b/i.test(text)) {
    if (!/\b(cbd|cannabidiol|therapeutic|treatment)\b/i.test(text)) {
      score -= 30;
      signals.push('Agricultural focus');
    }
  }

  // Recreational/Social use (not treatment)
  if (/\b(recreational|adult.?use|social use|getting high|intoxication|impairment)\b/i.test(text)) {
    if (!/\b(disorder|addiction|dependence|treatment|abuse)\b/i.test(text)) {
      score -= 25;
      signals.push('Recreational focus');
    }
  }

  // Environmental/Ecological
  if (/\b(environmental impact|ecology|biodiversity|soil|water quality|phytoremediation|carbon)\b/i.test(text)) {
    score -= 25;
    signals.push('Environmental focus');
  }

  // Pure chemistry without medical application
  if (/\b(synthesis|extraction method|chromatography|spectroscopy|analytical method|hplc|mass spec)\b/i.test(text)) {
    if (!/\b(therapeutic|treatment|patient|clinical|efficacy)\b/i.test(text)) {
      score -= 20;
      signals.push('Chemistry/analytical focus without medical context');
    }
  }

  // Drug testing/Detection
  if (/\b(drug test|detection|screening|urine|workplace testing|forensic)\b/i.test(text)) {
    if (!/\b(treatment|therapeutic|patient)\b/i.test(text)) {
      score -= 20;
      signals.push('Drug testing/forensic focus');
    }
  }

  // Veterinary/Animal agriculture (not preclinical research)
  if (/\b(livestock|cattle|poultry|swine|farm animal|pet food|animal feed)\b/i.test(text)) {
    score -= 20;
    signals.push('Veterinary/livestock focus');
  }

  // ============================================
  // POSITIVE SIGNALS (about CBD for health)
  // ============================================

  // CBD/Cannabidiol in TITLE (strong signal)
  if (/\b(cbd|cannabidiol)\b/i.test(title)) {
    score += 25;
    signals.push('CBD/Cannabidiol in title');
  }

  // Therapeutic/Treatment context
  if (/\b(treatment|therapy|therapeutic|efficacy|effectiveness|healing|intervention)\b/i.test(text)) {
    score += 20;
    signals.push('Treatment/therapeutic context');
  }

  // Clinical/Medical context
  if (/\b(patients|clinical trial|medical use|symptoms|disorder|disease|diagnosis|healthcare)\b/i.test(text)) {
    score += 15;
    signals.push('Clinical/medical context');
  }

  // Specific health conditions (our core topics)
  const healthConditions = [
    'anxiety', 'anxiolytic', 'generalized anxiety',
    'pain', 'chronic pain', 'neuropathic pain', 'analgesic',
    'epilepsy', 'seizure', 'dravet', 'lennox-gastaut', 'anticonvulsant',
    'sleep', 'insomnia', 'sleep disorder',
    'depression', 'antidepressant', 'mood disorder',
    'inflammation', 'inflammatory', 'anti-inflammatory',
    'cancer', 'tumor', 'oncology', 'chemotherapy', 'anti-tumor',
    'ptsd', 'post-traumatic', 'trauma',
    'autism', 'asd', 'autistic',
    'schizophrenia', 'psychosis', 'antipsychotic',
    'parkinson', 'alzheimer', 'dementia', 'neurodegeneration',
    'addiction', 'substance use disorder', 'dependence', 'withdrawal', 'opioid',
    'nausea', 'vomiting', 'antiemetic',
    'skin', 'acne', 'psoriasis', 'eczema', 'dermatitis', 'atopic',
    'arthritis', 'rheumatoid', 'fibromyalgia',
    'ibd', 'crohn', 'colitis', 'inflammatory bowel',
    'diabetes', 'metabolic syndrome', 'obesity',
    'cardiovascular', 'heart', 'blood pressure', 'hypertension',
    'multiple sclerosis', 'ms', 'spasticity'
  ];

  const conditionRegex = new RegExp(`\\b(${healthConditions.join('|')})\\b`, 'gi');
  const conditionMatches = text.match(conditionRegex) || [];
  const uniqueConditions = [...new Set(conditionMatches.map(c => c.toLowerCase()))];

  if (uniqueConditions.length > 0) {
    score += Math.min(uniqueConditions.length * 5, 20);
    signals.push(`Health conditions: ${uniqueConditions.slice(0, 4).join(', ')}`);
  }

  // CBD + condition in close proximity (very relevant)
  const cbdConditionProximity = /\b(cbd|cannabidiol)\b.{0,80}\b(anxiety|pain|epilepsy|sleep|depression|inflammation|cancer|seizure|nausea)\b/i.test(text) ||
    /\b(anxiety|pain|epilepsy|sleep|depression|inflammation|cancer|seizure|nausea)\b.{0,80}\b(cbd|cannabidiol)\b/i.test(text);

  if (cbdConditionProximity) {
    score += 15;
    signals.push('CBD + health condition in close proximity');
  }

  // Multiple CBD mentions (not just passing reference)
  const cbdMentions = (text.match(/\b(cbd|cannabidiol)\b/gi) || []).length;
  if (cbdMentions >= 5) {
    score += 10;
    signals.push(`CBD mentioned ${cbdMentions}+ times`);
  } else if (cbdMentions === 1) {
    score -= 15;
    signals.push('CBD mentioned only once (tangential?)');
  }

  // Human study indicators
  if (/\b(participants|human subjects|volunteers|randomized|placebo|double.?blind|controlled trial)\b/i.test(text)) {
    score += 10;
    signals.push('Human study indicators');
  }

  // Pharmacological mechanisms (good for understanding CBD)
  if (/\b(mechanism|receptor|cb1|cb2|endocannabinoid|pharmacodynamic|pharmacokinetic)\b/i.test(text)) {
    if (/\b(cbd|cannabidiol)\b/i.test(text)) {
      score += 5;
      signals.push('CBD mechanism/pharmacology');
    }
  }

  // Safety/Adverse effects (important for CBD info)
  if (/\b(safety|adverse|side effect|tolerability|toxicity|drug interaction)\b/i.test(text)) {
    if (/\b(cbd|cannabidiol)\b/i.test(text)) {
      score += 5;
      signals.push('CBD safety/adverse effects');
    }
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine category
  let category: 'high' | 'medium' | 'low' | 'irrelevant';
  if (score >= 70) category = 'high';
  else if (score >= 40) category = 'medium';
  else if (score >= 20) category = 'low';
  else category = 'irrelevant';

  return { score, signals, category };
}
