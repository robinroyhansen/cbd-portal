import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import {
  withETag,
  CACHE_PROFILES,
} from '@/lib/api';

interface SearchResult {
  type: 'study' | 'article' | 'glossary' | 'brand' | 'condition';
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  url: string;
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`search:${clientIp}`, RATE_LIMITS.search);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimit.resetIn.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const type = searchParams.get('type'); // 'study', 'article', 'glossary', 'brand', 'condition', or null for all
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

    // Search studies (optimized fields)
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
          url: `/research/study/${s.slug}`
        })));
      }
    }

    // Search articles (optimized fields)
    if (!type || type === 'article') {
      const { data: articles } = await supabase
        .from('kb_articles')
        .select('id, title, slug, excerpt')
        .eq('status', 'published')
        .or(`title.ilike.${searchPattern},excerpt.ilike.${searchPattern}`)
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

    // Search glossary (optimized fields)
    if (!type || type === 'glossary') {
      const { data: terms } = await supabase
        .from('kb_glossary')
        .select('id, term, slug, short_definition')
        .or(`term.ilike.${searchPattern},short_definition.ilike.${searchPattern}`)
        .limit(limit);

      if (terms) {
        results.push(...terms.map(t => ({
          type: 'glossary' as const,
          id: t.id,
          title: t.term,
          slug: t.slug,
          excerpt: t.short_definition?.substring(0, 150),
          url: `/glossary/${t.slug}`
        })));
      }
    }

    // Search conditions (optimized fields)
    if (!type || type === 'condition') {
      const { data: conditions } = await supabase
        .from('kb_conditions')
        .select('id, name, display_name, slug, short_description')
        .eq('is_published', true)
        .or(`name.ilike.${searchPattern},display_name.ilike.${searchPattern},short_description.ilike.${searchPattern}`)
        .limit(limit);

      if (conditions) {
        results.push(...conditions.map(c => ({
          type: 'condition' as const,
          id: c.id,
          title: c.display_name || c.name,
          slug: c.slug,
          excerpt: c.short_description?.substring(0, 150),
          url: `/conditions/${c.slug}`
        })));
      }
    }

    // Search brands (optimized fields)
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

    // Sort by relevance (exact matches first, then title matches)
    const lowerQuery = query.toLowerCase();
    results.sort((a, b) => {
      // Exact title match gets highest priority
      const aExactTitle = a.title.toLowerCase() === lowerQuery ? 0 : 1;
      const bExactTitle = b.title.toLowerCase() === lowerQuery ? 0 : 1;
      if (aExactTitle !== bExactTitle) return aExactTitle - bExactTitle;

      // Title starts with query gets second priority
      const aStartsWith = a.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
      const bStartsWith = b.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
      if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;

      // Title contains query gets third priority
      const aContains = a.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
      const bContains = b.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
      return aContains - bContains;
    });

    const responseData = {
      query,
      count: results.length,
      results: results.slice(0, limit)
    };

    // Generate cache key based on search params
    const cacheKey = `search-${query}-${type || 'all'}-${limit}`;

    // Return with ETag and search-specific caching
    return withETag(request, responseData, {
      maxAge: 60,            // 1 minute browser cache
      staleWhileRevalidate: 600, // 10 minutes stale-while-revalidate
      salt: cacheKey,
    });

  } catch (error) {
    console.error('[Search] Error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      {
        status: 500,
        headers: { 'Cache-Control': CACHE_PROFILES.noCache },
      }
    );
  }
}
