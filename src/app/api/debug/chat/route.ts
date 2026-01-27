/**
 * Debug endpoint to test Supabase connection
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const debug: Record<string, unknown> = {
    hasUrl: !!url,
    hasKey: !!key,
    urlValue: url,
    keyLength: key?.length,
    keyPrefix: key?.substring(0, 30),
    keySuffix: key?.substring(-10),
  };

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars', debug });
  }

  try {
    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Simple query
    const { data, error, count } = await supabase
      .from('chat_conversations')
      .select('id, session_id', { count: 'exact' })
      .limit(5);

    return NextResponse.json({
      success: !error,
      data,
      count,
      error: error?.message,
      debug,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error',
      debug,
    });
  }
}
