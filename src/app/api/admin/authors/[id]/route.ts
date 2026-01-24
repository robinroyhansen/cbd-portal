import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

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

    // If slug is being changed, check if it already exists
    if (body.slug) {
      const { data: existingAuthor } = await supabase
        .from('kb_authors')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', params.id)
        .single();

      if (existingAuthor) {
        return NextResponse.json({ error: 'An author with this slug already exists' }, { status: 400 });
      }
    }

    // If this author is being set as primary, unset all other primary authors
    if (body.is_primary) {
      await supabase
        .from('kb_authors')
        .update({ is_primary: false })
        .neq('id', params.id);
    }

    // Whitelist allowed fields to prevent mass assignment attacks
    const { data: author, error } = await supabase
      .from('kb_authors')
      .update({
        name: body.name,
        slug: body.slug,
        title: body.title,
        email: body.email,
        bio_short: body.bio_short,
        bio_full: body.bio_full,
        image_url: body.image_url,
        website_url: body.website_url,
        linkedin_url: body.linkedin_url,
        twitter_url: body.twitter_url,
        credentials: body.credentials,
        expertise_areas: body.expertise_areas,
        is_primary: body.is_primary,
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