#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Supabase setup
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Load English conditions
const conditionsPath = path.join(__dirname, 'data', 'conditions_en.json');
const conditions = JSON.parse(fs.readFileSync(conditionsPath, 'utf8'));

console.log(`Loaded ${conditions.length} conditions to translate`);

// Romanian translation mappings for medical terms and common phrases
const romanianTranslations = {
  // Medical conditions - alphabetical
  'Acid Reflux': 'Reflux acid',
  'Acne': 'Acnee',
  'Actors': 'Actori',
  'Acupuncture': 'Acupunctură',
  'Addiction': 'Dependență',
  'Adenosine': 'Adenozină',
  'ADHD': 'ADHD',
  'Aggressive Dogs': 'Câini agresivi',
  'Aging': 'Îmbătrânire',
  'Aging Skin': 'Îmbătrânirea pielii',
  'Alcohol': 'Alcool',
  'Alcohol Withdrawal': 'Sevraj alcoolic',
  'Allergies': 'Alergii',
  "Alzheimer's": 'Alzheimer',
  'Ankle Pain': 'Durere de gleznă',
  'Antibiotics': 'Antibiotice',
  'Antidepressants': 'Antidepresive',
  'Anxiety': 'Anxietate',
  'Appetite': 'Apetit',
  'Architects': 'Arhitecți',
  'Arthritis': 'Artrită',
  'Artists': 'Artiști',
  'Asthma': 'Astm',
  'Athletic Recovery': 'Recuperare sportivă',
  'Autism': 'Autism',
  'Autoimmune Conditions': 'Afecțiuni autoimune',
  'Back Pain': 'Durere de spate',
  'Beginners': 'Începători',
  'Better Rest': 'Odihnă mai bună',
  'Bipolar Disorder': 'Tulburare bipolară',
  'Bird Anxiety': 'Anxietatea păsărilor',
  'Birds': 'Păsări',
  'Bloating': 'Balonare',
  'Blood Pressure': 'Tensiune arterială',
  'Blood Pressure Medications': 'Medicamente pentru tensiune',
  'Blood Thinners': 'Anticoagulante',
  'Breastfeeding': 'Alăptare',
  'Bronchitis': 'Bronșită',
  'Bruising': 'Vânătăi',
  'Bruxism': 'Bruxism',
  'Bug Bites': 'Mușcături de insecte',
  'Burnout': 'Epuizare',
  'Bursitis': 'Bursită',
  'Cancer': 'Cancer',
  'Caregivers': 'Îngrijitori',
  'Carpal Tunnel': 'Sindrom de tunel carpian',
  'Cat Aggression': 'Agresivitatea pisicilor',
  'Cat Anxiety': 'Anxietatea pisicilor',
  'Cat Appetite': 'Apetitul pisicilor',
  'Cat Arthritis': 'Artrita pisicilor',
  'Cat Cancer': 'Cancer la pisici',
  'Cat Hyperthyroidism': 'Hipertiroidism la pisici',
  'Cat Kidney Disease': 'Boală renală la pisici',
  'Cat Pain': 'Durerea pisicilor',
  'Cat Seizures': 'Convulsii la pisici',
  'Cat Stomatitis': 'Stomatită la pisici',
  'Chefs': 'Bucătari',
  'Chemotherapy Side Effects': 'Efecte secundare chimioterapie',
  'Chest Pain': 'Durere în piept',
  'Children': 'Copii',
  'Chiropractic': 'Chiropractică',
  'Cholesterol': 'Colesterol',
  'Chronic Fatigue': 'Oboseală cronică',
  'Chronic Pain': 'Durere cronică',
  'Circulation': 'Circulație',
  'Cluster Headaches': 'Cefalee în cluster',
  'Coffee': 'Cafea',
  'Cold Hands & Feet': 'Mâini și picioare reci',
  'Cold Plunge': 'Imersie la rece',
  'Colds & Flu': 'Răceală și gripă',
  'Constipation': 'Constipație',
  'Construction Workers': 'Muncitori în construcții',
  'COPD': 'BPOC',
  'COVID-19': 'COVID-19',
  'Creativity': 'Creativitate',
  "Crohn's Disease": 'Boala Crohn',
  'CrossFit': 'CrossFit',
  'Cyclists': 'Cicliști',
  'Dandruff': 'Mătreață',
  'Dating Anxiety': 'Anxietate în relații',
  'Dental Anxiety': 'Anxietate dentară',
  'Depression': 'Depresie',
  'Desk Workers': 'Lucrători de birou',
  'Diabetes': 'Diabet',
  'Diabetes Medications': 'Medicamente pentru diabet',
  'Diabetic Neuropathy': 'Neuropatie diabetică',
  'Diarrhea': 'Diaree',
  'Digestive Health': 'Sănătate digestivă',
  'Dog Allergies': 'Alergii la câini',
  'Dog Anxiety': 'Anxietatea câinilor',
  'Dog Appetite': 'Apetitul câinilor',
  'Dog Arthritis': 'Artrita câinilor',
  'Dog Hip Dysplasia': 'Displazie de șold la câini',
  'Dog Nausea': 'Greață la câini',
  'Dog Pain': 'Durerea câinilor',
  'Dog Seizures': 'Convulsii la câini',
  'Dog Separation Anxiety': 'Anxietate de separare la câini',
  'Dog Thunderstorm Anxiety': 'Anxietate de furtună la câini',
  'Dopamine': 'Dopamină',
  'Driving': 'Condus',
  'Drug Testing': 'Testare droguri',
  'Dry Mouth': 'Gură uscată',
  'Dry Skin': 'Piele uscată',
  'Eczema': 'Eczemă',
  'Elbow Pain': 'Durere de cot',
  'Endometriosis': 'Endometrioză',
  'Energy': 'Energie',
  'Entrepreneurs': 'Antreprenori',
  'Epilepsy': 'Epilepsie',
  'Exam Anxiety': 'Anxietate de examen',
  'Eye Health': 'Sănătatea ochilor',
  'Family Gatherings': 'Întâlniri de familie',
  'Feather Plucking': 'Smulgerea penelor',
  'Ferrets': 'Dihori',
  'Fibromyalgia': 'Fibromialgie',
  'Financial Advisors': 'Consultanți financiari',
  'First Responders': 'Echipe de urgență',
  'Focus': 'Concentrare',
  'Food Intolerances': 'Intoleranțe alimentare',
  'Foot Pain': 'Durere de picior',
  'Frozen Shoulder': 'Umăr înghețat',
  'GABA': 'GABA',
  'Gamers': 'Gameri',
  'Gastroparesis': 'Gastropareză',
  'Generalized Anxiety Disorder': 'Tulburare de anxietate generalizată',
  'Glaucoma': 'Glaucom',
  'Golf': 'Golf',
  'Grief': 'Doliu',
  'Guinea Pigs': 'Porcușori de Guineea',
  'Gum Disease': 'Boală gingivală',
  'Gut Health': 'Sănătatea intestinală',
  'Hair Loss': 'Căderea părului',
  'Hairdressers': 'Coafori',
  'Hamsters': 'Hamsteri',
  'Hand Pain': 'Durere de mână',
  'Hangover': 'Mahmureală',
  'Headaches': 'Dureri de cap',
  'Healthcare Anxiety': 'Anxietate medicală',
  'Healthcare Workers': 'Personal medical',
  'Hearing Loss': 'Pierderea auzului',
  'Heart Health': 'Sănătatea inimii',
  'Highly Sensitive People': 'Persoane foarte sensibile',
  'Hiking': 'Drumeții',
  'Hip Pain': 'Durere de șold',
  'Hives': 'Urticarie',
  'Holiday Stress': 'Stres de sărbători',
  'Homeostasis': 'Homeostazie',
  'Horse Anxiety': 'Anxietatea cailor',
  'Horse Cushings': 'Boala Cushing la cai',
  'Horse Laminitis': 'Laminită la cai',
  'Horse Navicular': 'Sindrom navicular la cai',
  'Horse Performance': 'Performanța cailor',
  'Horse Ulcers': 'Ulcere la cai',
  'Hot Flashes': 'Bufeuri',
  'Hot Tub': 'Jacuzzi',
  'IBS': 'SII',
  'Immune Health': 'Sănătatea imunitară',
  'Inflammation': 'Inflamație',
  'Insulin Resistance': 'Rezistență la insulină',
  'Intermittent Fasting': 'Post intermitent',
  'Interview Anxiety': 'Anxietate la interviuri',
  'Introverts': 'Introvertiți',
  'Jaw Pain': 'Durere de maxilar',
  'Joint Health': 'Sănătatea articulațiilor',
  'Keto Diet': 'Dieta keto',
  'Knee Pain': 'Durere de genunchi',
  'Lawyers': 'Avocați',
  'Leaky Gut': 'Intestin permeabil',
  'Liver Health': 'Sănătatea ficatului',
  'Long COVID': 'COVID lung',
  'Lupus': 'Lupus',
  'Martial Arts': 'Arte marțiale',
  'Meditation': 'Meditație',
  'Men': 'Bărbați',
  'Menopause': 'Menopauză',
  'Menstrual Cramps': 'Crampe menstruale',
  'Menstrual Pain': 'Durere menstruală',
  'Metabolic Syndrome': 'Sindrom metabolic',
  'Migraines': 'Migrene',
  'MMA': 'MMA',
  'Mood': 'Dispoziție',
  'Mouth Ulcers': 'Ulcere bucale',
  'Moving Stress': 'Stres de mutare',
  'Multiple Sclerosis': 'Scleroză multiplă',
  'Muscle Recovery': 'Recuperare musculară',
  'Muscle Tension': 'Tensiune musculară',
  'Musicians': 'Muzicieni',
  'Nail Health': 'Sănătatea unghiilor',
  'Nausea': 'Greață',
  'Neck Pain': 'Durere de gât',
  'Nerve Pain': 'Durere de nervi',
  'Nervous System': 'Sistem nervos',
  'Neurological': 'Neurologic',
  'Neuropathic Pain': 'Durere neuropatică',
  'New Mothers': 'Mame noi',
  'Night Owls': 'Noctambuli',
  'Obesity': 'Obezitate',
  'Occipital Neuralgia': 'Nevralgie occipitală',
  'OCD': 'TOC',
  'Oily Skin': 'Piele grasă',
  'Opioid Tapering': 'Reducerea opioidelor',
  'Over 60': 'Peste 60',
  'Overuse Injuries': 'Leziuni de suprasolicitare',
  'Pain': 'Durere',
  'Panic Attacks': 'Atacuri de panică',
  'Parents': 'Părinți',
  "Parkinson's": 'Parkinson',
  'Parrots': 'Papagali',
  'Pelvic Pain': 'Durere pelvină',
  'Perfectionists': 'Perfecționiști',
  'Performance Anxiety': 'Anxietate de performanță',
  'Peripheral Neuropathy': 'Neuropatie periferică',
  'Pet Fireworks Anxiety': 'Anxietate de artificii la animale',
  'Pet Travel Anxiety': 'Anxietate de călătorie la animale',
  'Pets': 'Animale de companie',
  'Phantom Pain': 'Durere fantomă',
  'Phone Anxiety': 'Anxietate telefonică',
  'Photographers': 'Fotografi',
  'Physical Therapy': 'Fizioterapie',
  'Plantar Fasciitis': 'Fasciită plantară',
  'PMS': 'SPM',
  'Podcasters': 'Podcasters',
  'Poison Ivy': 'Iederă otrăvitoare',
  'Post-Surgical Pain': 'Durere post-operatorie',
  'Pregnancy': 'Sarcină',
  'Prescription Medications': 'Medicamente prescrise',
  'Programmers': 'Programatori',
  'Psoriasis': 'Psoriazis',
  'PTSD': 'TSPT',
  'Public Speakers': 'Vorbitori publici',
  'Public Speaking Anxiety': 'Anxietate de vorbit în public',
  'Puppies': 'Căței',
  'Rabbits': 'Iepuri',
  'Radiation Therapy': 'Radioterapie',
  'Raynauds': 'Raynaud',
  'Real Estate Agents': 'Agenți imobiliari',
  'Remote Workers': 'Angajați la distanță',
  'Reptiles': 'Reptile',
  'Restless Leg Syndrome': 'Sindromul picioarelor neliniștite',
  'Retail Workers': 'Angajați în retail',
  'Rib Pain': 'Durere de coaste',
  'Rock Climbing': 'Escaladă',
  'Rosacea': 'Rozacee',
  'Runners': 'Alergători',
  'Sales Professionals': 'Profesioniști în vânzări',
  'Sauna': 'Saună',
  'Scalp Health': 'Sănătatea scalpului',
  'Scar Tissue Pain': 'Durere de țesut cicatricial',
  'Schizophrenia': 'Schizofrenie',
  'Sciatica': 'Sciatică',
  'Seasonal Allergies': 'Alergii sezoniere',
  'Seasonal Depression': 'Depresie sezonieră',
  'Senior Cats': 'Pisici în vârstă',
  'Senior Dogs': 'Câini în vârstă',
  'Senior Pets': 'Animale în vârstă',
  'Seniors': 'Seniori',
  'Sensitive Skin': 'Piele sensibilă',
  'Serotonin': 'Serotonină',
  'Shift Workers': 'Angajați în schimburi',
  'Shingles': 'Zona zoster',
  'Shoulder Pain': 'Durere de umăr',
  'Sinusitis': 'Sinuzită',
  'Skeptics': 'Sceptici',
  'Skiing': 'Schi',
  'Skin Health': 'Sănătatea pielii',
  'Sleep': 'Somn',
  'Sleep Apnea': 'Apnee în somn',
  'Small Pets': 'Animale mici',
  'Smoking Cessation': 'Renunțarea la fumat',
  'Snoring': 'Sforăit',
  'Social Anxiety': 'Anxietate socială',
  'Social Events': 'Evenimente sociale',
  'Sports Injuries': 'Accidentări sportive',
  'Streamers': 'Streameri',
  'Stress': 'Stres',
  'Students': 'Studenți',
  'Sunburn': 'Arsură solară',
  'Surfing': 'Surf',
  'Surgery Recovery': 'Recuperare chirurgicală',
  'Swimmers': 'Înotători',
  'Teachers': 'Profesori',
  'Teenagers': 'Adolescenți',
  'Tendonitis': 'Tendinită',
  'Tennis': 'Tenis',
  'Tension Headaches': 'Cefalee de tensiune',
  'THC Sensitive': 'Sensibil la THC',
  'Therapists': 'Terapeuți',
  'Thyroid': 'Tiroidă',
  'Tinnitus': 'Tinitus',
  'TMJ': 'ATM',
  'Tooth Pain': 'Durere de dinți',
  "Tourette's": 'Tourette',
  'Travel Anxiety': 'Anxietate de călătorie',
  'Travelers': 'Călători',
  'Trigeminal Neuralgia': 'Nevralgie de trigemen',
  'Truck Drivers': 'Șoferi de camion',
  'Type A Personalities': 'Personalități de tip A',
  'Ulcerative Colitis': 'Colită ulcerativă',
  'Varicose Veins': 'Varice',
  'Vegans': 'Vegani',
  'Vertigo': 'Vertij',
  'Veterans': 'Veterani',
  'Wedding Anxiety': 'Anxietate de nuntă',
  'Weight Management': 'Controlul greutății',
  'Weightlifters': 'Halterofilii',
  "Women's Health": 'Sănătatea femeilor',
  'Workout Recovery': 'Recuperare post-antrenament',
  'Wound Healing': 'Vindecarea rănilor',
  'Wrist Pain': 'Durere de încheietură',
  'Writers': 'Scriitori',
  'Yoga': 'Yoga'
};

// Romanian display name mappings
const romanianDisplayNames = {
  'Acid Reflux & GERD': 'Reflux acid și GERD',
  'Acne & Skin Health': 'Acnee și sănătatea pielii',
  'CBD for Actors': 'CBD pentru actori',
  'CBD & Acupuncture': 'CBD și acupunctură',
  'Addiction & Substance Use Disorders': 'Dependență și tulburări de consum',
  'CBD & Adenosine System': 'CBD și sistemul adenozinei',
  'Attention-Deficit/Hyperactivity Disorder': 'Tulburare de deficit de atenție/hiperactivitate',
  'Dog Aggression & Behavior': 'Agresivitate și comportament canin',
  'Aging & Longevity': 'Îmbătrânire și longevitate',
  'Anti-Aging Skincare': 'Îngrijire anti-îmbătrânire',
  'CBD & Alcohol': 'CBD și alcool',
  'Alcohol Withdrawal': 'Sevraj alcoolic',
  'Allergies': 'Alergii',
  "Alzheimer's Disease & Dementia": 'Boala Alzheimer și demență',
  'Ankle Pain & Sprains': 'Durere de gleznă și entorse',
  'CBD & Antibiotics': 'CBD și antibiotice',
  'CBD & Antidepressants': 'CBD și antidepresive',
  'Anxiety Disorders': 'Tulburări de anxietate',
  'Appetite Regulation': 'Reglarea apetitului',
  'CBD for Architects': 'CBD pentru arhitecți',
  'Arthritis & Joint Pain': 'Artrită și durere articulară',
  'CBD for Artists': 'CBD pentru artiști',
  'Asthma': 'Astm',
  'Athletic Recovery': 'Recuperare sportivă',
  'Sports & Athletic Performance': 'Sport și performanță atletică',
  'Autism Spectrum Disorder': 'Tulburare de spectru autist',
  'Autoimmune Conditions': 'Afecțiuni autoimune',
  'Back Pain': 'Durere de spate',
  'CBD for First-Timers': 'CBD pentru începători',
  'Rest & Relaxation': 'Odihnă și relaxare',
  'Bipolar Disorder': 'Tulburare bipolară',
  'Bird Anxiety & Stress': 'Anxietate și stres la păsări',
  'Bird Care & CBD': 'Îngrijirea păsărilor și CBD',
  'Bloating & Gas': 'Balonare și gaze',
  'Blood Pressure & Hypertension': 'Tensiune arterială și hipertensiune',
  'CBD & Blood Pressure Meds': 'CBD și medicamente pentru tensiune',
  'CBD & Blood Thinners': 'CBD și anticoagulante',
  'Breastfeeding & CBD Safety': 'Alăptare și siguranța CBD',
  'Bronchitis': 'Bronșită',
  'Bruising': 'Vânătăi',
  'Bruxism (Teeth Grinding)': 'Bruxism (scrâșnitul dinților)',
  'Bug Bites & Stings': 'Mușcături și înțepături de insecte',
  'Burnout & Chronic Stress': 'Epuizare și stres cronic',
  'Bursitis': 'Bursită',
  'Cancer & Oncology': 'Cancer și oncologie',
  'CBD for Caregivers': 'CBD pentru îngrijitori',
  'Carpal Tunnel Syndrome': 'Sindrom de tunel carpian',
  'Cat Aggression & Behavior': 'Agresivitate și comportament la pisici',
  'Cat Anxiety': 'Anxietate la pisici',
  'Cat Appetite Issues': 'Probleme de apetit la pisici',
  'Cat Arthritis': 'Artrită la pisici',
  'Cats with Cancer': 'Pisici cu cancer',
  'Cats with Hyperthyroidism': 'Pisici cu hipertiroidism',
  'Cats with Kidney Disease': 'Pisici cu boală renală',
  'Cat Pain Management': 'Gestionarea durerii la pisici',
  'Cat Seizures': 'Convulsii la pisici',
  'Feline Stomatitis': 'Stomatită la pisici',
  'CBD for Culinary Professionals': 'CBD pentru profesioniști culinari',
  'Chemotherapy Side Effects': 'Efecte secundare ale chimioterapiei',
  'Non-Cardiac Chest Pain': 'Durere toracică non-cardiacă',
  'CBD for Children': 'CBD pentru copii',
  'CBD & Chiropractic Care': 'CBD și îngrijire chiropractică',
  'Cholesterol Management': 'Gestionarea colesterolului',
  'Chronic Fatigue Syndrome': 'Sindrom de oboseală cronică',
  'Chronic Pain Management': 'Gestionarea durerii cronice',
  'Blood Circulation': 'Circulație sanguină',
  'Cluster Headaches': 'Cefalee în cluster',
  'CBD & Coffee': 'CBD și cafea',
  'Poor Extremity Circulation': 'Circulație slabă la extremități',
  'CBD & Cold Therapy': 'CBD și terapie la rece',
  'Cold & Flu Symptoms': 'Simptome de răceală și gripă',
  'Constipation': 'Constipație',
  'CBD for Construction Workers': 'CBD pentru muncitori în construcții',
  'COPD': 'BPOC',
  'COVID-19 Research': 'Cercetări COVID-19',
  'Creativity & Creative Flow': 'Creativitate și flux creativ',
  "Crohn's Disease & IBD": 'Boala Crohn și BII',
  'CBD for CrossFit': 'CBD pentru CrossFit',
  'CBD for Cyclists': 'CBD pentru cicliști',
  'Dandruff': 'Mătreață',
  'Dating & Relationship Anxiety': 'Anxietate în relații și întâlniri',
  'Dental Anxiety': 'Anxietate dentară',
  'Depression & Mood Disorders': 'Depresie și tulburări de dispoziție',
  'CBD for Office Workers': 'CBD pentru angajați de birou',
  'Diabetes & Blood Sugar': 'Diabet și glicemie',
  'CBD & Diabetes Medications': 'CBD și medicamente pentru diabet',
  'Diabetic Neuropathy': 'Neuropatie diabetică',
  'Diarrhea': 'Diaree',
  'Digestive Health': 'Sănătate digestivă',
  'Dog Allergies & Skin Issues': 'Alergii și probleme de piele la câini',
  'Dog Anxiety': 'Anxietate la câini',
  'Dog Appetite Issues': 'Probleme de apetit la câini',
  'Dog Arthritis': 'Artrită la câini',
  'Dog Hip Dysplasia': 'Displazie de șold la câini',
  'Dog Nausea & Motion Sickness': 'Greață și rău de mișcare la câini',
  'Dog Pain Management': 'Gestionarea durerii la câini',
  'Dog Seizures & Epilepsy': 'Convulsii și epilepsie la câini',
  'Dog Separation Anxiety': 'Anxietate de separare la câini',
  'Dog Storm & Noise Anxiety': 'Anxietate de furtună și zgomot la câini',
  'CBD & Dopamine': 'CBD și dopamină',
  'CBD & Driving': 'CBD și condus',
  'CBD & Drug Testing': 'CBD și testarea pentru droguri',
  'Dry Mouth': 'Gură uscată',
  'Dry Skin': 'Piele uscată',
  'Eczema & Dermatitis': 'Eczemă și dermatită',
  'Elbow Pain & Tennis Elbow': 'Durere de cot și cot de tenismen',
  'Endometriosis': 'Endometrioză',
  'Energy & Vitality': 'Energie și vitalitate',
  'CBD for Entrepreneurs': 'CBD pentru antreprenori',
  'Epilepsy & Seizure Disorders': 'Epilepsie și tulburări convulsive',
  'Test & Exam Anxiety': 'Anxietate de test și examen',
  'Eye Health': 'Sănătatea ochilor',
  'Family Event Anxiety': 'Anxietate la evenimente de familie',
  'Bird Feather Plucking': 'Smulgerea penelor la păsări',
  'Ferret Care & CBD': 'Îngrijirea dihorilor și CBD',
  'Fibromyalgia Syndrome': 'Sindrom de fibromialgie',
  'CBD for Financial Professionals': 'CBD pentru profesioniști financiari',
  'CBD for First Responders': 'CBD pentru echipe de urgență',
  'Focus & Concentration': 'Concentrare și focalizare',
  'Food Intolerances': 'Intoleranțe alimentare',
  'Foot Pain': 'Durere de picior',
  'Frozen Shoulder': 'Umăr înghețat',
  'CBD & GABA': 'CBD și GABA',
  'CBD for Gamers': 'CBD pentru gameri',
  'Gastroparesis': 'Gastropareză',
  'Generalized Anxiety Disorder (GAD)': 'Tulburare de anxietate generalizată (TAG)',
  'Glaucoma & Eye Pressure': 'Glaucom și presiune oculară',
  'CBD for Golfers': 'CBD pentru golferi',
  'Grief & Bereavement': 'Doliu și pierdere',
  'Guinea Pig Care & CBD': 'Îngrijirea porcușorilor de Guineea și CBD',
  'Gum Disease & Gingivitis': 'Boală gingivală și gingivită',
  'Gut Microbiome Health': 'Sănătatea microbiomului intestinal',
  'Hair Loss & Thinning': 'Căderea și subțierea părului',
  'CBD for Hairdressers & Stylists': 'CBD pentru coafori și stiliști',
  'Hamster Care & CBD': 'Îngrijirea hamsterilor și CBD',
  'Hand Pain & Grip Issues': 'Durere de mână și probleme de prindere',
  'Hangover Recovery': 'Recuperare după mahmureală',
  'Headaches': 'Dureri de cap',
  'Medical & Healthcare Anxiety': 'Anxietate medicală și de sănătate',
  'CBD for Healthcare Workers': 'CBD pentru personal medical',
  'Hearing Loss & Auditory Health': 'Pierderea auzului și sănătate auditivă',
  'Cardiovascular Health': 'Sănătate cardiovasculară',
  'CBD for HSPs': 'CBD pentru persoane foarte sensibile',
  'CBD for Hikers': 'CBD pentru drumeți',
  'Hip Pain & Hip Dysplasia': 'Durere de șold și displazie de șold',
  'Hives & Urticaria': 'Urticarie și erupții',
  'Holiday & Seasonal Stress': 'Stres de sărbători și sezonier',
  'CBD & Homeostasis': 'CBD și homeostazie',
  'Horse Anxiety': 'Anxietate la cai',
  "Horse Cushing's Disease (PPID)": 'Boala Cushing la cai (PPID)',
  'Horse Laminitis': 'Laminită la cai',
  'Horse Navicular Syndrome': 'Sindrom navicular la cai',
  'Horse Performance & Recovery': 'Performanță și recuperare la cai',
  'Horse Gastric Ulcers': 'Ulcere gastrice la cai',
  'Hot Flashes': 'Bufeuri',
  'CBD & Hot Tub Recovery': 'CBD și recuperare în jacuzzi',
  'Irritable Bowel Syndrome': 'Sindromul intestinului iritabil',
  'Immune System Support': 'Suport pentru sistemul imunitar',
  'Inflammation & Inflammatory Conditions': 'Inflamație și afecțiuni inflamatorii',
  'Insulin Resistance': 'Rezistență la insulină',
  'CBD & Intermittent Fasting': 'CBD și post intermitent',
  'Job Interview Anxiety': 'Anxietate la interviu de angajare',
  'CBD for Introverts': 'CBD pentru introvertiți',
  'Jaw Pain': 'Durere de maxilar',
  'Joint Health & Mobility': 'Sănătatea articulațiilor și mobilitate',
  'CBD & Keto Diet': 'CBD și dieta keto',
  'Knee Pain': 'Durere de genunchi',
  'CBD for Lawyers': 'CBD pentru avocați',
  'Intestinal Permeability': 'Permeabilitate intestinală',
  'Liver Health': 'Sănătatea ficatului',
  'Long COVID Syndrome': 'Sindrom COVID lung',
  'Lupus': 'Lupus',
  'CBD for Martial Arts': 'CBD pentru arte marțiale',
  'CBD & Meditation': 'CBD și meditație',
  "Men's Health & CBD": 'Sănătatea bărbaților și CBD',
  'Menopause': 'Menopauză',
  'Menstrual Cramps & Period Pain': 'Crampe menstruale și durere de ciclu',
  'Period Pain': 'Durere menstruală',
  'Metabolic Syndrome': 'Sindrom metabolic',
  'Migraines & Headaches': 'Migrene și dureri de cap',
  'CBD for MMA & Combat Sports': 'CBD pentru MMA și sporturi de luptă',
  'Mood Regulation': 'Reglarea dispoziției',
  'Mouth Ulcers & Canker Sores': 'Ulcere bucale și afte',
  'CBD for Moving House Stress': 'CBD pentru stresul mutării',
  'Multiple Sclerosis (MS)': 'Scleroză multiplă (SM)',
  'Muscle Recovery': 'Recuperare musculară',
  'Muscle Tension & Spasms': 'Tensiune musculară și spasme',
  'CBD for Musicians': 'CBD pentru muzicieni',
  'Nail Health': 'Sănătatea unghiilor',
  'Nausea & Vomiting': 'Greață și vărsături',
  'Neck Pain & Stiffness': 'Durere de gât și rigiditate',
  'Nerve Pain & Neuralgia': 'Durere de nervi și nevralgie',
  'CBD & Nervous System': 'CBD și sistemul nervos',
  'Other Neurological Conditions': 'Alte afecțiuni neurologice',
  'Neuropathic Pain & Nerve Damage': 'Durere neuropatică și leziuni nervoase',
  'CBD for New Mothers': 'CBD pentru mame noi',
  'CBD for Night Owls': 'CBD pentru noctambuli',
  'Obesity & Weight Management': 'Obezitate și controlul greutății',
  'Occipital Neuralgia': 'Nevralgie occipitală',
  'Obsessive-Compulsive Disorder (OCD)': 'Tulburare obsesiv-compulsivă (TOC)',
  'Oily Skin': 'Piele grasă',
  'Opioid Tapering & Withdrawal': 'Reducerea opioidelor și sevraj',
  'CBD for Over 60': 'CBD pentru peste 60 de ani',
  'Repetitive Strain Injuries': 'Leziuni de suprasolicitare repetitivă',
  'Pain Management': 'Gestionarea durerii',
  'Panic Attacks & Panic Disorder': 'Atacuri de panică și tulburare de panică',
  'CBD for Parents': 'CBD pentru părinți',
  "Parkinson's Disease": 'Boala Parkinson',
  'Parrot Care & CBD': 'Îngrijirea papagalilor și CBD',
  'Pelvic Pain': 'Durere pelvină',
  'CBD for Perfectionists': 'CBD pentru perfecționiști',
  'Performance Anxiety': 'Anxietate de performanță',
  'Peripheral Neuropathy': 'Neuropatie periferică',
  'Pet Fireworks & Noise Fear': 'Frica de artificii și zgomot la animale',
  'Pet Travel & Motion Sickness': 'Călătorie și rău de mișcare la animale',
  'CBD for Pets & Animals': 'CBD pentru animale de companie',
  'Phantom Limb Pain': 'Durere de membru fantomă',
  'Phone & Communication Anxiety': 'Anxietate telefonică și de comunicare',
  'CBD for Photographers': 'CBD pentru fotografi',
  'CBD & Physical Therapy': 'CBD și fizioterapie',
  'Plantar Fasciitis': 'Fasciită plantară',
  'Premenstrual Syndrome (PMS)': 'Sindrom premenstrual (SPM)',
  'CBD for Podcasters': 'CBD pentru podcasters',
  'Poison Ivy & Plant Rashes': 'Iederă otrăvitoare și erupții de plante',
  'Post-Operative Pain': 'Durere post-operatorie',
  'Pregnancy & CBD Safety': 'Sarcină și siguranța CBD',
  'CBD & Prescription Drugs': 'CBD și medicamente prescrise',
  'CBD for Programmers': 'CBD pentru programatori',
  'Psoriasis & Autoimmune Skin Conditions': 'Psoriazis și afecțiuni autoimune ale pielii',
  'Post-Traumatic Stress Disorder': 'Tulburare de stres post-traumatic',
  'CBD for Public Speakers': 'CBD pentru vorbitori publici',
  'Public Speaking & Stage Fright': 'Vorbit în public și trac',
  'Puppy Care & CBD': 'Îngrijirea cățeilor și CBD',
  'Rabbit Care & CBD': 'Îngrijirea iepurilor și CBD',
  'Radiation Therapy Side Effects': 'Efecte secundare ale radioterapiei',
  "Raynaud's Phenomenon": 'Fenomenul Raynaud',
  'CBD for Real Estate Agents': 'CBD pentru agenți imobiliari',
  'CBD for Remote Workers': 'CBD pentru angajați la distanță',
  'Reptile Care & CBD': 'Îngrijirea reptilelor și CBD',
  'Restless Leg Syndrome': 'Sindromul picioarelor neliniștite',
  'CBD for Retail Workers': 'CBD pentru angajați în retail',
  'Rib Pain & Costochondritis': 'Durere de coaste și costocondrita',
  'CBD for Rock Climbing': 'CBD pentru escaladă',
  'Rosacea': 'Rozacee',
  'CBD for Runners': 'CBD pentru alergători',
  'CBD for Sales Professionals': 'CBD pentru profesioniști în vânzări',
  'CBD & Sauna': 'CBD și saună',
  'Scalp Conditions': 'Afecțiuni ale scalpului',
  'Scar Tissue & Adhesion Pain': 'Durere de țesut cicatricial și aderențe',
  'Schizophrenia & Psychosis': 'Schizofrenie și psihoză',
  'Sciatica': 'Sciatică',
  'Seasonal Allergies & Hay Fever': 'Alergii sezoniere și rinită alergică',
  'Seasonal Affective Disorder (SAD)': 'Tulburare afectivă sezonieră (TAS)',
  'Senior Cat Care': 'Îngrijirea pisicilor în vârstă',
  'Senior Dog Care': 'Îngrijirea câinilor în vârstă',
  'Senior Pet Care': 'Îngrijirea animalelor în vârstă',
  'CBD for Seniors (50+)': 'CBD pentru seniori (50+)',
  'Sensitive Skin': 'Piele sensibilă',
  'CBD & Serotonin': 'CBD și serotonină',
  'CBD for Shift Workers': 'CBD pentru angajați în schimburi',
  'Shingles & Postherpetic Neuralgia': 'Zona zoster și nevralgie postherpetică',
  'Shoulder Pain': 'Durere de umăr',
  'Sinus Issues': 'Probleme de sinusuri',
  'CBD for Skeptics': 'CBD pentru sceptici',
  'CBD for Skiing & Snowboarding': 'CBD pentru schi și snowboard',
  'Skin Health & Dermatology': 'Sănătatea pielii și dermatologie',
  'Sleep Disorders & Insomnia': 'Tulburări de somn și insomnie',
  'Sleep Apnea': 'Apnee în somn',
  'Small Pet Care': 'Îngrijirea animalelor mici',
  'Smoking Cessation': 'Renunțarea la fumat',
  'Snoring': 'Sforăit',
  'Social Anxiety Disorder': 'Tulburare de anxietate socială',
  'Social Event Anxiety': 'Anxietate la evenimente sociale',
  'Sports Injuries': 'Accidentări sportive',
  'CBD for Content Creators': 'CBD pentru creatori de conținut',
  'Chronic Stress': 'Stres cronic',
  'CBD for Students': 'CBD pentru studenți',
  'Sunburn': 'Arsură solară',
  'CBD for Surfers': 'CBD pentru surferi',
  'Surgery Recovery': 'Recuperare chirurgicală',
  'CBD for Swimmers': 'CBD pentru înotători',
  'CBD for Teachers': 'CBD pentru profesori',
  'CBD for Teenagers': 'CBD pentru adolescenți',
  'Tendonitis': 'Tendinită',
  'CBD for Tennis': 'CBD pentru tenis',
  'Tension Headaches': 'Cefalee de tensiune',
  'CBD for THC-Sensitive People': 'CBD pentru persoane sensibile la THC',
  'CBD for Therapists': 'CBD pentru terapeuți',
  'Thyroid Health': 'Sănătatea tiroidei',
  'Tinnitus': 'Tinitus',
  'TMJ Disorder': 'Tulburare ATM',
  'Tooth & Dental Pain': 'Durere de dinți și dentară',
  'Tourette Syndrome': 'Sindrom Tourette',
  'Travel & Flying Anxiety': 'Anxietate de călătorie și zbor',
  'CBD for Travelers': 'CBD pentru călători',
  'Trigeminal Neuralgia': 'Nevralgie de trigemen',
  'CBD for Truckers': 'CBD pentru șoferi de camion',
  'CBD for Type A Personalities': 'CBD pentru personalități de tip A',
  'Ulcerative Colitis': 'Colită ulcerativă',
  'Varicose Veins': 'Varice',
  'CBD for Vegans': 'CBD pentru vegani',
  'Vertigo & Dizziness': 'Vertij și amețeală',
  'CBD for Veterans': 'CBD pentru veterani',
  'Wedding Day Nerves': 'Nervozitate de nuntă',
  'CBD & Weight Management': 'CBD și controlul greutății',
  'CBD for Weightlifters': 'CBD pentru halterofili',
  "Women's Health & Hormones": 'Sănătatea femeilor și hormoni',
  'Post-Workout Recovery': 'Recuperare post-antrenament',
  'Wound Healing': 'Vindecarea rănilor',
  'Wrist Pain': 'Durere de încheietură',
  'CBD for Writers': 'CBD pentru scriitori',
  'CBD & Yoga': 'CBD și yoga'
};

// Function to create Romanian slug from Romanian name
function createRomanianSlug(romanianName) {
  return romanianName
    .toLowerCase()
    // Replace Romanian characters with their non-accented equivalents
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/Ă/g, 'a')
    .replace(/Â/g, 'a')
    .replace(/Î/g, 'i')
    .replace(/Ș/g, 's')
    .replace(/Ț/g, 't')
    // Remove any remaining special characters and replace spaces with hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Function to translate a condition
function translateCondition(condition) {
  const romanianName = romanianTranslations[condition.name] || condition.name;
  const romanianDisplayName = romanianDisplayNames[condition.display_name] || romanianName;
  const romanianSlug = createRomanianSlug(romanianName);
  
  // Create short description in Romanian
  let shortDescription;
  if (condition.short_description.includes('Learn about CBD research and ')) {
    const topic = romanianName.toLowerCase();
    shortDescription = `Descoperă cercetările despre CBD și ${topic}`;
  } else if (condition.short_description.includes('Research on CBD for ')) {
    shortDescription = `Cercetări despre CBD pentru ${romanianName.toLowerCase()}`;
  } else {
    shortDescription = `Descoperă cercetările despre CBD și ${romanianName.toLowerCase()}`;
  }

  // Create meta title in Romanian
  const metaTitle = `CBD și ${romanianName} — Cercetare și studii | CBDportal.ro`;

  // Create meta description in Romanian
  const metaDescription = `Studii despre CBD și ${romanianName.toLowerCase()}. Cercetări științifice despre canabidiol pentru ${romanianName.toLowerCase()}.`;

  return {
    condition_id: condition.id,
    language: 'ro',
    name: romanianName,
    slug: romanianSlug,
    display_name: romanianDisplayName,
    short_description: shortDescription,
    meta_title: metaTitle,
    meta_description: metaDescription
  };
}

async function insertTranslations() {
  console.log('Starting conditions translation process...');
  
  const translations = [];
  
  // Process each condition
  for (const condition of conditions) {
    const translation = translateCondition(condition);
    translations.push(translation);
  }

  console.log(`Created ${translations.length} translations. Inserting into database...`);

  // Insert in batches of 50 to avoid database limits
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < translations.length; i += batchSize) {
    const batch = translations.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('condition_translations')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      throw error;
    }

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${translations.length} translations`);
  }

  console.log('✅ All condition translations inserted successfully!');
  return translations.length;
}

async function verifyCount() {
  console.log('Verifying translation count...');
  
  const { count, error } = await supabase
    .from('condition_translations')
    .select('id', { count: 'exact', head: true })
    .eq('language', 'ro');

  if (error) {
    console.error('Error verifying count:', error);
    return;
  }

  console.log(`✅ Database contains ${count} Romanian condition translations`);
  return count;
}

// Main execution
async function main() {
  try {
    const insertedCount = await insertTranslations();
    const verifiedCount = await verifyCount();
    
    if (insertedCount === verifiedCount && verifiedCount === 312) {
      console.log('🎉 Condition translation task completed successfully!');
      console.log(`- Translated: ${insertedCount} conditions`);
      console.log(`- Verified: ${verifiedCount} conditions in database`);
      console.log('- Language: Romanian (ro)');
      console.log('- All conditions inserted with proper translations');
    } else {
      console.warn(`⚠️  Count mismatch: inserted ${insertedCount}, verified ${verifiedCount}`);
    }
  } catch (error) {
    console.error('❌ Translation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
