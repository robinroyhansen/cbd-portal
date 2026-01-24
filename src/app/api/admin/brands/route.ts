import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { brandCreateSchema, brandUpdateSchema, uuid, validate } from '@/lib/validations';

// GET all brands for admin
export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('q');
    const published = searchParams.get('published');

    let query = supabase
      .from('kb_brands')
      .select(`
        *,
        kb_brand_reviews (
          id,
          overall_score,
          is_published
        )
      `)
      .order('name', { ascending: true });

    if (published === 'true') {
      query = query.eq('is_published', true);
    } else if (published === 'false') {
      query = query.eq('is_published', false);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,website_domain.ilike.%${search}%`);
    }

    const { data: brands, error } = await query;

    if (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }

    // Transform to include review status
    // Note: kb_brand_reviews can be an array or single object depending on Supabase's inference
    const brandsWithReviewStatus = (brands || []).map(brand => {
      const reviews = brand.kb_brand_reviews;
      // Handle both array and object cases
      const review = Array.isArray(reviews)
        ? reviews[0]
        : reviews; // Single object (one-to-one relationship)

      return {
        ...brand,
        has_review: !!review,
        review_score: review?.overall_score ?? null,
        review_published: review?.is_published ?? false,
        review_id: review?.id ?? null
      };
    });

    // Get counts
    const { data: allBrands } = await supabase
      .from('kb_brands')
      .select('is_published');

    const publishedCount = allBrands?.filter(b => b.is_published).length || 0;
    const draftCount = allBrands?.filter(b => !b.is_published).length || 0;

    return NextResponse.json({
      brands: brandsWithReviewStatus,
      total: allBrands?.length || 0,
      publishedCount,
      draftCount
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

// POST create new brand
export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = createServiceClient();
    const body = await request.json();

    // Validate input with zod schema
    const validation = validate(brandCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors?.[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('kb_brands')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'A brand with this name already exists' }, { status: 400 });
    }

    const { data: newBrand, error } = await supabase
      .from('kb_brands')
      .insert({
        name: data.name,
        slug,
        website_url: data.website_url || null,
        logo_url: data.logo_url || null,
        headquarters_country: data.headquarters_country || null,
        founded_year: data.founded_year || null,
        short_description: data.short_description || null,
        is_published: data.is_published
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating brand:', error);
      throw error;
    }

    return NextResponse.json({ brand: newBrand });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}

// PATCH update brand
export async function PATCH(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = createServiceClient();
    const body = await request.json();

    // Add id to schema for updates
    const updateSchema = brandUpdateSchema.extend({
      id: uuid,
    });

    // Validate input with zod schema
    const validation = validate(updateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors?.[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const { id, ...validatedData } = validation.data!;

    // Build update object with only allowed fields
    const updates: Record<string, unknown> = {};
    if (validatedData.name !== undefined) updates.name = validatedData.name;
    if (validatedData.website_url !== undefined) updates.website_url = validatedData.website_url || null;
    if (validatedData.logo_url !== undefined) updates.logo_url = validatedData.logo_url || null;
    if (validatedData.headquarters_country !== undefined) updates.headquarters_country = validatedData.headquarters_country || null;
    if (validatedData.founded_year !== undefined) updates.founded_year = validatedData.founded_year || null;
    if (validatedData.short_description !== undefined) updates.short_description = validatedData.short_description || null;
    if (validatedData.description !== undefined) updates.description = validatedData.description || null;
    if (validatedData.is_published !== undefined) updates.is_published = validatedData.is_published;
    if (validatedData.certifications !== undefined) updates.certifications = validatedData.certifications;

    // If name is being updated, regenerate slug
    if (updates.name) {
      updates.slug = (updates.name as string)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check for duplicate slug (excluding current brand)
      const { data: existing } = await supabase
        .from('kb_brands')
        .select('id')
        .eq('slug', updates.slug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'A brand with this name already exists' }, { status: 400 });
      }
    }

    const { data: updatedBrand, error } = await supabase
      .from('kb_brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand:', error);
      throw error;
    }

    return NextResponse.json({ brand: updatedBrand });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

// DELETE brand(s)
export async function DELETE(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createServiceClient();
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Brand IDs required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('kb_brands')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting brands:', error);
      throw error;
    }

    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    console.error('Error deleting brands:', error);
    return NextResponse.json({ error: 'Failed to delete brands' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
