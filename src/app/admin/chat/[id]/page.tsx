'use client';

/**
 * Admin Chat Conversation Detail Page
 * View full conversation thread with messages and feedback
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Types for the chat detail API response
interface ChatMessageDetail {
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

interface ChatConversationDetail {
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

// Format timestamp
function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// Parse user agent to get browser info
function parseUserAgent(userAgent: string | null): { browser: string; device: string } {
  if (!userAgent) return { browser: 'Unknown', device: 'Unknown' };

  let browser = 'Unknown';
  let device = 'Desktop';

  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  if (userAgent.includes('Mobile') || userAgent.includes('Android')) device = 'Mobile';
  else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) device = 'Tablet';

  return { browser, device };
}

// Chat Message Component
function ChatMessage({ message, isLast }: { message: ChatMessageDetail; isLast: boolean }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isLast ? '' : 'mb-4'}`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : ''}`}>
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-green-600 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
          }`}
        >
          {/* Role label */}
          <div className={`text-xs font-medium mb-1 ${isUser ? 'text-green-200' : 'text-gray-500'}`}>
            {isUser ? 'User' : isAssistant ? 'Assistant' : 'System'}
          </div>

          {/* Message content */}
          <div className={`text-sm whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-900'}`}>
            {message.content}
          </div>

          {/* Intent classification for user messages */}
          {isUser && message.intent_classification && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-green-200">Intent:</span>
              <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">
                {message.intent_classification}
              </span>
            </div>
          )}

          {/* Detected topics */}
          {message.detected_topics && message.detected_topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.detected_topics.map((topic, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isUser ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Links in assistant messages */}
          {isAssistant && message.links && message.links.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Links provided:</p>
              <div className="flex flex-wrap gap-2">
                {message.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-700 underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Citations in assistant messages */}
          {isAssistant && message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Research cited:</p>
              <div className="space-y-1">
                {message.citations.map((citation, i) => (
                  <a
                    key={i}
                    href={citation.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-gray-600 hover:text-green-600"
                  >
                    {citation.title} ({citation.year})
                    {citation.quality > 0 && (
                      <span className="ml-1 text-gray-400">Q:{citation.quality}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message metadata */}
        <div className={`flex items-center gap-3 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">
            {formatTimestamp(message.created_at)}
          </span>

          {/* Response time for assistant messages */}
          {isAssistant && message.response_time_ms && (
            <span className="text-xs text-gray-400">
              {message.response_time_ms}ms
            </span>
          )}

          {/* Tokens used */}
          {isAssistant && message.tokens_used && (
            <span className="text-xs text-gray-400">
              {message.tokens_used} tokens
            </span>
          )}
        </div>

        {/* Feedback indicator for assistant messages */}
        {isAssistant && message.feedback && (
          <div className={`mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                message.feedback.is_helpful
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.feedback.is_helpful ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  Helpful
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  Not Helpful
                </>
              )}
              {message.feedback.feedback_category && (
                <span className="text-xs opacity-75">
                  ({message.feedback.feedback_category})
                </span>
              )}
            </div>
            {message.feedback.feedback_text && (
              <p className="mt-1 text-xs text-gray-500 italic">
                "{message.feedback.feedback_text}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Metadata Sidebar Component
function MetadataSidebar({ conversation }: { conversation: ChatConversationDetail }) {
  const { browser, device } = parseUserAgent(conversation.user_agent);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation Details</h2>

      <div className="space-y-4">
        {/* Session ID */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Session ID
          </label>
          <p className="mt-1 text-sm font-mono text-gray-900 break-all">
            {conversation.session_id}
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Duration
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {formatDuration(conversation.duration_seconds)}
          </p>
        </div>

        {/* Messages */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Messages
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {conversation.message_count} total
            <span className="text-gray-500 ml-1">
              ({conversation.user_message_count} user / {conversation.assistant_message_count} AI)
            </span>
          </p>
        </div>

        {/* Language */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Language
          </label>
          <p className="mt-1 text-sm text-gray-900 uppercase">
            {conversation.language}
          </p>
        </div>

        {/* Browser/Device */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Browser / Device
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {browser} / {device}
          </p>
        </div>

        {/* Started At */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Started At
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {formatTimestamp(conversation.started_at)}
          </p>
        </div>

        {/* Last Message */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Last Message
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {formatTimestamp(conversation.last_message_at)}
          </p>
        </div>

        {/* Feedback Summary */}
        <div className="pt-4 border-t border-gray-200">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Feedback Summary
          </label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-sm font-medium text-gray-900">
                {conversation.feedback_summary.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Helpful</span>
              <span className="text-sm font-medium text-green-600">
                {conversation.feedback_summary.helpful}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600">Not Helpful</span>
              <span className="text-sm font-medium text-red-600">
                {conversation.feedback_summary.not_helpful}
              </span>
            </div>
            {Object.keys(conversation.feedback_summary.categories).length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Categories:</p>
                {Object.entries(conversation.feedback_summary.categories).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{cat}</span>
                    <span className="text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Agent (collapsed) */}
        {conversation.user_agent && (
          <details className="pt-4 border-t border-gray-200">
            <summary className="text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
              Full User Agent
            </summary>
            <p className="mt-2 text-xs text-gray-600 break-all font-mono bg-gray-50 p-2 rounded">
              {conversation.user_agent}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`h-24 bg-gray-100 rounded-2xl w-2/3`}></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="mb-4">
              <div className="h-3 bg-gray-100 rounded w-20 mb-1"></div>
              <div className="h-5 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-red-500 text-2xl">!</span>
        <h3 className="text-lg font-semibold text-red-800">Error Loading Conversation</h3>
      </div>
      <p className="text-red-700">{error}</p>
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// Not found state
function NotFoundState() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-12 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-amber-900 mb-2">Conversation Not Found</h3>
      <p className="text-amber-700 max-w-md mx-auto mb-4">
        The conversation you're looking for doesn't exist or has been deleted.
      </p>
      <Link
        href="/admin/chat"
        className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
      >
        Back to Chat Analytics
      </Link>
    </div>
  );
}

export default function ChatConversationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [conversation, setConversation] = useState<ChatConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchConversation = async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await fetch(`/api/admin/chat/${id}`);

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data: ChatConversationDetail = await response.json();
      setConversation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, [id]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/chat"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Chat Analytics
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Conversation Detail</h1>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : notFound ? (
        <NotFoundState />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchConversation} />
      ) : conversation ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main chat thread */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span>💬</span>
                Conversation Thread
                <span className="text-sm font-normal text-gray-500">
                  ({conversation.messages.length} messages)
                </span>
              </h2>

              <div className="space-y-4">
                {conversation.messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLast={index === conversation.messages.length - 1}
                  />
                ))}
              </div>

              {conversation.messages.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No messages in this conversation
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <MetadataSidebar conversation={conversation} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
