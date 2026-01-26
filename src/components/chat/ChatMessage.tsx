'use client';

/**
 * ChatMessage Component
 * Individual message bubble with links and citations
 */

import Link from 'next/link';
import type { ChatMessage as ChatMessageType, ChatLink, ChatCitation, FeedbackRating, MessageFeedback } from '@/lib/chat/types';
import { QuickReplies } from './QuickReplies';
import { MessageFeedback as MessageFeedbackComponent } from './MessageFeedback';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickReplySelect?: (suggestion: string) => void;
  conversationId?: string;
  existingFeedback?: MessageFeedback;
  onSubmitFeedback?: (messageId: string, rating: FeedbackRating, comment?: string) => Promise<void>;
}

/**
 * Format message content with markdown-like parsing
 */
function formatContent(content: string): React.ReactNode {
  // Split into parts, preserving links
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    // Check if this is a markdown link
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const [, text, href] = linkMatch;
      // Internal links start with /
      if (href.startsWith('/')) {
        return (
          <Link
            key={i}
            href={href}
            className="text-emerald-600 underline hover:text-emerald-700"
          >
            {text}
          </Link>
        );
      }
      // External links
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 underline hover:text-emerald-700"
        >
          {text}
        </a>
      );
    }

    // Process bold text
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((boldPart, j) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        return (
          <strong key={`${i}-${j}`}>
            {boldPart.slice(2, -2)}
          </strong>
        );
      }
      return boldPart;
    });
  });
}

/**
 * Format timestamp to time string
 */
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Link Card Component
 */
function LinkCard({ link }: { link: ChatLink }) {
  const typeIcons: Record<ChatLink['type'], string> = {
    condition: 'M9 12h6m-3-3v6',
    article: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
    research: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    glossary: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  };

  return (
    <Link
      href={link.href}
      className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-4 w-4 flex-shrink-0"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[link.type]} />
      </svg>
      <span className="truncate">{link.label}</span>
    </Link>
  );
}

/**
 * Citation Card Component
 */
function CitationCard({ citation }: { citation: ChatCitation }) {
  return (
    <Link
      href={citation.href}
      className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:border-emerald-300 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-gray-900">{citation.title}</p>
        <p className="text-xs text-gray-500">
          {citation.year > 0 ? citation.year : 'n.d.'} | Quality: {citation.quality}/100
        </p>
      </div>
    </Link>
  );
}

export function ChatMessage({
  message,
  onQuickReplySelect,
  conversationId,
  existingFeedback,
  onSubmitFeedback,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const showFeedback = !isUser && message.messageId && onSubmitFeedback;

  return (
    <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-emerald-100 text-emerald-900'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {formatContent(message.content)}
        </div>

        {/* Links */}
        {message.links && message.links.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-gray-600">Learn more:</p>
            <div className="flex flex-wrap gap-2">
              {message.links.map((link, i) => (
                <LinkCard key={i} link={link} />
              ))}
            </div>
          </div>
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-gray-600">
              Cited studies ({message.citations.length}):
            </p>
            <div className="space-y-1">
              {message.citations.map((citation, i) => (
                <CitationCard key={i} citation={citation} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Replies - Only show for assistant messages with suggestions */}
        {!isUser && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && onQuickReplySelect && (
          <QuickReplies
            suggestions={message.suggestedFollowUps}
            onSelect={onQuickReplySelect}
          />
        )}

        {/* Timestamp */}
        <p className={`mt-2 text-xs ${isUser ? 'text-emerald-600' : 'text-gray-400'}`}>
          {formatTime(message.timestamp)}
        </p>

        {/* Feedback buttons - only for assistant messages with messageId */}
        {showFeedback && (
          <MessageFeedbackComponent
            messageId={message.messageId!}
            conversationId={conversationId}
            existingFeedback={existingFeedback}
            onSubmit={onSubmitFeedback}
          />
        )}
      </div>
    </div>
  );
}
