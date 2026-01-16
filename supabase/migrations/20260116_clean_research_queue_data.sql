-- Migration: Clean existing research queue data
-- This fixes HTML entities and tags in titles/abstracts

-- Function to decode HTML entities
CREATE OR REPLACE FUNCTION decode_html_entities(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT := text_input;
BEGIN
  IF result IS NULL THEN RETURN NULL; END IF;

  -- Named entities
  result := REPLACE(result, '&amp;', '&');
  result := REPLACE(result, '&lt;', '<');
  result := REPLACE(result, '&gt;', '>');
  result := REPLACE(result, '&quot;', '"');
  result := REPLACE(result, '&#39;', '''');
  result := REPLACE(result, '&apos;', '''');
  result := REPLACE(result, '&nbsp;', ' ');
  result := REPLACE(result, '&ndash;', '-');
  result := REPLACE(result, '&mdash;', '--');
  result := REPLACE(result, '&hellip;', '...');
  result := REPLACE(result, '&copy;', '(c)');
  result := REPLACE(result, '&reg;', '(R)');
  result := REPLACE(result, '&trade;', '(TM)');
  result := REPLACE(result, '&deg;', ' degrees');
  result := REPLACE(result, '&plusmn;', '+/-');
  result := REPLACE(result, '&times;', 'x');
  result := REPLACE(result, '&divide;', '/');
  result := REPLACE(result, '&frac12;', '1/2');
  result := REPLACE(result, '&frac14;', '1/4');
  result := REPLACE(result, '&frac34;', '3/4');
  result := REPLACE(result, '&alpha;', 'alpha');
  result := REPLACE(result, '&beta;', 'beta');
  result := REPLACE(result, '&gamma;', 'gamma');
  result := REPLACE(result, '&delta;', 'delta');
  result := REPLACE(result, '&micro;', 'micro');
  result := REPLACE(result, '&le;', '<=');
  result := REPLACE(result, '&ge;', '>=');
  result := REPLACE(result, '&ne;', '!=');

  -- Curly quotes
  result := REPLACE(result, '&lsquo;', '''');
  result := REPLACE(result, '&rsquo;', '''');
  result := REPLACE(result, '&ldquo;', '"');
  result := REPLACE(result, '&rdquo;', '"');

  -- Decode numeric entities (common ones)
  result := REGEXP_REPLACE(result, '&#(\d+);', '', 'g'); -- Remove unrecognized numeric entities
  result := REGEXP_REPLACE(result, '&#x([0-9a-fA-F]+);', '', 'g'); -- Remove unrecognized hex entities

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to strip HTML tags
CREATE OR REPLACE FUNCTION strip_html_tags(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT := text_input;
BEGIN
  IF result IS NULL THEN RETURN NULL; END IF;

  -- Replace <br> tags with newlines
  result := REGEXP_REPLACE(result, '<br\s*/?\s*>', E'\n', 'gi');

  -- Replace closing block tags with newlines
  result := REGEXP_REPLACE(result, '</(p|div|li|tr|h[1-6])>', E'\n', 'gi');

  -- Replace <li> with bullet
  result := REGEXP_REPLACE(result, '<li[^>]*>', '- ', 'gi');

  -- Remove all other HTML tags
  result := REGEXP_REPLACE(result, '<[^>]+>', '', 'g');

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to clean text (decode entities, strip tags, normalize whitespace)
CREATE OR REPLACE FUNCTION clean_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT := text_input;
BEGIN
  IF result IS NULL THEN RETURN NULL; END IF;

  -- First pass: decode HTML entities (run twice for double-encoded)
  result := decode_html_entities(result);
  result := decode_html_entities(result);

  -- Strip HTML tags
  result := strip_html_tags(result);

  -- Normalize whitespace
  result := REGEXP_REPLACE(result, '[ \t]+', ' ', 'g');
  result := REGEXP_REPLACE(result, '\n{3,}', E'\n\n', 'g');
  result := TRIM(result);

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to clean titles (single line, no extra punctuation)
CREATE OR REPLACE FUNCTION clean_title(title_input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  IF title_input IS NULL THEN RETURN NULL; END IF;

  result := clean_text(title_input);

  -- Remove newlines from titles
  result := REGEXP_REPLACE(result, '\n', ' ', 'g');

  -- Normalize multiple spaces
  result := REGEXP_REPLACE(result, '\s+', ' ', 'g');
  result := TRIM(result);

  -- Remove trailing multiple periods
  result := REGEXP_REPLACE(result, '\.{2,}$', '.', 'g');

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Now update existing records (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'kb_research_queue'
  ) THEN
    -- Update titles with HTML
    UPDATE kb_research_queue
    SET title = clean_title(title)
    WHERE title LIKE '%<%' OR title LIKE '%&%';

    RAISE NOTICE 'Updated titles with HTML content';

    -- Update abstracts with HTML
    UPDATE kb_research_queue
    SET abstract = clean_text(abstract)
    WHERE abstract LIKE '%<%' OR abstract LIKE '%&%';

    RAISE NOTICE 'Updated abstracts with HTML content';

    -- Update authors with HTML
    UPDATE kb_research_queue
    SET authors = clean_text(authors)
    WHERE authors LIKE '%<%' OR authors LIKE '%&%';

    RAISE NOTICE 'Updated authors with HTML content';

    -- Update publication with HTML
    UPDATE kb_research_queue
    SET publication = clean_text(publication)
    WHERE publication LIKE '%<%' OR publication LIKE '%&%';

    RAISE NOTICE 'Updated publications with HTML content';

    RAISE NOTICE 'Research queue cleanup complete';
  ELSE
    RAISE NOTICE 'Table kb_research_queue does not exist, skipping cleanup';
  END IF;
END $$;

-- Show summary
DO $$
DECLARE
  html_count INTEGER;
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'kb_research_queue'
  ) THEN
    SELECT COUNT(*) INTO html_count
    FROM kb_research_queue
    WHERE title LIKE '%<%' OR title LIKE '%&%'
       OR abstract LIKE '%<%' OR abstract LIKE '%&%';

    RAISE NOTICE 'Records still containing < or &: %', html_count;
  END IF;
END $$;
