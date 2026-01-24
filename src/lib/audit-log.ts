import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { AdminAction, ResourceType, ADMIN_ACTIONS, RESOURCE_TYPES } from '@/lib/constants/admin';

/**
 * Admin Audit Logging Utility
 *
 * Tracks all admin actions for accountability and debugging.
 *
 * Usage:
 * ```typescript
 * import { logAdminAction, ADMIN_ACTIONS, RESOURCE_TYPES } from '@/lib/audit-log';
 *
 * // In API route after successful action:
 * await logAdminAction(request, {
 *   action: ADMIN_ACTIONS.APPROVE_STUDY,
 *   resourceType: RESOURCE_TYPES.RESEARCH,
 *   resourceId: studyId,
 *   details: { previousStatus: 'pending' }
 * });
 * ```
 */

export interface AuditLogEntry {
  action: AdminAction;
  resourceType: ResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
}

/**
 * Log an admin action to the audit log
 *
 * @param request - The NextRequest object (used to extract IP and user agent)
 * @param entry - The audit log entry details
 */
export async function logAdminAction(
  request: NextRequest,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Extract client info from request
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || null;

    // Extract admin identifier (could be enhanced with actual user ID later)
    const adminIdentifier = ip || 'unknown';

    // Insert audit log entry
    const { error } = await supabase.from('admin_audit_log').insert({
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId || null,
      admin_identifier: adminIdentifier,
      details: entry.details || null,
      ip_address: ip,
      user_agent: userAgent,
    });

    if (error) {
      // Log error but don't throw - audit logging shouldn't break the main operation
      console.error('[AuditLog] Failed to log action:', error.message);
    }
  } catch (error) {
    // Silently fail - audit logging is best-effort
    console.error('[AuditLog] Error:', error);
  }
}

/**
 * Log a batch of admin actions (for bulk operations)
 */
export async function logBulkAdminAction(
  request: NextRequest,
  action: AdminAction,
  resourceType: ResourceType,
  resourceIds: string[],
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createServiceClient();

    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || null;
    const adminIdentifier = ip || 'unknown';

    // For bulk operations, log once with array of IDs in details
    const { error } = await supabase.from('admin_audit_log').insert({
      action,
      resource_type: resourceType,
      resource_id: null, // null for bulk, IDs stored in details
      admin_identifier: adminIdentifier,
      details: {
        ...details,
        resource_ids: resourceIds,
        count: resourceIds.length,
      },
      ip_address: ip,
      user_agent: userAgent,
    });

    if (error) {
      console.error('[AuditLog] Failed to log bulk action:', error.message);
    }
  } catch (error) {
    console.error('[AuditLog] Error:', error);
  }
}

/**
 * Get recent audit log entries (for admin dashboard)
 */
export async function getRecentAuditLogs(
  limit: number = 100,
  filters?: {
    action?: AdminAction;
    resourceType?: ResourceType;
    adminIdentifier?: string;
  }
): Promise<AuditLogRecord[]> {
  try {
    const supabase = createServiceClient();

    let query = supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }
    if (filters?.adminIdentifier) {
      query = query.eq('admin_identifier', filters.adminIdentifier);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AuditLog] Failed to fetch logs:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[AuditLog] Error fetching logs:', error);
    return [];
  }
}

/**
 * Audit log record from database
 */
export interface AuditLogRecord {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  admin_identifier: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Extract client IP from request headers
 */
function getClientIP(request: NextRequest): string | null {
  // Vercel/Cloudflare forward the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Cloudflare specific
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  // Real IP header
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return null;
}

// Re-export constants for convenience
export { ADMIN_ACTIONS, RESOURCE_TYPES };
export type { AdminAction, ResourceType };
