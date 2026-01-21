const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ARTICLES_DIR = './articles';

async function syncArticles() {
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));

  console.log(`Syncing ${files.length} articles to database...\n`);

  for (const file of files) {
    const slug = file.replace('.md', '');
    const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');

    const { data: existing } = await supabase
      .from('kb_articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('kb_articles')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug);

      if (error) {
        console.log(`ERROR ${slug}: ${error.message}`);
      } else {
        console.log(`SYNCED: ${slug}`);
      }
    } else {
      console.log(`SKIP (not in db): ${slug}`);
    }
  }

  console.log('\nDone!');
}

syncArticles();
