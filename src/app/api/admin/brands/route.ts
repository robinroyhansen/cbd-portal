import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET all brands for admin
export async function GET(request: NextRequest) {
  try {
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
    const brandsWithReviewStatus = (brands || []).map(brand => ({
      ...brand,
      has_review: brand.kb_brand_reviews && brand.kb_brand_reviews.length > 0,
      review_score: brand.kb_brand_reviews?.[0]?.overall_score,
      review_published: brand.kb_brand_reviews?.[0]?.is_published,
      review_id: brand.kb_brand_reviews?.[0]?.id
    }));

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
    const supabase = createServiceClient();
    const body = await request.json();

    const {
      name,
      website_url,
      logo_url,
      headquarters_country,
      founded_year,
      short_description,
      is_published
    } = body;

    // Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Brand name must be at least 2 characters' }, { status: 400 });
    }

    // Generate slug
    const slug = name
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
        name: name.trim(),
        slug,
        website_url: website_url?.trim() || null,
        logo_url: logo_url?.trim() || null,
        headquarters_country: headquarters_country?.trim() || null,
        founded_year: founded_year || null,
        short_description: short_description?.trim() || null,
        is_published: is_published || false
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
    const supabase = createServiceClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Brand ID required' }, { status: 400 });
    }

    // Only allow updating specific fields (filter out computed/readonly fields)
    const allowedFields = ['name', 'website_url', 'logo_url', 'headquarters_country', 'founded_year', 'short_description', 'is_published'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

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

    // Handle empty strings - convert to null for optional fields
    if (updates.headquarters_country === '') updates.headquarters_country = null;
    if (updates.website_url === '') updates.website_url = null;
    if (updates.logo_url === '') updates.logo_url = null;
    if (updates.short_description === '') updates.short_description = null;
    if (updates.founded_year === '' || updates.founded_year === 0) updates.founded_year = null;

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
