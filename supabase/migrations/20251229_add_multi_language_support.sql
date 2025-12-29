-- Add language support to existing tables (default to English)
ALTER TABLE kb_articles ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE kb_articles ADD COLUMN IF NOT EXISTS original_article_id UUID REFERENCES kb_articles(id);
ALTER TABLE kb_categories ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Create languages reference table for future use
CREATE TABLE IF NOT EXISTS kb_languages (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  native_name VARCHAR(50) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  logo_text VARCHAR(50) NOT NULL,
  flag_emoji VARCHAR(10),
  is_swiss_variant BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all 15 languages (only English active for now)
INSERT INTO kb_languages (code, name, native_name, domain, logo_text, flag_emoji, is_swiss_variant, is_active, display_order) VALUES
('en', 'English', 'English', 'swissorganic.co.uk', 'CBD.uk', '🇬🇧', false, true, 1),
('da', 'Danish', 'Dansk', 'cbd.dk', 'CBD.dk', '🇩🇰', false, false, 2),
('sv', 'Swedish', 'Svenska', 'cbd.se', 'CBD.se', '🇸🇪', false, false, 3),
('no', 'Norwegian', 'Norsk', 'cbd.no', 'CBD.no', '🇳🇴', false, false, 4),
('fi', 'Finnish', 'Suomi', 'cbd.fi', 'CBD.fi', '🇫🇮', false, false, 5),
('de', 'German', 'Deutsch', 'cbd.de', 'CBD.de', '🇩🇪', false, false, 6),
('it', 'Italian', 'Italiano', 'cbd.it', 'CBD.it', '🇮🇹', false, false, 7),
('pt', 'Portuguese', 'Português', 'cbd.pt', 'CBD.pt', '🇵🇹', false, false, 8),
('nl', 'Dutch', 'Nederlands', 'cbdportaal.nl', 'CBDportaal.nl', '🇳🇱', false, false, 9),
('fr', 'French', 'Français', 'cbdportail.fr', 'CBDportail.fr', '🇫🇷', false, false, 10),
('ro', 'Romanian', 'Română', 'cbdportal.ro', 'CBDportal.ro', '🇷🇴', false, false, 11),
('es', 'Spanish', 'Español', 'cbdportal.es', 'CBDportal.es', '🇪🇸', false, false, 12),
('de-CH', 'Swiss German', 'Deutsch (Schweiz)', 'cbdportal.ch', 'CBDportal.ch', '🇨🇭', true, false, 13),
('fr-CH', 'Swiss French', 'Français (Suisse)', 'cbdportal.ch', 'CBDportal.ch', '🇨🇭', true, false, 14),
('it-CH', 'Swiss Italian', 'Italiano (Svizzera)', 'cbdportal.ch', 'CBDportal.ch', '🇨🇭', true, false, 15)
ON CONFLICT (code) DO NOTHING;

-- Set all existing content to English
UPDATE kb_articles SET language = 'en' WHERE language IS NULL;
UPDATE kb_categories SET language = 'en' WHERE language IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_articles_language ON kb_articles(language);
CREATE INDEX IF NOT EXISTS idx_categories_language ON kb_categories(language);

-- Enable RLS
ALTER TABLE kb_languages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON kb_languages;
CREATE POLICY "Public read access" ON kb_languages FOR SELECT USING (true);