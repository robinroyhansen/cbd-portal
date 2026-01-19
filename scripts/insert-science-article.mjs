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

[Cannabidiol](/glossary/cannabidiol) (CBD) works primarily by interacting with your body's [endocannabinoid system](/glossary/endocannabinoid-system) (ECS), a complex cell-signaling network that regulates sleep, mood, pain, and immune function. Unlike THC, CBD doesn't directly activate cannabinoid receptors but instead modulates them and influences over 65 different molecular targets throughout the body.

---

## Understanding the Endocannabinoid System

Before understanding how CBD works, you need to understand the system it interacts with. The [endocannabinoid system](/glossary/endocannabinoid-system) was discovered in the 1990s by researchers studying cannabis, and it exists in all vertebrates.

The ECS consists of three main components:

| Component | Function | Examples |
|-----------|----------|----------|
| **Endocannabinoids** | Signaling molecules produced by your body | [Anandamide](/glossary/anandamide), [2-AG](/glossary/2-ag) |
| **Receptors** | Proteins that receive signals | [CB1](/glossary/cb1-receptor), [CB2](/glossary/cb2-receptor), [GPR55](/glossary/gpr55-receptor) |
| **Enzymes** | Break down endocannabinoids after use | [FAAH](/glossary/faah-enzyme), MAGL |

Think of the ECS as your body's master regulator, constantly working to maintain [homeostasis](/glossary/homeostasis)—the stable internal balance your cells need to function properly.

### Where Are Cannabinoid Receptors Located?

**CB1 receptors** are predominantly found in the central nervous system—your brain and spinal cord. They're particularly dense in areas controlling:
- Memory and cognition (hippocampus)
- Movement coordination (basal ganglia, cerebellum)
- Pain perception (spinal cord)
- Mood and anxiety (amygdala, prefrontal cortex)

**CB2 receptors** are mainly found in peripheral tissues, especially immune cells. They play crucial roles in:
- Inflammatory responses
- Immune system regulation
- Bone metabolism
- Gastrointestinal function

---

## How CBD Interacts With Your Body

Unlike [THC](/glossary/tetrahydrocannabinol), which directly binds to CB1 receptors (producing its intoxicating effects), CBD has a more complex mechanism of action. Research published in the *British Journal of Pharmacology* (2020) describes CBD as a "multi-target compound" with over 65 identified molecular targets.

### 1. Indirect CB1 and CB2 Modulation

CBD acts as a negative allosteric modulator of CB1 receptors. In simpler terms: it changes the shape of the receptor slightly, reducing how strongly other molecules (like THC or [anandamide](/glossary/anandamide)) can bind to it.

This explains why CBD can reduce some of THC's effects—it's essentially making the CB1 "lock" harder for THC to fully engage.

### 2. FAAH Inhibition: Boosting Your Natural Endocannabinoids

One of CBD's most important mechanisms is inhibiting the FAAH enzyme, which breaks down [anandamide](/glossary/anandamide)—often called the "bliss molecule." By slowing anandamide breakdown, CBD allows more of this natural feel-good compound to circulate in your system.

A 2012 study in *Translational Psychiatry* found that people with higher anandamide levels reported better mood and reduced anxiety. This FAAH-inhibiting mechanism may explain CBD's [anxiolytic](/glossary/anxiolytic) effects.

### 3. Serotonin Receptor Activation (5-HT1A)

CBD directly activates [5-HT1A serotonin receptors](/glossary/serotonin-receptors-5ht1a), the same receptors targeted by some anti-anxiety and antidepressant medications. This activation occurs at therapeutic concentrations and may explain CBD's rapid anti-anxiety effects observed in clinical studies.

Research from the University of São Paulo (2019) demonstrated that a single 300mg CBD dose reduced anxiety in public speaking tests, with effects correlating to 5-HT1A receptor activity.

### 4. TRPV1 Receptor Activation

CBD activates [TRPV1 receptors](/glossary/trpv1-receptor) (transient receptor potential vanilloid type 1), also known as the "capsaicin receptor"—the same receptor triggered by chili peppers. TRPV1 plays key roles in:

- Pain perception
- Body temperature regulation
- Inflammation

This mechanism helps explain CBD's potential for pain management. Interestingly, prolonged TRPV1 activation leads to desensitization, which may reduce chronic pain signaling over time.

### 5. PPAR Activation

CBD activates [peroxisome proliferator-activated receptors (PPARs)](/glossary/ppars), particularly PPAR-gamma. These nuclear receptors regulate:

- Gene expression
- Metabolism and energy balance
- Anti-inflammatory responses
- Insulin sensitivity

PPAR activation may explain some of CBD's potential metabolic benefits and its ability to reduce neuroinflammation.

### 6. GPR55 Antagonism

[GPR55](/glossary/gpr55-receptor), sometimes called the "orphan receptor," is increasingly recognized as a third cannabinoid receptor. CBD acts as an antagonist (blocker) at GPR55, which is associated with:

- Cancer cell proliferation (blocking may reduce tumor growth)
- Bone resorption
- Blood pressure regulation

---

## CBD Bioavailability: Why Delivery Method Matters

[Bioavailability](/glossary/bioavailability) refers to the percentage of CBD that actually reaches your bloodstream and becomes available for your body to use. This is crucial because CBD is highly [lipophilic](/glossary/lipophilic) (fat-soluble) and undergoes significant [first-pass metabolism](/glossary/first-pass-metabolism) in the liver.

### Bioavailability by Administration Route

| Method | Bioavailability | [Onset Time](/glossary/onset-time) | [Duration](/glossary/duration-of-effects) | Notes |
|--------|-----------------|------------|----------|-------|
| **[Inhalation](/glossary/inhalation)** | 31-56% | 1-3 minutes | 2-4 hours | Fastest onset, but lung exposure concerns |
| **[Sublingual](/glossary/sublingual)** | 13-35% | 15-45 minutes | 4-6 hours | Bypasses first-pass metabolism |
| **[Oral](/glossary/oral)** | 6-19% | 30-90 minutes | 6-8 hours | Most affected by first-pass metabolism |
| **[Topical](/glossary/topical)** | Localized | 15-60 minutes | 4-6 hours | Does not reach systemic circulation |
| **[Transdermal](/glossary/transdermal)** | ~46% (reported) | 1-2 hours | 8-12 hours | Steady absorption, bypasses liver |

### Why Is Oral Bioavailability So Low?

When you swallow CBD, it passes through your digestive system and liver before reaching systemic circulation. The liver's [CYP450 enzymes](/glossary/cyp450)—particularly CYP3A4 and CYP2C19—metabolize a large portion of the CBD before it can take effect.

**Pro tip:** Taking CBD with fatty foods can increase oral bioavailability by 4-5x. A 2019 study from the University of Minnesota found that CBD absorption increased approximately 4-fold when taken with a high-fat meal.

### Improving Bioavailability: New Formulation Technologies

Researchers are developing innovative delivery systems to improve CBD bioavailability:

- **[Nanoemulsions](/glossary/nano-cbd):** Tiny CBD particles (< 100nm) that absorb more readily
- **[Liposomal](/glossary/liposomal) formulations:** CBD encapsulated in phospholipid spheres
- **Self-emulsifying systems:** Spontaneously form emulsions in the gut
- **[Water-soluble](/glossary/water-soluble) CBD:** Processed for improved aqueous dispersion

A 2025 study in *Pharmaceutics* demonstrated that a novel self-nanoemulsifying formulation achieved 4.4x higher bioavailability compared to standard oil-based CBD.

---

## CBD Pharmacokinetics: What Happens After You Take It

Understanding CBD's [pharmacokinetics](/glossary/pharmacokinetics)—how your body absorbs, distributes, metabolizes, and eliminates it—helps optimize dosing.

### Absorption and Distribution

After absorption, CBD distributes widely throughout the body, with preference for fatty tissues. Its high lipophilicity means CBD can:
- Cross the [blood-brain barrier](/glossary/blood-brain-barrier)
- Accumulate in adipose (fat) tissue
- Have prolonged effects with repeated dosing

### Metabolism

CBD is primarily metabolized by CYP450 liver enzymes into over 100 metabolites. The main metabolites include:
- 7-OH-CBD (7-hydroxy-cannabidiol)
- 6-OH-CBD
- Various carboxylic acid metabolites

This extensive hepatic metabolism is why CBD can interact with other medications that use the same enzyme pathways.

### Half-Life and Elimination

CBD's [half-life](/glossary/half-life) (the time for blood levels to drop by 50%) varies significantly based on delivery method and individual factors:

| Route | Half-Life Range |
|-------|-----------------|
| Inhalation | 27-35 hours |
| Oral (single dose) | 14-17 hours |
| Oral (chronic use) | 2-5 days |
| Sublingual | 12-24 hours |

With repeated daily dosing, CBD accumulates in tissues, which may explain why some people experience increasing benefits over time.

---

## The Entourage Effect: CBD in Context

The [entourage effect](/glossary/entourage-effect) refers to the theory that cannabis compounds work better together than in isolation. This concept distinguishes between CBD product types:

| Product Type | Composition | Potential Entourage Effect |
|--------------|-------------|---------------------------|
| **[Full-spectrum](/glossary/full-spectrum)** | CBD + other cannabinoids + [terpenes](/glossary/terpenes) + [flavonoids](/glossary/flavonoids) (trace THC <0.2%) | Full entourage effect |
| **[Broad-spectrum](/glossary/broad-spectrum)** | CBD + other cannabinoids + terpenes + flavonoids (THC removed) | Partial entourage effect |
| **[CBD Isolate](/glossary/cbd-isolate)** | 99%+ pure CBD only | No entourage effect |

A 2015 study from the Lautenberg Center for Immunology and Cancer Research found that [full-spectrum](/glossary/full-spectrum) cannabis extract was more effective than pure CBD for reducing inflammation in mice, with a bell-shaped dose-response curve for CBD isolate but linear dose-response for the full extract.

### Key Entourage Compounds

- **[Terpenes](/glossary/terpenes):** [Myrcene](/glossary/myrcene) (sedating), [limonene](/glossary/limonene) (mood-lifting), [linalool](/glossary/linalool) (calming)
- **[Flavonoids](/glossary/flavonoids):** Cannflavins A, B, C—unique to cannabis with anti-inflammatory properties
- **Minor [cannabinoids](/glossary/minor-cannabinoids):** [CBG](/glossary/cannabigerol), [CBN](/glossary/cannabinol), [CBC](/glossary/cannabichromene)

---

## Drug Interactions: What You Need to Know

CBD's interaction with [CYP450 enzymes](/glossary/cyp450) means it can affect how your body processes other medications. This is clinically significant and requires attention.

### The Grapefruit Test

A helpful rule of thumb: if your medication has a [grapefruit warning](/glossary/grapefruit-interaction), CBD may interact with it similarly. Both inhibit CYP3A4 enzymes.

### Medications Requiring Caution

| Drug Category | Examples | Interaction Concern |
|---------------|----------|---------------------|
| Blood thinners | Warfarin | Increased bleeding risk |
| Anti-epileptics | Clobazam, valproate | Altered drug levels |
| Immunosuppressants | Tacrolimus | Increased drug levels |
| Sedatives | Benzodiazepines | Enhanced sedation |
| Heart medications | Some beta-blockers | Variable effects |

A 2025 Phase I trial found that CBD increased tacrolimus (an immunosuppressant) blood levels by approximately 60%, demonstrating the clinical significance of these interactions.

**Always consult your healthcare provider before using CBD if you take prescription medications.**

---

## Current Research Limitations

While CBD research has expanded dramatically, important limitations remain:

1. **Dosing variability:** Studies use doses ranging from 5mg to 1,500mg daily
2. **Product inconsistency:** Many studies use pharmaceutical-grade CBD, not consumer products
3. **Short study durations:** Most trials last weeks, not months or years
4. **Limited populations:** Many studies exclude pregnant women, children, or people with certain conditions

The approved CBD medication [Epidiolex](/glossary/epidiolex) uses doses of 5-20mg/kg/day for seizure disorders—far higher than typical supplement doses.

---

## Related Articles

- [What is CBD Oil?](/kb/articles/cbd-oil-guide) - Complete guide to CBD oil products and usage

---

## Frequently Asked Questions

### How long does it take for CBD to work?

Onset time depends on your delivery method. [Inhalation](/glossary/inhalation) works within 1-3 minutes, [sublingual](/glossary/sublingual) absorption takes 15-45 minutes, and [oral](/glossary/oral) consumption can take 30-90 minutes. Effects also depend on whether you've eaten, your metabolism, and the [bioavailability](/glossary/bioavailability) of your specific product.

### Why doesn't CBD get you high like THC?

THC directly activates [CB1 receptors](/glossary/cb1-receptor) in the brain, producing intoxication. CBD doesn't bind strongly to these receptors and actually modulates them to reduce THC's effects. CBD works through different pathways, including [serotonin](/glossary/serotonin-receptors-5ht1a) and [TRPV1 receptors](/glossary/trpv1-receptor), which influence mood and pain without intoxication.

### Does CBD build up in your system over time?

Yes. CBD is [lipophilic](/glossary/lipophilic) (fat-soluble) and accumulates in fatty tissues with repeated use. This is why the [half-life](/glossary/half-life) increases from approximately 14-17 hours after a single dose to 2-5 days with chronic use. Many users report that CBD becomes more effective over several weeks of consistent use.

### Can I take too much CBD?

CBD has a favorable safety profile with no known lethal dose. However, high doses (typically above 300mg) may cause [side effects](/glossary/side-effects) including fatigue, diarrhea, and changes in appetite. The World Health Organization concluded in 2018 that CBD is "generally well tolerated with a good safety profile."

### Why should I take CBD with food?

Taking CBD with fatty foods dramatically increases [bioavailability](/glossary/bioavailability). A University of Minnesota study found that CBD absorption increased approximately 4-fold when taken with a high-fat meal compared to fasting. The fats help CBD dissolve and be absorbed through the lymphatic system, partially bypassing [first-pass metabolism](/glossary/first-pass-metabolism).

### How do I know what dose to take?

There's no universal CBD dose. Factors include your body weight, the condition you're addressing, product [bioavailability](/glossary/bioavailability), and individual metabolism. Most experts recommend starting low (10-25mg) and gradually increasing until you find your effective dose—a process called [titration](/glossary/titration). Keep a journal to track effects.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. CBD may interact with medications and is not suitable for everyone. Consult a healthcare professional before using CBD, especially if you have underlying health conditions or take prescription medications.*

---

### References

1. Pertwee RG. The diverse CB1 and CB2 receptor pharmacology of three plant cannabinoids. *Br J Pharmacol*. 2008;153(2):199-215.

2. Blessing EM, et al. Cannabidiol as a Potential Treatment for Anxiety Disorders. *Neurotherapeutics*. 2015;12(4):825-836.

3. Millar SA, et al. A systematic review on the pharmacokinetics of cannabidiol in humans. *Front Pharmacol*. 2018;9:1365.

4. Taylor L, et al. A Phase I, Randomized, Double-Blind, Placebo-Controlled, Single Ascending Dose, Multiple Dose, and Food Effect Trial of the Safety, Tolerability and Pharmacokinetics of Highly Purified Cannabidiol in Healthy Subjects. *CNS Drugs*. 2018;32:1053-1067.

5. Gallily R, et al. Overcoming the Bell-Shaped Dose-Response of Cannabidiol by Using Cannabis Extract Enriched in Cannabidiol. *Pharmacol Pharm*. 2015;6:75-85.

6. Bergamaschi MM, et al. Cannabidiol reduces the anxiety induced by simulated public speaking in treatment-naïve social phobia patients. *Neuropsychopharmacology*. 2011;36(6):1219-1226.

7. Birnbaum AK, et al. Food effect on pharmacokinetics of cannabidiol oral capsules in adult patients with refractory epilepsy. *Epilepsia*. 2019;60:1586-1592.

8. Nasrin S, et al. Cannabinoid Metabolites as Inhibitors of Major Hepatic CYP450 Enzymes. *Drug Metab Dispos*. 2021;49(12):1070-1080.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'The Science of CBD: How Cannabidiol Works in the Body',
    slug: 'how-cbd-works',
    excerpt: 'Discover the science behind CBD. Learn how cannabidiol interacts with your endocannabinoid system, its multiple receptor targets, and why bioavailability matters for therapeutic effects.',
    content: content,
    status: 'published',
    featured: true,
    article_type: 'science',
    reading_time: 12,
    meta_title: 'How CBD Works: The Science of Cannabidiol Explained',
    meta_description: 'Learn how CBD interacts with your endocannabinoid system, its 65+ molecular targets, bioavailability by delivery method, and why the entourage effect matters.',
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
  console.log('URL: /kb/articles/' + data.slug);
}
