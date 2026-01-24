import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
// Check for migration secret
    const authHeader = request.headers.get('x-migration-secret');
    const migrationSecret = process.env.MIGRATION_SECRET;

    if (!migrationSecret) {
      return NextResponse.json(
        { error: 'MIGRATION_SECRET not configured on server' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== migrationSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing x-migration-secret header' },
        { status: 401 }
      );
    }

    // Get SQL from request body
    const body = await request.json();
    const { sql } = body;

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid sql field in request body' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Execute the SQL using Supabase's rpc or direct query
    // We'll use the postgres connection through supabase-js
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      // If exec_sql doesn't exist, try alternative approach
      if (error.code === 'PGRST202') {
        // Create the exec_sql function first, then retry
        // Or use a different approach - execute via REST
        return NextResponse.json(
          {
            error: 'exec_sql function not found. Run this SQL first in Supabase dashboard to enable migrations:',
            setup_sql: `
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute to service role only
REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
            `.trim()
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Migration executed successfully',
      result: data
    });

  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
