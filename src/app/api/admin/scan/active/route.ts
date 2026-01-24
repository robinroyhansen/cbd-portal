import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';
import { getActiveScanJob } from '@/lib/research-scanner';

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const activeJob = await getActiveScanJob(supabase);

    if (!activeJob) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      job: activeJob
    });

  } catch (error) {
    console.error('Failed to get active scan:', error);
    return NextResponse.json({
      error: 'Failed to get active scan',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
