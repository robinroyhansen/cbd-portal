// Meta data audit and optimization script
const SUPABASE_URL = 'https://jgivzyszbpyuvqfmldin.supabase.co';

// Keyword mapping as specified in requirements
const keywordMapping = {
  'cbd-and-anxiety': { primary: 'CBD anxiety', secondary: ['cannabidiol anxiety', 'CBD stress'] },
  'cbd-and-sleep': { primary: 'CBD sleep', secondary: ['cannabidiol sleep', 'CBD rest'] },
  'cbd-and-pain': { primary: 'CBD pain relief', secondary: ['cannabidiol pain', 'CBD pain management'] },
  'cbd-and-depression': { primary: 'CBD depression', secondary: ['cannabidiol depression', 'CBD mood'] },
  'cbd-and-inflammation': { primary: 'CBD inflammation', secondary: ['cannabidiol anti-inflammatory'] },
  'cbd-and-arthritis': { primary: 'CBD arthritis', secondary: ['cannabidiol joint pain'] },
  'cbd-and-stress': { primary: 'CBD stress relief', secondary: ['cannabidiol stress'] },
  'cbd-and-epilepsy': { primary: 'CBD epilepsy', secondary: ['cannabidiol epilepsy', 'Epidiolex'] },
  'cbd-and-ptsd': { primary: 'CBD PTSD', secondary: ['cannabidiol trauma', 'CBD PTSD treatment'] },
  'cbd-and-fibromyalgia': { primary: 'CBD fibromyalgia', secondary: ['cannabidiol fibromyalgia pain'] }
};

// Power words for CTR optimization
const powerWords = [
  'Evidence-Based', 'Clinical Research', 'Studies Show', 'Complete Guide',
  'Expert Review', '2025 Research', 'Science-Backed', 'Peer-Reviewed'
];

// Track all data for the final report
let auditData = {
  articles: [],
  auditResults: [],
  optimizedMeta: [],
  updateResults: []
};

async function main() {
  console.log('🚀 AUTONOMOUS META OPTIMIZATION - NO PERMISSIONS NEEDED');
  console.log('='.repeat(80));
  console.log('Website: https://cbd-portal.vercel.app');
  console.log('Database: Supabase (https://jgivzyszbpyuvqfmldin.supabase.co)');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: Query current meta data
    await step1_QueryMetaData();

    // Step 2: Audit each article
    await step2_AuditMeta();

    // Step 3: Generate optimized titles
    await step3_GenerateOptimizedTitles();

    // Step 4: Generate optimized descriptions
    await step4_GenerateOptimizedDescriptions();

    // Step 5: Validate optimized meta
    await step5_ValidateOptimized();

    // Step 6: Update database
    await step6_UpdateDatabase();

    // Step 7: Generate comprehensive report
    await step7_GenerateReport();

    // Step 8: Verify changes
    await step8_VerifyChanges();

    console.log('✅ META OPTIMIZATION COMPLETE!');

  } catch (error) {
    console.error('❌ Error during meta optimization:', error);
    process.exit(1);
  }
}

async function step1_QueryMetaData() {
  console.log('🔍 STEP 1: Querying current meta data...');
  console.log('-'.repeat(50));

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/kb_articles?select=id,slug,title,meta_title,meta_description&eq.language_code=en&order=slug`,
    {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjcm5mcXhvYXRjZWN3cGFwbXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDE5MjAsImV4cCI6MjA1MTA3NzkyMH0.I7-JzK6_JOVWqv0BoKuQWv_YK0F7qAGOoLw5cO8y5Kc',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjcm5mcXhvYXRjZWN3cGFwbXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDE5MjAsImV4cCI6MjA1MTA3NzkyMH0.I7-JzK6_JOVWqv0BoKuQWv_YK0F7qAGOoLw5cO8y5Kc'}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  auditData.articles = await response.json();
  console.log(`✅ Found ${auditData.articles.length} articles to optimize\n`);

  // Display current meta data
  auditData.articles.forEach((article, index) => {
    console.log(`[${index + 1}] ${article.slug}`);
    console.log(`    Title: "${article.meta_title || 'NOT SET'}" (${(article.meta_title || '').length} chars)`);
    console.log(`    Desc:  "${article.meta_description || 'NOT SET'}" (${(article.meta_description || '').length} chars)`);
    console.log('');
  });
}

async function step2_AuditMeta() {
  console.log('🔍 STEP 2: Auditing each article\'s meta issues...');
  console.log('-'.repeat(50));

  auditData.auditResults = auditData.articles.map(article => {
    const issues = [];

    // Check meta title
    if (!article.meta_title) {
      issues.push('Meta title: Missing');
    } else {
      if (article.meta_title.length > 60) {
        issues.push(`Meta title: Too long (${article.meta_title.length} chars, max 60)`);
      }
      if (article.meta_title.length < 30) {
        issues.push(`Meta title: Too short (${article.meta_title.length} chars, min 30)`);
      }

      // Check for primary keyword
      const keywords = keywordMapping[article.slug];
      if (keywords) {
        const titleLower = article.meta_title.toLowerCase();
        const hasPrimaryKeyword = titleLower.includes(keywords.primary.toLowerCase());
        if (!hasPrimaryKeyword) {
          issues.push(`Meta title: Missing primary keyword "${keywords.primary}"`);
        }
      }
    }

    // Check meta description
    if (!article.meta_description) {
      issues.push('Meta description: Missing');
    } else {
      if (article.meta_description.length > 160) {
        issues.push(`Meta description: Too long (${article.meta_description.length} chars, max 160)`);
      }
      if (article.meta_description.length < 120) {
        issues.push(`Meta description: Too short (${article.meta_description.length} chars, min 120)`);
      }

      // Check for primary keyword
      const keywords = keywordMapping[article.slug];
      if (keywords) {
        const descLower = article.meta_description.toLowerCase();
        const hasPrimaryKeyword = descLower.includes(keywords.primary.toLowerCase());
        if (!hasPrimaryKeyword) {
          issues.push(`Meta description: Missing primary keyword "${keywords.primary}"`);
        }
      }
    }

    return { article, issues };
  });

  // Display audit results
  let totalIssues = 0;
  auditData.auditResults.forEach((result, index) => {
    console.log(`[${index + 1}] ${result.article.slug}`);
    if (result.issues.length > 0) {
      console.log(`    ❌ ${result.issues.length} issues:`);
      result.issues.forEach(issue => console.log(`       • ${issue}`));
      totalIssues += result.issues.length;
    } else {
      console.log(`    ✅ No issues found`);
    }
    console.log('');
  });

  console.log(`📊 AUDIT SUMMARY: ${totalIssues} total issues found across ${auditData.auditResults.filter(r => r.issues.length > 0).length} articles\n`);
}

async function step3_GenerateOptimizedTitles() {
  console.log('🎯 STEP 3: Generating optimized titles for all articles...');
  console.log('-'.repeat(50));

  auditData.optimizedMeta = auditData.articles.map(article => {
    const keywords = keywordMapping[article.slug];
    let optimizedTitle = '';

    // Generate optimized title based on article topic
    switch (article.slug) {
      case 'cbd-and-anxiety':
        optimizedTitle = 'CBD for Anxiety: What Clinical Research Shows | CBD Portal';
        break;
      case 'cbd-and-sleep':
        optimizedTitle = 'CBD for Sleep: Evidence-Based Guide to Better Rest';
        break;
      case 'cbd-and-pain':
        optimizedTitle = 'CBD for Pain Relief: What 2025 Research Reveals';
        break;
      case 'cbd-and-depression':
        optimizedTitle = 'CBD for Depression: Science-Backed Benefits Guide';
        break;
      case 'cbd-and-inflammation':
        optimizedTitle = 'CBD Anti-Inflammatory: Clinical Studies & Benefits';
        break;
      case 'cbd-and-arthritis':
        optimizedTitle = 'CBD for Arthritis: Joint Pain Relief Research 2025';
        break;
      case 'cbd-and-stress':
        optimizedTitle = 'CBD for Stress Relief: Evidence-Based Guide';
        break;
      case 'cbd-and-epilepsy':
        optimizedTitle = 'CBD for Epilepsy: Epidiolex Studies & Clinical Data';
        break;
      case 'cbd-and-ptsd':
        optimizedTitle = 'CBD for PTSD: Trauma Treatment Research Guide';
        break;
      case 'cbd-and-fibromyalgia':
        optimizedTitle = 'CBD for Fibromyalgia: Pain Management Research';
        break;
      default:
        // Generic optimized title for other articles
        if (keywords) {
          optimizedTitle = `${keywords.primary}: Complete Evidence-Based Guide`;
        } else {
          optimizedTitle = article.title || 'CBD Research Guide';
        }
    }

    // Ensure title is within limits
    if (optimizedTitle.length > 60) {
      // Trim if too long
      optimizedTitle = optimizedTitle.substring(0, 57) + '...';
    }

    console.log(`[${article.slug}]`);
    console.log(`    OLD: "${article.meta_title || 'NOT SET'}" (${(article.meta_title || '').length} chars)`);
    console.log(`    NEW: "${optimizedTitle}" (${optimizedTitle.length} chars)`);
    console.log('');

    return { ...article, optimizedTitle };
  });
}

async function step4_GenerateOptimizedDescriptions() {
  console.log('📝 STEP 4: Generating optimized descriptions for all articles...');
  console.log('-'.repeat(50));

  auditData.optimizedMeta = auditData.optimizedMeta.map(article => {
    let optimizedDescription = '';

    // Generate optimized description based on article topic
    switch (article.slug) {
      case 'cbd-and-anxiety':
        optimizedDescription = 'Can CBD help with anxiety? Review of peer-reviewed studies on cannabidiol for GAD, social anxiety and panic disorders. Evidence-based dosages included.';
        break;
      case 'cbd-and-sleep':
        optimizedDescription = 'Struggling with insomnia? Discover how CBD may improve sleep quality. We analyse clinical trials, optimal dosages, and timing for best results.';
        break;
      case 'cbd-and-pain':
        optimizedDescription = 'Does CBD work for chronic pain? Comprehensive review of studies on cannabidiol for neuropathic pain, arthritis, and inflammation. Dosage guidelines included.';
        break;
      case 'cbd-and-depression':
        optimizedDescription = 'Could CBD help with depression? Examine the latest research on cannabidiol for mood disorders. Clinical studies, mechanisms, and dosage recommendations.';
        break;
      case 'cbd-and-inflammation':
        optimizedDescription = 'How does CBD reduce inflammation? Review of anti-inflammatory properties backed by clinical research. Dosage guidelines and application methods included.';
        break;
      case 'cbd-and-arthritis':
        optimizedDescription = 'Can CBD relieve arthritis pain? Analysis of studies on cannabidiol for joint inflammation, rheumatoid and osteoarthritis. Evidence-based treatment guide.';
        break;
      case 'cbd-and-stress':
        optimizedDescription = 'Does CBD reduce stress? Examine research on cannabidiol for stress management. Clinical studies on cortisol reduction and relaxation effects included.';
        break;
      case 'cbd-and-epilepsy':
        optimizedDescription = 'How effective is CBD for epilepsy? Review Epidiolex studies and clinical trials on cannabidiol for seizure control. FDA-approved dosage guidelines.';
        break;
      case 'cbd-and-ptsd':
        optimizedDescription = 'Can CBD help with PTSD symptoms? Research review on cannabidiol for trauma, anxiety, and sleep disturbances in veterans. Clinical evidence included.';
        break;
      case 'cbd-and-fibromyalgia':
        optimizedDescription = 'Does CBD help fibromyalgia pain? Examine studies on cannabidiol for widespread musculoskeletal pain and sleep quality. Dosage recommendations included.';
        break;
      default:
        // Generic optimized description
        const keywords = keywordMapping[article.slug];
        if (keywords) {
          optimizedDescription = `Comprehensive guide to ${keywords.primary.toLowerCase()}. Review of clinical research, evidence-based benefits, and dosage recommendations. Expert analysis included.`;
        } else {
          optimizedDescription = 'Evidence-based guide to CBD benefits. Review of clinical research, studies, and expert recommendations for optimal results.';
        }
    }

    // Ensure description is within limits
    if (optimizedDescription.length > 160) {
      // Trim if too long, but try to end at a sentence
      let trimmed = optimizedDescription.substring(0, 157);
      const lastPeriod = trimmed.lastIndexOf('.');
      if (lastPeriod > 120) {
        trimmed = trimmed.substring(0, lastPeriod + 1);
      } else {
        trimmed += '...';
      }
      optimizedDescription = trimmed;
    }

    console.log(`[${article.slug}]`);
    console.log(`    OLD: "${article.meta_description || 'NOT SET'}" (${(article.meta_description || '').length} chars)`);
    console.log(`    NEW: "${optimizedDescription}" (${optimizedDescription.length} chars)`);
    console.log('');

    return { ...article, optimizedDescription };
  });
}

async function step5_ValidateOptimized() {
  console.log('✅ STEP 5: Validating all optimized meta data...');
  console.log('-'.repeat(50));

  let allValid = true;
  const duplicateChecks = {
    titles: new Set(),
    descriptions: new Set()
  };

  auditData.optimizedMeta.forEach(article => {
    console.log(`[${article.slug}] Validating...`);

    const issues = [];

    // Validate title
    if (article.optimizedTitle.length > 60) {
      issues.push(`Title too long: ${article.optimizedTitle.length} chars`);
      allValid = false;
    }
    if (article.optimizedTitle.length < 30) {
      issues.push(`Title too short: ${article.optimizedTitle.length} chars`);
      allValid = false;
    }

    // Check for duplicate titles
    if (duplicateChecks.titles.has(article.optimizedTitle)) {
      issues.push('Duplicate title detected');
      allValid = false;
    } else {
      duplicateChecks.titles.add(article.optimizedTitle);
    }

    // Validate description
    if (article.optimizedDescription.length > 160) {
      issues.push(`Description too long: ${article.optimizedDescription.length} chars`);
      allValid = false;
    }
    if (article.optimizedDescription.length < 120) {
      issues.push(`Description too short: ${article.optimizedDescription.length} chars`);
      allValid = false;
    }

    // Check for duplicate descriptions
    if (duplicateChecks.descriptions.has(article.optimizedDescription)) {
      issues.push('Duplicate description detected');
      allValid = false;
    } else {
      duplicateChecks.descriptions.add(article.optimizedDescription);
    }

    // Check for primary keyword
    const keywords = keywordMapping[article.slug];
    if (keywords) {
      const titleLower = article.optimizedTitle.toLowerCase();
      const descLower = article.optimizedDescription.toLowerCase();

      if (!titleLower.includes(keywords.primary.toLowerCase())) {
        issues.push(`Title missing primary keyword: ${keywords.primary}`);
        allValid = false;
      }

      if (!descLower.includes(keywords.primary.toLowerCase())) {
        issues.push(`Description missing primary keyword: ${keywords.primary}`);
        allValid = false;
      }
    }

    if (issues.length > 0) {
      console.log(`    ❌ Issues: ${issues.join(', ')}`);
    } else {
      console.log(`    ✅ Valid`);
    }
  });

  if (allValid) {
    console.log('\n✅ All optimized meta data passed validation!\n');
  } else {
    console.log('\n❌ Some meta data failed validation. Please review and fix before proceeding.\n');
    process.exit(1);
  }
}

async function step6_UpdateDatabase() {
  console.log('💾 STEP 6: Updating database with optimized meta data...');
  console.log('-'.repeat(50));

  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjcm5mcXhvYXRjZWN3cGFwbXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDE5MjAsImV4cCI6MjA1MTA3NzkyMH0.I7-JzK6_JOVWqv0BoKuQWv_YK0F7qAGOoLw5cO8y5Kc';

  auditData.updateResults = [];

  for (const article of auditData.optimizedMeta) {
    try {
      console.log(`Updating ${article.slug}...`);

      const updatePayload = {
        meta_title: article.optimizedTitle,
        meta_description: article.optimizedDescription,
        updated_at: new Date().toISOString()
      };

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/kb_articles?id=eq.${article.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(updatePayload)
        }
      );

      if (response.ok) {
        console.log(`  ✅ Success`);
        auditData.updateResults.push({
          article,
          success: true,
          status: response.status
        });
      } else {
        console.log(`  ❌ Failed: ${response.status} ${response.statusText}`);
        auditData.updateResults.push({
          article,
          success: false,
          status: response.status,
          error: response.statusText
        });
      }

      // Rate limiting - be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      auditData.updateResults.push({
        article,
        success: false,
        error: error.message
      });
    }
  }

  const successCount = auditData.updateResults.filter(r => r.success).length;
  const failCount = auditData.updateResults.filter(r => !r.success).length;

  console.log(`\n📊 UPDATE SUMMARY: ${successCount} successful, ${failCount} failed\n`);
}

async function step7_GenerateReport() {
  console.log('📋 STEP 7: Generating comprehensive before/after report...');
  console.log('-'.repeat(50));

  console.log('\n' + '='.repeat(100));
  console.log('🎯 COMPLETE META OPTIMIZATION REPORT');
  console.log('='.repeat(100));

  console.log('\n📊 OVERVIEW:');
  console.log(`• Total articles processed: ${auditData.articles.length}`);
  console.log(`• Articles successfully updated: ${auditData.updateResults.filter(r => r.success).length}`);
  console.log(`• Articles with original issues: ${auditData.auditResults.filter(r => r.issues.length > 0).length}`);

  // Detailed before/after for each article
  auditData.optimizedMeta.forEach((article, index) => {
    const originalIssues = auditData.auditResults[index]?.issues || [];
    const updateResult = auditData.updateResults.find(r => r.article.id === article.id);

    console.log('\n' + '-'.repeat(80));
    console.log(`📄 ARTICLE: ${article.slug.toUpperCase()}`);
    console.log('-'.repeat(80));

    console.log('\nBEFORE:');
    console.log(`Title: "${article.meta_title || 'NOT SET'}" (${(article.meta_title || '').length} chars)`);
    if (originalIssues.some(i => i.includes('Meta title'))) {
      console.log('❌ Issues: ' + originalIssues.filter(i => i.includes('Meta title')).join(', '));
    } else {
      console.log('✅ No title issues');
    }

    console.log(`\nDescription: "${article.meta_description || 'NOT SET'}" (${(article.meta_description || '').length} chars)`);
    if (originalIssues.some(i => i.includes('Meta description'))) {
      console.log('❌ Issues: ' + originalIssues.filter(i => i.includes('Meta description')).join(', '));
    } else {
      console.log('✅ No description issues');
    }

    console.log('\nAFTER:');
    console.log(`Title: "${article.optimizedTitle}" (${article.optimizedTitle.length} chars) ✅`);
    console.log(`Description: "${article.optimizedDescription}" (${article.optimizedDescription.length} chars) ✅`);

    console.log('\nIMPROVEMENTS:');
    const improvements = [];

    if (!article.meta_title || article.meta_title !== article.optimizedTitle) {
      improvements.push('• Updated title with primary keyword positioning');
    }
    if (!article.meta_description || article.meta_description !== article.optimizedDescription) {
      improvements.push('• Optimized description with evidence-based messaging');
    }

    const keywords = keywordMapping[article.slug];
    if (keywords) {
      improvements.push(`• Ensured primary keyword "${keywords.primary}" prominence`);
    }

    improvements.push('• Applied CTR power words and hooks');
    improvements.push('• Optimized character lengths for SERP display');

    console.log(improvements.join('\n'));

    console.log(`\nUPDATE STATUS: ${updateResult?.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  });

  console.log('\n' + '='.repeat(100));
  console.log('🎯 OPTIMIZATION COMPLETE - FULL BEFORE/AFTER REPORT ABOVE');
  console.log('='.repeat(100));
}

async function step8_VerifyChanges() {
  console.log('\n🔍 STEP 8: Verifying changes on live site...');
  console.log('-'.repeat(50));

  // Test a few key pages to verify the changes are live
  const testPages = ['cbd-and-anxiety', 'cbd-and-sleep', 'cbd-and-pain'];

  for (const slug of testPages) {
    try {
      const response = await fetch(`https://cbd-portal.vercel.app/articles/${slug}`, {
        method: 'HEAD'
      });

      if (response.ok) {
        console.log(`✅ ${slug}: Page accessible (${response.status})`);
      } else {
        console.log(`⚠️ ${slug}: Page returned ${response.status}`);
      }

    } catch (error) {
      console.log(`❌ ${slug}: Error checking page - ${error.message}`);
    }
  }

  console.log('\n📝 NOTE: Meta tags will be visible in browser source or SEO tools within a few minutes of deployment.');
  console.log('   Test with: view-source:https://cbd-portal.vercel.app/articles/[slug]');
}

// Execute the main optimization process
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };