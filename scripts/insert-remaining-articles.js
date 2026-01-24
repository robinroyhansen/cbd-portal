const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

const articles = [
  // Safety & Quality articles
  { slug: 'rare-cbd-side-effects', title: 'Rare CBD Side Effects: Uncommon Reactions to Know', type: 'educational', topics: ['safety', 'side-effects'] },
  { slug: 'cbd-prescription-medications', title: 'CBD and Prescription Medications: Understanding Interactions', type: 'educational', topics: ['safety', 'drug-interactions'] },
  { slug: 'cbd-blood-thinners', title: 'CBD and Blood Thinners: Critical Information', type: 'educational', topics: ['safety', 'drug-interactions'] },
  { slug: 'cbd-and-antibiotics', title: 'CBD and Antibiotics: What You Should Know', type: 'educational', topics: ['safety', 'drug-interactions'] },
  { slug: 'cbd-long-term-safety', title: 'CBD Long-Term Safety: What We Know', type: 'educational', topics: ['safety', 'research'] },
  { slug: 'cbd-contraindications', title: 'CBD Contraindications: When to Avoid CBD', type: 'educational', topics: ['safety', 'medical'] },
  { slug: 'cbd-potency-testing', title: 'CBD Potency Testing: Understanding Cannabinoid Analysis', type: 'educational', topics: ['quality', 'testing'] },
  { slug: 'cbd-contaminant-testing', title: 'CBD Contaminant Testing: Ensuring Product Safety', type: 'educational', topics: ['quality', 'testing'] },
  { slug: 'heavy-metals-cbd', title: 'Heavy Metals in CBD: Understanding the Risk', type: 'educational', topics: ['quality', 'contaminants'] },
  { slug: 'pesticides-cbd', title: 'Pesticides in CBD Products: What You Need to Know', type: 'educational', topics: ['quality', 'contaminants'] },
  { slug: 'residual-solvents-cbd', title: 'Residual Solvents in CBD: Extraction Safety', type: 'educational', topics: ['quality', 'extraction'] },
  { slug: 'low-quality-cbd', title: 'Low-Quality CBD: How to Identify and Avoid', type: 'educational-guide', topics: ['quality', 'buying-guide'] },
  { slug: 'check-if-cbd-real', title: 'How to Check if Your CBD Is Real', type: 'educational-guide', topics: ['quality', 'buying-guide'] },
  { slug: 'cbd-source-quality', title: 'CBD Source Quality: From Seed to Product', type: 'educational', topics: ['quality', 'hemp'] },
  { slug: 'cbd-batch-testing', title: 'CBD Batch Testing: Why Every Batch Matters', type: 'educational', topics: ['quality', 'testing'] },

  // Hemp & Cultivation articles
  { slug: 'what-is-hemp-plant', title: 'What Is Hemp? Understanding the Plant', type: 'educational', topics: ['hemp', 'basics'] },
  { slug: 'hemp-vs-cannabis-plant', title: 'Hemp vs Cannabis: Understanding the Difference', type: 'educational', topics: ['hemp', 'basics'] },
  { slug: 'hemp-farming-europe', title: 'Hemp Farming in Europe: Industry Overview', type: 'educational', topics: ['hemp', 'industry'] },
  { slug: 'high-cbd-hemp-strains', title: 'High-CBD Hemp Strains: Popular Varieties', type: 'educational', topics: ['hemp', 'strains'] },
  { slug: 'seed-to-sale-tracking', title: 'Seed-to-Sale Tracking in CBD: Supply Chain Transparency', type: 'educational', topics: ['quality', 'industry'] },

  // Legal articles
  { slug: 'traveling-with-cbd-europe', title: 'Travelling with CBD in Europe: Complete Guide', type: 'legal-guide', topics: ['legal', 'travel'] },
  { slug: 'import-export-cbd', title: 'Import and Export of CBD: International Trade Guide', type: 'legal-guide', topics: ['legal', 'business'] },
  { slug: 'workplace-drug-testing-cbd', title: 'Workplace Drug Testing and CBD: What You Need to Know', type: 'educational-guide', topics: ['legal', 'drug-testing'] },
  { slug: 'marketing-claims-cbd', title: 'CBD Marketing Claims: Regulations and Reality', type: 'educational', topics: ['legal', 'industry'] },

  // Science articles
  { slug: 'cbd-and-dopamine', title: 'CBD and Dopamine: Understanding the Connection', type: 'educational', topics: ['science', 'neuroscience'] },
  { slug: 'cbd-anti-inflammatory-mechanisms', title: "CBD's Anti-Inflammatory Mechanisms: How It Works", type: 'educational', topics: ['science', 'inflammation'] },
  { slug: 'cbd-antioxidant-properties', title: "CBD's Antioxidant Properties: Scientific Overview", type: 'educational', topics: ['science', 'antioxidant'] },
  { slug: 'cbd-homeostasis', title: 'CBD and Homeostasis: Supporting Body Balance', type: 'educational', topics: ['science', 'ecs'] },
  { slug: 'understanding-cbd-studies', title: 'Understanding CBD Studies: A Guide to Research', type: 'educational-guide', topics: ['science', 'research'] },
  { slug: 'why-cbd-works-differently', title: 'Why CBD Works Differently for Different People', type: 'educational', topics: ['science', 'individual-response'] },
  { slug: 'cbd-and-genetics', title: 'CBD and Genetics: How Your Genes Affect Response', type: 'educational', topics: ['science', 'genetics'] },
  { slug: 'cbd-research-limitations', title: 'CBD Research Limitations: Understanding the Gaps', type: 'educational', topics: ['science', 'research'] },
  { slug: 'cbd-placebo-effect', title: 'CBD and the Placebo Effect: Understanding the Relationship', type: 'educational', topics: ['science', 'research'] },
  { slug: 'future-of-cbd-research', title: 'The Future of CBD Research: What\'s Coming', type: 'educational', topics: ['science', 'research'] },
  { slug: 'how-to-read-cbd-research', title: 'How to Read CBD Research: A Practical Guide', type: 'educational-guide', topics: ['science', 'research'] },
  { slug: 'key-cbd-anxiety-studies', title: 'Key CBD Anxiety Studies: Research Overview', type: 'educational', topics: ['science', 'anxiety', 'research'] },
  { slug: 'key-cbd-pain-studies', title: 'Key CBD Pain Studies: Research Overview', type: 'educational', topics: ['science', 'pain', 'research'] },
  { slug: 'key-cbd-sleep-studies', title: 'Key CBD Sleep Studies: Research Overview', type: 'educational', topics: ['science', 'sleep', 'research'] },
  { slug: 'key-cbd-epilepsy-studies', title: 'Key CBD Epilepsy Studies: The Strongest Evidence', type: 'educational', topics: ['science', 'epilepsy', 'research'] }
];

async function insertArticles() {
  console.log(`Inserting ${articles.length} articles...`);
  let inserted = 0;
  let errors = 0;

  for (const article of articles) {
    try {
      const filePath = path.join(__dirname, '..', 'articles', `${article.slug}.md`);

      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${article.slug}.md`);
        errors++;
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');

      // Extract first paragraph after Quick Summary for excerpt
      const excerptMatch = content.match(/## Quick Summary\n\n([^\n]+)/);
      const excerpt = excerptMatch ? excerptMatch[1].substring(0, 200) : article.title;

      const { error } = await supabase.from('kb_articles').insert({
        slug: article.slug,
        title: article.title,
        content: content,
        excerpt: excerpt,
        article_type: article.type,
        related_topics: article.topics,
        status: 'published',
        language: 'en',
        reading_time: Math.ceil(content.split(/\s+/).length / 200),
        meta_title: article.title,
        meta_description: excerpt
      });

      if (error) {
        if (error.code === '23505') {
          console.log(`Already exists: ${article.slug}`);
        } else {
          console.log(`Error inserting ${article.slug}: ${error.message}`);
          errors++;
        }
      } else {
        console.log(`Inserted: ${article.slug}`);
        inserted++;
      }
    } catch (e) {
      console.log(`Error processing ${article.slug}: ${e.message}`);
      errors++;
    }
  }

  // Get final count
  const { count } = await supabase
    .from('kb_articles')
    .select('*', { count: 'exact', head: true });

  console.log(`\nDone! Inserted: ${inserted}, Errors: ${errors}`);
  console.log(`Total articles in database: ${count}`);
}

insertArticles();
