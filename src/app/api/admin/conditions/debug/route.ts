import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Debug endpoint to check topic_keywords and research matching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'anxiety';

    const supabase = createServiceClient();

    // Get the condition with topic_keywords
    const { data: condition, error: conditionError } = await supabase
      .from('kb_conditions')
      .select('id, slug, name, display_name, topic_keywords')
      .eq('slug', slug)
      .single();

    if (conditionError || !condition) {
      return NextResponse.json({ error: 'Condition not found', slug }, { status: 404 });
    }

    // Get all approved research (only relevant_topics exists, no primary_topic column)
    const { data: allResearch, error: researchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, relevant_topics')
      .eq('status', 'approved');

    if (researchError) {
      return NextResponse.json({ error: 'Failed to fetch research', details: researchError }, { status: 500 });
    }

    // Get unique topics from all research
    const uniqueTopics = new Set<string>();
    allResearch?.forEach(r => {
      if (Array.isArray(r.relevant_topics)) {
        r.relevant_topics.forEach((t: string) => uniqueTopics.add(t));
      }
    });

    // Test matching with different keyword variations
    const keywords = condition.topic_keywords || [];
    const allKeywords = [...new Set([...keywords, slug])];

    // Count matches
    let matchCount = 0;
    const matchedResearch: any[] = [];

    allResearch?.forEach(research => {
      const topics = research.relevant_topics || [];

      const matches = allKeywords.some(keyword => topics.includes(keyword));
      if (matches) {
        matchCount++;
        if (matchedResearch.length < 5) {
          matchedResearch.push({
            title: research.title?.substring(0, 60),
            relevant_topics: research.relevant_topics
          });
        }
      }
    });

    return NextResponse.json({
      condition: {
        slug: condition.slug,
        name: condition.display_name || condition.name,
        topic_keywords: condition.topic_keywords,
        topic_keywords_length: keywords.length
      },
      allKeywordsUsed: allKeywords,
      research: {
        total: allResearch?.length || 0,
        uniqueTopicsInDB: Array.from(uniqueTopics).sort(),
        matchCount,
        sampleMatches: matchedResearch
      },
      // Check if slug exists as a topic
      slugExistsAsTopic: uniqueTopics.has(slug),
      // Sample research with anxiety-related topics
      anxietyResearchSample: allResearch
        ?.filter(r =>
          r.relevant_topics?.some((t: string) => t?.toLowerCase().includes('anxiety'))
        )
        .slice(0, 3)
        .map(r => ({
          title: r.title?.substring(0, 60),
          relevant_topics: r.relevant_topics
        }))
    });
  } catch (error) {
    console.error('[Debug Conditions] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
