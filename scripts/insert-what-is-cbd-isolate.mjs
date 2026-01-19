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

**[CBD isolate](/glossary/cbd-isolate)** is pure cannabidiol—99%+ [CBD](/glossary/cannabidiol) with no other cannabinoids, [terpenes](/glossary/terpenes), or [THC](/glossary/tetrahydrocannabinol). It's typically a white crystalline powder or solid that's flavourless and odourless. Isolate offers precise dosing and zero THC risk, making it ideal for drug-tested individuals, though it lacks the [entourage effect](/glossary/entourage-effect) benefits of full or broad spectrum.

---

## Key Takeaways

- CBD isolate is **99%+ pure CBD**—nothing else
- **Zero THC**—safest option for drug tests
- **No entourage effect**—CBD works alone
- **Flavourless and odourless**—easy to use in any format
- Often **most affordable** per milligram of CBD
- **Precise, consistent dosing**—same every time

---

## What Is CBD Isolate?

CBD isolate is the purest form of cannabidiol commercially available.

### Composition

| Component | Content |
|-----------|---------|
| **CBD** | 99%+ |
| **Other cannabinoids** | None |
| **THC** | None (0%) |
| **Terpenes** | None |
| **Flavonoids** | None |
| **Plant matter** | None |

### Physical Properties

| Property | Description |
|----------|-------------|
| **Appearance** | White crystalline powder or solid |
| **Taste** | Flavourless |
| **Smell** | Odourless |
| **Solubility** | Fat-soluble |
| **Texture** | Fine powder or crystal |

---

## How CBD Isolate Is Made

### Production Process

| Step | Process | Result |
|------|---------|--------|
| **1. Extraction** | CO2/ethanol from hemp | Crude extract |
| **2. Winterisation** | Cold filtration | Remove fats/waxes |
| **3. Distillation** | Heat separation | CBD distillate (~80%) |
| **4. Chromatography** | Compound isolation | Pure CBD (~99%) |
| **5. Crystallisation** | Cooling/precipitation | CBD crystals |
| **6. Testing** | Purity verification | Certified isolate |

### Why the Extra Processing?

| Full Spectrum | Isolate |
|---------------|---------|
| Minimal processing | Extensive purification |
| Contains all compounds | Single compound only |
| Natural terpene profile | No terpenes |
| Trace THC present | Zero THC |

---

## CBD Isolate vs Full Spectrum vs Broad Spectrum

### Complete Comparison

| Property | Isolate | [Broad Spectrum](/glossary/broad-spectrum) | [Full Spectrum](/glossary/full-spectrum) |
|----------|---------|----------------|---------------|
| **CBD purity** | 99%+ | 50-80% | 40-70% |
| **Other cannabinoids** | No | Yes | Yes |
| **THC** | 0% | Non-detectable | <0.2% |
| **Terpenes** | No | Usually | Yes |
| **Entourage effect** | No | Partial | Full |
| **Taste** | None | Hemp-like | Hemp-like |
| **Drug test risk** | Lowest | Low | Higher |
| **Price per mg CBD** | Usually lowest | Medium | Higher |

### The Entourage Effect Trade-Off

| Consideration | Isolate | Full/Broad Spectrum |
|---------------|---------|---------------------|
| **How CBD works** | Alone | Synergistically |
| **Dose-response** | Bell-shaped curve | More linear |
| **Higher doses may be needed** | Yes | Usually no |
| **Consistency** | Very consistent | Natural variation |

---

## Who Should Choose CBD Isolate?

### Ideal For

| Situation | Why Isolate Works |
|-----------|-------------------|
| **Drug tested regularly** | Zero THC risk |
| **Extremely THC-sensitive** | No trace amounts |
| **Dislike hemp taste** | Completely neutral |
| **Precise dosing needs** | Consistent purity |
| **DIY product making** | Easy to measure and add |
| **Cooking/baking** | No flavour interference |
| **Medication concerns** | Simpler interaction profile |

### When to Consider Alternatives

| Situation | Better Choice |
|-----------|---------------|
| **Want maximum effectiveness** | Full spectrum |
| **Interested in terpene benefits** | Full/broad spectrum |
| **Budget allows** | Full spectrum often preferred |
| **Seeking "whole plant" experience** | Full spectrum |

---

## Using CBD Isolate

### Product Formats

| Format | Description |
|--------|-------------|
| **Powder** | Raw isolate for DIY use |
| **CBD oil (isolate-based)** | Isolate dissolved in carrier oil |
| **Capsules** | Pre-measured doses |
| **Gummies** | Flavoured, discrete |
| **Topicals** | Isolate in cream base |

### DIY Uses for Isolate Powder

| Application | How To |
|-------------|--------|
| **Make your own oil** | Dissolve in MCT or olive oil |
| **Add to food/drinks** | Mix into smoothies, coffee |
| **Cooking** | Add to recipes |
| **Custom topicals** | Mix with unscented lotion |
| **Precise supplementation** | Weigh exact doses |

### Dosing Isolate Powder

| Measurement | Approximate CBD |
|-------------|-----------------|
| **1 gram powder** | ~990mg CBD |
| **100mg powder** | ~99mg CBD |
| **10mg powder** | ~9.9mg CBD |

**Tip:** Use a precision scale (0.01g accuracy) for accurate dosing.

---

## Benefits of CBD Isolate

### Advantages

| Benefit | Explanation |
|---------|-------------|
| **Zero THC** | Absolute certainty, no drug test concerns |
| **Flavourless** | Works in any application |
| **Affordable** | Often cheapest per mg CBD |
| **Consistent** | Same purity every time |
| **Versatile** | Powder form allows many uses |
| **Precise** | Easy to measure exact doses |

### When Isolate Excels

| Use Case | Why Isolate Works |
|----------|-------------------|
| **Athletes** | WADA-compliant, zero THC |
| **Pilots, drivers** | Career-critical drug testing |
| **Sensitive individuals** | Pure compound, no variables |
| **Cooking/edibles** | No taste interference |
| **Scientific research** | Controlled single variable |

---

## Potential Drawbacks

### Limitations

| Concern | Reality |
|---------|---------|
| **No entourage effect** | CBD works alone, may need higher doses |
| **Bell-shaped dose response** | Very high doses may be less effective |
| **Missing terpene benefits** | No aromatherapeutic properties |
| **Less "natural"** | Highly processed product |
| **May require more product** | Compared to full spectrum for same effect |

### The Bell-Shaped Curve

Research suggests CBD isolate has a "bell-shaped" dose-response:
- Low doses: Some effect
- Optimal dose: Maximum effect
- High doses: Diminishing returns

[Full spectrum](/glossary/full-spectrum) appears to have a more linear response—effects continue to increase with dose.

---

## Quality Considerations

### What to Look For

| Indicator | Why It Matters |
|-----------|----------------|
| **Third-party COA** | Verifies purity claims |
| **99%+ CBD confirmed** | True isolate standard |
| **0% THC verified** | Should be non-detect |
| **Heavy metal testing** | Safety verification |
| **Solvent testing** | No residual chemicals |

### Red Flags

| Warning Sign | Concern |
|--------------|---------|
| **Purity below 99%** | Not true isolate |
| **Any THC detected** | Contamination or mislabeling |
| **No lab reports** | Cannot verify claims |
| **Unusually cheap** | Quality may be compromised |

---

## Related Articles

- [Full Spectrum vs Broad Spectrum vs Isolate](/articles/spectrum-comparison) - Complete comparison
- [What is Full Spectrum CBD?](/articles/what-is-full-spectrum-cbd) - Full compound profile
- [What is Broad Spectrum CBD?](/articles/what-is-broad-spectrum-cbd) - THC-free alternative
- [The Entourage Effect](/articles/entourage-effect) - Why compounds work together

---

## Frequently Asked Questions

### Is CBD isolate better than full spectrum?

Not necessarily. Isolate is purer but may be less effective due to lacking the [entourage effect](/glossary/entourage-effect). Research suggests full spectrum works at lower doses. Isolate is better for specific needs: drug tests, THC sensitivity, or neutral taste requirements.

### Can you fail a drug test with CBD isolate?

Very unlikely. True CBD isolate contains 0% THC. However, ensure your product is genuine isolate with third-party lab verification. Cross-contamination during manufacturing is possible with low-quality products.

### Why does CBD isolate cost less than full spectrum?

Isolate's lower cost per mg reflects higher total CBD content (99% vs 40-70%). A 1000mg isolate product is nearly pure CBD. A 1000mg full spectrum product contains CBD plus other compounds. Per-product prices may be similar, but CBD concentration differs.

### Is CBD isolate legal?

Yes. CBD isolate from hemp is legal throughout the EU. Since it contains 0% THC, there are no concerns about THC limits. Products must still comply with Novel Food regulations and local laws.

### How do I use CBD isolate powder?

Common methods:
- Dissolve in carrier oil (MCT, olive) for sublingual use
- Add to food or drinks
- Mix into topical products
- Weigh and take directly
- Use in cooking/baking

Use a precision scale for accurate dosing.

### Does CBD isolate have any taste?

No. Pure CBD isolate is completely flavourless and odourless. This makes it ideal for adding to food, drinks, or making custom products where you don't want hemp taste.

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'cbd-basics').single();
  if (!category) {
    console.error('Category not found');
    return;
  }
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What is CBD Isolate? Pure CBD Explained',
    slug: 'what-is-cbd-isolate',
    excerpt: 'CBD isolate is 99%+ pure CBD with zero THC, terpenes, or other cannabinoids. Learn who it is best for, how it compares to full spectrum, and how to use it.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'basics',
    category_id: category.id,
    reading_time: 9,
    meta_title: 'What is CBD Isolate? Pure CBD Benefits & Uses',
    meta_description: 'Learn what CBD isolate is, how it is made, and who should use it. Understand the trade-offs versus full spectrum and when pure CBD is the right choice.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Article inserted:', data.slug);
}
main();
