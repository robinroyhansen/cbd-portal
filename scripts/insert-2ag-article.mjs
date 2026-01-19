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

[2-AG](/glossary/2-ag) (2-arachidonoylglycerol) is the most abundant [endocannabinoid](/glossary/endocannabinoid-system) in your body—present at concentrations 170 times higher than [anandamide](/glossary/anandamide). It acts as a full agonist at both [CB1](/glossary/cb1-receptor) and [CB2 receptors](/glossary/cb2-receptor), providing the baseline "tone" of your endocannabinoid system. 2-AG regulates pain perception, immune function, appetite, and synaptic plasticity.

---

## What Is 2-AG?

2-AG (2-arachidonoylglycerol) is the second major endocannabinoid discovered and the most abundant cannabinoid in the human body. While [anandamide](/glossary/anandamide) gets more attention as the "bliss molecule," 2-AG does the heavy lifting of daily [endocannabinoid system](/glossary/endocannabinoid-system) function.

Discovered in 1995 by Raphael Mechoulam's team in Israel and independently by Takayuki Sugiura's group in Japan, 2-AG proved that the endocannabinoid system uses multiple signaling molecules.

### 2-AG Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | 2-arachidonoylglycerol |
| **Discovery** | 1995 (Mechoulam and Sugiura teams) |
| **Type** | Endocannabinoid (monoacylglycerol) |
| **Primary targets** | CB1 receptors, CB2 receptors |
| **Brain concentration** | ~170x higher than anandamide |
| **Receptor activity** | Full agonist at CB1 and CB2 |
| **Degrading enzyme** | MAGL (monoacylglycerol lipase) |

---

## 2-AG vs. Anandamide: The Two Endocannabinoids

Your body produces two primary endocannabinoids with complementary roles.

| Property | 2-AG | Anandamide |
|----------|------|------------|
| **Concentration** | Very high (nanomoles/gram) | Low (picomoles/gram) |
| **CB1 activity** | Full agonist | Partial agonist |
| **CB2 activity** | Full agonist | Weak partial agonist |
| **Other targets** | Primarily CB receptors | TRPV1, GPR55, PPARs |
| **Primary function** | Tonic signaling (baseline) | Phasic signaling (on-demand) |
| **Degradation** | MAGL (85%) | [FAAH](/glossary/faah-enzyme) |
| **Role metaphor** | Thermostat setting | Manual override |

### Division of Labor

Think of 2-AG and anandamide as partners:

- **2-AG**: Maintains the baseline endocannabinoid tone—always present, always working
- **Anandamide**: Fine-tunes responses to specific situations—stress, exercise, reward

This dual system provides both stability (2-AG) and flexibility (anandamide).

---

## How 2-AG Is Made and Broken Down

2-AG is produced through a distinct pathway from anandamide.

### 2-AG Synthesis

1. **Signal arrives** → Neuron receives stimulus (calcium influx)
2. **Phospholipase C activation** → Cleaves membrane phospholipids
3. **DAG formation** → Diacylglycerol (DAG) produced
4. **DAGL action** → Diacylglycerol lipase (DAGL) converts DAG to 2-AG
5. **Release** → 2-AG travels backward across synapse ([retrograde signaling](/glossary/retrograde-signaling))
6. **Receptor binding** → Activates CB1/CB2 on presynaptic neuron

### 2-AG Degradation

The enzyme **MAGL** (monoacylglycerol lipase) breaks down approximately 85% of brain 2-AG. Other enzymes (ABHD6, ABHD12) handle the rest.

| Enzyme | 2-AG Degradation | Location |
|--------|------------------|----------|
| **MAGL** | ~85% | Presynaptic terminals |
| **ABHD6** | ~4% | Postsynaptic neurons |
| **ABHD12** | ~9% | Microglia |
| **Other** | ~2% | Various tissues |

### Why Multiple Degradation Pathways?

Different enzymes in different locations allow precise control:

- **MAGL at presynaptic terminals** → Quick termination of retrograde signals
- **ABHD6 postsynaptically** → Local regulation at production site
- **ABHD12 in microglia** → Immune-specific control

---

## What Does 2-AG Do?

2-AG influences nearly every physiological system through its widespread receptor activation.

### Primary Functions of 2-AG

| System | 2-AG Role | Effects |
|--------|-----------|---------|
| **Pain** | Modulates nociception | Analgesia, reduced sensitivity |
| **Immune** | CB2 activation on immune cells | Anti-inflammatory effects |
| **Appetite** | Hypothalamic signaling | Hunger regulation |
| **Mood** | Limbic system CB1 | Anxiety reduction, emotional balance |
| **Neuroprotection** | Released after brain injury | Limits excitotoxicity |
| **Synaptic plasticity** | Long-term depression (LTD) | Learning and memory |
| **Cardiovascular** | Vasodilation | Blood pressure regulation |

### 2-AG and Synaptic Plasticity

One of 2-AG's most important roles is regulating synaptic strength—how well neurons communicate.

| Process | 2-AG Role | Outcome |
|---------|-----------|---------|
| **Long-term depression (LTD)** | Reduces neurotransmitter release | Weakens overactive synapses |
| **Depolarization-induced suppression** | Brief CB1 activation | Temporary signal reduction |
| **Homeostatic plasticity** | Maintains balance | Prevents runaway excitation |

This makes 2-AG crucial for:
- Learning and memory formation
- Preventing seizures (excessive neuronal firing)
- Emotional processing

---

## 2-AG in the Immune System

While anandamide primarily targets the brain, 2-AG has powerful effects on immune function through [CB2 receptors](/glossary/cb2-receptor).

### 2-AG and Immune Cells

| Cell Type | 2-AG Effect | Outcome |
|-----------|-------------|---------|
| **Macrophages** | CB2 activation | Reduced inflammatory cytokines |
| **Microglia** | Anti-inflammatory shift | Neuroprotection |
| **T cells** | Modulates activation | Balanced immune response |
| **Neutrophils** | Chemotaxis regulation | Controlled inflammation |
| **Dendritic cells** | Antigen presentation | Immune tolerance |

### The Anti-Inflammatory Cascade

When 2-AG activates CB2 receptors on immune cells:

1. NF-kB signaling decreases
2. Pro-inflammatory cytokines drop (IL-1β, TNF-α, IL-6)
3. Anti-inflammatory cytokines increase (IL-10)
4. Immune cell migration slows
5. Tissue damage is limited

This explains why endocannabinoid system activation tends to resolve inflammation rather than suppress immunity entirely.

---

## 2-AG and Pain

2-AG plays a central role in how your body manages pain.

### Pain Pathways Involving 2-AG

| Location | 2-AG Action | Effect |
|----------|-------------|--------|
| **Spinal cord** | Reduces pain signal transmission | Less pain reaches brain |
| **Brain (PAG)** | Activates descending inhibition | Pain suppression pathways |
| **Peripheral nerves** | Local anti-inflammatory | Reduced sensitization |
| **Immune cells** | CB2 activation | Less inflammatory pain |

### 2-AG Release During Injury

When tissue is damaged, 2-AG levels increase locally. This serves as a natural brake on pain—your body's built-in analgesic response.

Studies show:
- 2-AG rises in spinal cord after nerve injury
- Blocking MAGL (preserving 2-AG) produces analgesia
- 2-AG effects don't produce tolerance like opioids

---

## 2-AG and Brain Injury

2-AG has remarkable neuroprotective properties after brain trauma.

### The Protective Response

| Phase | 2-AG Action | Benefit |
|-------|-------------|---------|
| **Immediate (minutes)** | Rapid synthesis increase | Limits excitotoxicity |
| **Acute (hours)** | CB1 activation | Reduces glutamate release |
| **Subacute (days)** | CB2 on microglia | Controls neuroinflammation |
| **Recovery (weeks)** | Promotes neuroplasticity | Supports healing |

### Research Findings

| Study Type | Finding |
|------------|---------|
| Traumatic brain injury | 2-AG levels rise 3-10x post-injury |
| Stroke models | MAGL inhibitors reduce infarct size |
| Excitotoxicity | 2-AG limits glutamate damage |

This suggests the endocannabinoid system evolved partly as a protective mechanism against brain injury.

---

## CBD and 2-AG

Unlike its well-documented effects on anandamide (via FAAH inhibition), [CBD's](/glossary/cannabidiol) relationship with 2-AG is less direct.

### CBD's Effects on 2-AG

| Mechanism | Effect | Evidence Level |
|-----------|--------|----------------|
| **MAGL inhibition** | Minimal | CBD is a weak MAGL inhibitor |
| **Indirect effects** | Possible | Through other receptor interactions |
| **GPR55 antagonism** | May affect 2-AG signaling | Preliminary |

### The Key Difference

- **CBD + Anandamide**: Direct FAAH inhibition raises anandamide
- **CBD + 2-AG**: No strong direct interaction

This means CBD's therapeutic effects likely rely more on anandamide elevation than 2-AG modulation.

---

## MAGL Inhibitors: Targeting 2-AG

Since MAGL breaks down 2-AG, blocking MAGL raises 2-AG levels. This is an active area of pharmaceutical research.

### Potential Benefits of MAGL Inhibition

| Application | Rationale | Research Stage |
|-------------|-----------|----------------|
| **Chronic pain** | Enhanced 2-AG analgesia | Preclinical |
| **Neurodegeneration** | Neuroprotection | Preclinical |
| **Inflammation** | CB2-mediated anti-inflammatory | Preclinical |
| **Cancer** | Anti-tumor effects | Preclinical |
| **Anxiety** | Enhanced CB1 signaling | Preclinical |

### Challenges with MAGL Inhibitors

| Challenge | Explanation |
|-----------|-------------|
| **Tolerance** | Complete MAGL inhibition causes CB1 desensitization |
| **Arachidonic acid** | MAGL also produces this inflammation precursor |
| **Specificity** | Need partial inhibition, not complete blockade |

The lesson: too much 2-AG may be as problematic as too little. Balance matters.

---

## 2-AG in Specific Conditions

Research has examined 2-AG in various health conditions.

### Conditions Involving 2-AG

| Condition | 2-AG Finding | Interpretation |
|-----------|--------------|----------------|
| **[Multiple sclerosis](/glossary/multiple-sclerosis)** | Elevated in lesions | Protective response |
| **[Alzheimer's](/glossary/alzheimers)** | Decreased in affected regions | Loss of protection |
| **Obesity** | Elevated peripheral 2-AG | Dysregulated metabolism |
| **[Schizophrenia](/glossary/schizophrenia)** | Elevated cerebrospinal fluid | Compensatory mechanism |
| **[Depression](/glossary/depression)** | Altered levels reported | Mood regulation role |
| **Traumatic brain injury** | Acutely elevated | Protective surge |

### The Obesity Connection

In obesity, peripheral (but not brain) 2-AG levels rise. This may contribute to:
- Increased appetite
- Fat accumulation
- Metabolic dysfunction

The CB1 blocker rimonabant worked for weight loss by countering this elevated 2-AG tone—but caused depression due to central effects.

---

## Related Articles

- [What Is Anandamide?](/articles/anandamide) - The other major endocannabinoid
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide
- [What Are CB1 Receptors?](/articles/cb1-receptors) - 2-AG's primary brain target
- [What Are CB2 Receptors?](/articles/cb2-receptors) - 2-AG's immune target

---

## Frequently Asked Questions

### What's the difference between 2-AG and anandamide?

2-AG is present at much higher concentrations (170x more) and acts as a full agonist at cannabinoid receptors, while [anandamide](/glossary/anandamide) is a partial agonist. 2-AG provides the baseline endocannabinoid tone, while anandamide fine-tunes responses to specific situations.

### Does CBD affect 2-AG levels?

[CBD](/glossary/cannabidiol) has minimal direct effects on 2-AG. Unlike its strong FAAH inhibition (which raises anandamide), CBD is only a weak inhibitor of MAGL, the enzyme that degrades 2-AG. CBD's therapeutic effects likely work primarily through anandamide elevation rather than 2-AG.

### Why is 2-AG important for pain?

2-AG activates cannabinoid receptors throughout pain pathways—in the spinal cord, brain, and peripheral tissues. It reduces pain signal transmission and triggers anti-inflammatory effects through [CB2 receptors](/glossary/cb2-receptor). Your body naturally increases 2-AG production after injury as a built-in pain relief mechanism.

### Can I increase my 2-AG levels naturally?

Research on naturally boosting 2-AG is limited compared to anandamide. Exercise appears to raise both endocannabinoids. Omega-3 fatty acids (fish oil) may support endocannabinoid production since 2-AG is made from arachidonic acid, a fatty acid. Reducing chronic stress helps maintain healthy endocannabinoid tone.

### What is MAGL and why does it matter?

MAGL (monoacylglycerol lipase) is the enzyme that breaks down about 85% of brain 2-AG. MAGL inhibitors are being researched as potential treatments for pain, inflammation, and neurodegeneration because they raise 2-AG levels. However, complete MAGL blockade causes receptor tolerance, so partial inhibition may be the therapeutic goal.

### Is 2-AG the same as THC?

No. 2-AG is an endocannabinoid your body naturally produces, while [THC](/glossary/tetrahydrocannabinol) comes from cannabis plants. Both activate CB1 and CB2 receptors, but 2-AG is rapidly produced and degraded (lasting minutes), while THC persists for hours and accumulates in fat tissue. 2-AG doesn't cause intoxication at natural concentrations.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. 2-AG research is an evolving field with many findings still at preclinical stages. Consult a healthcare professional before making health decisions.*

---

### References

1. Mechoulam R, et al. Identification of an endogenous 2-monoglyceride, present in canine gut, that binds to cannabinoid receptors. *Biochem Pharmacol*. 1995;50(1):83-90.

2. Sugiura T, et al. 2-Arachidonoylglycerol: a possible endogenous cannabinoid receptor ligand in brain. *Biochem Biophys Res Commun*. 1995;215(1):89-97.

3. Blankman JL, Simon GM, Cravatt BF. A comprehensive profile of brain enzymes that hydrolyze the endocannabinoid 2-arachidonoylglycerol. *Chem Biol*. 2007;14(12):1347-1356.

4. Pacher P, Batkai S, Kunos G. The endocannabinoid system as an emerging target of pharmacotherapy. *Pharmacol Rev*. 2006;58(3):389-462.

5. Panikashvili D, et al. An endogenous cannabinoid (2-AG) is neuroprotective after brain injury. *Nature*. 2001;413(6855):527-531.

6. Nomura DK, et al. Endocannabinoid hydrolysis generates brain prostaglandins that promote neuroinflammation. *Science*. 2011;334(6057):809-813.`;

const { data, error } = await supabase
  .from('kb_articles')
  .insert({
    title: 'What Is 2-AG? The Most Abundant Endocannabinoid',
    slug: '2-ag',
    excerpt: 'Learn about 2-AG—the most abundant endocannabinoid in your body. Discover how 2-AG regulates pain, immune function, and neuroprotection through CB1 and CB2 receptors.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    reading_time: 10,
    meta_title: '2-AG Explained: Your Body\'s Most Abundant Cannabinoid',
    meta_description: 'Understand 2-AG (2-arachidonoylglycerol), the endocannabinoid present at 170x higher levels than anandamide. Learn its roles in pain, immunity, and brain protection.',
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
