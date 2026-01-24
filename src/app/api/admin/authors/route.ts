import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { authorCreateSchema, validate } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
// Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing',
        details: 'Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required',
        troubleshoot: {
          step1: 'Check Vercel environment variables dashboard',
          step2: 'Ensure variables are set for production environment',
          step3: 'Redeploy after setting variables'
        }
      }, { status: 500 });
    }

    const supabase = await createClient();

    const { data: authors, error } = await supabase
      .from('kb_authors')
      .select('*')
      .order('is_primary', { ascending: false })
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
  const authError = requireAdminAuth(request);
  if (authError) return authError;
// Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        error: 'Supabase configuration missing',
        details: 'Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
      }, { status: 500 });
    }

    const supabase = await createClient();
    const body = await request.json();

    // Validate input with zod schema
    const validation = validate(authorCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors?.[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const validatedData = validation.data!;

    // Generate slug from name if not provided
    let slug = validatedData.slug;
    if (!slug && validatedData.name) {
      slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug already exists
    const { data: existingAuthor } = await supabase
      .from('kb_authors')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingAuthor) {
      return NextResponse.json({ error: 'An author with this slug already exists' }, { status: 400 });
    }

    // If this author is set as primary, unset all other primary authors
    if (validatedData.is_primary) {
      await supabase
        .from('kb_authors')
        .update({ is_primary: false })
        .neq('id', 'placeholder'); // Update all existing authors
    }

    // Insert with validated and sanitized data
    const { data: author, error } = await supabase
      .from('kb_authors')
      .insert({
        name: validatedData.name,
        slug,
        title: validatedData.title || null,
        email: validatedData.email || null,
        bio_short: validatedData.bio_short || null,
        bio_full: validatedData.bio_full || null,
        image_url: validatedData.image_url || null,
        website_url: validatedData.website_url || null,
        linkedin_url: validatedData.linkedin_url || null,
        twitter_url: validatedData.twitter_url || null,
        credentials: validatedData.credentials || null,
        expertise_areas: validatedData.expertise_areas || null,
        is_primary: validatedData.is_primary,
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

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';