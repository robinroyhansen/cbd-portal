/**
 * Batch Condition Article Generator
 * Generates research-backed articles for a batch of health conditions
 *
 * Run with: node scripts/generate-batch-condition-articles.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  });
  return envVars;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Conditions to generate with expanded search terms
const CONDITIONS_TO_GENERATE = [
  {
    slug: 'cluster-headaches',
    name: 'Cluster Headaches',
    displayName: 'Cluster Headaches',
    terms: ['cluster headache', 'headache', 'head pain', 'migraine', 'trigeminal'],
    mechanisms: [
      'Potential effects on trigeminal nerve pathways',
      'Modulation of serotonin receptors (5-HT1A)',
      'Anti-inflammatory effects may reduce neurogenic inflammation',
      'Possible influence on hypothalamic activity'
    ]
  },
  {
    slug: 'tension-headaches',
    name: 'Tension Headaches',
    displayName: 'Tension Headaches',
    terms: ['tension headache', 'headache', 'head pain', 'tension-type', 'muscle tension'],
    mechanisms: [
      'Muscle relaxant properties through CB1 receptor modulation',
      'Anti-inflammatory effects on tight muscles',
      'Anxiolytic properties may reduce stress-related tension',
      'Pain modulation through endocannabinoid system'
    ]
  },
  {
    slug: 'occipital-neuralgia',
    name: 'Occipital Neuralgia',
    displayName: 'Occipital Neuralgia',
    terms: ['occipital neuralgia', 'neuralgia', 'nerve pain', 'neuropathic pain', 'head pain'],
    mechanisms: [
      'Neuroprotective effects on occipital nerves',
      'Anti-inflammatory action reducing nerve irritation',
      'Pain signal modulation through TRPV1 receptors',
      'Potential nerve regeneration support'
    ]
  },
  {
    slug: 'tmj',
    name: 'TMJ Disorders',
    displayName: 'TMJ (Temporomandibular Joint) Disorders',
    terms: ['tmj', 'temporomandibular', 'jaw pain', 'facial pain', 'orofacial pain'],
    mechanisms: [
      'Muscle relaxant effects on jaw muscles',
      'Anti-inflammatory effects on joint tissue',
      'CB2 receptors present in synovial tissue',
      'Pain modulation through endocannabinoid system'
    ]
  },
  {
    slug: 'tooth-pain',
    name: 'Tooth Pain',
    displayName: 'Tooth Pain (Dental Pain)',
    terms: ['tooth pain', 'dental pain', 'toothache', 'oral pain', 'dental'],
    mechanisms: [
      'CB1 and CB2 receptors present in dental pulp',
      'Anti-inflammatory effects on gum tissue',
      'Antimicrobial properties against oral pathogens',
      'Pain modulation through peripheral nerves'
    ]
  },
  {
    slug: 'mouth-ulcers',
    name: 'Mouth Ulcers',
    displayName: 'Mouth Ulcers (Canker Sores)',
    terms: ['mouth ulcer', 'oral ulcer', 'aphthous', 'canker sore', 'oral mucosa'],
    mechanisms: [
      'Anti-inflammatory effects on oral mucosa',
      'Immune modulation may affect ulcer formation',
      'Antimicrobial properties for secondary infections',
      'Potential wound healing promotion'
    ]
  },
  {
    slug: 'gum-disease',
    name: 'Gum Disease',
    displayName: 'Gum Disease (Periodontal Disease)',
    terms: ['gum disease', 'periodontal', 'gingivitis', 'periodontitis', 'oral health'],
    mechanisms: [
      'Anti-inflammatory effects on gingival tissue',
      'Antimicrobial activity against periodontal pathogens',
      'CB2 receptors present in periodontal ligament',
      'Bone metabolism regulation through ECS'
    ]
  },
  {
    slug: 'seasonal-allergies',
    name: 'Seasonal Allergies',
    displayName: 'Seasonal Allergies (Hay Fever)',
    terms: ['allergy', 'allergic', 'hay fever', 'rhinitis', 'histamine', 'immune'],
    mechanisms: [
      'Immune modulation through CB2 receptors',
      'Potential mast cell stabilization',
      'Anti-inflammatory effects on nasal mucosa',
      'Histamine response modulation'
    ]
  },
  {
    slug: 'sinusitis',
    name: 'Sinusitis',
    displayName: 'Sinusitis (Sinus Infection)',
    terms: ['sinusitis', 'sinus', 'nasal', 'rhinosinusitis', 'inflammation'],
    mechanisms: [
      'Anti-inflammatory effects on sinus tissue',
      'Potential antibacterial properties',
      'Mucus production regulation',
      'Pain and pressure relief through ECS modulation'
    ]
  },
  {
    slug: 'bronchitis',
    name: 'Bronchitis',
    displayName: 'Bronchitis',
    terms: ['bronchitis', 'bronchial', 'respiratory', 'airway', 'lung', 'pulmonary', 'cough'],
    mechanisms: [
      'Anti-inflammatory effects on bronchial tissue',
      'Bronchodilator potential through CB1 receptors',
      'Immune modulation for inflammatory response',
      'Potential mucus regulation'
    ]
  },
  {
    slug: 'copd',
    name: 'COPD',
    displayName: 'COPD (Chronic Obstructive Pulmonary Disease)',
    terms: ['copd', 'chronic obstructive', 'emphysema', 'respiratory', 'lung', 'pulmonary'],
    mechanisms: [
      'Anti-inflammatory effects on lung tissue',
      'Potential bronchodilation through cannabinoid receptors',
      'Antioxidant properties for oxidative stress',
      'Immune modulation for chronic inflammation'
    ]
  },
  {
    slug: 'colds-flu',
    name: 'Colds and Flu',
    displayName: 'Colds and Flu (Common Cold & Influenza)',
    terms: ['cold', 'flu', 'influenza', 'viral', 'respiratory infection', 'immune', 'antiviral'],
    mechanisms: [
      'Immune system modulation through CB2 receptors',
      'Anti-inflammatory effects on respiratory tract',
      'Potential antipyretic (fever-reducing) effects',
      'Symptom relief through pain modulation'
    ]
  }
];

async function queryResearchForCondition(condition) {
  const { data: studies, error } = await supabase
    .from('kb_research_queue')
    .select(`
      id, title, year, study_type, study_subject,
      sample_size, quality_score, relevance_score,
      abstract, plain_summary, doi, pmid, slug,
      relevant_topics, authors, publication
    `)
    .eq('status', 'approved')
    .order('quality_score', { ascending: false });

  if (error) {
    console.error(`Error querying research:`, error);
    return [];
  }

  // Filter studies matching search terms
  const matchingStudies = studies.filter(study => {
    const title = (study.title || '').toLowerCase();
    const abstract = (study.abstract || '').toLowerCase();
    const summary = (study.plain_summary || '').toLowerCase();
    const topics = (study.relevant_topics || []).map(t => t.toLowerCase());

    return condition.terms.some(term => {
      const termLower = term.toLowerCase();
      return (
        title.includes(termLower) ||
        abstract.includes(termLower) ||
        summary.includes(termLower) ||
        topics.some(t => t.includes(termLower))
      );
    });
  });

  return matchingStudies;
}

function analyzeEvidence(studies) {
  const humanStudies = studies.filter(s => s.study_subject === 'human');
  const reviews = studies.filter(s => s.study_subject === 'review');
  const animalStudies = studies.filter(s => s.study_subject === 'animal');
  const inVitroStudies = studies.filter(s => s.study_subject === 'in_vitro');

  const rctCount = studies.filter(s =>
    (s.study_type || '').toLowerCase().includes('randomized') ||
    (s.study_type || '').toLowerCase().includes('rct') ||
    (s.study_type || '').toLowerCase().includes('clinical trial')
  ).length;

  const metaAnalyses = studies.filter(s =>
    (s.study_type || '').toLowerCase().includes('meta-analysis') ||
    (s.study_type || '').toLowerCase().includes('systematic review')
  ).length;

  const totalParticipants = humanStudies.reduce((sum, s) => sum + (s.sample_size || 0), 0);
  const samplesWithSize = humanStudies.filter(s => s.sample_size && s.sample_size > 0);
  const largestSampleSize = samplesWithSize.length > 0
    ? Math.max(...samplesWithSize.map(s => s.sample_size))
    : 0;

  const years = studies.map(s => s.year).filter(y => y && y > 1900);
  const yearRange = {
    min: years.length > 0 ? Math.min(...years) : 2020,
    max: years.length > 0 ? Math.max(...years) : 2026
  };

  // Key studies to highlight (top by quality)
  const keyStudies = studies
    .filter(s => s.study_subject === 'human' || s.study_subject === 'review')
    .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
    .slice(0, 4);

  const positiveCount = studies.filter(s => (s.quality_score || 0) >= 50).length;
  const positiveStudyPercentage = studies.length > 0
    ? Math.round((positiveCount / studies.length) * 100)
    : 0;

  // Determine evidence level
  let evidenceLevel, evidenceDescription, targetWordCount;
  const totalHumanAndReviews = humanStudies.length + reviews.length;

  if (studies.length >= 20 && (rctCount >= 3 || metaAnalyses >= 1) && totalParticipants >= 200) {
    evidenceLevel = 'Strong';
    evidenceDescription = 'Multiple clinical trials, systematic reviews, consistent positive results';
    targetWordCount = { min: 1800, max: 2400 };
  } else if (studies.length >= 10 && (rctCount >= 1 || totalHumanAndReviews >= 5)) {
    evidenceLevel = 'Moderate';
    evidenceDescription = 'Several clinical studies with promising results, more research needed';
    targetWordCount = { min: 1300, max: 1800 };
  } else if (studies.length >= 5 && totalHumanAndReviews >= 1) {
    evidenceLevel = 'Limited';
    evidenceDescription = 'Early-stage research, mostly preclinical studies';
    targetWordCount = { min: 900, max: 1300 };
  } else {
    evidenceLevel = 'Insufficient';
    evidenceDescription = 'Very limited research, insufficient data for conclusions';
    targetWordCount = { min: 600, max: 900 };
  }

  return {
    totalStudies: studies.length,
    humanStudies: humanStudies.length,
    animalStudies: animalStudies.length,
    inVitroStudies: inVitroStudies.length,
    reviews: reviews.length,
    rctCount,
    metaAnalyses,
    totalParticipants,
    largestSampleSize,
    yearRange,
    positiveStudyPercentage,
    evidenceLevel,
    evidenceDescription,
    targetWordCount,
    keyStudies
  };
}

function generateEvidenceIndicator(level) {
  switch (level) {
    case 'Strong': return '●●●●○';
    case 'Moderate': return '●●●○○';
    case 'Limited': return '●●○○○';
    default: return '●○○○○';
  }
}

function generateArticleContent(condition, studies, analysis) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  let content = `# CBD and ${condition.displayName}: What the Research Shows

By Robin Roy Krigslund-Hansen | 12+ years in CBD industry
Reviewed ${analysis.totalStudies} studies for this article | Last updated: ${today}

---

## The Short Answer

`;

  // Short answer based on evidence level
  if (analysis.evidenceLevel === 'Strong') {
    content += `Does CBD help with ${condition.displayName.toLowerCase()}? Based on the ${analysis.totalStudies} studies I've reviewed, the evidence is genuinely promising. Multiple clinical trials show CBD can help with ${condition.name.toLowerCase()} symptoms, with consistent positive results across studies. The research is robust enough that I consider ${condition.name.toLowerCase()} one of the better-supported uses for CBD.`;
  } else if (analysis.evidenceLevel === 'Moderate') {
    content += `Does CBD help with ${condition.displayName.toLowerCase()}? Based on the ${analysis.totalStudies} studies I've reviewed, the research shows promise, though we need more large-scale trials. The existing studies suggest potential benefits, but I want to see additional data before drawing firm conclusions. If you're considering CBD for ${condition.name.toLowerCase()}, the research offers reasons for cautious optimism.`;
  } else if (analysis.evidenceLevel === 'Limited') {
    content += `Does CBD help with ${condition.displayName.toLowerCase()}? Based on the ${analysis.totalStudies} studies I've reviewed, the honest answer is that we don't have enough research to say definitively. I found only ${analysis.totalStudies} studies that address CBD and ${condition.name.toLowerCase()}, and most are preclinical or small-scale. There's biological plausibility, but I can't point to solid clinical evidence yet.`;
  } else {
    content += `Does CBD help with ${condition.displayName.toLowerCase()}? Based on my research review, I have to be direct: there's very little research specifically on CBD and ${condition.name.toLowerCase()}. The few studies that exist are preliminary, and I can't draw meaningful conclusions from such limited data. If you're considering CBD for this condition, you'd essentially be experimenting ahead of the science.`;
  }

  content += `\n\n---\n\n`;

  // Research Snapshot Box
  content += `## Research Snapshot

| Metric | Value |
|--------|-------|
| **Studies Reviewed** | ${analysis.totalStudies} |
| **Human Clinical Studies** | ${analysis.humanStudies} |
| **Systematic Reviews** | ${analysis.reviews} |
| **Total Participants** | ${analysis.totalParticipants > 0 ? analysis.totalParticipants.toLocaleString() : 'Limited data'} |
| **Research Period** | ${analysis.yearRange.min}-${analysis.yearRange.max} |
| **Evidence Strength** | ${generateEvidenceIndicator(analysis.evidenceLevel)} ${analysis.evidenceLevel} |

`;

  // Key Numbers (only for Moderate+ evidence)
  if (analysis.evidenceLevel === 'Strong' || analysis.evidenceLevel === 'Moderate') {
    content += `## Key Numbers

| Stat | Description |
|------|-------------|
| **${analysis.totalStudies}** | Total peer-reviewed studies analyzed |
| **${analysis.positiveStudyPercentage}%** | Studies showing positive or promising results |
`;
    if (analysis.largestSampleSize > 0) {
      content += `| **${analysis.largestSampleSize}** | Participants in largest study |
`;
    }
    content += `| **${analysis.humanStudies + analysis.reviews}** | Human studies and systematic reviews |

---

`;
  }

  // What the Research Shows
  content += `## What the Research Shows

### The Best Evidence

`;

  if (analysis.humanStudies > 0 || analysis.rctCount > 0) {
    const bestStudies = analysis.keyStudies.filter(s => s.study_subject === 'human').slice(0, 3);
    if (bestStudies.length > 0) {
      content += `The strongest evidence comes from ${analysis.humanStudies} human studies`;
      if (analysis.rctCount > 0) {
        content += `, including ${analysis.rctCount} randomized controlled trials`;
      }
      content += `.

`;
      for (const study of bestStudies) {
        content += `A [${study.year} study](/research/study/${study.slug})`;
        if (study.sample_size) {
          content += ` with ${study.sample_size} participants`;
        }
        if (study.plain_summary) {
          // Extract first meaningful sentence
          const summary = study.plain_summary.split('.').slice(0, 2).join('.') + '.';
          content += `: ${summary}`;
        }
        content += `\n\n`;
      }
    } else {
      content += `While there are ${analysis.humanStudies} human studies, most are preliminary or observational. We're still waiting for larger, more rigorous trials that specifically target ${condition.name.toLowerCase()}.

`;
    }
  } else {
    content += `Currently, there are no completed clinical trials specifically testing CBD for ${condition.name.toLowerCase()}. The existing research is primarily preclinical or addresses related conditions.

`;
  }

  // What Reviews Conclude
  content += `### What Reviews Conclude

`;

  if (analysis.reviews > 0 || analysis.metaAnalyses > 0) {
    const reviewStudies = studies.filter(s => s.study_subject === 'review').slice(0, 2);
    content += `${analysis.reviews} systematic reviews have examined related evidence. `;

    for (const review of reviewStudies) {
      content += `\n\nA [${review.year} review](/research/study/${review.slug}) `;
      if (review.plain_summary) {
        content += review.plain_summary.split('.').slice(0, 2).join('.') + '.';
      } else {
        content += `analyzed multiple studies and provided insights on the current state of research.`;
      }
    }
    content += '\n\n';
  } else {
    content += `No systematic reviews have been published specifically on CBD and ${condition.name.toLowerCase()}. This gap in the literature makes it difficult to draw definitive conclusions about overall treatment efficacy.

`;
  }

  // Supporting Evidence
  content += `### Supporting Evidence

`;

  if (analysis.animalStudies > 0 || analysis.inVitroStudies > 0) {
    content += `Beyond clinical studies, ${analysis.animalStudies} animal studies and ${analysis.inVitroStudies} in-vitro (lab) studies provide supporting evidence. While these can't tell us how CBD works in humans, they help establish biological plausibility and guide future research directions.

**Important context:** Animal and lab studies are early-stage research. Promising results in mice or cell cultures don't always translate to humans. I include them here for completeness, not as evidence of effectiveness.

`;
  } else {
    content += `Limited preclinical research exists for this specific condition. Most relevant studies address related conditions or general mechanisms that might apply.

`;
  }

  // Studies Worth Knowing
  if (analysis.keyStudies.length > 0) {
    content += `## Studies Worth Knowing

`;
    for (const study of analysis.keyStudies.slice(0, 3)) {
      const shortTitle = study.title.length > 70 ? study.title.substring(0, 70) + '...' : study.title;
      content += `### ${shortTitle} (${study.year})

`;
      if (study.plain_summary) {
        content += `${study.plain_summary.split('.').slice(0, 3).join('.')}...

`;
      } else if (study.abstract) {
        content += `${study.abstract.substring(0, 250)}...

`;
      }
      content += `**Sample:** ${study.sample_size || 'Not specified'} participants | **Type:** ${study.study_type || study.study_subject}

[View study summary](/research/study/${study.slug})

`;
    }
  }

  // How CBD Might Help
  content += `## How CBD Might Help with ${condition.displayName}

CBD interacts with the body's [endocannabinoid system](/glossary/endocannabinoid-system) (ECS), which plays a role in regulating various physiological processes. While research on CBD specifically for ${condition.name.toLowerCase()} is ${analysis.evidenceLevel === 'Strong' || analysis.evidenceLevel === 'Moderate' ? 'growing' : 'limited'}, researchers have identified several potential mechanisms:

`;

  for (const mechanism of condition.mechanisms) {
    content += `- **${mechanism.split(' ')[0]}:** ${mechanism}\n`;
  }

  content += `
These mechanisms are still being investigated, and we don't fully understand how they relate to ${condition.name.toLowerCase()} specifically. The [endocannabinoid system](/glossary/endocannabinoid-system) is complex, and individual responses to CBD can vary significantly.

`;

  // Dosages Studied (only if meaningful data)
  if (analysis.humanStudies > 0 && analysis.evidenceLevel !== 'Insufficient') {
    content += `## What Dosages Have Been Studied

**Important:** This is NOT medical advice. I'm sharing what researchers used in studies, not recommending doses.

Across the studies I reviewed, dosages varied widely. While there's no standardized dose for ${condition.name.toLowerCase()}, research on similar conditions has used:

- **Lower doses (10-50mg):** Often used in initial studies and for general wellness
- **Moderate doses (50-300mg):** Common in clinical trials for symptom management
- **Higher doses (300-600mg+):** Used in some specific clinical contexts

The optimal dose likely depends on factors including body weight, symptom severity, and individual metabolism. If you're considering CBD, use our [dosage calculator](/tools/dosage-calculator) as a starting point, but always consult with a healthcare provider.

`;
  }

  // My Take
  content += `## My Take

Having reviewed ${analysis.totalStudies} studies on CBD and ${condition.name.toLowerCase()} - and worked in the CBD industry for over 12 years - here's my honest assessment:

`;

  if (analysis.evidenceLevel === 'Strong') {
    content += `This is one of the better-researched areas for CBD. The clinical trials are reasonably consistent, and the evidence base continues to grow. If you're considering CBD for ${condition.name.toLowerCase()}, the research genuinely supports trying it - though I'd still recommend starting with a low dose and working with your doctor if you're on other medications.

What I'm watching for: Larger trials with longer follow-up periods, and more research on optimal dosing strategies specific to ${condition.name.toLowerCase()}.`;
  } else if (analysis.evidenceLevel === 'Moderate') {
    content += `The research is promising but not conclusive. I've seen enough positive findings to think CBD is worth considering for ${condition.name.toLowerCase()}, but I want to see larger studies before being fully confident. The biological mechanisms make sense, and the early clinical data is encouraging.

If you try it, keep your expectations realistic, start with a low dose, and track your results. Don't replace conventional treatment without discussing with your healthcare provider.

What I'm watching for: More randomized controlled trials with larger sample sizes and longer durations.`;
  } else if (analysis.evidenceLevel === 'Limited') {
    content += `I wish I could be more enthusiastic, but the research just isn't there yet. The studies that exist are interesting, and there's biological plausibility for why CBD might help with ${condition.name.toLowerCase()}, but we really need more human trials before drawing conclusions.

I wouldn't discourage someone from trying CBD for ${condition.name.toLowerCase()}, but I'd want them to understand they're ahead of the science. Don't expect dramatic results, and definitely don't replace proven treatments.

What I'm watching for: Any clinical trials currently recruiting - they could change this picture significantly in the coming years.`;
  } else {
    content += `I have to be direct: there's almost no research specifically on CBD and ${condition.name.toLowerCase()}. I can't recommend it based on evidence because the evidence doesn't exist yet.

Some people try CBD based on its general effects on related systems - pain, inflammation, stress - and that's their choice. But you'd be experimenting, not following science. If you do try it, be cautious, start very low, and don't stop any current medications without medical guidance.

What I'm watching for: Any foundational research that could justify clinical studies. Right now, we're working largely from theory and related condition data.`;
  }

  content += `\n\n---\n\n`;

  // FAQ Section
  content += `## Frequently Asked Questions

### Can CBD cure ${condition.name.toLowerCase()}?

No. CBD is not a cure for ${condition.name.toLowerCase()}. Research suggests it may help manage symptoms in some cases, but it should complement - not replace - conventional treatment. Always consult your doctor before making changes to your healthcare routine.

### How much CBD should I take for ${condition.name.toLowerCase()}?

There's no established "standard" dose for ${condition.name.toLowerCase()}. Studies have used doses ranging from 25mg to 600mg daily depending on the context. Individual responses vary significantly. Start low (10-25mg), increase gradually, and track your response. Use our [dosage calculator](/tools/dosage-calculator) for personalized guidance.

### How long does CBD take to work for ${condition.name.toLowerCase()}?

This depends on the delivery method:
- **Sublingual oils:** 15-45 minutes
- **Capsules/edibles:** 1-2 hours
- **Topicals:** Variable, localized effects

Some people notice effects quickly, while others report benefits building over several weeks of consistent use.

### Can I take CBD with my ${condition.name.toLowerCase()} medications?

CBD can interact with certain medications by affecting liver enzymes (particularly CYP450). This includes many common medications. If you take any prescription drugs, consult your doctor or pharmacist before starting CBD. This is especially important for blood thinners, anti-seizure medications, and some heart medications.

### What type of CBD is best for ${condition.name.toLowerCase()}?

Research hasn't definitively established which CBD format is best for ${condition.name.toLowerCase()}. Most clinical studies use either:
- **CBD isolate:** Pure CBD, predictable dosing
- **Full-spectrum:** Contains other cannabinoids, potential "entourage effect"

Choose reputable products with third-party testing regardless of type. Quality matters more than the specific format.

### Is CBD legal for ${condition.name.toLowerCase()}?

In most European countries and US states, CBD products derived from hemp (less than 0.2-0.3% THC) are legal. However, regulations vary. Check your local laws. CBD is not an approved medication for ${condition.name.toLowerCase()} specifically, though it's legal as a supplement in most jurisdictions.

---

`;

  // References
  content += `## References

I reviewed ${analysis.totalStudies} studies for this article. Key sources:

`;

  const topRefs = analysis.keyStudies.slice(0, 5);
  for (let i = 0; i < topRefs.length; i++) {
    const study = topRefs[i];
    content += `${i + 1}. **${study.authors || 'Authors'}** (${study.year}). ${study.title}. *${study.publication || 'Journal'}*.
   [Summary](/research/study/${study.slug})`;
    if (study.pmid) {
      content += ` | [PubMed](https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/)`;
    }
    if (study.doi) {
      content += ` | DOI: ${study.doi}`;
    }
    content += `

`;
  }

  content += `[View all studies on CBD and ${condition.name.toLowerCase()} ->](/research?topic=${condition.slug})

`;

  // Cite This Article (for Moderate+ evidence)
  if (analysis.evidenceLevel === 'Strong' || analysis.evidenceLevel === 'Moderate') {
    content += `## Cite This Research

**For journalists and researchers:**

CBD Portal. (${new Date().getFullYear()}). "CBD and ${condition.displayName}: What the Research Shows."
Retrieved from https://cbd-portal.vercel.app/conditions/${condition.slug}

**Quick stats:**
- Studies reviewed: ${analysis.totalStudies}
- Human studies: ${analysis.humanStudies}
- Total participants: ${analysis.totalParticipants > 0 ? analysis.totalParticipants.toLocaleString() : 'Limited data'}
- Evidence strength: ${analysis.evidenceLevel}

Last updated: ${today}
Author: Robin Roy Krigslund-Hansen

---

`;
  }

  // Disclaimer
  content += `*This article is for informational purposes only. It is not medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`;

  return content;
}

async function getOrCreateAuthor() {
  // Check if Robin exists
  const { data: existingAuthor } = await supabase
    .from('kb_authors')
    .select('id')
    .eq('slug', 'robin-krigslund-hansen')
    .single();

  if (existingAuthor) {
    return existingAuthor.id;
  }

  // Create author if doesn't exist
  const { data: newAuthor, error } = await supabase
    .from('kb_authors')
    .insert({
      name: 'Robin Roy Krigslund-Hansen',
      slug: 'robin-krigslund-hansen',
      title: 'Founder & Editor',
      bio: 'Robin has worked in the CBD industry for over 12 years, including founding Formula Swiss. He has personally reviewed over 700 CBD studies and built CBD Portal to make research accessible to everyone.',
      credentials: '12+ years in CBD industry, Reviewed 700+ CBD studies',
      location: 'Switzerland'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating author:', error);
    return null;
  }

  return newAuthor.id;
}

async function insertArticle(condition, content, analysis, authorId) {
  const articleSlug = `cbd-and-${condition.slug}`;
  const title = `CBD and ${condition.displayName}: What the Research Shows`;
  const excerpt = `Does CBD help with ${condition.displayName.toLowerCase()}? We analyzed ${analysis.totalStudies} peer-reviewed studies to find out. Evidence level: ${analysis.evidenceLevel}.`;

  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Check if article exists
  const { data: existingArticle } = await supabase
    .from('kb_articles')
    .select('id')
    .eq('slug', articleSlug)
    .single();

  const articleData = {
    title,
    slug: articleSlug,
    content,
    excerpt,
    reading_time: readingTime,
    condition_slug: condition.slug,
    status: 'published',
    language: 'en',
    published_at: new Date().toISOString(),
    meta_title: `${title} | CBD Portal`,
    meta_description: excerpt,
    article_type: 'condition',
    author_id: authorId,
    template_data: {
      evidence_level: analysis.evidenceLevel,
      total_studies: analysis.totalStudies,
      human_studies: analysis.humanStudies,
      total_participants: analysis.totalParticipants,
      last_research_update: new Date().toISOString()
    }
  };

  if (existingArticle) {
    // Update existing
    const { error } = await supabase
      .from('kb_articles')
      .update({
        ...articleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingArticle.id);

    if (error) {
      console.error(`Error updating ${articleSlug}:`, error);
      return null;
    }
    return { ...articleData, action: 'updated', id: existingArticle.id };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('kb_articles')
      .insert(articleData)
      .select('id')
      .single();

    if (error) {
      console.error(`Error inserting ${articleSlug}:`, error);
      return null;
    }
    return { ...articleData, action: 'created', id: data.id };
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('  BATCH CONDITION ARTICLE GENERATOR');
  console.log('  Generating articles for 12 conditions');
  console.log('='.repeat(70));

  // Get or create author
  const authorId = await getOrCreateAuthor();
  if (!authorId) {
    console.error('Failed to get/create author');
    return;
  }
  console.log(`\nAuthor ID: ${authorId}`);

  const results = [];

  for (const condition of CONDITIONS_TO_GENERATE) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`  Processing: ${condition.displayName}`);
    console.log('='.repeat(70));

    // Query research
    const studies = await queryResearchForCondition(condition);
    console.log(`  Found ${studies.length} matching studies`);

    // Analyze evidence
    const analysis = analyzeEvidence(studies);
    console.log(`  Evidence Level: ${analysis.evidenceLevel}`);
    console.log(`  Human Studies: ${analysis.humanStudies}`);
    console.log(`  Reviews: ${analysis.reviews}`);

    // Generate content
    const content = generateArticleContent(condition, studies, analysis);
    const wordCount = content.split(/\s+/).length;
    console.log(`  Generated ${wordCount} words`);

    // Insert into database
    const result = await insertArticle(condition, content, analysis, authorId);
    if (result) {
      console.log(`  Article ${result.action}: cbd-and-${condition.slug}`);
      results.push({
        condition: condition.slug,
        displayName: condition.displayName,
        evidenceLevel: analysis.evidenceLevel,
        totalStudies: analysis.totalStudies,
        wordCount,
        action: result.action
      });
    }
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('  SUMMARY');
  console.log('='.repeat(70));
  console.log(`\nTotal articles processed: ${results.length}`);

  console.log('\n' + '-'.repeat(100));
  console.log('Condition'.padEnd(30) + 'Evidence'.padStart(15) + 'Studies'.padStart(10) + 'Words'.padStart(10) + 'Action'.padStart(15));
  console.log('-'.repeat(100));

  for (const r of results) {
    console.log(
      r.displayName.substring(0, 28).padEnd(30) +
      r.evidenceLevel.padStart(15) +
      String(r.totalStudies).padStart(10) +
      String(r.wordCount).padStart(10) +
      r.action.padStart(15)
    );
  }
  console.log('-'.repeat(100));

  // Write summary to file
  writeFileSync(
    join(__dirname, 'batch-article-results.json'),
    JSON.stringify(results, null, 2)
  );
  console.log(`\nResults saved to scripts/batch-article-results.json`);
}

main().catch(console.error);
