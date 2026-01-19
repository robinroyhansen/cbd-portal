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

[GPR55](/glossary/gpr55-receptor) is sometimes called the "third cannabinoid receptor"—an orphan receptor that responds to cannabinoids but was discovered through different research. [CBD](/glossary/cannabidiol) blocks GPR55 activation, which may contribute to its anti-cancer, bone health, and anti-inflammatory effects. Unlike [CB1](/glossary/cb1-receptor) and [CB2](/glossary/cb2-receptor), GPR55 activation increases cellular activity rather than dampening it.

---

## What Is GPR55?

GPR55 (G-protein-coupled receptor 55) is a receptor that responds to cannabinoids but wasn't discovered through cannabis research. Originally identified in 1999, it was classified as an "orphan receptor"—a receptor without a known natural ligand.

Research later revealed that GPR55 responds to both [endocannabinoids](/glossary/endocannabinoid-system) and plant cannabinoids, leading some researchers to propose it as the "CB3" receptor.

### GPR55 Quick Facts

| Property | Detail |
|----------|--------|
| **Discovery** | 1999 (Sawzdargo et al.) |
| **Type** | G-protein-coupled receptor (GPCR) |
| **Gene** | GPR55 (chromosome 2) |
| **Proposed natural ligand** | Lysophosphatidylinositol (LPI) |
| **Cannabinoid response** | Yes (THC, CBD, anandamide) |
| **Classification debate** | "CB3" vs. non-cannabinoid receptor |
| **Signaling** | Excitatory (opposite of CB1/CB2) |

---

## Is GPR55 the "CB3 Receptor"?

The CB3 label is controversial. Here's the debate:

### Arguments FOR CB3 Classification

| Evidence | Details |
|----------|---------|
| Responds to [THC](/glossary/tetrahydrocannabinol) | THC activates GPR55 |
| Responds to [anandamide](/glossary/anandamide) | Endocannabinoid activates it |
| Responds to [2-AG](/glossary/2-ag) | Second endocannabinoid shows activity |
| CBD interaction | CBD blocks GPR55 |

### Arguments AGAINST CB3 Classification

| Concern | Details |
|---------|---------|
| Different natural ligand | LPI (not an endocannabinoid) may be primary activator |
| Opposite signaling | Increases activity (CB1/CB2 decrease it) |
| Low sequence similarity | Only ~14% homology with CB1/CB2 |
| Different evolutionary origin | Not part of cannabinoid receptor family |

### The Consensus

Most researchers consider GPR55 a "cannabinoid-related" receptor rather than a true cannabinoid receptor. It interacts with cannabinoids but has distinct properties and functions.

---

## Where Is GPR55 Found?

GPR55 has a unique distribution pattern different from CB1 and CB2.

### GPR55 Locations

| Location | Expression Level | Functions |
|----------|------------------|-----------|
| **Brain** | Moderate (hippocampus, cerebellum) | Memory, motor control |
| **Adrenal glands** | High | Stress response |
| **GI tract** | Moderate | Gut motility, secretion |
| **Spleen** | High | Immune function |
| **Bone** | High | Bone remodeling |
| **Adipose tissue** | Moderate | Fat metabolism |
| **Cancer cells** | Often elevated | Tumor biology |
| **Pancreas** | Moderate | Insulin secretion |
| **Endothelium** | Moderate | Vascular function |

### Comparison with CB1/CB2

| Location | CB1 | CB2 | GPR55 |
|----------|-----|-----|-------|
| Brain | Very high | Low | Moderate |
| Immune cells | Low | Very high | High |
| Bone | Moderate | High | High |
| Liver | High | Moderate | Moderate |
| GI tract | Moderate | Moderate | Moderate |

---

## How GPR55 Works

GPR55 signals differently from CB1 and CB2, producing opposite cellular effects.

### Signaling Differences

| Feature | CB1/CB2 | GPR55 |
|---------|---------|-------|
| **G-protein** | Gi/o (inhibitory) | G12/13 and Gq (excitatory) |
| **cAMP effect** | Decreases | Variable |
| **Calcium release** | Inhibits | Increases |
| **Cell outcome** | Dampens activity | Increases activity |
| **Kinase activation** | ERK, some | RhoA, ROCK, ERK |

### The RhoA-ROCK Pathway

GPR55's main signaling pathway involves:

1. **GPR55 activation** → Cannabinoid or LPI binds
2. **G12/13 engagement** → Activates Rho guanine exchange factors
3. **RhoA activation** → Small GTPase triggers cascade
4. **ROCK activation** → Rho-associated kinase
5. **Cellular effects** → Changed cell shape, migration, proliferation

This pathway is particularly important in cancer biology and bone metabolism.

---

## What Activates and Blocks GPR55?

Different cannabinoids have different effects on GPR55.

### GPR55 Activators (Agonists)

| Compound | Type | Potency |
|----------|------|---------|
| **LPI** | Endogenous lipid | High (proposed natural ligand) |
| **[THC](/glossary/tetrahydrocannabinol)** | Phytocannabinoid | Moderate |
| **[Anandamide](/glossary/anandamide)** | Endocannabinoid | Moderate |
| **O-1602** | Synthetic | High |
| **AM251** | Originally CB1 antagonist | Moderate (GPR55 agonist) |

### GPR55 Blockers (Antagonists)

| Compound | Type | Significance |
|----------|------|--------------|
| **[CBD](/glossary/cannabidiol)** | Phytocannabinoid | Major therapeutic relevance |
| **[THCV](/glossary/tetrahydrocannabivarin)** | Phytocannabinoid | Blocks GPR55 |
| **CID16020046** | Synthetic | Research tool |
| **ML193** | Synthetic | Selective antagonist |

### The Key Point

- **THC activates** GPR55 → May explain some THC effects
- **CBD blocks** GPR55 → May explain some CBD therapeutic effects

This is notable because CBD and THC have opposite actions at GPR55.

---

## CBD and GPR55: Why It Matters

[CBD's](/glossary/cannabidiol) ability to block GPR55 may explain several of its therapeutic properties.

### CBD as GPR55 Antagonist

| Finding | Source |
|---------|--------|
| CBD blocks LPI-induced GPR55 activation | Ryberg et al., 2007 |
| CBD opposes THC at GPR55 | Multiple studies |
| GPR55 antagonism produces anti-cancer effects | Andradas et al., 2016 |

### Therapeutic Implications

| Condition | How GPR55 Blockade May Help |
|-----------|----------------------------|
| **Cancer** | Reduces proliferation, migration |
| **Osteoporosis** | Regulates bone resorption |
| **Pain** | Modulates pain signaling |
| **Epilepsy** | Reduces neuronal excitability |
| **Inflammation** | Anti-inflammatory effects |

---

## GPR55 and Cancer

GPR55's role in cancer is one of its most studied functions.

### GPR55 in Cancer Cells

| Finding | Implication |
|---------|-------------|
| GPR55 elevated in many tumors | Promotes growth |
| GPR55 activation increases proliferation | Tumor expansion |
| GPR55 activation promotes migration | Metastasis risk |
| GPR55 blockade slows cancer | Therapeutic opportunity |

### Cancer Types with GPR55 Involvement

| Cancer | GPR55 Role | CBD Effect |
|--------|------------|------------|
| **Breast cancer** | Promotes growth | CBD blocks, reduces proliferation |
| **Colorectal cancer** | Elevated expression | CBD antagonism shows benefit |
| **Pancreatic cancer** | Associated with aggression | Research ongoing |
| **Glioblastoma** | Expression correlates with grade | CBD may help via GPR55 |
| **Prostate cancer** | Elevated in tumors | Preclinical research |

### Research Findings

A 2016 study in *Oncotarget* found:
- GPR55 expression correlates with breast cancer aggressiveness
- CBD reduces cancer cell proliferation partly through GPR55 blockade
- Combined CB2 agonism + GPR55 antagonism showed enhanced anti-tumor effects

**Important caveat:** These are preclinical findings. CBD is not an approved cancer treatment.

---

## GPR55 and Bone Health

GPR55 significantly influences bone metabolism.

### GPR55 in Bone Cells

| Cell Type | GPR55 Effect | Outcome |
|-----------|--------------|---------|
| **Osteoclasts** (bone resorbers) | Activation increases activity | More bone breakdown |
| **Osteoblasts** (bone builders) | Complex effects | Varies by context |

### The Bone Balance

| Receptor | Bone Effect |
|----------|-------------|
| **CB1** | Complex; some pro-bone, some anti-bone |
| **[CB2](/glossary/cb2-receptor)** | Generally pro-bone (protects against loss) |
| **GPR55** | Activation increases bone resorption |

### Implications for Osteoporosis

GPR55-deficient mice show:
- Increased bone mass
- Reduced osteoclast activity
- Protection against bone loss

This suggests GPR55 antagonists (including CBD) might help preserve bone density.

---

## GPR55 and Pain

GPR55 plays a role in pain processing, though the relationship is complex.

### GPR55 in Pain Pathways

| Location | GPR55 Function |
|----------|----------------|
| **Dorsal root ganglia** | Sensory neuron excitability |
| **Spinal cord** | Pain signal processing |
| **Brain** | Pain perception |
| **Peripheral nerves** | Inflammation, sensitization |

### Research Findings

| Finding | Implication |
|---------|-------------|
| GPR55 activation enhances pain in some models | Pro-pain role |
| GPR55 knockout mice show altered pain responses | Involved in nociception |
| CBD's GPR55 antagonism may contribute to analgesia | Therapeutic mechanism |

The picture is nuanced: GPR55 blockade may help some pain types but not others.

---

## GPR55 and Inflammation

GPR55 influences inflammatory processes differently from CB2.

### GPR55 in Immune Function

| Context | GPR55 Effect |
|---------|--------------|
| **Neutrophil migration** | GPR55 activation promotes movement |
| **Macrophage function** | Modulates inflammatory responses |
| **Cytokine release** | Can be pro- or anti-inflammatory |
| **Gut inflammation** | Complex role |

### CBD's Anti-Inflammatory Action via GPR55

CBD's GPR55 antagonism may contribute to anti-inflammatory effects by:
- Reducing immune cell migration
- Modulating inflammatory signaling cascades
- Complementing CB2-mediated effects

---

## GPR55 vs. CB1 vs. CB2: Complete Comparison

| Feature | CB1 | CB2 | GPR55 |
|---------|-----|-----|-------|
| **Primary location** | Brain | Immune system | Brain, bone, GI, immune |
| **Natural ligands** | 2-AG, anandamide | 2-AG, anandamide | LPI (possibly) |
| **THC effect** | Agonist (high) | Partial agonist | Agonist |
| **CBD effect** | Negative modulator | Low affinity | Antagonist |
| **Signaling** | Inhibitory | Inhibitory | Excitatory |
| **Discovery** | 1988 | 1993 | 1999 |
| **Classification** | Cannabinoid | Cannabinoid | Debated |

---

## Related Articles

- [What Are CB1 Receptors?](/articles/cb1-receptors) - The brain's cannabinoid receptor
- [What Are CB2 Receptors?](/articles/cb2-receptors) - The immune cannabinoid receptor
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide
- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action

---

## Frequently Asked Questions

### Is GPR55 a cannabinoid receptor?

GPR55 responds to cannabinoids like [THC](/glossary/tetrahydrocannabinol), [anandamide](/glossary/anandamide), and [CBD](/glossary/cannabidiol), leading some to call it "CB3." However, it has low genetic similarity to CB1/CB2, signals in opposite ways (excitatory vs. inhibitory), and may have a different natural ligand (LPI). Most researchers consider it "cannabinoid-related" rather than a true cannabinoid receptor.

### How does CBD interact with GPR55?

[CBD](/glossary/cannabidiol) acts as an antagonist at GPR55—it blocks the receptor's activation. This is opposite to THC, which activates GPR55. CBD's GPR55 antagonism may explain some of its anti-cancer, bone-protective, and anti-inflammatory properties in preclinical research.

### What is LPI and why does it matter for GPR55?

LPI (lysophosphatidylinositol) is a lipid molecule proposed as GPR55's natural ligand—the compound your body makes to activate it. LPI is elevated in some cancers and inflammatory conditions. Understanding LPI-GPR55 signaling may reveal new therapeutic targets beyond cannabinoids.

### Could GPR55 explain some THC effects?

Yes. Since THC activates GPR55 while activating CB1, some THC effects may result from combined CB1 + GPR55 activation. This could explain effects not fully attributable to CB1 alone, though research is ongoing.

### Why is GPR55 important for cancer research?

GPR55 is elevated in many tumors and its activation promotes cancer cell proliferation and migration. Blocking GPR55 (as CBD does) reduces these effects in preclinical studies. This makes GPR55 antagonists interesting candidates for cancer research, though human clinical trials are needed.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. GPR55 research is largely preclinical. CBD and other cannabinoids are not approved cancer treatments. Consult a healthcare professional before making health decisions.*

---

### References

1. Ryberg E, et al. The orphan receptor GPR55 is a novel cannabinoid receptor. *Br J Pharmacol*. 2007;152(7):1092-1101.

2. Ross RA. The enigmatic pharmacology of GPR55. *Trends Pharmacol Sci*. 2009;30(3):156-163.

3. Andradas C, et al. The orphan G protein-coupled receptor GPR55 promotes cancer cell proliferation via ERK. *Oncogene*. 2011;30(2):245-252.

4. Whyte LS, et al. The putative cannabinoid receptor GPR55 affects osteoclast function in vitro and bone mass in vivo. *Proc Natl Acad Sci USA*. 2009;106(38):16511-16516.

5. Moreno E, et al. Targeting CB2-GPR55 receptor heteromers modulates cancer cell signaling. *J Biol Chem*. 2014;289(32):21960-21972.

6. Henstridge CM, et al. GPR55 ligands promote receptor coupling to multiple signalling pathways. *Br J Pharmacol*. 2010;160(3):604-614.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'What Is GPR55? The Proposed "Third Cannabinoid Receptor"',
    slug: 'gpr55-receptor',
    excerpt: 'Learn about GPR55—the "orphan receptor" sometimes called CB3. Discover how CBD blocks GPR55 and why this matters for cancer research, bone health, and pain.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    reading_time: 10,
    meta_title: 'GPR55 Receptor Explained: The Third Cannabinoid Receptor?',
    meta_description: 'Understand GPR55, the receptor sometimes called CB3. Learn how CBD blocks GPR55 and why this matters for cancer, bone health, and inflammation research.',
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
