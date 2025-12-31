const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://jgivzyszbpyuvqfmldin.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTagsSystem() {
  console.log('🚀 Setting up Phase 2B: Tag System for CBD Portal');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create kb_tags table
    console.log('📋 Creating kb_tags table...');

    const createTagsTable = `
      CREATE TABLE IF NOT EXISTS kb_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(20) DEFAULT 'gray',
        language VARCHAR(10) DEFAULT 'en',
        article_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await supabase.rpc('exec_sql', { sql: createTagsTable });
    console.log('✅ kb_tags table created');

    // Step 2: Create kb_article_tags junction table
    console.log('📋 Creating kb_article_tags junction table...');

    const createArticleTagsTable = `
      CREATE TABLE IF NOT EXISTS kb_article_tags (
        article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES kb_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (article_id, tag_id)
      );
    `;

    await supabase.rpc('exec_sql', { sql: createArticleTagsTable });
    console.log('✅ kb_article_tags table created');

    // Step 3: Create indexes
    console.log('📋 Creating performance indexes...');

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_tags_slug ON kb_tags(slug);
      CREATE INDEX IF NOT EXISTS idx_tags_language ON kb_tags(language);
      CREATE INDEX IF NOT EXISTS idx_article_tags_article ON kb_article_tags(article_id);
      CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON kb_article_tags(tag_id);
    `;

    await supabase.rpc('exec_sql', { sql: createIndexes });
    console.log('✅ Performance indexes created');

    // Step 4: Enable RLS
    console.log('🔒 Enabling Row Level Security...');

    const enableRLS = `
      ALTER TABLE kb_tags ENABLE ROW LEVEL SECURITY;
      ALTER TABLE kb_article_tags ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public read tags" ON kb_tags;
      DROP POLICY IF EXISTS "Public read article_tags" ON kb_article_tags;

      CREATE POLICY "Public read tags" ON kb_tags FOR SELECT USING (true);
      CREATE POLICY "Public read article_tags" ON kb_article_tags FOR SELECT USING (true);
    `;

    await supabase.rpc('exec_sql', { sql: enableRLS });
    console.log('✅ Row Level Security enabled');

    // Step 5: Create trigger function for counting
    console.log('📋 Creating tag count trigger...');

    const createTriggerFunction = `
      CREATE OR REPLACE FUNCTION update_tag_counts()
      RETURNS TRIGGER AS $
      BEGIN
        -- Update old tag count
        IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
          UPDATE kb_tags
          SET article_count = (
            SELECT COUNT(*) FROM kb_article_tags WHERE tag_id = OLD.tag_id
          )
          WHERE id = OLD.tag_id;
        END IF;

        -- Update new tag count
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
          UPDATE kb_tags
          SET article_count = (
            SELECT COUNT(*) FROM kb_article_tags WHERE tag_id = NEW.tag_id
          )
          WHERE id = NEW.tag_id;
        END IF;

        RETURN COALESCE(NEW, OLD);
      END;
      $ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_update_tag_counts ON kb_article_tags;

      CREATE TRIGGER trigger_update_tag_counts
      AFTER INSERT OR UPDATE OR DELETE ON kb_article_tags
      FOR EACH ROW EXECUTE FUNCTION update_tag_counts();
    `;

    await supabase.rpc('exec_sql', { sql: createTriggerFunction });
    console.log('✅ Tag count trigger created');

    // Step 6: Insert comprehensive tags
    console.log('🏷️ Inserting comprehensive tag collection...');

    const tags = [
      // Health conditions
      { name: 'Anxiety', slug: 'anxiety', description: 'Articles related to CBD and anxiety disorders', color: 'blue' },
      { name: 'Depression', slug: 'depression', description: 'Articles about CBD for depression and mood', color: 'indigo' },
      { name: 'Stress', slug: 'stress', description: 'Content about CBD for stress management', color: 'purple' },
      { name: 'PTSD', slug: 'ptsd', description: 'CBD research for post-traumatic stress disorder', color: 'violet' },
      { name: 'Sleep', slug: 'sleep', description: 'Articles about CBD for sleep and insomnia', color: 'blue' },
      { name: 'Insomnia', slug: 'insomnia', description: 'CBD for treating insomnia specifically', color: 'indigo' },
      { name: 'Pain', slug: 'pain', description: 'CBD for pain management and relief', color: 'red' },
      { name: 'Chronic Pain', slug: 'chronic-pain', description: 'Long-term pain management with CBD', color: 'red' },
      { name: 'Inflammation', slug: 'inflammation', description: 'Anti-inflammatory properties of CBD', color: 'orange' },
      { name: 'Arthritis', slug: 'arthritis', description: 'CBD for arthritis and joint pain', color: 'orange' },
      { name: 'Fibromyalgia', slug: 'fibromyalgia', description: 'CBD research for fibromyalgia', color: 'pink' },
      { name: 'Migraine', slug: 'migraine', description: 'CBD for migraine and headache relief', color: 'red' },
      { name: 'Epilepsy', slug: 'epilepsy', description: 'CBD for seizures and epilepsy', color: 'yellow' },
      { name: 'Seizures', slug: 'seizures', description: 'CBD effects on seizure disorders', color: 'yellow' },
      { name: 'Nausea', slug: 'nausea', description: 'CBD for nausea and vomiting', color: 'green' },
      { name: 'Cancer', slug: 'cancer', description: 'CBD research related to cancer', color: 'gray' },
      { name: 'Multiple Sclerosis', slug: 'multiple-sclerosis', description: 'CBD for MS symptoms', color: 'teal' },
      { name: 'Parkinson\'s', slug: 'parkinsons', description: 'CBD research for Parkinson\'s disease', color: 'cyan' },
      { name: 'Alzheimer\'s', slug: 'alzheimers', description: 'CBD and Alzheimer\'s disease research', color: 'cyan' },
      { name: 'ADHD', slug: 'adhd', description: 'CBD for attention disorders', color: 'orange' },
      { name: 'Addiction', slug: 'addiction', description: 'CBD for addiction recovery', color: 'gray' },
      { name: 'Skin Conditions', slug: 'skin-conditions', description: 'CBD for skin health', color: 'pink' },
      { name: 'Eczema', slug: 'eczema', description: 'CBD for eczema treatment', color: 'pink' },
      { name: 'Acne', slug: 'acne', description: 'CBD for acne and skin inflammation', color: 'rose' },
      { name: 'IBS', slug: 'ibs', description: 'CBD for irritable bowel syndrome', color: 'green' },
      { name: 'Crohn\'s Disease', slug: 'crohns-disease', description: 'CBD for Crohn\'s and digestive disorders', color: 'green' },
      { name: 'Heart Health', slug: 'heart-health', description: 'CBD and cardiovascular health', color: 'red' },
      { name: 'Diabetes', slug: 'diabetes', description: 'CBD research for diabetes', color: 'amber' },
      { name: 'Glaucoma', slug: 'glaucoma', description: 'CBD for eye health and glaucoma', color: 'emerald' },

      // Product types
      { name: 'CBD Oil', slug: 'cbd-oil', description: 'Articles about CBD oil products', color: 'green' },
      { name: 'CBD Capsules', slug: 'cbd-capsules', description: 'Information about CBD capsules', color: 'green' },
      { name: 'CBD Topicals', slug: 'cbd-topicals', description: 'CBD creams, balms, and lotions', color: 'green' },
      { name: 'CBD Edibles', slug: 'cbd-edibles', description: 'CBD gummies and food products', color: 'green' },
      { name: 'CBD Vape', slug: 'cbd-vape', description: 'Vaping CBD products', color: 'green' },
      { name: 'Full Spectrum', slug: 'full-spectrum', description: 'Full spectrum CBD products', color: 'emerald' },
      { name: 'Broad Spectrum', slug: 'broad-spectrum', description: 'THC-free broad spectrum CBD', color: 'teal' },
      { name: 'CBD Isolate', slug: 'cbd-isolate', description: 'Pure CBD isolate products', color: 'cyan' },

      // Science & research
      { name: 'Research', slug: 'research', description: 'Scientific research and studies', color: 'purple' },
      { name: 'Clinical Trials', slug: 'clinical-trials', description: 'CBD clinical trial information', color: 'violet' },
      { name: 'Endocannabinoid System', slug: 'endocannabinoid-system', description: 'ECS-related content', color: 'indigo' },
      { name: 'Cannabinoids', slug: 'cannabinoids', description: 'Information about different cannabinoids', color: 'green' },
      { name: 'Terpenes', slug: 'terpenes', description: 'Terpene profiles and effects', color: 'lime' },

      // Practical info
      { name: 'Dosage', slug: 'dosage', description: 'CBD dosing guidelines', color: 'blue' },
      { name: 'Side Effects', slug: 'side-effects', description: 'Potential CBD side effects', color: 'amber' },
      { name: 'Drug Interactions', slug: 'drug-interactions', description: 'CBD medication interactions', color: 'red' },
      { name: 'Beginner Guide', slug: 'beginner-guide', description: 'Content for CBD newcomers', color: 'sky' },
      { name: 'How To', slug: 'how-to', description: 'Practical guides and tutorials', color: 'cyan' },
      { name: 'Buying Guide', slug: 'buying-guide', description: 'Tips for purchasing CBD', color: 'emerald' },
      { name: 'Quality', slug: 'quality', description: 'CBD quality and testing info', color: 'green' },

      // Legal
      { name: 'Legal', slug: 'legal', description: 'CBD legality information', color: 'gray' },
      { name: 'FDA', slug: 'fda', description: 'FDA regulations and news', color: 'slate' },
      { name: 'Regulations', slug: 'regulations', description: 'CBD regulatory information', color: 'zinc' }
    ];

    for (const tag of tags) {
      try {
        await supabase
          .from('kb_tags')
          .upsert(tag, { onConflict: 'slug' });
      } catch (error) {
        console.warn(`⚠️  Error inserting tag ${tag.name}:`, error.message);
      }
    }

    console.log(`✅ Inserted ${tags.length} comprehensive tags`);

    // Step 7: Verify setup
    console.log('🔍 Verifying tag system setup...');

    const { data: tagCount, error: countError } = await supabase
      .from('kb_tags')
      .select('id')
      .eq('language', 'en');

    if (countError) {
      console.error('❌ Error verifying tags:', countError);
      return;
    }

    console.log(`✅ Verified: ${tagCount?.length || 0} tags in system`);

    // Success summary
    console.log('\n🎉 Phase 2B TAG SYSTEM SETUP COMPLETE');
    console.log('=' .repeat(50));
    console.log(`📊 Database Tables: kb_tags, kb_article_tags`);
    console.log(`🏷️ Tags Created: ${tags.length} comprehensive tags`);
    console.log(`📈 Categories: Health Conditions, Products, Science, Practical, Legal`);
    console.log(`🔗 Junction Table: Ready for article-tag relationships`);
    console.log(`⚡ Triggers: Auto-counting implemented`);
    console.log(`🔒 Security: RLS enabled for public read access`);
    console.log('\n✅ Ready for frontend component implementation!');

  } catch (error) {
    console.error('❌ Error setting up tag system:', error);
    process.exit(1);
  }
}

// Execute the setup
setupTagsSystem();