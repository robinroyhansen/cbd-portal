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

**[Terpenes](/glossary/terpenes)** are aromatic compounds that give cannabis (and other plants) their distinctive smells. Beyond scent, terpenes may contribute to the [entourage effect](/glossary/entourage-effect)—modifying how [cannabinoids](/glossary/cannabinoid-profile) work. Common cannabis terpenes include [myrcene](/glossary/myrcene) (earthy), limonene (citrus), pinene (pine), and [linalool](/glossary/linalool) (floral). Terpenes are legal, non-intoxicating, and increasingly featured in CBD products.

---

## What Are Terpenes?

Terpenes are volatile organic compounds produced by many plants, including cannabis. They're responsible for the distinct aromas of lavender, pine, citrus fruits, and cannabis strains.

### Terpene Quick Facts

| Property | Detail |
|----------|--------|
| **Function in plants** | Attract pollinators, repel pests |
| **Cannabis terpene count** | 200+ identified |
| **Common terpenes** | ~20 appear frequently |
| **Psychoactive** | No (though may influence mood) |
| **Legal status** | Legal (found in many plants) |
| **Aromatherapy connection** | Many are used in essential oils |

---

## Major Cannabis Terpenes

### The Big Six

| Terpene | Aroma | Also Found In | Reported Effects |
|---------|-------|---------------|------------------|
| **[Myrcene](/glossary/myrcene)** | Earthy, musky | Mangoes, hops, lemongrass | Relaxing, sedating |
| **Limonene** | Citrus | Lemons, oranges | Uplifting, stress relief |
| **Pinene** | Pine | Pine trees, rosemary | Alertness, memory |
| **[Linalool](/glossary/linalool)** | Floral, lavender | Lavender | Calming, anti-anxiety |
| **[Caryophyllene](/glossary/caryophyllene)** | Spicy, peppery | Black pepper, cloves | Anti-inflammatory |
| **Humulene** | Hoppy, woody | Hops, sage | Appetite suppressant |

### Myrcene: The Most Common

Myrcene is typically the dominant terpene in cannabis:
- Present in most strains
- May enhance cannabinoid absorption
- Associated with "couch lock" effect
- Also found in mangoes (the "mango myth")

### Beta-Caryophyllene: The Unique One

[Beta-caryophyllene](/glossary/caryophyllene) is special—it's the only terpene known to directly activate [CB2 receptors](/glossary/cb2-receptor), technically making it a dietary cannabinoid.

---

## How Terpenes Work

Terpenes may influence cannabis effects through multiple mechanisms.

### Proposed Mechanisms

| Mechanism | Explanation |
|-----------|-------------|
| **Direct receptor activity** | Some terpenes bind neurotransmitter receptors |
| **Cannabinoid modulation** | May change how cannabinoids bind |
| **Blood-brain barrier** | May affect cannabinoid absorption |
| **Aromatherapy effects** | Scent influences mood/physiology |
| **Synergy** | Combined effects exceed individual |

### Terpene Receptor Targets

| Terpene | Receptor Targets |
|---------|-----------------|
| **Myrcene** | Possible GABA modulation |
| **Limonene** | Serotonin, adenosine systems |
| **Linalool** | GABA receptor modulation |
| **Caryophyllene** | [CB2 receptor](/glossary/cb2-receptor) agonist |
| **Pinene** | Acetylcholinesterase inhibition |

---

## The Entourage Effect

Terpenes are a key component of the [entourage effect](/glossary/entourage-effect)—the theory that cannabis compounds work better together.

### How Terpenes Contribute

| Interaction | Example |
|-------------|---------|
| **CBD + myrcene** | May enhance sedation |
| **THC + pinene** | May reduce memory impairment |
| **CBD + limonene** | May enhance mood effects |
| **THC + caryophyllene** | May reduce anxiety |

### Evidence Level

| Claim | Status |
|-------|--------|
| Terpenes contribute to strain effects | Plausible |
| Terpenes work synergistically with cannabinoids | Some evidence |
| Specific terpene = specific effect | Oversimplified |

---

## Terpenes in CBD Products

### Product Types

| Type | Terpene Content |
|------|-----------------|
| **[Full spectrum](/glossary/full-spectrum)** | Natural terpenes preserved |
| **[Broad spectrum](/glossary/broad-spectrum)** | Some terpenes (process varies) |
| **[Isolate](/glossary/cbd-isolate)** | No terpenes |
| **Terpene-infused isolate** | Added back |
| **Live resin** | Fresh plant terpenes |

### "Strain-Specific" CBD

Some products add terpene blends mimicking cannabis strains:
- Recreates scent profile
- May provide associated effects
- Quality varies significantly

---

## Terpenes and Aromatherapy

Cannabis terpenes overlap with aromatherapy.

### Shared Compounds

| Terpene | Aromatherapy Use |
|---------|------------------|
| **Linalool** | Lavender essential oil |
| **Limonene** | Citrus oils, energizing |
| **Pinene** | Pine oils, respiratory |
| **Eucalyptol** | Eucalyptus, clearing |
| **Terpinolene** | Tea tree, antimicrobial |

---

## Terpene Safety

Terpenes are generally considered safe.

### Safety Profile

| Aspect | Assessment |
|--------|------------|
| **Food use** | GRAS (generally recognized as safe) |
| **Topical use** | Generally safe, possible sensitivity |
| **Inhalation** | Generally safe at natural levels |
| **Concentrated** | Can irritate at high doses |
| **Allergies** | Possible with any plant compound |

### Concerns

| Issue | Context |
|-------|---------|
| **Added terpenes** | Quality varies in products |
| **Synthetic vs. natural** | May differ in composition |
| **High concentrations** | Can irritate airways |

---

## Related Articles

- [The Entourage Effect](/articles/entourage-effect) - How cannabis compounds work together
- [Full Spectrum vs. Broad Spectrum vs. Isolate](/articles/spectrum-comparison) - Terpene content differences
- [What Are Cannabinoids?](/articles/what-are-cannabinoids) - The other active compounds

---

## Frequently Asked Questions

### Do terpenes get you high?

No. Terpenes are not intoxicating on their own. However, they may influence the character of cannabis experiences by modulating how cannabinoids work or through aromatherapeutic effects on mood.

### Are terpenes the same as cannabinoids?

No. Terpenes are aromatic compounds found in many plants. Cannabinoids are a different chemical class specific to cannabis (and the endocannabinoid system). [Beta-caryophyllene](/glossary/caryophyllene) is unique in acting on cannabinoid receptors while being a terpene.

### Why do terpenes matter for CBD?

Terpenes may contribute to the [entourage effect](/glossary/entourage-effect), potentially making [full spectrum](/glossary/full-spectrum) CBD more effective than [isolate](/glossary/cbd-isolate). They also provide the distinctive scent and may have their own therapeutic properties.

### Can I take terpenes separately?

Yes. Terpene supplements and essential oils exist. However, effectiveness may depend on the entourage effect—terpenes may work best alongside cannabinoids rather than alone.

### Are terpenes legal?

Yes. Terpenes are found in thousands of legal plants and are used in food, cosmetics, and aromatherapy worldwide. Cannabis-derived terpenes are legal as they contain no controlled substances.

---

*Medical Disclaimer: This article is for educational purposes only. While terpenes have been used safely in food and aromatherapy, their therapeutic claims for specific conditions are largely based on preliminary research. Consult a healthcare professional before use.*

---

### References

1. Russo EB. Taming THC: potential cannabis synergy and phytocannabinoid-terpenoid entourage effects. *Br J Pharmacol*. 2011;163(7):1344-1364.

2. Gertsch J, et al. Beta-caryophyllene is a dietary cannabinoid. *Proc Natl Acad Sci USA*. 2008;105(26):9099-9104.

3. Nuutinen T. Medicinal properties of terpenes found in Cannabis sativa and Humulus lupulus. *Eur J Med Chem*. 2018;157:198-228.

4. Ferber SG, et al. The "entourage effect": Terpenes coupled with cannabinoids for the treatment of mood disorders and anxiety disorders. *Curr Neuropharmacol*. 2020;18(2):87-96.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What Are Terpenes? Cannabis Aromatics Explained',
    slug: 'what-are-terpenes',
    excerpt: 'Learn about terpenes—the aromatic compounds that give cannabis its smell and may enhance the entourage effect. Discover myrcene, limonene, linalool, and more.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 9,
    meta_title: 'What Are Terpenes? Cannabis Terpenes & The Entourage Effect',
    meta_description: 'Understand terpenes: the aromatic compounds in cannabis. Learn about myrcene, limonene, linalool, and how terpenes contribute to the entourage effect.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Terpenes article inserted:', data.slug);
}
main();
