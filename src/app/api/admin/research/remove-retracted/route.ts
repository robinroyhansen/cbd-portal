import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * DELETE /api/admin/research/remove-retracted
 *
 * Removes all research entries with "RETRACTED" in the title
 *
 * Query params:
 * - dryRun: If "true", shows what would be deleted without removing (default: false)
 */
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === 'true';

  try {
    // Find all entries with RETRACTED in title
    const { data: retracted, error: findError } = await supabase
      .from('kb_research_queue')
      .select('id, title, status, relevance_score')
      .ilike('title', '%RETRACTED%');

    if (findError) {
      throw new Error(`Failed to find retracted entries: ${findError.message}`);
    }

    const count = retracted?.length || 0;

    if (count === 0) {
      return NextResponse.json({
        success: true,
        message: 'No retracted entries found',
        deleted: 0
      });
    }

    // Group by status for stats
    const byStatus = retracted?.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    if (!dryRun) {
      const ids = retracted!.map(r => r.id);
      const { error: deleteError } = await supabase
        .from('kb_research_queue')
        .delete()
        .in('id', ids);

      if (deleteError) {
        throw new Error(`Failed to delete retracted entries: ${deleteError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      deleted: count,
      byStatus,
      entries: retracted?.map(r => ({
        id: r.id,
        title: r.title?.substring(0, 100),
        status: r.status
      })),
      message: dryRun
        ? `Would delete ${count} retracted entries`
        : `Deleted ${count} retracted entries`
    });
  } catch (error) {
    console.error('Remove retracted error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove retracted entries'
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/research/remove-retracted
 *
 * Preview retracted entries that would be removed
 */
export async function GET() {
  try {
    const { data: retracted, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, status, relevance_score, year')
      .ilike('title', '%RETRACTED%');

    if (error) {
      throw new Error(`Failed to find retracted entries: ${error.message}`);
    }

    const byStatus = retracted?.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      count: retracted?.length || 0,
      byStatus,
      entries: retracted?.map(r => ({
        id: r.id,
        title: r.title,
        status: r.status,
        year: r.year
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch retracted entries'
    }, { status: 500 });
  }
}
