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

**No, CBD does not get you high.** [CBD (cannabidiol)](/glossary/cannabidiol) is a non-intoxicating compound from hemp that won't impair your thinking or produce euphoria. Unlike [THC](/glossary/tetrahydrocannabinol), CBD doesn't bind strongly to [CB1 receptors](/glossary/cb1-receptor) in the brain responsible for intoxication. You can use CBD and still drive, work, and function normally.

---

## Key Takeaways

- CBD is **non-intoxicating**—it won't impair judgment or produce a "high"
- THC causes intoxication; CBD does not (different receptor activity)
- Legal CBD products contain **<0.2% THC** (EU limit), far too little to cause effects
- You may feel calmer or more relaxed, but this isn't intoxication
- CBD is safe to use before driving or working (unlike THC)

---

## Why CBD Doesn't Get You High

The "high" from cannabis comes specifically from [THC](/glossary/tetrahydrocannabinol), not CBD. These two [cannabinoids](/glossary/cannabinoid-profile) work very differently in the body.

### How THC Creates a High

| Factor | THC | CBD |
|--------|-----|-----|
| **[CB1 receptor](/glossary/cb1-receptor) binding** | Strong agonist | Weak/no direct binding |
| **Psychoactive** | Yes | No |
| **Euphoria** | Yes | No |
| **Impairment** | Yes | No |
| **Affects coordination** | Yes | No |
| **Legal status** | Controlled | Generally legal |

THC produces intoxication by strongly activating CB1 receptors in the brain. CBD doesn't activate these receptors the same way—in fact, it may even reduce THC's effects when both are present.

### CBD's Different Mechanism

CBD interacts with your [endocannabinoid system](/glossary/endocannabinoid-system) through different pathways:

| CBD Target | Effect |
|------------|--------|
| **[CB1 receptors](/glossary/cb1-receptor)** | Negative allosteric modulator (may reduce THC binding) |
| **[CB2 receptors](/glossary/cb2-receptor)** | Indirect effects on immune function |
| **[5-HT1A receptors](/glossary/serotonin-receptors-5ht1a)** | May promote calmness |
| **[TRPV1 receptors](/glossary/trpv1-receptor)** | Involved in pain and inflammation |
| **[FAAH enzyme](/glossary/faah-enzyme)** | Inhibition preserves [anandamide](/glossary/anandamide) |

None of these mechanisms produce intoxication.

---

## What Does CBD Actually Feel Like?

While CBD doesn't get you high, many people do notice effects:

### Common CBD Experiences

| Experience | Description |
|------------|-------------|
| **Calmness** | Reduced mental chatter, feeling more at ease |
| **Relaxation** | Physical tension release |
| **Mental clarity** | Some report clearer thinking |
| **Nothing noticeable** | Many people feel no distinct sensation |
| **Subtle shift** | Slight mood improvement |

### What CBD Does NOT Feel Like

| NOT a CBD Effect | Why |
|------------------|-----|
| Euphoria | CBD doesn't activate reward pathways like THC |
| Impaired thinking | No cognitive disruption |
| Time distortion | No altered perception |
| Increased appetite ("munchies") | That's a THC effect |
| Paranoia or anxiety | CBD may actually reduce these |
| Feeling "stoned" | No intoxication mechanism |

---

## THC Content in CBD Products

Legal CBD products contain trace amounts of THC, but not enough to cause intoxication.

### Legal THC Limits by Region

| Region | THC Limit | Can You Get High? |
|--------|-----------|-------------------|
| **EU (most countries)** | 0.2% | No |
| **UK** | 0.2% | No |
| **Switzerland** | 1.0% | No |
| **USA** | 0.3% | No |

### Why Trace THC Doesn't Affect You

| Product Example | THC Content | To Feel Effects |
|-----------------|-------------|-----------------|
| **10ml CBD oil (1000mg CBD)** | ~2mg THC max | Would need to consume entire bottle+ |
| **Typical daily dose (50mg CBD)** | ~0.1mg THC | 50-100x less than intoxicating dose |
| **Intoxicating THC dose** | 5-10mg minimum | Not achievable from legal CBD |

At EU-legal levels, you'd need to consume impossibly large amounts of CBD to get any THC effect.

---

## CBD Product Types and Intoxication Risk

### Spectrum Comparison

| Product Type | THC Content | Intoxication Risk |
|--------------|-------------|-------------------|
| **[Full Spectrum](/glossary/full-spectrum)** | Up to 0.2% | None (trace levels) |
| **[Broad Spectrum](/glossary/broad-spectrum)** | Non-detectable | None |
| **[CBD Isolate](/glossary/cbd-isolate)** | 0% | None |

### Safest Options for Zero THC

If you're concerned about any THC exposure:

| Option | THC Status |
|--------|------------|
| **CBD Isolate products** | No THC |
| **Broad spectrum (verified)** | THC removed |
| **Check third-party lab reports** | Verify THC content |

---

## Can You Drive After Taking CBD?

### Driving and CBD

| Factor | Assessment |
|--------|------------|
| **Impairment** | CBD doesn't impair driving ability |
| **Legality** | Legal to drive after CBD in most countries |
| **Drug testing** | Roadside tests look for THC, not CBD |
| **Caution** | Some people feel drowsy—know your response first |

**Important:** While CBD itself doesn't impair driving, [full spectrum](/glossary/full-spectrum) products contain trace THC. If you're very sensitive or use high doses, wait until you know how CBD affects you personally.

### Workplace Considerations

| Concern | Reality |
|---------|---------|
| **Job performance** | CBD shouldn't affect work ability |
| **Drug testing** | Full spectrum may cause positive tests (see [CBD and Drug Testing](/articles/cbd-drug-testing)) |
| **Safety-sensitive jobs** | Consider THC-free options |

---

## CBD vs THC: The Key Differences

### Complete Comparison

| Property | CBD | THC |
|----------|-----|-----|
| **Psychoactive** | No | Yes |
| **Gets you high** | No | Yes |
| **Legal (EU)** | Generally yes | No (except medical) |
| **Impairs driving** | No | Yes |
| **Cognitive effects** | None | Significant |
| **Anxiety effects** | May reduce | Can increase or reduce |
| **Appetite** | Neutral | Increases |
| **Drug test** | Usually no* | Yes |
| **[Entourage effect](/glossary/entourage-effect)** | Contributes | Contributes |

*Full spectrum CBD may trigger tests due to trace THC.

---

## Common Misconceptions

### Myths About CBD and Getting High

| Myth | Truth |
|------|-------|
| "CBD is just legal weed" | CBD is a specific non-intoxicating compound |
| "CBD will make me feel stoned" | CBD doesn't produce intoxication |
| "Hemp CBD can get you high" | Hemp CBD has negligible THC |
| "CBD is a gateway to THC" | No evidence supports this |
| "If I feel calmer, I'm high" | Calmness isn't intoxication |

---

## Related Articles

- [What Does CBD Feel Like?](/articles/what-does-cbd-feel-like) - Understanding CBD's effects
- [Is CBD Psychoactive?](/articles/is-cbd-psychoactive) - The technical answer
- [CBD vs THC](/articles/cbd-vs-thc) - Complete comparison
- [Full Spectrum vs Broad Spectrum vs Isolate](/articles/spectrum-comparison) - Understanding THC content

---

## Frequently Asked Questions

### Will CBD show up on a drug test?

CBD itself isn't tested for, but [full spectrum](/glossary/full-spectrum) products contain trace THC that can accumulate with regular use. If you're drug tested, consider [broad spectrum](/glossary/broad-spectrum) or [isolate](/glossary/cbd-isolate) products. See our [CBD and Drug Testing](/articles/cbd-drug-testing) guide.

### Can I take CBD at work?

Yes. CBD doesn't impair cognitive function or job performance. However, if your workplace tests for THC, be aware that full spectrum products contain trace amounts. THC-free options are available.

### Is CBD the same as medical cannabis?

No. Medical cannabis typically contains significant THC and requires a prescription. CBD products from hemp contain minimal THC (<0.2%) and are widely available without prescription in the EU.

### Why do some people say CBD makes them feel "something"?

CBD can produce subtle effects like calmness or relaxation without intoxication. These effects come from CBD's interaction with [serotonin receptors](/glossary/serotonin-receptors-5ht1a) and the [endocannabinoid system](/glossary/endocannabinoid-system), not from CB1 activation that causes a "high."

### Can I take too much CBD and get high?

No. CBD doesn't produce a high regardless of dose. High doses may cause side effects like drowsiness or digestive upset, but not intoxication. There's no CBD dose that creates a THC-like experience.

### Is CBD safe for beginners?

Yes. CBD is generally well-tolerated and non-intoxicating, making it suitable for beginners. Start with a low dose (10-20mg) to see how you respond. Consult a doctor if you take medications, as CBD can interact with some drugs.

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. CBD products are not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'cbd-basics').single();
  if (!category) {
    console.error('Category not found');
    return;
  }
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'Does CBD Get You High? The Truth About CBD and Intoxication',
    slug: 'does-cbd-get-you-high',
    excerpt: 'No, CBD does not get you high. Learn why CBD is non-intoxicating, how it differs from THC, and what you can actually expect to feel from CBD products.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'basics',
    category_id: category.id,
    reading_time: 8,
    meta_title: 'Does CBD Get You High? No - Here\'s Why',
    meta_description: 'CBD does not get you high. Learn the science behind why CBD is non-intoxicating, how it differs from THC, and what effects you can actually expect.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Article inserted:', data.slug);
}
main();
