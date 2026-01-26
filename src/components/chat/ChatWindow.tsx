'use client';

/**
 * ChatWindow Component
 * Main chat interface with message list and input
 */

import { useRef, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatDisclaimer } from './ChatDisclaimer';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSuggestions } from './ChatSuggestions';
import { TypingIndicator } from './TypingIndicator';
import { SUGGESTED_QUESTIONS } from '@/lib/chat/system-prompt';
import type { ChatMessage as ChatMessageType } from '@/lib/chat/types';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
  onSend: (message: string) => void;
  onClose: () => void;
  onReset: () => void;
}

export function ChatWindow({
  messages,
  isLoading,
  error,
  onSend,
  onClose,
  onReset,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
            <ChatMessage key={message.id} message={message} />
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

      {/* Suggestions (shown initially) */}
      {showSuggestions && (
        <ChatSuggestions
          suggestions={SUGGESTED_QUESTIONS.slice(0, 4)}
          onSelect={onSend}
        />
      )}

      {/* Input */}
      <ChatInput
        onSend={onSend}
        disabled={isLoading}
        placeholder={isLoading ? 'Waiting for response...' : 'Ask about CBD...'}
      />
    </div>
  );
}
