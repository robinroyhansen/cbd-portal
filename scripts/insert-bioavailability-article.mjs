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

[Bioavailability](/glossary/bioavailability) measures how much [CBD](/glossary/cannabidiol) actually reaches your bloodstream. Standard CBD oil has only 6-20% bioavailability—meaning most of what you take never gets absorbed. Delivery method matters dramatically: sublingual oils (13-35%), vaping (34-56%), and nanoemulsion products (up to 50%) all outperform swallowed capsules (6-15%). Taking CBD with fatty foods can boost absorption by up to 5x.

---

## What Is Bioavailability?

Bioavailability is the percentage of a substance that reaches your systemic circulation (bloodstream) and becomes available for your body to use.

If a CBD product has 20% bioavailability, taking 100mg means only 20mg actually enters your bloodstream. The rest is lost to:
- First-pass metabolism in the liver
- Poor absorption in the gut
- Degradation in the digestive system

### Why Bioavailability Matters

| With low bioavailability... | With high bioavailability... |
|-----------------------------|------------------------------|
| Need higher doses | Lower doses work |
| Costs more per effective dose | More cost-effective |
| More product wasted | Less product wasted |
| Inconsistent effects | More predictable effects |

---

## CBD Bioavailability by Delivery Method

Different consumption methods produce dramatically different absorption rates.

### Bioavailability Comparison Table

| Delivery Method | Bioavailability | Onset Time | Duration |
|-----------------|-----------------|------------|----------|
| **Inhalation** (vaping, smoking) | 34-56% | 1-3 minutes | 2-3 hours |
| **Sublingual** (under tongue) | 13-35% | 15-30 minutes | 4-6 hours |
| **Oral** (swallowed) | 6-15% | 60-90 minutes | 6-8 hours |
| **Oral with fats** | 15-30% | 45-90 minutes | 6-8 hours |
| **Nanoemulsion** | 30-50% | 10-20 minutes | 4-6 hours |
| **[Topical](/glossary/topical)** (skin) | Minimal systemic | 15-45 minutes | 4-6 hours (local) |
| **Transdermal** (patches) | Variable | 1-2 hours | Up to 12 hours |

---

## Oral CBD: The First-Pass Problem

When you swallow CBD, it faces significant hurdles before reaching your bloodstream.

### The First-Pass Effect

1. **Swallowing** → CBD enters stomach
2. **Stomach acid** → Some degradation occurs
3. **Small intestine** → CBD absorbed into portal vein
4. **Liver (first pass)** → CYP enzymes metabolize most CBD
5. **Systemic circulation** → Only 6-15% reaches bloodstream

### Why Oral Bioavailability Is Low

| Factor | Impact |
|--------|--------|
| **Stomach acid** | Partial degradation |
| **Poor water solubility** | CBD is lipophilic, hard to absorb |
| **Hepatic metabolism** | Liver enzymes break down CBD |
| **P-glycoprotein** | Efflux pump removes CBD from cells |

### Advantages of Oral Despite Low Bioavailability

| Advantage | Explanation |
|-----------|-------------|
| **Long duration** | 6-8 hours of effects |
| **Convenience** | Easy capsules, gummies |
| **No taste** | Encapsulated products |
| **Metabolite formation** | 7-OH-CBD may have benefits |

---

## Sublingual: The Bioavailability Boost

Holding CBD oil under your tongue (sublingual) significantly improves absorption.

### How Sublingual Absorption Works

1. **CBD placed under tongue** → Rich in blood vessels
2. **Mucosal absorption** → Directly into blood vessels
3. **Bypasses liver** → No first-pass metabolism for absorbed portion
4. **Swallowed remainder** → Goes through oral route

### Sublingual Best Practices

| Practice | Reason |
|----------|--------|
| Hold 60-90 seconds | Maximizes mucosal absorption |
| Don't eat/drink immediately | Allows full absorption |
| Use alcohol-based tinctures | Better mucosal penetration |
| Place under tongue, not on top | Most absorptive area |

### Sublingual vs. Oral Comparison

| Metric | Sublingual (proper) | Oral (swallowed) |
|--------|---------------------|------------------|
| Bioavailability | 13-35% | 6-15% |
| Onset | 15-30 min | 60-90 min |
| Peak blood levels | 1-2 hours | 2-4 hours |
| Duration | 4-6 hours | 6-8 hours |

---

## Inhalation: Highest Bioavailability

Vaping or smoking CBD provides the highest bioavailability of any method.

### Why Inhalation Works So Well

| Advantage | Mechanism |
|-----------|-----------|
| **Huge surface area** | Lungs have ~70 m² of absorptive surface |
| **Rich blood supply** | Direct entry into pulmonary circulation |
| **No first-pass** | Bypasses liver entirely |
| **Thin barrier** | One-cell thick alveolar membrane |

### Inhalation Considerations

| Factor | Pro/Con |
|--------|---------|
| **Fast onset** | Pro: 1-3 minutes |
| **Short duration** | Con: 2-3 hours |
| **Lung health** | Con: Potential risks |
| **Dosing precision** | Con: Hard to measure |
| **Portability** | Variable |

### Inhalation Bioavailability Range

The wide range (34-56%) depends on:
- Inhalation technique (depth, hold time)
- Vaporization temperature
- Product quality
- Individual lung function

---

## The Food Factor: 5x Bioavailability Boost

Taking CBD with high-fat food dramatically increases absorption.

### The Science of Fat and CBD

| Finding | Implication |
|---------|-------------|
| CBD is highly lipophilic | Dissolves in fats, not water |
| Fats trigger bile release | Bile emulsifies and absorbs lipophilic compounds |
| Chylomicrons carry CBD | Fat-transport system delivers CBD |
| Fed vs. fasted: 4-5x difference | Food makes massive difference |

### Best Foods for CBD Absorption

| Food | Fat Content | Notes |
|------|-------------|-------|
| **Avocado** | 15g per half | Healthy fats, good absorption |
| **Fatty fish** | 10-15g per serving | Omega-3s may complement CBD |
| **Eggs** | 5-7g per egg | Convenient, breakfast timing |
| **Cheese** | 9g per oz | High saturated fat |
| **Nuts** | 14-20g per oz | Portable option |
| **Olive oil** | 14g per tbsp | Easy to add |
| **Full-fat yogurt** | 8g per cup | Good carrier |

### Fed vs. Fasted CBD Absorption

| Condition | Approximate Bioavailability |
|-----------|----------------------------|
| **Fasted** | 6-8% |
| **Low-fat meal** | 10-15% |
| **High-fat meal** | 25-30% |

The 2019 FDA-approved [Epidiolex](/glossary/epidiolex) study confirmed that high-fat food increased CBD absorption by 4-5x.

---

## Nanoemulsion: Technology-Enhanced Absorption

Nanotechnology has created CBD products with dramatically improved bioavailability.

### What Is Nanoemulsion CBD?

Nanoemulsion breaks CBD into extremely small particles (typically 10-100 nanometers) suspended in water. Standard CBD oil droplets are 100-5000 nanometers.

### How Nanoemulsion Improves Absorption

| Factor | Standard Oil | Nanoemulsion |
|--------|--------------|--------------|
| **Particle size** | 100-5000 nm | 10-100 nm |
| **Surface area** | Lower | 10-100x higher |
| **Water dispersibility** | Poor | Good |
| **Absorption rate** | Slow | Fast |
| **Bioavailability** | 6-20% | 30-50% |

### Nanoemulsion Benefits and Limitations

| Benefits | Limitations |
|----------|-------------|
| Higher bioavailability | More expensive |
| Faster onset | Technology claims vary |
| Lower effective dose needed | Stability concerns |
| Water-compatible | Quality varies by manufacturer |

---

## Topical CBD: Local vs. Systemic

[Topical CBD](/glossary/topical) products work differently from systemic delivery methods.

### Topical Absorption

| Property | Detail |
|----------|--------|
| **Systemic bioavailability** | Minimal (CBD doesn't easily cross skin barrier) |
| **Local penetration** | Good (reaches subcutaneous tissue) |
| **Depth of penetration** | 1-2 cm typically |
| **Target** | Local tissues, not bloodstream |

### When Topical Makes Sense

| Application | Reason |
|-------------|--------|
| **Joint pain** | Targets local inflammation |
| **Muscle soreness** | Reaches affected tissue |
| **Skin conditions** | Acts on skin directly |
| **Localized issues** | No need for systemic effects |

### Transdermal vs. Topical

| Type | Goal | Systemic? |
|------|------|-----------|
| **Topical** | Local effects | No |
| **Transdermal** | Systemic delivery through skin | Yes |

Transdermal patches use permeation enhancers to push CBD into the bloodstream. Bioavailability varies widely by formulation.

---

## Factors That Affect Individual Bioavailability

Beyond delivery method, personal factors influence CBD absorption.

### Individual Variation Factors

| Factor | Effect |
|--------|--------|
| **Body composition** | Higher body fat may store CBD |
| **Metabolism** | Fast metabolizers clear CBD quicker |
| **Gut health** | Affects oral absorption |
| **Liver function** | Affects first-pass metabolism |
| **Genetics** | CYP450 enzyme variants |
| **Age** | Metabolism changes with age |

### CYP450 Genetic Variants

CBD is primarily metabolized by CYP3A4 and CYP2C19 enzymes. Genetic variations affect how quickly you process CBD:

| Metabolizer Type | Effect |
|------------------|--------|
| **Poor metabolizer** | Higher CBD levels, longer duration |
| **Normal metabolizer** | Typical response |
| **Ultra-rapid metabolizer** | Lower levels, shorter duration |

---

## Maximizing Your CBD Absorption

Practical strategies to get more from your CBD.

### Optimization Checklist

| Strategy | Bioavailability Boost |
|----------|----------------------|
| **Take with fatty food** | Up to 5x |
| **Use sublingual properly** | 2-3x vs. swallowing |
| **Choose nanoemulsion** | 2-3x vs. standard oil |
| **Consider inhalation** | 3-5x vs. oral |
| **Consistent timing** | Better predictability |
| **Quality products** | Ensures actual CBD content |

### Delivery Method Selection Guide

| Your Priority | Best Method |
|---------------|-------------|
| **Fast relief** | Inhalation or nanoemulsion |
| **Long-lasting** | Oral with food |
| **Convenience** | Capsules with fatty meal |
| **Discretion** | Sublingual or capsules |
| **Localized pain** | Topical |
| **All-day coverage** | Transdermal patch |

---

## Bioavailability and Dosing

Understanding bioavailability helps you dose more effectively.

### Equivalent Dose Calculation

If your target is 20mg of CBD in your bloodstream:

| Method | Bioavailability | Dose Needed |
|--------|-----------------|-------------|
| **Inhaled** | 50% | 40mg |
| **Nanoemulsion** | 40% | 50mg |
| **Sublingual** | 25% | 80mg |
| **Oral with fat** | 20% | 100mg |
| **Oral fasted** | 10% | 200mg |

### Cost Implications

Higher bioavailability means lower cost per effective dose:

| Method | Dose for 20mg absorbed | Cost at $0.10/mg |
|--------|------------------------|------------------|
| **Inhaled** | 40mg | $4.00 |
| **Sublingual** | 80mg | $8.00 |
| **Oral fasted** | 200mg | $20.00 |

---

## Related Articles

- [How CBD Works in the Body](/articles/how-cbd-works) - CBD's mechanisms of action
- [Full Spectrum vs. Broad Spectrum vs. Isolate](/articles/spectrum-comparison) - Product types compared
- [The Endocannabinoid System Explained](/articles/endocannabinoid-system) - Complete ECS guide

---

## Frequently Asked Questions

### What is CBD bioavailability?

[Bioavailability](/glossary/bioavailability) is the percentage of [CBD](/glossary/cannabidiol) that actually enters your bloodstream after consumption. If you take 100mg of CBD with 20% bioavailability, only 20mg reaches systemic circulation. The rest is lost to digestion, liver metabolism, and poor absorption.

### Why does CBD have low oral bioavailability?

CBD is lipophilic (fat-soluble) and doesn't dissolve well in water-based digestive fluids. When swallowed, it also faces the "first-pass effect"—the liver metabolizes most CBD before it reaches general circulation. Together, these factors limit oral bioavailability to 6-15%.

### Does taking CBD with food help?

Yes, significantly. Taking CBD with high-fat food (avocado, eggs, fatty fish, cheese) can increase bioavailability by 4-5x. Fats trigger bile release, which helps absorb lipophilic compounds like CBD. The FDA's Epidiolex trials confirmed this effect.

### Which CBD method has the highest bioavailability?

Inhalation (vaping) has the highest bioavailability at 34-56%, followed by nanoemulsion products (30-50%), sublingual oils (13-35%), and oral/swallowed products (6-15%). However, highest bioavailability doesn't always mean best—duration, convenience, and safety also matter.

### What is nanoemulsion CBD?

Nanoemulsion CBD uses technology to break CBD into extremely small particles (10-100 nanometers) that are water-compatible. The smaller particles have more surface area, absorb faster, and have higher bioavailability (30-50%) than standard CBD oil.

### How do I properly take sublingual CBD?

Place the oil under your tongue and hold for 60-90 seconds before swallowing. This allows CBD to absorb directly through the mucous membrane into blood vessels, bypassing the liver. Don't eat or drink immediately after to maximize absorption.

---

*Medical Disclaimer: This article is for educational purposes only and does not constitute medical advice. Bioavailability data comes from various studies and may vary between products and individuals. Consult a healthcare professional before using CBD products.*

---

### References

1. Millar SA, et al. A systematic review on the pharmacokinetics of cannabidiol in humans. *Front Pharmacol*. 2018;9:1365.

2. Birnbaum AK, et al. Food effect on pharmacokinetics of cannabidiol oral capsules in adult patients with refractory epilepsy. *Epilepsia*. 2019;60(8):1586-1592.

3. Huestis MA. Human cannabinoid pharmacokinetics. *Chem Biodivers*. 2007;4(8):1770-1804.

4. Izgelov D, et al. Investigation of cannabidiol gastro-retentive tablets based on regional absorption of cannabidiol in the gastrointestinal tract. *Eur J Pharm Biopharm*. 2020;152:229-238.

5. Cherniakov I, et al. Piperine-pro-nanolipospheres as a novel oral delivery system of cannabinoids. *Nanotechnology*. 2017;28(5):055102.`;

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
      title: 'CBD Bioavailability: Why Delivery Method Matters',
      slug: 'cbd-bioavailability',
      excerpt: 'Learn why most CBD never reaches your bloodstream. Compare bioavailability of oils, capsules, vaping, and nanoemulsion—and how to maximize your CBD absorption.',
      content: content,
      status: 'published',
      featured: false,
      article_type: 'science',
      category_id: category.id,
      reading_time: 11,
      meta_title: 'CBD Bioavailability Explained: Maximize Your Absorption',
      meta_description: 'Understand CBD bioavailability by delivery method. Learn why sublingual, vaping, and nanoemulsion outperform capsules, and how food affects absorption.',
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
