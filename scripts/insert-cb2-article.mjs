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

[CB2 receptors](/glossary/cb2-receptor) are cannabinoid receptors found primarily in the immune system and peripheral tissues. Unlike [CB1 receptors](/glossary/cb1-receptor) in the brain, CB2 activation doesn't produce intoxication—making it an attractive therapeutic target. CB2 receptors regulate inflammation, immune response, bone health, and tissue repair. They're particularly relevant for conditions like [arthritis](/glossary/arthritis), inflammatory bowel disease, and autoimmune disorders.

---

## What Are CB2 Receptors?

CB2 (cannabinoid receptor type 2) receptors are the second major type of cannabinoid receptor in the [endocannabinoid system](/glossary/endocannabinoid-system). Discovered in 1993 by Sean Munro and colleagues, CB2 receptors are primarily expressed in immune cells and peripheral tissues.

While CB1 receptors dominate the central nervous system, CB2 receptors are the immune system's cannabinoid receptors—earning them the nickname "the peripheral cannabinoid receptor."

### CB2 by the Numbers

| Fact | Detail |
|------|--------|
| **Discovery** | 1993 |
| **Gene** | CNR2 (chromosome 1) |
| **Protein size** | 360 amino acids |
| **Type** | G-protein-coupled receptor (GPCR) |
| **Primary location** | Immune cells, peripheral tissues |
| **Sequence similarity to CB1** | 44% overall, 68% in transmembrane regions |

---

## Where Are CB2 Receptors Located?

CB2 receptors have a distinctly different distribution pattern from CB1.

### Primary CB2 Locations

| Location | Cell Types | Function |
|----------|------------|----------|
| **Spleen** | B cells, macrophages | Immune cell maturation |
| **Tonsils** | Lymphocytes | Immune surveillance |
| **Bone marrow** | Hematopoietic cells | Blood cell production |
| **Immune cells** | Macrophages, neutrophils, T cells, B cells | Inflammation control |
| **Skin** | Keratinocytes, fibroblasts | Wound healing, barrier function |
| **GI tract** | Enteric neurons, immune cells | Gut immunity, motility |
| **Bone** | Osteoblasts, osteoclasts | Bone remodeling |
| **Liver** | Kupffer cells, hepatocytes | Liver inflammation, fibrosis |

### CB2 in the Brain: The Evolving Picture

Originally, CB2 was thought to be absent from the brain. We now know this isn't entirely true:

| Brain CB2 Location | Context | Function |
|-------------------|---------|----------|
| Microglia | Activated during inflammation | Neuroinflammation control |
| Neurons (limited) | Certain brain regions | Pain modulation |
| Brainstem | Vomiting center | Anti-nausea effects |

CB2 expression in the brain increases significantly during:
- Neuroinflammation
- Neurodegeneration (Alzheimer's, Parkinson's)
- Brain injury
- Chronic pain states

---

## How CB2 Receptors Work

Like CB1, CB2 receptors are G-protein-coupled receptors that inhibit adenylyl cyclase when activated. However, their downstream effects focus on immune modulation rather than neurotransmission.

### CB2 Activation Effects

When CB2 receptors are activated:

1. **Reduced inflammatory cytokine release** - Less IL-1β, IL-6, TNF-α
2. **Increased anti-inflammatory mediators** - More IL-10
3. **Altered immune cell migration** - Changed chemotaxis
4. **Modified immune cell proliferation** - Regulated immune response
5. **Decreased oxidative stress** - Reduced reactive oxygen species

### What Activates CB2?

| Compound | Type | CB2 Affinity | Notes |
|----------|------|--------------|-------|
| [2-AG](/glossary/2-ag) | Endocannabinoid | High (full agonist) | Primary endogenous ligand |
| [Anandamide](/glossary/anandamide) | Endocannabinoid | Moderate | Less selective than for CB1 |
| [THC](/glossary/tetrahydrocannabinol) | Phytocannabinoid | Moderate | Partial agonist |
| [CBD](/glossary/cannabidiol) | Phytocannabinoid | Very low | May act as inverse agonist |
| [Beta-caryophyllene](/glossary/caryophyllene) | Terpene | Selective | Only terpene known to activate CB2 |
| [CBG](/glossary/cannabigerol) | Phytocannabinoid | Moderate | Partial agonist |

### The Special Case of Beta-Caryophyllene

[Beta-caryophyllene](/glossary/caryophyllene) is a dietary terpene found in black pepper, cloves, and cannabis. It's unique because it selectively activates CB2 receptors without touching CB1—making it a non-intoxicating cannabinoid receptor agonist from your spice rack.

---

## CB2 and Inflammation

CB2's role in inflammation is perhaps its most therapeutically relevant function.

### The Inflammatory Response

When tissue is damaged or infected:

1. Immune cells detect the problem
2. Inflammatory cytokines are released
3. More immune cells are recruited
4. Inflammation resolves (or becomes chronic)

CB2 receptors modulate each step of this process.

### CB2 Activation: Anti-Inflammatory Effects

| Effect | Mechanism | Result |
|--------|-----------|--------|
| ↓ Pro-inflammatory cytokines | Reduced NF-κB activation | Less IL-1β, TNF-α, IL-6 |
| ↑ Anti-inflammatory cytokines | Enhanced IL-10 production | Resolution of inflammation |
| ↓ Immune cell infiltration | Altered chemokine signaling | Less tissue damage |
| ↓ Oxidative stress | Reduced ROS production | Less cellular damage |

### Chronic Inflammation and Disease

Many diseases involve chronic inflammation where CB2 activation may help:

| Condition | CB2 Research Status |
|-----------|---------------------|
| [Rheumatoid arthritis](/glossary/rheumatoid-arthritis) | Promising preclinical |
| [Inflammatory bowel disease](/glossary/crohns-disease) | Phase II trials |
| Atherosclerosis | Preclinical evidence |
| Liver fibrosis | Preclinical evidence |
| Multiple sclerosis | Preclinical evidence |
| Osteoporosis | Preclinical evidence |

---

## CB2 and Bone Health

CB2 receptors play a significant role in bone metabolism—a relatively recent discovery.

### CB2 in Bone Cells

| Cell Type | CB2 Role | Effect of Activation |
|-----------|----------|---------------------|
| **Osteoblasts** (bone builders) | Promotes activity | Increased bone formation |
| **Osteoclasts** (bone resorbers) | Inhibits activity | Decreased bone loss |
| **Bone marrow stromal cells** | Differentiation | Supports bone cell development |

### Research Findings

A landmark 2006 study found that CB2-deficient mice developed accelerated age-related osteoporosis. Conversely, CB2 activation protected against bone loss.

**Implications:** CB2 agonists could potentially treat osteoporosis without the psychoactive effects of CB1 activation.

---

## CB2 and Skin Health

The skin has a fully functional [endocannabinoid system](/glossary/endocannabinoid-system), with CB2 receptors playing key roles.

### CB2 in Skin Conditions

| Condition | CB2 Role | Research Status |
|-----------|----------|-----------------|
| [Psoriasis](/glossary/psoriasis) | Reduces keratinocyte proliferation | Preclinical |
| [Eczema](/glossary/eczema) | Anti-inflammatory, itch reduction | Early clinical |
| [Acne](/glossary/acne) | Sebum regulation, anti-inflammatory | Preclinical |
| Wound healing | Promotes tissue repair | Preclinical |
| Skin cancer | Potential anti-tumor effects | Preclinical |

### Why Topical CBD May Work

[Topical](/glossary/topical) CBD products may exert effects partly through CB2 receptors in skin cells, without significant systemic absorption. This provides localized anti-inflammatory effects.

---

## CB2 in Pain Management

CB2 receptors offer pain relief without the intoxication associated with CB1.

### CB2 and Different Pain Types

| Pain Type | CB2 Mechanism | Evidence |
|-----------|---------------|----------|
| Inflammatory pain | Reduced inflammation, cytokines | Strong preclinical |
| Neuropathic pain | Microglial modulation | Moderate preclinical |
| Cancer pain | Anti-inflammatory, possible anti-tumor | Preclinical |
| Osteoarthritis | Joint inflammation reduction | Preclinical |

### Advantages Over CB1 for Pain

| CB2 Approach | CB1 Approach |
|--------------|--------------|
| No intoxication | Potential intoxication |
| Less tolerance development | Tolerance develops |
| Peripheral focus | Central focus |
| Treats inflammation source | Primarily masks pain |

---

## CB2 Receptors and Cancer

CB2 research in cancer is an active and promising area.

### How CB2 May Affect Cancer

| Mechanism | Effect | Evidence Level |
|-----------|--------|----------------|
| Apoptosis induction | Cancer cell death | Preclinical |
| Anti-proliferation | Slowed tumor growth | Preclinical |
| Anti-angiogenesis | Reduced blood supply to tumors | Preclinical |
| Immune modulation | Enhanced anti-tumor immunity | Preclinical |

### Important Caveats

- Most evidence is preclinical (cell/animal studies)
- Human clinical trials are limited
- Effects may vary by cancer type
- CBD/cannabinoids are not approved cancer treatments

---

## CBD and CB2 Receptors

The relationship between [CBD](/glossary/cannabidiol) and CB2 is complex and somewhat controversial.

### What We Know

| Finding | Source |
|---------|--------|
| CBD has low direct CB2 affinity | Binding studies |
| CBD may act as inverse agonist | Some research |
| CBD's anti-inflammatory effects may be CB2-independent | Multiple studies |
| CBD affects CB2 expression | Gene expression studies |

### CBD's Anti-Inflammatory Mechanisms

CBD produces anti-inflammatory effects through multiple pathways:

1. [PPAR](/glossary/ppars) activation
2. Adenosine signaling
3. [5-HT1A](/glossary/serotonin-receptors-5ht1a) activation
4. [TRPV1](/glossary/trpv1-receptor) desensitization
5. Possible CB2 modulation

The relative contribution of CB2 to CBD's effects remains under investigation.

---

## CB2-Selective Compounds: The Future?

Pharmaceutical companies are developing CB2-selective agonists that activate CB2 without affecting CB1.

### Advantages of CB2 Selectivity

| Benefit | Explanation |
|---------|-------------|
| No intoxication | CB1 produces the "high" |
| Targeted anti-inflammation | Focus on immune modulation |
| Fewer CNS side effects | Limited brain penetration |
| Less tolerance | CB2 may have less tolerance development |

### Compounds in Development

| Compound | Developer | Target Indication | Status |
|----------|-----------|-------------------|--------|
| Lenabasum (JBT-101) | Corbus | Dermatomyositis, cystic fibrosis | Phase III |
| S-777469 | Shionogi | Atopic dermatitis | Phase II |
| APD371 | Arena | Pain | Phase II |

---

## CB1 vs. CB2: Complete Comparison

| Feature | CB1 | CB2 |
|---------|-----|-----|
| **Primary location** | Brain, CNS | Immune system, peripheral |
| **Expression density** | Highest in brain | Highest in immune cells |
| **THC effects** | Intoxicating | Non-intoxicating |
| **Main functions** | Neurotransmission, cognition | Inflammation, immunity |
| **CBD interaction** | Allosteric modulator | Low affinity, possible inverse agonist |
| **Therapeutic focus** | Pain, neurological, appetite | Inflammation, autoimmune, bone |
| **Tolerance** | Develops with heavy use | Less pronounced |
| **Selective agonist examples** | ACEA, nabilone | JWH-133, lenabasum |

---

## Related Articles

- [What Are CB1 Receptors?](/articles/cb1-receptors) - The brain's cannabinoid receptor
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide
- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action

---

## Frequently Asked Questions

### Does activating CB2 receptors get you high?

No. CB2 receptors are primarily located outside the brain in immune cells and peripheral tissues. Activating them produces anti-inflammatory and immune-modulating effects without the psychoactive effects associated with [CB1 receptors](/glossary/cb1-receptor). This makes CB2 an attractive therapeutic target.

### How is CBD related to CB2 receptors?

[CBD](/glossary/cannabidiol) has very low direct affinity for CB2 receptors and may act as an inverse agonist (producing opposite effects to activation). However, CBD's anti-inflammatory effects likely come from other mechanisms like PPAR activation and adenosine signaling rather than direct CB2 interaction.

### Can I target CB2 receptors specifically?

Yes, through several approaches: [beta-caryophyllene](/glossary/caryophyllene) (found in black pepper) selectively activates CB2. Some minor cannabinoids like [CBG](/glossary/cannabigerol) have CB2 affinity. Pharmaceutical CB2 agonists are also in development for conditions like inflammation and pain.

### Why is CB2 important for autoimmune diseases?

CB2 receptors regulate immune cell function and inflammation. In autoimmune conditions, the immune system attacks the body's own tissues. CB2 activation can modulate this overactive immune response, reducing inflammation and tissue damage without suppressing immunity entirely.

### Are CB2 receptors found in the brain at all?

Yes, but in much lower amounts than CB1. CB2 is found in brain microglia (immune cells of the brain) and increases during neuroinflammation, injury, or neurodegenerative disease. This makes CB2 a potential target for conditions like [Alzheimer's](/glossary/alzheimers) and [Parkinson's](/glossary/parkinsons) disease.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. CB2-targeted therapies are still largely in research phases. Consult a healthcare professional before using cannabinoid products for any medical condition.*

---

### References

1. Munro S, Thomas KL, Abu-Shaar M. Molecular characterization of a peripheral receptor for cannabinoids. *Nature*. 1993;365(6441):61-65.

2. Turcotte C, et al. The CB2 receptor and its role as a regulator of inflammation. *Cell Mol Life Sci*. 2016;73(23):4449-4470.

3. Ofek O, et al. Peripheral cannabinoid receptor, CB2, regulates bone mass. *Proc Natl Acad Sci USA*. 2006;103(3):696-701.

4. Basu S, Bhaumik R. Cannabinoid CB2 receptor as potential therapeutic target in immune-inflammatory diseases. *Curr Clin Pharmacol*. 2021;16(3):206-220.

5. Gertsch J, et al. Beta-caryophyllene is a dietary cannabinoid. *Proc Natl Acad Sci USA*. 2008;105(26):9099-9104.

6. Cabral GA, Griffin-Thomas L. Emerging role of the cannabinoid receptor CB2 in immune regulation: therapeutic prospects for neuroinflammation. *Expert Rev Mol Med*. 2009;11:e3.

7. Dhopeshwarkar A, Bhaumik R. CB2 cannabinoid receptors as a therapeutic target—what does the future hold? *Mol Pharmacol*. 2014;86(4):430-437.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'What Are CB2 Receptors? The Immune System\'s Cannabinoid Target',
    slug: 'cb2-receptors',
    excerpt: 'Learn about CB2 receptors—the immune system\'s cannabinoid receptors. Discover how CB2 regulates inflammation, bone health, and pain without causing intoxication, and why it\'s a promising therapeutic target.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    reading_time: 11,
    meta_title: 'CB2 Receptors Explained: Immune System Cannabinoid Science',
    meta_description: 'Understand CB2 receptors: the immune system\'s cannabinoid receptors. Learn how CB2 controls inflammation, affects bone health, and offers non-intoxicating therapeutic potential.',
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
