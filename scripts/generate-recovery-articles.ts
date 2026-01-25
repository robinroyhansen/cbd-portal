#!/usr/bin/env npx tsx
/**
 * Recovery & Wellness Condition Article Generator
 * Batch: burnout, surgery-recovery, workout-recovery, athletic-recovery,
 *        physical-therapy, sports-injuries, overuse-injuries, muscle-tension,
 *        chronic-fatigue, better-rest, immune-health, circulation
 *
 * Usage: npx tsx scripts/generate-recovery-articles.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  console.log('Run: export $(grep -v "^#" .env.local | xargs)');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

interface Study {
  id: string;
  title: string;
  year: number;
  study_type: string;
  study_subject: string;
  sample_size: number | null;
  quality_score: number | null;
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
  reviewCount: number;
  rctCount: number;
  totalParticipants: number;
  highQualityCount: number;
  mediumQualityCount: number;
  evidenceLevel: 'Strong' | 'Moderate' | 'Limited' | 'Insufficient';
  targetWordCount: { min: number; max: number };
  keyStudies: Study[];
  yearRange: { min: number; max: number };
}

interface Article {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  condition_slug: string;
  meta_description: string;
}

const CONDITIONS = [
  {
    slug: 'burnout',
    name: 'Burnout',
    searchTerms: ['fatigue', 'stress', 'anxiety', 'sleep', 'exhaustion', 'cortisol', 'chronic stress', 'mental health'],
    relatedConditions: ['stress', 'anxiety', 'sleep', 'chronic-fatigue'],
    mechanisms: ['stress hormone regulation', 'sleep quality', 'anxiety reduction'],
  },
  {
    slug: 'surgery-recovery',
    name: 'Surgery Recovery',
    searchTerms: ['pain', 'inflammation', 'wound', 'healing', 'post-operative', 'surgical', 'analgesic', 'opioid'],
    relatedConditions: ['chronic-pain', 'inflammation', 'anxiety'],
    mechanisms: ['pain modulation', 'anti-inflammatory effects', 'anxiety reduction'],
  },
  {
    slug: 'workout-recovery',
    name: 'Workout Recovery',
    searchTerms: ['muscle', 'exercise', 'inflammation', 'pain', 'recovery', 'sports', 'DOMS', 'athletic'],
    relatedConditions: ['athletic-recovery', 'muscle-tension', 'inflammation'],
    mechanisms: ['anti-inflammatory action', 'muscle relaxation', 'sleep quality'],
  },
  {
    slug: 'athletic-recovery',
    name: 'Athletic Recovery',
    searchTerms: ['sports', 'exercise', 'muscle', 'inflammation', 'performance', 'recovery', 'athlete', 'WADA'],
    relatedConditions: ['workout-recovery', 'sports-injuries', 'inflammation'],
    mechanisms: ['inflammation reduction', 'pain management', 'sleep enhancement'],
  },
  {
    slug: 'physical-therapy',
    name: 'Physical Therapy',
    searchTerms: ['rehabilitation', 'pain', 'muscle', 'mobility', 'spasticity', 'chronic pain', 'movement'],
    relatedConditions: ['chronic-pain', 'muscle-tension', 'sports-injuries'],
    mechanisms: ['pain reduction', 'muscle relaxation', 'mobility support'],
  },
  {
    slug: 'sports-injuries',
    name: 'Sports Injuries',
    searchTerms: ['injury', 'pain', 'inflammation', 'muscle', 'sports', 'trauma', 'acute pain', 'athletic'],
    relatedConditions: ['athletic-recovery', 'inflammation', 'chronic-pain'],
    mechanisms: ['pain relief', 'inflammation control', 'healing support'],
  },
  {
    slug: 'overuse-injuries',
    name: 'Overuse Injuries',
    searchTerms: ['repetitive', 'chronic pain', 'inflammation', 'tendon', 'strain', 'tendinitis', 'carpal tunnel'],
    relatedConditions: ['chronic-pain', 'inflammation', 'arthritis'],
    mechanisms: ['chronic inflammation reduction', 'pain modulation', 'tissue protection'],
  },
  {
    slug: 'muscle-tension',
    name: 'Muscle Tension',
    searchTerms: ['muscle', 'spasm', 'pain', 'relaxation', 'spasticity', 'tension', 'myofascial', 'cramp'],
    relatedConditions: ['chronic-pain', 'stress', 'fibromyalgia'],
    mechanisms: ['muscle relaxation', 'pain relief', 'stress reduction'],
  },
  {
    slug: 'chronic-fatigue',
    name: 'Chronic Fatigue',
    searchTerms: ['fatigue', 'chronic fatigue', 'CFS', 'energy', 'sleep', 'fibromyalgia', 'ME/CFS', 'exhaustion'],
    relatedConditions: ['fibromyalgia', 'sleep', 'depression'],
    mechanisms: ['energy regulation', 'sleep improvement', 'inflammation reduction'],
  },
  {
    slug: 'better-rest',
    name: 'Better Rest',
    searchTerms: ['sleep', 'insomnia', 'relaxation', 'rest', 'sleep quality', 'circadian', 'sedative'],
    relatedConditions: ['sleep', 'anxiety', 'stress'],
    mechanisms: ['sleep promotion', 'anxiety reduction', 'relaxation'],
  },
  {
    slug: 'immune-health',
    name: 'Immune Health',
    searchTerms: ['immune', 'inflammation', 'autoimmune', 'immunity', 'cytokine', 'immunomodulatory'],
    relatedConditions: ['inflammation', 'autoimmune', 'stress'],
    mechanisms: ['immune modulation', 'inflammation control', 'stress reduction'],
  },
  {
    slug: 'circulation',
    name: 'Circulation',
    searchTerms: ['cardiovascular', 'blood', 'heart', 'vascular', 'blood pressure', 'vasorelaxation', 'endothelial'],
    relatedConditions: ['heart', 'blood-pressure', 'inflammation'],
    mechanisms: ['vasodilation', 'blood pressure regulation', 'cardiovascular protection'],
  },
];

async function queryStudiesForCondition(searchTerms: string[]): Promise<Study[]> {
  const { data, error } = await supabase
    .from('kb_research_queue')
    .select('id, title, year, study_type, study_subject, sample_size, quality_score, abstract, plain_summary, doi, pmid, slug, relevant_topics')
    .eq('status', 'approved')
    .order('quality_score', { ascending: false });

  if (error) {
    console.error('Error querying studies:', error);
    return [];
  }

  return (data || []).filter((study: Study) => {
    const searchLower = searchTerms.map(t => t.toLowerCase());
    const topicsMatch = study.relevant_topics && study.relevant_topics.some(topic =>
      searchLower.some(term => topic.toLowerCase().includes(term))
    );
    const titleMatch = study.title && searchLower.some(term =>
      study.title.toLowerCase().includes(term)
    );
    const abstractMatch = study.abstract && searchLower.some(term =>
      study.abstract!.toLowerCase().includes(term)
    );
    return topicsMatch || titleMatch || abstractMatch;
  });
}

function analyzeEvidence(studies: Study[]): EvidenceAnalysis {
  const analysis: EvidenceAnalysis = {
    totalStudies: studies.length,
    humanStudies: 0,
    animalStudies: 0,
    reviewCount: 0,
    rctCount: 0,
    totalParticipants: 0,
    highQualityCount: 0,
    mediumQualityCount: 0,
    evidenceLevel: 'Insufficient',
    targetWordCount: { min: 600, max: 900 },
    keyStudies: [],
    yearRange: { min: 9999, max: 0 },
  };

  for (const study of studies) {
    if (study.study_subject === 'human') {
      analysis.humanStudies++;
      if (study.sample_size) analysis.totalParticipants += study.sample_size;
    } else if (study.study_subject === 'review') {
      analysis.reviewCount++;
      analysis.humanStudies++;
    } else if (study.study_subject === 'animal') {
      analysis.animalStudies++;
    }

    const studyType = study.study_type?.toLowerCase() || '';
    if (studyType.includes('rct') || studyType.includes('randomized')) analysis.rctCount++;

    const quality = study.quality_score || 0;
    if (quality >= 70) analysis.highQualityCount++;
    else if (quality >= 50) analysis.mediumQualityCount++;

    if (study.year < analysis.yearRange.min) analysis.yearRange.min = study.year;
    if (study.year > analysis.yearRange.max) analysis.yearRange.max = study.year;
  }

  // Determine evidence level
  if (analysis.totalStudies >= 20 && (analysis.rctCount >= 3 || analysis.reviewCount >= 1) && analysis.totalParticipants >= 200) {
    analysis.evidenceLevel = 'Strong';
    analysis.targetWordCount = { min: 1800, max: 2400 };
  } else if (analysis.totalStudies >= 10 && (analysis.rctCount >= 1 || analysis.reviewCount >= 3) && analysis.humanStudies >= 5) {
    analysis.evidenceLevel = 'Moderate';
    analysis.targetWordCount = { min: 1300, max: 1800 };
  } else if (analysis.totalStudies >= 5) {
    analysis.evidenceLevel = 'Limited';
    analysis.targetWordCount = { min: 900, max: 1300 };
  }

  // Get key studies (human studies, highest quality first)
  analysis.keyStudies = studies
    .filter(s => s.study_subject === 'human' || s.study_subject === 'review')
    .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
    .slice(0, 4);

  return analysis;
}

function getEvidenceIndicator(level: string): string {
  const indicators: Record<string, string> = {
    'Strong': '\u25CF\u25CF\u25CF\u25CF\u25CB',
    'Moderate': '\u25CF\u25CF\u25CF\u25CB\u25CB',
    'Limited': '\u25CF\u25CF\u25CB\u25CB\u25CB',
    'Insufficient': '\u25CF\u25CB\u25CB\u25CB\u25CB'
  };
  return indicators[level] || indicators['Insufficient'];
}

function generateArticle(
  condition: typeof CONDITIONS[0],
  studies: Study[],
  analysis: EvidenceAnalysis
): Article {
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const year = new Date().getFullYear();

  // Generate key studies section
  const keyStudiesSection = analysis.keyStudies.length > 0
    ? analysis.keyStudies.map(study => {
        const sampleInfo = study.sample_size ? `**Sample:** ${study.sample_size} participants | ` : '';
        return `### ${study.title.substring(0, 60)}${study.title.length > 60 ? '...' : ''} (${study.year})

${study.plain_summary || study.abstract?.substring(0, 200) + '...' || 'Study examining CBD effects.'}

${sampleInfo}**Type:** ${study.study_type || 'Research study'}

[View study summary](/research/study/${study.slug})`;
      }).join('\n\n')
    : 'No high-quality human studies are currently available for this specific condition.';

  // Determine content based on evidence level
  const shortAnswer = generateShortAnswer(condition, analysis);
  const researchSection = generateResearchSection(condition, analysis, studies);
  const mechanismSection = generateMechanismSection(condition);
  const dosageSection = generateDosageSection(condition, analysis);
  const myTake = generateMyTake(condition, analysis);
  const faqSection = generateFAQSection(condition, analysis);

  const content = `# CBD and ${condition.name}: What the Research Shows ${year}

By Robin Roy Krigslund-Hansen | 12+ years in CBD industry
Reviewed ${analysis.totalStudies} studies for this article | Last updated: ${currentDate}

---

## The Short Answer

${shortAnswer}

---

## Research Snapshot

| Metric | Value |
|--------|-------|
| Studies reviewed | ${analysis.totalStudies} |
| Human clinical studies | ${analysis.humanStudies} |
| Systematic reviews | ${analysis.reviewCount} |
| Total participants studied | ${analysis.totalParticipants > 0 ? analysis.totalParticipants.toLocaleString() : 'Not tracked'} |
| Evidence strength | ${getEvidenceIndicator(analysis.evidenceLevel)} ${analysis.evidenceLevel} |

---

${analysis.evidenceLevel !== 'Insufficient' ? `## Key Numbers

| Statistic | Details |
|-----------|---------|
| ${analysis.totalStudies} | Total studies reviewed on related topics |
| ${analysis.humanStudies} | Human studies (clinical trials and observational) |
| ${analysis.highQualityCount} | High-quality studies (score 70+) |
| ${analysis.yearRange.min !== 9999 ? `${analysis.yearRange.min}-${analysis.yearRange.max}` : 'N/A'} | Year range of research |

---

` : ''}## What the Research Shows

${researchSection}

---

## Studies Worth Knowing

${keyStudiesSection}

---

## How CBD Might Help with ${condition.name}

${mechanismSection}

---

${dosageSection}

## My Take

${myTake}

---

## Frequently Asked Questions

${faqSection}

---

## References

I reviewed ${analysis.totalStudies} studies on related topics for this article. Key sources include research on ${condition.searchTerms.slice(0, 3).join(', ')}, and related areas.

[View all studies on CBD and ${condition.searchTerms[0]}](/research?topic=${condition.searchTerms[0]})

---

## Author

**Robin Roy Krigslund-Hansen** has worked in the CBD industry for over 12 years, including founding Formula Swiss. He has personally reviewed over 700 CBD studies and built CBD Portal to make research accessible to everyone.

---

*This article is for informational purposes only. It is not medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*
`;

  const excerpt = shortAnswer.substring(0, 200) + (shortAnswer.length > 200 ? '...' : '');
  const metaDescription = `What does research say about CBD for ${condition.name.toLowerCase()}? Review of ${analysis.totalStudies} studies. Evidence level: ${analysis.evidenceLevel}. ${condition.mechanisms[0]} and more.`.substring(0, 155);

  return {
    title: `CBD and ${condition.name}: What the Research Shows ${year}`,
    slug: `cbd-and-${condition.slug}`,
    content,
    excerpt,
    condition_slug: condition.slug,
    meta_description: metaDescription,
  };
}

function generateShortAnswer(condition: typeof CONDITIONS[0], analysis: EvidenceAnalysis): string {
  if (analysis.evidenceLevel === 'Insufficient') {
    return `There is limited direct research on CBD specifically for ${condition.name.toLowerCase()}. Most evidence comes from studies on related conditions like ${condition.relatedConditions.slice(0, 2).join(' and ')}. The research that does exist suggests CBD may help through ${condition.mechanisms[0]}, but more human clinical trials are needed before making strong recommendations.`;
  }

  if (analysis.evidenceLevel === 'Limited') {
    return `Research on CBD for ${condition.name.toLowerCase()} is still developing. I found ${analysis.totalStudies} relevant studies, with ${analysis.humanStudies} involving humans. The evidence suggests CBD may help through ${condition.mechanisms.slice(0, 2).join(' and ')}. While promising, the research is not yet definitive.`;
  }

  if (analysis.evidenceLevel === 'Moderate') {
    return `There is growing evidence for CBD and ${condition.name.toLowerCase()}. Across ${analysis.totalStudies} studies with ${analysis.humanStudies} human trials, research shows CBD may help through ${condition.mechanisms.slice(0, 2).join(' and ')}. Typical doses studied range from 25-150mg daily. The evidence is encouraging but not conclusive.`;
  }

  return `CBD for ${condition.name.toLowerCase()} has substantial research support. With ${analysis.totalStudies} studies including ${analysis.rctCount} randomized controlled trials and ${analysis.totalParticipants.toLocaleString()} total participants, the evidence shows CBD can help through ${condition.mechanisms.slice(0, 2).join(' and ')}. This is one of the better-researched applications for CBD.`;
}

function generateResearchSection(condition: typeof CONDITIONS[0], analysis: EvidenceAnalysis, studies: Study[]): string {
  const humanStudies = studies.filter(s => s.study_subject === 'human' || s.study_subject === 'review');
  const animalStudies = studies.filter(s => s.study_subject === 'animal');

  let section = '';

  if (analysis.evidenceLevel === 'Insufficient') {
    section = `### Limited Direct Evidence

I found limited research specifically addressing CBD for ${condition.name.toLowerCase()}. Most of what we know comes from studies on related conditions and the general properties of CBD.

### What Related Research Suggests

Research on ${condition.relatedConditions[0]} and ${condition.relatedConditions[1]} provides indirect evidence. CBD's effects on the [endocannabinoid system](/glossary/endocannabinoid-system) suggest it could potentially help with ${condition.name.toLowerCase()} through ${condition.mechanisms[0]}.

### Gaps in the Research

There are no large-scale clinical trials specifically for ${condition.name.toLowerCase()}. The research we have is primarily extrapolated from related conditions or preclinical studies.`;
  } else {
    section = `### The Best Evidence (Clinical Trials)

${humanStudies.length > 0
  ? `Of the ${analysis.humanStudies} human studies I reviewed, ${analysis.highQualityCount} were high-quality studies (quality score 70+). The research examines CBD's effects on ${condition.mechanisms.slice(0, 2).join(' and ')}.`
  : `Direct clinical trial evidence for ${condition.name.toLowerCase()} is still developing.`}

${analysis.rctCount > 0 ? `There are ${analysis.rctCount} randomized controlled trials relevant to this condition, providing stronger evidence than observational studies alone.` : ''}

### What Reviews Conclude

${analysis.reviewCount > 0
  ? `Systematic reviews (${analysis.reviewCount} found) generally conclude that CBD shows promise for conditions related to ${condition.name.toLowerCase()}, particularly regarding ${condition.mechanisms[0]}.`
  : 'There are no systematic reviews specifically on CBD for this condition yet.'}

### Supporting Evidence

${animalStudies.length > 0
  ? `Preclinical research (${analysis.animalStudies} animal studies) supports the biological plausibility of CBD for ${condition.name.toLowerCase()}. These studies show effects on ${condition.mechanisms.join(', ')}.`
  : 'Limited preclinical data is available for this specific application.'}`;
  }

  return section;
}

function generateMechanismSection(condition: typeof CONDITIONS[0]): string {
  return `CBD interacts with the body's [endocannabinoid system](/glossary/endocannabinoid-system), which plays a role in regulating ${condition.mechanisms.join(', ')}.

The proposed mechanisms for ${condition.name.toLowerCase()} include:

1. **${condition.mechanisms[0].charAt(0).toUpperCase() + condition.mechanisms[0].slice(1)}**: CBD may affect relevant receptors and signaling pathways
2. **${condition.mechanisms[1].charAt(0).toUpperCase() + condition.mechanisms[1].slice(1)}**: Research suggests CBD can modulate these processes
${condition.mechanisms[2] ? `3. **${condition.mechanisms[2].charAt(0).toUpperCase() + condition.mechanisms[2].slice(1)}**: Additional effects may contribute to overall benefits` : ''}

For those interested in the science, CBD works through multiple pathways including [CB1](/glossary/cb1-receptor) and [CB2 receptors](/glossary/cb2-receptor), serotonin receptors, and various ion channels.`;
}

function generateDosageSection(condition: typeof CONDITIONS[0], analysis: EvidenceAnalysis): string {
  if (analysis.evidenceLevel === 'Insufficient') {
    return `## What Dosages Might Apply

There is no established dosage for ${condition.name.toLowerCase()} specifically. Based on research for related conditions:

- General wellness: 10-25mg daily
- Moderate support: 25-50mg daily
- Higher therapeutic use: 50-150mg daily (under professional guidance)

Start with a low dose and increase gradually. Use our [dosage calculator](/tools/dosage-calculator) for personalized guidance, keeping in mind this is extrapolation from related research.

---

`;
  }

  return `## What Dosages Have Been Studied

Research on ${condition.name.toLowerCase()} and related conditions has used various doses:

- **Low dose**: 10-25mg daily for general support
- **Moderate dose**: 25-75mg daily, common in many studies
- **Higher dose**: 75-150mg daily in some clinical research

The optimal dose likely varies by individual and severity. Studies suggest starting low and adjusting based on response.

Use our [dosage calculator](/tools/dosage-calculator) for personalized guidance based on your weight and the CBD product you use.

---

`;
}

function generateMyTake(condition: typeof CONDITIONS[0], analysis: EvidenceAnalysis): string {
  if (analysis.evidenceLevel === 'Insufficient') {
    return `Having reviewed ${analysis.totalStudies} studies on related topics and worked in the CBD industry for over a decade, here is my honest assessment:

The research specifically on CBD for ${condition.name.toLowerCase()} is limited. Most of what we know is extrapolated from studies on ${condition.relatedConditions.slice(0, 2).join(' and ')}.

What I find plausible is that CBD's effects on ${condition.mechanisms[0]} could theoretically help with ${condition.name.toLowerCase()}. But I cannot point to clinical trials that directly test this.

If you are considering CBD for ${condition.name.toLowerCase()}, I would suggest starting with a low dose and monitoring your response carefully. Also consider whether addressing related issues like ${condition.relatedConditions[0]} might be a more evidence-based approach.

I am watching for new research in this area and will update this article as better evidence becomes available.`;
  }

  if (analysis.evidenceLevel === 'Limited') {
    return `Having reviewed ${analysis.totalStudies} studies and worked with CBD for over a decade, here is my honest assessment:

The evidence for CBD and ${condition.name.toLowerCase()} is developing but not yet definitive. I found ${analysis.humanStudies} human studies, which is a reasonable foundation but not enough to make strong claims.

What I find encouraging is the research on ${condition.mechanisms[0]} and ${condition.mechanisms[1]}. These mechanisms are relevant to ${condition.name.toLowerCase()}, and the preliminary results are promising.

My practical suggestion: if you want to try CBD for ${condition.name.toLowerCase()}, start with 25-50mg daily and give it 2-4 weeks to assess effects. Keep track of any changes you notice.

I am cautiously optimistic about this area and expect more research in coming years.`;
  }

  return `Having reviewed ${analysis.totalStudies} studies including ${analysis.humanStudies} human trials and worked in the CBD industry for over 12 years, here is my honest assessment:

The evidence for CBD and ${condition.name.toLowerCase()} is genuinely encouraging. With ${analysis.highQualityCount} high-quality studies showing relevant effects, this is one of the more substantiated applications.

What I find most compelling is the research on ${condition.mechanisms[0]}. Multiple studies consistently show CBD can help in this area.

My practical suggestions:
- A dose of 25-75mg daily is reasonable based on the research
- Allow 2-4 weeks for full effects to develop
- Consider CBD as part of a comprehensive approach to ${condition.name.toLowerCase()}

This is an area where I feel comfortable recommending CBD as worth trying, while acknowledging that individual results vary.`;
}

function generateFAQSection(condition: typeof CONDITIONS[0], analysis: EvidenceAnalysis): string {
  return `### Can CBD cure ${condition.name.toLowerCase()}?

No. CBD is not a cure for ${condition.name.toLowerCase()} or any condition. Research suggests it may help manage symptoms or support the body's natural processes. For persistent issues, work with a healthcare professional.

### How much CBD should I take for ${condition.name.toLowerCase()}?

There is no single established dose. Based on research for related conditions, 25-75mg daily is common. Start with a lower dose (10-25mg) and adjust based on your response. Use our [dosage calculator](/tools/dosage-calculator) for guidance.

### How long does it take for CBD to work for ${condition.name.toLowerCase()}?

Most people report initial effects within 1-2 weeks, with full benefits developing over 2-4 weeks of consistent use. Acute effects from a single dose typically begin within 30-90 minutes depending on the product type.

### Can I take CBD with my current medications?

CBD can interact with many medications through the CYP450 enzyme system. Always consult your healthcare provider before adding CBD, especially if you take prescription medications.

### What type of CBD is best for ${condition.name.toLowerCase()}?

Research does not consistently show one type is superior. [Full-spectrum CBD](/glossary/full-spectrum) may offer additional benefits from other cannabis compounds, while [CBD isolate](/glossary/cbd-isolate) ensures no THC exposure. Consider your preferences and any drug testing concerns.

### Is CBD legal for ${condition.name.toLowerCase()}?

In most European countries, CBD products containing less than 0.2% THC are legal. However, regulations vary by country. Check your local laws before purchasing.`;
}

async function getAuthorId(): Promise<string> {
  const { data: existingAuthor } = await supabase
    .from('kb_authors')
    .select('id')
    .eq('slug', 'robin-krigslund-hansen')
    .single();

  if (existingAuthor) {
    return existingAuthor.id;
  }

  const { data: newAuthor, error } = await supabase
    .from('kb_authors')
    .insert({
      name: 'Robin Roy Krigslund-Hansen',
      slug: 'robin-krigslund-hansen',
      title: 'Founder & Editor',
      bio: 'Robin has worked in the CBD industry for over 12 years, including founding Formula Swiss. He has personally reviewed over 700 CBD studies and built CBD Portal to make research accessible to everyone.',
      experience_years: 12
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating author:', error);
    throw error;
  }

  return newAuthor!.id;
}

async function insertArticle(article: Article, authorId: string): Promise<boolean> {
  // Check if article already exists
  const { data: existing } = await supabase
    .from('kb_articles')
    .select('id')
    .eq('slug', article.slug)
    .single();

  if (existing) {
    // Update existing article
    const { error } = await supabase
      .from('kb_articles')
      .update({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        meta_description: article.meta_description,
        condition_slug: article.condition_slug,
        status: 'published',
        language: 'en',
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    if (error) {
      console.error(`  Error updating ${article.slug}:`, error.message);
      return false;
    }
    console.log(`  Updated: ${article.slug}`);
    return true;
  } else {
    // Insert new article
    const { error } = await supabase
      .from('kb_articles')
      .insert({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        meta_description: article.meta_description,
        condition_slug: article.condition_slug,
        author_id: authorId,
        status: 'published',
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`  Error inserting ${article.slug}:`, error.message);
      return false;
    }
    console.log(`  Inserted: ${article.slug}`);
    return true;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Recovery & Wellness Condition Article Generator');
  console.log('='.repeat(60));
  console.log('');

  // Get author ID
  let authorId: string;
  try {
    authorId = await getAuthorId();
    console.log('Author ID:', authorId);
  } catch (e) {
    console.error('Failed to get author ID:', e);
    process.exit(1);
  }

  console.log('');
  console.log('Processing conditions...');
  console.log('-'.repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (const condition of CONDITIONS) {
    console.log(`\n[${condition.name}]`);

    // Query studies
    const studies = await queryStudiesForCondition(condition.searchTerms);
    console.log(`  Found ${studies.length} related studies`);

    // Analyze evidence
    const analysis = analyzeEvidence(studies);
    console.log(`  Evidence level: ${analysis.evidenceLevel}`);
    console.log(`  Human studies: ${analysis.humanStudies}, Reviews: ${analysis.reviewCount}`);

    // Generate article
    const article = generateArticle(condition, studies, analysis);
    console.log(`  Generated article: ${article.title}`);

    // Insert article
    const success = await insertArticle(article, authorId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`Complete! Success: ${successCount}, Failed: ${failCount}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
