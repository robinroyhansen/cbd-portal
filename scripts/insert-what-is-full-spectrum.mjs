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

**[Full spectrum CBD](/glossary/full-spectrum)** contains all naturally occurring compounds from the hemp plant—[CBD](/glossary/cannabidiol), other [cannabinoids](/glossary/cannabinoid-profile), [terpenes](/glossary/terpenes), and [flavonoids](/glossary/flavonoids)—including trace [THC](/glossary/tetrahydrocannabinol) (<0.2% EU legal). This complete plant profile may produce the [entourage effect](/glossary/entourage-effect), where compounds work together synergistically. Full spectrum is often considered the most effective CBD type.

---

## Key Takeaways

- Full spectrum contains **all hemp compounds**, including trace THC (<0.2%)
- May benefit from the **[entourage effect](/glossary/entourage-effect)**—synergistic compound interaction
- **Most popular choice** for those seeking maximum effectiveness
- Contains trace THC—**may trigger drug tests** with regular use
- Often has an **earthy, hemp taste** (natural plant flavours)

---

## What Makes CBD "Full Spectrum"?

Full spectrum means the extract preserves the complete range of beneficial compounds from hemp.

### Full Spectrum Composition

| Compound Type | Examples | Role |
|---------------|----------|------|
| **Primary cannabinoid** | [CBD](/glossary/cannabidiol) (majority) | Main active compound |
| **Minor cannabinoids** | [CBG](/glossary/cannabigerol), [CBC](/glossary/cannabichromene), [CBN](/glossary/cannabinol) | Supporting effects |
| **Legal THC** | <0.2% (EU) | [Entourage effect](/glossary/entourage-effect) contribution |
| **Terpenes** | [Myrcene](/glossary/myrcene), [limonene](/glossary/limonene), [linalool](/glossary/linalool) | Aroma, effects |
| **Flavonoids** | Cannflavins, quercetin | Antioxidants, colour |
| **Plant matter** | Waxes, chlorophyll | Minor components |

### Typical Cannabinoid Profile

| Cannabinoid | Typical Range | Notes |
|-------------|---------------|-------|
| **CBD** | 40-70% | Primary compound |
| **CBDA** | 0-20% | Raw/unheated products |
| **CBG** | 0.5-3% | "Mother cannabinoid" |
| **CBC** | 0.1-1% | Anti-inflammatory |
| **CBN** | 0-0.5% | Sedating properties |
| **THC** | <0.2% | EU legal limit |
| **THCA** | 0-0.1% | Raw THC precursor |

---

## The Entourage Effect

Full spectrum's main advantage is the potential for synergistic benefits.

### What Is the Entourage Effect?

The [entourage effect](/glossary/entourage-effect) theory proposes that cannabis compounds work better together than in isolation.

| Interaction | Example |
|-------------|---------|
| **Cannabinoid + cannabinoid** | CBD + CBG may enhance effects |
| **Cannabinoid + terpene** | CBD + myrcene for relaxation |
| **Multiple terpenes** | Layered aroma and effect profiles |
| **Whole plant > isolated** | Full spectrum may outperform isolate |

### Research on the Entourage Effect

| Finding | Context |
|---------|---------|
| **Bell-shaped dose response** | CBD isolate shows diminishing returns at higher doses |
| **Full spectrum linear response** | Benefits continue with dose increase |
| **Terpene contributions** | Individual terpenes have documented effects |
| **Clinical observations** | Many users report full spectrum more effective |

---

## Full Spectrum vs Other Types

### Quick Comparison

| Property | Full Spectrum | [Broad Spectrum](/glossary/broad-spectrum) | [Isolate](/glossary/cbd-isolate) |
|----------|---------------|----------------|---------|
| **CBD** | Yes | Yes | Yes (99%+) |
| **Other cannabinoids** | Yes | Yes | No |
| **Terpenes** | Yes | Usually | No |
| **THC** | <0.2% | Non-detectable | No |
| **Entourage effect** | Full | Partial | None |
| **Taste** | Hemp-like | Milder | Flavourless |
| **Drug test risk** | Higher | Lower | Lowest |

### When to Choose Full Spectrum

| Situation | Full Spectrum Suitability |
|-----------|--------------------------|
| **Maximum effectiveness desired** | Excellent choice |
| **Not drug tested** | Excellent choice |
| **Tolerant of hemp taste** | Good fit |
| **Comfortable with trace THC** | Required |
| **First-time user** | Often recommended to start |

### When to Avoid Full Spectrum

| Situation | Alternative |
|-----------|-------------|
| **Regular drug testing** | Broad spectrum or isolate |
| **THC sensitivity** | Broad spectrum or isolate |
| **Dislike of hemp taste** | Isolate or flavoured products |
| **Personal preference for THC-free** | Broad spectrum |

---

## THC in Full Spectrum CBD

### Understanding the <0.2% Limit

| Fact | Detail |
|------|--------|
| **EU legal limit** | 0.2% THC by dry weight |
| **Typical full spectrum** | 0.1-0.2% THC |
| **In a 10ml bottle (1000mg CBD)** | ~2mg THC maximum |
| **Per 50mg CBD dose** | ~0.1mg THC |
| **Intoxicating dose** | 5-10mg THC minimum |

### Will Full Spectrum Get You High?

**No.** The THC content is far too low to cause intoxication. However:
- THC can **accumulate** with daily use
- May trigger **drug tests** after extended use
- Some people are **very sensitive** to THC

See [CBD and Drug Testing](/articles/cbd-drug-testing) for more information.

---

## How Full Spectrum CBD Is Made

### Extraction Process

| Step | Purpose |
|------|---------|
| **1. Harvest** | Hemp flowers collected |
| **2. Extraction** | CO2 or ethanol pulls compounds |
| **3. Winterisation** | Remove waxes and lipids |
| **4. Filtration** | Remove plant matter |
| **5. Testing** | Verify THC compliance |
| **6. Formulation** | Add to carrier oil |

### Extraction Methods

| Method | Quality | Preserves Terpenes |
|--------|---------|-------------------|
| **Supercritical CO2** | Highest | Yes |
| **Ethanol** | High | Partially |
| **Hydrocarbon** | Variable | Yes |
| **Olive oil (home)** | Lower | Yes |

---

## Full Spectrum Product Types

### Common Formats

| Product | Best For |
|---------|----------|
| **CBD oil/tincture** | Flexible dosing, sublingual use |
| **Capsules/softgels** | Convenient, pre-measured |
| **Gummies** | Tasty, discreet |
| **Topicals** | Localised application |
| **Vapes** | Fast onset (if permitted) |

### What to Look For

| Quality Indicator | Why It Matters |
|-------------------|----------------|
| **Third-party lab reports (COA)** | Verifies contents and THC level |
| **Cannabinoid profile listed** | Shows what you're getting |
| **Terpene profile** | Indicates quality extraction |
| **<0.2% THC confirmed** | Legal compliance |
| **Organic hemp source** | Cleaner product |

---

## Benefits of Full Spectrum CBD

### Reported Advantages

| Benefit | Explanation |
|---------|-------------|
| **Enhanced effectiveness** | Entourage effect synergy |
| **Lower doses may work** | Compounds amplify each other |
| **Complete plant benefits** | Nothing beneficial removed |
| **Natural terpene profile** | Additional therapeutic potential |
| **Closest to whole plant** | Minimal processing |

### Research Support

| Study Finding | Context |
|---------------|---------|
| **Full spectrum more effective than isolate** | Multiple comparative studies |
| **Therapeutic effects at lower doses** | Entourage effect in action |
| **Terpenes contribute to effects** | Independent terpene research |

---

## Potential Downsides

### Considerations

| Concern | Reality |
|---------|---------|
| **Drug test risk** | Trace THC can accumulate |
| **Hemp taste** | Some find it unpleasant |
| **THC sensitivity** | Rare but possible |
| **Consistency** | Natural variation between batches |
| **Higher cost** | Complex extraction |

---

## Related Articles

- [Full Spectrum vs Broad Spectrum vs Isolate](/articles/spectrum-comparison) - Complete comparison
- [The Entourage Effect](/articles/entourage-effect) - How compounds work together
- [CBD and Drug Testing](/articles/cbd-drug-testing) - THC detection risks
- [What is Broad Spectrum CBD?](/articles/what-is-broad-spectrum-cbd) - THC-free alternative

---

## Frequently Asked Questions

### Will full spectrum CBD get me high?

No. Full spectrum CBD contains less than 0.2% THC (EU legal limit), far too little to cause intoxication. You'd need to consume impossibly large amounts to feel any THC effects. The trace THC is there for [entourage effect](/glossary/entourage-effect) benefits.

### Can full spectrum CBD make me fail a drug test?

Possibly with regular use. Although the THC content is legal and minimal, it can accumulate in your body over time. If you're drug tested regularly, consider [broad spectrum](/glossary/broad-spectrum) or [isolate](/glossary/cbd-isolate) products.

### Is full spectrum more effective than isolate?

Research suggests it may be. The [entourage effect](/glossary/entourage-effect) theory, supported by some studies, indicates full spectrum CBD works better at a wider range of doses. Isolate shows a "bell-shaped" dose response—too much becomes less effective.

### Why does full spectrum CBD taste earthy?

The natural terpenes, flavonoids, and plant compounds give full spectrum its characteristic hemp taste. This earthy, grassy flavour indicates a complete extract. If you dislike it, try flavoured products or capsules.

### Is full spectrum legal in Europe?

Yes, provided THC content is below 0.2% (varies slightly by country). Full spectrum CBD from compliant hemp is legal throughout the EU. Always check lab reports confirm legal THC levels.

### How do I know if a product is truly full spectrum?

Check the Certificate of Analysis (COA) or lab report. It should show:
- Multiple cannabinoids (CBD, CBG, CBC, etc.)
- THC present but <0.2%
- Terpene profile (ideally)
- Third-party testing

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'cbd-basics').single();
  if (!category) {
    console.error('Category not found');
    return;
  }
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What is Full Spectrum CBD? Complete Guide',
    slug: 'what-is-full-spectrum-cbd',
    excerpt: 'Full spectrum CBD contains all hemp compounds including trace THC (<0.2%). Learn about the entourage effect, benefits, and when to choose full spectrum.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'basics',
    category_id: category.id,
    reading_time: 10,
    meta_title: 'What is Full Spectrum CBD? Benefits & Entourage Effect',
    meta_description: 'Learn what full spectrum CBD is, how it differs from isolate, and why the entourage effect matters. Understand THC content and who should use it.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Article inserted:', data.slug);
}
main();
