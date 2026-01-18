import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/admin/migrations/status
 * Check status of pending migrations
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const status: Record<string, { exists: boolean; error?: string }> = {};

    // Check suggested_mappings table
    const { error: smError } = await supabase
      .from('suggested_mappings')
      .select('id')
      .limit(1);

    status.suggested_mappings = {
      exists: !smError || smError.code !== 'PGRST205',
      error: smError?.code === 'PGRST205' ? 'Table does not exist' : undefined
    };

    // Check content_type column
    const { error: ctError } = await supabase
      .from('kb_research_queue')
      .select('content_type')
      .limit(1);

    status.content_type_column = {
      exists: !ctError,
      error: ctError?.message
    };

    // Get counts if tables exist
    let counts: Record<string, number> = {};

    if (status.content_type_column.exists) {
      const types = ['medical', 'legal', 'economic', 'agricultural', 'other', 'unclassified'];
      for (const type of types) {
        const { count } = await supabase
          .from('kb_research_queue')
          .select('*', { count: 'exact', head: true })
          .eq('content_type', type);
        counts[type] = count || 0;
      }
    }

    const allMigrationsApplied = Object.values(status).every(s => s.exists);

    return NextResponse.json({
      status,
      counts,
      allMigrationsApplied,
      instructions: allMigrationsApplied
        ? 'All migrations applied. You can now run the content classification.'
        : 'Please run the SQL in supabase/migrations/APPLY_NOW.sql via Supabase Dashboard > SQL Editor'
    });

  } catch (error) {
    console.error('[Migrations Status] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
