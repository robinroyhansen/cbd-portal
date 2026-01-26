/**
 * Chat Types
 * TypeScript interfaces for the AI chat assistant
 */

export type FeedbackRating = 'helpful' | 'not_helpful';

export interface MessageFeedback {
  rating: FeedbackRating;
  comment?: string;
  submittedAt: Date;
}

export interface ChatMessage {
  id: string;
  messageId?: string; // Server-assigned ID for feedback tracking
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  links?: ChatLink[];
  citations?: ChatCitation[];
  suggestedFollowUps?: string[];
}

export interface ChatLink {
  label: string;
  href: string;
  type: 'condition' | 'article' | 'research' | 'glossary';
}

export interface ChatCitation {
  title: string;
  year: number;
  quality: number;
  href: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  language?: string;
  sessionId?: string; // Browser session ID for conversation tracking
  conversationId?: string; // Existing conversation to continue
}

export interface ChatResponse {
  message: string;
  links: ChatLink[];
  citations: ChatCitation[];
  suggestedFollowUps: string[];
  conversationId?: string; // For continuing conversation
  messageId?: string; // For feedback submission
}

export interface ChatContext {
  conditions: ConditionContext[];
  studies: StudyContext[];
  glossaryTerms: GlossaryContext[];
  articles: ArticleContext[];
  stats: {
    totalStudies: number;
    humanStudies: number;
    avgQuality: number;
  };
}

export interface ConditionContext {
  slug: string;
  name: string;
  description: string | null;
  research_count: number;
}

export interface StudyContext {
  id: string;
  title: string;
  plain_summary: string | null;
  year: number | null;
  quality_score: number | null;
  study_type: string | null;
  study_subject: string | null;
  slug: string;
}

export interface GlossaryContext {
  slug: string;
  term: string;
  short_definition: string | null;
}

export interface ArticleContext {
  slug: string;
  title: string;
  excerpt: string | null;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  sessionId?: string;
  conversationId?: string;
  feedbackSubmitted: Record<string, MessageFeedback>; // messageId -> feedback
}

// Feedback API types
export interface FeedbackRequest {
  messageId: string;
  conversationId: string;
  rating: FeedbackRating;
  comment?: string;
}

export interface FeedbackResponse {
  success: boolean;
  feedbackId?: string;
  error?: string;
}

// Intent classification for analytics
export type ChatIntent =
  | 'condition_info' // Asking about a specific condition
  | 'dosage_info' // Dosage questions
  | 'side_effects' // Side effects questions
  | 'research_query' // Asking about research/studies
  | 'product_info' // Product-related questions
  | 'general_info' // General CBD information
  | 'comparison' // Comparing CBD to other treatments
  | 'legal_info' // Legal questions
  | 'other'; // Uncategorized

// Database record types (for reference)
export interface ChatConversationRecord {
  id: string;
  session_id: string | null;
  started_at: string;
  last_message_at: string;
  message_count: number;
  language: string;
  user_agent: string | null;
  created_at: string;
}

export interface ChatMessageRecord {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  intent: ChatIntent | null;
  rag_context: object | null;
  model_used: string | null;
  tokens_used: number | null;
  created_at: string;
}

export interface ChatFeedbackRecord {
  id: string;
  message_id: string;
  conversation_id: string;
  rating: FeedbackRating;
  comment: string | null;
  created_at: string;
}
