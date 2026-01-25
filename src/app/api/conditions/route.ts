import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import {
  withETag,
  CACHE_PROFILES,
  excludeFieldsArray,
  FIELD_PRESETS,
  parseFieldsParam,
  selectFieldsArray,
} from '@/lib/api';

// Fields to exclude from list responses to reduce payload size
const LIST_EXCLUDE_FIELDS = [
  'description',
  'content',
  'seo_title',
  'seo_description',
  'name_translations',
  'description_translations',
  'created_at',
  'updated_at',
];

export async function GET(request: NextRequest) {
  // Rate limiting - general API limit (60 requests per minute)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`conditions:${clientIp}`, RATE_LIMITS.api);

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
    const featured = searchParams.get('featured') === 'true';
    const withResearch = searchParams.get('withResearch') === 'true';
    const lang = searchParams.get('lang') || 'en';
    const requestedFields = parseFieldsParam(searchParams.get('fields'));

    // Single condition lookup by slug
    if (slug) {
      const { data: condition, error } = await supabase
        .from('kb_conditions')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !condition) {
        return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
      }

      // Get related conditions details (optimized fields)
      if (condition.related_condition_slugs && condition.related_condition_slugs.length > 0) {
        const { data: relatedConditions } = await supabase
          .from('kb_conditions')
          .select('slug, name, display_name, short_description, category, research_count')
          .in('slug', condition.related_condition_slugs)
          .eq('is_published', true);

        condition.related_conditions = relatedConditions || [];
      }

      // Get parent condition if exists
      if (condition.parent_condition_id) {
        const { data: parentCondition } = await supabase
          .from('kb_conditions')
          .select('slug, name, display_name')
          .eq('id', condition.parent_condition_id)
          .single();

        condition.parent_condition = parentCondition;
      }

      // Get child conditions
      const { data: childConditions } = await supabase
        .from('kb_conditions')
        .select('slug, name, display_name, short_description, research_count')
        .eq('parent_condition_id', condition.id)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      condition.child_conditions = childConditions || [];

      // Fetch associated research if requested (optimized fields)
      if (withResearch) {
        const { data: research } = await supabase
          .from('kb_research_queue')
          .select('id, title, slug, url, year, source, relevance_score')
          .eq('status', 'approved')
          .containedBy('topics', condition.topic_keywords || [])
          .order('year', { ascending: false })
          .limit(20);

        condition.research = research || [];
      }

      // Apply translation if not English
      if (lang !== 'en' && condition.name_translations?.[lang]) {
        condition.name = condition.name_translations[lang];
      }
      if (lang !== 'en' && condition.description_translations?.[lang]) {
        condition.description = condition.description_translations[lang];
      }

      // Remove translation objects from response (reduces payload)
      delete condition.name_translations;
      delete condition.description_translations;

      // Apply field selection if requested
      const responseData = requestedFields
        ? selectFieldsArray([condition], requestedFields)[0]
        : condition;

      // Return with ETag and semi-static caching (individual condition pages)
      return withETag(request, { condition: responseData }, {
        maxAge: 300,           // 5 minutes browser cache
        sMaxAge: 3600,         // 1 hour CDN cache
        staleWhileRevalidate: 86400, // 1 day stale-while-revalidate
        salt: `condition-${slug}-${lang}`,
      });
    }

    // Build query for listing conditions (optimized select)
    let query = supabase
      .from('kb_conditions')
      .select('id, slug, name, display_name, short_description, category, research_count, is_featured, topic_keywords')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data: conditions, error } = await query;

    if (error) {
      console.error('Error fetching conditions:', error);
      throw error;
    }

    // Apply field selection or use preset list fields
    let optimizedConditions = conditions || [];
    if (requestedFields) {
      optimizedConditions = selectFieldsArray(optimizedConditions, requestedFields) as typeof optimizedConditions;
    } else {
      // Use optimized preset fields for list view
      optimizedConditions = selectFieldsArray(
        optimizedConditions,
        FIELD_PRESETS.conditions.list
      ) as typeof optimizedConditions;
    }

    // Get counts by category (cached query - minimal fields)
    const { data: allConditions } = await supabase
      .from('kb_conditions')
      .select('category')
      .eq('is_published', true);

    const categoryCounts: Record<string, number> = {};
    allConditions?.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    // Get total research count
    const totalResearch = conditions?.reduce((sum, c) => sum + (c.research_count || 0), 0) || 0;

    const responseData = {
      conditions: optimizedConditions,
      total: optimizedConditions.length,
      categoryCounts,
      totalResearch
    };

    // Return with ETag and list page caching
    return withETag(request, responseData, {
      maxAge: 120,           // 2 minutes browser cache
      sMaxAge: 600,          // 10 minutes CDN cache
      staleWhileRevalidate: 7200, // 2 hours stale-while-revalidate
      salt: `conditions-list-${category || 'all'}-${featured}`,
    });
  } catch (error) {
    console.error('Error fetching conditions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conditions' },
      {
        status: 500,
        headers: { 'Cache-Control': CACHE_PROFILES.noCache },
      }
    );
  }
}

// Allow caching for GET requests
export const dynamic = 'force-dynamic';
