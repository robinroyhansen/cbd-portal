import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';
import { TOPIC_KEYWORDS } from '@/lib/research-scanner';

export const maxDuration = 300; // 5 minutes max for Vercel

function detectTopics(title: string, abstract: string | null): string[] {
  const text = `${title || ''} ${abstract || ''}`;
  const topics: string[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      // Use word boundary regex to avoid false positives
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text)) {
        if (!topics.includes(topic)) {
          topics.push(topic);
        }
        break; // Found a match for this topic, move to next topic
      }
    }
  }

  return topics;
}

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Configuration error',
        message: 'Missing required environment variables'
      }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch all approved studies
    const { data: studies, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract')
      .eq('status', 'approved');

    if (fetchError) {
      return NextResponse.json({
        error: 'Database error',
        message: fetchError.message
      }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({
        updated: 0,
        distribution: {}
      });
    }

    const distribution: Record<string, number> = {};
    let updated = 0;

    for (const study of studies) {
      const topics = detectTopics(study.title, study.abstract);

      // Update the study with new topics
      const { error: updateError } = await supabase
        .from('kb_research_queue')
        .update({ relevant_topics: topics })
        .eq('id', study.id);

      if (!updateError) {
        updated++;

        // Track distribution
        for (const topic of topics) {
          distribution[topic] = (distribution[topic] || 0) + 1;
        }
      }
    }

    // Sort distribution by count descending
    const sortedDistribution = Object.fromEntries(
      Object.entries(distribution).sort(([, a], [, b]) => b - a)
    );

    return NextResponse.json({
      updated,
      distribution: sortedDistribution
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Recalculation failed',
      message: errorMessage
    }, { status: 500 });
  }
}
