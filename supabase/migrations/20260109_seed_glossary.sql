-- Seed glossary with 80+ essential CBD and cannabis terms

INSERT INTO kb_glossary (term, slug, definition, short_definition, category, difficulty, synonyms, sources) VALUES

-- CANNABINOIDS (15 terms)
('Cannabidiol', 'cannabidiol', 'Cannabidiol (CBD) is a naturally occurring compound found in the Cannabis sativa plant. It is one of over 100 cannabinoids identified in cannabis and is non-psychoactive, meaning it does not produce the "high" associated with THC. CBD interacts with the body''s endocannabinoid system (ECS), which regulates various physiological processes including mood, pain sensation, immune function, and sleep.

CBD has gained significant attention for its potential therapeutic applications, including anxiety relief, pain management, anti-inflammatory effects, and neuroprotection. The FDA has approved Epidiolex, a CBD-based medication, for treating certain forms of epilepsy.', 'A non-psychoactive cannabinoid from cannabis with potential therapeutic benefits including anxiety relief and anti-inflammatory effects.', 'cannabinoids', 'beginner', ARRAY['CBD', 'hemp extract', 'phytocannabinoid'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/28861514/']),

('Tetrahydrocannabinol', 'tetrahydrocannabinol', 'Tetrahydrocannabinol (THC) is the primary psychoactive compound in cannabis responsible for the "high" sensation. It binds to CB1 receptors in the brain and central nervous system, producing effects such as euphoria, altered perception, increased appetite, and relaxation.

THC also has therapeutic properties including pain relief, nausea reduction (particularly for chemotherapy patients), appetite stimulation, and muscle relaxation. Medical cannabis products often contain controlled amounts of THC, sometimes in combination with CBD.', 'The primary psychoactive compound in cannabis that produces the "high" sensation by binding to CB1 receptors.', 'cannabinoids', 'beginner', ARRAY['THC', 'delta-9-THC', 'Δ9-THC'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/22716160/']),

('Cannabigerol', 'cannabigerol', 'Cannabigerol (CBG) is often called the "mother cannabinoid" because it is the precursor from which other cannabinoids are synthesized. In young cannabis plants, CBG is converted into CBD, THC, and CBC through enzymatic processes.

CBG is non-psychoactive and research suggests it may have antibacterial, anti-inflammatory, and neuroprotective properties. It shows particular promise in treating inflammatory bowel disease, glaucoma, and bladder dysfunction.', 'The "mother cannabinoid" that serves as the precursor for other cannabinoids like CBD and THC.', 'cannabinoids', 'intermediate', ARRAY['CBG'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/32170051/']),

('Cannabinol', 'cannabinol', 'Cannabinol (CBN) is a mildly psychoactive cannabinoid that forms when THC oxidizes over time. Aged or improperly stored cannabis contains higher levels of CBN.

CBN is primarily known for its potential sedative effects and is often marketed in sleep-focused products. Research suggests it may also have antibacterial, anti-inflammatory, and appetite-stimulating properties, though studies are limited compared to CBD and THC.', 'A mildly psychoactive cannabinoid formed from THC oxidation, known for potential sedative effects.', 'cannabinoids', 'intermediate', ARRAY['CBN'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/11269508/']),

('Cannabichromene', 'cannabichromene', 'Cannabichromene (CBC) is a non-psychoactive cannabinoid and one of the six major cannabinoids in cannabis. It is derived from the same precursor as CBD and THC - cannabigerolic acid (CBGA).

CBC does not bind well to CB1 receptors but interacts with TRPV1 and TRPA1 receptors, which are involved in pain perception. Research suggests CBC may have anti-inflammatory, antidepressant, and neurogenesis-promoting properties.', 'A non-psychoactive cannabinoid that may have anti-inflammatory and antidepressant properties.', 'cannabinoids', 'intermediate', ARRAY['CBC'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/23941747/']),

('THCV', 'thcv', 'Tetrahydrocannabivarin (THCV) is a cannabinoid that is structurally similar to THC but with different effects. At low doses, THCV acts as a CB1 receptor antagonist (blocking THC effects), while at higher doses it becomes a CB1 agonist (producing psychoactive effects).

THCV is being researched for appetite suppression, blood sugar regulation, and potential benefits for diabetes. It is found in higher concentrations in certain African cannabis strains.', 'A cannabinoid similar to THC that may suppress appetite and help regulate blood sugar levels.', 'cannabinoids', 'intermediate', ARRAY['tetrahydrocannabivarin'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/26574900/']),

('CBDA', 'cbda', 'Cannabidiolic acid (CBDA) is the acidic precursor to CBD, found in raw cannabis plants. When cannabis is heated (decarboxylation), CBDA converts to CBD.

Research suggests CBDA may have anti-nausea, anti-inflammatory, and anti-anxiety properties. Some studies indicate CBDA may be more potent than CBD for certain applications, particularly for nausea and vomiting.', 'The acidic precursor to CBD found in raw cannabis, potentially more potent for nausea relief.', 'cannabinoids', 'advanced', ARRAY['cannabidiolic acid'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/22290374/']),

('THCA', 'thca', 'Tetrahydrocannabinolic acid (THCA) is the non-psychoactive acidic precursor to THC found in raw cannabis. It converts to THC when heated through decarboxylation.

THCA has shown potential anti-inflammatory, neuroprotective, and anti-emetic properties in preclinical studies. Some patients consume raw cannabis juice to obtain THCA without psychoactive effects.', 'The non-psychoactive acidic precursor to THC found in raw cannabis plants.', 'cannabinoids', 'advanced', ARRAY['tetrahydrocannabinolic acid'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/28853159/']),

('Delta-8-THC', 'delta-8-thc', 'Delta-8-tetrahydrocannabinol (Delta-8-THC) is a naturally occurring cannabinoid found in trace amounts in cannabis. It is an isomer of Delta-9-THC with similar but milder psychoactive effects.

Delta-8-THC has gained popularity due to its legal gray area in some jurisdictions and its reported clearer, less anxious high compared to Delta-9-THC. However, most Delta-8 products are synthesized from CBD, raising purity and safety concerns.', 'A milder psychoactive isomer of THC with similar but less intense effects.', 'cannabinoids', 'intermediate', ARRAY['Δ8-THC', 'D8'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/7028619/']),

('Endocannabinoid System', 'endocannabinoid-system', 'The endocannabinoid system (ECS) is a complex cell-signaling system identified in the early 1990s. It consists of endocannabinoids, receptors (CB1 and CB2), and enzymes that synthesize and break down endocannabinoids.

The ECS plays a role in regulating sleep, mood, appetite, memory, reproduction, and immune function. It is active in your body even if you don''t use cannabis. Phytocannabinoids from cannabis interact with this system, producing their various effects.', 'A complex cell-signaling system that regulates sleep, mood, appetite, and other bodily functions.', 'cannabinoids', 'beginner', ARRAY['ECS'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/26485449/']),

-- TERPENES (12 terms)
('Myrcene', 'myrcene', 'Myrcene is the most abundant terpene in cannabis, also found in mangoes, hops, lemongrass, and thyme. It has an earthy, musky, herbal aroma with subtle fruity notes.

Myrcene is believed to enhance the permeability of cell membranes, potentially increasing cannabinoid absorption. Research suggests it may have sedative, anti-inflammatory, and analgesic properties. Strains high in myrcene are often associated with relaxing "couch-lock" effects.', 'The most common cannabis terpene with earthy notes, potentially enhancing relaxation and cannabinoid absorption.', 'terpenes', 'beginner', ARRAY['β-myrcene', 'beta-myrcene'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/21749363/']),

('Limonene', 'limonene', 'Limonene is a citrus-scented terpene commonly found in cannabis, as well as citrus fruits, juniper, and peppermint. It is the second most common terpene in nature.

Research suggests limonene may have anti-anxiety, antidepressant, and anti-inflammatory effects. It is also being studied for potential anti-cancer properties and as a penetration enhancer for topical products.', 'A citrus-scented terpene associated with mood elevation and anti-anxiety effects.', 'terpenes', 'beginner', ARRAY['d-limonene'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/23820986/']),

('Linalool', 'linalool', 'Linalool is a floral, lavender-scented terpene found in over 200 plants including cannabis, lavender, mint, and cinnamon. It is widely used in aromatherapy for its calming properties.

Research indicates linalool may have anxiolytic, sedative, anti-inflammatory, and analgesic effects. It is being studied for potential neuroprotective properties and its ability to reduce stress-induced damage.', 'A floral terpene with lavender notes known for calming and stress-relieving properties.', 'terpenes', 'beginner', ARRAY['β-linalool'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/31228983/']),

('Pinene', 'pinene', 'Pinene is a terpene with a distinctive pine and fir aroma, found in cannabis, pine needles, rosemary, and basil. It exists in two forms: alpha-pinene and beta-pinene.

Alpha-pinene is notable for potentially counteracting some cognitive effects of THC. Research suggests pinene may have anti-inflammatory, bronchodilator, and memory-enhancing properties.', 'A pine-scented terpene that may improve alertness and counteract some THC effects.', 'terpenes', 'beginner', ARRAY['α-pinene', 'alpha-pinene', 'β-pinene'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/26864743/']),

('Caryophyllene', 'caryophyllene', 'Beta-caryophyllene is a spicy, peppery terpene found in cannabis, black pepper, cloves, and cinnamon. It is unique among terpenes because it can directly activate CB2 receptors, making it function somewhat like a cannabinoid.

Research suggests caryophyllene may have anti-inflammatory, analgesic, and anxiolytic properties. It is being studied for potential benefits in treating chronic pain and inflammatory conditions.', 'A spicy terpene that uniquely activates CB2 receptors like a cannabinoid.', 'terpenes', 'intermediate', ARRAY['β-caryophyllene', 'BCP'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/23195979/']),

('Humulene', 'humulene', 'Humulene is an earthy, woody terpene found in cannabis, hops, sage, and ginseng. It contributes to the hoppy aroma of beer and is a primary terpene in many cannabis strains.

Research suggests humulene may have anti-inflammatory, antibacterial, and appetite-suppressant properties, making it unique among terpenes that often stimulate appetite.', 'An earthy terpene found in hops and cannabis with potential appetite-suppressing effects.', 'terpenes', 'intermediate', ARRAY['α-humulene', 'alpha-humulene'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/17268987/']),

('Terpinolene', 'terpinolene', 'Terpinolene is a multifaceted terpene with floral, herbal, and slightly citrus aromas. While found in many cannabis strains, it is usually present in smaller amounts than other terpenes.

Research suggests terpinolene may have sedative, antioxidant, and antibacterial properties. Strains high in terpinolene are often described as uplifting and creative.', 'A complex terpene with floral and herbal notes associated with uplifting effects.', 'terpenes', 'intermediate', ARRAY['α-terpinolene'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/23237591/']),

('Entourage Effect', 'entourage-effect', 'The entourage effect is a proposed mechanism by which cannabis compounds such as cannabinoids and terpenes work synergistically to modulate the overall psychoactive effects of the plant. The theory suggests that whole-plant extracts are more effective than isolated compounds.

For example, CBD may reduce some negative effects of THC, while terpenes like myrcene may enhance cannabinoid absorption. This concept supports the preference for full-spectrum CBD products over CBD isolates.', 'The synergistic interaction between cannabinoids and terpenes that enhances therapeutic effects.', 'terpenes', 'beginner', ARRAY['whole plant effect', 'ensemble effect'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/21175589/']),

-- PRODUCTS (10 terms)
('Full-Spectrum CBD', 'full-spectrum-cbd', 'Full-spectrum CBD products contain CBD along with all other naturally occurring compounds in the cannabis plant, including other cannabinoids (THC, CBG, CBN), terpenes, flavonoids, and essential oils.

The presence of multiple compounds allows for the entourage effect, potentially enhancing therapeutic benefits. Full-spectrum products contain trace amounts of THC (up to 0.3% in hemp-derived products), which may show up on drug tests.', 'CBD products containing all natural cannabis compounds including trace THC for enhanced effects.', 'products', 'beginner', ARRAY['whole plant extract', 'full spectrum'], ARRAY[]),

('Broad-Spectrum CBD', 'broad-spectrum-cbd', 'Broad-spectrum CBD products contain CBD and other cannabinoids, terpenes, and compounds found in cannabis, but with THC completely removed. This offers a middle ground between full-spectrum and CBD isolate.

Broad-spectrum products may provide some entourage effect benefits while eliminating THC exposure concerns, making them suitable for those who are drug tested or THC-sensitive.', 'THC-free CBD products containing other cannabinoids and terpenes for partial entourage effect.', 'products', 'beginner', ARRAY['broad spectrum'], ARRAY[]),

('CBD Isolate', 'cbd-isolate', 'CBD isolate is the purest form of CBD, typically 99%+ pure cannabidiol with all other compounds removed. It appears as a white crystalline powder and is flavorless and odorless.

While isolates lack the entourage effect, they offer precise dosing, no THC exposure, and are ideal for those who need to avoid any trace cannabinoids. Research suggests that for some conditions, full-spectrum may be more effective than isolate.', 'Pure CBD (99%+) with all other cannabis compounds removed for precise, THC-free dosing.', 'products', 'beginner', ARRAY['crystalline CBD', 'pure CBD'], ARRAY[]),

('CBD Tincture', 'cbd-tincture', 'CBD tinctures are liquid extracts typically made by steeping hemp flowers in high-proof alcohol or a carrier oil (like MCT or hemp seed oil). They are administered sublingually (under the tongue) using a dropper.

Sublingual administration allows CBD to enter the bloodstream quickly through mucous membranes, with effects typically felt within 15-45 minutes. Tinctures offer precise dosing and longer shelf life compared to other formats.', 'Liquid CBD extract taken under the tongue for fast absorption and precise dosing.', 'products', 'beginner', ARRAY['CBD drops', 'CBD oil', 'sublingual CBD'], ARRAY[]),

('CBD Topical', 'cbd-topical', 'CBD topicals are products applied directly to the skin, including creams, lotions, balms, salves, and transdermal patches. They target localized areas for relief of pain, inflammation, or skin conditions.

Topical CBD does not enter the bloodstream significantly (except for transdermal patches), so it does not produce systemic effects. This makes topicals ideal for targeted relief without affecting the whole body.', 'CBD-infused products applied to skin for localized relief without entering the bloodstream.', 'products', 'beginner', ARRAY['CBD cream', 'CBD balm', 'CBD lotion'], ARRAY[]),

('CBD Edibles', 'cbd-edibles', 'CBD edibles are food products infused with CBD, including gummies, chocolates, capsules, beverages, and baked goods. They offer a discreet and convenient way to consume CBD.

Edibles must pass through the digestive system, resulting in delayed onset (30 minutes to 2 hours) but longer-lasting effects (4-8 hours). Bioavailability is lower than sublingual methods due to first-pass metabolism in the liver.', 'CBD-infused food products with delayed onset but long-lasting effects after digestion.', 'products', 'beginner', ARRAY['CBD gummies', 'CBD capsules'], ARRAY[]),

('Bioavailability', 'bioavailability', 'Bioavailability refers to the proportion of a substance that enters the bloodstream and produces active effects. Different CBD consumption methods have varying bioavailability levels.

Inhalation has the highest bioavailability (30-40%), followed by sublingual (20-35%), then oral/edibles (6-20%). Topicals have minimal systemic bioavailability as they are designed for localized effects.', 'The percentage of CBD that reaches the bloodstream based on consumption method.', 'products', 'intermediate', ARRAY[], ARRAY[]),

-- EXTRACTION (8 terms)
('CO2 Extraction', 'co2-extraction', 'CO2 extraction uses supercritical carbon dioxide to extract cannabinoids, terpenes, and other compounds from cannabis. Under specific temperature and pressure conditions, CO2 becomes supercritical, acting as both a liquid and gas.

This method is considered the gold standard for CBD extraction because it produces clean, potent extracts without toxic solvents. It allows for precise control over which compounds are extracted and preserves delicate terpenes.', 'Premium extraction method using pressurized CO2 to produce clean, solvent-free CBD extracts.', 'extraction', 'intermediate', ARRAY['supercritical CO2', 'supercritical extraction'], ARRAY[]),

('Ethanol Extraction', 'ethanol-extraction', 'Ethanol extraction uses food-grade ethanol to dissolve cannabinoids and other plant compounds. The plant material is soaked in ethanol, which is then evaporated to leave behind concentrated extract.

This method is efficient for large-scale production and can produce full-spectrum extracts. However, it may extract unwanted compounds like chlorophyll and requires careful processing to remove all solvent residue.', 'Extraction method using food-grade alcohol, efficient for large-scale full-spectrum production.', 'extraction', 'intermediate', ARRAY['alcohol extraction'], ARRAY[]),

('Decarboxylation', 'decarboxylation', 'Decarboxylation is a chemical reaction that activates cannabinoids by removing a carboxyl group through heating. Raw cannabis contains acidic cannabinoids (THCA, CBDA) that must be decarboxylated to become active (THC, CBD).

This process occurs naturally when smoking or vaping cannabis. For edibles and tinctures, cannabis must be heated (typically 230-250°F for 30-45 minutes) before extraction or infusion.', 'The heating process that converts inactive acidic cannabinoids into their active forms.', 'extraction', 'intermediate', ARRAY['decarbing', 'decarb'], ARRAY[]),

('Winterization', 'winterization', 'Winterization is a refinement process that removes fats, waxes, and lipids from crude cannabis extract. The extract is mixed with ethanol and frozen, causing unwanted compounds to solidify and separate.

This process produces cleaner, more concentrated CBD oil with improved taste and appearance. Winterized extracts are commonly used for vape products and high-purity formulations.', 'A purification process using cold temperatures to remove fats and waxes from CBD extract.', 'extraction', 'advanced', ARRAY['dewaxing'], ARRAY[]),

('Distillation', 'distillation', 'Distillation is a purification process that separates cannabinoids based on their different boiling points. Cannabis distillate is typically 80-90%+ pure CBD or THC.

Short-path distillation is commonly used, where extract is heated under vacuum to lower boiling points and prevent degradation. Distillates are nearly odorless and tasteless, making them ideal for edibles and vape products.', 'A heat-based purification method producing highly concentrated, pure cannabinoid extracts.', 'extraction', 'advanced', ARRAY['short path distillation'], ARRAY[]),

-- MEDICAL (12 terms)
('Anxiolytic', 'anxiolytic', 'An anxiolytic is a medication or substance that reduces anxiety. CBD has shown anxiolytic properties in numerous studies, working through various mechanisms including serotonin receptor modulation and effects on the limbic system.

Research suggests CBD may be effective for generalized anxiety disorder, social anxiety, PTSD-related anxiety, and situational anxiety. Unlike benzodiazepines, CBD does not appear to carry risks of dependence.', 'A substance that reduces anxiety; CBD has demonstrated significant anxiolytic properties.', 'medical', 'intermediate', ARRAY['anti-anxiety', 'anxiety-reducing'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/31866386/']),

('Anti-inflammatory', 'anti-inflammatory', 'Anti-inflammatory refers to the property of reducing inflammation, a key mechanism behind many CBD benefits. CBD interacts with various receptors and pathways involved in inflammatory response.

CBD may reduce inflammation through multiple mechanisms, including inhibiting COX enzymes (similar to NSAIDs), modulating cytokine production, and activating TRPV1 receptors. This makes it potentially useful for conditions like arthritis, inflammatory bowel disease, and neuroinflammation.', 'A property of substances that reduce inflammation; a primary therapeutic mechanism of CBD.', 'medical', 'beginner', ARRAY['inflammation reducer'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/26517407/']),

('Neuroprotection', 'neuroprotection', 'Neuroprotection refers to mechanisms and strategies that protect nerve cells from damage, degeneration, or impairment. CBD has demonstrated neuroprotective properties in various studies.

CBD''s neuroprotective effects may involve antioxidant activity, anti-inflammatory action, and modulation of calcium homeostasis. It is being studied for potential benefits in Parkinson''s disease, Alzheimer''s, multiple sclerosis, and traumatic brain injury.', 'Protection of nerve cells from damage; CBD shows promising neuroprotective properties.', 'medical', 'intermediate', ARRAY['neuroprotective'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/17201248/']),

('Anticonvulsant', 'anticonvulsant', 'An anticonvulsant is a drug used to prevent or reduce seizures. Epidiolex, a pharmaceutical CBD formulation, was FDA-approved in 2018 for treating severe forms of epilepsy including Dravet syndrome and Lennox-Gastaut syndrome.

CBD''s anticonvulsant mechanisms are not fully understood but may involve modulation of sodium and calcium channels, reduction of neuronal excitability, and effects on GPR55 and TRPV1 receptors.', 'A substance that prevents seizures; CBD is FDA-approved for certain epilepsy conditions.', 'medical', 'intermediate', ARRAY['anti-seizure', 'antiepileptic'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/29861591/']),

('Epidiolex', 'epidiolex', 'Epidiolex is the first FDA-approved prescription medication containing purified CBD. It is approved for treating seizures associated with Dravet syndrome, Lennox-Gastaut syndrome, and tuberous sclerosis complex in patients one year and older.

Epidiolex underwent rigorous clinical trials demonstrating significant seizure reduction. It is a pharmaceutical-grade CBD formulation that differs from consumer CBD products in purity, consistency, and regulation.', 'The first FDA-approved CBD medication for treating severe forms of epilepsy.', 'medical', 'beginner', ARRAY['cannabidiol oral solution'], ARRAY['https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/210365lbl.pdf']),

('Placebo Effect', 'placebo-effect', 'The placebo effect occurs when a patient experiences real improvement from an inactive treatment due to their belief in its effectiveness. This phenomenon is important to consider when evaluating CBD claims.

Well-designed studies use placebo controls to distinguish genuine CBD effects from placebo responses. When researching CBD, look for randomized, double-blind, placebo-controlled trials as the gold standard of evidence.', 'Improvement experienced from belief in a treatment rather than the treatment itself.', 'medical', 'beginner', ARRAY['placebo response'], ARRAY[]),

('First-Pass Metabolism', 'first-pass-metabolism', 'First-pass metabolism refers to the phenomenon where a drug is significantly metabolized by the liver before reaching systemic circulation. This affects oral CBD products like edibles and capsules.

When CBD is swallowed, it passes through the digestive system and liver, where enzymes (particularly CYP450) break down a significant portion before it enters the bloodstream. This is why oral CBD has lower bioavailability than sublingual or inhaled methods.', 'Liver metabolism that reduces drug concentration before it reaches the bloodstream.', 'medical', 'intermediate', ARRAY['hepatic first pass', 'first-pass effect'], ARRAY[]),

-- CONDITIONS (8 terms)
('Dravet Syndrome', 'dravet-syndrome', 'Dravet syndrome is a rare, severe form of epilepsy that begins in infancy. It is characterized by frequent, prolonged seizures often triggered by fever, and leads to developmental delays and cognitive impairment.

CBD (as Epidiolex) was FDA-approved for Dravet syndrome in 2018 after clinical trials showed it reduced seizure frequency by 39% compared to 13% for placebo. This represented a breakthrough for patients who had limited treatment options.', 'A rare, severe childhood epilepsy for which CBD (Epidiolex) is FDA-approved.', 'conditions', 'intermediate', ARRAY['severe myoclonic epilepsy of infancy', 'SMEI'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/28538134/']),

('Generalized Anxiety Disorder', 'generalized-anxiety-disorder', 'Generalized Anxiety Disorder (GAD) is characterized by persistent, excessive worry about various aspects of daily life. Studies suggest CBD may help manage GAD symptoms through its effects on serotonin receptors and the limbic system.

A 2019 study found that 79.2% of patients reported decreased anxiety after CBD treatment. Research suggests CBD may be particularly effective for acute anxiety episodes without the side effects of traditional medications.', 'A chronic condition of excessive worry; CBD shows promise as a treatment option.', 'conditions', 'beginner', ARRAY['GAD', 'chronic anxiety'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/30624194/']),

('Chronic Pain', 'chronic-pain', 'Chronic pain is pain that persists for more than 3-6 months, affecting quality of life and daily functioning. CBD may help manage chronic pain through anti-inflammatory effects, modulation of pain receptors, and effects on the endocannabinoid system.

Research shows CBD may be particularly effective for neuropathic pain, arthritis-related pain, and cancer pain. Many patients use CBD as part of a multimodal pain management approach, sometimes reducing reliance on opioids.', 'Pain lasting over 3 months; CBD shows potential as a complementary treatment approach.', 'conditions', 'beginner', ARRAY['persistent pain', 'long-term pain'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/29513392/']),

('Insomnia', 'insomnia', 'Insomnia is a sleep disorder characterized by difficulty falling asleep, staying asleep, or both. CBD may help improve sleep quality through its anxiolytic effects, which address anxiety-related sleep issues.

Research on CBD and sleep is mixed. Some studies show CBD may improve sleep by reducing anxiety and pain. Higher doses may have sedative effects, while lower doses may be more alerting. The terpene profile of CBD products can also influence sleep effects.', 'A sleep disorder; CBD may help through anxiety reduction rather than direct sedation.', 'conditions', 'beginner', ARRAY['sleep disorder', 'sleeplessness'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/30624194/']),

-- LEGAL (8 terms)
('2018 Farm Bill', '2018-farm-bill', 'The Agriculture Improvement Act of 2018 (Farm Bill) federally legalized hemp and hemp-derived products containing less than 0.3% THC by dry weight. This removed hemp from the Controlled Substances Act.

The bill authorized hemp production, research, and interstate commerce. However, FDA regulations, state laws, and THC testing requirements continue to affect the CBD industry. The FDA has not approved CBD as a food additive or dietary supplement.', 'U.S. legislation that legalized hemp and hemp-derived CBD with less than 0.3% THC.', 'legal', 'beginner', ARRAY['Agriculture Improvement Act'], ARRAY['https://www.congress.gov/bill/115th-congress/house-bill/2']),

('Hemp', 'hemp', 'Hemp is defined legally as Cannabis sativa containing no more than 0.3% THC by dry weight. This threshold was established by the 2018 Farm Bill and distinguishes legal hemp from marijuana.

Hemp is cultivated for CBD extraction, fiber, seeds (hemp hearts), and industrial applications. Hemp-derived CBD products are federally legal, though state regulations vary. Hemp seeds do not contain significant cannabinoids.', 'Cannabis sativa with 0.3% or less THC, legally distinct from marijuana.', 'legal', 'beginner', ARRAY['industrial hemp'], ARRAY[]),

('Certificate of Analysis', 'certificate-of-analysis', 'A Certificate of Analysis (COA) is a document from an accredited laboratory that verifies the contents of a CBD product. It should include cannabinoid potency, terpene profile, and tests for contaminants.

Quality CBD companies provide COAs for every batch, often accessible via QR codes. Key things to check: cannabinoid levels match the label, THC is below 0.3%, and contaminants (heavy metals, pesticides, residual solvents, microbials) are within safe limits.', 'Third-party lab report verifying CBD product contents, potency, and purity.', 'legal', 'beginner', ARRAY['COA', 'lab report', 'third-party testing'], ARRAY[]),

('Third-Party Testing', 'third-party-testing', 'Third-party testing refers to independent laboratory analysis of CBD products not conducted by the manufacturer. This provides unbiased verification of product claims.

Reputable CBD brands submit products to ISO-certified labs for testing. Look for current test results (within 6-12 months), batch-specific testing, and comprehensive panels including potency, terpenes, and contaminant screening.', 'Independent lab testing that verifies CBD product quality and label accuracy.', 'legal', 'beginner', ARRAY['independent testing', 'lab testing'], ARRAY[]),

-- DOSING (7 terms)
('Titration', 'titration', 'Titration is the practice of gradually adjusting CBD dosage to find the optimal amount for individual needs. This "start low and go slow" approach minimizes side effects and helps identify the minimum effective dose.

A typical titration protocol starts with 5-10mg CBD once or twice daily, increasing by 5mg every few days until desired effects are achieved. Keeping a symptom journal helps track responses and optimize dosing.', 'Gradually adjusting CBD dose to find the optimal amount for individual needs.', 'dosing', 'beginner', ARRAY['dose adjustment', 'start low go slow'], ARRAY[]),

('Minimum Effective Dose', 'minimum-effective-dose', 'The minimum effective dose (MED) is the lowest amount of CBD that produces the desired therapeutic effect. Finding your MED helps maximize benefits while minimizing costs and potential side effects.

CBD effects follow a bell curve for some conditions, meaning more is not always better. Some studies show optimal effects at moderate doses, with efficacy decreasing at very high doses. Individual MEDs vary based on body weight, metabolism, and condition being treated.', 'The lowest CBD dose that produces desired therapeutic effects for an individual.', 'dosing', 'intermediate', ARRAY['MED', 'optimal dose'], ARRAY[]),

('Milligrams', 'milligrams', 'Milligrams (mg) is the standard unit for measuring CBD content in products. Understanding milligrams is essential for proper dosing and comparing product values.

To calculate CBD per serving: divide total mg by number of servings. For a 30ml tincture with 1000mg CBD, each 1ml serving contains approximately 33mg CBD. Starting doses typically range from 10-25mg, with some users taking 100mg+ for specific conditions.', 'The standard unit of measurement for CBD content and dosing.', 'dosing', 'beginner', ARRAY['mg'], ARRAY[]),

('Drug Interactions', 'drug-interactions', 'CBD can interact with other medications through its effects on liver enzymes, particularly cytochrome P450 (CYP450). CBD inhibits certain CYP450 enzymes, potentially affecting how other drugs are metabolized.

Medications to be cautious with include blood thinners (warfarin), certain heart medications, immunosuppressants, and some anti-seizure drugs. Always consult a healthcare provider before using CBD with other medications.', 'Potential effects of CBD on other medications through liver enzyme interaction.', 'dosing', 'intermediate', ARRAY['CBD drug interactions', 'medication interactions'], ARRAY['https://pubmed.ncbi.nlm.nih.gov/32023416/']),

('Biphasic Effect', 'biphasic-effect', 'A biphasic effect occurs when a substance produces different effects at different doses. CBD and THC both exhibit biphasic properties.

For example, low doses of CBD may be alerting while higher doses may be sedating. Similarly, low doses of THC may reduce anxiety while high doses may increase it. This is why finding the right dose is crucial and why more is not always better.', 'When CBD produces different effects at low versus high doses.', 'dosing', 'intermediate', ARRAY['dose-dependent effect'], ARRAY[])

ON CONFLICT (slug) DO NOTHING;
