import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic environment check without imports
    const status = {
      timestamp: new Date().toISOString(),
      api_working: true,
      environment: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV || 'local',
      env_vars_check: {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({
      error: 'Status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}