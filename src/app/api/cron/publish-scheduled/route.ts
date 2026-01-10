import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Vercel Cron job to publish scheduled content
// Runs every 5 minutes via vercel.json cron config
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret in production
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, require authorization
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const supabase = createServiceClient();
    const now = new Date().toISOString();
    const results = {
      brands: { published: 0, errors: 0 },
      reviews: { published: 0, errors: 0 }
    };

    // Publish scheduled brands
    const { data: scheduledBrands, error: brandsError } = await supabase
      .from('kb_brands')
      .select('id, name')
      .eq('is_published', false)
      .not('scheduled_publish_at', 'is', null)
      .lte('scheduled_publish_at', now);

    if (brandsError) {
      console.error('Error fetching scheduled brands:', brandsError);
    } else if (scheduledBrands && scheduledBrands.length > 0) {
      for (const brand of scheduledBrands) {
        const { error: updateError } = await supabase
          .from('kb_brands')
          .update({
            is_published: true,
            scheduled_publish_at: null
          })
          .eq('id', brand.id);

        if (updateError) {
          console.error(`Error publishing brand ${brand.name}:`, updateError);
          results.brands.errors++;
        } else {
          console.log(`Auto-published brand: ${brand.name}`);
          results.brands.published++;
        }
      }
    }

    // Publish scheduled reviews
    const { data: scheduledReviews, error: reviewsError } = await supabase
      .from('kb_brand_reviews')
      .select(`
        id,
        brand_id,
        kb_brands (name)
      `)
      .eq('is_published', false)
      .not('scheduled_publish_at', 'is', null)
      .lte('scheduled_publish_at', now);

    if (reviewsError) {
      console.error('Error fetching scheduled reviews:', reviewsError);
    } else if (scheduledReviews && scheduledReviews.length > 0) {
      for (const review of scheduledReviews) {
        // Publish the review
        const { error: updateError } = await supabase
          .from('kb_brand_reviews')
          .update({
            is_published: true,
            published_at: now,
            scheduled_publish_at: null
          })
          .eq('id', review.id);

        if (updateError) {
          console.error(`Error publishing review:`, updateError);
          results.reviews.errors++;
        } else {
          const brandName = (review.kb_brands as { name: string } | null)?.name || 'Unknown';
          console.log(`Auto-published review for: ${brandName}`);
          results.reviews.published++;

          // Also auto-publish the brand
          if (review.brand_id) {
            const { error: brandError } = await supabase
              .from('kb_brands')
              .update({ is_published: true })
              .eq('id', review.brand_id);

            if (brandError) {
              console.error(`Error auto-publishing brand for review:`, brandError);
            }
          }
        }
      }
    }

    const totalPublished = results.brands.published + results.reviews.published;
    const totalErrors = results.brands.errors + results.reviews.errors;

    return NextResponse.json({
      success: true,
      message: totalPublished > 0
        ? `Published ${totalPublished} item(s)`
        : 'No scheduled items to publish',
      results,
      timestamp: now
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
