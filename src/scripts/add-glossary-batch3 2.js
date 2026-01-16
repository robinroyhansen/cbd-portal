const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const terms = [
  // MORE CONDITIONS (15)
  {
    term: "Autism Spectrum Disorder",
    display_name: "Autism Spectrum Disorder (ASD)",
    slug: "autism-spectrum",
    category: "conditions",
    short_definition: "A developmental condition affecting communication and behavior, with emerging CBD research.",
    definition: "Autism Spectrum Disorder (ASD) is a developmental condition characterized by differences in social communication, repetitive behaviors, and sensory sensitivities. It affects approximately 1 in 36 children in the US.\n\nCBD research for autism is in early stages but shows promise. The endocannabinoid system may be altered in some individuals with ASD. Studies suggest CBD may help with anxiety, sleep issues, and behavioral challenges often associated with autism.\n\nSeveral clinical trials are investigating CBD and cannabis for autism symptoms. While anecdotal reports from parents are often positive, more research is needed. Always consult healthcare providers before using CBD for autism.",
    synonyms: ["ASD", "Autism", "Autistic Spectrum"]
  },
  {
    term: "Alzheimer's Disease",
    display_name: "Alzheimer's Disease",
    slug: "alzheimers",
    category: "conditions",
    short_definition: "A progressive brain disease causing memory loss and cognitive decline.",
    definition: "Alzheimer's disease is a progressive neurodegenerative condition and the most common cause of dementia. It causes memory loss, confusion, behavioral changes, and eventually loss of ability to perform daily tasks.\n\nPreclinical research suggests CBD may have neuroprotective properties relevant to Alzheimer's. Studies indicate potential benefits for reducing neuroinflammation, oxidative stress, and beta-amyloid plaques associated with the disease.\n\nWhile promising, human clinical trials are limited. CBD may help manage some symptoms like agitation and sleep disturbances in dementia patients. It should not replace approved treatments and requires medical supervision.",
    synonyms: ["AD", "Alzheimer's", "Senile Dementia"]
  },
  {
    term: "Parkinson's Disease",
    display_name: "Parkinson's Disease",
    slug: "parkinsons",
    category: "conditions",
    short_definition: "A progressive nervous system disorder affecting movement and motor control.",
    definition: "Parkinson's disease is a progressive neurodegenerative disorder affecting movement. Symptoms include tremors, stiffness, slow movement, and balance problems. It's caused by loss of dopamine-producing brain cells.\n\nCBD research for Parkinson's shows potential for symptom management. Studies suggest CBD may help with tremors, sleep disturbances (REM sleep behavior disorder), psychosis, and quality of life. It may also have neuroprotective effects.\n\nSome Parkinson's patients report benefits from CBD, particularly for non-motor symptoms like anxiety, sleep, and pain. Clinical trials are ongoing. CBD should complement, not replace, standard Parkinson's medications.",
    synonyms: ["PD", "Parkinson's", "Parkinsonism"]
  },
  {
    term: "Huntington's Disease",
    display_name: "Huntington's Disease",
    slug: "huntingtons",
    category: "conditions",
    short_definition: "A genetic brain disorder causing progressive movement, cognitive, and psychiatric problems.",
    definition: "Huntington's disease is a genetic neurodegenerative disorder causing progressive breakdown of nerve cells in the brain. Symptoms include uncontrolled movements (chorea), cognitive decline, and psychiatric disturbances.\n\nThe endocannabinoid system shows changes in Huntington's disease, making cannabinoids a research interest. Preclinical studies suggest potential neuroprotective effects. Sativex was studied for Huntington's but showed limited efficacy in trials.\n\nWhile research hasn't yet proven CBD effective for Huntington's core symptoms, it may help with associated issues like sleep problems, anxiety, and mood disturbances. More research is needed.",
    synonyms: ["HD", "Huntington's Chorea"]
  },
  {
    term: "ALS",
    display_name: "ALS (Amyotrophic Lateral Sclerosis)",
    slug: "als",
    category: "conditions",
    short_definition: "A progressive neurodegenerative disease affecting nerve cells controlling voluntary muscles.",
    definition: "Amyotrophic Lateral Sclerosis (ALS), also known as Lou Gehrig's disease, is a progressive neurodegenerative disease affecting motor neurons. It leads to muscle weakness, paralysis, and eventually respiratory failure.\n\nPreclinical research suggests cannabinoids may slow ALS progression through anti-inflammatory, antioxidant, and neuroprotective mechanisms. Some patients report benefits for symptom management including spasticity, pain, appetite, and sleep.\n\nCannabis is legal for ALS patients in many medical marijuana programs. While not a cure, CBD and THC may improve quality of life. Clinical trials are investigating cannabinoid therapies for ALS.",
    synonyms: ["Lou Gehrig's Disease", "Motor Neuron Disease", "MND"]
  },
  {
    term: "Tourette Syndrome",
    display_name: "Tourette Syndrome",
    slug: "tourettes",
    category: "conditions",
    short_definition: "A neurological disorder characterized by repetitive, involuntary movements and vocalizations (tics).",
    definition: "Tourette Syndrome is a neurological disorder characterized by repetitive, involuntary movements and vocalizations called tics. It typically appears in childhood and varies widely in severity.\n\nCannabis has been studied for Tourette's with some promising results. Research suggests THC and CBD may reduce tic frequency and severity in some patients. Germany has approved a cannabis-based treatment for Tourette's.\n\nSome Tourette's patients report significant relief with cannabis or CBD products. Effects vary individually. CBD alone may be less effective than THC or combinations. Medical supervision is recommended.",
    synonyms: ["TS", "Tourette's", "Tic Disorder"]
  },
  {
    term: "OCD",
    display_name: "OCD (Obsessive-Compulsive Disorder)",
    slug: "ocd",
    category: "conditions",
    short_definition: "An anxiety disorder featuring unwanted repetitive thoughts and behaviors.",
    definition: "Obsessive-Compulsive Disorder (OCD) is a mental health condition characterized by intrusive, unwanted thoughts (obsessions) and repetitive behaviors (compulsions). It can significantly impair daily functioning.\n\nCBD research for OCD is limited but emerging. The endocannabinoid system influences anxiety circuits relevant to OCD. Preclinical studies and case reports suggest potential benefits, but clinical trials are scarce.\n\nCBD's anti-anxiety effects may help some OCD symptoms, particularly anxiety and stress associated with obsessions. It should be considered as a complement to, not replacement for, established OCD treatments like therapy and SSRIs.",
    synonyms: ["Obsessive-Compulsive Disorder"]
  },
  {
    term: "Bipolar Disorder",
    display_name: "Bipolar Disorder",
    slug: "bipolar",
    category: "conditions",
    short_definition: "A mental health condition causing extreme mood swings between depression and mania.",
    definition: "Bipolar disorder is a mental health condition characterized by extreme mood episodes: depressive lows and manic or hypomanic highs. It affects approximately 2.8% of adults and requires lifelong management.\n\nResearch on CBD for bipolar disorder is limited and results are mixed. Some studies suggest potential mood-stabilizing properties, while others show no benefit. THC may trigger manic episodes in susceptible individuals.\n\nCBD is NOT a replacement for mood stabilizers or other bipolar medications. If considering CBD, discuss with your psychiatrist first. Some patients report benefits for anxiety and sleep between episodes, but caution is warranted.",
    synonyms: ["Manic Depression", "Bipolar Affective Disorder"]
  },
  {
    term: "Schizophrenia",
    display_name: "Schizophrenia",
    slug: "schizophrenia",
    category: "conditions",
    short_definition: "A serious mental disorder affecting thinking, emotions, and behavior.",
    definition: "Schizophrenia is a chronic mental disorder affecting how a person thinks, feels, and behaves. Symptoms include hallucinations, delusions, disorganized thinking, and reduced emotional expression.\n\nInterestingly, CBD shows potential antipsychotic properties and may help schizophrenia symptoms without the side effects of traditional antipsychotics. Clinical trials have shown promising results for CBD as an adjunct treatment.\n\nImportantly, THC can worsen psychotic symptoms and increase schizophrenia risk in predisposed individuals. CBD alone (not THC-containing products) should be considered, and only under psychiatric supervision alongside standard medications.",
    synonyms: ["Psychosis", "Schizophrenic Disorder"]
  },
  {
    term: "Substance Use Disorder",
    display_name: "Substance Use Disorder (Addiction)",
    slug: "substance-use-disorder",
    category: "conditions",
    short_definition: "A condition involving compulsive substance use despite harmful consequences.",
    definition: "Substance Use Disorder (SUD), commonly called addiction, is a condition characterized by compulsive drug or alcohol use despite negative consequences. It affects brain circuits involved in reward, stress, and self-control.\n\nResearch suggests CBD may help addiction treatment. Studies show potential for reducing cravings, withdrawal symptoms, and relapse risk for opioids, cocaine, tobacco, and cannabis itself. CBD doesn't produce addiction or euphoria.\n\nCBD is being actively researched as an addiction treatment tool. It may reduce drug cue-induced cravings and anxiety. While promising, it's best used as part of comprehensive addiction treatment, not as a standalone cure.",
    synonyms: ["Addiction", "SUD", "Drug Addiction", "Substance Abuse"]
  },
  {
    term: "Diabetes",
    display_name: "Diabetes",
    slug: "diabetes",
    category: "conditions",
    short_definition: "A metabolic disease affecting blood sugar regulation.",
    definition: "Diabetes is a chronic metabolic disease where the body either doesn't produce enough insulin (Type 1) or can't effectively use insulin (Type 2), leading to elevated blood sugar levels.\n\nResearch suggests CBD may have potential benefits for diabetes. Studies indicate anti-inflammatory effects that may protect pancreatic cells, potential to improve insulin sensitivity, and help with diabetic complications like neuropathy and retinopathy.\n\nCBD does not replace diabetes medications or insulin. It may help manage related symptoms like nerve pain, inflammation, and anxiety. Blood sugar monitoring is important when using CBD, as it may affect medication needs.",
    synonyms: ["Diabetes Mellitus", "Type 1 Diabetes", "Type 2 Diabetes"]
  },
  {
    term: "Obesity",
    display_name: "Obesity",
    slug: "obesity",
    category: "conditions",
    short_definition: "A complex condition involving excessive body fat that increases disease risk.",
    definition: "Obesity is a complex medical condition characterized by excessive body fat accumulation that negatively impacts health. It increases risk for diabetes, heart disease, and other conditions.\n\nUnlike THC (which stimulates appetite), CBD may have the opposite effect. Research suggests CBD may promote 'fat browning' (converting white fat to metabolically active brown fat), reduce appetite, and improve metabolic markers.\n\nCBD is not a weight loss miracle. Effects on weight are subtle and vary between individuals. It may be most helpful as part of a comprehensive approach including diet and exercise. Don't expect dramatic results from CBD alone.",
    synonyms: ["Overweight", "Excess Weight"]
  },
  {
    term: "Acne",
    display_name: "Acne",
    slug: "acne",
    category: "conditions",
    short_definition: "A skin condition causing pimples, typically from clogged hair follicles.",
    definition: "Acne is a common skin condition occurring when hair follicles become clogged with oil and dead skin cells. It causes pimples, blackheads, and whiteheads, primarily on the face, chest, and back.\n\nResearch suggests CBD may help acne through multiple mechanisms: reducing sebum (oil) production, anti-inflammatory effects, and antibacterial properties against acne-causing bacteria. The skin has its own endocannabinoid system.\n\nTopical CBD products are most commonly used for acne. Look for formulations designed for acne-prone skin. CBD may complement other acne treatments but isn't a replacement for dermatological care in severe cases.",
    synonyms: ["Acne Vulgaris", "Pimples", "Breakouts"]
  },
  {
    term: "Psoriasis",
    display_name: "Psoriasis",
    slug: "psoriasis",
    category: "conditions",
    short_definition: "An autoimmune skin condition causing rapid skin cell buildup and scaly patches.",
    definition: "Psoriasis is an autoimmune condition causing rapid skin cell production, leading to thick, scaly patches that can be itchy and painful. It affects about 2-3% of the population and has no cure.\n\nCBD shows promise for psoriasis through anti-inflammatory effects and ability to slow skin cell growth. The skin's endocannabinoid system helps regulate cell growth, inflammation, and immune responses.\n\nBoth topical and oral CBD may help psoriasis. Topicals target affected areas directly; oral CBD may address systemic inflammation. Some patients report significant improvement, though clinical trials are limited.",
    synonyms: ["Plaque Psoriasis", "Psoriatic Disease"]
  },
  {
    term: "Eczema",
    display_name: "Eczema (Atopic Dermatitis)",
    slug: "eczema",
    category: "conditions",
    short_definition: "A chronic inflammatory skin condition causing itchy, red, dry patches.",
    definition: "Eczema (atopic dermatitis) is a chronic inflammatory skin condition causing itchy, red, dry, and cracked skin. It often begins in childhood and may persist into adulthood, with periodic flare-ups.\n\nCBD may help eczema through anti-inflammatory, anti-itch, and skin barrier-supporting effects. Endocannabinoid receptors in the skin influence itch sensation, inflammation, and skin cell function.\n\nTopical CBD products (creams, balms) are most commonly used for eczema. They may reduce inflammation, soothe itching, and support skin healing. Look for products formulated for sensitive skin without irritating additives.",
    synonyms: ["Atopic Dermatitis", "AD", "Dermatitis"]
  },

  // DOSING & SAFETY (10)
  {
    term: "Microdosing",
    display_name: "Microdosing",
    slug: "microdosing",
    category: "dosing",
    short_definition: "Taking very small amounts of CBD multiple times daily for subtle, consistent effects.",
    definition: "Microdosing involves taking very small amounts of CBD (typically 1-10mg) multiple times throughout the day rather than larger single doses. The goal is subtle, sustained effects without noticeable peaks.\n\nThis approach may work well for maintaining steady CBD levels, managing daily stress or mild symptoms, and minimizing side effects. Some people find microdosing more effective than single large doses.\n\nMicrodosing is particularly popular for CBD since it has no intoxicating effects regardless of dose. Start with 2-5mg doses 3-4 times daily and adjust based on your response.",
    synonyms: ["Micro-dosing", "Low-dose therapy"]
  },
  {
    term: "Titration",
    display_name: "Titration",
    slug: "titration",
    category: "dosing",
    short_definition: "Gradually adjusting CBD dose to find the optimal amount for your needs.",
    definition: "Titration is the process of gradually adjusting your CBD dose to find the optimal amount that provides desired benefits with minimal side effects. It's the recommended approach for starting CBD.\n\nStart with a low dose (5-10mg daily), maintain for several days, then gradually increase until you find your 'sweet spot.' This may take 2-4 weeks. Keep a journal tracking dose, timing, and effects.\n\nTitration is important because CBD affects everyone differently. Factors like body weight, metabolism, and the condition being addressed all influence optimal dosing. There's no one-size-fits-all dose.",
    synonyms: ["Dose titration", "Gradual dosing"]
  },
  {
    term: "Therapeutic Window",
    display_name: "Therapeutic Window",
    slug: "therapeutic-window",
    category: "dosing",
    short_definition: "The dose range where CBD provides benefits without significant side effects.",
    definition: "The therapeutic window is the dose range between the minimum effective dose and the dose that causes significant side effects. Staying within this window optimizes benefits while minimizing risks.\n\nFor CBD, the therapeutic window is generally wide, meaning there's substantial room between effective doses and problematic ones. However, some people may experience side effects (drowsiness, digestive issues) at higher doses.\n\nFinding your therapeutic window requires experimentation. Some conditions may require higher doses than others. The goal is the lowest dose that provides adequate relief.",
    synonyms: ["Therapeutic range", "Optimal dose range"]
  },
  {
    term: "Starting Dose",
    display_name: "Starting Dose",
    slug: "starting-dose",
    category: "dosing",
    short_definition: "The recommended initial CBD amount for new users, typically 5-20mg daily.",
    definition: "A starting dose is the initial amount of CBD recommended when beginning supplementation. For most adults, this is typically 5-20mg daily, though recommendations vary based on the product and condition.\n\nStarting low is important because CBD affects everyone differently. Beginning with a low dose allows you to assess tolerance, identify any side effects, and build up gradually.\n\nCommon starting dose recommendations: 5-10mg for general wellness, 10-20mg for mild symptoms, 20-40mg for moderate symptoms. Always start at the lower end and increase as needed over several weeks.",
    synonyms: ["Initial dose", "Beginning dose"]
  },
  {
    term: "Maintenance Dose",
    display_name: "Maintenance Dose",
    slug: "maintenance-dose",
    category: "dosing",
    short_definition: "The ongoing CBD amount that provides consistent, sustained benefits.",
    definition: "A maintenance dose is the amount of CBD you take regularly after finding your optimal level through titration. It's the dose that consistently provides your desired benefits without significant side effects.\n\nMaintenance doses vary widely—some people do well with 10-20mg daily, while others may need 50-100mg or more for certain conditions. Individual factors and condition severity influence this.\n\nOnce established, your maintenance dose may need occasional adjustment. Factors like changes in health, stress levels, or developing tolerance may require recalibration. Periodic 'tolerance breaks' may help maintain effectiveness.",
    synonyms: ["Ongoing dose", "Regular dose"]
  },
  {
    term: "Tolerance",
    display_name: "Tolerance",
    slug: "tolerance",
    category: "medical",
    short_definition: "Reduced response to CBD over time, requiring higher doses for the same effect.",
    definition: "Tolerance occurs when your body becomes accustomed to a substance, requiring larger amounts to achieve the same effect. This is common with many medications and supplements.\n\nInterestingly, CBD may produce 'reverse tolerance' in some people—over time, lower doses become effective as the endocannabinoid system becomes more sensitive. This isn't universal, and some do develop typical tolerance.\n\nIf you notice CBD becoming less effective, try: taking a short break (3-7 days), rotating products or delivery methods, or reassessing whether your underlying condition has changed.",
    synonyms: ["Drug tolerance", "CBD tolerance"]
  },
  {
    term: "Biphasic Effect",
    display_name: "Biphasic Effect",
    slug: "biphasic-effect",
    category: "medical",
    short_definition: "When low and high CBD doses produce opposite effects.",
    definition: "A biphasic effect means a substance produces different (sometimes opposite) effects at low versus high doses. CBD demonstrates this phenomenon for several conditions.\n\nFor example, lower CBD doses may be more energizing and anxiety-reducing, while higher doses tend to be more sedating. Similarly, low doses may increase appetite while high doses suppress it.\n\nThis is why 'more is not always better' with CBD. Finding your optimal dose through titration is crucial. Some people get better results with moderate doses than very high ones.",
    synonyms: ["Biphasic response", "Dose-dependent effect"]
  },
  {
    term: "Drug Interaction",
    display_name: "Drug Interaction",
    slug: "drug-interaction",
    category: "medical",
    short_definition: "When CBD affects how other medications work in your body.",
    definition: "Drug interactions occur when CBD affects how other medications are absorbed, metabolized, or eliminated from your body. CBD inhibits certain liver enzymes (CYP450) that process many common drugs.\n\nMedications that may interact with CBD include: blood thinners (warfarin), heart medications, immunosuppressants, certain antidepressants, anti-epileptics, and many others.\n\nAlways consult your doctor before using CBD if you take any medications. A general rule: if your medication has a 'grapefruit warning,' it likely interacts with CBD. Your doctor may need to adjust medication doses.",
    synonyms: ["CBD drug interaction", "Medication interaction"]
  },
  {
    term: "Contraindication",
    display_name: "Contraindication",
    slug: "contraindication",
    category: "medical",
    short_definition: "A condition or factor that makes CBD use inadvisable or risky.",
    definition: "A contraindication is a condition, situation, or factor that makes a particular treatment inadvisable due to potential harm. While CBD is generally safe, certain contraindications exist.\n\nPotential CBD contraindications include: liver disease (CBD may elevate liver enzymes), pregnancy/breastfeeding (insufficient safety data), allergies to hemp/cannabis, and certain medications with serious interactions.\n\nIf you have liver problems, are pregnant/nursing, or take medications with narrow therapeutic windows, consult your healthcare provider before using CBD. Start with lower doses if approved.",
    synonyms: ["Precaution", "Warning"]
  },
  {
    term: "Side Effects",
    display_name: "Side Effects",
    slug: "side-effects",
    category: "medical",
    short_definition: "Unwanted effects that may occur when using CBD, typically mild.",
    definition: "Side effects are unintended effects that can occur alongside the desired therapeutic effects. CBD's side effects are generally mild and less severe than many pharmaceuticals.\n\nCommon CBD side effects include: drowsiness/fatigue, dry mouth, diarrhea or appetite changes, potential drug interactions, and rare cases of elevated liver enzymes at very high doses.\n\nMost side effects are dose-dependent—reducing your dose often resolves them. Starting low and increasing slowly helps minimize side effects. If you experience concerning symptoms, discontinue use and consult a healthcare provider.",
    synonyms: ["Adverse effects", "CBD side effects"]
  },

  // EXTRACTION METHODS (10)
  {
    term: "CO2 Extraction",
    display_name: "CO₂ Extraction",
    slug: "co2-extraction",
    category: "extraction",
    short_definition: "Using pressurized carbon dioxide to extract cannabinoids—considered the gold standard.",
    definition: "CO₂ extraction uses pressurized carbon dioxide to pull cannabinoids and terpenes from hemp. It's widely considered the gold standard for CBD extraction due to safety and purity.\n\nThe process involves pushing CO₂ through hemp at specific pressures and temperatures. At certain conditions (supercritical), CO₂ acts like both liquid and gas, efficiently extracting compounds. The CO₂ then evaporates, leaving pure extract.\n\nAdvantages: no residual solvents, preserves terpenes well, highly tunable, produces clean extracts. Disadvantages: expensive equipment, requires expertise. Most premium CBD brands use CO₂ extraction.",
    synonyms: ["Carbon dioxide extraction", "Supercritical CO2"]
  },
  {
    term: "Ethanol Extraction",
    display_name: "Ethanol Extraction",
    slug: "ethanol-extraction",
    category: "extraction",
    short_definition: "Using food-grade alcohol to extract cannabinoids—efficient and scalable.",
    definition: "Ethanol extraction uses food-grade ethyl alcohol to dissolve cannabinoids and terpenes from hemp. It's an efficient, scalable method common in the CBD industry.\n\nHemp is soaked in ethanol, which strips cannabinoids from the plant material. The ethanol is then evaporated, leaving behind the extract. Cold ethanol extraction better preserves terpenes and reduces chlorophyll extraction.\n\nAdvantages: efficient, scalable, safe solvent (evaporates completely), FDA-approved for food. Disadvantages: may extract chlorophyll (green color, bitter taste), requires careful purging. Well-executed ethanol extraction produces quality CBD.",
    synonyms: ["Alcohol extraction", "Grain alcohol extraction"]
  },
  {
    term: "Hydrocarbon Extraction",
    display_name: "Hydrocarbon Extraction",
    slug: "hydrocarbon-extraction",
    category: "extraction",
    short_definition: "Using butane or propane to extract cannabinoids—produces potent concentrates.",
    definition: "Hydrocarbon extraction uses hydrocarbons like butane or propane as solvents to extract cannabinoids. It's common for producing concentrates like shatter, wax, and live resin.\n\nThese solvents efficiently extract cannabinoids and terpenes at low temperatures, preserving aromatic compounds. The solvent is then purged from the final product through vacuum ovens.\n\nAdvantages: excellent terpene preservation, produces various concentrate textures, efficient. Disadvantages: requires proper purging to remove residual solvents, safety concerns during production. Quality products test below safe residual solvent limits.",
    synonyms: ["BHO", "Butane extraction", "Propane extraction"]
  },
  {
    term: "Solventless Extraction",
    display_name: "Solventless Extraction",
    slug: "solventless",
    category: "extraction",
    short_definition: "Extraction methods using only heat, pressure, or water—no chemical solvents.",
    definition: "Solventless extraction produces cannabis concentrates without chemical solvents, using only mechanical methods like heat, pressure, ice, and water. This includes rosin, bubble hash, and dry sift.\n\nThese methods physically separate trichomes (containing cannabinoids) from plant material. Rosin uses heat and pressure; ice water hash uses cold water and agitation; dry sift uses screens to collect trichomes.\n\nAdvantages: no solvent residue concerns, full terpene preservation, considered 'cleanest' extraction. Disadvantages: lower yields, more expensive, requires quality starting material. Solventless products command premium prices.",
    synonyms: ["Mechanical extraction", "No-solvent extraction"]
  },
  {
    term: "Cold Press Extraction",
    display_name: "Cold Press Extraction",
    slug: "cold-press",
    category: "extraction",
    short_definition: "Pressing hemp seeds at low temperatures to extract oil—minimal processing.",
    definition: "Cold press extraction uses mechanical pressure at low temperatures to extract oil from hemp seeds. It's the simplest extraction method and produces hemp seed oil (not the same as CBD oil).\n\nThe process crushes hemp seeds to release their oil without heat or solvents. While 'cold pressed,' some heat is generated through friction. True cold pressing keeps temperatures below 120°F.\n\nImportant: Cold pressed hemp seed oil contains very little CBD—cannabinoids are concentrated in flowers, not seeds. Hemp seed oil is nutritious (omega fatty acids) but not a significant CBD source.",
    synonyms: ["Cold pressed", "Expeller pressed"]
  },
  {
    term: "Winterization",
    display_name: "Winterization",
    slug: "winterization",
    category: "extraction",
    short_definition: "A purification process that removes fats, waxes, and lipids from CBD extract.",
    definition: "Winterization is a refinement process that removes unwanted fats, waxes, and lipids from crude CBD extract. It's named for the cold temperatures used in the process.\n\nCrude extract is mixed with ethanol and frozen. At low temperatures, fats and waxes solidify and can be filtered out, leaving a cleaner, more concentrated extract.\n\nWinterization improves product clarity, stability, and purity. It's essential for making clear vape oils and high-purity products. The trade-off is some loss of beneficial compounds like waxes that may have therapeutic value.",
    synonyms: ["Dewaxing", "Fat removal"]
  },
  {
    term: "Decarboxylation",
    display_name: "Decarboxylation",
    slug: "decarboxylation",
    category: "extraction",
    short_definition: "Heating cannabis to convert inactive CBDA into active CBD.",
    definition: "Decarboxylation ('decarbing') is the process of applying heat to convert acidic cannabinoids (CBDA, THCA) into their active forms (CBD, THC). Raw cannabis contains mostly inactive acids.\n\nThe process removes a carboxyl group (COOH) from the cannabinoid molecule. This typically occurs at 220-250°F for 30-60 minutes. Smoking or vaping automatically decarboxylates cannabinoids.\n\nDecarboxylation is essential for CBD products intended to be eaten or used sublingually. Some products include both CBDA and CBD, as CBDA has its own potential benefits. Raw cannabis products contain mostly non-decarboxylated acids.",
    synonyms: ["Decarbing", "Activation", "Decarb"]
  },
  {
    term: "Chromatography",
    display_name: "Chromatography",
    slug: "chromatography",
    category: "extraction",
    short_definition: "A separation technique used to isolate specific cannabinoids or remove THC.",
    definition: "Chromatography is a laboratory technique that separates mixtures into individual components. In CBD production, it's used to isolate specific cannabinoids or remove unwanted compounds like THC.\n\nThe process exploits different compounds' varying affinities for mobile (liquid/gas) and stationary phases. Different cannabinoids move through the system at different rates, allowing separation.\n\nChromatography is essential for producing CBD isolate (99%+ pure CBD) and broad-spectrum extracts (full spectrum minus THC). It's also used in lab testing to quantify individual cannabinoids in products.",
    synonyms: ["Flash chromatography", "Column chromatography"]
  },
  {
    term: "Short Path Distillation",
    display_name: "Short Path Distillation",
    slug: "short-path-distillation",
    category: "extraction",
    short_definition: "A purification technique producing highly refined CBD distillate (80-90% purity).",
    definition: "Short path distillation is a refinement technique that uses heat and vacuum to separate cannabinoids from other plant compounds, producing highly purified distillate typically 80-90% cannabinoid content.\n\nThe process heats crude extract under vacuum. Different compounds vaporize at different temperatures and are collected separately. The 'short path' minimizes distance compounds travel, reducing degradation.\n\nDistillate is versatile—it can be used in vapes, edibles, topicals, and more. It's nearly flavorless and colorless. The downside is loss of terpenes and other compounds present in full-spectrum extracts.",
    synonyms: ["Distillation", "Molecular distillation"]
  },
  {
    term: "Supercritical Extraction",
    display_name: "Supercritical Extraction",
    slug: "supercritical",
    category: "extraction",
    short_definition: "Using CO₂ at supercritical state (liquid-gas hybrid) for precise cannabinoid extraction.",
    definition: "Supercritical extraction uses carbon dioxide at temperatures and pressures above its critical point, where it exhibits properties of both liquid and gas. This allows efficient, tunable extraction.\n\nAt supercritical conditions (above 31°C and 1,071 psi), CO₂ has liquid-like density (dissolving power) with gas-like diffusivity (penetration). By adjusting parameters, extractors can target specific compounds.\n\nSupercritical CO₂ extraction is considered the gold standard for CBD. It produces clean, pure extracts without solvent residues. Equipment is expensive, but results are consistently high-quality.",
    synonyms: ["Supercritical CO2", "SFE", "Supercritical fluid extraction"]
  },

  // PRODUCT SPECTRUM TYPES (8)
  {
    term: "Full Spectrum",
    display_name: "Full Spectrum",
    slug: "full-spectrum",
    category: "products",
    short_definition: "CBD extract containing all cannabinoids, terpenes, and compounds from hemp, including trace THC.",
    definition: "Full spectrum CBD contains all the naturally occurring compounds in hemp: multiple cannabinoids (CBD, CBG, CBN, trace THC), terpenes, flavonoids, and other beneficial plant compounds.\n\nThe 'entourage effect' theory suggests these compounds work synergistically, making full spectrum potentially more effective than isolated CBD. The trace THC (under 0.3%) is not enough to cause intoxication.\n\nFull spectrum is popular for its potential enhanced benefits but may not be suitable for those who: must pass drug tests (trace THC can accumulate), are sensitive to THC, or are in zero-THC jurisdictions.",
    synonyms: ["Full-spectrum CBD", "Whole plant extract"]
  },
  {
    term: "Broad Spectrum",
    display_name: "Broad Spectrum",
    slug: "broad-spectrum",
    category: "products",
    short_definition: "CBD extract with multiple cannabinoids and terpenes but with THC removed.",
    definition: "Broad spectrum CBD contains multiple cannabinoids, terpenes, and other hemp compounds, but with THC specifically removed or reduced to non-detectable levels.\n\nThis offers a middle ground: more of the entourage effect than isolate, but without THC concerns. It's created by either removing THC from full spectrum extract or adding terpenes/cannabinoids to isolate.\n\nBroad spectrum is ideal for those who want benefits beyond pure CBD but must avoid THC due to drug testing, personal preference, or legal requirements. Quality varies—verify THC is truly non-detectable.",
    synonyms: ["Broad-spectrum CBD", "THC-free full spectrum"]
  },
  {
    term: "CBD Isolate",
    display_name: "CBD Isolate",
    slug: "isolate",
    category: "products",
    short_definition: "Pure CBD (99%+) with all other compounds removed—no THC, no terpenes.",
    definition: "CBD isolate is pure cannabidiol, typically 99%+ purity, with all other plant compounds removed. It comes as a crystalline powder or solid that can be added to products or consumed directly.\n\nIsolate contains zero THC and is completely tasteless and odorless. It's produced through extraction followed by extensive refinement using chromatography and other purification techniques.\n\nIsolate is ideal for: guaranteed zero THC, precise dosing, adding CBD to your own products, and those who don't respond well to other cannabinoids. However, it lacks the potential entourage effect of full/broad spectrum products.",
    synonyms: ["Pure CBD", "CBD crystal", "Crystalline CBD"]
  },
  {
    term: "Nano CBD",
    display_name: "Nano CBD",
    slug: "nano-cbd",
    category: "products",
    short_definition: "CBD broken into tiny particles for improved absorption and faster effects.",
    definition: "Nano CBD uses nanotechnology to break CBD molecules into extremely small particles (typically under 100 nanometers). This increases surface area and may improve absorption.\n\nThe theory is that smaller particles are more easily absorbed by the body, potentially increasing bioavailability and speeding onset of effects. Some nano CBD products claim significantly higher absorption rates.\n\nWhile the science is promising, nano CBD is still emerging and claims should be evaluated critically. Not all 'nano' products are truly nano-sized. Look for third-party testing that verifies particle size.",
    synonyms: ["Nano-emulsified CBD", "Nano-enhanced CBD"]
  },
  {
    term: "Water-Soluble CBD",
    display_name: "Water-Soluble CBD",
    slug: "water-soluble",
    category: "products",
    short_definition: "CBD processed to mix with water, improving absorption and enabling beverage products.",
    definition: "Water-soluble CBD is processed to disperse evenly in water rather than separating like oil normally would. This is achieved through nano-emulsification or other technologies.\n\nNaturally, CBD is fat-soluble (lipophilic) and doesn't mix with water. Water-soluble formulations may improve bioavailability since our bodies are 60% water. They also enable CBD beverages and other water-based products.\n\nWater-soluble CBD typically has faster onset than traditional oils. It's convenient for adding to drinks without the oily residue. However, processing may affect other compounds, and not all products perform equally.",
    synonyms: ["Water soluble CBD", "Aqua CBD"]
  },
  {
    term: "Liposomal CBD",
    display_name: "Liposomal CBD",
    slug: "liposomal",
    category: "products",
    short_definition: "CBD encapsulated in tiny fat spheres (liposomes) for enhanced delivery and absorption.",
    definition: "Liposomal CBD encapsulates cannabidiol within liposomes—tiny spheres made of phospholipids similar to cell membranes. This delivery system is designed to improve absorption and bioavailability.\n\nLiposomes can protect CBD through the digestive system and may help it cross cell membranes more effectively. The technology is well-established in pharmaceutical and supplement industries.\n\nLiposomal CBD typically costs more than standard CBD oils. Benefits may include: faster onset, improved absorption, potentially lower effective doses. Quality varies—look for products with verified liposomal delivery systems.",
    synonyms: ["Liposome CBD", "Liposomal delivery"]
  },
  {
    term: "Carrier Oil",
    display_name: "Carrier Oil",
    slug: "carrier-oil",
    category: "products",
    short_definition: "The base oil that CBD extract is diluted in for products like tinctures.",
    definition: "Carrier oils are the base oils that CBD extract is diluted into for tinctures and other products. Since CBD is fat-soluble, it dissolves well in oils and the carrier aids absorption.\n\nCommon carrier oils include: MCT oil (from coconut), hemp seed oil, olive oil, and avocado oil. Each has different characteristics affecting flavor, absorption, and additional nutritional benefits.\n\nCarrier oils also help with dosing accuracy (pure CBD is hard to measure precisely) and sublingual absorption. The quality and type of carrier oil can affect both the product's effectiveness and shelf life.",
    synonyms: ["Base oil", "CBD carrier"]
  },
  {
    term: "MCT Oil",
    display_name: "MCT Oil",
    slug: "mct-oil",
    category: "products",
    short_definition: "Medium-chain triglyceride oil from coconut—the most popular CBD carrier oil.",
    definition: "MCT (Medium-Chain Triglyceride) oil is a refined coconut oil containing medium-length fatty acid chains. It's the most popular carrier oil for CBD products due to its absorption properties.\n\nMCTs are easily digested and rapidly absorbed, potentially improving CBD bioavailability. They're flavorless and odorless, allowing the natural (or added) flavors of CBD products to come through.\n\nAdditional MCT benefits: quick energy source (metabolized differently than other fats), stable shelf life, and liquid at room temperature. Some people may experience digestive upset with large amounts of MCT oil.",
    synonyms: ["Medium-chain triglycerides", "Coconut MCT"]
  },

  // SPECIFIC SIDE EFFECTS & INTERACTIONS (7)
  {
    term: "CYP450 Enzymes",
    display_name: "CYP450 Enzymes",
    slug: "cyp450",
    category: "medical",
    short_definition: "Liver enzymes that metabolize CBD and many medications—the basis for drug interactions.",
    definition: "Cytochrome P450 (CYP450) is a family of liver enzymes responsible for metabolizing many substances, including CBD and approximately 60% of pharmaceutical drugs.\n\nCBD inhibits several CYP450 enzymes, particularly CYP3A4 and CYP2D6. When these enzymes are inhibited, medications processed by them may build up to higher levels than intended, potentially causing side effects.\n\nThis is why CBD can interact with many medications. Drugs metabolized by CYP450 enzymes may need dose adjustments when used with CBD. Always consult your doctor about potential interactions.",
    synonyms: ["Cytochrome P450", "CYP enzymes", "Liver enzymes"]
  },
  {
    term: "Dry Mouth",
    display_name: "Dry Mouth (Cottonmouth)",
    slug: "dry-mouth",
    category: "medical",
    short_definition: "A common CBD side effect where saliva production decreases temporarily.",
    definition: "Dry mouth (xerostomia) is one of the most common side effects of CBD. Cannabinoids affect cannabinoid receptors in salivary glands, temporarily reducing saliva production.\n\nWhile uncomfortable, dry mouth from CBD is typically mild and temporary. It's more common at higher doses and tends to diminish over time with regular use.\n\nManagement strategies: stay well hydrated, keep water nearby, use sugar-free gum or lozenges to stimulate saliva, and consider reducing your CBD dose if symptoms are bothersome.",
    synonyms: ["Cottonmouth", "Xerostomia", "Dry mouth CBD"]
  },
  {
    term: "Drowsiness",
    display_name: "Drowsiness",
    slug: "drowsiness",
    category: "medical",
    short_definition: "Sleepiness that can occur with CBD, especially at higher doses.",
    definition: "Drowsiness is a potential side effect of CBD, particularly at higher doses. CBD's interaction with receptors affecting the sleep-wake cycle can promote relaxation and sleepiness.\n\nWhether drowsiness is a side effect or benefit depends on your goals. For those using CBD for sleep, it's beneficial. For daytime use, it may be problematic.\n\nTo manage daytime drowsiness: use lower doses during the day, save higher doses for evening, choose energizing terpene profiles, and give your body time to adjust. The biphasic effect means lower doses may actually be more alerting.",
    synonyms: ["Sleepiness", "Fatigue", "Tiredness"]
  },
  {
    term: "Appetite Changes",
    display_name: "Appetite Changes",
    slug: "appetite-changes",
    category: "medical",
    short_definition: "CBD may increase or decrease appetite depending on the individual and dose.",
    definition: "CBD can affect appetite in both directions—some people experience increased hunger, while others notice decreased appetite. This biphasic effect varies by individual and dose.\n\nUnlike THC, which strongly stimulates appetite ('the munchies'), CBD has more subtle and variable effects on hunger. Lower doses may slightly increase appetite; higher doses may suppress it.\n\nIf you experience unwanted appetite changes, try adjusting your dose or timing. Taking CBD after meals rather than before may reduce effects on hunger. These changes are typically mild and temporary.",
    synonyms: ["Hunger changes", "Appetite effects"]
  },
  {
    term: "Liver Enzymes",
    display_name: "Liver Enzymes",
    slug: "liver-enzymes",
    category: "medical",
    short_definition: "High CBD doses may elevate liver enzymes—important for those with liver conditions.",
    definition: "Elevated liver enzymes (ALT, AST) have been observed in some clinical trials of high-dose CBD (particularly Epidiolex at 10-20mg/kg/day). This suggests potential liver stress.\n\nAt typical supplement doses (under 100mg daily), liver enzyme elevation is rare. However, those with liver disease or taking hepatotoxic medications should be cautious and may need monitoring.\n\nThe FDA recommends baseline liver enzyme testing before starting Epidiolex and periodic monitoring. For CBD supplements, those with liver concerns should consult their doctor and consider periodic testing if using higher doses.",
    synonyms: ["Liver function", "ALT", "AST", "Hepatotoxicity"]
  },
  {
    term: "Grapefruit Interaction",
    display_name: "Grapefruit Interaction",
    slug: "grapefruit-interaction",
    category: "medical",
    short_definition: "If your medication warns against grapefruit, it likely interacts with CBD too.",
    definition: "The 'grapefruit warning' on medications indicates the drug is metabolized by CYP3A4 enzymes, which both grapefruit and CBD inhibit. This means medications with grapefruit warnings likely interact with CBD.\n\nBoth grapefruit and CBD can cause these medications to reach higher blood levels than intended, potentially increasing side effects. The mechanism is the same: inhibition of drug-metabolizing enzymes.\n\nThis provides a useful screening tool: check if your medications have grapefruit warnings. If so, consult your healthcare provider before using CBD. They may need to adjust medication doses or monitor more closely.",
    synonyms: ["Grapefruit warning", "CYP3A4 interaction"]
  },
  {
    term: "Blood Thinner Interaction",
    display_name: "Blood Thinner Interaction",
    slug: "blood-thinner-interaction",
    category: "medical",
    short_definition: "CBD can increase blood thinner levels, raising bleeding risk—always consult your doctor.",
    definition: "CBD can interact with blood thinners (anticoagulants) like warfarin by inhibiting the enzymes that metabolize these medications. This can lead to higher blood thinner levels and increased bleeding risk.\n\nWarfarin is particularly sensitive to CBD interaction. Studies have shown CBD can significantly increase INR (a measure of blood clotting time) in patients on warfarin.\n\nIf you take blood thinners, do NOT start CBD without consulting your prescribing doctor. More frequent INR monitoring may be needed. Dose adjustments of the blood thinner may be necessary. This is a serious interaction requiring medical supervision.",
    synonyms: ["Warfarin interaction", "Anticoagulant interaction"]
  }
];

async function addTerms() {
  console.log(`Adding ${terms.length} glossary terms (Batch 3)...\n`);

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
