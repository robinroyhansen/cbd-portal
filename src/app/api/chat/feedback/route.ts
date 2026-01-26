/**
 * Chat Feedback API Route
 * POST /api/chat/feedback - Submit feedback for a chat message
 *
 * Allows users to rate responses as helpful/not_helpful with optional comments.
 * Used for improving the chat experience and analyzing response quality.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import type { FeedbackRequest, FeedbackResponse, FeedbackRating } from '@/lib/chat/types';

/**
 * Validate feedback rating value
 */
function isValidRating(rating: unknown): rating is FeedbackRating {
  return rating === 'helpful' || rating === 'not_helpful';
}

/**
 * Validate UUID format
 */
function isValidUUID(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { messageId, conversationId, rating, comment } = body;

    // Validate required fields
    if (!messageId || !isValidUUID(messageId)) {
      const response: FeedbackResponse = {
        success: false,
        error: 'Valid messageId is required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!conversationId || !isValidUUID(conversationId)) {
      const response: FeedbackResponse = {
        success: false,
        error: 'Valid conversationId is required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!isValidRating(rating)) {
      const response: FeedbackResponse = {
        success: false,
        error: 'Rating must be "helpful" or "not_helpful"',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate comment if provided (max 1000 chars)
    if (comment !== undefined && comment !== null) {
      if (typeof comment !== 'string') {
        const response: FeedbackResponse = {
          success: false,
          error: 'Comment must be a string',
        };
        return NextResponse.json(response, { status: 400 });
      }

      if (comment.length > 1000) {
        const response: FeedbackResponse = {
          success: false,
          error: 'Comment must be 1000 characters or less',
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    const supabase = createServiceClient();

    // Verify the message exists and belongs to the conversation
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select('id, conversation_id')
      .eq('id', messageId)
      .eq('conversation_id', conversationId)
      .single();

    if (messageError || !message) {
      const response: FeedbackResponse = {
        success: false,
        error: 'Message not found or does not belong to this conversation',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if feedback already exists for this message
    const { data: existingFeedback } = await supabase
      .from('chat_feedback')
      .select('id')
      .eq('message_id', messageId)
      .single();

    if (existingFeedback) {
      // Update existing feedback instead of creating duplicate
      const { data: updatedFeedback, error: updateError } = await supabase
        .from('chat_feedback')
        .update({
          rating,
          comment: comment || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingFeedback.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('Failed to update feedback:', updateError);
        const response: FeedbackResponse = {
          success: false,
          error: 'Failed to update feedback',
        };
        return NextResponse.json(response, { status: 500 });
      }

      const response: FeedbackResponse = {
        success: true,
        feedbackId: updatedFeedback?.id,
      };
      return NextResponse.json(response);
    }

    // Insert new feedback
    const { data: feedback, error: insertError } = await supabase
      .from('chat_feedback')
      .insert({
        message_id: messageId,
        conversation_id: conversationId,
        rating,
        comment: comment || null,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to insert feedback:', insertError);
      const response: FeedbackResponse = {
        success: false,
        error: 'Failed to save feedback',
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: FeedbackResponse = {
      success: true,
      feedbackId: feedback?.id,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Feedback API error:', error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      const response: FeedbackResponse = {
        success: false,
        error: 'Invalid JSON in request body',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: FeedbackResponse = {
      success: false,
      error: 'Failed to process feedback',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
