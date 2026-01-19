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

**Hemp and marijuana are the same plant species** (*Cannabis sativa*), distinguished only by their [THC](/glossary/tetrahydrocannabinol) content. Legally, hemp contains <0.3% THC; marijuana contains more. Hemp won't get you high and is federally legal in the US (2018 Farm Bill). [CBD](/glossary/cannabidiol) products are typically made from hemp. The terms describe legal/functional categories, not botanical subspecies.

---

## The Same Plant, Different Rules

Hemp and marijuana aren't different species—they're the same plant (*Cannabis sativa* L.) with different THC concentrations.

### The Legal Definition

| Category | THC Content | Legal Status (US) |
|----------|-------------|-------------------|
| **Hemp** | <0.3% THC (dry weight) | Federally legal (2018) |
| **Marijuana** | >0.3% THC | Federally illegal (Schedule I) |

### Why 0.3%?

The 0.3% threshold comes from a 1976 study by taxonomist Ernest Small—it was somewhat arbitrary but became the legal standard. Plants at 0.4% vs 0.2% are chemically similar but legally different.

---

## Key Differences

### Chemical Composition

| Compound | Hemp | Marijuana |
|----------|------|-----------|
| **THC** | <0.3% | 5-30% |
| **[THCA](/glossary/thca)** | Low | High |
| **[CBD](/glossary/cannabidiol)** | Often 10-20% | Variable (often lower) |
| **[CBDA](/glossary/cbda)** | High | Variable |
| **Other cannabinoids** | Present | Present |
| **[Terpenes](/glossary/terpenes)** | Full profile | Full profile |

### Physical Characteristics

| Feature | Hemp | Marijuana |
|---------|------|-----------|
| **Height** | Often taller (up to 15ft) | Shorter, bushier |
| **Leaves** | Thinner, concentrated at top | Broader, denser |
| **Flowers** | Smaller, less resinous | Large, resinous buds |
| **Growing** | Densely planted | Spaced for airflow |
| **Cultivation focus** | Fiber, seeds, CBD | Flowers, resin |

### Uses

| Use | Hemp | Marijuana |
|-----|------|-----------|
| **Fiber** | Yes (rope, textiles, paper) | No |
| **Seeds** | Yes (food, oil) | No |
| **CBD extraction** | Primary source | Possible |
| **THC extraction** | Not viable | Yes |
| **Recreation** | Won't intoxicate | Intoxicating |
| **Building materials** | Hempcrete, insulation | No |

---

## Legal Status

### United States

| Category | Federal | States |
|----------|---------|--------|
| **Hemp (<0.3% THC)** | Legal (2018 Farm Bill) | Legal in most |
| **Hemp-derived CBD** | Legal | Varies by state |
| **Marijuana** | Schedule I (illegal) | Legal in ~24 states |
| **Medical marijuana** | Not recognized | Legal in ~38 states |

### 2018 Farm Bill

The Agricultural Improvement Act of 2018:
- Removed hemp from Controlled Substances Act
- Defined hemp as cannabis with <0.3% THC
- Allowed hemp cultivation with state/USDA approval
- Made hemp-derived [cannabinoids](/glossary/cannabinoid-profile) legal (including CBD)

### Important Exceptions

| Product | Status |
|---------|--------|
| **Hemp-derived CBD** | Federally legal, FDA-regulated |
| **Hemp-derived [Delta-8](/glossary/delta-8-thc)** | Gray area (some states ban) |
| **Smokable hemp flower** | Banned in some states |
| **CBD in food/drinks** | FDA says not allowed |

---

## The Same [Endocannabinoid System](/glossary/endocannabinoid-system)

Both hemp and marijuana cannabinoids interact with the same receptors:

| Receptor | Response |
|----------|----------|
| **[CB1](/glossary/cb1-receptor)** | THC activates; CBD modulates |
| **[CB2](/glossary/cb2-receptor)** | Both have effects |
| **[TRPV1](/glossary/trpv1-receptor)** | CBD from either source |
| **[5-HT1A](/glossary/serotonin-receptors-5ht1a)** | CBD from either source |
| **[GPR55](/glossary/gpr55-receptor)** | CBD from either source |

**Key point:** CBD from hemp is chemically identical to CBD from marijuana. The source doesn't change the molecule.

---

## Why Hemp CBD?

### Advantages of Hemp-Derived CBD

| Factor | Hemp CBD | Marijuana CBD |
|--------|----------|---------------|
| **Federal legality** | Legal | Federally illegal |
| **THC content** | Minimal | May be significant |
| **Drug test risk** | Lower (still possible) | Higher |
| **Availability** | Nationwide | Dispensaries only |
| **[Full spectrum](/glossary/full-spectrum)** | Legal | Illegal federally |

### Potential Disadvantages

| Factor | Consideration |
|--------|---------------|
| **Less regulated** | Quality varies widely |
| **Bioaccumulator** | Hemp absorbs soil contaminants |
| **Lower cannabinoid diversity** | Some minor cannabinoids lower |
| **[Entourage effect](/glossary/entourage-effect)** | May be less pronounced |

---

## Common Misconceptions

### Myth vs. Reality

| Myth | Reality |
|------|---------|
| "Hemp and marijuana are different plants" | Same species (*Cannabis sativa* L.) |
| "Hemp CBD is weaker" | CBD molecule is identical |
| "Hemp is male, marijuana is female" | Both come from female plants |
| "Hemp can't get you high at all" | Trace THC + other cannabinoids can have effects |
| "All hemp is industrial" | Many strains bred for cannabinoids |

---

## Growing and Cultivation

### Hemp Cultivation

| Factor | Hemp | Marijuana |
|--------|------|-----------|
| **Spacing** | Dense (1,000+ plants/acre) | Wide (1 plant/4 sq ft) |
| **Environment** | Outdoor, large scale | Often indoor, controlled |
| **Purpose** | Fiber, seeds, cannabinoids | Flower/resin production |
| **THC monitoring** | Required for compliance | Not applicable |
| **Legal permits** | Required in most states | Dispensary licenses |

### Compliance Testing

Hemp farmers must test THC levels:

| Test Point | Requirement |
|------------|-------------|
| **Pre-harvest** | 15-30 days before harvest |
| **THC level** | Must be <0.3% |
| **"Hot" plants** | Must be destroyed if over limit |
| **Consequences** | License revocation possible |

---

## History

### Brief Timeline

| Era | Hemp/Cannabis Status |
|-----|---------------------|
| **Pre-1900s** | Hemp widely grown (ropes, textiles) |
| **1937** | Marihuana Tax Act (restricted all cannabis) |
| **1970** | Controlled Substances Act (Schedule I) |
| **2014** | Farm Bill allowed hemp research |
| **2018** | Farm Bill legalized hemp federally |

---

## Related Articles

- [What Is THC?](/articles/what-is-thc) - The psychoactive cannabinoid
- [What Is CBD?](/articles/what-is-cbd) - The non-intoxicating cannabinoid
- [Full Spectrum vs. Isolate](/articles/spectrum-comparison) - Product type comparison
- [CBD and Drug Testing](/articles/cbd-drug-testing) - What to know

---

## Frequently Asked Questions

### Can hemp get you high?

No. Legal hemp contains <0.3% THC, which is far too little to produce intoxication. You'd need to consume impossibly large amounts. However, hemp does contain other [cannabinoids](/glossary/cannabinoid-profile) that may have subtle effects.

### Is CBD from hemp the same as CBD from marijuana?

Yes. CBD is CBD—the molecule is identical regardless of source. Hemp-derived CBD is federally legal; marijuana-derived CBD is not. The difference is legal status and what else comes along (THC levels, other cannabinoids).

### Why is hemp legal but marijuana isn't?

The legal distinction is based on THC content (0.3% threshold). Hemp's low THC means it can't be abused as an intoxicant. The 2018 Farm Bill recognized hemp's industrial and wellness applications, removing it from the Controlled Substances Act.

### Can I fail a drug test from hemp CBD?

Possibly. [Full spectrum](/glossary/full-spectrum) hemp products contain trace THC (<0.3%), which can accumulate with regular use. [Broad spectrum](/glossary/broad-spectrum) or [isolate](/glossary/cbd-isolate) products have no or undetectable THC but aren't guaranteed drug-test safe. See our [CBD and Drug Testing](/articles/cbd-drug-testing) article.

### Is hemp better than marijuana for CBD?

Neither is inherently "better"—the CBD molecule is identical. Hemp CBD is more accessible (federally legal, widely available). Some argue marijuana plants produce more diverse cannabinoid profiles. For most consumers, hemp CBD meets their needs.

---

*Legal Disclaimer: This article discusses US federal law. State laws vary significantly. This is not legal advice. Consult local regulations and legal counsel for specific situations.*

---

### References

1. Agricultural Improvement Act of 2018 (2018 Farm Bill), Pub. L. No. 115-334.

2. Small E, Cronquist A. A practical and natural taxonomy for Cannabis. *Taxon*. 1976;25(4):405-435.

3. Congressional Research Service. Defining Hemp: A Fact Sheet. 2019.

4. Hudak J. The Farm Bill, hemp legalization and the status of CBD: An explainer. Brookings Institution. 2018.`;

async function main() {
  const { data: category } = await supabase.from('kb_categories').select('id').eq('slug', 'science').single();
  if (!category) return;
  const { data, error } = await supabase.from('kb_articles').insert({
    title: 'Hemp vs. Marijuana: What is the Difference?',
    slug: 'hemp-vs-marijuana',
    excerpt: 'Learn the difference between hemp and marijuana—the same plant species with different THC levels and legal status. Understand why CBD comes from hemp and what the 2018 Farm Bill changed.',
    content: content,
    status: 'published',
    featured: false,
    article_type: 'science',
    category_id: category.id,
    reading_time: 10,
    meta_title: 'Hemp vs Marijuana: Same Plant, Different Rules',
    meta_description: 'Understand the difference between hemp and marijuana. Same cannabis species, different THC levels, different legal status. Learn why CBD is made from hemp.',
    language: 'en',
    published_at: new Date().toISOString()
  }).select().single();
  if (error) console.error('Error:', error);
  else console.log('Hemp vs Marijuana article inserted:', data.slug);
}
main();
