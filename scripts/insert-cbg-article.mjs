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

**[CBG](/glossary/cannabigerol) (cannabigerol)** is a non-intoxicating cannabinoid called the "mother cannabinoid" because all other cannabinoids are synthesized from it in the cannabis plant. CBG has shown antibacterial, anti-inflammatory, and neuroprotective properties in preclinical research. It's typically found in low concentrations (<1%) in mature cannabis but is increasingly available as specialized hemp strains and CBG products emerge.

---

## What Is CBG?

CBG (cannabigerol) is a minor [cannabinoid](/glossary/cannabinoid-profile) that serves as the chemical precursor to [CBD](/glossary/cannabidiol), [THC](/glossary/tetrahydrocannabinol), and other cannabinoids. First isolated in 1964 by Yechiel Gaoni and Raphael Mechoulam, CBG has gained attention for its potential therapeutic properties.

### CBG Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Cannabigerol |
| **Chemical formula** | C21H32O2 |
| **Discovery** | 1964 (Gaoni & Mechoulam) |
| **Psychoactive** | No |
| **Typical plant content** | <1% in mature plants |
| **Precursor form** | CBGA (cannabigerolic acid) |
| **Known as** | "Mother cannabinoid" or "stem cell cannabinoid" |

---

## Why Is CBG the "Mother Cannabinoid"?

CBG earns its nickname because CBGA (cannabigerolic acid) is the first cannabinoid produced in the cannabis plant, and all other cannabinoids derive from it.

### The Biosynthesis Pathway

| Stage | What Happens |
|-------|--------------|
| 1 | Plant produces CBGA (cannabigerolic acid) |
| 2 | Enzymes convert CBGA to THCA, CBDA, or CBCA |
| 3 | Very little CBGA remains in mature plant |
| 4 | Heat converts acids to neutral cannabinoids |

### Why CBG Is Rare in Most Cannabis

| Factor | Explanation |
|--------|-------------|
| **Conversion** | Most CBGA converts to other cannabinoids |
| **Timing** | High CBG only in young plants |
| **Mature plants** | Usually <1% CBG remains |
| **Specialized strains** | Bred to retain more CBG |

---

## How CBG Works

CBG has a unique pharmacological profile, interacting with multiple receptor systems.

### CBG Receptor Interactions

| Target | CBG Action | Effect |
|--------|------------|--------|
| **[CB1 receptors](/glossary/cb1-receptor)** | Partial agonist (weak) | Not intoxicating |
| **[CB2 receptors](/glossary/cb2-receptor)** | Partial agonist | Anti-inflammatory |
| **Alpha-2 adrenergic** | Agonist | Pain, blood pressure |
| **[5-HT1A](/glossary/serotonin-receptors-5ht1a)** | Antagonist | Mood modulation |
| **[TRPV1](/glossary/trpv1-receptor)** | Agonist | Pain modulation |
| **[PPARgamma](/glossary/ppars)** | Agonist | Anti-inflammatory |

### CBG vs. CBD Receptor Profile

| Receptor | CBG | CBD |
|----------|-----|-----|
| **CB1** | Weak partial agonist | Negative allosteric modulator |
| **CB2** | Partial agonist | Low affinity |
| **5-HT1A** | Antagonist | Agonist |
| **TRPV1** | Agonist | Agonist/desensitizer |
| **Alpha-2** | Agonist | Minimal |
| **PPARgamma** | Agonist | Agonist |

CBG and CBD have different receptor profiles, suggesting they may have complementary effects.

---

## Potential Benefits of CBG

Research on CBG is primarily preclinical (cell and animal studies), but findings are promising.

### Researched Applications

| Application | Evidence | Key Findings |
|-------------|----------|--------------|
| **Antibacterial** | Preclinical | Active against MRSA, antibiotic-resistant bacteria |
| **Anti-inflammatory** | Preclinical | Reduces inflammatory markers, IBD model benefits |
| **Neuroprotective** | Preclinical | Huntington's disease model benefits |
| **Appetite** | Preclinical | May stimulate appetite |
| **Glaucoma** | Preclinical | Reduces intraocular pressure |
| **Bladder dysfunction** | Preclinical | Reduces bladder contractions |
| **Cancer** | Preclinical | Inhibits colon cancer cell growth |

### CBG and Antibacterial Activity

One of CBG's most notable findings is its antibacterial potency:

| Finding | Detail |
|---------|--------|
| **MRSA activity** | CBG effective against methicillin-resistant Staphylococcus aureus |
| **Comparison** | Comparable potency to vancomycin in some tests |
| **Biofilm penetration** | Can penetrate bacterial biofilms |
| **Potential use** | Topical antibacterial applications |

**Important:** All of these findings are preclinical. Human clinical trials are needed.

---

## CBG vs. CBD: Comparison

CBG and CBD are both non-intoxicating but have important differences.

### Side-by-Side Comparison

| Property | CBG | CBD |
|----------|-----|-----|
| **Psychoactive** | No | No |
| **Plant abundance** | <1% (rare) | Up to 25% |
| **Cost** | Higher | Lower |
| **Research level** | Emerging | Extensive |
| **FDA approved** | No | Yes ([Epidiolex](/glossary/epidiolex)) |
| **Appetite** | May increase | Variable |
| **5-HT1A** | Antagonist | Agonist |
| **Alpha-2 activity** | Yes | Minimal |

### When to Consider CBG vs. CBD

| Goal | Better Choice | Reason |
|------|---------------|--------|
| **Anxiety** | CBD | 5-HT1A agonist activity |
| **Appetite stimulation** | CBG | May increase appetite |
| **Antibacterial (topical)** | CBG | Stronger antibacterial data |
| **Seizures** | CBD | FDA approved, extensive research |
| **General wellness** | Either/both | Consider combination |
| **Budget** | CBD | More affordable |

---

## CBG Products

As demand grows, more CBG products are becoming available.

### CBG Product Types

| Type | Description | CBG Content |
|------|-------------|-------------|
| **CBG oil** | Pure CBG or CBG-rich extract | 500-2000mg per bottle |
| **CBG + CBD oil** | Combination products | Varies |
| **CBG flower** | High-CBG hemp strains | 10-20% CBG |
| **CBG isolate** | Pure CBG powder | 99%+ |
| **CBG topicals** | Creams, balms | Varies |
| **CBG capsules** | Oral supplements | 10-50mg per capsule |

### Why CBG Products Cost More

| Factor | Explanation |
|--------|-------------|
| **Low plant content** | More plant material needed |
| **Harvest timing** | Must harvest young or use special strains |
| **Specialized strains** | Limited availability |
| **Extraction costs** | Lower yields = higher cost per mg |

---

## CBG Safety

CBG appears to have a favorable safety profile, though research is limited.

### What We Know

| Aspect | Status |
|--------|--------|
| **Acute toxicity** | Not observed in studies |
| **Psychoactivity** | None |
| **Serious adverse events** | Not reported |
| **Long-term safety** | Unknown (limited data) |
| **Drug interactions** | Possible (CYP450 enzymes) |

---

## Related Articles

- [What Are Cannabinoids?](/articles/what-are-cannabinoids) - Overview of all cannabinoids
- [What Is CBD?](/articles/what-is-cbd) - The major non-intoxicating cannabinoid
- [What Is CBN?](/articles/what-is-cbn) - Another minor cannabinoid
- [The Entourage Effect](/articles/entourage-effect) - How cannabinoids work together

---

## Frequently Asked Questions

### Will CBG get me high?

No. [CBG](/glossary/cannabigerol) is non-intoxicating. While it does weakly interact with [CB1 receptors](/glossary/cb1-receptor), it doesn't produce the "high" associated with [THC](/glossary/tetrahydrocannabinol). CBG is comparable to [CBD](/glossary/cannabidiol) in this regard.

### Why is CBG so expensive?

CBG is expensive because cannabis plants typically contain less than 1% CBG by the time they're mature. Producers need much more plant material to extract the same amount of CBG compared to CBD. Specialized high-CBG strains are helping reduce costs, but CBG remains pricier than CBD.

### Can I take CBG and CBD together?

Yes. Many people use CBG and CBD together, and combination products exist. They have different receptor profiles, so they may have complementary effects. There's no known dangerous interaction between the two.

### Is CBG better than CBD?

Neither is universally "better"—they have different properties. CBD has more research support and is FDA-approved for seizures. CBG has unique antibacterial properties and may better stimulate appetite. Many experts suggest the [entourage effect](/glossary/entourage-effect) means using multiple cannabinoids together may be optimal.

### Is CBG legal?

Yes. CBG derived from hemp (containing <0.3% THC) is federally legal in the US under the 2018 Farm Bill. It's non-intoxicating and doesn't produce a "high." However, some states have their own restrictions, so check local laws.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. CBG research is primarily preclinical, and human clinical trials are limited. CBG is not FDA-approved for any medical condition. Consult a healthcare professional before using CBG products.*

---

### References

1. Gaoni Y, Mechoulam R. Isolation, structure, and partial synthesis of an active constituent of hashish. *J Am Chem Soc*. 1964;86(8):1646-1647.

2. Appendino G, et al. Antibacterial cannabinoids from Cannabis sativa: a structure-activity study. *J Nat Prod*. 2008;71(8):1427-1430.

3. Borrelli F, et al. Beneficial effect of the non-psychotropic plant cannabinoid cannabigerol on experimental inflammatory bowel disease. *Biochem Pharmacol*. 2013;85(9):1306-1316.

4. Valdeolivas S, et al. Neuroprotective properties of cannabigerol in Huntington's disease. *Neurotherapeutics*. 2015;12(1):185-199.

5. Farha MA, et al. Uncovering the hidden antibiotic potential of cannabis. *ACS Infect Dis*. 2020;6(3):338-346.`;

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
      title: 'What Is CBG? The "Mother Cannabinoid" Explained',
      slug: 'what-is-cbg',
      excerpt: 'Learn about CBG (cannabigerol)—the "mother cannabinoid" that all others derive from. Discover CBG\'s unique antibacterial, anti-inflammatory, and neuroprotective properties.',
      content: content,
      status: 'published',
      featured: false,
      article_type: 'science',
      category_id: category.id,
      reading_time: 10,
      meta_title: 'What Is CBG (Cannabigerol)? Benefits, Uses & Research',
      meta_description: 'Understand CBG, the "mother cannabinoid" precursor to CBD and THC. Learn about its antibacterial, anti-inflammatory properties and how it compares to CBD.',
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
