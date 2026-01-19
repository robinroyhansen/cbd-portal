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

**[CBD](/glossary/cannabidiol) itself does not cause positive drug tests**—standard tests look for [THC](/glossary/tetrahydrocannabinol) metabolites, not CBD. However, [full spectrum](/glossary/full-spectrum) CBD products contain up to 0.3% THC, which can accumulate with regular use and trigger a positive result. [Broad spectrum](/glossary/broad-spectrum) and [isolate](/glossary/cbd-isolate) products have lower risk but aren't guaranteed drug-test safe due to labeling inaccuracies and cross-contamination.

---

## What Drug Tests Actually Detect

Standard cannabis drug tests don't look for CBD—they detect THC and its metabolites.

### Drug Test Targets

| Test Type | What It Detects |
|-----------|-----------------|
| **Urine (most common)** | THC-COOH metabolite |
| **Blood** | Active THC and metabolites |
| **Saliva** | THC (recent use) |
| **Hair** | THC-COOH (long-term use) |

### Standard Cutoff Levels

| Test | Initial Screen Cutoff | Confirmation Cutoff |
|------|----------------------|---------------------|
| **Urine (SAMHSA)** | 50 ng/mL | 15 ng/mL |
| **Urine (DOT)** | 50 ng/mL | 15 ng/mL |
| **Blood** | Varies | 1-5 ng/mL |
| **Saliva** | 4 ng/mL | 2 ng/mL |
| **Hair** | 1 pg/mg | 0.1 pg/mg |

---

## Why CBD Products Can Cause Positive Tests

### THC in Legal CBD Products

Even "legal" CBD products contain THC:

| Product Type | THC Content | Drug Test Risk |
|--------------|-------------|----------------|
| **[Full spectrum](/glossary/full-spectrum)** | Up to 0.3% | Higher |
| **[Broad spectrum](/glossary/broad-spectrum)** | "THC-free" (often trace) | Lower |
| **[CBD isolate](/glossary/cbd-isolate)** | Should be 0% | Lowest |

### The Math on Full Spectrum

| Scenario | Calculation |
|----------|-------------|
| **Product potency** | 1000mg CBD oil with 0.3% THC = ~3mg THC |
| **Daily dose** | 50mg CBD = 0.15mg THC |
| **30 days** | 4.5mg THC accumulated |
| **Metabolite storage** | Fat-soluble, builds up |

### THC Accumulation Factors

| Factor | Impact on Detection |
|--------|---------------------|
| **Daily dose** | Higher dose = more THC |
| **Duration of use** | Longer use = more accumulation |
| **Body fat** | More fat = longer storage |
| **Metabolism** | Slower = longer detection |
| **Product quality** | May contain more THC than labeled |

---

## Product Type Risk Comparison

### Full Spectrum CBD

| Risk Factor | Assessment |
|-------------|------------|
| **THC content** | Up to 0.3% (legal limit) |
| **Regular use** | Can cause positive tests |
| **High doses** | Increased risk |
| **Recommendation** | Avoid if drug tested |

### Broad Spectrum CBD

| Risk Factor | Assessment |
|-------------|------------|
| **THC content** | Should be non-detectable |
| **Label accuracy** | Often contains trace THC |
| **Third-party testing** | Essential to verify |
| **Recommendation** | Lower risk, not zero |

### CBD Isolate

| Risk Factor | Assessment |
|-------------|------------|
| **THC content** | Should be 0% |
| **Purity** | 99%+ pure CBD |
| **Cross-contamination** | Possible in production |
| **Recommendation** | Lowest risk option |

---

## Labeling Problems

### Why Labels Can't Be Trusted

| Issue | Reality |
|-------|---------|
| **"THC-free" claims** | Often contains trace THC |
| **Inaccurate testing** | Some COAs are unreliable |
| **Batch variation** | Different batches vary |
| **Contamination** | Manufacturing cross-contamination |

### Case Studies

| Study Finding | Implication |
|---------------|-------------|
| **FDA testing** | Many products mislabeled |
| **Johns Hopkins study** | 1 in 5 "THC-free" products contained THC |
| **Hemp accumulation** | Legal hemp can exceed 0.3% THC |

---

## How Long THC Stays in Your System

### Detection Windows

| Test Type | Occasional User | Regular User | Heavy User |
|-----------|-----------------|--------------|------------|
| **Urine** | 3-4 days | 7-21 days | 30+ days |
| **Blood** | 1-2 days | 3-4 days | Up to 7 days |
| **Saliva** | 24-72 hours | 24-72 hours | Up to 72 hours |
| **Hair** | Up to 90 days | Up to 90 days | Up to 90 days |

### Factors Affecting Detection Time

| Factor | Effect |
|--------|--------|
| **Body mass index** | Higher BMI = longer detection |
| **Metabolism** | Faster = shorter detection |
| **Hydration** | Affects concentration |
| **Exercise** | Can release stored THC |
| **Frequency of use** | More frequent = longer |

---

## Who Gets Drug Tested?

### Common Drug Testing Scenarios

| Scenario | Testing Type | Strictness |
|----------|--------------|------------|
| **Employment (pre-hire)** | Urine, often 5-panel | Varies |
| **DOT/Transportation** | Federally mandated | Strict |
| **Military** | Regular testing | Very strict |
| **Athletics** | WADA/sport-specific | Varies |
| **Probation/Parole** | Court-ordered | Strict |
| **Medical licensing** | Professional boards | Varies |

### Federal vs. Private Testing

| Type | CBD Consideration |
|------|-------------------|
| **Federal employees** | Zero tolerance; avoid CBD |
| **DOT workers** | THC positive = career risk |
| **Private employers** | Policies vary widely |
| **Athletic orgs** | Some allow CBD, all ban THC |

---

## Strategies for Drug-Tested Individuals

### If You Must Use CBD

| Strategy | Implementation |
|----------|----------------|
| **Choose isolate** | Lowest THC risk |
| **Verify with COAs** | Check third-party tests |
| **Start early** | Test yourself first |
| **Keep documentation** | COAs and receipts |
| **Know your test date** | Plan accordingly |

### What to Avoid

| Product | Reason |
|---------|--------|
| **Full spectrum anything** | Too much THC risk |
| **Unknown brands** | Quality uncertainty |
| **Vape products** | Often mislabeled |
| **Hemp flower** | THC content variable |
| **[Delta-8](/glossary/delta-8-thc)** | Will cause positive |

### If You Test Positive

| Step | Action |
|------|--------|
| **Request confirmation test** | GC-MS is more accurate |
| **Document CBD use** | Show products, COAs |
| **Know your rights** | Varies by employer/state |
| **Consult attorney** | For employment consequences |

---

## The Confirmation Test

### Two-Stage Testing Process

| Stage | Method | Purpose |
|-------|--------|---------|
| **Initial screen** | Immunoassay | Fast, less specific |
| **Confirmation** | GC-MS or LC-MS/MS | Precise identification |

### Why Confirmation Matters

| Factor | Explanation |
|--------|-------------|
| **False positives** | Screen tests can cross-react |
| **CBD doesn't trigger** | Pure CBD won't cause positive |
| **THC metabolites** | Confirmation identifies specific compounds |
| **Legal protection** | More defensible results |

---

## Special Considerations

### Athletes

| Organization | CBD Policy | THC Policy |
|--------------|------------|------------|
| **WADA** | CBD removed from banned list | THC banned (150 ng/mL threshold) |
| **NFL** | No CBD ban | THC tested (35 ng/mL) |
| **NBA** | Stopped testing for cannabis | N/A |
| **Olympics** | CBD allowed | THC banned |

### Military

| Branch | Policy |
|--------|--------|
| **All branches** | CBD products prohibited |
| **Reasoning** | THC contamination risk |
| **Consequences** | Disciplinary action |

### Truck Drivers/DOT

| Requirement | Detail |
|-------------|--------|
| **Federal mandate** | All CDL holders tested |
| **Positive result** | License suspension |
| **CBD use** | Not recommended due to THC risk |

---

## Related Articles

- [Full Spectrum vs. Broad Spectrum vs. Isolate](/articles/spectrum-comparison) - Product type differences
- [Hemp vs. Marijuana](/articles/hemp-vs-marijuana) - Understanding THC content
- [What Is CBD?](/articles/what-is-cbd) - Complete CBD overview

---

## Frequently Asked Questions

### Will CBD show up on a drug test?

CBD itself doesn't—tests look for THC. However, CBD products containing THC (full spectrum) can cause positive results. Even "THC-free" products may contain trace amounts that accumulate.

### Can I fail a drug test from CBD gummies?

Yes, if they contain THC. Many CBD gummies are full spectrum (up to 0.3% THC). Regular use of high-dose gummies can accumulate enough THC metabolites to trigger a positive test.

### How long should I stop CBD before a drug test?

There's no guaranteed safe window. THC from full spectrum CBD can be detected for 30+ days in regular users. For isolate products, shorter periods may suffice, but individual variation is significant.

### Is broad spectrum CBD safe for drug tests?

Safer than full spectrum, but not guaranteed. "Broad spectrum" isn't regulated—many products contain trace THC despite claims. Always verify with third-party COAs and consider personal testing first.

### What should I do if I test positive from CBD?

Request a GC-MS confirmation test. Document your CBD use with COAs and receipts. Consult with the testing entity about their policies. Consider speaking with an attorney if employment is affected.

### Are there CBD products guaranteed not to cause positive tests?

No product is 100% guaranteed. CBD isolate from reputable brands with verified COAs has the lowest risk. Manufacturing cross-contamination, labeling errors, and individual metabolism create unavoidable uncertainty.

---

*Legal Disclaimer: This article is for educational purposes only. Drug testing policies vary by employer, state, and situation. This is not legal or medical advice. Consult appropriate professionals for your specific circumstances.*

---

### References

1. Spindle TR, et al. Urinary Pharmacokinetic Profile of Cannabinoids Following Administration of Vaporized and Oral Cannabidiol and Vaporized CBD-Dominant Cannabis. *J Anal Toxicol*. 2020;44(2):109-125.

2. Vandrey R, et al. Cannabinoid Dose and Label Accuracy in Edible Medical Cannabis Products. *JAMA*. 2015;313(24):2491-2493.

3. Bonn-Miller MO, et al. Labeling Accuracy of Cannabidiol Extracts Sold Online. *JAMA*. 2017;318(17):1708-1709.

4. SAMHSA. Drug Testing Guidelines and Resources. Substance Abuse and Mental Health Services Administration. 2024.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'CBD and Drug Testing: Can You Fail a Test?',
    slug: 'cbd-drug-testing',
    excerpt: 'Learn whether CBD can cause a positive drug test. Understand THC in CBD products, detection windows, and strategies for drug-tested individuals.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 11,
    meta_title: 'CBD and Drug Testing: Will CBD Make You Fail?',
    meta_description: 'Can CBD cause a positive drug test? Understand THC in CBD products, detection windows, and which products are safest for drug-tested individuals.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('CBD Drug Testing article inserted:', data.slug);
}
main();
