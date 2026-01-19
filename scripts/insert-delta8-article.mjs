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

**Delta-8-THC** is a psychoactive cannabinoid that produces a milder high than regular [Delta-9-THC](/glossary/tetrahydrocannabinol). It occurs naturally in tiny amounts but is typically manufactured by converting [CBD](/glossary/cannabidiol) from hemp. Delta-8 exists in a legal gray area—technically derived from legal hemp, but psychoactive and increasingly banned by states. It will cause positive drug tests.

---

## What Is Delta-8-THC?

Delta-8-THC (delta-8-tetrahydrocannabinol) is an isomer of Delta-9-THC—same atoms, slightly different arrangement. The "8" refers to the location of a double bond in the molecule (8th carbon vs. 9th carbon in regular THC).

### Delta-8 Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Delta-8-tetrahydrocannabinol |
| **Relation to THC** | Isomer (same formula, different structure) |
| **Psychoactive** | Yes (milder than Delta-9) |
| **Natural occurrence** | <0.1% in cannabis |
| **Commercial source** | Converted from CBD |
| **Legal status** | Gray area (state bans increasing) |

---

## Delta-8 vs. Delta-9-THC

### Key Differences

| Property | Delta-8-THC | Delta-9-THC |
|----------|-------------|-------------|
| **Potency** | ~50-70% of Delta-9 | Full potency |
| **High quality** | Milder, clearer | Stronger, more intense |
| **Anxiety** | Less likely | Can cause |
| **Natural abundance** | <0.1% | Up to 30% |
| **Legal status** | Gray area | Schedule I (federally) |
| **Drug test** | Will cause positive | Will cause positive |
| **Paranoia** | Less common | More common |

### Why Delta-8 Is "THC Lite"

Users report Delta-8 produces:
- Milder intoxication
- Less anxiety/paranoia
- Clearer head
- Shorter duration
- Still noticeable impairment

---

## How Delta-8 Is Made

Delta-8 barely exists in nature, so commercial products are synthesized.

### The Conversion Process

| Step | Process |
|------|---------|
| 1 | Extract CBD from legal hemp |
| 2 | Dissolve CBD in acidic solution |
| 3 | Heat/treat to convert CBD to Delta-8 |
| 4 | Purify to remove byproducts |
| 5 | Test for contaminants |

### Concerns About Conversion

| Issue | Risk |
|-------|------|
| **Unregulated manufacturing** | Variable quality |
| **Unknown byproducts** | Potential contaminants |
| **No standardization** | Inconsistent potency |
| **Chemical residues** | Possible solvent contamination |

The FDA has warned about Delta-8 products due to quality control concerns.

---

## Delta-8 Legal Status

Delta-8's legality is complicated and evolving.

### The Legal Argument

| Pro-Legality | Anti-Legality |
|--------------|---------------|
| Derived from legal hemp | Psychoactive = should be controlled |
| Not Delta-9-THC | Intent matters (it's to get high) |
| 2018 Farm Bill doesn't ban it | Synthetically converted |
| Not explicitly scheduled | States banning it |

### State Bans (Partial List)

Many states have banned Delta-8:
- Alaska, Arizona, Arkansas, Colorado
- Delaware, Idaho, Iowa, Mississippi
- Montana, New York, Rhode Island, Utah
- Vermont, and others

**Always check current state law before purchasing.**

### DEA Position

The DEA's position is that synthetically derived THC isomers may be controlled substances, but enforcement is inconsistent.

---

## Delta-8 Safety Concerns

### FDA Warnings

The FDA has issued warnings about Delta-8:

| Concern | Detail |
|---------|--------|
| **Adverse events** | Increasing reports of hospitalizations |
| **Product variability** | Unlabeled and untested products |
| **Children's access** | Often sold as gummies/candy |
| **No quality standards** | No regulatory oversight |
| **Contamination risk** | Manufacturing concerns |

### Reported Side Effects

| Side Effect | Frequency |
|-------------|-----------|
| **Altered perception** | Expected (it's psychoactive) |
| **Impaired coordination** | Expected |
| **Anxiety** | Less than Delta-9, but possible |
| **Rapid heart rate** | Reported |
| **Confusion** | At high doses |
| **Vomiting** | Some reports |

---

## Delta-8 and Drug Tests

### Will Delta-8 Show on a Drug Test?

**Yes.** Standard drug tests detect THC metabolites, and Delta-8 produces the same metabolites as Delta-9-THC.

| Test Type | Delta-8 Detection |
|-----------|-------------------|
| **Urine** | Yes |
| **Blood** | Yes |
| **Saliva** | Yes |
| **Hair** | Yes |

There is no way to distinguish Delta-8 from Delta-9 on standard drug tests.

---

## Delta-8 Products

### Common Product Types

| Type | Notes |
|------|-------|
| **Vape cartridges** | Most common |
| **Gummies** | Popular, concerning for children |
| **Tinctures** | Sublingual oils |
| **Flower** | Hemp sprayed with Delta-8 |
| **Concentrates** | Dabs, waxes |
| **Edibles** | Various food products |

### Quality Considerations

| Factor | What to Look For |
|--------|------------------|
| **Third-party testing** | COA with potency and contaminants |
| **Conversion byproducts** | Should test for unknowns |
| **Heavy metals** | Must be tested |
| **Residual solvents** | Must be tested |
| **Accurate labeling** | Potency matches claims |

---

## Other THC Variants

Delta-8 opened the door to other synthesized cannabinoids.

| Variant | Psychoactive | Status |
|---------|--------------|--------|
| **Delta-8-THC** | Yes (mild) | Gray area |
| **Delta-10-THC** | Yes (mild) | Gray area |
| **THC-O-Acetate** | Yes (strong) | Likely illegal |
| **HHC** | Yes (mild) | Gray area |
| **THCP** | Yes (very strong) | Gray area |

---

## Related Articles

- [What Is THC?](/articles/what-is-thc) - The classic psychoactive cannabinoid
- [What Is CBD?](/articles/what-is-cbd) - The non-intoxicating cannabinoid
- [Full Spectrum vs. Isolate](/articles/spectrum-comparison) - Understanding product types

---

## Frequently Asked Questions

### Is Delta-8 natural?

Technically yes—Delta-8 exists naturally in cannabis, but only in trace amounts (<0.1%). Commercial Delta-8 products are synthesized from CBD through chemical conversion, making them effectively synthetic or "semi-synthetic."

### Will Delta-8 get me high?

Yes. Delta-8 is psychoactive and will cause intoxication, though typically milder than regular THC. It impairs driving, judgment, and coordination. Don't use before operating vehicles or machinery.

### Is Delta-8 legal?

It's complicated. Delta-8 from hemp may be federally legal under the 2018 Farm Bill's loophole, but many states have banned it explicitly. The DEA considers synthetically derived THC potentially controlled. Check your state's current laws.

### Can I fail a drug test from Delta-8?

Yes. Delta-8 produces the same metabolites as Delta-9-THC. Standard drug tests cannot distinguish between them. If you're drug tested, avoid Delta-8 products.

### Is Delta-8 safer than Delta-9?

Not necessarily. While users report fewer anxiety/paranoia effects, Delta-8 products are largely unregulated, may contain contaminants from conversion processes, and have triggered FDA warnings. The "milder" high doesn't mean safer.

### Why is Delta-8 being banned?

States ban Delta-8 because: (1) it's psychoactive and being used to get high, (2) it's sold in unregulated markets without quality control, (3) products are often marketed to appeal to children, (4) it exploits legal loopholes rather than going through proper regulation.

---

*Medical Disclaimer: This article is for educational purposes only. Delta-8-THC is psychoactive and potentially illegal in your jurisdiction. It will cause drug test failures. Consult legal counsel regarding local laws. This is not an endorsement of Delta-8 use.*

---

### References

1. FDA Consumer Update: 5 Things to Know about Delta-8 Tetrahydrocannabinol. U.S. Food and Drug Administration. 2021.

2. Tagen M, Klumpers LE. Review of delta-8-tetrahydrocannabinol: Comparative pharmacology with delta-9-THC. *Br J Pharmacol*. 2022;179(15):3915-3933.

3. LoParco CR, et al. Delta-8-THC: The rise of a legal, psychoactive cannabinoid. *Subst Abuse Treat Prev Policy*. 2023;18(1):22.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'What Is Delta-8-THC? The Legal Gray Area Cannabinoid',
    slug: 'what-is-delta-8-thc',
    excerpt: 'Learn about Delta-8-THC—the milder THC variant in a legal gray area. Understand how it\'s made, its effects, safety concerns, and why states are banning it.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 9,
    meta_title: 'What Is Delta-8-THC? Effects, Legality & Safety Concerns',
    meta_description: 'Understand Delta-8-THC: how it differs from regular THC, its legal status, safety concerns, and why it shows up on drug tests.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Delta-8 article inserted:', data.slug);
}
main();
