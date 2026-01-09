import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET all glossary terms for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const search = searchParams.get('q');

    let query = supabase
      .from('kb_glossary')
      .select('*')
      .order('term', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
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
    let total = 0;
    allTerms?.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      total++;
    });

    return NextResponse.json({
      terms: terms || [],
      total,
      categoryCounts
    });
  } catch (error) {
    console.error('Error fetching glossary:', error);
    return NextResponse.json({ error: 'Failed to fetch glossary' }, { status: 500 });
  }
}

// POST create new glossary term
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      term,
      definition,
      short_definition,
      category,
      synonyms,
      related_terms,
      related_research,
      difficulty,
      sources
    } = body;

    // Validation
    if (!term || term.trim().length < 2) {
      return NextResponse.json({ error: 'Term must be at least 2 characters' }, { status: 400 });
    }

    if (!definition || definition.trim().length < 10) {
      return NextResponse.json({ error: 'Definition must be at least 10 characters' }, { status: 400 });
    }

    if (!short_definition || short_definition.trim().length < 10) {
      return NextResponse.json({ error: 'Short definition must be at least 10 characters' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Generate slug
    const slug = term
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('kb_glossary')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'A term with this name already exists' }, { status: 400 });
    }

    const { data: newTerm, error } = await supabase
      .from('kb_glossary')
      .insert({
        term: term.trim(),
        slug,
        definition: definition.trim(),
        short_definition: short_definition.trim(),
        category,
        synonyms: synonyms || [],
        related_terms: related_terms || [],
        related_research: related_research || [],
        difficulty: difficulty || 'beginner',
        sources: sources || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating glossary term:', error);
      throw error;
    }

    return NextResponse.json({ term: newTerm });
  } catch (error) {
    console.error('Error creating glossary term:', error);
    return NextResponse.json({ error: 'Failed to create glossary term' }, { status: 500 });
  }
}

// PATCH update glossary term
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Term ID required' }, { status: 400 });
    }

    // If term is being updated, regenerate slug
    if (updates.term) {
      updates.slug = updates.term
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check for duplicate slug (excluding current term)
      const { data: existing } = await supabase
        .from('kb_glossary')
        .select('id')
        .eq('slug', updates.slug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'A term with this name already exists' }, { status: 400 });
      }
    }

    const { data: updatedTerm, error } = await supabase
      .from('kb_glossary')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating glossary term:', error);
      throw error;
    }

    return NextResponse.json({ term: updatedTerm });
  } catch (error) {
    console.error('Error updating glossary term:', error);
    return NextResponse.json({ error: 'Failed to update glossary term' }, { status: 500 });
  }
}

// DELETE glossary term(s)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Term IDs required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('kb_glossary')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting glossary terms:', error);
      throw error;
    }

    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    console.error('Error deleting glossary terms:', error);
    return NextResponse.json({ error: 'Failed to delete glossary terms' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
