import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Extended keyword mappings for conditions
const CONDITION_KEYWORDS = {
  anxiety: ['anxiety', 'anxious', 'nervous', 'panic', 'worry', 'fear', 'phobia', 'social anxiety', 'gad', 'generalized anxiety'],
  sleep: ['sleep', 'insomnia', 'rest', 'bedtime', 'night', 'circadian', 'melatonin', 'tired', 'fatigue'],
  stress: ['stress', 'burnout', 'overwhelm', 'tension', 'pressure', 'relax'],
  depression: ['depression', 'depressed', 'mood', 'sad', 'melancholy', 'seasonal affective'],
  chronic_pain: ['chronic pain', 'pain management', 'pain relief', 'persistent pain'],
  neuropathic_pain: ['neuropathic', 'nerve pain', 'nerve damage', 'neuralgia'],
  inflammation: ['inflammation', 'inflammatory', 'anti-inflammatory', 'swelling'],
  arthritis: ['arthritis', 'joint pain', 'joint health', 'rheumatoid', 'osteoarthritis'],
  fibromyalgia: ['fibromyalgia', 'fibro'],
  migraines: ['migraine', 'headache', 'head pain'],
  epilepsy: ['epilepsy', 'seizure', 'convulsion'],
  ms: ['multiple sclerosis', 'ms ', ' ms'],
  parkinsons: ['parkinson', 'tremor'],
  alzheimers: ['alzheimer', 'dementia', 'cognitive decline', 'memory loss'],
  adhd: ['adhd', 'attention deficit', 'focus', 'concentration', 'hyperactivity'],
  autism: ['autism', 'autistic', 'spectrum disorder', 'asd'],
  ptsd: ['ptsd', 'post-traumatic', 'trauma', 'traumatic stress'],
  schizophrenia: ['schizophrenia', 'psychosis', 'psychotic'],
  addiction: ['addiction', 'substance', 'withdrawal', 'recovery', 'sobriety'],
  nausea: ['nausea', 'vomiting', 'motion sickness', 'upset stomach', 'queasy'],
  ibs: ['ibs', 'irritable bowel', 'digestive', 'gut health', 'bowel'],
  crohns: ['crohn', 'ibd', 'inflammatory bowel', 'colitis'],
  cancer: ['cancer', 'tumor', 'oncology', 'malignant'],
  chemo_side_effects: ['chemotherapy', 'chemo'],
  diabetes: ['diabetes', 'diabetic', 'blood sugar', 'glucose', 'insulin'],
  obesity: ['obesity', 'weight', 'overweight', 'fat loss'],
  heart: ['heart', 'cardiac', 'cardiovascular'],
  blood_pressure: ['blood pressure', 'hypertension', 'hypotension'],
  glaucoma: ['glaucoma', 'eye pressure', 'intraocular'],
  acne: ['acne', 'pimple', 'breakout', 'blemish'],
  eczema: ['eczema', 'dermatitis', 'atopic'],
  psoriasis: ['psoriasis', 'autoimmune skin'],
  aging: ['aging', 'senior', 'elderly', 'older adult', 'over 50', 'menopause', 'longevity'],
  womens: ['women', 'menstrual', 'period', 'pms', 'hormonal', 'endometriosis', 'menopause', 'hot flash', 'cramps'],
  veterinary: ['pet', 'dog', 'cat', 'animal', 'canine', 'feline', 'horse', 'equine', 'bird', 'rabbit', 'hamster', 'ferret', 'guinea pig'],
  athletic: ['athlete', 'sport', 'runner', 'cyclist', 'swimmer', 'weightlifter', 'workout', 'exercise', 'recovery', 'performance', 'muscle'],
  covid: ['covid', 'coronavirus', 'long covid', 'post-covid'],
  tourettes: ['tourette', 'tic'],
  neurological: ['neurological', 'brain', 'neuron', 'nervous system'],
};

async function linkArticles() {
  console.log('Fetching conditions...');
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, display_name')
    .eq('is_published', true);

  console.log(`Found ${conditions.length} conditions\n`);

  console.log('Fetching unlinked articles...');
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, title, slug')
    .is('condition_slug', null)
    .eq('status', 'published');

  console.log(`Found ${articles.length} unlinked articles\n`);

  let linkedCount = 0;
  const updates = [];

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();

    let bestMatch = null;
    let bestScore = 0;

    for (const condition of conditions) {
      const keywords = CONDITION_KEYWORDS[condition.slug] || [];
      const conditionName = condition.name.toLowerCase();
      const conditionDisplay = (condition.display_name || '').toLowerCase();

      let score = 0;

      // Check keyword matches
      for (const keyword of keywords) {
        if (titleLower.includes(keyword)) {
          // Stronger match if it's a "CBD for X" pattern
          if (titleLower.includes(`cbd for ${keyword}`) || titleLower.includes(`cbd and ${keyword}`)) {
            score += 15;
          } else {
            score += 5;
          }
        }
        if (slugLower.includes(keyword.replace(/\s+/g, '-'))) {
          score += 3;
        }
      }

      // Check condition name/display matches
      if (titleLower.includes(conditionName)) {
        score += 10;
      }
      if (conditionDisplay && titleLower.includes(conditionDisplay)) {
        score += 10;
      }

      // Check slug matches
      if (slugLower.includes(condition.slug.replace(/_/g, '-'))) {
        score += 8;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = condition;
      }
    }

    // Lower threshold to 3 to catch more articles
    if (bestMatch && bestScore >= 3) {
      updates.push({
        id: article.id,
        title: article.title,
        condition_slug: bestMatch.slug,
        score: bestScore
      });
    }
  }

  console.log(`Found ${updates.length} articles to link\n`);

  // Sort by score descending and show preview
  updates.sort((a, b) => b.score - a.score);

  console.log('Sample of links to be made:');
  updates.slice(0, 30).forEach(u => {
    console.log(`  [${u.score}] "${u.title}" -> ${u.condition_slug}`);
  });

  console.log('\nLinking articles...');

  for (const update of updates) {
    const { error } = await supabase
      .from('kb_articles')
      .update({ condition_slug: update.condition_slug })
      .eq('id', update.id);

    if (error) {
      console.error(`Error linking "${update.title}":`, error.message);
    } else {
      linkedCount++;
    }
  }

  console.log(`\nLinked ${linkedCount} additional articles`);

  // Final summary
  const { data: summary } = await supabase
    .from('kb_articles')
    .select('condition_slug')
    .not('condition_slug', 'is', null);

  const counts = {};
  summary?.forEach(a => {
    counts[a.condition_slug] = (counts[a.condition_slug] || 0) + 1;
  });

  console.log('\n=== FINAL SUMMARY ===');
  console.log('Total articles linked:', summary?.length || 0);
  console.log('\nArticles per condition:');
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([slug, count]) => {
      console.log(`  ${slug}: ${count}`);
    });
}

linkArticles().catch(console.error);
