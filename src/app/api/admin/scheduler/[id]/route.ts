import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { logAdminAction, ADMIN_ACTIONS, RESOURCE_TYPES } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

interface ScheduleUpdateBody {
  action: 'publish_now' | 'schedule' | 'unpublish' | 'cancel_schedule';
  scheduled_publish_at?: string;
}

/**
 * PATCH /api/admin/scheduler/[id]
 *
 * Updates the scheduling status of an article.
 *
 * Actions:
 * - publish_now: Immediately publish the article
 * - schedule: Schedule the article for a future date
 * - unpublish: Revert to draft status
 * - cancel_schedule: Cancel scheduled publish (revert to draft)
 *
 * Body:
 * {
 *   action: 'publish_now' | 'schedule' | 'unpublish' | 'cancel_schedule',
 *   scheduled_publish_at?: string (ISO date, required for 'schedule' action)
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = (await request.json()) as ScheduleUpdateBody;
    const { action, scheduled_publish_at } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch current article state
    const { data: article, error: fetchError } = await supabase
      .from('kb_articles')
      .select('id, title, slug, status, scheduled_publish_at, published_at')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    let updateData: Record<string, unknown> = {};
    let auditAction: string = '';
    let auditDetails: Record<string, unknown> = {
      previousStatus: article.status,
      previousScheduledAt: article.scheduled_publish_at,
    };

    switch (action) {
      case 'publish_now':
        // Publish immediately
        updateData = {
          status: 'published',
          published_at: new Date().toISOString(),
          scheduled_publish_at: null,
        };
        auditAction = ADMIN_ACTIONS.PUBLISH_ARTICLE;
        auditDetails.newStatus = 'published';
        auditDetails.publishType = 'immediate';
        break;

      case 'schedule':
        // Schedule for future publication
        if (!scheduled_publish_at) {
          return NextResponse.json(
            { error: 'scheduled_publish_at is required for schedule action' },
            { status: 400 }
          );
        }

        const scheduleDate = new Date(scheduled_publish_at);
        if (isNaN(scheduleDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid date format for scheduled_publish_at' },
            { status: 400 }
          );
        }

        if (scheduleDate <= new Date()) {
          return NextResponse.json(
            { error: 'Scheduled date must be in the future' },
            { status: 400 }
          );
        }

        updateData = {
          status: 'scheduled',
          scheduled_publish_at: scheduleDate.toISOString(),
        };
        auditAction = ADMIN_ACTIONS.UPDATE_ARTICLE;
        auditDetails.newStatus = 'scheduled';
        auditDetails.scheduledFor = scheduleDate.toISOString();
        break;

      case 'unpublish':
        // Revert to draft
        updateData = {
          status: 'draft',
          published_at: null,
          scheduled_publish_at: null,
        };
        auditAction = ADMIN_ACTIONS.UNPUBLISH_ARTICLE;
        auditDetails.newStatus = 'draft';
        break;

      case 'cancel_schedule':
        // Cancel scheduled publish, revert to draft
        updateData = {
          status: 'draft',
          scheduled_publish_at: null,
        };
        auditAction = ADMIN_ACTIONS.UPDATE_ARTICLE;
        auditDetails.newStatus = 'draft';
        auditDetails.cancelledSchedule = article.scheduled_publish_at;
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }

    // Update the article
    const { data: updatedArticle, error: updateError } = await supabase
      .from('kb_articles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        id,
        title,
        slug,
        status,
        scheduled_publish_at,
        published_at,
        created_at,
        updated_at,
        article_type,
        meta_description,
        category:kb_categories(id, name)
      `)
      .single();

    if (updateError) {
      console.error('Error updating article schedule:', updateError);
      return NextResponse.json(
        { error: 'Failed to update article', details: updateError.message },
        { status: 500 }
      );
    }

    // Log the action
    await logAdminAction(request, {
      action: auditAction as any,
      resourceType: RESOURCE_TYPES.ARTICLE,
      resourceId: id,
      details: {
        ...auditDetails,
        articleTitle: article.title,
        articleSlug: article.slug,
      },
    });

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      action,
      message: getSuccessMessage(action),
    });
  } catch (error) {
    console.error('Scheduler update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getSuccessMessage(action: string): string {
  switch (action) {
    case 'publish_now':
      return 'Article published successfully';
    case 'schedule':
      return 'Article scheduled for publication';
    case 'unpublish':
      return 'Article unpublished and reverted to draft';
    case 'cancel_schedule':
      return 'Schedule cancelled, article reverted to draft';
    default:
      return 'Article updated successfully';
  }
}

/**
 * GET /api/admin/scheduler/[id]
 *
 * Get a single article's scheduling details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: article, error } = await supabase
      .from('kb_articles')
      .select(`
        id,
        title,
        slug,
        status,
        scheduled_publish_at,
        published_at,
        created_at,
        updated_at,
        article_type,
        meta_description,
        category:kb_categories(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
