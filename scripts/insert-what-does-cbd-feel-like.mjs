import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      envVars[match[1].trim()] = value;
    }
  });
  return envVars;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const content = `## Quick Answer

**CBD typically feels like a subtle sense of calm and relaxation** without any intoxication or "high." Many people describe it as taking the edge off stress or physical tension. Some notice nothing dramatic—just an absence of discomfort they didn't realise they had. Effects vary by person, dose, and product type, usually appearing within 15-60 minutes.

---

## Key Takeaways

- CBD produces **subtle, non-intoxicating effects**—no high or impairment
- Common experiences include calmness, relaxation, and reduced tension
- Many people feel "nothing dramatic"—which often means it's working quietly
- Effects depend on dose, delivery method, and individual biology
- First-time users should start low (10-20mg) and be patient

---

## What People Commonly Report

CBD experiences vary widely, but certain themes emerge consistently.

### Most Frequently Reported Effects

| Effect | Description | How Common |
|--------|-------------|------------|
| **Calmness** | Quieter mind, less mental chatter | Very common |
| **Physical relaxation** | Reduced muscle tension | Very common |
| **Improved focus** | Easier concentration (some users) | Common |
| **Nothing noticeable** | No distinct sensation | Common |
| **Better sleep** | Easier falling/staying asleep | Common |
| **Mood lift** | Subtle improvement in outlook | Moderate |

### What CBD Does NOT Feel Like

| Experience | Why Not |
|------------|---------|
| **High or intoxication** | CBD doesn't activate [CB1 receptors](/glossary/cb1-receptor) like [THC](/glossary/tetrahydrocannabinol) |
| **Euphoria** | No reward pathway activation |
| **Impairment** | No cognitive disruption |
| **Drowsiness (usually)** | Unless high dose or evening use |
| **Increased appetite** | That's THC's effect |
| **Altered perception** | No psychedelic properties |

---

## CBD Effects by Use Case

Different people use CBD for different reasons, and experiences vary accordingly.

### For Stress and Anxiety

| What Users Report | Typical Onset |
|-------------------|---------------|
| "Like a weight lifted off my shoulders" | 20-40 minutes (oil) |
| "Racing thoughts slowed down" | 15-30 minutes (vape) |
| "Felt more present, less worried" | 30-60 minutes (edibles) |
| "Subtle—I just realised I wasn't anxious anymore" | Varies |

### For Physical Discomfort

| What Users Report | Typical Onset |
|-------------------|---------------|
| "Tension in my neck released" | 30-60 minutes (oral) |
| "Joints feel less stiff" | 15-30 minutes (topical on area) |
| "Didn't eliminate pain but made it more manageable" | Varies |
| "Subtle enough that I could still function" | Varies |

### For Sleep

| What Users Report | Typical Experience |
|-------------------|-------------------|
| "Fell asleep faster" | 30-60 minutes before bed |
| "Woke up less during the night" | Cumulative effect |
| "Felt more refreshed in morning" | After regular use |
| "Mind wasn't racing when I got into bed" | Evening dose |

---

## Factors That Affect How CBD Feels

### Individual Variation

| Factor | Impact on Experience |
|--------|---------------------|
| **Body weight** | Affects dose needed |
| **Metabolism** | Influences onset and duration |
| **[Endocannabinoid tone](/glossary/endocannabinoid-tone)** | Natural ECS activity varies |
| **Sensitivity** | Some people more responsive |
| **Expectations** | Mindset affects perception |
| **Prior experience** | Regular users may need higher doses |

### Product Factors

| Factor | Effect on Experience |
|--------|---------------------|
| **[Full spectrum](/glossary/full-spectrum)** | May feel more "complete" due to [entourage effect](/glossary/entourage-effect) |
| **[Broad spectrum](/glossary/broad-spectrum)** | Similar to full spectrum, no THC |
| **[Isolate](/glossary/cbd-isolate)** | Clean CBD experience |
| **[Terpene](/glossary/terpenes) profile** | Can influence effects (e.g., [myrcene](/glossary/myrcene) = more relaxing) |
| **Quality** | Low-quality products may have no effect |

### Delivery Method

| Method | Onset | Duration | Experience |
|--------|-------|----------|------------|
| **Sublingual oil** | 15-30 min | 4-6 hours | Gradual, steady |
| **Vaping** | 1-5 min | 2-3 hours | Fast, noticeable |
| **Edibles/capsules** | 30-90 min | 6-8 hours | Slow, sustained |
| **Topicals** | 15-30 min (local) | 4-6 hours | Localised only |

---

## Why Some People Feel Nothing

It's common for new users to report feeling nothing. This doesn't necessarily mean CBD isn't working.

### Reasons for No Noticeable Effect

| Reason | Solution |
|--------|----------|
| **Dose too low** | Gradually increase (try 25-50mg) |
| **Wrong timing** | Take 30-60 min before desired effect |
| **Poor product quality** | Choose reputable brands with lab reports |
| **Expecting a "high"** | CBD effects are subtle, not dramatic |
| **Individual biology** | Some people need higher doses |
| **No problem to address** | Effects more noticeable when there's imbalance |

### The "Nothing Dramatic" Effect

Many people who say they "feel nothing" actually experience:
- Absence of anxiety they didn't realise they had
- Better sleep without noticing the transition
- Reduced inflammation over time
- Lower baseline stress

**CBD often works by removing discomfort rather than adding a sensation.**

---

## Timeline: What to Expect

### First-Time Use

| Stage | What to Expect |
|-------|----------------|
| **0-15 minutes** | Likely nothing (unless vaping) |
| **15-30 minutes** | Subtle shift possible |
| **30-60 minutes** | Effects typically apparent |
| **2-4 hours** | Peak effects |
| **4-6 hours** | Gradual return to baseline |

### Regular Use (2+ Weeks)

| Change | Typical Experience |
|--------|-------------------|
| **Cumulative effects** | Benefits may build over time |
| **Baseline shift** | New normal may feel unremarkable |
| **Dose adjustments** | May need to increase or decrease |
| **Consistent results** | More predictable responses |

---

## How to Maximise Your CBD Experience

### For Beginners

| Tip | Why |
|-----|-----|
| **Start low (10-20mg)** | Assess your sensitivity |
| **Be patient** | Allow 1-2 hours for full effect |
| **Use consistently** | Daily use shows better results |
| **Keep a journal** | Track dose, timing, effects |
| **Choose quality products** | Lab-tested, reputable brands |

### For Best Absorption

| Method | Tip |
|--------|-----|
| **Sublingual oil** | Hold under tongue 60-90 seconds |
| **With food** | Fat improves absorption ([bioavailability](/articles/cbd-bioavailability)) |
| **Consistent timing** | Same time daily for steady levels |

---

## CBD Effects vs Other Substances

### Comparison

| Substance | Intoxication | Impairment | Primary Feeling |
|-----------|--------------|------------|-----------------|
| **CBD** | None | None | Subtle calm |
| **THC** | Yes | Yes | Euphoria, altered perception |
| **Alcohol** | Yes | Yes | Disinhibition, sedation |
| **Caffeine** | No | No | Alertness, stimulation |
| **Melatonin** | No | No | Drowsiness |
| **L-Theanine** | No | No | Calm alertness |

CBD is most comparable to L-Theanine—subtle, calming, non-impairing.

---

## Related Articles

- [Does CBD Get You High?](/articles/does-cbd-get-you-high) - Why CBD isn't intoxicating
- [How CBD Works](/articles/how-cbd-works) - The science behind CBD's effects
- [CBD Bioavailability](/articles/cbd-bioavailability) - How your body absorbs CBD
- [Full Spectrum vs Broad Spectrum vs Isolate](/articles/spectrum-comparison) - Choosing your product type

---

## Frequently Asked Questions

### How long does it take to feel CBD?

Onset depends on delivery method. Vaping: 1-5 minutes. Sublingual oil: 15-30 minutes. Edibles/capsules: 30-90 minutes. First-time users should wait at least 2 hours before taking more.

### Will I feel high or intoxicated from CBD?

No. CBD is non-intoxicating regardless of dose. If you feel high, your product likely contains significant [THC](/glossary/tetrahydrocannabinol) or isn't what it claims to be. Legal CBD products contain <0.2% THC (EU), far too little to cause intoxication.

### Why don't I feel anything from CBD?

Common reasons include: dose too low, poor quality product, wrong expectations (CBD is subtle), or individual variation. Try increasing your dose gradually, ensure you're using a reputable product with lab reports, and give it 2-4 weeks of consistent use.

### Does CBD make you sleepy?

Not necessarily. CBD isn't a sedative, but it may help sleep by reducing anxiety and promoting relaxation. Some people find it calming; others feel no change in alertness. Higher doses in the evening are more likely to support sleep.

### Can I function normally on CBD?

Yes. CBD doesn't impair cognitive function, coordination, or judgment. You can work, drive (though know your response first), and perform normal activities. This is unlike [THC](/glossary/tetrahydrocannabinol), which does impair function.

### Do CBD effects change with regular use?

Yes. Many users report that benefits build over time with consistent use. Your [endocannabinoid system](/glossary/endocannabinoid-system) may reach a new equilibrium. Some people find they need to adjust their dose up or down after several weeks.

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Individual responses to CBD vary. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'cbd-basics').single();
  if (!category) {
    console.error('Category not found');
    return;
  }
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What Does CBD Feel Like? Understanding CBD\'s Effects',
    slug: 'what-does-cbd-feel-like',
    excerpt: 'CBD typically feels like subtle calm and relaxation without any high. Learn what to expect from CBD, how effects vary by person and product, and why some people feel nothing at first.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'basics',
    category_id: category.id,
    reading_time: 9,
    meta_title: 'What Does CBD Feel Like? Real Effects Explained',
    meta_description: 'Learn what CBD actually feels like. Understand the subtle effects of CBD, why experiences vary, and what to expect from different products and doses.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Article inserted:', data.slug);
}
main();
