const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Not found');
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Not found');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Load English glossary data
const glossaryEnPath = path.join(__dirname, 'scripts', 'data', 'glossary_en.json');
const glossaryEn = JSON.parse(fs.readFileSync(glossaryEnPath, 'utf8'));

console.log(`Loaded ${glossaryEn.length} English glossary terms`);

// Translation mappings for Spanish (Castilian)
const spanishTranslations = {
  "2-AG": {
    term: "2-AG",
    slug: "2-ag",
    definition: "2-AG (2-araquidonilglicerol) es un endocannabinoide que activa tanto los receptores CB1 como CB2. Desempeña funciones clave en la función inmunitaria y la señalización del dolor.",
    simple_definition: "Molécula endocannabinoide que ayuda a regular el dolor y el sistema inmunitario."
  },
  "510 Thread Cartridge": {
    term: "Cartucho de Rosca 510",
    slug: "cartucho-rosca-510",
    definition: "Contenedores de aceite de CBD prellenados que utilizan la conexión de rosca 510 estándar de la industria.",
    simple_definition: "Cartuchos precargados de CBD con conexión universal estándar."
  },
  "Acne": {
    term: "Acné",
    slug: "acne",
    definition: "Una afección cutánea que provoca granos, típicamente por la obstrucción de los folículos pilosos.",
    simple_definition: "Problema de la piel que causa granos y espinillas."
  },
  "Allosteric Modulation": {
    term: "Modulación Alostérica",
    slug: "modulacion-alosterica",
    definition: "Cuando un compuesto altera la función del receptor uniéndose a un sitio secundario en lugar del sitio activo principal.",
    simple_definition: "Proceso donde una sustancia modifica un receptor desde un sitio diferente."
  },
  "ALS": {
    term: "ELA",
    slug: "ela",
    definition: "Una enfermedad neurodegenerativa progresiva que afecta a las células nerviosas que controlan los músculos voluntarios.",
    simple_definition: "Enfermedad grave que causa debilidad muscular progresiva."
  },
  "Alzheimer's Disease": {
    term: "Enfermedad de Alzheimer",
    slug: "enfermedad-alzheimer",
    definition: "Una enfermedad cerebral progresiva que provoca pérdida de memoria y deterioro cognitivo.",
    simple_definition: "Enfermedad que causa pérdida gradual de memoria y capacidades mentales."
  },
  "Anandamide": {
    term: "Anandamida",
    slug: "anandamida",
    definition: "La anandamida es un endocannabinoide producido naturalmente, a menudo llamado la \"molécula de la felicidad\". El CBD puede aumentar los niveles de anandamida inhibiendo su degradación.",
    simple_definition: "Molécula natural del cuerpo que produce sensación de bienestar."
  },
  "Anti-inflammatory": {
    term: "Antiinflamatorio",
    slug: "antiinflamatorio",
    definition: "Antiinflamatorio se refiere a sustancias que reducen la inflamación. El CBD ha mostrado propiedades antiinflamatorias en estudios modulando las respuestas inmunitarias.",
    simple_definition: "Sustancia que reduce la hinchazón y la inflamación en el cuerpo."
  },
  "Anticonvulsant": {
    term: "Anticonvulsivo",
    slug: "anticonvulsivo",
    definition: "Una sustancia que previene las convulsiones; el CBD está aprobado por las agencias reguladoras para ciertas condiciones de epilepsia.",
    simple_definition: "Medicamento que previene o reduce las convulsiones epilépticas."
  },
  "Anxiety": {
    term: "Ansiedad",
    slug: "ansiedad",
    definition: "La ansiedad es una condición de salud mental caracterizada por preocupación persistente, miedo o malestar que puede interferir con la vida diaria.",
    simple_definition: "Sentimiento excesivo de preocupación o nerviosismo que afecta la vida cotidiana."
  },
  "Anxiolytic": {
    term: "Ansiolítico",
    slug: "ansiolitico",
    definition: "Ansiolítico significa que reduce la ansiedad. El CBD ha mostrado propiedades ansiolíticas en investigaciones, potencialmente ayudando a controlar la ansiedad a través de múltiples mecanismos.",
    simple_definition: "Sustancia que ayuda a calmar la ansiedad y el nerviosismo."
  },
  "Appetite Changes": {
    term: "Cambios del Apetito",
    slug: "cambios-apetito",
    definition: "El CBD puede aumentar o disminuir el apetito dependiendo del individuo y la dosis.",
    simple_definition: "El CBD puede hacer que tengas más o menos hambre de lo normal."
  },
  "Arthritis": {
    term: "Artritis",
    slug: "artritis",
    definition: "El CBD puede ayudar con los síntomas de la artritis a través de efectos antiinflamatorios. Los productos tópicos de CBD son populares para el malestar articular, aunque la investigación aún continúa.",
    simple_definition: "Enfermedad que causa dolor e inflamación en las articulaciones."
  },
  "Autism Spectrum Disorder": {
    term: "Trastorno del Espectro Autista",
    slug: "trastorno-espectro-autista",
    definition: "Una condición del desarrollo que afecta la comunicación y el comportamiento, con investigación emergente sobre el CBD.",
    simple_definition: "Condición que afecta el desarrollo social y comunicativo."
  },
  "Autoflower": {
    term: "Autofloreciente",
    slug: "autofloreciente",
    definition: "Variedades de cáñamo que florecen automáticamente según la edad en lugar de la exposición a la luz.",
    simple_definition: "Plantas que florecen solas sin necesidad de cambios de luz."
  },
  "Batch Number": {
    term: "Número de Lote",
    slug: "numero-lote",
    definition: "Los números de lote identifican lotes específicos de producción de productos de CBD. Permiten a los consumidores verificar los resultados de laboratorio y facilitan los retiros si surgen problemas de calidad.",
    simple_definition: "Código que identifica cada grupo de productos fabricados juntos."
  },
  "Batch Testing": {
    term: "Pruebas por Lotes",
    slug: "pruebas-lotes",
    definition: "Las pruebas por lotes verifican que cada lote de producción de productos de CBD cumple con los estándares de calidad. Busque COA específicos del lote para obtener la información más precisa.",
    simple_definition: "Análisis que verifica la calidad de cada grupo de productos."
  },
  "Bioavailability": {
    term: "Biodisponibilidad",
    slug: "biodisponibilidad",
    definition: "La biodisponibilidad mide cuánto CBD realmente entra en su torrente sanguíneo. Varía según el método: sublingual (20-35%), oral (6-20%), inhalado (30-40%).",
    simple_definition: "Cantidad de CBD que realmente llega a la sangre según cómo se tome."
  },
  "Biomass": {
    term: "Biomasa",
    slug: "biomasa",
    definition: "Material vegetal crudo de cáñamo utilizado para la extracción de CBD.",
    simple_definition: "Materia prima de la planta de cáñamo para hacer CBD."
  },
  "Biphasic Effect": {
    term: "Efecto Bifásico",
    slug: "efecto-bifasico",
    definition: "Cuando el CBD produce efectos diferentes en dosis bajas versus altas.",
    simple_definition: "El CBD actúa diferente según si se toma poco o mucho."
  },
  "Bipolar Disorder": {
    term: "Trastorno Bipolar",
    slug: "trastorno-bipolar",
    definition: "Una condición de salud mental que causa cambios extremos de humor entre depresión y manía.",
    simple_definition: "Enfermedad mental con cambios extremos entre tristeza y euforia."
  },
  "Bisabolol": {
    term: "Bisabolol",
    slug: "bisabolol",
    definition: "El bisabolol es un terpeno floral encontrado en el cáñamo y la manzanilla. Puede tener propiedades antiinflamatorias y de curación de la piel, haciéndolo popular en tópicos de CBD.",
    simple_definition: "Compuesto aromático que ayuda a calmar y curar la piel."
  },
  "Blood Thinner Interaction": {
    term: "Interacción con Anticoagulantes",
    slug: "interaccion-anticoagulantes",
    definition: "El CBD puede aumentar los niveles de anticoagulantes, elevando el riesgo de sangrado—siempre consulte a su médico.",
    simple_definition: "El CBD puede ser peligroso si tomas medicinas para la sangre."
  },
  "Blood-Brain Barrier": {
    term: "Barrera Hematoencefálica",
    slug: "barrera-hematoencefalica",
    definition: "Membrana protectora del cerebro que los cannabinoides pueden atravesar debido a su naturaleza liposoluble.",
    simple_definition: "Filtro natural del cerebro que el CBD puede atravesar."
  },
  "Body Weight Dosing": {
    term: "Dosificación por Peso Corporal",
    slug: "dosificacion-peso-corporal",
    definition: "Un enfoque de dosificación que calcula las cantidades de CBD basándose en el peso corporal.",
    simple_definition: "Calcular la dosis de CBD según lo que peses."
  },
  "Borneol": {
    term: "Borneol",
    slug: "borneol",
    definition: "Un terpeno mentolado que mejora la absorción de compuestos a través de la barrera hematoencefálica.",
    simple_definition: "Compuesto que ayuda a que otras sustancias lleguen mejor al cerebro."
  },
  "Broad Spectrum": {
    term: "Espectro Amplio",
    slug: "espectro-amplio",
    definition: "El CBD de espectro amplio incluye múltiples cannabinoides y terpenos pero con el THC completamente eliminado. Ofrece beneficios del efecto séquito sin ningún contenido de THC.",
    simple_definition: "CBD con muchos compuestos de la planta pero sin THC."
  },
  "Budder": {
    term: "Budder",
    slug: "budder",
    definition: "Concentrado cremoso, similar a la mantequilla de cannabis que retiene alto contenido de terpenos.",
    simple_definition: "Concentrado de cannabis de textura cremosa."
  },
  "Camphene": {
    term: "Canfeno",
    slug: "canfeno",
    definition: "Un terpeno terroso, con aroma a abeto que puede apoyar la salud cardiovascular.",
    simple_definition: "Compuesto aromático que puede beneficiar el corazón."
  },
  "Cannabichromene": {
    term: "Cannabicromeno",
    slug: "cannabicromeno",
    definition: "Un cannabinoide no psicoactivo que puede tener propiedades antiinflamatorias y antidepresivas.",
    simple_definition: "Compuesto del cannabis que puede ayudar con inflamación y ánimo."
  },
  "Cannabidiol": {
    term: "Cannabidiol",
    slug: "cannabidiol",
    definition: "Un cannabinoide no psicoactivo del cannabis con beneficios terapéuticos potenciales incluyendo alivio de ansiedad y efectos antiinflamatorios.",
    simple_definition: "Compuesto principal del CBD sin efectos psicoactivos."
  },
  "Cannabigerol": {
    term: "Cannabigerol",
    slug: "cannabigerol",
    definition: "El \"cannabinoide madre\" que sirve como precursor de otros cannabinoides como el CBD y THC.",
    simple_definition: "Cannabinoide del que se forman todos los demás."
  },
  "Cannabinoid Profile": {
    term: "Perfil Cannabinoide",
    slug: "perfil-cannabinoide",
    definition: "La combinación específica y concentración de cannabinoides en un producto.",
    simple_definition: "Lista de todos los cannabinoides presentes en un producto."
  },
  "Cannabinol": {
    term: "Cannabinol",
    slug: "cannabinol",
    definition: "Un cannabinoide ligeramente psicoactivo formado por la oxidación del THC, conocido por efectos sedantes potenciales.",
    simple_definition: "Cannabinoide que se forma cuando el THC envejece, con efectos relajantes."
  },
  "Cannabis Indica": {
    term: "Cannabis Indica",
    slug: "cannabis-indica",
    definition: "Una variedad de cannabis tradicionalmente asociada con efectos relajantes y sedantes.",
    simple_definition: "Tipo de cannabis conocido por sus efectos calmantes."
  },
  "Cannabis Oil": {
    term: "Aceite de Cannabis",
    slug: "aceite-cannabis",
    definition: "Término general para aceites de cannabis; puede significar aceite de CBD, aceite de THC, o ambos.",
    simple_definition: "Aceite extraído de la planta de cannabis."
  },
  "Cannabis Sativa": {
    term: "Cannabis Sativa",
    slug: "cannabis-sativa",
    definition: "Una especie de cannabis tradicionalmente asociada con efectos estimulantes y energizantes.",
    simple_definition: "Tipo de cannabis conocido por sus efectos activadores."
  },
  "Carrier Oil": {
    term: "Aceite Portador",
    slug: "aceite-portador",
    definition: "Los aceites portadores como MCT, semilla de cáñamo, u oliva ayudan a administrar CBD y mejorar su absorción. También permiten dosificación precisa en productos de tintura.",
    simple_definition: "Aceite base que ayuda al cuerpo a absorber mejor el CBD."
  },
  "Caryophyllene": {
    term: "Cariofileno",
    slug: "cariofileno",
    definition: "El beta-cariofileno es un terpeno picante que se une únicamente a los receptores CB2. Encontrado en el cáñamo y pimienta negra, puede potenciar efectos antiinflamatorios.",
    simple_definition: "Compuesto picante que potencia los efectos antiinflamatorios."
  },
  "CB1 Receptor": {
    term: "Receptor CB1",
    slug: "receptor-cb1",
    definition: "Los receptores CB1 se encuentran principalmente en el cerebro y sistema nervioso central. El THC se une directamente al CB1, mientras el CBD tiene un efecto modulador indirecto sobre ellos.",
    simple_definition: "Receptores en el cerebro donde actúan los cannabinoides."
  },
  "CB2 Receptor": {
    term: "Receptor CB2",
    slug: "receptor-cb2",
    definition: "Los receptores CB2 se ubican principalmente en células inmunitarias y tejidos periféricos. Desempeñan roles importantes en la regulación de la inflamación y respuesta inmunitaria.",
    simple_definition: "Receptores en el sistema inmune donde actúan los cannabinoides."
  },
  "CBD": {
    term: "CBD",
    slug: "cbd",
    definition: "CBD (cannabidiol) es un compuesto no intoxicante de la planta de cannabis, estudiado por beneficios terapéuticos potenciales incluyendo alivio del dolor, reducción de ansiedad y efectos antiinflamatorios.",
    simple_definition: "Compuesto principal del cannabis sin efectos psicoactivos."
  },
  "CBD Balm": {
    term: "Bálsamo de CBD",
    slug: "balsamo-cbd",
    definition: "Un producto tópico espeso a base de aceite de CBD que crea una barrera protectora en la piel.",
    simple_definition: "Crema espesa de CBD para aplicar en la piel."
  },
  "CBD Bath Bombs": {
    term: "Bombas de Baño de CBD",
    slug: "bombas-bano-cbd",
    definition: "Productos de baño efervescentes que liberan CBD en el agua del baño para absorción cutánea.",
    simple_definition: "Productos que se disuelven en el baño liberando CBD."
  },
  "CBD Beverages": {
    term: "Bebidas de CBD",
    slug: "bebidas-cbd",
    definition: "Bebidas infusionadas con CBD hidrosoluble usando tecnología de nanoemulsión.",
    simple_definition: "Bebidas que contienen CBD mezclado con agua."
  },
  "CBD Capsules": {
    term: "Cápsulas de CBD",
    slug: "capsulas-cbd",
    definition: "Suplementos orales de CBD en forma de píldora que proporcionan dosificación precisa e insípida.",
    simple_definition: "Píldoras de CBD fáciles de tomar con dosis exactas."
  },
  "CBD Coffee": {
    term: "Café con CBD",
    slug: "cafe-cbd",
    definition: "Productos de café infusionados con CBD, potencialmente equilibrando los efectos estimulantes de la cafeína.",
    simple_definition: "Café que contiene CBD para equilibrar la cafeína."
  },
  "CBD Cream": {
    term: "Crema de CBD",
    slug: "crema-cbd",
    definition: "Un producto tópico a base de agua para aplicar CBD directamente a la piel.",
    simple_definition: "Crema que se aplica en la piel para efectos locales."
  },
  "CBD Dosage Calculator": {
    term: "Calculadora de Dosis de CBD",
    slug: "calculadora-dosis-cbd",
    definition: "Herramienta para estimar la dosis inicial basada en peso corporal y condición; ajustar según la respuesta.",
    simple_definition: "Herramienta que ayuda a calcular cuánto CBD tomar."
  },
  "CBD for Cats": {
    term: "CBD para Gatos",
    slug: "cbd-gatos",
    definition: "CBD para ansiedad y dolor felino; los gatos metabolizan diferente, así que use productos específicos para gatos.",
    simple_definition: "Productos de CBD especialmente formulados para gatos."
  },
  "CBD for Dogs": {
    term: "CBD para Perros",
    slug: "cbd-perros",
    definition: "El CBD puede ayudar a perros con ansiedad, dolor y convulsiones; asegúrese de que los productos tengan THC mínimo.",
    simple_definition: "Productos de CBD seguros y efectivos para perros."
  },
  "CBD Gummies": {
    term: "Gominolas de CBD",
    slug: "gominolas-cbd",
    definition: "Caramelos comestibles infusionados con CBD que ofrecen dosis convenientes y premedidas con efectos de mayor duración.",
    simple_definition: "Caramelos dulces que contienen CBD en dosis exactas."
  },
  "CBD Isolate": {
    term: "Aislado de CBD",
    slug: "aislado-cbd",
    definition: "El aislado de CBD es la forma más pura de cannabidiol disponible con pureza del 99%+. Todos los demás cannabinoides, terpenos y compuestos vegetales están completamente eliminados.",
    simple_definition: "CBD puro al 99% sin otros compuestos de la planta."
  },
  "CBD Marketing Claims": {
    term: "Declaraciones de Marketing de CBD",
    slug: "declaraciones-marketing-cbd",
    definition: "El CBD no puede legalmente declarar curar o tratar enfermedades; cuidado con las afirmaciones de \"cura milagrosa\".",
    simple_definition: "El CBD no puede promocionarse como medicina curativa."
  },
  "CBD Patch": {
    term: "Parche de CBD",
    slug: "parche-cbd",
    definition: "Parche adhesivo que administra CBD a través de la piel durante períodos prolongados.",
    simple_definition: "Parche que se pega en la piel para liberar CBD lentamente."
  },
  "CBD Salve": {
    term: "Ungüento de CBD",
    slug: "unguento-cbd",
    definition: "Un producto tópico suave a base de aceite de CBD similar al bálsamo pero con consistencia más suave.",
    simple_definition: "Pomada suave de CBD para aplicar en la piel."
  },
  "CBD Tincture": {
    term: "Tintura de CBD",
    slug: "tintura-cbd",
    definition: "Extracto líquido de CBD tomado bajo la lengua para absorción rápida y dosificación precisa.",
    simple_definition: "CBD líquido que se toma bajo la lengua para efecto rápido."
  },
  "CBDA": {
    term: "CBDA",
    slug: "cbda",
    definition: "CBDA (ácido cannabidiólico) es la forma cruda y ácida del CBD encontrada en el cáñamo fresco. Se convierte en CBD a través del calor en un proceso llamado descarboxilación.",
    simple_definition: "Forma cruda del CBD que se encuentra en la planta fresca."
  },
  "CBDV": {
    term: "CBDV",
    slug: "cbdv",
    definition: "CBDV (cannabidivarina) es un cannabinoide no psicoactivo similar al CBD. Investigación temprana sugiere beneficios potenciales para náuseas y condiciones neurológicas.",
    simple_definition: "Cannabinoide parecido al CBD que puede ayudar con náuseas."
  },
  "CBE": {
    term: "CBE",
    slug: "cbe",
    definition: "Un cannabinoide menor formado cuando el CBD se degrada, típicamente encontrado en productos de cannabis envejecidos.",
    simple_definition: "Cannabinoide que se forma cuando el CBD envejece."
  },
  "Certificate of Analysis": {
    term: "Certificado de Análisis",
    slug: "certificado-analisis",
    definition: "Un Certificado de Análisis (COA) es un informe de laboratorio independiente que muestra el contenido de cannabinoides, potencia y resultados de pruebas de contaminantes para productos de CBD.",
    simple_definition: "Documento oficial que verifica la calidad y contenido de un producto CBD."
  },
  "cGMP (Current Good Manufacturing Practice)": {
    term: "cGMP (Buenas Prácticas de Fabricación Actuales)",
    slug: "cgmp-buenas-practicas-fabricacion",
    definition: "Estándares de fabricación farmacéutica que aseguran la calidad y consistencia del producto.",
    simple_definition: "Normas estrictas de calidad para fabricar productos seguros."
  },
  "Chemotherapy-Induced Nausea": {
    term: "Náuseas Inducidas por Quimioterapia",
    slug: "nauseas-quimioterapia",
    definition: "Náuseas relacionadas con el tratamiento donde los cannabinoides son antieméticos aprobados en varios países.",
    simple_definition: "Náuseas del tratamiento del cáncer que los cannabinoides pueden aliviar."
  },
  "Chromatography": {
    term: "Cromatografía",
    slug: "cromatografia",
    definition: "Una técnica de separación utilizada para purificar cannabinoides o eliminar compuestos no deseados del extracto de cáñamo.",
    simple_definition: "Método científico para purificar y separar compuestos."
  },
  "Chronic Pain": {
    term: "Dolor Crónico",
    slug: "dolor-cronico",
    definition: "El CBD puede ayudar a controlar el dolor crónico a través de efectos antiinflamatorios e interacción con receptores del dolor. Muchos usuarios reportan alivio del dolor persistente.",
    simple_definition: "Dolor de larga duración que el CBD puede ayudar a aliviar."
  },
  "Clinical Trial": {
    term: "Ensayo Clínico",
    slug: "ensayo-clinico",
    definition: "Estudio de investigación controlado que prueba tratamientos en participantes humanos.",
    simple_definition: "Estudios científicos que prueban medicinas en personas."
  },
  "CO2 Extraction": {
    term: "Extracción con CO2",
    slug: "extraccion-co2",
    definition: "La extracción con CO2 utiliza dióxido de carbono presurizado para extraer CBD de las plantas de cáñamo. Produce extractos puros, libres de solventes y es el estándar de oro de la industria.",
    simple_definition: "Método de extracción limpio usando gas CO2 presurizado."
  },
  "Cold Press Extraction": {
    term: "Extracción por Prensado en Frío",
    slug: "extraccion-prensado-frio",
    definition: "Prensar semillas de cáñamo a bajas temperaturas para extraer aceite—procesamiento mínimo.",
    simple_definition: "Método suave de extraer aceite sin usar calor."
  },
  "Compassionate Use": {
    term: "Uso Compasivo",
    slug: "uso-compasivo",
    definition: "Programas que permiten acceso a tratamientos no aprobados para pacientes gravemente enfermos.",
    simple_definition: "Acceso especial a medicinas experimentales para casos graves."
  },
  "Contamination": {
    term: "Contaminación",
    slug: "contaminacion",
    definition: "Presencia de sustancias dañinas no deseadas en productos de CBD.",
    simple_definition: "Sustancias peligrosas que no deberían estar en los productos."
  },
  "Contraindication": {
    term: "Contraindicación",
    slug: "contraindicacion",
    definition: "Una condición o factor que hace que el uso de CBD sea desaconsejable o arriesgado.",
    simple_definition: "Razón médica por la cual no se debe usar CBD."
  },
  "Controlled Substance": {
    term: "Sustancia Controlada",
    slug: "sustancia-controlada",
    definition: "Las sustancias controladas están reguladas por la DEA. Mientras el cannabis es Anexo I federalmente, el CBD derivado de cáñamo bajo 0.3% THC no es una sustancia controlada.",
    simple_definition: "Drogas reguladas por el gobierno; el CBD de cáñamo no lo es."
  },
  "Cosmetic CBD Regulations": {
    term: "Regulaciones de CBD Cosmético",
    slug: "regulaciones-cbd-cosmetico",
    definition: "Normas que rigen el uso de CBD en productos de cuidado de la piel y belleza.",
    simple_definition: "Reglas sobre el uso de CBD en productos de belleza."
  },
  "Crohn's Disease": {
    term: "Enfermedad de Crohn",
    slug: "enfermedad-crohn",
    definition: "Enfermedad inflamatoria intestinal donde el CBD puede reducir la inflamación intestinal.",
    simple_definition: "Enfermedad intestinal grave que causa inflamación."
  },
  "Crude Oil": {
    term: "Aceite Crudo",
    slug: "aceite-crudo",
    definition: "El extracto inicial no refinado del cáñamo que contiene todos los compuestos de la planta.",
    simple_definition: "Primera extracción sin refinar de la planta de cáñamo."
  },
  "Cruelty-Free": {
    term: "Libre de Crueldad",
    slug: "libre-crueldad",
    definition: "Productos no probados en animales; busque certificación Leaping Bunny o PETA.",
    simple_definition: "Productos no probados en animales."
  },
  "Crumble": {
    term: "Crumble",
    slug: "crumble",
    definition: "Concentrado de cannabis seco y desmenuzable que es fácil de manejar y dosificar.",
    simple_definition: "Concentrado de textura quebradiza fácil de usar."
  },
  "Cultivar": {
    term: "Cultivar",
    slug: "cultivar",
    definition: "Una variedad cultivada de cannabis criada para características deseables específicas.",
    simple_definition: "Variedad específica de cannabis con propiedades particulares."
  },
  "Curing": {
    term: "Curado",
    slug: "curado",
    definition: "El proceso de secado controlado que conserva cannabinoides y terpenos en el cáñamo cosechado.",
    simple_definition: "Proceso de secado que conserva la calidad de la planta."
  },
  "CYP450 Enzymes": {
    term: "Enzimas CYP450",
    slug: "enzimas-cyp450",
    definition: "Enzimas hepáticas que metabolizan el CBD y muchos medicamentos—la base de las interacciones farmacológicas.",
    simple_definition: "Enzimas del hígado que procesan medicinas y pueden interactuar con CBD."
  },
  "Dab": {
    term: "Dab",
    slug: "dab",
    definition: "Un método de consumir concentrados de cannabis vaporizándolos en una superficie calentada.",
    simple_definition: "Forma de consumir concentrados usando calor intenso."
  },
  "Decarboxylation": {
    term: "Descarboxilación",
    slug: "descarboxilacion",
    definition: "La descarboxilación es el proceso de calor que convierte CBDA ácido en CBD activo. El cáñamo crudo contiene cannabinoides ácidos que deben calentarse para activarse.",
    simple_definition: "Proceso de calentar la planta para activar los cannabinoides."
  },
  "Delta-8-THC": {
    term: "Delta-8-THC",
    slug: "delta-8-thc",
    definition: "Delta-8 THC es un cannabinoide ligeramente psicoactivo derivado del CBD de cáñamo. Ofrece una experiencia menos intensa que Delta-9 THC con ambigüedad legal.",
    simple_definition: "Forma de THC menos potente derivada del CBD de cáñamo."
  },
  "Diabetes": {
    term: "Diabetes",
    slug: "diabetes",
    definition: "Una enfermedad metabólica que afecta la regulación del azúcar en sangre.",
    simple_definition: "Enfermedad que afecta los niveles de azúcar en la sangre."
  },
  "Disposable Vape": {
    term: "Vapeador Desechable",
    slug: "vapeador-desechable",
    definition: "Dispositivos de vapeo de CBD de un solo uso, prellenados, que se descartan después de que se agota el aceite.",
    simple_definition: "Dispositivo de vapeo que se usa una vez y se tira."
  },
  "Distillate": {
    term: "Destilado",
    slug: "destilado",
    definition: "Un extracto de cannabis altamente refinado que contiene cannabinoides aislados, típicamente 85-95% de THC o CBD puro.",
    simple_definition: "Aceite muy concentrado de cannabinoides purificados."
  },
  "Distillation": {
    term: "Destilación",
    slug: "destilacion",
    definition: "La destilación de CBD es un proceso de purificación usando calor y vacío para aislar cannabinoides. Produce aceite de CBD altamente concentrado, típicamente 80-90% puro.",
    simple_definition: "Proceso que concentra y purifica el CBD usando calor."
  },
  "Dose": {
    term: "Dosis",
    slug: "dosis",
    definition: "Una dosis es la cantidad específica de una sustancia (como CBD) administrada de una vez, medida en miligramos (mg).",
    simple_definition: "Cantidad específica de CBD que se toma cada vez."
  },
  "Double-Blind Study": {
    term: "Estudio Doble Ciego",
    slug: "estudio-doble-ciego",
    definition: "Investigación donde ni los participantes ni los investigadores saben quién recibe el tratamiento versus placebo.",
    simple_definition: "Estudio donde nadie sabe quién recibe la medicina real."
  },
  "Dravet Syndrome": {
    term: "Síndrome de Dravet",
    slug: "sindrome-dravet",
    definition: "Una epilepsia infantil rara y severa para la cual el CBD (Epidiolex) está aprobado por las agencias reguladoras.",
    simple_definition: "Tipo grave de epilepsia infantil que el CBD puede tratar."
  },
  "Drowsiness": {
    term: "Somnolencia",
    slug: "somnolencia",
    definition: "Sensación de sueño que puede ocurrir con CBD, especialmente en dosis altas.",
    simple_definition: "Sensación de cansancio o sueño por el CBD."
  },
  "Drug Interaction": {
    term: "Interacción Farmacológica",
    slug: "interaccion-farmacologica",
    definition: "Las interacciones farmacológicas del CBD ocurren porque el CBD afecta las enzimas hepáticas que metabolizan muchos medicamentos. Siempre consulte a un médico antes de combinar CBD con fármacos.",
    simple_definition: "El CBD puede alterar el efecto de otros medicamentos."
  },
  "Dry Mouth": {
    term: "Boca Seca",
    slug: "boca-seca",
    definition: "Un efecto secundario común del CBD donde la producción de saliva disminuye temporalmente.",
    simple_definition: "Sensación de sequedad en la boca por el CBD."
  },
  "Duration of Effects": {
    term: "Duración de los Efectos",
    slug: "duracion-efectos",
    definition: "Cuánto tiempo persisten los efectos del CBD después de que comienzan, variando según el método de consumo.",
    simple_definition: "Tiempo que duran los efectos del CBD en el cuerpo."
  },
  "Eczema": {
    term: "Eccema",
    slug: "eccema",
    definition: "Una condición inflamatoria crónica de la piel que causa parches rojos, secos y con picazón.",
    simple_definition: "Problema de piel que causa picazón e inflamación."
  },
  "Edible": {
    term: "Comestible",
    slug: "comestible",
    definition: "Productos de comida o bebida infusionados con CBD para consumo conveniente y sabroso.",
    simple_definition: "Alimentos o bebidas que contienen CBD."
  },
  "Efficacy": {
    term: "Eficacia",
    slug: "eficacia",
    definition: "Qué tan bien funciona un tratamiento bajo condiciones ideales y controladas.",
    simple_definition: "Qué tan bien funciona realmente un tratamiento."
  },
  "Endocannabinoid Deficiency": {
    term: "Deficiencia Endocannabinoide",
    slug: "deficiencia-endocannabinoide",
    definition: "Teoría de que niveles inadecuados de endocannabinoides pueden causar ciertas condiciones crónicas.",
    simple_definition: "Teoría de que algunas enfermedades vienen por falta de cannabinoides naturales."
  },
  "Endocannabinoid System": {
    term: "Sistema Endocannabinoide",
    slug: "sistema-endocannabinoide",
    definition: "El sistema endocannabinoide (SEC) regula el equilibrio en el cuerpo incluyendo el estado de ánimo, sueño, apetito y respuesta al dolor. El CBD interactúa con este sistema.",
    simple_definition: "Sistema corporal que regula el equilibrio y donde actúa el CBD."
  },
  "Endocannabinoid Tone": {
    term: "Tono Endocannabinoide",
    slug: "tono-endocannabinoide",
    definition: "El nivel basal de actividad del sistema endocannabinoide en el cuerpo.",
    simple_definition: "Nivel normal de actividad del sistema endocannabinoide."
  },
  "Endometriosis": {
    term: "Endometriosis",
    slug: "endometriosis",
    definition: "Una condición dolorosa que involucra crecimiento de tejido fuera del útero; algunos usan CBD para manejo de síntomas.",
    simple_definition: "Condición ginecológica dolorosa que puede tratarse con CBD."
  },
  "Entourage Effect": {
    term: "Efecto Séquito",
    slug: "efecto-sequito",
    definition: "El efecto séquito describe cómo los cannabinoides y terpenos trabajan juntos sinérgicamente, potencialmente haciendo el CBD de espectro completo más efectivo en general.",
    simple_definition: "Cuando todos los compuestos de la planta trabajan mejor juntos."
  },
  "Epidiolex": {
    term: "Epidiolex",
    slug: "epidiolex",
    definition: "El primer medicamento de CBD aprobado por las agencias reguladoras para tratar formas severas de epilepsia.",
    simple_definition: "Medicina oficial de CBD para epilepsia severa."
  },
  "Ethanol Extraction": {
    term: "Extracción con Etanol",
    slug: "extraccion-etanol",
    definition: "La extracción con etanol utiliza alcohol de grado alimentario para extraer cannabinoides de las plantas de cáñamo. Es eficiente y puede preservar el espectro completo de compuestos.",
    simple_definition: "Método de extracción usando alcohol puro."
  },
  "EU Organic Certification": {
    term: "Certificación Orgánica UE",
    slug: "certificacion-organica-ue",
    definition: "Estándar orgánico europeo para cultivo de cáñamo, indicado por el logo de hoja verde.",
    simple_definition: "Sello oficial europeo que garantiza cultivo orgánico."
  },
  "EU-GMP Certification": {
    term: "Certificación UE-GMP",
    slug: "certificacion-ue-gmp",
    definition: "Estándar de fabricación europeo más alto para productos de CBD de grado farmacéutico.",
    simple_definition: "Certificación europea de máxima calidad farmacéutica."
  },
  "Eucalyptol": {
    term: "Eucaliptol",
    slug: "eucaliptol",
    definition: "Un terpeno refrescante, mentolado con beneficios respiratorios y apoyo cognitivo.",
    simple_definition: "Compuesto refrescante que ayuda a la respiración y concentración."
  },
  "FAAH Enzyme": {
    term: "Enzima FAAH",
    slug: "enzima-faah",
    definition: "La enzima que descompone la anandamida; el CBD inhibe FAAH para aumentar los niveles de anandamida.",
    simple_definition: "Enzima que el CBD bloquea para aumentar la felicidad natural."
  },
  "Feminized Seeds": {
    term: "Semillas Feminizadas",
    slug: "semillas-feminizadas",
    definition: "Semillas criadas para producir solo plantas hembra para máxima producción de cannabinoides.",
    simple_definition: "Semillas que solo producen plantas hembra de alta calidad."
  },
  "Fibromyalgia": {
    term: "Fibromialgia",
    slug: "fibromialgia",
    definition: "Condición de dolor crónico donde el CBD puede ayudar a través de efectos antiinflamatorios y del sueño.",
    simple_definition: "Enfermedad que causa dolor generalizado que el CBD puede aliviar."
  },
  "First-Pass Metabolism": {
    term: "Metabolismo de Primer Paso",
    slug: "metabolismo-primer-paso",
    definition: "Procesamiento hepático que reduce la biodisponibilidad del CBD cuando se consume oralmente.",
    simple_definition: "Proceso del hígado que reduce la cantidad de CBD que llega a la sangre."
  },
  "Flavonoids": {
    term: "Flavonoides",
    slug: "flavonoides",
    definition: "Los flavonoides son compuestos vegetales encontrados en el cannabis que proporcionan color y pueden ofrecer beneficios antiinflamatorios y antioxidantes, trabajando junto a cannabinoides en el efecto séquito.",
    simple_definition: "Compuestos que dan color a las plantas y tienen efectos beneficiosos."
  },
  "Flower": {
    term: "Flor",
    slug: "flor",
    definition: "La parte fumable de la planta de cannabis que contiene la concentración más alta de cannabinoides.",
    simple_definition: "Cogollos de la planta con más concentración de cannabinoides."
  },
  "Food Supplement Classification": {
    term: "Clasificación de Suplemento Alimentario",
    slug: "clasificacion-suplemento-alimentario",
    definition: "La categoría regulatoria que determina cómo se pueden vender y comercializar los productos de CBD.",
    simple_definition: "Categoría legal que define cómo se puede vender el CBD."
  },
  "Full Spectrum": {
    term: "Espectro Completo",
    slug: "espectro-completo",
    definition: "El CBD de espectro completo contiene todos los compuestos de la planta de cáñamo incluyendo cannabinoides, terpenos y THC traza bajo 0.3%. Se beneficia del efecto séquito.",
    simple_definition: "CBD con todos los compuestos naturales de la planta incluido THC mínimo."
  },
  "Gas Chromatography": {
    term: "Cromatografía de Gases",
    slug: "cromatografia-gases",
    definition: "Un método de prueba basado en calor menos adecuado para productos de CBD ya que altera los cannabinoides ácidos.",
    simple_definition: "Método de análisis con calor que no es ideal para CBD."
  },
  "Generalized Anxiety Disorder": {
    term: "Trastorno de Ansiedad Generalizada",
    slug: "trastorno-ansiedad-generalizada",
    definition: "Una condición crónica de preocupación excesiva; el CBD muestra promesa como opción de tratamiento.",
    simple_definition: "Ansiedad constante y excesiva que el CBD puede ayudar a tratar."
  },
  "Geraniol": {
    term: "Geraniol",
    slug: "geraniol",
    definition: "El geraniol es un terpeno floral, con aroma a rosa encontrado en el cáñamo y geranios. Puede tener propiedades neuroprotectoras y antioxidantes cuando se combina con CBD.",
    simple_definition: "Compuesto aromático a rosa con efectos protectores del cerebro."
  },
  "Glaucoma": {
    term: "Glaucoma",
    slug: "glaucoma",
    definition: "Condición ocular que causa daño nervioso donde el THC puede reducir temporalmente la presión ocular.",
    simple_definition: "Enfermedad de los ojos que aumenta la presión interna."
  },
  "GMP": {
    term: "GMP",
    slug: "gmp",
    definition: "Estándares de calidad para producción farmacéutica y de suplementos que aseguran consistencia y seguridad.",
    simple_definition: "Normas de calidad para fabricar productos seguros."
  },
  "GPR55 Receptor": {
    term: "Receptor GPR55",
    slug: "receptor-gpr55",
    definition: "Un receptor huérfano que responde a cannabinoides, a veces llamado el tercer receptor cannabinoide.",
    simple_definition: "Receptor adicional donde pueden actuar los cannabinoides."
  },
  "Grapefruit Interaction": {
    term: "Interacción con Pomelo",
    slug: "interaccion-pomelo",
    definition: "Si su medicamento advierte contra el pomelo, probablemente también interactúa con el CBD.",
    simple_definition: "Si no puedes comer pomelo con tu medicina, tampoco CBD."
  },
  "Halal CBD": {
    term: "CBD Halal",
    slug: "cbd-halal",
    definition: "Productos de CBD conformes con la ley islámica; deben estar libres de THC y alcohol.",
    simple_definition: "CBD permitido por la religión musulmana."
  },
  "Half-life": {
    term: "Vida Media",
    slug: "vida-media",
    definition: "La vida media del CBD es el tiempo para que la mitad del compuesto salga de su cuerpo, típicamente 18-32 horas. Factores incluyen dosis, frecuencia de uso y tasa de metabolismo.",
    simple_definition: "Tiempo que tarda el cuerpo en eliminar la mitad del CBD."
  },
  "Hash": {
    term: "Hachís",
    slug: "hachis",
    definition: "Concentrado tradicional hecho de tricomas de cannabis comprimidos.",
    simple_definition: "Concentrado tradicional hecho de resina de cannabis."
  },
  "Heavy Metals Testing": {
    term: "Pruebas de Metales Pesados",
    slug: "pruebas-metales-pesados",
    definition: "Análisis de laboratorio que verifica metales tóxicos como plomo, mercurio, arsénico y cadmio en productos de CBD.",
    simple_definition: "Análisis que verifica que no hay metales peligrosos en el CBD."
  },
  "Hemp": {
    term: "Cáñamo",
    slug: "canamo",
    definition: "El cáñamo es Cannabis sativa que contiene menos de 0.3% THC. Legalmente federal bajo la Ley Agrícola 2018, es la fuente de la mayoría de productos de CBD en EE.UU.",
    simple_definition: "Tipo de cannabis legal con muy poco THC del que se saca el CBD."
  },
  "Hemp License": {
    term: "Licencia de Cáñamo",
    slug: "licencia-canamo",
    definition: "Un permiso requerido para cultivo, procesamiento o ventas legales de cáñamo.",
    simple_definition: "Permiso oficial para cultivar o vender cáñamo legalmente."
  },
  "Hemp Seed Oil": {
    term: "Aceite de Semilla de Cáñamo",
    slug: "aceite-semilla-canamo",
    definition: "El aceite de semilla de cáñamo se prensa de semillas de cáñamo y no contiene CBD ni cannabinoides THC. Es nutritivo pero diferente del aceite de CBD extraído de flores.",
    simple_definition: "Aceite nutritivo de semillas sin CBD, diferente del aceite de CBD."
  },
  "Hemp vs Marijuana": {
    term: "Cáñamo vs Marihuana",
    slug: "canamo-vs-marihuana",
    definition: "El cáñamo y la marihuana son ambos cannabis pero difieren legalmente por contenido de THC. El cáñamo tiene bajo 0.3% THC y es legal; la marihuana tiene más y está restringida.",
    simple_definition: "El cáñamo es cannabis legal con poco THC, la marihuana tiene mucho THC."
  },
  "HHC": {
    term: "HHC",
    slug: "hhc",
    definition: "Una forma hidrogenada de THC que produce efectos psicoactivos similares pero distintos.",
    simple_definition: "Forma modificada de THC con efectos parecidos pero diferentes."
  },
  "Homeostasis": {
    term: "Homeostasis",
    slug: "homeostasis",
    definition: "La homeostasis es el estado de equilibrio interno del cuerpo. El sistema endocannabinoide ayuda a mantener la homeostasis, y el CBD puede apoyar esta función de equilibrio.",
    simple_definition: "Estado de equilibrio natural del cuerpo que el CBD ayuda a mantener."
  },
  "HPLC": {
    term: "HPLC",
    slug: "hplc",
    definition: "El método de laboratorio estándar para probar con precisión el contenido de cannabinoides en productos de CBD.",
    simple_definition: "Método científico más preciso para analizar cannabinoides."
  },
  "Humulene": {
    term: "Humuleno",
    slug: "humuleno",
    definition: "El humuleno es un terpeno terroso, leñoso en el cáñamo y lúpulo. Puede tener propiedades supresoras del apetito y antiinflamatorias combinadas con cannabinoides.",
    simple_definition: "Compuesto terroso que puede reducir el apetito e inflamación."
  },
  "Huntington's Disease": {
    term: "Enfermedad de Huntington",
    slug: "enfermedad-huntington",
    definition: "Un trastorno cerebral genético que causa problemas progresivos de movimiento, cognitivos y psiquiátricos.",
    simple_definition: "Enfermedad genética grave que afecta movimiento y mente."
  },
  "Hydrocarbon Extraction": {
    term: "Extracción con Hidrocarburos",
    slug: "extraccion-hidrocarburos",
    definition: "La extracción con hidrocarburos usa butano o propano para extraer cannabinoides del cáñamo. Requiere purga cuidadosa para eliminar todo residuo de solvente de manera segura.",
    simple_definition: "Método de extracción con gases que requiere limpieza cuidadosa."
  },
  "Hydrophobic": {
    term: "Hidrofóbico",
    slug: "hidrofobico",
    definition: "Propiedad repelente al agua de los cannabinoides que requiere formulaciones especiales para bebidas.",
    simple_definition: "Los cannabinoides no se mezclan bien con agua."
  },
  "IBS": {
    term: "SII",
    slug: "sii",
    definition: "Un trastorno digestivo que puede responder al tratamiento cannabinoide a través de receptores intestinales.",
    simple_definition: "Problema digestivo que causa dolor abdominal y cambios intestinales."
  },
  "Import/Export Regulations": {
    term: "Regulaciones de Importación/Exportación",
    slug: "regulaciones-importacion-exportacion",
    definition: "Reglas que gobiernan el comercio internacional de productos de cáñamo y CBD.",
    simple_definition: "Normas para mover productos de CBD entre países."
  },
  "In Vitro": {
    term: "In Vitro",
    slug: "in-vitro",
    definition: "Investigación conducida en tubos de ensayo o placas de Petri fuera de organismos vivos.",
    simple_definition: "Estudios hechos en laboratorio, no en seres vivos."
  },
  "In Vivo": {
    term: "In Vivo",
    slug: "in-vivo",
    definition: "Investigación conducida en organismos vivos como animales o humanos.",
    simple_definition: "Estudios realizados en animales o personas vivas."
  },
  "Inactive Ingredients": {
    term: "Ingredientes Inactivos",
    slug: "ingredientes-inactivos",
    definition: "Componentes no-CBD como aceites portadores y saborizantes; verifique alergenos.",
    simple_definition: "Otros componentes del producto además del CBD."
  },
  "Inhalation": {
    term: "Inhalación",
    slug: "inhalacion",
    definition: "La inhalación de CBD a través de vapeo proporciona el inicio más rápido de efectos, típicamente en minutos. Ofrece alta biodisponibilidad pero puede afectar los pulmones.",
    simple_definition: "Respirar vapores de CBD para efectos rápidos."
  },
  "Insomnia": {
    term: "Insomnio",
    slug: "insomnio",
    definition: "El CBD puede apoyar el sueño abordando factores como ansiedad y dolor que interrumpen el descanso. Algunos usuarios combinan CBD con CBN o melatonina para mejor sueño.",
    simple_definition: "Dificultad para dormir que el CBD puede ayudar a mejorar."
  },
  "ISO 17025 Accreditation": {
    term: "Acreditación ISO 17025",
    slug: "acreditacion-iso-17025",
    definition: "Un estándar internacional que asegura competencia y fiabilidad en pruebas de laboratorio.",
    simple_definition: "Certificación que garantiza calidad en análisis de laboratorio."
  },
  "ISO Certification": {
    term: "Certificación ISO",
    slug: "certificacion-iso",
    definition: "Estándares internacionales de calidad; ISO 17025 para laboratorios, ISO 9001 para fabricantes.",
    simple_definition: "Sellos de calidad internacional para laboratorios y empresas."
  },
  "Kief": {
    term: "Kief",
    slug: "kief",
    definition: "Polvo fino de tricomas de cannabis, más potente que la flor.",
    simple_definition: "Polvo concentrado de los cristales de la planta."
  },
  "Kosher CBD": {
    term: "CBD Kosher",
    slug: "cbd-kosher",
    definition: "Productos de CBD certificados para cumplir las leyes dietéticas judías bajo supervisión rabínica.",
    simple_definition: "CBD que cumple las normas alimentarias judías."
  },
  "Lab Report": {
    term: "Informe de Laboratorio",
    slug: "informe-laboratorio",
    definition: "Documento que muestra resultados de pruebas de análisis independiente de laboratorio de productos de CBD.",
    simple_definition: "Documento oficial que verifica la calidad del producto CBD."
  },
  "Limonene": {
    term: "Limoneno",
    slug: "limoneno",
    definition: "El limoneno es un terpeno con aroma cítrico encontrado en el cáñamo y frutas cítricas. Puede promover estado de ánimo elevado y proporcionar alivio del estrés cuando se combina con CBD.",
    simple_definition: "Compuesto cítrico que mejora el ánimo y reduce el estrés."
  },
  "Linalool": {
    term: "Linalol",
    slug: "linalol",
    definition: "El linalol es un terpeno floral encontrado en el cáñamo y plantas de lavanda. Conocido por sus propiedades calmantes, puede potenciar los efectos relajantes de productos de CBD.",
    simple_definition: "Compuesto floral que potencia los efectos relajantes del CBD."
  },
  "Lipophilic": {
    term: "Lipofílico",
    slug: "lipofilico",
    definition: "Propiedad liposoluble de los cannabinoides que afecta la absorción y almacenamiento en el cuerpo.",
    simple_definition: "Los cannabinoides se disuelven en grasa, no en agua."
  },
  "Liposomal CBD": {
    term: "CBD Liposomal",
    slug: "cbd-liposomal",
    definition: "CBD encapsulado en pequeñas esferas de grasa (liposomas) para entrega y absorción mejoradas.",
    simple_definition: "CBD envuelto en grasa para mejor absorción."
  },
  "Live Resin": {
    term: "Resina Viva",
    slug: "resina-viva",
    definition: "Concentrado premium de cannabis flash-congelado que conserva el perfil completo de terpenos.",
    simple_definition: "Concentrado de alta calidad que conserva todos los aromas."
  },
  "Liver Enzymes": {
    term: "Enzimas Hepáticas",
    slug: "enzimas-hepaticas",
    definition: "Dosis altas de CBD pueden elevar las enzimas hepáticas—importante para aquellos con condiciones hepáticas.",
    simple_definition: "El CBD puede afectar las enzimas del hígado en dosis altas."
  },
  "Maintenance Dose": {
    term: "Dosis de Mantenimiento",
    slug: "dosis-mantenimiento",
    definition: "La cantidad continua de CBD que proporciona beneficios consistentes y sostenidos.",
    simple_definition: "Cantidad regular de CBD para mantener los beneficios."
  },
  "Marijuana": {
    term: "Marihuana",
    slug: "marihuana",
    definition: "Cannabis que contiene más de 0.3% THC, psicoactivo y legalmente restringido.",
    simple_definition: "Cannabis con mucho THC que es psicoactivo e ilegal."
  },
  "MCT Oil": {
    term: "Aceite MCT",
    slug: "aceite-mct",
    definition: "El aceite MCT (triglicéridos de cadena media) es un aceite portador popular de CBD derivado del coco. Mejora la absorción y proporciona energía rápida al cuerpo.",
    simple_definition: "Aceite de coco que ayuda al cuerpo a absorber mejor el CBD."
  },
  "Meta-Analysis": {
    term: "Metaanálisis",
    slug: "metaanalisis",
    definition: "Método estadístico que combina resultados de múltiples estudios para evidencia más fuerte.",
    simple_definition: "Análisis que junta muchos estudios para obtener mejores conclusiones."
  },
  "mg/mL Calculation": {
    term: "Cálculo mg/mL",
    slug: "calculo-mg-ml",
    definition: "Para encontrar CBD por mL: divida mg totales por mL del frasco. Un gotero típicamente equivale a 1mL.",
    simple_definition: "Cómo calcular cuánto CBD hay en cada gota del frasco."
  },
  "Microbial Testing": {
    term: "Pruebas Microbianas",
    slug: "pruebas-microbianas",
    definition: "Pruebas para bacterias, moho, levadura y otros microorganismos en productos de CBD.",
    simple_definition: "Análisis que verifica que no hay gérmenes peligrosos en el CBD."
  },
  "Microdosing": {
    term: "Microdosificación",
    slug: "microdosificacion",
    definition: "Tomar cantidades muy pequeñas de CBD varias veces al día para efectos sutiles y consistentes.",
    simple_definition: "Tomar cantidades muy pequeñas de CBD varias veces al día."
  },
  "Migraine": {
    term: "Migraña",
    slug: "migrana",
    definition: "Trastorno de dolor de cabeza severo potencialmente vinculado a deficiencia endocannabinoide.",
    simple_definition: "Dolor de cabeza muy intenso que puede tratarse con cannabinoides."
  },
  "Milligrams": {
    term: "Miligramos",
    slug: "miligramos",
    definition: "La unidad estándar de medida para contenido y dosificación de CBD.",
    simple_definition: "Unidad para medir la cantidad de CBD (mg)."
  },
  "Minimum Effective Dose": {
    term: "Dosis Efectiva Mínima",
    slug: "dosis-efectiva-minima",
    definition: "La dosis más baja de CBD que produce efectos terapéuticos deseados para un individuo.",
    simple_definition: "Cantidad más pequeña de CBD que funciona para cada persona."
  },
  "Minor Cannabinoids": {
    term: "Cannabinoides Menores",
    slug: "cannabinoides-menores",
    definition: "Compuestos de cannabis encontrados en concentraciones menores que CBD o THC, incluyendo CBG, CBN, y CBC.",
    simple_definition: "Cannabinoides presentes en pequeñas cantidades además del CBD."
  },
  "Multiple Sclerosis": {
    term: "Esclerosis Múltiple",
    slug: "esclerosis-multiple",
    definition: "Enfermedad autoinmune del nervio donde los medicamentos basados en cannabis ayudan a controlar la espasticidad.",
    simple_definition: "Enfermedad que ataca los nervios y puede tratarse con cannabis."
  },
  "Myrcene": {
    term: "Mirceno",
    slug: "mirceno",
    definition: "El mirceno es un terpeno terroso, almizclado que es abundante en el cáñamo y lúpulo. Puede mejorar la absorción de CBD y está asociado con efectos relajantes y sedantes.",
    simple_definition: "Compuesto terroso que potencia los efectos relajantes del CBD."
  },
  "Nano CBD": {
    term: "Nano CBD",
    slug: "nano-cbd",
    definition: "Partículas ultra pequeñas de CBD con solubilidad en agua mejorada y absorción más rápida.",
    simple_definition: "CBD en partículas muy pequeñas que se absorbe más rápido."
  },
  "Nasal Spray": {
    term: "Aerosol Nasal",
    slug: "aerosol-nasal",
    definition: "CBD entregado a través de membranas nasales para absorción rápida sin digestión.",
    simple_definition: "CBD que se rocía en la nariz para absorción rápida."
  },
  "Nerolidol": {
    term: "Nerolidol",
    slug: "nerolidol",
    definition: "Un terpeno leñoso-floral que mejora la penetración cutánea para aplicaciones tópicas.",
    simple_definition: "Compuesto que ayuda a que el CBD penetre mejor en la piel."
  },
  "Neuropathy": {
    term: "Neuropatía",
    slug: "neuropatia",
    definition: "Daño nervioso que causa dolor donde los cannabinoides muestran potencial significativo de alivio.",
    simple_definition: "Dolor por daño en los nervios que los cannabinoides pueden aliviar."
  },
  "Neuroprotection": {
    term: "Neuroprotección",
    slug: "neuroproteccion",
    definition: "El CBD muestra potencial neuroprotector en estudios de investigación, posiblemente apoyando la salud cerebral a través de sus mecanismos antioxidantes y antiinflamatorios.",
    simple_definition: "El CBD puede proteger las células del cerebro del daño."
  },
  "Neurotransmitter": {
    term: "Neurotransmisor",
    slug: "neurotransmisor",
    definition: "Mensajeros químicos del cerebro regulados por el sistema endocannabinoide.",
    simple_definition: "Sustancias que transmiten mensajes entre las células del cerebro."
  },
  "Non-GMO": {
    term: "No OMG",
    slug: "no-omg",
    definition: "Producto hecho sin organismos genéticamente modificados; la mayoría del cáñamo es naturalmente no OMG.",
    simple_definition: "Productos hechos sin organismos modificados genéticamente."
  },
  "Novel Food": {
    term: "Nuevo Alimento",
    slug: "nuevo-alimento",
    definition: "Clasificación UE que requiere autorización para alimentos no consumidos significativamente antes de 1997.",
    simple_definition: "Categoría europea que regula alimentos nuevos como el CBD."
  },
  "Obesity": {
    term: "Obesidad",
    slug: "obesidad",
    definition: "Una condición compleja que involucra grasa corporal excesiva que aumenta el riesgo de enfermedades.",
    simple_definition: "Exceso de peso que aumenta el riesgo de problemas de salud."
  },
  "OCD": {
    term: "TOC",
    slug: "toc",
    definition: "Un trastorno de ansiedad caracterizado por pensamientos y comportamientos repetitivos no deseados.",
    simple_definition: "Trastorno con pensamientos obsesivos y comportamientos compulsivos."
  },
  "Ocimene": {
    term: "Ocimeno",
    slug: "ocimeno",
    definition: "El ocimeno es un terpeno dulce, herbáceo encontrado en el cáñamo y varias hierbas. Puede tener propiedades antivirales y antifúngicas y añade al efecto séquito.",
    simple_definition: "Compuesto dulce que puede combatir virus y hongos."
  },
  "Onset Time": {
    term: "Tiempo de Inicio",
    slug: "tiempo-inicio",
    definition: "El tiempo entre el consumo de CBD y cuando los efectos se vuelven notables.",
    simple_definition: "Tiempo que tarda el CBD en hacer efecto."
  },
  "Oral Administration": {
    term: "Administración Oral",
    slug: "administracion-oral",
    definition: "El CBD oral involucra tragar cápsulas, comestibles, o aceites. Los efectos tardan 30-90 minutos en comenzar pero duran más que métodos sublinguales o inhalados de uso.",
    simple_definition: "Tomar CBD por la boca tragándolo."
  },
  "Organic Hemp": {
    term: "Cáñamo Orgánico",
    slug: "canamo-organico",
    definition: "Cáñamo cultivado sin químicos sintéticos, siguiendo estándares agrícolas orgánicos.",
    simple_definition: "Cáñamo cultivado sin pesticidas ni químicos artificiales."
  },
  "Over-the-Counter CBD": {
    term: "CBD de Venta Libre",
    slug: "cbd-venta-libre",
    definition: "Productos de CBD vendidos sin prescripción como suplementos o cosméticos.",
    simple_definition: "CBD que se puede comprar sin receta médica."
  },
  "Pain": {
    term: "Dolor",
    slug: "dolor",
    definition: "El dolor es una experiencia sensorial desagradable asociada con daño tisular o daño potencial, que el CBD puede ayudar a controlar.",
    simple_definition: "Sensación desagradable que el cuerpo siente cuando algo está mal."
  },
  "Parkinson's Disease": {
    term: "Enfermedad de Parkinson",
    slug: "enfermedad-parkinson",
    definition: "Un trastorno progresivo del sistema nervioso que afecta el movimiento y control motor.",
    simple_definition: "Enfermedad que causa temblores y problemas de movimiento."
  },
  "Participants": {
    term: "Participantes",
    slug: "participantes",
    definition: "Los participantes son los individuos que se ofrecen como voluntarios para participar en un estudio de investigación, también llamados sujetos o voluntarios.",
    simple_definition: "Personas que participan voluntariamente en estudios científicos."
  },
  "Peak Plasma Concentration": {
    term: "Concentración Plasmática Pico",
    slug: "concentracion-plasmatica-pico",
    definition: "El nivel máximo de CBD alcanzado en el torrente sanguíneo después de una dosis.",
    simple_definition: "Momento cuando hay más CBD en la sangre después de tomarlo."
  },
  "Peer Review": {
    term: "Revisión por Pares",
    slug: "revision-pares",
    definition: "Evaluación experta de investigación científica antes de publicación para asegurar calidad.",
    simple_definition: "Proceso donde expertos revisan estudios antes de publicarlos."
  },
  "Percentage to mg Conversion": {
    term: "Conversión de Porcentaje a mg",
    slug: "conversion-porcentaje-mg",
    definition: "Convierte porcentaje a mg multiplicando el peso del producto por el porcentaje.",
    simple_definition: "Cómo calcular miligramos a partir del porcentaje del producto."
  },
  "Pesticide Testing": {
    term: "Pruebas de Pesticidas",
    slug: "pruebas-pesticidas",
    definition: "Las pruebas de pesticidas aseguran que los productos de CBD estén libres de químicos agrícolas dañinos. Es una verificación de seguridad crítica incluida en análisis de laboratorio de terceros.",
    simple_definition: "Análisis que verifica que no hay químicos peligrosos en el CBD."
  },
  "Pet Anxiety & CBD": {
    term: "Ansiedad de Mascotas y CBD",
    slug: "ansiedad-mascotas-cbd",
    definition: "El CBD puede ayudar a mascotas con ansiedad de separación, fobia al ruido y ansiedad de viaje.",
    simple_definition: "CBD puede calmar mascotas nerviosas o estresadas."
  },
  "Pet Arthritis & CBD": {
    term: "Artritis de Mascotas y CBD",
    slug: "artritis-mascotas-cbd",
    definition: "El CBD muestra promesa para dolor articular de mascotas; estudio de Cornell mostró mejoría en perros artríticos.",
    simple_definition: "CBD puede aliviar dolor de articulaciones en mascotas."
  },
  "Pet CBD": {
    term: "CBD para Mascotas",
    slug: "cbd-mascotas",
    definition: "Productos de CBD formulados para animales con concentraciones menores e ingredientes seguros para mascotas.",
    simple_definition: "Productos de CBD especialmente hechos para animales."
  },
  "Pet CBD Dosing": {
    term: "Dosificación de CBD para Mascotas",
    slug: "dosificacion-cbd-mascotas",
    definition: "Punto de partida general: 0.25-0.5mg CBD por kg de peso corporal, dos veces al día.",
    simple_definition: "Cómo calcular la cantidad correcta de CBD para tu mascota."
  },
  "Pet CBD Product Safety": {
    term: "Seguridad de Productos de CBD para Mascotas",
    slug: "seguridad-productos-cbd-mascotas",
    definition: "Elija fórmulas específicas para mascotas; evite xilitol, chocolate, uvas, aceites esenciales y alto THC.",
    simple_definition: "Qué evitar para mantener seguras las mascotas con CBD."
  },
  "Pet Endocannabinoid System": {
    term: "Sistema Endocannabinoide de Mascotas",
    slug: "sistema-endocannabinoide-mascotas",
    definition: "Perros, gatos y la mayoría de mamíferos tienen sistemas endocannabinoides similares a los humanos.",
    simple_definition: "Las mascotas tienen el mismo sistema donde actúa el CBD que los humanos."
  },
  "Pet Seizures & CBD": {
    term: "Convulsiones de Mascotas y CBD",
    slug: "convulsiones-mascotas-cbd",
    definition: "El CBD puede reducir la frecuencia de convulsiones en perros epilépticos; investigación mostró 89% de reducción en algunos casos.",
    simple_definition: "CBD puede reducir las convulsiones en perros epilépticos."
  },
  "Phytocannabinoid": {
    term: "Fitocannabinoide",
    slug: "fitocannabinoide",
    definition: "Cannabinoides producidos naturalmente por la planta de cannabis, opuestos a aquellos hechos por el cuerpo o sintetizados.",
    simple_definition: "Cannabinoides que vienen de las plantas, no del cuerpo."
  },
  "Pinene": {
    term: "Pineno",
    slug: "pineno",
    definition: "El pineno es un terpeno con aroma a pino encontrado en el cáñamo y árboles coníferos. Puede apoyar el estado de alerta y función respiratoria mientras complementa los efectos del CBD.",
    simple_definition: "Compuesto con aroma a pino que mejora concentración y respiración."
  },
  "Placebo": {
    term: "Placebo",
    slug: "placebo",
    definition: "Un placebo es un tratamiento inactivo (como una píldora de azúcar) usado en ensayos clínicos para comparar contra el tratamiento real siendo probado.",
    simple_definition: "Tratamiento falso usado en estudios para comparar con el real."
  },
  "Placebo Effect": {
    term: "Efecto Placebo",
    slug: "efecto-placebo",
    definition: "Mejora experimentada por la creencia en un tratamiento más que por el tratamiento mismo.",
    simple_definition: "Sentirse mejor solo por creer que el tratamiento funciona."
  },
  "Potency Testing": {
    term: "Pruebas de Potencia",
    slug: "pruebas-potencia",
    definition: "Las pruebas de potencia miden la concentración de cannabinoides en productos de CBD. Verifica que los productos contienen la cantidad de CBD declarada en la etiqueta.",
    simple_definition: "Análisis que verifica cuánto CBD realmente hay en el producto."
  },
  "PPARs": {
    term: "PPARs",
    slug: "ppars",
    definition: "Receptores nucleares que regulan el metabolismo e inflamación, activados por algunos cannabinoides.",
    simple_definition: "Receptores celulares que regulan metabolismo e inflamación."
  },
  "Pre-Rolls": {
    term: "Porros Preliados",
    slug: "porros-preliados",
    definition: "Flor de cáñamo lista para fumar enrollada para consumo por inhalación conveniente.",
    simple_definition: "Cigarrillos de cáñamo ya preparados para fumar."
  },
  "Preclinical Study": {
    term: "Estudio Preclínico",
    slug: "estudio-preclinico",
    definition: "Fase de investigación antes de ensayos humanos incluyendo estudios de laboratorio y animales.",
    simple_definition: "Estudios en laboratorio y animales antes de probar en humanos."
  },
  "Prescription CBD": {
    term: "CBD con Receta",
    slug: "cbd-receta",
    definition: "CBD de grado farmacéutico que requiere prescripción médica.",
    simple_definition: "CBD medicinal que necesita receta del doctor."
  },
  "Psoriasis": {
    term: "Psoriasis",
    slug: "psoriasis",
    definition: "Una condición autoinmune de la piel que causa acumulación rápida de células cutáneas y parches escamosos.",
    simple_definition: "Enfermedad de la piel que causa placas escamosas."
  },
  "Psychoactive vs Intoxicating": {
    term: "Psicoactivo vs Intoxicante",
    slug: "psicoactivo-vs-intoxicante",
    definition: "Psicoactivo afecta la mente (como cafeína); intoxicante deteriora la función (como alcohol).",
    simple_definition: "Psicoactivo afecta el cerebro, intoxicante te hace perder el control."
  },
  "PTSD": {
    term: "TEPT",
    slug: "tept",
    definition: "Trastorno relacionado con trauma donde los cannabinoides pueden reducir ansiedad y pesadillas.",
    simple_definition: "Estrés postraumático que puede tratarse con cannabinoides."
  },
  "QR Code Verification": {
    term: "Verificación de Código QR",
    slug: "verificacion-codigo-qr",
    definition: "Código escaneable que vincula a resultados de laboratorio para su lote específico; sin código QR es una señal de alerta.",
    simple_definition: "Código que puedes escanear para ver los análisis de tu producto."
  },
  "Quality Assurance": {
    term: "Garantía de Calidad",
    slug: "garantia-calidad",
    definition: "La garantía de calidad del CBD incluye pruebas, documentación y controles de fabricación. Busque marcas con procesos QA transparentes y pruebas de terceros.",
    simple_definition: "Controles para asegurar que los productos CBD sean seguros y efectivos."
  },
  "Randomized Controlled Trial": {
    term: "Ensayo Controlado Aleatorio",
    slug: "ensayo-controlado-aleatorio",
    definition: "Un RCT es un estudio donde los participantes son asignados aleatoriamente para recibir el tratamiento siendo probado o un placebo/control, considerado el estándar de oro para investigación médica.",
    simple_definition: "Tipo de estudio más confiable donde se asignan tratamientos al azar."
  },
  "Remediation": {
    term: "Remediación",
    slug: "remediacion",
    definition: "El proceso de eliminar o reducir THC en extractos de cáñamo para cumplir con la conformidad legal.",
    simple_definition: "Proceso para quitar THC y hacer el producto legal."
  },
  "Residual Solvents": {
    term: "Solventes Residuales",
    slug: "solventes-residuales",
    definition: "Las pruebas de solventes residuales aseguran que los extractos de CBD estén libres de químicos de extracción como butano, propano y etanol que pueden permanecer después del procesamiento.",
    simple_definition: "Análisis que verifica que no quedan químicos de extracción en el CBD."
  },
  "Restless Leg Syndrome": {
    term: "Síndrome de Piernas Inquietas",
    slug: "sindrome-piernas-inquietas",
    definition: "Una condición neurológica que causa malestar en las piernas; algunos pacientes reportan que el CBD proporciona alivio.",
    simple_definition: "Problema que causa inquietud en las piernas que el CBD puede calmar."
  },
  "Results": {
    term: "Resultados",
    slug: "resultados",
    definition: "Los resultados son los hallazgos y desenlaces de un estudio de investigación que muestran si el tratamiento tuvo un efecto.",
    simple_definition: "Lo que se descubre al final de un estudio científico."
  },
  "Retrograde Signaling": {
    term: "Señalización Retrógrada",
    slug: "senalizacion-retrograda",
    definition: "El método de comunicación hacia atrás usado por endocannabinoides en el sistema nervioso.",
    simple_definition: "Forma especial como los endocannabinoides envían mensajes en el cerebro."
  },
  "Rheumatoid Arthritis": {
    term: "Artritis Reumatoide",
    slug: "artritis-reumatoide",
    definition: "Una enfermedad autoinmune que causa inflamación articular crónica, dolor y daño articular potencial.",
    simple_definition: "Enfermedad que ataca las articulaciones causando inflamación y dolor."
  },
  "Rosin": {
    term: "Rosin",
    slug: "rosin",
    definition: "Concentrado sin solventes hecho con calor y presión, no requiere químicos.",
    simple_definition: "Concentrado hecho solo con calor y presión, sin químicos."
  },
  "RSO": {
    term: "RSO",
    slug: "rso",
    definition: "Extracto de cannabis de espectro completo altamente concentrado, típicamente alto en THC.",
    simple_definition: "Aceite muy concentrado de cannabis completo."
  },
  "Schizophrenia": {
    term: "Esquizofrenia",
    slug: "esquizofrenia",
    definition: "Un trastorno mental serio que afecta el pensamiento, emociones y comportamiento.",
    simple_definition: "Enfermedad mental grave que afecta la percepción de la realidad."
  },
  "Seed-to-Sale Tracking": {
    term: "Seguimiento de Semilla a Venta",
    slug: "seguimiento-semilla-venta",
    definition: "Sistemas regulatorios que rastrean productos de cáñamo desde cultivo hasta venta al detalle.",
    simple_definition: "Sistema que sigue los productos desde que se plantan hasta que se venden."
  },
  "Serotonin Receptors (5-HT1A)": {
    term: "Receptores de Serotonina (5-HT1A)",
    slug: "receptores-serotonina-5ht1a",
    definition: "Un subtipo de receptor de serotonina directamente activado por CBD, potencialmente explicando sus efectos anti-ansiedad.",
    simple_definition: "Receptores del cerebro que el CBD activa para reducir la ansiedad."
  },
  "Serving Size": {
    term: "Tamaño de Porción",
    slug: "tamano-porcion",
    definition: "El tamaño de porción de CBD es la cantidad recomendada por uso, típicamente listada en etiquetas de productos. Ayuda a consumidores calcular su ingesta diaria total de CBD.",
    simple_definition: "Cantidad recomendada de CBD para tomar cada vez."
  },
  "Shatter": {
    term: "Shatter",
    slug: "shatter",
    definition: "Concentrado de cannabis similar al vidrio, altamente puro que se quiebra cuando se rompe.",
    simple_definition: "Concentrado duro y transparente como vidrio."
  },
  "Shelf Life": {
    term: "Vida Útil",
    slug: "vida-util",
    definition: "Cuánto tiempo un producto de CBD permanece efectivo, típicamente 1-2 años si se almacena adecuadamente.",
    simple_definition: "Tiempo que dura un producto CBD antes de vencer."
  },
  "Short Path Distillation": {
    term: "Destilación de Camino Corto",
    slug: "destilacion-camino-corto",
    definition: "Una técnica de destilación al vacío para crear destilados de cannabinoides altamente concentrados.",
    simple_definition: "Método avanzado para concentrar cannabinoides al máximo."
  },
  "Side Effects": {
    term: "Efectos Secundarios",
    slug: "efectos-secundarios",
    definition: "Efectos no deseados que pueden ocurrir al usar CBD, típicamente leves.",
    simple_definition: "Efectos no deseados que puede causar el CBD."
  },
  "Sleep": {
    term: "Sueño",
    slug: "sueno",
    definition: "El sueño es un estado natural de descanso esencial para la salud. El CBD ha sido estudiado por beneficios potenciales en mejorar la calidad y duración del sueño.",
    simple_definition: "Descanso natural que el CBD puede ayudar a mejorar."
  },
  "Softgels": {
    term: "Cápsulas Blandas",
    slug: "capsulas-blandas",
    definition: "Cápsulas de gelatina blanda que contienen aceite líquido de CBD para potencialmente mejor absorción.",
    simple_definition: "Cápsulas suaves que pueden absorberse mejor que las duras."
  },
  "Solventless Extraction": {
    term: "Extracción Sin Solventes",
    slug: "extraccion-sin-solventes",
    definition: "Métodos de extracción usando solo calor, presión o agua—sin solventes químicos.",
    simple_definition: "Métodos de extracción que no usan químicos."
  },
  "Starting Dose": {
    term: "Dosis Inicial",
    slug: "dosis-inicial",
    definition: "La cantidad inicial recomendada de CBD para usuarios nuevos, típicamente 5-20mg diarios.",
    simple_definition: "Cantidad recomendada para empezar a usar CBD por primera vez."
  },
  "Strain": {
    term: "Cepa",
    slug: "cepa",
    definition: "Una variedad específica de cannabis con características distintivas, siendo reemplazada por 'cultivar'.",
    simple_definition: "Variedad específica de cannabis con propiedades únicas."
  },
  "Sublingual": {
    term: "Sublingual",
    slug: "sublingual",
    definition: "La administración sublingual de CBD involucra mantener aceite bajo la lengua por 60-90 segundos. Este método de entrega proporciona absorción más rápida que tragar.",
    simple_definition: "Poner CBD bajo la lengua para absorción rápida."
  },
  "Substance Use Disorder": {
    term: "Trastorno por Uso de Sustancias",
    slug: "trastorno-uso-sustancias",
    definition: "Una condición que involucra uso compulsivo de sustancias a pesar de consecuencias dañinas.",
    simple_definition: "Adicción o dependencia de drogas o alcohol."
  },
  "Supercritical Extraction": {
    term: "Extracción Supercrítica",
    slug: "extraccion-supercritica",
    definition: "Usar CO₂ en estado supercrítico (híbrido líquido-gas) para extracción precisa de cannabinoides.",
    simple_definition: "Método avanzado usando CO₂ especial para extraer cannabinoides."
  },
  "Suppository": {
    term: "Supositorio",
    slug: "supositorio",
    definition: "Los supositorios de CBD entregan cannabidiol rectal o vaginalmente para absorción directa. Evitan el metabolismo de primer paso para efectos más rápidos y fuertes.",
    simple_definition: "CBD en forma sólida para insertar y absorción directa."
  },
  "Symptoms": {
    term: "Síntomas",
    slug: "sintomas",
    definition: "Los síntomas son signos físicos o mentales de una condición que experimentan participantes, que investigadores miden para evaluar efectos del tratamiento.",
    simple_definition: "Señales físicas o mentales de una enfermedad que se pueden medir."
  },
  "Systematic Review": {
    term: "Revisión Sistemática",
    slug: "revision-sistematica",
    definition: "Análisis comprehensivo de toda la investigación disponible sobre un tema usando metodología rigurosa.",
    simple_definition: "Análisis completo de todos los estudios sobre un tema específico."
  },
  "Terpene Profile": {
    term: "Perfil de Terpenos",
    slug: "perfil-terpenos",
    definition: "La combinación específica y concentración de terpenos en un producto de cannabis.",
    simple_definition: "Lista de todos los terpenos presentes en un producto."
  },
  "Terpinolene": {
    term: "Terpinoleno",
    slug: "terpinoleno",
    definition: "El terpinoleno es un terpeno floral, pináceo encontrado en el cáñamo y árbol de té. Puede tener propiedades sedantes y antioxidantes y contribuye al efecto séquito.",
    simple_definition: "Compuesto floral que puede ayudar a relajarse y proteger las células."
  },
  "Tetrahydrocannabinol": {
    term: "Tetrahidrocannabinol",
    slug: "tetrahidrocannabinol",
    definition: "El compuesto psicoactivo primario en el cannabis que produce la sensación de \"colocón\" uniéndose a receptores CB1.",
    simple_definition: "Compuesto del cannabis que causa efectos psicoactivos."
  },
  "THC-Free": {
    term: "Libre de THC",
    slug: "libre-thc",
    definition: "Productos con niveles no detectables de THC, importante para pruebas de drogas y países de tolerancia cero.",
    simple_definition: "Productos que no contienen nada de THC."
  },
  "THC-O": {
    term: "THC-O",
    slug: "thc-o",
    definition: "Una forma sintética, acetilada de THC reportada como más potente que el THC natural.",
    simple_definition: "Forma sintética de THC más fuerte que el natural."
  },
  "THCA": {
    term: "THCA",
    slug: "thca",
    definition: "THCA (ácido tetrahidrocannabinólico) es el precursor no psicoactivo del THC encontrado en cannabis crudo. Se convierte en THC psicoactivo cuando se calienta o envejece.",
    simple_definition: "Forma cruda del THC que no es psicoactiva hasta calentarse."
  },
  "THCV": {
    term: "THCV",
    slug: "thcv",
    definition: "THCV (tetrahidrocannabivarina) es un cannabinoide que puede suprimir el apetito y proporcionar efectos energizantes. Tiene menor duración que el THC regular.",
    simple_definition: "Cannabinoide que puede reducir el apetito y dar energía."
  },
  "Therapeutic Window": {
    term: "Ventana Terapéutica",
    slug: "ventana-terapeutica",
    definition: "El rango de dosis donde el CBD proporciona beneficios sin efectos secundarios significativos.",
    simple_definition: "Cantidad de CBD que funciona sin causar efectos no deseados."
  },
  "Third-Party Testing": {
    term: "Pruebas de Terceros",
    slug: "pruebas-terceros",
    definition: "Las pruebas de terceros por laboratorios independientes verifican el contenido y pureza de productos de CBD. Siempre verifique un Certificado de Análisis actual antes de comprar.",
    simple_definition: "Análisis independientes que verifican la calidad de productos CBD."
  },
  "Titration": {
    term: "Titulación",
    slug: "titulacion",
    definition: "La titulación es el proceso de ajustar gradualmente su dosificación de CBD para encontrar la cantidad óptima. Comience bajo y aumente lentamente mientras monitorea los efectos.",
    simple_definition: "Proceso de ajustar la dosis gradualmente hasta encontrar la cantidad perfecta."
  },
  "Tolerance": {
    term: "Tolerancia",
    slug: "tolerancia",
    definition: "Respuesta reducida al CBD con el tiempo, requiriendo dosis más altas para el mismo efecto.",
    simple_definition: "Necesitar más CBD con el tiempo para obtener los mismos efectos."
  },
  "Topical": {
    term: "Tópico",
    slug: "topico",
    definition: "Los tópicos de CBD son cremas, bálsamos y lociones aplicadas directamente a la piel para alivio localizado. Proporcionan beneficios dirigidos sin entrar al torrente sanguíneo.",
    simple_definition: "Productos de CBD que se aplican directamente en la piel."
  },
  "Tourette Syndrome": {
    term: "Síndrome de Tourette",
    slug: "sindrome-tourette",
    definition: "Un trastorno neurológico caracterizado por movimientos repetitivos, involuntarios y vocalizaciones (tics).",
    simple_definition: "Trastorno que causa movimientos y sonidos involuntarios repetitivos."
  },
  "Transdermal": {
    term: "Transdérmico",
    slug: "transdermico",
    definition: "Parches o geles de CBD que penetran la piel para entrar al torrente sanguíneo para liberación sostenida.",
    simple_definition: "Productos que atraviesan la piel para llegar a la sangre."
  },
  "Treatment": {
    term: "Tratamiento",
    slug: "tratamiento",
    definition: "El tratamiento se refiere a la intervención siendo estudiada, como administración de CBD, para manejar o mejorar una condición de salud.",
    simple_definition: "Medicina o terapia que se estudia para tratar una enfermedad."
  },
  "Trichome": {
    term: "Tricoma",
    slug: "tricoma",
    definition: "Glándulas diminutas similares a cristales en el cannabis que producen cannabinoides y terpenos.",
    simple_definition: "Pequeños cristales en la planta que contienen CBD y otros compuestos."
  },
  "TRPV1 Receptor": {
    term: "Receptor TRPV1",
    slug: "receptor-trpv1",
    definition: "Un receptor de canal iónico que responde al calor, capsaicina y cannabinoides, involucrado en la percepción del dolor.",
    simple_definition: "Receptor que detecta calor y dolor donde también actúan los cannabinoides."
  },
  "Valencene": {
    term: "Valenceno",
    slug: "valenceno",
    definition: "Un terpeno cítrico dulce con propiedades antiinflamatorias y protectoras de la piel.",
    simple_definition: "Compuesto cítrico que protege la piel y reduce inflamación."
  },
  "Vaporization": {
    term: "Vaporización",
    slug: "vaporizacion",
    definition: "Calentar CBD para liberar vapor sin combustión, considerado más seguro que fumar.",
    simple_definition: "Calentar CBD para crear vapor sin quemarlo."
  },
  "Vegan CBD": {
    term: "CBD Vegano",
    slug: "cbd-vegano",
    definition: "Productos de CBD sin ingredientes derivados de animales; verifique gelatina, cera de abeja o lanolina.",
    simple_definition: "CBD sin ingredientes de origen animal."
  },
  "Veterinary Cannabis Medicine": {
    term: "Medicina Cannabis Veterinaria",
    slug: "medicina-cannabis-veterinaria",
    definition: "Campo emergente que estudia cannabinoides para salud animal, limitado por restricciones legales.",
    simple_definition: "Uso médico de cannabis en animales, aún en desarrollo."
  },
  "Water-Soluble CBD": {
    term: "CBD Hidrosoluble",
    slug: "cbd-hidrosoluble",
    definition: "El CBD hidrosoluble usa tecnología de nanoemulsión para mejorar biodisponibilidad. Se mezcla fácilmente con bebidas y se absorbe más rápido que productos de CBD a base de aceite.",
    simple_definition: "CBD que se mezcla con agua y se absorbe más rápido."
  },
  "Wax": {
    term: "Cera",
    slug: "cera",
    definition: "Concentrado de cannabis suave y opaco con textura cerosa para dabbing.",
    simple_definition: "Concentrado suave de textura cerosa para vaporizar."
  },
  "Winterization": {
    term: "Winterización",
    slug: "winterizacion",
    definition: "Un proceso de purificación usando temperaturas frías para eliminar grasas y ceras del extracto de CBD.",
    simple_definition: "Proceso de purificación con frío para limpiar el extracto de CBD."
  }
};

// Function to create Spanish slug from term
function createSlug(term) {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Function to translate a single glossary entry
async function translateEntry(entry) {
  const translation = spanishTranslations[entry.term];
  
  if (!translation) {
    console.log(`Warning: No translation found for "${entry.term}"`);
    return null;
  }
  
  return {
    term_id: entry.id,
    language: 'es',
    term: translation.term,
    slug: translation.slug,
    definition: translation.definition,
    simple_definition: translation.simple_definition
  };
}

// Function to insert translations into Supabase
async function insertTranslations(translations) {
  const { data, error } = await supabase
    .from('glossary_translations')
    .insert(translations);
  
  if (error) {
    console.error('Error inserting translations:', error);
    throw error;
  }
  
  return data;
}

// Main function
async function main() {
  try {
    console.log('Starting Spanish translation process...');
    
    // Translate all entries
    const translations = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const entry of glossaryEn) {
      const translation = await translateEntry(entry);
      if (translation) {
        translations.push(translation);
        successCount++;
      } else {
        failCount++;
        console.log(`Failed to translate: ${entry.term}`);
      }
    }
    
    console.log(`Translation complete: ${successCount} successful, ${failCount} failed`);
    
    if (translations.length === 0) {
      console.log('No translations to insert. Exiting.');
      return;
    }
    
    // Insert translations in batches of 50 to avoid hitting limits
    const batchSize = 50;
    let totalInserted = 0;
    
    for (let i = 0; i < translations.length; i += batchSize) {
      const batch = translations.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} (${batch.length} entries)...`);
      
      await insertTranslations(batch);
      totalInserted += batch.length;
      console.log(`Inserted ${batch.length} entries. Total: ${totalInserted}`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Successfully inserted ${totalInserted} Spanish translations!`);
    
    // Verify the insertions
    const { count, error: countError } = await supabase
      .from('glossary_translations')
      .select('*', { count: 'exact', head: true })
      .eq('language', 'es');
    
    if (countError) {
      console.error('Error counting translations:', countError);
    } else {
      console.log(`Verification: Found ${count} Spanish translations in database`);
    }
    
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { translateEntry, createSlug };