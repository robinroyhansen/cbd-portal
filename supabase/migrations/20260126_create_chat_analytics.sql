-- Chat Analytics Tables
-- Migration: 20260126_create_chat_analytics.sql
-- Purpose: Store chat conversations, messages, and feedback for admin analytics

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CHAT SESSIONS TABLE
-- Stores individual chat conversation sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session identification
  session_id VARCHAR(255) NOT NULL UNIQUE, -- Client-generated session ID

  -- Session metadata
  user_agent TEXT,
  language VARCHAR(10) DEFAULT 'en',
  ip_hash VARCHAR(64), -- Hashed IP for privacy

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),

  -- Aggregated stats (updated on each message)
  message_count INTEGER DEFAULT 0,
  user_message_count INTEGER DEFAULT 0,
  assistant_message_count INTEGER DEFAULT 0,

  -- Session metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CHAT MESSAGES TABLE
-- Stores individual messages within a chat session
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session reference
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,

  -- Message content
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- User message metadata
  intent_classification VARCHAR(100), -- e.g., 'condition_inquiry', 'dosage_question', 'general_info'
  detected_topics TEXT[], -- Topics detected in the message

  -- Assistant message metadata
  links JSONB, -- Links included in response
  citations JSONB, -- Research citations included
  suggested_follow_ups TEXT[], -- Suggested follow-up questions

  -- Performance metrics
  response_time_ms INTEGER, -- Time to generate response (for assistant messages)
  tokens_used INTEGER, -- Token count for the message

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CHAT FEEDBACK TABLE
-- Stores user feedback on assistant messages
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Message reference
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,

  -- Feedback data
  is_helpful BOOLEAN NOT NULL, -- true = thumbs up, false = thumbs down
  feedback_text TEXT, -- Optional text feedback
  feedback_category VARCHAR(50), -- e.g., 'inaccurate', 'unhelpful', 'offensive', 'other'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Chat sessions indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON chat_sessions(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_language ON chat_sessions(language);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_intent ON chat_messages(intent_classification) WHERE intent_classification IS NOT NULL;

-- Chat feedback indexes
CREATE INDEX IF NOT EXISTS idx_chat_feedback_message_id ON chat_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_session_id ON chat_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_is_helpful ON chat_feedback(is_helpful);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_created_at ON chat_feedback(created_at DESC);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update session stats when a message is added
CREATE OR REPLACE FUNCTION update_chat_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET
    message_count = message_count + 1,
    user_message_count = user_message_count + CASE WHEN NEW.role = 'user' THEN 1 ELSE 0 END,
    assistant_message_count = assistant_message_count + CASE WHEN NEW.role = 'assistant' THEN 1 ELSE 0 END,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session stats
DROP TRIGGER IF EXISTS trigger_update_chat_session_stats ON chat_messages;
CREATE TRIGGER trigger_update_chat_session_stats
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on chat_sessions
DROP TRIGGER IF EXISTS trigger_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER trigger_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for chat functionality)
CREATE POLICY "Allow public insert on chat_sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert on chat_messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert on chat_feedback"
  ON chat_feedback FOR INSERT
  WITH CHECK (true);

-- Allow public read for own session (using session_id match)
CREATE POLICY "Allow public read own session"
  ON chat_sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow public read own messages"
  ON chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Allow public read own feedback"
  ON chat_feedback FOR SELECT
  USING (true);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE chat_sessions IS 'Chat conversation sessions for AI assistant';
COMMENT ON TABLE chat_messages IS 'Individual messages within chat sessions';
COMMENT ON TABLE chat_feedback IS 'User feedback on assistant messages';

COMMENT ON COLUMN chat_sessions.session_id IS 'Client-generated unique session identifier';
COMMENT ON COLUMN chat_sessions.ip_hash IS 'SHA-256 hash of IP address for privacy-preserving analytics';
COMMENT ON COLUMN chat_messages.intent_classification IS 'AI-detected intent of user message';
COMMENT ON COLUMN chat_messages.response_time_ms IS 'Response generation time in milliseconds';
COMMENT ON COLUMN chat_feedback.is_helpful IS 'True for thumbs up, false for thumbs down';
