import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

dotenv.config()

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const articles = [
  {
    "id": "eec8d839-859a-44c5-a7b8-5de9aafd475b",
    "title": "The Science of CBD: How Cannabidiol Works in the Body",
    "slug": "how-cbd-works",
    "content": "By Robin Roy Krigslund-Hansen | 12+ years in [CBD](/glossary/cannabidiol) industry\\nLast updated: January 2026\\n\\n---\\n\\n## Quick Answer\\n\\n[Cannabidiol](/glossary/cannabidiol) (CBD) works primarily by interacting with your body's [endocannabinoid system](/glossary/endocannabinoid-system) (ECS), a complex cell-signaling network that regulates [sleep](/conditions/sleep), [mood](/conditions/mood), [pain](/conditions/pain), and immune function. Unlike THC, CBD doesn't directly activate cannabinoid receptors but instead modulates them and influences over 65 different molecular targets throughout the body.\\n\\n---\\n\\n## Understanding the Endocannabinoid System\\n\\nBefore understanding how CBD works, you need to understand the system it interacts with. The [endocannabinoid system](/glossary/endocannabinoid-system) was discovered in the 1990s by researchers studying cannabis, and it exists in all vertebrates.\\n\\nThe [ECS](/glossary/endocannabinoid-system) consists of three main components:\\n\\n| Component | Function | Examples |\\n|-----------|----------|----------|\\n| **Endocannabinoids** | Signaling molecules produced by your body | [Anandamide](/glossary/anandamide), [2-AG](/glossary/2-ag) |\\n| **Receptors** | Proteins that receive signals | [CB1](/glossary/cb1-receptor), [CB2](/glossary/cb2-receptor), [GPR55](/glossary/gpr55-receptor) |\\n| **Enzymes** | Break down endocannabinoids after use | [FAAH](/glossary/faah-enzyme), MAGL |\\n\\nThink of the ECS as your body's master regulator, constantly working to maintain [homeostasis](/glossary/homeostasis)—the stable internal balance your cells need to function properly.\\n\\n### Where Are Cannabinoid Receptors Located?\\n\\n**CB1 receptors** are predominantly found in the central [nervous system](/conditions/nervous-system)—your brain and spinal cord. They're particularly dense in areas controlling:\\n- Memory and cognition (hippocampus)\\n- Movement coordination (basal ganglia, cerebellum)\\n- Pain perception (spinal cord)\\n- Mood and [anxiety](/conditions/anxiety) (amygdala, prefrontal cortex)\\n\\n**CB2 receptors** are mainly found in peripheral tissues, especially immune cells. They play crucial roles in:\\n- Inflammatory responses\\n- Immune system regulation\\n- Bone metabolism\\n- Gastrointestinal function\\n\\n---\\n\\n## How CBD Interacts With Your Body\\n\\nUnlike [THC](/glossary/tetrahydrocannabinol), which directly binds to CB1 receptors (producing its intoxicating effects), CBD has a more complex mechanism of action. Research published in the *British Journal of Pharmacology* (2020) describes CBD as a \\\"multi-target compound\\\" with over 65 identified molecular targets.\\n\\n### 1. Indirect CB1 and CB2 Modulation\\n\\nCBD acts as a negative allosteric modulator of CB1 receptors. In simpler terms: it changes the shape of the receptor slightly, reducing how strongly other molecules (like THC or [anandamide](/glossary/anandamide)) can bind to it.\\n\\nThis explains why CBD can reduce some of THC's effects—it's essentially making the CB1 \\\"lock\\\" harder for THC to fully engage.\\n\\n### 2. FAAH Inhibition: Boosting Your Natural Endocannabinoids\\n\\nOne of CBD's most important mechanisms is inhibiting the FAAH enzyme, which breaks down [anandamide](/glossary/anandamide)—often called the \\\"bliss molecule.\\\" By slowing anandamide breakdown, CBD allows more of this natural feel-good compound to circulate in your system.\\n\\nA 2012 study in *Translational Psychiatry* found that people with higher anandamide levels reported better mood and reduced anxiety. This FAAH-inhibiting mechanism may explain CBD's [anxiolytic](/glossary/anxiolytic) effects.\\n\\n### 3. [Serotonin](/conditions/serotonin) Receptor Activation (5-HT1A)\\n\\nCBD directly activates [5-HT1A serotonin receptors](/glossary/serotonin-receptors-5ht1a), the same receptors targeted by some anti-anxiety and antidepressant medications. This activation occurs at therapeutic concentrations and may explain CBD's rapid anti-anxiety effects observed in clinical studies.\\n\\nResearch from the University of São Paulo (2019) demonstrated that a single 300mg CBD dose reduced anxiety in public speaking tests, with effects correlating to 5-HT1A receptor activity.\\n\\n### 4. TRPV1 Receptor Activation\\n\\nCBD activates [TRPV1 receptors](/glossary/trpv1-receptor) (transient receptor potential vanilloid type 1), also known as the \\\"capsaicin receptor\\\"—the same receptor triggered by chili peppers. TRPV1 plays key roles in:\\n\\n- Pain perception\\n- Body temperature regulation\\n- [Inflammation](/conditions/inflammation)\\n\\nThis mechanism helps explain CBD's potential for pain management. Interestingly, prolonged TRPV1 activation leads to desensitization, which may reduce [chronic pain](/conditions/chronic_pain) signaling over time.\\n\\n### 5. PPAR Activation\\n\\nCBD activates [peroxisome proliferator-activated receptors (PPARs)](/glossary/ppars), particularly PPAR-gamma. These nuclear receptors regulate:\\n\\n- Gene expression\\n- Metabolism and [energy](/conditions/energy) balance\\n- Anti-inflammatory responses\\n- Insulin sensitivity\\n\\nPPAR activation may explain some of CBD's potential metabolic benefits and its ability to reduce neuroinflammation.\\n\\n### 6. GPR55 Antagonism\\n\\n\\n\\n> **Related:** [CBD for Chronic Fatigue: What We Know](/articles/cbd-for-chronic-fatigue)\\n\\n[GPR55](/glossary/gpr55-receptor), sometimes called the \\\"orphan receptor,\\\" is increasingly recognized as a third cannabinoid receptor. CBD acts as an antagonist (blocker) at GPR55, which is associated with:\\n\\n- [Cancer](/conditions/cancer) cell proliferation (blocking may reduce tumor growth)\\n- Bone resorption\\n- [Blood pressure](/conditions/blood_pressure) regulation\\n\\n---\\n\\n## CBD Bioavailability: Why Delivery Method Matters\\n\\n[Bioavailability](/glossary/bioavailability) refers to the percentage of CBD that actually reaches your bloodstream and becomes available for your body to use. This is crucial because CBD is highly [lipophilic](/glossary/lipophilic) (fat-soluble) and undergoes significant [first-pass metabolism](/glossary/first-pass-metabolism) in the liver.\\n\\n### Bioavailability by Administration Route\\n\\n| Method | Bioavailability | [Onset Time](/glossary/onset-time) | [Duration](/glossary/duration-of-effects) | Notes |\\n|--------|-----------------|------------|----------|-------|\\n| **[Inhalation](/glossary/inhalation)** | 31-56% | 1-3 minutes | 2-4 hours | Fastest onset, but lung exposure concerns |\\n| **[Sublingual](/glossary/sublingual)** | 13-35% | 15-45 minutes | 4-6 hours | Bypasses first-pass metabolism |\\n| **[Oral](/glossary/oral)** | 6-19% | 30-90 minutes | 6-8 hours | Most affected by first-pass metabolism |\\n| **[Topical](/glossary/topical)** | Localized | 15-60 minutes | 4-6 hours | Does not reach systemic [circulation](/conditions/circulation) |\\n| **[Transdermal](/glossary/transdermal)** | ~46% (reported) | 1-2 hours | 8-12 hours | Steady absorption, bypasses liver |\\n\\n### Why Is Oral Bioavailability So Low?\\n\\nWhen you swallow CBD, it passes through your digestive system and liver before reaching systemic circulation. The liver's [CYP450 enzymes](/glossary/cyp450)—particularly CYP3A4 and CYP2C19—metabolize a large portion of the CBD before it can take effect.\\n\\n**Pro tip:** Taking CBD with fatty foods can increase oral bioavailability by 4-5x. A 2019 study from the University of Minnesota found that CBD absorption increased approximately 4-fold when taken with a high-fat meal.\\n\\n### Improving Bioavailability: New Formulation Technologies\\n\\n\\n> For more information, see our guide on [Why CBD Works Differently for Different People](/articles/why-cbd-works-differently).\\nResearchers are developing innovative delivery systems to improve CBD bioavailability:\\n\\n- **[Nanoemulsions](/glossary/nano-cbd):** Tiny CBD particles (< 100nm) that absorb more readily\\n- **[Liposomal](/glossary/liposomal) formulations:** CBD encapsulated in phospholipid spheres\\n- **Self-emulsifying systems:** Spontaneously form emulsions in the gut\\n- **[Water-soluble](/glossary/water-soluble) CBD:** Processed for improved aqueous dispersion\\n\\n\\n> For more information, see our guide on [How CBD Is Metabolised: Liver Processing Explained](/articles/how-cbd-metabolized).\\nA 2025 study in *Pharmaceutics* demonstrated that a novel self-nanoemulsifying formulation achieved 4.4x higher bioavailability compared to standard oil-based CBD.\\n\\n---\\n\\n## CBD Pharmacokinetics: What Happens After You Take It\\n\\n\\n> For more information, see our guide on [CBD Percentage to mg Conversion](/articles/cbd-percentage-to-mg).\\nUnderstanding CBD's [pharmacokinetics](/glossary/bioavailability)—how your body absorbs, distributes, metabolizes, and eliminates it—helps optimize dosing.\\n\\n### Absorption and Distribution\\n\\n\\n> For more information, see our guide on [How Terpenes Affect CBD: The Science of Synergy](/articles/how-terpenes-affect-cbd).\\nAfter absorption, CBD distributes widely throughout the body, with preference for fatty tissues. Its high lipophilicity means CBD can:\\n- Cross the [blood-brain barrier](/glossary/blood-brain-barrier)\\n- Accumulate in adipose (fat) tissue\\n- Have prolonged effects with repeated dosing\\n\\n### Metabolism\\n\\n\\n> For more information, see our guide on [Epidiolex: The Landmark CBD Drug Studies](/articles/epidiolex-study).\\nCBD is primarily metabolized by CYP450 liver enzymes into over 100 metabolites. The main metabolites include:\\n- 7-OH-CBD (7-hydroxy-cannabidiol)\\n- 6-OH-CBD\\n- Various carboxylic acid metabolites\\n\\n\\n> For more information, see our guide on [How CBD Affects the Brain: Neurological Mechanisms Explained](/articles/how-cbd-affects-brain).\\nThis extensive hepatic metabolism is why CBD can interact with other medications that use the same enzyme pathways.\\n\\n### Half-Life and Elimination\\n\\nCBD's [half-life](/glossary/half-life) (the time for blood levels to drop by 50%) varies significantly based on delivery method and individual factors:\\n\\n| Route | Half-Life Range |\\n|-------|-----------------|\\n| Inhalation | 27-35 hours |\\n| Oral (single dose) | 14-17 hours |\\n| Oral (chronic use) | 2-5 days |\\n| Sublingual | 12-24 hours |\\n\\nWith repeated daily dosing, CBD accumulates in tissues, which may explain why some people experience increasing benefits over time.\\n\\n---\\n\\n## The Entourage Effect: CBD in Context\\n\\nThe [entourage effect](/glossary/entourage-effect) refers to the theory that cannabis compounds work better together than in isolation. This concept distinguishes between CBD product types:\\n\\n| Product Type | Composition | Potential Entourage Effect |\\n|--------------|-------------|---------------------------|\\n| **[Full-spectrum](/glossary/full-spectrum)** | CBD + other cannabinoids + [terpenes](/glossary/terpene-profile) + [flavonoids](/glossary/flavonoids) (trace THC <0.2%) | Full entourage effect |\\n| **[Broad-spectrum](/glossary/broad-spectrum)** | CBD + other cannabinoids + terpenes + flavonoids (THC removed) | Partial entourage effect |\\n| **[CBD Isolate](/glossary/cbd-isolate)** | 99%+ pure CBD only | No entourage effect |\\n\\nA 2015 study from the Lautenberg Center for Immunology and Cancer Research found that [full-spectrum](/glossary/full-spectrum) cannabis extract was more effective than pure CBD for reducing inflammation in mice, with a bell-shaped dose-response curve for CBD [isolate](/glossary/cbd-isolate) but linear dose-response for the full extract.\\n\\n### Key Entourage Compounds\\n\\n- **[Terpenes](/glossary/terpene-profile):** [Myrcene](/glossary/myrcene) (sedating), [limonene](/glossary/limonene) (mood-lifting), [linalool](/glossary/linalool) (calming)\\n- **[Flavonoids](/glossary/flavonoids):** Cannflavins A, B, C—unique to cannabis with anti-inflammatory properties\\n- **Minor [cannabinoids](/glossary/minor-cannabinoids):** [CBG](/glossary/cannabigerol), [CBN](/glossary/cannabinol), [CBC](/glossary/cannabichromene)\\n\\n---\\n\\n## Drug Interactions: What You Need to Know\\n\\nCBD's interaction with [CYP450 enzymes](/glossary/cyp450) means it can affect how your body processes other medications. This is clinically significant and requires attention.\\n\\n### The Grapefruit Test\\n\\nA helpful rule of thumb: if your medication has a [grapefruit warning](/glossary/grapefruit-interaction), CBD may interact with it similarly. Both inhibit CYP3A4 enzymes.\\n\\n### Medications Requiring Caution\\n\\n| Drug Category | Examples | Interaction Concern |\\n|---------------|----------|---------------------|\\n| [Blood thinners](/conditions/blood-thinners) | Warfarin | Increased bleeding risk |\\n| Anti-epileptics | Clobazam, valproate | Altered drug levels |\\n| Immunosuppressants | Tacrolimus | Increased drug levels |\\n| Sedatives | Benzodiazepines | Enhanced sedation |\\n| Heart medications | Some beta-blockers | Variable effects |\\n\\nA 2025 Phase I trial found that CBD increased tacrolimus (an immunosuppressant) blood levels by approximately 60%, demonstrating the clinical significance of these interactions.\\n\\n**Always consult your healthcare provider before using CBD if you take [prescription medications](/conditions/prescription-meds).**\\n\\n---\\n\\n## Current Research Limitations\\n\\nWhile CBD research has expanded dramatically, important limitations remain:\\n\\n1. **Dosing variability:** Studies use doses ranging from 5mg to 1,500mg daily\\n2. **Product inconsistency:** Many studies use pharmaceutical-grade CBD, not consumer products\\n3. **Short study durations:** Most trials last weeks, not months or years\\n4. **Limited populations:** Many studies exclude pregnant women, [children](/conditions/children), or people with certain conditions\\n\\nThe approved CBD medication [Epidiolex](/glossary/epidiolex) uses doses of 5-20mg/kg/day for seizure disorders—far higher than typical supplement doses.\\n\\n---\\n\\n## Related Articles\\n\\n- [What is CBD Oil?](/kb/articles/cbd-oil-guide) - Complete guide to CBD oil products and usage\\n\\n---\\n\\n---\\n\\n## Related Studies\\n\\nResearch related to this topic:\\n\\n- [Cannabidiol for [Fibromyalgia](/conditions/fibromyalgia) -The CANNFIB Trial Protocol for a Randomized, Doubl... (2024)](/research/study/cbd-sleep-amris-2024) - Human Trial\\n- [Cannabidiol Modulates Right Fronto-Parietal Connectivity in Autistic Children: A... (2025)](/research/study/cannabidiol-modulates-right-fronto-parietal-connectivity-in-2025-2ecffe) - Human Trial\\n- [Individual and combined effects of Cannabidiol (CBD) and Δ9-tetrahydrocannabinol... (2020)](/research/study/individual-and-combined-effects-of-cannabidiol-cbd-and-9-tet-2020-3ff3f5) - Human Trial\\n- [Neuroimaging studies of cannabidiol and potential neurobiological mechanisms rel... (2024)](/research/study/neuroimaging-studies-of-cannabidiol-and-potential-neurobiolo-2024-7699de) - Human Trial\\n- [PAtient-Centric [epilepsy](/conditions/epilepsy) clinical trIal model For Improved health outcomes using... (2026)](/research/study/patient-centric-epilepsy-clinical-trial-model-for-improved-h-2026-12ac73) - Human Trial\\n\\n[Browse all CBD research →](/research)\\n\\n\\n## My Take\\n\\nAfter reviewing over 700 studies and testing hundreds of CBD products, I've seen the science evolve dramatically. What fascinates me most is how CBD's mechanism differs from what most people expect—it's not just about cannabinoid receptors. CBD acts more like a molecular \\\"conductor,\\\" orchestrating multiple pathways including serotonin receptors, vanilloid receptors, and even mitochondrial function.\\n\\nThe most common question I get is \\\"Why doesn't CBD work the same for everyone?\\\" The answer lies in individual ECS variations—your genetics, existing endocannabinoid levels, and even [gut health](/conditions/gut-health) all influence how you respond. I've seen people need wildly different doses (5mg vs 50mg) for similar effects because of these biological differences.\\n\\nWhat the research consistently shows is that CBD works best as part of the \\\"entourage effect\\\" with other cannabinoids and terpenes. This is why I always recommend full-spectrum products over isolates when testing shows they're truly THC-compliant.\\n\\n## Frequently Asked Questions\\n\\n### How long does it take for CBD to work?\\n\\nOnset time depends on your delivery method. [Inhalation](/glossary/inhalation) works within 1-3 minutes, [sublingual](/glossary/sublingual) absorption takes 15-45 minutes, and [oral](/glossary/oral) consumption can take 30-90 minutes. Effects also depend on whether you've eaten, your metabolism, and the [bioavailability](/glossary/bioavailability) of your specific product.\\n\\n### Why doesn't CBD get you high like THC?\\n\\nTHC directly activates [CB1 receptors](/glossary/cb1-receptor) in the brain, producing intoxication. CBD doesn't bind strongly to these receptors and actually modulates them to reduce THC's effects. CBD works through different pathways, including [serotonin](/glossary/serotonin-receptors-5ht1a) and [TRPV1 receptors](/glossary/trpv1-receptor), which influence mood and pain without intoxication.\\n\\n### Does CBD build up in your system over time?\\n\\nYes. CBD is [lipophilic](/glossary/lipophilic) (fat-soluble) and accumulates in fatty tissues with repeated use. This is why the [half-life](/glossary/half-life) increases from approximately 14-17 hours after a single dose to 2-5 days with chronic use. Many users report that CBD becomes more effective over several weeks of consistent use.\\n\\n### Can I take too much CBD?\\n\\nCBD has a favorable safety profile with no known lethal dose. However, high doses (typically above 300mg) may cause [side effects](/glossary/side-effects) including fatigue, [diarrhea](/conditions/diarrhea), and changes in [appetite](/conditions/appetite). The World Health Organization concluded in 2018 that CBD is \\\"generally well tolerated with a good safety profile.\\\"\\n\\n### Why should I take CBD with food?\\n\\nTaking CBD with fatty foods dramatically increases [bioavailability](/glossary/bioavailability). A University of Minnesota study found that CBD absorption increased approximately 4-fold when taken with a high-fat meal compared to fasting. The fats help CBD dissolve and be absorbed through the lymphatic system, partially bypassing [first-pass metabolism](/glossary/first-pass-metabolism).\\n\\n### How do I know what dose to take?\\n\\nThere's no universal CBD dose. Factors include your body weight, the condition you're addressing, product [bioavailability](/glossary/bioavailability), and individual metabolism. Most experts recommend starting low (10-25mg) and gradually increasing until you find your effective dose—a process called [titration](/glossary/titration). Keep a journal to track effects.\\n\\n---\\n\\n**Medical Disclaimer:** This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.",
    "excerpt": "Discover the science behind CBD. Learn how cannabidiol interacts with your endocannabinoid system, its multiple receptor targets, and why bioavailability matters for therapeutic effects.",
    "meta_title": "How CBD Works: The Science of Cannabidiol Explained",
    "meta_description": "Learn how CBD interacts with your endocannabinoid system, its 65+ molecular targets, bioavailability by delivery method, and why the entourage effect matters."
  }
]

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[åäö]/g, match => ({ 'å': 'a', 'ä': 'a', 'ö': 'o' }[match]))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function translateArticle(article) {
  console.log(`\\nTranslating: ${article.title}`)
  
  const prompt = `Translate this CBD article to Finnish. Follow these requirements exactly:

1. Natural Finnish, not machine-translation sounding
2. Keep markdown formatting intact
3. Keep internal links like /glossary/xxx and /conditions/xxx unchanged
4. Translate comprehensively — full articles, not summaries
5. meta_title should be ≤60 chars, meta_description ≤160 chars
6. Generate appropriate Finnish slug from title

Article to translate:

TITLE: ${article.title}

CONTENT: ${article.content}

EXCERPT: ${article.excerpt}

META_TITLE: ${article.meta_title}

META_DESCRIPTION: ${article.meta_description}

Please provide the translation in this JSON format:
{
  "title": "Finnish title",
  "slug": "finnish-slug-here",
  "content": "Full Finnish content with markdown preserved",
  "excerpt": "Finnish excerpt",
  "meta_title": "Finnish meta title (≤60 chars)",
  "meta_description": "Finnish meta description (≤160 chars)"
}`

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })

    const response = completion.content[0].text
    const jsonMatch = response.match(/\\{[\\s\\S]*\\}/)
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const translation = JSON.parse(jsonMatch[0])
    
    console.log(`✓ Translated successfully`)
    console.log(`  Title: ${translation.title}`)
    console.log(`  Slug: ${translation.slug}`)
    console.log(`  Meta title length: ${translation.meta_title.length}/60`)
    console.log(`  Meta description length: ${translation.meta_description.length}/160`)
    
    return {
      article_id: article.id,
      language: 'fi',
      title: translation.title,
      slug: translation.slug,
      content: translation.content,
      excerpt: translation.excerpt,
      meta_title: translation.meta_title,
      meta_description: translation.meta_description
    }
  } catch (error) {
    console.error(`✗ Translation failed: ${error.message}`)
    throw error
  }
}

async function insertTranslation(translation) {
  console.log(`Inserting translation for article ${translation.article_id}`)
  
  const { data, error } = await supabase
    .from('article_translations')
    .upsert(translation, {
      onConflict: 'article_id,language'
    })
    .select()

  if (error) {
    console.error(`✗ Insert failed:`, error)
    throw error
  }

  console.log(`✓ Successfully inserted translation`)
  return data
}

async function main() {
  console.log(`Starting Finnish translation batch - ${articles.length} articles`)
  console.log('Direction: ASC (oldest first)')
  console.log('\\n' + '='.repeat(50))
  
  let successCount = 0
  let failures = []

  for (const [index, article] of articles.entries()) {
    try {
      console.log(`\\n[${index + 1}/${articles.length}] Processing: ${article.title}`)
      
      const translation = await translateArticle(article)
      await insertTranslation(translation)
      
      successCount++
      console.log(`✓ Article ${index + 1} completed successfully`)
      
      // Small delay to be nice to the API
      if (index < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
    } catch (error) {
      console.error(`\\n✗ Failed to process article ${index + 1}: ${error.message}`)
      failures.push({
        index: index + 1,
        title: article.title,
        error: error.message
      })
    }
  }

  console.log('\\n' + '='.repeat(50))
  console.log('BATCH TRANSLATION COMPLETE')
  console.log('='.repeat(50))
  console.log(`✓ Successfully translated: ${successCount}/${articles.length} articles`)
  
  if (failures.length > 0) {
    console.log(`\\n✗ Failed translations (${failures.length}):`)
    failures.forEach(failure => {
      console.log(`  ${failure.index}. ${failure.title} - ${failure.error}`)
    })
  }
  
  console.log(`\\nFinnish translation batch complete. ${successCount} articles successfully inserted into article_translations table.`)
}

main().catch(console.error)