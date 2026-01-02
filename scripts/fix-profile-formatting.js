const { createClient } = require('@supabase/supabase-js');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE environment variables are required');
  console.log('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixProfileFormatting() {
  console.log('📝 FIXING PROFILE FORMATTING');
  console.log('='.repeat(50));

  const bio_full = `Robin Roy Krigslund-Hansen is a Swiss-based entrepreneur and CBD industry pioneer who co-founded Formula Swiss AG in 2013, establishing one of Europe's most trusted CBD companies. Operating from Switzerland, Robin has built an extensive track record in the cannabinoid industry spanning over 12 years.

**Company Leadership & Achievements**
As Co-founder of Formula Swiss AG and related entities (Formula Swiss UK Ltd., Formula Swiss Medical Ltd., Formula Swiss Europe Ltd.), Robin has served over 100,000 customers across 60+ countries and developed 300+ different CBD product formulations. He has invested €1+ million in EU product compliance and registrations while maintaining a perfect track record with zero failed third-party lab tests. Under his leadership, the companies have achieved GMP (Good Manufacturing Practice) certification and obtained ISO 22716-2007 certification, representing the highest standards in the industry.

**Product Development & Manufacturing**
Robin has overseen the development of over 300 different CBD products, including full-spectrum and broad-spectrum CBD oils, CBG oils, CBN oils, CBD skincare, and pet products. He has direct experience with CO2 extraction processes, winterization, and decarboxylation techniques that ensure optimal cannabinoid profiles.

**Quality Standards & Certifications**
Under Robin's leadership, his companies have achieved GMP (Good Manufacturing Practice) and ISO 22716-2007 certifications — the highest standards in the industry. Every production batch undergoes third-party laboratory testing in Switzerland, with a perfect track record of zero failed tests.

**Regulatory Expertise**
Robin has navigated CBD regulations across 16+ European countries and invested significantly in EU Novel Food compliance. He is a shareholder in the EIHA Novel Food Consortium, a €3.5 million initiative to establish comprehensive safety data for CBD products in Europe.

**Scientific Research Collaboration**
Robin has established research partnerships with the University of Bologna's Department of Veterinary Medical Sciences for CBD studies in animals, and has supported human clinical research including double-blind, placebo-controlled trials in the Netherlands.

**Sustainability Commitment**
Robin's operations use 100% renewable energy (solar and hydro), state-of-the-art LED growing technology, and follow organic cultivation principles without pesticides or artificial fertilizers. Hemp's natural CO2 absorption makes his operations carbon-negative.

**Industry Leadership**
Robin is an active member of leading industry associations including the European Industrial Hemp Association (EIHA), EIHA Novel Food Consortium (as a shareholder), Swiss Medical Cannabis Association (MEDCAN), Swiss Hemp Producer Association (IG Hanf), and Arge Canna (Austria).

**Independent Research & Education**
Through this portal, Robin shares his decade-plus of practical experience to provide accurate, evidence-based information about CBD products, helping consumers separate fact from marketing hype.

*Disclaimer: The views and opinions expressed in Robin's articles are his personal expert opinions based on his extensive industry experience and independent research. They do not represent the official position of Formula Swiss AG or any other organisation.*`;

  try {
    // Update Robin's profile with properly formatted content
    const { data, error } = await supabase
      .from('authors')
      .update({
        bio_full: bio_full,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'robin-roy-krigslund-hansen')
      .select();

    if (error) {
      console.error('❌ Error updating profile:', error);
      return;
    }

    console.log('✅ Successfully fixed profile formatting');
    console.log('📝 Changes made:');
    console.log('   • Converted bullet points to proper prose');
    console.log('   • Maintained all achievement information');
    console.log('   • Improved readability and flow');

  } catch (error) {
    console.error('❌ Script error:', error);
  }

  console.log('\n✅ Profile formatting fix complete!');
}

fixProfileFormatting();