import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import {
  withETag,
  CACHE_PROFILES,
  FIELD_PRESETS,
  parseFieldsParam,
  selectFieldsArray,
  excludeFieldsArray,
} from '@/lib/api';

// Fields to exclude from list responses to reduce payload size
const LIST_EXCLUDE_FIELDS = [
  'content',
  'seo_title',
  'seo_description',
  'schema_markup',
  'meta_keywords',
  'created_at',
  'updated_at',
];

export async function GET(request: NextRequest) {
  // Rate limiting - general API limit (60 requests per minute)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`articles:${clientIp}`, RATE_LIMITS.api);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': rateLimit.resetIn.toString() },
      }
    );
  }

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const requestedFields = parseFieldsParam(searchParams.get('fields'));

    // Single article lookup by slug
    if (slug) {
      const { data: article, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      // Get related articles if condition_id exists (optimized fields)
      if (article.condition_id) {
        const { data: relatedArticles } = await supabase
          .from('kb_articles')
          .select('id, slug, title, excerpt, featured_image, published_at')
          .eq('condition_id', article.condition_id)
          .eq('status', 'published')
          .neq('id', article.id)
          .limit(5);

        article.related_articles = relatedArticles || [];
      }

      // Get author details if author_id exists (optimized fields)
      if (article.author_id) {
        const { data: author } = await supabase
          .from('kb_authors')
          .select('id, name, slug, title, bio, avatar_url')
          .eq('id', article.author_id)
          .single();

        article.author = author;
      }

      // Apply field selection if requested
      const responseData = requestedFields
        ? selectFieldsArray([article], requestedFields)[0]
        : article;

      // Return with ETag and semi-static caching (individual article pages)
      return withETag(request, { article: responseData }, {
        maxAge: 300,           // 5 minutes browser cache
        sMaxAge: 3600,         // 1 hour CDN cache
        staleWhileRevalidate: 86400, // 1 day stale-while-revalidate
        salt: `article-${slug}`,
      });
    }

    // Build query for listing articles (optimized select - no content)
    let query = supabase
      .from('kb_articles')
      .select('id, slug, title, excerpt, featured_image, published_at, author_id, category_id, reading_time, condition_id')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category_id', category);
    }

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch articles', articles: [] },
        {
          status: 500,
          headers: { 'Cache-Control': CACHE_PROFILES.noCache },
        }
      );
    }

    // Apply field selection or use preset list fields
    let optimizedArticles = articles || [];
    if (requestedFields) {
      optimizedArticles = selectFieldsArray(optimizedArticles, requestedFields) as typeof optimizedArticles;
    } else {
      // Use optimized preset fields for list view
      optimizedArticles = selectFieldsArray(
        optimizedArticles,
        FIELD_PRESETS.articles.list
      ) as typeof optimizedArticles;
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('kb_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');

    const responseData = {
      articles: optimizedArticles,
      total: totalCount || optimizedArticles.length,
      limit,
      offset,
      hasMore: (totalCount || 0) > offset + limit,
    };

    // Generate cache key based on filters
    const cacheKey = `articles-list-${category || 'all'}-${limit}-${offset}`;

    // Return with ETag and list page caching
    return withETag(request, responseData, {
      maxAge: 120,           // 2 minutes browser cache
      sMaxAge: 600,          // 10 minutes CDN cache
      staleWhileRevalidate: 7200, // 2 hours stale-while-revalidate
      salt: cacheKey,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles', articles: [] },
      {
        status: 500,
        headers: { 'Cache-Control': CACHE_PROFILES.noCache },
      }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
