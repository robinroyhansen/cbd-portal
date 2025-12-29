#!/usr/bin/env python3
"""
Script to update CBD articles in Supabase database
"""

import os
import json
from datetime import datetime
from supabase import create_client, Client
import re

# Configuration
SUPABASE_URL = "https://jgivzyszbpyuvqfmldin.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Article data
articles_to_update = {
    "cbd-and-anxiety": {
        "title": "CBD and Anxiety: A Comprehensive Analysis of Current Clinical Evidence (2025)",
        "excerpt": "Comprehensive review of CBD for anxiety disorders based on systematic reviews and controlled trials through 2024, including dosing protocols and safety considerations.",
        "meta_title": "CBD for Anxiety: Clinical Evidence, Dosing & Safety Guide (2025)",
        "meta_description": "Evidence-based analysis of CBD for anxiety disorders. Latest research, dosing guidelines, safety profile, and FAQs based on 2024 clinical trials and meta-analyses.",
        "reading_time": 12,
        "featured_image": "/images/cbd-anxiety-molecular-structure.jpg",
        "citations": [
            {
                "title": "The Impact of Cannabidiol Treatment on Anxiety Disorders: A Systematic Review of Randomized Controlled Clinical Trials",
                "authors": "Coelho CF, Lopes-Martins RAB, et al.",
                "publication": "Life (Basel)",
                "year": 2024,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11595441/",
                "doi": "10.3390/life14111373"
            },
            {
                "title": "Therapeutic potential of cannabidiol (CBD) in anxiety disorders: A systematic review and meta-analysis",
                "authors": "Han K, Wang JY, Wang PY, Peng YCH",
                "publication": "Psychiatry Research",
                "year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/38924898/",
                "doi": "10.1016/j.psychres.2024.116049"
            },
            {
                "title": "Evaluation of the efficacy, safety, and pharmacokinetics of nanodispersible cannabidiol oral solution versus placebo in mild to moderate anxiety",
                "authors": "Multiple authors",
                "publication": "Journal of Cannabis Research",
                "year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/38797087/",
                "doi": null
            },
            {
                "title": "Clinical and Cognitive Improvement Following Treatment with Hemp-Derived, Full-Spectrum, High-Cannabidiol Product in Patients with Anxiety",
                "authors": "Multiple authors",
                "publication": "Biomedicines",
                "year": 2024,
                "url": "https://www.mdpi.com/2227-9059/13/8/1874",
                "doi": "10.3390/biomedicines13081874"
            },
            {
                "title": "The Effectiveness and Adverse Events of Cannabidiol and Tetrahydrocannabinol Used in the Treatment of Anxiety Disorders in a PTSD Subpopulation",
                "authors": "Multiple authors",
                "publication": "Journal of Cannabis Research",
                "year": 2023,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10387818/",
                "doi": "10.1186/s42238-023-00197-6"
            }
        ]
    },
    "cbd-and-sleep": {
        "title": "CBD and Sleep: Evidence from Clinical Trials and Systematic Reviews (2025)",
        "excerpt": "Comprehensive analysis of CBD for sleep disorders based on RCTs and meta-analyses through 2025, comparing CBD with CBN and providing evidence-based dosing guidance.",
        "meta_title": "CBD for Sleep: Clinical Evidence, Dosing & CBN Comparison (2025)",
        "meta_description": "Evidence-based review of CBD for insomnia and sleep disorders. Latest research, CBD vs CBN comparison, dosing protocols, and FAQs from 2025 clinical trials.",
        "reading_time": 14,
        "featured_image": "/images/cbd-sleep-rem-cycle.jpg",
        "citations": [
            {
                "title": "Effectiveness of cannabinoids on subjective sleep quality in people with and without insomnia or poor sleep: A systematic review and meta-analysis",
                "authors": "Multiple authors",
                "publication": "Sleep Medicine Reviews",
                "year": 2025,
                "url": "https://pubmed.ncbi.nlm.nih.gov/40929927/",
                "doi": null
            },
            {
                "title": "Cannabidiol for moderate–severe insomnia: a randomized controlled pilot trial of 150 mg of nightly dosing",
                "authors": "Narayan AJ, Downey LA, Rose S, Di Natale L, Hayley AC",
                "publication": "Journal of Clinical Sleep Medicine",
                "year": 2024,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11063694/",
                "doi": "10.5664/jcsm.10998"
            },
            {
                "title": "Effects of a cannabidiol/terpene formulation on sleep in individuals with insomnia: a double-blind, placebo-controlled, randomized, crossover study",
                "authors": "Multiple authors",
                "publication": "Journal of Clinical Sleep Medicine",
                "year": 2025,
                "url": "https://pubmed.ncbi.nlm.nih.gov/39167421/",
                "doi": null
            },
            {
                "title": "The Safety and Comparative Effectiveness of Non-Psychoactive Cannabinoid Formulations for the Improvement of Sleep: A Double-Blinded, Randomized Controlled Trial",
                "authors": "Multiple authors",
                "publication": "Journal of the American Nutrition Association",
                "year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/37162192/",
                "doi": "10.1080/27697061.2023.2203221"
            },
            {
                "title": "Use of Cannabidiol in the Management of Insomnia: A Systematic Review",
                "authors": "Ranum RM, Whipple MO, Croghan I, Bauer B, Toussaint LL, Vincent A",
                "publication": "Cannabis and Cannabinoid Research",
                "year": 2023,
                "url": "https://pubmed.ncbi.nlm.nih.gov/36149724/",
                "doi": "10.1089/can.2022.0122"
            },
            {
                "title": "A double-blind, randomized, placebo-controlled study of the safety and effects of CBN with and without CBD on sleep quality",
                "authors": "Multiple authors",
                "publication": "Experimental and Clinical Psychopharmacology",
                "year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/37796540/",
                "doi": null
            },
            {
                "title": "A sleepy cannabis constituent: cannabinol and its active metabolite influence sleep architecture in rats",
                "authors": "Lavender JM, et al.",
                "publication": "Neuropsychopharmacology",
                "year": 2024,
                "url": "https://www.nature.com/articles/s41386-024-02018-7",
                "doi": "10.1038/s41386-024-02018-7"
            }
        ]
    },
    "cbd-and-pain": {
        "title": "CBD and Pain Management: Clinical Evidence from Systematic Reviews and Trials (2025)",
        "excerpt": "Evidence-based analysis of CBD for chronic pain based on systematic reviews and RCTs through 2025, revealing mixed results and important safety considerations.",
        "meta_title": "CBD for Pain: Clinical Evidence, Safety & Effectiveness (2025)",
        "meta_description": "Comprehensive review of CBD for pain management. Latest research, dosing guidelines, safety concerns, and realistic expectations based on 2025 clinical evidence.",
        "reading_time": 15,
        "featured_image": "/images/cbd-pain-mechanisms.jpg",
        "citations": [
            {
                "title": "Cannabidiol (CBD): A Systematic Review of Clinical and Preclinical Evidence in the Treatment of Pain",
                "authors": "Cásedas G, de Yarza-Sancho M, López V",
                "publication": "Pharmaceuticals (Basel)",
                "year": 2024,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11597428/",
                "doi": "10.3390/ph17111438"
            },
            {
                "title": "Living Systematic Review on Cannabis and Other Plant-Based Treatments for Chronic Pain: 2025 Update",
                "authors": "Multiple authors",
                "publication": "National Center for Biotechnology Information",
                "year": 2025,
                "url": "https://www.ncbi.nlm.nih.gov/books/NBK618040/",
                "doi": null
            },
            {
                "title": "Effectiveness of Cannabidiol to Manage Chronic Pain: A Systematic Review",
                "authors": "Mohammed RN, et al.",
                "publication": "Pain Management Nursing",
                "year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/37953193/",
                "doi": "10.1016/j.pmn.2023.10.002"
            },
            {
                "title": "The Use of Cannabinoids in the Treatment of Peripheral Neuropathy and Neuropathic Pain: A Systematic Review",
                "authors": "Multiple authors",
                "publication": "Journal of the Peripheral Nervous System",
                "year": 2025,
                "url": "https://pubmed.ncbi.nlm.nih.gov/39570218/",
                "doi": null
            },
            {
                "title": "Cannabis-Based Products for Chronic Pain: An Updated Systematic Review",
                "authors": "Multiple authors",
                "publication": "Annals of Internal Medicine",
                "year": 2025,
                "url": "https://www.acpjournals.org/doi/10.7326/ANNALS-25-03152",
                "doi": "10.7326/ANNALS-25-03152"
            },
            {
                "title": "Oral cannabidiol (CBD) as add-on to paracetamol for painful chronic osteoarthritis of the knee",
                "authors": "Multiple authors",
                "publication": "The Lancet Regional Health - Europe",
                "year": 2024,
                "url": "https://www.thelancet.com/journals/lanepe/article/PIIS2666-7762(23)00196-5/fulltext",
                "doi": "10.1016/j.lanepe.2023.100736"
            }
        ]
    },
    "cbd-and-depression": {
        "title": "CBD and Depression: Current Evidence and Future Promise (2025)",
        "excerpt": "Comprehensive review of CBD for depression examining preclinical promise versus limited clinical evidence, with analysis of ongoing trials and future research directions.",
        "meta_title": "CBD for Depression: Clinical Evidence & Research Status (2025)",
        "meta_description": "Evidence-based review of CBD for depression. Current research, ongoing trials, mechanisms of action, and realistic assessment of therapeutic potential in 2025.",
        "reading_time": 13,
        "featured_image": "/images/cbd-depression-brain-pathways.jpg",
        "citations": [
            {
                "title": "Cannabidiol Induces Rapid and Sustained Antidepressant-Like Effects Through Increased BDNF Signaling and Synaptogenesis in the Prefrontal Cortex",
                "authors": "Sales AJ, et al.",
                "publication": "Molecular Neurobiology",
                "year": 2019,
                "url": "https://pubmed.ncbi.nlm.nih.gov/29869197/",
                "doi": "10.1007/s12035-018-1143-4"
            },
            {
                "title": "The association between cannabis and depression: an updated Systematic Review and Meta-analysis",
                "authors": "Jefsen OH, et al.",
                "publication": "Psychological Medicine",
                "year": 2024,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12055028/",
                "doi": "10.1017/S0033291723003446"
            },
            {
                "title": "Cannabis use and mood disorders: a systematic review",
                "authors": "Multiple authors",
                "publication": "Frontiers in Public Health",
                "year": 2024,
                "url": "https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2024.1346207/full",
                "doi": "10.3389/fpubh.2024.1346207"
            },
            {
                "title": "Cannabinoids for the treatment of mental disorders and symptoms of mental disorders: a systematic review and meta-analysis",
                "authors": "Black N, et al.",
                "publication": "The Lancet Psychiatry",
                "year": 2019,
                "url": "https://pubmed.ncbi.nlm.nih.gov/31672337/",
                "doi": "10.1016/S2215-0366(19)30401-8"
            },
            {
                "title": "UBC researchers launch clinical trial exploring CBD for bipolar depression",
                "authors": "UBC News",
                "publication": "University of British Columbia",
                "year": 2024,
                "url": "https://news.ubc.ca/2024/02/clinical-trial-exploring-cbd-for-bipolar-depression-2/",
                "doi": null
            },
            {
                "title": "Therapeutic potential of cannabidiol (CBD) in anxiety disorders: A systematic review and meta-analysis",
                "authors": "Han K, et al.",
                "publication": "Psychiatry Research",
                "year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/38924898/",
                "doi": "10.1016/j.psychres.2024.116049"
            }
        ]
    },
    "cbd-and-inflammation": {
        "title": "CBD and Inflammation: From Molecular Mechanisms to Clinical Applications (2025)",
        "excerpt": "Comprehensive analysis of CBD's anti-inflammatory properties, examining cytokine modulation, clinical trial results, and therapeutic applications across inflammatory conditions.",
        "meta_title": "CBD for Inflammation: Anti-Inflammatory Effects & Research (2025)",
        "meta_description": "Evidence-based review of CBD's anti-inflammatory properties. Cytokine effects, clinical trials, dosing for inflammation, and comparison to NSAIDs and corticosteroids.",
        "reading_time": 14,
        "featured_image": "/images/cbd-inflammation-cytokines.jpg",
        "citations": [
            {
                "title": "A molecular basis for the anti-inflammatory and anti-fibrosis properties of cannabidiol",
                "authors": "Atalay S, et al.",
                "publication": "FASEB Journal",
                "year": 2020,
                "url": "https://pubmed.ncbi.nlm.nih.gov/32885502/",
                "doi": "10.1096/fj.202000975R"
            },
            {
                "title": "The Effects of Cannabinoids on Pro- and Anti-Inflammatory Cytokines: A Systematic Review of In Vivo Studies",
                "authors": "Henshaw FR, et al.",
                "publication": "Cannabis and Cannabinoid Research",
                "year": 2021,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8266561/",
                "doi": "10.1089/can.2020.0105"
            },
            {
                "title": "Cannabidiol (CBD): A Systematic Review of Clinical and Preclinical Evidence in the Treatment of Pain",
                "authors": "Cásedas G, de Yarza-Sancho M, López V",
                "publication": "Pharmaceuticals (Basel)",
                "year": 2024,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11597428/",
                "doi": "10.3390/ph17111438"
            },
            {
                "title": "Effects of Oral Cannabidiol on Health and Fitness in Healthy Adults: An 8-Week Randomized Trial",
                "authors": "Crossland BW, et al.",
                "publication": "Nutrients",
                "year": 2023,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10301202/",
                "doi": "10.3390/nu15122664"
            },
            {
                "title": "Evaluation of pharmacokinetics and acute anti-inflammatory potential of two oral cannabidiol preparations in healthy adults",
                "authors": "Hobbs JM, et al.",
                "publication": "Phytotherapy Research",
                "year": 2020,
                "url": "https://pubmed.ncbi.nlm.nih.gov/32147925/",
                "doi": "10.1002/ptr.6651"
            },
            {
                "title": "Cannabidiol (CBD): a killer for inflammatory rheumatoid arthritis synovial fibroblasts",
                "authors": "Lowin T, et al.",
                "publication": "Cell Death & Disease",
                "year": 2020,
                "url": "https://www.nature.com/articles/s41419-020-02892-1",
                "doi": "10.1038/s41419-020-02892-1"
            }
        ]
    },
    "cbd-and-arthritis": {
        "title": "CBD and Arthritis: Clinical Evidence for Joint Pain and Inflammation (2025)",
        "excerpt": "Evidence-based review of CBD for arthritis examining the disconnect between popular use and clinical trial results, with analysis of topical versus oral formulations.",
        "meta_title": "CBD for Arthritis: Clinical Trials, Topical vs Oral Evidence (2025)",
        "meta_description": "Comprehensive review of CBD for osteoarthritis and rheumatoid arthritis. Latest research, clinical trials, topical gel studies, and realistic effectiveness assessment.",
        "reading_time": 15,
        "featured_image": "/images/cbd-arthritis-joint-relief.jpg",
        "citations": [
            {
                "title": "Cannabidiol (CBD): A Systematic Review of Clinical and Preclinical Evidence in the Treatment of Pain",
                "authors": "Cásedas G, de Yarza-Sancho M, López V",
                "publication": "Pharmaceuticals (Basel)",
                "year": 2024,
                "url": "https://www.mdpi.com/1424-8247/17/11/1438",
                "doi": "10.3390/ph17111438"
            },
            {
                "title": "Effectiveness of Cannabidiol to Manage Chronic Pain: A Systematic Review",
                "authors": "Mohammed RN, et al.",
                "publication": "Pain Management Nursing",
                "year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/37953193/",
                "doi": "10.1016/j.pmn.2023.10.002"
            },
            {
                "title": "Efficacy and safety of cannabidiol for the treatment of canine osteoarthritis: a systematic review and meta-analysis",
                "authors": "Multiple authors",
                "publication": "Frontiers in Veterinary Science",
                "year": 2023,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10540436/",
                "doi": "10.3389/fvets.2023.1269236"
            },
            {
                "title": "Oral cannabidiol (CBD) as add-on to paracetamol for painful chronic osteoarthritis of the knee",
                "authors": "Multiple authors",
                "publication": "The Lancet Regional Health - Europe",
                "year": 2024,
                "url": "https://www.thelancet.com/journals/lanepe/article/PIIS2666-7762(23)00196-5/fulltext",
                "doi": "10.1016/j.lanepe.2023.100808"
            },
            {
                "title": "An open-label feasibility trial of transdermal cannabidiol for hand osteoarthritis",
                "authors": "Heineman JT, et al.",
                "publication": "Scientific Reports",
                "year": 2024,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11116491/",
                "doi": "10.1038/s41598-024-62428-x"
            },
            {
                "title": "Cannabidiol (CBD): a killer for inflammatory rheumatoid arthritis synovial fibroblasts",
                "authors": "Lowin T, et al.",
                "publication": "Cell Death & Disease",
                "year": 2020,
                "url": "https://www.nature.com/articles/s41419-020-02892-1",
                "doi": "10.1038/s41419-020-02892-1"
            }
        ]
    },
    "cbd-and-stress": {
        "title": "CBD and Stress: From Cortisol to Calm - Evidence and Applications (2025)",
        "excerpt": "Evidence-based analysis of CBD for stress management, examining effects on cortisol, HPA axis function, and endocannabinoid system modulation in acute and chronic stress.",
        "meta_title": "CBD for Stress: Cortisol, HPA Axis & Clinical Evidence (2025)",
        "meta_description": "Comprehensive review of CBD for stress management. Effects on cortisol, stress response, dosing strategies, and comparison to conventional treatments based on 2025 research.",
        "reading_time": 14,
        "featured_image": "/images/cbd-stress-cortisol-regulation.jpg",
        "citations": [
            {
                "title": "Enhancing Endocannabinoid Control of Stress with Cannabidiol",
                "authors": "García-Gutiérrez MS, et al.",
                "publication": "Journal of Clinical Medicine",
                "year": 2021,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8704602/",
                "doi": "10.3390/jcm10245852"
            },
            {
                "title": "Potential Utility of Cannabidiol in Stress-Related Disorders",
                "authors": "Papagianni EP, Stevenson CW",
                "publication": "Cannabis and Cannabinoid Research",
                "year": 2023,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10061337/",
                "doi": "10.1089/can.2022.0017"
            },
            {
                "title": "Therapeutic potential of cannabidiol (CBD) in anxiety disorders: A systematic review and meta-analysis",
                "authors": "Han K, et al.",
                "publication": "Psychiatry Research",
                "year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/38924898/",
                "doi": "10.1016/j.psychres.2024.116049"
            },
            {
                "title": "The Impact of Cannabidiol Expectancy on Cortisol Responsivity in the Context of Acute Stress",
                "authors": "Multiple authors",
                "publication": "Cannabis and Cannabinoid Research",
                "year": 2024,
                "url": "https://www.liebertpub.com/doi/full/10.1089/can.2022.0326",
                "doi": "10.1089/can.2022.0326"
            },
            {
                "title": "Effects of short-term cannabidiol treatment on response to social stress in subjects at clinical high risk of developing psychosis",
                "authors": "Appiah-Kusi E, et al.",
                "publication": "Psychopharmacology",
                "year": 2020,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7113209/",
                "doi": "10.1007/s00213-019-05442-6"
            }
        ]
    },
    "cbd-and-epilepsy": {
        "title": "CBD and Epilepsy: From FDA Approval to Clinical Practice (2025)",
        "excerpt": "Comprehensive review of CBD (Epidiolex) for epilepsy, covering FDA-approved indications, clinical trial data, real-world evidence, dosing, and emerging applications.",
        "meta_title": "CBD for Epilepsy: Epidiolex Clinical Evidence & Treatment (2025)",
        "meta_description": "Evidence-based guide to CBD for epilepsy. FDA-approved uses, clinical trials, real-world outcomes, dosing protocols, and safety data for Dravet, Lennox-Gastaut, and TSC.",
        "reading_time": 16,
        "featured_image": "/images/cbd-epilepsy-seizure-control.jpg",
        "citations": [
            {
                "title": "Cannabinoids in the Treatment of Epilepsy: A Focused Review of Evidence and Gaps",
                "authors": "Perucca E",
                "publication": "Frontiers in Neurology",
                "year": 2020,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7604476/",
                "doi": "10.3389/fneur.2020.531939"
            },
            {
                "title": "Real-world evidence on the use of cannabidiol for the treatment of drug resistant epilepsy",
                "authors": "Multiple authors",
                "publication": "Epilepsy & Behavior",
                "year": 2023,
                "url": "https://pubmed.ncbi.nlm.nih.gov/37769547/",
                "doi": null
            },
            {
                "title": "Use of cannabidiol in the treatment of epilepsy: Lennox-Gastaut syndrome, Dravet syndrome, and tuberous sclerosis complex",
                "authors": "Multiple authors",
                "publication": "Epilepsy & Behavior",
                "year": 2022,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC9683917/",
                "doi": "10.1016/j.yebeh.2022.108968"
            },
            {
                "title": "Long-term efficacy and safety of cannabidiol in patients with treatment-resistant focal epilepsies",
                "authors": "Multiple authors",
                "publication": "Epilepsia",
                "year": 2025,
                "url": "https://pubmed.ncbi.nlm.nih.gov/40673944/",
                "doi": null
            },
            {
                "title": "Clinical efficacy and safety of cannabidiol for pediatric refractory epilepsy indications: A systematic review and meta-analysis",
                "authors": "Chen KA, et al.",
                "publication": "Experimental and Therapeutic Medicine",
                "year": 2023,
                "url": "https://pubmed.ncbi.nlm.nih.gov/36206805/",
                "doi": "10.3892/etm.2022.11644"
            },
            {
                "title": "The efficacy of cannabidiol for seizures reduction in pharmacoresistant epilepsy: a systematic review and meta-analysis",
                "authors": "Multiple authors",
                "publication": "Acta Epileptologica",
                "year": 2025,
                "url": "https://aepi.biomedcentral.com/articles/10.1186/s42494-024-00191-2",
                "doi": "10.1186/s42494-024-00191-2"
            }
        ]
    },
    "cbd-and-ptsd": {
        "title": "CBD and PTSD: Emerging Evidence for Trauma Recovery (2025)",
        "excerpt": "Comprehensive review of CBD for PTSD examining neurobiological mechanisms, clinical evidence, ongoing veteran trials, and integration with trauma-focused therapies.",
        "meta_title": "CBD for PTSD: Clinical Trials, Veterans & Treatment (2025)",
        "meta_description": "Evidence-based analysis of CBD for PTSD. Current research with veterans, effects on nightmares and flashbacks, cortisol modulation, and combination with therapy.",
        "reading_time": 15,
        "featured_image": "/images/cbd-ptsd-trauma-recovery.jpg",
        "citations": [
            {
                "title": "Potential Utility of Cannabidiol in Stress-Related Disorders",
                "authors": "Papagianni EP, Stevenson CW",
                "publication": "Cannabis and Cannabinoid Research",
                "year": 2023,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10061337/",
                "doi": "10.1089/can.2022.0017"
            },
            {
                "title": "Cannabidiol in the Treatment of Post-Traumatic Stress Disorder: A Case Series",
                "authors": "Elms L, et al.",
                "publication": "Journal of Alternative and Complementary Medicine",
                "year": 2019,
                "url": "https://pubmed.ncbi.nlm.nih.gov/30543451/",
                "doi": "10.1089/acm.2018.0437"
            },
            {
                "title": "Therapeutic potential of cannabidiol (CBD) in anxiety disorders: A systematic review and meta-analysis",
                "authors": "Han K, et al.",
                "publication": "Psychiatry Research",
                "year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/38924898/",
                "doi": "10.1016/j.psychres.2024.116049"
            },
            {
                "title": "The Impact of Cannabidiol Treatment on Anxiety Disorders: A Systematic Review",
                "authors": "Multiple authors",
                "publication": "Life",
                "year": 2024,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11595441/",
                "doi": "10.3390/life14111373"
            },
            {
                "title": "Enhancing massed prolonged exposure with cannabidiol",
                "authors": "Rasmussen et al.",
                "publication": "Contemporary Clinical Trials Communications",
                "year": 2024,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10884801/",
                "doi": "10.1016/j.conctc.2024.101264"
            }
        ]
    },
    "cbd-and-fibromyalgia": {
        "title": "CBD and Fibromyalgia: Hope, Hype, and Clinical Reality (2025)",
        "excerpt": "Critical analysis of CBD for fibromyalgia examining the disconnect between patient reports and clinical trial results, with latest evidence from 2025 RCT showing no benefit.",
        "meta_title": "CBD for Fibromyalgia: Clinical Evidence vs Patient Experience (2025)",
        "meta_description": "Evidence-based review of CBD for fibromyalgia. 2025 RCT results, systematic reviews, real-world data, and why clinical trials don't support widespread use.",
        "reading_time": 16,
        "featured_image": "/images/cbd-fibromyalgia-widespread-pain.jpg",
        "citations": [
            {
                "title": "Cannabidiol versus placebo in patients with fibromyalgia: a randomised, double-blind, placebo-controlled trial",
                "authors": "Multiple authors",
                "publication": "European Journal of Pain",
                "year": 2025,
                "url": "https://www.sciencedirect.com/science/article/abs/pii/S0003496725042384",
                "doi": null
            },
            {
                "title": "Is a Low Dosage of Medical Cannabis Effective for Treating Pain Related to Fibromyalgia? A Pilot Study and Systematic Review",
                "authors": "Multiple authors",
                "publication": "Journal of Clinical Medicine",
                "year": 2024,
                "url": "https://www.mdpi.com/2077-0383/13/14/4088",
                "doi": "10.3390/jcm13144088"
            },
            {
                "title": "Effectiveness and safety of cannabis-based products for medical use in patients with fibromyalgia syndrome: A systematic review",
                "authors": "Lopera V, et al.",
                "publication": "Medicine (Baltimore)",
                "year": 2024,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11533093/",
                "doi": "10.1097/MD.0000000000040503"
            },
            {
                "title": "Comparison of Cannabis-Based Medicinal Product Formulations for Fibromyalgia: A Cohort Study",
                "authors": "Multiple authors",
                "publication": "Journal of Pain & Palliative Care Pharmacotherapy",
                "year": 2025,
                "url": "https://www.tandfonline.com/doi/full/10.1080/15360288.2024.2414073",
                "doi": "10.1080/15360288.2024.2414073"
            },
            {
                "title": "Cannabidiol Product Dosing and Decision-Making in a National Survey of Individuals with Fibromyalgia",
                "authors": "Boehnke KF, et al.",
                "publication": "Journal of Pain",
                "year": 2022,
                "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8716664/",
                "doi": "10.1016/j.jpain.2021.06.007"
            }
        ]
    }
}

def update_article(supabase: Client, slug: str, article_data: dict, content: str):
    """Update article in database"""

    # Update main article
    update_data = {
        "title": article_data["title"],
        "excerpt": article_data["excerpt"],
        "content": content,
        "meta_title": article_data["meta_title"],
        "meta_description": article_data["meta_description"],
        "reading_time": article_data["reading_time"],
        "featured_image": article_data["featured_image"],
        "updated_at": datetime.now().isoformat(),
        "status": "published"
    }

    try:
        # Update article
        result = supabase.table("kb_articles").update(update_data).eq("slug", slug).execute()

        if result.data:
            article_id = result.data[0]['id']
            print(f"✓ Updated article: {slug} (ID: {article_id})")

            # Delete existing citations for this article
            supabase.table("kb_citations").delete().eq("article_id", article_id).execute()

            # Insert new citations
            for citation in article_data["citations"]:
                citation_data = {
                    "article_id": article_id,
                    **citation,
                    "accessed_at": datetime.now().isoformat()
                }
                supabase.table("kb_citations").insert(citation_data).execute()

            print(f"✓ Updated {len(article_data['citations'])} citations for {slug}")

            return True
        else:
            print(f"✗ Article not found: {slug}")
            return False

    except Exception as e:
        print(f"✗ Error updating {slug}: {str(e)}")
        return False

def main():
    """Main function"""

    if not SUPABASE_SERVICE_ROLE_KEY:
        print("Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set")
        print("Please set it with: export SUPABASE_SERVICE_ROLE_KEY='your-key-here'")
        return

    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    # Process each article
    for slug, article_data in articles_to_update.items():
        # Read article content from markdown file
        md_file = f"articles/{slug}.md"

        if os.path.exists(md_file):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Update in database
            update_article(supabase, slug, article_data, content)
        else:
            print(f"✗ Markdown file not found: {md_file}")

    print("\nUpdate complete!")

if __name__ == "__main__":
    main()