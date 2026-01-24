import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

/**
 * ONE-TIME SEED: Add essential research terms to glossary
 * These terms frequently appear in study summaries and should be auto-linked.
 *
 * Run with: curl -X POST http://localhost:3000/api/admin/glossary/seed-research-terms
 */

const RESEARCH_TERMS = [
  {
    term: 'CBD',
    display_name: 'CBD (Cannabidiol)',
    slug: 'cbd',
    short_definition: 'CBD (cannabidiol) is a non-intoxicating compound from the cannabis plant, studied for potential therapeutic benefits including pain relief, anxiety reduction, and anti-inflammatory effects.',
    definition: 'Cannabidiol (CBD) is one of over 100 cannabinoids found in the cannabis plant. Unlike THC, CBD does not produce intoxicating effects. It interacts with the body\'s endocannabinoid system and has been studied for various potential therapeutic applications including anxiety, pain, inflammation, and epilepsy. Epidiolex, a CBD-based medication, is FDA-approved for certain types of epilepsy.',
    category: 'science',
    synonyms: ['cannabidiol', 'hemp extract'],
  },
  {
    term: 'Placebo',
    display_name: 'Placebo',
    slug: 'placebo',
    short_definition: 'A placebo is an inactive treatment (like a sugar pill) used in clinical trials to compare against the actual treatment being tested.',
    definition: 'A placebo is an inactive substance or treatment designed to look identical to the active treatment in a clinical study. Placebos help researchers determine whether improvements are due to the treatment itself or other factors like expectations (placebo effect). In CBD research, placebos typically contain the same carrier oil or delivery method without any cannabinoids.',
    category: 'science',
    synonyms: ['inactive treatment', 'control treatment', 'sugar pill'],
  },
  {
    term: 'Randomized Controlled Trial',
    display_name: 'Randomized Controlled Trial (RCT)',
    slug: 'randomized-controlled-trial',
    short_definition: 'An RCT is a study where participants are randomly assigned to receive either the treatment being tested or a placebo/control, considered the gold standard for medical research.',
    definition: 'A randomized controlled trial (RCT) is a scientific study design where participants are randomly assigned to either the treatment group or a control group (often receiving a placebo). Random assignment helps ensure that any differences in outcomes are due to the treatment rather than pre-existing differences between groups. RCTs are considered the gold standard for evaluating treatment effectiveness and are essential for drug approval processes.',
    category: 'science',
    synonyms: ['RCT', 'controlled trial', 'randomized trial'],
  },
  {
    term: 'Participants',
    display_name: 'Study Participants',
    slug: 'participants',
    short_definition: 'Participants are the individuals who volunteer to take part in a research study, also called subjects or volunteers.',
    definition: 'Study participants are individuals who consent to take part in a clinical research study. They may receive the experimental treatment, a placebo, or serve as part of a control group. Participant selection criteria, sample size, and characteristics all influence the quality and applicability of research findings. Larger participant numbers generally provide more reliable results.',
    category: 'science',
    synonyms: ['subjects', 'volunteers', 'patients', 'enrollees'],
  },
  {
    term: 'Anxiety',
    display_name: 'Anxiety',
    slug: 'anxiety',
    short_definition: 'Anxiety is a mental health condition characterized by persistent worry, fear, or unease that can interfere with daily life.',
    definition: 'Anxiety is a mental health condition involving persistent feelings of worry, nervousness, or unease, often about future events or situations with uncertain outcomes. Anxiety disorders include generalized anxiety disorder (GAD), social anxiety, panic disorder, and others. CBD has been studied for its potential anxiolytic (anti-anxiety) effects, with some research suggesting it may help reduce anxiety symptoms.',
    category: 'conditions',
    synonyms: ['anxiousness', 'nervousness', 'worry'],
  },
  {
    term: 'Pain',
    display_name: 'Pain',
    slug: 'pain',
    short_definition: 'Pain is an unpleasant sensory experience associated with tissue damage or potential damage, which CBD may help manage.',
    definition: 'Pain is a complex sensory and emotional experience typically associated with actual or potential tissue damage. It can be acute (short-term) or chronic (lasting more than 3 months). CBD research has explored its potential for pain management through anti-inflammatory effects and interaction with pain-signaling pathways. Studies have examined CBD for various pain types including neuropathic, inflammatory, and cancer-related pain.',
    category: 'conditions',
    synonyms: ['discomfort', 'ache', 'soreness'],
  },
  {
    term: 'Sleep',
    display_name: 'Sleep',
    slug: 'sleep',
    short_definition: 'Sleep is a natural state of rest essential for health. CBD has been studied for potential benefits in improving sleep quality and duration.',
    definition: 'Sleep is a naturally recurring state of rest characterized by reduced consciousness and metabolic activity. Quality sleep is essential for physical and mental health, immune function, and cognitive performance. CBD has been studied for its potential effects on sleep, with research suggesting it may help with sleep onset, duration, and quality, possibly through its effects on anxiety, pain, and the endocannabinoid system.',
    category: 'conditions',
    synonyms: ['rest', 'slumber'],
  },
  {
    term: 'Dose',
    display_name: 'Dose',
    slug: 'dose',
    short_definition: 'A dose is the specific amount of a substance (like CBD) given at one time, measured in milligrams (mg).',
    definition: 'A dose refers to the specific quantity of a substance administered at one time. In CBD research, doses are typically measured in milligrams (mg) and can vary widely depending on the condition being studied, the delivery method, and individual factors. Research has shown that CBD effects can be dose-dependent, with different doses producing different effects. Finding the optimal dose is a key focus of CBD clinical trials.',
    category: 'science',
    synonyms: ['dosage', 'amount', 'serving'],
  },
  {
    term: 'Treatment',
    display_name: 'Treatment',
    slug: 'treatment',
    short_definition: 'Treatment refers to the intervention being studied, such as CBD administration, to manage or improve a health condition.',
    definition: 'In clinical research, treatment refers to the intervention or therapy being tested for its effects on a health condition. CBD treatment studies examine various aspects including dose, delivery method, duration, and outcomes. Treatment protocols in research are carefully designed and controlled to generate reliable data about effectiveness and safety.',
    category: 'science',
    synonyms: ['therapy', 'intervention', 'regimen'],
  },
  {
    term: 'Symptoms',
    display_name: 'Symptoms',
    slug: 'symptoms',
    short_definition: 'Symptoms are physical or mental signs of a condition that participants experience, which researchers measure to assess treatment effects.',
    definition: 'Symptoms are subjective experiences reported by patients that indicate the presence of a disease or condition. In CBD research, symptoms are key outcome measures used to assess treatment effectiveness. Common symptoms measured in CBD studies include pain intensity, anxiety levels, sleep quality, seizure frequency, and inflammation markers. Researchers use validated assessment tools to measure symptom changes.',
    category: 'science',
    synonyms: ['signs', 'manifestations', 'indicators'],
  },
  {
    term: 'Results',
    display_name: 'Study Results',
    slug: 'results',
    short_definition: 'Results are the findings and outcomes from a research study that show whether the treatment had an effect.',
    definition: 'Study results are the outcomes and findings from research that indicate whether the treatment being tested had the expected effects. Results include statistical analyses comparing treatment and control groups, effect sizes, and significance levels. Positive results suggest the treatment works; negative or null results indicate no significant difference from placebo. Understanding how to interpret results is crucial for evidence-based decision making.',
    category: 'science',
    synonyms: ['findings', 'outcomes', 'data'],
  },
  {
    term: 'Side Effects',
    display_name: 'Side Effects',
    slug: 'side-effects',
    short_definition: 'Side effects are unintended effects of a treatment. CBD is generally well-tolerated but may cause drowsiness, dry mouth, or digestive changes.',
    definition: 'Side effects are unintended effects that occur alongside the desired therapeutic effects of a treatment. In CBD research, commonly reported side effects include drowsiness, dry mouth, diarrhea, changes in appetite, and fatigue. Most CBD side effects are considered mild and temporary. Researchers carefully document and analyze side effects to establish the safety profile of CBD treatments.',
    category: 'science',
    synonyms: ['adverse effects', 'unwanted effects'],
  },
];

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results = {
      added: [] as string[],
      skipped: [] as string[],
      errors: [] as string[],
    };

    for (const termData of RESEARCH_TERMS) {
      // Check if term already exists
      const { data: existing } = await supabase
        .from('kb_glossary')
        .select('id, term')
        .eq('slug', termData.slug)
        .maybeSingle();

      if (existing) {
        results.skipped.push(`${termData.term} (already exists)`);
        continue;
      }

      // Insert new term
      const { error } = await supabase
        .from('kb_glossary')
        .insert({
          term: termData.term,
          display_name: termData.display_name,
          slug: termData.slug,
          short_definition: termData.short_definition,
          definition: termData.definition,
          category: termData.category,
          synonyms: termData.synonyms || [],
          related_terms: [],
          related_research: [],
          sources: [],
        });

      if (error) {
        results.errors.push(`${termData.term}: ${error.message}`);
      } else {
        results.added.push(termData.term);
      }
    }

    console.log('[Seed Research Terms]', results);

    return NextResponse.json({
      success: true,
      ...results,
      total: RESEARCH_TERMS.length,
    });

  } catch (error) {
    console.error('[Seed Research Terms] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  return NextResponse.json({
    description: 'POST to this endpoint to seed essential research terms for glossary auto-linking',
    terms: RESEARCH_TERMS.map(t => ({ term: t.term, slug: t.slug })),
    count: RESEARCH_TERMS.length,
  });
}
