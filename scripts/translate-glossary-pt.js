#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Load English glossary
const glossaryPath = path.join(__dirname, 'data', 'glossary_en.json');
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));

console.log(`Loaded ${glossary.length} glossary terms to translate`);

// European Portuguese translations for glossary terms
const portugueseTranslations = {
  // Terms - alphabetical order
  '2-AG': { term: '2-AG', definition: 'O 2-AG (2-araquidonoilglicerol) é um endocanabinóide que ativa os recetores CB1 e CB2. Desempenha papéis fundamentais na função imunitária e na sinalização da dor.', simple: 'Um canabinóide natural produzido pelo corpo que ajuda a regular a dor e a função imunitária.' },
  '510 Thread Cartridge': { term: 'Cartucho 510', definition: 'Os cartuchos 510 são recipientes pré-cheios com óleo de CBD que utilizam a ligação de rosca 510, padrão da indústria. Compatíveis com a maioria das baterias de vaporizadores.', simple: 'Recipientes pré-cheios de óleo de CBD com ligação padrão para vaporizadores.' },
  'Acne': { term: 'Acne', definition: 'Uma condição cutânea que causa borbulhas, tipicamente resultante de folículos capilares obstruídos. O CBD pode ajudar através das suas propriedades anti-inflamatórias.', simple: 'Condição da pele que causa borbulhas, onde o CBD pode ajudar a reduzir a inflamação.' },
  'Allosteric Modulation': { term: 'Modulação Alostérica', definition: 'Quando um composto altera a função de um recetor ligando-se a um local secundário em vez do local ativo principal. O CBD atua como modulador alostérico em alguns recetores.', simple: 'Forma como o CBD pode modificar a atividade dos recetores ligando-se a locais alternativos.' },
  'ALS': { term: 'ELA', definition: 'A Esclerose Lateral Amiotrófica (ELA) é uma doença neurodegenerativa progressiva que afeta as células nervosas que controlam os músculos voluntários.', simple: 'Doença grave que afeta os nervos que controlam o movimento muscular.' },
  "Alzheimer's Disease": { term: 'Doença de Alzheimer', definition: 'Uma doença cerebral progressiva que causa perda de memória e declínio cognitivo. O CBD está a ser estudado pelos seus potenciais efeitos neuroprotetores.', simple: 'Doença cerebral que causa perda de memória, onde o CBD está a ser investigado.' },
  'Anandamide': { term: 'Anandamida', definition: 'A anandamida é um endocanabinóide produzido naturalmente, frequentemente chamado de "molécula da felicidade". O CBD pode aumentar os níveis de anandamida ao inibir a sua degradação.', simple: 'Canabinóide natural do corpo associado ao bem-estar, que o CBD pode ajudar a preservar.' },
  'Anti-inflammatory': { term: 'Anti-inflamatório', definition: 'Anti-inflamatório refere-se a substâncias que reduzem a inflamação. O CBD demonstrou propriedades anti-inflamatórias em estudos ao modular as respostas imunitárias.', simple: 'Capacidade do CBD de reduzir a inflamação no corpo.' },
  'Anticonvulsant': { term: 'Anticonvulsivo', definition: 'Uma substância que previne convulsões. O CBD está aprovado pelas autoridades reguladoras para certas condições epiléticas.', simple: 'Propriedade do CBD de ajudar a prevenir convulsões, aprovada para epilepsia.' },
  'Anxiety': { term: 'Ansiedade', definition: 'A ansiedade é uma condição de saúde mental caracterizada por preocupação persistente, medo ou inquietação que pode interferir com a vida diária.', simple: 'Condição de preocupação excessiva onde o CBD pode ajudar a proporcionar alívio.' },
  'Anxiolytic': { term: 'Ansiolítico', definition: 'Ansiolítico significa redutor de ansiedade. O CBD demonstrou propriedades ansiolíticas na investigação, potencialmente ajudando a gerir a ansiedade através de múltiplos mecanismos.', simple: 'Propriedade do CBD de ajudar a reduzir os sintomas de ansiedade.' },
  'Appetite Changes': { term: 'Alterações do Apetite', definition: 'O CBD pode aumentar ou diminuir o apetite dependendo do indivíduo e da dose. Monitorize as suas respostas ao iniciar a suplementação.', simple: 'O CBD pode afetar o apetite de formas diferentes em cada pessoa.' },
  'Arthritis': { term: 'Artrite', definition: 'O CBD pode ajudar nos sintomas de artrite através de efeitos anti-inflamatórios. Os produtos tópicos de CBD são populares para o desconforto articular, embora a investigação ainda esteja em curso.', simple: 'Condição articular onde os produtos de CBD podem ajudar a reduzir a inflamação e a dor.' },
  'Autism Spectrum Disorder': { term: 'Perturbação do Espectro do Autismo', definition: 'Uma condição de desenvolvimento que afeta a comunicação e o comportamento, com investigação emergente sobre o CBD.', simple: 'Condição de desenvolvimento onde o CBD está a ser investigado para sintomas específicos.' },
  'Autoflower': { term: 'Autofloração', definition: 'Variedades de cânhamo que florescem automaticamente com base na idade em vez da exposição à luz.', simple: 'Tipo de planta de cânhamo que floresce sem depender das horas de luz.' },
  'Batch Number': { term: 'Número de Lote', definition: 'Os números de lote identificam produções específicas de produtos de CBD. Permitem aos consumidores verificar resultados laboratoriais e possibilitam recolhas se surgirem problemas de qualidade.', simple: 'Código que identifica uma produção específica de CBD para rastreabilidade.' },
  'Batch Testing': { term: 'Teste de Lote', definition: 'O teste de lote verifica se cada produção de produtos de CBD cumpre os padrões de qualidade. Procure COAs específicos do lote para informações mais precisas.', simple: 'Análise de cada lote de produção para garantir qualidade e segurança.' },
  'Bioavailability': { term: 'Biodisponibilidade', definition: 'A biodisponibilidade mede quanto CBD entra efetivamente na corrente sanguínea. Varia por método: sublingual (20-35%), oral (6-20%), inalado (30-40%).', simple: 'Percentagem de CBD que o corpo consegue realmente absorver e utilizar.' },
  'Biomass': { term: 'Biomassa', definition: 'Material vegetal bruto de cânhamo utilizado para extração de CBD.', simple: 'Matéria-prima de cânhamo usada para extrair CBD.' },
  'Biphasic Effect': { term: 'Efeito Bifásico', definition: 'Quando o CBD produz efeitos diferentes em doses baixas versus doses altas. Doses baixas podem ser estimulantes enquanto doses altas podem ser sedativas.', simple: 'O CBD pode ter efeitos diferentes dependendo da dose utilizada.' },
  'Bipolar Disorder': { term: 'Perturbação Bipolar', definition: 'Uma condição de saúde mental que causa oscilações extremas de humor entre depressão e mania.', simple: 'Condição de humor com altos e baixos extremos.' },
  'Bisabolol': { term: 'Bisabolol', definition: 'O bisabolol é um terpeno floral encontrado no cânhamo e na camomila. Pode ter propriedades anti-inflamatórias e cicatrizantes, sendo popular em tópicos de CBD.', simple: 'Terpeno suave com propriedades calmantes para a pele.' },
  'Blood Thinner Interaction': { term: 'Interação com Anticoagulantes', definition: 'O CBD pode aumentar os níveis de anticoagulantes no sangue, aumentando o risco de hemorragia - consulte sempre o seu médico.', simple: 'O CBD pode intensificar o efeito de medicamentos para diluir o sangue.' },
  'Blood-Brain Barrier': { term: 'Barreira Hematoencefálica', definition: 'Membrana protetora do cérebro que os canabinóides podem atravessar devido à sua natureza lipossolúvel.', simple: 'Proteção do cérebro que o CBD consegue atravessar.' },
  'Body Weight Dosing': { term: 'Dosagem por Peso Corporal', definition: 'Uma abordagem de dosagem que calcula as quantidades de CBD com base no peso corporal.', simple: 'Método de calcular a dose de CBD baseado no peso da pessoa.' },
  'Borneol': { term: 'Borneol', definition: 'Um terpeno mentolado que melhora a absorção de compostos através da barreira hematoencefálica.', simple: 'Terpeno que pode ajudar outros compostos a chegar ao cérebro.' },
  'Broad Spectrum': { term: 'Espectro Amplo', definition: 'O CBD de espectro amplo inclui múltiplos canabinóides e terpenos, mas com o THC totalmente removido. Oferece benefícios do efeito entourage sem qualquer teor de THC.', simple: 'CBD com vários compostos benéficos mas sem THC.' },
  'Budder': { term: 'Budder', definition: 'Concentrado de canábis cremoso, com textura de manteiga, que retém alto teor de terpenos.', simple: 'Tipo de concentrado de CBD com textura cremosa.' },
  'Camphene': { term: 'Canfeno', definition: 'Um terpeno terroso com aroma de abeto que pode apoiar a saúde cardiovascular.', simple: 'Terpeno com potenciais benefícios para o coração.' },
  'Cannabichromene': { term: 'Canabicrómeno', definition: 'Um canabinóide não psicoativo que pode ter propriedades anti-inflamatórias e antidepressivas.', simple: 'Canabinóide (CBC) com potenciais benefícios terapêuticos.' },
  'Cannabidiol': { term: 'Canabidiol', definition: 'Um canabinóide não psicoativo da canábis com potenciais benefícios terapêuticos, incluindo alívio da ansiedade e efeitos anti-inflamatórios.', simple: 'O CBD, principal composto estudado pelo seu potencial terapêutico.' },
  'Cannabigerol': { term: 'Canabigerol', definition: 'O "canabinóide mãe" que serve como precursor para outros canabinóides como o CBD e o THC.', simple: 'O CBG, canabinóide que origina CBD e THC na planta.' },
  'Cannabinoid Profile': { term: 'Perfil de Canabinóides', definition: 'A combinação e concentração específicas de canabinóides num produto.', simple: 'Lista de todos os canabinóides presentes num produto de CBD.' },
  'Cannabinol': { term: 'Canabinol', definition: 'Um canabinóide ligeiramente psicoativo formado pela oxidação do THC, conhecido pelos seus potenciais efeitos sedativos.', simple: 'O CBN, canabinóide associado ao sono e relaxamento.' },
  'Cannabis Indica': { term: 'Cannabis Indica', definition: 'Uma variedade de canábis tradicionalmente associada a efeitos relaxantes e sedativos.', simple: 'Tipo de canábis geralmente associado a efeitos calmantes.' },
  'Cannabis Oil': { term: 'Óleo de Canábis', definition: 'Termo geral para óleos derivados da canábis; pode significar óleo de CBD, óleo de THC, ou ambos.', simple: 'Termo genérico para qualquer óleo extraído da planta de canábis.' },
  'Cannabis Sativa': { term: 'Cannabis Sativa', definition: 'Uma espécie de canábis tradicionalmente associada a efeitos estimulantes e energizantes.', simple: 'Tipo de canábis geralmente associado a efeitos energizantes.' },
  'Carrier Oil': { term: 'Óleo Veicular', definition: 'Óleos veiculares como MCT, semente de cânhamo ou azeite ajudam a transportar o CBD e melhorar a sua absorção. Também permitem dosagem precisa em produtos de tintura.', simple: 'Óleo base que ajuda o corpo a absorver melhor o CBD.' },
  'Caryophyllene': { term: 'Cariofileno', definition: 'O beta-cariofileno é um terpeno picante que se liga de forma única aos recetores CB2. Encontrado no cânhamo e na pimenta preta, pode potenciar efeitos anti-inflamatórios.', simple: 'Terpeno especiado que pode ajudar a reduzir a inflamação.' },
  'CB1 Receptor': { term: 'Recetor CB1', definition: 'Os recetores CB1 encontram-se principalmente no cérebro e sistema nervoso central. O THC liga-se diretamente ao CB1, enquanto o CBD tem um efeito modulador indireto.', simple: 'Recetores cerebrais com os quais os canabinóides interagem.' },
  'CB2 Receptor': { term: 'Recetor CB2', definition: 'Os recetores CB2 localizam-se principalmente nas células imunitárias e tecidos periféricos. Desempenham papéis importantes na regulação da inflamação e resposta imunitária.', simple: 'Recetores do sistema imunitário que respondem aos canabinóides.' },
  'CBD': { term: 'CBD', definition: 'O CBD (canabidiol) é um composto não intoxicante da planta de canábis, estudado pelos seus potenciais benefícios terapêuticos, incluindo alívio da dor, redução da ansiedade e efeitos anti-inflamatórios.', simple: 'Composto não intoxicante da canábis com múltiplos potenciais benefícios para a saúde.' },
  'CBD Balm': { term: 'Bálsamo de CBD', definition: 'Um produto tópico de CBD espesso e à base de óleo que cria uma barreira protetora na pele.', simple: 'Produto espesso de CBD para aplicar diretamente na pele.' },
  'CBD Bath Bombs': { term: 'Bombas de Banho com CBD', definition: 'Produtos efervescentes para banho que libertam CBD na água para absorção pela pele.', simple: 'Produtos para o banho que libertam CBD para relaxamento.' },
  'CBD Beverages': { term: 'Bebidas com CBD', definition: 'Bebidas infundidas com CBD hidrossolúvel utilizando tecnologia de nanoemulsão.', simple: 'Bebidas contendo CBD para consumo conveniente.' },
  'CBD Capsules': { term: 'Cápsulas de CBD', definition: 'Suplementos orais de CBD em forma de comprimido, proporcionando dosagem precisa e sem sabor.', simple: 'Comprimidos de CBD fáceis de tomar com dose exata.' },
  'CBD Coffee': { term: 'Café com CBD', definition: 'Produtos de café infundidos com CBD, potencialmente equilibrando os efeitos estimulantes da cafeína.', simple: 'Café com CBD adicionado para um efeito mais equilibrado.' },
  'CBD Cream': { term: 'Creme de CBD', definition: 'Um produto tópico à base de água para aplicar CBD diretamente na pele.', simple: 'Creme para aplicação de CBD na pele.' },
  'CBD Dosage Calculator': { term: 'Calculadora de Dosagem de CBD', definition: 'Ferramenta para estimar a dose inicial com base no peso corporal e condição; ajuste conforme a resposta.', simple: 'Ferramenta para ajudar a determinar a dose adequada de CBD.' },
  'CBD for Cats': { term: 'CBD para Gatos', definition: 'CBD para ansiedade e dor felina; os gatos metabolizam de forma diferente, por isso utilize produtos específicos para gatos.', simple: 'Produtos de CBD formulados especificamente para gatos.' },
  'CBD for Dogs': { term: 'CBD para Cães', definition: 'O CBD pode ajudar cães com ansiedade, dor e convulsões; certifique-se de que os produtos têm THC mínimo.', simple: 'Produtos de CBD seguros e formulados para cães.' },
  'CBD Gummies': { term: 'Gomas de CBD', definition: 'Doces comestíveis infundidos com CBD que oferecem doses convenientes e pré-medidas com efeitos mais duradouros.', simple: 'Doces de CBD fáceis de consumir com doses exatas.' },
  'CBD Isolate': { term: 'Isolado de CBD', definition: 'O isolado de CBD é a forma mais pura de canabidiol disponível, com 99%+ de pureza. Todos os outros canabinóides, terpenos e compostos vegetais são completamente removidos.', simple: 'CBD puro a 99%, sem outros compostos da planta.' },
  'CBD Marketing Claims': { term: 'Alegações de Marketing do CBD', definition: 'O CBD não pode legalmente alegar curar ou tratar doenças; esteja atento a alegações de "cura milagrosa".', simple: 'Regras sobre o que os produtos de CBD podem legalmente afirmar.' },
  'CBD Patch': { term: 'Adesivo de CBD', definition: 'Adesivo que liberta CBD através da pele durante períodos prolongados.', simple: 'Penso que liberta CBD lentamente através da pele.' },
  'CBD Salve': { term: 'Pomada de CBD', definition: 'Um produto tópico de CBD suave à base de óleo, similar ao bálsamo mas com consistência mais macia.', simple: 'Pomada de CBD mais suave para aplicação tópica.' },
  'CBD Tincture': { term: 'Tintura de CBD', definition: 'Extrato líquido de CBD tomado debaixo da língua para absorção rápida e dosagem precisa.', simple: 'Gotas de CBD líquido para tomar sob a língua.' },
  'CBDA': { term: 'CBDA', definition: 'O CBDA (ácido canabidiólico) é a forma ácida e crua do CBD encontrada no cânhamo fresco. Converte-se em CBD através do calor num processo chamado descarboxilação.', simple: 'Forma natural do CBD na planta que se transforma em CBD com calor.' },
  'CBDV': { term: 'CBDV', definition: 'O CBDV (canabidivarina) é um canabinóide não psicoativo semelhante ao CBD. A investigação inicial sugere potenciais benefícios para náuseas e condições neurológicas.', simple: 'Canabinóide relacionado com o CBD com potenciais benefícios únicos.' },
  'CBE': { term: 'CBE', definition: 'Um canabinóide menor formado quando o CBD se degrada, tipicamente encontrado em produtos de canábis envelhecidos.', simple: 'Canabinóide que se forma quando o CBD envelhece.' },
  'Certificate of Analysis': { term: 'Certificado de Análise', definition: 'Um Certificado de Análise (COA) é um relatório laboratorial independente que mostra o conteúdo de canabinóides, potência e resultados de testes de contaminantes para produtos de CBD.', simple: 'Documento que prova a qualidade e conteúdo de um produto de CBD.' },
  'cGMP (Current Good Manufacturing Practice)': { term: 'cGMP (Boas Práticas de Fabrico)', definition: 'Normas de fabrico farmacêutico que garantem qualidade e consistência do produto.', simple: 'Padrões de qualidade para fabrico de produtos de CBD.' },
  'Chemotherapy-Induced Nausea': { term: 'Náuseas Induzidas pela Quimioterapia', definition: 'Náuseas relacionadas com o tratamento onde os canabinóides são antieméticos aprovados em vários países.', simple: 'Náuseas do tratamento de cancro onde o CBD pode ajudar.' },
  'Chromatography': { term: 'Cromatografia', definition: 'Uma técnica de separação utilizada para purificar canabinóides ou remover compostos indesejados do extrato de cânhamo.', simple: 'Método para purificar e separar compostos do CBD.' },
  'Chronic Pain': { term: 'Dor Crónica', definition: 'O CBD pode ajudar a gerir a dor crónica através de efeitos anti-inflamatórios e interação com recetores de dor. Muitos utilizadores relatam alívio de dor contínua.', simple: 'Dor persistente onde o CBD pode proporcionar alívio.' },
  'Clinical Trial': { term: 'Ensaio Clínico', definition: 'Estudo de investigação controlado que testa tratamentos em participantes humanos.', simple: 'Estudo científico que testa tratamentos em pessoas.' },
  'CO2 Extraction': { term: 'Extração por CO2', definition: 'A extração por CO2 utiliza dióxido de carbono pressurizado para extrair CBD das plantas de cânhamo. Produz extratos puros e sem solventes, sendo o padrão de ouro da indústria.', simple: 'Método premium de extração de CBD usando CO2 pressurizado.' },
  'Cold Press Extraction': { term: 'Extração a Frio', definition: 'Prensagem de sementes de cânhamo a baixas temperaturas para extrair óleo - processamento mínimo.', simple: 'Método suave de extrair óleo de sementes de cânhamo.' },
  'Compassionate Use': { term: 'Uso Compassivo', definition: 'Programas que permitem acesso a tratamentos não aprovados para doentes gravemente doentes.', simple: 'Acesso especial a tratamentos para casos médicos graves.' },
  'Contamination': { term: 'Contaminação', definition: 'Presença de substâncias nocivas indesejadas em produtos de CBD.', simple: 'Presença de impurezas prejudiciais em produtos de CBD.' },
  'Contraindication': { term: 'Contraindicação', definition: 'Uma condição ou fator que torna o uso de CBD desaconselhável ou arriscado.', simple: 'Situação em que o uso de CBD não é recomendado.' },
  'Controlled Substance': { term: 'Substância Controlada', definition: 'Substâncias controladas são reguladas pelas autoridades. Enquanto a canábis está restrita federalmente, o CBD derivado do cânhamo com menos de 0,3% THC não é uma substância controlada em muitos países.', simple: 'Estatuto legal de substâncias reguladas, do qual o CBD de cânhamo pode estar isento.' },
  'Cosmetic CBD Regulations': { term: 'Regulamentos de CBD Cosmético', definition: 'Regras que regem o uso de CBD em produtos de cuidados de pele e beleza.', simple: 'Leis sobre CBD em produtos de beleza.' },
  "Crohn's Disease": { term: 'Doença de Crohn', definition: 'Doença inflamatória intestinal onde o CBD pode reduzir a inflamação intestinal.', simple: 'Condição intestinal onde o CBD pode ajudar com a inflamação.' },
  'Crude Oil': { term: 'Óleo Bruto', definition: 'O extrato inicial e não refinado de cânhamo contendo todos os compostos vegetais.', simple: 'Primeira extração do cânhamo antes da purificação.' },
  'Cruelty-Free': { term: 'Livre de Crueldade', definition: 'Produtos não testados em animais; procure certificação Leaping Bunny ou PETA.', simple: 'Produtos de CBD não testados em animais.' },
  'Crumble': { term: 'Crumble', definition: 'Concentrado de canábis seco e quebradiço que é fácil de manusear e dosear.', simple: 'Tipo de concentrado de CBD com textura seca.' },
  'Cultivar': { term: 'Cultivar', definition: 'Uma variedade cultivada de canábis criada para características desejáveis específicas.', simple: 'Variedade específica de planta de cânhamo.' },
  'Curing': { term: 'Cura', definition: 'O processo de secagem controlada que preserva canabinóides e terpenos no cânhamo colhido.', simple: 'Processo de secagem que preserva a qualidade do cânhamo.' },
  'CYP450 Enzymes': { term: 'Enzimas CYP450', definition: 'Enzimas hepáticas que metabolizam o CBD e muitos medicamentos - a base para interações medicamentosas.', simple: 'Enzimas do fígado afetadas pelo CBD que podem causar interações.' },
  'Dab': { term: 'Dab', definition: 'Um método de consumir concentrados de canábis vaporizando-os numa superfície aquecida.', simple: 'Método de vaporizar concentrados de CBD.' },
  'Decarboxylation': { term: 'Descarboxilação', definition: 'A descarboxilação é o processo de aquecimento que converte o CBDA ácido em CBD ativo. O cânhamo cru contém canabinóides ácidos que devem ser aquecidos para ativar.', simple: 'Processo de aquecimento que ativa o CBD na planta.' },
  'Delta-8-THC': { term: 'Delta-8-THC', definition: 'O Delta-8 THC é um canabinóide ligeiramente psicoativo derivado do CBD do cânhamo. Oferece uma experiência menos intensa que o Delta-9 THC com ambiguidade legal.', simple: 'Forma mais suave de THC derivada do CBD de cânhamo.' },
  'Diabetes': { term: 'Diabetes', definition: 'Uma doença metabólica que afeta a regulação do açúcar no sangue.', simple: 'Condição de açúcar no sangue onde o CBD está a ser estudado.' },
  'Disposable Vape': { term: 'Vaporizador Descartável', definition: 'Dispositivos de vaporização de CBD de uso único e pré-cheios, descartados após o óleo se esgotar.', simple: 'Vaporizador de CBD de uso único.' },
  'Distillate': { term: 'Destilado', definition: 'Um extrato de canábis altamente refinado contendo canabinóides isolados, tipicamente 85-95% de pureza.', simple: 'Extrato de CBD muito puro e concentrado.' },
  'Distillation': { term: 'Destilação', definition: 'A destilação de CBD é um processo de purificação usando calor e vácuo para isolar canabinóides. Produz óleo de CBD altamente concentrado, tipicamente 80-90% puro.', simple: 'Processo de purificação que cria CBD muito concentrado.' },
  'Dose': { term: 'Dose', definition: 'Uma dose é a quantidade específica de uma substância (como CBD) administrada de cada vez, medida em miligramas (mg).', simple: 'Quantidade de CBD tomada de cada vez.' },
  'Double-Blind Study': { term: 'Estudo Duplo-Cego', definition: 'Investigação onde nem os participantes nem os investigadores sabem quem recebe o tratamento versus placebo.', simple: 'Tipo de estudo científico mais rigoroso e imparcial.' },
  'Dravet Syndrome': { term: 'Síndrome de Dravet', definition: 'Uma epilepsia infantil rara e grave para a qual o CBD (Epidiolex) está aprovado pelas autoridades reguladoras.', simple: 'Epilepsia grave infantil tratável com CBD aprovado.' },
  'Drowsiness': { term: 'Sonolência', definition: 'Sensação de sono que pode ocorrer com CBD, especialmente em doses mais elevadas.', simple: 'Efeito secundário de sentir sono, comum em doses altas.' },
  'Drug Interaction': { term: 'Interação Medicamentosa', definition: 'As interações medicamentosas do CBD ocorrem porque o CBD afeta enzimas hepáticas que metabolizam muitos medicamentos. Consulte sempre um médico antes de combinar CBD com medicamentos.', simple: 'Potencial do CBD para afetar como outros medicamentos funcionam.' },
  'Dry Mouth': { term: 'Boca Seca', definition: 'Um efeito secundário comum do CBD onde a produção de saliva diminui temporariamente.', simple: 'Efeito secundário temporário de redução de saliva.' },
  'Duration of Effects': { term: 'Duração dos Efeitos', definition: 'Quanto tempo os efeitos do CBD persistem após começarem, variando pelo método de consumo.', simple: 'Quanto tempo duram os efeitos do CBD.' },
  'Eczema': { term: 'Eczema', definition: 'Uma condição cutânea inflamatória crónica que causa manchas com comichão, vermelhas e secas.', simple: 'Condição da pele onde o CBD pode ajudar a acalmar.' },
  'Edible': { term: 'Comestível', definition: 'Produtos alimentares ou bebidas infundidos com CBD para consumo conveniente e saboroso.', simple: 'Alimentos e bebidas contendo CBD.' },
  'Efficacy': { term: 'Eficácia', definition: 'O quão bem um tratamento funciona em condições ideais e controladas.', simple: 'Quão bem o CBD funciona em estudos científicos.' },
  'Endocannabinoid Deficiency': { term: 'Deficiência Endocanabinóide', definition: 'Teoria de que níveis inadequados de endocanabinóides podem causar certas condições crónicas.', simple: 'Teoria de que a falta de canabinóides naturais causa problemas de saúde.' },
  'Endocannabinoid System': { term: 'Sistema Endocanabinóide', definition: 'O sistema endocanabinóide (SEC) regula o equilíbrio no corpo, incluindo humor, sono, apetite e resposta à dor. O CBD interage com este sistema.', simple: 'Sistema corporal que o CBD ajuda a regular.' },
  'Endocannabinoid Tone': { term: 'Tom Endocanabinóide', definition: 'O nível basal de atividade do sistema endocanabinóide no corpo.', simple: 'Nível de atividade natural do sistema de canabinóides do corpo.' },
  'Endometriosis': { term: 'Endometriose', definition: 'Uma condição dolorosa envolvendo crescimento de tecido fora do útero; algumas usam CBD para gestão de sintomas.', simple: 'Condição feminina dolorosa onde o CBD pode ajudar.' },
  'Entourage Effect': { term: 'Efeito Entourage', definition: 'O efeito entourage descreve como canabinóides e terpenos trabalham juntos sinergicamente, potencialmente tornando o CBD de espectro completo mais eficaz no geral.', simple: 'Teoria de que os compostos do cânhamo funcionam melhor juntos.' },
  'Epidiolex': { term: 'Epidiolex', definition: 'O primeiro medicamento de CBD aprovado pelas autoridades reguladoras para tratar formas graves de epilepsia.', simple: 'Medicamento de CBD aprovado para epilepsia.' },
  'Ethanol Extraction': { term: 'Extração por Etanol', definition: 'A extração por etanol utiliza álcool de grau alimentar para extrair canabinóides das plantas de cânhamo. É eficiente e pode preservar o espectro completo de compostos.', simple: 'Método de extração de CBD usando álcool puro.' },
  'EU Organic Certification': { term: 'Certificação Orgânica UE', definition: 'Padrão orgânico europeu para cultivo de cânhamo, indicado pelo logótipo de folha verde.', simple: 'Certificação de cânhamo cultivado organicamente na UE.' },
  'EU-GMP Certification': { term: 'Certificação EU-GMP', definition: 'O padrão europeu de fabrico mais elevado para produtos de CBD de grau farmacêutico.', simple: 'Padrão de qualidade farmacêutica europeia para CBD.' },
  'Eucalyptol': { term: 'Eucaliptol', definition: 'Um terpeno refrescante e mentolado com benefícios respiratórios e suporte cognitivo.', simple: 'Terpeno com aroma de eucalipto para respiração.' },
  'FAAH Enzyme': { term: 'Enzima FAAH', definition: 'A enzima que degrada a anandamida; o CBD inibe a FAAH para aumentar os níveis de anandamida.', simple: 'Enzima que o CBD pode bloquear para aumentar o bem-estar.' },
  'Feminized Seeds': { term: 'Sementes Feminizadas', definition: 'Sementes criadas para produzir apenas plantas femininas para máxima produção de canabinóides.', simple: 'Sementes que produzem apenas plantas de cânhamo fêmeas.' },
  'Fibromyalgia': { term: 'Fibromialgia', definition: 'Condição de dor crónica onde o CBD pode ajudar através de efeitos anti-inflamatórios e no sono.', simple: 'Condição de dor generalizada onde o CBD pode ajudar.' },
  'First-Pass Metabolism': { term: 'Metabolismo de Primeira Passagem', definition: 'Processamento hepático que reduz a biodisponibilidade do CBD quando consumido oralmente.', simple: 'Razão pela qual menos CBD é absorvido quando engolido.' },
  'Flavonoids': { term: 'Flavonóides', definition: 'Os flavonóides são compostos vegetais encontrados na canábis que fornecem cor e podem oferecer benefícios anti-inflamatórios e antioxidantes, trabalhando juntamente com os canabinóides no efeito entourage.', simple: 'Compostos coloridos do cânhamo com benefícios para a saúde.' },
  'Flower': { term: 'Flor', definition: 'A parte fumável da planta de canábis que contém a maior concentração de canabinóides.', simple: 'Parte da planta com mais CBD.' },
  'Food Supplement Classification': { term: 'Classificação como Suplemento Alimentar', definition: 'A categoria regulatória que determina como os produtos de CBD podem ser vendidos e comercializados.', simple: 'Como o CBD é classificado legalmente em muitos países.' },
  'Full Spectrum': { term: 'Espectro Completo', definition: 'O CBD de espectro completo contém todos os compostos da planta de cânhamo, incluindo canabinóides, terpenos e THC vestigial abaixo de 0,3%. Beneficia do efeito entourage.', simple: 'CBD com todos os compostos naturais da planta, incluindo THC vestigial.' },
  'Gas Chromatography': { term: 'Cromatografia Gasosa', definition: 'Um método de teste baseado em calor menos adequado para produtos de CBD pois altera canabinóides ácidos.', simple: 'Método de teste laboratorial para canabinóides.' },
  'Generalized Anxiety Disorder': { term: 'Perturbação de Ansiedade Generalizada', definition: 'Uma condição crónica de preocupação excessiva; o CBD mostra promessa como opção de tratamento.', simple: 'Ansiedade crónica onde o CBD pode ajudar.' },
  'Geraniol': { term: 'Geraniol', definition: 'O geraniol é um terpeno floral com aroma de rosa encontrado no cânhamo e nos gerânios. Pode ter propriedades neuroprotetoras e antioxidantes quando combinado com CBD.', simple: 'Terpeno floral com potenciais benefícios neurológicos.' },
  'Glaucoma': { term: 'Glaucoma', definition: 'Condição ocular que causa dano nervoso onde o THC pode reduzir temporariamente a pressão ocular.', simple: 'Condição ocular onde canabinóides estão a ser estudados.' },
  'GMP': { term: 'GMP', definition: 'Padrões de qualidade para produção farmacêutica e de suplementos que garantem consistência e segurança.', simple: 'Padrões de qualidade de fabrico.' },
  'GPR55 Receptor': { term: 'Recetor GPR55', definition: 'Um recetor órfão que responde a canabinóides, por vezes chamado de terceiro recetor canabinóide.', simple: 'Outro recetor no corpo que responde ao CBD.' },
  'Grapefruit Interaction': { term: 'Interação com Toranja', definition: 'Se o seu medicamento avisa contra toranja, provavelmente interage com CBD também.', simple: 'Regra simples: se evitar toranja, consulte sobre CBD.' },
  'Halal CBD': { term: 'CBD Halal', definition: 'Produtos de CBD em conformidade com a lei islâmica; devem ser livres de THC e álcool.', simple: 'CBD certificado para consumidores muçulmanos.' },
  'Half-life': { term: 'Meia-vida', definition: 'A meia-vida do CBD é o tempo para metade do composto sair do corpo, tipicamente 18-32 horas. Fatores incluem dosagem, frequência de uso e taxa metabólica.', simple: 'Quanto tempo o CBD permanece no corpo.' },
  'Hash': { term: 'Haxixe', definition: 'Concentrado tradicional feito de tricomas de canábis comprimidos.', simple: 'Forma concentrada tradicional de canábis.' },
  'Heavy Metals Testing': { term: 'Teste de Metais Pesados', definition: 'Análise laboratorial que verifica a presença de metais tóxicos como chumbo, mercúrio, arsénio e cádmio em produtos de CBD.', simple: 'Teste de segurança para contaminantes metálicos.' },
  'Hemp': { term: 'Cânhamo', definition: 'O cânhamo é Cannabis sativa contendo menos de 0,3% THC. Legalmente permitido sob regulamentação apropriada, é a fonte da maioria dos produtos de CBD.', simple: 'Planta de canábis com pouco THC usada para CBD.' },
  'Hemp License': { term: 'Licença de Cânhamo', definition: 'Uma autorização necessária para cultivo, processamento ou venda legal de cânhamo.', simple: 'Permissão legal para trabalhar com cânhamo.' },
  'Hemp Seed Oil': { term: 'Óleo de Semente de Cânhamo', definition: 'O óleo de semente de cânhamo é prensado das sementes de cânhamo e não contém CBD nem canabinóides THC. É nutritivo mas diferente do óleo de CBD extraído das flores.', simple: 'Óleo nutritivo sem CBD, diferente do óleo de CBD.' },
  'Hemp vs Marijuana': { term: 'Cânhamo vs Marijuana', definition: 'Cânhamo e marijuana são ambos canábis mas diferem legalmente pelo teor de THC. O cânhamo tem menos de 0,3% THC e é legal; a marijuana tem mais e é restrita.', simple: 'Diferença legal baseada na quantidade de THC.' },
  'HHC': { term: 'HHC', definition: 'Uma forma hidrogenada de THC que produz efeitos psicoativos semelhantes mas distintos.', simple: 'Variante sintética do THC.' },
  'Homeostasis': { term: 'Homeostasia', definition: 'A homeostasia é o estado de equilíbrio interno do corpo. O sistema endocanabinóide ajuda a manter a homeostasia, e o CBD pode apoiar esta função de equilíbrio.', simple: 'Equilíbrio corporal que o CBD pode ajudar a manter.' },
  'HPLC': { term: 'HPLC', definition: 'O método laboratorial padrão para testar com precisão o conteúdo de canabinóides em produtos de CBD.', simple: 'Método de teste mais preciso para canabinóides.' },
  'Humulene': { term: 'Humuleno', definition: 'O humuleno é um terpeno terroso e amadeirado no cânhamo e lúpulo. Pode ter propriedades supressoras de apetite e anti-inflamatórias combinadas com canabinóides.', simple: 'Terpeno que pode ajudar a reduzir inflamação e apetite.' },
  "Huntington's Disease": { term: 'Doença de Huntington', definition: 'Uma perturbação cerebral genética que causa problemas progressivos de movimento, cognitivos e psiquiátricos.', simple: 'Doença cerebral genética grave.' },
  'Hydrocarbon Extraction': { term: 'Extração por Hidrocarbonetos', definition: 'A extração por hidrocarbonetos usa butano ou propano para extrair canabinóides do cânhamo. Requer purga cuidadosa para remover todo o resíduo de solvente com segurança.', simple: 'Método de extração que requer remoção cuidadosa de solventes.' },
  'Hydrophobic': { term: 'Hidrofóbico', definition: 'Propriedade repelente à água dos canabinóides que requer formulações especiais para bebidas.', simple: 'Razão pela qual o CBD não se mistura facilmente com água.' },
  'IBS': { term: 'SII', definition: 'Uma perturbação digestiva que pode responder ao tratamento com canabinóides através de recetores intestinais.', simple: 'Síndrome do Intestino Irritável onde o CBD pode ajudar.' },
  'Import/Export Regulations': { term: 'Regulamentos de Importação/Exportação', definition: 'Regras que governam o comércio internacional de produtos de cânhamo e CBD.', simple: 'Leis sobre transportar CBD entre países.' },
  'In Vitro': { term: 'In Vitro', definition: 'Investigação conduzida em tubos de ensaio ou placas de Petri fora de organismos vivos.', simple: 'Estudos feitos em laboratório, não em seres vivos.' },
  'In Vivo': { term: 'In Vivo', definition: 'Investigação conduzida em organismos vivos como animais ou humanos.', simple: 'Estudos feitos em seres vivos.' },
  'Inactive Ingredients': { term: 'Ingredientes Inativos', definition: 'Componentes não-CBD como óleos veiculares e aromatizantes; verifique a presença de alergénios.', simple: 'Outros ingredientes além do CBD no produto.' },
  'Inhalation': { term: 'Inalação', definition: 'A inalação de CBD através de vaporização proporciona o início de efeitos mais rápido, tipicamente em minutos. Oferece alta biodisponibilidade mas pode afetar os pulmões.', simple: 'Respirar CBD para efeitos rápidos.' },
  'Insomnia': { term: 'Insónia', definition: 'O CBD pode apoiar o sono ao abordar fatores como ansiedade e dor que perturbam o descanso. Alguns utilizadores combinam CBD com CBN ou melatonina para melhor sono.', simple: 'Problema de sono onde o CBD pode ajudar.' },
  'ISO 17025 Accreditation': { term: 'Acreditação ISO 17025', definition: 'Um padrão internacional que garante competência e fiabilidade de testes laboratoriais.', simple: 'Certificação de qualidade para laboratórios de teste.' },
  'ISO Certification': { term: 'Certificação ISO', definition: 'Padrões internacionais de qualidade; ISO 17025 para laboratórios, ISO 9001 para fabricantes.', simple: 'Certificações de qualidade reconhecidas internacionalmente.' },
  'Kief': { term: 'Kief', definition: 'Pó fino de tricomas de canábis, mais potente que a flor.', simple: 'Pó concentrado de CBD da planta.' },
  'Kosher CBD': { term: 'CBD Kosher', definition: 'Produtos de CBD certificados para cumprir as leis dietéticas judaicas sob supervisão rabínica.', simple: 'CBD certificado para consumidores judeus.' },
  'Lab Report': { term: 'Relatório Laboratorial', definition: 'Documento que mostra resultados de testes de análise laboratorial independente de produtos de CBD.', simple: 'Documento com resultados de testes de qualidade.' },
  'Limonene': { term: 'Limoneno', definition: 'O limoneno é um terpeno com aroma cítrico encontrado no cânhamo e frutos cítricos. Pode promover humor elevado e proporcionar alívio do stress quando combinado com CBD.', simple: 'Terpeno cítrico que pode melhorar o humor.' },
  'Linalool': { term: 'Linalol', definition: 'O linalol é um terpeno floral encontrado no cânhamo e plantas de lavanda. Conhecido pelas suas propriedades calmantes, pode potenciar os efeitos relaxantes dos produtos de CBD.', simple: 'Terpeno de lavanda que aumenta o relaxamento.' },
  'Lipophilic': { term: 'Lipofílico', definition: 'Propriedade lipossolúvel dos canabinóides que afeta a absorção e armazenamento no corpo.', simple: 'O CBD dissolve-se melhor em gordura que em água.' },
  'Liposomal CBD': { term: 'CBD Lipossomal', definition: 'CBD encapsulado em pequenas esferas de gordura (lipossomas) para entrega e absorção melhoradas.', simple: 'Tecnologia que melhora a absorção do CBD.' },
  'Live Resin': { term: 'Resina Viva', definition: 'Concentrado premium de canábis congelada rapidamente que preserva o perfil completo de terpenos.', simple: 'Concentrado de alta qualidade com mais terpenos.' },
  'Liver Enzymes': { term: 'Enzimas Hepáticas', definition: 'Doses elevadas de CBD podem elevar as enzimas hepáticas - importante para quem tem condições hepáticas.', simple: 'O CBD pode afetar o fígado em doses altas.' },
  'Maintenance Dose': { term: 'Dose de Manutenção', definition: 'A quantidade contínua de CBD que proporciona benefícios consistentes e sustentados.', simple: 'Dose diária regular de CBD.' },
  'Marijuana': { term: 'Marijuana', definition: 'Canábis contendo mais de 0,3% THC, psicoativa e legalmente restrita.', simple: 'Canábis com THC que causa euforia.' },
  'MCT Oil': { term: 'Óleo MCT', definition: 'O óleo MCT (triglicéridos de cadeia média) é um óleo veicular de CBD popular derivado do coco. Melhora a absorção e fornece energia rápida ao corpo.', simple: 'Óleo de coco que ajuda a absorver CBD.' },
  'Meta-Analysis': { term: 'Meta-análise', definition: 'Método estatístico que combina resultados de múltiplos estudos para evidência mais forte.', simple: 'Estudo que combina muitos outros estudos.' },
  'mg/mL Calculation': { term: 'Cálculo mg/mL', definition: 'Para encontrar CBD por mL: divida o total de mg pelo mL do frasco. Um conta-gotas tipicamente equivale a 1mL.', simple: 'Como calcular a quantidade de CBD por gota.' },
  'Microbial Testing': { term: 'Teste Microbiano', definition: 'Teste para bactérias, bolores, leveduras e outros microrganismos em produtos de CBD.', simple: 'Teste de segurança para germes.' },
  'Microdosing': { term: 'Microdosagem', definition: 'Tomar quantidades muito pequenas de CBD várias vezes ao dia para efeitos subtis e consistentes.', simple: 'Tomar doses muito pequenas de CBD frequentemente.' },
  'Migraine': { term: 'Enxaqueca', definition: 'Perturbação de dor de cabeça grave potencialmente ligada a deficiência endocanabinóide.', simple: 'Dor de cabeça grave onde o CBD pode ajudar.' },
  'Milligrams': { term: 'Miligramas', definition: 'A unidade de medida padrão para conteúdo e dosagem de CBD.', simple: 'Unidade usada para medir doses de CBD.' },
  'Minimum Effective Dose': { term: 'Dose Mínima Eficaz', definition: 'A dose mais baixa de CBD que produz efeitos terapêuticos desejados para um indivíduo.', simple: 'A menor dose de CBD que funciona para si.' },
  'Minor Cannabinoids': { term: 'Canabinóides Menores', definition: 'Compostos de canábis encontrados em concentrações menores que CBD ou THC, incluindo CBG, CBN e CBC.', simple: 'Outros canabinóides além do CBD e THC.' },
  'Multiple Sclerosis': { term: 'Esclerose Múltipla', definition: 'Doença nervosa autoimune onde medicamentos à base de canábis ajudam a gerir a espasticidade.', simple: 'Doença nervosa onde o CBD pode ajudar com sintomas.' },
  'Myrcene': { term: 'Mirceno', definition: 'O mirceno é um terpeno terroso e almiscarado abundante no cânhamo e lúpulo. Pode potenciar a absorção de CBD e está associado a efeitos relaxantes e sedativos.', simple: 'Terpeno comum que pode aumentar o relaxamento.' },
  'Nano CBD': { term: 'Nano CBD', definition: 'Partículas ultra-pequenas de CBD com solubilidade em água melhorada e absorção mais rápida.', simple: 'CBD processado para absorção mais rápida.' },
  'Nasal Spray': { term: 'Spray Nasal', definition: 'CBD administrado através das membranas nasais para absorção rápida sem digestão.', simple: 'CBD para o nariz com absorção rápida.' },
  'Nerolidol': { term: 'Nerolidol', definition: 'Um terpeno amadeirado-floral que melhora a penetração na pele para aplicações tópicas.', simple: 'Terpeno que ajuda o CBD a penetrar na pele.' },
  'Neuropathy': { term: 'Neuropatia', definition: 'Dano nervoso que causa dor onde canabinóides mostram potencial significativo de alívio.', simple: 'Dor nervosa onde o CBD pode ajudar.' },
  'Neuroprotection': { term: 'Neuroproteção', definition: 'O CBD mostra potencial neuroprotetor em estudos de investigação, possivelmente apoiando a saúde cerebral através dos seus mecanismos antioxidantes e anti-inflamatórios.', simple: 'Capacidade do CBD de proteger o cérebro.' },
  'Neurotransmitter': { term: 'Neurotransmissor', definition: 'Mensageiros químicos cerebrais regulados pelo sistema endocanabinóide.', simple: 'Químicos cerebrais afetados pelo CBD.' },
  'Non-GMO': { term: 'Não-OGM', definition: 'Produto feito sem organismos geneticamente modificados; a maioria do cânhamo é naturalmente não-OGM.', simple: 'CBD de plantas não modificadas geneticamente.' },
  'Novel Food': { term: 'Novo Alimento', definition: 'Classificação da UE que requer autorização para alimentos não consumidos significativamente antes de 1997.', simple: 'Estatuto regulatório do CBD na UE.' },
  'Obesity': { term: 'Obesidade', definition: 'Uma condição complexa envolvendo gordura corporal excessiva que aumenta o risco de doenças.', simple: 'Condição de peso onde o CBD está a ser estudado.' },
  'OCD': { term: 'POC', definition: 'Uma perturbação de ansiedade caracterizada por pensamentos e comportamentos repetitivos indesejados.', simple: 'Perturbação Obsessivo-Compulsiva onde o CBD pode ajudar.' },
  'Ocimene': { term: 'Ocimeno', definition: 'O ocimeno é um terpeno doce e herbáceo encontrado no cânhamo e várias ervas. Pode ter propriedades antivirais e antifúngicas e contribui para o efeito entourage.', simple: 'Terpeno herbáceo com propriedades protetoras.' },
  'Onset Time': { term: 'Tempo de Início', definition: 'O tempo entre o consumo de CBD e quando os efeitos se tornam percetíveis.', simple: 'Quanto tempo até o CBD começar a fazer efeito.' },
  'Oral Administration': { term: 'Administração Oral', definition: 'O CBD oral envolve engolir cápsulas, comestíveis ou óleos. Os efeitos levam 30-90 minutos para iniciar mas duram mais que métodos sublinguais ou inalados.', simple: 'Tomar CBD engolindo-o.' },
  'Organic Hemp': { term: 'Cânhamo Orgânico', definition: 'Cânhamo cultivado sem químicos sintéticos, seguindo padrões agrícolas orgânicos.', simple: 'Cânhamo cultivado sem pesticidas químicos.' },
  'Over-the-Counter CBD': { term: 'CBD de Venda Livre', definition: 'Produtos de CBD vendidos sem prescrição como suplementos ou cosméticos.', simple: 'CBD que pode comprar sem receita médica.' },
  'Pain': { term: 'Dor', definition: 'A dor é uma experiência sensorial desagradável associada a dano tecidual real ou potencial, que o CBD pode ajudar a gerir.', simple: 'Sensação desagradável que o CBD pode ajudar a aliviar.' },
  "Parkinson's Disease": { term: 'Doença de Parkinson', definition: 'Uma perturbação progressiva do sistema nervoso que afeta o movimento e controlo motor.', simple: 'Doença de movimento onde o CBD está a ser estudado.' },
  'Participants': { term: 'Participantes', definition: 'Os participantes são os indivíduos que se voluntariam para participar num estudo de investigação, também chamados de sujeitos ou voluntários.', simple: 'Pessoas que participam em estudos científicos.' },
  'Peak Plasma Concentration': { term: 'Concentração Plasmática Máxima', definition: 'O nível máximo de CBD atingido na corrente sanguínea após uma dose.', simple: 'Momento de maior quantidade de CBD no sangue.' },
  'Peer Review': { term: 'Revisão por Pares', definition: 'Avaliação por especialistas de investigação científica antes da publicação para garantir qualidade.', simple: 'Processo de verificação de estudos por outros cientistas.' },
  'Percentage to mg Conversion': { term: 'Conversão de Percentagem para mg', definition: 'Converta percentagem para mg multiplicando o peso do produto pela percentagem.', simple: 'Como calcular mg de CBD a partir da percentagem.' },
  'Pesticide Testing': { term: 'Teste de Pesticidas', definition: 'O teste de pesticidas garante que os produtos de CBD estão livres de químicos agrícolas nocivos. É uma verificação de segurança crítica incluída na análise laboratorial de terceiros.', simple: 'Teste para garantir que não há pesticidas no CBD.' },
  'Pet Anxiety & CBD': { term: 'Ansiedade de Animais e CBD', definition: 'O CBD pode ajudar animais com ansiedade de separação, fobia de ruídos e ansiedade de viagem.', simple: 'CBD para ajudar animais ansiosos.' },
  'Pet Arthritis & CBD': { term: 'Artrite de Animais e CBD', definition: 'O CBD mostra promessa para dor articular de animais; estudo de Cornell mostrou melhoria em cães artríticos.', simple: 'CBD para ajudar animais com dor nas articulações.' },
  'Pet CBD': { term: 'CBD para Animais', definition: 'Produtos de CBD formulados para animais com concentrações mais baixas e ingredientes seguros para animais.', simple: 'Produtos de CBD feitos especialmente para animais.' },
  'Pet CBD Dosing': { term: 'Dosagem de CBD para Animais', definition: 'Ponto de partida geral: 0,25-0,5mg de CBD por kg de peso corporal, duas vezes ao dia.', simple: 'Quanto CBD dar ao seu animal.' },
  'Pet CBD Product Safety': { term: 'Segurança de Produtos de CBD para Animais', definition: 'Escolha fórmulas específicas para animais; evite xilitol, chocolate, uvas, óleos essenciais e THC elevado.', simple: 'Ingredientes a evitar em CBD para animais.' },
  'Pet Endocannabinoid System': { term: 'Sistema Endocanabinóide de Animais', definition: 'Cães, gatos e a maioria dos mamíferos têm sistemas endocanabinóides semelhantes aos humanos.', simple: 'Os animais também têm sistemas que respondem ao CBD.' },
  'Pet Seizures & CBD': { term: 'Convulsões de Animais e CBD', definition: 'O CBD pode reduzir a frequência de convulsões em cães epiléticos; investigação mostrou redução de 89% em alguns casos.', simple: 'CBD pode ajudar animais com epilepsia.' },
  'Phytocannabinoid': { term: 'Fitocanabinóide', definition: 'Canabinóides produzidos naturalmente pela planta de canábis, em oposição aos produzidos pelo corpo ou sintetizados.', simple: 'Canabinóides que vêm das plantas.' },
  'Pinene': { term: 'Pineno', definition: 'O pineno é um terpeno com aroma de pinheiro encontrado no cânhamo e coníferas. Pode apoiar o estado de alerta e função respiratória enquanto complementa os efeitos do CBD.', simple: 'Terpeno de pinheiro que pode ajudar a concentração.' },
  'Placebo': { term: 'Placebo', definition: 'Um placebo é um tratamento inativo (como uma pílula de açúcar) usado em ensaios clínicos para comparar com o tratamento real a ser testado.', simple: 'Tratamento falso usado para comparação em estudos.' },
  'Placebo Effect': { term: 'Efeito Placebo', definition: 'Melhoria experimentada devido à crença num tratamento em vez do tratamento em si.', simple: 'Melhoria que vem de acreditar que algo funciona.' },
  'Potency Testing': { term: 'Teste de Potência', definition: 'O teste de potência mede a concentração de canabinóides em produtos de CBD. Verifica que os produtos contêm a quantidade de CBD alegada no rótulo.', simple: 'Teste para verificar quanto CBD há realmente no produto.' },
  'PPARs': { term: 'PPARs', definition: 'Recetores nucleares que regulam o metabolismo e inflamação, ativados por alguns canabinóides.', simple: 'Recetores celulares que o CBD pode ativar.' },
  'Pre-Rolls': { term: 'Pré-enrolados', definition: 'Cigarros de flor de cânhamo prontos a fumar para consumo por inalação conveniente.', simple: 'Cigarros de cânhamo CBD prontos a usar.' },
  'Preclinical Study': { term: 'Estudo Pré-clínico', definition: 'Fase de investigação antes de ensaios humanos incluindo estudos laboratoriais e em animais.', simple: 'Estudos feitos antes de testar em humanos.' },
  'Prescription CBD': { term: 'CBD com Prescrição', definition: 'CBD de grau farmacêutico que requer prescrição médica.', simple: 'CBD medicinal que precisa de receita.' },
  'Psoriasis': { term: 'Psoríase', definition: 'Uma condição cutânea autoimune que causa acumulação rápida de células da pele e manchas escamosas.', simple: 'Condição da pele onde o CBD pode ajudar.' },
  'PTSD': { term: 'PTSD', definition: 'Perturbação relacionada com trauma onde canabinóides podem reduzir ansiedade e pesadelos.', simple: 'Stress pós-traumático onde o CBD pode ajudar.' },
  'QR Code Verification': { term: 'Verificação por Código QR', definition: 'Código digitalizável que liga aos resultados laboratoriais do seu lote específico; sem código QR é um sinal de alerta.', simple: 'Código para verificar a qualidade do seu produto.' },
  'Quality Assurance': { term: 'Garantia de Qualidade', definition: 'A garantia de qualidade do CBD inclui testes, documentação e controlos de fabrico. Procure marcas com processos de GQ transparentes e testes de terceiros.', simple: 'Sistemas para garantir que os produtos de CBD são bons.' },
  'Randomized Controlled Trial': { term: 'Ensaio Controlado Randomizado', definition: 'Um ECR é um estudo onde os participantes são aleatoriamente designados para receber o tratamento a ser testado ou um placebo/controlo, considerado o padrão de ouro para investigação médica.', simple: 'O tipo de estudo científico mais confiável.' },
  'Remediation': { term: 'Remediação', definition: 'O processo de remover ou reduzir THC em extratos de cânhamo para cumprir a conformidade legal.', simple: 'Processo de remover THC do CBD.' },
  'Residual Solvents': { term: 'Solventes Residuais', definition: 'O teste de solventes residuais garante que os extratos de CBD estão livres de químicos de extração como butano, propano e etanol que podem permanecer após o processamento.', simple: 'Teste para químicos restantes da extração.' },
  'Restless Leg Syndrome': { term: 'Síndrome das Pernas Inquietas', definition: 'Uma condição neurológica que causa desconforto nas pernas; alguns pacientes relatam que o CBD proporciona alívio.', simple: 'Condição de pernas onde o CBD pode ajudar.' },
  'Results': { term: 'Resultados', definition: 'Os resultados são as descobertas e desfechos de um estudo de investigação que mostram se o tratamento teve efeito.', simple: 'O que um estudo científico descobriu.' },
  'Retrograde Signaling': { term: 'Sinalização Retrógrada', definition: 'O método de comunicação reversa usado pelos endocanabinóides no sistema nervoso.', simple: 'Como os canabinóides comunicam no cérebro.' },
  'Rheumatoid Arthritis': { term: 'Artrite Reumatoide', definition: 'Uma doença autoimune que causa inflamação articular crónica, dor e potencial dano articular.', simple: 'Tipo de artrite causada pelo sistema imunitário.' },
  'Rosin': { term: 'Rosin', definition: 'Concentrado sem solventes feito com calor e pressão, sem químicos necessários.', simple: 'Concentrado de CBD feito naturalmente.' },
  'RSO': { term: 'RSO', definition: 'Extrato de canábis de espectro completo altamente concentrado, tipicamente alto em THC.', simple: 'Tipo de extrato de canábis muito forte.' },
  'Schizophrenia': { term: 'Esquizofrenia', definition: 'Uma perturbação mental grave que afeta o pensamento, emoções e comportamento.', simple: 'Perturbação mental onde o CBD está a ser estudado.' },
  'Seed-to-Sale Tracking': { term: 'Rastreamento da Semente à Venda', definition: 'Sistemas regulatórios que rastreiam produtos de cânhamo desde o cultivo até à venda a retalho.', simple: 'Sistema para rastrear produtos de CBD desde a planta.' },
  'Serotonin Receptors (5-HT1A)': { term: 'Recetores de Serotonina (5-HT1A)', definition: 'Um subtipo de recetor de serotonina diretamente ativado pelo CBD, potencialmente explicando os seus efeitos anti-ansiedade.', simple: 'Recetores de humor que o CBD pode ativar.' },
  'Serving Size': { term: 'Dose por Toma', definition: 'A dose de CBD é a quantidade recomendada por utilização, tipicamente listada nos rótulos dos produtos. Ajuda os consumidores a calcular a sua ingestão diária total de CBD.', simple: 'Quantidade sugerida de CBD por cada toma.' },
  'Shatter': { term: 'Shatter', definition: 'Concentrado de canábis tipo vidro, altamente puro, que se parte quando quebrado.', simple: 'Concentrado de CBD duro como vidro.' },
  'Shelf Life': { term: 'Prazo de Validade', definition: 'Quanto tempo um produto de CBD permanece eficaz, tipicamente 1-2 anos se armazenado adequadamente.', simple: 'Quanto tempo o CBD dura antes de expirar.' },
  'Short Path Distillation': { term: 'Destilação de Caminho Curto', definition: 'Uma técnica de destilação a vácuo para criar destilados de canabinóides altamente concentrados.', simple: 'Método de criar CBD muito puro.' },
  'Side Effects': { term: 'Efeitos Secundários', definition: 'Efeitos indesejados que podem ocorrer ao usar CBD, tipicamente ligeiros.', simple: 'Efeitos negativos possíveis do CBD, geralmente suaves.' },
  'Sleep': { term: 'Sono', definition: 'O sono é um estado natural de descanso essencial para a saúde. O CBD tem sido estudado pelos seus potenciais benefícios na melhoria da qualidade e duração do sono.', simple: 'O CBD pode ajudar a melhorar o sono.' },
  'Softgels': { term: 'Cápsulas Moles', definition: 'Cápsulas de gelatina mole contendo óleo de CBD líquido para absorção potencialmente melhor.', simple: 'Cápsulas moles de CBD fáceis de engolir.' },
  'Solventless Extraction': { term: 'Extração Sem Solventes', definition: 'Métodos de extração que usam apenas calor, pressão ou água - sem solventes químicos.', simple: 'Extração de CBD sem usar químicos.' },
  'Starting Dose': { term: 'Dose Inicial', definition: 'A quantidade inicial de CBD recomendada para novos utilizadores, tipicamente 5-20mg diários.', simple: 'Quanto CBD tomar quando se começa.' },
  'Strain': { term: 'Estirpe', definition: 'Uma variedade específica de canábis com características distintas, sendo substituída por "cultivar".', simple: 'Tipo específico de planta de cânhamo.' },
  'Sublingual': { term: 'Sublingual', definition: 'A administração sublingual de CBD envolve manter o óleo debaixo da língua por 60-90 segundos. Este método de entrega proporciona absorção mais rápida que engolir.', simple: 'Método de tomar CBD sob a língua.' },
  'Substance Use Disorder': { term: 'Perturbação por Uso de Substâncias', definition: 'Uma condição envolvendo uso compulsivo de substâncias apesar de consequências nocivas.', simple: 'Vício onde o CBD pode ajudar.' },
  'Supercritical Extraction': { term: 'Extração Supercrítica', definition: 'Usar CO₂ em estado supercrítico (híbrido líquido-gás) para extração precisa de canabinóides.', simple: 'Método avançado de extração de CBD.' },
  'Suppository': { term: 'Supositório', definition: 'Os supositórios de CBD administram canabidiol retal ou vaginalmente para absorção direta. Contornam o metabolismo de primeira passagem para efeitos mais rápidos e fortes.', simple: 'CBD para uso retal ou vaginal.' },
  'Symptoms': { term: 'Sintomas', definition: 'Os sintomas são sinais físicos ou mentais de uma condição que os participantes experienciam, que os investigadores medem para avaliar os efeitos do tratamento.', simple: 'Sinais de uma condição que estudos medem.' },
  'Systematic Review': { term: 'Revisão Sistemática', definition: 'Análise abrangente de toda a investigação disponível sobre um tema usando metodologia rigorosa.', simple: 'Estudo que analisa toda a investigação sobre um tema.' },
  'Terpene Profile': { term: 'Perfil de Terpenos', definition: 'A combinação e concentração específicas de terpenos num produto de canábis.', simple: 'Mistura de terpenos num produto de CBD.' },
  'Terpinolene': { term: 'Terpinoleno', definition: 'O terpinoleno é um terpeno floral e de pinheiro encontrado no cânhamo e árvore do chá. Pode ter propriedades sedativas e antioxidantes e contribui para o efeito entourage.', simple: 'Terpeno que pode ajudar no relaxamento.' },
  'Tetrahydrocannabinol': { term: 'Tetra-hidrocanabinol', definition: 'O principal composto psicoativo na canábis que produz a sensação de "pedrado" ao ligar-se aos recetores CB1.', simple: 'THC, o composto da canábis que causa euforia.' },
  'THC-Free': { term: 'Sem THC', definition: 'Produtos com níveis de THC não detetáveis, importantes para testes de drogas e países de tolerância zero.', simple: 'Produtos de CBD sem qualquer THC.' },
  'THC-O': { term: 'THC-O', definition: 'Uma forma sintética e acetilada de THC relatada como sendo mais potente que o THC natural.', simple: 'Versão sintética forte do THC.' },
  'THCA': { term: 'THCA', definition: 'O THCA (ácido tetra-hidrocanabinólico) é o precursor não psicoativo do THC encontrado na canábis crua. Converte-se em THC psicoativo quando aquecido ou envelhecido.', simple: 'Forma natural não psicoativa do THC.' },
  'THCV': { term: 'THCV', definition: 'O THCV (tetra-hidrocannabivarina) é um canabinóide que pode suprimir o apetite e proporcionar efeitos energizantes. Tem uma duração mais curta que o THC regular.', simple: 'Canabinóide que pode reduzir apetite.' },
  'Therapeutic Window': { term: 'Janela Terapêutica', definition: 'O intervalo de dose onde o CBD proporciona benefícios sem efeitos secundários significativos.', simple: 'Intervalo de dose onde o CBD funciona melhor.' },
  'Third-Party Testing': { term: 'Testes de Terceiros', definition: 'Os testes de terceiros por laboratórios independentes verificam o conteúdo e pureza dos produtos de CBD. Verifique sempre um Certificado de Análise atual antes de comprar.', simple: 'Testes por laboratórios independentes.' },
  'Titration': { term: 'Titulação', definition: 'A titulação é o processo de ajustar gradualmente a sua dosagem de CBD para encontrar a quantidade ideal. Comece baixo e aumente lentamente enquanto monitoriza os efeitos.', simple: 'Processo de encontrar a sua dose ideal de CBD.' },
  'Tolerance': { term: 'Tolerância', definition: 'Resposta reduzida ao CBD ao longo do tempo, requerendo doses mais altas para o mesmo efeito.', simple: 'Quando precisa de mais CBD para o mesmo efeito.' },
  'Topical': { term: 'Tópico', definition: 'Os tópicos de CBD são cremes, bálsamos e loções aplicados diretamente na pele para alívio localizado. Proporcionam benefícios direcionados sem entrar na corrente sanguínea.', simple: 'Produtos de CBD para aplicar na pele.' },
  'Tourette Syndrome': { term: 'Síndrome de Tourette', definition: 'Uma perturbação neurológica caracterizada por movimentos e vocalizações repetitivos e involuntários (tiques).', simple: 'Condição de tiques onde o CBD pode ajudar.' },
  'Transdermal': { term: 'Transdérmico', definition: 'Adesivos ou géis de CBD que penetram a pele para entrar na corrente sanguínea para libertação sustentada.', simple: 'CBD que atravessa a pele para a corrente sanguínea.' },
  'Treatment': { term: 'Tratamento', definition: 'Tratamento refere-se à intervenção a ser estudada, como a administração de CBD, para gerir ou melhorar uma condição de saúde.', simple: 'O que está a ser testado num estudo.' },
  'Trichome': { term: 'Tricoma', definition: 'Pequenas glândulas cristalinas na canábis que produzem canabinóides e terpenos.', simple: 'Estruturas da planta que produzem CBD.' },
  'TRPV1 Receptor': { term: 'Recetor TRPV1', definition: 'Um recetor de canal iónico que responde ao calor, capsaicina e canabinóides, envolvido na perceção da dor.', simple: 'Recetor de dor que o CBD pode afetar.' },
  'Valencene': { term: 'Valenceno', definition: 'Um terpeno cítrico doce com propriedades anti-inflamatórias e protetoras da pele.', simple: 'Terpeno com benefícios para a pele.' },
  'Vaporization': { term: 'Vaporização', definition: 'Aquecer CBD para libertar vapor sem combustão, considerado mais seguro que fumar.', simple: 'Inalar CBD aquecido sem fumo.' },
  'Vegan CBD': { term: 'CBD Vegano', definition: 'Produtos de CBD sem ingredientes derivados de animais; verifique gelatina, cera de abelha ou lanolina.', simple: 'CBD sem ingredientes de origem animal.' },
  'Veterinary Cannabis Medicine': { term: 'Medicina Veterinária de Canábis', definition: 'Campo emergente que estuda canabinóides para saúde animal, limitado por restrições legais.', simple: 'Uso de CBD para tratamento de animais.' },
  'Water-Soluble CBD': { term: 'CBD Hidrossolúvel', definition: 'O CBD hidrossolúvel usa tecnologia de nanoemulsão para biodisponibilidade melhorada. Mistura-se facilmente com bebidas e absorve mais rápido que produtos de CBD à base de óleo.', simple: 'CBD que se mistura com água para absorção rápida.' },
  'Wax': { term: 'Cera', definition: 'Concentrado de canábis macio e opaco com textura cerosa para dabbing.', simple: 'Tipo de concentrado de CBD macio.' },
  'Winterization': { term: 'Winterização', definition: 'Um processo de purificação usando temperaturas frias para remover gorduras e ceras do extrato de CBD.', simple: 'Processo de purificar CBD removendo gorduras.' }
};

// Function to create Portuguese slug
function createPortugueseSlug(portugueseTerm) {
  return portugueseTerm
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

// Function to translate a glossary term
function translateGlossaryTerm(term) {
  const translation = portugueseTranslations[term.term];
  
  if (!translation) {
    console.warn(`Missing translation for: ${term.term}`);
    return null;
  }

  const portugueseTerm = translation.term;
  const portugueseSlug = createPortugueseSlug(portugueseTerm);

  return {
    term_id: term.id,
    language: 'pt',
    term: portugueseTerm,
    slug: portugueseSlug,
    definition: translation.definition,
    simple_definition: translation.simple
  };
}

async function insertTranslations() {
  console.log('Starting glossary translation process...');
  
  const translations = [];
  let missing = 0;
  
  for (const term of glossary) {
    const translation = translateGlossaryTerm(term);
    if (translation) {
      translations.push(translation);
    } else {
      missing++;
    }
  }

  console.log(`Created ${translations.length} translations. Missing: ${missing}`);
  console.log('Inserting into database...');

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
    console.log(`Inserted ${inserted}/${translations.length} glossary translations`);
  }

  console.log('✅ Glossary translations inserted successfully!');
  return translations.length;
}

async function verifyCount() {
  console.log('Verifying glossary translation count...');
  
  const { count, error } = await supabase
    .from('glossary_translations')
    .select('id', { count: 'exact', head: true })
    .eq('language', 'pt');

  if (error) {
    console.error('Error verifying count:', error);
    return 0;
  }

  console.log(`✅ Database contains ${count} Portuguese glossary translations`);
  return count;
}

async function main() {
  try {
    const insertedCount = await insertTranslations();
    const verifiedCount = await verifyCount();
    
    console.log('🎉 Glossary translation task completed!');
    console.log(`- Translated: ${insertedCount} terms`);
    console.log(`- Verified: ${verifiedCount} terms in database`);
    console.log('- Language: Portuguese (pt) - European Portuguese');
  } catch (error) {
    console.error('❌ Glossary translation failed:', error);
    process.exit(1);
  }
}

main();
