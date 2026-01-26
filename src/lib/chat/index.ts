/**
 * Chat Library Exports
 * Phase 3: Added intent classification and conversation memory
 */

export * from './types';
export * from './system-prompt';
export { buildContext, formatContextForPrompt } from './context-builder';

// Phase 3: Intent Classification
export {
  classifyIntent,
  getIntentSearchBoost,
  getIntentGuidance,
  type Intent,
} from './intent-classifier';

// Phase 3: Conversation Memory
export {
  extractContextFromMessages,
  buildPersonalizedPrompt,
  hasDiscussedTopic,
  getSuggestedTopics,
  type ConversationContext,
} from './conversation-memory';
