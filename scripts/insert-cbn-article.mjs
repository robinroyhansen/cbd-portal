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

**[CBN](/glossary/cannabinol) (cannabinol)** is a mildly psychoactive cannabinoid formed when [THC](/glossary/tetrahydrocannabinol) ages and oxidizes. Often marketed as the "sleepy cannabinoid," CBN's sedative reputation is largely anecdotal—research is limited. CBN is found in aged cannabis and is increasingly available in sleep-focused products. It's non-intoxicating at typical doses and legal when derived from hemp.

---

## What Is CBN?

CBN (cannabinol) is a minor [cannabinoid](/glossary/cannabinoid-profile) that forms as THC degrades over time through exposure to heat, light, and oxygen. It was actually the first cannabinoid isolated from cannabis in 1896, though its structure wasn't determined until 1940.

### CBN Quick Facts

| Property | Detail |
|----------|--------|
| **Full name** | Cannabinol |
| **Chemical formula** | C21H26O2 |
| **Discovery** | 1896 (isolated), 1940 (structure) |
| **Psychoactive** | Mildly (about 10% of THC's potency) |
| **Source** | Degraded/aged THC |
| **Fresh cannabis content** | Very low (<1%) |
| **Aged cannabis content** | Can reach 5%+ |

---

## How CBN Forms

CBN isn't produced directly by the cannabis plant—it's a degradation product of THC.

### The THC-to-CBN Pathway

| Stage | Process |
|-------|---------|
| 1 | Cannabis plant produces THCA |
| 2 | Heat converts THCA to THC |
| 3 | Time + oxygen + light degrade THC |
| 4 | THC oxidizes into CBN |

### Factors That Increase CBN

| Factor | Effect |
|--------|--------|
| **Age** | Older cannabis has more CBN |
| **Light exposure** | UV light accelerates degradation |
| **Heat** | Warmth speeds conversion |
| **Oxygen** | Air exposure is essential |
| **Poor storage** | Improper storage increases CBN |

This is why properly stored cannabis stays potent (low CBN), while old or poorly stored cannabis becomes less intoxicating but higher in CBN.

---

## How CBN Works

CBN has a unique pharmacological profile, interacting weakly with cannabinoid receptors.

### CBN Receptor Interactions

| Target | CBN Action | Comparison to THC |
|--------|------------|-------------------|
| **[CB1 receptors](/glossary/cb1-receptor)** | Weak partial agonist | ~10% of THC's affinity |
| **[CB2 receptors](/glossary/cb2-receptor)** | Weak partial agonist | Similar to CB1 |
| **[TRPV2](/glossary/trpv1-receptor)** | Agonist | Unique to CBN |
| **Other targets** | Being researched | Less characterized |

### Why CBN Is Only Mildly Psychoactive

| Factor | Explanation |
|--------|-------------|
| **Low CB1 affinity** | Weak binding = weak intoxication |
| **Partial agonist** | Doesn't fully activate receptors |
| **Typical doses** | Products contain low amounts |

At very high doses, CBN could theoretically cause mild intoxication, but typical product doses don't produce noticeable psychoactive effects.

---

## CBN and Sleep: Separating Fact from Marketing

CBN is heavily marketed as a sleep aid, but the evidence is surprisingly thin.

### The Sleep Claim

| What's Claimed | What's Known |
|----------------|--------------|
| "CBN is sedating" | Limited scientific evidence |
| "CBN is the sleepy cannabinoid" | Marketing term, not research-based |
| "CBN helps you sleep" | Anecdotal reports; few studies |

### The Actual Research

| Study Type | Findings |
|------------|----------|
| **Human studies** | Almost none specifically on CBN for sleep |
| **1975 study** | THC + CBN was sedating; CBN alone was not |
| **Anecdotal reports** | Many users report drowsiness |
| **Aged cannabis effect** | May be due to terpene changes, not just CBN |

### Why the Sedation Myth Persists

| Theory | Explanation |
|--------|-------------|
| **Aged cannabis is sedating** | Old weed makes people sleepy |
| **Correlation vs. causation** | Old cannabis has more CBN AND more sedating terpenes |
| **Myrcene increases** | This terpene may be responsible |
| **Placebo effect** | Expectation influences experience |

### The Honest Assessment

CBN may contribute to sedation, but:
- Direct evidence is weak
- Other factors in aged cannabis likely contribute
- More research is needed
- Many users do report benefit (anecdotally)

---

## Potential Benefits of CBN

Beyond sleep, CBN has been researched for other applications.

### Researched Applications

| Application | Evidence Level | Notes |
|-------------|----------------|-------|
| **Antibacterial** | Preclinical | Active against MRSA |
| **Anti-inflammatory** | Preclinical | Reduces inflammation markers |
| **Appetite stimulation** | Preclinical (animal) | Increased food intake in rats |
| **Pain relief** | Preclinical | May work through different pathway than THC |
| **Neuroprotection** | Preclinical | ALS model showed benefit |
| **Glaucoma** | Very limited | May reduce intraocular pressure |

### CBN and Appetite

Unlike [CBD](/glossary/cannabidiol) (which doesn't increase appetite), CBN may stimulate hunger:

| Finding | Source |
|---------|--------|
| CBN increased food consumption in rats | Farrimond et al., 2012 |
| Effect was significant | Appetite stimulant potential |
| Human studies | Lacking |

### CBN and Antibacterial Activity

Like [CBG](/glossary/cannabigerol), CBN shows antibacterial properties:

| Finding | Detail |
|---------|--------|
| Active against MRSA | Appendino et al., 2008 |
| Topical potential | May be useful in creams |
| Mechanism | Not fully understood |

---

## CBN vs. Other Cannabinoids

### Comparison Table

| Property | CBN | CBD | THC | CBG |
|----------|-----|-----|-----|-----|
| **Psychoactive** | Mildly | No | Yes | No |
| **Source** | Degraded THC | Plant-produced | Plant-produced | Plant-produced |
| **Abundance** | Low (unless aged) | High | High | Low |
| **CB1 binding** | Weak | Very weak | Strong | Weak |
| **Sleep marketing** | Heavy | Moderate | Yes | Minimal |
| **Research level** | Limited | Extensive | Extensive | Emerging |

### CBN vs. CBD for Sleep

| Factor | CBN | CBD |
|--------|-----|-----|
| **Direct sedation claim** | Marketed heavily | Not typically |
| **Research support** | Minimal | More studies |
| **How it may help sleep** | Unknown mechanism | Anxiety/pain reduction |
| **Typical dose** | 5-25mg | 25-100mg |

---

## CBN Products

CBN is increasingly available in sleep-focused products.

### Product Types

| Type | Description | Typical CBN Content |
|------|-------------|---------------------|
| **CBN oils** | Tinctures for sublingual use | 150-500mg per bottle |
| **CBN + CBD oils** | Combination products | Varies |
| **CBN gummies** | Sleep gummies | 5-25mg per gummy |
| **CBN capsules** | Sleep supplements | 10-25mg per capsule |
| **CBN isolate** | Pure CBN powder | 99%+ |

### What to Look For

| Factor | Why It Matters |
|--------|----------------|
| **Third-party testing** | Verify CBN content |
| **THC content** | Should be <0.3% |
| **Other cannabinoids** | Combination may be better |
| **Terpene content** | May contribute to effects |

---

## CBN Dosage

No established CBN dosing exists due to limited research.

### General Guidelines

| Purpose | Suggested Starting Dose |
|---------|------------------------|
| **Sleep** | 5-10mg |
| **General use** | 5-15mg |
| **Combined with CBD** | 5mg CBN + 25mg CBD |

### Dosing Tips

| Tip | Reason |
|-----|--------|
| **Start low** | Effects are not well characterized |
| **Try at bedtime** | If using for sleep |
| **Combine with CBD** | May enhance effects |
| **Be patient** | May take several nights |

---

## CBN Safety

CBN appears safe based on limited data, but research is minimal.

### Safety Profile

| Aspect | Assessment |
|--------|------------|
| **Acute toxicity** | Not reported |
| **Serious side effects** | Not reported |
| **Mild side effects** | Drowsiness, grogginess possible |
| **Drug interactions** | Likely similar to other cannabinoids |
| **Long-term safety** | Unknown |

### Potential Side Effects

| Side Effect | Notes |
|-------------|-------|
| **Drowsiness** | Expected if sedating |
| **Grogginess** | Morning after effects possible |
| **Dry mouth** | Common with cannabinoids |

---

## Is CBN Legal?

CBN exists in a similar legal space to other hemp cannabinoids.

### Legal Status

| Jurisdiction | Status |
|--------------|--------|
| **US Federal** | Legal if from hemp (<0.3% THC) |
| **US States** | Most allow; some restrictions |
| **International** | Varies by country |

### Legal Considerations

| Factor | Detail |
|--------|--------|
| **Hemp-derived** | Legal under 2018 Farm Bill |
| **THC content** | Product must be <0.3% THC |
| **Not scheduled** | CBN itself is not a controlled substance |

---

## Related Articles

- [What Are Cannabinoids?](/articles/what-are-cannabinoids) - Overview of all cannabinoids
- [What Is THC?](/articles/what-is-thc) - CBN's precursor
- [What Is CBD?](/articles/what-is-cbd) - Often combined with CBN
- [What Is CBG?](/articles/what-is-cbg) - Another minor cannabinoid

---

## Frequently Asked Questions

### Does CBN actually help with sleep?

The evidence is weak. While [CBN](/glossary/cannabinol) is heavily marketed as a sleep aid, there's very little scientific research supporting this claim. A 1975 study found THC + CBN was sedating, but CBN alone was not. Many users report benefit anecdotally, which may be real or may be placebo effect.

### Will CBN get me high?

At typical product doses (5-25mg), no. CBN is about 10% as potent as [THC](/glossary/tetrahydrocannabinol) at CB1 receptors. You'd need very high doses to experience noticeable psychoactive effects. Most CBN products won't cause intoxication.

### Why is old cannabis more sedating?

Old cannabis has more CBN, but that's not the whole story. Aging also changes terpene profiles—sedating terpenes like [myrcene](/glossary/myrcene) may increase relative to stimulating terpenes. The "CBN = sleep" claim may actually be a "aged cannabis terpene profile = sleep" effect.

### Is CBN the same as CBD?

No. [CBN](/glossary/cannabinol) is formed from degraded THC and has weak psychoactive potential. [CBD](/glossary/cannabidiol) is produced directly by the plant and is completely non-psychoactive. They have different receptor profiles and different research bases. CBD has FDA approval for seizures; CBN has no approved medical uses.

### Can I make my own CBN by aging cannabis?

Technically yes—old cannabis naturally converts THC to CBN. However, this also degrades other beneficial compounds and changes terpene profiles in unpredictable ways. Commercial CBN products offer consistent, measured doses that aged cannabis cannot provide.

### Is CBN legal?

Yes, when derived from hemp containing less than 0.3% THC. CBN itself is not a controlled substance. However, some states have specific cannabinoid restrictions, so check local laws.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. CBN research is very limited, and claims about sleep benefits are largely anecdotal. CBN is not FDA-approved for any medical condition. Consult a healthcare professional before using CBN products, especially for sleep issues.*

---

### References

1. Wood TB, Spivey WTN, Easterfield TH. Cannabinol. Part I. *J Chem Soc*. 1899;75:20-36.

2. Karniol IG, et al. Effects of delta-9-THC and cannabinol in man. *Pharmacology*. 1975;13(6):502-512.

3. Appendino G, et al. Antibacterial cannabinoids from Cannabis sativa. *J Nat Prod*. 2008;71(8):1427-1430.

4. Farrimond JA, et al. Cannabinol and cannabidiol exert opposing effects on rat feeding patterns. *Psychopharmacology*. 2012;223(1):117-129.

5. Weydt P, et al. Cannabinol delays symptom onset in SOD1 (G93A) transgenic mice. *Amyotroph Lateral Scler Other Motor Neuron Disord*. 2005;6(3):182-184.`;

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
      title: 'What Is CBN? The "Sleepy Cannabinoid" Explained',
      slug: 'what-is-cbn',
      excerpt: 'Learn about CBN (cannabinol)—the cannabinoid formed from aged THC. Discover the truth about CBN\'s sleep claims and what research actually shows.',
      content: content,
      status: 'published',
      featured: false,
      article_type: 'science',
      category_id: category.id,
      reading_time: 10,
      meta_title: 'What Is CBN (Cannabinol)? Sleep Benefits, Research & Facts',
      meta_description: 'Understand CBN, the cannabinoid from aged THC marketed for sleep. Learn what research actually shows about CBN\'s sedative claims and how it compares to CBD.',
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
    console.log('URL: /articles/' + data.slug);
  }
}

main();
