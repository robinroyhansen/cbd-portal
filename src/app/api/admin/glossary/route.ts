import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { glossaryTermSchema, glossaryTermUpdateSchema, validate } from '@/lib/validations';

// GET all glossary terms for admin
export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
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
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = await createClient();
    const body = await request.json();

    // Validate input with zod schema
    const validation = validate(glossaryTermSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors?.[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Generate slug
    const slug = data.term
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
        term: data.term,
        display_name: data.display_name || data.term,
        slug,
        definition: data.definition,
        short_definition: data.short_definition,
        category: data.category,
        synonyms: data.synonyms,
        related_terms: data.related_terms,
        related_research: data.related_research,
        sources: data.sources
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
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = await createClient();
    const body = await request.json();

    // Validate input with zod schema
    const validation = validate(glossaryTermUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors?.[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const { id, ...updates } = validation.data!;

    // If term is being updated, regenerate slug
    let newSlug: string | undefined;
    if (updates.term) {
      newSlug = updates.term
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check for duplicate slug (excluding current term)
      const { data: existing } = await supabase
        .from('kb_glossary')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'A term with this name already exists' }, { status: 400 });
      }
    }

    // Build update object with only allowed fields
    const updateData: Record<string, unknown> = {};
    if (updates.term !== undefined) updateData.term = updates.term;
    if (updates.display_name !== undefined) updateData.display_name = updates.display_name;
    if (newSlug !== undefined) updateData.slug = newSlug;
    if (updates.definition !== undefined) updateData.definition = updates.definition;
    if (updates.short_definition !== undefined) updateData.short_definition = updates.short_definition;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.synonyms !== undefined) updateData.synonyms = updates.synonyms;
    if (updates.related_terms !== undefined) updateData.related_terms = updates.related_terms;
    if (updates.related_research !== undefined) updateData.related_research = updates.related_research;
    if (updates.sources !== undefined) updateData.sources = updates.sources;

    const { data: updatedTerm, error } = await supabase
      .from('kb_glossary')
      .update(updateData)
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
  const authError = requireAdminAuth(request);
  if (authError) return authError;
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
