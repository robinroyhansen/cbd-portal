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

**THCA (tetrahydrocannabinolic acid)** is the raw, non-intoxicating form of [THC](/glossary/tetrahydrocannabinol) found in fresh cannabis. THCA doesn't get you high—but when heated, it converts to psychoactive THC. Raw cannabis is nearly all THCA, not THC. THCA itself has anti-inflammatory and neuroprotective properties and is used in raw cannabis juicing and specialized products.

---

## What Is THCA?

THCA is the acidic precursor to THC. Living cannabis plants don't produce THC directly—they produce THCA. Only when cannabis is heated (smoking, vaping, cooking) does THCA become the intoxicating THC.

### THCA Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Tetrahydrocannabinolic acid |
| **Converts to** | THC (via heat/decarboxylation) |
| **Psychoactive** | No |
| **Fresh cannabis content** | Up to 25%+ in potent strains |
| **THC content in raw plant** | Near zero |
| **Conversion temperature** | ~105°C (220°F) |

---

## Why THCA Doesn't Get You High

THCA can't fit into [CB1 receptors](/glossary/cb1-receptor) properly due to its extra carboxyl group. This 3D shape difference prevents intoxication.

### THCA vs. THC Molecular Difference

| Property | THCA | THC |
|----------|------|-----|
| **Carboxyl group** | Present | Removed by heat |
| **CB1 binding** | Poor fit | Strong fit |
| **Psychoactive** | No | Yes |
| **Size** | Larger molecule | Smaller molecule |

---

## THCA Decarboxylation

Heat removes THCA's carboxyl group, converting it to THC.

### Conversion Methods

| Method | Temperature | Time |
|--------|-------------|------|
| **Smoking** | 600-900°C | Instant |
| **Vaping** | 180-220°C | Seconds |
| **Oven (edibles)** | 110°C (230°F) | 30-45 min |
| **Room temperature** | 20-25°C | Months (slow) |
| **Sunlight** | Variable | Weeks |

### Why "Potency" Labels Show THCA

Cannabis product labels show "Total THC" calculated as:
**Total THC = THC + (THCA × 0.877)**

The 0.877 factor accounts for mass lost when the carboxyl group is removed.

---

## Potential Benefits of THCA

THCA has therapeutic potential independent of its conversion to THC.

### Researched Applications

| Application | Evidence | Notes |
|-------------|----------|-------|
| **Anti-inflammatory** | Preclinical | COX-2 inhibition |
| **Neuroprotective** | Preclinical | Huntington's model benefits |
| **Anti-nausea** | Preclinical | Different mechanism than THC |
| **Anti-proliferative** | Preclinical | Prostate cancer research |
| **Anti-obesity** | Preclinical | May reduce fat accumulation |

### THCA vs. THC Therapeutic Profile

| Property | THCA | THC |
|----------|------|-----|
| **Anti-inflammatory** | Strong | Moderate |
| **Neuroprotective** | Yes | Yes |
| **Psychoactive side effects** | None | Significant |
| **Can drive/work** | Yes | No |
| **Drug test** | May trigger | Will trigger |

---

## THCA Products and Uses

### How People Use THCA

| Method | Purpose |
|--------|---------|
| **Raw cannabis juice** | Therapeutic without high |
| **THCA tinctures** | Sublingual, no intoxication |
| **THCA diamonds** | Concentrated crystalline form |
| **Fresh plant material** | Juicing, smoothies |
| **THCA capsules** | Standardized dosing |

### THCA Diamonds

THCA can be extracted as crystalline "diamonds"—the purest form of any cannabinoid. These are typically:
- 95-99% pure THCA
- Non-intoxicating until heated
- Extremely potent when vaped (converts to THC)

---

## THCA Legal Status

THCA's legality is complicated.

### Legal Considerations

| Factor | Status |
|--------|--------|
| **Hemp-derived THCA** | Arguably legal (not THC) |
| **Converts to THC** | Creates enforcement issues |
| **Loophole products** | "THCA flower" marketed as legal |
| **State interpretations** | Vary widely |
| **Federal position** | Ambiguous |

### The THCA Loophole

Some vendors sell high-THCA hemp flower as "legal" because:
- The plant contains THCA, not THC
- THCA isn't explicitly scheduled
- Only Delta-9-THC is federally prohibited

**However:** When heated, this product becomes regular THC cannabis. Many states are closing this loophole.

---

## THCA and Drug Tests

### Will THCA Trigger a Drug Test?

| Scenario | Risk |
|----------|------|
| **Raw THCA consumed** | Possibly (may metabolize to THC-COOH) |
| **THCA heated before consumption** | Yes (now THC) |
| **High-dose raw THCA** | Higher risk |

Even unheated THCA may convert to THC in the body or trigger cross-reactive immunoassays.

---

## Related Articles

- [What Is THC?](/articles/what-is-thc) - THCA's decarboxylated form
- [What Is CBDA?](/articles/what-is-cbda) - CBD's acidic precursor
- [What Are Cannabinoids?](/articles/what-are-cannabinoids) - Complete overview

---

## Frequently Asked Questions

### Does THCA get you high?

No. THCA doesn't effectively bind to CB1 receptors due to its molecular shape. Only when heated and converted to THC does it become psychoactive.

### Is THCA the same as THC?

No. THCA is THC's acidic precursor. They're different molecules with different effects. THCA is non-intoxicating; THC is psychoactive. Heat converts THCA to THC.

### Is THCA legal?

It's complicated. THCA isn't explicitly scheduled federally, but it converts to THC when heated. Some states consider THCA products legal; others have banned them. The DEA's position is ambiguous. High-THCA products are in a legal gray area.

### Can I fail a drug test from THCA?

Possibly. Even raw THCA may convert to THC metabolites in your body or cross-react with drug test antibodies. If you're drug tested, avoid THCA products.

### What's the point of THCA if I can't get high?

THCA has therapeutic benefits without intoxication—useful for people who want anti-inflammatory or neuroprotective effects while remaining clear-headed and able to work or drive.

---

*Medical Disclaimer: This article is for educational purposes only. THCA's legal status is complex. Consult legal counsel and healthcare professionals before use.*

---

### References

1. Moreno-Sanz G. Can you pass the acid test? Critical review and novel therapeutic perspectives of THCA. *Cannabis Cannabinoid Res*. 2016;1(1):124-130.

2. Nadal X, et al. Tetrahydrocannabinolic acid is a potent PPARgamma agonist with neuroprotective activity. *Br J Pharmacol*. 2017;174(23):4263-4276.

3. Rock EM, et al. Tetrahydrocannabinolic acid reduces nausea-induced conditioned gaping in rats. *Psychopharmacology*. 2013;231(3):679-687.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What Is THCA? The Non-Psychoactive Precursor to THC',
    slug: 'what-is-thca',
    excerpt: 'Learn about THCA—the raw form of THC that doesn\'t get you high. Discover its therapeutic benefits, how it converts to THC, and its complex legal status.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 8,
    meta_title: 'What Is THCA? Benefits, Legality & Decarboxylation Explained',
    meta_description: 'Understand THCA, the non-psychoactive precursor to THC. Learn how it converts to THC, its therapeutic potential, and legal considerations.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('THCA article inserted:', data.slug);
}
main();
