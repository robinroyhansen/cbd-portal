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

**[Cannabinoids](/glossary/cannabinoid-profile)** are chemical compounds that interact with cannabinoid receptors in your body. There are three types: phytocannabinoids (from plants like cannabis), endocannabinoids (made by your body), and synthetic cannabinoids (lab-made). Over 100 cannabinoids have been identified in cannabis, with [CBD](/glossary/cannabidiol) and [THC](/glossary/tetrahydrocannabinol) being the most abundant and studied.

---

## What Are Cannabinoids?

Cannabinoids are a class of chemical compounds defined by their ability to interact with cannabinoid receptors ([CB1](/glossary/cb1-receptor) and [CB2](/glossary/cb2-receptor)) in the [endocannabinoid system](/glossary/endocannabinoid-system). They share structural similarities that allow them to bind to these receptors and influence various physiological processes.

### Types of Cannabinoids

| Type | Source | Examples |
|------|--------|----------|
| **Phytocannabinoids** | Plants (mainly cannabis) | CBD, THC, CBG, CBN, CBC |
| **Endocannabinoids** | Human body | [Anandamide](/glossary/anandamide), [2-AG](/glossary/2-ag) |
| **Synthetic cannabinoids** | Laboratory | Dronabinol, nabilone, K2/Spice |

---

## Phytocannabinoids: Plant Cannabinoids

Phytocannabinoids are cannabinoids produced by plants—primarily Cannabis sativa (hemp and marijuana).

### How Many Cannabinoids Are in Cannabis?

| Finding | Number |
|---------|--------|
| Identified cannabinoids | 100+ |
| Major cannabinoids | ~10 |
| Well-researched | ~6 |
| Commercially available | ~8-10 |

### Major Phytocannabinoids

| Cannabinoid | Full Name | Psychoactive? | Key Properties |
|-------------|-----------|---------------|----------------|
| **[CBD](/glossary/cannabidiol)** | Cannabidiol | No | Anti-anxiety, anti-inflammatory, anti-seizure |
| **[THC](/glossary/tetrahydrocannabinol)** | Tetrahydrocannabinol | Yes | Intoxicating, pain relief, appetite |
| **[CBG](/glossary/cannabigerol)** | Cannabigerol | No | Antibacterial, anti-inflammatory |
| **[CBN](/glossary/cannabinol)** | Cannabinol | Mildly | Sedative potential, aged THC product |
| **[CBC](/glossary/cannabichromene)** | Cannabichromene | No | Anti-inflammatory, neurogenesis |
| **[THCV](/glossary/tetrahydrocannabivarin)** | Tetrahydrocannabivarin | Variable | Appetite suppressant, energizing |
| **CBDV** | Cannabidivarin | No | Anti-nausea, seizure research |
| **CBDA** | Cannabidiolic acid | No | Raw form of CBD, anti-nausea |
| **THCA** | Tetrahydrocannabinolic acid | No | Raw form of THC, anti-inflammatory |

### The Cannabinoid Biosynthesis Pathway

All cannabinoids start from the same precursor—[CBG](/glossary/cannabigerol) (cannabigerol), often called the "mother cannabinoid."

| Stage | What Happens |
|-------|--------------|
| 1. CBGA formed | Precursor molecule created |
| 2. Enzyme action | CBGA converted to THCA, CBDA, or CBCA |
| 3. Heat/time | Decarboxylation converts acids to neutral forms |
| 4. Aging | THC oxidizes to CBN over time |

**Biosynthesis pathway:**
- CBGA → THCA → THC → CBN (aging)
- CBGA → CBDA → CBD
- CBGA → CBCA → CBC

---

## Endocannabinoids: Your Body's Cannabinoids

Endocannabinoids are cannabinoids naturally produced by your body. They're part of the [endocannabinoid system](/glossary/endocannabinoid-system)—a regulatory network that maintains homeostasis.

### The Two Main Endocannabinoids

| Endocannabinoid | Full Name | Concentration | Key Functions |
|-----------------|-----------|---------------|---------------|
| **[Anandamide](/glossary/anandamide)** (AEA) | N-arachidonoylethanolamine | Lower | Mood, memory, pain (the "bliss molecule") |
| **[2-AG](/glossary/2-ag)** | 2-arachidonoylglycerol | Higher (170x) | Immune function, pain, neuroprotection |

### Endocannabinoid Characteristics

| Feature | Detail |
|---------|--------|
| **Production** | Made on-demand (not stored) |
| **Duration** | Very brief (seconds to minutes) |
| **Function** | [Retrograde signaling](/glossary/retrograde-signaling) |
| **Degradation** | [FAAH](/glossary/faah-enzyme) (anandamide), MAGL (2-AG) |

Learn more: [What Is Anandamide?](/articles/anandamide) | [What Is 2-AG?](/articles/2-ag)

---

## Synthetic Cannabinoids

Synthetic cannabinoids are laboratory-created compounds designed to interact with cannabinoid receptors.

### Types of Synthetic Cannabinoids

| Type | Purpose | Examples | Safety |
|------|---------|----------|--------|
| **Pharmaceutical** | Medical treatment | Dronabinol, nabilone | FDA-approved, safe |
| **Research tools** | Scientific study | WIN 55,212-2, CP 55,940 | Lab use only |
| **Recreational (illegal)** | Getting high | K2, Spice | Dangerous, unpredictable |

### Pharmaceutical Synthetics

| Drug | Type | Approved For |
|------|------|--------------|
| **Marinol (dronabinol)** | Synthetic THC | Chemotherapy nausea, AIDS wasting |
| **Cesamet (nabilone)** | THC analog | Chemotherapy nausea |
| **Syndros** | Liquid synthetic THC | Same as Marinol |

### Dangerous Synthetic Cannabinoids (Avoid)

| Product | What It Is | Why Dangerous |
|---------|------------|---------------|
| **K2/Spice** | Unknown synthetic cannabinoids sprayed on plant material | Unpredictable potency, toxic chemicals, severe reactions |
| **"Synthetic marijuana"** | Marketing term for dangerous products | Nothing like natural cannabis, can cause psychosis, death |

**Warning:** Illegal synthetic cannabinoids are extremely dangerous and completely different from plant cannabinoids or pharmaceutical synthetics. Avoid them entirely.

---

## How Cannabinoids Work

Cannabinoids produce effects by interacting with the endocannabinoid system and other receptor targets.

### Primary Targets

| Target | Type | Cannabinoids That Interact |
|--------|------|---------------------------|
| **[CB1 receptors](/glossary/cb1-receptor)** | Cannabinoid receptor (brain) | THC, anandamide, 2-AG |
| **[CB2 receptors](/glossary/cb2-receptor)** | Cannabinoid receptor (immune) | 2-AG, CBG, THC |
| **[TRPV1](/glossary/trpv1-receptor)** | Ion channel | CBD, anandamide, CBDV |
| **[GPR55](/glossary/gpr55-receptor)** | Orphan receptor | THC, CBD (antagonist) |
| **[PPARs](/glossary/ppars)** | Nuclear receptors | CBD, THC |
| **[5-HT1A](/glossary/serotonin-receptors-5ht1a)** | Serotonin receptor | CBD |

### Cannabinoid Receptor Binding Comparison

| Cannabinoid | CB1 Binding | CB2 Binding | Psychoactive |
|-------------|-------------|-------------|--------------|
| **THC** | Strong agonist | Moderate agonist | Yes |
| **CBD** | Negative modulator | Low affinity | No |
| **CBG** | Low affinity | Moderate | No |
| **CBN** | Weak agonist | Weak agonist | Mildly |
| **CBC** | Very low | Very low | No |
| **Anandamide** | Partial agonist | Weak | Endogenous |
| **2-AG** | Full agonist | Full agonist | Endogenous |

---

## The Entourage Effect

The [entourage effect](/glossary/entourage-effect) is the theory that cannabinoids work better together than in isolation.

### Evidence for Entourage

| Observation | Implication |
|-------------|-------------|
| Full plant extracts often outperform single cannabinoids | Synergy exists |
| CBD reduces THC's negative effects | Cannabinoid interaction |
| [Terpenes](/glossary/terpenes) modify cannabinoid effects | Beyond cannabinoids |
| [Full spectrum](/glossary/full-spectrum) may require lower doses | Enhanced potency |

### How Cannabinoids Work Together

| Interaction | Example |
|-------------|---------|
| **Synergy** | CBD + THC for pain |
| **Antagonism** | CBD reduces THC anxiety |
| **Modulation** | CBG may enhance CBD |
| **Terpene enhancement** | [Myrcene](/glossary/myrcene) + cannabinoids |

Learn more: [The Entourage Effect Explained](/articles/entourage-effect)

---

## Cannabinoid Quick Reference

### Major Cannabinoids At a Glance

| Cannabinoid | Psychoactive | Main Effects | Status |
|-------------|--------------|--------------|--------|
| **CBD** | No | Calming, anti-inflammatory | Legal (hemp) |
| **THC** | Yes | Intoxicating, pain relief | Schedule I / State legal |
| **CBG** | No | Antibacterial, emerging | Legal (hemp) |
| **CBN** | Mildly | Sedative potential | Legal (hemp) |
| **CBC** | No | Anti-inflammatory | Legal (hemp) |
| **THCV** | Dose-dependent | Energizing, appetite | Legal gray area |
| **Delta-8-THC** | Yes (milder) | Similar to THC | Legal gray area |

### Acidic vs. Neutral Cannabinoids

| Acidic Form | Neutral Form | Conversion |
|-------------|--------------|------------|
| CBDA | CBD | Heat (decarboxylation) |
| THCA | THC | Heat (decarboxylation) |
| CBGA | CBG | Heat (decarboxylation) |
| CBCA | CBC | Heat (decarboxylation) |

Raw cannabis contains acidic forms. Heating (smoking, vaping, cooking) converts them to the active neutral forms we typically discuss.

---

## Cannabinoid Research Status

Different cannabinoids have varying levels of scientific evidence.

### Research Levels

| Cannabinoid | Human Trials | FDA Approved | Evidence Level |
|-------------|--------------|--------------|----------------|
| **CBD** | Many | Yes (Epidiolex) | Strong |
| **THC** | Many | Yes (Marinol) | Strong |
| **CBG** | Few | No | Emerging |
| **CBN** | Very few | No | Preliminary |
| **CBC** | Very few | No | Preliminary |
| **THCV** | Few | No | Emerging |

### Why Some Cannabinoids Have Less Research

| Factor | Explanation |
|--------|-------------|
| **Abundance** | Minor cannabinoids are harder to study |
| **Legal barriers** | Cannabis research has been restricted |
| **Commercial interest** | CBD/THC dominate market |
| **Cost** | Isolating minors is expensive |

---

## Related Articles

- [What Is CBD?](/articles/what-is-cbd) - The non-intoxicating major cannabinoid
- [What Is THC?](/articles/what-is-thc) - The psychoactive cannabinoid
- [The Endocannabinoid System](/articles/endocannabinoid-system) - How cannabinoids work
- [The Entourage Effect](/articles/entourage-effect) - Cannabinoid synergy
- [Full Spectrum vs. Broad Spectrum vs. Isolate](/articles/spectrum-comparison) - Cannabinoid content differences

---

## Frequently Asked Questions

### How many cannabinoids are there?

Over 100 [cannabinoids](/glossary/cannabinoid-profile) have been identified in cannabis, with new ones still being discovered. However, only about 10 are considered "major" cannabinoids present in significant quantities, and only a handful (CBD, THC, CBG, CBN, CBC) have substantial research.

### Which cannabinoids are psychoactive?

[THC](/glossary/tetrahydrocannabinol) is the primary psychoactive cannabinoid. [CBN](/glossary/cannabinol) is mildly psychoactive. [THCV](/glossary/tetrahydrocannabivarin) can be psychoactive at high doses. [CBD](/glossary/cannabidiol), [CBG](/glossary/cannabigerol), [CBC](/glossary/cannabichromene), and most other cannabinoids are not psychoactive.

### What's the difference between cannabinoids and terpenes?

Cannabinoids interact with cannabinoid receptors (CB1, CB2) and other molecular targets. [Terpenes](/glossary/terpenes) are aromatic compounds that give cannabis its smell and may contribute to effects through the [entourage effect](/glossary/entourage-effect), but they work through different mechanisms (not cannabinoid receptors).

### Are all cannabinoids legal?

No. THC is federally illegal in the US (Schedule I), though many states allow medical or recreational use. CBD and other cannabinoids from hemp (<0.3% THC) are federally legal under the 2018 Farm Bill. Delta-8-THC exists in a legal gray area. Synthetic cannabinoids like K2/Spice are illegal.

### Why is CBG called the "mother cannabinoid"?

[CBG](/glossary/cannabigerol) (specifically CBGA, its acidic form) is the precursor from which all other cannabinoids are synthesized in the cannabis plant. Enzymes convert CBGA into THCA, CBDA, or CBCA, which then become THC, CBD, or CBC through decarboxylation.

### Do endocannabinoids get you high?

No. [Anandamide](/glossary/anandamide) and [2-AG](/glossary/2-ag) are produced in tiny amounts and degraded within seconds to minutes. Your body uses them for precise, localized signaling—not the prolonged, system-wide receptor activation that THC causes. They're part of normal physiology, not intoxication.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. Cannabinoid research is ongoing, and many applications remain under investigation. Consult a healthcare professional before using cannabinoid products.*

---

### References

1. Hanuš LO, et al. Phytocannabinoids: a unified critical inventory. *Nat Prod Rep*. 2016;33(12):1357-1392.

2. Pertwee RG. The diverse CB1 and CB2 receptor pharmacology of three plant cannabinoids. *Br J Pharmacol*. 2008;153(2):199-215.

3. Russo EB. Taming THC: potential cannabis synergy and phytocannabinoid-terpenoid entourage effects. *Br J Pharmacol*. 2011;163(7):1344-1364.

4. Mechoulam R, Parker LA. The endocannabinoid system and the brain. *Annu Rev Psychol*. 2013;64:21-47.

5. ElSohly MA, et al. Phytochemistry of Cannabis sativa L. *Prog Chem Org Nat Prod*. 2017;103:1-36.`;

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
      title: 'What Are Cannabinoids? Complete Guide to Cannabis Compounds',
      slug: 'what-are-cannabinoids',
      excerpt: 'Learn what cannabinoids are, the different types (plant, body-made, and synthetic), and how they work. Understand the differences between CBD, THC, CBG, CBN, and more.',
      content: content,
      status: 'published',
      featured: false,
      article_type: 'science',
      category_id: category.id,
      reading_time: 11,
      meta_title: 'What Are Cannabinoids? Types, Effects & How They Work',
      meta_description: 'Understand cannabinoids: plant-based (CBD, THC, CBG), body-made (anandamide, 2-AG), and synthetic types. Learn how they interact with your endocannabinoid system.',
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
