#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// German translations for editorialPolicy and methodology sections
const translations = {
  editorialPolicy: {
    pageTitle: "Redaktionelle Richtlinien | CBD Portal",
    metaTitle: "Redaktionelle Richtlinien | CBD Portal",
    pageDescription: "Erfahren Sie mehr über unsere redaktionellen Standards und Richtlinien für evidenzbasierte CBD-Inhalte.",
    metaDescription: "Erfahren Sie mehr über unsere redaktionellen Standards und Richtlinien für evidenzbasierte CBD-Inhalte.",
    title: "Redaktionelle Richtlinien",
    lastUpdated: "Zuletzt aktualisiert: 15. Januar 2025",
    intro: "Bei CBD Portal sind wir der Bereitstellung genauer, evidenzbasierter Informationen über CBD und verwandte Cannabinoide verpflichtet. Diese redaktionellen Richtlinien umreißen unsere Standards und Verfahren zur Gewährleistung der Qualität und Vertrauenswürdigkeit unserer Inhalte.",
    ourMission: "Unsere Mission",
    missionStatement: "Unsere Mission ist es, Personen zu befähigen, fundierte Entscheidungen über CBD und Cannabis zu treffen, indem wir zugängliche, wissenschaftlich fundierte Informationen bereitstellen. Wir bemühen uns, komplexe Forschung in verständliche, umsetzbare Erkenntnisse zu übersetzen.",
    editorialStandards: "Redaktionelle Standards",
    evidenceBasedContent: "Evidenzbasierte Inhalte",
    evidenceBasedDesc: "Alle unsere Artikel und Ressourcen basieren auf von Experten begutachteten wissenschaftlichen Studien, klinischen Daten und seriösen medizinischen Quellen.",
    expertReview: "Expertenprüfung",
    expertReviewDesc: "Unsere Inhalte werden von qualifizierten Medizinern, Forschern und Cannabis-Spezialisten überprüft und validiert.",
    regularUpdates: "Regelmäßige Aktualisierungen",
    regularUpdatesDesc: "Wir aktualisieren unsere Inhalte regelmäßig, um neue Forschungsergebnisse und sich entwickelnde wissenschaftliche Erkenntnisse zu berücksichtigen.",
    transparency: "Transparenz",
    transparencyDesc: "Wir legen alle Quellen offen, geben Studienbeschränkungen an und unterscheiden zwischen etablierten Fakten und laufender Forschung.",
    noMedicalAdvice: "Kein medizinischer Rat",
    noMedicalAdviceDesc: "Wir stellen ausdrücklich klar, dass unsere Inhalte nur zu Informationszwecken dienen und keinen professionellen medizinischen Rat ersetzen.",
    contentCreationProcess: "Inhaltserstellungsprozess",
    researchPhase: "Forschungsphase",
    researchPhaseDesc: "Jeder Artikel beginnt mit einer umfassenden Überprüfung der verfügbaren wissenschaftlichen Literatur und klinischen Studien.",
    writingPhase: "Schreibphase",
    writingPhaseDesc: "Unsere Autoren, die über Fachwissen in Medizin, Wissenschaft oder Cannabis-Forschung verfügen, erstellen Inhalte basierend auf evidenzbasierten Erkenntnissen.",
    reviewPhase: "Überprüfungsphase",
    reviewPhaseDesc: "Alle Artikel werden sowohl einer redaktionellen als auch einer medizinischen Überprüfung unterzogen, bevor sie veröffentlicht werden.",
    publicationPhase: "Veröffentlichungsphase",
    publicationPhaseDesc: "Nach der Genehmigung werden die Artikel mit angemessenen Quellenangaben und Haftungsausschlüssen veröffentlicht.",
    sourcingStandards: "Beschaffungsstandards",
    primarySources: "Primärquellen",
    primarySourcesDesc: "Wir priorisieren von Experten begutachtete wissenschaftliche Journals, klinische Studien und offizielle medizinische Organisationen.",
    secondarySources: "Sekundärquellen",
    secondarySourcesDesc: "Seriöse medizinische Websites, Regierungsagenturen und etablierte Forschungseinrichtungen können als unterstützende Quellen verwendet werden.",
    avoidedSources: "Vermiedene Quellen",
    avoidedSourcesDesc: "Wir verwenden keine nicht begutachteten Studien, anekdotische Berichte oder kommerzielle Quellen mit Interessenkonflikten als primäre Belege.",
    editorialTeam: "Redaktionsteam",
    medicalReviewers: "Medizinische Gutachter",
    medicalReviewersDesc: "Unser Team umfasst lizenzierte Ärzte, Pharmakologen und Cannabis-Forscher, die unsere Inhalte auf medizinische Genauigkeit überprüfen.",
    writers: "Autoren",
    writersDesc: "Unsere Autoren haben Hintergründe in Medizin, Wissenschaft, Journalismus oder verwandten Bereichen mit speziellem Interesse an Cannabis-Forschung.",
    editors: "Redakteure",
    editorsDesc: "Unsere Redakteure stellen sicher, dass alle Inhalte unseren redaktionellen Standards entsprechen und für unser Publikum zugänglich sind.",
    conflictOfInterest: "Interessenkonflikte",
    disclosurePolicy: "Offenlegungsrichtlinie",
    disclosurePolicyDesc: "Alle Autoren und Gutachter legen potenzielle Interessenkonflikte offen, einschließlich finanzieller Beziehungen zu Cannabis-Unternehmen.",
    editorialIndependence: "Redaktionelle Unabhängigkeit",
    editorialIndependenceDesc: "Unsere redaktionellen Entscheidungen werden nicht von Werbetreibenden, Sponsoren oder kommerziellen Partnern beeinflusst.",
    correctionPolicy: "Korrekturrichtlinie",
    errorCorrection: "Fehlerkorrektur",
    errorCorrectionDesc: "Wenn Fehler identifiziert werden, korrigieren wir sie umgehend und dokumentieren die vorgenommenen Änderungen.",
    updateNotifications: "Aktualisierungsbenachrichtigungen",
    updateNotificationsDesc: "Wesentliche Aktualisierungen an Artikeln werden deutlich gekennzeichnet und mit Daten versehen."
  },
  methodology: {
    pageTitle: "Forschungsmethodik | CBD Portal",
    metaTitle: "Forschungsmethodik | CBD Portal",
    pageDescription: "Erfahren Sie mehr über unsere wissenschaftliche Methodik zur Bewertung und Präsentation von CBD-Forschung.",
    metaDescription: "Erfahren Sie mehr über unsere wissenschaftliche Methodik zur Bewertung und Präsentation von CBD-Forschung.",
    title: "Forschungsmethodik",
    lastUpdated: "Zuletzt aktualisiert: 15. Januar 2025",
    intro: "Unsere Methodik zur Bewertung und Präsentation von CBD-Forschung basiert auf etablierten wissenschaftlichen Prinzipien und evidenzbasierten Praktiken. Diese Seite erklärt, wie wir Studien bewerten, Evidenz gewichten und Forschungsergebnisse für die Öffentlichkeit übersetzen.",
    researchEvaluation: "Forschungsbewertung",
    studySelection: "Studienauswahl",
    studySelectionDesc: "Wir priorisieren von Experten begutachtete Studien, die in seriösen wissenschaftlichen Journals veröffentlicht wurden. Wir berücksichtigen sowohl präklinische als auch klinische Forschung, wobei wir Humanstudien höher gewichten.",
    qualityAssessment: "Qualitätsbewertung",
    qualityAssessmentDesc: "Jede Studie wird anhand etablierter Kriterien bewertet, einschließlich Studiendesign, Stichprobengröße, Kontrollen und statistischer Methoden.",
    evidenceHierarchy: "Evidenzhierarchie",
    evidenceHierarchyDesc: "Wir folgen der etablierten Evidenzhierarchie: systematische Übersichtsarbeiten und Meta-Analysen an der Spitze, gefolgt von randomisierten kontrollierten Studien, Beobachtungsstudien und schließlich präklinischen Studien.",
    evidenceLevels: "Evidenzstufen",
    strongEvidence: "Starke Evidenz",
    strongEvidenceDesc: "Mehrere hochwertige randomisierte kontrollierte Studien oder systematische Übersichtsarbeiten mit übereinstimmenden Ergebnissen.",
    moderateEvidence: "Mäßige Evidenz",
    moderateEvidenceDesc: "Einige randomisierte kontrollierte Studien oder eine gut durchgeführte systematische Übersichtsarbeit mit überwiegend positiven Ergebnissen.",
    limitedEvidence: "Begrenzte Evidenz",
    limitedEvidenceDesc: "Wenige Studien geringerer Qualität oder widersprüchliche Ergebnisse aus mehreren Studien.",
    insufficientEvidence: "Unzureichende Evidenz",
    insufficientEvidenceDesc: "Hauptsächlich präklinische Studien oder sehr wenige klinische Studien mit unklaren Ergebnissen.",
    studyTypes: "Studientypen",
    clinicalTrials: "Klinische Studien",
    clinicalTrialsDesc: "Randomisierte kontrollierte Studien (RCTs) an Menschen bieten die stärkste Evidenz für Wirksamkeit und Sicherheit.",
    observationalStudies: "Beobachtungsstudien",
    observationalStudiesDesc: "Kohortenstudien und Fall-Kontroll-Studien bieten wertvolle Real-World-Evidenz, haben aber Einschränkungen bei der Kausalität.",
    preclinicalStudies: "Präklinische Studien",
    preclinicalStudiesDesc: "Tier- und Laborstudien bieten mechanistische Einsichten, aber die Ergebnisse übersetzen sich nicht immer auf Menschen.",
    systematicReviews: "Systematische Übersichtsarbeiten",
    systematicReviewsDesc: "Umfassende Analysen der verfügbaren Evidenz bieten die breiteste Perspektive auf ein Forschungsgebiet.",
    dataExtraction: "Datenextraktion",
    keyMetrics: "Schlüsselmetriken",
    keyMetricsDesc: "Wir extrahieren wichtige Daten einschließlich Teilnehmerzahlen, Dosierung, Dauer, primäre Endpunkte und Sicherheitsergebnisse.",
    statisticalSignificance: "Statistische Signifikanz",
    statisticalSignificanceDesc: "Wir berichten sowohl statistische Signifikanz als auch klinische Bedeutung und unterscheiden zwischen beiden.",
    effectSizes: "Effektgrößen",
    effectSizesDesc: "Wir bewerten die Größe der beobachteten Effekte, nicht nur ob sie statistisch signifikant waren.",
    limitationsAssessment: "Bewertung von Einschränkungen",
    studyLimitations: "Studienbeschränkungen",
    studyLimitationsDesc: "Wir identifizieren und berichten Einschränkungen wie kleine Stichprobengrößen, kurze Dauer oder potenzielle Verzerrungen.",
    conflictsOfInterest: "Interessenkonflikte",
    conflictsOfInterestDesc: "Wir bewerten und berichten über Finanzierungsquellen und potenzielle Interessenkonflikte in der Forschung.",
    generalizability: "Verallgemeinerbarkeit",
    generalizabilityDesc: "Wir beurteilen, wie gut sich Studienergebnisse auf breitere Populationen und reale Anwendungen übertragen lassen.",
    communicationStandards: "Kommunikationsstandards",
    languageClarity: "Sprachklarheit",
    languageClarityDesc: "Wir übersetzen komplexe wissenschaftliche Begriffe in verständliche Sprache, ohne die Genauigkeit zu opfern.",
    uncertaintyExpression: "Ausdruck von Unsicherheit",
    uncertaintyExpressionDesc: "Wir kommunizieren deutlich das Ausmaß der wissenschaftlichen Unsicherheit und vermeiden übertriebene Behauptungen.",
    balancedReporting: "Ausgewogene Berichterstattung",
    balancedReportingDesc: "Wir präsentieren sowohl positive als auch negative Ergebnisse und diskutieren widersprüchliche Evidenz.",
    continuousImprovement: "Kontinuierliche Verbesserung",
    methodologyUpdates: "Methodologie-Updates",
    methodologyUpdatesDesc: "Wir überprüfen und aktualisieren unsere Methodik regelmäßig basierend auf Best Practices und Feedback der wissenschaftlichen Gemeinschaft.",
    qualityAssurance: "Qualitätssicherung",
    qualityAssuranceDesc: "Regelmäßige interne Überprüfungen stellen sicher, dass unsere Methodik konsistent und rigoros angewendet wird."
  }
};

try {
  const dePath = path.join(__dirname, '../locales/de.json');
  const deData = JSON.parse(fs.readFileSync(dePath, 'utf8'));
  
  // Merge translations
  deData.editorialPolicy = { ...deData.editorialPolicy, ...translations.editorialPolicy };
  deData.methodology = { ...deData.methodology, ...translations.methodology };
  
  // Write updated German translations
  fs.writeFileSync(dePath, JSON.stringify(deData, null, 2));
  
  console.log('✅ Editorial Policy and Methodology sections translated:');
  console.log(`- editorialPolicy: ${Object.keys(translations.editorialPolicy).length} keys added`);
  console.log(`- methodology: ${Object.keys(translations.methodology).length} keys added`);
  
} catch (error) {
  console.error('❌ Error updating translations:', error.message);
  process.exit(1);
}