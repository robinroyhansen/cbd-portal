import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { logAdminAction, ADMIN_ACTIONS, RESOURCE_TYPES } from '@/lib/audit-log';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const supabase = await createClient();

  // Fetch article title before deletion for audit log
  const { data: article } = await supabase
    .from('kb_articles')
    .select('title, slug')
    .eq('id', params.id)
    .single();

  const { error } = await supabase
    .from('kb_articles')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the deletion
  await logAdminAction(request, {
    action: ADMIN_ACTIONS.DELETE_ARTICLE,
    resourceType: RESOURCE_TYPES.ARTICLE,
    resourceId: params.id,
    details: {
      title: article?.title || 'Unknown',
      slug: article?.slug || null,
    },
  });

  return NextResponse.json({ success: true });
}