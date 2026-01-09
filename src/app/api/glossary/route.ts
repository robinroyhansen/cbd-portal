import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const letter = searchParams.get('letter');
    const search = searchParams.get('q');
    const slug = searchParams.get('slug');
    const difficulty = searchParams.get('difficulty');

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

    // Build query for listing terms
    let query = supabase
      .from('kb_glossary')
      .select('id, term, slug, short_definition, category, difficulty, synonyms')
      .order('term', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (letter) {
      query = query.ilike('term', `${letter}%`);
    }

    if (search) {
      // Search in term, synonyms, and short_definition
      query = query.or(`term.ilike.%${search}%,short_definition.ilike.%${search}%`);
    }

    const { data: terms, error } = await query;

    if (error) {
      console.error('Error fetching glossary:', error);
      throw error;
    }

    // Get counts by category
    const { data: allTerms } = await supabase
      .from('kb_glossary')
      .select('category');

    const categoryCounts: Record<string, number> = {};
    allTerms?.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    // Get available letters
    const { data: letterData } = await supabase
      .from('kb_glossary')
      .select('term');

    const availableLetters = [...new Set(letterData?.map(t => t.term.charAt(0).toUpperCase()) || [])].sort();

    return NextResponse.json({
      terms: terms || [],
      total: terms?.length || 0,
      categoryCounts,
      availableLetters
    });
  } catch (error) {
    console.error('Error fetching glossary:', error);
    return NextResponse.json({ error: 'Failed to fetch glossary' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
