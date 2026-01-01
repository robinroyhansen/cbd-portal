import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_anon_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabase_service_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabase_url_starts_with: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 25) || 'NOT_SET',
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV || 'not_vercel'
    };

    return NextResponse.json(envCheck);
  } catch (error) {
    return NextResponse.json({
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}