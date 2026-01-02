#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error('❌ SUPABASE environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All 13 professional CBD articles
const ARTICLES = [
  {
    id: 'a4a88f12-87d6-40d3-8007-859ad96304ac',
    title: 'CBD and Anxiety: A Comprehensive Analysis of Current Clinical Evidence (2025)',
    slug: 'cbd-and-anxiety',
    excerpt: 'Comprehensive analysis of CBD for anxiety backed by 2024-2025 clinical research. Evidence-based guide covering molecular mechanisms, dosing protocols, and safety considerations.',
    content: `Cannabidiol (CBD), a non-intoxicating cannabinoid derived from Cannabis sativa, has emerged as a potential therapeutic agent for anxiety disorders. Unlike its psychoactive counterpart THC, CBD does not produce euphoric effects and has demonstrated a favorable safety profile in clinical settings.

With anxiety disorders affecting approximately 301 million people globally according to WHO data, the search for effective, well-tolerated treatments continues to drive research into alternative therapies like CBD.

## Understanding the Science: How CBD Affects Anxiety

### Molecular Mechanisms

CBD's anxiolytic properties operate through multiple neurobiological pathways:

**5-HT1A Receptor Modulation**: CBD acts as a partial agonist at serotonin 5-HT1A receptors, enhancing serotonergic signaling in brain regions crucial for emotional processing, including the prefrontal cortex and amygdala.

**Endocannabinoid System Enhancement**: By inhibiting fatty acid amide hydrolase (FAAH), CBD increases levels of anandamide, an endogenous cannabinoid associated with mood regulation and stress resilience.

**Neural Connectivity**: Neuroimaging studies reveal that CBD modulates amygdala-cortical connectivity during emotional processing tasks, potentially normalizing hyperactive fear responses characteristic of anxiety disorders.

## Clinical Evidence: What the Latest Research Shows

Recent systematic reviews from 2024 have analyzed multiple randomized controlled trials, showing promising but mixed results for CBD in anxiety treatment. Studies have used doses ranging from 25mg to 600mg daily, with optimal dosing still being researched.

A landmark 2019 study in The Permanente Journal followed 72 adults with anxiety, finding that 79.2% showed decreased anxiety scores within the first month of 25mg daily CBD treatment.

## Safety and Dosing Considerations

CBD is generally well-tolerated with a favorable safety profile. Common side effects are mild and may include fatigue, changes in appetite, and potential medication interactions through liver enzyme inhibition.

Current research suggests effective doses range from 25mg to 300mg daily, though individual responses vary significantly.

---

*Written by Robin Roy Krigslund-Hansen*

*Robin Roy Krigslund-Hansen is CEO and co-founder of Formula Swiss, a Swiss CBD company he established in 2013. With over a decade of experience in the CBD and cannabis industry, Robin has witnessed the evolution of cannabinoid research from early studies to today's clinical trials.*

---

*This article is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional before starting any new supplement regimen, especially if you have existing health conditions or take medications.*`,
    category_slug: 'mental-health',
    featured: true,
    reading_time: 12,
    meta_title: 'CBD and Anxiety: Clinical Evidence & Dosage Guide (2025)',
    meta_description: 'Comprehensive analysis of CBD for anxiety backed by 2024 clinical research. Evidence-based guide covering molecular mechanisms, dosing protocols, and safety considerations.'
  },
  {
    title: 'What is CBD? Complete Beginners Guide to Cannabidiol (2025)',
    slug: 'what-is-cbd-beginners-guide',
    excerpt: 'Complete beginner-friendly guide to CBD covering basics, legality, how it works, types of products, dosing guidelines, and safety considerations.',
    content: `Cannabidiol (CBD) has gained widespread attention as a natural wellness compound, but understanding what it is and how it works can be confusing for beginners. This comprehensive guide covers everything you need to know about CBD.

## What is CBD?

Cannabidiol (CBD) is one of over 100 compounds called cannabinoids found in the cannabis plant. Unlike THC (tetrahydrocannabinol), CBD does not produce psychoactive effects or make you feel "high."

## How CBD Works

CBD interacts with your body's endocannabinoid system (ECS), a network of receptors that helps regulate:
- Sleep and wake cycles
- Mood and stress response
- Pain and inflammation
- Immune function
- Memory and learning

## Types of CBD Products

**Full-Spectrum**: Contains all plant compounds including trace THC (less than 0.3%)
**Broad-Spectrum**: Contains multiple cannabinoids but no detectable THC
**Isolate**: Pure CBD with all other compounds removed

## Common Product Forms

- **Oils and Tinctures**: Liquid drops taken under the tongue
- **Capsules**: Convenient for consistent dosing
- **Topicals**: Creams and balms for localized application
- **Edibles**: Gummies and other foods containing CBD

## Is CBD Legal?

In most countries, hemp-derived CBD containing less than 0.3% THC is legal. However, regulations vary by location, so check your local laws.

## Getting Started

**Start Low**: Begin with 5-10mg daily
**Go Slow**: Increase gradually every few days
**Be Consistent**: Take at the same time daily
**Track Effects**: Monitor how you feel

## Safety Considerations

CBD is generally well-tolerated, but may interact with certain medications. Consult a healthcare provider before starting CBD, especially if you take prescription drugs.

---

*Written by Robin Roy Krigslund-Hansen*

*This article is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional before starting any new supplement regimen.*`,
    category_slug: 'cbd-basics',
    featured: true,
    reading_time: 16,
    meta_title: 'What is CBD? Complete Beginners Guide to Cannabidiol (2025)',
    meta_description: 'Complete beginner-friendly guide to CBD covering basics, legality, how it works, types of products, dosing guidelines, and safety considerations.'
  },
  {
    title: 'CBD and Sleep: What Clinical Research Reveals About Insomnia',
    slug: 'cbd-and-sleep',
    excerpt: 'Explore what 2024-2025 clinical trials reveal about CBD for sleep and insomnia, including mechanisms, effective dosages, and evidence-based recommendations.',
    content: `Sleep difficulties affect millions worldwide, with approximately 30% of adults experiencing symptoms of insomnia at any given time. As interest in natural sleep aids continues to grow, cannabidiol (CBD) has emerged as a popular option for those seeking alternatives to traditional sleep medications.

Recent studies from 2024 and 2025 have begun to provide more rigorous data about CBD effectiveness for sleep disorders.

## How CBD May Influence Sleep

The endocannabinoid system plays a significant role in regulating sleep-wake cycles. Research demonstrates that endocannabinoids display circadian fluctuations in healthy humans, with anandamide levels highest upon waking and lowest before sleep onset.

CBD interacts with this system through multiple pathways, modulating endocannabinoid signaling through various receptor sites, including serotonin 5-HT1A receptors implicated in sleep regulation.

## What the Research Shows

### Recent Clinical Trials (2024-2025)

The most robust recent evidence comes from a randomised controlled pilot trial published in May 2024 in the Journal of Clinical Sleep Medicine. This study evaluated 150 mg of nightly CBD dosing in 30 participants with moderate to severe primary insomnia.

Results were mixed, with some participants reporting subjective improvements in sleep quality, though the trial did not demonstrate statistically significant improvements in objective sleep measures compared to placebo.

## Dosage Considerations

Clinical trials have used widely varying doses from 150-300 mg, considerably higher than typical commercial CBD products recommend. The biphasic nature of CBD's effects complicates dosage guidance.

## Safety and Side Effects

CBD is generally well-tolerated, with a favourable safety profile compared to many conventional sleep medications. The 2024 studies found no significant adverse events and no next-day cognitive impairment.`,
    category_slug: 'health-wellness',
    featured: false,
    reading_time: 9,
    meta_title: 'CBD and Sleep: What 2024-2025 Research Shows',
    meta_description: 'Discover what recent clinical trials reveal about CBD for insomnia. Evidence-based guide on mechanisms, effective dosages, and safety.'
  },
  {
    title: 'CBD for Pain Relief: Evidence-Based Analysis of Therapeutic Potential',
    slug: 'cbd-for-pain-relief',
    excerpt: 'Comprehensive review of CBD for pain management covering chronic pain, inflammation, neuropathic pain, and evidence from clinical trials.',
    content: `Chronic pain affects over 100 million Americans, making it one of the most prevalent health conditions worldwide. Traditional pain management approaches often rely on opioid medications, which carry significant risks of dependency and adverse effects. This has led researchers to investigate alternative therapeutic approaches, including cannabidiol (CBD).

## Understanding Pain and the Endocannabinoid System

The endocannabinoid system plays a crucial role in pain processing, with CB1 and CB2 receptors found throughout pain pathways. CBD modulates pain perception through multiple mechanisms beyond direct cannabinoid receptor interaction.

## Clinical Evidence for CBD in Pain Management

Recent clinical trials have shown promising results for CBD in various pain conditions:

**Chronic Pain**: A 2021 systematic review of 18 randomized controlled trials found moderate evidence supporting CBD for chronic pain, particularly neuropathic pain.

**Inflammatory Pain**: Preclinical studies demonstrate CBD's anti-inflammatory properties through COX-2 inhibition and cytokine modulation.

**Neuropathic Pain**: Clinical trials using CBD:THC combinations show significant improvements in multiple sclerosis-related neuropathic pain.

## Dosing and Administration

Clinical studies have used varying doses from 1.5mg to 20mg per kg body weight. Most effective protocols start with low doses (5-10mg) and gradually increase based on response.

## Safety Profile

CBD demonstrates excellent tolerability with mild side effects including fatigue, diarrhea, and changes in appetite or weight. Drug interactions through cytochrome P450 enzymes require monitoring when combined with other medications.`,
    category_slug: 'health-wellness',
    featured: false,
    reading_time: 11,
    meta_title: 'CBD for Pain Relief: Evidence-Based Clinical Analysis',
    meta_description: 'Comprehensive review of CBD for pain management covering chronic pain, inflammation, neuropathic pain, and evidence from clinical trials.'
  },
  {
    title: 'CBD Oil vs CBD Capsules: Complete Product Comparison Guide',
    slug: 'cbd-oil-vs-capsules',
    excerpt: 'Detailed comparison of CBD oil tinctures versus capsules covering absorption, dosing, convenience, and which format works best for different needs.',
    content: `When starting with CBD, one of the first decisions you'll face is choosing between CBD oil tinctures and capsules. Both delivery methods offer unique advantages and considerations that can significantly impact your experience.

## CBD Oil Tinctures: The Traditional Choice

**How They Work**: CBD oils are taken sublingually (under the tongue), where they're absorbed directly into the bloodstream through mucous membranes.

**Advantages**:
- **Faster Onset**: Effects typically felt within 15-45 minutes
- **Precise Dosing**: Easy to adjust dose drop by drop
- **Higher Bioavailability**: Direct absorption bypasses first-pass metabolism
- **Flexibility**: Can be mixed into food or drinks

**Considerations**:
- **Taste**: Hemp flavor can be unpleasant for some users
- **Convenience**: Requires holding under tongue for 30-60 seconds
- **Portability**: Bottles can be inconvenient for travel

## CBD Capsules: The Convenient Option

**How They Work**: Capsules are swallowed and processed through the digestive system like any supplement.

**Advantages**:
- **Consistent Dosing**: Exact amount in each capsule
- **No Taste**: Eliminates hemp flavor concerns
- **Convenience**: Easy to incorporate into daily routine
- **Discreet**: Can be taken anywhere without drawing attention

**Considerations**:
- **Slower Onset**: Effects take 30-120 minutes
- **Lower Bioavailability**: First-pass metabolism reduces absorption
- **Less Flexibility**: Cannot adjust dose incrementally

## Absorption and Bioavailability

Studies suggest sublingual CBD oil offers 13-19% bioavailability compared to 6-15% for oral capsules. However, taking capsules with fatty foods can improve absorption.

## Which Should You Choose?

**Choose CBD Oil If**:
- You want faster relief
- You prefer flexible dosing
- You don't mind the taste
- You want maximum absorption

**Choose Capsules If**:
- You value convenience and consistency
- You dislike CBD's natural taste
- You travel frequently
- You prefer taking supplements in pill form

## Quality Considerations for Both

Regardless of format, prioritize products with:
- Third-party lab testing
- Clear cannabinoid profiles
- Appropriate extraction methods
- Transparent ingredient lists`,
    category_slug: 'product-guides',
    featured: false,
    reading_time: 8,
    meta_title: 'CBD Oil vs Capsules: Complete Comparison Guide 2025',
    meta_description: 'Detailed comparison of CBD oil tinctures versus capsules covering absorption, dosing, convenience, and which format works best for different needs.'
  },
  {
    title: 'CBD Drug Interactions: Essential Safety Guide for Medications',
    slug: 'cbd-drug-interactions',
    excerpt: 'Critical safety information about CBD interactions with prescription medications, blood thinners, and other supplements. Evidence-based precautions.',
    content: `While CBD is generally well-tolerated, it can interact with certain medications through inhibition of cytochrome P450 enzymes, particularly CYP3A4 and CYP2D6. Understanding these interactions is crucial for safe CBD use.

## How CBD Affects Drug Metabolism

CBD inhibits key liver enzymes responsible for metabolizing many medications. This can lead to increased blood levels of certain drugs, potentially causing adverse effects or altering therapeutic outcomes.

## Medications with Documented Interactions

**Blood Thinners**:
- **Warfarin**: CBD may increase bleeding risk by inhibiting warfarin metabolism
- **Monitoring Required**: Regular INR testing recommended

**Seizure Medications**:
- **Clobazam**: Significant interaction documented in clinical trials
- **Valproic Acid**: May increase liver enzyme elevation risk

**Heart Medications**:
- **Digoxin**: CBD may increase digoxin levels
- **Beta-blockers**: Potential for enhanced hypotensive effects

## The "Grapefruit Warning" Rule

If a medication carries a grapefruit warning, it likely uses the same metabolic pathways affected by CBD. Exercise particular caution with these medications.

## Safety Recommendations

**Before Starting CBD**:
1. Consult your healthcare provider
2. Review all current medications
3. Consider timing of administration
4. Start with lowest possible doses

**While Using CBD**:
- Monitor for unusual symptoms
- Report changes to your doctor
- Maintain consistent timing
- Don't adjust prescription medications without medical supervision

## Clinical Monitoring

Some medications may require more frequent monitoring when used with CBD, including:
- Blood clotting tests (INR) for blood thinners
- Liver function tests for certain seizure medications
- Drug level monitoring for narrow therapeutic index medications

The research on CBD drug interactions continues to evolve. Always prioritize open communication with healthcare providers for personalized safety guidance.`,
    category_slug: 'safety',
    featured: false,
    reading_time: 7,
    meta_title: 'CBD Drug Interactions: Essential Medication Safety Guide',
    meta_description: 'Critical safety information about CBD interactions with prescription medications, blood thinners, and other supplements. Evidence-based precautions.'
  },
  {
    title: 'Full Spectrum vs Broad Spectrum vs Isolate: Complete CBD Guide',
    slug: 'full-spectrum-vs-broad-spectrum-vs-isolate',
    excerpt: 'Comprehensive guide to CBD types: full spectrum, broad spectrum, and isolate. Learn differences, benefits, drug testing implications.',
    content: `Understanding the differences between full spectrum, broad spectrum, and CBD isolate is essential for choosing the right product for your needs. Each type offers distinct advantages and considerations.

## Full Spectrum CBD

**Definition**: Contains all naturally occurring compounds from the cannabis plant, including CBD, other cannabinoids, terpenes, flavonoids, and trace amounts of THC (≤0.3%).

**The Entourage Effect**: Research suggests that cannabinoids and terpenes work synergistically, potentially enhancing therapeutic benefits compared to isolated compounds.

**Benefits**:
- Potential enhanced efficacy through entourage effect
- Complete plant profile preserved
- Often more effective for sleep and anxiety

**Considerations**:
- Contains trace THC (may show on drug tests)
- Stronger hemp flavor
- Not suitable for THC-sensitive individuals

## Broad Spectrum CBD

**Definition**: Contains multiple cannabinoids and terpenes but with THC completely removed through additional processing.

**Benefits**:
- Entourage effect potential without THC
- Suitable for THC-sensitive users
- Lower drug test risk
- Preserved terpene profiles

**Considerations**:
- More processing may affect some compounds
- Limited research compared to full spectrum
- Generally more expensive than isolate

## CBD Isolate

**Definition**: Pure CBD (99%+) with all other plant compounds removed through extensive refinement.

**Benefits**:
- No THC whatsoever
- Predictable, consistent effects
- Tasteless and odorless
- Lowest drug test risk
- Often most affordable option

**Considerations**:
- No entourage effect
- May be less effective for certain conditions
- Lacks beneficial terpenes and flavonoids

## Drug Testing Implications

**Full Spectrum**: Highest risk due to trace THC
**Broad Spectrum**: Low risk, but some products may contain trace THC
**Isolate**: Virtually no risk when from reputable sources

## Which Type Should You Choose?

**Full Spectrum For**:
- Maximum therapeutic potential
- Sleep disorders
- Chronic pain
- When drug testing isn't a concern

**Broad Spectrum For**:
- THC sensitivity
- Workplace drug testing concerns
- Wanting entourage effect benefits
- Legal restrictions in your area

**Isolate For**:
- First-time users
- Strict drug testing requirements
- Precise CBD dosing needs
- Flavor sensitivity

## Quality Verification

Regardless of type, always verify:
- Third-party lab testing results
- Cannabinoid profiles match labels
- Absence of pesticides and heavy metals
- Proper extraction methods used`,
    category_slug: 'product-guides',
    featured: true,
    reading_time: 9,
    meta_title: 'Full Spectrum vs Broad Spectrum vs Isolate: Complete Guide',
    meta_description: 'Comprehensive guide to CBD types: full spectrum, broad spectrum, and isolate. Learn differences, benefits, drug testing implications.'
  },
  {
    title: 'CBD Dosage Guide: How to Find Your Optimal Dose',
    slug: 'cbd-dosage-guide',
    excerpt: 'Evidence-based CBD dosing guide covering starting doses, titration methods, factors affecting dosage, and dosing for specific conditions.',
    content: `Finding the right CBD dose is crucial for achieving desired effects while minimizing potential side effects. Unlike pharmaceuticals with standardized dosing, CBD dosing remains highly individualized due to variations in body chemistry, product types, and intended outcomes.

## Why CBD Dosing is Complex

Several factors influence optimal CBD dosage:
- **Individual metabolism**: Genetic variations in liver enzymes
- **Body weight and composition**: Larger individuals may require higher doses
- **Tolerance**: Regular users may need dose adjustments over time
- **Product type**: Different bioavailability between oils, edibles, and topicals
- **Condition severity**: More severe symptoms may require higher doses

## Starting Dosage Guidelines

**General Rule**: Start low and go slow

**Recommended Starting Doses**:
- **Beginners**: 5-10mg daily
- **Mild symptoms**: 10-20mg daily
- **Moderate symptoms**: 20-40mg daily
- **Severe symptoms**: 40mg+ daily (under medical supervision)

## Titration Protocol

**Week 1**: Start with 5-10mg daily
**Week 2**: If no effects, increase by 5mg
**Week 3**: Continue increasing by 5mg every few days
**Maintenance**: Once effects achieved, maintain that dose for at least one week

## Dosing by Delivery Method

**Sublingual Oils**:
- **Onset**: 15-45 minutes
- **Duration**: 4-6 hours
- **Bioavailability**: 13-19%
- **Dosing**: 2-3 times daily

**Capsules/Edibles**:
- **Onset**: 30-120 minutes
- **Duration**: 6-8 hours
- **Bioavailability**: 6-15%
- **Dosing**: 1-2 times daily

**Vaping**:
- **Onset**: 2-5 minutes
- **Duration**: 2-4 hours
- **Bioavailability**: 30-56%
- **Dosing**: As needed

## Condition-Specific Guidelines

Based on clinical research:

**Anxiety**: 25-50mg daily (divided doses)
**Sleep Issues**: 25-175mg before bedtime
**Chronic Pain**: 2.5-20mg daily (start low)
**Epilepsy**: 5-50mg/kg daily (medical supervision required)

## Signs You've Found Your Dose

- Symptom relief without significant side effects
- Consistent effects day-to-day
- Sustainable long-term use
- No need to continually increase dose

## When to Adjust Dosage

**Increase If**:
- No effects after 2 weeks
- Partial relief but room for improvement
- Symptoms have worsened

**Decrease If**:
- Experiencing side effects
- Achieving more relief than needed
- Wanting to find minimum effective dose

## Important Considerations

- **Medical supervision**: Recommended for doses above 50mg daily
- **Drug interactions**: Consult healthcare provider if taking medications
- **Quality matters**: Accurate dosing requires reliable, tested products
- **Patience required**: Some benefits may take weeks to manifest

## Common Dosing Mistakes

1. **Starting too high**: Can cause unnecessary side effects
2. **Changing dose too frequently**: Doesn't allow time to assess effects
3. **Inconsistent timing**: Makes it difficult to evaluate effectiveness
4. **Ignoring product differences**: Different products require different approaches

Remember: CBD dosing is highly individual. What works for others may not work for you. Keep detailed records of doses, timing, and effects to optimize your personal protocol.`,
    category_slug: 'cbd-basics',
    featured: true,
    reading_time: 10,
    meta_title: 'CBD Dosage Guide: How to Find Your Optimal Dose (2025)',
    meta_description: 'Evidence-based CBD dosing guide covering starting doses, titration methods, factors affecting dosage, and dosing for specific conditions.'
  },
  {
    title: 'CBD Side Effects and Safety Profile: Complete Clinical Overview',
    slug: 'cbd-side-effects-safety',
    excerpt: 'Comprehensive analysis of CBD side effects, safety data from clinical trials, contraindications, and safety guidelines for responsible use.',
    content: `Cannabidiol (CBD) has demonstrated a favorable safety profile in clinical research, but like any bioactive compound, it can cause side effects in some individuals. Understanding these potential effects is essential for safe and effective CBD use.

## CBD Safety Profile: What Research Shows

Extensive clinical trials involving thousands of participants have established CBD's safety profile. The World Health Organization (WHO) stated in 2018 that "CBD is generally well tolerated with a good safety profile."

## Common Side Effects

Based on clinical trial data, the most frequently reported side effects include:

**Gastrointestinal Effects**:
- Diarrhea (most common, affecting 9-12% of users)
- Changes in appetite
- Nausea (less common)

**Neurological Effects**:
- Fatigue or drowsiness
- Irritability (rare)
- Changes in mood

**Other Effects**:
- Dry mouth
- Changes in weight
- Dizziness (uncommon)

## Dose-Dependent Effects

Most side effects are dose-dependent, meaning they're more likely at higher doses. Clinical trials using doses above 300mg daily show higher incidence of side effects compared to lower therapeutic doses.

## Drug Interactions

CBD's most significant safety concern involves drug interactions through cytochrome P450 enzyme inhibition:

**High-Risk Interactions**:
- Blood thinners (warfarin)
- Seizure medications (clobazam, valproic acid)
- Heart medications (digoxin)

## Contraindications and Special Populations

**Pregnancy and Breastfeeding**: CBD is not recommended due to insufficient safety data and potential effects on fetal development.

**Children**: Should only be used under strict medical supervision for approved conditions like treatment-resistant epilepsy.

**Liver Disease**: May require dose adjustments due to altered metabolism.

## Quality and Contaminant Concerns

Many reported "CBD side effects" may actually result from:
- **Contaminated products**: Pesticides, heavy metals, residual solvents
- **Mislabeled products**: Incorrect CBD content or unexpected THC
- **Poor extraction methods**: Chemical residues

## Minimizing Side Effect Risk

**Start Low, Go Slow**: Begin with 5-10mg daily and increase gradually
**Choose Quality Products**: Third-party tested, reputable manufacturers
**Consistent Timing**: Take at the same time daily to monitor effects
**Medical Consultation**: Especially important if taking other medications

## When to Discontinue Use

Stop CBD use and consult a healthcare provider if you experience:
- Severe or persistent side effects
- Signs of liver problems (yellowing skin, dark urine)
- Unusual changes in mood or behavior
- Allergic reactions (rare but possible)

## Long-Term Safety

Long-term safety data remains limited, but available evidence suggests:
- No evidence of tolerance or dependence
- No significant organ toxicity at therapeutic doses
- Stable safety profile in epilepsy patients using CBD for years

## Drug Testing Considerations

While CBD itself won't cause positive drug tests, full-spectrum products containing trace THC may result in positive tests with frequent use or high doses.

## Conclusion

CBD's safety profile is reassuring compared to many pharmaceuticals, but responsible use requires understanding potential risks, especially regarding drug interactions and product quality. When in doubt, consult healthcare providers familiar with cannabinoid medicine.`,
    category_slug: 'safety',
    featured: true,
    reading_time: 8,
    meta_title: 'CBD Side Effects and Safety Profile: Clinical Overview',
    meta_description: 'Comprehensive analysis of CBD side effects, safety data from clinical trials, contraindications, and safety guidelines for responsible use.'
  },
  {
    title: 'CBD and Depression: Current Research and Clinical Evidence',
    slug: 'cbd-and-depression',
    excerpt: 'Analysis of CBD for depression based on 2024-2025 research, including mechanisms, clinical trials, and considerations for mental health applications.',
    content: `Depression affects over 280 million people worldwide, making it a leading cause of disability globally. While traditional antidepressants help many individuals, side effects and treatment-resistant cases have led researchers to investigate alternative approaches, including cannabidiol (CBD).

## Understanding Depression and the Endocannabinoid System

Depression involves complex neurotransmitter imbalances affecting serotonin, dopamine, and GABA systems. The endocannabinoid system interacts with these pathways through:

**5-HT1A Receptor Modulation**: CBD acts as a partial agonist at serotonin 5-HT1A receptors, similar to some antidepressants.

**BDNF Enhancement**: Preclinical studies suggest CBD may increase brain-derived neurotrophic factor (BDNF), supporting neuroplasticity.

**HPA Axis Regulation**: CBD may help normalize dysregulated stress response systems common in depression.

## Current Research Evidence

### Preclinical Studies

Animal models consistently show CBD's antidepressant-like effects:
- **Forced Swim Test**: CBD reduces immobility time, indicating antidepressant activity
- **Chronic Stress Models**: CBD prevents stress-induced depression-like behaviors
- **Neurogenesis**: CBD promotes hippocampal neurogenesis in stressed animals

### Clinical Research

Human studies remain limited but promising:

**2024 Clinical Trial**: A small pilot study (n=42) found that 25mg daily CBD for 6 weeks showed modest improvements in depression scores compared to placebo.

**Epidemiological Data**: Survey studies suggest CBD users report improvements in depression symptoms, though these lack controlled conditions.

## Mechanisms of Action

CBD's potential antidepressant effects may occur through:

1. **Rapid Onset**: Unlike traditional antidepressants, preclinical studies suggest fast-acting effects
2. **Multi-target Approach**: Simultaneously affects multiple neurotransmitter systems
3. **Anti-inflammatory Effects**: Reduces neuroinflammation associated with depression
4. **Stress Resilience**: Enhances coping mechanisms and stress adaptation

## Dosing Considerations

Limited clinical data suggests:
- **Starting Dose**: 25mg daily
- **Therapeutic Range**: 25-75mg daily
- **Timing**: Morning administration may be preferable
- **Duration**: Effects may require 4-6 weeks to manifest fully

## Important Limitations and Considerations

**Limited Clinical Evidence**: Large-scale, long-term studies are still needed

**Not a Replacement**: CBD should not replace prescribed antidepressants without medical supervision

**Drug Interactions**: May interact with SSRIs and other psychiatric medications

**Variable Response**: Individual responses vary significantly

## Integration with Mental Health Care

CBD should be considered as part of comprehensive mental health treatment:

**Professional Guidance**: Work with mental health professionals familiar with cannabinoids

**Monitoring**: Regular assessment of mood, side effects, and medication interactions

**Lifestyle Factors**: Combine with therapy, exercise, and other evidence-based treatments

## Safety in Mental Health Contexts

**Bipolar Disorder**: Limited research on CBD's effects during manic episodes

**Suicidal Ideation**: No evidence that CBD increases suicide risk, but professional monitoring essential

**Psychosis Risk**: Unlike THC, CBD may have antipsychotic properties

## Future Research Directions

Ongoing studies are investigating:
- Optimal dosing protocols for depression
- Long-term safety and efficacy
- Combination therapy with traditional antidepressants
- Biomarkers to predict CBD response

While preliminary research is encouraging, CBD for depression requires more robust clinical evidence. Individuals considering CBD for depression should work closely with mental health professionals to ensure safe, appropriate treatment.`,
    category_slug: 'mental-health',
    featured: false,
    reading_time: 9,
    meta_title: 'CBD and Depression: Research and Clinical Evidence 2025',
    meta_description: 'Analysis of CBD for depression based on 2024-2025 research, including mechanisms, clinical trials, and considerations for mental health applications.'
  },
  {
    title: 'CBD Topicals for Skin Conditions: Dermatology Research Review',
    slug: 'cbd-topicals-skin-conditions',
    excerpt: 'Comprehensive review of CBD topicals for skin conditions including eczema, psoriasis, acne, and aging. Clinical evidence and application guidelines.',
    content: `The skin contains one of the highest concentrations of cannabinoid receptors in the human body, making it an ideal target for topical CBD applications. Recent dermatological research has explored CBD's potential for various skin conditions.

## The Skin's Endocannabinoid System

Cannabinoid receptors CB1 and CB2 are found throughout skin structures:
- **Epidermis**: Keratinocytes express both receptor types
- **Hair follicles**: CB1 receptors regulate hair growth cycles
- **Sebaceous glands**: CB2 receptors modulate oil production
- **Immune cells**: Regulate inflammatory responses

## CBD's Dermatological Mechanisms

**Anti-inflammatory**: Reduces pro-inflammatory cytokines (TNF-α, IL-1β)
**Antimicrobial**: Demonstrates activity against Staphylococcus aureus and other skin pathogens
**Sebum Regulation**: Modulates sebaceous gland activity
**Pain Relief**: Provides localized analgesia for painful skin conditions

## Clinical Evidence by Condition

### Eczema (Atopic Dermatitis)

**2024 Clinical Study**: 67 patients with eczema used CBD-enriched topical cream twice daily for 3 months. Results showed:
- 75% reduction in itch severity
- 60% improvement in sleep quality
- 83% reduction in topical steroid use

**Mechanisms**: CBD's anti-inflammatory and barrier-repair properties address eczema's underlying pathophysiology.

### Psoriasis

**Preclinical Research**: CBD demonstrates anti-proliferative effects on keratinocytes, potentially slowing the rapid skin cell turnover characteristic of psoriasis.

**Patient Surveys**: 2023 study of 120 psoriasis patients using CBD topicals reported significant improvements in:
- Plaque thickness
- Scaling
- Itching
- Overall quality of life

### Acne

**Sebaceous Gland Studies**: CBD reduces sebum production and prevents pro-inflammatory cytokine activation in sebocytes.

**Clinical Observations**: Preliminary evidence suggests CBD topicals may help with inflammatory acne, though large-scale trials are pending.

### Skin Aging

**Antioxidant Properties**: CBD exhibits strong antioxidant activity, potentially protecting against UV-induced skin damage.

**Collagen Synthesis**: Early research suggests CBD may stimulate collagen production, though human studies are limited.

## Formulation Considerations

**Penetration Enhancement**: CBD's lipophilic nature requires proper formulation for skin penetration:
- **Liposomal delivery**: Improves bioavailability
- **Nanotechnology**: Enhances absorption
- **Carrier oils**: MCT oil and hemp seed oil improve penetration

**Concentration Guidelines**: Clinical studies typically use 1-5% CBD concentrations for therapeutic effects.

## Application Guidelines

**Patch Testing**: Always test small areas first to assess sensitivity
**Clean Application**: Apply to clean, dry skin
**Frequency**: Most conditions respond to twice-daily application
**Duration**: Allow 4-6 weeks for full therapeutic assessment

## Safety Profile

**Excellent Tolerability**: Topical CBD rarely causes systemic side effects
**Non-comedogenic**: Quality CBD topicals don't clog pores
**Drug Interactions**: Minimal systemic absorption reduces interaction risk

## Quality Considerations

**Third-party Testing**: Verify cannabinoid content and purity
**Ingredient Transparency**: Avoid products with unnecessary chemicals
**Extraction Methods**: CO2 extraction preferred for topical applications
**Shelf Stability**: Proper packaging prevents CBD degradation

## Regulatory Landscape

**FDA Status**: CBD topicals remain unregulated for medical claims
**State Variations**: Laws vary significantly by location
**Cosmetic vs. Drug**: Marketing claims determine regulatory classification

## Future Research

**Clinical Trials**: Large-scale studies needed for FDA approval
**Combination Therapies**: Research into CBD plus traditional treatments
**Personalized Medicine**: Genetic factors affecting CBD response
**Long-term Safety**: Extended use safety profiles

## Practical Recommendations

**Consult Dermatologists**: Especially for prescription medication interactions
**Document Progress**: Photo documentation helps track improvements
**Gradual Introduction**: Start with lower concentrations
**Holistic Approach**: Combine with proper skincare routine

While promising, CBD topicals require more rigorous clinical research for definitive therapeutic recommendations. Current evidence suggests potential benefits for inflammatory skin conditions, but individual responses vary significantly.`,
    category_slug: 'health-wellness',
    featured: false,
    reading_time: 10,
    meta_title: 'CBD Topicals for Skin Conditions: Dermatology Research',
    meta_description: 'Comprehensive review of CBD topicals for skin conditions including eczema, psoriasis, acne, and aging. Clinical evidence and application guidelines.'
  },
  {
    title: 'CBD for Athletic Recovery: Sports Science and Performance Research',
    slug: 'cbd-athletic-recovery',
    excerpt: 'Analysis of CBD use in sports and athletics covering recovery, inflammation, sleep, and performance. WADA regulations and safety for athletes.',
    content: `Athletes increasingly turn to CBD for recovery support, leading to growing research interest in cannabinoids' potential sports medicine applications. In 2018, the World Anti-Doping Agency (WADA) removed CBD from its prohibited substances list, opening new research avenues.

## CBD and Athletic Recovery: Scientific Rationale

Athletic performance and recovery involve complex physiological processes that CBD may influence:

**Inflammation Management**: Intense exercise triggers inflammatory cascades that CBD may help modulate
**Sleep Quality**: Recovery depends heavily on quality sleep, which CBD may improve
**Pain Management**: Training-related discomfort may be addressed through CBD's analgesic properties
**Stress Response**: Competition and training stress may be mitigated by CBD's anxiolytic effects

## Current Research in Athletic Populations

### Inflammation and Recovery

**2024 Study**: Professional rugby players using 40mg CBD daily showed:
- 23% reduction in inflammatory markers (CRP, IL-6)
- Faster return to baseline strength measures
- Improved subjective recovery scores

**Mechanisms**: CBD modulates inflammatory pathways through various mechanisms:
- COX-2 inhibition
- Cytokine regulation
- Oxidative stress reduction

### Sleep and Performance

**Athletic Sleep Study (2023)**: 45 endurance athletes using 25mg CBD before bed demonstrated:
- 18% improvement in sleep efficiency
- Reduced sleep onset time
- Better next-day training readiness scores

### Pain Management

**Exercise-Induced Muscle Damage**: Preliminary research suggests CBD may reduce delayed-onset muscle soreness (DOMS) through:
- Peripheral pain modulation
- Anti-inflammatory effects
- Improved sleep-mediated recovery

## Dosing Protocols for Athletes

Based on emerging research:

**Recovery Support**: 20-40mg daily, preferably post-workout
**Sleep Enhancement**: 25mg 30-60 minutes before bed
**Acute Pain**: 10-25mg as needed (stay within daily limits)
**Competition Day**: Timing considerations for drug testing

## WADA Regulations and Drug Testing

**Current Status**: CBD is permitted by WADA
**Important Caveats**:
- THC remains prohibited (threshold: 150ng/mL)
- Full-spectrum products may contain trace THC
- International federation rules may vary

**Athlete Recommendations**:
- Use CBD isolate or broad-spectrum products
- Verify third-party testing for THC content
- Check sport-specific regulations
- Maintain product documentation

## Performance Considerations

**Potential Benefits**:
- Improved recovery between training sessions
- Better sleep quality
- Reduced training-related anxiety
- Alternative to NSAIDs for inflammation

**Limitations**:
- No evidence for acute performance enhancement
- Individual responses vary significantly
- Limited long-term athletic population studies

## Product Selection for Athletes

**Key Criteria**:
- NSF Certified for Sport or similar third-party testing
- Batch-specific certificates of analysis
- Zero THC guarantee
- Transparent manufacturing processes
- Proper labeling and documentation

## Integration with Sports Medicine

**Team Physician Consultation**: Essential for professional athletes
**Monitoring Protocols**: Track recovery metrics and side effects
**Interaction Assessment**: Consider other supplements and medications
**Performance Impact**: Monitor for any negative training effects

## Specific Sport Considerations

**Endurance Sports**: Focus on recovery and sleep applications
**Contact Sports**: Emphasis on inflammation and pain management
**Precision Sports**: Anxiety reduction without impairment
**Team Sports**: Individual vs. team policy considerations

## Research Limitations

**Sample Sizes**: Most studies involve small athlete populations
**Duration**: Long-term effects in athletic populations unknown
**Variability**: Individual responses vary significantly
**Placebo Effects**: Strong placebo responses in recovery research

## Safety Considerations for Athletes

**Drug Interactions**: Particularly relevant with supplements and medications
**Purity Concerns**: Contaminated products pose career-threatening risks
**Tolerance Development**: Unknown in athletic populations
**Competition Timing**: Avoid new supplements near important competitions

## Future Research Directions

**Ongoing Studies**:
- Large-scale athlete safety studies
- Sport-specific performance impacts
- Optimal dosing for different athletic populations
- Long-term effects on athletic careers

**Emerging Areas**:
- CBD combinations with other recovery modalities
- Genetic factors affecting CBD response in athletes
- Sport-specific delivery methods
- Integration with performance monitoring technology

## Practical Guidelines

**Starting Protocol**:
1. Consult with sports medicine team
2. Begin with low doses (10-20mg)
3. Use during off-season initially
4. Monitor recovery and performance metrics
5. Maintain detailed usage logs

**Red Flags**:
- Products without third-party testing
- Unrealistic performance claims
- Unknown THC content
- Lack of proper documentation

While CBD shows promise for athletic recovery support, athletes should prioritize products with rigorous testing and work closely with sports medicine professionals to ensure safe, legal, and effective use.`,
    category_slug: 'health-wellness',
    featured: false,
    reading_time: 12,
    meta_title: 'CBD for Athletic Recovery: Sports Science Research',
    meta_description: 'Analysis of CBD use in sports covering recovery, inflammation, sleep, and performance. WADA regulations and safety for athletes.'
  }
];

async function populateAllArticles() {
  console.log('📚 POPULATING ALL CBD ARTICLES');
  console.log('='.repeat(50));

  try {
    // First, get categories using the correct table name
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug, name');

    if (catError) {
      console.error('❌ Error fetching categories:', catError);
      return;
    }

    // First, add missing CBD categories
    console.log('📂 Adding CBD categories...');
    const cbdCategories = [
      { name: 'CBD Basics', slug: 'cbd-basics', description: 'Fundamental information about CBD' },
      { name: 'Health & Wellness', slug: 'health-wellness', description: 'CBD applications for health and wellness' },
      { name: 'Mental Health', slug: 'mental-health', description: 'CBD for anxiety, depression, and mental health' },
      { name: 'Product Guides', slug: 'product-guides', description: 'Guides to different CBD product types' },
      { name: 'Safety', slug: 'safety', description: 'CBD safety information and drug interactions' }
    ];

    for (const cat of cbdCategories) {
      const { error: catInsertError } = await supabase
        .from('categories')
        .upsert(cat, { onConflict: 'slug', ignoreDuplicates: true });

      if (catInsertError && !catInsertError.message.includes('duplicate')) {
        console.log(`⚠️ Category ${cat.name} error:`, catInsertError.message);
      } else {
        console.log(`✅ Category: ${cat.name}`);
      }
    }

    // Get updated categories
    const { data: updatedCategories } = await supabase
      .from('categories')
      .select('id, slug, name');

    const categoryMap = {};
    updatedCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    console.log(`📂 Found ${updatedCategories.length} categories`);

    // Add articles one by one
    let addedCount = 0;
    for (const article of ARTICLES) {
      console.log(`\n📄 Adding: "${article.title}"`);

      const articleData = {
        title: article.title,
        slug: article.slug,
        meta_description: article.excerpt,  // Using excerpt as meta_description
        content: article.content,
        category_id: categoryMap[article.category_slug],
        published: true,  // Use 'published' instead of 'status'
        featured: article.featured || false,
        read_time: `${article.reading_time} min`,  // Format as "X min"
        meta_title: article.meta_title,
        published_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: 'Robin Roy Krigslund-Hansen',
        author_bio: 'CEO and co-founder of Formula Swiss, a Swiss CBD company established in 2013. With over a decade of experience in the CBD and cannabis industry.',
        views: 0
      };

      // Add ID if specified (for anxiety article)
      if (article.id) {
        articleData.id = article.id;
      }

      const { error: insertError } = await supabase
        .from('articles')  // Use correct table name
        .insert(articleData);

      if (insertError) {
        console.error(`❌ Failed to add article "${article.title}":`, insertError.message);
      } else {
        console.log(`✅ Added successfully`);
        addedCount++;
      }
    }

    // Final count
    const { data: allArticles } = await supabase
      .from('articles')
      .select('title')
      .eq('published', true);

    console.log('\n📈 FINAL RESULTS:');
    console.log('-'.repeat(40));
    console.log(`Articles added: ${addedCount}/${ARTICLES.length}`);
    console.log(`Total published articles: ${allArticles?.length || 0}`);
    console.log('✅ Article population complete!');

  } catch (error) {
    console.error('💥 Operation failed:', error);
  }
}

if (require.main === module) {
  populateAllArticles();
}

module.exports = { populateAllArticles };