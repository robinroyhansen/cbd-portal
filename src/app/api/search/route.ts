import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface SearchResult {
  type: 'study' | 'article' | 'glossary' | 'brand';
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  url: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const type = searchParams.get('type'); // 'study', 'article', 'glossary', 'brand', or null for all
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results: SearchResult[] = [];
    const searchPattern = `%${query}%`;

    // Search studies
    if (!type || type === 'study') {
      const { data: studies } = await supabase
        .from('kb_research_queue')
        .select('id, title, slug, display_title, plain_summary')
        .eq('status', 'approved')
        .or(`title.ilike.${searchPattern},display_title.ilike.${searchPattern},plain_summary.ilike.${searchPattern}`)
        .limit(limit);

      if (studies) {
        results.push(...studies.map(s => ({
          type: 'study' as const,
          id: s.id,
          title: s.display_title || s.title,
          slug: s.slug,
          excerpt: s.plain_summary?.substring(0, 150),
          url: `/research/${s.slug}`
        })));
      }
    }

    // Search articles
    if (!type || type === 'article') {
      const { data: articles } = await supabase
        .from('kb_articles')
        .select('id, title, slug, excerpt')
        .eq('status', 'published')
        .or(`title.ilike.${searchPattern},excerpt.ilike.${searchPattern},content.ilike.${searchPattern}`)
        .limit(limit);

      if (articles) {
        results.push(...articles.map(a => ({
          type: 'article' as const,
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt?.substring(0, 150),
          url: `/articles/${a.slug}`
        })));
      }
    }

    // Search glossary
    if (!type || type === 'glossary') {
      const { data: terms } = await supabase
        .from('kb_glossary_terms')
        .select('id, term, slug, definition')
        .eq('status', 'published')
        .or(`term.ilike.${searchPattern},definition.ilike.${searchPattern}`)
        .limit(limit);

      if (terms) {
        results.push(...terms.map(t => ({
          type: 'glossary' as const,
          id: t.id,
          title: t.term,
          slug: t.slug,
          excerpt: t.definition?.substring(0, 150),
          url: `/glossary/${t.slug}`
        })));
      }
    }

    // Search brands
    if (!type || type === 'brand') {
      const { data: brands } = await supabase
        .from('kb_brands')
        .select('id, name, slug, description')
        .eq('is_published', true)
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(limit);

      if (brands) {
        results.push(...brands.map(b => ({
          type: 'brand' as const,
          id: b.id,
          title: b.name,
          slug: b.slug,
          excerpt: b.description?.substring(0, 150),
          url: `/brands/${b.slug}`
        })));
      }
    }

    // Sort by relevance (exact matches first)
    const lowerQuery = query.toLowerCase();
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
      const bExact = b.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
      return aExact - bExact;
    });

    return NextResponse.json({
      query,
      count: results.length,
      results: results.slice(0, limit)
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60'
      }
    });

  } catch (error) {
    console.error('[Search] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
