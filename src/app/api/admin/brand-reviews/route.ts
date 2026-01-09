import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET all brand reviews for admin (or single review by brand_id)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const brandId = searchParams.get('brand_id');
    const published = searchParams.get('published');

    // If brand_id is provided, return single review with scores
    if (brandId) {
      const { data: review, error } = await supabase
        .from('kb_brand_reviews')
        .select(`
          *,
          kb_brands (
            id,
            name,
            slug,
            website_url,
            website_domain,
            logo_url,
            headquarters_country,
            founded_year,
            short_description
          ),
          kb_authors (
            id,
            name,
            slug,
            image_url
          ),
          kb_brand_review_scores (
            id,
            criterion_id,
            score,
            sub_scores,
            ai_reasoning,
            author_notes
          )
        `)
        .eq('brand_id', brandId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching review:', error);
        throw error;
      }

      // Also fetch criteria for the form
      const { data: criteria } = await supabase
        .from('kb_review_criteria')
        .select('*')
        .order('display_order', { ascending: true });

      return NextResponse.json({
        review: review || null,
        criteria: criteria || []
      });
    }

    // List all reviews
    let query = supabase
      .from('kb_brand_reviews')
      .select(`
        *,
        kb_brands (
          id,
          name,
          slug,
          website_domain,
          logo_url
        ),
        kb_authors (
          id,
          name,
          slug
        )
      `)
      .order('updated_at', { ascending: false });

    if (published === 'true') {
      query = query.eq('is_published', true);
    } else if (published === 'false') {
      query = query.eq('is_published', false);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    // Get counts
    const { data: allReviews } = await supabase
      .from('kb_brand_reviews')
      .select('is_published');

    const publishedCount = allReviews?.filter(r => r.is_published).length || 0;
    const draftCount = allReviews?.filter(r => !r.is_published).length || 0;

    return NextResponse.json({
      reviews: reviews || [],
      total: allReviews?.length || 0,
      publishedCount,
      draftCount
    });
  } catch (error) {
    console.error('Error fetching brand reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch brand reviews' }, { status: 500 });
  }
}

// Helper function to generate full_review from section_content
async function generateFullReviewFromSections(
  supabase: ReturnType<typeof createServiceClient>,
  sectionContent: Record<string, string>,
  scores: Array<{ criterion_id: string; score: number }>
): Promise<string> {
  // Fetch criteria to get names and max_points
  const { data: criteria } = await supabase
    .from('kb_review_criteria')
    .select('id, name, max_points')
    .order('display_order', { ascending: true });

  if (!criteria) return '';

  return criteria.map(c => {
    const sectionText = sectionContent[c.id] || '';
    const score = scores.find(s => s.criterion_id === c.id);
    const totalScore = score?.score || 0;

    if (!sectionText) return null;

    return `## ${c.name} — ${totalScore}/${c.max_points}\n\n${sectionText}`;
  }).filter(Boolean).join('\n\n');
}

// POST create new brand review
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const {
      brand_id,
      author_id,
      summary,
      full_review,
      section_content,
      pros,
      cons,
      verdict,
      sources_researched,
      meta_title,
      meta_description,
      scores // Array of { criterion_id, score, ai_reasoning, author_notes }
    } = body;

    // Validation
    if (!brand_id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    // Check if review already exists for this brand
    const { data: existing } = await supabase
      .from('kb_brand_reviews')
      .select('id')
      .eq('brand_id', brand_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'A review already exists for this brand' }, { status: 400 });
    }

    // Auto-generate full_review from section_content if provided
    let finalFullReview = full_review?.trim() || null;
    if (section_content && Object.keys(section_content).length > 0 && scores) {
      finalFullReview = await generateFullReviewFromSections(supabase, section_content, scores);
    }

    // Create the review
    const { data: newReview, error } = await supabase
      .from('kb_brand_reviews')
      .insert({
        brand_id,
        author_id: author_id || null,
        summary: summary?.trim() || null,
        full_review: finalFullReview,
        section_content: section_content || {},
        pros: pros || [],
        cons: cons || [],
        verdict: verdict?.trim() || null,
        sources_researched: sources_researched || [],
        meta_title: meta_title?.trim() || null,
        meta_description: meta_description?.trim() || null,
        overall_score: 0,
        is_published: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating brand review:', error);
      throw error;
    }

    // Insert scores if provided
    if (scores && Array.isArray(scores) && scores.length > 0) {
      const scoreInserts = scores.map((s: { criterion_id: string; score: number; sub_scores?: Record<string, number>; ai_reasoning?: string; author_notes?: string }) => ({
        brand_review_id: newReview.id,
        criterion_id: s.criterion_id,
        score: s.score,
        sub_scores: s.sub_scores || {},
        ai_reasoning: s.ai_reasoning || null,
        author_notes: s.author_notes || null
      }));

      const { error: scoresError } = await supabase
        .from('kb_brand_review_scores')
        .insert(scoreInserts);

      if (scoresError) {
        console.error('Error creating review scores:', scoresError);
        // Don't fail the whole request, review is created
      }
    }

    // Fetch updated review with scores
    const { data: updatedReview } = await supabase
      .from('kb_brand_reviews')
      .select(`
        *,
        kb_brand_review_scores (
          id,
          criterion_id,
          score,
          ai_reasoning,
          author_notes
        )
      `)
      .eq('id', newReview.id)
      .single();

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error('Error creating brand review:', error);
    return NextResponse.json({ error: 'Failed to create brand review' }, { status: 500 });
  }
}

// PATCH update brand review
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { id, scores, section_content, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    // If publishing, set last_reviewed_at
    if (updates.is_published === true) {
      updates.last_reviewed_at = new Date().toISOString();
    }

    // If section_content is provided, store it and regenerate full_review
    if (section_content !== undefined) {
      updates.section_content = section_content;

      // Auto-generate full_review from section_content
      if (section_content && Object.keys(section_content).length > 0 && scores) {
        updates.full_review = await generateFullReviewFromSections(supabase, section_content, scores);
      }
    }

    // Update the review
    const { data: updatedReview, error } = await supabase
      .from('kb_brand_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand review:', error);
      throw error;
    }

    // Update scores if provided
    if (scores && Array.isArray(scores)) {
      for (const s of scores) {
        const { error: scoreError } = await supabase
          .from('kb_brand_review_scores')
          .upsert({
            brand_review_id: id,
            criterion_id: s.criterion_id,
            score: s.score,
            sub_scores: s.sub_scores || {},
            ai_reasoning: s.ai_reasoning || null,
            author_notes: s.author_notes || null
          }, {
            onConflict: 'brand_review_id,criterion_id'
          });

        if (scoreError) {
          console.error('Error updating score:', scoreError);
        }
      }
    }

    // Fetch updated review with scores
    const { data: finalReview } = await supabase
      .from('kb_brand_reviews')
      .select(`
        *,
        kb_brand_review_scores (
          id,
          criterion_id,
          score,
          ai_reasoning,
          author_notes
        )
      `)
      .eq('id', id)
      .single();

    return NextResponse.json({ review: finalReview });
  } catch (error) {
    console.error('Error updating brand review:', error);
    return NextResponse.json({ error: 'Failed to update brand review' }, { status: 500 });
  }
}

// DELETE brand review(s)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Review IDs required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('kb_brand_reviews')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting brand reviews:', error);
      throw error;
    }

    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    console.error('Error deleting brand reviews:', error);
    return NextResponse.json({ error: 'Failed to delete brand reviews' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
