/**
 * Admin Chat API - List Conversations
 * GET /api/admin/chat
 *
 * Lists chat conversations with pagination, filtering, and statistics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export interface ChatConversation {
  id: string;
  session_id: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  user_message_count: number;
  assistant_message_count: number;
  language: string;
  user_agent: string | null;
  feedback_count: number;
  helpful_count: number;
  not_helpful_count: number;
  last_user_message: string | null;
  last_assistant_message: string | null;
}

export interface ChatStats {
  total_conversations: number;
  total_messages: number;
  total_user_messages: number;
  total_assistant_messages: number;
  total_feedback: number;
  helpful_feedback: number;
  not_helpful_feedback: number;
  helpful_percentage: number;
  conversations_today: number;
  conversations_this_week: number;
}

export interface ChatListResponse {
  conversations: ChatConversation[];
  stats: ChatStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client directly (avoiding config issues)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Debug: Log that we're starting
    console.log('[Chat Admin API] Starting request...');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const hasFeedback = searchParams.get('has_feedback');
    const feedbackType = searchParams.get('feedback_type'); // 'helpful' | 'not_helpful'
    const language = searchParams.get('language');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build base query
    let query = supabase
      .from('chat_conversations')
      .select('*', { count: 'exact' });

    // Apply filters
    if (dateFrom) {
      query = query.gte('started_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('started_at', dateTo);
    }
    if (language) {
      query = query.eq('language', language);
    }

    // Apply pagination and sorting
    query = query
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: sessions, error: sessionsError, count } = await query;

    // Debug logging
    console.log('[Chat Admin API] Query result:', {
      sessionsCount: sessions?.length ?? 0,
      totalCount: count,
      error: sessionsError?.message,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    if (sessionsError) {
      console.error('[Chat Admin API] Sessions error:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch chat sessions', details: sessionsError.message },
        { status: 500 }
      );
    }

    // If no sessions, return early with debug info
    if (!sessions || sessions.length === 0) {
      const debugInfo = {
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'NOT_SET',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'NOT_SET',
        queryError: sessionsError?.message || null,
        count,
      };
      console.log('[Chat Admin API] Returning empty - debug:', debugInfo);

      const emptyStats: ChatStats = {
        total_conversations: 0,
        total_messages: 0,
        total_user_messages: 0,
        total_assistant_messages: 0,
        total_feedback: 0,
        helpful_feedback: 0,
        not_helpful_feedback: 0,
        helpful_percentage: 0,
        conversations_today: 0,
        conversations_this_week: 0,
      };

      return NextResponse.json({
        conversations: [],
        stats: emptyStats,
        _debug: debugInfo,
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Get session IDs for fetching related data
    const sessionIds = sessions.map(s => s.id);

    // Fetch feedback counts per conversation
    const { data: feedbackData } = await supabase
      .from('chat_feedback')
      .select('conversation_id, rating')
      .in('conversation_id', sessionIds);

    // Group feedback by conversation
    const feedbackBySession: Record<string, { helpful: number; not_helpful: number }> = {};
    feedbackData?.forEach(f => {
      if (!feedbackBySession[f.conversation_id]) {
        feedbackBySession[f.conversation_id] = { helpful: 0, not_helpful: 0 };
      }
      if (f.rating === 'helpful') {
        feedbackBySession[f.conversation_id].helpful++;
      } else {
        feedbackBySession[f.conversation_id].not_helpful++;
      }
    });

    // Fetch last messages per conversation
    const { data: lastMessages } = await supabase
      .from('chat_messages')
      .select('conversation_id, role, content, created_at')
      .in('conversation_id', sessionIds)
      .order('created_at', { ascending: false });

    // Group last messages by conversation and role
    const lastMessageBySession: Record<string, { user: string | null; assistant: string | null }> = {};
    lastMessages?.forEach(m => {
      if (!lastMessageBySession[m.conversation_id]) {
        lastMessageBySession[m.conversation_id] = { user: null, assistant: null };
      }
      if (m.role === 'user' && !lastMessageBySession[m.conversation_id].user) {
        lastMessageBySession[m.conversation_id].user = m.content.substring(0, 200);
      }
      if (m.role === 'assistant' && !lastMessageBySession[m.conversation_id].assistant) {
        lastMessageBySession[m.conversation_id].assistant = m.content.substring(0, 200);
      }
    });

    // Count user/assistant messages per conversation
    const messageCountsByConversation: Record<string, { user: number; assistant: number }> = {};
    lastMessages?.forEach(m => {
      if (!messageCountsByConversation[m.conversation_id]) {
        messageCountsByConversation[m.conversation_id] = { user: 0, assistant: 0 };
      }
      if (m.role === 'user') {
        messageCountsByConversation[m.conversation_id].user++;
      } else {
        messageCountsByConversation[m.conversation_id].assistant++;
      }
    });

    // Build conversation list
    let conversations: ChatConversation[] = sessions.map(session => {
      const feedback = feedbackBySession[session.id] || { helpful: 0, not_helpful: 0 };
      const messages = lastMessageBySession[session.id] || { user: null, assistant: null };
      const msgCounts = messageCountsByConversation[session.id] || { user: 0, assistant: 0 };

      return {
        id: session.id,
        session_id: session.session_id,
        started_at: session.started_at,
        last_message_at: session.last_message_at,
        message_count: session.message_count || 0,
        user_message_count: msgCounts.user,
        assistant_message_count: msgCounts.assistant,
        language: session.language || 'en',
        user_agent: session.user_agent,
        feedback_count: feedback.helpful + feedback.not_helpful,
        helpful_count: feedback.helpful,
        not_helpful_count: feedback.not_helpful,
        last_user_message: messages.user,
        last_assistant_message: messages.assistant,
      };
    });

    // Filter by feedback if requested
    if (hasFeedback === 'true') {
      conversations = conversations.filter(c => c.feedback_count > 0);
    } else if (hasFeedback === 'false') {
      conversations = conversations.filter(c => c.feedback_count === 0);
    }

    if (feedbackType === 'helpful') {
      conversations = conversations.filter(c => c.helpful_count > 0);
    } else if (feedbackType === 'not_helpful') {
      conversations = conversations.filter(c => c.not_helpful_count > 0);
    }

    // Fetch global stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalConversations },
      { data: messageStats },
      { count: totalFeedback },
      { count: helpfulFeedback },
      { count: conversationsToday },
      { count: conversationsThisWeek },
    ] = await Promise.all([
      supabase.from('chat_conversations').select('*', { count: 'exact', head: true }),
      supabase.from('chat_conversations').select('message_count'),
      supabase.from('chat_feedback').select('*', { count: 'exact', head: true }),
      supabase.from('chat_feedback').select('*', { count: 'exact', head: true }).eq('rating', 'helpful'),
      supabase.from('chat_conversations').select('*', { count: 'exact', head: true }).gte('started_at', todayStart),
      supabase.from('chat_conversations').select('*', { count: 'exact', head: true }).gte('started_at', weekStart),
    ]);

    // Calculate message totals
    const totalMessages = messageStats?.reduce((sum, s) => sum + (s.message_count || 0), 0) || 0;
    // Estimate user/assistant split (roughly half each since chat is back-and-forth)
    const totalUserMessages = Math.ceil(totalMessages / 2);
    const totalAssistantMessages = Math.floor(totalMessages / 2);

    const stats: ChatStats = {
      total_conversations: totalConversations || 0,
      total_messages: totalMessages,
      total_user_messages: totalUserMessages,
      total_assistant_messages: totalAssistantMessages,
      total_feedback: totalFeedback || 0,
      helpful_feedback: helpfulFeedback || 0,
      not_helpful_feedback: (totalFeedback || 0) - (helpfulFeedback || 0),
      helpful_percentage: totalFeedback ? Math.round((helpfulFeedback || 0) / totalFeedback * 100) : 0,
      conversations_today: conversationsToday || 0,
      conversations_this_week: conversationsThisWeek || 0,
    };

    const response: ChatListResponse = {
      conversations,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Chat Admin API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
