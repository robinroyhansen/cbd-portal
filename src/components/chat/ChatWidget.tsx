'use client';

/**
 * ChatWidget Component
 * Floating chat button and window container
 */

import { useChat } from '@/hooks/useChat';
import { ChatWindow } from './ChatWindow';
import { useLocale } from '@/components/LocaleProvider';

export function ChatWidget() {
  const {
    messages,
    isLoading,
    error,
    isOpen,
    conversationId,
    feedbackSubmitted,
    activeGuidedFlow,
    toggleChat,
    closeChat,
    sendMessage,
    resetChat,
    submitFeedback,
    completeGuidedFlow,
    cancelGuidedFlow,
  } = useChat();
  const { t } = useLocale();

  const closeLabel = t('chat.closeChat') || 'Close chat';
  const openLabel = t('chat.openChat') || 'Open chat assistant';

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? closeLabel : openLabel}
        aria-expanded={isOpen}
        className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Chat icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
            clipRule="evenodd"
          />
        </svg>

        {/* Pulse animation */}
        <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
      </button>

      {/* Chat Window - Desktop */}
      <div
        className={`fixed bottom-6 right-6 z-50 hidden md:block transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          width: '400px',
          height: '600px',
        }}
      >
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={error}
          activeGuidedFlow={activeGuidedFlow}
          conversationId={conversationId}
          feedbackSubmitted={feedbackSubmitted}
          onSend={sendMessage}
          onClose={closeChat}
          onReset={resetChat}
          onFlowComplete={completeGuidedFlow}
          onFlowCancel={cancelGuidedFlow}
          onSubmitFeedback={submitFeedback}
        />
      </div>

      {/* Chat Window - Mobile (Full Screen) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={error}
          activeGuidedFlow={activeGuidedFlow}
          conversationId={conversationId}
          feedbackSubmitted={feedbackSubmitted}
          onSend={sendMessage}
          onClose={closeChat}
          onReset={resetChat}
          onFlowComplete={completeGuidedFlow}
          onFlowCancel={cancelGuidedFlow}
          onSubmitFeedback={submitFeedback}
        />
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeChat}
          aria-hidden="true"
        />
      )}
    </>
  );
}
