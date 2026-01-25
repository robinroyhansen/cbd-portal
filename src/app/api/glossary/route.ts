import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import {
  withETag,
  CACHE_PROFILES,
  FIELD_PRESETS,
  parseFieldsParam,
  selectFieldsArray,
} from '@/lib/api';

export async function GET(request: NextRequest) {
  // Rate limiting - general API limit (60 requests per minute)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`glossary:${clientIp}`, RATE_LIMITS.api);

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

    const category = searchParams.get('category');
    const letter = searchParams.get('letter');
    const search = searchParams.get('q');
    const slug = searchParams.get('slug');
    const fetchAll = searchParams.get('all') === 'true';
    const requestedFields = parseFieldsParam(searchParams.get('fields'));

    // Single term lookup by slug
    if (slug) {
      const { data: term, error } = await supabase
        .from('kb_glossary')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !term) {
        return NextResponse.json({ error: 'Term not found' }, { status: 404 });
      }

      // Get related terms details (optimized fields)
      if (term.related_terms && term.related_terms.length > 0) {
        const { data: relatedTerms } = await supabase
          .from('kb_glossary')
          .select('term, slug, short_definition, category')
          .in('slug', term.related_terms);

        term.related_terms_details = relatedTerms || [];
      }

      // Get related research details (optimized fields)
      if (term.related_research && term.related_research.length > 0) {
        const { data: relatedResearch } = await supabase
          .from('kb_research_queue')
          .select('id, title, slug, url, year')
          .in('id', term.related_research)
          .eq('status', 'approved');

        term.related_research_details = relatedResearch || [];
      }

      // Apply field selection if requested
      const responseData = requestedFields
        ? selectFieldsArray([term], requestedFields)[0]
        : term;

      // Return with ETag and semi-static caching (individual term pages)
      return withETag(request, { term: responseData }, {
        maxAge: 300,           // 5 minutes browser cache
        sMaxAge: 3600,         // 1 hour CDN cache
        staleWhileRevalidate: 86400, // 1 day stale-while-revalidate
        salt: `glossary-term-${slug}`,
      });
    }

    // Fetch all terms for autocomplete (minimal fields, include synonyms)
    if (fetchAll) {
      const { data: allTerms } = await supabase
        .from('kb_glossary')
        .select('id, term, display_name, slug, category, synonyms')
        .order('term', { ascending: true });

      const responseData = { terms: allTerms || [] };

      // Autocomplete data is semi-static - cache aggressively
      return withETag(request, responseData, {
        maxAge: 600,           // 10 minutes browser cache
        sMaxAge: 3600,         // 1 hour CDN cache
        staleWhileRevalidate: 86400, // 1 day stale-while-revalidate
        salt: 'glossary-autocomplete',
      });
    }

    // Build query for listing terms (optimized select)
    let query = supabase
      .from('kb_glossary')
      .select('id, term, display_name, slug, short_definition, category, synonyms, pronunciation')
      .order('term', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (letter) {
      query = query.ilike('term', `${letter}%`);
    }

    if (search) {
      // Search in term, display_name, and short_definition
      query = query.or(`term.ilike.%${search}%,display_name.ilike.%${search}%,short_definition.ilike.%${search}%`);
    }

    const { data: terms, error } = await query;

    if (error) {
      console.error('Error fetching glossary:', error);
      throw error;
    }

    // Filter synonym matches client-side if searching (since Supabase can't search in arrays easily)
    let filteredTerms = terms || [];
    if (search && filteredTerms) {
      const searchLower = search.toLowerCase();
      // Include terms that match in synonyms but weren't caught by the main query
      const existingSlugs = new Set(filteredTerms.map(t => t.slug));

      // Fetch all terms to check synonyms (only if search is active)
      const { data: allTermsForSynonyms } = await supabase
        .from('kb_glossary')
        .select('id, term, display_name, slug, short_definition, category, synonyms, pronunciation');

      if (allTermsForSynonyms) {
        for (const t of allTermsForSynonyms) {
          if (existingSlugs.has(t.slug)) continue;

          if (t.synonyms && t.synonyms.some((s: string) => s.toLowerCase().includes(searchLower))) {
            filteredTerms.push(t);
          }
        }
      }

      // Sort alphabetically
      filteredTerms.sort((a, b) => a.term.localeCompare(b.term));
    }

    // Apply field selection or use preset list fields
    let optimizedTerms = filteredTerms;
    if (requestedFields) {
      optimizedTerms = selectFieldsArray(filteredTerms, requestedFields) as typeof filteredTerms;
    } else {
      // Use optimized preset fields for list view
      optimizedTerms = selectFieldsArray(
        filteredTerms,
        FIELD_PRESETS.glossary.list
      ) as typeof filteredTerms;
    }

    // Get counts by category (cached query - minimal fields)
    const { data: allTermsForCount } = await supabase.from('kb_glossary').select('category');

    const categoryCounts: Record<string, number> = {};
    allTermsForCount?.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    // Get available letters
    const { data: letterData } = await supabase.from('kb_glossary').select('term');

    const availableLetters = [...new Set(
      letterData?.map(t => t.term.charAt(0).toUpperCase()) || []
    )].sort();

    const responseData = {
      terms: optimizedTerms,
      total: optimizedTerms.length,
      categoryCounts,
      availableLetters
    };

    // Generate cache key based on filters
    const cacheKey = `glossary-list-${category || 'all'}-${letter || 'all'}-${search || 'none'}`;

    // Return with ETag and list page caching
    return withETag(request, responseData, {
      maxAge: 120,           // 2 minutes browser cache
      sMaxAge: 600,          // 10 minutes CDN cache
      staleWhileRevalidate: 7200, // 2 hours stale-while-revalidate
      salt: cacheKey,
    });
  } catch (error) {
    console.error('Error fetching glossary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch glossary' },
      {
        status: 500,
        headers: { 'Cache-Control': CACHE_PROFILES.noCache },
      }
    );
  }
}

export const dynamic = 'force-dynamic';
