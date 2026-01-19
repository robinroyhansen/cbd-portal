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

**[THC](/glossary/tetrahydrocannabinol) (tetrahydrocannabinol)** is the primary psychoactive compound in cannabis—the cannabinoid responsible for the "high." It works by activating [CB1 receptors](/glossary/cb1-receptor) in the brain. While THC is federally illegal in the US (except in FDA-approved forms), hemp products may contain up to 0.3% THC legally. Unlike [CBD](/glossary/cannabidiol), THC causes intoxication, can impair driving, and will trigger positive drug tests.

---

## What Is THC?

THC (Δ9-tetrahydrocannabinol, or delta-9-THC) is the most well-known [cannabinoid](/glossary/cannabinoid-profile) and the compound primarily responsible for cannabis's psychoactive effects. First isolated in 1964 by Raphael Mechoulam and Yechiel Gaoni, THC remains the most studied plant cannabinoid.

### THC Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Δ9-tetrahydrocannabinol |
| **Chemical formula** | C₂₁H₃₀O₂ |
| **Molecular weight** | 314.46 g/mol |
| **Discovery** | 1964 (Mechoulam & Gaoni) |
| **Psychoactive** | Yes (intoxicating) |
| **Legal status** | Federally illegal; state medical/recreational varies |
| **FDA-approved forms** | Marinol (dronabinol), Syndros |

### THC vs. Delta-9-THC vs. Other THC Forms

When people say "THC," they usually mean delta-9-THC—the classic psychoactive cannabinoid. Other forms exist:

| Form | Psychoactive? | Source | Legal Status |
|------|---------------|--------|--------------|
| **Delta-9-THC** | Yes (strong) | Cannabis plant | Schedule I (federally) |
| **Delta-8-THC** | Yes (milder) | Converted from CBD | Legal gray area |
| **Delta-10-THC** | Yes (milder) | Converted from CBD | Legal gray area |
| **THCA** | No | Raw cannabis | Legal in some forms |
| **THCV** | Mild at high doses | Cannabis plant | Legal from hemp |

---

## How THC Works

THC produces its effects primarily through [CB1 receptors](/glossary/cb1-receptor) in the brain.

### THC's Mechanism

| Step | What Happens |
|------|--------------|
| 1 | THC enters bloodstream (via lungs, gut, etc.) |
| 2 | THC crosses blood-brain barrier |
| 3 | THC binds to CB1 receptors |
| 4 | CB1 activation changes [neurotransmitter](/glossary/neurotransmitter) release |
| 5 | Brain regions affected produce various effects |

### THC and Cannabinoid Receptors

| Receptor | THC Effect | Outcome |
|----------|------------|---------|
| **[CB1](/glossary/cb1-receptor)** | Partial agonist (strong binding) | Psychoactive effects, pain relief, appetite |
| **[CB2](/glossary/cb2-receptor)** | Partial agonist (moderate binding) | Immune modulation, inflammation |

### Brain Regions Affected by THC

| Brain Region | Function | THC Effect |
|--------------|----------|------------|
| **Hippocampus** | Memory | Short-term memory impairment |
| **Cerebral cortex** | Cognition | Altered thinking, perception |
| **Basal ganglia** | Movement | Coordination changes |
| **Cerebellum** | Balance | Motor control effects |
| **Hypothalamus** | Appetite | Increased hunger ("munchies") |
| **Amygdala** | Emotions | Euphoria or anxiety |
| **Nucleus accumbens** | Reward | Pleasurable feelings |

---

## THC Effects

THC produces a wide range of effects, both desired and undesired.

### Short-Term Effects

| Effect | Description |
|--------|-------------|
| **Euphoria** | Feelings of happiness, well-being |
| **Relaxation** | Reduced tension, calm |
| **Altered time perception** | Time feels slower |
| **Heightened senses** | Colors, sounds more vivid |
| **Increased appetite** | "The munchies" |
| **Impaired memory** | Difficulty forming new memories |
| **Impaired coordination** | Reduced motor control |
| **Altered thinking** | Different thought patterns |
| **Dry mouth** | Reduced saliva production |
| **Red eyes** | Blood vessel dilation |

### Potential Negative Effects

| Effect | Risk Factors |
|--------|--------------|
| **Anxiety/paranoia** | High doses, inexperience, strain type |
| **Increased heart rate** | Can be significant (20-50% increase) |
| **Dizziness** | Especially when standing |
| **Impaired driving** | Dangerous, illegal |
| **Psychotic symptoms** | Rare, more common in vulnerable individuals |

### Factors Affecting THC Experience

| Factor | Impact |
|--------|--------|
| **Dose** | More THC = stronger effects |
| **Tolerance** | Regular users need more |
| **Set and setting** | Mood and environment matter |
| **Consumption method** | Smoking faster than edibles |
| **Strain/profile** | Other cannabinoids and [terpenes](/glossary/terpenes) modify effects |
| **Individual genetics** | CB1 receptor variations |

---

## THC vs. CBD: Complete Comparison

THC and [CBD](/glossary/cannabidiol) are often compared since they're the two major cannabinoids.

### Side-by-Side Comparison

| Property | THC | CBD |
|----------|-----|-----|
| **Psychoactive** | Yes (intoxicating) | No |
| **CB1 binding** | Strong (partial agonist) | Very weak (negative modulator) |
| **CB2 binding** | Moderate | Low |
| **Gets you high** | Yes | No |
| **Drug test** | Causes positive | Won't cause positive |
| **Federal legal** | No (Schedule I) | Yes (from hemp) |
| **Side effects** | Significant | Minimal |
| **Addiction potential** | Low but exists | None |
| **Overdose fatal** | No | No |
| **Appetite** | Increases | Variable |
| **Anxiety** | Can increase or decrease | Usually decreases |

### When THC and CBD Work Together

The [entourage effect](/glossary/entourage-effect) suggests they work better together:

| Interaction | Effect |
|-------------|--------|
| CBD reduces THC anxiety | Smoother experience |
| CBD reduces THC impairment | Some cognitive protection |
| Combined pain relief | May be more effective |
| CBD blocks some CB1 effects | Moderates the high |

---

## Medical Uses of THC

THC has several established and researched medical applications.

### FDA-Approved THC Medications

| Medication | Active Ingredient | Approved For |
|------------|-------------------|--------------|
| **Marinol (dronabinol)** | Synthetic THC | Chemotherapy nausea, AIDS wasting |
| **Syndros** | Synthetic THC (liquid) | Same as Marinol |
| **Cesamet (nabilone)** | Synthetic THC analog | Chemotherapy nausea |

### Researched Medical Applications

| Condition | Evidence Level | Notes |
|-----------|----------------|-------|
| **Chemotherapy nausea** | Strong (FDA approved) | Well-established |
| **AIDS wasting syndrome** | Strong (FDA approved) | Appetite stimulation |
| **[Chronic pain](/glossary/chronic-pain)** | Moderate | Especially neuropathic |
| **[Multiple sclerosis](/glossary/multiple-sclerosis) spasticity** | Moderate | Sativex (THC:CBD) approved in Europe |
| **[Glaucoma](/glossary/glaucoma)** | Limited | Short-term IOP reduction only |
| **[PTSD](/glossary/ptsd)** | Emerging | Research ongoing |
| **Tourette syndrome** | Emerging | Some trials positive |

### Medical vs. Recreational

| Factor | Medical Use | Recreational Use |
|--------|-------------|------------------|
| **Goal** | Symptom relief | Intoxication/pleasure |
| **Dosing** | Controlled, consistent | Variable |
| **Products** | Pharmaceutical or dispensary | Various |
| **Supervision** | Medical guidance | Self-directed |

---

## THC in Hemp and CBD Products

Legal hemp products can contain small amounts of THC.

### Legal THC Limits

| Product Type | THC Limit | Notes |
|--------------|-----------|-------|
| **Hemp (US)** | <0.3% THC | 2018 Farm Bill |
| **Hemp (EU)** | <0.2% THC | Some countries |
| **[Full spectrum](/glossary/full-spectrum) CBD** | <0.3% THC | Contains THC |
| **[Broad spectrum](/glossary/broad-spectrum) CBD** | 0% THC | THC removed |
| **[CBD isolate](/glossary/cbd-isolate)** | 0% THC | Pure CBD only |

### Can Hemp THC Get You High?

No. The trace amounts in legal hemp products (<0.3%) are far too low to cause intoxication. However, with very high doses of full spectrum CBD, some people report subtle effects.

### Drug Testing Concerns

| Scenario | Risk Level |
|----------|------------|
| CBD isolate, occasional use | Very low |
| Full spectrum, occasional low dose | Low |
| Full spectrum, daily moderate dose | Moderate |
| Full spectrum, daily high dose | Higher |

If you're drug tested, use [CBD isolate](/glossary/cbd-isolate) or verified [broad spectrum](/glossary/broad-spectrum) products.

---

## THC Safety and Risks

THC has a favorable acute safety profile but carries some risks.

### Acute Safety

| Factor | Assessment |
|--------|------------|
| **Fatal overdose** | No confirmed fatal overdose from THC alone |
| **LD50** | Extremely high (not practically achievable) |
| **Acute toxicity** | Very low |
| **Respiratory depression** | Doesn't cause (unlike opioids) |

### Risks and Concerns

| Risk | Details |
|------|---------|
| **Cannabis use disorder** | ~9% of users develop problematic use |
| **Adolescent brain effects** | May affect developing brains |
| **Psychosis trigger** | Can trigger in vulnerable individuals |
| **Impaired driving** | Significantly impairs ability |
| **Cardiovascular** | Increases heart rate; caution with heart conditions |
| **Pregnancy** | Avoid—potential developmental effects |

### Who Should Avoid THC?

| Group | Reason |
|-------|--------|
| **Pregnant/breastfeeding** | Fetal/infant exposure risks |
| **Adolescents** | Brain development concerns |
| **Personal/family psychosis history** | May trigger episodes |
| **Heart conditions** | Cardiovascular stress |
| **Drug-tested employment** | Will cause positive test |

---

## THC Detection and Drug Testing

THC and its metabolites remain detectable long after effects wear off.

### Detection Windows

| Test Type | Detection Window |
|-----------|------------------|
| **Urine** | 3-30+ days (depends on use pattern) |
| **Blood** | 1-2 days (occasional), longer (heavy) |
| **Saliva** | 24-72 hours |
| **Hair** | Up to 90 days |

### Factors Affecting Detection

| Factor | Impact |
|--------|--------|
| **Use frequency** | Heavy users detectable longer |
| **Body fat** | THC stores in fat |
| **Metabolism** | Faster = shorter detection |
| **Dose** | Higher doses = longer detection |
| **Hydration** | Affects urine concentration |

---

## Legal Status of THC

THC's legal status is complex and varies by jurisdiction.

### United States

| Level | Status |
|-------|--------|
| **Federal** | Schedule I (illegal) |
| **Medical states** | Legal with prescription/card |
| **Recreational states** | Legal for adults (state law) |
| **Hemp THC (<0.3%)** | Federally legal |

### International

| Region | Status |
|--------|--------|
| **Canada** | Legal (recreational and medical) |
| **European Union** | Medical in many countries; varies |
| **United Kingdom** | Medical only (limited) |
| **Netherlands** | Tolerated (coffee shops) |
| **Most of Asia** | Illegal (severe penalties) |
| **Australia** | Medical in some states |

---

## Related Articles

- [What Is CBD?](/articles/what-is-cbd) - The non-intoxicating cannabinoid
- [What Are CB1 Receptors?](/articles/cb1-receptors) - THC's primary target
- [The Entourage Effect](/articles/entourage-effect) - How cannabinoids work together
- [Full Spectrum vs. Broad Spectrum vs. Isolate](/articles/spectrum-comparison) - Understanding THC content

---

## Frequently Asked Questions

### Why does THC get you high but CBD doesn't?

[THC](/glossary/tetrahydrocannabinol) strongly activates [CB1 receptors](/glossary/cb1-receptor) in brain regions controlling mood, perception, and cognition—producing intoxication. [CBD](/glossary/cannabidiol) has very low CB1 affinity and actually reduces CB1 responsiveness. Same receptor, completely different interactions.

### How long does a THC high last?

Smoking/vaping: 1-3 hours peak, 3-4 hours total. Edibles: 4-6 hours peak, 6-10 hours total (can be longer). Effects depend on dose, tolerance, and individual metabolism.

### Is THC addictive?

THC has low but real addiction potential. About 9% of users develop cannabis use disorder. Risk is higher for daily users, those starting young, and people using high-potency products. Physical withdrawal symptoms are mild compared to alcohol or opioids.

### Will full spectrum CBD make me fail a drug test?

Possibly. [Full spectrum](/glossary/full-spectrum) CBD contains trace THC (<0.3%). Regular high-dose use can accumulate enough THC metabolites to trigger positive tests. Use [CBD isolate](/glossary/cbd-isolate) or verified [broad spectrum](/glossary/broad-spectrum) if you're drug tested.

### Can you overdose on THC?

There's no confirmed fatal THC overdose. The lethal dose is theoretically extremely high—impossible to achieve through normal consumption. However, "greening out" (nausea, anxiety, paranoia) from too much THC is common and unpleasant, though not dangerous.

### What's the difference between delta-8 and delta-9 THC?

Delta-9-THC is the classic, naturally abundant form that produces strong psychoactive effects. Delta-8-THC is a minor cannabinoid (often synthesized from CBD) with similar but milder effects. Delta-8 exists in a legal gray area in the US.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. THC is federally illegal in the United States except in FDA-approved forms. State laws vary. Consult a healthcare professional and legal counsel regarding THC use in your jurisdiction.*

---

### References

1. Gaoni Y, Mechoulam R. Isolation, structure, and partial synthesis of an active constituent of hashish. *J Am Chem Soc*. 1964;86(8):1646-1647.

2. Pertwee RG. The diverse CB1 and CB2 receptor pharmacology of three plant cannabinoids. *Br J Pharmacol*. 2008;153(2):199-215.

3. Volkow ND, et al. Adverse health effects of marijuana use. *N Engl J Med*. 2014;370(23):2219-2227.

4. National Academies of Sciences, Engineering, and Medicine. *The Health Effects of Cannabis and Cannabinoids*. Washington, DC: National Academies Press; 2017.

5. Hasin DS, et al. Prevalence of marijuana use disorders in the United States between 2001-2002 and 2012-2013. *JAMA Psychiatry*. 2015;72(12):1235-1242.`;

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
      title: 'What Is THC? The Complete Guide to Tetrahydrocannabinol',
      slug: 'what-is-thc',
      excerpt: 'Learn what THC is, how it produces its effects, medical uses, risks, and legal status. Understand why THC gets you high while CBD doesn\'t.',
      content: content,
      status: 'published',
      featured: false,
      article_type: 'science',
      category_id: category.id,
      reading_time: 13,
      meta_title: 'What Is THC (Tetrahydrocannabinol)? Complete Guide',
      meta_description: 'Understand what THC is, how it works in the brain, its effects and risks, medical uses, and legal status. Learn how THC differs from CBD.',
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
