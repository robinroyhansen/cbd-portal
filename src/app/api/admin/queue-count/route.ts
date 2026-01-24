import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
// Use service client to bypass RLS
    const supabase = createServiceClient();

    // Get pending count
    const { count: pending, error: pendingError } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) {
      console.error('Error fetching pending count:', pendingError);
    }

    // Get rejected count
    const { count: rejected, error: rejectedError } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    if (rejectedError) {
      console.error('Error fetching rejected count:', rejectedError);
    }

    return NextResponse.json({
      pending: pending || 0,
      rejected: rejected || 0,
    });
  } catch (error) {
    console.error('Error fetching queue counts:', error);
    return NextResponse.json({ pending: 0, rejected: 0 }, { status: 500 });
  }
}
