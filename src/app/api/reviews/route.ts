import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET published brand reviews for public display
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const slug = searchParams.get('slug');
    const minScore = searchParams.get('min_score');
    const maxScore = searchParams.get('max_score');
    const sortBy = searchParams.get('sort') || 'score'; // score, name, date
    const limit = searchParams.get('limit');

    // If slug is provided, return single review with full details
    if (slug) {
      // First get brand by slug
      const { data: brand, error: brandError } = await supabase
        .from('kb_brands')
        .select('id, name, slug, website_domain, logo_url, headquarters_country, founded_year, short_description')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (brandError || !brand) {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
      }

      // Get the review
      const { data: review, error: reviewError } = await supabase
        .from('kb_brand_reviews')
        .select(`
          id,
          overall_score,
          summary,
          full_review,
          pros,
          cons,
          verdict,
          meta_title,
          meta_description,
          published_at,
          last_reviewed_at,
          kb_authors (
            id,
            name,
            slug,
            title,
            image_url,
            bio_short
          ),
          kb_brand_review_scores (
            criterion_id,
            score
          )
        `)
        .eq('brand_id', brand.id)
        .eq('is_published', true)
        .single();

      if (reviewError || !review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      // Get criteria for score breakdown
      const { data: criteria } = await supabase
        .from('kb_review_criteria')
        .select('id, name, description, max_points, display_order, subcriteria')
        .order('display_order', { ascending: true });

      // Map scores to criteria
      const scoreMap: Record<string, number> = {};
      review.kb_brand_review_scores?.forEach((s: { criterion_id: string; score: number }) => {
        scoreMap[s.criterion_id] = s.score;
      });

      const scoreBreakdown = criteria?.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        max_points: c.max_points,
        score: scoreMap[c.id] || 0,
        subcriteria: c.subcriteria
      }));

      return NextResponse.json({
        brand,
        review: {
          ...review,
          scoreBreakdown,
          kb_brand_review_scores: undefined // Remove raw scores
        }
      });
    }

    // List all published reviews
    let query = supabase
      .from('kb_brand_reviews')
      .select(`
        id,
        overall_score,
        summary,
        published_at,
        last_reviewed_at,
        kb_brands!inner (
          id,
          name,
          slug,
          website_domain,
          logo_url,
          short_description,
          is_published
        ),
        kb_authors (
          id,
          name,
          slug
        )
      `)
      .eq('is_published', true)
      .eq('kb_brands.is_published', true);

    // Score filters
    if (minScore) {
      query = query.gte('overall_score', parseInt(minScore));
    }
    if (maxScore) {
      query = query.lte('overall_score', parseInt(maxScore));
    }

    // Sorting
    if (sortBy === 'score') {
      query = query.order('overall_score', { ascending: false });
    } else if (sortBy === 'name') {
      query = query.order('kb_brands(name)', { ascending: true });
    } else if (sortBy === 'date') {
      query = query.order('published_at', { ascending: false });
    }

    // Limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    // Transform the response
    const transformedReviews = (reviews || []).map(review => ({
      id: review.id,
      overall_score: review.overall_score,
      summary: review.summary,
      published_at: review.published_at,
      last_reviewed_at: review.last_reviewed_at,
      brand: review.kb_brands,
      author: review.kb_authors
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      total: transformedReviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
