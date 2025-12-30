import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runDailyResearchScan } from '@/lib/research-scanner';

export const maxDuration = 300; // 5 minutes max for Vercel

export async function POST(request: Request) {
  try {
    // For now, we'll allow any authenticated session to trigger scans
    // This simplifies testing until proper admin roles are set up
    console.log('🚀 Manual research scan triggered');

    // Verify environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing environment variables');
      return NextResponse.json({
        error: 'Configuration error',
        message: 'Missing required environment variables',
        details: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      }, { status: 500 });
    }

    console.log('✅ Environment variables verified');
    console.log('🔍 Starting research scan...');

    const startTime = Date.now();
    const result = await runDailyResearchScan();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`⏱️ Manual scan completed in ${duration}s`);
    console.log(`📊 Results:`, result);

    return NextResponse.json({
      success: true,
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
      triggeredBy: 'manual',
      ...result
    });

  } catch (error) {
    console.error('💥 Manual research scan failed:', error);

    // Return detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });

    return NextResponse.json({
      error: 'Scan failed',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}