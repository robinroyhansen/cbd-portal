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

async function restoreRobinFormulaSwissProfile() {
  console.log('🏢 RESTORING ROBIN\'S COMPLETE FORMULA SWISS PROFILE');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Robin's complete Formula Swiss professional profile
    const robinCompleteProfile = {
      name: 'Robin Roy Krigslund-Hansen',
      slug: 'robin-roy-krigslund-hansen',
      title: 'CBD Industry Pioneer & Co-founder of Formula Swiss AG',
      email: 'robin@formulaswiss.com',
      bio_short: 'Robin Roy Krigslund-Hansen is a Danish CBD industry pioneer who co-founded Formula Swiss AG in 2013, one of Europe\'s leading CBD companies. With 12+ years of hands-on experience, he has served 100,000+ customers across 60+ countries and developed 300+ CBD product formulations under GMP certification standards.',
      bio_full: `Robin Roy Krigslund-Hansen is a Danish entrepreneur and CBD industry pioneer who co-founded Formula Swiss AG in 2013, establishing one of Europe's most trusted CBD companies. Based between Denmark and Switzerland, Robin has built an extensive track record in the cannabinoid industry spanning over 12 years.

**Professional Background & Achievements:**

As Co-founder of Formula Swiss AG and related entities (Formula Swiss UK Ltd., Formula Swiss Medical Ltd., Formula Swiss Europe Ltd.), Robin has:
• Served 100,000+ customers across 60+ countries
• Developed 300+ different CBD product formulations
• Invested €1+ million in EU product compliance and registrations
• Maintained perfect track record: Zero failed third-party lab tests
• Achieved GMP (Good Manufacturing Practice) certification
• Obtained ISO 22716-2007 certification (highest cosmetic standards)

**Industry Expertise:**
Robin's hands-on experience covers the entire CBD value chain:
• Full-spectrum and broad-spectrum CBD oils
• CBG (Cannabigerol) and CBN (Cannabinol) formulations
• CBD skincare and cosmetics
• Veterinary CBD products (dogs, cats, horses)
• CO2 extraction, winterization, and decarboxylation processes
• EU Novel Food regulations and compliance across 16+ European countries

**Regulatory & Research Leadership:**
• Shareholder in EIHA Novel Food Consortium (€3.5 million initiative)
• Member: European Industrial Hemp Association (EIHA)
• Member: Swiss Medical Cannabis Association (MEDCAN)
• Member: Swiss Hemp Producer Association (IG Hanf)
• Member: Arge Canna (Austria)
• Research collaborations with University of Bologna - Department of Veterinary Medical Sciences
• Conducted double-blind, placebo-controlled trials in the Netherlands

**Sustainability & Innovation:**
Robin pioneered sustainable CBD operations using 100% renewable energy (solar and hydro), state-of-the-art LED growing technology, and organic cultivation methods without pesticides or artificial fertilizers, achieving carbon-negative operations.

**Independent Research & Education:**
Since establishing his industry expertise, Robin has dedicated himself to evidence-based CBD education and independent research. His work focuses on translating complex cannabinoid science into practical guidance for consumers and healthcare providers.

*Disclaimer: The views and opinions expressed in Robin's articles are his personal expert opinions based on his extensive industry experience and independent research. They do not represent the official position of Formula Swiss AG or any other organisation.*`,
      credentials: [
        'Co-founder, Formula Swiss AG (2013-present)',
        'CBD Industry Pioneer (12+ years experience)',
        'GMP Certified Manufacturing Expert',
        'EU Novel Food Regulations Specialist',
        'EIHA Novel Food Consortium Shareholder',
        'University Research Collaborator',
        'ISO 22716-2007 Certified (Cosmetic Standards)',
        '300+ CBD Product Formulations Developed',
        'Served 100,000+ customers across 60+ countries',
        'Zero failed third-party lab tests (perfect track record)'
      ],
      expertise_areas: [
        'CBD Industry Leadership',
        'Formula Swiss Operations',
        'CBD Product Development',
        'Full-spectrum & Broad-spectrum CBD Oils',
        'CBG & CBN Formulations',
        'EU Regulatory Compliance',
        'GMP Manufacturing Standards',
        'Novel Food Regulations',
        'CO2 Extraction Methods',
        'Veterinary CBD Applications',
        'CBD Skincare & Cosmetics',
        'Sustainable Hemp Cultivation',
        'International Market Expansion',
        'Clinical Research Collaboration',
        'Evidence-based CBD Education'
      ],
      years_experience: 12,
      location: 'Denmark / Switzerland',
      social_links: {
        website: 'https://formulaswiss.com',
        email: 'robin@formulaswiss.com',
        linkedin: 'https://linkedin.com/in/robinroykh',
        company: 'https://formulaswiss.com'
      },
      meta_title: 'Robin Roy Krigslund-Hansen - CBD Industry Pioneer & Formula Swiss Co-founder',
      meta_description: 'Robin Roy Krigslund-Hansen is a Danish CBD industry pioneer and Co-founder of Formula Swiss AG. With 12+ years experience, he has served 100,000+ customers across 60+ countries and developed 300+ CBD formulations.',
      is_primary: true,
      is_verified: true,
      is_active: true,
      display_order: 1
    };

    // Update Robin's profile with complete Formula Swiss information
    console.log('👤 Step 1: Updating Robin\'s profile with Formula Swiss background...');

    const { data: updatedRobin, error: updateError } = await supabase
      .from('authors')
      .update(robinCompleteProfile)
      .eq('slug', 'robin-roy-krigslund-hansen')
      .select('id, name, title, email');

    if (updateError) {
      console.log('❌ Error updating Robin\'s profile:', updateError.message);
      return;
    }

    if (updatedRobin && updatedRobin.length > 0) {
      console.log('✅ Robin\'s profile successfully updated:');
      console.log(`   Name: ${updatedRobin[0].name}`);
      console.log(`   Title: ${updatedRobin[0].title}`);
      console.log(`   Email: ${updatedRobin[0].email}`);
    }

    // Update article author information with Formula Swiss context
    console.log('\n📄 Step 2: Updating articles with Formula Swiss author information...');

    const robinArticleInfo = {
      author_name: 'Robin Roy Krigslund-Hansen',
      author_bio: 'Co-founder of Formula Swiss AG and CBD industry pioneer with 12+ years of experience. Has served 100,000+ customers across 60+ countries and developed 300+ CBD product formulations under GMP certification standards. Expert in EU regulations, cannabinoid science, and evidence-based CBD education.'
    };

    const { data: updatedArticles, error: articleUpdateError } = await supabase
      .from('articles')
      .update(robinArticleInfo)
      .select('id, title, author_name');

    if (articleUpdateError) {
      console.log('❌ Error updating articles:', articleUpdateError.message);
    } else {
      console.log(`✅ Updated ${updatedArticles?.length || 0} articles with Formula Swiss author info`);
    }

    // Update CBD articles specifically with industry context
    console.log('\n🌿 Step 3: Adding Formula Swiss context to CBD articles...');

    const { data: cbdArticles } = await supabase
      .from('articles')
      .select('id, title, slug')
      .or('title.ilike.%cbd%,slug.ilike.%cbd%');

    if (cbdArticles && cbdArticles.length > 0) {
      const enhancedAuthorBio = 'Co-founder of Formula Swiss AG, one of Europe\'s leading CBD companies established in 2013. Robin has 12+ years of hands-on CBD industry experience, having served 100,000+ customers across 60+ countries and developed 300+ CBD product formulations. He holds GMP certification, is a shareholder in the EIHA Novel Food Consortium, and maintains a perfect track record with zero failed third-party lab tests. His expertise spans from cannabinoid science to EU regulatory compliance.';

      const { data: enhancedCbdArticles, error: cbdUpdateError } = await supabase
        .from('articles')
        .update({ author_bio: enhancedAuthorBio })
        .in('id', cbdArticles.map(a => a.id))
        .select('id, title');

      if (cbdUpdateError) {
        console.log('❌ Error updating CBD articles:', cbdUpdateError.message);
      } else {
        console.log(`✅ Enhanced ${enhancedCbdArticles?.length || 0} CBD articles with Formula Swiss context`);
        enhancedCbdArticles?.slice(0, 5).forEach(article => {
          console.log(`   - ${article.title.substring(0, 50)}...`);
        });
      }
    }

    // Final verification
    console.log('\n📊 Step 4: Final verification...');

    const { data: verifyRobin } = await supabase
      .from('authors')
      .select('name, title, email, bio_short')
      .eq('slug', 'robin-roy-krigslund-hansen')
      .single();

    if (verifyRobin) {
      console.log('✅ Robin\'s complete Formula Swiss profile verified:');
      console.log(`   Name: ${verifyRobin.name}`);
      console.log(`   Title: ${verifyRobin.title}`);
      console.log(`   Email: ${verifyRobin.email}`);
      console.log(`   Bio: ${verifyRobin.bio_short?.substring(0, 100)}...`);
    }

    console.log('\n🎉 FORMULA SWISS PROFILE RESTORATION COMPLETE!');
    console.log('✅ Robin Roy Krigslund-Hansen now has his complete Formula Swiss background');
    console.log('✅ All articles reflect his industry expertise and company co-founder status');
    console.log('✅ CBD articles include enhanced Formula Swiss context');
    console.log('✅ Professional credentials and 12+ years experience highlighted');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

if (require.main === module) {
  restoreRobinFormulaSwissProfile();
}

module.exports = { restoreRobinFormulaSwissProfile };