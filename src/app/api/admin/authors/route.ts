import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: authors, error } = await supabase
      .from('authors')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching authors:', error);
      throw error;
    }

    return NextResponse.json({ authors: authors || [] });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Generate slug from name if not provided
    let slug = body.slug;
    if (!slug && body.name) {
      slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug or name is required' }, { status: 400 });
    }

    // Check if slug already exists
    const { data: existingAuthor } = await supabase
      .from('authors')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingAuthor) {
      return NextResponse.json({ error: 'An author with this slug already exists' }, { status: 400 });
    }

    // If this author is set as primary, unset all other primary authors
    if (body.is_primary) {
      await supabase
        .from('authors')
        .update({ is_primary: false })
        .neq('id', 'placeholder'); // Update all existing authors
    }

    const { data: author, error } = await supabase
      .from('authors')
      .insert({
        ...body,
        slug,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating author:', error);
      throw error;
    }

    return NextResponse.json({ author });
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
  }
}