import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Topic classification rules
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Anxiety': ['anxiety', 'anxious', 'social anxiety', 'gad', 'generalized anxiety'],
  'Depression': ['depression', 'depressive', 'antidepressant', 'mood disorder'],
  'Sleep': ['sleep', 'insomnia', 'circadian', 'sleep quality', 'sleep disorder'],
  'Pain': ['pain', 'analgesic', 'neuropathic', 'chronic pain', 'fibromyalgia', 'arthritis'],
  'Epilepsy': ['epilepsy', 'seizure', 'anticonvulsant', 'dravet', 'lennox-gastaut'],
  'Cancer': ['cancer', 'tumor', 'oncology', 'chemotherapy', 'malignant', 'carcinoma'],
  'Inflammation': ['inflammation', 'inflammatory', 'anti-inflammatory', 'cytokine'],
  'Neurological': ['neurodegenerative', 'parkinson', 'alzheimer', 'neuroprotective', 'multiple sclerosis'],
  'Cardiovascular': ['cardiovascular', 'heart', 'blood pressure', 'hypertension', 'cardiac'],
  'Skin': ['skin', 'dermatitis', 'eczema', 'psoriasis', 'acne', 'topical'],
  'Addiction': ['addiction', 'substance use', 'opioid', 'withdrawal', 'drug dependence'],
  'PTSD': ['ptsd', 'post-traumatic', 'trauma'],
  'Autism': ['autism', 'asd', 'autistic'],
  'Diabetes': ['diabetes', 'diabetic', 'glucose', 'insulin'],
  'Gastrointestinal': ['gastrointestinal', 'ibs', 'crohn', 'gut', 'digestive', 'nausea'],
  'Cognitive': ['cognitive', 'memory', 'cognition', 'attention', 'adhd'],
  'Pharmacokinetics': ['pharmacokinetics', 'bioavailability', 'metabolism', 'absorption', 'half-life'],
  'Safety': ['safety', 'adverse effects', 'side effects', 'tolerability', 'toxicity'],
};

function classifyTopics(title: string, abstract: string, summary: string): string[] {
  const text = `${title} ${abstract} ${summary}`.toLowerCase();
  const topics: string[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      topics.push(topic);
    }
  }

  // Default to 'General Research' if no topics matched
  return topics.length > 0 ? topics : ['General Research'];
}

export async function POST(request: NextRequest) {
  try {
    const { batchSize = 50, dryRun = false } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch studies that might need topic reclassification
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, plain_summary, relevant_topics')
      .eq('status', 'approved')
      .limit(batchSize);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({
        processed: 0,
        updated: 0,
        message: 'No studies found'
      });
    }

    const updates: Array<{ id: string; oldTopics: string[]; newTopics: string[]; title: string }> = [];

    for (const study of studies) {
      const newTopics = classifyTopics(
        study.title || '',
        study.abstract || '',
        study.plain_summary || ''
      );

      const oldTopics = study.relevant_topics || [];

      // Check if topics have changed
      const topicsChanged =
        newTopics.length !== oldTopics.length ||
        !newTopics.every(t => oldTopics.includes(t));

      if (topicsChanged) {
        updates.push({
          id: study.id,
          oldTopics,
          newTopics,
          title: study.title?.substring(0, 60) || 'Untitled'
        });

        if (!dryRun) {
          await supabase
            .from('kb_research_queue')
            .update({ relevant_topics: newTopics })
            .eq('id', study.id);
        }
      }
    }

    return NextResponse.json({
      processed: studies.length,
      updated: updates.length,
      dryRun,
      changes: updates.slice(0, 20) // Limit response size
    });

  } catch (error) {
    console.error('[FixTopics] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to see topic distribution
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: studies } = await supabase
      .from('kb_research_queue')
      .select('relevant_topics')
      .eq('status', 'approved');

    // Count topic occurrences
    const topicCounts: Record<string, number> = {};

    for (const study of studies || []) {
      for (const topic of study.relevant_topics || []) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }

    // Sort by count
    const sorted = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count }));

    return NextResponse.json({
      totalStudies: studies?.length || 0,
      topicDistribution: sorted
    });

  } catch (error) {
    console.error('[FixTopics] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
