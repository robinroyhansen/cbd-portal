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

async function updateRobinSwissProfile() {
  console.log('🇨🇭 UPDATING ROBIN\'S PROFILE TO FOCUS ON SWISS BACKGROUND');
  console.log('='.repeat(60));

  const bio_short = `Swiss-based entrepreneur who has been pioneering the European CBD industry since 2013. With over a decade of hands-on experience in product development, manufacturing, and regulatory compliance, he shares evidence-based insights to help consumers make informed decisions.`;

  const bio_full = `Robin Roy Krigslund-Hansen is a Swiss-based entrepreneur and CBD industry pioneer who founded his first CBD company in 2013, making him one of the earliest players in the European cannabinoid market.

Over the past 12 years, Robin has built extensive hands-on experience across every aspect of the CBD industry — from organic hemp cultivation and CO2 extraction to product formulation, GMP manufacturing, and navigating the complex European regulatory landscape.

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

Through this portal, Robin shares his decade-plus of practical experience to provide accurate, evidence-based information about CBD products, helping consumers separate fact from marketing hype.`;

  try {
    // First, check if Robin exists
    const { data: existing } = await supabase
      .from('authors')
      .select('*')
      .eq('slug', 'robin-roy-krigslund-hansen')
      .single();

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from('authors')
        .update({
          bio_short: bio_short,
          bio_full: bio_full,
          updated_at: new Date().toISOString()
        })
        .eq('slug', 'robin-roy-krigslund-hansen')
        .select();

      if (error) {
        console.error('❌ Error updating profile:', error);
        return;
      }

      console.log('✅ Successfully updated Robin\'s existing profile');
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('authors')
        .insert([{
          slug: 'robin-roy-krigslund-hansen',
          name: 'Robin Roy Krigslund-Hansen',
          title: 'CBD Industry Pioneer & Entrepreneur',
          bio_short: bio_short,
          bio_full: bio_full,
          credentials: [
            '12+ years in CBD industry (since 2013)',
            'Developed 300+ CBD product formulations',
            'GMP & ISO 22716 certified operations',
            'EU Novel Food Consortium shareholder',
            'University research collaborations',
            'Zero failed third-party lab tests',
            'Operations in 16+ European countries',
            '100% renewable energy production',
            'EIHA member (European Industrial Hemp Association)',
            'MEDCAN supporter (Swiss Medical Cannabis Association)',
            'Organic cultivation expertise',
            'CO2 extraction specialist'
          ],
          expertise_areas: [
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
            'Cannabinoid Science'
          ],
          years_experience: 12,
          location: 'Zug, Switzerland',
          social_links: {},
          is_primary: true,
          is_verified: true,
          is_active: true,
          display_order: 1
        }])
        .select();

      if (error) {
        console.error('❌ Error creating profile:', error);
        return;
      }

      console.log('✅ Successfully created Robin\'s new profile');
    }

    console.log('📝 Profile now focuses on Swiss-based background');
    console.log('🔄 Changes applied:');
    console.log('   • "Danish entrepreneur" → "Swiss-based entrepreneur"');
    console.log('   • Emphasis on Swiss operations and location');
    console.log('   • Maintained all credentials and expertise');

  } catch (error) {
    console.error('❌ Script error:', error);
  }

  console.log('\n✅ Swiss profile update complete!');
}

updateRobinSwissProfile();