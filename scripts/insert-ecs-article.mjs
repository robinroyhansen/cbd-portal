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

The [endocannabinoid system](/glossary/endocannabinoid-system) (ECS) is a biological system present in all mammals that regulates crucial functions including pain, mood, sleep, appetite, immune response, and memory. It consists of three components: endocannabinoids (signaling molecules your body produces), receptors (CB1 and CB2), and enzymes that break down endocannabinoids. This system maintains [homeostasis](/glossary/homeostasis)—your body's internal balance—and is the reason [cannabinoids](/glossary/cannabinoid-profile) like CBD can affect so many different processes.

---

## What is the Endocannabinoid System?

The endocannabinoid system is one of the most important physiological systems in your body, yet it wasn't discovered until the 1990s. Named after the cannabis plant that led to its discovery, the ECS exists regardless of whether you've ever used cannabis—it's a fundamental part of human biology.

Think of the ECS as your body's master regulatory system. While your nervous system transmits signals and your immune system fights pathogens, the ECS works behind the scenes to ensure all your biological systems stay balanced and communicate effectively.

### A Brief History of Discovery

| Year | Discovery | Researchers |
|------|-----------|-------------|
| 1964 | THC structure identified | Raphael Mechoulam, Yechiel Gaoni |
| 1988 | CB1 receptor discovered | Allyn Howlett, William Devane |
| 1992 | [Anandamide](/glossary/anandamide) discovered | Mechoulam, Devane, et al. |
| 1993 | CB2 receptor discovered | Sean Munro et al. |
| 1995 | [2-AG](/glossary/2-ag) discovered | Mechoulam, Shimon Ben-Shabat |

Dr. Raphael Mechoulam, often called the "father of cannabis research," made the pivotal discovery of anandamide—naming it after the Sanskrit word "ananda" meaning bliss or joy.

---

## The Three Components of the ECS

The endocannabinoid system consists of three interconnected components that work together like a lock-and-key system.

### 1. Endocannabinoids

Endocannabinoids are molecules your body produces naturally that are structurally similar to [phytocannabinoids](/glossary/phytocannabinoid) found in cannabis. Unlike [neurotransmitters](/glossary/neurotransmitter) that are stored in vesicles, endocannabinoids are synthesized on-demand when needed.

#### Anandamide (AEA)

[Anandamide](/glossary/anandamide), or arachidonoyl ethanolamide, was the first endocannabinoid discovered. Often called the "bliss molecule," anandamide plays roles in:

- **Mood regulation** - Contributes to feelings of wellbeing
- **Pain modulation** - Reduces pain signaling
- **Appetite control** - Influences hunger and satiety
- **Memory** - Involved in forgetting (yes, forgetting is important!)
- **Fertility** - Plays a role in early pregnancy

Anandamide has a short half-life—it's broken down quickly by the [FAAH enzyme](/glossary/faah-enzyme). This is why its effects are typically brief and localized.

**Interesting fact:** Anandamide is found in chocolate, which may partially explain chocolate's mood-enhancing effects.

#### 2-Arachidonoylglycerol (2-AG)

[2-AG](/glossary/2-ag) is the most abundant endocannabinoid in the body, present at concentrations 170 times higher than anandamide in some brain regions. It acts as a full agonist at both CB1 and CB2 receptors, meaning it fully activates them.

2-AG is involved in:

- **Immune function** - Regulates inflammatory responses
- **Cardiovascular health** - Affects blood pressure and heart function
- **Bone health** - Influences bone cell activity
- **Neuroprotection** - Protects neurons from damage
- **Pain regulation** - Reduces pain sensitivity

| Endocannabinoid | Primary Targets | Abundance | Half-life |
|-----------------|-----------------|-----------|-----------|
| Anandamide (AEA) | CB1 > CB2, TRPV1 | Lower | Very short |
| 2-AG | CB1 = CB2 | Higher (170x) | Short |

### 2. Cannabinoid Receptors

Cannabinoid receptors are proteins on cell surfaces that receive signals from endocannabinoids (and phytocannabinoids like CBD and THC). When activated, they trigger cellular responses.

#### CB1 Receptors

[CB1 receptors](/glossary/cb1-receptor) are the most abundant G-protein-coupled receptors in the mammalian brain. They're found primarily in the central nervous system but also appear in peripheral tissues.

**CB1 Location and Function:**

| Brain Region | Function Affected |
|--------------|-------------------|
| Hippocampus | Memory formation, learning |
| Cerebral cortex | Higher cognition, decision-making |
| Basal ganglia | Movement, motor control |
| Cerebellum | Coordination, balance |
| Hypothalamus | Appetite, body temperature |
| Amygdala | Emotional processing, fear |
| Spinal cord | Pain transmission |

CB1 receptors are also found in:
- Liver (metabolism)
- Adipose tissue (fat storage)
- Skeletal muscle
- Gastrointestinal tract
- Reproductive organs

**How THC works:** [THC](/glossary/tetrahydrocannabinol) directly binds to and activates CB1 receptors in the brain, which produces its intoxicating effects. This is why THC gets you "high" and CBD doesn't—CBD has very low affinity for CB1 receptors.

#### CB2 Receptors

[CB2 receptors](/glossary/cb2-receptor) are primarily found in the immune system and peripheral tissues. They play crucial roles in inflammation and immune response.

**CB2 Location and Function:**

| Location | Function |
|----------|----------|
| Immune cells (macrophages, B-cells, T-cells) | Immune modulation |
| Spleen | Immune cell production |
| Tonsils | Immune surveillance |
| Bone marrow | Blood cell production |
| Bone cells | Bone metabolism |
| Skin | Inflammation, wound healing |
| Gastrointestinal tract | Gut immunity, motility |

CB2 activation generally produces anti-inflammatory effects without the psychoactive effects associated with CB1 activation. This makes CB2 an attractive therapeutic target.

#### Beyond CB1 and CB2: Other Receptors

The ECS interacts with several other receptor systems:

| Receptor | Type | CBD Interaction | Function |
|----------|------|-----------------|----------|
| [GPR55](/glossary/gpr55-receptor) | "Orphan" receptor | Antagonist | Bone density, blood pressure, cancer cell proliferation |
| [TRPV1](/glossary/trpv1-receptor) | Ion channel | Agonist | Pain, temperature, inflammation |
| [5-HT1A](/glossary/serotonin-receptors-5ht1a) | Serotonin receptor | Agonist | Anxiety, mood, nausea |
| [PPARs](/glossary/ppars) | Nuclear receptors | Agonist | Metabolism, inflammation, gene expression |

### 3. Metabolic Enzymes

Enzymes are proteins that break down endocannabinoids after they've done their job. This "off switch" prevents endocannabinoids from accumulating and over-activating receptors.

#### FAAH (Fatty Acid Amide Hydrolase)

[FAAH](/glossary/faah-enzyme) is primarily responsible for breaking down anandamide. It's found in high concentrations in:
- Brain tissue
- Liver
- Kidneys
- Testes

**CBD and FAAH:** CBD inhibits FAAH, which slows anandamide breakdown. This leads to higher anandamide levels circulating for longer—one of CBD's key mechanisms for producing [anxiolytic](/glossary/anxiolytic) effects.

#### MAGL (Monoacylglycerol Lipase)

MAGL is the primary enzyme that breaks down 2-AG. It's responsible for approximately 85% of 2-AG hydrolysis in the brain.

| Enzyme | Primary Target | Location | Inhibition Effects |
|--------|----------------|----------|-------------------|
| FAAH | Anandamide | Brain, liver, kidneys | ↑ Anandamide, reduced anxiety |
| MAGL | 2-AG | Brain, peripheral tissues | ↑ 2-AG, anti-inflammatory |

---

## How the ECS Maintains Homeostasis

[Homeostasis](/glossary/homeostasis) is the biological process of maintaining stable internal conditions despite external changes. Your body temperature staying at 37°C whether it's hot or cold outside is an example of homeostasis.

The ECS is a master regulator of homeostasis, acting like a thermostat that keeps various systems in balance.

### Retrograde Signaling: A Unique Communication Method

Unlike most neurotransmitters that travel from presynaptic to postsynaptic neurons (forward), endocannabinoids use [retrograde signaling](/glossary/retrograde-signaling)—they travel backward.

**How it works:**

1. A postsynaptic neuron becomes overstimulated
2. This triggers endocannabinoid synthesis
3. Endocannabinoids travel backward to the presynaptic neuron
4. They bind to CB1 receptors on the presynaptic neuron
5. This reduces neurotransmitter release, calming the signal

Think of it as a feedback mechanism: "Hey, you're sending too many signals—slow down!"

This retrograde signaling allows the ECS to:
- Prevent excessive excitation (protecting against seizures)
- Reduce excessive inhibition (preventing over-sedation)
- Fine-tune neural communication
- Protect neurons from damage

### Systems Regulated by the ECS

| System | ECS Role | Imbalance Consequences |
|--------|----------|------------------------|
| **Nervous** | Pain modulation, neuroprotection | Chronic pain, neurodegeneration |
| **Immune** | Inflammation control | Autoimmune disorders, chronic inflammation |
| **Digestive** | Gut motility, appetite | IBS, appetite disorders |
| **Cardiovascular** | Blood pressure, heart rate | Hypertension, arrhythmias |
| **Reproductive** | Fertility, pregnancy | Infertility, pregnancy complications |
| **Skeletal** | Bone remodeling | Osteoporosis, bone disorders |
| **Skin** | Barrier function, sebum | Acne, dermatitis, psoriasis |

---

## Endocannabinoid Deficiency: When the System Falls Short

Dr. Ethan Russo proposed the theory of [Clinical Endocannabinoid Deficiency](/glossary/endocannabinoid-deficiency) (CED) in 2001, suggesting that some conditions might result from inadequate endocannabinoid tone.

### Conditions Potentially Linked to ECS Dysfunction

Research suggests these conditions may involve endocannabinoid system dysfunction:

| Condition | ECS Connection | Research Status |
|-----------|---------------|-----------------|
| [Migraine](/glossary/migraine) | Reduced anandamide levels | Moderate evidence |
| [Fibromyalgia](/glossary/fibromyalgia) | Low endocannabinoid tone | Moderate evidence |
| [IBS](/glossary/ibs-irritable-bowel-syndrome) | Altered CB1/CB2 expression | Moderate evidence |
| [PTSD](/glossary/ptsd) | Impaired fear extinction | Growing evidence |
| [Depression](/glossary/anxiety) | Reduced CB1 signaling | Growing evidence |

A 2016 study found that migraine sufferers had significantly lower anandamide levels in their cerebrospinal fluid compared to healthy controls, supporting the CED hypothesis.

### Supporting Your Endocannabinoid System Naturally

Several lifestyle factors can support healthy ECS function:

**Diet:**
- Omega-3 fatty acids (precursors for endocannabinoids)
- Dark chocolate (contains anandamide)
- Black pepper (contains beta-caryophyllene, a CB2 agonist)
- Foods rich in terpenes

**Exercise:**
- Moderate aerobic exercise increases anandamide levels
- "Runner's high" is partly mediated by the ECS
- 30+ minutes of sustained activity shows strongest effects

**Stress Management:**
- Chronic stress depletes endocannabinoids
- Meditation may increase [endocannabinoid tone](/glossary/endocannabinoid-tone)
- Quality sleep supports ECS function

**What to Avoid:**
- Chronic alcohol use (disrupts ECS)
- Excessive stress
- Highly processed diet

---

## How CBD Interacts with the ECS

[Cannabidiol](/glossary/cannabidiol) (CBD) has a complex, indirect relationship with the ECS. Unlike THC, CBD doesn't strongly bind to CB1 or CB2 receptors.

### CBD's ECS Mechanisms

| Mechanism | Effect | Result |
|-----------|--------|--------|
| FAAH inhibition | Slows anandamide breakdown | Higher anandamide levels |
| Negative allosteric modulation of CB1 | Changes receptor shape | Reduces THC's effects |
| CB2 inverse agonism | Modulates inflammation | Anti-inflammatory effects |
| GPR55 antagonism | Blocks receptor | Potential anti-cancer, bone effects |

### The Entourage Effect

The [entourage effect](/glossary/entourage-effect) theory suggests that cannabis compounds work better together than in isolation. [Full-spectrum](/glossary/full-spectrum) CBD products contain multiple cannabinoids and [terpenes](/glossary/terpenes) that may synergistically support the ECS.

**Evidence for the Entourage Effect:**

A 2015 study found that full-spectrum cannabis extract was more effective than pure CBD for inflammation, with a linear dose-response (more extract = more effect) compared to CBD isolate's bell-shaped curve (too much became less effective).

---

## The ECS Across Species

The endocannabinoid system isn't unique to humans—it's found in all vertebrates and some invertebrates, suggesting it's evolutionarily ancient (at least 600 million years old).

### ECS in Common Pets

| Animal | ECS Present | CB1 Density | Notes |
|--------|-------------|-------------|-------|
| Dogs | Yes | High | Very sensitive to THC |
| Cats | Yes | High | Metabolize cannabinoids slowly |
| Horses | Yes | Moderate | Growing veterinary research |
| Fish | Yes | Varies | Even zebrafish have functional ECS |

**Important:** Dogs have more CB1 receptors in their cerebellum than humans, making them especially sensitive to THC's effects. This is why THC can be dangerous for dogs, while CBD (without THC) is generally well-tolerated.

---

## Current Research and Future Directions

ECS research is expanding rapidly, with several exciting areas of investigation:

### Active Research Areas

1. **Cancer:** CB1/CB2 activation may slow tumor growth
2. **Neurodegeneration:** ECS modulation for Alzheimer's, Parkinson's
3. **Metabolic disorders:** CB1 antagonists for obesity
4. **Pain management:** Targeting FAAH/MAGL for chronic pain
5. **Addiction:** ECS modulation for substance use disorders

### Pharmaceutical Developments

| Drug | Target | Indication | Status |
|------|--------|------------|--------|
| [Epidiolex](/glossary/epidiolex) | Multiple targets | Epilepsy | FDA/EMA approved |
| Sativex | CB1/CB2 | MS spasticity | Approved (Europe) |
| Rimonabant | CB1 antagonist | Obesity | Withdrawn (side effects) |
| FAAH inhibitors | FAAH enzyme | Pain, anxiety | Clinical trials |

---

## Related Articles

- [How CBD Works in the Body](/articles/how-cbd-works) - Deep dive into CBD's mechanisms
- [What is CBD Oil?](/kb/articles/cbd-oil-guide) - Complete guide to CBD products

---

## Frequently Asked Questions

### What happens if the endocannabinoid system doesn't work properly?

Dysfunction in the ECS has been linked to various conditions including chronic pain, [fibromyalgia](/glossary/fibromyalgia), migraines, [IBS](/glossary/ibs-irritable-bowel-syndrome), and mood disorders. This "endocannabinoid deficiency" theory suggests that supporting ECS function through lifestyle or cannabinoid supplementation may help these conditions.

### Can you strengthen your endocannabinoid system?

Yes. Regular exercise (especially aerobic), omega-3 fatty acids, stress reduction, quality sleep, and moderate alcohol consumption all support healthy ECS function. Some research suggests that [phytocannabinoids](/glossary/phytocannabinoid) like CBD may also support [endocannabinoid tone](/glossary/endocannabinoid-tone) by slowing the breakdown of natural endocannabinoids.

### Do all animals have an endocannabinoid system?

All vertebrates (mammals, birds, fish, reptiles, amphibians) have a functional ECS. Some invertebrates like sea urchins and leeches also have cannabinoid receptors. The system is evolutionarily ancient—at least 600 million years old—suggesting it plays fundamental biological roles.

### What's the difference between endocannabinoids and phytocannabinoids?

[Endocannabinoids](/glossary/anandamide) are cannabinoids your body produces naturally (like anandamide and 2-AG). [Phytocannabinoids](/glossary/phytocannabinoid) are cannabinoids produced by plants, primarily cannabis (like CBD and THC). Both interact with the same receptors, which is why plant cannabinoids can affect human physiology.

### Why was the endocannabinoid system discovered so recently?

The ECS was only discovered in the 1990s because researchers were trying to understand how THC produces its effects. They found the CB1 receptor in 1988, which led to the search for natural molecules that activate it—resulting in the discovery of anandamide in 1992. Before cannabis research, there was no reason to look for this system.

### Is the endocannabinoid system the same as the nervous system?

No—they're separate but interconnected systems. The nervous system transmits electrical and chemical signals throughout the body. The ECS modulates and fine-tunes these signals, acting as a regulatory overlay. Think of the nervous system as the main communication network and the ECS as the volume control.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. The endocannabinoid system is complex and individual responses vary. Consult a healthcare professional before using cannabinoid products, especially if you have health conditions or take medications.*

---

### References

1. Mechoulam R, Parker LA. The Endocannabinoid System and the Brain. *Annu Rev Psychol*. 2013;64:21-47.

2. Russo EB. Clinical Endocannabinoid Deficiency Reconsidered: Current Research Supports the Theory in Migraine, Fibromyalgia, Irritable Bowel, and Other Treatment-Resistant Syndromes. *Cannabis Cannabinoid Res*. 2016;1(1):154-165.

3. Lu HC, Mackie K. An Introduction to the Endogenous Cannabinoid System. *Biol Psychiatry*. 2016;79(7):516-525.

4. Pacher P, Bátkai S, Kunos G. The Endocannabinoid System as an Emerging Target of Pharmacotherapy. *Pharmacol Rev*. 2006;58(3):389-462.

5. Zou S, Kumar U. Cannabinoid Receptors and the Endocannabinoid System: Signaling and Function in the Central Nervous System. *Int J Mol Sci*. 2018;19(3):833.

6. Di Marzo V. New approaches and challenges to targeting the endocannabinoid system. *Nat Rev Drug Discov*. 2018;17(9):623-639.

7. Maccarrone M, et al. Endocannabinoid signaling at the periphery: 50 years after THC. *Trends Pharmacol Sci*. 2015;36(5):277-296.

8. Hillard CJ. Circulating Endocannabinoids: From Whence Do They Come and Where are They Going? *Neuropsychopharmacology*. 2018;43(1):155-172.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'The Endocannabinoid System Explained: Your Body\'s Master Regulator',
    slug: 'endocannabinoid-system',
    excerpt: 'Discover how the endocannabinoid system (ECS) regulates pain, mood, sleep, and immunity. Learn about CB1 and CB2 receptors, anandamide, 2-AG, and why this system is key to understanding how CBD works.',
    content: content,
    status: 'published',
    featured: true,
    article_type: 'science',
    reading_time: 15,
    meta_title: 'The Endocannabinoid System Explained: ECS Guide 2026',
    meta_description: 'Complete guide to the endocannabinoid system (ECS). Learn about CB1/CB2 receptors, anandamide, 2-AG, and how this system regulates pain, mood, sleep and more.',
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
