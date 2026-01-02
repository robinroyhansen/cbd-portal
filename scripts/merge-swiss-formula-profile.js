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

async function mergeSwissFormulaProfile() {
  console.log('🇨🇭 MERGING SWISS-BASED PROFILE WITH FORMULA SWISS BACKGROUND');
  console.log('='.repeat(70));

  const bio_short = `Swiss-based entrepreneur and CBD industry pioneer who co-founded Formula Swiss AG in 2013, establishing one of Europe's leading CBD companies. With over 12 years of hands-on experience, he has served 100,000+ customers across 60+ countries and developed 300+ CBD product formulations under GMP certification standards.`;

  const bio_full = `Robin Roy Krigslund-Hansen is a Swiss-based entrepreneur and CBD industry pioneer who co-founded Formula Swiss AG in 2013, establishing one of Europe's most trusted CBD companies. Operating from Switzerland, Robin has built an extensive track record in the cannabinoid industry spanning over 12 years.

**Company Leadership & Achievements**
As Co-founder of Formula Swiss AG and related entities (Formula Swiss UK Ltd., Formula Swiss Medical Ltd., Formula Swiss Europe Ltd.), Robin has:
• Served 100,000+ customers across 60+ countries
• Developed 300+ different CBD product formulations
• Invested €1+ million in EU product compliance and registrations
• Maintained perfect track record: Zero failed third-party lab tests
• Achieved GMP (Good Manufacturing Practice) certification
• Obtained ISO 22716-2007 certification (highest cosmetic standards)

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
Robin is an active member of leading industry associations including:
- European Industrial Hemp Association (EIHA)
- EIHA Novel Food Consortium (shareholder)
- Swiss Medical Cannabis Association (MEDCAN)
- Swiss Hemp Producer Association (IG Hanf)
- Arge Canna (Austria)

**Independent Research & Education**
Through this portal, Robin shares his decade-plus of practical experience to provide accurate, evidence-based information about CBD products, helping consumers separate fact from marketing hype.

*Disclaimer: The views and opinions expressed in Robin's articles are his personal expert opinions based on his extensive industry experience and independent research. They do not represent the official position of Formula Swiss AG or any other organisation.*`;

  try {
    // Check if Robin exists
    const { data: existing } = await supabase
      .from('authors')
      .select('*')
      .eq('slug', 'robin-roy-krigslund-hansen')
      .single();

    if (existing) {
      // Update existing profile with merged content
      const { data, error } = await supabase
        .from('authors')
        .update({
          title: 'CBD Industry Pioneer & Co-founder of Formula Swiss AG',
          bio_short: bio_short,
          bio_full: bio_full,
          credentials: [
            'Co-founder, Formula Swiss AG (2013-present)',
            '12+ years in CBD industry',
            'Developed 300+ CBD product formulations',
            'GMP & ISO 22716 certified operations',
            'EU Novel Food Consortium shareholder',
            'University research collaborations',
            'Zero failed third-party lab tests',
            'Served 100,000+ customers across 60+ countries',
            'Operations in 16+ European countries',
            '100% renewable energy production',
            'EIHA member (European Industrial Hemp Association)',
            'MEDCAN supporter (Swiss Medical Cannabis Association)',
            'Organic cultivation expertise',
            'CO2 extraction specialist'
          ],
          expertise_areas: [
            'Formula Swiss Operations',
            'CBD Industry Leadership',
            'CBD Oils (Full-spectrum & Broad-spectrum)',
            'CBG & CBN Cannabinoids',
            'CBD for Pets (Dogs, Cats, Horses)',
            'CBD Skincare & Cosmetics',
            'CO2 Extraction Methods',
            'GMP Manufacturing Standards',
            'EU Novel Food Regulations',
            'Third-party Lab Testing',
            'Organic Hemp Cultivation',
            'European CBD Market',
            'Product Quality Control',
            'Cannabinoid Science',
            'International Market Expansion'
          ],
          location: 'Zug, Switzerland',
          social_links: {
            website: 'https://formulaswiss.com',
            company: 'https://formulaswiss.com'
          },
          updated_at: new Date().toISOString()
        })
        .eq('slug', 'robin-roy-krigslund-hansen')
        .select();

      if (error) {
        console.error('❌ Error updating profile:', error);
        return;
      }

      console.log('✅ Successfully merged Swiss-based + Formula Swiss profile');
    } else {
      console.log('❌ Robin profile not found');
      return;
    }

    console.log('📝 Profile now includes:');
    console.log('   • Swiss-based entrepreneur focus');
    console.log('   • Formula Swiss AG co-founder status');
    console.log('   • Complete company background (AG, UK Ltd, Medical Ltd, Europe Ltd)');
    console.log('   • 100,000+ customers across 60+ countries');
    console.log('   • 300+ product formulations developed');
    console.log('   • Perfect lab testing track record');
    console.log('   • All Swiss industry associations maintained');

  } catch (error) {
    console.error('❌ Script error:', error);
  }

  console.log('\n✅ Swiss + Formula Swiss profile merge complete!');
}

mergeSwissFormulaProfile();