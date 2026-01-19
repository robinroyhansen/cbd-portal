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
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
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

[Full spectrum](/glossary/full-spectrum) CBD contains all cannabis compounds including trace [THC](/glossary/tetrahydrocannabinol) (<0.3%), [broad spectrum](/glossary/broad-spectrum) has multiple cannabinoids but zero THC, and [CBD isolate](/glossary/cbd-isolate) is pure CBD only. Full spectrum may offer the strongest benefits due to the [entourage effect](/glossary/entourage-effect), but broad spectrum or isolate is better if you're drug tested or THC-sensitive. All three types are legal under the 2018 Farm Bill.

---

## Understanding the Three Types

The cannabis plant produces over 100 [cannabinoids](/glossary/cannabinoid-profile), plus [terpenes](/glossary/terpenes), flavonoids, and other compounds. How much of this stays in your CBD product determines its "spectrum."

### Quick Comparison

| Type | CBD | Other Cannabinoids | THC | Terpenes | Entourage Effect |
|------|-----|-------------------|-----|----------|------------------|
| **Full Spectrum** | Yes | CBC, CBG, CBN, etc. | <0.3% | Yes | Maximum |
| **Broad Spectrum** | Yes | CBC, CBG, CBN, etc. | 0% (removed) | Usually | Partial |
| **CBD Isolate** | Yes | None | 0% | None | None |

---

## Full Spectrum CBD

[Full spectrum](/glossary/full-spectrum) CBD extract contains everything the hemp plant produces, within legal limits.

### What's In Full Spectrum

| Component | Present? | Purpose |
|-----------|----------|---------|
| **[CBD](/glossary/cannabidiol)** | Yes (dominant) | Primary therapeutic compound |
| **[THC](/glossary/tetrahydrocannabinol)** | Yes (<0.3%) | Entourage contributor |
| **[CBG](/glossary/cannabigerol)** | Yes (minor) | Anti-inflammatory, antibacterial |
| **[CBN](/glossary/cannabinol)** | Yes (minor) | Sedative potential |
| **[CBC](/glossary/cannabichromene)** | Yes (minor) | Anti-inflammatory, mood |
| **[CBDV](/glossary/cannabidivarin)** | Trace | Nausea, seizures research |
| **[Terpenes](/glossary/terpenes)** | Yes | Flavor, entourage effects |
| **Flavonoids** | Yes | Antioxidant, anti-inflammatory |
| **Fatty acids** | Yes | Carrier compounds |
| **Chlorophyll** | Sometimes | Green color (often removed) |

### Full Spectrum Advantages

| Advantage | Explanation |
|-----------|-------------|
| **[Entourage effect](/glossary/entourage-effect)** | All compounds work synergistically |
| **Lower doses needed** | Entourage effect may increase potency |
| **Most natural** | Closest to whole plant |
| **Broadest research base** | Many studies use full spectrum |

### Full Spectrum Disadvantages

| Disadvantage | Explanation |
|--------------|-------------|
| **Contains THC** | Drug test risk (even at <0.3%) |
| **THC sensitivity** | Some people react to any THC |
| **Legal gray areas** | Some states/countries more restrictive |
| **Variable taste** | Natural hemp flavor |

### Will Full Spectrum Cause a Drug Test Failure?

**Possibly.** While 0.3% THC won't cause intoxication, regular use of high-dose full spectrum products can accumulate enough THC metabolites to trigger a positive drug test.

| Usage Pattern | Drug Test Risk |
|---------------|----------------|
| Low dose, occasional | Very low |
| Moderate dose, regular | Low to moderate |
| High dose, daily | Moderate to high |

If you're drug tested, consider broad spectrum or isolate instead.

---

## Broad Spectrum CBD

[Broad spectrum](/glossary/broad-spectrum) CBD offers a middle ground—multiple cannabinoids and terpenes, but with THC removed.

### What's In Broad Spectrum

| Component | Present? | Notes |
|-----------|----------|-------|
| **CBD** | Yes (dominant) | Same as full spectrum |
| **THC** | No (removed) | Below detection limits |
| **CBG** | Yes | Preserved |
| **CBN** | Yes | Preserved |
| **CBC** | Yes | Preserved |
| **Terpenes** | Usually | May be reduced by processing |
| **Flavonoids** | Usually | Some lost in THC removal |

### How THC Is Removed

Manufacturers use various methods:

| Method | Pros | Cons |
|--------|------|------|
| **Chromatography** | Precise, preserves other compounds | Expensive |
| **Distillation** | Effective | May lose terpenes |
| **Chemical conversion** | Can be cost-effective | Quality concerns |

### Broad Spectrum Advantages

| Advantage | Explanation |
|-----------|-------------|
| **Zero THC** | No drug test risk |
| **Partial entourage effect** | Multiple cannabinoids present |
| **Legal everywhere** | No THC concerns |
| **Good compromise** | Benefits without THC risks |

### Broad Spectrum Disadvantages

| Disadvantage | Explanation |
|--------------|-------------|
| **Reduced entourage** | Missing THC's contribution |
| **Processing losses** | Some compounds lost during THC removal |
| **Quality varies** | THC removal methods differ |
| **May cost more** | Additional processing required |

---

## CBD Isolate

[CBD isolate](/glossary/cbd-isolate) is the purest form—99%+ pure cannabidiol with nothing else.

### What's In CBD Isolate

| Component | Present? | Percentage |
|-----------|----------|------------|
| **CBD** | Yes | 99%+ |
| **THC** | No | 0% |
| **Other cannabinoids** | No | 0% |
| **Terpenes** | No | 0% |
| **Other plant matter** | No | 0% |

### CBD Isolate Advantages

| Advantage | Explanation |
|-----------|-------------|
| **Zero THC guaranteed** | Impossible to fail drug test |
| **Precise dosing** | Know exactly how much CBD |
| **No taste/smell** | Flavorless, odorless |
| **Versatile** | Easy to add to products |
| **Lowest cost** | Often cheapest per mg CBD |

### CBD Isolate Disadvantages

| Disadvantage | Explanation |
|--------------|-------------|
| **No entourage effect** | CBD works alone |
| **Higher doses may be needed** | Without synergy |
| **Bell-curve dosing** | Effectiveness may decrease at high doses |
| **Less "natural"** | Highly processed |

### The Isolate Bell Curve Problem

Research suggests CBD isolate has a "bell-shaped" dose-response curve—effectiveness increases up to a point, then decreases at higher doses. Full spectrum CBD doesn't show this pattern, likely due to the entourage effect.

| Finding | Implication |
|---------|-------------|
| Isolate effectiveness peaks then drops | Narrow therapeutic window |
| Full spectrum shows linear response | More predictable dosing |

---

## The Entourage Effect Explained

The [entourage effect](/glossary/entourage-effect) is the theory that cannabis compounds work better together than in isolation.

### How the Entourage Effect Works

| Interaction | Example |
|-------------|---------|
| **Cannabinoid synergy** | CBD + THC more effective than either alone |
| **Terpene enhancement** | [Myrcene](/glossary/myrcene) may increase CBD absorption |
| **Receptor modulation** | Multiple compounds hit multiple targets |
| **Metabolism effects** | Some compounds affect how others are processed |

### Research Evidence

| Study | Finding |
|-------|---------|
| Gallily et al., 2015 | Full spectrum CBD more effective than isolate for inflammation |
| Russo, 2011 | Terpenes contribute to cannabis therapeutic effects |
| Multiple clinical | Whole plant extracts often outperform single cannabinoids |

### Entourage Effect by Spectrum Type

| Type | Entourage Level | Compounds Working Together |
|------|-----------------|---------------------------|
| **Full Spectrum** | Maximum | All cannabinoids, terpenes, flavonoids |
| **Broad Spectrum** | Partial | Multiple cannabinoids, some terpenes (no THC) |
| **CBD Isolate** | None | CBD alone |

---

## Which Type Should You Choose?

The best choice depends on your specific situation.

### Decision Guide

| If you... | Consider... | Reason |
|-----------|-------------|--------|
| Are drug tested | Broad spectrum or isolate | Zero THC risk |
| Want maximum effect | Full spectrum | Complete entourage effect |
| Are THC-sensitive | Isolate (safest) or broad spectrum | No THC reaction |
| Need precise dosing | Isolate | Purest, most predictable |
| Want natural product | Full spectrum | Least processed |
| Live in restrictive state | Broad spectrum or isolate | Extra legal safety |
| Are new to CBD | Broad spectrum | Good starting point |

### Use Case Recommendations

| Purpose | Best Choice | Why |
|---------|-------------|-----|
| **General wellness** | Full spectrum | Maximum benefits |
| **[Anxiety](/glossary/anxiety)** | Full or broad spectrum | Entourage may help |
| **[Sleep](/glossary/sleep-disorders)** | Full spectrum | CBN adds sedation |
| **[Pain](/glossary/chronic-pain)** | Full spectrum | THC contributes to pain relief |
| **Athletes (drug tested)** | Isolate | Zero risk |
| **Workplace testing** | Isolate or broad spectrum | Safety first |
| **Cooking/recipes** | Isolate | No taste |

---

## Quality Considerations for Each Type

How to ensure you're getting a quality product regardless of spectrum type.

### What to Look For

| Factor | Full Spectrum | Broad Spectrum | Isolate |
|--------|---------------|----------------|---------|
| **Third-party testing** | Essential | Essential | Essential |
| **THC verification** | <0.3% confirmed | 0% confirmed | 0% confirmed |
| **Cannabinoid profile** | Shows multiple | Shows multiple | Shows 99%+ CBD |
| **Terpene testing** | Look for it | Look for it | N/A |
| **Pesticide testing** | Required | Required | Required |
| **Heavy metal testing** | Required | Required | Required |

### Red Flags by Type

| Type | Watch Out For |
|------|---------------|
| **Full Spectrum** | THC over 0.3%, missing COA |
| **Broad Spectrum** | THC detected when claims "zero" |
| **Isolate** | Less than 99% purity, additives |

---

## Price Comparison

Different spectrum types have different price points.

### Typical Pricing (per mg CBD)

| Type | Price Range | Why |
|------|-------------|-----|
| **CBD Isolate** | $0.02-0.05/mg | Simple extraction |
| **Broad Spectrum** | $0.05-0.10/mg | Additional processing |
| **Full Spectrum** | $0.05-0.15/mg | Premium whole plant |

### Cost-Effectiveness Consideration

Lower price per mg doesn't always mean better value:

| Factor | Impact |
|--------|--------|
| Entourage effect | Full spectrum may need lower doses |
| Quality differences | Cheap products may be inferior |
| Processing methods | Better methods cost more |

---

## Legal Status

All three types are federally legal in the US if derived from hemp.

### Legal Comparison

| Type | Federal Status (US) | State Variations |
|------|---------------------|------------------|
| **Full Spectrum** | Legal (<0.3% THC) | Some states more restrictive |
| **Broad Spectrum** | Legal (0% THC) | Generally no issues |
| **Isolate** | Legal (0% THC) | Generally no issues |

### International Considerations

| Region | Considerations |
|--------|----------------|
| **Europe** | THC limit 0.2% in many countries |
| **UK** | Broad spectrum often preferred |
| **Canada** | Regulated differently |
| **Asia** | Often strict; verify before traveling |

---

## Related Articles

- [The Entourage Effect Explained](/articles/entourage-effect) - Why whole-plant may work better
- [CBD Bioavailability](/articles/cbd-bioavailability) - How delivery method affects absorption
- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action

---

## Frequently Asked Questions

### Will full spectrum CBD make me high?

No. Legal full spectrum CBD contains less than 0.3% THC—far too little to cause intoxication. You'd need to consume impossibly large amounts to feel psychoactive effects. However, very sensitive individuals might notice subtle THC effects at high doses.

### Can I fail a drug test with broad spectrum CBD?

It's very unlikely but theoretically possible. "Zero THC" broad spectrum should have no detectable THC, but quality varies. Look for third-party testing showing "ND" (not detected) for THC. Isolate is the safest choice if you're tested.

### Is CBD isolate less effective than full spectrum?

Research suggests full spectrum may be more effective for many applications due to the [entourage effect](/glossary/entourage-effect). However, isolate works well for many people, especially at appropriate doses. If you can't use THC, broad spectrum offers a middle ground.

### Why does broad spectrum cost more than isolate?

Broad spectrum requires additional processing to remove THC while preserving other cannabinoids—this adds cost. The resulting product offers more benefits than isolate due to partial entourage effects, justifying the price difference for many users.

### How do I know if a product is truly what it claims?

Always check third-party lab tests (Certificate of Analysis/COA). For full spectrum, verify THC is present but under 0.3%. For broad spectrum, verify THC is "ND" (not detected) but other cannabinoids are present. For isolate, verify CBD purity is 99%+.

### Which type is best for beginners?

Broad spectrum is often recommended for beginners. It offers entourage benefits without THC concerns, works for drug-tested individuals, and provides a good baseline to evaluate CBD's effects before potentially trying full spectrum.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. CBD products are not FDA-approved to treat any medical condition. Consult a healthcare professional before using CBD, especially if taking medications or facing drug testing.*

---

### References

1. Gallily R, et al. Overcoming the bell-shaped dose-response of cannabidiol by using cannabis extract enriched in cannabidiol. *Pharmacol Pharm*. 2015;6(2):75-85.

2. Russo EB. Taming THC: potential cannabis synergy and phytocannabinoid-terpenoid entourage effects. *Br J Pharmacol*. 2011;163(7):1344-1364.

3. Pamplona FA, et al. Potential clinical benefits of CBD-rich cannabis extracts over purified CBD in treatment-resistant epilepsy. *Front Neurol*. 2018;9:759.

4. Hanuš LO, et al. Phytocannabinoids: a unified critical inventory. *Nat Prod Rep*. 2016;33(12):1357-1392.

5. Agriculture Improvement Act of 2018 (2018 Farm Bill). Public Law 115-334.`;

async function main() {
  const { data: category, error: catError } = await supabase
    .from('kb_categories')
    .select('id')
    .eq('slug', 'science')
    .single();

  if (catError || !category) {
    console.error('Science category not found:', catError);
    return;
  }

  const { data, error } = await supabase
    .from('kb_articles')
    .insert({
      title: 'Full Spectrum vs. Broad Spectrum vs. Isolate: CBD Types Compared',
      slug: 'spectrum-comparison',
      excerpt: 'Compare full spectrum, broad spectrum, and CBD isolate. Learn which type is best for drug testing, maximum effects, or THC sensitivity—plus how the entourage effect impacts each.',
      content: content,
      status: 'published',
      featured: false,
      article_type: 'science',
      category_id: category.id,
      reading_time: 12,
      meta_title: 'Full Spectrum vs Broad Spectrum vs CBD Isolate: Complete Guide',
      meta_description: 'Understand the differences between full spectrum, broad spectrum, and CBD isolate. Learn which CBD type is right for your needs, drug testing concerns, and goals.',
      language: 'en',
      published_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Article inserted successfully!');
    console.log('ID:', data.id);
    console.log('Slug:', data.slug);
    console.log('Category ID:', data.category_id);
    console.log('URL: /articles/' + data.slug);
  }
}

main();
