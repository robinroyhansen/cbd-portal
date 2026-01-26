'use client';

/**
 * useChat Hook
 * State management for the chat assistant
 */

import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, ChatResponse, ChatState } from '@/lib/chat/types';
import { WELCOME_MESSAGE } from '@/lib/chat/system-prompt';

const STORAGE_KEY = 'cbd-chat-state';

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getInitialState(): ChatState {
  // Create welcome message
  const welcomeMessage: ChatMessage = {
    id: generateId(),
    role: 'assistant',
    content: WELCOME_MESSAGE,
    timestamp: new Date(),
  };

  return {
    messages: [welcomeMessage],
    isLoading: false,
    error: null,
    isOpen: false,
  };
}

function loadFromStorage(): Partial<ChatState> | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return {
      isOpen: parsed.isOpen || false,
      // We don't persist messages for now - fresh start each session
    };
  } catch {
    return null;
  }
}

function saveToStorage(state: Partial<ChatState>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isOpen: state.isOpen,
    }));
  } catch {
    // Ignore storage errors
  }
}

export function useChat() {
  const [state, setState] = useState<ChatState>(getInitialState);

  // Load persisted state on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setState(prev => ({ ...prev, ...stored }));
    }
  }, []);

  // Persist open state changes
  useEffect(() => {
    saveToStorage({ isOpen: state.isOpen });
  }, [state.isOpen]);

  /**
   * Toggle chat window open/closed
   */
  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  /**
   * Open chat window
   */
  const openChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  /**
   * Close chat window
   */
  const closeChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Build conversation history for API
      const conversationHistory = state.messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: ChatResponse = await response.json();

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        links: data.links,
        citations: data.citations,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Chat error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Sorry, I encountered an error. Please try again.',
      }));
    }
  }, [state.messages, state.isLoading]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset chat to initial state
   */
  const resetChat = useCallback(() => {
    setState(getInitialState());
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    isOpen: state.isOpen,
    toggleChat,
    openChat,
    closeChat,
    sendMessage,
    clearError,
    resetChat,
  };
}
