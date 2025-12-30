#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jgivzyszbpyuvqfmldin.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testArticleCitations() {
  console.log('🔍 TESTING ARTICLE CITATION LOADING');
  console.log('='.repeat(50));

  try {
    // Test the exact same query as the article page
    const { data: article, error } = await supabase
      .from('kb_articles')
      .select(`
        *,
        category:kb_categories(name, slug),
        citations:kb_citations(*)
      `)
      .eq('slug', 'cbd-and-anxiety')
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('❌ Error fetching article:', error);
      return;
    }

    if (!article) {
      console.log('❌ Article not found');
      return;
    }

    console.log('✅ Article found:');
    console.log(`📄 Title: ${article.title}`);
    console.log(`🔗 Slug: ${article.slug}`);
    console.log(`📊 Citations count: ${article.citations?.length || 0}`);

    if (article.citations && article.citations.length > 0) {
      console.log('\n📚 CITATIONS DATA:');
      console.log('-'.repeat(30));
      article.citations.forEach((citation, index) => {
        console.log(`${index + 1}. ${citation.title}`);
        console.log(`   Authors: ${citation.authors || 'N/A'}`);
        console.log(`   Publication: ${citation.publication || 'N/A'}`);
        console.log(`   Year: ${citation.year || 'N/A'}`);
        console.log(`   URL: ${citation.url || 'N/A'}`);
        console.log(`   DOI: ${citation.doi || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No citations found in article data');
    }

    // Test raw citations table query
    console.log('\n🔍 RAW CITATIONS TABLE TEST:');
    console.log('-'.repeat(30));

    const { data: rawCitations, error: rawError } = await supabase
      .from('kb_citations')
      .select('*')
      .eq('article_id', article.id);

    if (rawError) {
      console.error('❌ Error fetching raw citations:', rawError);
    } else {
      console.log(`✅ Raw citations found: ${rawCitations?.length || 0}`);
      if (rawCitations && rawCitations.length > 0) {
        rawCitations.forEach((citation, index) => {
          console.log(`${index + 1}. ${citation.title} (${citation.year})`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

if (require.main === module) {
  testArticleCitations().then(() => {
    console.log('\n✅ Citation test complete');
  });
}

module.exports = { testArticleCitations };