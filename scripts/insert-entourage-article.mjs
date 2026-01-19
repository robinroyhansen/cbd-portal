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

The [entourage effect](/glossary/entourage-effect) is the theory that cannabis compounds—[cannabinoids](/glossary/cannabinoid-profile), [terpenes](/glossary/terpenes), and [flavonoids](/glossary/flavonoids)—work better together than in isolation. This synergy may explain why [full-spectrum](/glossary/full-spectrum) CBD products often outperform pure [CBD isolate](/glossary/cbd-isolate) in research studies, even at lower doses. The effect was first proposed by Dr. Raphael Mechoulam in 1998 and remains a key concept in cannabis therapeutics.

---

## What is the Entourage Effect?

Imagine an orchestra: a single violin can play a beautiful melody, but an entire orchestra creates a richer, more powerful sound. The entourage effect suggests cannabis compounds work similarly—each adds something unique, and together they create effects greater than any single component alone.

The term was coined by Israeli researcher Dr. Raphael Mechoulam and his colleague Dr. Shimon Ben-Shabat in 1998 when they discovered that inactive compounds in cannabis enhanced the effects of active ones.

### The Original Discovery

Mechoulam's team found that [2-AG](/glossary/2-ag) (an endocannabinoid) was accompanied by two related molecules—2-linoleoyl-glycerol and 2-palmitoyl-glycerol—that had no cannabinoid activity on their own. However, when combined with 2-AG, they significantly enhanced its effects.

This led to a fundamental insight: **cannabis isn't just about THC or CBD—it's about the whole plant working together.**

---

## The Science Behind Synergy

### How Compounds Work Together

Cannabis contains over 500 identified compounds, including:

| Compound Class | Number Identified | Key Examples |
|----------------|-------------------|--------------|
| [Cannabinoids](/glossary/phytocannabinoid) | 100+ | CBD, THC, CBG, CBN, CBC |
| [Terpenes](/glossary/terpenes) | 200+ | Myrcene, limonene, linalool |
| [Flavonoids](/glossary/flavonoids) | 20+ | Cannflavin A, B, C |
| Other compounds | 100+ | Fatty acids, proteins, phenols |

These compounds can interact through several mechanisms:

#### 1. Receptor Modulation

Different compounds target the same receptors in different ways:

- **CBD** modulates [CB1 receptors](/glossary/cb1-receptor) allosterically (changes shape)
- **THC** activates CB1 receptors directly
- **Beta-caryophyllene** (a terpene) activates [CB2 receptors](/glossary/cb2-receptor)

When combined, these different mechanisms can produce balanced, more nuanced effects.

#### 2. Enzyme Inhibition

Some compounds slow the breakdown of others:

- CBD inhibits [FAAH](/glossary/faah-enzyme), the enzyme that breaks down [anandamide](/glossary/anandamide)
- Certain terpenes may inhibit enzymes that metabolize cannabinoids
- This keeps active compounds in your system longer

#### 3. Improved Bioavailability

Some compounds help others absorb better:

- Terpenes may increase cannabinoid absorption through membranes
- [Limonene](/glossary/limonene) has been shown to enhance transdermal absorption
- Fatty acids in hemp improve fat-soluble cannabinoid absorption

#### 4. Multi-Target Effects

Different compounds affect different pathways that converge on similar outcomes:

| Target | CBD | Terpenes | Result |
|--------|-----|----------|--------|
| Inflammation | PPARs, CB2 | COX-2 inhibition | Enhanced anti-inflammatory |
| Anxiety | 5-HT1A, FAAH | GABA modulation | Broader anxiolytic effect |
| Pain | TRPV1, CB1 modulation | GABA, glycine | Multi-mechanism pain relief |

---

## Key Evidence for the Entourage Effect

### The Bell-Shaped Curve Study (2015)

One of the most cited studies supporting the entourage effect comes from the Lautenberg Center for Immunology and Cancer Research in Israel.

**What they found:**

| Product | Dose-Response | Effectiveness |
|---------|---------------|---------------|
| Pure CBD isolate | Bell-shaped curve | Limited range of effectiveness |
| Full-spectrum extract | Linear dose-response | More effective at all doses |

With pure CBD, effectiveness increased up to a certain dose, then decreased at higher doses (bell-shaped curve). With full-spectrum extract, higher doses continued to produce better effects (linear response).

**Key finding:** The full-spectrum extract was more effective for reducing inflammation than pure CBD, even when the CBD content was identical.

### Terpene-Cannabinoid Synergy Research

A 2011 review by Dr. Ethan Russo in the *British Journal of Pharmacology* examined how terpenes and cannabinoids might work together:

| Terpene | Properties | Potential Synergy with CBD |
|---------|------------|---------------------------|
| [Myrcene](/glossary/myrcene) | Sedating, muscle relaxant | Enhanced sleep, pain relief |
| [Limonene](/glossary/limonene) | Mood-elevating, anxiolytic | Enhanced anti-anxiety effects |
| [Linalool](/glossary/linalool) | Calming, analgesic | Enhanced relaxation, pain relief |
| [Pinene](/glossary/pinene) | Alerting, bronchodilator | Memory preservation, respiratory |
| [Caryophyllene](/glossary/caryophyllene) | Anti-inflammatory (CB2 agonist) | Enhanced anti-inflammatory |

### Clinical Observations with Sativex

Sativex (nabiximols), a prescription cannabis mouth spray containing both THC and CBD, provides real-world evidence for the entourage effect. Studies show:

- Better pain control than pure THC
- Fewer psychoactive side effects than THC alone
- CBD appears to modulate THC's effects

---

## Full-Spectrum vs. Broad-Spectrum vs. Isolate

Understanding the entourage effect helps explain why different CBD product types exist:

### Full-Spectrum CBD

[Full-spectrum](/glossary/full-spectrum) products contain all naturally occurring cannabis compounds, including:

- CBD (primary cannabinoid)
- Minor cannabinoids ([CBG](/glossary/cannabigerol), [CBN](/glossary/cannabinol), [CBC](/glossary/cannabichromene))
- Terpenes (aromatic compounds)
- Flavonoids (including cannflavins)
- Trace THC (<0.2% in EU, <0.3% in US)

**Pros:**
- Maximum entourage effect potential
- Broader therapeutic range
- More closely mimics whole-plant cannabis

**Cons:**
- Contains trace THC (drug test concern)
- Stronger taste/aroma
- Not suitable for those avoiding all THC

### Broad-Spectrum CBD

[Broad-spectrum](/glossary/broad-spectrum) products undergo additional processing to remove THC while retaining other compounds:

- CBD + minor cannabinoids
- Terpenes and flavonoids
- THC removed or undetectable

**Pros:**
- Partial entourage effect
- No THC concerns
- Middle-ground option

**Cons:**
- Some compounds may be lost in processing
- Less research on effectiveness vs. full-spectrum

### CBD Isolate

[CBD isolate](/glossary/cbd-isolate) is 99%+ pure CBD with all other compounds removed:

- Pure cannabidiol only
- No terpenes, flavonoids, or other cannabinoids
- Typically crystalline powder

**Pros:**
- Zero THC guaranteed
- No taste or smell
- Precise dosing
- Best for making custom products

**Cons:**
- No entourage effect
- May require higher doses
- Bell-shaped dose-response curve

### Comparison Table

| Feature | Full-Spectrum | Broad-Spectrum | Isolate |
|---------|---------------|----------------|---------|
| **Entourage effect** | Maximum | Partial | None |
| **THC content** | Trace (<0.2%) | None/undetectable | None |
| **Other cannabinoids** | Yes | Yes | No |
| **Terpenes** | Yes | Usually | No |
| **Flavonoids** | Yes | Usually | No |
| **Drug test risk** | Possible | Very low | None |
| **Taste** | Earthy, hemp-like | Milder | None |
| **Typical use** | Therapeutic effects | THC-free alternative | Cooking, custom products |

---

## The Role of Terpenes

Terpenes deserve special attention in the entourage effect discussion. These aromatic compounds give cannabis (and many other plants) their distinctive smells and may significantly influence therapeutic effects.

### Key Cannabis Terpenes

#### Myrcene

[Myrcene](/glossary/myrcene) is typically the most abundant terpene in cannabis.

| Property | Detail |
|----------|--------|
| **Aroma** | Earthy, musky, herbal |
| **Also found in** | Mangoes, hops, lemongrass |
| **Potential effects** | Sedating, muscle relaxant, anti-inflammatory |
| **Entourage role** | May enhance cannabinoid absorption |

#### Limonene

[Limonene](/glossary/limonene) is the second most common terpene.

| Property | Detail |
|----------|--------|
| **Aroma** | Citrus, lemon, orange |
| **Also found in** | Citrus fruits, juniper |
| **Potential effects** | Mood elevation, stress relief, antibacterial |
| **Entourage role** | May enhance absorption, mood effects |

#### Linalool

[Linalool](/glossary/linalool) is known for its calming properties.

| Property | Detail |
|----------|--------|
| **Aroma** | Floral, lavender |
| **Also found in** | Lavender, coriander |
| **Potential effects** | Calming, anxiolytic, analgesic |
| **Entourage role** | Synergizes with CBD for anxiety/sleep |

#### Beta-Caryophyllene

[Caryophyllene](/glossary/caryophyllene) is unique—it's a terpene that acts as a cannabinoid.

| Property | Detail |
|----------|--------|
| **Aroma** | Spicy, peppery, woody |
| **Also found in** | Black pepper, cloves |
| **Potential effects** | Anti-inflammatory, analgesic |
| **Entourage role** | Directly activates CB2 receptors |

#### Pinene

[Pinene](/glossary/pinene) exists in two forms: alpha and beta.

| Property | Detail |
|----------|--------|
| **Aroma** | Pine, forest |
| **Also found in** | Pine trees, rosemary |
| **Potential effects** | Alertness, bronchodilation, memory |
| **Entourage role** | May counteract THC memory impairment |

---

## Flavonoids: The Forgotten Players

While terpenes get most of the attention, [flavonoids](/glossary/flavonoids) also contribute to the entourage effect.

### Cannabis-Specific Flavonoids

Cannabis contains unique flavonoids called **cannflavins** not found in any other plant:

| Flavonoid | Properties | Research Status |
|-----------|------------|-----------------|
| **Cannflavin A** | 30x more anti-inflammatory than aspirin | Preclinical |
| **Cannflavin B** | Anti-inflammatory, neuroprotective | Preclinical |
| **Cannflavin C** | Anti-inflammatory | Early research |

A 1985 study at the University of London found cannflavin A inhibited prostaglandin production 30 times more effectively than aspirin—a significant finding that's driving renewed research interest.

---

## Criticisms and Limitations

While the entourage effect is widely discussed, it's important to acknowledge its limitations:

### Scientific Critiques

1. **Limited human studies:** Most evidence comes from preclinical (cell/animal) studies
2. **Variable product quality:** Real-world products vary significantly
3. **Difficulty isolating effects:** Hard to determine which compounds contribute what
4. **Industry motivation:** Companies selling full-spectrum products benefit from the concept

### What the Critics Say

Some researchers argue:

- The term "entourage effect" is used too loosely
- More rigorous clinical trials are needed
- Individual compounds may be sufficient for specific conditions
- Product marketing has outpaced scientific evidence

### The Balanced View

The entourage effect likely exists to some degree—compounds do interact—but:

- The magnitude of the effect may vary by condition
- Some people may respond better to isolate
- More research is needed to understand optimal ratios
- Not all "full-spectrum" products are created equal

---

## Practical Implications

### Choosing the Right Product

| If You Want... | Consider... | Why |
|----------------|-------------|-----|
| Maximum therapeutic potential | Full-spectrum | Full entourage effect |
| Entourage without THC | Broad-spectrum | Partial entourage, no THC |
| Precise dosing, no taste | Isolate | Pure CBD, predictable |
| Drug test safety | Isolate or broad-spectrum | Zero/minimal THC |
| Sleep support | Full-spectrum with myrcene | Sedating synergy |
| Daytime use | Broad-spectrum with limonene | Uplifting, no THC |

### Reading Lab Reports

To maximize entourage effect benefits, check [Certificates of Analysis](/glossary/certificate-of-analysis) for:

- **Cannabinoid profile:** Multiple cannabinoids present
- **Terpene profile:** Specific terpenes and amounts
- **THC content:** Appropriate for your needs
- **No contaminants:** Clean product

---

## Related Articles

- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Your body's cannabinoid system
- [What is CBD Oil?](/kb/articles/cbd-oil-guide) - Complete CBD product guide

---

## Frequently Asked Questions

### Is the entourage effect scientifically proven?

There is substantial preclinical evidence and some clinical evidence supporting the entourage effect, but it's not definitively "proven" in the way pharmaceutical interactions are. The 2015 Lautenberg Center study showed full-spectrum extracts outperforming isolate, and Sativex (THC+CBD) works better than THC alone. However, more controlled human trials are needed.

### Does CBD isolate work at all?

Yes, [CBD isolate](/glossary/cbd-isolate) is effective for many people and conditions. [Epidiolex](/glossary/epidiolex), an FDA-approved CBD medication, is essentially pure CBD and works well for certain epilepsy syndromes. However, isolate may require higher doses and shows a bell-shaped dose-response curve in some studies.

### Can I get the entourage effect from hemp seed oil?

No. [Hemp seed oil](/glossary/hemp-seed-oil) is pressed from hemp seeds, which contain no cannabinoids or significant terpenes. It's nutritious but won't provide the entourage effect. You need products made from hemp flowers/leaves that contain [phytocannabinoids](/glossary/phytocannabinoid).

### Will full-spectrum CBD make me fail a drug test?

Possibly. [Full-spectrum](/glossary/full-spectrum) products contain trace amounts of THC (<0.2% in EU). With regular use of high doses, this can accumulate and trigger a positive drug test. If drug testing is a concern, choose [broad-spectrum](/glossary/broad-spectrum) or [isolate](/glossary/cbd-isolate) products.

### What's the best terpene for anxiety?

[Linalool](/glossary/linalool) (lavender scent) and [limonene](/glossary/limonene) (citrus scent) are most associated with calming effects. [Myrcene](/glossary/myrcene) is also relaxing but more sedating. Look for products with terpene profiles listing these compounds if anxiety is your primary concern.

### Do I need terpenes for CBD to work?

No—CBD works through its own mechanisms regardless of terpenes. However, terpenes may enhance and modulate CBD's effects, potentially making lower doses more effective or providing additional benefits. Many people find full-spectrum products more effective, but this varies individually.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. Individual responses to cannabinoid products vary. Consult a healthcare professional before using CBD products, especially if you have health conditions or take medications.*

---

### References

1. Russo EB. Taming THC: potential cannabis synergy and phytocannabinoid-terpenoid entourage effects. *Br J Pharmacol*. 2011;163(7):1344-1364.

2. Gallily R, Yekhtin Z, Hanuš LO. Overcoming the Bell-Shaped Dose-Response of Cannabidiol by Using Cannabis Extract Enriched in Cannabidiol. *Pharmacol Pharm*. 2015;6:75-85.

3. Ben-Shabat S, et al. An entourage effect: inactive endogenous fatty acid glycerol esters enhance 2-arachidonoyl-glycerol cannabinoid activity. *Eur J Pharmacol*. 1998;353(1):23-31.

4. Ferber SG, et al. The "Entourage Effect": Terpenes Coupled with Cannabinoids for the Treatment of Mood Disorders and Anxiety Disorders. *Curr Neuropharmacol*. 2020;18(2):87-96.

5. Pamplona FA, et al. Potential Clinical Benefits of CBD-Rich Cannabis Extracts Over Purified CBD in Treatment-Resistant Epilepsy: Observational Data Meta-analysis. *Front Neurol*. 2018;9:759.

6. Barrett ML, Scutt AM, Evans FJ. Cannflavin A and B, prenylated flavones from Cannabis sativa L. *Experientia*. 1986;42(2):159-160.

7. Santiago M, et al. Absence of Entourage: Terpenoids Commonly Found in Cannabis sativa Do Not Modulate the Functional Activity of Δ9-THC at Human CB1 and CB2 Receptors. *Cannabis Cannabinoid Res*. 2019;4(3):165-176.

8. Cogan PS. The 'entourage effect' or 'hodge-podge hashish': the questionable rebranding, marketing, and expectations of cannabis polypharmacy. *Expert Rev Clin Pharmacol*. 2020;13(8):835-845.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'The Entourage Effect Explained: Why Whole-Plant CBD May Work Better',
    slug: 'entourage-effect',
    excerpt: 'Discover the entourage effect—the theory that cannabis compounds work better together. Learn how cannabinoids, terpenes, and flavonoids synergize, and why full-spectrum CBD often outperforms isolate.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    reading_time: 14,
    meta_title: 'The Entourage Effect Explained: Full-Spectrum CBD Science',
    meta_description: 'Learn how the entourage effect works: cannabinoids, terpenes and flavonoids synergize for enhanced effects. Compare full-spectrum vs isolate CBD.',
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
  console.log('URL: /articles/' + data.slug);
}
