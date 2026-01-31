import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const limit = parseInt(process.argv[2] || '50');
const offset = parseInt(process.argv[3] || '0');

// Get IDs of research that already have German translations
const { data: existingTranslations } = await supabase
  .from('research_translations')
  .select('research_id')
  .eq('language', 'de');

const translatedIds = new Set((existingTranslations || []).map(t => t.research_id));

// Get research items that don't have German translations yet
const { data, error } = await supabase
  .from('kb_research_queue')
  .select('id, pmid, title, plain_summary')
  .not('plain_summary', 'is', null)
  .range(offset, offset + limit * 2 - 1);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

// Filter out already translated
const untranslated = (data || []).filter(r => !translatedIds.has(r.id)).slice(0, limit);

console.log(JSON.stringify(untranslated, null, 2));
