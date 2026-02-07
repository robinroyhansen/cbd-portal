const fs = require('fs');

// Load current Portuguese locale
const currentPt = JSON.parse(fs.readFileSync('locales/pt.json', 'utf8'));

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Portuguese translations - European Portuguese style
const portugueseTranslations = {
  // Common
  "common.healthCondition": "Condição de Saúde",
  "common.lastReviewedAndUpdated": "Última revisão e actualização:",
  "common.updated": "Actualizado",
  
  // Navigation
  "nav.closeMenu": "Fechar menu",
  
  // Conditions
  "conditions.researchBacked": "Informação Suportada por Investigação",
  "conditions.heroTitle": "CBD e Condições de Saúde",
  "conditions.heroDescription": "Explore investigação baseada em evidência sobre como o CBD pode ajudar com {{count}} condições de saúde. Cada tópico inclui estudos científicos, orientação de dosagem e perspectivas de especialistas.",
  "conditions.searchPlaceholder": "Pesquisar condições (ex: ansiedade, dor, sono)...",
  "conditions.grid": "Grelha",
  "conditions.listAZ": "A-Z",
  "conditions.allConditions": "Todas as Condições",
  "conditions.showing": "A mostrar",
  "conditions.of": "de",
  "conditions.in": "em",
  "conditions.matching": "correspondentes",
  "conditions.clearFilters": "Limpar filtros",
  "conditions.noResults": "Nenhuma Condição Encontrada",
  "conditions.noResultsDescription": "Tente ajustar a sua pesquisa ou filtro de categoria para ver mais resultados.",
  "conditions.strongestEvidence": "Condições com a evidência científica mais forte",
  "conditions.findByArea": "Encontre condições organizadas por área afectada",
  "conditions.searchResults": "Resultados da Pesquisa",
  "conditions.browseByCategoryHeader": "Navegar por Categoria",
  "conditions.browseByCategoryDescription": "Encontre condições de saúde organizadas por sistemas corporais e tipos de sintomas",
  "conditions.categoryNotFound": "Categoria não encontrada",
  "conditions.categoryNotFoundDescription": "A categoria solicitada não existe ou foi movida.",
  
  // Categories - European Portuguese medical terminology
  "conditions.categories.mental_health": "Saúde Mental",
  "conditions.categories.mental_health_desc": "Ansiedade, depressão, PTSD, stress e perturbações do humor",
  "conditions.categories.pain": "Dor e Desconforto",
  "conditions.categories.pain_desc": "Dor crónica, artrite, fibromialgia e neuropatia",
  "conditions.categories.neurological": "Neurológicas",
  "conditions.categories.neurological_desc": "Epilepsia, Parkinson, esclerose múltipla e saúde cerebral",
  "conditions.categories.skin": "Condições da Pele",
  "conditions.categories.skin_desc": "Acne, eczema, psoríase e dermatite",
  "conditions.categories.sleep": "Sono",
  "conditions.categories.sleep_desc": "Insónia, apneia do sono e perturbações do ritmo circadiano",
  "conditions.categories.autoimmune": "Auto-imunes",
  "conditions.categories.autoimmune_desc": "Artrite reumatóide, doença de Crohn e lúpus",
  "conditions.categories.gastrointestinal": "Saúde Digestiva",
  "conditions.categories.gastrointestinal_desc": "SII, doença de Crohn, náuseas e saúde intestinal",
  "conditions.categories.cardiovascular": "Cardiovascular",
  "conditions.categories.cardiovascular_desc": "Saúde do coração, pressão arterial e circulação",
  "conditions.categories.cancer": "Cancro e Oncologia",
  "conditions.categories.cancer_desc": "Efeitos secundários do tratamento do cancro, qualidade de vida e cuidados complementares",
  "conditions.categories.metabolic": "Saúde Metabólica",
  "conditions.categories.metabolic_desc": "Diabetes, obesidade e perturbações metabólicas",
  "conditions.categories.pets": "Animais de Estimação",
  "conditions.categories.pets_desc": "CBD para cães, gatos, cavalos e outros animais de estimação",
  "conditions.categories.other": "Outras Condições",
  "conditions.categories.other_desc": "Condições de saúde diversas e bem-estar",
  "conditions.categories.inflammation": "Inflamação",
  "conditions.categories.inflammation_desc": "Inflamação crónica e doenças inflamatórias",
  
  // Evidence
  "evidence.strongDesc": "Investigação extensa disponível",
  "evidence.moderateDesc": "Boa base de investigação",
  "evidence.emerging": "Emergente",
  "evidence.emergingDesc": "Base de evidência crescente",
  "evidence.limitedDesc": "Investigação em fase inicial",
  "evidence.preliminary": "Preliminar",
  "evidence.preliminaryDesc": "Dados muito limitados",
  
  // Research types
  "research.studySubject.human": "Estudo Humano",
  "research.studySubject.animal": "Estudo Animal",
  "research.studySubject.review": "Revisão",
  "research.studySubject.in_vitro": "In Vitro",
  
  // Glossary
  "glossary.knowledgeBase": "Base de Conhecimento",
  "glossary.cbdCannabis": "CBD e Cannabis",
  "glossary.termsExplained": "{{count}} termos explicados — desde canabinóides e terpenos até terminologia legal e tipos de produtos.",
  "glossary.searchLabel": "Pesquisar termos do glossário",
  "glossary.searchTermsSynonyms": "Pesquisar termos, sinónimos...",
  "glossary.suggestionsFound": "{{count}} sugestões encontradas",
  "glossary.matchedSynonym": "Sinónimo correspondente",
  "glossary.mostPopular": "Termos Mais Populares",
  "glossary.filterByLetter": "Filtrar por letra",
  "glossary.all": "Todos",
  "glossary.allCategories": "Todas as Categorias",
  "glossary.cardView": "Vista de cartão",
  "glossary.tableView": "Vista de tabela",
  "glossary.viewMode": "Modo de visualização",
  "glossary.noTermsFound": "Nenhum termo encontrado",
  "glossary.noResultsFor": "Nenhum resultado para \"{{query}}\"",
  "glossary.noTermsMatchFilters": "Nenhum termo do glossário corresponde aos seus filtros",
  "glossary.clearFilters": "Limpar filtros",
  "glossary.term": "Termo",
  "glossary.category": "Categoria",
  "glossary.definition": "Definição",
  "glossary.also": "Também",
  "glossary.termCount": "{{count}} termo",
  "glossary.termsCount": "{{count}} termos",
  "glossary.home": "Início",
  "glossary.reviewedBy": "Revisto por",
  "glossary.lastUpdated": "Última actualização",
  "glossary.calculateDosage": "Calcule a Sua Dosagem de CBD",
  "glossary.getDosageRecommendations": "Obtenha recomendações de dosagem personalizadas baseadas nas suas necessidades.",
  "glossary.tryCalculator": "Experimentar Calculadora →",
  "glossary.viewStudies": "Ver {{count}} estudo →",
  "glossary.viewStudiesPlural": "Ver {{count}} estudos →",
  "glossary.faq": "Perguntas Frequentes",
  "glossary.alsoKnownAs": "Também Conhecido Como",
  "glossary.learnMore": "Saber Mais",
  "glossary.backToGlossary": "Voltar ao Glossário",
  
  // Glossary categories
  "glossaryCategories.cannabinoids": "Canabinóides",
  "glossaryCategories.cannabinoids_desc": "CBD, THC, CBG e outros compostos da cannabis",
  "glossaryCategories.terpenes": "Terpenos",
  "glossaryCategories.terpenes_desc": "Compostos aromáticos que afectam o aroma e os efeitos",
  "glossaryCategories.products": "Produtos",
  "glossaryCategories.products_desc": "Óleos, cápsulas, tópicos e outros produtos de CBD",
  "glossaryCategories.extraction": "Extracção",
  "glossaryCategories.extraction_desc": "Métodos de extracção de CBD da planta",
  "glossaryCategories.science": "Ciência",
  "glossaryCategories.science_desc": "O sistema endocanabinóide e como o CBD funciona",
  "glossaryCategories.research": "Investigação",
  "glossaryCategories.research_desc": "Tipos de estudos e investigação científica",
  "glossaryCategories.legal": "Legal",
  "glossaryCategories.legal_desc": "Legislação, regulamentações e estatuto legal do CBD",
  "glossaryCategories.cultivation": "Cultivo",
  "glossaryCategories.cultivation_desc": "Métodos de cultivo e produção de cannabis",
  "glossaryCategories.testing": "Análise",
  "glossaryCategories.testing_desc": "Análises laboratoriais e controlo de qualidade",
  "glossaryCategories.safety": "Segurança",
  "glossaryCategories.safety_desc": "Efeitos secundários, interacções e segurança"
};

// Apply Portuguese translations
let appliedCount = 0;
Object.keys(portugueseTranslations).forEach(key => {
  setNestedValue(currentPt, key, portugueseTranslations[key]);
  appliedCount++;
});

console.log(`Applied ${appliedCount} Portuguese translations`);

// Save updated file
fs.writeFileSync('locales/pt.json', JSON.stringify(currentPt, null, 2));

// Count keys to verify progress
function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const newPtKeys = getAllKeys(currentPt);
console.log(`New Portuguese key count: ${newPtKeys.length}`);
console.log(`Progress: ${newPtKeys.length}/1667 keys (${Math.round(newPtKeys.length/1667*100)}%)`);