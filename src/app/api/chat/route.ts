/**
 * Chat API Route
 * POST /api/chat - Handle chat messages with RAG context
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildContext, formatContextForPrompt, CHAT_SYSTEM_PROMPT } from '@/lib/chat';
import type { ChatRequest, ChatResponse, ChatLink, ChatCitation } from '@/lib/chat/types';

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

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, conversationHistory = [], language = 'en' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build RAG context
    const context = await buildContext(message, language);
    const contextText = formatContextForPrompt(context);

    // Build messages array
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history (limit to last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current user message with context
    const userMessageWithContext = contextText
      ? `${message}\n\n---\n\n## Context from CBD Portal Database:\n${contextText}`
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

    const chatResponse: ChatResponse = {
      message: responseText,
      links,
      citations,
      suggestedFollowUps,
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
