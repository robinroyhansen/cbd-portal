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

**[THCV](/glossary/tetrahydrocannabivarin) (tetrahydrocannabivarin)** is a cannabinoid similar to [THC](/glossary/tetrahydrocannabinol) but with different effects. At low doses, THCV blocks CB1 receptors (opposite of THC); at high doses, it activates them (like THC, but shorter-lasting). THCV is being researched for appetite suppression, diabetes, and anxiety—earning it the nickname "diet weed" or "sports car of cannabinoids" for its energizing effects.

---

## What Is THCV?

THCV (tetrahydrocannabivarin) is a propyl cannabinoid—it has a 3-carbon side chain instead of THC's 5-carbon chain. This small structural difference creates dramatically different pharmacology.

### THCV Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Tetrahydrocannabivarin |
| **Structure** | Propyl homolog of THC |
| **Psychoactive** | Dose-dependent |
| **Low dose effect** | CB1 antagonist (blocks THC) |
| **High dose effect** | CB1 agonist (like THC, shorter) |
| **Duration** | Shorter than THC |
| **Typical content** | <1% (high in African sativas) |

---

## THCV's Unique Pharmacology

THCV behaves differently depending on dose—making it unusual among cannabinoids.

### Dose-Dependent Effects

| Dose | CB1 Effect | Experience |
|------|------------|------------|
| **Low (<10mg)** | Antagonist (blocks) | Non-intoxicating, may reduce THC effects |
| **High (>10mg)** | Agonist (activates) | Mildly psychoactive, energizing, short |

### Why This Matters

| Low Dose THCV | High Dose THCV |
|---------------|----------------|
| Suppresses appetite | May increase appetite |
| Blocks THC's high | Produces a brief high |
| Clear-headed | Energizing, stimulating |
| Longer-lasting effects | Effects fade quickly |

---

## Potential Benefits of THCV

### Researched Applications

| Application | Evidence | Key Findings |
|-------------|----------|--------------|
| **Appetite suppression** | Preclinical + early human | Reduces food intake |
| **Diabetes/blood sugar** | Phase II trials | Improved glycemic control |
| **Anxiety** | Preclinical | Reduced PTSD symptoms in models |
| **Bone health** | Preclinical | Promotes bone growth |
| **Parkinson's** | Preclinical | Neuroprotective, anti-tremor |

### THCV and Weight/Metabolism

GW Pharmaceuticals conducted Phase II trials showing THCV improved glycemic control in Type 2 diabetics. THCV may:
- Reduce appetite (CB1 antagonism)
- Improve insulin sensitivity
- Regulate blood sugar

### THCV for Anxiety

Unlike THC (which can increase anxiety), low-dose THCV may reduce anxiety by blocking CB1 without the stimulating effects of full antagonists.

---

## THCV vs. THC

| Property | THCV | THC |
|----------|------|-----|
| **Psychoactive** | Dose-dependent | Yes |
| **Appetite** | Suppresses (low dose) | Increases |
| **Anxiety** | May reduce | Can increase |
| **Duration** | Short | Long |
| **CB1 action** | Antagonist then agonist | Agonist |
| **Energy** | Stimulating | Variable |
| **"Munchies"** | Reduces | Causes |

---

## THCV Products and Strains

THCV is rare but found in certain strains.

### High-THCV Strains

| Strain Type | THCV Content | Origin |
|-------------|--------------|--------|
| **Durban Poison** | Up to 1% | South African |
| **Doug's Varin** | Up to 6% | Bred for THCV |
| **Pineapple Purps** | Moderate | Hybrid |
| **African sativas** | Generally higher | Landrace genetics |

### THCV Products

| Type | Availability |
|------|--------------|
| **THCV oils** | Limited, expensive |
| **THCV vapes** | Emerging market |
| **THCV isolate** | Very rare |
| **High-THCV flower** | Select dispensaries |

---

## Is THCV Legal?

THCV's legal status is complex.

| Jurisdiction | Status |
|--------------|--------|
| **US Federal** | Gray area (not explicitly scheduled) |
| **Hemp-derived** | Likely legal if <0.3% THC |
| **State laws** | Vary—some restrict all THC analogs |

---

## Related Articles

- [What Is THC?](/articles/what-is-thc) - THCV's parent compound
- [What Are Cannabinoids?](/articles/what-are-cannabinoids) - Complete overview
- [What Is CBD?](/articles/what-is-cbd) - Non-intoxicating comparison

---

## Frequently Asked Questions

### Will THCV get me high?

At low doses, no—THCV actually blocks CB1 and may reduce THC's effects. At high doses (roughly >10mg), THCV can produce a brief, clear, energizing high that fades faster than THC.

### Does THCV suppress appetite?

At low doses, yes. THCV's CB1 antagonism reduces hunger signals, opposite to THC's "munchies" effect. This has earned it the nickname "diet weed."

### Is THCV good for anxiety?

Possibly. Unlike THC, which can worsen anxiety, low-dose THCV may reduce anxiety by blocking CB1 without full antagonist side effects. Research is preliminary but promising.

### How is THCV different from THC?

THCV has a shorter molecular chain, creating opposite effects at low doses (blocks CB1 vs. activates it). THCV effects are shorter-lasting, potentially energizing rather than sedating, and don't increase appetite.

---

*Medical Disclaimer: This article is for educational purposes only. THCV research is limited, and its legal status varies. Consult a healthcare professional before use.*

---

### References

1. Jadoon KA, et al. Efficacy and safety of cannabidiol and tetrahydrocannabivarin on glycemic and lipid parameters in patients with type 2 diabetes. *Diabetes Care*. 2016;39(10):1777-1786.

2. Riedel G, et al. Synthetic and plant-derived cannabinoid receptor antagonists show hypophagic properties in fasted and non-fasted mice. *Br J Pharmacol*. 2009;156(7):1154-1166.

3. Garcia C, et al. Symptom-relieving and neuroprotective effects of the phytocannabinoid THCV in animal models of Parkinson's disease. *Br J Pharmacol*. 2011;163(7):1495-1506.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What Is THCV? The "Diet Weed" Cannabinoid',
    slug: 'what-is-thcv',
    excerpt: 'Learn about THCV—the cannabinoid that suppresses appetite and may help with diabetes. Discover why its dose-dependent effects make it unique.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 8,
    meta_title: 'What Is THCV? Benefits, Effects & How It Differs from THC',
    meta_description: 'Understand THCV, the appetite-suppressing cannabinoid being researched for diabetes and weight. Learn how its effects differ from THC.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('THCV article inserted:', data.slug);
}
main();
