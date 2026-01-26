/**
 * Chat Types
 * TypeScript interfaces for the AI chat assistant
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  links?: ChatLink[];
  citations?: ChatCitation[];
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
}

export interface ChatResponse {
  message: string;
  links: ChatLink[];
  citations: ChatCitation[];
  suggestedFollowUps: string[];
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
}
