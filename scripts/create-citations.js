#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('❌ SUPABASE environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import our research data
const researchDataPath = path.join(process.cwd(), 'src/data/comprehensive-research-studies.json');
const researchData = JSON.parse(fs.readFileSync(researchDataPath, 'utf8'));

// Topic mapping from research to article slugs
const topicMapping = {
  'anxiety': ['cbd-and-anxiety', 'cbd-and-depression'],
  'sleep': ['cbd-and-sleep'],
  'pain': ['cbd-for-pain-relief'],
  'pain management': ['cbd-for-pain-relief'],
  'chronic pain': ['cbd-for-pain-relief'],
  'neuropathic': ['cbd-for-pain-relief'],
  'epilepsy': ['cbd-and-depression'], // Could add specific epilepsy article
  'depression': ['cbd-and-depression'],
  'skin conditions': ['cbd-topicals-skin-conditions'],
  'dermatology': ['cbd-topicals-skin-conditions'],
  'skin': ['cbd-topicals-skin-conditions'],
  'contact dermatitis': ['cbd-topicals-skin-conditions'],
  'anti-inflammatory': ['cbd-topicals-skin-conditions', 'cbd-for-pain-relief'],
  'sports': ['cbd-athletic-recovery'],
  'recovery': ['cbd-athletic-recovery'],
  'addiction': ['cbd-and-depression'], // Could be general mental health
  'PTSD': ['cbd-and-anxiety'],
  'clinical study': ['cbd-and-anxiety', 'cbd-and-depression', 'cbd-and-sleep'],
  'clinical trial': ['cbd-and-anxiety', 'cbd-and-depression', 'cbd-and-sleep'],
  'systematic review': ['what-is-cbd-beginners-guide'],
  'meta-analysis': ['what-is-cbd-beginners-guide']
};

async function createCitations() {
  console.log('📚 Creating citations linking research to articles...\n');

  try {
    // First, get all CBD articles with their IDs
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, slug')
      .in('slug', [
        'cbd-and-anxiety',
        'cbd-and-depression',
        'cbd-and-sleep',
        'cbd-for-pain-relief',
        'cbd-topicals-skin-conditions',
        'cbd-athletic-recovery',
        'cbd-dosage-guide',
        'cbd-drug-interactions',
        'cbd-oil-vs-capsules',
        'cbd-side-effects-safety',
        'full-spectrum-vs-broad-spectrum-vs-isolate',
        'what-is-cbd-beginners-guide'
      ]);

    console.log('📄 Found', articles?.length, 'CBD articles');

    if (!articles || articles.length === 0) {
      console.log('❌ No CBD articles found');
      return;
    }

    // Create article slug to ID mapping
    const articleMap = {};
    articles.forEach(article => {
      articleMap[article.slug] = article.id;
      console.log('   📄', article.slug, '→', article.title.substring(0, 50) + '...');
    });

    let citationsCreated = 0;
    let citationsSkipped = 0;

    console.log('\n🔗 Creating citations...\n');

    // For each research study, find matching articles and create citations
    for (const study of researchData) {
      const matchingArticles = new Set();

      // Match based on relevant topics
      if (study.relevant_topics) {
        for (const topic of study.relevant_topics) {
          const articleSlugs = topicMapping[topic.toLowerCase()];
          if (articleSlugs) {
            articleSlugs.forEach(slug => matchingArticles.add(slug));
          }
        }
      }

      // If no topic matches, try title-based matching
      if (matchingArticles.size === 0) {
        const title = study.title.toLowerCase();
        for (const [topic, slugs] of Object.entries(topicMapping)) {
          if (title.includes(topic)) {
            slugs.forEach(slug => matchingArticles.add(slug));
          }
        }
      }

      // Create citations for matching articles
      for (const slug of matchingArticles) {
        const articleId = articleMap[slug];
        if (!articleId) continue;

        // Check if citation already exists
        const { data: existing } = await supabase
          .from('citations')
          .select('id')
          .eq('article_id', articleId)
          .eq('url', study.url)
          .single();

        if (existing) {
          citationsSkipped++;
          continue;
        }

        // Create the citation
        const { error } = await supabase
          .from('citations')
          .insert({
            article_id: articleId,
            title: study.title,
            authors: study.authors,
            publication: study.publication,
            year: study.year,
            url: study.url,
            doi: study.doi,
            accessed_at: new Date().toISOString()
          });

        if (error) {
          console.log('❌ Error creating citation for', slug, ':', error.message);
        } else {
          citationsCreated++;
          console.log('✅ Citation created:', study.title.substring(0, 50) + '... → ' + slug);
        }
      }
    }

    console.log('\n📊 Citation Creation Summary:');
    console.log('   ✅ Citations created:', citationsCreated);
    console.log('   ⏭️  Citations skipped (already exist):', citationsSkipped);
    console.log('   📚 Research studies processed:', researchData.length);
    console.log('\n✅ Citations system successfully restored!');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

if (require.main === module) {
  createCitations();
}

module.exports = { createCitations };