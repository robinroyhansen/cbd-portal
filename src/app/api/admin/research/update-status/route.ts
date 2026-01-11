import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { id, status, rejection_reason } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const updateData: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
    };

    if (rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }

    const { error } = await supabase
      .from('kb_research_queue')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating study status:', error);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error) {
    console.error('Error in update-status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
