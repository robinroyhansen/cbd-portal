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

[Anandamide](/glossary/anandamide) is the first [endocannabinoid](/glossary/endocannabinoid-system) ever discovered—a molecule your body produces that acts like a natural version of [THC](/glossary/tetrahydrocannabinol). Named after the Sanskrit word for "bliss" (ananda), anandamide binds to [CB1](/glossary/cb1-receptor) and [CB2 receptors](/glossary/cb2-receptor) to regulate mood, pain, appetite, and memory. Unlike [CBD](/glossary/cannabidiol), anandamide is made on-demand and broken down quickly by the enzyme [FAAH](/glossary/faah-enzyme).

---

## What Is Anandamide?

Anandamide (N-arachidonoylethanolamine, or AEA) is an endogenous cannabinoid—a signaling molecule naturally produced by human cells that interacts with the same receptors as cannabis compounds.

Discovered in 1992 by Israeli scientist Raphael Mechoulam and his team, anandamide was the first endocannabinoid identified. Its discovery proved that humans have an internal cannabinoid system—the [endocannabinoid system (ECS)](/glossary/endocannabinoid-system).

### Anandamide Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | N-arachidonoylethanolamine (AEA) |
| **Discovery** | 1992 by Mechoulam, Devane, and colleagues |
| **Named after** | Sanskrit "ananda" (bliss) + "amide" (chemical class) |
| **Type** | Endocannabinoid (fatty acid neurotransmitter) |
| **Primary targets** | CB1 receptors, CB2 receptors, [TRPV1](/glossary/trpv1-receptor) |
| **Half-life** | Minutes (rapidly degraded) |
| **Degrading enzyme** | [FAAH](/glossary/faah-enzyme) (fatty acid amide hydrolase) |

---

## How Your Body Makes Anandamide

Unlike classical [neurotransmitters](/glossary/neurotransmitter) that are stored in vesicles, anandamide is synthesized on-demand from cell membrane components.

### Synthesis Pathway

1. **Stimulus** → Neuron receives a signal (calcium influx)
2. **Precursor release** → N-arachidonoyl phosphatidylethanolamine (NAPE) is formed from membrane phospholipids
3. **Enzyme action** → NAPE-PLD cleaves NAPE to produce anandamide
4. **Release** → Anandamide travels backward across the synapse ([retrograde signaling](/glossary/retrograde-signaling))
5. **Binding** → Activates CB1 receptors on presynaptic neurons
6. **Degradation** → FAAH breaks down anandamide into arachidonic acid and ethanolamine

### On-Demand Production: Why It Matters

This "synthesize as needed" approach means:

| Feature | Implication |
|---------|-------------|
| No storage pools | Anandamide can't "run out" like serotonin or dopamine |
| Rapid response | Production triggered in milliseconds |
| Local action | Effects are precise and localized |
| Short duration | Signals are brief and controllable |

---

## What Does Anandamide Do?

Anandamide influences numerous physiological processes through its receptor interactions.

### Primary Functions

| Function | Mechanism | Effects |
|----------|-----------|---------|
| **Mood regulation** | CB1 activation in limbic system | Feelings of well-being, reduced anxiety |
| **Pain modulation** | CB1/TRPV1 in pain pathways | Natural pain relief |
| **Appetite control** | Hypothalamic CB1 | Hunger regulation |
| **Memory** | Hippocampal CB1 | Forgetting of aversive memories |
| **Neuroplasticity** | Synaptic modulation | Learning and adaptation |
| **Immune function** | CB2 activation | Inflammation regulation |
| **Reproduction** | Uterine CB1 | Embryo implantation timing |

### The "Bliss Molecule" Effect

Anandamide earned its name because its discovery came from identifying the compound responsible for cannabis-like euphoria. When researchers isolated this brain chemical, they found it produced feelings of happiness and well-being—hence "bliss molecule."

However, anandamide's effects are more subtle than THC because:

| Factor | Anandamide | THC |
|--------|------------|-----|
| Binding strength | Partial agonist | Partial agonist |
| Duration | Minutes | Hours |
| Concentration | Tightly regulated | Overwhelming (when smoked) |
| Intoxication | Subtle mood lift | Psychoactive high |

---

## Anandamide vs. THC: Key Differences

Both anandamide and [THC](/glossary/tetrahydrocannabinol) activate CB1 receptors, but their effects differ dramatically.

| Property | Anandamide | THC |
|----------|------------|-----|
| **Origin** | Made in your body | Plant-derived |
| **Half-life** | ~5 minutes | 1-3 hours (effects), 1-10 days (storage) |
| **Concentration** | Nanomolar (very low) | Micromolar when consumed |
| **Degradation** | Rapid (FAAH) | Slow (liver metabolism) |
| **Effects** | Subtle, regulatory | Pronounced, intoxicating |
| **Tolerance** | No tolerance develops | Tolerance develops |
| **Receptor activation** | Brief, pulsatile | Prolonged, sustained |

### Why THC Gets You High But Anandamide Doesn't

The key difference is **duration and concentration**:

1. **Anandamide** acts in brief pulses at low concentrations—your brain's normal signaling
2. **THC** floods receptors for hours at high concentrations—overwhelming the system

Think of it like this: anandamide is a gentle tap on the shoulder, while THC is a sustained embrace.

---

## Anandamide and CBD

[CBD](/glossary/cannabidiol) doesn't directly activate cannabinoid receptors like anandamide or THC. Instead, CBD raises anandamide levels indirectly.

### How CBD Increases Anandamide

| Mechanism | Effect |
|-----------|--------|
| **[FAAH inhibition](/glossary/faah-enzyme)** | CBD inhibits the enzyme that breaks down anandamide, allowing levels to rise |
| **Fatty acid binding proteins** | CBD competes with anandamide for transport proteins, slowing anandamide degradation |
| **Indirect effects** | Higher anandamide = enhanced natural ECS signaling |

### Clinical Evidence

A 2012 study in *Translational Psychiatry* found that CBD treatment increased anandamide levels in schizophrenia patients. Higher anandamide correlated with improved symptoms—suggesting CBD's therapeutic effects may partly work through elevated endocannabinoid tone.

### The CBD-Anandamide Connection

| CBD Action | Result |
|------------|--------|
| Blocks FAAH | Anandamide lasts longer |
| Competes for transport | Anandamide stays in synapse longer |
| Raises anandamide levels | Enhanced natural ECS function |
| Clinical outcome | Reduced anxiety, improved mood |

---

## Factors That Affect Anandamide Levels

Your anandamide levels fluctuate based on lifestyle, genetics, and environment.

### What Raises Anandamide

| Factor | Mechanism | Evidence |
|--------|-----------|----------|
| **Exercise** | "Runner's high" involves anandamide | Strong (human studies) |
| **Chocolate** | Contains anandamide and FAAH inhibitors | Moderate |
| **Stress reduction** | Lower cortisol, higher ECS tone | Moderate |
| **Social bonding** | Oxytocin-ECS interaction | Animal studies |
| **CBD** | FAAH inhibition | Strong (human studies) |
| **Massage/acupuncture** | Stress reduction pathways | Preliminary |

### What Lowers Anandamide

| Factor | Mechanism | Evidence |
|--------|-----------|----------|
| **Chronic stress** | HPA axis dysregulation | Strong |
| **Poor sleep** | ECS rhythm disruption | Moderate |
| **Inflammation** | Increased degradation | Moderate |
| **Genetic variants** | FAAH gene polymorphisms | Strong |
| **Alcohol** | ECS suppression | Moderate |

### The FAAH Gene: Born Lucky?

Some people carry a genetic variant (FAAH C385A) that produces a less efficient FAAH enzyme. These individuals have naturally higher anandamide levels and tend to:

- Report lower anxiety
- Be less affected by negative experiences
- Show reduced fear responses
- Have lower rates of addiction

This "genetic lottery" affects about 20% of people of European ancestry.

---

## The Runner's High: Anandamide in Action

For decades, the "runner's high"—a euphoric state after prolonged exercise—was attributed to endorphins. New research points to anandamide.

### Evidence for Anandamide

| Finding | Study |
|---------|-------|
| Blood anandamide rises after running | Sparling et al., 2003 |
| Anandamide crosses blood-brain barrier during exercise | Heyman et al., 2012 |
| Blocking cannabinoid receptors prevents runner's high (mice) | Fuss et al., 2015 |
| Opioid blockers don't prevent runner's high (humans) | Multiple studies |

### Why Anandamide, Not Endorphins?

| Factor | Endorphins | Anandamide |
|--------|------------|------------|
| Blood-brain barrier | Cannot cross easily | Crosses during exercise |
| Receptor blockers | Don't prevent runner's high | Prevent runner's high |
| Timing | Rise early in exercise | Peak at euphoria onset |

---

## Anandamide and Specific Conditions

Research suggests anandamide may play roles in several health conditions.

### Anandamide Deficiency and Disease

| Condition | Anandamide Finding | Research Status |
|-----------|-------------------|-----------------|
| **[Depression](/glossary/depression)** | Lower levels in depressed patients | Clinical evidence |
| **[Anxiety](/glossary/anxiety)** | Low levels correlate with higher anxiety | Clinical evidence |
| **[PTSD](/glossary/ptsd)** | Reduced anandamide signaling | Clinical evidence |
| **Schizophrenia** | Elevated levels (possibly compensatory) | Clinical evidence |
| **[Fibromyalgia](/glossary/fibromyalgia)** | Part of "clinical endocannabinoid deficiency" theory | Theoretical |
| **[Migraines](/glossary/migraines)** | Reduced cerebrospinal fluid levels | Preliminary |

### Clinical Endocannabinoid Deficiency

Dr. Ethan Russo proposed that conditions like fibromyalgia, migraines, and [IBS](/glossary/irritable-bowel-syndrome) may share a common cause: insufficient endocannabinoid tone. If true, raising anandamide levels could address root causes rather than just symptoms.

---

## Anandamide vs. 2-AG: The Two Main Endocannabinoids

Your body produces two primary endocannabinoids: anandamide and [2-AG](/glossary/2-ag).

| Property | Anandamide | 2-AG |
|----------|------------|------|
| **Concentration** | Lower (nanomolar) | Higher (micromolar) |
| **CB1 affinity** | Partial agonist | Full agonist |
| **CB2 affinity** | Lower | Higher |
| **Other targets** | TRPV1, GPR55 | Primarily CB receptors |
| **Primary role** | Modulatory signaling | Tonic signaling |
| **Degradation** | FAAH | MAGL |

### Working Together

Anandamide and 2-AG serve complementary roles:

- **2-AG**: Provides baseline cannabinoid tone (always present)
- **Anandamide**: Fine-tunes signaling in specific contexts

Think of 2-AG as the thermostat setting and anandamide as the manual override button.

---

## Related Articles

- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide
- [What Are CB1 Receptors?](/articles/cb1-receptors) - Anandamide's primary target
- [What is FAAH?](/articles/faah-enzyme) - The enzyme that degrades anandamide
- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's relationship with anandamide

---

## Frequently Asked Questions

### What foods contain anandamide?

Chocolate contains small amounts of anandamide and related compounds that inhibit FAAH. Black truffles also contain anandamide. However, dietary anandamide is rapidly degraded in digestion, so food sources have minimal direct effects on brain anandamide levels.

### Can I take anandamide supplements?

No. Anandamide supplements don't exist as practical products because anandamide is rapidly broken down in the digestive system and blood before reaching the brain. Instead, approaches focus on raising your body's own anandamide—through exercise, stress reduction, or FAAH inhibitors like CBD.

### Does CBD raise anandamide levels?

Yes. [CBD](/glossary/cannabidiol) inhibits [FAAH](/glossary/faah-enzyme), the enzyme that breaks down anandamide. This allows anandamide to remain active longer, effectively raising its levels. Clinical studies have confirmed CBD increases plasma anandamide concentrations in humans.

### Why doesn't anandamide make you high like THC?

Anandamide is produced in small amounts and degraded within minutes, creating brief, localized signals. [THC](/glossary/tetrahydrocannabinol) floods the system in large amounts and persists for hours. The difference is like a camera flash (anandamide) versus a spotlight (THC)—same type of light, vastly different intensity and duration.

### What is the "bliss molecule"?

Anandamide is often called the "bliss molecule" because its name comes from the Sanskrit word "ananda" meaning bliss or joy. When Raphael Mechoulam discovered it in 1992, he named it after its ability to produce feelings of well-being when it activates cannabinoid receptors in the brain.

### How can I naturally increase my anandamide?

Exercise (especially running), reducing stress, getting adequate sleep, and consuming dark chocolate may help. Social bonding and massage have also been associated with increased endocannabinoid levels. CBD supplementation raises anandamide by inhibiting its breakdown enzyme.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. Anandamide research is ongoing, and many findings are preliminary. Consult a healthcare professional before making health decisions based on this information.*

---

### References

1. Devane WA, et al. Isolation and structure of a brain constituent that binds to the cannabinoid receptor. *Science*. 1992;258(5090):1946-1949.

2. Mechoulam R, Parker LA. The endocannabinoid system and the brain. *Annu Rev Psychol*. 2013;64:21-47.

3. Leweke FM, et al. Cannabidiol enhances anandamide signaling and alleviates psychotic symptoms of schizophrenia. *Transl Psychiatry*. 2012;2(3):e94.

4. Sparling PB, et al. Exercise activates the endocannabinoid system. *Neuroreport*. 2003;14(17):2209-2211.

5. Fuss J, et al. A runner's high depends on cannabinoid receptors in mice. *Proc Natl Acad Sci USA*. 2015;112(42):13105-13108.

6. Russo EB. Clinical endocannabinoid deficiency reconsidered. *Cannabis Cannabinoid Res*. 2016;1(1):154-165.

7. Dincheva I, et al. FAAH genetic variation enhances fronto-amygdala function in mouse and human. *Nat Commun*. 2015;6:6395.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'What Is Anandamide? Your Body\'s Natural Cannabis',
    slug: 'anandamide',
    excerpt: 'Discover anandamide—the "bliss molecule" your body naturally produces. Learn how this endocannabinoid regulates mood, pain, and memory, and how CBD raises anandamide levels.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    reading_time: 10,
    meta_title: 'Anandamide Explained: The Bliss Molecule & Natural Cannabinoid',
    meta_description: 'Learn about anandamide, the endocannabinoid your body makes that acts like natural THC. Discover how CBD raises anandamide levels and why it\'s called the bliss molecule.',
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
