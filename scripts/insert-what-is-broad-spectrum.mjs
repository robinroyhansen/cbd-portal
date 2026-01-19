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

**[Broad spectrum CBD](/glossary/broad-spectrum)** contains multiple hemp compounds—[CBD](/glossary/cannabidiol), other [cannabinoids](/glossary/cannabinoid-profile), and [terpenes](/glossary/terpenes)—but with [THC](/glossary/tetrahydrocannabinol) removed or reduced to non-detectable levels. It offers a middle ground between [full spectrum](/glossary/full-spectrum) and [isolate](/glossary/cbd-isolate): partial [entourage effect](/glossary/entourage-effect) benefits without THC concerns. Ideal for those who want more than isolate but cannot have any THC.

---

## Key Takeaways

- Broad spectrum = full spectrum **minus the THC**
- Contains CBD, other cannabinoids ([CBG](/glossary/cannabigerol), [CBC](/glossary/cannabichromene)), and terpenes
- **THC removed or non-detectable** (not always zero—check lab reports)
- May provide **partial entourage effect** benefits
- **Lower drug test risk** than full spectrum
- Good for **THC-sensitive individuals** or those drug tested

---

## What Makes CBD "Broad Spectrum"?

Broad spectrum sits between full spectrum and isolate on the processing scale.

### Broad Spectrum Composition

| Compound Type | Present? | Notes |
|---------------|----------|-------|
| **CBD** | Yes | Primary cannabinoid |
| **Minor cannabinoids** | Yes | CBG, CBC, CBN, etc. |
| **THC** | Removed/non-detectable | Key difference from full spectrum |
| **Terpenes** | Usually | May be reduced during THC removal |
| **Flavonoids** | Usually | Some preservation |

### Typical Cannabinoid Profile

| Cannabinoid | Typical Range | Notes |
|-------------|---------------|-------|
| **CBD** | 50-80% | Primary compound |
| **CBG** | 0.5-3% | Often well-preserved |
| **CBC** | 0.1-1% | Minor cannabinoid |
| **CBN** | 0-0.5% | Variable |
| **THC** | <0.01% or ND | Non-detectable target |

---

## How THC Is Removed

### Common THC Removal Methods

| Method | Process | Effect on Other Compounds |
|--------|---------|---------------------------|
| **Chromatography** | Selective compound separation | Preserves most terpenes |
| **Distillation** | Heat-based separation | May reduce terpenes |
| **THC remediation** | Chemical conversion | Variable results |
| **Reformulation** | Blend isolate with cannabinoids | Controlled profile |

### Quality Considerations

| Factor | What to Check |
|--------|---------------|
| **"Non-detectable" THC** | Check lab report detection limit |
| **Terpene preservation** | Some methods remove terpenes |
| **Cannabinoid profile** | Verify multiple cannabinoids present |
| **Third-party testing** | Confirms actual THC levels |

---

## Broad Spectrum vs Full Spectrum vs Isolate

### Complete Comparison

| Property | Broad Spectrum | [Full Spectrum](/glossary/full-spectrum) | [Isolate](/glossary/cbd-isolate) |
|----------|----------------|---------------|---------|
| **CBD** | Yes | Yes | Yes (99%+) |
| **CBG, CBC, CBN** | Yes | Yes | No |
| **Terpenes** | Usually | Yes | No |
| **THC** | Non-detectable | <0.2% | No |
| **Entourage effect** | Partial | Full | None |
| **Drug test risk** | Lower | Higher | Lowest |
| **Taste** | Hemp-like | Hemp-like | Neutral |

### The Entourage Effect Spectrum

| Product Type | Entourage Potential |
|--------------|---------------------|
| **Full spectrum** | Maximum—all compounds present |
| **Broad spectrum** | Partial—most compounds, no THC |
| **Isolate** | None—CBD alone |

---

## Who Should Choose Broad Spectrum?

### Ideal For

| Situation | Why Broad Spectrum Works |
|-----------|-------------------------|
| **Drug tested regularly** | Lower risk than full spectrum |
| **THC-sensitive** | No psychoactive compound |
| **Want entourage benefits** | Better than isolate |
| **Uncomfortable with any THC** | Personal preference met |
| **Professional/athletic use** | Career protection |
| **Starting out cautiously** | Safe introduction |

### When to Consider Alternatives

| Situation | Better Choice |
|-----------|---------------|
| **Maximum effectiveness desired** | Full spectrum |
| **Absolutely zero THC required** | Isolate (more controlled) |
| **Budget-conscious** | Isolate often cheaper |
| **Prefer neutral taste** | Isolate |

---

## Important Considerations

### "THC-Free" Claims

**Be cautious of "THC-free" marketing:**

| Claim | Reality |
|-------|---------|
| **"THC-free"** | Usually means non-detectable, not absolute zero |
| **Detection limits** | Labs can't detect below ~0.001% |
| **Batch variation** | THC removal isn't always perfect |
| **Verify with COA** | Always check third-party lab reports |

### Drug Test Risk

| Product | Relative Risk |
|---------|---------------|
| **Broad spectrum** | Low (but not zero) |
| **Full spectrum** | Higher |
| **Isolate** | Lowest |

Even broad spectrum products **may contain trace THC** below detection limits. If your career depends on drug tests, consider [isolate](/glossary/cbd-isolate) or discuss with your employer.

---

## Benefits of Broad Spectrum

### Advantages Over Isolate

| Benefit | Explanation |
|---------|-------------|
| **Partial entourage effect** | Multiple compounds work together |
| **Minor cannabinoid benefits** | CBG, CBC have own properties |
| **Terpene benefits** | If preserved during processing |
| **More "whole plant"** | Closer to natural hemp |

### Advantages Over Full Spectrum

| Benefit | Explanation |
|---------|-------------|
| **No THC concerns** | Professional/personal peace of mind |
| **Lower drug test risk** | Reduced THC accumulation |
| **THC sensitivity safe** | No psychoactive compound |

---

## How to Choose Quality Broad Spectrum

### What to Look For

| Quality Indicator | Why It Matters |
|-------------------|----------------|
| **Third-party COA** | Independent verification |
| **THC: "ND" or <0.01%** | Confirms removal |
| **Multiple cannabinoids listed** | Proves it's not relabeled isolate |
| **Terpene profile** | Shows careful processing |
| **Clear extraction method** | Quality indicator |

### Red Flags

| Warning Sign | Concern |
|--------------|---------|
| **No lab reports available** | Can't verify claims |
| **Only CBD listed** | May be isolate, not broad spectrum |
| **THC >0.05%** | Not properly processed |
| **Vague "THC-free" claims** | No verification |

---

## Product Types

### Common Broad Spectrum Formats

| Product | Best For |
|---------|----------|
| **CBD oil/tincture** | Flexible dosing |
| **Capsules** | Convenience, travel |
| **Gummies** | Taste, discretion |
| **Topicals** | Localised use |
| **Softgels** | Easy swallowing |

---

## Related Articles

- [Full Spectrum vs Broad Spectrum vs Isolate](/articles/spectrum-comparison) - Complete comparison
- [What is Full Spectrum CBD?](/articles/what-is-full-spectrum-cbd) - Full compound profile
- [What is CBD Isolate?](/articles/what-is-cbd-isolate) - Pure CBD option
- [CBD and Drug Testing](/articles/cbd-drug-testing) - Understanding THC risks

---

## Frequently Asked Questions

### Is broad spectrum really THC-free?

"THC-free" typically means non-detectable, not absolute zero. Labs have detection limits (usually ~0.001%). Broad spectrum products aim for no detectable THC, but trace amounts may exist below testing thresholds. Always verify with lab reports.

### Will broad spectrum show on a drug test?

Risk is low but not zero. Since broad spectrum may contain trace THC below detection limits, heavy use could theoretically accumulate. It's safer than full spectrum but not as safe as verified isolate products.

### Is broad spectrum as effective as full spectrum?

It depends. Broad spectrum offers partial [entourage effect](/glossary/entourage-effect) benefits from cannabinoids and terpenes, but without THC's contribution. Some research suggests THC (even in trace amounts) contributes to the entourage effect. Many users find broad spectrum effective.

### How can I tell if a product is truly broad spectrum?

Check the Certificate of Analysis (COA). True broad spectrum shows:
- Multiple cannabinoids (CBD + CBG + CBC, etc.)
- THC listed as "ND" (non-detect) or <0.01%
- Ideally a terpene profile

If only CBD is listed, it may actually be isolate.

### Why does broad spectrum still taste like hemp?

The terpenes and other plant compounds give broad spectrum its hemp taste. While THC is removed, the aromatic compounds remain. If you prefer neutral taste, consider [isolate](/glossary/cbd-isolate) products.

### Is broad spectrum legal in Europe?

Yes. Broad spectrum CBD from compliant hemp is legal throughout the EU. Since THC is removed, there are no concerns about exceeding the 0.2% THC limit. Products must still comply with Novel Food regulations.

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'cbd-basics').single();
  if (!category) {
    console.error('Category not found');
    return;
  }
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What is Broad Spectrum CBD? THC-Free Option Explained',
    slug: 'what-is-broad-spectrum-cbd',
    excerpt: 'Broad spectrum CBD contains multiple hemp compounds but no THC. Learn how it differs from full spectrum and isolate, who it is best for, and what to look for.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'basics',
    category_id: category.id,
    reading_time: 9,
    meta_title: 'What is Broad Spectrum CBD? Benefits & Who It Is For',
    meta_description: 'Learn what broad spectrum CBD is, how THC is removed, and who should choose it. Understand the difference from full spectrum and isolate.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Article inserted:', data.slug);
}
main();
