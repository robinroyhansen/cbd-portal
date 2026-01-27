'use client';

/**
 * ChatWindow Component
 * Main chat interface with message list and input
 */

import { useRef, useEffect, useMemo } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatDisclaimer } from './ChatDisclaimer';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSuggestions } from './ChatSuggestions';
import { TypingIndicator } from './TypingIndicator';
import { GuidedFlowUI } from './GuidedFlowUI';
import { useLocale } from '@/components/LocaleProvider';
import type { ChatMessage as ChatMessageType, FeedbackRating, MessageFeedback } from '@/lib/chat/types';
import type { GuidedFlow } from '@/lib/chat/guided-flows';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
  activeGuidedFlow: GuidedFlow | null;
  conversationId?: string;
  feedbackSubmitted: Record<string, MessageFeedback>;
  onSend: (message: string) => void;
  onClose: () => void;
  onReset: () => void;
  onFlowComplete: (answers: Record<string, string>) => void;
  onFlowCancel: () => void;
  onSubmitFeedback: (messageId: string, rating: FeedbackRating, comment?: string) => Promise<void>;
}

export function ChatWindow({
  messages,
  isLoading,
  error,
  activeGuidedFlow,
  conversationId,
  feedbackSubmitted,
  onSend,
  onClose,
  onReset,
  onFlowComplete,
  onFlowCancel,
  onSubmitFeedback,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

  // Localized suggested questions
  const localizedSuggestions = useMemo(() => [
    t('chat.suggestedQuestions.anxiety'),
    t('chat.suggestedQuestions.sleep'),
    t('chat.suggestedQuestions.medications'),
    t('chat.suggestedQuestions.dosage'),
  ], [t]);

  // Localized placeholders
  const inputPlaceholder = isLoading
    ? t('chat.waitingForResponse') || 'Waiting for response...'
    : t('chat.inputPlaceholder') || 'Ask about CBD...';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Show suggestions only if there's just the welcome message
  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
      {/* Header */}
      <ChatHeader onClose={onClose} onReset={onReset} />

      {/* Disclaimer */}
      <ChatDisclaimer />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              conversationId={conversationId}
              existingFeedback={message.messageId ? feedbackSubmitted[message.messageId] : undefined}
              onSubmitFeedback={onSubmitFeedback}
            />
          ))}

          {/* Loading indicator */}
          {isLoading && <TypingIndicator />}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions (shown initially, hidden during guided flow) */}
      {showSuggestions && !activeGuidedFlow && (
        <ChatSuggestions
          suggestions={localizedSuggestions}
          onSelect={onSend}
        />
      )}

      {/* Guided Flow UI (replaces input when active) */}
      {activeGuidedFlow ? (
        <GuidedFlowUI
          flow={activeGuidedFlow}
          onComplete={onFlowComplete}
          onCancel={onFlowCancel}
        />
      ) : (
        /* Normal Input */
        <ChatInput
          onSend={onSend}
          disabled={isLoading}
          placeholder={inputPlaceholder}
        />
      )}
    </div>
  );
}
