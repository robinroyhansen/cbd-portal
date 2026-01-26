/**
 * Admin Chat API - Single Conversation Detail
 * GET /api/admin/chat/[id]
 *
 * Returns detailed information about a single chat conversation,
 * including all messages and feedback.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export interface ChatMessageDetail {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  intent_classification: string | null;
  detected_topics: string[] | null;
  links: Array<{ label: string; href: string; type: string }> | null;
  citations: Array<{ title: string; year: number; quality: number; href: string }> | null;
  suggested_follow_ups: string[] | null;
  response_time_ms: number | null;
  tokens_used: number | null;
  feedback: {
    is_helpful: boolean;
    feedback_text: string | null;
    feedback_category: string | null;
    created_at: string;
  } | null;
}

export interface ChatConversationDetail {
  id: string;
  session_id: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  user_message_count: number;
  assistant_message_count: number;
  language: string;
  user_agent: string | null;
  ip_hash: string | null;
  metadata: Record<string, unknown>;
  messages: ChatMessageDetail[];
  feedback_summary: {
    total: number;
    helpful: number;
    not_helpful: number;
    categories: Record<string, number>;
  };
  duration_seconds: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (sessionError || !session) {
      // Try to find by session_id if not found by id
      const { data: sessionBySessionId, error: sessionByIdError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', id)
        .single();

      if (sessionByIdError || !sessionBySessionId) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      // Use the found session
      Object.assign(session || {}, sessionBySessionId);
    }

    const actualSession = session;

    // Fetch all messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', actualSession.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('[Chat Detail API] Messages error:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Fetch all feedback for this session
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('chat_feedback')
      .select('*')
      .eq('session_id', actualSession.id);

    if (feedbackError) {
      console.error('[Chat Detail API] Feedback error:', feedbackError);
    }

    // Create a map of feedback by message_id
    const feedbackByMessageId: Record<string, {
      is_helpful: boolean;
      feedback_text: string | null;
      feedback_category: string | null;
      created_at: string;
    }> = {};

    feedbackData?.forEach(f => {
      feedbackByMessageId[f.message_id] = {
        is_helpful: f.is_helpful,
        feedback_text: f.feedback_text,
        feedback_category: f.feedback_category,
        created_at: f.created_at,
      };
    });

    // Build messages with feedback
    const messagesWithFeedback: ChatMessageDetail[] = (messages || []).map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      created_at: m.created_at,
      intent_classification: m.intent_classification,
      detected_topics: m.detected_topics,
      links: m.links,
      citations: m.citations,
      suggested_follow_ups: m.suggested_follow_ups,
      response_time_ms: m.response_time_ms,
      tokens_used: m.tokens_used,
      feedback: feedbackByMessageId[m.id] || null,
    }));

    // Calculate feedback summary
    const feedbackSummary = {
      total: feedbackData?.length || 0,
      helpful: feedbackData?.filter(f => f.is_helpful).length || 0,
      not_helpful: feedbackData?.filter(f => !f.is_helpful).length || 0,
      categories: {} as Record<string, number>,
    };

    feedbackData?.forEach(f => {
      if (f.feedback_category) {
        feedbackSummary.categories[f.feedback_category] =
          (feedbackSummary.categories[f.feedback_category] || 0) + 1;
      }
    });

    // Calculate duration
    const startTime = new Date(actualSession.started_at).getTime();
    const endTime = new Date(actualSession.last_message_at).getTime();
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    const response: ChatConversationDetail = {
      id: actualSession.id,
      session_id: actualSession.session_id,
      started_at: actualSession.started_at,
      last_message_at: actualSession.last_message_at,
      message_count: actualSession.message_count || 0,
      user_message_count: actualSession.user_message_count || 0,
      assistant_message_count: actualSession.assistant_message_count || 0,
      language: actualSession.language || 'en',
      user_agent: actualSession.user_agent,
      ip_hash: actualSession.ip_hash,
      metadata: actualSession.metadata || {},
      messages: messagesWithFeedback,
      feedback_summary: feedbackSummary,
      duration_seconds: durationSeconds,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Chat Detail API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
