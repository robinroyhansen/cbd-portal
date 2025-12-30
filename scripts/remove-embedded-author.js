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

async function removeEmbeddedAuthor() {
  console.log('🔧 REMOVING EMBEDDED AUTHOR CONTENT');
  console.log('='.repeat(50));

  try {
    // Get articles with embedded author content
    const articlesToFix = ['cbd-and-adhd', 'cbd-and-addiction'];

    console.log(`📝 Processing ${articlesToFix.length} articles...\n`);

    for (const slug of articlesToFix) {
      console.log(`🔍 Processing: ${slug}`);

      // Get the article
      const { data: article, error: fetchError } = await supabase
        .from('kb_articles')
        .select('id, content')
        .eq('slug', slug)
        .single();

      if (fetchError || !article) {
        console.error(`❌ Error fetching ${slug}:`, fetchError);
        continue;
      }

      const originalContent = article.content;

      // Remove author sections using multiple patterns
      let cleanedContent = originalContent;

      // Pattern 1: Remove everything from "---" followed by "*Written by Robin" to end
      cleanedContent = cleanedContent.replace(/\s*---\s*\*Written by Robin Roy Krigslund-Hansen\*[\s\S]*$/gi, '');

      // Pattern 2: Remove standalone "Written by Robin" sections
      cleanedContent = cleanedContent.replace(/\*Written by Robin Roy Krigslund-Hansen\*[\s\S]*$/gi, '');

      // Pattern 3: Remove "About the Author" sections
      cleanedContent = cleanedContent.replace(/\*\*About the Author\*\*[\s\S]*$/gi, '');
      cleanedContent = cleanedContent.replace(/## About the Author[\s\S]*$/gi, '');

      // Pattern 4: Remove any remaining Robin content at the end
      cleanedContent = cleanedContent.replace(/\*Robin Roy Krigslund-Hansen[\s\S]*$/gi, '');

      // Trim whitespace and normalize line endings
      cleanedContent = cleanedContent.trim();

      // Show what was removed
      const removedLength = originalContent.length - cleanedContent.length;
      console.log(`   Original length: ${originalContent.length} characters`);
      console.log(`   New length: ${cleanedContent.length} characters`);
      console.log(`   Removed: ${removedLength} characters`);

      if (removedLength > 0) {
        // Update the article
        const { error: updateError } = await supabase
          .from('kb_articles')
          .update({
            content: cleanedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`❌ Error updating ${slug}:`, updateError);
        } else {
          console.log(`✅ Updated ${slug} successfully`);

          // Show a preview of the end of the cleaned content
          const endPreview = cleanedContent.slice(-150).replace(/\n/g, ' ');
          console.log(`   New ending: "...${endPreview}"`);
        }
      } else {
        console.log(`ℹ️  No changes needed for ${slug}`);
      }

      console.log('');
    }

    console.log('🔍 VERIFYING CHANGES...\n');

    // Verify the changes
    for (const slug of articlesToFix) {
      const { data: article } = await supabase
        .from('kb_articles')
        .select('content')
        .eq('slug', slug)
        .single();

      if (article) {
        const stillHasAuthor = article.content.includes('Robin Roy Krigslund-Hansen');
        const stillHasWrittenBy = article.content.includes('Written by Robin');

        console.log(`📄 ${slug}:`);
        console.log(`   Still has Robin: ${stillHasAuthor ? '❌ YES' : '✅ NO'}`);
        console.log(`   Still has Written By: ${stillHasWrittenBy ? '❌ YES' : '✅ NO'}`);
      }
    }

  } catch (error) {
    console.error('💥 Operation failed:', error);
  }
}

if (require.main === module) {
  removeEmbeddedAuthor().then(() => {
    console.log('\n✅ Embedded author removal complete');
  });
}

module.exports = { removeEmbeddedAuthor };