const fs = require('fs');

// Load existing progress
const existingTranslations = JSON.parse(fs.readFileSync('bulk-spanish-translations.json', 'utf8'));

// Continue with major remaining sections
const majorTranslations = {
  ...existingTranslations,
  
  // Product types (12 keys)
  "productTypes.oils": "Aceites",
  "productTypes.tinctures": "Tinturas",
  "productTypes.capsules": "Cápsulas",
  "productTypes.gummies": "Gomitas",
  "productTypes.topicals": "Tópicos",
  "productTypes.vapes": "Vaporizadores",
  "productTypes.isolates": "Aislados",
  "productTypes.fullSpectrum": "Espectro completo",
  "productTypes.broadSpectrum": "Amplio espectro",
  "productTypes.edibles": "Comestibles",
  "productTypes.beverages": "Bebidas",
  "productTypes.skincare": "Cuidado de la piel",
  
  // Author bio (11 keys)
  "authorBio.writtenBy": "Escrito por",
  "authorBio.reviewedBy": "Revisado por",
  "authorBio.credentials": "Credenciales",
  "authorBio.experience": "Experiencia",
  "authorBio.specializations": "Especializaciones",
  "authorBio.publications": "Publicaciones",
  "authorBio.education": "Educación",
  "authorBio.affiliations": "Afiliaciones",
  "authorBio.contactInfo": "Información de contacto",
  "authorBio.viewProfile": "Ver perfil",
  "authorBio.moreArticles": "Más artículos de este autor",
  
  // Study page (5 keys)
  "study.abstract": "Resumen",
  "study.methodology": "Metodología",
  "study.results": "Resultados",
  "study.conclusion": "Conclusión",
  "study.fullText": "Texto completo",
  
  // Condition articles hub (3 keys)
  "conditionArticlesHub.title": "Artículos sobre {{condition}}",
  "conditionArticlesHub.description": "Guías completas y artículos educativos sobre {{condition}} y CBD",
  "conditionArticlesHub.viewAll": "Ver todos los artículos",
  
  // Topics page (20 keys) 
  "topicsPage.title": "Temas de Salud CBD",
  "topicsPage.subtitle": "Explora cómo el CBD puede ayudar con diversas condiciones de salud",
  "topicsPage.categories": "Categorías",
  "topicsPage.allTopics": "Todos los temas",
  "topicsPage.trending": "Tendencia",
  "topicsPage.mostPopular": "Más populares",
  "topicsPage.recent": "Recientes",
  "topicsPage.searchTopics": "Buscar temas...",
  "topicsPage.noTopicsFound": "No se encontraron temas",
  "topicsPage.showingTopics": "Mostrando {{count}} temas",
  "topicsPage.filterBy": "Filtrar por",
  "topicsPage.sortBy": "Ordenar por",
  "topicsPage.category": "Categoría",
  "topicsPage.evidenceLevel": "Nivel de evidencia",
  "topicsPage.popularity": "Popularidad",
  "topicsPage.dateAdded": "Fecha añadida",
  "topicsPage.alphabetical": "Alfabético",
  "topicsPage.viewTopic": "Ver tema",
  "topicsPage.studiesAvailable": "estudios disponibles",
  "topicsPage.articlesAvailable": "artículos disponibles",
  
  // Dogs page (21 keys)
  "dogsPage.title": "CBD para Perros",
  "dogsPage.subtitle": "Información completa sobre CBD para la salud y bienestar canino",
  "dogsPage.heroDescription": "Descubre cómo el CBD puede ayudar a tu perro con ansiedad, dolor, convulsiones y más. Información basada en investigación y orientación de dosis.",
  "dogsPage.dosageGuide": "Guía de dosis",
  "dogsPage.safetyInfo": "Información de seguridad",
  "dogsPage.products": "Productos recomendados",
  "dogsPage.conditions": "Condiciones comunes",
  "dogsPage.veterinaryAdvice": "Consejo veterinario",
  "dogsPage.researchStudies": "Estudios de investigación",
  "dogsPage.dosageByWeight": "Dosis por peso",
  "dogsPage.startLow": "Empieza con dosis bajas",
  "dogsPage.monitorEffects": "Monitorea los efectos",
  "dogsPage.consultVet": "Consulta a tu veterinario",
  "dogsPage.anxiety": "Ansiedad",
  "dogsPage.pain": "Dolor",
  "dogsPage.seizures": "Convulsiones",
  "dogsPage.arthritis": "Artritis",
  "dogsPage.cancer": "Cáncer",
  "dogsPage.skinConditions": "Condiciones de la piel",
  "dogsPage.digestiveIssues": "Problemas digestivos",
  "dogsPage.behavioralIssues": "Problemas de comportamiento",
  
  // Cats page (21 keys)
  "catsPage.title": "CBD para Gatos",
  "catsPage.subtitle": "Información especializada sobre CBD para la salud felina",
  "catsPage.heroDescription": "Aprende sobre el uso seguro del CBD en gatos. Consideraciones especiales, dosis y productos seguros para felinos.",
  "catsPage.specialConsiderations": "Consideraciones especiales",
  "catsPage.metabolismDifferences": "Diferencias metabólicas",
  "catsPage.productsToAvoid": "Productos a evitar",
  "catsPage.signs": "Señales a observar",
  "catsPage.dosageGuidelines": "Pautas de dosis",
  "catsPage.administrationMethods": "Métodos de administración",
  "catsPage.commonConditions": "Condiciones comunes",
  "catsPage.anxiety": "Ansiedad",
  "catsPage.pain": "Dolor",
  "catsPage.inflammation": "Inflamación",
  "catsPage.appetiteLoss": "Pérdida de apetito",
  "catsPage.nausea": "Náuseas",
  "catsPage.seizures": "Convulsiones",
  "catsPage.skinProblems": "Problemas de piel",
  "catsPage.behavioralIssues": "Problemas de comportamiento",
  "catsPage.seniorCats": "Gatos mayores",
  "catsPage.safetyFirst": "Seguridad primero",
  "catsPage.veterinarySupervision": "Supervisión veterinaria",
  
  // Authors page (14 keys)
  "authorsPage.title": "Nuestros Autores",
  "authorsPage.subtitle": "Conoce a los expertos detrás de nuestro contenido",
  "authorsPage.meetExperts": "Conoce a nuestros expertos",
  "authorsPage.medicalReviewers": "Revisores médicos",
  "authorsPage.writers": "Escritores",
  "authorsPage.researchers": "Investigadores",
  "authorsPage.allAuthors": "Todos los autores",
  "authorsPage.searchAuthors": "Buscar autores...",
  "authorsPage.filterByRole": "Filtrar por rol",
  "authorsPage.articles": "artículos",
  "authorsPage.reviews": "reseñas",
  "authorsPage.viewProfile": "Ver perfil",
  "authorsPage.viewArticles": "Ver artículos",
  "authorsPage.expertise": "Experiencia"
};

console.log('Major sections now at', Object.keys(majorTranslations).length, 'Spanish translations');
console.log('Still need to translate:', 722 - Object.keys(majorTranslations).length, 'more terms');

// Save major translations
fs.writeFileSync('major-spanish-translations.json', JSON.stringify(majorTranslations, null, 2));
console.log('Major Spanish translations saved');