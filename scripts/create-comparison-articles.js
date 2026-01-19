#!/usr/bin/env node

/**
 * Create comparison articles for CBD Portal
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
try {
  const envPath = path.join(process.cwd(), '.env.local');
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const categoryId = '946fdca2-f621-4f58-abfa-73f33fa2b32d';

async function createArticle(article) {
  const { data, error } = await supabase
    .from('kb_articles')
    .insert({
      ...article,
      category_id: categoryId,
      status: 'published',
      featured: false,
      language: 'en',
      article_type: 'comparison'
    })
    .select('id, title, slug')
    .single();

  if (error) {
    console.error('Error creating', article.slug + ':', error.message);
    return null;
  }
  console.log('Created:', data.slug);
  return data;
}

// Articles to create
const articles = [
  {
    title: 'CBD vs Ashwagandha: Complete Comparison for Stress and Anxiety',
    slug: 'cbd-vs-ashwagandha',
    excerpt: 'Compare CBD and ashwagandha for anxiety, stress, and sleep. Learn how these natural remedies work, their benefits, and which may be better for your needs.',
    meta_title: 'CBD vs Ashwagandha: Which Is Better for Stress & Anxiety? 2026',
    meta_description: 'CBD or ashwagandha for stress relief? Compare mechanisms, research, dosing, and effectiveness. Find which natural remedy works better for anxiety and stress.',
    reading_time: 8,
    content: `# CBD vs Ashwagandha: Complete Comparison for Stress and Anxiety

**Quick Answer:** CBD and ashwagandha both help with stress and anxiety but work through completely different mechanisms. Ashwagandha is an adaptogen that helps your body resist chronic stress over time, with effects building over weeks. CBD works through the endocannabinoid system and may provide more immediate calming effects. Ashwagandha is better for chronic stress and cortisol reduction; CBD may be better for acute anxiety and multi-symptom relief.

## Key Takeaways

- **Ashwagandha** works best with consistent daily use over 4-8 weeks
- **CBD** may provide more immediate relief for acute anxiety
- Ashwagandha has stronger research for reducing cortisol levels
- CBD offers broader effects (anxiety, pain, inflammation, sleep)
- Both are generally safe but have different interaction profiles
- Many people combine both for complementary benefits
- Neither is a replacement for professional mental health treatment

## Understanding the Basics

### What Is Ashwagandha?

Ashwagandha (Withania somnifera) is an ancient medicinal herb used in Ayurvedic medicine for over 3,000 years. It is classified as an adaptogen—a natural substance that helps the body adapt to stress and maintain balance.

The name means "smell of the horse" in Sanskrit, referring both to its distinctive odour and the traditional belief that it imparts the strength and vitality of a horse.

### What Is CBD?

[CBD](/glossary/cbd) (cannabidiol) is a [phytocannabinoid](/glossary/phytocannabinoid) found in hemp plants. It interacts with the [endocannabinoid system](/glossary/endocannabinoid-system) (ECS), which helps regulate mood, stress response, pain perception, and numerous other bodily functions.

Unlike ashwagandha, CBD is not classified as an adaptogen, though some of its effects overlap with adaptogenic herbs.

## How They Work: Mechanisms Compared

| Aspect | Ashwagandha | CBD |
|--------|-------------|-----|
| **Classification** | Adaptogen herb | Phytocannabinoid |
| **Primary system** | HPA axis modulation | Endocannabinoid system |
| **Key compounds** | Withanolides | Cannabidiol |
| **Onset of effects** | 2-8 weeks | Minutes to hours |
| **How it reduces stress** | Lowers cortisol, balances hormones | Modulates ECS, affects serotonin |
| **Time commitment** | Daily use required | As-needed use possible |

### Ashwagandha's Mechanism

Ashwagandha works primarily by:

1. **Modulating the HPA axis:** The hypothalamic-pituitary-adrenal axis controls stress response. Ashwagandha helps regulate this system.

2. **Reducing cortisol:** Multiple studies show ashwagandha can lower cortisol levels by 11-32% over 8 weeks.

3. **Enhancing GABA signalling:** May increase the calming effects of GABA, the brain's primary inhibitory neurotransmitter.

4. **Antioxidant effects:** Withanolides provide cellular protection against stress-related damage.

5. **Thyroid support:** May help normalise thyroid function, which affects energy and mood.

### CBD's Mechanism

CBD's stress-relieving effects come through multiple pathways:

1. **ECS modulation:** Enhances endocannabinoid signalling, which helps regulate stress response.

2. **Serotonin receptor interaction:** CBD binds to 5-HT1A receptors, similar to how some anxiety medications work.

3. **GABA enhancement:** May amplify GABA's calming effects.

4. **Cortisol influence:** Some research suggests CBD may reduce cortisol release.

5. **Neuroplasticity:** May support brain health and adaptability.

## Detailed Comparison Table

| Factor | Ashwagandha | CBD |
|--------|-------------|-----|
| **Best for** | Chronic stress, cortisol, energy | Acute anxiety, multi-symptom relief |
| **Time to work** | 4-8 weeks | Minutes to hours |
| **Typical dose** | 300-600mg daily | 25-100mg daily |
| **Research quality** | Strong for stress/cortisol | Moderate, growing rapidly |
| **Side effects** | Mild digestive upset | Dry mouth, drowsiness |
| **Drug interactions** | Thyroid meds, sedatives | CYP450 metabolism |
| **Pregnancy safety** | Not recommended | Not recommended |
| **Cost (monthly)** | €15-30 | €30-80 |
| **Taste** | Earthy, somewhat bitter | Earthy, hempy |
| **Legal status (EU)** | Food supplement | Novel Food regulated |

## When to Choose Ashwagandha

Ashwagandha may be the better choice if you:

### Experience Chronic Stress

If you have been under prolonged stress—work pressure, life changes, caregiving responsibilities—ashwagandha's adaptogenic effects can help your body become more resilient over time. It is designed for sustained stress rather than acute moments.

### Have Elevated Cortisol

Research consistently shows ashwagandha reduces cortisol levels. If you have symptoms of high cortisol (belly fat accumulation, difficulty sleeping, anxiety, fatigue), ashwagandha specifically targets this hormone.

### Need Energy Support

Unlike CBD, which can cause drowsiness, ashwagandha often improves energy levels. It is classified as both calming and energising—reducing stress while supporting vitality. This makes it useful if fatigue accompanies your stress.

### Want Hormone Balance

Ashwagandha may support thyroid function and reproductive hormones. It has been studied for benefits in men's testosterone levels and women's reproductive health during stress.

### Prefer Established Traditional Use

Ashwagandha has thousands of years of documented use in Ayurvedic medicine. Some people prefer remedies with this historical track record.

## When to Choose CBD

CBD may be the better choice if you:

### Need Immediate Relief

If you experience acute anxiety—panic before a presentation, sudden stress, social anxiety—CBD may work faster than ashwagandha. While ashwagandha requires weeks to build up, CBD can have effects within an hour.

### Have Multiple Symptoms

CBD addresses a broader range of symptoms simultaneously. If your stress comes with pain, inflammation, or sleep problems, CBD may provide more comprehensive relief.

### Experience Anxiety Attacks

For sudden, intense anxiety, CBD's potential interaction with serotonin receptors may provide more immediate calming effects than ashwagandha's gradual adaptogenic support.

### Want Flexible Dosing

CBD can be used as-needed, making it suitable for situational anxiety. You do not have to commit to daily use like with ashwagandha.

### Have Sleep Problems

CBD may more directly address sleep issues, particularly those related to anxiety or pain. While ashwagandha can improve sleep quality over time, CBD may help more immediately.

## Can You Take CBD and Ashwagandha Together?

Yes, many people combine CBD and ashwagandha for complementary effects. This combination can address stress from multiple angles:

- **Ashwagandha** for long-term stress resilience and cortisol control
- **CBD** for immediate calming effects and symptom relief

### How to Combine Them

1. **Start separately:** Use each alone first to understand individual effects
2. **Begin with lower doses:** When combining, reduce doses slightly
3. **Take ashwagandha consistently:** Daily, preferably with food
4. **Use CBD as needed:** Either daily or for acute situations
5. **Monitor effects:** Track how you feel over 4-8 weeks

### Timing Considerations

- **Morning:** Ashwagandha for all-day stress resilience
- **Evening:** CBD for relaxation and sleep support
- **As needed:** CBD before stressful situations

## Research Comparison

### Ashwagandha Research Highlights

Ashwagandha has substantial research support:

- **Cortisol reduction:** A 2012 study showed 27.9% reduction in cortisol after 60 days
- **Anxiety:** A 2019 study found significant improvements in stress and anxiety scores
- **Sleep:** Research shows improved sleep quality in chronically stressed adults
- **Mental performance:** Studies indicate improved memory and cognitive function

The research on ashwagandha is generally well-established, with multiple randomised controlled trials.

### CBD Research Highlights

CBD research is newer but growing:

- **Anxiety:** A 2019 study found 79% of participants reported reduced anxiety
- **Public speaking:** Research shows CBD reduced anxiety during simulated public speaking
- **PTSD:** Some studies suggest benefits for PTSD-related anxiety
- **Sleep:** Studies indicate improvements in sleep quality, especially anxiety-related insomnia

CBD research is promising but generally has smaller sample sizes than ashwagandha studies.

## Side Effects Comparison

### Ashwagandha Side Effects

Generally well-tolerated, but may cause:

- **Digestive upset:** Nausea, diarrhoea, especially on empty stomach
- **Drowsiness:** Usually mild, more common at higher doses
- **Thyroid changes:** May increase thyroid hormone levels
- **Headaches:** Occasional, typically mild
- **Allergic reactions:** Rare, more likely in nightshade-sensitive individuals

**Contraindications:** Avoid if you have hyperthyroidism, are pregnant/breastfeeding, or are taking thyroid medications, immunosuppressants, or sedatives.

### CBD Side Effects

Also generally well-tolerated:

- **Dry mouth:** Most common side effect
- **Drowsiness:** Can be beneficial or problematic depending on timing
- **Appetite changes:** Usually decreased appetite
- **Digestive changes:** Occasional diarrhoea at high doses
- **Drug interactions:** Significant CYP450 interactions

**Contraindications:** Use caution with liver conditions, medications metabolised by CYP450 enzymes, or if pregnant/breastfeeding.

Learn more about [CBD side effects](/learn/cbd-side-effects) and [CBD drug interactions](/learn/cbd-drug-interactions).

## Dosage Guidelines

### Ashwagandha Dosing

| Form | Typical Dose | Timing |
|------|-------------|--------|
| Root extract (standardised) | 300-600mg | Once or twice daily |
| Full-spectrum extract | 250-500mg | Once daily |
| Root powder | 1-6g | Divided doses |
| KSM-66 extract | 300-600mg | Once or twice daily |

**Best practices:**
- Take with food to prevent stomach upset
- Consistent daily use for 4-8 weeks
- Morning dose for energy, evening for sleep focus

### CBD Dosing for Stress/Anxiety

| Experience Level | Starting Dose | Maintenance |
|-----------------|--------------|-------------|
| Beginner | 10-15mg | 15-25mg daily |
| Intermediate | 25-35mg | 25-50mg daily |
| Experienced | 40-50mg | 50-100mg daily |

Visit our [CBD dosage calculator](/tools/dosage-calculator) for personalised recommendations.

## Cost and Availability

| Factor | Ashwagandha | CBD |
|--------|-------------|-----|
| Monthly cost | €15-30 | €30-80 |
| Daily cost | €0.50-1.00 | €1.00-2.65 |
| Availability | Widely available | Regulated but accessible |
| Quality variation | Moderate | High—choose third-party tested |
| Forms available | Capsules, powder, liquid | Oil, gummies, capsules, topicals |

## Frequently Asked Questions

### Can I take ashwagandha and CBD together for anxiety?

Yes, many people combine them. Ashwagandha provides long-term stress resilience through cortisol regulation, while CBD may offer more immediate calming effects. Start with each separately, then combine at reduced doses. Take ashwagandha consistently and use CBD as needed.

### Which works faster—ashwagandha or CBD?

CBD typically works faster. You may notice effects within 30-90 minutes, depending on the form. Ashwagandha is a slow-acting adaptogen that requires 4-8 weeks of consistent use to build up effects. For immediate relief, CBD is the better choice.

### Is ashwagandha safer than CBD?

Both have good safety profiles for most adults. Ashwagandha has a longer track record with thousands of years of traditional use. CBD has been studied extensively in recent years with few safety concerns. Neither is recommended during pregnancy. Both can interact with medications, but through different mechanisms.

### Which is better for sleep—ashwagandha or CBD?

It depends on why you cannot sleep. Ashwagandha may improve sleep quality over time by reducing stress hormones. CBD may help more immediately, especially if pain or acute anxiety disrupts sleep. Many people use ashwagandha daily and CBD as needed for sleep support.

### Can ashwagandha cause anxiety like CBD sometimes does?

Ashwagandha rarely causes anxiety—it typically reduces it. Some people report initial jitteriness or increased energy, especially with high doses. CBD is also generally calming, though very high doses or sensitivity could theoretically cause restlessness. Both are more likely to reduce anxiety than cause it.

### Do I need to take ashwagandha every day?

Yes, ashwagandha works best with consistent daily use. Its adaptogenic effects build over time. Taking it sporadically will not provide the cortisol-regulating benefits. CBD, in contrast, can be used either daily or as-needed depending on your goals.

## The Bottom Line

**Choose ashwagandha if:** You experience chronic stress, want cortisol reduction, need sustained energy, prefer established traditional remedies, or are willing to commit to daily use for long-term benefits.

**Choose CBD if:** You need immediate relief for acute anxiety, have multiple symptoms (pain, inflammation, sleep issues), want flexible as-needed dosing, or prefer faster-acting support.

**Consider both if:** You want comprehensive stress support—ashwagandha for long-term resilience and CBD for immediate relief when needed.

Both ashwagandha and CBD are natural alternatives to pharmaceuticals, but they are not substitutes for professional mental health treatment if you have severe anxiety or depression.

---

*Last Updated: January 2026*

**Medical Disclaimer:** This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using ashwagandha or CBD, especially if you take medications or have health conditions.`
  }
];

async function main() {
  console.log('Creating comparison articles...\n');

  for (const article of articles) {
    await createArticle(article);
  }

  console.log('\nDone!');
}

main().catch(console.error);
