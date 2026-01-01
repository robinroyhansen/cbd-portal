import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Test API working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL_ENV || 'not_vercel',
    method: 'app-router'
  });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';