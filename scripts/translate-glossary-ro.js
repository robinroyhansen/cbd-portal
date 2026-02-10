#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Supabase setup
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Load English glossary
const glossaryPath = path.join(__dirname, 'data', 'glossary_en.json');
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));

console.log(`Loaded ${glossary.length} glossary terms to translate`);

// Romanian translation mappings
const romanianTranslations = {
  // Terms - alphabetical
  '2-AG': { term: '2-AG', definition: '2-AG (2-arahidonoilglicerol) este un endocanabinoid care activează atât receptorii CB1, cât și CB2. Joacă roluri cheie în funcția imunitară și semnalizarea durerii.', simple: 'Un compus natural produs de organism care interacționează cu sistemul endocanabinoid.' },
  '510 Thread Cartridge': { term: 'Cartuș cu filet 510', definition: 'Recipiente preumplute cu ulei CBD care utilizează conexiunea standard din industrie cu filet 510.', simple: 'Cartuș CBD pre-umplut compatibil cu majoritatea vaporizatoarelor.' },
  'Acne': { term: 'Acnee', definition: 'O afecțiune a pielii care provoacă coșuri, de obicei din cauza foliculilor de păr înfundați.', simple: 'Afecțiune a pielii care cauzează coșuri și puncte negre.' },
  'Allosteric Modulation': { term: 'Modulare alosterică', definition: 'Când un compus modifică funcția receptorului prin legarea la un sit secundar în loc de situl activ principal.', simple: 'Mod prin care CBD-ul poate influența receptorii indirect.' },
  'ALS': { term: 'SLA', definition: 'O boală neurodegenerativă progresivă care afectează celulele nervoase care controlează mușchii voluntari.', simple: 'Scleroza laterală amiotrofică - boală care afectează nervii și mușchii.' },
  "Alzheimer's Disease": { term: 'Boala Alzheimer', definition: 'O boală cerebrală progresivă care provoacă pierderea memoriei și declin cognitiv.', simple: 'Boală cerebrală care afectează memoria și gândirea.' },
  'Anandamide': { term: 'Anandamidă', definition: 'Anandamida este un endocanabinoid produs natural, adesea numit „molecula fericirii". CBD poate crește nivelurile de anandamidă prin inhibarea descompunerii sale.', simple: 'Substanță naturală din organism care produce senzații de bine.' },
  'Anti-inflammatory': { term: 'Antiinflamator', definition: 'Antiinflamator se referă la substanțe care reduc inflamația. CBD a demonstrat proprietăți antiinflamatoare în studii prin modularea răspunsurilor imune.', simple: 'Substanță care reduce umflăturile și inflamația.' },
  'Anticonvulsant': { term: 'Anticonvulsivant', definition: 'O substanță care previne convulsiile; CBD este aprobat de agențiile de reglementare pentru anumite afecțiuni epileptice.', simple: 'Medicament care ajută la prevenirea convulsiilor.' },
  'Anxiety': { term: 'Anxietate', definition: 'Anxietatea este o afecțiune de sănătate mintală caracterizată de îngrijorare persistentă, frică sau neliniște care poate interfera cu viața de zi cu zi.', simple: 'Stare de îngrijorare și teamă excesivă.' },
  'Anxiolytic': { term: 'Anxiolitic', definition: 'Anxiolitic înseamnă reducerea anxietății. CBD a demonstrat proprietăți anxiolitice în cercetare, ajutând potențial la gestionarea anxietății prin mecanisme multiple.', simple: 'Substanță care reduce anxietatea.' },
  'Appetite Changes': { term: 'Modificări ale apetitului', definition: 'CBD poate crește sau scădea apetitul în funcție de individ și doză.', simple: 'CBD poate afecta pofta de mâncare.' },
  'Arthritis': { term: 'Artrită', definition: 'CBD poate ajuta simptomele de artrită prin efecte antiinflamatoare. Produsele topice CBD sunt populare pentru disconfortul articular, deși cercetarea continuă.', simple: 'Inflamația articulațiilor care cauzează durere și rigiditate.' },
  'Autism Spectrum Disorder': { term: 'Tulburarea de spectru autist', definition: 'O afecțiune de dezvoltare care afectează comunicarea și comportamentul, cu cercetări emergente privind CBD.', simple: 'Afecțiune neurologică care afectează interacțiunea socială.' },
  'Autoflower': { term: 'Autoflorantă', definition: 'Varietăți de cânepă care înfloresc automat pe baza vârstei, nu a expunerii la lumină.', simple: 'Plante de cânepă care înfloresc automat.' },
  'Batch Number': { term: 'Număr de lot', definition: 'Numerele de lot identifică serii specifice de producție ale produselor CBD. Permit consumatorilor să verifice rezultatele de laborator și să facă posibile retrageri dacă apar probleme de calitate.', simple: 'Cod unic pentru a urmări un lot specific de produs.' },
  'Batch Testing': { term: 'Testare pe lot', definition: 'Testarea pe lot verifică dacă fiecare serie de producție a produselor CBD îndeplinește standardele de calitate. Căutați COA specifice lotului pentru cele mai precise informații.', simple: 'Verificarea calității pentru fiecare lot de produs.' },
  'Bioavailability': { term: 'Biodisponibilitate', definition: 'Biodisponibilitatea măsoară cât CBD intră efectiv în fluxul sanguin. Variază în funcție de metodă: sublingual (20-35%), oral (6-20%), inhalat (30-40%).', simple: 'Cât de mult CBD ajunge efectiv în organism.' },
  'Biomass': { term: 'Biomasă', definition: 'Material vegetal brut din cânepă utilizat pentru extracția CBD.', simple: 'Plante de cânepă crude folosite pentru extracție.' },
  'Biphasic Effect': { term: 'Efect bifazic', definition: 'Când CBD produce efecte diferite la doze mici față de doze mari.', simple: 'CBD poate avea efecte diferite în funcție de doză.' },
  'Bipolar Disorder': { term: 'Tulburare bipolară', definition: 'O afecțiune de sănătate mintală care provoacă schimbări extreme de dispoziție între depresie și manie.', simple: 'Afecțiune cu schimbări extreme de dispoziție.' },
  'Bisabolol': { term: 'Bisabolol', definition: 'Bisabololul este o terpenă florală găsită în cânepă și mușețel. Poate avea proprietăți antiinflamatoare și de vindecare a pielii, fiind populară în topicele CBD.', simple: 'Compus natural cu proprietăți calmante pentru piele.' },
  'Blood Thinner Interaction': { term: 'Interacțiune cu anticoagulante', definition: 'CBD poate crește nivelurile anticoagulantelor, crescând riscul de sângerare - consultați întotdeauna medicul.', simple: 'CBD poate afecta medicamentele care subțiază sângele.' },
  'Blood-Brain Barrier': { term: 'Bariera hemato-encefalică', definition: 'Membrană cerebrală protectoare pe care canabinoidele o pot traversa datorită naturii lor liposolubile.', simple: 'Barieră care protejează creierul și pe care CBD-ul o poate traversa.' },
  'Body Weight Dosing': { term: 'Dozare în funcție de greutate', definition: 'O abordare de dozare care calculează cantitățile de CBD pe baza greutății corporale.', simple: 'Calcularea dozei CBD în funcție de kilogramele corporale.' },
  'Borneol': { term: 'Borneol', definition: 'O terpenă mentolată care îmbunătățește absorbția compușilor prin bariera hemato-encefalică.', simple: 'Compus aromatic care poate ajuta absorbția CBD.' },
  'Broad Spectrum': { term: 'Spectru larg', definition: 'CBD-ul cu spectru larg include mai mulți canabinoizi și terpene, dar cu THC complet eliminat. Oferă beneficii ale efectului de anturaj fără THC.', simple: 'CBD cu compuși multipli dar fără THC.' },
  'Budder': { term: 'Budder', definition: 'Concentrat de cannabis cremos, ca untul, care păstrează un conținut ridicat de terpene.', simple: 'Tip de concentrat CBD cu textură cremoasă.' },
  'Camphene': { term: 'Camfen', definition: 'O terpenă terestră, cu parfum de brad, care poate susține sănătatea cardiovasculară.', simple: 'Compus aromatic cu beneficii potențiale pentru inimă.' },
  'Cannabichromene': { term: 'Canabicromen', definition: 'Un canabinoid non-psihoactiv care poate avea proprietăți antiinflamatoare și antidepresive.', simple: 'CBC - canabinoid cu proprietăți terapeutice.' },
  'Cannabidiol': { term: 'Canabidiol', definition: 'Un canabinoid non-psihoactiv din cannabis cu beneficii terapeutice potențiale, inclusiv ameliorarea anxietății și efecte antiinflamatoare.', simple: 'CBD - principalul compus terapeutic din cânepă.' },
  'Cannabigerol': { term: 'Canabigerol', definition: '„Canabinoidul mamă" care servește drept precursor pentru alți canabinoizi precum CBD și THC.', simple: 'CBG - canabinoidul din care se formează CBD și THC.' },
  'Cannabinoid Profile': { term: 'Profil canabinoid', definition: 'Combinația specifică și concentrația de canabinoizi într-un produs.', simple: 'Lista canabinozilor din produsul CBD.' },
  'Cannabinol': { term: 'Canabinol', definition: 'Un canabinoid ușor psihoactiv format din oxidarea THC, cunoscut pentru potențiale efecte sedative.', simple: 'CBN - canabinoid cu efecte relaxante.' },
  'Cannabis Indica': { term: 'Cannabis Indica', definition: 'O varietate de cannabis asociată tradițional cu efecte relaxante și sedative.', simple: 'Tip de cannabis cu efecte relaxante.' },
  'Cannabis Oil': { term: 'Ulei de cannabis', definition: 'Termen general pentru uleiurile din cannabis; poate însemna ulei CBD, ulei THC sau ambele.', simple: 'Ulei extras din planta de cannabis.' },
  'Cannabis Sativa': { term: 'Cannabis Sativa', definition: 'O specie de cannabis asociată tradițional cu efecte energizante și stimulatoare.', simple: 'Tip de cannabis cu efecte energizante.' },
  'Carrier Oil': { term: 'Ulei purtător', definition: 'Uleiurile purtătoare precum MCT, semințe de cânepă sau măsline ajută la livrarea CBD și îmbunătățesc absorbția. De asemenea, permit dozarea precisă în produsele tincturi.', simple: 'Ulei care ajută la absorbția CBD.' },
  'Caryophyllene': { term: 'Cariofilen', definition: 'Beta-cariofilenul este o terpenă picantă care se leagă unic de receptorii CB2. Găsit în cânepă și piper negru, poate îmbunătăți efectele antiinflamatoare.', simple: 'Terpenă picantă cu efecte antiinflamatoare.' },
  'CB1 Receptor': { term: 'Receptor CB1', definition: 'Receptorii CB1 se găsesc în principal în creier și sistemul nervos central. THC se leagă direct de CB1, în timp ce CBD are un efect modulator indirect asupra lor.', simple: 'Receptor din creier cu care interacționează canabinoidele.' },
  'CB2 Receptor': { term: 'Receptor CB2', definition: 'Receptorii CB2 sunt localizați în principal în celulele imunitare și țesuturile periferice. Joacă roluri importante în reglarea inflamației și răspunsului imun.', simple: 'Receptor imunitar cu care interacționează CBD.' },
  'CBD': { term: 'CBD', definition: 'CBD (canabidiol) este un compus non-intoxicant din planta de cannabis, studiat pentru beneficii terapeutice potențiale, inclusiv ameliorarea durerii, reducerea anxietății și efecte antiinflamatoare.', simple: 'Canabidiol - compus terapeutic din cânepă fără efecte psihotrope.' },
  'CBD Balm': { term: 'Balsam CBD', definition: 'Un produs topic CBD gros, pe bază de ulei, care creează o barieră protectoare pentru piele.', simple: 'Cremă groasă CBD pentru aplicare pe piele.' },
  'CBD Bath Bombs': { term: 'Bombe de baie CBD', definition: 'Produse efervescente de baie care eliberează CBD în apa de baie pentru absorbție prin piele.', simple: 'Bile efervescente pentru baie cu CBD.' },
  'CBD Beverages': { term: 'Băuturi CBD', definition: 'Băuturi infuzate cu CBD solubil în apă folosind tehnologia nanoemulsiei.', simple: 'Băuturi care conțin CBD.' },
  'CBD Capsules': { term: 'Capsule CBD', definition: 'Suplimente CBD orale sub formă de pastile care oferă dozare precisă și fără gust.', simple: 'Pastile cu CBD pentru înghițit.' },
  'CBD Coffee': { term: 'Cafea CBD', definition: 'Produse de cafea infuzate cu CBD, echilibrând potențial efectele stimulatoare ale cofeinei.', simple: 'Cafea care conține CBD.' },
  'CBD Cream': { term: 'Cremă CBD', definition: 'Un produs topic pe bază de apă pentru aplicarea CBD direct pe piele.', simple: 'Cremă cu CBD pentru aplicare pe piele.' },
  'CBD Dosage Calculator': { term: 'Calculator de dozare CBD', definition: 'Instrument pentru estimarea dozei inițiale pe baza greutății corporale și afecțiunii; ajustați în funcție de răspuns.', simple: 'Instrument care ajută la calcularea dozei corecte de CBD.' },
  'CBD for Cats': { term: 'CBD pentru pisici', definition: 'CBD pentru anxietatea și durerea la pisici; pisicile metabolizează diferit, așa că utilizați produse specifice pentru pisici.', simple: 'Produse CBD formulate special pentru pisici.' },
  'CBD for Dogs': { term: 'CBD pentru câini', definition: 'CBD poate ajuta câinii cu anxietate, durere și convulsii; asigurați-vă că produsele au THC minim.', simple: 'Produse CBD formulate special pentru câini.' },
  'CBD Gummies': { term: 'Jeleuri CBD', definition: 'Bomboane comestibile infuzate cu CBD care oferă doze convenabile, pre-măsurate, cu efecte mai durabile.', simple: 'Jeleuri gustoase care conțin CBD.' },
  'CBD Isolate': { term: 'Izolat CBD', definition: 'Izolatul CBD este cea mai pură formă de canabidiol disponibilă, cu puritate de 99%+. Toți ceilalți canabinoizi, terpene și compuși vegetali sunt complet eliminați.', simple: 'CBD pur 99% fără alte substanțe.' },
  'CBD Marketing Claims': { term: 'Afirmații de marketing CBD', definition: 'CBD nu poate pretinde legal că vindecă sau tratează boli; atenție la semnale de alarmă precum „cură miraculoasă".', simple: 'Reguli despre ce pot afirma legal produsele CBD.' },
  'CBD Patch': { term: 'Plasture CBD', definition: 'Plasture adeziv care livrează CBD prin piele pe perioade extinse.', simple: 'Plasture care eliberează CBD lent prin piele.' },
  'CBD Salve': { term: 'Unguent CBD', definition: 'Un produs topic CBD moale, pe bază de ulei, similar cu balsamul, dar cu consistență mai moale.', simple: 'Cremă groasă CBD pentru aplicare locală.' },
  'CBD Tincture': { term: 'Tinctură CBD', definition: 'Extract lichid CBD administrat sub limbă pentru absorbție rapidă și dozare precisă.', simple: 'Ulei CBD lichid pentru administrare sub limbă.' },
  'CBDA': { term: 'CBDA', definition: 'CBDA (acid canabidiolic) este forma brută, acidă a CBD-ului găsită în cânepa proaspătă. Se convertește în CBD prin căldură într-un proces numit decarboxilare.', simple: 'Forma brută a CBD-ului din planta proaspătă.' },
  'CBDV': { term: 'CBDV', definition: 'CBDV (canabidivarin) este un canabinoid non-psihoactiv similar cu CBD. Cercetările timpurii sugerează beneficii potențiale pentru greață și afecțiuni neurologice.', simple: 'Canabinoid similar cu CBD cu beneficii potențiale.' },
  'CBE': { term: 'CBE', definition: 'Un canabinoid minor format când CBD se degradează, găsit de obicei în produsele de cannabis îmbătrânite.', simple: 'Canabinoid care se formează când CBD-ul îmbătrânește.' },
  'Certificate of Analysis': { term: 'Certificat de analiză', definition: 'Un Certificat de analiză (COA) este un raport de laborator independent care arată conținutul de canabinoizi, potența și rezultatele testelor de contaminanți pentru produsele CBD.', simple: 'Document care dovedește calitatea și puritatea produsului CBD.' },
  'cGMP (Current Good Manufacturing Practice)': { term: 'cGMP (Bune practici de fabricație curente)', definition: 'Standarde farmaceutice de fabricație care asigură calitatea și consistența produsului.', simple: 'Standarde de calitate pentru fabricarea produselor.' },
  'Chemotherapy-Induced Nausea': { term: 'Greață indusă de chimioterapie', definition: 'Greață legată de tratament, unde canabinoidele sunt antiemetice aprobate în mai multe țări.', simple: 'Greață cauzată de tratamentul cancerului.' },
  'Chromatography': { term: 'Cromatografie', definition: 'O tehnică de separare folosită pentru a purifica canabinoidele sau pentru a elimina compușii nedoriți din extractul de cânepă.', simple: 'Metodă de laborator pentru purificarea CBD.' },
  'Chronic Pain': { term: 'Durere cronică', definition: 'CBD poate ajuta la gestionarea durerii cronice prin efecte antiinflamatoare și interacțiune cu receptorii durerii. Mulți utilizatori raportează ameliorarea durerii persistente.', simple: 'Durere de lungă durată care poate fi ajutată de CBD.' },
  'Clinical Trial': { term: 'Studiu clinic', definition: 'Studiu de cercetare controlat care testează tratamente la participanți umani.', simple: 'Studiu științific care testează tratamente pe oameni.' },
  'CO2 Extraction': { term: 'Extracție CO2', definition: 'Extracția CO2 folosește dioxid de carbon presurizat pentru a extrage CBD din plante de cânepă. Produce extracte pure, fără solvenți și este standardul de aur al industriei.', simple: 'Cea mai curată metodă de extracție a CBD.' },
  'Cold Press Extraction': { term: 'Extracție la rece', definition: 'Presarea semințelor de cânepă la temperaturi scăzute pentru a extrage uleiul - procesare minimă.', simple: 'Metodă blândă de extracție a uleiului.' },
  'Compassionate Use': { term: 'Utilizare compasională', definition: 'Programe care permit accesul la tratamente neaprobate pentru pacienții grav bolnavi.', simple: 'Acces la tratamente experimentale pentru cazuri grave.' },
  'Contamination': { term: 'Contaminare', definition: 'Prezența substanțelor dăunătoare nedorite în produsele CBD.', simple: 'Substanțe nedorite în produsele CBD.' },
  'Contraindication': { term: 'Contraindicație', definition: 'O condiție sau un factor care face utilizarea CBD neadecvată sau riscantă.', simple: 'Situație în care CBD nu trebuie utilizat.' },
  'Controlled Substance': { term: 'Substanță controlată', definition: 'Substanțele controlate sunt reglementate de autorități. În timp ce cannabisul este interzis federal, CBD-ul derivat din cânepă sub 0,3% THC nu este o substanță controlată.', simple: 'Substanță reglementată de lege.' },
  'Cosmetic CBD Regulations': { term: 'Reglementări CBD cosmetice', definition: 'Reguli care guvernează utilizarea CBD în produsele de îngrijire a pielii și frumusețe.', simple: 'Legi despre CBD în cosmetice.' },
  "Crohn's Disease": { term: 'Boala Crohn', definition: 'Boală inflamatorie intestinală în care CBD poate reduce inflamația intestinală.', simple: 'Boală intestinală care poate beneficia de CBD.' },
  'Crude Oil': { term: 'Ulei brut', definition: 'Extractul inițial, nerafinat din cânepă care conține toți compușii vegetali.', simple: 'Extract CBD neprocesat.' },
  'Cruelty-Free': { term: 'Fără cruzime', definition: 'Produse netestate pe animale; căutați certificarea Leaping Bunny sau PETA.', simple: 'Produse netestate pe animale.' },
  'Crumble': { term: 'Crumble', definition: 'Concentrat de cannabis uscat, sfărâmicios, ușor de manevrat și dozat.', simple: 'Tip de concentrat CBD cu textură sfărâmicioasă.' },
  'Cultivar': { term: 'Cultivar', definition: 'O varietate cultivată de cannabis crescută pentru caracteristici specifice dorite.', simple: 'Varietate specifică de cânepă.' },
  'Curing': { term: 'Uscare controlată', definition: 'Procesul de uscare controlată care păstrează canabinoidele și terpenele în cânepa recoltată.', simple: 'Proces de uscare care păstrează calitatea.' },
  'CYP450 Enzymes': { term: 'Enzime CYP450', definition: 'Enzime hepatice care metabolizează CBD și multe medicamente - baza interacțiunilor medicamentoase.', simple: 'Enzime din ficat care procesează CBD și medicamente.' },
  'Dab': { term: 'Dab', definition: 'O metodă de consum a concentratelor de cannabis prin vaporizarea lor pe o suprafață încălzită.', simple: 'Metodă de vaporizare a concentratelor.' },
  'Decarboxylation': { term: 'Decarboxilare', definition: 'Decarboxilarea este procesul de încălzire care convertește CBDA acid în CBD activ. Cânepa crudă conține canabinoizi acizi care trebuie încălziți pentru activare.', simple: 'Proces de încălzire care activează CBD.' },
  'Delta-8-THC': { term: 'Delta-8-THC', definition: 'Delta-8 THC este un canabinoid ușor psihoactiv derivat din CBD de cânepă. Oferă o experiență mai puțin intensă decât Delta-9 THC cu ambiguitate legală.', simple: 'Formă mai slabă de THC derivată din CBD.' },
  'Diabetes': { term: 'Diabet', definition: 'O boală metabolică care afectează reglarea glicemiei.', simple: 'Boală care afectează nivelul de zahăr din sânge.' },
  'Disposable Vape': { term: 'Vaporizator de unică folosință', definition: 'Dispozitive CBD de vaporizare de unică folosință, pre-umplute, aruncate după epuizarea uleiului.', simple: 'Vaporizator CBD pentru o singură utilizare.' },
  'Distillate': { term: 'Distilat', definition: 'Un extract de cannabis foarte rafinat care conține canabinoizi izolați, de obicei 85-95% THC sau CBD pur.', simple: 'Extract CBD foarte concentrat și purificat.' },
  'Distillation': { term: 'Distilare', definition: 'Distilarea CBD este un proces de purificare folosind căldură și vid pentru a izola canabinoidele. Produce ulei CBD foarte concentrat, de obicei 80-90% pur.', simple: 'Proces de purificare a CBD.' },
  'Dose': { term: 'Doză', definition: 'O doză este cantitatea specifică de substanță (cum ar fi CBD) administrată odată, măsurată în miligrame (mg).', simple: 'Cantitatea de CBD luată odată.' },
  'Double-Blind Study': { term: 'Studiu dublu-orb', definition: 'Cercetare în care nici participanții, nici cercetătorii nu știu cine primește tratamentul versus placebo.', simple: 'Tip de studiu științific foarte riguros.' },
  'Dravet Syndrome': { term: 'Sindrom Dravet', definition: 'O epilepsie rară și severă din copilărie pentru care CBD (Epidiolex) este aprobat de agențiile de reglementare.', simple: 'Formă severă de epilepsie infantilă tratată cu CBD.' },
  'Drowsiness': { term: 'Somnolență', definition: 'Stare de somnolență care poate apărea cu CBD, în special la doze mai mari.', simple: 'Efect secundar de somnolență de la CBD.' },
  'Drug Interaction': { term: 'Interacțiune medicamentoasă', definition: 'Interacțiunile medicamentoase cu CBD apar deoarece CBD afectează enzimele hepatice care metabolizează multe medicamente. Consultați întotdeauna un medic înainte de a combina CBD cu medicamente.', simple: 'Modul în care CBD poate afecta alte medicamente.' },
  'Dry Mouth': { term: 'Gură uscată', definition: 'Un efect secundar comun al CBD în care producția de salivă scade temporar.', simple: 'Efect secundar de uscăciune a gurii.' },
  'Duration of Effects': { term: 'Durata efectelor', definition: 'Cât timp persistă efectele CBD după ce încep, variind în funcție de metoda de consum.', simple: 'Cât timp durează efectele CBD.' },
  'Eczema': { term: 'Eczemă', definition: 'O afecțiune inflamatorie cronică a pielii care provoacă pete roșii, uscate și mâncărime.', simple: 'Afecțiune a pielii cu mâncărime și iritație.' },
  'Edible': { term: 'Comestibil', definition: 'Produse alimentare infuzate cu CBD pentru un consum convenabil și gustos.', simple: 'Alimente care conțin CBD.' },
  'Efficacy': { term: 'Eficacitate', definition: 'Cât de bine funcționează un tratament în condiții ideale, controlate.', simple: 'Cât de bine funcționează un tratament.' },
  'Endocannabinoid Deficiency': { term: 'Deficiență de endocanabinoizi', definition: 'Teorie conform căreia nivelurile inadecvate de endocanabinoizi pot cauza anumite afecțiuni cronice.', simple: 'Teorie despre lipsa canabinoidelor naturale din organism.' },
  'Endocannabinoid System': { term: 'Sistemul endocanabinoid', definition: 'Sistemul endocanabinoid (ECS) reglează echilibrul în organism, inclusiv dispoziția, somnul, apetitul și răspunsul la durere. CBD interacționează cu acest sistem.', simple: 'Sistem al corpului care interacționează cu CBD.' },
  'Endocannabinoid Tone': { term: 'Ton endocanabinoid', definition: 'Nivelul de bază al activității sistemului endocanabinoid în organism.', simple: 'Nivelul normal de activitate al sistemului endocanabinoid.' },
  'Endometriosis': { term: 'Endometrioză', definition: 'O afecțiune dureroasă care implică creșterea țesutului în afara uterului; unele folosesc CBD pentru gestionarea simptomelor.', simple: 'Afecțiune dureroasă feminină.' },
  'Entourage Effect': { term: 'Efectul de anturaj', definition: 'Efectul de anturaj descrie cum canabinoidele și terpenele lucrează împreună sinergic, făcând potențial CBD-ul cu spectru complet mai eficient.', simple: 'Compușii din cânepă funcționează mai bine împreună.' },
  'Epidiolex': { term: 'Epidiolex', definition: 'Primul medicament CBD aprobat de agențiile de reglementare pentru tratarea formelor severe de epilepsie.', simple: 'Medicament CBD aprobat pentru epilepsie.' },
  'Ethanol Extraction': { term: 'Extracție cu etanol', definition: 'Extracția cu etanol folosește alcool alimentar pentru a extrage canabinoidele din plante de cânepă. Este eficientă și poate păstra spectrul complet de compuși.', simple: 'Metodă de extracție CBD folosind alcool.' },
  'EU Organic Certification': { term: 'Certificare organică UE', definition: 'Standard organic european pentru cultivarea cânepii, indicat de sigla frunză verde.', simple: 'Certificare pentru cânepă crescută organic în UE.' },
  'EU-GMP Certification': { term: 'Certificare EU-GMP', definition: 'Cel mai înalt standard european de fabricație pentru produse CBD de grad farmaceutic.', simple: 'Cel mai înalt standard de calitate pentru CBD în Europa.' },
  'Eucalyptol': { term: 'Eucaliptol', definition: 'O terpenă răcoritoare, mentolată, cu beneficii respiratorii și suport cognitiv.', simple: 'Compus aromatic cu beneficii respiratorii.' },
  'FAAH Enzyme': { term: 'Enzima FAAH', definition: 'Enzima care descompune anandamida; CBD inhibă FAAH pentru a crește nivelurile de anandamidă.', simple: 'Enzimă pe care CBD o blochează pentru efecte benefice.' },
  'Feminized Seeds': { term: 'Semințe feminizate', definition: 'Semințe crescute pentru a produce doar plante femele pentru producția maximă de canabinoizi.', simple: 'Semințe care produc plante femele cu CBD.' },
  'Fibromyalgia': { term: 'Fibromialgie', definition: 'Afecțiune de durere cronică în care CBD poate ajuta prin efecte antiinflamatoare și asupra somnului.', simple: 'Afecțiune cu dureri în tot corpul.' },
  'First-Pass Metabolism': { term: 'Metabolism de prim pasaj', definition: 'Procesare hepatică care reduce biodisponibilitatea CBD atunci când este consumat oral.', simple: 'Proces care reduce absorbția CBD oral.' },
  'Flavonoids': { term: 'Flavonoide', definition: 'Flavonoidele sunt compuși vegetali găsiți în cannabis care oferă culoare și pot avea beneficii antiinflamatoare și antioxidante, funcționând alături de canabinoizi în efectul de anturaj.', simple: 'Compuși colorați din cânepă cu beneficii pentru sănătate.' },
  'Flower': { term: 'Floare', definition: 'Partea fumabilă a plantei de cannabis care conține cea mai mare concentrație de canabinoizi.', simple: 'Muguri de cânepă bogați în CBD.' },
  'Food Supplement Classification': { term: 'Clasificare ca supliment alimentar', definition: 'Categoria de reglementare care determină cum pot fi vândute și comercializate produsele CBD.', simple: 'Categoria legală în care se încadrează CBD.' },
  'Full Spectrum': { term: 'Spectru complet', definition: 'CBD-ul cu spectru complet conține toți compușii plantei de cânepă, inclusiv canabinoizi, terpene și urme de THC sub 0,3%. Beneficiază de efectul de anturaj.', simple: 'CBD cu toți compușii naturali, inclusiv urme de THC.' },
  'Gas Chromatography': { term: 'Cromatografie de gaze', definition: 'O metodă de testare pe bază de căldură mai puțin potrivită pentru produsele CBD, deoarece modifică canabinoidele acide.', simple: 'Metodă de testare de laborator.' },
  'Generalized Anxiety Disorder': { term: 'Tulburare de anxietate generalizată', definition: 'O afecțiune cronică de îngrijorare excesivă; CBD arată promisiuni ca opțiune de tratament.', simple: 'Formă de anxietate cronică.' },
  'Geraniol': { term: 'Geraniol', definition: 'Geraniolul este o terpenă florală, cu parfum de trandafir, găsită în cânepă și mușcate. Poate avea proprietăți neuroprotectoare și antioxidante combinate cu CBD.', simple: 'Terpenă florală cu beneficii potențiale.' },
  'Glaucoma': { term: 'Glaucom', definition: 'Afecțiune oculară care provoacă leziuni nervoase, unde THC poate scădea temporar presiunea oculară.', simple: 'Boală a ochilor cu presiune crescută.' },
  'GMP': { term: 'GMP', definition: 'Standarde de calitate pentru producția farmaceutică și a suplimentelor care asigură consistența și siguranța.', simple: 'Standarde de bună practică de fabricație.' },
  'GPR55 Receptor': { term: 'Receptor GPR55', definition: 'Un receptor orfan care răspunde la canabinoizi, uneori numit al treilea receptor canabinoid.', simple: 'Receptor cu care interacționează canabinoidele.' },
  'Grapefruit Interaction': { term: 'Interacțiune cu grapefruit', definition: 'Dacă medicamentul dumneavoastră avertizează împotriva grapefruitului, probabil interacționează și cu CBD.', simple: 'Indiciu că medicamentul poate interacționa cu CBD.' },
  'Halal CBD': { term: 'CBD Halal', definition: 'Produse CBD conforme cu legea islamică; trebuie să fie fără THC și fără alcool.', simple: 'CBD permis conform legilor islamice.' },
  'Half-life': { term: 'Timp de înjumătățire', definition: 'Timpul de înjumătățire al CBD este timpul necesar pentru ca jumătate din compus să părăsească corpul, de obicei 18-32 ore. Factorii includ dozajul, frecvența utilizării și rata metabolismului.', simple: 'Cât timp rămâne CBD în organism.' },
  'Hash': { term: 'Hașiș', definition: 'Concentrat tradițional făcut din trichomii de cannabis comprimați.', simple: 'Concentrat de cannabis tradițional.' },
  'Heavy Metals Testing': { term: 'Testare metale grele', definition: 'Analiză de laborator care verifică metale toxice precum plumb, mercur, arsen și cadmiu în produsele CBD.', simple: 'Test pentru substanțe toxice în CBD.' },
  'Hemp': { term: 'Cânepă', definition: 'Cânepa este Cannabis sativa care conține mai puțin de 0,3% THC. Legal federal conform Farm Bill 2018, este sursa majorității produselor CBD din SUA.', simple: 'Planta din care se extrage CBD legal.' },
  'Hemp License': { term: 'Licență pentru cânepă', definition: 'Un permis necesar pentru cultivarea, procesarea sau vânzarea legală de cânepă.', simple: 'Autorizație pentru a lucra cu cânepă.' },
  'Hemp Seed Oil': { term: 'Ulei de semințe de cânepă', definition: 'Uleiul din semințele de cânepă este presat din semințele de cânepă și nu conține canabinoizi CBD sau THC. Este nutritiv, dar diferit de uleiul CBD extras din flori.', simple: 'Ulei nutritiv fără CBD.' },
  'Hemp vs Marijuana': { term: 'Cânepă vs Marijuana', definition: 'Cânepa și marijuana sunt ambele cannabis, dar diferă legal prin conținutul de THC. Cânepa are sub 0,3% THC și este legală; marijuana are mai mult și este restricționată.', simple: 'Diferența dintre cânepă legală și marijuana.' },
  'HHC': { term: 'HHC', definition: 'O formă hidrogenată a THC care produce efecte psihoactive similare, dar distincte.', simple: 'Canabinoid sintetic similar cu THC.' },
  'Homeostasis': { term: 'Homeostazie', definition: 'Homeostazia este starea de echilibru intern a corpului. Sistemul endocanabinoid ajută la menținerea homeostaziei, iar CBD poate susține această funcție de echilibrare.', simple: 'Echilibrul natural al corpului pe care CBD îl susține.' },
  'HPLC': { term: 'HPLC', definition: 'Metoda standard de laborator pentru testarea precisă a conținutului de canabinoizi în produsele CBD.', simple: 'Metodă precisă de testare a CBD.' },
  'Humulene': { term: 'Humulenă', definition: 'Humulena este o terpenă terestră, lemnoasă, din cânepă și hamei. Poate avea proprietăți de suprimare a apetitului și antiinflamatoare combinate cu canabinoizi.', simple: 'Terpenă cu efect potențial de suprimare a apetitului.' },
  "Huntington's Disease": { term: 'Boala Huntington', definition: 'O tulburare cerebrală genetică care provoacă probleme progresive de mișcare, cognitive și psihiatrice.', simple: 'Boală genetică a creierului.' },
  'Hydrocarbon Extraction': { term: 'Extracție cu hidrocarburi', definition: 'Extracția cu hidrocarburi folosește butan sau propan pentru a extrage canabinoidele din cânepă. Necesită purjare atentă pentru a elimina toate reziduurile de solvent în siguranță.', simple: 'Metodă de extracție care necesită purificare atentă.' },
  'Hydrophobic': { term: 'Hidrofob', definition: 'Proprietatea de respingere a apei a canabinoidelor care necesită formulări speciale pentru băuturi.', simple: 'CBD nu se dizolvă natural în apă.' },
  'IBS': { term: 'SII', definition: 'O tulburare digestivă care poate răspunde la tratamentul cu canabinoizi prin receptorii intestinali.', simple: 'Sindromul intestinului iritabil.' },
  'Import/Export Regulations': { term: 'Reglementări import/export', definition: 'Reguli care guvernează comerțul internațional cu produse din cânepă și CBD.', simple: 'Legi despre transportul internațional al CBD.' },
  'In Vitro': { term: 'In vitro', definition: 'Cercetare efectuată în eprubete sau vase Petri în afara organismelor vii.', simple: 'Studii de laborator pe celule.' },
  'In Vivo': { term: 'In vivo', definition: 'Cercetare efectuată pe organisme vii precum animale sau oameni.', simple: 'Studii pe organisme vii.' },
  'Inactive Ingredients': { term: 'Ingrediente inactive', definition: 'Componente non-CBD precum uleiuri purtătoare și arome; verificați alergenii.', simple: 'Ingrediente adăugate în afară de CBD.' },
  'Inhalation': { term: 'Inhalare', definition: 'Inhalarea CBD prin vaporizare oferă cel mai rapid debut al efectelor, de obicei în câteva minute. Oferă biodisponibilitate ridicată, dar poate afecta plămânii.', simple: 'Metoda cea mai rapidă de a simți efectele CBD.' },
  'Insomnia': { term: 'Insomnie', definition: 'CBD poate susține somnul abordând factori precum anxietatea și durerea care perturbă odihna. Unii utilizatori combină CBD cu CBN sau melatonină pentru un somn mai bun.', simple: 'Problemă de somn pe care CBD o poate ajuta.' },
  'ISO 17025 Accreditation': { term: 'Acreditare ISO 17025', definition: 'Un standard internațional care asigură competența și fiabilitatea testelor de laborator.', simple: 'Standard de calitate pentru laboratoare.' },
  'ISO Certification': { term: 'Certificare ISO', definition: 'Standarde internaționale de calitate; ISO 17025 pentru laboratoare, ISO 9001 pentru producători.', simple: 'Certificări internaționale de calitate.' },
  'Kief': { term: 'Kief', definition: 'Pulbere fină de trichomi de cannabis, mai potentă decât floarea.', simple: 'Polen concentrat de cannabis.' },
  'Kosher CBD': { term: 'CBD Kosher', definition: 'Produse CBD certificate pentru a respecta legile alimentare evreiești sub supraveghere rabinică.', simple: 'CBD permis conform legilor iudaice.' },
  'Lab Report': { term: 'Raport de laborator', definition: 'Document care arată rezultatele testelor din analiza independentă de laborator a produselor CBD.', simple: 'Document cu rezultatele testelor CBD.' },
  'Limonene': { term: 'Limonen', definition: 'Limonenul este o terpenă cu parfum de citrice găsită în cânepă și fructe citrice. Poate promova dispoziția ridicată și ameliorarea stresului când este combinat cu CBD.', simple: 'Terpenă de citrice care îmbunătățește dispoziția.' },
  'Linalool': { term: 'Linalool', definition: 'Linaloolul este o terpenă florală găsită în cânepă și lavandă. Cunoscut pentru proprietățile sale calmante, poate îmbunătăți efectele relaxante ale produselor CBD.', simple: 'Terpenă calmantă găsită și în lavandă.' },
  'Lipophilic': { term: 'Lipofil', definition: 'Proprietatea liposolubilă a canabinoidelor care afectează absorbția și stocarea în organism.', simple: 'CBD se dizolvă în grăsimi, nu în apă.' },
  'Liposomal CBD': { term: 'CBD lipozomal', definition: 'CBD încapsulat în sfere mici de grăsime (lipozomi) pentru livrare și absorbție îmbunătățită.', simple: 'CBD cu absorbție îmbunătățită.' },
  'Live Resin': { term: 'Rășină vie', definition: 'Concentrat premium din cannabis congelat rapid, păstrând profilul complet de terpene.', simple: 'Concentrat CBD premium cu toate aromele păstrate.' },
  'Liver Enzymes': { term: 'Enzime hepatice', definition: 'Dozele mari de CBD pot crește enzimele hepatice - important pentru cei cu afecțiuni hepatice.', simple: 'CBD poate afecta funcția ficatului.' },
  'Maintenance Dose': { term: 'Doză de întreținere', definition: 'Cantitatea continuă de CBD care oferă beneficii consistente și susținute.', simple: 'Doza zilnică optimă de CBD.' },
  'Marijuana': { term: 'Marijuana', definition: 'Cannabis care conține mai mult de 0,3% THC, psihoactiv și restricționat legal.', simple: 'Cannabis cu THC ridicat, ilegal.' },
  'MCT Oil': { term: 'Ulei MCT', definition: 'Uleiul MCT (trigliceride cu lanț mediu) este un ulei purtător CBD popular derivat din cocos. Îmbunătățește absorbția și oferă energie rapidă corpului.', simple: 'Ulei de cocos care ajută absorbția CBD.' },
  'Meta-Analysis': { term: 'Meta-analiză', definition: 'Metodă statistică care combină rezultatele din mai multe studii pentru dovezi mai puternice.', simple: 'Analiză care combină multe studii.' },
  'mg/mL Calculation': { term: 'Calcul mg/mL', definition: 'Pentru a găsi CBD per mL: împărțiți mg totale la mL-urile sticlei. O pipetă echivalează de obicei cu 1mL.', simple: 'Cum se calculează concentrația de CBD.' },
  'Microbial Testing': { term: 'Testare microbiană', definition: 'Testare pentru bacterii, mucegai, drojdii și alte microorganisme în produsele CBD.', simple: 'Test pentru germeni în produsele CBD.' },
  'Microdosing': { term: 'Microdozare', definition: 'Administrarea unor cantități foarte mici de CBD de mai multe ori pe zi pentru efecte subtile și consistente.', simple: 'Administrarea dozelor mici de CBD frecvent.' },
  'Migraine': { term: 'Migrenă', definition: 'Tulburare severă de cefalee potențial legată de deficiența de endocanabinoizi.', simple: 'Durere de cap severă.' },
  'Milligrams': { term: 'Miligrame', definition: 'Unitatea standard de măsură pentru conținutul și dozarea CBD.', simple: 'Unitatea de măsură pentru CBD.' },
  'Minimum Effective Dose': { term: 'Doza minimă eficace', definition: 'Cea mai mică doză de CBD care produce efectele terapeutice dorite pentru un individ.', simple: 'Cea mai mică doză de CBD care funcționează.' },
  'Minor Cannabinoids': { term: 'Canabinoizi minori', definition: 'Compuși de cannabis găsiți în concentrații mai mici decât CBD sau THC, inclusiv CBG, CBN și CBC.', simple: 'Canabinoizi mai puțin abundenți.' },
  'Multiple Sclerosis': { term: 'Scleroză multiplă', definition: 'Boală autoimună a nervilor unde medicamentele pe bază de cannabis ajută la gestionarea spasticității.', simple: 'Boală a sistemului nervos.' },
  'Myrcene': { term: 'Mircen', definition: 'Mircenul este o terpenă terestră, moscată, abundentă în cânepă și hamei. Poate îmbunătăți absorbția CBD și este asociat cu efecte relaxante, sedative.', simple: 'Terpenă relaxantă abundentă în cânepă.' },
  'Nano CBD': { term: 'Nano CBD', definition: 'Particule de CBD ultra-mici cu solubilitate în apă îmbunătățită și absorbție mai rapidă.', simple: 'CBD cu particule mici pentru absorbție rapidă.' },
  'Nasal Spray': { term: 'Spray nazal', definition: 'CBD livrat prin membranele nazale pentru absorbție rapidă fără digestie.', simple: 'CBD administrat pe nas.' },
  'Nerolidol': { term: 'Nerolidol', definition: 'O terpenă lemnoasă-florală care îmbunătățește penetrarea pielii pentru aplicații topice.', simple: 'Terpenă care ajută CBD să pătrundă în piele.' },
  'Neuropathy': { term: 'Neuropatie', definition: 'Leziuni nervoase care cauzează durere, unde canabinoidele arată potențial semnificativ de ameliorare.', simple: 'Durere cauzată de nervi deteriorați.' },
  'Neuroprotection': { term: 'Neuroprotecție', definition: 'CBD arată potențial neuroprotector în studiile de cercetare, susținând posibil sănătatea creierului prin mecanismele sale antioxidante și antiinflamatoare.', simple: 'Capacitatea CBD de a proteja creierul.' },
  'Neurotransmitter': { term: 'Neurotransmițător', definition: 'Mesageri chimici cerebrali reglați de sistemul endocanabinoid.', simple: 'Substanțe chimice pentru comunicarea în creier.' },
  'Non-GMO': { term: 'Non-OMG', definition: 'Produs făcut fără organisme modificate genetic; majoritatea cânepii este natural non-OMG.', simple: 'Produs fără modificări genetice.' },
  'Novel Food': { term: 'Aliment nou', definition: 'Clasificare UE care necesită autorizare pentru alimentele neconsummate semnificativ înainte de 1997.', simple: 'Categorie specială de produse în UE.' },
  'Obesity': { term: 'Obezitate', definition: 'O afecțiune complexă care implică excesul de grăsime corporală care crește riscul de boli.', simple: 'Supraponderalitate severă.' },
  'OCD': { term: 'TOC', definition: 'O tulburare de anxietate cu gânduri și comportamente repetitive nedorite.', simple: 'Tulburare obsesiv-compulsivă.' },
  'Ocimene': { term: 'Ocimen', definition: 'Ocimenul este o terpenă dulce, ierboasă, găsită în cânepă și diverse plante. Poate avea proprietăți antivirale și antifungice și contribuie la efectul de anturaj.', simple: 'Terpenă cu proprietăți antimicrobiene potențiale.' },
  'Onset Time': { term: 'Timp de debut', definition: 'Timpul dintre consumul de CBD și momentul când efectele devin perceptibile.', simple: 'Cât durează până se simt efectele CBD.' },
  'Oral Administration': { term: 'Administrare orală', definition: 'CBD-ul oral implică înghițirea capsulelor, comestibilelor sau uleiurilor. Efectele apar în 30-90 minute, dar durează mai mult decât metodele sublinguale sau inhalate.', simple: 'Administrarea CBD prin înghițire.' },
  'Organic Hemp': { term: 'Cânepă organică', definition: 'Cânepă cultivată fără substanțe chimice sintetice, conform standardelor agricole organice.', simple: 'Cânepă crescută natural fără pesticide.' },
  'Over-the-Counter CBD': { term: 'CBD fără prescripție', definition: 'Produse CBD vândute fără prescripție ca suplimente sau cosmetice.', simple: 'CBD disponibil fără rețetă medicală.' },
  'Pain': { term: 'Durere', definition: 'Durerea este o experiență senzorială neplăcută asociată cu leziuni tisulare sau potențiale leziuni, pe care CBD o poate ajuta să o gestioneze.', simple: 'Senzație neplăcută pe care CBD o poate ameliora.' },
  "Parkinson's Disease": { term: 'Boala Parkinson', definition: 'O tulburare progresivă a sistemului nervos care afectează mișcarea și controlul motor.', simple: 'Boală care afectează mișcarea și echilibrul.' },
  'Participants': { term: 'Participanți', definition: 'Participanții sunt indivizii care se oferă voluntar să participe la un studiu de cercetare, numiți și subiecți sau voluntari.', simple: 'Oameni care participă la studii.' },
  'Peak Plasma Concentration': { term: 'Concentrație plasmatică maximă', definition: 'Nivelul maxim de CBD atins în fluxul sanguin după o doză.', simple: 'Nivelul maxim de CBD în sânge.' },
  'Peer Review': { term: 'Evaluare colegială', definition: 'Evaluarea de către experți a cercetării științifice înainte de publicare pentru a asigura calitatea.', simple: 'Verificarea studiilor de către alți experți.' },
  'Percentage to mg Conversion': { term: 'Conversie procent în mg', definition: 'Convertiți procentajul în mg înmulțind greutatea produsului cu procentajul.', simple: 'Cum se transformă procentul în miligrame.' },
  'Pesticide Testing': { term: 'Testare pesticide', definition: 'Testarea pesticidelor asigură că produsele CBD sunt lipsite de substanțe chimice agricole dăunătoare. Este o verificare critică de siguranță inclusă în analiza de laborator terță parte.', simple: 'Test pentru substanțe chimice agricole în CBD.' },
  'Pet Anxiety & CBD': { term: 'Anxietatea animalelor și CBD', definition: 'CBD poate ajuta animalele de companie cu anxietate de separare, fobie de zgomote și anxietate de călătorie.', simple: 'CBD pentru anxietatea animalelor de companie.' },
  'Pet Arthritis & CBD': { term: 'Artrita animalelor și CBD', definition: 'CBD arată promisiuni pentru durerea articulară la animale; studiul Cornell a arătat îmbunătățire la câinii cu artrită.', simple: 'CBD poate ajuta durerea articulară la animale.' },
  'Pet CBD': { term: 'CBD pentru animale', definition: 'Produse CBD formulate pentru animale cu concentrații mai mici și ingrediente sigure pentru animale.', simple: 'CBD special pentru animale de companie.' },
  'Pet CBD Dosing': { term: 'Dozare CBD pentru animale', definition: 'Punct de plecare general: 0,25-0,5mg CBD per kg greutate corporală, de două ori pe zi.', simple: 'Cât CBD să dai animalului tău.' },
  'Pet CBD Product Safety': { term: 'Siguranța produselor CBD pentru animale', definition: 'Alegeți formule specifice pentru animale; evitați xilitolul, ciocolata, strugurii, uleiurile esențiale și THC ridicat.', simple: 'Ce să eviți în CBD pentru animale.' },
  'Pet Endocannabinoid System': { term: 'Sistemul endocanabinoid al animalelor', definition: 'Câinii, pisicile și majoritatea mamiferelor au sisteme endocanabinoide similare cu cele ale oamenilor.', simple: 'Animalele au același sistem care răspunde la CBD.' },
  'Pet Seizures & CBD': { term: 'Convulsiile animalelor și CBD', definition: 'CBD poate reduce frecvența convulsiilor la câinii epileptici; cercetările au arătat reducere de 89% în unele cazuri.', simple: 'CBD poate ajuta convulsiile la animale.' },
  'Phytocannabinoid': { term: 'Fitocanabinoid', definition: 'Canabinoizi produși natural de planta de cannabis, spre deosebire de cei produși de organism sau sintetizați.', simple: 'Canabinoizi din plante.' },
  'Pinene': { term: 'Pinen', definition: 'Pinenul este o terpenă cu parfum de pin găsită în cânepă și conifere. Poate susține vigilența și funcția respiratorie, completând efectele CBD.', simple: 'Terpenă de pin care poate ajuta concentrarea.' },
  'Placebo': { term: 'Placebo', definition: 'Un placebo este un tratament inactiv (precum o pastilă de zahăr) folosit în studiile clinice pentru a compara cu tratamentul real testat.', simple: 'Substanță inactivă folosită pentru comparație în studii.' },
  'Placebo Effect': { term: 'Efect placebo', definition: 'Îmbunătățire experimentată din credința într-un tratament, nu din tratamentul în sine.', simple: 'Îmbunătățire din credință, nu din medicament.' },
  'Potency Testing': { term: 'Testare potență', definition: 'Testarea potenței măsoară concentrația de canabinoizi în produsele CBD. Verifică dacă produsele conțin cantitatea de CBD declarată pe etichetă.', simple: 'Test care verifică cât CBD conține produsul.' },
  'PPARs': { term: 'PPARs', definition: 'Receptori nucleari care reglează metabolismul și inflamația, activați de unii canabinoizi.', simple: 'Receptori care răspund la canabinoizi.' },
  'Pre-Rolls': { term: 'Pre-rulaje', definition: 'Țigări de floare de cânepă gata de fumat pentru consum convenabil prin inhalare.', simple: 'Țigări CBD gata făcute.' },
  'Preclinical Study': { term: 'Studiu preclinic', definition: 'Faza de cercetare înainte de studiile pe oameni, inclusiv studii de laborator și pe animale.', simple: 'Cercetare înainte de testele pe oameni.' },
  'Prescription CBD': { term: 'CBD cu prescripție', definition: 'CBD de grad farmaceutic care necesită prescripție de la medic.', simple: 'CBD disponibil doar cu rețetă.' },
  'Psoriasis': { term: 'Psoriazis', definition: 'O afecțiune autoimună a pielii care provoacă acumulare rapidă de celule cutanate și plăci solzoase.', simple: 'Boală a pielii cu pete solzoase.' },
  'Psychoactive vs Intoxicating': { term: 'Psihoactiv vs Intoxicant', definition: 'Psihoactiv afectează mintea (precum cofeina); intoxicant afectează funcția (precum alcoolul).', simple: 'Diferența dintre a afecta mintea și a te îmbăta.' },
  'PTSD': { term: 'TSPT', definition: 'Tulburare legată de traumă în care canabinoidele pot reduce anxietatea și coșmarurile.', simple: 'Tulburare de stres post-traumatic.' },
  'QR Code Verification': { term: 'Verificare cod QR', definition: 'Cod scanabil care face legătura cu rezultatele de laborator pentru lotul dvs. specific; lipsa codului QR este un semnal de alarmă.', simple: 'Cod pentru verificarea calității produsului.' },
  'Quality Assurance': { term: 'Asigurarea calității', definition: 'Asigurarea calității CBD include testare, documentație și controale de fabricație. Căutați mărci cu procese QA transparente și testare terță parte.', simple: 'Procese care asigură calitatea produsului.' },
  'Randomized Controlled Trial': { term: 'Studiu randomizat controlat', definition: 'Un RCT este un studiu în care participanții sunt repartizați aleatoriu să primească fie tratamentul testat, fie un placebo/control, considerat standardul de aur pentru cercetarea medicală.', simple: 'Cel mai riguros tip de studiu medical.' },
  'Remediation': { term: 'Remediere', definition: 'Procesul de eliminare sau reducere a THC din extractele de cânepă pentru conformitatea legală.', simple: 'Proces de eliminare a THC pentru legalitate.' },
  'Residual Solvents': { term: 'Solvenți reziduali', definition: 'Testarea solvenților reziduali asigură că extractele CBD sunt lipsite de substanțe chimice de extracție precum butan, propan și etanol care pot rămâne după procesare.', simple: 'Test pentru substanțe chimice rămase din extracție.' },
  'Restless Leg Syndrome': { term: 'Sindromul picioarelor neliniștite', definition: 'O afecțiune neurologică care provoacă disconfort la nivelul picioarelor; unii pacienți raportează că CBD oferă ameliorare.', simple: 'Afecțiune cu nevoia de a mișca picioarele.' },
  'Results': { term: 'Rezultate', definition: 'Rezultatele sunt constatările și rezultatele unui studiu de cercetare care arată dacă tratamentul a avut efect.', simple: 'Ce a descoperit studiul.' },
  'Retrograde Signaling': { term: 'Semnalizare retrogradă', definition: 'Metoda de comunicare inversă utilizată de endocanabinoizi în sistemul nervos.', simple: 'Mod special în care funcționează endocanabinoidele.' },
  'Rheumatoid Arthritis': { term: 'Poliartrită reumatoidă', definition: 'O boală autoimună care provoacă inflamație articulară cronică, durere și potențiale leziuni articulare.', simple: 'Artrită cauzată de sistemul imunitar.' },
  'Rosin': { term: 'Colofoniu', definition: 'Concentrat fără solvenți făcut cu căldură și presiune, fără substanțe chimice necesare.', simple: 'Concentrat CBD natural, fără solvenți.' },
  'RSO': { term: 'RSO', definition: 'Extract de cannabis cu spectru complet foarte concentrat, de obicei bogat în THC.', simple: 'Ulei de cannabis foarte concentrat.' },
  'Schizophrenia': { term: 'Schizofrenie', definition: 'O tulburare mentală gravă care afectează gândirea, emoțiile și comportamentul.', simple: 'Boală mintală gravă.' },
  'Seed-to-Sale Tracking': { term: 'Urmărire de la sămânță la vânzare', definition: 'Sisteme de reglementare care urmăresc produsele de cânepă de la cultivare până la vânzarea cu amănuntul.', simple: 'Sistem de urmărire a produselor CBD.' },
  'Serotonin Receptors (5-HT1A)': { term: 'Receptori de serotonină (5-HT1A)', definition: 'Un subtip de receptor de serotonină activat direct de CBD, explicând potențial efectele sale anti-anxietate.', simple: 'Receptor prin care CBD reduce anxietatea.' },
  'Serving Size': { term: 'Mărimea porției', definition: 'Mărimea porției CBD este cantitatea recomandată per utilizare, de obicei listată pe etichetele produselor. Ajută consumatorii să calculeze aportul zilnic total de CBD.', simple: 'Cantitatea recomandată de CBD per doză.' },
  'Shatter': { term: 'Shatter', definition: 'Concentrat de cannabis ca sticla, foarte pur, care se sparge când este rupt.', simple: 'Concentrat CBD cu textură sticloasă.' },
  'Shelf Life': { term: 'Termen de valabilitate', definition: 'Cât timp rămâne eficient un produs CBD, de obicei 1-2 ani dacă este depozitat corect.', simple: 'Cât timp durează produsul CBD.' },
  'Short Path Distillation': { term: 'Distilare cu cale scurtă', definition: 'O tehnică de distilare în vid pentru crearea distilatelor de canabinoizi foarte concentrați.', simple: 'Metodă de purificare avansată pentru CBD.' },
  'Side Effects': { term: 'Efecte secundare', definition: 'Efecte nedorite care pot apărea la utilizarea CBD, de obicei ușoare.', simple: 'Efecte nedorite posibile de la CBD.' },
  'Sleep': { term: 'Somn', definition: 'Somnul este o stare naturală de odihnă esențială pentru sănătate. CBD a fost studiat pentru beneficii potențiale în îmbunătățirea calității și duratei somnului.', simple: 'CBD poate ajuta la îmbunătățirea somnului.' },
  'Softgels': { term: 'Capsule moi', definition: 'Capsule de gelatină moale care conțin ulei CBD lichid pentru o absorbție potențial mai bună.', simple: 'Capsule CBD ușor de înghițit.' },
  'Solventless Extraction': { term: 'Extracție fără solvenți', definition: 'Metode de extracție folosind doar căldură, presiune sau apă - fără solvenți chimici.', simple: 'Extracție naturală fără chimicale.' },
  'Starting Dose': { term: 'Doză inițială', definition: 'Cantitatea inițială recomandată de CBD pentru utilizatorii noi, de obicei 5-20mg zilnic.', simple: 'Doza cu care să începeți.' },
  'Strain': { term: 'Soi', definition: 'O varietate specifică de cannabis cu caracteristici distincte, fiind înlocuită de „cultivar".', simple: 'Tip specific de cânepă.' },
  'Sublingual': { term: 'Sublingual', definition: 'Administrarea sublinguală a CBD implică ținerea uleiului sub limbă timp de 60-90 secunde. Această metodă de livrare oferă absorbție mai rapidă decât înghițirea.', simple: 'Administrare sub limbă pentru absorbție rapidă.' },
  'Substance Use Disorder': { term: 'Tulburare de consum de substanțe', definition: 'O afecțiune care implică utilizarea compulsivă a substanțelor în ciuda consecințelor dăunătoare.', simple: 'Problemă cu utilizarea drogurilor sau alcoolului.' },
  'Supercritical Extraction': { term: 'Extracție supercritică', definition: 'Folosind CO₂ în stare supercritică (hibrid lichid-gaz) pentru extracția precisă a canabinoidelor.', simple: 'Metodă avansată de extracție cu CO2.' },
  'Suppository': { term: 'Supozitor', definition: 'Supozitoarele CBD livrează canabidiol rectal sau vaginal pentru absorbție directă. Ocolesc metabolismul de prim pasaj pentru efecte mai rapide și mai puternice.', simple: 'CBD administrat rectal pentru absorbție directă.' },
  'Symptoms': { term: 'Simptome', definition: 'Simptomele sunt semne fizice sau mentale ale unei afecțiuni pe care participanții le experimentează, pe care cercetătorii le măsoară pentru a evalua efectele tratamentului.', simple: 'Semne ale unei afecțiuni măsurate în studii.' },
  'Systematic Review': { term: 'Revizuire sistematică', definition: 'Analiză cuprinzătoare a tuturor cercetărilor disponibile pe un subiect folosind metodologie riguroasă.', simple: 'Analiză completă a tuturor studiilor pe un subiect.' },
  'Terpene Profile': { term: 'Profil de terpene', definition: 'Combinația specifică și concentrația de terpene într-un produs de cannabis.', simple: 'Lista terpenelor dintr-un produs CBD.' },
  'Terpinolene': { term: 'Terpinolen', definition: 'Terpinolenul este o terpenă florală, cu parfum de pin, găsită în cânepă și arbore de ceai. Poate avea proprietăți sedative și antioxidante și contribuie la efectul de anturaj.', simple: 'Terpenă cu efecte relaxante potențiale.' },
  'Tetrahydrocannabinol': { term: 'Tetrahidrocanabinol', definition: 'Compusul psihoactiv principal din cannabis care produce senzația de „high" prin legarea de receptorii CB1.', simple: 'THC - compusul care produce efecte psihotrope.' },
  'THC-Free': { term: 'Fără THC', definition: 'Produse cu niveluri nedetectabile de THC, importante pentru testele de droguri și țările cu toleranță zero.', simple: 'Produse CBD fără niciun THC.' },
  'THC-O': { term: 'THC-O', definition: 'O formă sintetică, acetilată de THC, raportată ca fiind mai potentă decât THC-ul natural.', simple: 'Formă sintetică puternică de THC.' },
  'THCA': { term: 'THCA', definition: 'THCA (acid tetrahidrocanabinolic) este precursorul THC non-psihoactiv găsit în cannabisul crud. Se convertește în THC psihoactiv când este încălzit sau îmbătrânit.', simple: 'Forma brută a THC din planta proaspătă.' },
  'THCV': { term: 'THCV', definition: 'THCV (tetrahidrocanabivarin) este un canabinoid care poate suprima apetitul și oferi efecte energizante. Are o durată mai scurtă decât THC-ul obișnuit.', simple: 'Canabinoid care poate reduce apetitul.' },
  'Therapeutic Window': { term: 'Fereastră terapeutică', definition: 'Intervalul de doze în care CBD oferă beneficii fără efecte secundare semnificative.', simple: 'Doza optimă de CBD pentru beneficii.' },
  'Third-Party Testing': { term: 'Testare terță parte', definition: 'Testarea terță parte de către laboratoare independente verifică conținutul și puritatea produselor CBD. Verificați întotdeauna un Certificat de analiză actual înainte de cumpărare.', simple: 'Verificare independentă a calității CBD.' },
  'Titration': { term: 'Titrare', definition: 'Titrarea este procesul de ajustare treptată a dozei de CBD pentru a găsi cantitatea optimă. Începeți cu puțin și creșteți lent monitorizând efectele.', simple: 'Găsirea dozei optime prin ajustare treptată.' },
  'Tolerance': { term: 'Toleranță', definition: 'Răspuns redus la CBD în timp, necesitând doze mai mari pentru același efect.', simple: 'Nevoia de mai mult CBD pentru același efect.' },
  'Topical': { term: 'Topic', definition: 'Topicele CBD sunt creme, balsamuri și loțiuni aplicate direct pe piele pentru ameliorare localizată. Oferă beneficii țintite fără a intra în fluxul sanguin.', simple: 'Produse CBD aplicate pe piele.' },
  'Tourette Syndrome': { term: 'Sindrom Tourette', definition: 'O tulburare neurologică caracterizată de mișcări și vocalizări repetitive, involuntare (ticuri).', simple: 'Afecțiune cu ticuri involuntare.' },
  'Transdermal': { term: 'Transdermal', definition: 'Plasturi sau geluri CBD care penetrează pielea pentru a intra în fluxul sanguin pentru eliberare susținută.', simple: 'CBD care trece prin piele în sânge.' },
  'Treatment': { term: 'Tratament', definition: 'Tratamentul se referă la intervenția studiată, cum ar fi administrarea CBD, pentru a gestiona sau îmbunătăți o afecțiune de sănătate.', simple: 'Ce se testează într-un studiu.' },
  'Trichome': { term: 'Tricom', definition: 'Glande mici ca niște cristale pe cannabis care produc canabinoizi și terpene.', simple: 'Structuri pe planta de cânepă care produc CBD.' },
  'TRPV1 Receptor': { term: 'Receptor TRPV1', definition: 'Un receptor canal ionic care răspunde la căldură, capsaicină și canabinoizi, implicat în percepția durerii.', simple: 'Receptor al durerii cu care interacționează CBD.' },
  'Valencene': { term: 'Valencen', definition: 'O terpenă dulce de citrice cu proprietăți antiinflamatoare și protectoare pentru piele.', simple: 'Terpenă de portocală cu beneficii pentru piele.' },
  'Vaporization': { term: 'Vaporizare', definition: 'Încălzirea CBD pentru a elibera vapori fără combustie, considerată mai sigură decât fumatul.', simple: 'Metodă de inhalare a CBD fără fum.' },
  'Vegan CBD': { term: 'CBD vegan', definition: 'Produse CBD fără ingrediente de origine animală; verificați gelatina, ceara de albine sau lanolina.', simple: 'CBD fără ingrediente animale.' },
  'Veterinary Cannabis Medicine': { term: 'Medicină veterinară cu cannabis', definition: 'Domeniu emergent care studiază canabinoidele pentru sănătatea animală, limitat de restricții legale.', simple: 'Utilizarea CBD în medicina veterinară.' },
  'Water-Soluble CBD': { term: 'CBD solubil în apă', definition: 'CBD-ul solubil în apă folosește tehnologia nanoemulsiei pentru biodisponibilitate îmbunătățită. Se amestecă ușor cu băuturile și se absoarbe mai repede decât produsele CBD pe bază de ulei.', simple: 'CBD care se amestecă în apă pentru absorbție rapidă.' },
  'Wax': { term: 'Ceară', definition: 'Concentrat de cannabis moale, opac, cu textură ceroasă pentru dabbing.', simple: 'Tip de concentrat CBD cu textură ceroasă.' },
  'Winterization': { term: 'Winterizare', definition: 'Un proces de purificare folosind temperaturi scăzute pentru a elimina grăsimile și cerurile din extractul CBD.', simple: 'Proces de purificare la rece a CBD.' }
};

// Function to create Romanian slug from Romanian term
function createRomanianSlug(romanianTerm) {
  return romanianTerm
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

// Function to translate a glossary term
function translateGlossaryTerm(term) {
  const translation = romanianTranslations[term.term];
  
  if (translation) {
    return {
      term_id: term.id,
      language: 'ro',
      term: translation.term,
      slug: createRomanianSlug(translation.term),
      definition: translation.definition,
      simple_definition: translation.simple
    };
  }
  
  // Fallback - keep original with Romanian labels
  return {
    term_id: term.id,
    language: 'ro',
    term: term.term,
    slug: term.slug,
    definition: term.short_definition,
    simple_definition: term.short_definition
  };
}

async function insertTranslations() {
  console.log('Starting glossary translation process...');
  
  const translations = [];
  let translated = 0;
  let fallback = 0;
  
  // Process each glossary term
  for (const term of glossary) {
    const translation = translateGlossaryTerm(term);
    translations.push(translation);
    
    if (romanianTranslations[term.term]) {
      translated++;
    } else {
      fallback++;
      console.log(`Fallback for: ${term.term}`);
    }
  }

  console.log(`Created ${translations.length} translations (${translated} translated, ${fallback} fallback). Inserting into database...`);

  // Insert in batches of 50 to avoid database limits
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < translations.length; i += batchSize) {
    const batch = translations.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('glossary_translations')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      throw error;
    }

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${translations.length} translations`);
  }

  console.log('✅ All glossary translations inserted successfully!');
  return translations.length;
}

async function verifyCount() {
  console.log('Verifying translation count...');
  
  const { count, error } = await supabase
    .from('glossary_translations')
    .select('id', { count: 'exact', head: true })
    .eq('language', 'ro');

  if (error) {
    console.error('Error verifying count:', error);
    return;
  }

  console.log(`✅ Database contains ${count} Romanian glossary translations`);
  return count;
}

// Main execution
async function main() {
  try {
    const insertedCount = await insertTranslations();
    const verifiedCount = await verifyCount();
    
    if (insertedCount === verifiedCount && verifiedCount === 263) {
      console.log('🎉 Glossary translation task completed successfully!');
      console.log(`- Translated: ${insertedCount} terms`);
      console.log(`- Verified: ${verifiedCount} terms in database`);
      console.log('- Language: Romanian (ro)');
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
