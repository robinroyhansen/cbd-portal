const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ARTICLES_DIR = './articles';

// Calculate reading time from content
function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(3, Math.min(minutes, 20));
}

// Extract title from markdown (first # heading)
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

// Extract excerpt from Quick Summary section
function extractExcerpt(content) {
  const summaryMatch = content.match(/## Quick Summary\s*\n+([^#]+)/);
  if (summaryMatch) {
    return summaryMatch[1].trim().substring(0, 300);
  }
  // Fallback: use first paragraph after main title
  const paragraphMatch = content.match(/^#.+\n+(?:By.+\n+)?(?:Last updated.+\n+)?(?:---\n+)?([^#\n]+)/);
  return paragraphMatch ? paragraphMatch[1].trim().substring(0, 300) : '';
}

// Determine article type based on slug patterns
function getArticleType(slug) {
  if (slug.includes('-vs-') || slug.includes('compared')) return 'educational';
  if (slug.startsWith('how-to-') || slug.includes('-guide') || slug.startsWith('choose-') || slug.startsWith('buy-')) return 'educational-guide';
  if (slug.startsWith('cbd-legal-') || slug.includes('-laws-')) return 'legal-guide';
  if (slug.startsWith('is-') || slug.startsWith('can-') || slug.startsWith('does-') || slug.startsWith('what-')) return 'educational';
  return 'educational';
}

// Extract related topics from content (look for related articles section)
function extractRelatedTopics(content, slug) {
  const topics = [];

  // Check content for common topic indicators
  if (content.includes('anxiety') || content.includes('anxious')) topics.push('anxiety');
  if (content.includes('sleep') || content.includes('insomnia')) topics.push('sleep');
  if (content.includes('pain') || content.includes('inflammation')) topics.push('pain');
  if (content.includes('stress')) topics.push('stress');
  if (content.includes('skin') || content.includes('topical')) topics.push('skin');
  if (content.includes('senior') || content.includes('over 60') || content.includes('elderly')) topics.push('seniors');
  if (content.includes('beginner') || content.includes('newbie') || content.includes('first time')) topics.push('beginners');

  return topics.slice(0, 5); // Max 5 topics
}

async function insertNewArticles() {
  console.log('📚 Inserting new articles from markdown files...\n');

  // Get all existing slugs from database
  const { data: existingArticles, error: fetchError } = await supabase
    .from('kb_articles')
    .select('slug');

  if (fetchError) {
    console.error('Error fetching existing articles:', fetchError);
    return;
  }

  const existingSlugs = new Set(existingArticles.map(a => a.slug));
  console.log(`Found ${existingSlugs.size} existing articles in database\n`);

  // Read all markdown files
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} markdown files\n`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const slug = file.replace('.md', '');

    // Skip if already exists
    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    const filePath = path.join(ARTICLES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const title = extractTitle(content);
    if (!title) {
      console.log(`⚠️  SKIP (no title): ${slug}`);
      errors++;
      continue;
    }

    const excerpt = extractExcerpt(content);
    const readingTime = calculateReadingTime(content);
    const articleType = getArticleType(slug);
    const relatedTopics = extractRelatedTopics(content, slug);

    // Create meta title (truncate if too long)
    const metaTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

    // Create meta description from excerpt
    const metaDescription = excerpt.length > 155 ? excerpt.substring(0, 152) + '...' : excerpt;

    const article = {
      slug,
      title,
      excerpt,
      content,
      article_type: articleType,
      related_topics: relatedTopics,
      status: 'published',
      reading_time: readingTime,
      meta_title: metaTitle,
      meta_description: metaDescription,
      language: 'en',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('kb_articles')
      .insert([article]);

    if (insertError) {
      console.log(`❌ ERROR ${slug}: ${insertError.message}`);
      errors++;
    } else {
      console.log(`✅ INSERTED: ${slug}`);
      inserted++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${files.length}`);

  // Final count
  const { count } = await supabase
    .from('kb_articles')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📈 Total articles in database: ${count}`);
}

insertNewArticles().catch(console.error);
