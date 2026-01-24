// Research conditions data - shared between server and client components
// This file should NOT have 'use client' directive

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
  // === NEUROLOGICAL & MENTAL HEALTH ===
  anxiety: {
    label: 'Anxiety',
    keywords: ['anxiety', 'anxiolytic', 'gad', 'generalized anxiety', 'social anxiety', 'panic disorder', 'panic attack', 'anxious'],
    icon: '😰',
    color: 'purple',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD for anxiety disorders and stress relief'
  },
  depression: {
    label: 'Depression',
    keywords: ['depression', 'depressive', 'antidepressant', 'mdd', 'major depressive', 'mood disorder', 'dysthymia'],
    icon: '😔',
    color: 'blue',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD for depression and mood disorders'
  },
  ptsd: {
    label: 'PTSD',
    keywords: ['ptsd', 'post-traumatic', 'posttraumatic', 'trauma', 'traumatic stress', 'combat veteran', 'flashback'],
    icon: '🎖️',
    color: 'slate',
    category: 'Neurological & Mental Health',
    description: 'Studies on CBD for PTSD and trauma-related disorders'
  },
  sleep: {
    label: 'Sleep & Insomnia',
    keywords: ['sleep', 'insomnia', 'circadian', 'sedative', 'sleep quality', 'sleep disorder', 'somnolence', 'sleep latency', 'rem sleep'],
    icon: '😴',
    color: 'indigo',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD effects on sleep quality and insomnia'
  },
  epilepsy: {
    label: 'Epilepsy & Seizures',
    keywords: ['epilepsy', 'seizure', 'dravet', 'lennox-gastaut', 'anticonvulsant', 'epidiolex', 'convulsion', 'ictal', 'intractable epilepsy'],
    icon: '⚡',
    color: 'yellow',
    category: 'Neurological & Mental Health',
    description: 'Clinical studies on CBD for epilepsy and seizure disorders'
  },
  parkinsons: {
    label: "Parkinson's",
    keywords: ['parkinson', 'parkinsonian', 'dopamine', 'tremor', 'bradykinesia', 'dyskinesia', 'lewy body'],
    icon: '🧠',
    color: 'teal',
    category: 'Neurological & Mental Health',
    description: "Research on CBD for Parkinson's disease symptoms"
  },
  alzheimers: {
    label: "Alzheimer's & Dementia",
    keywords: ['alzheimer', 'dementia', 'cognitive decline', 'memory loss', 'amyloid', 'tau protein', 'neurodegeneration', 'cognitive impairment'],
    icon: '🧓',
    color: 'gray',
    category: 'Neurological & Mental Health',
    description: "Studies on CBD for Alzheimer's and dementia"
  },
  autism: {
    label: 'Autism & ASD',
    keywords: ['autism', 'asd', 'autistic', 'asperger', 'spectrum disorder', 'developmental disorder', 'neurodevelopmental'],
    icon: '🧩',
    color: 'cyan',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD for autism spectrum disorders'
  },
  adhd: {
    label: 'ADHD',
    keywords: ['adhd', 'attention deficit', 'hyperactivity', 'add', 'inattention', 'impulsivity', 'executive function'],
    icon: '🎯',
    color: 'orange',
    category: 'Neurological & Mental Health',
    description: 'Studies on CBD for ADHD and attention disorders'
  },
  schizophrenia: {
    label: 'Schizophrenia',
    keywords: ['schizophrenia', 'psychosis', 'psychotic', 'antipsychotic', 'hallucination', 'delusion', 'negative symptoms'],
    icon: '🌀',
    color: 'violet',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD antipsychotic effects'
  },
  addiction: {
    label: 'Addiction',
    keywords: ['addiction', 'substance abuse', 'substance use disorder', 'cannabis use disorder', 'opioid use disorder', 'alcohol use disorder', 'drug abuse', 'cocaine addiction', 'heroin addiction', 'relapse prevention', 'cannabis withdrawal'],
    icon: '🔄',
    color: 'green',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD for addiction treatment and withdrawal'
  },
  tourettes: {
    label: "Tourette's",
    keywords: ['tourette', 'tic disorder', 'tics', 'motor tic', 'vocal tic', 'coprolalia'],
    icon: '💬',
    color: 'lime',
    category: 'Neurological & Mental Health',
    description: "Studies on CBD for Tourette's syndrome"
  },

  // === PAIN & INFLAMMATION ===
  chronic_pain: {
    label: 'Chronic Pain',
    keywords: ['chronic pain', 'persistent pain', 'long-term pain', 'pain syndrome', 'intractable pain', 'opioid-sparing'],
    icon: '💪',
    color: 'red',
    category: 'Pain & Inflammation',
    description: 'Studies on CBD for chronic pain management'
  },
  neuropathic_pain: {
    label: 'Neuropathic Pain',
    keywords: ['neuropathic', 'neuropathy', 'nerve pain', 'peripheral neuropathy', 'diabetic neuropathy', 'neuralgia', 'allodynia'],
    icon: '⚡',
    color: 'amber',
    category: 'Pain & Inflammation',
    description: 'Research on CBD for nerve-related pain'
  },
  arthritis: {
    label: 'Arthritis',
    keywords: ['arthritis', 'osteoarthritis', 'rheumatoid arthritis', 'rheumatoid disease', 'synovitis', 'arthritic'],
    icon: '🦴',
    color: 'stone',
    category: 'Pain & Inflammation',
    description: 'Studies on CBD for arthritis and joint conditions'
  },
  fibromyalgia: {
    label: 'Fibromyalgia',
    keywords: ['fibromyalgia', 'fibro', 'widespread pain', 'tender points', 'central sensitization'],
    icon: '🌡️',
    color: 'fuchsia',
    category: 'Pain & Inflammation',
    description: 'Research on CBD for fibromyalgia'
  },
  ms: {
    label: 'Multiple Sclerosis',
    keywords: ['multiple sclerosis', 'sativex', 'nabiximols', 'relapsing-remitting ms', 'rrms', 'ppms', 'spms', 'ms spasticity', 'ms patients'],
    icon: '🧬',
    color: 'orange',
    category: 'Pain & Inflammation',
    description: 'Studies on CBD for MS symptoms and spasticity'
  },
  inflammation: {
    label: 'Inflammation',
    keywords: ['anti-inflammatory effect', 'inflammatory disease', 'inflammation treatment', 'reduce inflammation', 'inflammatory condition', 'chronic inflammation'],
    icon: '🔥',
    color: 'orange',
    category: 'Pain & Inflammation',
    description: 'Research on CBD anti-inflammatory effects'
  },
  migraines: {
    label: 'Migraines & Headaches',
    keywords: ['migraine', 'headache', 'cephalalgia', 'cluster headache', 'tension headache', 'aura'],
    icon: '🤕',
    color: 'red',
    category: 'Pain & Inflammation',
    description: 'Studies on CBD for migraines and headaches'
  },

  // === GASTROINTESTINAL ===
  crohns: {
    label: "Crohn's Disease",
    keywords: ['crohn', 'inflammatory bowel', 'ibd', 'intestinal inflammation', 'colitis', 'ulcerative colitis'],
    icon: '🫃',
    color: 'amber',
    category: 'Gastrointestinal',
    description: "Research on CBD for Crohn's and IBD"
  },
  ibs: {
    label: 'IBS',
    keywords: ['ibs', 'irritable bowel', 'functional gastrointestinal', 'abdominal pain', 'bowel dysfunction'],
    icon: '🌀',
    color: 'yellow',
    category: 'Gastrointestinal',
    description: 'Studies on CBD for irritable bowel syndrome'
  },
  nausea: {
    label: 'Nausea & Vomiting',
    keywords: ['nausea', 'vomiting', 'emesis', 'antiemetic', 'chemotherapy-induced nausea', 'cinv', 'morning sickness'],
    icon: '🤢',
    color: 'green',
    category: 'Gastrointestinal',
    description: 'Research on CBD antiemetic effects'
  },

  // === CANCER ===
  cancer: {
    label: 'Cancer',
    keywords: ['cancer', 'tumor', 'tumour', 'oncology', 'carcinoma', 'malignant', 'metastasis', 'apoptosis', 'antitumor'],
    icon: '🎗️',
    color: 'pink',
    category: 'Cancer',
    description: 'Research on CBD in cancer treatment'
  },
  chemo_side_effects: {
    label: 'Chemotherapy Side Effects',
    keywords: ['chemotherapy', 'chemo-induced', 'chemotherapy-induced', 'palliative', 'cancer pain', 'cachexia', 'wasting syndrome'],
    icon: '💊',
    color: 'rose',
    category: 'Cancer',
    description: 'Studies on CBD for chemotherapy side effects'
  },

  // === SKIN ===
  acne: {
    label: 'Acne',
    keywords: ['acne', 'sebaceous', 'sebum', 'comedone', 'pimple', 'sebocyte'],
    icon: '✨',
    color: 'sky',
    category: 'Skin',
    description: 'Research on CBD for acne treatment'
  },
  psoriasis: {
    label: 'Psoriasis',
    keywords: ['psoriasis', 'psoriatic', 'plaque psoriasis', 'scalp psoriasis', 'keratinocyte'],
    icon: '🧴',
    color: 'rose',
    category: 'Skin',
    description: 'Studies on CBD for psoriasis'
  },
  eczema: {
    label: 'Eczema & Dermatitis',
    keywords: ['eczema', 'dermatitis', 'atopic dermatitis', 'atopic eczema', 'skin rash'],
    icon: '🩹',
    color: 'pink',
    category: 'Skin',
    description: 'Research on CBD for eczema and skin conditions'
  },

  // === CARDIOVASCULAR ===
  heart: {
    label: 'Heart Health',
    keywords: ['cardiovascular', 'cardiac', 'heart disease', 'cardioprotective', 'myocardial', 'arrhythmia', 'heart failure'],
    icon: '❤️',
    color: 'red',
    category: 'Cardiovascular',
    description: 'Research on CBD cardiovascular effects'
  },
  blood_pressure: {
    label: 'Blood Pressure',
    keywords: ['blood pressure', 'hypertension', 'hypotension', 'vascular', 'vasorelaxation', 'vasodilation', 'arterial'],
    icon: '🩺',
    color: 'red',
    category: 'Cardiovascular',
    description: 'Studies on CBD blood pressure effects'
  },

  // === OTHER ===
  diabetes: {
    label: 'Diabetes',
    keywords: ['diabetes', 'diabetic', 'glucose', 'insulin', 'glycemic', 'blood sugar', 'metabolic syndrome', 'type 2 diabetes'],
    icon: '🩸',
    color: 'blue',
    category: 'Other',
    description: 'Research on CBD for diabetes management'
  },
  obesity: {
    label: 'Obesity & Weight',
    keywords: ['obesity', 'weight loss', 'overweight', 'body mass index', 'weight management', 'weight reduction'],
    icon: '⚖️',
    color: 'emerald',
    category: 'Other',
    description: 'Studies on CBD and weight management'
  },
  athletic: {
    label: 'Athletic Performance',
    keywords: ['athlete', 'athletic performance', 'sports medicine', 'exercise recovery', 'sports injury', 'wada'],
    icon: '🏃',
    color: 'green',
    category: 'Other',
    description: 'Research on CBD for athletic performance and recovery'
  },
  veterinary: {
    label: 'Veterinary & Pets',
    keywords: ['veterinary', 'canine cbd', 'feline cbd', 'dogs with', 'cats with', 'pet cbd', 'equine cbd', 'companion animal'],
    icon: '🐕',
    color: 'amber',
    category: 'Other',
    description: 'Studies on CBD for pets and animals'
  }
} as const;

export type ConditionKey = keyof typeof CONDITIONS;
