-- Make all languages visible in the language selector
-- This allows users to see all language options even without translations
UPDATE kb_languages SET is_active = true WHERE is_active = false;