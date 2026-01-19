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

**Hemp is cannabis (*Cannabis sativa* L.) containing less than 0.2% [THC](/glossary/tetrahydrocannabinol)** (EU definition). It's the same plant species as marijuana but bred for low THC and high [CBD](/glossary/cannabidiol). Hemp is legal throughout the EU and used for CBD products, textiles, food, and industrial materials. Unlike marijuana, hemp cannot get you high.

---

## Key Takeaways

- Hemp and marijuana are the **same species** (*Cannabis sativa*), distinguished by THC content
- EU definition: hemp must contain **<0.2% THC**
- Hemp is the **primary source of legal CBD products**
- Hemp has been cultivated for **10,000+ years** for fiber, food, and medicine
- Hemp is **completely legal** in the EU when meeting THC requirements

---

## What Defines Hemp?

The distinction between hemp and marijuana is legal and functional, not botanical.

### Legal Definitions by Region

| Region | Hemp THC Limit | Regulatory Body |
|--------|----------------|-----------------|
| **European Union** | <0.2% | EU regulations |
| **United Kingdom** | <0.2% | Home Office |
| **Switzerland** | <1.0% | Federal Office of Public Health |
| **United States** | <0.3% | USDA (2018 Farm Bill) |

### Hemp vs Marijuana: Key Differences

| Property | Hemp | Marijuana |
|----------|------|-----------|
| **THC content** | <0.2% (EU) | 5-30% |
| **CBD content** | Often 10-20% | Variable |
| **Legal status (EU)** | Legal | Controlled substance |
| **Psychoactive** | No | Yes |
| **Primary use** | CBD, fiber, seeds, industrial | Recreational, medical |
| **Cultivation** | Outdoor, large scale | Often indoor, controlled |

For a detailed comparison, see [Hemp vs Marijuana](/articles/hemp-vs-marijuana).

---

## Hemp Plant Anatomy

Understanding the plant helps explain where CBD comes from.

### Parts of the Hemp Plant

| Part | Use | CBD Content |
|------|-----|-------------|
| **Flowers (buds)** | CBD extraction | Highest |
| **Leaves** | Extraction, tea | Moderate |
| **Seeds** | Food, oil | None (no cannabinoids) |
| **Stalks** | Fiber, building materials | Minimal |
| **Roots** | Traditional medicine | Trace |

### Where CBD Comes From

[CBD](/glossary/cannabidiol) and other [cannabinoids](/glossary/cannabinoid-profile) are produced in **trichomes**—tiny resin glands concentrated on female flowers and surrounding leaves.

| Structure | Function |
|-----------|----------|
| **Trichomes** | Produce and store cannabinoids, [terpenes](/glossary/terpenes) |
| **Female flowers** | Highest trichome concentration |
| **Sugar leaves** | Trichome-covered leaves near flowers |

---

## Hemp Uses Throughout History

Hemp is one of humanity's oldest cultivated crops.

### Historical Timeline

| Era | Hemp Use |
|-----|----------|
| **~8000 BCE** | First hemp cultivation (Central Asia) |
| **2700 BCE** | Chinese medicine use documented |
| **500 BCE** | Spread to Europe |
| **1500s** | Required crop in American colonies (for rope) |
| **1800s** | Peak industrial hemp cultivation |
| **1937-2018** | Largely prohibited (classified with marijuana) |
| **2018-present** | Legal renaissance (EU, US, UK) |

### Traditional Uses

| Use Category | Examples |
|--------------|----------|
| **Textiles** | Rope, canvas, clothing |
| **Paper** | Books, currency, documents |
| **Food** | Seeds, oil, protein |
| **Building** | Hempcrete, insulation |
| **Medicine** | Pain relief, inflammation |

---

## Modern Hemp Products

### CBD Products (Primary Market)

| Product Type | Source | Description |
|--------------|--------|-------------|
| **CBD oil** | Flower extract | Most popular form |
| **CBD capsules** | Flower extract | Convenient dosing |
| **CBD topicals** | Flower extract | Creams, balms |
| **CBD edibles** | Flower extract | Gummies, foods |
| **Hemp flower** | Dried buds | Smokable/vapeable |

### Food Products

| Product | Nutritional Value |
|---------|-------------------|
| **Hemp seeds** | Complete protein, omega fatty acids |
| **Hemp seed oil** | Omega-3 and omega-6 balance |
| **Hemp protein** | Plant-based protein powder |
| **Hemp milk** | Dairy alternative |

**Note:** Hemp seed products contain NO CBD or THC—[cannabinoids](/glossary/cannabinoid-profile) are not present in seeds.

### Industrial Products

| Product | Application |
|---------|-------------|
| **Hemp fiber** | Textiles, rope, paper |
| **Hempcrete** | Sustainable building material |
| **Hemp plastic** | Biodegradable alternative |
| **Hemp biofuel** | Renewable energy research |
| **Hemp insulation** | Eco-friendly building insulation |

---

## Hemp Cultivation in Europe

### EU Hemp Regulations

| Requirement | Detail |
|-------------|--------|
| **Approved varieties** | EU catalogue of approved cultivars |
| **THC limit** | <0.2% at harvest |
| **Testing** | Required before/during harvest |
| **Licensing** | Member state licensing required |
| **Notification** | Authorities must be notified of cultivation |

### Major Hemp-Producing Countries (EU)

| Country | Hemp Hectares (est.) | Primary Use |
|---------|---------------------|-------------|
| **France** | ~18,000 | Fiber, CBD |
| **Germany** | ~5,000 | CBD, food |
| **Netherlands** | ~3,500 | CBD, seeds |
| **Poland** | ~3,000 | Fiber, CBD |
| **Italy** | ~4,000 | CBD, food |

---

## Hemp Compounds

### Cannabinoids in Hemp

| Cannabinoid | Typical Content | Properties |
|-------------|-----------------|------------|
| **[CBD](/glossary/cannabidiol)** | 3-20% | Non-intoxicating, most abundant |
| **[CBDA](/glossary/cbda)** | High (raw plant) | Raw form of CBD |
| **[CBG](/glossary/cannabigerol)** | 0.1-2% | "Mother cannabinoid" |
| **[CBN](/glossary/cannabinol)** | Trace | Forms from THC degradation |
| **[CBC](/glossary/cannabichromene)** | Trace-1% | Minor cannabinoid |
| **[THC](/glossary/tetrahydrocannabinol)** | <0.2% | Legally limited |

### Terpenes in Hemp

| Terpene | Aroma | Potential Effect |
|---------|-------|------------------|
| **[Myrcene](/glossary/myrcene)** | Earthy, musky | Relaxing |
| **[Limonene](/glossary/limonene)** | Citrus | Uplifting |
| **[Linalool](/glossary/linalool)** | Floral | Calming |
| **[Pinene](/glossary/pinene)** | Pine | Alertness |
| **[Caryophyllene](/glossary/caryophyllene)** | Peppery | Anti-inflammatory |

---

## Hemp Seed vs CBD Oil

A common source of confusion:

### Comparison

| Factor | Hemp Seed Oil | CBD Oil |
|--------|---------------|---------|
| **Source** | Seeds only | Flowers and leaves |
| **CBD content** | None | 5-20% typically |
| **THC content** | None | <0.2% (EU legal) |
| **Primary use** | Nutrition, cooking, skincare | Wellness, therapeutic |
| **Price** | Lower | Higher |
| **Regulation** | Food product | Novel Food (EU) |

**Important:** "Hemp oil" on labels can mean either. Always check for CBD content or look for "CBD oil" specifically.

---

## Is Hemp Safe?

### Safety Profile

| Aspect | Assessment |
|--------|------------|
| **CBD from hemp** | Generally well-tolerated |
| **Hemp seeds** | Safe food product |
| **Hemp fiber** | No safety concerns |
| **Drug interactions** | CBD may interact with some medications |
| **Contaminant risk** | Hemp absorbs heavy metals (quality testing important) |

### Who Should Be Cautious

| Group | Consideration |
|-------|---------------|
| **Medication users** | CBD drug interactions possible |
| **Pregnant/nursing** | Insufficient safety data |
| **Children** | Consult healthcare provider |
| **Pre-surgery** | Discontinue before procedures |

---

## Related Articles

- [Hemp vs Marijuana](/articles/hemp-vs-marijuana) - Detailed comparison
- [What is CBD?](/articles/what-is-cbd) - The main hemp-derived cannabinoid
- [How is CBD Made?](/articles/how-is-cbd-made) - From hemp to CBD oil
- [Full Spectrum vs Broad Spectrum vs Isolate](/articles/spectrum-comparison) - CBD product types

---

## Frequently Asked Questions

### Is hemp the same as marijuana?

Botanically, yes—they're the same species (*Cannabis sativa* L.). Legally and functionally, no. Hemp is defined by low THC content (<0.2% EU) and cannot cause intoxication. Marijuana has high THC (5-30%) and does cause intoxication.

### Can hemp get you high?

No. Legal hemp contains less than 0.2% THC (EU), far too little to cause any intoxicating effect. You would need to consume impossibly large amounts to feel any THC effects.

### Is hemp legal in Europe?

Yes, with conditions. Hemp cultivation requires approved varieties, THC testing, and licensing. CBD products from hemp are legal but regulated as Novel Foods. Individual country rules vary slightly.

### Does hemp seed oil contain CBD?

No. Hemp seeds do not contain cannabinoids, including CBD. Hemp seed oil is a nutritious food oil but has no CBD or THC. For CBD, you need products made from hemp flowers and leaves.

### Why is hemp used for CBD instead of marijuana?

Legal reasons primarily. Hemp-derived CBD is legal throughout the EU because hemp is legal. Marijuana-derived CBD would be a controlled substance. Chemically, the CBD molecule is identical regardless of source.

### Is hemp sustainable?

Yes. Hemp is considered highly sustainable: it grows quickly, requires minimal pesticides, improves soil health, sequesters carbon, and every part of the plant can be used. It's increasingly valued for eco-friendly products.

---

*Disclaimer: This article is for informational purposes only. Hemp regulations vary by country. Check local laws before cultivating or purchasing hemp products.*`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'cbd-basics').single();
  if (!category) {
    console.error('Category not found');
    return;
  }
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What is Hemp? The Complete Guide to Hemp',
    slug: 'what-is-hemp',
    excerpt: 'Hemp is cannabis with less than 0.2% THC (EU). Learn what hemp is, how it differs from marijuana, its uses, and why it is the source of legal CBD products.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'basics',
    category_id: category.id,
    reading_time: 10,
    meta_title: 'What is Hemp? Definition, Uses & CBD Connection',
    meta_description: 'Learn what hemp is, how it differs from marijuana, and why it is the primary source of legal CBD. Understand hemp uses, regulations, and compounds.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Article inserted:', data.slug);
}
main();
