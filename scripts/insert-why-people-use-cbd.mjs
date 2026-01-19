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

**People use [CBD](/glossary/cannabidiol) primarily for stress relief, better sleep, pain management, and general wellness.** Survey data shows anxiety and stress reduction are the top reasons, followed by sleep support and chronic pain. CBD appeals to those seeking natural alternatives to pharmaceuticals. While research is ongoing, millions use CBD daily as part of their wellness routine.

---

## Key Takeaways

- **Stress and anxiety relief** are the #1 reason people use CBD
- **Sleep support** is the second most common use
- **Pain management** (chronic, inflammatory, exercise-related) is widely reported
- **General wellness** and preventive use are growing motivations
- People often try CBD when **conventional options haven't worked** well
- CBD's **non-intoxicating nature** is a key appeal

---

## What Survey Data Shows

Multiple surveys reveal consistent patterns in why people choose CBD.

### Top Reasons for CBD Use (Survey Data)

| Reason | % of Users |
|--------|------------|
| **Anxiety/stress** | 47-62% |
| **Sleep issues** | 40-52% |
| **Chronic pain** | 35-48% |
| **General wellness** | 25-37% |
| **Inflammation** | 20-30% |
| **Relaxation** | 18-28% |
| **Depression** | 15-25% |
| **Skin conditions** | 10-15% |

*Note: Percentages vary by survey; users often cite multiple reasons.*

### Who Uses CBD?

| Demographic | Finding |
|-------------|---------|
| **Age** | Most common: 25-54 years |
| **Gender** | Roughly equal, slight female majority |
| **Previous cannabis use** | Many users have never used THC products |
| **Condition status** | Both diagnosed conditions and general wellness |

---

## Primary Use Cases

### 1. Stress and Anxiety

The most cited reason for CBD use.

| Why People Try It | What Users Report |
|-------------------|-------------------|
| Daily stress relief | Feeling calmer |
| Social anxiety | Reduced nervousness |
| Work-related tension | Better able to cope |
| General anxiousness | Quieter mind |

**How CBD may help:** CBD interacts with [5-HT1A serotonin receptors](/glossary/serotonin-receptors-5ht1a), which regulate mood and anxiety.

### 2. Sleep Support

| Sleep Issue | How CBD Is Used |
|-------------|-----------------|
| Difficulty falling asleep | Evening dose before bed |
| Waking during night | Sustained-release or longer-acting forms |
| Racing thoughts at bedtime | Combined with relaxation routine |
| Sleep quality | Regular daily use |

**Why it may help:** CBD may address underlying anxiety or discomfort that disrupts sleep, rather than causing sedation directly.

### 3. Pain Management

| Pain Type | Common Use Pattern |
|-----------|-------------------|
| Chronic pain | Daily oral dosing |
| Arthritis/joint pain | Oral + topical combination |
| Back pain | Oral CBD, topicals on area |
| Exercise soreness | Post-workout recovery |
| Headaches/migraines | Preventive and acute use |

**Mechanisms:** CBD interacts with [TRPV1 receptors](/glossary/trpv1-receptor) (pain perception) and has anti-inflammatory properties.

### 4. General Wellness

| Wellness Goal | User Approach |
|---------------|---------------|
| Daily balance | Low-dose routine |
| [ECS support](/glossary/endocannabinoid-system) | Regular supplementation |
| Preventive care | Consistent use |
| Mood stability | Daily maintenance |

**Growing trend:** Many users take CBD without a specific condition—similar to taking vitamins.

---

## Why People Choose CBD Specifically

### Appeal Factors

| Factor | Why It Matters |
|--------|----------------|
| **Non-intoxicating** | No high, can work/drive normally |
| **Natural origin** | Plant-derived, not synthetic |
| **Well-tolerated** | Fewer side effects than many medications |
| **Legal and accessible** | Available without prescription |
| **Flexible use** | Multiple formats, easy to incorporate |
| **Growing research** | Increasing scientific support |

### Common Reasons for Trying CBD

| Trigger | Context |
|---------|---------|
| **Conventional treatments inadequate** | Side effects or insufficient relief |
| **Seeking natural alternatives** | Preference for plant-based options |
| **Recommendation from others** | Friends, family, online communities |
| **Curiosity from media coverage** | Growing awareness |
| **Desire to reduce pharmaceuticals** | Looking for alternatives |

---

## CBD for Specific Populations

### Athletes and Fitness

| Use Case | Why Athletes Use CBD |
|----------|---------------------|
| **Post-workout recovery** | May reduce inflammation |
| **Sleep quality** | Recovery happens during sleep |
| **Competition anxiety** | WADA removed CBD from banned list |
| **Pain management** | Alternative to NSAIDs |

### Seniors

| Use Case | Why Older Adults Use CBD |
|----------|-------------------------|
| **Chronic pain** | Arthritis, joint issues common |
| **Sleep issues** | Sleep quality decreases with age |
| **Reduced medications** | Seek alternatives with fewer interactions |
| **Anxiety** | Health-related worries |

*Note: Drug interactions are more common in seniors—always consult a healthcare provider.*

### Working Professionals

| Use Case | Why Professionals Use CBD |
|----------|--------------------------|
| **Stress management** | Work-related pressure |
| **Focus** | Reduced anxiety may improve concentration |
| **Better sleep** | Performance depends on rest |
| **Non-impairing** | Can use without affecting work |

---

## What Research Supports

### Areas with Research Support

| Use | Evidence Level |
|-----|----------------|
| **Certain seizure disorders** | Strong (FDA-approved Epidiolex) |
| **Anxiety** | Moderate (clinical trials ongoing) |
| **Chronic pain** | Moderate (more research needed) |
| **Inflammation** | Preclinical support |
| **Sleep** | Limited direct evidence |

### Important Caveats

| Consideration | Reality |
|---------------|---------|
| **Not a cure** | CBD doesn't cure any condition |
| **Individual variation** | Results vary significantly |
| **Research ongoing** | Many questions unanswered |
| **Product quality matters** | Low-quality products may not work |

---

## What CBD Is NOT Used For

### Misconceptions

| Misconception | Reality |
|---------------|---------|
| **Getting high** | CBD is non-intoxicating |
| **Replacing all medication** | Should complement, not replace medical care |
| **Instant cure** | Benefits often build over time |
| **One-size-fits-all** | Optimal dose varies by person |

---

## How to Start Using CBD

### For New Users

| Step | Guidance |
|------|----------|
| **1. Identify your goal** | What do you want to address? |
| **2. Choose product type** | Oil, capsule, gummy, etc. |
| **3. Select spectrum** | [Full](/glossary/full-spectrum), [broad](/glossary/broad-spectrum), or [isolate](/glossary/cbd-isolate) |
| **4. Start low** | 10-20mg per day |
| **5. Be patient** | Give it 2-4 weeks |
| **6. Adjust gradually** | Increase dose if needed |

### Choosing by Use Case

| Goal | Product Suggestion |
|------|-------------------|
| **General wellness** | Daily CBD oil |
| **Sleep** | Higher-dose evening gummy or oil |
| **Pain (local)** | Topical + oral combination |
| **Stress** | Sublingual oil for faster effect |

---

## Related Articles

- [What Does CBD Feel Like?](/articles/what-does-cbd-feel-like) - Understanding effects
- [Does CBD Get You High?](/articles/does-cbd-get-you-high) - Intoxication facts
- [How CBD Works](/articles/how-cbd-works) - The science explained
- [Full Spectrum vs Broad Spectrum vs Isolate](/articles/spectrum-comparison) - Choosing your type

---

## Frequently Asked Questions

### What is the most common reason people use CBD?

Stress and anxiety relief. Surveys consistently show 47-62% of CBD users cite anxiety as a primary reason. Sleep support and pain management follow closely behind.

### Can CBD replace my medication?

CBD should not replace prescribed medication without consulting your doctor. It may complement existing treatments, but many conditions require medical management. Always discuss CBD use with a healthcare provider.

### How quickly will CBD work for me?

Depends on use case and delivery method. Acute effects (calm, relaxation) may appear within 15-60 minutes. Chronic conditions often require 2-4 weeks of consistent use before noticing changes.

### Do people use CBD without having a medical condition?

Yes, increasingly so. Many people use CBD for general wellness—similar to supplements or vitamins—to support their [endocannabinoid system](/glossary/endocannabinoid-system) without targeting a specific issue.

### Is CBD effective for everyone?

No. Individual responses vary significantly due to genetics, [endocannabinoid tone](/glossary/endocannabinoid-tone), metabolism, and other factors. Some people experience significant benefits; others notice little effect. Product quality also matters.

### Why are so many people trying CBD now?

Several factors: increasing research and media coverage, legal clarity in many regions, growing distrust of pharmaceuticals, desire for natural alternatives, and word-of-mouth from satisfied users.

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. CBD is not approved to diagnose, treat, cure, or prevent any disease. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'cbd-basics').single();
  if (!category) {
    console.error('Category not found');
    return;
  }
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'Why People Use CBD: Top Reasons and Use Cases',
    slug: 'why-people-use-cbd',
    excerpt: 'Discover why millions use CBD daily. Learn the top reasons—anxiety, sleep, pain, wellness—and what draws people to this natural compound.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'basics',
    category_id: category.id,
    reading_time: 10,
    meta_title: 'Why People Use CBD: Top Reasons Explained',
    meta_description: 'Learn why people use CBD. Survey data shows anxiety, sleep, and pain are top reasons. Understand the appeal and common use cases.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Article inserted:', data.slug);
}
main();
