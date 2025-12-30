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

async function showCategoryStats() {
  console.log('📊 RESEARCH CATEGORY STATISTICS');
  console.log('='.repeat(50));

  try {
    // Get all research papers with categories
    const { data: allPapers, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, categories, status, relevance_score');

    if (error) {
      console.error('❌ Error fetching papers:', error);
      return;
    }

    console.log(`📋 Total papers: ${allPapers?.length || 0}`);

    // Overall status breakdown
    const approved = allPapers?.filter(p => p.status === 'approved').length || 0;
    const pending = allPapers?.filter(p => p.status === 'pending').length || 0;
    const rejected = allPapers?.filter(p => p.status === 'rejected').length || 0;

    console.log('\n📈 STATUS BREAKDOWN:');
    console.log('-'.repeat(30));
    console.log(`✅ Approved: ${approved}`);
    console.log(`⏳ Pending: ${pending}`);
    console.log(`❌ Rejected: ${rejected}`);

    // Category breakdown for all papers
    const cbdTotal = allPapers?.filter(p => p.categories?.includes('cbd')).length || 0;
    const cannabisTotal = allPapers?.filter(p => p.categories?.includes('cannabis')).length || 0;
    const medicalTotal = allPapers?.filter(p => p.categories?.includes('medical-cannabis')).length || 0;
    const uncategorized = allPapers?.filter(p => !p.categories || p.categories.length === 0).length || 0;

    console.log('\n🏷️  TOTAL CATEGORY BREAKDOWN:');
    console.log('-'.repeat(35));
    console.log(`🟢 CBD: ${cbdTotal} papers`);
    console.log(`🔵 Cannabis: ${cannabisTotal} papers`);
    console.log(`🟣 Medical Cannabis: ${medicalTotal} papers`);
    console.log(`⚪ Uncategorized: ${uncategorized} papers`);

    // Category breakdown for approved papers only
    const approvedPapers = allPapers?.filter(p => p.status === 'approved') || [];
    const cbdApproved = approvedPapers.filter(p => p.categories?.includes('cbd')).length;
    const cannabisApproved = approvedPapers.filter(p => p.categories?.includes('cannabis')).length;
    const medicalApproved = approvedPapers.filter(p => p.categories?.includes('medical-cannabis')).length;

    console.log('\n🏆 APPROVED PAPERS BY CATEGORY:');
    console.log('-'.repeat(35));
    console.log(`🟢 CBD: ${cbdApproved} papers`);
    console.log(`🔵 Cannabis: ${cannabisApproved} papers`);
    console.log(`🟣 Medical Cannabis: ${medicalApproved} papers`);

    // Quality scores by category (approved only)
    if (approvedPapers.length > 0) {
      const cbdScores = approvedPapers.filter(p => p.categories?.includes('cbd')).map(p => p.relevance_score);
      const cannabisScores = approvedPapers.filter(p => p.categories?.includes('cannabis')).map(p => p.relevance_score);
      const medicalScores = approvedPapers.filter(p => p.categories?.includes('medical-cannabis')).map(p => p.relevance_score);

      console.log('\n⭐ AVERAGE QUALITY SCORES (Approved Papers):');
      console.log('-'.repeat(45));
      console.log(`🟢 CBD: ${cbdScores.length > 0 ? Math.round(cbdScores.reduce((a, b) => a + b, 0) / cbdScores.length) : 'N/A'}`);
      console.log(`🔵 Cannabis: ${cannabisScores.length > 0 ? Math.round(cannabisScores.reduce((a, b) => a + b, 0) / cannabisScores.length) : 'N/A'}`);
      console.log(`🟣 Medical Cannabis: ${medicalScores.length > 0 ? Math.round(medicalScores.reduce((a, b) => a + b, 0) / medicalScores.length) : 'N/A'}`);
    }

    // Show uncategorized papers that need attention
    if (uncategorized > 0) {
      console.log('\n⚠️  UNCATEGORIZED PAPERS NEEDING REVIEW:');
      console.log('-'.repeat(40));

      const uncategorizedPapers = allPapers?.filter(p => !p.categories || p.categories.length === 0).slice(0, 5) || [];
      uncategorizedPapers.forEach((paper, index) => {
        console.log(`${index + 1}. [${paper.status.toUpperCase()}] ${paper.title.substring(0, 60)}...`);
        console.log(`   Score: ${paper.relevance_score} | ID: ${paper.id}`);
        console.log('');
      });

      if (uncategorized > 5) {
        console.log(`   ... and ${uncategorized - 5} more uncategorized papers`);
      }
    }

  } catch (error) {
    console.error('💥 Operation failed:', error);
  }
}

async function fixUncategorized() {
  console.log('🔧 FIXING UNCATEGORIZED PAPERS');
  console.log('='.repeat(40));

  try {
    // Get uncategorized papers
    const { data: papers, error } = await supabase
      .from('kb_research_queue')
      .select('*')
      .or('categories.is.null,categories.eq.{}');

    if (error) {
      console.error('❌ Error fetching uncategorized papers:', error);
      return;
    }

    console.log(`🔍 Found ${papers?.length || 0} uncategorized papers`);

    if (!papers || papers.length === 0) {
      console.log('✅ All papers already have categories!');
      return;
    }

    let updated = 0;
    for (const paper of papers) {
      const text = `${paper.title || ''} ${paper.abstract || ''}`.toLowerCase();
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

      const { error: updateError } = await supabase
        .from('kb_research_queue')
        .update({ categories: uniqueCategories })
        .eq('id', paper.id);

      if (!updateError) {
        updated++;
        console.log(`✅ ${paper.id}: ${uniqueCategories.join(', ')}`);
      } else {
        console.log(`❌ Failed to update ${paper.id}: ${updateError.message}`);
      }
    }

    console.log(`\n🎯 Updated ${updated} papers with categories`);

  } catch (error) {
    console.error('💥 Operation failed:', error);
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'stats') {
  showCategoryStats();
} else if (command === 'fix') {
  fixUncategorized();
} else {
  console.log('📚 CATEGORY MANAGEMENT TOOL');
  console.log('='.repeat(30));
  console.log('Usage:');
  console.log('  node manage-categories.js stats  - Show category statistics');
  console.log('  node manage-categories.js fix    - Fix uncategorized papers');
  console.log('');
  console.log('Examples:');
  console.log('  SUPABASE_SERVICE_ROLE_KEY="..." node manage-categories.js stats');
  console.log('  SUPABASE_SERVICE_ROLE_KEY="..." node manage-categories.js fix');
}