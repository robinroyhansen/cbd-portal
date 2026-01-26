-- Chat Conversations and Feedback System
-- Stores chat logs for analytics, RAG context tracking, and user feedback

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Chat message role enum
DO $$ BEGIN
  CREATE TYPE chat_role AS ENUM ('user', 'assistant');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Chat feedback rating enum
DO $$ BEGIN
  CREATE TYPE chat_rating AS ENUM ('helpful', 'not_helpful');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Chat Conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  language TEXT DEFAULT 'en' NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  message_count INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB
);

COMMENT ON TABLE chat_conversations IS 'Stores chat conversation sessions for analytics and context tracking';
COMMENT ON COLUMN chat_conversations.session_id IS 'Browser session identifier for grouping conversations';
COMMENT ON COLUMN chat_conversations.user_agent IS 'Browser user agent string for device analytics';
COMMENT ON COLUMN chat_conversations.ip_address IS 'IP address for geographic analytics (anonymized)';
COMMENT ON COLUMN chat_conversations.language IS 'User language preference (ISO 639-1 code)';
COMMENT ON COLUMN chat_conversations.started_at IS 'When the conversation was initiated';
COMMENT ON COLUMN chat_conversations.last_message_at IS 'Timestamp of the most recent message';
COMMENT ON COLUMN chat_conversations.message_count IS 'Total number of messages in the conversation';
COMMENT ON COLUMN chat_conversations.metadata IS 'Extensible JSON field for future data needs';

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role chat_role NOT NULL,
  content TEXT NOT NULL,
  intent TEXT,
  context_used JSONB,
  links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE chat_messages IS 'Individual messages within chat conversations';
COMMENT ON COLUMN chat_messages.conversation_id IS 'Reference to the parent conversation';
COMMENT ON COLUMN chat_messages.role IS 'Message author: user or assistant';
COMMENT ON COLUMN chat_messages.content IS 'The message text content';
COMMENT ON COLUMN chat_messages.intent IS 'Classified user intent (e.g., question, feedback, navigation)';
COMMENT ON COLUMN chat_messages.context_used IS 'RAG context chunks used to generate the response';
COMMENT ON COLUMN chat_messages.links IS 'Links included in assistant responses for click tracking';
COMMENT ON COLUMN chat_messages.created_at IS 'When the message was sent';

-- Chat Feedback table
CREATE TABLE IF NOT EXISTS chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  rating chat_rating NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE chat_feedback IS 'User feedback on assistant responses for quality improvement';
COMMENT ON COLUMN chat_feedback.message_id IS 'The specific message being rated';
COMMENT ON COLUMN chat_feedback.conversation_id IS 'The conversation containing the rated message';
COMMENT ON COLUMN chat_feedback.rating IS 'User rating: helpful or not_helpful';
COMMENT ON COLUMN chat_feedback.comment IS 'Optional user comment explaining their rating';
COMMENT ON COLUMN chat_feedback.created_at IS 'When the feedback was submitted';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id
  ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at
  ON chat_conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_language
  ON chat_conversations(language);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id
  ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
  ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_intent
  ON chat_messages(intent) WHERE intent IS NOT NULL;

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_chat_feedback_message_id
  ON chat_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_conversation_id
  ON chat_feedback(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_rating
  ON chat_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_created_at
  ON chat_feedback(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update conversation stats when a message is added
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_conversations
    SET
      message_count = message_count + 1,
      last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_conversations
    SET message_count = message_count - 1
    WHERE id = OLD.conversation_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update conversation stats
DROP TRIGGER IF EXISTS trigger_update_conversation_stats ON chat_messages;
CREATE TRIGGER trigger_update_conversation_stats
  AFTER INSERT OR DELETE ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

-- chat_conversations policies
-- Anonymous users can insert new conversations
CREATE POLICY "Public insert conversations" ON chat_conversations
  FOR INSERT WITH CHECK (true);

-- Authenticated admins can read all conversations
CREATE POLICY "Admins read conversations" ON chat_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role has full access
CREATE POLICY "Service role full access conversations" ON chat_conversations
  FOR ALL USING (auth.role() = 'service_role');

-- chat_messages policies
-- Anonymous users can insert messages
CREATE POLICY "Public insert messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- Authenticated admins can read all messages
CREATE POLICY "Admins read messages" ON chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role has full access
CREATE POLICY "Service role full access messages" ON chat_messages
  FOR ALL USING (auth.role() = 'service_role');

-- chat_feedback policies
-- Anonymous users can insert feedback
CREATE POLICY "Public insert feedback" ON chat_feedback
  FOR INSERT WITH CHECK (true);

-- Authenticated admins can read all feedback
CREATE POLICY "Admins read feedback" ON chat_feedback
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role has full access
CREATE POLICY "Service role full access feedback" ON chat_feedback
  FOR ALL USING (auth.role() = 'service_role');
