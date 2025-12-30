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

async function approveQualityResearch() {
  console.log('📚 APPROVING HIGH-QUALITY RESEARCH FOR PUBLIC DISPLAY');
  console.log('='.repeat(60));

  try {
    // Get all pending research papers sorted by relevance
    const { data: papers, error } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('status', 'pending')
      .order('relevance_score', { ascending: false });

    if (error) {
      console.error('❌ Error fetching research papers:', error);
      return;
    }

    console.log(`📊 Found ${papers?.length || 0} pending research papers`);

    if (!papers || papers.length === 0) {
      console.log('ℹ️  No pending papers to approve');
      return;
    }

    // Show current papers by relevance
    console.log('\n📄 CURRENT PAPERS BY RELEVANCE SCORE:');
    console.log('-'.repeat(50));
    papers.forEach((paper, index) => {
      console.log(`${index + 1}. Score: ${paper.relevance_score} | ${paper.source_site}`);
      console.log(`   Title: ${paper.title.substring(0, 80)}...`);
      console.log(`   Authors: ${paper.authors || 'N/A'}`);
      console.log('');
    });

    // Approve top papers with high relevance scores (≥60)
    const highQualityPapers = papers.filter(p => p.relevance_score >= 60);
    const mediumQualityPapers = papers.filter(p => p.relevance_score >= 40 && p.relevance_score < 60);

    console.log(`🎯 HIGH QUALITY PAPERS (≥60 score): ${highQualityPapers.length}`);
    console.log(`🟡 MEDIUM QUALITY PAPERS (40-59 score): ${mediumQualityPapers.length}`);
    console.log(`🔴 LOW QUALITY PAPERS (<40 score): ${papers.length - highQualityPapers.length - mediumQualityPapers.length}`);

    // Approve high quality papers automatically
    const papersToApprove = [...highQualityPapers, ...mediumQualityPapers.slice(0, 5)]; // Top 5 medium quality

    if (papersToApprove.length === 0) {
      console.log('\n⚠️  No papers meet quality threshold for auto-approval');

      // Approve top 3 papers regardless of score for demo purposes
      const topPapers = papers.slice(0, 3);
      console.log(`📝 Approving top 3 papers for demo purposes...`);

      for (const paper of topPapers) {
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: 'system_auto'
          })
          .eq('id', paper.id);

        if (updateError) {
          console.error(`❌ Failed to approve paper ${paper.id}:`, updateError);
        } else {
          console.log(`✅ Approved: "${paper.title.substring(0, 60)}..." (Score: ${paper.relevance_score})`);
        }
      }
      return;
    }

    console.log(`\n📝 Approving ${papersToApprove.length} papers...`);

    let approved = 0;
    for (const paper of papersToApprove) {
      const { error: updateError } = await supabase
        .from('kb_research_queue')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'system_auto'
        })
        .eq('id', paper.id);

      if (updateError) {
        console.error(`❌ Failed to approve paper ${paper.id}:`, updateError);
      } else {
        console.log(`✅ Approved: "${paper.title.substring(0, 60)}..." (Score: ${paper.relevance_score})`);
        approved++;
      }
    }

    // Final verification
    const { data: approvedPapers } = await supabase
      .from('kb_research_queue')
      .select('id, title, relevance_score, source_site')
      .eq('status', 'approved');

    console.log('\n📈 FINAL RESULTS:');
    console.log('-'.repeat(30));
    console.log(`Papers approved: ${approved}`);
    console.log(`Total approved papers: ${approvedPapers?.length || 0}`);
    console.log(`✅ Research database ready for public display`);

    if (approvedPapers && approvedPapers.length > 0) {
      console.log('\n🏆 APPROVED PAPERS FOR PUBLIC RESEARCH PAGE:');
      approvedPapers.forEach((paper, index) => {
        console.log(`${index + 1}. ${paper.source_site} | Score: ${paper.relevance_score}`);
        console.log(`   ${paper.title}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('💥 Operation failed:', error);
  }
}

if (require.main === module) {
  approveQualityResearch().then(() => {
    console.log('\n✅ Research approval process complete');
  });
}

module.exports = { approveQualityResearch };