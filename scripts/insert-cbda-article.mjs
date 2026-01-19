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

**CBDA (cannabidiolic acid)** is the raw, unheated form of [CBD](/glossary/cannabidiol) found in fresh cannabis plants. When cannabis is heated (smoked, vaped, or cooked), CBDA converts to CBD through decarboxylation. CBDA may be more potent than CBD for nausea and anxiety, with up to 100x greater affinity for certain receptors. It's gaining attention as a "raw cannabinoid" with unique therapeutic potential.

---

## What Is CBDA?

CBDA is an acidic precursor cannabinoid—the form CBD exists in before heat is applied. Raw cannabis contains almost no CBD; it's nearly all CBDA. The "A" stands for "acid," referring to its carboxylic acid group.

### CBDA Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Cannabidiolic acid |
| **Converts to** | CBD (via heat) |
| **Found in** | Raw/fresh cannabis |
| **Psychoactive** | No |
| **Stability** | Less stable than CBD |
| **Research status** | Emerging |

---

## CBDA vs. CBD

| Property | CBDA | CBD |
|----------|------|-----|
| **Form** | Acidic (raw) | Neutral (heated) |
| **Found in** | Fresh plant | Heated/processed |
| **5-HT1A affinity** | Much higher | Moderate |
| **Stability** | Less stable | More stable |
| **Research** | Emerging | Extensive |
| **Products** | Limited | Widespread |

---

## How CBDA Works

CBDA has different receptor targets than CBD.

### CBDA Receptor Profile

| Target | CBDA Action | Compared to CBD |
|--------|-------------|-----------------|
| **[5-HT1A](/glossary/serotonin-receptors-5ht1a)** | Very potent agonist | 100x higher affinity |
| **COX-2** | Inhibitor | Different mechanism |
| **[GPR55](/glossary/gpr55-receptor)** | Antagonist | Similar |
| **[TRPV1](/glossary/trpv1-receptor)** | Activator | Similar |

### Why 5-HT1A Matters

The 5-HT1A receptor controls nausea and anxiety. CBDA's extremely high affinity may make it more effective for these conditions than CBD.

---

## Potential Benefits of CBDA

### Researched Applications

| Application | Evidence | Key Finding |
|-------------|----------|-------------|
| **Nausea/vomiting** | Preclinical | More potent than CBD |
| **Anticipatory nausea** | Preclinical | Effective in animal models |
| **Anxiety** | Preclinical | High 5-HT1A activity |
| **Inflammation** | Preclinical | COX-2 inhibition |
| **Seizures** | Early research | GW Pharma interest |
| **Cancer** | Very early | May inhibit migration |

### CBDA for Nausea

CBDA appears significantly more potent than CBD for nausea:
- Works at lower doses
- Effective for anticipatory nausea (before chemotherapy)
- 5-HT1A mechanism similar to ondansetron

### GW Pharmaceuticals' Interest

The makers of [Epidiolex](/glossary/epidiolex) have patented CBDA formulations and conducted research on CBDA for seizures, suggesting pharmaceutical potential.

---

## How to Get CBDA

CBDA is destroyed by heat, so obtaining it requires special methods.

### CBDA Sources

| Source | CBDA Content |
|--------|--------------|
| **Raw cannabis juice** | High |
| **Fresh hemp tinctures** | Varies |
| **CBDA-specific products** | Designed for stability |
| **Unheated extracts** | Must specify "raw" |
| **Standard CBD oil** | Very low (decarbed) |

### Stability Challenges

CBDA converts to CBD over time, even without deliberate heating:
- Light exposure accelerates conversion
- Room temperature slowly converts
- Refrigeration extends stability
- Products must be formulated carefully

---

## CBDA Products

A growing market exists for raw cannabinoid products.

### Available Products

| Type | Notes |
|------|-------|
| **Raw hemp oil** | Unheated extraction |
| **CBDA tinctures** | Stabilized formulations |
| **CBDA capsules** | Enterically coated help |
| **Fresh plant juice** | DIY, very fresh |
| **CBDA + CBD blends** | Combines both forms |

---

## Related Articles

- [What Is CBD?](/articles/what-is-cbd) - CBDA's decarboxylated form
- [What Are Cannabinoids?](/articles/what-are-cannabinoids) - Complete overview
- [CBD and Serotonin](/articles/serotonin-receptors) - The 5-HT1A connection

---

## Frequently Asked Questions

### Is CBDA better than CBD?

Not universally, but for certain applications. CBDA shows higher potency for nausea and may be more effective for anxiety due to its 5-HT1A affinity. CBD has more research, better stability, and broader applications. They may work well together.

### Will CBDA get me high?

No. CBDA is non-psychoactive, just like CBD. It doesn't significantly interact with [CB1 receptors](/glossary/cb1-receptor).

### How do I keep CBDA from turning into CBD?

Store CBDA products refrigerated, away from light, and use before expiration. Avoid heating. Some products use stabilization technology to extend shelf life.

### Can I get CBDA from regular CBD oil?

No. Standard CBD oils are decarboxylated during production, converting CBDA to CBD. You need products specifically made to preserve CBDA.

---

*Medical Disclaimer: This article is for educational purposes only. CBDA research is emerging, and it's not approved for any medical condition. Consult a healthcare professional before use.*

---

### References

1. Rock EM, et al. Cannabidiol and cannabidiolic acid: Comparison of anxiolytic and anti-nausea properties. *Br J Pharmacol*. 2017;174(18):3129-3142.

2. Bolognini D, et al. Cannabidiolic acid prevents vomiting in Suncus murinus and nausea-induced behaviour in rats. *Br J Pharmacol*. 2013;168(6):1456-1470.

3. Takeda S, et al. Cannabidiolic acid as a selective cyclooxygenase-2 inhibitory component in cannabis. *Drug Metab Dispos*. 2008;36(9):1917-1921.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What Is CBDA? The Raw Form of CBD',
    slug: 'what-is-cbda',
    excerpt: 'Learn about CBDA—the acidic precursor to CBD found in raw cannabis. Discover why CBDA may be more potent for nausea and anxiety.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 7,
    meta_title: 'What Is CBDA? Benefits of Raw Cannabidiolic Acid',
    meta_description: 'Understand CBDA, the raw form of CBD. Learn why this acidic cannabinoid may be more potent for nausea and anxiety than regular CBD.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('CBDA article inserted:', data.slug);
}
main();
