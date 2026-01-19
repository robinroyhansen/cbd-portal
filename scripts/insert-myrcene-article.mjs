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

**[Myrcene](/glossary/myrcene)** (β-myrcene) is the most abundant [terpene](/glossary/terpenes) in cannabis, contributing earthy, musky, and herbal aromas. Found in mangoes, hops, lemongrass, and thyme, myrcene is associated with sedating, relaxing effects and may enhance [cannabinoid](/glossary/cannabinoid-profile) absorption. It's the terpene behind the "indica = sedating" perception and the "mango myth" in cannabis culture.

---

## What Is Myrcene?

Myrcene (β-myrcene) is a monoterpene—one of the simplest and most common terpenes in nature. In cannabis, it's typically the dominant terpene by concentration.

### Myrcene Quick Facts

| Property | Detail |
|----------|--------|
| **Chemical name** | β-myrcene (beta-myrcene) |
| **Molecular formula** | C₁₀H₁₆ |
| **Boiling point** | 167°C (332°F) |
| **Aroma** | Earthy, musky, clove-like, herbal |
| **Cannabis content** | Often 0.5-3% of terpene profile |
| **Other sources** | Mangoes, hops, lemongrass, thyme |

---

## Where Myrcene Is Found

### Natural Sources

| Source | Myrcene Content | Use |
|--------|-----------------|-----|
| **Lemongrass** | Up to 50% of essential oil | Cooking, tea |
| **Hops** | Primary terpene | Beer brewing |
| **Mangoes** | High in ripe fruit | Food |
| **Thyme** | Significant component | Culinary herb |
| **Bay leaves** | Present | Cooking |
| **Cannabis** | Often dominant | Various |

### The Hops Connection

Hops and cannabis are botanical cousins (both in family Cannabaceae). Both are high in myrcene—explaining why hoppy beers have similar sedating effects to myrcene-dominant cannabis strains.

---

## Myrcene Effects and Properties

### Researched Properties

| Property | Evidence | Key Finding |
|----------|----------|-------------|
| **Sedative** | Animal studies | Prolonged barbiturate sleep time |
| **Analgesic** | Animal studies | Reduced pain response |
| **Anti-inflammatory** | Preclinical | Multiple inflammation pathways |
| **Muscle relaxant** | Traditional use + preclinical | Relaxes smooth muscle |
| **Antioxidant** | In vitro | Free radical scavenging |

### The "Couch Lock" Terpene

Myrcene is associated with sedating effects:

| Effect | Mechanism |
|--------|-----------|
| **Relaxation** | Possible [GABA](/glossary/gaba-receptors) modulation |
| **Sedation** | Enhanced barbiturate effect in studies |
| **Muscle relaxation** | Smooth muscle effects |
| **"Couch lock"** | High-myrcene strains = more sedating |

### Myrcene and the Indica/Sativa Myth

The indica/sativa distinction is more about terpene profiles than genetics:

| Perception | Reality |
|------------|---------|
| "Indicas are sedating" | High-myrcene strains are sedating |
| "Sativas are energizing" | Low-myrcene, high-limonene/pinene strains are energizing |
| Genetic classification | Terpene profile matters more than indica/sativa label |

---

## Myrcene and Cannabinoid Absorption

### The Permeability Theory

Myrcene may enhance cannabinoid effects by increasing cell membrane permeability:

| Claim | Evidence |
|-------|----------|
| **Crosses blood-brain barrier faster** | Theoretical, limited direct evidence |
| **Enhances [THC](/glossary/tetrahydrocannabinol) absorption** | Some supporting research |
| **[Entourage effect](/glossary/entourage-effect) contributor** | Plausible mechanism |

### The Mango Myth

Cannabis culture suggests eating mangoes before consuming cannabis enhances the high:

| Claim | Reality |
|-------|---------|
| "Mangoes enhance THC effects" | Plausible—mangoes contain myrcene |
| Timing: 45 min before | Would allow myrcene absorption |
| Effect magnitude | Likely modest if real |
| Scientific proof | Limited formal research |

---

## Myrcene in Cannabis Products

### High-Myrcene Strains

| Strain | Myrcene Content | Effects |
|--------|-----------------|---------|
| **OG Kush** | Often dominant | Relaxing, sedating |
| **Blue Dream** | High myrcene | Balanced, calming |
| **Granddaddy Purple** | Very high | Heavy sedation |
| **Mango strains** | Predictably high | Relaxing, fruity |

### Product Considerations

| Product Type | Myrcene Status |
|--------------|----------------|
| **[Full spectrum](/glossary/full-spectrum) oil** | Preserves natural myrcene |
| **[Broad spectrum](/glossary/broad-spectrum)** | Variable myrcene retention |
| **[Isolate](/glossary/cbd-isolate)** | No terpenes |
| **Terpene-enhanced** | May have added myrcene |
| **Flower/vape** | Vaporizes at 167°C |

---

## Therapeutic Applications

### Traditional and Modern Uses

| Application | Context |
|-------------|---------|
| **Sleep support** | High-myrcene strains for insomnia |
| **Muscle tension** | Relaxant properties |
| **Pain management** | Analgesic + anti-inflammatory |
| **Anxiety** | Sedation may help (or hinder alertness) |
| **Lemongrass tea** | Traditional relaxation remedy |

### Synergy with Cannabinoids

| Combination | Proposed Effect |
|-------------|-----------------|
| **Myrcene + [CBD](/glossary/cannabidiol)** | Enhanced relaxation |
| **Myrcene + THC** | Stronger sedation |
| **Myrcene + [CBN](/glossary/cannabinol)** | Sleep-focused |
| **Myrcene + [linalool](/glossary/linalool)** | Calming synergy |

---

## Safety and Considerations

### Safety Profile

| Aspect | Assessment |
|--------|------------|
| **Food use** | GRAS (generally recognized as safe) |
| **Aromatherapy** | Common in essential oils |
| **Sensitization** | Rare allergic reactions possible |
| **Interactions** | May potentiate sedatives |

### Practical Considerations

| Factor | Guidance |
|--------|----------|
| **Sedation risk** | Don't drive or operate machinery |
| **Daytime use** | High-myrcene products may cause drowsiness |
| **Medication interactions** | Consult doctor if taking sedatives |
| **Vaporization** | Boils at 167°C—lower temps preserve myrcene |

---

## Related Articles

- [What Are Terpenes?](/articles/what-are-terpenes) - Complete terpene overview
- [The Entourage Effect](/articles/entourage-effect) - How cannabis compounds work together
- [What Is Linalool?](/articles/what-is-linalool) - Another calming terpene
- [Full Spectrum vs. Isolate](/articles/spectrum-comparison) - Terpene content differences

---

## Frequently Asked Questions

### Why is myrcene important in cannabis?

Myrcene is the most abundant cannabis terpene and significantly influences a strain's effects. High-myrcene strains tend to be more sedating and relaxing, while low-myrcene strains feel more energizing. It may also enhance cannabinoid absorption and contribute to the [entourage effect](/glossary/entourage-effect).

### Does myrcene make you sleepy?

Research suggests myrcene has sedative properties—it enhanced barbiturate sleep time in animal studies. High-myrcene cannabis strains are associated with "couch lock" and relaxation. However, individual responses vary, and myrcene is just one factor in overall cannabis effects.

### Do mangoes really enhance cannabis effects?

Possibly. Mangoes contain significant myrcene, and the theory is that consuming mangoes before cannabis increases myrcene levels, potentially enhancing cannabinoid absorption. While plausible, formal research is limited. If you try it, eat ripe mangoes 45 minutes before.

### Is myrcene the same as indica?

No, but there's a connection. The sedating effects attributed to "indica" strains correlate more with myrcene content than with indica genetics. Many strains labeled "indica" are high in myrcene. The effect you feel depends more on terpene profile than the indica/sativa classification.

### How can I get more myrcene?

Look for [full spectrum](/glossary/full-spectrum) products that preserve natural terpenes. For flower, check lab results for myrcene content (strains like OG Kush, Granddaddy Purple are typically high). You can also get myrcene from foods like mangoes, lemongrass tea, and hoppy beers.

---

*Medical Disclaimer: This article is for educational purposes only. Myrcene is a natural compound found in many plants. Individual responses vary. Consult a healthcare professional before using myrcene-containing products therapeutically.*

---

### References

1. Russo EB. Taming THC: potential cannabis synergy and phytocannabinoid-terpenoid entourage effects. *Br J Pharmacol*. 2011;163(7):1344-1364.

2. do Vale TG, et al. Central effects of citral, myrcene and limonene, constituents of essential oil chemotypes from Lippia alba. *Phytomedicine*. 2002;9(8):709-714.

3. Surendran S, et al. Myrcene—What are the potential health benefits of this flavouring and aroma agent? *Front Nutr*. 2021;8:699666.

4. Nuutinen T. Medicinal properties of terpenes found in Cannabis sativa and Humulus lupulus. *Eur J Med Chem*. 2018;157:198-228.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What Is Myrcene? The Most Common Cannabis Terpene',
    slug: 'what-is-myrcene',
    excerpt: 'Learn about myrcene—the earthy, sedating terpene found in cannabis, mangoes, and hops. Discover why it contributes to "couch lock" and the entourage effect.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 9,
    meta_title: 'What Is Myrcene? Effects, Benefits & The Mango Connection',
    meta_description: 'Understand myrcene, the most abundant cannabis terpene. Learn about its sedating effects, the mango myth, and why it contributes to strain effects.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Myrcene article inserted:', data.slug);
}
main();
