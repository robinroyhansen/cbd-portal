import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/scheduler
 *
 * Fetches all articles for the content scheduler, including draft, scheduled, and published articles.
 *
 * Query params:
 * - status: 'all' | 'draft' | 'scheduled' | 'published' (default: 'all')
 * - month: number (0-11, current month by default)
 * - year: number (current year by default)
 * - limit: number (default: 100)
 */
export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const statusFilter = searchParams.get('status') || 'all';
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Build query
    let query = supabase
      .from('kb_articles')
      .select(`
        id,
        title,
        slug,
        status,
        scheduled_publish_at,
        published_at,
        created_at,
        updated_at,
        article_type,
        meta_description,
        category:kb_categories(id, name)
      `)
      .order('scheduled_publish_at', { ascending: true, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: true })
      .limit(limit);

    // Apply status filter
    const now = new Date().toISOString();

    if (statusFilter === 'draft') {
      query = query.eq('status', 'draft');
    } else if (statusFilter === 'scheduled') {
      // Scheduled: status is 'scheduled' OR (status is 'published' but scheduled_publish_at is in the future)
      query = query.or(`status.eq.scheduled,and(status.eq.published,scheduled_publish_at.gt.${now})`);
    } else if (statusFilter === 'published') {
      // Published: status is 'published' AND (no scheduled_publish_at OR it's in the past)
      query = query
        .eq('status', 'published')
        .or(`scheduled_publish_at.is.null,scheduled_publish_at.lte.${now}`);
    }
    // 'all' - no status filter

    // Apply date range filter if month/year provided
    if (month !== null && year !== null) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (!isNaN(monthNum) && !isNaN(yearNum)) {
        const startDate = new Date(yearNum, monthNum, 1).toISOString();
        const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59).toISOString();

        // Filter by scheduled_publish_at or published_at being within the month
        query = query.or(
          `and(scheduled_publish_at.gte.${startDate},scheduled_publish_at.lte.${endDate}),` +
          `and(scheduled_publish_at.is.null,published_at.gte.${startDate},published_at.lte.${endDate})`
        );
      }
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Error fetching scheduled articles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch articles', details: error.message },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      total: articles?.length || 0,
      draft: articles?.filter((a) => a.status === 'draft').length || 0,
      scheduled: articles?.filter((a) => {
        if (a.status === 'scheduled') return true;
        if (a.status === 'published' && a.scheduled_publish_at) {
          return new Date(a.scheduled_publish_at) > new Date();
        }
        return false;
      }).length || 0,
      published: articles?.filter((a) => {
        if (a.status !== 'published') return false;
        if (a.scheduled_publish_at) {
          return new Date(a.scheduled_publish_at) <= new Date();
        }
        return true;
      }).length || 0,
    };

    return NextResponse.json({
      articles: articles || [],
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
