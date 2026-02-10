#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Load English conditions
const conditionsPath = path.join(__dirname, 'data', 'conditions_en.json');
const conditions = JSON.parse(fs.readFileSync(conditionsPath, 'utf8'));

console.log(`Loaded ${conditions.length} conditions to translate`);

// European Portuguese translation mappings for conditions
const portugueseTranslations = {
  'Acid Reflux': 'Refluxo Ácido',
  'Acne': 'Acne',
  'Actors': 'Atores',
  'Acupuncture': 'Acupuntura',
  'Addiction': 'Dependência',
  'Adenosine': 'Adenosina',
  'ADHD': 'PHDA',
  'Aggressive Dogs': 'Cães Agressivos',
  'Aging': 'Envelhecimento',
  'Aging Skin': 'Envelhecimento da Pele',
  'Alcohol': 'Álcool',
  'Alcohol Withdrawal': 'Abstinência Alcoólica',
  'Allergies': 'Alergias',
  "Alzheimer's": 'Alzheimer',
  'Ankle Pain': 'Dor no Tornozelo',
  'Antibiotics': 'Antibióticos',
  'Antidepressants': 'Antidepressivos',
  'Anxiety': 'Ansiedade',
  'Appetite': 'Apetite',
  'Architects': 'Arquitetos',
  'Arthritis': 'Artrite',
  'Artists': 'Artistas',
  'Asthma': 'Asma',
  'Athletic Recovery': 'Recuperação Desportiva',
  'Autism': 'Autismo',
  'Autoimmune Conditions': 'Condições Autoimunes',
  'Back Pain': 'Dor nas Costas',
  'Beginners': 'Iniciantes',
  'Better Rest': 'Melhor Descanso',
  'Bipolar Disorder': 'Perturbação Bipolar',
  'Bird Anxiety': 'Ansiedade em Aves',
  'Birds': 'Aves',
  'Bloating': 'Inchaço',
  'Blood Pressure': 'Pressão Arterial',
  'Blood Pressure Medications': 'Medicamentos para Pressão Arterial',
  'Blood Thinners': 'Anticoagulantes',
  'Breastfeeding': 'Amamentação',
  'Bronchitis': 'Bronquite',
  'Bruising': 'Hematomas',
  'Bruxism': 'Bruxismo',
  'Bug Bites': 'Picadas de Insetos',
  'Burnout': 'Esgotamento',
  'Bursitis': 'Bursite',
  'Cancer': 'Cancro',
  'Caregivers': 'Cuidadores',
  'Carpal Tunnel': 'Síndrome do Túnel Cárpico',
  'Cat Aggression': 'Agressão em Gatos',
  'Cat Anxiety': 'Ansiedade em Gatos',
  'Cat Appetite': 'Apetite de Gatos',
  'Cat Arthritis': 'Artrite em Gatos',
  'Cat Cancer': 'Cancro em Gatos',
  'Cat Hyperthyroidism': 'Hipertiroidismo Felino',
  'Cat Kidney Disease': 'Doença Renal Felina',
  'Cat Pain': 'Dor em Gatos',
  'Cat Seizures': 'Convulsões em Gatos',
  'Cat Stomatitis': 'Estomatite Felina',
  'Chefs': 'Chefes de Cozinha',
  'Chemotherapy Side Effects': 'Efeitos Secundários da Quimioterapia',
  'Chest Pain': 'Dor no Peito',
  'Children': 'Crianças',
  'Chiropractic': 'Quiroprática',
  'Cholesterol': 'Colesterol',
  'Chronic Fatigue': 'Fadiga Crónica',
  'Chronic Pain': 'Dor Crónica',
  'Circulation': 'Circulação',
  'Cluster Headaches': 'Cefaleias em Salvas',
  'Coffee': 'Café',
  'Cold Hands & Feet': 'Mãos e Pés Frios',
  'Cold Plunge': 'Imersão Fria',
  'Colds & Flu': 'Constipações e Gripe',
  'Constipation': 'Obstipação',
  'Construction Workers': 'Trabalhadores da Construção',
  'COPD': 'DPOC',
  'COVID-19': 'COVID-19',
  'Creativity': 'Criatividade',
  "Crohn's Disease": 'Doença de Crohn',
  'CrossFit': 'CrossFit',
  'Cyclists': 'Ciclistas',
  'Dandruff': 'Caspa',
  'Dating Anxiety': 'Ansiedade em Encontros',
  'Dental Anxiety': 'Ansiedade Dentária',
  'Depression': 'Depressão',
  'Desk Workers': 'Trabalhadores de Escritório',
  'Diabetes': 'Diabetes',
  'Diabetes Medications': 'Medicamentos para Diabetes',
  'Diabetic Neuropathy': 'Neuropatia Diabética',
  'Diarrhea': 'Diarreia',
  'Digestive Health': 'Saúde Digestiva',
  'Dog Allergies': 'Alergias em Cães',
  'Dog Anxiety': 'Ansiedade em Cães',
  'Dog Appetite': 'Apetite de Cães',
  'Dog Arthritis': 'Artrite em Cães',
  'Dog Hip Dysplasia': 'Displasia da Anca em Cães',
  'Dog Nausea': 'Náuseas em Cães',
  'Dog Pain': 'Dor em Cães',
  'Dog Seizures': 'Convulsões em Cães',
  'Dog Separation Anxiety': 'Ansiedade de Separação em Cães',
  'Dog Thunderstorm Anxiety': 'Ansiedade por Trovoadas em Cães',
  'Dopamine': 'Dopamina',
  'Driving': 'Condução',
  'Drug Testing': 'Testes de Drogas',
  'Dry Mouth': 'Boca Seca',
  'Dry Skin': 'Pele Seca',
  'Eczema': 'Eczema',
  'Elbow Pain': 'Dor no Cotovelo',
  'Endometriosis': 'Endometriose',
  'Energy': 'Energia',
  'Entrepreneurs': 'Empresários',
  'Epilepsy': 'Epilepsia',
  'Exam Anxiety': 'Ansiedade em Exames',
  'Eye Health': 'Saúde Ocular',
  'Family Gatherings': 'Reuniões Familiares',
  'Feather Plucking': 'Arrancamento de Penas',
  'Ferrets': 'Furões',
  'Fibromyalgia': 'Fibromialgia',
  'Financial Advisors': 'Consultores Financeiros',
  'First Responders': 'Socorristas',
  'Focus': 'Concentração',
  'Food Intolerances': 'Intolerâncias Alimentares',
  'Foot Pain': 'Dor no Pé',
  'Frozen Shoulder': 'Ombro Congelado',
  'GABA': 'GABA',
  'Gamers': 'Jogadores',
  'Gastroparesis': 'Gastroparesia',
  'Generalized Anxiety Disorder': 'Perturbação de Ansiedade Generalizada',
  'Glaucoma': 'Glaucoma',
  'Golf': 'Golfe',
  'Grief': 'Luto',
  'Guinea Pigs': 'Porquinhos-da-índia',
  'Gum Disease': 'Doença das Gengivas',
  'Gut Health': 'Saúde Intestinal',
  'Hair Loss': 'Queda de Cabelo',
  'Hairdressers': 'Cabeleireiros',
  'Hamsters': 'Hamsters',
  'Hand Pain': 'Dor na Mão',
  'Hangover': 'Ressaca',
  'Headaches': 'Dores de Cabeça',
  'Healthcare Anxiety': 'Ansiedade em Saúde',
  'Healthcare Workers': 'Profissionais de Saúde',
  'Hearing Loss': 'Perda Auditiva',
  'Heart Health': 'Saúde Cardíaca',
  'Highly Sensitive People': 'Pessoas Altamente Sensíveis',
  'Hiking': 'Caminhadas',
  'Hip Pain': 'Dor na Anca',
  'Hives': 'Urticária',
  'Holiday Stress': 'Stress das Festas',
  'Homeostasis': 'Homeostasia',
  'Horse Anxiety': 'Ansiedade em Cavalos',
  'Horse Cushings': 'Síndrome de Cushing Equino',
  'Horse Laminitis': 'Laminite Equina',
  'Horse Navicular': 'Síndrome Navicular Equino',
  'Horse Performance': 'Desempenho Equino',
  'Horse Ulcers': 'Úlceras Gástricas Equinas',
  'Hot Flashes': 'Afrontamentos',
  'Hot Tub': 'Jacuzzi',
  'IBS': 'SII',
  'Immune Health': 'Saúde Imunitária',
  'Inflammation': 'Inflamação',
  'Insulin Resistance': 'Resistência à Insulina',
  'Intermittent Fasting': 'Jejum Intermitente',
  'Interview Anxiety': 'Ansiedade em Entrevistas',
  'Introverts': 'Introvertidos',
  'Jaw Pain': 'Dor na Mandíbula',
  'Joint Health': 'Saúde Articular',
  'Keto Diet': 'Dieta Cetogénica',
  'Knee Pain': 'Dor no Joelho',
  'Lawyers': 'Advogados',
  'Leaky Gut': 'Permeabilidade Intestinal',
  'Liver Health': 'Saúde Hepática',
  'Long COVID': 'COVID Longa',
  'Lupus': 'Lúpus',
  'Martial Arts': 'Artes Marciais',
  'Meditation': 'Meditação',
  'Men': 'Homens',
  'Menopause': 'Menopausa',
  'Menstrual Cramps': 'Cólicas Menstruais',
  'Menstrual Pain': 'Dor Menstrual',
  'Metabolic Syndrome': 'Síndrome Metabólica',
  'Migraines': 'Enxaquecas',
  'MMA': 'MMA',
  'Mood': 'Humor',
  'Mouth Ulcers': 'Úlceras Bucais',
  'Moving Stress': 'Stress de Mudança',
  'Multiple Sclerosis': 'Esclerose Múltipla',
  'Muscle Recovery': 'Recuperação Muscular',
  'Muscle Tension': 'Tensão Muscular',
  'Musicians': 'Músicos',
  'Nail Health': 'Saúde das Unhas',
  'Nausea': 'Náuseas',
  'Neck Pain': 'Dor no Pescoço',
  'Nerve Pain': 'Dor Nervosa',
  'Nervous System': 'Sistema Nervoso',
  'Neurological': 'Neurológico',
  'Neuropathic Pain': 'Dor Neuropática',
  'New Mothers': 'Mães Recentes',
  'Night Owls': 'Notívagos',
  'Obesity': 'Obesidade',
  'Occipital Neuralgia': 'Nevralgia Occipital',
  'OCD': 'POC',
  'Oily Skin': 'Pele Oleosa',
  'Opioid Tapering': 'Redução de Opioides',
  'Over 60': 'Maiores de 60',
  'Overuse Injuries': 'Lesões por Esforço Repetitivo',
  'Pain': 'Dor',
  'Panic Attacks': 'Ataques de Pânico',
  'Parents': 'Pais',
  "Parkinson's": 'Parkinson',
  'Parrots': 'Papagaios',
  'Pelvic Pain': 'Dor Pélvica',
  'Perfectionists': 'Perfeccionistas',
  'Performance Anxiety': 'Ansiedade de Desempenho',
  'Peripheral Neuropathy': 'Neuropatia Periférica',
  'Pet Fireworks Anxiety': 'Ansiedade por Fogo de Artifício em Animais',
  'Pet Travel Anxiety': 'Ansiedade de Viagem em Animais',
  'Pets': 'Animais de Estimação',
  'Phantom Pain': 'Dor Fantasma',
  'Phone Anxiety': 'Ansiedade Telefónica',
  'Photographers': 'Fotógrafos',
  'Physical Therapy': 'Fisioterapia',
  'Plantar Fasciitis': 'Fasceíte Plantar',
  'PMS': 'SPM',
  'Podcasters': 'Podcasters',
  'Poison Ivy': 'Hera Venenosa',
  'Post-Surgical Pain': 'Dor Pós-Operatória',
  'Pregnancy': 'Gravidez',
  'Prescription Medications': 'Medicamentos de Prescrição',
  'Programmers': 'Programadores',
  'Psoriasis': 'Psoríase',
  'PTSD': 'PTSD',
  'Public Speakers': 'Oradores',
  'Public Speaking Anxiety': 'Ansiedade de Falar em Público',
  'Puppies': 'Cachorros',
  'Rabbits': 'Coelhos',
  'Radiation Therapy': 'Radioterapia',
  'Raynauds': 'Fenómeno de Raynaud',
  'Real Estate Agents': 'Agentes Imobiliários',
  'Remote Workers': 'Trabalhadores Remotos',
  'Reptiles': 'Répteis',
  'Restless Leg Syndrome': 'Síndrome das Pernas Inquietas',
  'Retail Workers': 'Trabalhadores do Retalho',
  'Rib Pain': 'Dor nas Costelas',
  'Rock Climbing': 'Escalada',
  'Rosacea': 'Rosácea',
  'Runners': 'Corredores',
  'Sales Professionals': 'Profissionais de Vendas',
  'Sauna': 'Sauna',
  'Scalp Health': 'Saúde do Couro Cabeludo',
  'Scar Tissue Pain': 'Dor de Tecido Cicatricial',
  'Schizophrenia': 'Esquizofrenia',
  'Sciatica': 'Ciática',
  'Seasonal Allergies': 'Alergias Sazonais',
  'Seasonal Depression': 'Depressão Sazonal',
  'Senior Cats': 'Gatos Idosos',
  'Senior Dogs': 'Cães Idosos',
  'Senior Pets': 'Animais Idosos',
  'Seniors': 'Idosos',
  'Sensitive Skin': 'Pele Sensível',
  'Serotonin': 'Serotonina',
  'Shift Workers': 'Trabalhadores por Turnos',
  'Shingles': 'Herpes Zóster',
  'Shoulder Pain': 'Dor no Ombro',
  'Sinusitis': 'Sinusite',
  'Skeptics': 'Céticos',
  'Skiing': 'Esqui',
  'Skin Health': 'Saúde da Pele',
  'Sleep': 'Sono',
  'Sleep Apnea': 'Apneia do Sono',
  'Small Pets': 'Animais Pequenos',
  'Smoking Cessation': 'Cessação Tabágica',
  'Snoring': 'Ressonar',
  'Social Anxiety': 'Ansiedade Social',
  'Social Events': 'Eventos Sociais',
  'Sports Injuries': 'Lesões Desportivas',
  'Streamers': 'Criadores de Conteúdo',
  'Stress': 'Stress',
  'Students': 'Estudantes',
  'Sunburn': 'Queimaduras Solares',
  'Surfing': 'Surf',
  'Surgery Recovery': 'Recuperação Cirúrgica',
  'Swimmers': 'Nadadores',
  'Teachers': 'Professores',
  'Teenagers': 'Adolescentes',
  'Tendonitis': 'Tendinite',
  'Tennis': 'Ténis',
  'Tension Headaches': 'Cefaleias de Tensão',
  'THC Sensitive': 'Sensibilidade ao THC',
  'Therapists': 'Terapeutas',
  'Thyroid': 'Tiroide',
  'Tinnitus': 'Zumbido',
  'TMJ': 'ATM',
  'Tooth Pain': 'Dor de Dentes',
  "Tourette's": 'Síndrome de Tourette',
  'Travel Anxiety': 'Ansiedade de Viagem',
  'Travelers': 'Viajantes',
  'Trigeminal Neuralgia': 'Nevralgia do Trigémeo',
  'Truck Drivers': 'Camionistas',
  'Type A Personalities': 'Personalidades Tipo A',
  'Ulcerative Colitis': 'Colite Ulcerosa',
  'Varicose Veins': 'Varizes',
  'Vegans': 'Veganos',
  'Vertigo': 'Vertigem',
  'Veterans': 'Veteranos',
  'Wedding Anxiety': 'Ansiedade de Casamento',
  'Weight Management': 'Gestão de Peso',
  'Weightlifters': 'Halterofilistas',
  "Women's Health": 'Saúde da Mulher',
  'Workout Recovery': 'Recuperação Pós-Treino',
  'Wound Healing': 'Cicatrização de Feridas',
  'Wrist Pain': 'Dor no Pulso',
  'Writers': 'Escritores',
  'Yoga': 'Yoga'
};

// Portuguese display name mappings
const portugueseDisplayNames = {
  'Acid Reflux & GERD': 'Refluxo Ácido e DRGE',
  'Acne & Skin Health': 'Acne e Saúde da Pele',
  'CBD for Actors': 'CBD para Atores',
  'CBD & Acupuncture': 'CBD e Acupuntura',
  'Addiction & Substance Use Disorders': 'Dependência e Perturbações por Uso de Substâncias',
  'CBD & Adenosine System': 'CBD e Sistema de Adenosina',
  'Attention-Deficit/Hyperactivity Disorder': 'Perturbação de Hiperatividade e Défice de Atenção',
  'Dog Aggression & Behavior': 'Agressão e Comportamento Canino',
  'Aging & Longevity': 'Envelhecimento e Longevidade',
  'Anti-Aging Skincare': 'Cuidados Antienvelhecimento',
  'CBD & Alcohol': 'CBD e Álcool',
  'Alcohol Withdrawal': 'Abstinência Alcoólica',
  'Allergies': 'Alergias',
  "Alzheimer's Disease & Dementia": 'Doença de Alzheimer e Demência',
  'Ankle Pain & Sprains': 'Dor no Tornozelo e Entorses',
  'CBD & Antibiotics': 'CBD e Antibióticos',
  'CBD & Antidepressants': 'CBD e Antidepressivos',
  'Anxiety Disorders': 'Perturbações de Ansiedade',
  'Appetite Regulation': 'Regulação do Apetite',
  'CBD for Architects': 'CBD para Arquitetos',
  'Arthritis & Joint Pain': 'Artrite e Dor Articular',
  'CBD for Artists': 'CBD para Artistas',
  'Asthma': 'Asma',
  'Athletic Recovery': 'Recuperação Desportiva',
  'Sports & Athletic Performance': 'Desporto e Desempenho Atlético',
  'Autism Spectrum Disorder': 'Perturbação do Espectro do Autismo',
  'Autoimmune Conditions': 'Condições Autoimunes',
  'Back Pain': 'Dor nas Costas',
  'CBD for First-Timers': 'CBD para Iniciantes',
  'Rest & Relaxation': 'Descanso e Relaxamento',
  'Bipolar Disorder': 'Perturbação Bipolar',
  'Bird Anxiety & Stress': 'Ansiedade e Stress em Aves',
  'Bird Care & CBD': 'Cuidados com Aves e CBD',
  'Bloating & Gas': 'Inchaço e Gases',
  'Blood Pressure & Hypertension': 'Pressão Arterial e Hipertensão',
  'CBD & Blood Pressure Meds': 'CBD e Medicamentos para Pressão Arterial',
  'CBD & Blood Thinners': 'CBD e Anticoagulantes',
  'Breastfeeding & CBD Safety': 'Amamentação e Segurança do CBD',
  'Bronchitis': 'Bronquite',
  'Bruising': 'Hematomas',
  'Bruxism (Teeth Grinding)': 'Bruxismo (Ranger de Dentes)',
  'Bug Bites & Stings': 'Picadas de Insetos',
  'Burnout & Chronic Stress': 'Esgotamento e Stress Crónico',
  'Bursitis': 'Bursite',
  'Cancer & Oncology': 'Cancro e Oncologia',
  'CBD for Caregivers': 'CBD para Cuidadores',
  'Carpal Tunnel Syndrome': 'Síndrome do Túnel Cárpico',
  'Cat Aggression & Behavior': 'Agressão e Comportamento Felino',
  'Cat Anxiety': 'Ansiedade Felina',
  'Cat Appetite Issues': 'Problemas de Apetite Felino',
  'Cat Arthritis': 'Artrite Felina',
  'Cats with Cancer': 'Gatos com Cancro',
  'Cats with Hyperthyroidism': 'Gatos com Hipertiroidismo',
  'Cats with Kidney Disease': 'Gatos com Doença Renal',
  'Cat Pain Management': 'Gestão da Dor Felina',
  'Cat Seizures': 'Convulsões Felinas',
  'Feline Stomatitis': 'Estomatite Felina',
  'CBD for Culinary Professionals': 'CBD para Profissionais de Culinária',
  'Chemotherapy Side Effects': 'Efeitos Secundários da Quimioterapia',
  'Non-Cardiac Chest Pain': 'Dor Torácica Não Cardíaca',
  'CBD for Children': 'CBD para Crianças',
  'CBD & Chiropractic Care': 'CBD e Quiroprática',
  'Cholesterol Management': 'Gestão do Colesterol',
  'Chronic Fatigue Syndrome': 'Síndrome de Fadiga Crónica',
  'Chronic Pain Management': 'Gestão da Dor Crónica',
  'Blood Circulation': 'Circulação Sanguínea',
  'Cluster Headaches': 'Cefaleias em Salvas',
  'CBD & Coffee': 'CBD e Café',
  'Poor Extremity Circulation': 'Má Circulação nas Extremidades',
  'CBD & Cold Therapy': 'CBD e Terapia de Frio',
  'Cold & Flu Symptoms': 'Sintomas de Constipação e Gripe',
  'Constipation': 'Obstipação',
  'CBD for Construction Workers': 'CBD para Trabalhadores da Construção',
  'COPD': 'DPOC',
  'COVID-19 Research': 'Investigação sobre COVID-19',
  'Creativity & Creative Flow': 'Criatividade e Fluxo Criativo',
  "Crohn's Disease & IBD": 'Doença de Crohn e DII',
  'CBD for CrossFit': 'CBD para CrossFit',
  'CBD for Cyclists': 'CBD para Ciclistas',
  'Dandruff': 'Caspa',
  'Dating & Relationship Anxiety': 'Ansiedade em Encontros e Relações',
  'Dental Anxiety': 'Ansiedade Dentária',
  'Depression & Mood Disorders': 'Depressão e Perturbações do Humor',
  'CBD for Office Workers': 'CBD para Trabalhadores de Escritório',
  'Diabetes & Blood Sugar': 'Diabetes e Açúcar no Sangue',
  'CBD & Diabetes Medications': 'CBD e Medicamentos para Diabetes',
  'Diabetic Neuropathy': 'Neuropatia Diabética',
  'Diarrhea': 'Diarreia',
  'Digestive Health': 'Saúde Digestiva',
  'Dog Allergies & Skin Issues': 'Alergias e Problemas de Pele Caninos',
  'Dog Anxiety': 'Ansiedade Canina',
  'Dog Appetite Issues': 'Problemas de Apetite Canino',
  'Dog Arthritis': 'Artrite Canina',
  'Dog Hip Dysplasia': 'Displasia da Anca Canina',
  'Dog Nausea & Motion Sickness': 'Náuseas e Enjoo de Movimento Canino',
  'Dog Pain Management': 'Gestão da Dor Canina',
  'Dog Seizures & Epilepsy': 'Convulsões e Epilepsia Canina',
  'Dog Separation Anxiety': 'Ansiedade de Separação Canina',
  'Dog Storm & Noise Anxiety': 'Ansiedade por Trovoadas e Ruído Canino',
  'CBD & Dopamine': 'CBD e Dopamina',
  'CBD & Driving': 'CBD e Condução',
  'CBD & Drug Testing': 'CBD e Testes de Drogas',
  'Dry Mouth': 'Boca Seca',
  'Dry Skin': 'Pele Seca',
  'Eczema & Dermatitis': 'Eczema e Dermatite',
  'Elbow Pain & Tennis Elbow': 'Dor no Cotovelo e Epicondilite',
  'Endometriosis': 'Endometriose',
  'Energy & Vitality': 'Energia e Vitalidade',
  'CBD for Entrepreneurs': 'CBD para Empresários',
  'Epilepsy & Seizure Disorders': 'Epilepsia e Perturbações Convulsivas',
  'Test & Exam Anxiety': 'Ansiedade em Testes e Exames',
  'Eye Health': 'Saúde Ocular',
  'Family Event Anxiety': 'Ansiedade em Eventos Familiares',
  'Bird Feather Plucking': 'Arrancamento de Penas em Aves',
  'Ferret Care & CBD': 'Cuidados com Furões e CBD',
  'Fibromyalgia Syndrome': 'Síndrome de Fibromialgia',
  'CBD for Financial Professionals': 'CBD para Profissionais Financeiros',
  'CBD for First Responders': 'CBD para Socorristas',
  'Focus & Concentration': 'Foco e Concentração',
  'Food Intolerances': 'Intolerâncias Alimentares',
  'Foot Pain': 'Dor no Pé',
  'Frozen Shoulder': 'Ombro Congelado',
  'CBD & GABA': 'CBD e GABA',
  'CBD for Gamers': 'CBD para Jogadores',
  'Gastroparesis': 'Gastroparesia',
  'Generalized Anxiety Disorder (GAD)': 'Perturbação de Ansiedade Generalizada (PAG)',
  'Glaucoma & Eye Pressure': 'Glaucoma e Pressão Ocular',
  'CBD for Golfers': 'CBD para Golfistas',
  'Grief & Bereavement': 'Luto e Perda',
  'Guinea Pig Care & CBD': 'Cuidados com Porquinhos-da-índia e CBD',
  'Gum Disease & Gingivitis': 'Doença das Gengivas e Gengivite',
  'Gut Microbiome Health': 'Saúde do Microbioma Intestinal',
  'Hair Loss & Thinning': 'Queda e Adelgaçamento do Cabelo',
  'CBD for Hairdressers & Stylists': 'CBD para Cabeleireiros e Estilistas',
  'Hamster Care & CBD': 'Cuidados com Hamsters e CBD',
  'Hand Pain & Grip Issues': 'Dor na Mão e Problemas de Preensão',
  'Hangover Recovery': 'Recuperação de Ressaca',
  'Headaches': 'Dores de Cabeça',
  'Medical & Healthcare Anxiety': 'Ansiedade Médica e de Saúde',
  'CBD for Healthcare Workers': 'CBD para Profissionais de Saúde',
  'Hearing Loss & Auditory Health': 'Perda Auditiva e Saúde Auditiva',
  'Cardiovascular Health': 'Saúde Cardiovascular',
  'CBD for HSPs': 'CBD para Pessoas Altamente Sensíveis',
  'CBD for Hikers': 'CBD para Caminhantes',
  'Hip Pain & Hip Dysplasia': 'Dor na Anca e Displasia da Anca',
  'Hives & Urticaria': 'Urticária',
  'Holiday & Seasonal Stress': 'Stress das Festas e Sazonal',
  'CBD & Homeostasis': 'CBD e Homeostasia',
  'Horse Anxiety': 'Ansiedade Equina',
  "Horse Cushing's Disease (PPID)": 'Síndrome de Cushing Equino (DPIH)',
  'Horse Laminitis': 'Laminite Equina',
  'Horse Navicular Syndrome': 'Síndrome Navicular Equino',
  'Horse Performance & Recovery': 'Desempenho e Recuperação Equina',
  'Horse Gastric Ulcers': 'Úlceras Gástricas Equinas',
  'Hot Flashes': 'Afrontamentos',
  'CBD & Hot Tub Recovery': 'CBD e Recuperação em Jacuzzi',
  'Irritable Bowel Syndrome': 'Síndrome do Intestino Irritável',
  'Immune System Support': 'Suporte ao Sistema Imunitário',
  'Inflammation & Inflammatory Conditions': 'Inflamação e Condições Inflamatórias',
  'Insulin Resistance': 'Resistência à Insulina',
  'CBD & Intermittent Fasting': 'CBD e Jejum Intermitente',
  'Job Interview Anxiety': 'Ansiedade em Entrevistas de Emprego',
  'CBD for Introverts': 'CBD para Introvertidos',
  'Jaw Pain': 'Dor na Mandíbula',
  'Joint Health & Mobility': 'Saúde Articular e Mobilidade',
  'CBD & Keto Diet': 'CBD e Dieta Cetogénica',
  'Knee Pain': 'Dor no Joelho',
  'CBD for Lawyers': 'CBD para Advogados',
  'Intestinal Permeability': 'Permeabilidade Intestinal',
  'Liver Health': 'Saúde Hepática',
  'Long COVID Syndrome': 'Síndrome de COVID Longa',
  'Lupus': 'Lúpus',
  'CBD for Martial Arts': 'CBD para Artes Marciais',
  'CBD & Meditation': 'CBD e Meditação',
  "Men's Health & CBD": 'Saúde Masculina e CBD',
  'Menopause': 'Menopausa',
  'Menstrual Cramps & Period Pain': 'Cólicas Menstruais e Dor Menstrual',
  'Period Pain': 'Dor Menstrual',
  'Metabolic Syndrome': 'Síndrome Metabólica',
  'Migraines & Headaches': 'Enxaquecas e Dores de Cabeça',
  'CBD for MMA & Combat Sports': 'CBD para MMA e Desportos de Combate',
  'Mood Regulation': 'Regulação do Humor',
  'Mouth Ulcers & Canker Sores': 'Úlceras Bucais e Aftas',
  'CBD for Moving House Stress': 'CBD para Stress de Mudança',
  'Multiple Sclerosis (MS)': 'Esclerose Múltipla (EM)',
  'Muscle Recovery': 'Recuperação Muscular',
  'Muscle Tension & Spasms': 'Tensão Muscular e Espasmos',
  'CBD for Musicians': 'CBD para Músicos',
  'Nail Health': 'Saúde das Unhas',
  'Nausea & Vomiting': 'Náuseas e Vómitos',
  'Neck Pain & Stiffness': 'Dor e Rigidez no Pescoço',
  'Nerve Pain & Neuralgia': 'Dor Nervosa e Nevralgia',
  'CBD & Nervous System': 'CBD e Sistema Nervoso',
  'Other Neurological Conditions': 'Outras Condições Neurológicas',
  'Neuropathic Pain & Nerve Damage': 'Dor Neuropática e Lesão Nervosa',
  'CBD for New Mothers': 'CBD para Mães Recentes',
  'CBD for Night Owls': 'CBD para Notívagos',
  'Obesity & Weight Management': 'Obesidade e Gestão de Peso',
  'Occipital Neuralgia': 'Nevralgia Occipital',
  'Obsessive-Compulsive Disorder (OCD)': 'Perturbação Obsessivo-Compulsiva (POC)',
  'Oily Skin': 'Pele Oleosa',
  'Opioid Tapering & Withdrawal': 'Redução e Abstinência de Opioides',
  'CBD for Over 60': 'CBD para Maiores de 60',
  'Repetitive Strain Injuries': 'Lesões por Esforço Repetitivo',
  'Pain Management': 'Gestão da Dor',
  'Panic Attacks & Panic Disorder': 'Ataques de Pânico e Perturbação de Pânico',
  'CBD for Parents': 'CBD para Pais',
  "Parkinson's Disease": 'Doença de Parkinson',
  'Parrot Care & CBD': 'Cuidados com Papagaios e CBD',
  'Pelvic Pain': 'Dor Pélvica',
  'CBD for Perfectionists': 'CBD para Perfeccionistas',
  'Performance Anxiety': 'Ansiedade de Desempenho',
  'Peripheral Neuropathy': 'Neuropatia Periférica',
  'Pet Fireworks & Noise Fear': 'Medo de Fogo de Artifício e Ruído em Animais',
  'Pet Travel & Motion Sickness': 'Viagem e Enjoo de Movimento em Animais',
  'CBD for Pets & Animals': 'CBD para Animais de Estimação',
  'Phantom Limb Pain': 'Dor de Membro Fantasma',
  'Phone & Communication Anxiety': 'Ansiedade Telefónica e de Comunicação',
  'CBD for Photographers': 'CBD para Fotógrafos',
  'CBD & Physical Therapy': 'CBD e Fisioterapia',
  'Plantar Fasciitis': 'Fasceíte Plantar',
  'Premenstrual Syndrome (PMS)': 'Síndrome Pré-Menstrual (SPM)',
  'CBD for Podcasters': 'CBD para Podcasters',
  'Poison Ivy & Plant Rashes': 'Hera Venenosa e Erupções Cutâneas',
  'Post-Operative Pain': 'Dor Pós-Operatória',
  'Pregnancy & CBD Safety': 'Gravidez e Segurança do CBD',
  'CBD & Prescription Drugs': 'CBD e Medicamentos de Prescrição',
  'CBD for Programmers': 'CBD para Programadores',
  'Psoriasis & Autoimmune Skin Conditions': 'Psoríase e Condições Cutâneas Autoimunes',
  'Post-Traumatic Stress Disorder': 'Perturbação de Stress Pós-Traumático',
  'CBD for Public Speakers': 'CBD para Oradores',
  'Public Speaking & Stage Fright': 'Falar em Público e Medo de Palco',
  'Puppy Care & CBD': 'Cuidados com Cachorros e CBD',
  'Rabbit Care & CBD': 'Cuidados com Coelhos e CBD',
  'Radiation Therapy Side Effects': 'Efeitos Secundários da Radioterapia',
  "Raynaud's Phenomenon": 'Fenómeno de Raynaud',
  'CBD for Real Estate Agents': 'CBD para Agentes Imobiliários',
  'CBD for Remote Workers': 'CBD para Trabalhadores Remotos',
  'Reptile Care & CBD': 'Cuidados com Répteis e CBD',
  'Restless Leg Syndrome': 'Síndrome das Pernas Inquietas',
  'CBD for Retail Workers': 'CBD para Trabalhadores do Retalho',
  'Rib Pain & Costochondritis': 'Dor nas Costelas e Costocondrite',
  'CBD for Rock Climbing': 'CBD para Escalada',
  'Rosacea': 'Rosácea',
  'CBD for Runners': 'CBD para Corredores',
  'CBD for Sales Professionals': 'CBD para Profissionais de Vendas',
  'CBD & Sauna': 'CBD e Sauna',
  'Scalp Conditions': 'Condições do Couro Cabeludo',
  'Scar Tissue & Adhesion Pain': 'Dor de Tecido Cicatricial e Aderências',
  'Schizophrenia & Psychosis': 'Esquizofrenia e Psicose',
  'Sciatica': 'Ciática',
  'Seasonal Allergies & Hay Fever': 'Alergias Sazonais e Febre dos Fenos',
  'Seasonal Affective Disorder (SAD)': 'Perturbação Afetiva Sazonal (PAS)',
  'Senior Cat Care': 'Cuidados com Gatos Idosos',
  'Senior Dog Care': 'Cuidados com Cães Idosos',
  'Senior Pet Care': 'Cuidados com Animais Idosos',
  'CBD for Seniors (50+)': 'CBD para Idosos (50+)',
  'Sensitive Skin': 'Pele Sensível',
  'CBD & Serotonin': 'CBD e Serotonina',
  'CBD for Shift Workers': 'CBD para Trabalhadores por Turnos',
  'Shingles & Postherpetic Neuralgia': 'Herpes Zóster e Nevralgia Pós-Herpética',
  'Shoulder Pain': 'Dor no Ombro',
  'Sinus Issues': 'Problemas de Sinusite',
  'CBD for Skeptics': 'CBD para Céticos',
  'CBD for Skiing & Snowboarding': 'CBD para Esqui e Snowboard',
  'Skin Health & Dermatology': 'Saúde da Pele e Dermatologia',
  'Sleep Disorders & Insomnia': 'Perturbações do Sono e Insónia',
  'Sleep Apnea': 'Apneia do Sono',
  'Small Pet Care': 'Cuidados com Animais Pequenos',
  'Smoking Cessation': 'Cessação Tabágica',
  'Snoring': 'Ressonar',
  'Social Anxiety Disorder': 'Perturbação de Ansiedade Social',
  'Social Event Anxiety': 'Ansiedade em Eventos Sociais',
  'Sports Injuries': 'Lesões Desportivas',
  'CBD for Content Creators': 'CBD para Criadores de Conteúdo',
  'Chronic Stress': 'Stress Crónico',
  'CBD for Students': 'CBD para Estudantes',
  'Sunburn': 'Queimaduras Solares',
  'CBD for Surfers': 'CBD para Surfistas',
  'Surgery Recovery': 'Recuperação Cirúrgica',
  'CBD for Swimmers': 'CBD para Nadadores',
  'CBD for Teachers': 'CBD para Professores',
  'CBD for Teenagers': 'CBD para Adolescentes',
  'Tendonitis': 'Tendinite',
  'CBD for Tennis': 'CBD para Ténis',
  'Tension Headaches': 'Cefaleias de Tensão',
  'CBD for THC-Sensitive People': 'CBD para Pessoas Sensíveis ao THC',
  'CBD for Therapists': 'CBD para Terapeutas',
  'Thyroid Health': 'Saúde da Tiroide',
  'Tinnitus': 'Zumbido',
  'TMJ Disorder': 'Perturbação da ATM',
  'Tooth & Dental Pain': 'Dor Dentária e Bucal',
  'Tourette Syndrome': 'Síndrome de Tourette',
  'Travel & Flying Anxiety': 'Ansiedade de Viagem e Voo',
  'CBD for Travelers': 'CBD para Viajantes',
  'Trigeminal Neuralgia': 'Nevralgia do Trigémeo',
  'CBD for Truckers': 'CBD para Camionistas',
  'CBD for Type A Personalities': 'CBD para Personalidades Tipo A',
  'Ulcerative Colitis': 'Colite Ulcerosa',
  'Varicose Veins': 'Varizes',
  'CBD for Vegans': 'CBD para Veganos',
  'Vertigo & Dizziness': 'Vertigem e Tonturas',
  'CBD for Veterans': 'CBD para Veteranos',
  'Wedding Day Nerves': 'Nervosismo do Dia do Casamento',
  'CBD & Weight Management': 'CBD e Gestão de Peso',
  'CBD for Weightlifters': 'CBD para Halterofilistas',
  "Women's Health & Hormones": 'Saúde da Mulher e Hormonas',
  'Post-Workout Recovery': 'Recuperação Pós-Treino',
  'Wound Healing': 'Cicatrização de Feridas',
  'Wrist Pain': 'Dor no Pulso',
  'CBD for Writers': 'CBD para Escritores',
  'CBD & Yoga': 'CBD e Yoga'
};

// Function to create Portuguese slug
function createPortugueseSlug(portugueseName) {
  return portugueseName
    .toLowerCase()
    .replace(/á/g, 'a')
    .replace(/à/g, 'a')
    .replace(/â/g, 'a')
    .replace(/ã/g, 'a')
    .replace(/é/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ô/g, 'o')
    .replace(/õ/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Function to translate a condition
function translateCondition(condition) {
  const portugueseName = portugueseTranslations[condition.name] || condition.name;
  const portugueseDisplayName = portugueseDisplayNames[condition.display_name] || portugueseName;
  const portugueseSlug = createPortugueseSlug(portugueseName);
  
  // Create short description in Portuguese
  let shortDescription;
  if (condition.short_description.includes('Learn about CBD research and ')) {
    const topic = condition.short_description.replace('Learn about CBD research and ', '').toLowerCase();
    shortDescription = `Descubra a investigação sobre CBD e ${topic}`;
  } else if (condition.short_description.includes('Research on CBD for ')) {
    const topic = condition.short_description.replace(/Research on CBD for (.+)\.?/, '$1').toLowerCase();
    shortDescription = `Investigação sobre CBD para ${topic}`;
  } else if (condition.short_description.includes('Clinical studies on CBD for ')) {
    const topic = condition.short_description.replace(/Clinical studies on CBD for (.+)\.?/, '$1').toLowerCase();
    shortDescription = `Estudos clínicos sobre CBD para ${topic}`;
  } else if (condition.short_description.includes('CBD research on ')) {
    const topic = condition.short_description.replace(/CBD research on (.+)\.?/, '$1').toLowerCase();
    shortDescription = `Investigação de CBD sobre ${topic}`;
  } else {
    shortDescription = `Descubra a investigação sobre CBD e ${portugueseName.toLowerCase()}`;
  }

  // Create meta title in Portuguese
  const metaTitle = `CBD e ${portugueseName} | Investigação e Informação`;

  // Create meta description in Portuguese
  const metaDescription = `Estudos sobre CBD e ${portugueseName.toLowerCase()}. Investigação científica sobre o canabidiol para ${portugueseName.toLowerCase()}.`;

  return {
    condition_id: condition.id,
    language: 'pt',
    name: portugueseName,
    slug: portugueseSlug,
    display_name: portugueseDisplayName,
    short_description: shortDescription,
    meta_title: metaTitle,
    meta_description: metaDescription
  };
}

async function insertTranslations() {
  console.log('Starting condition translation process...');
  
  const translations = [];
  
  for (const condition of conditions) {
    const translation = translateCondition(condition);
    translations.push(translation);
  }

  console.log(`Created ${translations.length} translations. Inserting into database...`);

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
    console.log(`Inserted ${inserted}/${translations.length} condition translations`);
  }

  console.log('✅ Condition translations inserted successfully!');
  return translations.length;
}

async function verifyCount() {
  console.log('Verifying condition translation count...');
  
  const { count, error } = await supabase
    .from('condition_translations')
    .select('id', { count: 'exact', head: true })
    .eq('language', 'pt');

  if (error) {
    console.error('Error verifying count:', error);
    return 0;
  }

  console.log(`✅ Database contains ${count} Portuguese condition translations`);
  return count;
}

async function main() {
  try {
    const insertedCount = await insertTranslations();
    const verifiedCount = await verifyCount();
    
    if (insertedCount === verifiedCount && verifiedCount === 312) {
      console.log('🎉 Condition translation task completed successfully!');
      console.log(`- Translated: ${insertedCount} conditions`);
      console.log(`- Verified: ${verifiedCount} conditions in database`);
      console.log('- Language: Portuguese (pt) - European Portuguese');
    } else {
      console.warn(`⚠️ Count: inserted ${insertedCount}, verified ${verifiedCount}`);
    }
  } catch (error) {
    console.error('❌ Condition translation failed:', error);
    process.exit(1);
  }
}

main();
