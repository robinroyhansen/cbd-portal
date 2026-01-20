/**
 * Import Comparison Articles Script
 *
 * Run with: npx tsx scripts/import-comparisons.ts
 *
 * This script reads markdown files from content/comparisons and imports them
 * into the kb_articles table with the correct category and metadata.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ArticleData {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keyTakeaways: string[];
  faqItems: { question: string; answer: string }[];
  readingTime: number;
}

function parseMarkdownFile(filePath: string): ArticleData {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Extract title (first H1)
  const titleLine = lines.find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.replace('# ', '').trim() : 'Untitled';

  // Generate slug from filename
  const filename = path.basename(filePath, '.md');
  const slug = filename;

  // Extract excerpt (Quick Answer blockquote or first paragraph after title)
  let excerpt = '';
  let inExcerpt = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) {
      inExcerpt = true;
      continue;
    }
    if (inExcerpt && lines[i].trim()) {
      // Check for Quick Answer blockquote
      if (lines[i].startsWith('> **Quick Answer:**')) {
        // Extract text from blockquote, removing markdown formatting
        excerpt = lines[i]
          .replace('> **Quick Answer:**', '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
          .trim();
        break;
      }
      // Skip empty lines, headers, and list items
      if (!lines[i].startsWith('#') && !lines[i].startsWith('-') && !lines[i].startsWith('>')) {
        excerpt = lines[i]
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
          .trim();
        break;
      }
    }
  }

  // Extract key takeaways
  const keyTakeaways: string[] = [];
  let inTakeaways = false;
  for (const line of lines) {
    if (line.includes('## Key Takeaways')) {
      inTakeaways = true;
      continue;
    }
    if (inTakeaways && line.startsWith('## ')) {
      break;
    }
    if (inTakeaways && line.startsWith('- ')) {
      keyTakeaways.push(line.replace('- ', '').trim());
    }
  }

  // Extract FAQ items
  const faqItems: { question: string; answer: string }[] = [];
  let inFaq = false;
  let currentQuestion = '';
  let currentAnswer = '';

  for (const line of lines) {
    if (line.includes('## Frequently Asked Questions') || line.includes('## FAQ')) {
      inFaq = true;
      continue;
    }
    if (inFaq && line.startsWith('## ') && !line.includes('FAQ')) {
      // End of FAQ section
      if (currentQuestion && currentAnswer) {
        faqItems.push({ question: currentQuestion, answer: currentAnswer.trim() });
      }
      break;
    }
    if (inFaq && line.startsWith('### ')) {
      // New question
      if (currentQuestion && currentAnswer) {
        faqItems.push({ question: currentQuestion, answer: currentAnswer.trim() });
      }
      currentQuestion = line.replace('### ', '').trim();
      currentAnswer = '';
    } else if (inFaq && currentQuestion && line.trim() && !line.startsWith('#')) {
      currentAnswer += line.trim() + ' ';
    }
  }

  // Calculate reading time (roughly 200 words per minute)
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Remove front matter and title for content
  const contentWithoutTitle = content.replace(/^# .*\n/, '').trim();

  // Generate meta title and description
  const metaTitle = `${title} | CBD Portal`;
  const metaDescription = excerpt.substring(0, 155) + (excerpt.length > 155 ? '...' : '');

  return {
    slug,
    title,
    content: contentWithoutTitle,
    excerpt: excerpt.substring(0, 250),
    metaTitle,
    metaDescription,
    keyTakeaways,
    faqItems,
    readingTime,
  };
}

async function importArticles() {
  console.log('Starting comparison article import...\n');

  // Get the comparisons category ID
  const { data: category, error: catError } = await supabase
    .from('kb_categories')
    .select('id')
    .eq('slug', 'comparisons')
    .single();

  if (catError || !category) {
    console.error('Error finding comparisons category:', catError);
    console.log('Creating comparisons category...');

    const { data: newCategory, error: createError } = await supabase
      .from('kb_categories')
      .insert({
        name: 'Comparisons',
        slug: 'comparisons',
        description: 'Compare CBD with other supplements, medications, and product types to make informed decisions.',
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create category:', createError);
      process.exit(1);
    }

    console.log('Created comparisons category with ID:', newCategory.id);
  }

  const categoryId = category?.id;

  // Read all markdown files from the comparisons directory
  const comparisonsDir = path.join(process.cwd(), 'content', 'comparisons');

  if (!fs.existsSync(comparisonsDir)) {
    console.error('Comparisons directory not found:', comparisonsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(comparisonsDir).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} comparison articles to import.\n`);

  let imported = 0;
  let updated = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(comparisonsDir, file);
    console.log(`Processing: ${file}`);

    try {
      const articleData = parseMarkdownFile(filePath);

      // Check if article already exists
      const { data: existing } = await supabase
        .from('kb_articles')
        .select('id')
        .eq('slug', articleData.slug)
        .single();

      const articlePayload = {
        slug: articleData.slug,
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt,
        category_id: categoryId,
        article_type: 'comparison',
        status: 'published',
        reading_time: articleData.readingTime,
        meta_title: articleData.metaTitle,
        meta_description: articleData.metaDescription,
        template_data: {
          key_takeaways: articleData.keyTakeaways,
          faq_items: articleData.faqItems,
        },
      };

      if (existing) {
        // Update existing article
        const { error: updateError } = await supabase
          .from('kb_articles')
          .update({
            ...articlePayload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`  ❌ Error updating ${articleData.slug}:`, updateError.message);
          errors++;
        } else {
          console.log(`  🔄 Updated: ${articleData.title}`);
          console.log(`     Slug: ${articleData.slug}`);
          console.log(`     Reading time: ${articleData.readingTime} min`);
          console.log(`     Key takeaways: ${articleData.keyTakeaways.length}`);
          console.log(`     FAQ items: ${articleData.faqItems.length}`);
          updated++;
        }
      } else {
        // Insert new article
        const { error: insertError } = await supabase
          .from('kb_articles')
          .insert({
            ...articlePayload,
            published_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error(`  ❌ Error inserting ${articleData.slug}:`, insertError.message);
          errors++;
        } else {
          console.log(`  ✅ Imported: ${articleData.title}`);
          console.log(`     Slug: ${articleData.slug}`);
          console.log(`     Reading time: ${articleData.readingTime} min`);
          console.log(`     Key takeaways: ${articleData.keyTakeaways.length}`);
          console.log(`     FAQ items: ${articleData.faqItems.length}`);
          imported++;
        }
      }
    } catch (err) {
      console.error(`  ❌ Error processing ${file}:`, err);
      errors++;
    }

    console.log('');
  }

  console.log('='.repeat(50));
  console.log('Import Summary:');
  console.log(`  ✅ Imported: ${imported}`);
  console.log(`  🔄 Updated: ${updated}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log('='.repeat(50));
}

importArticles().catch(console.error);
