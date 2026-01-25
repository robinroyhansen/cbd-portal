import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Check conditions table structure
  const { data: conditions, error: condError } = await supabase
    .from('kb_conditions')
    .select('*')
    .in('slug', ['martial-arts', 'golf', 'rock-climbing', 'weightlifters', 'surfing', 'hiking', 'tennis', 'skiing', 'cold-plunge', 'hot-tub', 'joint-health', 'bursitis'])
    .limit(15);

  if (condError) {
    console.error('Conditions error:', condError);
    return;
  }

  console.log('Found conditions:', conditions.length);
  conditions.forEach(c => {
    console.log('- ' + c.slug + ' (id: ' + c.id + ')');
  });

  // Check articles table structure
  const { data: sampleArticle, error: artError } = await supabase
    .from('kb_articles')
    .select('*')
    .limit(1);

  if (artError) {
    console.error('Articles error:', artError);
    return;
  }

  if (sampleArticle && sampleArticle.length > 0) {
    console.log('\nArticle table columns:', Object.keys(sampleArticle[0]));
    console.log('\nSample article:', JSON.stringify(sampleArticle[0], null, 2).slice(0, 2000));
  } else {
    console.log('\nNo articles found, table may be empty');
    // Try to get table info via insert error
    const { error: insertError } = await supabase
      .from('kb_articles')
      .insert({})
      .select();
    if (insertError) {
      console.log('Insert error gives us column info:', insertError.message);
    }
  }
}

main();
