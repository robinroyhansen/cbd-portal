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

[CBD](/glossary/cannabidiol) increases adenosine signaling by blocking the adenosine transporter (ENT1), preventing adenosine reuptake. This elevates adenosine at A1 and A2A receptors, producing anti-inflammatory, cardioprotective, and sleep-promoting effects. Adenosine is the same molecule that caffeine blocks—so CBD and caffeine have opposite effects on this system.

---

## What Is Adenosine?

Adenosine is a [neurotransmitter](/glossary/neurotransmitter) and signaling molecule found throughout the body. It's a building block of ATP (energy currency) and DNA, but also acts as a powerful signaling molecule when released into extracellular space.

Adenosine accumulates during waking hours and promotes sleep, regulates blood flow, and controls inflammation.

### Adenosine Quick Facts

| Property | Detail |
|----------|--------|
| **Type** | Purine nucleoside |
| **Functions** | Sleep, inflammation, blood flow, heart protection |
| **Receptors** | A1, A2A, A2B, A3 |
| **Caffeine connection** | Caffeine blocks adenosine receptors |
| **CBD effect** | Enhances adenosine signaling |
| **Half-life** | Seconds (rapidly degraded/reuptaken) |

---

## Adenosine Receptors

Adenosine acts through four receptor subtypes with distinct functions.

### The Four Adenosine Receptors

| Receptor | G-Protein | Primary Effect | Key Locations |
|----------|-----------|----------------|---------------|
| **A1** | Gi (inhibitory) | Decreases cAMP, slows heart | Heart, brain, fat |
| **A2A** | Gs (stimulatory) | Increases cAMP, vasodilation | Blood vessels, immune cells, brain |
| **A2B** | Gs (stimulatory) | Inflammation modulation | Ubiquitous |
| **A3** | Gi (inhibitory) | Anti-inflammatory | Immune cells |

### A1 Receptors

| Property | Detail |
|----------|--------|
| **Main effects** | Sedation, cardioprotection, reduced pain |
| **Brain function** | Sleep promotion, neuroprotection |
| **Heart function** | Slows heart rate, protects during ischemia |
| **CBD relevance** | Indirect enhancement via transporter block |

### A2A Receptors

| Property | Detail |
|----------|--------|
| **Main effects** | Vasodilation, anti-inflammation, wakefulness modulation |
| **Immune function** | Suppresses excessive inflammation |
| **Brain function** | Modulates dopamine signaling |
| **CBD relevance** | Primary target for anti-inflammatory effects |

---

## How CBD Affects Adenosine

CBD doesn't directly activate adenosine receptors. Instead, it blocks adenosine reuptake.

### The CBD-Adenosine Mechanism

1. **Adenosine released** → Normal signaling process
2. **Adenosine activates receptors** → A1, A2A, A2B, A3
3. **Normally: reuptake occurs** → ENT1 transporter removes adenosine
4. **CBD blocks ENT1** → Adenosine stays in extracellular space longer
5. **Result** → Enhanced adenosine signaling at all receptor subtypes

### Research Evidence

| Finding | Source |
|---------|--------|
| CBD inhibits adenosine uptake at micromolar concentrations | Carrier et al., 2006 |
| A2A antagonist reverses some CBD anti-inflammatory effects | Ribeiro et al., 2012 |
| CBD's immunosuppressive effects involve adenosine | Liou et al., 2008 |

### CBD as an Adenosine Reuptake Inhibitor

| Comparison | CBD | Dipyridamole (Persantine) |
|------------|-----|--------------------------|
| Mechanism | Blocks ENT1 | Blocks ENT1 |
| Primary use | Supplement | Cardiac stress testing, stroke prevention |
| Potency | Moderate | High |
| Other targets | Many (CB1, 5-HT1A, etc.) | Relatively selective |

Dipyridamole is a pharmaceutical adenosine reuptake inhibitor used in medicine. CBD shares this mechanism but with many additional targets.

---

## Adenosine and Inflammation

A2A receptor activation is powerfully anti-inflammatory—this may explain significant aspects of CBD's anti-inflammatory effects.

### A2A Anti-Inflammatory Mechanisms

| Mechanism | Effect |
|-----------|--------|
| **Macrophage suppression** | Reduces pro-inflammatory cytokines |
| **Neutrophil inhibition** | Limits tissue damage |
| **T cell modulation** | Suppresses excessive immune response |
| **Mast cell stabilization** | Reduces histamine release |
| **Endothelial protection** | Limits vascular inflammation |

### Adenosine vs. Other CBD Anti-Inflammatory Pathways

| Target | Mechanism | Contribution |
|--------|-----------|--------------|
| **[PPARγ](/glossary/ppars)** | Gene expression changes | Major, slow |
| **[CB2](/glossary/cb2-receptor)** | Immune cell modulation | Moderate |
| **Adenosine (A2A)** | Acute immunosuppression | Fast |
| **[GPR55](/glossary/gpr55-receptor) antagonism** | Reduced migration | Contributing |

Adenosine enhancement provides a rapid anti-inflammatory mechanism alongside slower PPARγ-mediated changes.

---

## Adenosine and Sleep

Adenosine is the body's primary sleep pressure molecule—and CBD's enhancement of adenosine signaling may explain its sleep-promoting effects.

### How Adenosine Promotes Sleep

| Process | Mechanism |
|---------|-----------|
| **Accumulation** | Adenosine builds up during waking hours |
| **Receptor binding** | A1 receptors in basal forebrain inhibit wake-promoting neurons |
| **Sleep pressure** | Increasing adenosine = increasing sleepiness |
| **Sleep clearance** | Adenosine levels drop during sleep |

### Caffeine vs. CBD: Opposite Effects

| Compound | Adenosine Effect | Result |
|----------|------------------|--------|
| **Caffeine** | Blocks A1/A2A receptors | Wakefulness, alertness |
| **CBD** | Blocks adenosine reuptake | Enhanced adenosine = promotes sleep |

This is why caffeine fights tiredness (blocks adenosine) while CBD may promote relaxation and sleep (enhances adenosine).

### CBD for Sleep: The Adenosine Connection

| Finding | Implication |
|---------|-------------|
| CBD users report improved sleep | Anecdotal support |
| CBD enhances adenosine signaling | Mechanistic explanation |
| Higher CBD doses more sedating | Dose-dependent enhancement |
| CBD reduces sleep anxiety | May also involve 5-HT1A |

---

## Adenosine and the Heart

Adenosine is powerfully cardioprotective, and CBD's enhancement of adenosine signaling may benefit cardiovascular health.

### Adenosine Cardioprotection

| Effect | Mechanism |
|--------|-----------|
| **Heart rate reduction** | A1 receptor activation |
| **Vasodilation** | A2A receptor activation |
| **Ischemic preconditioning** | Prepares heart for low oxygen |
| **Anti-arrhythmic** | Stabilizes heart rhythm |
| **Reduced infarct size** | Limits damage during heart attack |

### CBD and Cardiovascular Health

| Finding | Evidence Level |
|---------|----------------|
| CBD reduces blood pressure in humans | Clinical trials |
| CBD is cardioprotective in animal models | Preclinical |
| Effects involve adenosine signaling | Mechanistic studies |

**Note:** CBD is not approved for cardiovascular conditions. Research is ongoing.

---

## Adenosine and Neuroprotection

Adenosine has complex roles in brain protection that may contribute to CBD's neuroprotective effects.

### Adenosine in the Brain

| Condition | Adenosine Role | CBD Potential |
|-----------|----------------|---------------|
| **Stroke** | A1 protection during ischemia | May enhance protection |
| **Epilepsy** | A1 receptors reduce seizure activity | [Epidiolex](/glossary/epidiolex) efficacy |
| **Neurodegeneration** | A2A modulation of inflammation | Preclinical interest |
| **Brain injury** | Adenosine surge is protective | May amplify |

### The Adenosine-Seizure Connection

A1 receptor activation inhibits neuronal firing, making adenosine a natural anticonvulsant. CBD's enhancement of adenosine signaling may contribute to its anti-seizure effects (though other mechanisms like [GPR55](/glossary/gpr55-receptor) antagonism and sodium channel modulation also play roles).

---

## Adenosine and Pain

Adenosine receptors participate in pain modulation, adding to CBD's analgesic profile.

### Adenosine Pain Mechanisms

| Receptor | Pain Effect |
|----------|-------------|
| **A1** | Analgesic (reduces pain) |
| **A2A** | Context-dependent |
| **A2B** | Inflammatory pain modulation |
| **A3** | Anti-inflammatory analgesia |

### CBD's Multi-Target Pain Relief

| Target | Mechanism | Pain Type |
|--------|-----------|-----------|
| **[CB1/CB2](/glossary/cb1-receptor)** | Endocannabinoid enhancement | Various |
| **[TRPV1](/glossary/trpv1-receptor)** | Desensitization | Inflammatory, neuropathic |
| **Adenosine** | A1 enhancement | Inflammatory |
| **[5-HT1A](/glossary/serotonin-receptors-5ht1a)** | Descending modulation | Various |
| **[PPARγ](/glossary/ppars)** | Anti-inflammatory | Inflammatory |

The adenosine pathway adds another dimension to CBD's pain-relieving potential.

---

## Adenosine-Cannabinoid Crosstalk

The adenosine and [endocannabinoid systems](/glossary/endocannabinoid-system) interact significantly.

### System Interactions

| Interaction | Effect |
|-------------|--------|
| A1 and CB1 receptors co-localize | May form heteromers |
| Adenosine modulates cannabinoid release | Cross-regulation |
| Both systems regulate sleep | Complementary roles |
| Both systems are anti-inflammatory | Synergistic effects |

### CBD's Dual Enhancement

CBD simultaneously:
1. **Enhances endocannabinoid signaling** (via [FAAH inhibition](/glossary/faah-enzyme))
2. **Enhances adenosine signaling** (via ENT1 inhibition)

This dual action on two regulatory systems may produce effects greater than either alone.

---

## CBD vs. Caffeine: The Adenosine Connection

CBD and caffeine have opposite effects on adenosine signaling.

### Mechanism Comparison

| Property | CBD | Caffeine |
|----------|-----|----------|
| **Mechanism** | Blocks reuptake (enhances) | Blocks receptors (antagonizes) |
| **A1 effect** | Enhanced activation | Blocked |
| **A2A effect** | Enhanced activation | Blocked |
| **Alertness** | Promotes relaxation | Promotes wakefulness |
| **Sleep** | May promote | Disrupts |

### CBD + Caffeine Combined?

Some products combine CBD and caffeine. The pharmacology is complex:
- Caffeine blocks adenosine receptors
- CBD increases adenosine levels
- Effects may partially cancel out
- Net effect depends on doses and ratios

---

## Related Articles

- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action
- [CBD and Serotonin](/articles/serotonin-receptors) - The 5-HT1A connection
- [What Are PPARs?](/articles/ppars) - Nuclear receptor targets
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide

---

## Frequently Asked Questions

### How does CBD affect adenosine?

[CBD](/glossary/cannabidiol) blocks the adenosine transporter (ENT1), preventing adenosine from being removed from extracellular space. This allows adenosine to accumulate and produce stronger effects at A1, A2A, A2B, and A3 receptors. CBD doesn't directly activate adenosine receptors—it enhances the body's natural adenosine signaling.

### Is this why CBD helps with sleep?

Possibly. Adenosine is the body's primary sleep pressure molecule—it accumulates during waking and promotes sleepiness. By blocking adenosine reuptake, CBD may enhance this natural sleep-promoting signal. This is the opposite of caffeine, which blocks adenosine receptors and promotes wakefulness.

### Can I take CBD and caffeine together?

Yes, many people do. They have opposing effects on adenosine (CBD enhances, caffeine blocks), so effects may partially cancel. Some find the combination produces "calm alertness"—caffeine's focus without jitters. However, individual responses vary, and timing/doses matter.

### Does adenosine explain CBD's anti-inflammatory effects?

Adenosine enhancement contributes to CBD's anti-inflammatory effects, particularly through A2A receptors on immune cells. However, CBD has multiple anti-inflammatory mechanisms: [PPARγ activation](/glossary/ppars), [CB2 modulation](/glossary/cb2-receptor), [GPR55 antagonism](/glossary/gpr55-receptor), and more. Adenosine provides a fast-acting component alongside slower gene expression changes.

### What's the connection between adenosine and the heart?

Adenosine is cardioprotective—it slows heart rate, dilates blood vessels, and protects heart tissue during low oxygen conditions. CBD's enhancement of adenosine signaling may contribute to the blood pressure reduction seen in clinical trials and the cardioprotection seen in animal studies.

### Is adenosine part of the endocannabinoid system?

Not formally, but the systems interact. Adenosine receptors and cannabinoid receptors are found in the same brain regions, may form receptor complexes, and regulate overlapping functions (sleep, inflammation, pain). CBD's ability to enhance both systems simultaneously may produce complementary effects.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. CBD is not approved for sleep disorders, cardiovascular conditions, or inflammatory diseases. Research on CBD's adenosine effects is largely preclinical. Consult a healthcare professional before using CBD.*

---

### References

1. Carrier EJ, Auchampach JA, Bhaumik R. Inhibition of an equilibrative nucleoside transporter by cannabidiol: a mechanism of cannabinoid immunosuppression. *Proc Natl Acad Sci USA*. 2006;103(20):7895-7900.

2. Ribeiro A, et al. Cannabidiol, a non-psychotropic plant-derived cannabinoid, decreases inflammation in a murine model of acute lung injury: role for the adenosine A2A receptor. *Eur J Pharmacol*. 2012;678(1-3):78-85.

3. Liou GI, et al. Mediation of cannabidiol anti-inflammation in the retina by equilibrative nucleoside transporter and A2A adenosine receptor. *Invest Ophthalmol Vis Sci*. 2008;49(12):5526-5531.

4. Porkka-Heiskanen T, Bhaumik R. Adenosine in sleep and wakefulness. *Ann Med*. 1999;31(2):125-129.

5. Jacobson KA, Gao ZG. Adenosine receptors as therapeutic targets. *Nat Rev Drug Discov*. 2006;5(3):247-264.`;

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
      title: 'CBD and Adenosine: The Sleep and Anti-Inflammation Connection',
      slug: 'adenosine-receptors',
      excerpt: 'Learn how CBD enhances adenosine signaling by blocking reuptake. Discover why this mechanism matters for sleep, inflammation, and cardiovascular health.',
      content: content,
      status: 'published',
      featured: false,
      article_type: 'science',
      category_id: category.id,
      reading_time: 10,
      meta_title: 'CBD and Adenosine Receptors: Sleep and Anti-Inflammatory Effects',
      meta_description: 'Understand how CBD blocks adenosine reuptake to enhance signaling. Learn why this is the opposite of caffeine and how it affects sleep and inflammation.',
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
