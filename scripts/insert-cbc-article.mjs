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
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  });
  return envVars;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const content = `## Quick Answer

**[CBC](/glossary/cannabichromene) (cannabichromene)** is a non-intoxicating cannabinoid and typically the third most abundant in cannabis after [THC](/glossary/tetrahydrocannabinol) and [CBD](/glossary/cannabidiol). CBC shows anti-inflammatory, antidepressant, and neurogenesis-promoting properties in preclinical research. Unlike THC and CBD, CBC doesn't strongly bind to cannabinoid receptors—it works primarily through [TRPV1](/glossary/trpv1-receptor) and other non-CB targets.

---

## What Is CBC?

CBC (cannabichromene) is one of the "big six" cannabinoids, discovered in 1966. It's produced through the same precursor pathway as CBD and THC, branching from [CBGA](/glossary/cannabigerol) via the CBCA intermediate.

### CBC Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Cannabichromene |
| **Chemical formula** | C21H30O2 |
| **Discovery** | 1966 |
| **Psychoactive** | No |
| **Typical content** | 0.1-1% (strain dependent) |
| **Precursor** | CBCA (cannabichromenic acid) |

---

## How CBC Works

CBC has a unique mechanism—it doesn't significantly activate CB1 or CB2 receptors.

### CBC Receptor Profile

| Target | CBC Action | Effect |
|--------|------------|--------|
| **[CB1](/glossary/cb1-receptor)** | Very low affinity | Not intoxicating |
| **[CB2](/glossary/cb2-receptor)** | Very low affinity | Limited direct immune effect |
| **[TRPV1](/glossary/trpv1-receptor)** | Agonist | Pain, inflammation |
| **TRPA1** | Agonist | Pain modulation |
| **TRPV3/4** | Interacts | Skin, temperature sensing |

### Why CBC Doesn't Get You High

CBC's CB1 affinity is too low to produce intoxication. Its effects come through TRP channels and other non-cannabinoid receptor mechanisms.

---

## Potential Benefits of CBC

### Researched Applications

| Application | Evidence | Key Findings |
|-------------|----------|--------------|
| **Anti-inflammatory** | Preclinical | Reduces edema without CB receptors |
| **Antidepressant** | Preclinical | Significant effect in mouse models |
| **Neurogenesis** | Preclinical | May promote brain cell growth |
| **Pain** | Preclinical | Synergizes with THC |
| **Acne** | Preclinical | Reduces sebum production |
| **Antibacterial** | Preclinical | Active against MRSA |

### CBC and Depression

A 2010 study found CBC produced antidepressant-like effects in mice, contributing to cannabis's mood effects through mechanisms distinct from THC.

### CBC and Neurogenesis

CBC may promote neural stem progenitor cell growth—potentially supporting brain health and repair. This is rare among cannabinoids.

---

## CBC vs. Other Cannabinoids

| Property | CBC | CBD | CBG |
|----------|-----|-----|-----|
| **Psychoactive** | No | No | No |
| **CB1/CB2 binding** | Very low | Low | Low |
| **TRP channel activity** | High | Moderate | Moderate |
| **Research level** | Limited | Extensive | Emerging |
| **Abundance** | Low-moderate | High | Low |

---

## Related Articles

- [What Are Cannabinoids?](/articles/what-are-cannabinoids) - Complete cannabinoid overview
- [What Is CBD?](/articles/what-is-cbd) - The major non-intoxicating cannabinoid
- [What Is CBG?](/articles/what-is-cbg) - The mother cannabinoid
- [The Entourage Effect](/articles/entourage-effect) - How cannabinoids work together

---

## Frequently Asked Questions

### Will CBC get me high?

No. CBC has virtually no affinity for [CB1 receptors](/glossary/cb1-receptor), which are responsible for THC's intoxicating effects. CBC is completely non-psychoactive at any realistic dose.

### Is CBC the same as CBD?

No. While both are non-intoxicating, they're different molecules with different mechanisms. CBD modulates cannabinoid receptors and activates serotonin receptors. CBC works primarily through TRP channels. They may complement each other in the [entourage effect](/glossary/entourage-effect).

### Why isn't CBC more popular?

CBC is less abundant than CBD, making it more expensive to extract. It also has less research than CBD, and its unique TRP-focused mechanism is less well understood by consumers. As research grows, CBC may gain popularity.

### Is CBC legal?

Yes. CBC derived from hemp (<0.3% THC) is federally legal in the US under the 2018 Farm Bill. It's non-intoxicating and not a controlled substance.

---

*Medical Disclaimer: This article is for educational purposes only. CBC research is primarily preclinical. Consult a healthcare professional before using cannabinoid products.*

---

### References

1. DeLong GT, et al. Pharmacological evaluation of the natural constituent of Cannabis sativa, cannabichromene. *Drug Alcohol Depend*. 2010;112(1-2):126-133.

2. Shinjyo N, Di Bhaumik R. The effect of cannabichromene on adult neural stem/progenitor cells. *Neurochem Int*. 2013;63(5):432-437.

3. Izzo AA, et al. Inhibitory effect of cannabichromene on cancer cell growth. *Phytomedicine*. 2012;18(12):1129-1132.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) { console.error('Category not found'); return; }

  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What Is CBC? The Anti-Inflammatory Cannabinoid',
    slug: 'what-is-cbc',
    excerpt: 'Learn about CBC (cannabichromene)—a non-intoxicating cannabinoid with anti-inflammatory and antidepressant properties that works through TRP channels.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 7,
    meta_title: 'What Is CBC (Cannabichromene)? Benefits & Research',
    meta_description: 'Understand CBC, a non-intoxicating cannabinoid with unique anti-inflammatory and neurogenesis properties. Learn how it differs from CBD.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();

  if (error) console.error('Error:', error);
  else console.log('CBC article inserted:', data.slug);
}
main();
