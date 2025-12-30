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

async function addCategoriesField() {
  console.log('📊 ADDING CATEGORIES FIELD TO RESEARCH QUEUE');
  console.log('='.repeat(60));

  try {
    // First, try to fetch without categories to see what we can get
    const { data: testResearch, error: testError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract')
      .limit(1);

    if (testError) {
      console.error('❌ Error accessing research table:', testError);
      return;
    }

    console.log('✅ Research table accessible');

    // Try to get all research, handling cases where categories column may not exist
    const { data: allResearch, error: fetchError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, categories')
      .limit(1000);

    // If categories column doesn't exist, we'll work without it for now
    let hasCategories = true;
    let researchToProcess = allResearch;

    if (fetchError && fetchError.code === '42703') {
      console.log('⚠️  Categories column does not exist yet, fetching without it...');
      hasCategories = false;

      const { data: basicResearch, error: basicError } = await supabase
        .from('kb_research_queue')
        .select('id, title, abstract');

      if (basicError) {
        console.error('❌ Error fetching basic research:', basicError);
        return;
      }

      researchToProcess = basicResearch;
    } else if (fetchError) {
      console.error('❌ Error fetching research:', fetchError);
      return;
    }

    console.log(`📋 Processing ${researchToProcess?.length || 0} research entries...`);

    let updated = 0;
    for (const item of researchToProcess || []) {
      const text = `${item.title || ''} ${item.abstract || ''}`.toLowerCase();
      const categories = [];

      // CBD category
      if (
        text.includes('cannabidiol') ||
        text.includes('cbd') ||
        text.includes('epidiolex')
      ) {
        categories.push('cbd');
      }

      // Cannabis category
      if (
        text.includes('cannabis') ||
        text.includes('marijuana') ||
        text.includes('hemp') ||
        text.includes('thc') ||
        text.includes('tetrahydrocannabinol')
      ) {
        categories.push('cannabis');
      }

      // Medical Cannabis category
      if (
        text.includes('medical cannabis') ||
        text.includes('medicinal cannabis') ||
        text.includes('medical marijuana') ||
        text.includes('therapeutic') ||
        text.includes('patient') ||
        text.includes('treatment') ||
        text.includes('clinical trial') ||
        text.includes('randomized') ||
        text.includes('efficacy')
      ) {
        categories.push('medical-cannabis');
      }

      // Default to CBD if no category matched
      if (categories.length === 0) {
        categories.push('cbd');
      }

      // Remove duplicates
      const uniqueCategories = [...new Set(categories)];

      // Try to update with categories
      let shouldUpdate = true;
      if (hasCategories) {
        // Only update if categories have changed
        const currentCategories = item.categories || [];
        shouldUpdate = JSON.stringify(currentCategories.sort()) !== JSON.stringify(uniqueCategories.sort());
      }

      if (shouldUpdate) {
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({ categories: uniqueCategories })
          .eq('id', item.id);

        if (!updateError) {
          updated++;
          console.log(`✅ ${item.id}: ${uniqueCategories.join(', ')}`);
        } else {
          if (updateError.code === '42703') {
            console.log(`⚠️  Skipping ${item.id} - categories column doesn't exist yet`);
          } else {
            console.log(`❌ Failed to update ${item.id}: ${updateError.message}`);
          }
        }
      }
    }

    // Final verification (only if we think categories exist)
    if (hasCategories || updated > 0) {
      const { data: finalData } = await supabase
        .from('kb_research_queue')
        .select('categories');

      const cbdCount = finalData?.filter(r => r.categories?.includes('cbd')).length || 0;
      const cannabisCount = finalData?.filter(r => r.categories?.includes('cannabis')).length || 0;
      const medicalCount = finalData?.filter(r => r.categories?.includes('medical-cannabis')).length || 0;

      console.log('\n📈 CATEGORIZATION COMPLETE:');
      console.log('-'.repeat(40));
      console.log(`Updated entries: ${updated}`);
      console.log(`CBD category: ${cbdCount} entries`);
      console.log(`Cannabis category: ${cannabisCount} entries`);
      console.log(`Medical Cannabis category: ${medicalCount} entries`);
      console.log('✅ All research now has categories');
    } else {
      console.log('\n⚠️  Categories column needs to be added to database first');
      console.log('Please run the database migration to add the categories column');
    }

  } catch (error) {
    console.error('💥 Database operation failed:', error);
  }
}

if (require.main === module) {
  addCategoriesField().then(() => {
    console.log('\n✅ Categories setup complete');
  });
}

module.exports = { addCategoriesField };