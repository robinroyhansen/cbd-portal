import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

/**
 * Simple endpoint to validate admin API key
 * Used by the client-side login to verify credentials
 */
export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  return NextResponse.json({ authenticated: true });
}
