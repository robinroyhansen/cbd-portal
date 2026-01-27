/**
 * Chat API Route
 * POST /api/chat - Handle chat messages with RAG context
 *
 * Features:
 * - RAG context from conditions, research, glossary, and articles
 * - Conversation logging for analytics
 * - Intent classification for message categorization
 * - Support for feedback via returned messageId
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { buildContext, formatContextForPrompt, CHAT_SYSTEM_PROMPT } from '@/lib/chat';

// Create Supabase client directly for logging (avoiding singleton issues on Vercel)
function getLoggingClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
import {
  classifyIntent as classifyIntentPhase3,
  getIntentGuidance,
  type Intent
} from '@/lib/chat/intent-classifier';
import {
  extractContextFromMessages,
  buildPersonalizedPrompt
} from '@/lib/chat/conversation-memory';
import type {
  ChatRequest,
  ChatResponse,
  ChatLink,
  ChatCitation,
  ChatIntent,
  ChatContext,
  ChatMessage
} from '@/lib/chat/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use Haiku for cost-effective chat
const CHAT_MODEL = process.env.CHAT_MODEL || 'claude-3-haiku-20240307';
const MAX_TOKENS = parseInt(process.env.CHAT_MAX_TOKENS || '1024', 10);

/**
 * Extract links from response text
 * Looks for markdown links: [text](/path)
 */
function extractLinks(text: string): ChatLink[] {
  const linkRegex = /\[([^\]]+)\]\(\/([^)]+)\)/g;
  const links: ChatLink[] = [];
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const [, label, path] = match;
    const href = `/${path}`;

    // Determine link type from path
    let type: ChatLink['type'] = 'article';
    if (path.startsWith('conditions/')) type = 'condition';
    else if (path.startsWith('research/')) type = 'research';
    else if (path.startsWith('glossary/')) type = 'glossary';
    else if (path.startsWith('articles/')) type = 'article';

    // Avoid duplicates
    if (!links.some(l => l.href === href)) {
      links.push({ label, href, type });
    }
  }

  return links;
}

/**
 * Generate follow-up suggestions based on context
 */
function generateFollowUps(context: Awaited<ReturnType<typeof buildContext>>): string[] {
  const followUps: string[] = [];

  // Add condition-specific follow-ups
  if (context.conditions.length > 0) {
    const condition = context.conditions[0];
    followUps.push(`What dosage is recommended for ${condition.name.toLowerCase()}?`);
    followUps.push(`Are there side effects when using CBD for ${condition.name.toLowerCase()}?`);
  }

  // Add general follow-ups if needed
  if (followUps.length < 2) {
    followUps.push('What other conditions has CBD been studied for?');
    followUps.push('How does CBD compare to THC?');
  }

  return followUps.slice(0, 3);
}

/**
 * Map Phase 3 intent to database ChatIntent type
 */
function mapIntentToChatIntent(intent: Intent): ChatIntent {
  const intentMap: Record<Intent, ChatIntent> = {
    definition: 'general_info',
    condition: 'condition_info',
    dosage: 'dosage_info',
    safety: 'side_effects',
    product: 'product_info',
    comparison: 'comparison',
    legal: 'legal_info',
    general: 'other',
  };
  return intentMap[intent];
}

/**
 * Classify the user's intent based on message content
 * Now uses the Phase 3 classifier and maps to database-compatible format
 */
function classifyIntent(message: string, context: ChatContext): ChatIntent {
  // Use Phase 3 classifier
  const phase3Intent = classifyIntentPhase3(message);
  return mapIntentToChatIntent(phase3Intent);
}

/**
 * Convert conversation history to ChatMessage format for memory extraction
 */
function historyToChatMessages(history: Array<{ role: 'user' | 'assistant'; content: string }>): ChatMessage[] {
  return history.map((msg, index) => ({
    id: `history_${index}`,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(),
  }));
}

/**
 * Get or create a conversation record
 * Returns conversationId - creates new if none provided
 */
async function getOrCreateConversation(
  supabase: ReturnType<typeof getLoggingClient>,
  sessionId: string | undefined,
  conversationId: string | undefined,
  language: string,
  userAgent: string | null
): Promise<string | null> {
  try {
    // If we have an existing conversation, verify it exists and update last_message_at
    if (conversationId) {
      const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('id', conversationId)
        .single();

      if (existing && !fetchError) {
        return conversationId;
      }
      // If conversation doesn't exist, create a new one
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('chat_conversations')
      .insert({
        session_id: sessionId || null,
        language,
        user_agent: userAgent,
        message_count: 0,
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Failed to create conversation:', createError);
      return null;
    }

    return newConversation?.id || null;
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    return null;
  }
}

/**
 * Log a message to the database
 */
async function logMessage(
  supabase: ReturnType<typeof getLoggingClient>,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  intent: ChatIntent | null,
  ragContext: object | null,
  links: object | null
): Promise<string | null> {
  try {
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        intent: intent || undefined,
        context_used: ragContext,
        links,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log message:', error);
      return null;
    }

    return message?.id || null;
  } catch (error) {
    console.error('Error in logMessage:', error);
    return null;
  }
}

/**
 * Update conversation metadata after messages are logged
 */
async function updateConversationMetadata(
  supabase: ReturnType<typeof getLoggingClient>,
  conversationId: string,
  messageCount: number
): Promise<void> {
  try {
    await supabase
      .from('chat_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: messageCount,
      })
      .eq('id', conversationId);
  } catch (error) {
    console.error('Error updating conversation metadata:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const {
      message,
      conversationHistory = [],
      language = 'en',
      sessionId,
      conversationId: requestConversationId
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user agent for logging
    const userAgent = request.headers.get('user-agent');

    // Phase 3: Use new intent classifier for better intent detection
    const phase3Intent = classifyIntentPhase3(message);
    const intentGuidance = getIntentGuidance(phase3Intent);

    // Phase 3: Extract conversation context from history
    const recentHistory = conversationHistory.slice(-10);
    const chatMessages = historyToChatMessages(recentHistory);
    const conversationContext = extractContextFromMessages(chatMessages);

    // Build RAG context with Phase 3 intent and conversation memory
    const context = await buildContext(message, language, phase3Intent, conversationContext);
    const contextText = formatContextForPrompt(context);

    // Build personalized prompt from conversation memory
    const personalizedPrompt = buildPersonalizedPrompt(conversationContext);

    // Classify intent for database logging (legacy format)
    const intent = classifyIntent(message, context);

    // Build messages array
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Build enhanced context with intent guidance and personalization
    const contextParts: string[] = [];

    // Add intent-specific guidance
    contextParts.push(`## Response Guidance for "${phase3Intent}" Intent`);
    contextParts.push(intentGuidance);
    contextParts.push('');

    // Add personalized context if available
    if (personalizedPrompt) {
      contextParts.push(personalizedPrompt);
      contextParts.push('');
    }

    // Add RAG context
    if (contextText) {
      contextParts.push('## Context from CBD Portal Database:');
      contextParts.push(contextText);
    }

    // Combine all context
    const fullContextText = contextParts.filter(Boolean).join('\n');

    // Add current user message with enhanced context
    const userMessageWithContext = fullContextText
      ? `${message}\n\n---\n\n${fullContextText}`
      : message;

    messages.push({
      role: 'user',
      content: userMessageWithContext,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: CHAT_MODEL,
      max_tokens: MAX_TOKENS,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    });

    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    // Calculate tokens used
    const tokensUsed = response.usage
      ? response.usage.input_tokens + response.usage.output_tokens
      : null;

    // Extract links from response
    const links = extractLinks(responseText);

    // Build citations from studies used
    const citations: ChatCitation[] = context.studies
      .filter(s => responseText.toLowerCase().includes(s.title.toLowerCase().slice(0, 30)))
      .map(s => ({
        title: s.title,
        year: s.year || 0,
        quality: s.quality_score || 0,
        href: `/research/study/${s.slug}`,
      }))
      .slice(0, 3);

    // Generate follow-up suggestions
    const suggestedFollowUps = generateFollowUps(context);

    // Log to database (non-blocking - don't fail request if logging fails)
    let conversationId: string | undefined;
    let assistantMessageId: string | undefined;

    try {
      const supabase = getLoggingClient();

      // Get or create conversation
      const convId = await getOrCreateConversation(
        supabase,
        sessionId,
        requestConversationId,
        language,
        userAgent
      );

      if (convId) {
        conversationId = convId;

        // Prepare RAG context summary for storage (smaller than full context)
        const ragContextSummary = {
          conditionSlugs: context.conditions.map(c => c.slug),
          studyIds: context.studies.map(s => s.id),
          glossaryTerms: context.glossaryTerms.map(t => t.slug),
          articleSlugs: context.articles.map(a => a.slug),
          stats: context.stats,
        };

        // Log user message
        await logMessage(
          supabase,
          convId,
          'user',
          message,
          intent,
          ragContextSummary,
          null
        );

        // Log assistant message with extracted links
        const assistantMsgId = await logMessage(
          supabase,
          convId,
          'assistant',
          responseText,
          null,
          null,
          links.length > 0 ? links : null
        );

        if (assistantMsgId) {
          assistantMessageId = assistantMsgId;
        }

        // Update conversation metadata
        // Count is history + 2 new messages (user + assistant)
        const newMessageCount = recentHistory.length + 2;
        await updateConversationMetadata(supabase, convId, newMessageCount);
      }
    } catch (loggingError) {
      // Log error but don't fail the request
      console.error('Chat logging failed (non-critical):', loggingError);
    }

    const chatResponse: ChatResponse = {
      message: responseText,
      links,
      citations,
      suggestedFollowUps,
      conversationId,
      messageId: assistantMessageId,
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
