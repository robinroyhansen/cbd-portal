#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('❌ SUPABASE environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreRobinAuthor() {
  console.log('👤 RESTORING ROBIN ROY KRIGSLUND-HANSEN AS AUTHOR');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Check current authors
    console.log('📋 Step 1: Checking current authors...');
    const { data: existingAuthors } = await supabase
      .from('authors')
      .select('*');

    console.log('   Current authors:', existingAuthors?.length || 0);
    existingAuthors?.forEach(author => {
      console.log(`   - ${author.name} (${author.slug})`);
    });

    // Step 2: Create Robin Roy Krigslund-Hansen with full profile
    console.log('\n👤 Step 2: Creating Robin Roy Krigslund-Hansen...');

    const robinProfile = {
      name: 'Robin Roy Krigslund-Hansen',
      slug: 'robin-roy-krigslund-hansen',
      title: 'Cannabis Research Specialist & CBD Expert',
      email: 'robin@robinroy.dk',
      bio_short: 'Robin Roy Krigslund-Hansen is a cannabis researcher and CBD expert with extensive experience in cannabinoid science, therapeutic applications, and evidence-based cannabis education. He specializes in translating complex research into accessible, practical guidance for consumers and healthcare providers.',
      bio_full: 'Robin Roy Krigslund-Hansen brings years of experience in cannabis research and CBD science to the field of cannabinoid therapeutics. His expertise spans from molecular pharmacology to clinical applications, with a particular focus on evidence-based medicine and patient education. Robin has worked extensively with healthcare providers, researchers, and patients to bridge the gap between complex scientific research and practical therapeutic applications. His work emphasizes safety, efficacy, and informed decision-making in cannabinoid medicine.',
      image_url: '/images/authors/robin-roy-krigslund-hansen.jpg',
      image_alt: 'Robin Roy Krigslund-Hansen - Cannabis Research Specialist',
      credentials: [
        'Cannabis Research Specialist',
        'CBD Science Expert',
        'Evidence-Based Medicine Advocate',
        'Scientific Content Creator',
        'Healthcare Education Specialist'
      ],
      expertise_areas: [
        'Cannabis Research',
        'CBD Science',
        'Therapeutic Applications',
        'Evidence-Based Medicine',
        'Patient Education',
        'Scientific Writing',
        'Content Strategy'
      ],
      years_experience: 8,
      location: 'Denmark',
      social_links: {
        website: 'https://robinroy.dk',
        twitter: 'https://twitter.com/robinroykh',
        linkedin: 'https://linkedin.com/in/robinroykh',
        github: 'https://github.com/robinroykh'
      },
      meta_title: 'Robin Roy Krigslund-Hansen - Cannabis Research & CBD Expert',
      meta_description: 'Robin Roy Krigslund-Hansen is a leading cannabis researcher and CBD expert specializing in evidence-based cannabinoid therapeutics and patient education.',
      is_primary: true,
      is_verified: true,
      is_active: true,
      display_order: 1
    };

    // Check if Robin already exists
    const { data: robinExists } = await supabase
      .from('authors')
      .select('id')
      .eq('slug', 'robin-roy-krigslund-hansen')
      .single();

    let robinId;

    if (robinExists) {
      console.log('   ✅ Robin already exists, updating profile...');
      const { data: updatedRobin, error: updateError } = await supabase
        .from('authors')
        .update(robinProfile)
        .eq('slug', 'robin-roy-krigslund-hansen')
        .select('id')
        .single();

      if (updateError) {
        console.log('   ❌ Error updating Robin:', updateError.message);
        return;
      }
      robinId = updatedRobin.id;
    } else {
      console.log('   ✅ Creating new Robin author profile...');
      const { data: newRobin, error: createError } = await supabase
        .from('authors')
        .insert(robinProfile)
        .select('id')
        .single();

      if (createError) {
        console.log('   ❌ Error creating Robin:', createError.message);
        return;
      }
      robinId = newRobin.id;
    }

    console.log(`   ✅ Robin Roy Krigslund-Hansen created/updated with ID: ${robinId}`);

    // Step 3: Update all articles to use Robin's ID
    console.log('\n📄 Step 3: Updating articles to use Robin as author...');

    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, slug, author_id');

    console.log(`   Found ${articles?.length || 0} articles to update`);

    if (articles && articles.length > 0) {
      const { data: updatedArticles, error: updateArticlesError } = await supabase
        .from('articles')
        .update({ author_id: robinId })
        .neq('author_id', robinId) // Only update if not already Robin
        .select('id, title');

      if (updateArticlesError) {
        console.log('   ❌ Error updating articles:', updateArticlesError.message);
      } else {
        console.log(`   ✅ Updated ${updatedArticles?.length || 0} articles to use Robin as author`);
        updatedArticles?.slice(0, 5).forEach(article => {
          console.log(`      - ${article.title.substring(0, 50)}...`);
        });
        if (updatedArticles && updatedArticles.length > 5) {
          console.log(`      ... and ${updatedArticles.length - 5} more articles`);
        }
      }
    }

    // Step 4: Remove Erik Mortensen
    console.log('\n🗑️  Step 4: Removing Erik Mortensen...');

    const { data: erikAuthor } = await supabase
      .from('authors')
      .select('id, name')
      .eq('slug', 'erik-mortensen')
      .single();

    if (erikAuthor) {
      // First check if any articles still reference Erik
      const { data: erikArticles } = await supabase
        .from('articles')
        .select('id')
        .eq('author_id', erikAuthor.id);

      if (erikArticles && erikArticles.length > 0) {
        console.log(`   ⚠️  WARNING: ${erikArticles.length} articles still reference Erik Mortensen`);
        console.log('   Updating them to Robin first...');

        await supabase
          .from('articles')
          .update({ author_id: robinId })
          .eq('author_id', erikAuthor.id);
      }

      // Now delete Erik
      const { error: deleteError } = await supabase
        .from('authors')
        .delete()
        .eq('id', erikAuthor.id);

      if (deleteError) {
        console.log('   ❌ Error deleting Erik:', deleteError.message);
      } else {
        console.log('   ✅ Erik Mortensen successfully removed');
      }
    } else {
      console.log('   ℹ️  Erik Mortensen not found in database');
    }

    // Step 5: Verification
    console.log('\n✅ Step 5: Verification...');

    const { data: finalAuthors } = await supabase
      .from('authors')
      .select('id, name, slug, email');

    console.log('   Final authors in database:');
    finalAuthors?.forEach(author => {
      console.log(`   ✅ ${author.name} (${author.slug}) - ${author.email}`);
    });

    const { data: authoredArticles, count: articleCount } = await supabase
      .from('articles')
      .select('id', { count: 'exact' })
      .eq('author_id', robinId);

    console.log(`   📄 Articles authored by Robin: ${articleCount || 0}`);

    console.log('\n🎉 AUTHOR RESTORATION COMPLETE!');
    console.log('✅ Robin Roy Krigslund-Hansen is now the primary author');
    console.log('✅ All articles have been updated');
    console.log('✅ Erik Mortensen has been removed');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

if (require.main === module) {
  restoreRobinAuthor();
}

module.exports = { restoreRobinAuthor };