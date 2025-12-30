import { NextResponse } from 'next/server';
import { runDailyResearchScan } from '@/lib/research-scanner';

export const maxDuration = 300; // 5 minutes max for Vercel

export async function GET(request: Request) {
  // Verify cron secret (set in Vercel environment variables)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('❌ Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🕒 Daily research scan triggered by cron job');

  try {
    const startTime = Date.now();
    const result = await runDailyResearchScan();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`⏱️ Scan completed in ${duration}s`);

    return NextResponse.json({
      success: true,
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    console.error('💥 Research scan failed:', error);
    return NextResponse.json({
      error: 'Scan failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}