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

**CBD is made by extracting [cannabinoids](/glossary/cannabinoid-profile) from hemp plants**, typically using CO2 or ethanol as solvents. The hemp flowers are processed to pull out [CBD](/glossary/cannabidiol), other cannabinoids, and [terpenes](/glossary/terpenes). This crude extract is then refined through winterisation and distillation to remove unwanted compounds. The final extract is added to carrier oils to create CBD oil or further processed into [isolate](/glossary/cbd-isolate).

---

## Key Takeaways

- CBD comes from **[hemp](/glossary/hemp) plants** (Cannabis sativa with <0.2% [THC](/glossary/tetrahydrocannabinol))
- **CO2 extraction** is considered the gold standard for purity and safety
- The process: **Cultivation → Extraction → Refinement → Formulation**
- Different extraction methods produce different quality levels
- **Third-party testing** verifies the final product's safety and contents

---

## The CBD Production Journey

### From Seed to Bottle

| Stage | Process | Outcome |
|-------|---------|---------|
| **1. Cultivation** | Grow and harvest hemp | Raw plant material |
| **2. Extraction** | Pull compounds from plant | Crude extract |
| **3. Refinement** | Remove unwanted substances | Purified extract |
| **4. Formulation** | Create final product | CBD oil, capsules, etc. |
| **5. Testing** | Verify quality and safety | Certified product |

---

## Stage 1: Hemp Cultivation

### Growing CBD-Rich Hemp

| Factor | Consideration |
|--------|---------------|
| **Genetics** | High-CBD, low-THC cultivars selected |
| **Growing conditions** | Climate, soil, water management |
| **Organic practices** | Pesticide and herbicide-free preferred |
| **Harvest timing** | Peak cannabinoid content |
| **EU compliance** | Approved varieties, <0.2% THC |

### What Part of the Plant Is Used?

| Plant Part | CBD Content | Use |
|------------|-------------|-----|
| **Flowers (buds)** | Highest | Premium extractions |
| **Sugar leaves** | Moderate | Often included |
| **Fan leaves** | Low | Sometimes used |
| **Stalks** | Minimal | Rarely used for CBD |
| **Seeds** | None | Used for hemp seed oil (no CBD) |

---

## Stage 2: Extraction Methods

### The Goal of Extraction

Extraction separates [cannabinoids](/glossary/cannabinoid-profile), [terpenes](/glossary/terpenes), and other compounds from the plant material.

### CO2 Extraction (Supercritical)

| Aspect | Detail |
|--------|--------|
| **How it works** | CO2 under high pressure acts as solvent |
| **Quality** | Industry gold standard |
| **Advantages** | No residual solvents, precise control |
| **Disadvantages** | Expensive equipment |
| **Terpene preservation** | Excellent |
| **Used for** | Premium [full spectrum](/glossary/full-spectrum) products |

### Ethanol Extraction

| Aspect | Detail |
|--------|--------|
| **How it works** | Alcohol dissolves cannabinoids |
| **Quality** | High quality when done properly |
| **Advantages** | Efficient, scalable, food-safe |
| **Disadvantages** | May extract chlorophyll, requires evaporation |
| **Terpene preservation** | Good to moderate |
| **Used for** | Large-scale production |

### Hydrocarbon Extraction

| Aspect | Detail |
|--------|--------|
| **How it works** | Butane/propane dissolve cannabinoids |
| **Quality** | Can be high, requires skill |
| **Advantages** | Preserves terpenes well, efficient |
| **Disadvantages** | Safety concerns, residual solvent risk |
| **Terpene preservation** | Excellent |
| **Used for** | Concentrates, some oils |

### Olive Oil Extraction (Home Method)

| Aspect | Detail |
|--------|--------|
| **How it works** | Heat hemp in olive oil |
| **Quality** | Lower, not concentrated |
| **Advantages** | Safe, simple, no special equipment |
| **Disadvantages** | Perishable, imprecise, low potency |
| **Terpene preservation** | Good |
| **Used for** | DIY/home production |

### Extraction Method Comparison

| Method | Quality | Safety | Cost | Scale |
|--------|---------|--------|------|-------|
| **CO2** | Highest | Excellent | High | Commercial |
| **Ethanol** | High | Good | Medium | Commercial |
| **Hydrocarbon** | High | Needs care | Medium | Commercial |
| **Olive oil** | Lower | Safe | Low | Home |

---

## Stage 3: Refinement

After extraction, the crude extract requires further processing.

### Winterisation

| Purpose | Process |
|---------|---------|
| **Removes** | Fats, waxes, lipids |
| **Method** | Mix extract with ethanol, freeze, filter |
| **Result** | Cleaner extract |
| **Why needed** | Improves taste, clarity, shelf life |

### Decarboxylation

| Purpose | Process |
|---------|---------|
| **Converts** | [CBDA](/glossary/cbda) to CBD, [THCA](/glossary/thca) to THC |
| **Method** | Controlled heat (~110°C for 30-45 min) |
| **Result** | Active cannabinoids |
| **Why needed** | Raw cannabinoid acids must be converted |

### Distillation

| Purpose | Process |
|---------|---------|
| **Creates** | Highly concentrated CBD distillate |
| **Method** | Heat-based separation of compounds |
| **Result** | 70-90% CBD extract |
| **Why needed** | Higher purity, removes impurities |

### Further Purification (For Isolate)

| Purpose | Process |
|---------|---------|
| **Creates** | 99%+ pure [CBD isolate](/glossary/cbd-isolate) |
| **Method** | Chromatography + crystallisation |
| **Result** | Pure CBD crystals |
| **Why needed** | Some products require pure CBD |

---

## Stage 4: Formulation

The refined extract is then made into consumer products.

### Creating CBD Oil

| Step | Process |
|------|---------|
| **1** | Calculate desired CBD concentration |
| **2** | Measure refined extract |
| **3** | Add carrier oil (MCT, olive, hemp seed) |
| **4** | Mix thoroughly |
| **5** | Add flavouring (optional) |
| **6** | Package in dark glass bottles |

### Common Carrier Oils

| Carrier | Benefits | Taste |
|---------|----------|-------|
| **MCT oil** | Fast absorption, neutral | Mild |
| **Hemp seed oil** | Additional omega fatty acids | Nutty |
| **Olive oil** | Familiar, widely available | Distinct |
| **Coconut oil** | Solid at room temperature | Tropical |

### Product Types Created

| Product | Formulation |
|---------|-------------|
| **CBD oil/tinctures** | Extract + carrier oil |
| **Capsules** | Oil in gelatin/vegan shell |
| **Gummies** | Extract in candy base |
| **Topicals** | Extract in cream/balm base |
| **Vapes** | Extract with vape-safe carriers |

---

## Stage 5: Testing and Quality Assurance

### Required Tests

| Test | Purpose |
|------|---------|
| **Cannabinoid profile** | Verify CBD content, THC level |
| **Terpene profile** | Confirm terpene content |
| **Heavy metals** | Check for lead, mercury, etc. |
| **Pesticides** | Ensure no residues |
| **Microbial** | Test for mold, bacteria |
| **Residual solvents** | Verify no extraction chemicals remain |

### Certificate of Analysis (COA)

| Element | What It Shows |
|---------|---------------|
| **Cannabinoid percentages** | Exact CBD, THC, other levels |
| **Batch number** | Traceability |
| **Testing lab** | Third-party verification |
| **Date** | When testing occurred |
| **Pass/fail** | Compliance with standards |

---

## Full Spectrum vs Isolate Production

### Production Differences

| Stage | Full Spectrum | Isolate |
|-------|---------------|---------|
| **Extraction** | Same | Same |
| **Winterisation** | Yes | Yes |
| **Distillation** | Minimal | Extensive |
| **Chromatography** | No | Yes (isolates CBD) |
| **Final purity** | 40-70% CBD | 99%+ CBD |
| **Other compounds** | Preserved | Removed |

---

## Quality Indicators

### Signs of Quality Production

| Indicator | What It Means |
|-----------|---------------|
| **CO2 extracted** | Gold standard method |
| **Third-party tested** | Independent verification |
| **Organic hemp** | No pesticide concerns |
| **Full COA available** | Transparency |
| **EU-grown hemp** | Regulated cultivation |

### Red Flags

| Warning | Concern |
|---------|---------|
| **No extraction method stated** | Unknown quality |
| **No lab reports** | Cannot verify contents |
| **Unrealistic prices** | Quality may be compromised |
| **Unverifiable claims** | Marketing over substance |

---

## Related Articles

- [What is Full Spectrum CBD?](/articles/what-is-full-spectrum-cbd) - Full compound extraction
- [What is CBD Isolate?](/articles/what-is-cbd-isolate) - Pure CBD production
- [CBD Bioavailability](/articles/cbd-bioavailability) - How your body absorbs CBD
- [What is Hemp?](/articles/what-is-hemp) - The CBD source plant

---

## Frequently Asked Questions

### Is CBD synthetic or natural?

Commercial CBD is extracted from natural hemp plants—it's plant-derived. Synthetic cannabinoids exist but are different substances. Always look for products from natural hemp extraction.

### Why does extraction method matter?

Extraction affects purity, safety, and compound preservation. CO2 extraction leaves no solvent residues and preserves terpenes well. Lower-quality methods may leave residues or destroy beneficial compounds.

### Does CO2 extraction mean higher quality?

Generally, yes. CO2 extraction is considered the gold standard because it's clean, precise, and preserves the full spectrum of compounds. However, ethanol extraction can also produce quality products when done properly.

### What's the difference between crude extract and distillate?

Crude extract is the first result of extraction—contains CBD plus plant material, waxes, and chlorophyll. Distillate is further refined—removing impurities for a cleaner, more concentrated product (70-90% CBD).

### Can I make CBD oil at home?

Technically yes, using olive oil extraction. However, home extraction produces low-potency, imprecise products that spoil quickly. Commercial products offer consistent quality, verified contents, and proper storage stability.

### How do companies control THC levels?

Through genetics (low-THC hemp varieties), testing during cultivation, and post-extraction testing. For [broad spectrum](/glossary/broad-spectrum), additional processing removes THC. All products should be third-party tested to verify THC compliance.

---

*Disclaimer: This article is for informational purposes only. CBD production requires proper licensing, equipment, and compliance with regulations. This is not a guide for manufacturing CBD.*`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'cbd-basics').single();
  if (!category) {
    console.error('Category not found');
    return;
  }
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'How is CBD Made? From Hemp Plant to CBD Oil',
    slug: 'how-is-cbd-made',
    excerpt: 'Learn how CBD is made from hemp plants through extraction and refinement. Understand CO2 vs ethanol extraction, distillation, and what makes quality CBD products.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'basics',
    category_id: category.id,
    reading_time: 11,
    meta_title: 'How is CBD Made? Complete Production Process Explained',
    meta_description: 'Understand how CBD is extracted from hemp and made into products. Learn about CO2 extraction, distillation, and quality indicators.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Article inserted:', data.slug);
}
main();
