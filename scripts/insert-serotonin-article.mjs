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

[CBD](/glossary/cannabidiol) activates 5-HT1A serotonin receptors, which may explain its anti-anxiety and antidepressant effects. This action is completely independent of the [endocannabinoid system](/glossary/endocannabinoid-system)—CBD directly binds to serotonin receptors like the drug buspirone. This 5-HT1A activation is one of CBD's fastest and most well-documented mechanisms for anxiety reduction.

---

## What Are Serotonin Receptors?

Serotonin receptors are a family of proteins that respond to serotonin (5-hydroxytryptamine, or 5-HT)—a [neurotransmitter](/glossary/neurotransmitter) crucial for mood, anxiety, sleep, and digestion. There are at least 14 different serotonin receptor subtypes.

The 5-HT1A receptor is the most relevant for understanding CBD's effects.

### Serotonin Receptor Families

| Family | Subtypes | Function |
|--------|----------|----------|
| **5-HT1** | 5-HT1A, 5-HT1B, 5-HT1D, 5-HT1E, 5-HT1F | Inhibitory, mood, anxiety |
| **5-HT2** | 5-HT2A, 5-HT2B, 5-HT2C | Excitatory, perception, appetite |
| **5-HT3** | 5-HT3A, 5-HT3B | Ion channel, nausea/vomiting |
| **5-HT4** | 5-HT4 | GI motility, memory |
| **5-HT5** | 5-HT5A, 5-HT5B | Largely unknown |
| **5-HT6** | 5-HT6 | Cognition, memory |
| **5-HT7** | 5-HT7 | Circadian rhythm, mood |

---

## 5-HT1A: CBD's Serotonin Target

The 5-HT1A receptor is CBD's primary serotonin target and one of its most important molecular targets overall.

### 5-HT1A Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | 5-hydroxytryptamine receptor 1A |
| **Type** | G-protein-coupled receptor (GPCR) |
| **G-protein** | Gi/o (inhibitory) |
| **Location** | Raphe nuclei, hippocampus, cortex, limbic system |
| **Function** | Anxiety reduction, mood regulation, nausea control |
| **CBD effect** | Agonist (activates the receptor) |
| **Other agonists** | Buspirone, gepirone, serotonin itself |

### Where 5-HT1A Receptors Are Found

| Location | Function | CBD Relevance |
|----------|----------|---------------|
| **Raphe nuclei** | Serotonin neuron regulation | Mood control |
| **Hippocampus** | Memory, anxiety processing | Anxiolytic effects |
| **Amygdala** | Fear, emotional memory | Anxiety reduction |
| **Prefrontal cortex** | Executive function, worry | Cognitive effects |
| **Hypothalamus** | Stress response | HPA axis modulation |
| **Brainstem** | Nausea, vomiting | Anti-nausea effects |

---

## How CBD Activates 5-HT1A

CBD acts as an agonist at 5-HT1A receptors—meaning it activates them directly.

### The CBD-5-HT1A Interaction

| Evidence | Finding |
|----------|---------|
| Binding studies | CBD binds 5-HT1A with moderate affinity |
| Functional assays | CBD produces 5-HT1A-mediated effects |
| Antagonist studies | 5-HT1A blockers prevent CBD's anxiolytic effects |
| Animal models | CBD reduces anxiety via 5-HT1A |

### Research Confirmation

A landmark 2005 study by Russo et al. showed:
- CBD has micromolar affinity for 5-HT1A
- CBD acts as an agonist (not antagonist)
- This explains CBD's anti-anxiety properties

Subsequent studies confirmed:
- 5-HT1A antagonists (like WAY-100635) block CBD's anxiolytic effects
- CBD's anti-nausea effects also require 5-HT1A
- Antidepressant effects in animal models are 5-HT1A-dependent

---

## 5-HT1A and Anxiety

5-HT1A activation is one of the best-established mechanisms for anxiety treatment.

### 5-HT1A Anxiolytic Drugs

| Drug | Type | Use |
|------|------|-----|
| **Buspirone** | 5-HT1A partial agonist | Generalized anxiety disorder |
| **Gepirone** | 5-HT1A partial agonist | Depression/anxiety |
| **Tandospirone** | 5-HT1A partial agonist | Anxiety (Japan) |

### How 5-HT1A Reduces Anxiety

| Mechanism | Effect |
|-----------|--------|
| Autoreceptor activation | Reduces serotonin release (prevents overstimulation) |
| Postsynaptic activation | Inhibits anxiety circuits |
| Amygdala modulation | Reduces fear responses |
| HPA axis dampening | Lowers cortisol |

### CBD vs. Buspirone

| Property | CBD | Buspirone |
|----------|-----|-----------|
| 5-HT1A activity | Agonist | Partial agonist |
| Onset | Rapid (acute effects) | Weeks for full effect |
| Other targets | Many (CB1, TRPV1, etc.) | Primarily 5-HT1A |
| Side effects | Minimal | Dizziness, nausea |
| Abuse potential | None | None |
| Prescription | No (supplement) | Yes |

---

## 5-HT1A and Depression

5-HT1A receptors are implicated in depression and antidepressant response.

### The Serotonin Hypothesis

The classic "serotonin hypothesis" of depression suggests:
- Low serotonin → depression
- SSRIs increase serotonin → relief

5-HT1A receptors complicate this picture:
- Autoreceptors initially limit serotonin release
- Autoreceptor desensitization needed for SSRI effects
- Direct 5-HT1A agonists may work faster

### CBD's Antidepressant Potential

| Finding | Study Type |
|---------|------------|
| CBD produces antidepressant-like effects in animals | Multiple models |
| Effects blocked by 5-HT1A antagonists | Mechanism confirmation |
| CBD enhances serotonergic transmission | Neurochemical |
| No human depression trials completed | Clinical gap |

**Important:** CBD is not approved for depression. Research is preclinical.

---

## 5-HT1A and Nausea

5-HT1A agonists have powerful anti-nausea effects—explaining one of CBD's medical applications.

### How 5-HT1A Controls Nausea

| Location | Mechanism |
|----------|-----------|
| **Dorsal raphe** | Modulates serotonin release to vomiting center |
| **Brainstem** | Inhibits nausea circuits directly |
| **Forebrain** | Reduces anticipatory nausea |

### CBD for Nausea

| Application | Evidence | Mechanism |
|-------------|----------|-----------|
| Chemotherapy-induced | Preclinical strong | 5-HT1A + CB1 |
| Anticipatory nausea | Preclinical | 5-HT1A primary |
| Motion sickness | Limited | Unclear |
| General nausea | Anecdotal | 5-HT1A likely |

CBD may be especially useful for anticipatory nausea (before chemotherapy starts), which doesn't respond well to standard anti-nausea drugs.

---

## 5-HT1A and Pain

Serotonin receptors participate in pain processing, adding another dimension to CBD's analgesic effects.

### 5-HT1A in Pain Pathways

| Location | 5-HT1A Role |
|----------|-------------|
| Spinal cord | Modulates pain transmission |
| Periaqueductal gray | Descending pain inhibition |
| Brainstem | Pain modulation centers |

### CBD's Pain Relief: Multiple Mechanisms

| Target | Contribution |
|--------|--------------|
| [CB1/CB2 receptors](/glossary/cb1-receptor) | Endocannabinoid modulation |
| [TRPV1](/glossary/trpv1-receptor) | Desensitization |
| [PPARγ](/glossary/ppars) | Anti-inflammatory |
| 5-HT1A | Descending inhibition |
| Adenosine | Anti-inflammatory |

The 5-HT1A pathway may contribute to CBD's effectiveness for certain pain types, especially those with psychological components.

---

## Serotonin-Endocannabinoid Crosstalk

The serotonin and endocannabinoid systems interact extensively.

### System Interactions

| Interaction | Effect |
|-------------|--------|
| CB1 on serotonin neurons | Cannabinoids modulate serotonin release |
| 5-HT1A and CB1 co-localization | Receptors found in same brain regions |
| [Anandamide](/glossary/anandamide) affects 5-HT | Endocannabinoids influence serotonin |
| Stress affects both systems | Shared stress response roles |

### CBD's Dual Action

CBD simultaneously:
1. **Enhances endocannabinoid signaling** (via [FAAH inhibition](/glossary/faah-enzyme))
2. **Activates serotonin receptors** (direct 5-HT1A agonism)

This dual action may produce synergistic effects that neither system alone could achieve.

---

## Other CBD-Serotonin Interactions

CBD may interact with serotonin signaling beyond 5-HT1A.

### CBD and Other 5-HT Receptors

| Receptor | CBD Effect | Evidence Level |
|----------|------------|----------------|
| **5-HT1A** | Agonist | Strong |
| **5-HT2A** | Possible modulation | Weak |
| **5-HT3** | Possible antagonist | Preliminary |

### CBD and Serotonin Transporters

Some research suggests CBD may affect serotonin reuptake, though this is less established than the 5-HT1A mechanism.

---

## Speed of Effect: Why 5-HT1A Matters

Different CBD mechanisms work on different timescales.

### CBD Mechanism Timescales

| Target | Speed | Duration |
|--------|-------|----------|
| **5-HT1A** | Minutes | Hours |
| **[TRPV1](/glossary/trpv1-receptor)** | Minutes | Hours |
| **[FAAH](/glossary/faah-enzyme) inhibition** | Minutes-hours | Hours |
| **[PPARγ](/glossary/ppars)** | Hours-days | Days-weeks |
| **Gene expression changes** | Days | Long-term |

### Why Acute Anxiety Relief?

CBD's rapid anxiolytic effects likely come from:
1. **5-HT1A activation** (fast, direct)
2. **TRPV1 modulation** (fast)
3. **Possible GABA effects** (fast)

The 5-HT1A pathway is particularly important for the immediate anti-anxiety effects many users report.

---

## CBD vs. Other 5-HT1A Compounds

### Comparison Table

| Compound | 5-HT1A Activity | Cannabinoid Activity | Use |
|----------|-----------------|---------------------|-----|
| **CBD** | Agonist | CB1 modulator, many targets | Supplement |
| **Buspirone** | Partial agonist | None | Rx anxiety |
| **Ipsapirone** | Agonist | None | Research |
| **[THC](/glossary/tetrahydrocannabinol)** | None significant | CB1/CB2 agonist | Medical/recreational |
| **SSRIs** | Indirect (increase serotonin) | None | Rx depression/anxiety |

### What Makes CBD Unique

CBD's combination of:
- Direct 5-HT1A activation
- Endocannabinoid enhancement
- TRPV1 modulation
- PPARγ activation

...is unlike any pharmaceutical compound. This polypharmacology may explain CBD's broad effects.

---

## Related Articles

- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action
- [What Are PPARs?](/articles/ppars) - Nuclear receptor targets
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide
- [What Is Anandamide?](/articles/anandamide) - The bliss molecule

---

## Frequently Asked Questions

### Does CBD affect serotonin levels?

[CBD](/glossary/cannabidiol) doesn't directly increase serotonin levels like SSRIs do. Instead, it activates 5-HT1A serotonin receptors directly, mimicking some effects of serotonin. This is a different mechanism—CBD is a receptor agonist, not a reuptake inhibitor.

### Is CBD's anxiety relief from serotonin or cannabinoid receptors?

Both likely contribute, but 5-HT1A may be primary for acute anxiety. Studies show that blocking 5-HT1A receptors (with drugs like WAY-100635) prevents CBD's anxiolytic effects. This confirms that 5-HT1A activation is necessary for CBD's anti-anxiety action.

### Can CBD interact with antidepressants?

Theoretically, CBD's 5-HT1A activity could interact with serotonergic medications. However, clinically significant interactions are not well-documented. CBD also inhibits certain liver enzymes (CYP450) that metabolize many antidepressants. Consult your doctor if combining CBD with antidepressants.

### How fast does CBD's serotonin effect work?

5-HT1A activation produces relatively fast effects—within minutes to an hour. This is faster than SSRIs (weeks) because CBD directly activates receptors rather than gradually building serotonin levels. Many users report noticeable anxiety relief within 30-60 minutes of CBD use.

### Is CBD like buspirone?

CBD and buspirone share 5-HT1A agonist activity, but they're not identical. Buspirone is a partial agonist used for generalized anxiety disorder. CBD is also an agonist but has many additional targets ([CB1](/glossary/cb1-receptor), [TRPV1](/glossary/trpv1-receptor), [PPARγ](/glossary/ppars), etc.). Buspirone requires prescription; CBD is available as a supplement.

### Why doesn't CBD cause serotonin syndrome?

Serotonin syndrome typically requires excessive serotonin accumulation (from MAOIs, combining serotonergic drugs, etc.). CBD doesn't increase serotonin levels—it activates one receptor subtype (5-HT1A) which actually has inhibitory effects on serotonin release. This mechanism makes serotonin syndrome from CBD alone extremely unlikely.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. CBD is not approved for anxiety, depression, or other psychiatric conditions. Research on CBD's serotonin effects is largely preclinical. Consult a healthcare professional before using CBD, especially if taking psychiatric medications.*

---

### References

1. Russo EB, et al. Agonistic properties of cannabidiol at 5-HT1a receptors. *Neurochem Res*. 2005;30(8):1037-1043.

2. Resstel LB, et al. 5-HT1A receptors are involved in the cannabidiol-induced attenuation of behavioural and cardiovascular responses to acute restraint stress in rats. *Br J Pharmacol*. 2009;156(1):181-188.

3. Rock EM, et al. Cannabidiol, a non-psychotropic component of cannabis, attenuates vomiting and nausea-like behaviour via indirect agonism of 5-HT1A somatodendritic autoreceptors in the dorsal raphe nucleus. *Br J Pharmacol*. 2012;165(8):2620-2634.

4. Zanelati TV, et al. Antidepressant-like effects of cannabidiol in mice: possible involvement of 5-HT1A receptors. *Br J Pharmacol*. 2010;159(1):122-128.

5. De Almeida DL, Bhubalan JD. The antidepressant- and anxiolytic-like effects of cannabidiol in mice are mediated through multiple molecular targets. *Front Pharmacol*. 2021;12:714218.`;

async function main() {
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
      title: 'CBD and Serotonin: The 5-HT1A Connection',
      slug: 'serotonin-receptors',
      excerpt: 'Learn how CBD activates 5-HT1A serotonin receptors to reduce anxiety. Discover why this mechanism is key to CBD\'s fast-acting anti-anxiety effects.',
      content: content,
      status: 'published',
      featured: false,
      article_type: 'science',
      category_id: category.id,
      reading_time: 11,
      meta_title: 'CBD and Serotonin Receptors: The 5-HT1A Mechanism Explained',
      meta_description: 'Understand how CBD activates 5-HT1A serotonin receptors. Learn why this non-cannabinoid mechanism is crucial for CBD\'s anti-anxiety and mood effects.',
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
