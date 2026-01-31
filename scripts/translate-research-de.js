import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUntranslatedResearch(limit = 50, offset = 0) {
  // Get research items that don't have German translations yet
  const { data, error } = await supabase
    .from('kb_research_queue')
    .select(`
      id,
      pmid,
      title,
      plain_summary,
      research_translations!left(id)
    `)
    .is('research_translations.id', null)
    .not('plain_summary', 'is', null)
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching research:', error);
    return [];
  }
  
  return data || [];
}

async function countUntranslated() {
  // First get count of all research with plain_summary
  const { count: totalWithSummary, error: err1 } = await supabase
    .from('kb_research_queue')
    .select('id', { count: 'exact', head: true })
    .not('plain_summary', 'is', null);

  // Then get count of existing translations
  const { count: translatedCount, error: err2 } = await supabase
    .from('research_translations')
    .select('id', { count: 'exact', head: true })
    .eq('language', 'de');

  if (err1 || err2) {
    console.error('Error counting:', err1 || err2);
    return { total: 0, translated: 0, remaining: 0 };
  }

  return {
    total: totalWithSummary || 0,
    translated: translatedCount || 0,
    remaining: (totalWithSummary || 0) - (translatedCount || 0)
  };
}

async function insertTranslation(researchId, translatedSummary) {
  const { error } = await supabase
    .from('research_translations')
    .insert({
      research_id: researchId,
      language: 'de',
      plain_summary: translatedSummary
    });

  if (error) {
    console.error(`Error inserting translation for ${researchId}:`, error);
    return false;
  }
  return true;
}

// Main function to get items for translation
async function main() {
  const counts = await countUntranslated();
  console.log(JSON.stringify({ type: 'counts', ...counts }));

  // Fetch batch of untranslated items
  const items = await getUntranslatedResearch(50);
  console.log(JSON.stringify({ type: 'batch', count: items.length, items: items.map(i => ({ id: i.id, pmid: i.pmid, title: i.title, plain_summary: i.plain_summary })) }));
}

main().catch(console.error);
