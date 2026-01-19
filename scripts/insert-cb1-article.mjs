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

[CB1 receptors](/glossary/cb1-receptor) are the most abundant G-protein-coupled receptors in the human brain, found primarily in the central nervous system. They're the main target for [THC](/glossary/tetrahydrocannabinol) and explain why THC produces intoxicating effects. CB1 receptors regulate memory, mood, pain perception, appetite, and motor control. [CBD](/glossary/cannabidiol) doesn't directly activate CB1 but modulates these receptors, which is why CBD doesn't produce a "high."

---

## What Are CB1 Receptors?

CB1 (cannabinoid receptor type 1) receptors are proteins embedded in cell membranes that serve as the primary binding sites for [cannabinoids](/glossary/cannabinoid-profile) in the nervous system. Discovered in 1988 by Allyn Howlett and William Devane, CB1 receptors were the first cannabinoid receptors identified.

These receptors belong to the G-protein-coupled receptor (GPCR) family—the largest family of cell surface receptors in humans. When activated, CB1 receptors trigger a cascade of cellular responses that ultimately affect [neurotransmitter](/glossary/neurotransmitter) release.

### CB1 by the Numbers

| Fact | Detail |
|------|--------|
| **Discovery** | 1988 |
| **Gene** | CNR1 (chromosome 6) |
| **Protein size** | 472 amino acids |
| **Type** | G-protein-coupled receptor (GPCR) |
| **Primary location** | Central nervous system |
| **Density** | 10x more than opioid receptors in brain |

---

## Where Are CB1 Receptors Located?

CB1 receptors are found throughout the body, but they're most densely concentrated in the brain and spinal cord.

### Brain Regions with High CB1 Density

| Brain Region | Function | CB1 Role |
|--------------|----------|----------|
| **Hippocampus** | Memory formation, learning | Short-term memory effects |
| **Cerebral cortex** | Higher cognition, consciousness | Altered perception, thinking |
| **Basal ganglia** | Movement, motor control | Coordination, movement disorders |
| **Cerebellum** | Balance, coordination | Motor control |
| **Hypothalamus** | Appetite, temperature | Hunger regulation ("munchies") |
| **Amygdala** | Emotions, fear | Anxiety, mood regulation |
| **Periaqueductal gray** | Pain processing | Pain modulation |
| **Spinal cord** | Pain transmission | Analgesic effects |

### Why This Distribution Matters

The location of CB1 receptors explains cannabis effects:

- **No CB1 in brainstem respiratory centers** → Cannabis doesn't cause fatal respiratory depression (unlike opioids)
- **High CB1 in hippocampus** → Memory impairment with THC
- **High CB1 in basal ganglia** → Movement changes, therapeutic potential for movement disorders
- **High CB1 in amygdala** → Anxiety/mood effects

### CB1 Outside the Brain

CB1 receptors also exist in peripheral tissues:

| Location | Function |
|----------|----------|
| Liver | Energy metabolism, lipogenesis |
| Adipose (fat) tissue | Fat storage, metabolism |
| Skeletal muscle | Energy use, glucose uptake |
| GI tract | Motility, secretion |
| Pancreas | Insulin secretion |
| Heart | Cardiovascular function |
| Reproductive organs | Fertility |

---

## How CB1 Receptors Work

CB1 receptors use a unique signaling mechanism called [retrograde signaling](/glossary/retrograde-signaling).

### The Standard Model: Forward Signaling

Most neurotransmitters work like this:
1. Signal arrives at presynaptic neuron
2. Neurotransmitter released into synapse
3. Binds to receptors on postsynaptic neuron
4. Signal continues forward

### CB1's Retrograde Signaling

CB1 receptors work **backward**:

1. Postsynaptic neuron becomes overstimulated
2. [Endocannabinoids](/glossary/anandamide) synthesized on-demand
3. Endocannabinoids travel **backward** across synapse
4. Bind to CB1 on presynaptic neuron
5. **Reduce** neurotransmitter release

Think of it as a feedback mechanism—the receiving neuron saying "slow down, you're sending too many signals!"

### What Activates CB1?

| Compound | Type | Activation Strength |
|----------|------|---------------------|
| [2-AG](/glossary/2-ag) | Endocannabinoid | Full agonist |
| [Anandamide](/glossary/anandamide) | Endocannabinoid | Partial agonist |
| [THC](/glossary/tetrahydrocannabinol) | Phytocannabinoid | Partial agonist |
| [CBD](/glossary/cannabidiol) | Phytocannabinoid | Very low affinity (modulator) |
| Synthetic cannabinoids | Synthetic | Often full agonists (dangerous) |

---

## CB1 and THC: Why Cannabis Gets You High

THC produces its intoxicating effects by partially activating CB1 receptors, particularly in brain regions controlling:

- **Perception** (distorted sense of time)
- **Memory** (short-term impairment)
- **Pleasure** (dopamine release)
- **Coordination** (impaired motor skills)
- **Appetite** ("the munchies")

### Why THC but Not CBD?

| Property | THC | CBD |
|----------|-----|-----|
| **CB1 binding** | High affinity | Very low affinity |
| **CB1 activation** | Partial agonist | Negative allosteric modulator |
| **Intoxicating** | Yes | No |

CBD actually changes the shape of CB1 receptors (allosteric modulation), making it harder for THC to bind. This is why CBD can reduce THC's psychoactive effects.

---

## CB1 and CBD: Indirect Modulation

While [CBD](/glossary/cannabidiol) doesn't directly activate CB1 receptors, it influences them in important ways:

### 1. Negative Allosteric Modulation

CBD binds to a different site on CB1 (not the active site) and changes the receptor's shape. This:
- Reduces THC's ability to bind
- Diminishes THC's intoxicating effects
- May explain why high-CBD strains feel "milder"

### 2. FAAH Inhibition

CBD inhibits [FAAH](/glossary/faah-enzyme), the enzyme that breaks down [anandamide](/glossary/anandamide). More anandamide means more natural CB1 activation—but gently, since anandamide is only a partial agonist.

### 3. Potential PPARγ-Mediated Effects

CBD activates [PPARγ](/glossary/ppars), which may indirectly affect CB1 receptor expression and function.

---

## Therapeutic Implications

CB1 receptors are therapeutic targets for several conditions:

### Conditions Where CB1 Activation May Help

| Condition | Mechanism | Evidence Level |
|-----------|-----------|----------------|
| [Chronic pain](/glossary/chronic-pain) | Reduced pain signaling | Strong |
| Nausea/vomiting | Brainstem CB1 activation | Strong |
| [Spasticity](/glossary/multiple-sclerosis) | Motor neuron modulation | Strong (Sativex approved) |
| Appetite loss | Hypothalamic CB1 | Moderate |
| [PTSD](/glossary/ptsd) | Fear extinction | Growing |
| Glaucoma | Reduced intraocular pressure | Moderate |

### Conditions Where CB1 Blockade May Help

| Condition | Rationale | Status |
|-----------|-----------|--------|
| Obesity | Reduced appetite, metabolism | Rimonabant withdrawn (side effects) |
| Addiction | Reduced reward signaling | Research ongoing |
| Metabolic syndrome | Improved insulin sensitivity | Research ongoing |

### The Rimonabant Story: A Cautionary Tale

Rimonabant was a CB1 blocker approved in Europe for obesity. It worked—people lost weight—but was withdrawn in 2008 due to serious psychiatric side effects including depression and suicidal thoughts.

**Lesson:** CB1 receptors are crucial for mood regulation. Blocking them entirely has consequences.

---

## CB1 Receptor Variants and Genetics

Genetic variations in the CB1 receptor gene (CNR1) can affect how people respond to cannabinoids.

### Known Genetic Variants

| Variant | Effect | Association |
|---------|--------|-------------|
| rs1049353 | Altered receptor function | Addiction vulnerability, obesity |
| rs806368 | Expression changes | Depression, substance use |
| AAT repeat | Variable length | Addiction risk |

Some people may be genetically predisposed to:
- Greater cannabis sensitivity
- Higher addiction risk
- Different therapeutic responses

---

## CB1 vs. CB2: Key Differences

| Feature | CB1 | [CB2](/glossary/cb2-receptor) |
|---------|-----|-----|
| **Primary location** | Brain, CNS | Immune system, peripheral |
| **Density** | Highest in brain | Highest in immune cells |
| **THC effects** | Intoxication | Non-intoxicating |
| **Main functions** | Neurotransmission, cognition | Inflammation, immunity |
| **Therapeutic focus** | Pain, neurological | Inflammation, autoimmune |

---

## Related Articles

- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide
- [What Are CB2 Receptors?](/articles/cb2-receptors) - The immune system's cannabinoid receptor
- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action

---

## Frequently Asked Questions

### Does CBD activate CB1 receptors?

No, [CBD](/glossary/cannabidiol) has very low affinity for CB1 receptors and doesn't directly activate them. Instead, CBD acts as a negative allosteric modulator—it changes the receptor's shape, affecting how other compounds interact with it. This is why CBD doesn't produce intoxication.

### Why does THC make you high but CBD doesn't?

[THC](/glossary/tetrahydrocannabinol) directly binds to and activates CB1 receptors in brain regions controlling perception, memory, and pleasure—producing intoxication. CBD barely binds to CB1 and actually makes it harder for THC to bind, which is why it's non-intoxicating and can reduce THC's effects.

### Can you have too many or too few CB1 receptors?

Yes. CB1 receptor density changes based on use patterns—regular cannabis use leads to downregulation (fewer receptors), explaining tolerance. Conversely, [endocannabinoid deficiency](/glossary/endocannabinoid-deficiency) theory suggests some conditions may involve insufficient CB1 signaling.

### Are CB1 receptors only in the brain?

No, CB1 receptors exist throughout the body, including the liver, fat tissue, muscles, gut, and reproductive organs. However, they're most densely concentrated in the brain (10x more abundant than opioid receptors), which is why cannabinoids have such pronounced neurological effects.

### What happens when CB1 receptors are blocked?

Blocking CB1 receptors can reduce appetite and potentially help with weight loss, but it also affects mood regulation. The drug rimonabant (a CB1 blocker) was withdrawn due to serious depression and suicide risk, demonstrating how important CB1 signaling is for mental health.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. Cannabinoid receptors are complex, and individual responses vary. Consult a healthcare professional before using cannabinoid products.*

---

### References

1. Howlett AC, et al. International Union of Pharmacology. XXVII. Classification of Cannabinoid Receptors. *Pharmacol Rev*. 2002;54(2):161-202.

2. Mackie K. Cannabinoid Receptors: Where They are and What They do. *J Neuroendocrinol*. 2008;20(s1):10-14.

3. Lu HC, Mackie K. An Introduction to the Endogenous Cannabinoid System. *Biol Psychiatry*. 2016;79(7):516-525.

4. Laprairie RB, et al. Cannabidiol is a negative allosteric modulator of the cannabinoid CB1 receptor. *Br J Pharmacol*. 2015;172(20):4790-4805.

5. Christensen R, et al. Efficacy and safety of the weight-loss drug rimonabant: a meta-analysis of randomised trials. *Lancet*. 2007;370(9600):1706-1713.

6. Zou S, Kumar U. Cannabinoid Receptors and the Endocannabinoid System: Signaling and Function in the Central Nervous System. *Int J Mol Sci*. 2018;19(3):833.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'What Are CB1 Receptors? The Brain\'s Cannabis Connection',
    slug: 'cb1-receptors',
    excerpt: 'Learn about CB1 receptors—the most abundant receptors in the brain and the reason THC produces its effects. Discover how CB1 receptors regulate memory, mood, pain, and appetite.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    reading_time: 10,
    meta_title: 'CB1 Receptors Explained: How Cannabis Affects the Brain',
    meta_description: 'Understand CB1 receptors: the brain\'s cannabinoid receptors. Learn why THC gets you high, how CBD modulates CB1, and the therapeutic implications.',
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
