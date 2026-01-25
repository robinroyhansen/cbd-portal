import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

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

      // Get related terms details
      if (term.related_terms && term.related_terms.length > 0) {
        const { data: relatedTerms } = await supabase
          .from('kb_glossary')
          .select('term, slug, short_definition, category')
          .in('slug', term.related_terms);

        term.related_terms_details = relatedTerms || [];
      }

      // Get related research details
      if (term.related_research && term.related_research.length > 0) {
        const { data: relatedResearch } = await supabase
          .from('kb_research_queue')
          .select('id, title, url, year')
          .in('id', term.related_research)
          .eq('status', 'approved');

        term.related_research_details = relatedResearch || [];
      }

      return NextResponse.json({ term });
    }

    // Fetch all terms for autocomplete (minimal fields, include synonyms)
    if (fetchAll) {
      const { data: allTerms } = await supabase
        .from('kb_glossary')
        .select('id, term, display_name, slug, category, synonyms')
        .order('term', { ascending: true });

      return NextResponse.json({ terms: allTerms || [] });
    }

    // Build query for listing terms
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

      // Fetch all terms to check synonyms
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

    // Get counts by category
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

    return NextResponse.json({
      terms: filteredTerms,
      total: filteredTerms.length,
      categoryCounts,
      availableLetters
    });
  } catch (error) {
    console.error('Error fetching glossary:', error);
    return NextResponse.json({ error: 'Failed to fetch glossary' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
