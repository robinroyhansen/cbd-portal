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

[PPARs](/glossary/ppars) (peroxisome proliferator-activated receptors) are nuclear receptors that control gene expression related to metabolism, inflammation, and cell survival. [CBD](/glossary/cannabidiol) activates PPARγ, which may explain many of its anti-inflammatory, neuroprotective, and metabolic benefits. Unlike [CB1](/glossary/cb1-receptor) and [CB2](/glossary/cb2-receptor) receptors, PPARs work inside cells by directly modifying DNA transcription.

---

## What Are PPARs?

PPARs (peroxisome proliferator-activated receptors) are a family of nuclear receptors—proteins that bind directly to DNA and control which genes are turned on or off. They're fundamentally different from cell surface receptors like CB1 and CB2.

Discovered in the early 1990s, PPARs were named for their ability to induce peroxisome proliferation (an effect seen with certain drugs). We now know they regulate far more than peroxisomes.

### PPAR Quick Facts

| Property | Detail |
|----------|--------|
| **Type** | Nuclear receptor (transcription factor) |
| **Location** | Inside cells (nucleus) |
| **Function** | Controls gene expression |
| **Family members** | PPARα, PPARβ/δ, PPARγ |
| **CBD target** | Primarily PPARγ |
| **Timeframe** | Hours to days (gene expression changes) |

---

## The Three PPAR Types

The PPAR family has three members with distinct functions.

### PPARα

| Property | Detail |
|----------|--------|
| **Primary location** | Liver, heart, muscle, kidney |
| **Main function** | Fatty acid oxidation, lipid metabolism |
| **Activated by** | Fatty acids, fibrates (cholesterol drugs) |
| **CBD interaction** | Moderate activation |
| **Therapeutic relevance** | Cholesterol, metabolic syndrome |

### PPARβ/δ (PPARδ)

| Property | Detail |
|----------|--------|
| **Primary location** | Ubiquitous (everywhere) |
| **Main function** | Fatty acid metabolism, cell proliferation |
| **Activated by** | Fatty acids, prostacyclin |
| **CBD interaction** | Weak/unclear |
| **Therapeutic relevance** | Metabolic diseases, wound healing |

### PPARγ (The CBD Target)

| Property | Detail |
|----------|--------|
| **Primary location** | Adipose tissue, immune cells, brain |
| **Main function** | Fat storage, insulin sensitivity, inflammation |
| **Activated by** | Fatty acids, thiazolidinediones (diabetes drugs), CBD |
| **CBD interaction** | Strong activation |
| **Therapeutic relevance** | Diabetes, inflammation, neurodegeneration, cancer |

---

## How PPARs Work: Gene Expression Control

PPARs function completely differently from membrane receptors like CB1/CB2.

### The PPAR Signaling Pathway

1. **Ligand enters cell** → CBD or other compound passes through cell membrane
2. **Binds to PPAR** → Ligand finds PPAR in cytoplasm or nucleus
3. **PPAR-RXR heterodimerization** → PPAR pairs with retinoid X receptor (RXR)
4. **DNA binding** → Complex binds to PPAR response elements (PPREs) on genes
5. **Gene transcription** → Target genes are activated or suppressed
6. **Protein production** → New proteins made over hours/days

### Membrane Receptors vs. Nuclear Receptors

| Feature | CB1/CB2 (Membrane) | PPARs (Nuclear) |
|---------|-------------------|-----------------|
| **Location** | Cell surface | Inside nucleus |
| **Speed** | Milliseconds-seconds | Hours-days |
| **Mechanism** | Ion channels, second messengers | Gene transcription |
| **Duration** | Brief | Long-lasting |
| **Effect type** | Rapid signaling | Structural/metabolic changes |

### Why Nuclear Receptor Effects Last Longer

When CBD activates PPARγ:
- Gene expression changes occur
- New proteins are manufactured
- Cellular machinery is modified
- Effects persist even after CBD clears

This explains why some CBD benefits build over time with consistent use.

---

## CBD and PPARγ: Key Mechanism

CBD's activation of PPARγ is one of its most important non-cannabinoid receptor mechanisms.

### Evidence for CBD-PPARγ Interaction

| Finding | Source |
|---------|--------|
| CBD activates PPARγ at micromolar concentrations | O'Sullivan et al., 2009 |
| PPARγ antagonists block CBD's vascular effects | O'Sullivan et al., 2009 |
| CBD induces PPARγ-dependent apoptosis in cancer cells | Multiple studies |
| CBD's anti-inflammatory effects require PPARγ | Esposito et al., 2011 |

### What PPARγ Activation Does

| Effect | Mechanism | Therapeutic Relevance |
|--------|-----------|----------------------|
| Anti-inflammatory | Suppresses NF-κB, reduces cytokines | [Arthritis](/glossary/arthritis), IBD, neuroinflammation |
| Insulin sensitization | Improves glucose uptake | Diabetes, metabolic syndrome |
| Adipogenesis | Promotes fat cell differentiation | Obesity (complex) |
| Neuroprotection | Reduces neuroinflammation | [Alzheimer's](/glossary/alzheimers), [Parkinson's](/glossary/parkinsons) |
| Anti-cancer | Induces apoptosis, inhibits proliferation | Various cancers |

---

## PPARγ and Inflammation

PPARγ is a master regulator of inflammation—and CBD's activation of it may explain much of CBD's anti-inflammatory action.

### PPARγ Anti-Inflammatory Mechanisms

| Mechanism | Effect |
|-----------|--------|
| **NF-κB inhibition** | Blocks the master inflammatory transcription factor |
| **Cytokine suppression** | Reduces IL-1β, IL-6, TNF-α production |
| **Macrophage polarization** | Shifts from M1 (inflammatory) to M2 (resolving) |
| **COX-2 reduction** | Decreases prostaglandin synthesis |
| **iNOS suppression** | Reduces nitric oxide in inflammation |

### Comparison: CBD's Anti-Inflammatory Pathways

| Target | Mechanism | Contribution |
|--------|-----------|--------------|
| **[CB2 receptors](/glossary/cb2-receptor)** | Immune cell modulation | Moderate |
| **PPARγ** | Gene expression changes | Major |
| **Adenosine receptors** | A2A activation | Moderate |
| **[GPR55](/glossary/gpr55-receptor)** | Antagonism | Emerging |
| **[TRPV1](/glossary/trpv1-receptor)** | Desensitization | Contributing |

PPARγ may be CBD's most important anti-inflammatory target.

---

## PPARγ and Neuroprotection

PPARγ activation in the brain has neuroprotective effects relevant to several diseases.

### PPARγ in Neurodegeneration

| Condition | PPARγ Role | CBD Relevance |
|-----------|------------|---------------|
| **[Alzheimer's disease](/glossary/alzheimers)** | Reduces amyloid toxicity, neuroinflammation | Preclinical benefit |
| **[Parkinson's disease](/glossary/parkinsons)** | Protects dopamine neurons | Preclinical benefit |
| **Multiple sclerosis** | Reduces demyelination | Preclinical benefit |
| **Stroke** | Limits ischemic damage | Preclinical benefit |
| **Traumatic brain injury** | Anti-inflammatory protection | Preclinical benefit |

### Mechanism in the Brain

| Effect | How PPARγ Helps |
|--------|-----------------|
| Microglial modulation | Shifts from pro- to anti-inflammatory |
| Oxidative stress reduction | Upregulates antioxidant enzymes |
| Blood-brain barrier protection | Maintains tight junctions |
| Neuronal survival | Anti-apoptotic gene expression |

---

## PPARγ and Metabolism

PPARγ plays a central role in metabolic health—with complex implications.

### PPARγ Metabolic Functions

| Function | Effect |
|----------|--------|
| **Fat storage** | Promotes adipocyte differentiation |
| **Insulin sensitivity** | Improves glucose uptake |
| **Lipid metabolism** | Regulates fatty acid storage |
| **Adipokine production** | Controls adiponectin, leptin |

### The Diabetes Connection

Thiazolidinediones (TZDs) like pioglitazone are PPARγ-activating diabetes drugs. They:
- Improve insulin sensitivity
- Lower blood glucose
- Have anti-inflammatory effects

CBD may produce similar (though milder) metabolic benefits via PPARγ.

### Weight: A Complex Picture

| PPARγ Effect | Implication |
|--------------|-------------|
| Promotes fat cell differentiation | Could theoretically increase fat storage |
| Improves insulin sensitivity | Helps metabolic health |
| Anti-inflammatory in fat tissue | Reduces obesity-related inflammation |
| Full agonists (TZDs) cause weight gain | Complete PPARγ activation problematic |
| CBD is partial/weak agonist | May avoid weight gain issue |

CBD doesn't appear to cause weight gain despite PPARγ activation—possibly because it's a weak/partial agonist.

---

## PPARγ and Cancer

PPARγ activation has anti-cancer properties in many tumor types.

### PPARγ Anti-Cancer Mechanisms

| Mechanism | Effect |
|-----------|--------|
| **Apoptosis induction** | Triggers cancer cell death |
| **Growth arrest** | Stops cell cycle progression |
| **Differentiation** | Pushes cancer cells toward normal phenotype |
| **Anti-angiogenesis** | Reduces tumor blood supply |
| **Metastasis inhibition** | Limits cancer spread |

### Cancer Types Responsive to PPARγ Activation

| Cancer | PPARγ Role | CBD Studies |
|--------|------------|-------------|
| Breast | Growth inhibition | Preclinical benefit |
| Colon | Differentiation, apoptosis | Preclinical benefit |
| Lung | Apoptosis | Preclinical benefit |
| Glioblastoma | Growth arrest | Preclinical benefit |
| Prostate | Apoptosis | Preclinical benefit |

**Important:** These are preclinical findings. CBD is not an approved cancer treatment.

---

## PPARα: CBD's Other PPAR Target

While PPARγ gets most attention, CBD also activates PPARα.

### PPARα Functions

| Function | Therapeutic Relevance |
|----------|----------------------|
| Fatty acid oxidation | Cholesterol, cardiovascular |
| Ketogenesis | Energy metabolism |
| Anti-inflammatory (liver) | Fatty liver disease |
| Cardioprotection | Heart disease |

### CBD and PPARα

| Finding | Implication |
|---------|-------------|
| CBD activates PPARα | May contribute to metabolic effects |
| PPARα in liver metabolism | Could affect drug metabolism |
| Cardiovascular protection | May contribute to heart benefits |

---

## PPARs vs. Other CBD Targets

CBD acts on multiple receptor systems simultaneously.

### CBD's Multi-Target Profile

| Target | Type | Effect | Timeframe |
|--------|------|--------|-----------|
| **[CB1](/glossary/cb1-receptor)** | GPCR | Negative allosteric modulator | Fast |
| **[CB2](/glossary/cb2-receptor)** | GPCR | Low affinity | Fast |
| **PPARγ** | Nuclear receptor | Agonist | Slow (hours-days) |
| **PPARα** | Nuclear receptor | Agonist | Slow (hours-days) |
| **[5-HT1A](/glossary/serotonin-receptors-5ht1a)** | GPCR | Agonist | Fast |
| **[TRPV1](/glossary/trpv1-receptor)** | Ion channel | Agonist/desensitizer | Fast |
| **[GPR55](/glossary/gpr55-receptor)** | GPCR | Antagonist | Fast |
| **[FAAH](/glossary/faah-enzyme)** | Enzyme | Inhibitor | Moderate |

### Why Multiple Targets Matter

CBD's effects likely result from hitting many targets:
- Fast effects: TRPV1, 5-HT1A, GPR55
- Sustained effects: PPARγ, gene expression changes
- Synergy: Multiple pathways reinforce each other

---

## Pharmaceutical PPARγ Drugs

Understanding existing PPARγ drugs helps contextualize CBD's effects.

### Thiazolidinediones (TZDs)

| Drug | Use | PPARγ Potency |
|------|-----|---------------|
| Pioglitazone (Actos) | Type 2 diabetes | Strong (full agonist) |
| Rosiglitazone (Avandia) | Type 2 diabetes (restricted) | Strong (full agonist) |

### TZD Side Effects (Full PPARγ Agonism)

| Side Effect | Concern |
|-------------|---------|
| Weight gain | Fat cell proliferation |
| Fluid retention | Edema, heart failure risk |
| Bone loss | Fracture risk |
| Bladder cancer (rosiglitazone) | Reason for restrictions |

### Why CBD May Be Safer

| Factor | TZDs | CBD |
|--------|------|-----|
| PPARγ potency | Strong (full agonist) | Weak (partial agonist) |
| Weight gain | Common | Not observed |
| Edema | Common | Rare |
| Multiple targets | PPARγ-focused | Multi-target |

Partial agonists and multi-target compounds often have better safety profiles than strong single-target drugs.

---

## Related Articles

- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide
- [What Are CB2 Receptors?](/articles/cb2-receptors) - Immune cannabinoid receptor
- [What Is FAAH?](/articles/faah-enzyme) - Enzyme that controls anandamide

---

## Frequently Asked Questions

### What are PPARs and why do they matter for CBD?

[PPARs](/glossary/ppars) are nuclear receptors that control gene expression. Unlike surface receptors that act in milliseconds, PPARs change which genes are active over hours to days. [CBD](/glossary/cannabidiol) activates PPARγ, which may explain its long-lasting anti-inflammatory, neuroprotective, and metabolic effects.

### How is PPAR activation different from CB1/CB2 activation?

[CB1](/glossary/cb1-receptor) and [CB2](/glossary/cb2-receptor) are membrane receptors that produce fast, transient effects through second messengers. PPARs are nuclear receptors that directly modify gene expression, producing slower but longer-lasting changes. CBD's PPAR effects may explain why benefits build over time with consistent use.

### Does CBD's PPARγ activation cause weight gain like diabetes drugs?

No. Diabetes drugs like pioglitazone are strong (full) PPARγ agonists and cause weight gain through fat cell proliferation. CBD appears to be a weak or partial PPARγ agonist. Clinical studies of CBD don't show weight gain as a side effect, suggesting CBD doesn't produce this problematic effect.

### Which of CBD's effects come from PPARγ activation?

PPARγ activation likely contributes to CBD's anti-inflammatory effects (via NF-κB suppression), neuroprotective effects (microglial modulation), and potential metabolic benefits (improved insulin sensitivity). Research suggests many of CBD's benefits require PPARγ—blocking PPARγ eliminates some CBD effects in studies.

### Are PPARs part of the endocannabinoid system?

Not traditionally. The [endocannabinoid system](/glossary/endocannabinoid-system) classically includes CB1, CB2, endocannabinoids, and their enzymes. However, PPARs respond to fatty acids including some endocannabinoids, creating overlap. Some researchers now consider PPARs part of an "expanded" endocannabinoid system.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. PPAR research is ongoing, and CBD is not approved for metabolic, inflammatory, or neurodegenerative conditions. Consult a healthcare professional before making health decisions.*

---

### References

1. O'Sullivan SE, et al. Time-dependent vascular actions of cannabidiol in the rat aorta. *Eur J Pharmacol*. 2009;612(1-3):61-68.

2. Esposito G, et al. Cannabidiol reduces Aβ-induced neuroinflammation and promotes hippocampal neurogenesis through PPARγ involvement. *PLoS One*. 2011;6(12):e28668.

3. Michalik L, et al. International Union of Pharmacology. LXI. Peroxisome proliferator-activated receptors. *Pharmacol Rev*. 2006;58(4):726-741.

4. O'Sullivan SE. An update on PPAR activation by cannabinoids. *Br J Pharmacol*. 2016;173(12):1899-1910.

5. Scuderi C, et al. Cannabidiol in medicine: a review of its therapeutic potential in CNS disorders. *Phytother Res*. 2009;23(5):597-602.

6. Sun Y, Bennett A. Cannabinoids: a new group of agonists of PPARs. *PPAR Res*. 2007;2007:23513.`;

async function main() {
  // Get science category ID
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
      title: 'What Are PPARs? CBD\'s Nuclear Receptor Targets',
      slug: 'ppars',
      excerpt: 'Learn about PPARs—nuclear receptors that control gene expression. Discover how CBD activates PPARγ for anti-inflammatory, neuroprotective, and metabolic benefits.',
      content: content,
      status: 'published',
      featured: false,
      article_type: 'science',
      category_id: category.id,
      reading_time: 11,
      meta_title: 'PPARs Explained: How CBD Activates Nuclear Receptors',
      meta_description: 'Understand PPARs and how CBD activates PPARγ. Learn why this nuclear receptor mechanism may explain CBD\'s anti-inflammatory and neuroprotective effects.',
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
