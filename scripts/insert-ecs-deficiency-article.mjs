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
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      envVars[match[1].trim()] = value;
    }
  });
  return envVars;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const content = `## Quick Answer

**Clinical Endocannabinoid Deficiency (CECD)** is a theory proposing that some conditions—particularly migraines, fibromyalgia, and irritable bowel syndrome—may result from insufficient [endocannabinoid](/glossary/endocannabinoid) levels or function. First proposed by Dr. Ethan Russo in 2001, CECD suggests the [endocannabinoid system (ECS)](/glossary/endocannabinoid-system) maintains a baseline "tone" that, when deficient, causes chronic conditions. This theory explains why cannabis-based treatments help some treatment-resistant conditions.

---

## What Is Endocannabinoid Deficiency?

The ECS maintains homeostasis throughout the body. The CECD theory proposes that some people have lower-than-normal endocannabinoid levels or reduced receptor function, leading to systems falling out of balance.

### CECD Quick Facts

| Property | Detail |
|----------|--------|
| **Proposed by** | Dr. Ethan Russo (2001, revised 2016) |
| **Primary conditions** | Migraine, fibromyalgia, IBS |
| **Key mechanism** | Low [anandamide](/glossary/anandamide) or [2-AG](/glossary/2-ag) levels |
| **Supporting evidence** | Observational, biochemical correlations |
| **Treatment implication** | Cannabinoids may restore ECS tone |
| **Research status** | Hypothesis with growing support |

---

## The Theory Behind CECD

### How the ECS Maintains Tone

The ECS acts like a master regulator:

| Function | ECS Role |
|----------|----------|
| **Pain modulation** | Dampens excessive pain signals |
| **Mood regulation** | Maintains emotional balance |
| **Gut motility** | Controls intestinal function |
| **Inflammation** | Keeps inflammation in check |
| **Sleep** | Regulates sleep-wake cycles |

### What Happens in Deficiency

| Normal ECS | Deficient ECS |
|------------|---------------|
| Adequate endocannabinoid production | Low anandamide/2-AG levels |
| Balanced receptor activity | Reduced [CB1](/glossary/cb1-receptor)/[CB2](/glossary/cb2-receptor) function |
| Proper enzyme balance | Excess [FAAH](/glossary/faah-enzyme) breakdown |
| Homeostatic regulation | Systems drift out of balance |

---

## Conditions Linked to CECD

### The Original Triad

Dr. Russo identified three conditions with the strongest CECD link:

| Condition | CECD Evidence |
|-----------|---------------|
| **Migraine** | Lower anandamide in cerebrospinal fluid |
| **Fibromyalgia** | Reduced [endocannabinoid tone](/glossary/endocannabinoid-tone), responds to cannabinoids |
| **IBS** | Endocannabinoid changes in gut, CB1 involvement |

### Common Features

These three conditions share characteristics suggesting a common mechanism:

| Feature | Observation |
|---------|-------------|
| **Hyperalgesic** | Increased pain sensitivity |
| **Comorbidity** | Often occur together |
| **Treatment-resistant** | Respond poorly to standard treatments |
| **Cannabis-responsive** | Many patients report cannabis helps |
| **Female predominance** | More common in women |
| **Central sensitization** | Involves altered brain processing |

### Other Potential CECD Conditions

| Condition | Proposed Link |
|-----------|---------------|
| **PTSD** | Low anandamide, impaired fear extinction |
| **Chronic fatigue syndrome** | ECS dysregulation evidence |
| **Neonatal failure to thrive** | ECS controls feeding behavior |
| **Colic** | ECS modulates infant distress |
| **Glaucoma** | ECS regulates intraocular pressure |
| **Menstrual disorders** | ECS involved in reproductive function |

---

## Evidence for CECD

### Biochemical Studies

| Finding | Study Type |
|---------|------------|
| **Lower anandamide in migraine** | Cerebrospinal fluid analysis |
| **Reduced 2-AG in chronic conditions** | Blood/tissue samples |
| **Altered FAAH activity** | Enzyme studies |
| **Changed receptor density** | Imaging studies |

### Genetic Evidence

Some people may be genetically predisposed to CECD:

| Gene | Effect |
|------|--------|
| **FAAH variants** | Some variants = higher anandamide breakdown |
| **CNR1 variants** | [CB1 receptor](/glossary/cb1-receptor) gene polymorphisms |
| **MGLL variants** | Affects [2-AG](/glossary/2-ag) breakdown |

### Clinical Observations

| Observation | CECD Support |
|-------------|--------------|
| **Cannabis efficacy** | Patients with these conditions often respond to cannabinoids |
| **Condition clustering** | Migraine, fibromyalgia, IBS often co-occur |
| **Shared epidemiology** | Similar demographics, triggers |

---

## Causes of Endocannabinoid Deficiency

### Potential Causes

| Factor | Mechanism |
|--------|-----------|
| **Genetics** | Born with lower ECS function |
| **Chronic stress** | Depletes endocannabinoids over time |
| **Poor diet** | Lacking omega-3 precursors |
| **Lack of exercise** | Exercise boosts endocannabinoids |
| **Sleep deprivation** | Disrupts ECS rhythm |
| **Gut dysbiosis** | Gut bacteria influence ECS |

### Lifestyle Factors That Deplete ECS

| Factor | Effect on ECS |
|--------|---------------|
| **Chronic stress** | Elevated cortisol reduces anandamide |
| **Alcohol** | Disrupts endocannabinoid signaling |
| **Processed diet** | Lacks omega-3 fatty acids (ECS precursors) |
| **Sedentary lifestyle** | Misses exercise-induced ECS boost |

---

## How to Support Endocannabinoid Tone

### Natural Approaches

| Approach | Mechanism |
|----------|-----------|
| **Exercise** | Running and sustained aerobic activity increases anandamide ("runner's high") |
| **Omega-3 fatty acids** | Fish oil provides endocannabinoid precursors |
| **Stress management** | Reduces cortisol's negative effects on ECS |
| **Quality sleep** | ECS has circadian rhythm |
| **Social bonding** | Social contact increases endocannabinoid release |
| **Probiotics** | Gut microbiome influences ECS |

### Phytocannabinoid Support

| Cannabinoid | Proposed Mechanism |
|-------------|-------------------|
| **[CBD](/glossary/cannabidiol)** | FAAH inhibition (preserves anandamide) |
| **[THC](/glossary/tetrahydrocannabinol)** | Direct CB1/CB2 activation |
| **[Full spectrum](/glossary/full-spectrum)** | [Entourage effect](/glossary/entourage-effect) support |
| **[CBC](/glossary/cannabichromene)** | Anandamide reuptake inhibition |
| **[Beta-caryophyllene](/glossary/caryophyllene)** | CB2 activation (dietary terpene) |

### FAAH Inhibitors

Blocking [FAAH](/glossary/faah-enzyme) allows anandamide to last longer:

| FAAH Inhibitor | Source |
|----------------|--------|
| **CBD** | Cannabis-derived |
| **Kaempferol** | Found in many fruits/vegetables |
| **Palmitoylethanolamide (PEA)** | Supplement form |
| **Pharmaceutical FAAH inhibitors** | In development |

---

## CECD and CBD

### How CBD May Help CECD

| Mechanism | Effect |
|-----------|--------|
| **FAAH inhibition** | Preserves anandamide from breakdown |
| **Allosteric CB1 modulation** | May enhance receptor sensitivity |
| **[GPR55](/glossary/gpr55-receptor) antagonism** | Modulates alternative ECS pathway |
| **[TRPV1](/glossary/trpv1-receptor) desensitization** | Reduces pain hypersensitivity |

### Why Full Spectrum May Be Preferable

For CECD, [full spectrum](/glossary/full-spectrum) products may offer advantages:

| Factor | Reasoning |
|--------|-----------|
| **Multiple targets** | Different cannabinoids hit different pathways |
| **Entourage effect** | Synergistic enhancement |
| **[Terpene](/glossary/terpenes) contribution** | Caryophyllene activates CB2 |
| **Natural ratios** | Mimics plant's evolved composition |

---

## Criticisms and Limitations

### Scientific Concerns

| Criticism | Response |
|-----------|----------|
| **Correlation vs. causation** | Low endocannabinoids may be effect, not cause |
| **Measurement challenges** | Hard to measure endocannabinoids accurately |
| **Lack of RCTs** | No controlled trials specifically testing CECD |
| **Complexity** | ECS has many components; "deficiency" oversimplifies |

### Current Status

| Aspect | Status |
|--------|--------|
| **Medical acceptance** | Hypothesis, not established diagnosis |
| **Research funding** | Limited due to cannabis scheduling |
| **Clinical application** | Used by some integrative practitioners |
| **Diagnostic criteria** | No standard test exists |

---

## Related Articles

- [The Endocannabinoid System](/articles/endocannabinoid-system) - Complete ECS overview
- [What Is Anandamide?](/articles/anandamide) - The "bliss molecule"
- [What Is 2-AG?](/articles/2-ag-endocannabinoid) - The other major endocannabinoid
- [How CBD Works](/articles/how-cbd-works) - CBD's mechanisms of action

---

## Frequently Asked Questions

### Is CECD a real medical diagnosis?

Not officially. CECD is a scientific theory with growing support but isn't recognized as a formal diagnosis in mainstream medicine. No standard diagnostic criteria or tests exist. Some integrative medicine practitioners use it as a working framework for treatment-resistant conditions.

### Can I test for endocannabinoid deficiency?

No reliable clinical test exists. Research studies measure endocannabinoid levels in blood, cerebrospinal fluid, or tissue samples, but these aren't available as standard medical tests. The theory is assessed based on symptoms and treatment response.

### What conditions might benefit from treating CECD?

The conditions most linked to CECD are migraine, fibromyalgia, and IBS. Other potentially related conditions include PTSD, chronic fatigue syndrome, and certain menstrual disorders. All share treatment resistance and cannabinoid responsiveness.

### How can I naturally boost my endocannabinoid system?

Exercise (especially running), omega-3 fatty acids, stress management, quality sleep, social connection, and gut health all support endocannabinoid tone. Some foods contain compounds that inhibit endocannabinoid breakdown. CBD may also help by preserving anandamide.

### Does CBD treat endocannabinoid deficiency?

CBD may help by inhibiting FAAH, the enzyme that breaks down anandamide. This allows your natural anandamide to last longer. However, CBD doesn't directly activate cannabinoid receptors like THC does, so its approach is indirect.

---

*Medical Disclaimer: This article is for educational purposes only. Clinical Endocannabinoid Deficiency is a theoretical framework, not an established medical diagnosis. Consult healthcare professionals for any medical conditions.*

---

### References

1. Russo EB. Clinical Endocannabinoid Deficiency Reconsidered: Current Research Supports the Theory in Migraine, Fibromyalgia, Irritable Bowel, and Other Treatment-Resistant Syndromes. *Cannabis Cannabinoid Res*. 2016;1(1):154-165.

2. Smith SC, Wagner MS. Clinical endocannabinoid deficiency (CECD) revisited: can this concept explain the therapeutic benefits of cannabis in migraine, fibromyalgia, irritable bowel syndrome and other treatment-resistant conditions? *Neuro Endocrinol Lett*. 2014;35(3):198-201.

3. McPartland JM, et al. Care and feeding of the endocannabinoid system: a systematic review of potential clinical interventions that upregulate the endocannabinoid system. *PLoS One*. 2014;9(3):e89566.

4. Di Marzo V. New approaches and challenges to targeting the endocannabinoid system. *Nat Rev Drug Discov*. 2018;17(9):623-639.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'Clinical Endocannabinoid Deficiency (CECD): Theory & Evidence',
    slug: 'endocannabinoid-deficiency',
    excerpt: 'Learn about Clinical Endocannabinoid Deficiency—the theory that low endocannabinoid levels may cause migraines, fibromyalgia, and IBS. Understand the evidence and how to support your ECS.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 11,
    meta_title: 'Clinical Endocannabinoid Deficiency (CECD): What Is It?',
    meta_description: 'Understand Clinical Endocannabinoid Deficiency—the theory linking low endocannabinoid tone to migraines, fibromyalgia, and IBS. Learn the evidence and natural support strategies.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('CECD article inserted:', data.slug);
}
main();
