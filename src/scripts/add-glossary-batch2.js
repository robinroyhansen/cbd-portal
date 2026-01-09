const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const terms = [
  // DELIVERY METHODS & ADMINISTRATION (10)
  {
    term: "Sublingual",
    display_name: "Sublingual",
    slug: "sublingual",
    category: "dosing",
    short_definition: "Administration under the tongue for fast absorption directly into the bloodstream.",
    definition: "Sublingual administration involves placing CBD oil or tincture under the tongue and holding it for 60-90 seconds before swallowing. This allows the CBD to absorb directly into the bloodstream through the mucous membranes, bypassing first-pass metabolism in the liver.\n\nThis method offers faster onset (15-30 minutes) compared to swallowing, with better bioavailability (typically 12-35%). It's one of the most popular methods for CBD oil consumption.\n\nFor best results, avoid eating or drinking for 15 minutes after sublingual administration. The longer you hold the oil under your tongue, the more gets absorbed directly.",
    synonyms: ["Under the tongue", "Sublingual administration"]
  },
  {
    term: "Oral Administration",
    display_name: "Oral Administration",
    slug: "oral",
    category: "dosing",
    short_definition: "Swallowing CBD products like capsules or edibles for longer-lasting effects.",
    definition: "Oral administration means swallowing CBD products such as capsules, softgels, edibles, or beverages. The CBD passes through the digestive system and liver (first-pass metabolism) before entering the bloodstream.\n\nThis method has slower onset (30-90 minutes) but provides longer-lasting effects (4-8 hours). Bioavailability is lower (6-15%) due to first-pass metabolism, but taking CBD with fatty foods can improve absorption.\n\nOral administration is convenient, discreet, and provides consistent dosing. It's ideal for those seeking sustained relief throughout the day or night.",
    synonyms: ["Oral", "Ingestion", "Swallowed"]
  },
  {
    term: "Topical",
    display_name: "Topical",
    slug: "topical",
    category: "products",
    short_definition: "CBD applied directly to skin for localized relief without entering the bloodstream.",
    definition: "Topical CBD products (creams, balms, lotions, salves) are applied directly to the skin. The CBD interacts with cannabinoid receptors in the skin without entering the bloodstream, providing localized effects.\n\nTopicals are ideal for targeting specific areas of pain, inflammation, or skin conditions. Effects are typically felt within 15-45 minutes and can last several hours. They don't produce systemic effects or show up on drug tests.\n\nLook for products with adequate CBD concentration (at least 3-8mg per ml) and complementary ingredients like menthol, arnica, or essential oils for enhanced benefits.",
    synonyms: ["Topical CBD", "CBD cream", "CBD balm"]
  },
  {
    term: "Transdermal",
    display_name: "Transdermal",
    slug: "transdermal",
    category: "products",
    short_definition: "CBD patches or gels that penetrate skin to enter the bloodstream for sustained release.",
    definition: "Transdermal CBD products are designed to penetrate through all layers of skin and enter the bloodstream, unlike topicals which only affect local areas. This typically involves patches or specially formulated gels with penetration enhancers.\n\nTransdermal delivery provides sustained, consistent release over extended periods (8-12+ hours). It bypasses first-pass metabolism, offering better bioavailability than oral consumption.\n\nTransdermal patches are convenient, discreet, and maintain steady blood levels of CBD. They're particularly useful for those needing consistent relief throughout the day.",
    synonyms: ["Transdermal patch", "CBD patch", "Transdermal delivery"]
  },
  {
    term: "Inhalation",
    display_name: "Inhalation",
    slug: "inhalation",
    category: "dosing",
    short_definition: "Breathing CBD vapor or smoke into lungs for the fastest onset of effects.",
    definition: "Inhalation delivers CBD directly to the lungs where it rapidly enters the bloodstream. This includes both vaporization (vaping) and smoking methods.\n\nInhalation provides the fastest onset of any consumption method (1-5 minutes) with high bioavailability (up to 56%). However, effects are shorter-lasting (1-3 hours) compared to other methods.\n\nVaping is considered less harmful than smoking as it doesn't involve combustion. Inhalation is useful for acute situations requiring rapid relief but may not be suitable for those with respiratory conditions.",
    synonyms: ["Inhaled", "Vaping", "Smoking"]
  },
  {
    term: "Vaporization",
    display_name: "Vaporization",
    slug: "vaporization",
    category: "dosing",
    short_definition: "Heating CBD to release vapor without combustion, considered safer than smoking.",
    definition: "Vaporization (vaping) heats CBD oil, concentrate, or flower to a temperature that releases cannabinoids and terpenes as vapor without burning the material. This avoids the harmful byproducts of combustion.\n\nVaping offers rapid onset (1-5 minutes) and high bioavailability. Temperature control allows users to optimize for flavor (lower temps) or vapor production (higher temps). Portable and desktop vaporizers are available.\n\nWhile considered safer than smoking, concerns exist about certain vape additives. Choose products with clean ingredients and avoid vitamin E acetate or other harmful cutting agents.",
    synonyms: ["Vaping", "Vaporizing", "Vape"]
  },
  {
    term: "Edible",
    display_name: "Edible",
    slug: "edible",
    category: "products",
    short_definition: "Food or drink products infused with CBD for convenient, tasty consumption.",
    definition: "CBD edibles are food and beverage products infused with cannabidiol. Popular forms include gummies, chocolates, cookies, beverages, and cooking oils. They offer a familiar, enjoyable way to consume CBD.\n\nEdibles have slower onset (30-90 minutes) as they must pass through the digestive system, but effects last longer (4-8 hours). Bioavailability is lower than sublingual or inhaled methods.\n\nEdibles provide precise, pre-measured doses and are extremely discreet. They're ideal for those who dislike the taste of CBD oil or prefer a more enjoyable consumption experience.",
    synonyms: ["CBD edibles", "CBD gummies", "CBD food"]
  },
  {
    term: "CBD Patch",
    display_name: "CBD Patch",
    slug: "patch",
    category: "products",
    short_definition: "Adhesive patch delivering CBD through the skin over extended periods.",
    definition: "CBD patches are adhesive patches applied to the skin that deliver cannabidiol transdermally over extended periods, typically 8-12 hours or longer. They provide consistent, controlled dosing without the need to remember multiple doses.\n\nPatches use permeation enhancers to help CBD pass through the skin barrier and into the bloodstream. They're waterproof and can be worn during normal activities including showering and exercise.\n\nCBD patches are ideal for those seeking sustained relief, consistent blood levels, and convenient once-daily (or less frequent) application. They're discreet and won't interfere with other medications taken orally.",
    synonyms: ["Transdermal patch", "CBD transdermal"]
  },
  {
    term: "Suppository",
    display_name: "Suppository",
    slug: "suppository",
    category: "products",
    short_definition: "CBD inserted rectally or vaginally for high absorption when oral use isn't possible.",
    definition: "CBD suppositories are solid forms of CBD designed for rectal or vaginal insertion. Once inserted, body heat melts the suppository, releasing CBD which absorbs through the mucosal membranes.\n\nSuppositories offer high bioavailability (potentially 50-70%) because they partially bypass first-pass liver metabolism. They're useful when oral administration is difficult due to nausea, swallowing issues, or digestive problems.\n\nRectal suppositories may help with localized conditions in the pelvic region. Vaginal suppositories are used for menstrual discomfort and other gynecological concerns. This method is more common in medical settings.",
    synonyms: ["Rectal suppository", "Vaginal suppository"]
  },
  {
    term: "Nasal Spray",
    display_name: "Nasal Spray",
    slug: "nasal-spray",
    category: "products",
    short_definition: "CBD delivered through nasal membranes for fast absorption without digestion.",
    definition: "CBD nasal sprays deliver cannabidiol through the nasal mucosa directly into the bloodstream. This emerging delivery method bypasses the digestive system and first-pass metabolism.\n\nNasal delivery offers rapid onset (5-10 minutes) and potentially high bioavailability. The nasal passages have rich blood supply and thin mucous membranes ideal for drug absorption.\n\nNasal sprays are convenient, portable, and provide consistent dosing. They may be particularly useful for conditions requiring quick relief. This delivery method is still developing in the CBD market.",
    synonyms: ["CBD nasal spray", "Intranasal"]
  },

  // QUALITY & TESTING TERMS (10)
  {
    term: "Third-Party Testing",
    display_name: "Third-Party Testing",
    slug: "third-party-testing",
    category: "legal",
    short_definition: "Independent laboratory analysis verifying CBD product quality, potency, and purity.",
    definition: "Third-party testing refers to independent laboratory analysis of CBD products by facilities not affiliated with the manufacturer. These labs test for cannabinoid content, contaminants, and other quality markers.\n\nThird-party testing is considered essential for CBD quality assurance because it provides unbiased verification. Labs check potency (actual CBD/THC content), pesticides, heavy metals, residual solvents, and microbial contamination.\n\nReputable CBD brands make their third-party lab reports (Certificates of Analysis) readily available, often via QR codes on packaging or their websites. Always verify lab reports before purchasing CBD products.",
    synonyms: ["Independent testing", "Lab testing", "COA testing"]
  },
  {
    term: "Heavy Metals Testing",
    display_name: "Heavy Metals Testing",
    slug: "heavy-metals-testing",
    category: "legal",
    short_definition: "Lab analysis checking for toxic metals like lead, mercury, arsenic, and cadmium in CBD products.",
    definition: "Heavy metals testing screens CBD products for toxic metals including lead, mercury, arsenic, and cadmium. These metals can contaminate cannabis through soil, water, fertilizers, or processing equipment.\n\nCannabis is a bioaccumulator, meaning it absorbs substances from its growing environment, including heavy metals. Concentrates can further concentrate these contaminants.\n\nLong-term exposure to heavy metals can cause serious health problems. Quality CBD products should test below established safety thresholds. Always check lab reports for heavy metals panel results.",
    synonyms: ["Metal testing", "Toxic metals screening"]
  },
  {
    term: "Pesticide Testing",
    display_name: "Pesticide Testing",
    slug: "pesticide-testing",
    category: "legal",
    short_definition: "Laboratory screening for harmful pesticide residues in CBD products.",
    definition: "Pesticide testing analyzes CBD products for residues from insecticides, fungicides, herbicides, and other agricultural chemicals. This is critical because cannabis concentrates can contain pesticide levels many times higher than the original flower.\n\nMany pesticides are neurotoxic, carcinogenic, or otherwise harmful to human health. Some can be particularly dangerous when heated and inhaled through vaping.\n\nQuality CBD products should be certified pesticide-free or show results below detection limits. Organic hemp reduces pesticide concerns but doesn't guarantee zero contamination.",
    synonyms: ["Pesticide screening", "Agricultural chemical testing"]
  },
  {
    term: "Residual Solvents",
    display_name: "Residual Solvents",
    slug: "residual-solvents",
    category: "extraction",
    short_definition: "Leftover extraction chemicals in CBD products that should be below safe thresholds.",
    definition: "Residual solvents are chemicals remaining in CBD extracts from the extraction process. Common solvents include butane, propane, ethanol, and hexane. Even CO2 extraction may use solvents in post-processing.\n\nWhile small amounts of many solvents are considered safe, excessive levels can be harmful, especially when inhaled. Different jurisdictions set different acceptable limits.\n\nQuality CBD products should test below established safety thresholds for all solvents used in production. Lab reports typically show either 'ND' (not detected) or specific levels in parts per million (ppm).",
    synonyms: ["Solvent residue", "Residual solvent testing"]
  },
  {
    term: "Microbial Testing",
    display_name: "Microbial Testing",
    slug: "microbial-testing",
    category: "legal",
    short_definition: "Testing for bacteria, mold, yeast, and other microorganisms in CBD products.",
    definition: "Microbial testing screens CBD products for potentially harmful microorganisms including bacteria (E. coli, Salmonella), mold, yeast, and fungi. Cannabis can harbor these organisms during cultivation, processing, or storage.\n\nMicrobial contamination is particularly dangerous for immunocompromised individuals, cancer patients, and those with respiratory conditions. Inhaling contaminated products can cause serious infections.\n\nQuality CBD products should pass microbial testing with counts below established limits. Proper cultivation, processing, and storage practices minimize contamination risks.",
    synonyms: ["Microbiological testing", "Mold testing", "Pathogen testing"]
  },
  {
    term: "Potency Testing",
    display_name: "Potency Testing",
    slug: "potency-testing",
    category: "legal",
    short_definition: "Lab analysis measuring cannabinoid concentrations to verify label accuracy.",
    definition: "Potency testing measures the concentration of cannabinoids (CBD, THC, CBG, etc.) in a product. Results are typically expressed as percentages or milligrams, allowing verification of label claims.\n\nPotency testing is essential for accurate dosing and legal compliance (verifying THC is below legal limits). Studies have found significant discrepancies between labeled and actual CBD content in many products.\n\nLook for potency results within 10-15% of label claims. Some variance is normal, but large discrepancies indicate poor quality control. Full cannabinoid profiles show all detected cannabinoids, not just CBD and THC.",
    synonyms: ["Cannabinoid testing", "Potency analysis"]
  },
  {
    term: "Batch Number",
    display_name: "Batch Number",
    slug: "batch-number",
    category: "legal",
    short_definition: "Unique identifier linking CBD products to specific production runs and lab reports.",
    definition: "A batch number (or lot number) is a unique identifier assigned to products from the same production run. It allows traceability from raw materials through manufacturing to the final product.\n\nBatch numbers enable quality control, recall management, and matching products to specific lab reports. Each batch should have its own Certificate of Analysis (COA) since cannabinoid content and contaminant levels can vary between batches.\n\nWhen checking lab reports, verify the batch number on your product matches the batch number on the COA. Reports from different batches may not accurately represent your specific product.",
    synonyms: ["Lot number", "Production batch"]
  },
  {
    term: "Lab Report",
    display_name: "Lab Report",
    slug: "lab-report",
    category: "legal",
    short_definition: "Document showing test results from independent laboratory analysis of CBD products.",
    definition: "A lab report (Certificate of Analysis or COA) is an official document from an independent laboratory detailing test results for a CBD product. It should include potency, contaminant testing, and the specific batch tested.\n\nKey elements to verify: lab name and accreditation, product name and batch number, date of testing, cannabinoid potency results, and contaminant panels (pesticides, heavy metals, solvents, microbials).\n\nReputable brands make lab reports easily accessible via QR codes on packaging or their websites. If you can't find or verify a lab report, consider choosing a different product.",
    synonyms: ["COA", "Certificate of Analysis", "Test report"]
  },
  {
    term: "Contamination",
    display_name: "Contamination",
    slug: "contamination",
    category: "medical",
    short_definition: "Presence of unwanted harmful substances in CBD products.",
    definition: "Contamination refers to the presence of unwanted substances in CBD products that can pose health risks. Common contaminants include pesticides, heavy metals, residual solvents, microbes, and even synthetic cannabinoids.\n\nContamination can occur during cultivation (pesticides, heavy metals from soil), extraction (solvents), processing (microbials), or through intentional adulteration (synthetic cannabinoids in illegal products).\n\nConsuming contaminated CBD products can cause various health problems from mild to severe. Third-party testing and purchasing from reputable sources minimizes contamination risks.",
    synonyms: ["Adulterants", "Impurities"]
  },
  {
    term: "Quality Assurance",
    display_name: "Quality Assurance (QA)",
    slug: "quality-assurance",
    category: "legal",
    short_definition: "Systematic processes ensuring CBD products consistently meet safety and quality standards.",
    definition: "Quality Assurance (QA) encompasses all systematic processes and procedures that ensure CBD products consistently meet defined quality and safety standards throughout production.\n\nQA includes raw material testing, in-process controls, final product testing, documentation, and continuous improvement processes. Companies with robust QA programs produce more reliable, consistent products.\n\nLook for brands that emphasize their QA processes, have GMP certification, maintain complete traceability, and provide comprehensive third-party testing. These indicators suggest a commitment to quality beyond minimum requirements.",
    synonyms: ["QA", "Quality control", "Quality management"]
  },

  // RESEARCH/STUDY TERMS (10)
  {
    term: "Clinical Trial",
    display_name: "Clinical Trial",
    slug: "clinical-trial",
    category: "medical",
    short_definition: "Controlled research study testing treatments in human participants.",
    definition: "Clinical trials are research studies that test treatments, interventions, or devices in human participants. They're the gold standard for determining whether a treatment is safe and effective.\n\nTrials progress through phases: Phase I (safety in small groups), Phase II (efficacy and side effects), Phase III (large-scale confirmation), and Phase IV (post-market surveillance). Each phase provides increasingly robust evidence.\n\nCBD has limited clinical trial data compared to pharmaceutical drugs, though Epidiolex underwent full clinical trials. More trials are needed to establish CBD's efficacy for various conditions.",
    synonyms: ["Human trial", "Clinical study"]
  },
  {
    term: "Placebo Effect",
    display_name: "Placebo Effect",
    slug: "placebo-effect",
    category: "medical",
    short_definition: "Improvement in a condition from an inactive treatment due to psychological factors.",
    definition: "The placebo effect occurs when patients experience real improvements after receiving inactive treatments (placebos), purely due to their belief and expectations. It's a powerful phenomenon that complicates medical research.\n\nClinical trials use placebos to separate actual drug effects from psychological factors. Without placebo controls, it's impossible to know if improvements are from the treatment or the placebo effect.\n\nThe placebo effect is particularly relevant for CBD given the strong marketing claims and user expectations. Well-designed trials with placebo controls are essential for establishing CBD's true therapeutic effects.",
    synonyms: ["Placebo response"]
  },
  {
    term: "Double-Blind Study",
    display_name: "Double-Blind Study",
    slug: "double-blind-study",
    category: "medical",
    short_definition: "Research where neither participants nor researchers know who receives treatment vs. placebo.",
    definition: "A double-blind study is a clinical trial design where neither the participants nor the researchers know who is receiving the active treatment versus the placebo. This is achieved through coding known only to an independent party.\n\nDouble-blinding eliminates bias from both sides: patients can't have different expectations based on their group, and researchers can't unconsciously influence assessments. This provides the most reliable results.\n\nDouble-blind, placebo-controlled trials are considered the gold standard for medical research. Most CBD clinical evidence comes from less rigorous study designs.",
    synonyms: ["Double-blind trial", "Blinded study"]
  },
  {
    term: "In Vitro",
    display_name: "In Vitro",
    slug: "in-vitro",
    category: "medical",
    short_definition: "Research conducted in test tubes or petri dishes outside of living organisms.",
    definition: "In vitro (Latin: 'in glass') research is conducted outside living organisms, typically in test tubes, petri dishes, or other laboratory vessels using cells or tissues. It allows controlled study of specific mechanisms.\n\nIn vitro studies are valuable for early research, understanding basic mechanisms, and initial safety screening. However, results don't always translate to living systems or humans.\n\nMany CBD research findings are from in vitro studies. While promising, these results require verification through in vivo (animal) and clinical (human) studies before making health claims.",
    synonyms: ["Test tube study", "Cell study"]
  },
  {
    term: "In Vivo",
    display_name: "In Vivo",
    slug: "in-vivo",
    category: "medical",
    short_definition: "Research conducted in living organisms like animals or humans.",
    definition: "In vivo (Latin: 'in life') research is conducted in living organisms, including animal studies and human clinical trials. It examines how substances behave in complex biological systems.\n\nIn vivo studies are more relevant than in vitro because they account for absorption, metabolism, distribution, and elimination. However, animal results don't always predict human responses.\n\nCBD has substantial in vivo research in animal models showing various therapeutic effects. Human clinical trials are more limited but provide the most relevant evidence for medical applications.",
    synonyms: ["Animal study", "Living organism study"]
  },
  {
    term: "Preclinical Study",
    display_name: "Preclinical Study",
    slug: "preclinical-study",
    category: "medical",
    short_definition: "Research phase before human trials including laboratory and animal studies.",
    definition: "Preclinical studies are research conducted before human clinical trials. They include in vitro (cell/tissue) studies and in vivo (animal) studies to assess basic safety, toxicity, and potential efficacy.\n\nPreclinical research helps determine whether a compound is promising enough to advance to human trials and identifies appropriate dosing ranges. It's required before regulatory agencies approve human testing.\n\nMuch CBD research is preclinical. While preclinical results are often promising, many compounds that work in animals fail in humans. Preclinical evidence should be interpreted cautiously.",
    synonyms: ["Animal study", "Pre-human research"]
  },
  {
    term: "Peer Review",
    display_name: "Peer Review",
    slug: "peer-review",
    category: "medical",
    short_definition: "Expert evaluation of scientific research before publication to ensure quality.",
    definition: "Peer review is the process by which scientific experts evaluate research before publication in academic journals. Reviewers assess methodology, data analysis, conclusions, and overall scientific merit.\n\nPeer review helps ensure published research meets quality standards and catches errors or flaws. However, it's not perfect and doesn't guarantee accuracy. Peer-reviewed research is generally more reliable than non-reviewed claims.\n\nWhen evaluating CBD information, look for peer-reviewed sources rather than marketing materials or unverified claims. Peer-reviewed studies undergo scientific scrutiny.",
    synonyms: ["Peer-reviewed", "Scientific review"]
  },
  {
    term: "Systematic Review",
    display_name: "Systematic Review",
    slug: "systematic-review",
    category: "medical",
    short_definition: "Comprehensive analysis of all available research on a topic using rigorous methodology.",
    definition: "A systematic review is a comprehensive summary of all available research on a specific topic, using rigorous, predefined methodology to minimize bias. It provides a high-level overview of the evidence.\n\nSystematic reviews use specific search strategies, inclusion/exclusion criteria, and quality assessments to identify and evaluate all relevant studies. They're considered higher-quality evidence than individual studies.\n\nFor CBD, systematic reviews help synthesize findings from multiple studies to assess overall evidence for various conditions. They identify gaps in research and areas needing further study.",
    synonyms: ["Evidence synthesis", "Literature review"]
  },
  {
    term: "Meta-Analysis",
    display_name: "Meta-Analysis",
    slug: "meta-analysis",
    category: "medical",
    short_definition: "Statistical method combining results from multiple studies for stronger evidence.",
    definition: "Meta-analysis is a statistical technique that combines data from multiple studies to produce a single, more precise estimate of effect. It provides stronger evidence than individual studies by increasing sample size and statistical power.\n\nMeta-analyses are typically conducted as part of systematic reviews. They can detect effects that individual studies were too small to identify and assess consistency across studies.\n\nMeta-analyses of CBD research can provide clearer answers about efficacy than conflicting individual studies. However, they're only as good as the included studies and can be affected by publication bias.",
    synonyms: ["Pooled analysis", "Combined analysis"]
  },
  {
    term: "Efficacy",
    display_name: "Efficacy",
    slug: "efficacy",
    category: "medical",
    short_definition: "How well a treatment works under ideal, controlled conditions.",
    definition: "Efficacy refers to how well a treatment works under ideal, controlled conditions such as clinical trials. It measures the maximum potential benefit when the treatment is used optimally.\n\nEfficacy differs from effectiveness, which measures how well a treatment works in real-world conditions where compliance, dosing, and other factors vary. A treatment can have high efficacy but lower effectiveness.\n\nCBD efficacy has been demonstrated in clinical trials for certain conditions (like Epidiolex for seizures), but efficacy for many other claimed uses remains unestablished due to limited rigorous research.",
    synonyms: ["Treatment efficacy", "Clinical efficacy"]
  },

  // CANNABIS PLANT ANATOMY (10)
  {
    term: "Trichome",
    display_name: "Trichome",
    slug: "trichome",
    category: "medical",
    short_definition: "Tiny crystal-like glands on cannabis that produce cannabinoids and terpenes.",
    definition: "Trichomes are microscopic, crystal-like glandular structures found primarily on cannabis flowers and sugar leaves. They produce and store cannabinoids, terpenes, and flavonoids—the compounds responsible for cannabis's effects and aroma.\n\nTrichomes appear as a frosty, sparkling coating and change color as they mature (clear to milky to amber). Harvest timing based on trichome color affects the final cannabinoid profile.\n\nKief, hash, and other concentrates are essentially collections of separated trichomes. The density and quality of trichomes largely determines the potency and quality of cannabis flower.",
    synonyms: ["Resin glands", "Crystal", "Trichomes"]
  },
  {
    term: "Flower",
    display_name: "Flower (Bud)",
    slug: "flower",
    category: "products",
    short_definition: "The smokable part of the cannabis plant containing the highest cannabinoid concentration.",
    definition: "Cannabis flower (or bud) refers to the harvested, dried flowering parts of the female cannabis plant. It's the most recognizable cannabis product and contains the highest concentration of cannabinoids and terpenes.\n\nFlower can be smoked, vaporized, or used to make extracts and edibles. Hemp flower is legally sold in many places as it contains less than 0.3% THC while providing CBD and other cannabinoids.\n\nWhen purchasing CBD flower, look for third-party lab reports confirming cannabinoid content and absence of contaminants. Quality flower should have visible trichomes and a strong, pleasant aroma.",
    synonyms: ["Bud", "Cannabis flower", "Hemp flower", "Nug"]
  },
  {
    term: "Hemp",
    display_name: "Hemp",
    slug: "hemp",
    category: "legal",
    short_definition: "Cannabis containing ≤0.3% THC, legal source of CBD in most jurisdictions.",
    definition: "Hemp is cannabis sativa containing 0.3% THC or less (US definition) or 0.2% or less (EU definition). This low THC content distinguishes it legally from marijuana and makes it non-intoxicating.\n\nThe 2018 US Farm Bill legalized hemp cultivation and hemp-derived products including CBD. Hemp has been cultivated for thousands of years for fiber, seeds, and oil in addition to cannabinoids.\n\nMost legal CBD products are derived from hemp rather than marijuana. Hemp can still contain significant amounts of CBD and other beneficial cannabinoids without the legal restrictions of high-THC cannabis.",
    synonyms: ["Industrial hemp", "Hemp plant"]
  },
  {
    term: "Marijuana",
    display_name: "Marijuana",
    slug: "marijuana",
    category: "legal",
    short_definition: "Cannabis containing more than 0.3% THC, psychoactive and legally restricted.",
    definition: "Marijuana refers to cannabis containing more than 0.3% THC (US) or 0.2% THC (EU). This higher THC content produces psychoactive effects and subjects it to controlled substance laws in most jurisdictions.\n\nThe term 'marijuana' has complicated history and some consider it derogatory due to its origins in anti-cannabis propaganda. Many prefer 'cannabis' as a neutral scientific term.\n\nMarijuana-derived CBD products are only legal in states/countries with medical or recreational cannabis programs. They may contain higher THC levels than hemp-derived alternatives.",
    synonyms: ["Cannabis", "Weed", "Pot", "Ganja"]
  },
  {
    term: "Cannabis Sativa",
    display_name: "Cannabis Sativa",
    slug: "cannabis-sativa",
    category: "medical",
    short_definition: "A cannabis species traditionally associated with uplifting, energizing effects.",
    definition: "Cannabis sativa is one of the main cannabis species, traditionally characterized by tall plants with narrow leaves and longer flowering times. Both hemp and marijuana can be Cannabis sativa.\n\nTraditionally, sativa strains were associated with uplifting, energizing, cerebral effects. However, modern research suggests the indica/sativa distinction is poor for predicting effects—cannabinoid and terpene profiles matter more.\n\nThe sativa classification remains useful for describing plant morphology and growth characteristics but should not be relied upon for predicting therapeutic or psychoactive effects.",
    synonyms: ["Sativa", "C. sativa"]
  },
  {
    term: "Cannabis Indica",
    display_name: "Cannabis Indica",
    slug: "cannabis-indica",
    category: "medical",
    short_definition: "A cannabis variety traditionally associated with relaxing, sedating effects.",
    definition: "Cannabis indica is a cannabis variety traditionally characterized by shorter, bushier plants with broader leaves and shorter flowering times. It originated in the Hindu Kush mountain region.\n\nTraditionally, indica strains were associated with relaxing, sedating, body-focused effects. However, modern science shows the indica/sativa distinction doesn't reliably predict effects—chemical profile matters more.\n\nWhile still used colloquially, experts increasingly emphasize that cannabinoid and terpene profiles are better predictors of effects than indica/sativa classification.",
    synonyms: ["Indica", "C. indica"]
  },
  {
    term: "Strain",
    display_name: "Strain",
    slug: "strain",
    category: "products",
    short_definition: "A specific variety of cannabis with distinct characteristics, being replaced by 'cultivar'.",
    definition: "Strain is a commonly used term for specific varieties of cannabis with distinct characteristics such as appearance, aroma, cannabinoid content, and effects. Examples include Charlotte's Web, ACDC, and Suver Haze.\n\nThe term 'strain' is technically incorrect in botanical terms—'cultivar' (cultivated variety) is more accurate. However, 'strain' remains widely used in the cannabis industry and consumer markets.\n\nWhen selecting CBD products, the specific strain/cultivar can affect the overall experience due to varying cannabinoid ratios and terpene profiles.",
    synonyms: ["Variety", "Genetics"]
  },
  {
    term: "Cultivar",
    display_name: "Cultivar",
    slug: "cultivar",
    category: "products",
    short_definition: "A cultivated variety of cannabis bred for specific desirable characteristics.",
    definition: "Cultivar (short for 'cultivated variety') is the botanically correct term for plant varieties created through selective breeding. In cannabis, cultivars are bred for specific traits like cannabinoid content, terpene profile, yield, or disease resistance.\n\nThe term is increasingly used instead of 'strain' as the cannabis industry becomes more scientific and agricultural. Both terms refer to the same concept.\n\nDifferent CBD hemp cultivars can have vastly different cannabinoid ratios, terpene profiles, and therefore potentially different effects and therapeutic applications.",
    synonyms: ["Strain", "Variety", "Chemovar"]
  },
  {
    term: "Terpene Profile",
    display_name: "Terpene Profile",
    slug: "terpene-profile",
    category: "medical",
    short_definition: "The specific combination and concentration of terpenes in a cannabis product.",
    definition: "A terpene profile describes the specific combination and relative concentrations of terpenes present in a cannabis product. It's like a fingerprint that determines aroma, flavor, and potentially therapeutic effects.\n\nTerpene profiles vary between cultivars and even between batches of the same cultivar. Common terpenes include myrcene, limonene, pinene, and linalool, each associated with different potential effects.\n\nUnderstanding terpene profiles can help consumers select products aligned with their needs. Products high in myrcene may be more sedating, while limonene-dominant products may be more uplifting.",
    synonyms: ["Terp profile", "Terpene composition"]
  },
  {
    term: "Cannabinoid Profile",
    display_name: "Cannabinoid Profile",
    slug: "cannabinoid-profile",
    category: "medical",
    short_definition: "The specific combination and concentration of cannabinoids in a product.",
    definition: "A cannabinoid profile describes the specific types and concentrations of cannabinoids present in a cannabis product. This includes CBD, THC, CBG, CBN, CBC, and potentially dozens of other cannabinoids.\n\nThe cannabinoid profile determines potency, effects, and legal status. Full-spectrum products have complete profiles; broad-spectrum products lack THC; isolates contain only one cannabinoid.\n\nDifferent cannabinoid ratios can produce different effects. A high-CBD, low-THC profile is non-intoxicating; equal CBD:THC ratios may have balanced effects; high-THC profiles are intoxicating.",
    synonyms: ["Cannabinoid composition", "Cannabinoid content"]
  },

  // LEGAL & REGULATORY - EU FOCUS (10)
  {
    term: "Novel Food",
    display_name: "Novel Food (EU)",
    slug: "novel-food",
    category: "legal",
    short_definition: "EU classification requiring authorization for foods not significantly consumed before 1997.",
    definition: "Novel Food is an EU regulatory classification for foods that weren't consumed significantly in the EU before May 1997. Such foods require pre-market authorization demonstrating safety before they can be legally sold.\n\nCBD extracts and isolates are classified as Novel Foods in the EU and UK, requiring companies to submit validated Novel Food applications. This has significantly impacted the CBD market.\n\nThe UK FSA maintains a public list of CBD products with validated Novel Food applications. Products not on this list face potential enforcement action. The authorization process is lengthy and expensive.",
    synonyms: ["Novel Food Regulation", "EU Novel Food"]
  },
  {
    term: "FSA",
    display_name: "FSA (UK Food Standards Agency)",
    slug: "fsa",
    category: "legal",
    short_definition: "UK regulatory body overseeing CBD as a Novel Food and maintaining the validated products list.",
    definition: "The Food Standards Agency (FSA) is the UK government body responsible for food safety and standards. Following Brexit, the FSA independently regulates CBD as a Novel Food in the UK.\n\nThe FSA maintains a public list of CBD products that have credible Novel Food applications. Products not on this list may be removed from sale. The FSA has set guidelines for daily CBD intake (70mg).\n\nConsumers in the UK can check the FSA's public list to verify if their CBD products have validated applications, indicating they've undergone safety review.",
    synonyms: ["Food Standards Agency", "UK FSA"]
  },
  {
    term: "0.2% THC Limit",
    display_name: "0.2% THC Limit (EU)",
    slug: "eu-thc-limit",
    category: "legal",
    short_definition: "Maximum THC content for legal hemp in most EU countries.",
    definition: "The 0.2% THC limit is the maximum THC concentration allowed in legal hemp in most EU member states. Plants or products exceeding this threshold may be classified as controlled substances.\n\nThis limit applies to hemp cultivation and often to finished CBD products, though regulations vary by country. It's stricter than the US limit of 0.3%.\n\nSome EU countries have even stricter limits or different rules for finished products. Switzerland allows 1% THC. Always verify local regulations as they vary significantly across Europe.",
    synonyms: ["EU THC threshold", "European THC limit"]
  },
  {
    term: "0.3% THC Limit",
    display_name: "0.3% THC Limit (US)",
    slug: "us-thc-limit",
    category: "legal",
    short_definition: "Maximum THC content for legal hemp in the United States under the 2018 Farm Bill.",
    definition: "The 0.3% THC limit is the legal threshold defining hemp versus marijuana in the United States under the 2018 Farm Bill. Cannabis containing more than 0.3% THC is federally classified as marijuana.\n\nThis limit applies to hemp cultivation and hemp-derived products. CBD products must contain less than 0.3% THC to be federally legal, though state laws may vary.\n\nThe 0.3% threshold is somewhat arbitrary and stricter than some jurisdictions (Switzerland: 1%) but more lenient than the EU (0.2%). Products near this limit should have batch-specific testing to ensure compliance.",
    synonyms: ["US THC threshold", "Farm Bill limit"]
  },
  {
    term: "Prescription CBD",
    display_name: "Prescription CBD",
    slug: "prescription-cbd",
    category: "legal",
    short_definition: "Pharmaceutical-grade CBD requiring a doctor's prescription.",
    definition: "Prescription CBD refers to pharmaceutical-grade CBD products that require a doctor's prescription. The primary example is Epidiolex (Epidyolex in Europe), approved for certain severe epilepsy syndromes.\n\nPrescription CBD undergoes rigorous clinical trials, quality control, and regulatory approval. It meets pharmaceutical standards significantly higher than over-the-counter supplements.\n\nPrescription CBD is appropriate for specific medical conditions where efficacy has been demonstrated. It's typically more expensive than OTC products but may be covered by insurance and offers assured quality and dosing.",
    synonyms: ["Pharmaceutical CBD", "Rx CBD"]
  },
  {
    term: "Over-the-Counter CBD",
    display_name: "Over-the-Counter CBD",
    slug: "otc-cbd",
    category: "legal",
    short_definition: "CBD products sold without prescription as supplements or cosmetics.",
    definition: "Over-the-counter (OTC) CBD products are sold directly to consumers without a prescription, typically as dietary supplements, cosmetics, or wellness products. Quality varies significantly between brands.\n\nOTC CBD products don't undergo the same rigorous testing as prescription pharmaceuticals. Consumers must rely on third-party testing and brand reputation to assess quality.\n\nWhen buying OTC CBD, look for: third-party lab reports, clear ingredient lists, appropriate pricing (very cheap products may be low quality), and established brands with transparent practices.",
    synonyms: ["Consumer CBD", "Retail CBD"]
  },
  {
    term: "Controlled Substance",
    display_name: "Controlled Substance",
    slug: "controlled-substance",
    category: "legal",
    short_definition: "A drug regulated by government due to potential for abuse or dependence.",
    definition: "A controlled substance is a drug or chemical whose manufacture, possession, and use is regulated by government due to its potential for abuse or dependence. Controlled substances are typically categorized into schedules based on medical use and abuse potential.\n\nTHC and marijuana are controlled substances in most countries. CBD derived from hemp is generally not controlled if it meets THC limits, though regulations vary.\n\nUnderstanding controlled substance status is important for travel, workplace drug testing, and legal compliance. Always verify local laws as CBD's legal status varies globally.",
    synonyms: ["Scheduled drug", "Controlled drug"]
  },
  {
    term: "Medical Cannabis Card",
    display_name: "Medical Cannabis Card",
    slug: "medical-cannabis-card",
    category: "legal",
    short_definition: "Government-issued authorization to purchase medical cannabis including THC products.",
    definition: "A medical cannabis card (or medical marijuana card) is government-issued identification authorizing a patient to purchase and use medical cannabis products, including those containing THC.\n\nRequirements vary by jurisdiction but typically involve: a qualifying medical condition, physician recommendation, application to state/regional program, and fees. Cards must usually be renewed periodically.\n\nMedical cannabis cards may be required for CBD products containing more than trace THC in some jurisdictions. Hemp-derived CBD below legal THC limits typically doesn't require a medical card.",
    synonyms: ["MMJ card", "Medical marijuana card", "Cannabis patient card"]
  },
  {
    term: "Compassionate Use",
    display_name: "Compassionate Use",
    slug: "compassionate-use",
    category: "legal",
    short_definition: "Programs allowing access to unapproved treatments for seriously ill patients.",
    definition: "Compassionate use (expanded access) programs allow seriously ill patients to access treatments that haven't completed regulatory approval when no other options exist. These programs exist in many countries.\n\nSome jurisdictions have allowed cannabis access through compassionate use programs before establishing full medical cannabis systems. This provides a pathway for patients with serious conditions.\n\nCompassionate use typically requires: serious or life-threatening condition, exhaustion of approved options, physician support, and regulatory approval. It's not a substitute for full drug approval.",
    synonyms: ["Expanded access", "Compassionate access"]
  },
  {
    term: "GMP",
    display_name: "GMP (Good Manufacturing Practice)",
    slug: "gmp",
    category: "legal",
    short_definition: "Quality standards for pharmaceutical and supplement production ensuring consistency and safety.",
    definition: "Good Manufacturing Practice (GMP) is a set of regulations and guidelines ensuring that products are consistently produced and controlled according to quality standards. GMP certification indicates higher manufacturing standards.\n\nGMP covers all aspects of production: facilities, equipment, personnel, materials, production processes, quality control, documentation, and more. It's mandatory for pharmaceuticals and recommended for supplements.\n\nCBD products from GMP-certified facilities typically offer greater assurance of quality, consistency, and safety. Look for GMP certification when evaluating CBD brands.",
    synonyms: ["Good Manufacturing Practice", "cGMP"]
  }
];

async function addTerms() {
  console.log(`Adding ${terms.length} glossary terms (Batch 2)...\n`);

  // Check existing terms
  const response = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=slug`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  const existingTerms = await response.json();
  const existingSlugs = new Set(existingTerms.map(t => t.slug));

  let added = 0;
  let skipped = 0;

  for (const term of terms) {
    if (existingSlugs.has(term.slug)) {
      console.log(`⊖ Skipped "${term.term}" (already exists)`);
      skipped++;
      continue;
    }

    const insertData = {
      term: term.term,
      display_name: term.display_name,
      slug: term.slug,
      definition: term.definition,
      short_definition: term.short_definition,
      category: term.category,
      synonyms: term.synonyms || [],
      sources: [],
      related_terms: [],
      related_research: []
    };

    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(insertData)
    });

    if (insertResponse.ok) {
      console.log(`✓ Added "${term.display_name}"`);
      added++;
    } else {
      const error = await insertResponse.text();
      console.error(`✗ Failed to add "${term.term}":`, error);
    }
  }

  // Get final count
  const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=id`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });
  const allTerms = await countResponse.json();

  // Get category counts
  const catResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=category`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });
  const catData = await catResponse.json();
  const catCounts = {};
  catData.forEach(t => catCounts[t.category] = (catCounts[t.category] || 0) + 1);

  console.log(`\n=== Summary ===`);
  console.log(`Added: ${added}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total terms: ${allTerms.length}`);
  console.log(`\nBy category:`);
  Object.keys(catCounts).sort().forEach(c => console.log(`  ${c}: ${catCounts[c]}`));
}

addTerms().catch(console.error);
