import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runDailyResearchScan } from '@/lib/research-scanner';

export const maxDuration = 300; // 5 minutes max for Vercel

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Bearer token required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify the session token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    console.log('🚀 Manual research scan triggered by admin:', user.email);

    const startTime = Date.now();
    const result = await runDailyResearchScan();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`⏱️ Manual scan completed in ${duration}s`);

    return NextResponse.json({
      success: true,
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
      triggeredBy: user.email,
      ...result
    });

  } catch (error) {
    console.error('💥 Manual research scan failed:', error);
    return NextResponse.json({
      error: 'Scan failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}