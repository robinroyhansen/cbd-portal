const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  // Get the endocannabinoid-system article's citations
  const { data: article } = await supabase
    .from('kb_articles')
    .select('id, title')
    .eq('slug', 'endocannabinoid-system')
    .single();

  if (!article) {
    console.log('Article not found');
    return;
  }

  const { data: citations } = await supabase
    .from('kb_citations')
    .select('title, authors, slug, pmid')
    .eq('article_id', article.id);

  console.log('Citations for:', article.title);
  console.log('Total:', citations.length);
  console.log('With slug:', citations.filter(c => c.slug).length);
  console.log('With pmid:', citations.filter(c => c.pmid).length);
  console.log('\nSample:');
  citations.slice(0, 4).forEach((c, i) => {
    console.log((i + 1) + '. ' + c.authors);
    console.log('   Slug: ' + (c.slug || 'MISSING'));
    console.log('   PMID: ' + (c.pmid || 'MISSING'));
  });
}

check();
