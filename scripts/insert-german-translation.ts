import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const args = process.argv.slice(2);
const articleId = args[0];
const slug = args[1];
const title = args[2];
const metaDesc = args[3];
const contentFile = args[4];

async function main() {
  const fs = await import('fs');
  const content = fs.readFileSync(contentFile, 'utf-8');
  
  const { error } = await supabase
    .from('article_translations')
    .insert({
      article_id: articleId,
      language: 'de',
      slug: slug,
      title: title,
      content: content,
      excerpt: metaDesc,
      meta_title: title,
      meta_description: metaDesc,
    });
    
  if (error) {
    if (error.code === '23505') {
      console.log('Already exists');
    } else {
      console.error('Error:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Inserted:', slug);
  }
}

main().catch(console.error);
