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

**[CBD](/glossary/cannabidiol) (cannabidiol)** is a naturally occurring compound found in the cannabis plant. Unlike [THC](/glossary/tetrahydrocannabinol), CBD doesn't cause intoxication or a "high." It works through the [endocannabinoid system](/glossary/endocannabinoid-system) and multiple other receptor targets to produce potential therapeutic effects. CBD is legal in most countries when derived from hemp containing less than 0.3% THC.

---

## What Is CBD?

CBD (cannabidiol) is one of over 100 [cannabinoids](/glossary/cannabinoid-profile) produced by the Cannabis sativa plant. It's the second most abundant cannabinoid after THC, typically comprising 1-25% of the plant's cannabinoid content depending on the strain.

First isolated in 1940 by Roger Adams, CBD's structure was determined in 1963 by Raphael Mechoulam—the same scientist who later discovered the [endocannabinoid system](/glossary/endocannabinoid-system).

### CBD Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Cannabidiol |
| **Chemical formula** | C₂₁H₃₀O₂ |
| **Molecular weight** | 314.46 g/mol |
| **Discovery** | 1940 (isolated), 1963 (structure determined) |
| **Psychoactive** | No (non-intoxicating) |
| **Legal status** | Legal in most countries (from hemp) |
| **FDA approval** | [Epidiolex](/glossary/epidiolex) (2018) for seizures |

---

## How CBD Works

CBD has a complex pharmacology, interacting with multiple receptor systems throughout the body.

### CBD's Primary Molecular Targets

| Target | CBD Action | Effect |
|--------|------------|--------|
| **[CB1 receptors](/glossary/cb1-receptor)** | Negative allosteric modulator | Reduces THC effects |
| **[CB2 receptors](/glossary/cb2-receptor)** | Low affinity | Minimal direct effect |
| **[5-HT1A](/glossary/serotonin-receptors-5ht1a)** (serotonin) | Agonist | Anti-anxiety, anti-nausea |
| **[TRPV1](/glossary/trpv1-receptor)** | Agonist/desensitizer | Pain modulation |
| **[PPARγ](/glossary/ppars)** | Agonist | Anti-inflammatory |
| **[GPR55](/glossary/gpr55-receptor)** | Antagonist | Anti-cancer research |
| **[FAAH](/glossary/faah-enzyme)** | Inhibitor | Raises [anandamide](/glossary/anandamide) |
| **Adenosine receptors** | Reuptake inhibition | Anti-inflammatory, sleep |

### Why CBD Doesn't Get You High

Unlike THC, CBD doesn't directly activate [CB1 receptors](/glossary/cb1-receptor) in the brain—the receptors responsible for cannabis intoxication. Instead, CBD:

1. Has very low affinity for CB1
2. Acts as a negative allosteric modulator (makes CB1 less responsive to THC)
3. Works primarily through non-cannabinoid receptors

This is why you can take CBD without experiencing altered perception, euphoria, or impairment.

---

## CBD vs. THC: Key Differences

CBD and [THC](/glossary/tetrahydrocannabinol) are the two most well-known cannabinoids, but they're very different.

### Comparison Table

| Property | CBD | THC |
|----------|-----|-----|
| **Intoxicating** | No | Yes |
| **CB1 activation** | Very low | High |
| **Legal status** | Legal (from hemp) | Varies by location |
| **Drug test** | Won't cause positive | Will cause positive |
| **Side effects** | Minimal | Significant |
| **Anxiety** | May reduce | Can increase or decrease |
| **FDA approved** | Yes (Epidiolex) | Yes (Marinol, synthetic) |

### Do They Work Together?

Yes. When used together, CBD and THC demonstrate the [entourage effect](/glossary/entourage-effect):

| Interaction | Effect |
|-------------|--------|
| CBD reduces THC's high | Less intense experience |
| CBD reduces THC's anxiety | Fewer negative effects |
| Combined may be more effective | Synergy for some conditions |

---

## What Is CBD Used For?

People use CBD for various purposes, though regulatory agencies haven't approved most uses.

### Common Reasons People Use CBD

| Purpose | Evidence Level | Notes |
|---------|----------------|-------|
| **Epilepsy** | Strong (FDA approved) | [Epidiolex](/glossary/epidiolex) for specific syndromes |
| **[Anxiety](/glossary/anxiety)** | Moderate | Human trials show promise |
| **[Sleep](/glossary/sleep-disorders)** | Moderate | May help at higher doses |
| **[Pain](/glossary/chronic-pain)** | Moderate | Especially inflammatory pain |
| **[Inflammation](/glossary/inflammation)** | Preclinical | Animal studies positive |
| **Neuroprotection** | Preclinical | Research ongoing |

### FDA-Approved CBD Medication

[Epidiolex](/glossary/epidiolex) is the only FDA-approved CBD medication. It's approved for:

| Condition | Age Group | Approval Year |
|-----------|-----------|---------------|
| Dravet syndrome | 1+ years | 2018 |
| Lennox-Gastaut syndrome | 1+ years | 2018 |
| Tuberous sclerosis complex | 1+ years | 2020 |

---

## Types of CBD Products

CBD comes in various forms with different characteristics.

### CBD Product Types

| Type | Description | Onset | Duration |
|------|-------------|-------|----------|
| **Oils/Tinctures** | Liquid taken sublingually | 15-30 min | 4-6 hours |
| **Capsules** | Swallowed soft gels or pills | 60-90 min | 6-8 hours |
| **Gummies/Edibles** | CBD-infused foods | 60-90 min | 6-8 hours |
| **[Topicals](/glossary/topical)** | Creams, balms for skin | 15-45 min | 4-6 hours (local) |
| **Vapes** | Inhaled vapor | 1-3 min | 2-3 hours |
| **Patches** | Transdermal delivery | 1-2 hours | Up to 12 hours |

### CBD Spectrum Types

| Type | Contains | THC | Best For |
|------|----------|-----|----------|
| **[Full Spectrum](/glossary/full-spectrum)** | All cannabinoids | <0.3% | Maximum entourage effect |
| **[Broad Spectrum](/glossary/broad-spectrum)** | Multiple cannabinoids | 0% | Entourage without THC |
| **[Isolate](/glossary/cbd-isolate)** | Pure CBD only | 0% | Precise dosing, drug tests |

Learn more: [Full Spectrum vs. Broad Spectrum vs. Isolate](/articles/spectrum-comparison)

---

## CBD Dosage

There's no universal CBD dose—optimal amounts vary by person and purpose.

### General Dosage Guidelines

| Purpose | Starting Dose | Common Range |
|---------|---------------|--------------|
| **General wellness** | 10-15mg | 15-30mg |
| **Sleep** | 25-50mg | 50-150mg |
| **Anxiety** | 15-25mg | 25-75mg |
| **Pain** | 20-40mg | 40-100mg+ |
| **Epilepsy (Epidiolex)** | 2.5mg/kg | 5-20mg/kg |

### Dosing Tips

| Tip | Reason |
|-----|--------|
| **Start low, go slow** | Find minimum effective dose |
| **Take with fatty food** | Increases [bioavailability](/glossary/bioavailability) 4-5x |
| **Be consistent** | Effects may build over time |
| **Keep a journal** | Track what works |
| **Wait 2 weeks** | Full effects take time |

Learn more: [CBD Bioavailability Guide](/articles/cbd-bioavailability)

---

## Is CBD Safe?

CBD has a favorable safety profile, but considerations exist.

### CBD Safety Profile

| Aspect | Assessment |
|--------|------------|
| **WHO assessment** | "Good safety profile" (2017) |
| **Serious adverse events** | Rare |
| **Overdose risk** | No known fatal overdose |
| **Addiction potential** | None demonstrated |
| **Long-term safety** | Not fully established |

### Potential Side Effects

| Side Effect | Frequency | Notes |
|-------------|-----------|-------|
| **Fatigue/drowsiness** | Common at high doses | Dose-dependent |
| **Diarrhea** | Occasional | Often with carrier oil |
| **Appetite changes** | Occasional | Usually mild |
| **Dry mouth** | Occasional | Mild |
| **Drug interactions** | Possible | See below |

### Drug Interactions

CBD inhibits CYP450 liver enzymes, potentially affecting medications:

| Medication Type | Interaction Risk |
|-----------------|------------------|
| Blood thinners (warfarin) | Increased bleeding risk |
| Certain anti-seizure drugs | Level changes |
| Immunosuppressants | Level changes |
| Some heart medications | Level changes |

**Always consult your doctor before using CBD with medications.**

---

## Is CBD Legal?

CBD legality depends on its source and your location.

### US Federal Law

| Source | Legal Status | THC Limit |
|--------|--------------|-----------|
| **Hemp-derived CBD** | Legal (2018 Farm Bill) | <0.3% THC |
| **Marijuana-derived CBD** | Federally illegal | Any THC level |

### International Status

| Region | Status |
|--------|--------|
| **European Union** | Legal (novel food regulations) |
| **United Kingdom** | Legal (FSA regulated) |
| **Canada** | Legal (regulated) |
| **Australia** | Prescription or low-dose OTC |
| **Asia** | Often restricted or illegal |

**Check local laws before purchasing or traveling with CBD.**

---

## How to Choose Quality CBD

Not all CBD products are equal. Here's what to look for.

### Quality Checklist

| Factor | What to Look For |
|--------|------------------|
| **Third-party testing** | Certificate of Analysis (COA) |
| **CBD content verified** | Matches label claim |
| **THC level** | Under legal limit |
| **Pesticides** | Not detected |
| **Heavy metals** | Below safe limits |
| **Solvents** | Not detected |
| **Source** | US or EU grown hemp |
| **Extraction method** | CO2 preferred |

### Red Flags

| Warning Sign | Why It Matters |
|--------------|----------------|
| No COA available | Can't verify contents |
| Medical claims | Illegal, likely dishonest |
| Extremely cheap | Quality concerns |
| Unrealistic CBD amounts | May be mislabeled |

---

## CBD History

CBD has a surprisingly long research history.

### Timeline

| Year | Event |
|------|-------|
| **1940** | Roger Adams isolates CBD |
| **1963** | Raphael Mechoulam determines CBD structure |
| **1980** | First CBD epilepsy study in humans |
| **1988** | CB1 receptor discovered |
| **1992** | Anandamide discovered |
| **2018** | FDA approves Epidiolex |
| **2018** | US Farm Bill legalizes hemp CBD |

---

## Related Articles

- [How CBD Works in the Body](/articles/how-cbd-works) - Detailed mechanism guide
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Your body's cannabinoid system
- [Full Spectrum vs. Broad Spectrum vs. Isolate](/articles/spectrum-comparison) - Product types compared
- [CBD Bioavailability Guide](/articles/cbd-bioavailability) - Maximize absorption

---

## Frequently Asked Questions

### Will CBD get me high?

No. [CBD](/glossary/cannabidiol) is non-intoxicating and doesn't produce the "high" associated with cannabis. That effect comes from [THC](/glossary/tetrahydrocannabinol), which directly activates CB1 receptors in the brain. CBD has very low CB1 affinity and actually reduces THC's effects when taken together.

### Is CBD addictive?

No. The World Health Organization's 2017 report found CBD has no abuse or dependence potential. Unlike THC or opioids, CBD doesn't activate reward pathways associated with addiction. You can stop taking CBD without withdrawal symptoms.

### How long does CBD take to work?

It depends on the delivery method. Inhaled CBD works in 1-3 minutes. Sublingual oils take 15-30 minutes. Swallowed capsules or gummies take 60-90 minutes. Some benefits may build over days to weeks of consistent use.

### Can I fail a drug test from CBD?

Pure CBD won't cause a positive drug test (tests look for THC). However, [full spectrum](/glossary/full-spectrum) CBD products contain trace THC (<0.3%), and regular high-dose use could potentially accumulate enough THC metabolites to trigger a positive. Use [CBD isolate](/glossary/cbd-isolate) or verified broad spectrum if you're drug tested.

### How much CBD should I take?

There's no universal dose. Most people start with 10-25mg and adjust based on effects. Factors affecting optimal dose include body weight, metabolism, the condition being addressed, and product type. Start low, increase gradually, and keep a journal to find what works for you.

### Is CBD legal everywhere?

No. CBD derived from hemp (<0.3% THC) is federally legal in the US under the 2018 Farm Bill, but some states have restrictions. Internationally, laws vary widely—CBD is legal in most of Europe and Canada, restricted in Australia, and often illegal in Asia. Always check local laws.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. CBD is not FDA-approved for any condition except specific seizure disorders (as Epidiolex). Consult a healthcare professional before using CBD, especially if taking medications.*

---

### References

1. Mechoulam R, Shvo Y. Hashish—I: The structure of cannabidiol. *Tetrahedron*. 1963;19(12):2073-2078.

2. World Health Organization. Cannabidiol (CBD) Critical Review Report. Expert Committee on Drug Dependence, 40th Meeting. 2018.

3. Devinsky O, et al. Trial of cannabidiol for drug-resistant seizures in the Dravet syndrome. *N Engl J Med*. 2017;376(21):2011-2020.

4. Millar SA, et al. A systematic review on the pharmacokinetics of cannabidiol in humans. *Front Pharmacol*. 2018;9:1365.

5. Huestis MA. Human cannabinoid pharmacokinetics. *Chem Biodivers*. 2007;4(8):1770-1804.

6. Agriculture Improvement Act of 2018 (2018 Farm Bill). Public Law 115-334.`;

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
      title: 'What Is CBD? The Complete Guide to Cannabidiol',
      slug: 'what-is-cbd',
      excerpt: 'Learn what CBD is, how it works, its uses, safety profile, and legal status. Understand why CBD doesn\'t get you high and how it differs from THC.',
      content: content,
      status: 'published',
      featured: true,
      article_type: 'science',
      category_id: category.id,
      reading_time: 12,
      meta_title: 'What Is CBD (Cannabidiol)? Complete Guide 2024',
      meta_description: 'Understand what CBD is, how it works in your body, its uses, safety, and legal status. Learn why CBD doesn\'t cause a high and how to choose quality products.',
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
