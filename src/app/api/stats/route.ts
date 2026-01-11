import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cache stats for 5 minutes
let cachedStats: StatsResponse | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface StatsResponse {
  research: {
    totalStudies: number;
    humanStudies: number;
    animalStudies: number;
    totalParticipants: number;
    withMetaContent: number;
    needsMetaContent: number;
    metaPercentage: number;
  };
  content: {
    articles: number;
    glossaryTerms: number;
    brands: number;
    brandReviews: number;
  };
  lastUpdated: string;
}

export async function GET() {
  try {
    // Return cached stats if fresh
    if (cachedStats && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cachedStats, {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'X-Cache': 'HIT'
        }
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all stats in parallel
    const [
      { count: totalStudies },
      { count: humanStudies },
      { count: animalStudies },
      { data: participantData },
      { count: withMetaContent },
      { count: needsMetaContent },
      { count: articles },
      { count: glossaryTerms },
      { count: brands },
      { count: brandReviews }
    ] = await Promise.all([
      // Total approved studies
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved'),

      // Human studies
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('sample_type', 'human'),

      // Animal studies
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('sample_type', 'animal'),

      // Total participants (sum of sample_size for human studies)
      supabase
        .from('kb_research_queue')
        .select('sample_size')
        .eq('status', 'approved')
        .eq('sample_type', 'human')
        .not('sample_size', 'is', null),

      // With meta content (has key_findings)
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .not('key_findings', 'is', null)
        .neq('key_findings', '[]'),

      // Needs meta content
      supabase
        .from('kb_research_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .or('key_findings.is.null,key_findings.eq.[]'),

      // Articles
      supabase
        .from('kb_articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),

      // Glossary terms
      supabase
        .from('kb_glossary_terms')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),

      // Brands
      supabase
        .from('kb_brands')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true),

      // Brand reviews
      supabase
        .from('kb_brand_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true)
    ]);

    // Calculate total participants
    const totalParticipants = participantData?.reduce((sum, row) => sum + (row.sample_size || 0), 0) || 0;

    // Calculate meta percentage
    const total = (withMetaContent || 0) + (needsMetaContent || 0);
    const metaPercentage = total > 0 ? parseFloat(((withMetaContent || 0) / total * 100).toFixed(1)) : 0;

    const stats: StatsResponse = {
      research: {
        totalStudies: totalStudies || 0,
        humanStudies: humanStudies || 0,
        animalStudies: animalStudies || 0,
        totalParticipants,
        withMetaContent: withMetaContent || 0,
        needsMetaContent: needsMetaContent || 0,
        metaPercentage
      },
      content: {
        articles: articles || 0,
        glossaryTerms: glossaryTerms || 0,
        brands: brands || 0,
        brandReviews: brandReviews || 0
      },
      lastUpdated: new Date().toISOString()
    };

    // Update cache
    cachedStats = stats;
    cacheTime = Date.now();

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('[Stats] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
