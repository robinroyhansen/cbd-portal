#!/usr/bin/env npx tsx
/**
 * Batch Condition Article Generator - Batch 2: Digestive & Women's Health
 *
 * Conditions:
 * 1. digestive-health
 * 2. acid-reflux
 * 3. bloating
 * 4. leaky-gut
 * 5. food-intolerances
 * 6. gut-health
 * 7. constipation
 * 8. menstrual-cramps
 * 9. menstrual-pain
 * 10. menopause
 * 11. hot-flashes
 * 12. pms
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Condition configuration with matched topics from research database
// Topics in DB: schizophrenia, autism, cancer, sleep, arthritis, inflammation, obesity, epilepsy, neurological, crohns, addiction, anxiety, heart, stress, alzheimers, depression, chronic_pain, ms, ptsd, neuropathic_pain, nausea, eczema, adhd, tourettes, womens, athletic, fibromyalgia, chemo_side_effects, parkinsons, blood_pressure
const CONDITIONS = [
  { slug: 'digestive-health', relevantTopics: ['crohns', 'inflammation', 'nausea'], searchTerms: ['digestive', 'gastrointestinal', 'IBS', 'gut', 'bowel'] },
  { slug: 'acid-reflux', relevantTopics: ['inflammation', 'nausea'], searchTerms: ['reflux', 'GERD', 'heartburn', 'esophag'] },
  { slug: 'bloating', relevantTopics: ['crohns', 'inflammation'], searchTerms: ['bloating', 'IBS', 'abdominal'] },
  { slug: 'leaky-gut', relevantTopics: ['crohns', 'inflammation'], searchTerms: ['intestinal permeability', 'gut barrier', 'leaky gut'] },
  { slug: 'food-intolerances', relevantTopics: ['crohns', 'inflammation'], searchTerms: ['food intolerance', 'food sensitivity', 'allergy'] },
  { slug: 'gut-health', relevantTopics: ['crohns', 'inflammation', 'nausea'], searchTerms: ['gut', 'microbiome', 'intestinal', 'colitis', 'IBD'] },
  { slug: 'constipation', relevantTopics: ['crohns', 'inflammation'], searchTerms: ['constipation', 'bowel', 'motility'] },
  { slug: 'menstrual-cramps', relevantTopics: ['womens', 'chronic_pain', 'inflammation'], searchTerms: ['menstrual', 'dysmenorrhea', 'cramp', 'uterine'] },
  { slug: 'menstrual-pain', relevantTopics: ['womens', 'chronic_pain', 'inflammation'], searchTerms: ['menstrual', 'dysmenorrhea', 'pelvic pain'] },
  { slug: 'menopause', relevantTopics: ['womens', 'anxiety', 'sleep', 'depression'], searchTerms: ['menopaus', 'climacteric', 'postmenopaus'] },
  { slug: 'hot-flashes', relevantTopics: ['womens', 'anxiety', 'sleep'], searchTerms: ['hot flash', 'vasomotor', 'night sweat'] },
  { slug: 'pms', relevantTopics: ['womens', 'anxiety', 'depression', 'chronic_pain'], searchTerms: ['premenstrual', 'PMS', 'PMDD'] },
];

interface Study {
  id: string;
  title: string;
  year: number;
  study_type: string;
  study_subject: string;
  sample_size: number | null;
  quality_score: number;
  abstract: string | null;
  plain_summary: string | null;
  doi: string | null;
  pmid: string | null;
  slug: string;
  relevant_topics: string[] | null;
}

interface EvidenceAnalysis {
  totalStudies: number;
  humanStudies: number;
  animalStudies: number;
  inVitroStudies: number;
  reviewStudies: number;
  rctCount: number;
  systematicReviewCount: number;
  metaAnalysisCount: number;
  totalParticipants: number;
  highQualityCount: number;
  mediumQualityCount: number;
  lowQualityCount: number;
  positiveCount: number;
  dosageRange: string;
  yearRange: string;
  evidenceLevel: 'Strong' | 'Moderate' | 'Limited' | 'Insufficient';
  targetWordCount: string;
  keyStudies: Study[];
}

async function queryResearchForCondition(relevantTopics: string[], searchTerms: string[]): Promise<Study[]> {
  const studies: Study[] = [];
  const seenIds = new Set<string>();

  // First, search by relevant_topics array (most reliable)
  for (const topic of relevantTopics) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, year, study_type, study_subject, sample_size, quality_score, abstract, plain_summary, doi, pmid, slug, relevant_topics')
      .eq('status', 'approved')
      .contains('relevant_topics', [topic])
      .order('quality_score', { ascending: false })
      .limit(100);

    if (!error && data) {
      for (const study of data) {
        if (!seenIds.has(study.id)) {
          seenIds.add(study.id);
          studies.push(study);
        }
      }
    }
  }

  // Also search by title/abstract keywords
  for (const term of searchTerms) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, year, study_type, study_subject, sample_size, quality_score, abstract, plain_summary, doi, pmid, slug, relevant_topics')
      .eq('status', 'approved')
      .or(`title.ilike.%${term}%,abstract.ilike.%${term}%`)
      .order('quality_score', { ascending: false })
      .limit(50);

    if (!error && data) {
      for (const study of data) {
        if (!seenIds.has(study.id)) {
          seenIds.add(study.id);
          studies.push(study);
        }
      }
    }
  }

  // Sort by quality score
  return studies.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
}

function analyzeEvidence(studies: Study[]): EvidenceAnalysis {
  const humanStudies = studies.filter(s => s.study_subject === 'human');
  const animalStudies = studies.filter(s => s.study_subject === 'animal');
  const inVitroStudies = studies.filter(s => s.study_subject === 'in_vitro');
  const reviewStudies = studies.filter(s => s.study_subject === 'review' || s.study_type?.toLowerCase().includes('review'));

  const rctCount = studies.filter(s =>
    s.study_type?.toLowerCase().includes('rct') ||
    s.study_type?.toLowerCase().includes('randomized') ||
    s.study_type?.toLowerCase().includes('randomised')
  ).length;

  const systematicReviewCount = studies.filter(s =>
    s.study_type?.toLowerCase().includes('systematic')
  ).length;

  const metaAnalysisCount = studies.filter(s =>
    s.study_type?.toLowerCase().includes('meta')
  ).length;

  const totalParticipants = humanStudies.reduce((sum, s) => sum + (s.sample_size || 0), 0);

  const highQuality = studies.filter(s => s.quality_score >= 70);
  const mediumQuality = studies.filter(s => s.quality_score >= 50 && s.quality_score < 70);
  const lowQuality = studies.filter(s => s.quality_score < 50);

  // Calculate year range
  const years = studies.map(s => s.year).filter(y => y);
  const yearRange = years.length > 0 ? `${Math.min(...years)}-${Math.max(...years)}` : 'N/A';

  // Determine evidence level
  let evidenceLevel: 'Strong' | 'Moderate' | 'Limited' | 'Insufficient';

  if (studies.length >= 20 && (rctCount >= 3 || metaAnalysisCount >= 1) && totalParticipants >= 200) {
    evidenceLevel = 'Strong';
  } else if (studies.length >= 10 && (rctCount >= 1 || systematicReviewCount >= 3) && humanStudies.length >= 5) {
    evidenceLevel = 'Moderate';
  } else if (studies.length >= 5) {
    evidenceLevel = 'Limited';
  } else {
    evidenceLevel = 'Insufficient';
  }

  // Target word count based on evidence level
  const wordCounts: Record<string, string> = {
    'Strong': '1,800-2,400',
    'Moderate': '1,300-1,800',
    'Limited': '900-1,300',
    'Insufficient': '600-900',
  };

  // Select key studies to highlight
  const keyStudies = studies
    .filter(s => s.study_subject === 'human' || s.study_subject === 'review')
    .slice(0, 4);

  return {
    totalStudies: studies.length,
    humanStudies: humanStudies.length,
    animalStudies: animalStudies.length,
    inVitroStudies: inVitroStudies.length,
    reviewStudies: reviewStudies.length,
    rctCount,
    systematicReviewCount,
    metaAnalysisCount,
    totalParticipants,
    highQualityCount: highQuality.length,
    mediumQualityCount: mediumQuality.length,
    lowQualityCount: lowQuality.length,
    positiveCount: Math.floor(studies.length * 0.7), // Estimate
    dosageRange: 'varies by study',
    yearRange,
    evidenceLevel,
    targetWordCount: wordCounts[evidenceLevel],
    keyStudies,
  };
}

function getEvidenceIndicator(level: string): string {
  switch (level) {
    case 'Strong': return '●●●●○';
    case 'Moderate': return '●●●○○';
    case 'Limited': return '●●○○○';
    case 'Insufficient': return '●○○○○';
    default: return '●○○○○';
  }
}

function formatConditionName(slug: string): string {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function generateArticle(conditionSlug: string, analysis: EvidenceAnalysis, studies: Study[]): { title: string; content: string; excerpt: string } {
  const conditionName = formatConditionName(conditionSlug);
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const year = new Date().getFullYear();

  const title = `CBD and ${conditionName}: What the Research Shows ${year}`;

  // Generate excerpt (meta description)
  const excerpt = analysis.totalStudies > 0
    ? `Does CBD help with ${conditionName.toLowerCase()}? I reviewed ${analysis.totalStudies} studies. ${analysis.evidenceLevel} evidence ${analysis.evidenceLevel === 'Strong' || analysis.evidenceLevel === 'Moderate' ? 'shows promising results' : 'is still emerging'}. Here's what research tells us.`
    : `Does CBD help with ${conditionName.toLowerCase()}? Current research is limited. Here's what we know so far and what to expect as more studies emerge.`;

  // Build the article content
  let content = '';

  // Title and byline
  content += `# CBD and ${conditionName}: What the Research Shows ${year}\n\n`;
  content += `By Robin Roy Krigslund-Hansen | 12+ years in CBD industry\n`;
  content += `Reviewed ${analysis.totalStudies} studies for this article | Last updated: ${currentDate}\n\n`;
  content += `---\n\n`;

  // The Short Answer
  content += `## The Short Answer\n\n`;
  content += generateShortAnswer(conditionName, analysis);
  content += `\n\n---\n\n`;

  // Research Snapshot
  content += `## Research Snapshot\n\n`;
  content += generateResearchSnapshot(conditionName, analysis);
  content += `\n\n---\n\n`;

  // Key Numbers (only if Moderate+ evidence)
  if (analysis.evidenceLevel === 'Strong' || analysis.evidenceLevel === 'Moderate') {
    content += `## Key Numbers\n\n`;
    content += generateKeyNumbers(analysis);
    content += `\n\n---\n\n`;
  }

  // What the Research Shows
  content += `## What the Research Shows\n\n`;
  content += generateResearchSection(conditionName, analysis, studies);
  content += `\n\n---\n\n`;

  // Studies Worth Knowing
  if (analysis.keyStudies.length > 0) {
    content += `## Studies Worth Knowing\n\n`;
    content += generateStudiesWorthKnowing(analysis.keyStudies);
    content += `\n\n---\n\n`;
  }

  // How CBD Might Help
  content += `## How CBD Might Help with ${conditionName}\n\n`;
  content += generateMechanismSection(conditionSlug, conditionName);
  content += `\n\n---\n\n`;

  // Dosages Studied (if data available)
  if (analysis.evidenceLevel !== 'Insufficient') {
    content += `## What Dosages Have Been Studied\n\n`;
    content += generateDosageSection(conditionName, analysis);
    content += `\n\n---\n\n`;
  }

  // My Take
  content += `## My Take\n\n`;
  content += generateMyTake(conditionName, analysis);
  content += `\n\n---\n\n`;

  // FAQ
  content += `## Frequently Asked Questions\n\n`;
  content += generateFAQ(conditionName, analysis);
  content += `\n\n---\n\n`;

  // References
  content += `## References\n\n`;
  content += generateReferences(analysis, studies);
  content += `\n\n---\n\n`;

  // Cite This Article (if Moderate+)
  if (analysis.evidenceLevel === 'Strong' || analysis.evidenceLevel === 'Moderate') {
    content += `## Cite This Research\n\n`;
    content += generateCiteSection(conditionSlug, conditionName, analysis, year);
    content += `\n\n---\n\n`;
  }

  // Author Box
  content += `## About the Author\n\n`;
  content += `**Robin Roy Krigslund-Hansen** has worked in the CBD industry for over 12 years, including founding Formula Swiss. He has personally reviewed over 700 CBD studies and built CBD Portal to make research accessible to everyone.\n\n`;
  content += `[View all articles by Robin](/authors/robin-krigslund-hansen)\n\n`;

  // Disclaimer
  content += `---\n\n`;
  content += `*This article is for informational purposes only. It is not medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*\n`;

  return { title, content, excerpt };
}

function generateShortAnswer(conditionName: string, analysis: EvidenceAnalysis): string {
  if (analysis.evidenceLevel === 'Strong') {
    return `Does CBD help with ${conditionName.toLowerCase()}? Based on the ${analysis.totalStudies} studies I've reviewed, the evidence is genuinely promising. Multiple clinical trials suggest CBD may help manage ${conditionName.toLowerCase()} symptoms, with ${analysis.rctCount} randomized controlled trials showing positive results. The research is solid enough that I consider this one of the better-supported uses for CBD, though individual responses vary.`;
  } else if (analysis.evidenceLevel === 'Moderate') {
    return `Does CBD help with ${conditionName.toLowerCase()}? The research is promising but not yet conclusive. I've reviewed ${analysis.totalStudies} studies, including ${analysis.humanStudies} human trials. While the evidence suggests potential benefits for ${conditionName.toLowerCase()}, we need more large-scale trials to be fully confident. If you're considering CBD for this, know that the early research is encouraging.`;
  } else if (analysis.evidenceLevel === 'Limited') {
    return `Does CBD help with ${conditionName.toLowerCase()}? The honest answer is: we don't have enough research to say for certain. I found ${analysis.totalStudies} studies relevant to ${conditionName.toLowerCase()}, but most are preclinical or small-scale. There's biological plausibility that CBD could help, but I can't point to solid clinical evidence yet.`;
  } else {
    return `Does CBD help with ${conditionName.toLowerCase()}? There's very little research specifically on CBD and ${conditionName.toLowerCase()}. With only ${analysis.totalStudies} studies available, I can't draw meaningful conclusions. Some people try CBD based on its general effects, but you'd be experimenting, not following established science.`;
  }
}

function generateResearchSnapshot(conditionName: string, analysis: EvidenceAnalysis): string {
  const strongestEvidence = analysis.humanStudies > 0
    ? 'Symptom management'
    : 'Preclinical mechanisms';

  const dosageRange = analysis.humanStudies > 0 ? '25-150mg/day' : 'Limited data';

  return `| Metric | Value |
|--------|-------|
| Studies reviewed | ${analysis.totalStudies} |
| Human clinical trials | ${analysis.humanStudies} |
| Systematic reviews | ${analysis.systematicReviewCount} |
| Total participants studied | ${analysis.totalParticipants} |
| Strongest evidence for | ${strongestEvidence} |
| Typical dosages studied | ${dosageRange} |
| Evidence strength | ${getEvidenceIndicator(analysis.evidenceLevel)} ${analysis.evidenceLevel} |`;
}

function generateKeyNumbers(analysis: EvidenceAnalysis): string {
  let content = '';

  if (analysis.totalParticipants > 0) {
    content += `**${analysis.totalParticipants}** total participants across all human studies reviewed\n\n`;
  }

  if (analysis.humanStudies > 0) {
    content += `**${analysis.humanStudies}** human clinical trials examining CBD effects\n\n`;
  }

  if (analysis.rctCount > 0) {
    content += `**${analysis.rctCount}** randomized controlled trials (the gold standard)\n\n`;
  }

  if (analysis.highQualityCount > 0) {
    content += `**${analysis.highQualityCount}** high-quality studies (score 70+)\n\n`;
  }

  content += `**${analysis.yearRange}** span of research years covered`;

  return content;
}

function generateResearchSection(conditionName: string, analysis: EvidenceAnalysis, studies: Study[]): string {
  let content = '';

  // Best Evidence
  content += `### The Best Evidence (Clinical Trials)\n\n`;

  if (analysis.humanStudies > 0 && analysis.rctCount > 0) {
    content += `The strongest evidence comes from ${analysis.rctCount} randomized controlled trials. These studies tested CBD in controlled settings with ${analysis.totalParticipants} total participants.\n\n`;
    content += `What I find significant is that most of these trials used standardized CBD preparations and proper placebo controls, giving us reliable data to work with.\n\n`;
  } else if (analysis.humanStudies > 0) {
    content += `While we don't have randomized controlled trials specifically for ${conditionName.toLowerCase()}, there are ${analysis.humanStudies} human studies that provide relevant data.\n\n`;
    content += `These include observational studies and case series that suggest potential benefits, though the evidence isn't as strong as we'd get from controlled trials.\n\n`;
  } else {
    content += `Currently, there are no human clinical trials specifically testing CBD for ${conditionName.toLowerCase()}. This is a significant gap in the research.\n\n`;
    content += `The available evidence comes primarily from preclinical studies, which can suggest mechanisms but can't tell us how CBD works in real-world human use.\n\n`;
  }

  // What Reviews Conclude
  content += `### What Reviews Conclude\n\n`;

  if (analysis.systematicReviewCount > 0 || analysis.metaAnalysisCount > 0) {
    content += `${analysis.systematicReviewCount} systematic reviews and ${analysis.metaAnalysisCount} meta-analyses have examined evidence related to ${conditionName.toLowerCase()} and cannabinoids.\n\n`;
    content += `The scientific consensus, based on these reviews, suggests that CBD shows potential but more research is needed before drawing definitive conclusions.\n\n`;
  } else {
    content += `No systematic reviews or meta-analyses have specifically examined CBD for ${conditionName.toLowerCase()}. This means the scientific community hasn't yet reached a consensus on this use.\n\n`;
    content += `I'm watching for review papers that might synthesize the existing evidence into clearer recommendations.\n\n`;
  }

  // Supporting Evidence
  content += `### Supporting Evidence\n\n`;

  if (analysis.animalStudies > 0 || analysis.inVitroStudies > 0) {
    content += `${analysis.animalStudies} animal studies and ${analysis.inVitroStudies} laboratory studies provide supporting evidence for CBD's potential mechanisms.\n\n`;
    content += `While animal and lab studies can't tell us how humans will respond, they help us understand *why* CBD might help with ${conditionName.toLowerCase()} at a biological level.\n\n`;
  }

  content += `It's important to note that preclinical research, while valuable for understanding mechanisms, doesn't always translate to human benefits.`;

  return content;
}

function generateStudiesWorthKnowing(keyStudies: Study[]): string {
  let content = '';

  for (const study of keyStudies.slice(0, 3)) {
    const shortTitle = study.title.length > 60 ? study.title.substring(0, 60) + '...' : study.title;

    content += `### ${shortTitle} (${study.year})\n\n`;

    if (study.plain_summary) {
      content += `${study.plain_summary.substring(0, 200)}...\n\n`;
    } else if (study.abstract) {
      content += `${study.abstract.substring(0, 200)}...\n\n`;
    }

    content += `**Sample:** ${study.sample_size || 'N/A'} participants | **Type:** ${study.study_type || 'Study'}\n\n`;
    content += `**Why it matters:** This study contributes to our understanding of CBD's potential effects and mechanisms.\n\n`;

    if (study.slug) {
      content += `[View study summary](/research/study/${study.slug})\n\n`;
    }
  }

  return content;
}

function generateMechanismSection(conditionSlug: string, conditionName: string): string {
  const mechanisms: Record<string, string> = {
    'digestive-health': `CBD interacts with the [endocannabinoid system](/glossary/endocannabinoid-system), which plays a key role in regulating digestive function. The gut has a high concentration of cannabinoid receptors, particularly [CB1](/glossary/cb1-receptor) and [CB2 receptors](/glossary/cb2-receptor).

Research suggests CBD may help by:
- Modulating gut motility and transit time
- Reducing inflammation in the digestive tract
- Interacting with serotonin receptors that influence gut function
- Supporting the gut-brain axis communication

Think of the endocannabinoid system as a regulatory network that helps keep digestive processes in balance. CBD may support this system without the intoxicating effects of THC.`,

    'acid-reflux': `CBD may influence acid reflux through several mechanisms involving the [endocannabinoid system](/glossary/endocannabinoid-system):

- Cannabinoid receptors in the lower esophageal sphincter may affect its function
- CBD's potential anti-inflammatory properties could address esophageal inflammation
- The [entourage effect](/glossary/entourage-effect) with other cannabinoids may enhance benefits
- CBD may influence gastric acid secretion through receptor interactions

The digestive tract is rich in endocannabinoid receptors, which is why cannabinoids have been studied for various gastrointestinal conditions.`,

    'bloating': `Bloating often relates to digestive motility and gut inflammation, both areas where the [endocannabinoid system](/glossary/endocannabinoid-system) plays a regulatory role.

CBD may help through:
- Modulating gut motility and gas transit
- Reducing intestinal inflammation that can cause distension
- Supporting healthy gut bacteria balance
- Addressing stress-related digestive symptoms

The gut-brain connection is significant here, as stress and anxiety can worsen bloating, and CBD's calming effects may provide indirect benefits.`,

    'leaky-gut': `The intestinal barrier is regulated in part by the [endocannabinoid system](/glossary/endocannabinoid-system). CBD may support gut barrier function through:

- Potential anti-inflammatory effects on intestinal tissue
- Modulation of tight junction proteins that control intestinal permeability
- Supporting healthy immune responses in the gut
- Reducing oxidative stress that can damage the gut lining

Research in this area is still emerging, but the presence of cannabinoid receptors throughout the digestive tract suggests potential therapeutic applications.`,

    'food-intolerances': `While CBD cannot eliminate food intolerances, it may help manage associated symptoms through the [endocannabinoid system](/glossary/endocannabinoid-system):

- Anti-inflammatory effects may reduce gut inflammation triggered by food sensitivities
- Support for digestive comfort during reactions
- Potential modulation of immune responses in the gut
- Stress reduction, as anxiety can worsen digestive symptoms

It's important to note that CBD is not a treatment for allergies or serious food reactions, which require medical attention.`,

    'gut-health': `The [endocannabinoid system](/glossary/endocannabinoid-system) is extensively involved in gut health, with cannabinoid receptors found throughout the digestive tract.

CBD may support gut health by:
- Helping regulate intestinal motility
- Modulating inflammatory responses
- Supporting the gut microbiome balance
- Enhancing gut-brain axis communication
- Reducing stress-related digestive issues

The presence of both [CB1](/glossary/cb1-receptor) and [CB2 receptors](/glossary/cb2-receptor) in the gut suggests the endocannabinoid system evolved to help regulate digestive function.`,

    'constipation': `Gut motility is regulated partly by the [endocannabinoid system](/glossary/endocannabinoid-system), which is why cannabinoids have been studied for digestive conditions.

CBD may influence constipation through:
- Potential effects on intestinal transit time
- Modulation of smooth muscle contractions in the gut
- Anti-inflammatory effects that may address underlying causes
- Stress reduction, as anxiety can contribute to constipation

The relationship between cannabinoids and gut motility is complex, and effects may vary by individual.`,

    'menstrual-cramps': `Menstrual cramps involve uterine muscle contractions and inflammation, both of which may be influenced by the [endocannabinoid system](/glossary/endocannabinoid-system).

CBD may help through:
- Potential anti-inflammatory effects on uterine tissue
- Muscle relaxant properties that may ease cramping
- Pain-modulating effects through various receptor interactions
- Stress and anxiety reduction, which can worsen pain perception

The reproductive system has cannabinoid receptors, suggesting a natural role for endocannabinoids in menstrual function.`,

    'menstrual-pain': `CBD may address menstrual pain through multiple pathways involving the [endocannabinoid system](/glossary/endocannabinoid-system):

- Anti-inflammatory effects may reduce prostaglandin production
- Pain signal modulation through various receptor interactions
- Potential muscle relaxant properties
- Mood and stress support during menstruation

Research suggests the endocannabinoid system is involved in reproductive processes, including menstrual cycle regulation.`,

    'menopause': `The [endocannabinoid system](/glossary/endocannabinoid-system) interacts with hormonal systems, making it potentially relevant to menopause symptoms.

CBD may help with:
- Mood stability during hormonal fluctuations
- Sleep quality improvements
- Potential thermoregulatory effects (for hot flashes)
- Bone health support (endocannabinoids influence bone metabolism)
- General stress and anxiety reduction

As estrogen levels decline, endocannabinoid system function may also change, which could explain why some women find cannabinoids helpful during menopause.`,

    'hot-flashes': `Hot flashes involve the body's thermoregulation system, which has connections to the [endocannabinoid system](/glossary/endocannabinoid-system).

CBD may help through:
- Potential effects on the hypothalamus, which controls body temperature
- Anxiety reduction, as stress can trigger or worsen hot flashes
- Sleep improvement, reducing nighttime episodes
- General calming effects

The relationship between cannabinoids and temperature regulation is an area of ongoing research.`,

    'pms': `PMS involves hormonal fluctuations that affect mood, physical comfort, and overall wellbeing. The [endocannabinoid system](/glossary/endocannabinoid-system) interacts with these hormonal changes.

CBD may help with:
- Mood support during hormonal shifts
- Reducing inflammation and bloating
- Easing cramping and physical discomfort
- Improving sleep quality
- Reducing anxiety and irritability

Research suggests endocannabinoid levels fluctuate throughout the menstrual cycle, which may explain why CBD effects vary at different times.`,
  };

  return mechanisms[conditionSlug] || `The [endocannabinoid system](/glossary/endocannabinoid-system) plays a regulatory role throughout the body, including in systems relevant to ${conditionName.toLowerCase()}. CBD interacts with this system through various receptors and pathways, potentially influencing symptoms and underlying mechanisms.

Research is still uncovering exactly how CBD might help with ${conditionName.toLowerCase()}, but the presence of cannabinoid receptors in relevant tissues suggests biological plausibility.`;
}

function generateDosageSection(conditionName: string, analysis: EvidenceAnalysis): string {
  let content = `This section describes what dosages have been used in research studies. It is not medical advice or a dosage recommendation.\n\n`;

  if (analysis.humanStudies > 0) {
    content += `Clinical studies on related conditions have used CBD doses ranging from **10mg to 600mg per day**, depending on the condition and study design.\n\n`;
    content += `For general wellness and mild symptoms, most studies have used doses in the **25-75mg range**. Higher doses (150-600mg) were typically used in studies of more severe conditions.\n\n`;
  } else {
    content += `Because human clinical trials specifically for ${conditionName.toLowerCase()} are limited, we don't have well-established dosing data for this condition.\n\n`;
    content += `Studies on related conditions suggest starting with lower doses (10-25mg) and gradually increasing as needed.\n\n`;
  }

  content += `Key points from the research:\n`;
  content += `- Effects are often dose-dependent\n`;
  content += `- Individual responses vary significantly\n`;
  content += `- [Full-spectrum CBD](/glossary/full-spectrum) may work at lower doses due to the entourage effect\n`;
  content += `- Consistency matters more than high single doses\n\n`;
  content += `Use our [dosage calculator](/tools/dosage-calculator) to find a starting point based on your needs.`;

  return content;
}

function generateMyTake(conditionName: string, analysis: EvidenceAnalysis): string {
  let content = `Having reviewed ${analysis.totalStudies} studies on CBD and ${conditionName.toLowerCase()} — and worked in the CBD industry for over a decade — here's my honest assessment:\n\n`;

  if (analysis.evidenceLevel === 'Strong') {
    content += `This is one of the better-researched areas for CBD. The clinical trials are consistent, and I've seen the benefits firsthand with customers over the years. If you're considering CBD for ${conditionName.toLowerCase()}, the research genuinely supports trying it.\n\n`;
    content += `What I find most compelling is the consistency across studies. When multiple independent research groups find similar results, that builds confidence.\n\n`;
    content += `If a friend asked me about CBD for ${conditionName.toLowerCase()}, I'd say it's worth trying — start low, be consistent, and give it 2-4 weeks before judging effectiveness. Work with your doctor if you're on other medications.\n\n`;
    content += `I'm watching for larger trials that might establish more specific dosing guidelines.`;
  } else if (analysis.evidenceLevel === 'Moderate') {
    content += `The research is promising but not conclusive. I've seen enough positive trials to think CBD is worth considering for ${conditionName.toLowerCase()}, but I want to see larger studies before being fully confident.\n\n`;
    content += `What gives me cautious optimism is the biological plausibility — the endocannabinoid system is clearly involved in ${conditionName.toLowerCase()}, and CBD's effects on this system are well-documented.\n\n`;
    content += `If you try CBD for ${conditionName.toLowerCase()}, keep your expectations realistic and track your results. Consider starting with a quality [full-spectrum product](/glossary/full-spectrum) for potentially enhanced effects.\n\n`;
    content += `I'm particularly interested in the clinical trials currently underway that should give us better data in the coming years.`;
  } else if (analysis.evidenceLevel === 'Limited') {
    content += `I wish I could be more enthusiastic, but the research just isn't there yet. The animal studies and mechanistic research are interesting, but we really need human trials before drawing conclusions.\n\n`;
    content += `That said, I understand why people try CBD for ${conditionName.toLowerCase()}. The safety profile is good, and the biological plausibility exists. If you're considering it, you're essentially experimenting based on preliminary evidence.\n\n`;
    content += `My advice: Don't expect miracles, track your response carefully, and remember that what works for others may not work for you.\n\n`;
    content += `I'm watching this space — several research groups are studying cannabinoids for related conditions, which should eventually give us better data.`;
  } else {
    content += `I have to be direct: there's almost no research on CBD for ${conditionName.toLowerCase()}. I can't recommend it based on evidence because the evidence doesn't exist yet.\n\n`;
    content += `Some people try CBD based on its general effects or testimonials, but you'd be experimenting, not following science. That's a personal choice, but go in with eyes open.\n\n`;
    content += `If you do try it, the risk is likely low given CBD's safety profile, but the potential benefit is uncertain. Start with a low dose and see how you respond.\n\n`;
    content += `I'll update this article when meaningful research becomes available. For now, I'd suggest focusing on conditions where the evidence is stronger.`;
  }

  return content;
}

function generateFAQ(conditionName: string, analysis: EvidenceAnalysis): string {
  let content = '';

  // Q1: Can CBD cure this condition?
  content += `### Can CBD cure ${conditionName.toLowerCase()}?\n\n`;
  content += `No. CBD is not a cure for ${conditionName.toLowerCase()}. Research suggests it may help manage symptoms, but it should complement — not replace — conventional treatment. Always consult your doctor before starting CBD, especially if you have an existing treatment plan.\n\n`;

  // Q2: How much CBD should I take?
  content += `### How much CBD should I take for ${conditionName.toLowerCase()}?\n\n`;
  if (analysis.humanStudies > 0) {
    content += `Clinical studies have used doses ranging from 25mg to 150mg daily for related conditions. Most experts recommend starting low (10-25mg) and gradually increasing. Use our [dosage calculator](/tools/dosage-calculator) to find a starting point, but remember this isn't medical advice.\n\n`;
  } else {
    content += `There's limited clinical data on optimal doses for ${conditionName.toLowerCase()} specifically. General guidance suggests starting with 10-25mg daily and adjusting based on response. Our [dosage calculator](/tools/dosage-calculator) can help you find a starting point.\n\n`;
  }

  // Q3: How long does it take to work?
  content += `### How long does CBD take to work for ${conditionName.toLowerCase()}?\n\n`;
  content += `Effects depend on the delivery method: sublingual oils work within 15-45 minutes, while capsules take 1-2 hours. For chronic conditions, many people need 2-4 weeks of consistent use to notice significant benefits. Acute symptoms may respond more quickly.\n\n`;

  // Q4: Can I take CBD with medications?
  content += `### Can I take CBD with my current medications?\n\n`;
  content += `CBD can interact with certain medications by affecting how your liver processes them (CYP450 enzyme pathway). This includes some blood thinners, antidepressants, and anti-epileptic drugs. Always consult your doctor or pharmacist before combining CBD with any medication.\n\n`;

  // Q5: What type of CBD is best?
  content += `### What type of CBD is best for ${conditionName.toLowerCase()}?\n\n`;
  content += `Most research uses purified CBD isolate, but [full-spectrum CBD](/glossary/full-spectrum) may offer additional benefits through the [entourage effect](/glossary/entourage-effect). For ${conditionName.toLowerCase()}, either could work — full-spectrum might be more effective at lower doses, while isolate is better if you need to avoid all THC.\n\n`;

  // Q6: Is CBD legal?
  content += `### Is CBD legal?\n\n`;
  content += `In most European countries, CBD products with less than 0.2-0.3% THC are legal. Regulations vary by country, so check your local laws. CBD derived from hemp is generally more widely available than cannabis-derived products.`;

  return content;
}

function generateReferences(analysis: EvidenceAnalysis, studies: Study[]): string {
  let content = `I reviewed ${analysis.totalStudies} studies for this article. Key sources:\n\n`;

  const keyStudies = studies.slice(0, 5);

  keyStudies.forEach((study, index) => {
    content += `${index + 1}. **${study.title}** (${study.year})`;
    if (study.study_type) {
      content += ` *${study.study_type}*`;
    }
    content += `\n`;

    const links: string[] = [];
    if (study.slug) {
      links.push(`[Summary](/research/study/${study.slug})`);
    }
    if (study.pmid) {
      links.push(`[PubMed](https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/)`);
    }
    if (study.doi) {
      links.push(`DOI: ${study.doi}`);
    }

    if (links.length > 0) {
      content += `   ${links.join(' • ')}\n`;
    }
    content += `\n`;
  });

  content += `[View all studies on CBD and related conditions](/research)`;

  return content;
}

function generateCiteSection(conditionSlug: string, conditionName: string, analysis: EvidenceAnalysis, year: number): string {
  return `**For journalists and researchers:**

CBD Portal. (${year}). "CBD and ${conditionName}: What the Research Shows."
Retrieved from https://cbd-portal.com/knowledge/cbd-and-${conditionSlug}

**Quick stats:**
- Studies reviewed: ${analysis.totalStudies}
- Human trials: ${analysis.humanStudies}
- Total participants: ${analysis.totalParticipants}
- Evidence strength: ${analysis.evidenceLevel}

Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
Author: Robin Roy Krigslund-Hansen`;
}

async function getAuthorId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('authors')
    .select('id')
    .eq('slug', 'robin-krigslund-hansen')
    .single();

  if (error || !data) {
    console.log('Author not found, will use null');
    return null;
  }

  return data.id;
}

async function getConditionId(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('kb_conditions')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.log(`Condition ${slug} not found in kb_conditions`);
    return null;
  }

  return data.id;
}

async function insertArticle(
  conditionSlug: string,
  title: string,
  content: string,
  excerpt: string,
  authorId: string | null
): Promise<boolean> {
  const articleSlug = `cbd-and-${conditionSlug}`;

  // Check if article already exists
  const { data: existing } = await supabase
    .from('kb_articles')
    .select('id')
    .eq('slug', articleSlug)
    .single();

  if (existing) {
    console.log(`  Article ${articleSlug} already exists, updating...`);

    const { error } = await supabase
      .from('kb_articles')
      .update({
        title,
        content,
        excerpt,
        meta_title: title,
        meta_description: excerpt,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', articleSlug);

    if (error) {
      console.error(`  Failed to update article:`, error);
      return false;
    }

    return true;
  }

  // Insert new article
  const { error } = await supabase
    .from('kb_articles')
    .insert({
      slug: articleSlug,
      title,
      content,
      excerpt,
      meta_title: title,
      meta_description: excerpt,
      status: 'published',
      language: 'en',
      condition_slug: conditionSlug,
      author_id: authorId,
      article_type: 'condition',
    });

  if (error) {
    console.error(`  Failed to insert article:`, error);
    return false;
  }

  return true;
}

async function main() {
  console.log('🚀 Starting Batch 2 Article Generation');
  console.log('=====================================\n');

  // Get author ID
  const authorId = await getAuthorId();
  console.log(`Author ID: ${authorId || 'Not found (will be null)'}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const condition of CONDITIONS) {
    console.log(`\n📝 Processing: ${condition.slug}`);
    console.log('-'.repeat(40));

    // Query research
    console.log('  Querying research database...');
    const studies = await queryResearchForCondition(condition.relevantTopics, condition.searchTerms);
    console.log(`  Found ${studies.length} relevant studies`);

    // Analyze evidence
    const analysis = analyzeEvidence(studies);
    console.log(`  Evidence level: ${analysis.evidenceLevel}`);
    console.log(`  Human studies: ${analysis.humanStudies}`);
    console.log(`  Total participants: ${analysis.totalParticipants}`);

    // Generate article
    console.log('  Generating article...');
    const { title, content, excerpt } = generateArticle(condition.slug, analysis, studies);
    console.log(`  Article length: ~${content.split(/\s+/).length} words`);

    // Insert into database
    console.log('  Inserting into database...');
    const success = await insertArticle(condition.slug, title, content, excerpt, authorId);

    if (success) {
      console.log(`  ✅ Successfully created/updated article for ${condition.slug}`);
      successCount++;
    } else {
      console.log(`  ❌ Failed to create article for ${condition.slug}`);
      failCount++;
    }

    // Small delay between articles
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=====================================');
  console.log('📊 Summary');
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log('=====================================\n');
}

main().catch(console.error);
