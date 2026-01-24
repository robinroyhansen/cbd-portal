import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

// GET recent audit log entries
export async function GET(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const action = searchParams.get('action');
    const resourceType = searchParams.get('resourceType');

    let query = supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq('action', action);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    const { data, error } = await query;

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({
          logs: [],
          message: 'Audit log table not yet created. Run the migration.',
        });
      }
      console.error('Error fetching activity logs:', error);
      return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
    }

    // Get summary stats
    const { data: stats } = await supabase
      .from('admin_audit_log')
      .select('action')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const actionCounts: Record<string, number> = {};
    stats?.forEach((s) => {
      actionCounts[s.action] = (actionCounts[s.action] || 0) + 1;
    });

    return NextResponse.json({
      logs: data || [],
      stats: {
        last24Hours: stats?.length || 0,
        byAction: actionCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
