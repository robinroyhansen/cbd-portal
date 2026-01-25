import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const resourceType = searchParams.get('resourceType');

    // Build query
    let query = supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (action) {
      query = query.eq('action', action);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    const { data: logs, error } = await query;

    if (error) {
      // If table doesn't exist, return empty results
      if (error.code === '42P01') {
        return NextResponse.json({
          logs: [],
          stats: {
            last24Hours: 0,
            byAction: {},
          },
        });
      }
      throw error;
    }

    // Calculate stats
    const now = new Date();
    const last24Hours = logs?.filter((log) => {
      const logDate = new Date(log.created_at);
      return now.getTime() - logDate.getTime() < 24 * 60 * 60 * 1000;
    }).length || 0;

    const byAction: Record<string, number> = {};
    logs?.forEach((log) => {
      if (log.action) {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
      }
    });

    return NextResponse.json({
      logs: logs || [],
      stats: {
        last24Hours,
        byAction,
      },
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
