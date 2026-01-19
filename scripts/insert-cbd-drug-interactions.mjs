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

**[CBD](/glossary/cannabidiol) can interact with many medications** by affecting liver enzymes that metabolize drugs. CBD inhibits cytochrome P450 enzymes (especially CYP3A4 and CYP2C19), potentially causing medications to stay in your system longer at higher levels. Always consult your doctor before combining CBD with prescription medications, especially blood thinners, anti-epileptics, and immunosuppressants.

---

## How CBD Affects Drug Metabolism

Your liver processes most medications using enzymes called cytochrome P450 (CYP450). CBD affects these enzymes, changing how fast or slow your body processes other drugs.

### CBD's Enzyme Effects

| Enzyme | CBD Effect | Drugs Affected |
|--------|------------|----------------|
| **CYP3A4** | Inhibited | ~60% of all medications |
| **CYP2C19** | Inhibited | Some antidepressants, PPIs |
| **CYP2C9** | Inhibited | Warfarin, NSAIDs |
| **CYP1A2** | Inhibited | Caffeine, some antipsychotics |
| **CYP2D6** | Inhibited | Opioids, many antidepressants |

### What Enzyme Inhibition Means

| Effect | Consequence |
|--------|-------------|
| **Slowed metabolism** | Drug stays in body longer |
| **Higher blood levels** | More drug circulating |
| **Increased side effects** | Too much active medication |
| **Toxicity risk** | At extreme levels |

---

## The Grapefruit Warning

The "grapefruit test" is a useful rule of thumb:

**If your medication has a grapefruit warning, CBD may interact with it.**

Both grapefruit and CBD inhibit CYP3A4. Many medication labels warn about grapefruit—those same drugs may interact with CBD.

### Medications with Grapefruit Warnings

| Category | Examples |
|----------|----------|
| **Statins** | Atorvastatin, simvastatin |
| **Blood thinners** | Warfarin, apixaban |
| **Calcium channel blockers** | Amlodipine, felodipine |
| **Immunosuppressants** | Cyclosporine, tacrolimus |
| **Some antibiotics** | Erythromycin |
| **Anti-anxiety** | Buspirone, certain benzodiazepines |

---

## High-Risk Drug Categories

### Serious Interaction Potential

| Drug Category | Interaction Concern | Risk Level |
|---------------|---------------------|------------|
| **Blood thinners** | Increased bleeding risk | High |
| **Anti-epileptics** | Altered seizure control | High |
| **Immunosuppressants** | Rejection risk in transplant patients | High |
| **Sedatives** | Excessive sedation | Moderate-High |
| **Heart medications** | Arrhythmia risk | Moderate-High |

### Blood Thinners (Anticoagulants)

| Drug | Interaction |
|------|-------------|
| **Warfarin** | CBD increases warfarin levels; INR monitoring critical |
| **Apixaban (Eliquis)** | Potential for increased bleeding |
| **Rivaroxaban (Xarelto)** | CYP3A4 substrate |
| **Clopidogrel (Plavix)** | CYP2C19 interaction |

### Anti-Epileptic Drugs

| Drug | Interaction |
|------|-------------|
| **Clobazam (Onfi)** | CBD increases clobazam levels 2-3x |
| **Valproate** | Increased risk of liver enzyme elevation |
| **Phenytoin** | Potential level changes |
| **Carbamazepine** | Complex interaction |

**Note:** [Epidiolex](/glossary/epidiolex) (pharmaceutical CBD) is specifically studied with anti-epileptics. The clobazam interaction is well-documented and managed clinically.

### Immunosuppressants

| Drug | Concern |
|------|---------|
| **Tacrolimus** | Critical narrow therapeutic index |
| **Cyclosporine** | Transplant rejection risk |
| **Sirolimus** | Level fluctuations |

---

## Common Medication Interactions

### Antidepressants

| Drug Class | Examples | Concern |
|------------|----------|---------|
| **SSRIs** | Sertraline, fluoxetine | Serotonin effects, CYP2D6 |
| **SNRIs** | Venlafaxine, duloxetine | Metabolism changes |
| **Tricyclics** | Amitriptyline | Increased sedation, levels |

### Pain Medications

| Drug | Interaction |
|------|-------------|
| **Opioids** | Increased sedation, respiratory depression risk |
| **NSAIDs** | Potential GI and bleeding effects |
| **Acetaminophen** | Possible liver enzyme effects at high doses |

### Sedatives and Sleep Medications

| Drug | Concern |
|------|---------|
| **Benzodiazepines** | Additive sedation |
| **Z-drugs (Ambien, etc.)** | CYP3A4 interaction, increased sedation |
| **Antihistamines** | Drowsiness amplification |

---

## Timing Considerations

### When You Take CBD Matters

| Timing | Effect |
|--------|--------|
| **Same time as medication** | Maximum interaction potential |
| **Hours apart** | May reduce but not eliminate interaction |
| **CBD first, medication later** | CBD still in system affecting enzymes |

### Duration of CBD Effect on Enzymes

| Factor | Consideration |
|--------|---------------|
| **CBD half-life** | 18-32 hours |
| **Enzyme inhibition** | Persists while CBD is in system |
| **Regular CBD use** | Steady-state enzyme effects |

---

## Special Populations

### Higher Risk Groups

| Population | Increased Concern |
|------------|-------------------|
| **Elderly** | Slower drug metabolism, polypharmacy |
| **Liver disease** | Impaired drug processing |
| **Multiple medications** | More potential interactions |
| **Narrow therapeutic index drugs** | Small dosing window |

### Pregnancy and Nursing

| Consideration | Guidance |
|---------------|----------|
| **Pregnancy** | CBD not recommended (limited safety data) |
| **Breastfeeding** | CBD passes into breast milk |
| **Medications during pregnancy** | Extra interaction concerns |

---

## What to Do

### Before Starting CBD

| Step | Action |
|------|--------|
| **1. List medications** | Include supplements and OTC drugs |
| **2. Check grapefruit warnings** | Good first indicator |
| **3. Consult your doctor** | Discuss CBD specifically |
| **4. Consult pharmacist** | They specialize in interactions |
| **5. Start low** | Minimize initial interaction risk |

### While Taking CBD with Medications

| Action | Purpose |
|--------|---------|
| **Monitor symptoms** | Watch for medication side effects |
| **Blood tests** | May need more frequent monitoring |
| **Report changes** | Tell doctor about any new symptoms |
| **Document** | Track CBD dosage and timing |

### When to Avoid CBD

| Situation | Recommendation |
|-----------|----------------|
| **Transplant patients** | Generally avoid without specialist approval |
| **Warfarin therapy** | Requires close INR monitoring if used |
| **Narrow therapeutic index drugs** | Extra caution needed |
| **Doctor advises against** | Follow medical advice |

---

## Research Limitations

### What We Know and Dont Know

| Known | Unknown |
|-------|---------|
| CBD inhibits CYP450 enzymes | Exact clinical significance for each drug |
| Some interactions documented | Many interactions unstudied |
| [Epidiolex](/glossary/epidiolex) interaction data | OTC CBD product interaction data |
| High-dose effects | Low-dose effects may differ |

### Dose Matters

| CBD Dose | Interaction Potential |
|----------|----------------------|
| **Low (<25mg/day)** | Less studied, likely lower risk |
| **Moderate (25-100mg)** | Potential for interactions |
| **High (>100mg)** | More significant enzyme inhibition |
| **Epidiolex doses (200-600mg)** | Well-documented interactions |

---

## Related Articles

- [How CBD Works](/articles/how-cbd-works) - CBD mechanisms of action
- [CBD Bioavailability](/articles/cbd-bioavailability) - How much CBD your body absorbs
- [What Is CBD?](/articles/what-is-cbd) - Complete CBD overview

---

## Frequently Asked Questions

### Does CBD interact with all medications?

Not all, but many. CBD affects liver enzymes that process roughly 60% of medications. The interaction potential depends on how your specific medication is metabolized. Always check with a doctor or pharmacist.

### Is it safe to take CBD with my prescription?

It depends on the medication. Some combinations are manageable with monitoring; others are risky. Never start CBD without consulting your prescriber, especially for blood thinners, anti-seizure drugs, immunosuppressants, or heart medications.

### How long should I wait between CBD and my medication?

Separating doses doesn't eliminate interactions because CBD's enzyme effects persist for 18-32 hours (its half-life). The safest approach is working with your doctor to adjust medication doses if needed, not just timing.

### Will low-dose CBD cause problems?

Lower doses generally have less interaction potential, but "safe" low doses aren't well-established. Even wellness doses may affect sensitive medications. Start with the lowest effective dose and monitor carefully.

### My doctor doesn't know about CBD interactions. What should I do?

Bring information to your appointment. Many healthcare providers have limited CBD training. Pharmacists often have more drug interaction expertise. You can also ask your doctor to consult drug interaction databases or a clinical pharmacist.

---

*Medical Disclaimer: This article is for educational purposes only. It does not constitute medical advice. Always consult your healthcare provider and pharmacist before combining CBD with any medications. Do not stop or adjust prescribed medications without medical guidance.*

---

### References

1. Brown JD, Winterstein AG. Potential Adverse Drug Events and Drug-Drug Interactions with Medical and Consumer Cannabidiol (CBD) Use. *J Clin Med*. 2019;8(7):989.

2. Nasrin S, et al. Cannabinoid Metabolites as Inhibitors of Major Hepatic CYP450 Enzymes, with Implications for Cannabis-Drug Interactions. *Clin Pharmacol Ther*. 2021;109(6):1506-1517.

3. Epidiolex (cannabidiol) prescribing information. Jazz Pharmaceuticals, Inc. 2018.

4. Balachandran P, et al. Cannabidiol Interactions with Medications, Illicit Substances, and Alcohol: a Comprehensive Review. *J Gen Intern Med*. 2021;36(7):2074-2084.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'CBD Drug Interactions: What You Need to Know',
    slug: 'cbd-drug-interactions',
    excerpt: 'Learn how CBD interacts with medications through liver enzyme inhibition. Understand which drugs have serious interaction potential and what to discuss with your doctor.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 12,
    meta_title: 'CBD Drug Interactions: Medications to Watch For',
    meta_description: 'Understand CBD drug interactions. Learn which medications interact with CBD through CYP450 enzyme inhibition and what precautions to take.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('CBD Drug Interactions article inserted:', data.slug);
}
main();
