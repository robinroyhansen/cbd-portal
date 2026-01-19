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

[FAAH](/glossary/faah-enzyme) (fatty acid amide hydrolase) is the enzyme that breaks down [anandamide](/glossary/anandamide)—your body's "bliss molecule." When FAAH is inhibited, anandamide levels rise, enhancing natural [endocannabinoid](/glossary/endocannabinoid-system) signaling. [CBD](/glossary/cannabidiol) inhibits FAAH, which is one key mechanism explaining how CBD produces its therapeutic effects without directly activating cannabinoid receptors.

---

## What Is FAAH?

FAAH (fatty acid amide hydrolase) is the primary enzyme responsible for degrading [anandamide](/glossary/anandamide) and other fatty acid amides. Discovered in 1996, FAAH acts as the "off switch" for anandamide signaling.

Without FAAH, anandamide would accumulate and continuously activate [CB1](/glossary/cb1-receptor) and [CB2 receptors](/glossary/cb2-receptor). FAAH ensures endocannabinoid signaling remains brief and controlled.

### FAAH Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Fatty acid amide hydrolase |
| **Discovery** | 1996 (Cravatt et al.) |
| **Gene** | FAAH (chromosome 1) |
| **Primary substrate** | Anandamide (AEA) |
| **Other substrates** | OEA, PEA, other fatty acid amides |
| **Location** | Cell membranes (postsynaptic) |
| **Products** | Arachidonic acid + ethanolamine |

---

## How FAAH Controls Anandamide

FAAH is the gatekeeper of anandamide levels throughout your body.

### The Anandamide Lifecycle

1. **Synthesis** → Anandamide produced on-demand from membrane lipids
2. **Release** → Travels backward across synapse ([retrograde signaling](/glossary/retrograde-signaling))
3. **Binding** → Activates CB1, CB2, or [TRPV1](/glossary/trpv1-receptor) receptors
4. **Uptake** → Transported back into cells
5. **FAAH degradation** → Broken down into arachidonic acid + ethanolamine

### FAAH Reaction

| Input | Enzyme | Products |
|-------|--------|----------|
| Anandamide + H₂O | FAAH | Arachidonic acid + Ethanolamine |

### Speed of Degradation

FAAH works extremely fast—anandamide has a half-life of only minutes. This ensures:
- Brief, controlled signaling
- No accumulation
- Precise regulation

---

## Why FAAH Matters: The Balance of Bliss

FAAH activity determines your baseline endocannabinoid tone.

### High FAAH Activity

| Effect | Consequence |
|--------|-------------|
| Low anandamide | Reduced endocannabinoid tone |
| Less CB1 activation | Potentially more anxiety, pain sensitivity |
| Faster signal termination | Sharper "off" signals |

### Low FAAH Activity

| Effect | Consequence |
|--------|-------------|
| High anandamide | Enhanced endocannabinoid tone |
| More CB1/CB2 activation | Potentially less anxiety, better mood |
| Prolonged signaling | Longer-lasting effects |

### The Goldilocks Zone

Optimal health likely requires balanced FAAH activity—not too much, not too little. Complete FAAH blockade causes issues (see research section), while excessive FAAH may contribute to endocannabinoid deficiency.

---

## CBD and FAAH Inhibition

[CBD's](/glossary/cannabidiol) inhibition of FAAH is one of its most important mechanisms.

### How CBD Affects FAAH

| Mechanism | Result |
|-----------|--------|
| CBD inhibits FAAH | Less anandamide degradation |
| Anandamide accumulates | Higher endocannabinoid tone |
| Enhanced CB1/CB2 signaling | Therapeutic effects |

### Clinical Evidence

A landmark 2012 study in *Translational Psychiatry* found:

| Finding | Detail |
|---------|--------|
| CBD increased serum anandamide | In schizophrenia patients |
| Higher anandamide correlated with symptom improvement | Dose-dependent relationship |
| CBD's effects were mediated by FAAH inhibition | Mechanism confirmed |

### CBD vs. Direct CB1 Agonists

| Approach | CBD (FAAH inhibition) | THC (CB1 activation) |
|----------|----------------------|---------------------|
| Mechanism | Raises natural anandamide | Direct receptor activation |
| Intensity | Gentle, regulatory | Pronounced |
| Intoxication | None | Yes |
| Tolerance risk | Lower | Higher |
| Side effect profile | Minimal | Significant |

This explains why CBD produces therapeutic effects without the "high"—it simply helps your natural anandamide work longer.

---

## FAAH Genetics: The Happiness Gene?

A genetic variation in the FAAH gene affects how efficiently the enzyme works.

### The FAAH C385A Polymorphism

| Variant | FAAH Activity | Anandamide Level | Prevalence |
|---------|---------------|------------------|------------|
| **CC (normal)** | Normal | Normal | ~60% |
| **CA (heterozygous)** | Reduced | Elevated | ~35% |
| **AA (homozygous)** | Significantly reduced | High | ~5% |

### Effects of Low-Activity FAAH (AA variant)

| Domain | Effect | Research |
|--------|--------|----------|
| **Anxiety** | Lower anxiety levels | Human studies |
| **Fear extinction** | Better trauma processing | Human + animal |
| **Pain tolerance** | Potentially higher | Preliminary |
| **Addiction risk** | May be lower | Mixed evidence |
| **Stress response** | Better resilience | Animal studies |

### The "Less Anxious" Gene

A 2015 study in *Nature Communications* found that people with the AA variant:
- Show reduced amygdala reactivity to threats
- Have better fear extinction
- Report lower trait anxiety

This suggests that naturally higher anandamide (from reduced FAAH) promotes emotional resilience.

---

## FAAH Inhibitors: Pharmaceutical Attempts

Drug companies have developed synthetic FAAH inhibitors to raise anandamide therapeutically.

### Compounds in Development

| Compound | Developer | Status | Target Indication |
|----------|-----------|--------|-------------------|
| **PF-04457845** | Pfizer | Phase II | Pain, cannabis withdrawal |
| **JNJ-42165279** | Johnson & Johnson | Phase II | Social anxiety, depression |
| **BIA 10-2474** | Bial | Withdrawn | Pain (safety issues) |
| **URB597** | Research tool | Preclinical | Various |

### The BIA 10-2474 Tragedy

In 2016, a Phase I trial of the FAAH inhibitor BIA 10-2474 caused severe brain damage in volunteers, killing one participant. This setback revealed:

| Lesson | Detail |
|--------|--------|
| Off-target effects | The drug hit non-FAAH targets |
| Dose matters | Very high doses used |
| Selectivity critical | Need pure FAAH inhibition |
| Natural inhibitors safer? | CBD has good safety profile |

### Why CBD May Be Different

CBD has FAAH inhibitory activity but:
- Is a weaker, partial inhibitor
- Has other targets that may be protective
- Has decades of human safety data
- Doesn't completely block FAAH

This may explain why CBD is safe while some synthetic FAAH inhibitors caused problems.

---

## FAAH vs. MAGL: The Two Degradation Enzymes

While FAAH degrades anandamide, MAGL degrades [2-AG](/glossary/2-ag)—the other major endocannabinoid.

### Comparison

| Property | FAAH | MAGL |
|----------|------|------|
| **Primary substrate** | Anandamide | 2-AG |
| **Location** | Postsynaptic terminals | Presynaptic terminals |
| **Brain 2-AG contribution** | ~1% | ~85% |
| **CBD effect** | Inhibits | Minimal effect |
| **Complete blockade** | Tolerated (mostly) | Causes CB1 tolerance |

### Why Target FAAH Over MAGL?

| FAAH Inhibition | MAGL Inhibition |
|-----------------|-----------------|
| Raises anandamide | Raises 2-AG |
| Partial agonist elevated | Full agonist elevated |
| Less risk of CB1 overload | Risk of tolerance/desensitization |
| Better tolerated | Tolerance develops |

This is why pharmaceutical development has focused more on FAAH than MAGL inhibitors.

---

## FAAH in Specific Conditions

Research has examined FAAH in various health contexts.

### Anxiety and Depression

| Finding | Implication |
|---------|-------------|
| High FAAH associated with anxiety | Low anandamide = more anxiety |
| FAAH inhibitors reduce anxiety in animals | Therapeutic potential |
| FAAH gene variant protects against anxiety | Genetic confirmation |

### Pain

| Pain Type | FAAH Role | Evidence |
|-----------|-----------|----------|
| **Inflammatory** | FAAH inhibition reduces | Strong preclinical |
| **Neuropathic** | FAAH inhibition helps | Moderate preclinical |
| **Cancer pain** | Potential benefit | Preliminary |

### Addiction

| Finding | Status |
|---------|--------|
| FAAH inhibitors reduce cannabis withdrawal | Phase II trials |
| Anandamide may reduce craving | Preclinical |
| FAAH gene variants affect addiction risk | Mixed evidence |

### PTSD and Trauma

| Finding | Implication |
|---------|-------------|
| FAAH inhibition improves fear extinction | Trauma processing |
| Low-FAAH individuals process trauma better | Natural resilience |
| CBD's FAAH inhibition may help PTSD | Clinical research ongoing |

---

## Other FAAH Substrates

FAAH doesn't just degrade anandamide—it breaks down other fatty acid amides too.

### FAAH's Substrates

| Compound | Function | FAAH Effect |
|----------|----------|-------------|
| **Anandamide** | Endocannabinoid | Primary substrate |
| **OEA (oleoylethanolamine)** | Appetite suppression, fat metabolism | Degraded by FAAH |
| **PEA (palmitoylethanolamide)** | Anti-inflammatory, analgesic | Degraded by FAAH |
| **N-acyl taurines** | Various signaling | FAAH substrates |

### Implications for FAAH Inhibition

When FAAH is inhibited, ALL these compounds rise—not just anandamide. This may contribute additional therapeutic benefits:

| Compound | Elevated by FAAH Inhibition | Benefit |
|----------|----------------------------|---------|
| Anandamide | Yes | CB1/CB2 signaling |
| OEA | Yes | Satiety, metabolism |
| PEA | Yes | Anti-inflammatory |

---

## FAAH Distribution in the Body

FAAH is found throughout the body, matching anandamide's wide-ranging effects.

### FAAH Locations

| Location | FAAH Level | Function |
|----------|------------|----------|
| **Brain** | High | Regulates neural anandamide |
| **Liver** | Very high | Metabolizes fatty acid amides |
| **Small intestine** | High | Gut signaling |
| **Kidney** | Moderate | Renal function |
| **Uterus** | Moderate | Reproduction |
| **Immune cells** | Variable | Immune regulation |

---

## Related Articles

- [What Is Anandamide?](/articles/anandamide) - The endocannabinoid FAAH degrades
- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms including FAAH
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide
- [What Is 2-AG?](/articles/2-ag) - The other endocannabinoid

---

## Frequently Asked Questions

### What does FAAH do in the body?

[FAAH](/glossary/faah-enzyme) breaks down [anandamide](/glossary/anandamide), the "bliss molecule" endocannabinoid. It acts as an "off switch" for anandamide signaling, ensuring that endocannabinoid signals remain brief and controlled. Without FAAH, anandamide would accumulate and continuously activate cannabinoid receptors.

### Does CBD inhibit FAAH?

Yes. [CBD](/glossary/cannabidiol) inhibits FAAH, which slows anandamide breakdown and allows anandamide levels to rise. This is one of CBD's primary mechanisms—rather than directly activating cannabinoid receptors, CBD helps your natural endocannabinoids work longer. Clinical studies confirm CBD increases serum anandamide in humans.

### What is the FAAH gene variant?

The FAAH C385A polymorphism creates a less efficient FAAH enzyme. People with two copies of the variant (AA genotype, about 5% of people) have naturally higher anandamide levels and tend to report lower anxiety, better fear extinction, and greater emotional resilience.

### Are FAAH inhibitor drugs available?

No FAAH inhibitor drugs are currently approved. Several have been tested in clinical trials for pain, anxiety, and cannabis withdrawal. A 2016 trial of one FAAH inhibitor (BIA 10-2474) caused severe adverse events, slowing pharmaceutical development. CBD provides gentler FAAH inhibition with an established safety profile.

### Why is FAAH important for the endocannabinoid system?

FAAH is the main enzyme controlling anandamide levels—one of two primary endocannabinoids. By regulating how long anandamide stays active, FAAH determines the "tone" of your endocannabinoid system. High FAAH activity means low anandamide; low FAAH activity means elevated anandamide and enhanced [endocannabinoid system](/glossary/endocannabinoid-system) function.

### How is FAAH different from MAGL?

FAAH primarily degrades anandamide, while MAGL degrades [2-AG](/glossary/2-ag). FAAH is located postsynaptically; MAGL is presynaptic. Complete FAAH blockade is generally tolerated, but complete MAGL blockade causes CB1 receptor tolerance. They're complementary enzymes controlling different endocannabinoids.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. FAAH inhibitor research is ongoing, and pharmaceutical FAAH inhibitors are not approved. Consult a healthcare professional before making health decisions.*

---

### References

1. Cravatt BF, et al. Molecular characterization of an enzyme that degrades neuromodulatory fatty-acid amides. *Nature*. 1996;384(6604):83-87.

2. Leweke FM, et al. Cannabidiol enhances anandamide signaling and alleviates psychotic symptoms of schizophrenia. *Transl Psychiatry*. 2012;2(3):e94.

3. Dincheva I, et al. FAAH genetic variation enhances fronto-amygdala function in mouse and human. *Nat Commun*. 2015;6:6395.

4. Kathuria S, et al. Modulation of anxiety through blockade of anandamide hydrolysis. *Nat Med*. 2003;9(1):76-81.

5. Mayo LM, et al. Elevated anandamide, enhanced recall of fear extinction, and attenuated stress responses following inhibition of fatty acid amide hydrolase. *Neuropsychopharmacology*. 2020;45(8):1351-1360.

6. van Esbroeck ACM, et al. Activity-based protein profiling reveals off-target proteins of the FAAH inhibitor BIA 10-2474. *Science*. 2017;356(6342):1084-1087.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'What Is FAAH? The Enzyme That Controls Your Bliss Molecule',
    slug: 'faah-enzyme',
    excerpt: 'Learn about FAAH—the enzyme that breaks down anandamide. Discover how CBD inhibits FAAH to raise natural endocannabinoid levels, and why FAAH genetics affect anxiety and mood.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    reading_time: 10,
    meta_title: 'FAAH Enzyme Explained: How It Controls Anandamide',
    meta_description: 'Understand FAAH, the enzyme that degrades anandamide. Learn how CBD inhibits FAAH to boost endocannabinoid levels and why FAAH gene variants affect anxiety.',
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
