import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { authorUpdateSchema, validate } from '@/lib/validations';

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = await createClient();

    const { data: author, error } = await supabase
      .from('kb_authors')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching author:', error);
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    return NextResponse.json({ author });
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json({ error: 'Author not found' }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = await createClient();
    const body = await request.json();

    // Validate input with zod schema
    const validation = validate(authorUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors?.[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const validatedData = validation.data!;

    // If slug is being changed, check if it already exists
    if (validatedData.slug) {
      const { data: existingAuthor } = await supabase
        .from('kb_authors')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', params.id)
        .single();

      if (existingAuthor) {
        return NextResponse.json({ error: 'An author with this slug already exists' }, { status: 400 });
      }
    }

    // If this author is being set as primary, unset all other primary authors
    if (validatedData.is_primary) {
      await supabase
        .from('kb_authors')
        .update({ is_primary: false })
        .neq('id', params.id);
    }

    // Update with validated data
    const { data: author, error } = await supabase
      .from('kb_authors')
      .update({
        name: validatedData.name,
        slug: validatedData.slug,
        title: validatedData.title,
        email: validatedData.email,
        bio_short: validatedData.bio_short,
        bio_full: validatedData.bio_full,
        image_url: validatedData.image_url,
        website_url: validatedData.website_url,
        linkedin_url: validatedData.linkedin_url,
        twitter_url: validatedData.twitter_url,
        credentials: validatedData.credentials,
        expertise_areas: validatedData.expertise_areas,
        is_primary: validatedData.is_primary,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating author:', error);
      throw error;
    }

    return NextResponse.json({ author });
  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = await createClient();

    // Check if this author has any articles
    const { data: articles, error: articlesError } = await supabase
      .from('kb_articles')
      .select('id')
      .eq('author_id', params.id)
      .limit(1);

    if (articlesError) {
      console.error('Error checking author articles:', articlesError);
      return NextResponse.json({ error: 'Failed to check author articles' }, { status: 500 });
    }

    if (articles && articles.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete author with published articles. Please reassign articles first.'
      }, { status: 400 });
    }

    // Check if this is the primary author
    const { data: author } = await supabase
      .from('kb_authors')
      .select('is_primary')
      .eq('id', params.id)
      .single();

    if (author?.is_primary) {
      return NextResponse.json({
        error: 'Cannot delete the primary author. Please set another author as primary first.'
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('kb_authors')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting author:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 });
  }
}