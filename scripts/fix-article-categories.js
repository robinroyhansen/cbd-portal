#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('❌ SUPABASE environment variables are required');
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Category mapping rules based on article title/slug patterns
// Order matters - first match wins, so more specific rules come first
const CATEGORY_RULES = {
  // Keep terpenes in their own category (high priority)
  'terpenes': {
    patterns: [
      /\bterpene/i,
      /\b(myrcene|limonene|linalool|pinene|caryophyllene|humulene|terpinolene|ocimene|bisabolol|eucalyptol|nerolidol|valencene|borneol|camphene|guaiol|terpineol|phytol|sabinene|cymene|geraniol)\b/i,
    ]
  },
  // Cannabinoids - articles about specific cannabinoids OTHER than CBD
  'cannabinoids': {
    patterns: [
      /^what is (cbg|cbn|cbc|cbda|thca|thcv|cbga|hhc|thc)\b/i,
      /\bcbd vs (cbg|cbn|thc)\b/i,
      /\b(cbg|cbn|cbc|hhc|thca|thcv|cbga|cbda).*explained/i,
      /\bminor cannabinoid/i,
      /\bdelta-8|delta-9/i,
      /\bwhat are cannabinoids\b/i,
    ],
    excludePatterns: [
      /^what is cbd\b/i,
      /^what is (full|broad) spectrum/i,
      /^what is cbd isolate/i,
      /full spectrum vs/i,
    ]
  },
  // Science articles about mechanisms
  'cbd-science': {
    patterns: [
      /\bendocannabinoid system\b/i,
      /\b(cb1|cb2) receptor/i,
      /\b(gpr55|trpv|ppar)\b/i,
      /\b(faah|magl)\b/i,
      /\b(anandamide|2-ag)\b.*endocannabinoid/i,
      /\bbliss molecule\b/i,
      /\byour body'?s natural cannabis\b/i,
      /\bmost abundant endocannabinoid\b/i,
      /\bbioavailability\b/i,
      /\bbiosynthesis\b/i,
      /\bentourage effect\b/i,
      /\bclinical endocannabinoid deficiency\b/i,
      /\bscience of cbd\b/i,
      /\bhow cannabidiol works\b/i,
      /\bcbd and (serotonin|adenosine)\b/i,
      /\bhemp vs.*marijuana\b/i,
      /\bmaster regulator\b/i,
    ]
  },
  // Products - physical CBD products
  'products': {
    patterns: [
      /^what (is|are) cbd (oil|tincture|gummies|capsules|softgels|cream|balm|salve|lotion|topicals|patches|edibles|vape|flower|hash|coffee|tea|drinks|bath bombs|skincare|lip balm|e-liquid|concentrates|distillate|wax|shatter|crumble|pre-rolls)\b/i,
      /^what is (nano|liposomal|water-soluble) cbd\b/i,
      /^what is (rso|rick simpson|mct oil|cbd crude)\b/i,
      /^what is a cbd vape pen\b/i,
      /^what are cbd vape cartridges\b/i,
      /\bcarrier oils?\b.*explained/i,
      /\bstrength guide\b/i,
      /\bflavored vs unflavored\b/i,
      /\bhemp seed oil vs cbd oil\b/i,
      /\bfull spectrum vs.*broad spectrum vs.*isolate\b/i,
      /\bcbd oil strength\b/i,
    ]
  },
  // Guides - How-to articles
  'guides': {
    patterns: [
      /^how to (start|choose|buy|take|use)/i,
      /\bbuying guide\b/i,
      /\bshopping guide\b/i,
      /\bcomplete guide\b.*getting started/i,
    ]
  },
  // Legal & Safety
  'legal': {
    patterns: [
      /\bdrug (test|testing)\b/i,
      /\bdrug interaction/i,
      /\blegal\b/i,
      /\bregulation\b/i,
      /\bfda\b/i,
    ],
    excludePatterns: [
      /endocannabinoid/i,
      /receptor/i,
      /homeostasis/i,
    ]
  },
  // CBD Basics - introductory/educational content
  'cbd-basics': {
    patterns: [
      /^what is (cbd|hemp|cannabis)\b/i,
      /^what is (full|broad) spectrum cbd\b/i,
      /^what is cbd isolate\b/i,
      /^introduction to cbd\b/i,
      /^does cbd get you high\b/i,
      /^what does cbd feel like\b/i,
      /\bbeginner.*guide\b/i,
      /\bwhy people use cbd\b/i,
      /\bhistory of (cbd|cannabis)\b/i,
      /\bhow is cbd made\b/i,
      /\bunderstanding cbd quality\b/i,
      /\bcbd and your body\b/i,
      /\bhemp extract vs cbd\b/i,
      /\bsativa.*indica.*ruderalis\b/i,
      /\bphytocannabinoids vs endocannabinoids\b/i,
      /\bsupport your endocannabinoid system\b/i,
      /\bflavonoids\b/i,
    ],
    excludePatterns: [
      /endocannabinoid system explained/i,
      /master regulator/i,
    ]
  },
};

async function getCategories() {
  const { data, error } = await supabase
    .from('kb_categories')
    .select('id, name, slug');

  if (error) {
    console.error('❌ Error fetching categories:', error);
    return null;
  }

  return data;
}

async function getArticles() {
  const { data, error } = await supabase
    .from('kb_articles')
    .select('id, title, slug, category_id');

  if (error) {
    console.error('❌ Error fetching articles:', error);
    return null;
  }

  return data;
}

function determineCategory(article, categories) {
  const text = `${article.title} ${article.slug}`;

  // Check each category's rules
  for (const [categorySlug, rules] of Object.entries(CATEGORY_RULES)) {
    // Check exclude patterns first
    if (rules.excludePatterns) {
      const excluded = rules.excludePatterns.some(pattern => pattern.test(text));
      if (excluded) continue;
    }

    // Check include patterns
    const matches = rules.patterns.some(pattern => pattern.test(text));
    if (matches) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        return category;
      }
    }
  }

  return null;
}

async function analyzeCategories() {
  console.log('📊 ARTICLE CATEGORY ANALYSIS');
  console.log('='.repeat(60));

  const categories = await getCategories();
  const articles = await getArticles();

  if (!categories || !articles) {
    console.error('❌ Failed to fetch data');
    return;
  }

  console.log(`\n📚 Total articles: ${articles.length}`);
  console.log(`📁 Total categories: ${categories.length}`);

  // Current distribution
  console.log('\n📈 CURRENT CATEGORY DISTRIBUTION:');
  console.log('-'.repeat(50));

  const categoryMap = {};
  categories.forEach(c => categoryMap[c.id] = { ...c, count: 0 });

  articles.forEach(article => {
    if (article.category_id && categoryMap[article.category_id]) {
      categoryMap[article.category_id].count++;
    }
  });

  Object.values(categoryMap)
    .sort((a, b) => b.count - a.count)
    .forEach(cat => {
      const bar = '█'.repeat(Math.min(cat.count, 40));
      console.log(`${cat.name.padEnd(20)} ${String(cat.count).padStart(3)} ${bar}`);
    });

  // Suggested recategorizations
  console.log('\n🔄 SUGGESTED RECATEGORIZATIONS:');
  console.log('-'.repeat(60));

  const suggestions = [];

  for (const article of articles) {
    const suggestedCategory = determineCategory(article, categories);
    const currentCategory = categories.find(c => c.id === article.category_id);

    if (suggestedCategory && (!currentCategory || suggestedCategory.id !== article.category_id)) {
      suggestions.push({
        article,
        from: currentCategory?.name || 'Uncategorized',
        to: suggestedCategory.name,
        toId: suggestedCategory.id
      });
    }
  }

  if (suggestions.length === 0) {
    console.log('✅ All articles appear to be correctly categorized!');
  } else {
    console.log(`Found ${suggestions.length} articles that may need recategorization:\n`);

    suggestions.forEach((s, i) => {
      console.log(`${i + 1}. "${s.article.title.substring(0, 50)}..."`);
      console.log(`   ${s.from} → ${s.to}`);
      console.log('');
    });
  }

  return suggestions;
}

async function fixCategories(dryRun = true) {
  console.log(dryRun ? '🔍 DRY RUN - No changes will be made' : '🔧 FIXING ARTICLE CATEGORIES');
  console.log('='.repeat(60));

  const categories = await getCategories();
  const articles = await getArticles();

  if (!categories || !articles) {
    console.error('❌ Failed to fetch data');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const article of articles) {
    const suggestedCategory = determineCategory(article, categories);
    const currentCategory = categories.find(c => c.id === article.category_id);

    if (suggestedCategory && (!currentCategory || suggestedCategory.id !== article.category_id)) {
      console.log(`\n📝 "${article.title.substring(0, 50)}..."`);
      console.log(`   ${currentCategory?.name || 'Uncategorized'} → ${suggestedCategory.name}`);

      if (!dryRun) {
        const { error } = await supabase
          .from('kb_articles')
          .update({ category_id: suggestedCategory.id })
          .eq('id', article.id);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          skipped++;
        } else {
          console.log(`   ✅ Updated!`);
          updated++;
        }
      } else {
        updated++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 SUMMARY: ${updated} articles ${dryRun ? 'would be' : 'were'} recategorized`);
  if (skipped > 0) {
    console.log(`⚠️  ${skipped} articles failed to update`);
  }

  if (dryRun && updated > 0) {
    console.log('\n💡 Run with "fix" command to apply changes:');
    console.log('   node fix-article-categories.js fix');
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'analyze') {
  analyzeCategories();
} else if (command === 'dry-run') {
  fixCategories(true);
} else if (command === 'fix') {
  fixCategories(false);
} else {
  console.log('📚 ARTICLE CATEGORY FIX TOOL');
  console.log('='.repeat(40));
  console.log('Usage:');
  console.log('  node fix-article-categories.js analyze  - Show current distribution');
  console.log('  node fix-article-categories.js dry-run  - Preview changes');
  console.log('  node fix-article-categories.js fix      - Apply category fixes');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/fix-article-categories.js analyze');
  console.log('  node scripts/fix-article-categories.js dry-run');
  console.log('  node scripts/fix-article-categories.js fix');
}
