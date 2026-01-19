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

**Cannabinoid biosynthesis** is how cannabis plants produce [cannabinoids](/glossary/cannabinoid-profile). All major cannabinoids start from a common precursor (CBGA), which enzymes convert into [THCA](/glossary/thca), [CBDA](/glossary/cbda), or [CBCA](/glossary/cbca). These acidic forms become [THC](/glossary/tetrahydrocannabinol), [CBD](/glossary/cannabidiol), and [CBC](/glossary/cannabichromene) when heated. Understanding biosynthesis explains why different strains produce different cannabinoid ratios.

---

## The Cannabinoid Pathway

### Starting Materials

| Precursor | Source | Role |
|-----------|--------|------|
| **Olivetolic acid** | Polyketide pathway | Provides the ring structure |
| **GPP (geranyl pyrophosphate)** | MEP pathway | Provides the terpene chain |

### The Mother Cannabinoid: CBGA

| Property | Detail |
|----------|--------|
| **Name** | Cannabigerolic acid |
| **Role** | Precursor to all major cannabinoids |
| **Neutral form** | [CBG](/glossary/cannabigerol) |
| **Why important** | Branch point for all pathways |

---

## Biosynthesis Steps

### Step-by-Step Production

| Step | Process | Product |
|------|---------|---------|
| **1** | Olivetolic acid + GPP combine | CBGA formed |
| **2** | THCA synthase acts on CBGA | THCA |
| **2** | CBDA synthase acts on CBGA | CBDA |
| **2** | CBCA synthase acts on CBGA | CBCA |
| **3** | Heat (decarboxylation) | THC, CBD, CBC |

### The Three Major Pathways

| Enzyme | Substrate | Product | Final Neutral Form |
|--------|-----------|---------|-------------------|
| **THCA synthase** | CBGA | [THCA](/glossary/thca) | THC |
| **CBDA synthase** | CBGA | [CBDA](/glossary/cbda) | CBD |
| **CBCA synthase** | CBGA | CBCA | [CBC](/glossary/cannabichromene) |

---

## Why Strains Have Different Cannabinoid Profiles

### Genetic Control

| Factor | Effect |
|--------|--------|
| **THCA synthase gene** | Determines THC production capacity |
| **CBDA synthase gene** | Determines CBD production capacity |
| **Gene expression level** | Affects how much enzyme is made |
| **Single gene copies** | Most plants have one dominant pathway |

### The BT:BD Gene System

| Genotype | Cannabinoid Profile |
|----------|---------------------|
| **BT/BT** | High THC, low CBD (marijuana) |
| **BD/BD** | High CBD, low THC (hemp) |
| **BT/BD** | Mixed THC:CBD ratio |

### Why Most Plants Are THC or CBD Dominant

| Observation | Explanation |
|-------------|-------------|
| **THC-dominant plants** | Have functional THCA synthase |
| **CBD-dominant plants** | Have functional CBDA synthase |
| **1:1 plants** | Have both functional enzymes |
| **High-CBG plants** | Low synthase activity (CBGA accumulates) |

---

## The Acidic Cannabinoids

### Raw Cannabis Is Full of Acids

| In Live Plant | After Heat |
|---------------|------------|
| THCA | THC |
| CBDA | CBD |
| CBCA | CBC |
| CBGA | CBG |

### Why This Matters

| Factor | Significance |
|--------|--------------|
| **Raw juice** | Contains acidic forms |
| **Lab testing** | Tests for both acid and neutral |
| **"Total THC"** | THC + (THCA x 0.877) |
| **Therapeutic differences** | CBDA may differ from CBD |

---

## Decarboxylation

### Converting Acids to Neutral Forms

| Method | Temperature | Time |
|--------|-------------|------|
| **Smoking** | 600-900C | Instant |
| **Vaping** | 180-220C | Seconds |
| **Oven** | 110C (230F) | 30-45 min |
| **Room temperature** | 20-25C | Months |

### What Decarboxylation Does

| Before | After | Change |
|--------|-------|--------|
| THCA (non-psychoactive) | THC (psychoactive) | Carboxyl group removed |
| CBDA | CBD | Mass reduced by ~12% |
| CBGA | CBG | Becomes more stable |

---

## Minor Cannabinoid Biosynthesis

### [THCV](/glossary/tetrahydrocannabivarin) and [CBDV](/glossary/cbdv) Pathway

| Difference | Standard Pathway | Varin Pathway |
|------------|------------------|---------------|
| **Precursor** | Olivetolic acid (5-carbon) | Divarinic acid (3-carbon) |
| **Intermediate** | CBGA | CBGVA |
| **Products** | THC, CBD | THCV, CBDV |
| **Abundance** | Common | Rare |

### [CBN](/glossary/cannabinol) Formation

| Factor | Detail |
|--------|--------|
| **Not biosynthesized** | Not made by the plant directly |
| **Degradation product** | Forms from THC oxidation |
| **Causes** | Light, heat, oxygen, time |
| **Old cannabis** | Higher CBN content |

---

## Where Biosynthesis Happens

### The Trichomes

| Structure | Function |
|-----------|----------|
| **Glandular trichomes** | Where cannabinoids are made |
| **Secretory cells** | Contain biosynthetic enzymes |
| **Storage cavity** | Where cannabinoids accumulate |
| **Location** | Concentrated on flowers/bracts |

### Developmental Timing

| Growth Stage | Cannabinoid Production |
|--------------|------------------------|
| **Vegetative** | Minimal |
| **Early flower** | Begins ramping up |
| **Mid flower** | Peak production |
| **Late flower** | Maximum accumulation |
| **Over-mature** | Degradation begins |

---

## Implications for Cannabis Breeding

### Breeding Goals

| Goal | Genetic Strategy |
|------|------------------|
| **High THC** | Select BT/BT genotypes |
| **High CBD** | Select BD/BD genotypes |
| **High CBG** | Select low-synthase plants |
| **Balanced ratios** | Cross THC and CBD lines |
| **Rare cannabinoids** | Select for specific pathways |

### The CBG Hemp Opportunity

| Observation | Application |
|-------------|-------------|
| **Some plants lack synthases** | CBGA accumulates instead |
| **"CBG hemp" strains** | Bred for high CBG content |
| **Harvest timing** | Early harvest preserves CBG |

---

## Biotechnology Applications

### Biosynthetic Cannabinoid Production

| Method | Approach |
|--------|----------|
| **Yeast fermentation** | Engineered yeast produce cannabinoids |
| **Bacterial production** | E. coli with cannabis genes |
| **Cell culture** | Cannabis cells in bioreactors |
| **Advantages** | Consistent, scalable, no farming |

### Current Status

| Application | Status |
|-------------|--------|
| **Research cannabinoids** | Available |
| **Pharmaceutical production** | In development |
| **Consumer products** | Not yet mainstream |
| **Rare cannabinoids** | Best application |

---

## Related Articles

- [What Are Cannabinoids?](/articles/what-are-cannabinoids) - Complete cannabinoid overview
- [What Is CBG?](/articles/what-is-cbg) - The mother cannabinoid
- [What Is THCA?](/articles/what-is-thca) - The raw form of THC
- [What Is CBDA?](/articles/what-is-cbda) - The raw form of CBD

---

## Frequently Asked Questions

### Why does cannabis make cannabinoids?

Plants likely produce cannabinoids for defense—protecting against UV radiation, pests, and pathogens. Cannabinoids are made in trichomes, sticky structures that also physically deter herbivores. The fact that cannabinoids affect human receptors is coincidental to their plant functions.

### Why cant a plant be high in both THC and CBD?

Most plants have a single gene copy determining their dominant synthase. The BT allele makes THCA synthase (THC); the BD allele makes CBDA synthase (CBD). Plants need both alleles (BT/BD heterozygotes) to produce significant amounts of both cannabinoids.

### What is CBG and why is it called the mother cannabinoid?

[CBG](/glossary/cannabigerol) (cannabigerol) is the neutral form of CBGA, the precursor that all other cannabinoids come from. CBGA is converted to THCA, CBDA, or CBCA by different enzymes. CBG is "left over" when not all CBGA gets converted.

### Can you make cannabinoids without plants?

Yes. Researchers have engineered yeast and bacteria to produce cannabinoids using the same biosynthetic genes from cannabis. This "biosynthetic" production can make rare cannabinoids that are difficult to extract from plants in meaningful quantities.

### Why is fresh cannabis different from dried cannabis?

Fresh cannabis contains acidic cannabinoids (THCA, CBDA) that don't produce intoxication or many of the effects associated with heated cannabis. Drying and aging partially decarboxylate these acids, and heating completes the conversion to active forms.

---

*Educational Note: This article explains plant biochemistry for educational purposes. Understanding biosynthesis helps explain why different cannabis varieties have different cannabinoid profiles.*

---

### References

1. Taura F, et al. Cannabidiolic-acid synthase, the chemotype-determining enzyme in the fiber-type Cannabis sativa. *FEBS Lett*. 2007;581(16):2929-2934.

2. Sirikantaramas S, et al. Tetrahydrocannabinolic acid synthase, the enzyme controlling marijuana psychoactivity, is secreted into the storage cavity of the glandular trichomes. *Plant Cell Physiol*. 2005;46(9):1578-1582.

3. de Meijer EP, et al. The inheritance of chemical phenotype in Cannabis sativa L. *Genetics*. 2003;163(1):335-346.

4. Luo X, et al. Complete biosynthesis of cannabinoids and their unnatural analogues in yeast. *Nature*. 2019;567(7746):123-126.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'Cannabinoid Biosynthesis: How Cannabis Makes Cannabinoids',
    slug: 'cannabinoid-biosynthesis',
    excerpt: 'Learn how cannabis plants produce cannabinoids. Understand the CBGA pathway, why strains vary in THC vs CBD content, and how decarboxylation converts acids to active forms.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 10,
    meta_title: 'Cannabinoid Biosynthesis: How Cannabis Produces THC, CBD & CBG',
    meta_description: 'Understand how cannabis plants make cannabinoids. Learn about the CBGA precursor, synthase enzymes, and why different strains have different cannabinoid profiles.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Cannabinoid Biosynthesis article inserted:', data.slug);
}
main();
