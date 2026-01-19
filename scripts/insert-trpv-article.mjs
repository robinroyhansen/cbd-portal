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

[TRPV receptors](/glossary/trpv1-receptor) are ion channels that detect heat, pain, and chemical signals—and they respond to cannabinoids. [TRPV1](/glossary/trpv1-receptor) (the capsaicin receptor) is especially important: [CBD](/glossary/cannabidiol) activates and then desensitizes TRPV1, which may explain CBD's pain-relieving and anti-inflammatory effects. This provides a key mechanism for how cannabinoids reduce pain without relying solely on [CB1](/glossary/cb1-receptor) or [CB2](/glossary/cb2-receptor) receptors.

---

## What Are TRPV Receptors?

TRPV (Transient Receptor Potential Vanilloid) receptors are a family of ion channels that act as cellular sensors. They detect temperature, pain, and various chemical compounds—including cannabinoids and capsaicin (the compound that makes chili peppers hot).

The TRPV family consists of six members (TRPV1-6), but TRPV1 has the strongest connection to cannabinoid science.

### TRPV Family Overview

| Receptor | Primary Stimulus | Temperature | Cannabinoid Interaction |
|----------|------------------|-------------|------------------------|
| **TRPV1** | Capsaicin, heat, acid | >43°C (pain threshold) | Strong (CBD, anandamide) |
| **TRPV2** | High heat, stretch | >52°C | Moderate (CBD, THC) |
| **TRPV3** | Warm temperatures | 31-39°C | Weak |
| **TRPV4** | Moderate heat, osmotic | 27-35°C | Minimal |
| **TRPV5** | Calcium transport | Not thermosensitive | None known |
| **TRPV6** | Calcium transport | Not thermosensitive | None known |

---

## TRPV1: The "Capsaicin Receptor"

TRPV1 is the most relevant TRPV receptor for cannabinoid science.

### TRPV1 Quick Facts

| Property | Detail |
|----------|--------|
| **Also called** | Vanilloid receptor 1 (VR1) |
| **Discovery** | 1997 (David Julius) |
| **Type** | Non-selective cation channel |
| **Heat threshold** | >43°C (109°F) |
| **Named after** | Vanilloid compounds (like capsaicin) |
| **Natural activators** | Heat, acid (pH <6), [anandamide](/glossary/anandamide) |
| **Plant activators** | Capsaicin, CBD, CBG, piperine |

### What Activates TRPV1?

| Stimulus | Source | Effect |
|----------|--------|--------|
| **Heat** | Temperature >43°C | Pain sensation (burning) |
| **Acid** | pH <6 | Pain, inflammation signal |
| **Capsaicin** | Chili peppers | Burning sensation |
| **[Anandamide](/glossary/anandamide)** | Your body | Modulates pain |
| **[CBD](/glossary/cannabidiol)** | Cannabis | Activates then desensitizes |
| **Piperine** | Black pepper | Burning sensation |
| **Gingerol** | Ginger | Warming sensation |

---

## Why TRPV1 Matters for CBD

CBD's interaction with TRPV1 is one of its most important non-cannabinoid receptor mechanisms.

### CBD and TRPV1: The Desensitization Effect

CBD does something interesting at TRPV1:

1. **Initial activation** → CBD binds and opens the channel
2. **Calcium influx** → Ions flow into the cell
3. **Desensitization** → Channel becomes less responsive
4. **Reduced pain signaling** → TRPV1 can't be activated as easily

This is similar to how capsaicin cream works: initial activation followed by reduced sensitivity.

### CBD vs. Capsaicin at TRPV1

| Property | CBD | Capsaicin |
|----------|-----|-----------|
| Initial effect | Mild activation | Strong burning |
| Desensitization | Yes | Yes |
| Discomfort | Minimal | Significant |
| Duration | Moderate | Prolonged |
| Therapeutic use | Internal/topical | Primarily topical |

### Clinical Relevance

TRPV1 desensitization may explain why CBD helps with:
- [Chronic pain](/glossary/chronic-pain)
- [Neuropathic pain](/glossary/neuropathic-pain)
- Inflammatory conditions
- [Migraines](/glossary/migraines)
- Certain types of [epilepsy](/glossary/epilepsy)

---

## Anandamide: The Endogenous TRPV1 Ligand

[Anandamide](/glossary/anandamide) was the first endocannabinoid discovered—and it also activates TRPV1.

### Anandamide's Dual Identity

| Target | Anandamide Effect | Functional Role |
|--------|-------------------|-----------------|
| **[CB1 receptors](/glossary/cb1-receptor)** | Partial agonist | Mood, memory, pain |
| **[CB2 receptors](/glossary/cb2-receptor)** | Weak agonist | Immune modulation |
| **TRPV1** | Full agonist | Pain modulation |

### The "Endovanilloid" System

Because anandamide activates both cannabinoid receptors and TRPV1, some researchers propose an integrated "endovanilloid" system:

| System | Receptors | Endogenous Ligand |
|--------|-----------|-------------------|
| Endocannabinoid | CB1, CB2 | Anandamide, 2-AG |
| Endovanilloid | TRPV1 | Anandamide |
| Overlap | All three | Anandamide |

This overlap explains why cannabinoid and vanilloid signaling are so interconnected.

---

## TRPV1 in Pain Processing

TRPV1 plays a central role in how your body detects and processes pain.

### TRPV1 Pain Pathways

| Location | TRPV1 Function | Pain Type |
|----------|----------------|-----------|
| **Peripheral nerves** | Detects noxious stimuli | Acute pain |
| **Dorsal root ganglia** | Sensory neuron cell bodies | Signal relay |
| **Spinal cord** | Modulates transmission | Central processing |
| **Brain (limited)** | Higher pain processing | Pain perception |

### TRPV1 and Chronic Pain

In chronic pain conditions, TRPV1 often becomes dysregulated:

| Change | Effect | Condition |
|--------|--------|-----------|
| **Increased expression** | More TRPV1 receptors | Inflammatory pain |
| **Sensitization** | Lower activation threshold | Hyperalgesia |
| **Central sensitization** | Amplified signals | [Fibromyalgia](/glossary/fibromyalgia) |
| **Ectopic expression** | TRPV1 in new locations | Neuropathic pain |

### Targeting TRPV1 for Pain Relief

| Approach | Mechanism | Example |
|----------|-----------|---------|
| **Agonists** | Activate then desensitize | Capsaicin cream |
| **Antagonists** | Block activation | Research compounds |
| **Desensitizers** | Prolonged low activation | CBD (possibly) |

---

## TRPV1 and Inflammation

TRPV1 is directly involved in inflammatory processes.

### TRPV1 in Immune Cells

| Cell Type | TRPV1 Role | Effect |
|-----------|------------|--------|
| **Macrophages** | Modulates activation | Cytokine release |
| **Mast cells** | Histamine release | Allergic inflammation |
| **T cells** | Activation regulation | Adaptive immunity |
| **Microglia** | Neuroinflammation | Brain inflammation |

### Neurogenic Inflammation

TRPV1 activation on sensory nerves triggers neurogenic inflammation:

1. **TRPV1 activated** → Painful stimulus
2. **Nerve fires** → Signal travels both ways
3. **Neuropeptide release** → Substance P, CGRP
4. **Local inflammation** → Vasodilation, swelling

CBD's TRPV1 desensitization may reduce this neurogenic inflammation.

---

## TRPV2: CBD's Other TRP Target

TRPV2 is another TRP channel that responds to cannabinoids.

### TRPV2 Quick Facts

| Property | Detail |
|----------|--------|
| **Heat threshold** | >52°C (very high heat) |
| **Expression** | Sensory neurons, immune cells, brain |
| **CBD effect** | Activates and potentiates |
| **THC effect** | May activate |

### TRPV2 Functions

| System | TRPV2 Role | CBD Relevance |
|--------|------------|---------------|
| **Immune** | Macrophage function | May enhance immunity |
| **Cancer** | Calcium signaling | Research into anti-cancer effects |
| **Heart** | Cardiac function | Cardiovascular research |
| **Brain** | Neuronal development | Neuroprotection |

### CBD and TRPV2

CBD appears to activate TRPV2 more potently than TRPV1 in some studies. This may contribute to:
- Anti-cancer effects in glioblastoma cells
- Immune modulation
- Pain processing

---

## The Broader TRP Family

TRPV channels are part of the larger TRP (Transient Receptor Potential) superfamily.

### TRP Channels and Cannabinoids

| Channel | CBD Effect | Potential Relevance |
|---------|------------|---------------------|
| **TRPV1** | Agonist/desensitizer | Pain, inflammation |
| **TRPV2** | Strong agonist | Cancer, immunity |
| **TRPA1** | Agonist | Pain, irritation |
| **TRPM8** | Antagonist | Cooling sensation |

### TRPA1: Another CBD Target

TRPA1 (the "wasabi receptor") also responds to CBD:

| TRPA1 Property | Detail |
|----------------|--------|
| **Activators** | Mustard, wasabi, garlic, cold |
| **CBD effect** | Activates then desensitizes |
| **Function** | Pain, itch, inflammation |

CBD's multi-TRP activity may create synergistic therapeutic effects.

---

## TRPV1 in Specific Conditions

Research has examined TRPV1 in various health conditions.

### TRPV1 and Epilepsy

| Finding | Significance |
|---------|--------------|
| TRPV1 expression elevated in epilepsy | May contribute to seizures |
| TRPV1 modulators affect seizure threshold | Therapeutic potential |
| CBD's TRPV1 effect | May contribute to anti-seizure activity |

### TRPV1 and Migraines

| TRPV1 Role | Migraine Connection |
|------------|---------------------|
| Trigeminal nerve activation | Pain initiation |
| CGRP release | Vasodilation, inflammation |
| Peripheral sensitization | Recurring attacks |

### TRPV1 and Arthritis

| Finding | Implication |
|---------|-------------|
| TRPV1 elevated in arthritic joints | Pro-inflammatory role |
| Capsaicin depletes substance P | Reduces joint pain |
| CBD may desensitize joint TRPV1 | Anti-arthritic potential |

---

## CBD's Multi-Target Approach

TRPV1 is one of many targets in CBD's complex pharmacology.

### CBD's Receptor Interactions

| Target | CBD Effect | Contribution |
|--------|------------|--------------|
| **[CB1](/glossary/cb1-receptor)** | Negative allosteric modulator | Reduces THC effects |
| **[CB2](/glossary/cb2-receptor)** | Low affinity | Limited direct effect |
| **TRPV1** | Agonist/desensitizer | Pain, inflammation |
| **TRPV2** | Agonist | Cancer, immunity |
| **[GPR55](/glossary/gpr55-receptor)** | Antagonist | Cancer, bone, pain |
| **5-HT1A** | Agonist | Anxiety, mood |
| **[PPARs](/glossary/ppars)** | Agonist | Metabolism, inflammation |
| **[FAAH](/glossary/faah-enzyme)** | Inhibitor | Raises anandamide |

### The Entourage of Targets

CBD's effectiveness may come from hitting multiple targets simultaneously—including TRPV1 alongside cannabinoid receptors. This multi-target approach may be more effective than single-target drugs for complex conditions.

---

## Related Articles

- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action
- [What Is Anandamide?](/articles/anandamide) - The endovanilloid connection
- [What Are CB1 Receptors?](/articles/cb1-receptors) - The brain's cannabinoid receptor
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide

---

## Frequently Asked Questions

### What is TRPV1 and why does it matter for CBD?

[TRPV1](/glossary/trpv1-receptor) is an ion channel that detects heat, pain, and chemical signals like capsaicin. [CBD](/glossary/cannabidiol) activates TRPV1 and then desensitizes it, meaning the receptor becomes less responsive to painful stimuli. This is one of CBD's important pain-relieving mechanisms outside the classical cannabinoid receptors.

### How does TRPV1 desensitization work?

When TRPV1 is repeatedly activated (by capsaicin, CBD, or other agonists), it becomes less sensitive over time. The receptor essentially "tunes out" the signal. This is why capsaicin cream initially burns but then reduces pain—and why CBD may provide pain relief without the initial discomfort.

### Does anandamide activate TRPV1?

Yes. [Anandamide](/glossary/anandamide) is both an endocannabinoid (activating CB1/CB2) and an "endovanilloid" (activating TRPV1). This dual nature connects the endocannabinoid system with pain and temperature sensing pathways, explaining some overlap between cannabinoid and vanilloid signaling.

### Is TRPV1 involved in inflammation?

Yes. TRPV1 activation on sensory nerves triggers release of inflammatory neuropeptides (substance P, CGRP), causing neurogenic inflammation. TRPV1 on immune cells also modulates inflammatory responses. Desensitizing TRPV1 (via CBD or capsaicin) may reduce inflammation.

### Why is TRPV1 called the "capsaicin receptor"?

TRPV1 was discovered as the receptor that responds to capsaicin—the compound in chili peppers that causes burning sensations. The receptor detects capsaicin, heat above 43°C, and acid. Its full name (Transient Receptor Potential Vanilloid 1) references the vanilloid family of compounds including capsaicin.

### Does CBD affect other TRP channels?

Yes. CBD also activates TRPV2 and TRPA1, and antagonizes TRPM8. This multi-TRP activity may contribute to CBD's therapeutic effects in pain, inflammation, and potentially cancer. Each TRP channel has different functions, so CBD's broad activity may create complementary benefits.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. TRP receptor research is ongoing, and many applications remain preclinical. Consult a healthcare professional before making health decisions.*

---

### References

1. Caterina MJ, et al. The capsaicin receptor: a heat-activated ion channel in the pain pathway. *Nature*. 1997;389(6653):816-824.

2. De Petrocellis L, et al. Effects of cannabinoids and cannabinoid-enriched Cannabis extracts on TRP channels and endocannabinoid metabolic enzymes. *Br J Pharmacol*. 2011;163(7):1479-1494.

3. Muller C, Morales P, Reggio PH. Cannabinoid ligands targeting TRP channels. *Front Mol Neurosci*. 2019;11:487.

4. Starowicz K, Przewlocka B. The role of melanocortins and their receptors in inflammatory processes, nerve regeneration and nociception. *Life Sci*. 2003;73(7):823-847.

5. Iannotti FA, et al. Nonpsychotropic plant cannabinoids, cannabidivarin (CBDV) and cannabidiol (CBD), activate and desensitize transient receptor potential vanilloid 1 (TRPV1) channels in vitro. *ACS Chem Neurosci*. 2014;5(11):1131-1141.

6. Zygmunt PM, et al. Vanilloid receptors on sensory nerves mediate the vasodilator action of anandamide. *Nature*. 1999;400(6743):452-457.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'What Are TRPV Receptors? CBD\'s Pain-Sensing Targets',
    slug: 'trpv-receptors',
    excerpt: 'Discover TRPV receptors—the ion channels that detect heat and pain. Learn how CBD activates and desensitizes TRPV1, providing pain relief through a non-cannabinoid receptor mechanism.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    reading_time: 11,
    meta_title: 'TRPV Receptors Explained: How CBD Targets Pain Channels',
    meta_description: 'Learn about TRPV1 and TRPV2 receptors. Understand how CBD activates and desensitizes these pain-sensing ion channels for therapeutic benefit.',
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
