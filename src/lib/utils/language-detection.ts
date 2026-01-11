interface LanguageResult {
  language: string;
  confidence: number;
  isEnglish: boolean;
}

const LANGUAGE_PATTERNS: { lang: string; patterns: RegExp[]; threshold: number }[] = [
  {
    lang: 'french',
    patterns: [
      /\b(le|la|les|un|une|des|du|et|est|sont|dans|pour|avec|sur|qui|que|nous|vous|cette|mais|donc|très|être|avoir|peut|aussi|plus|même|tout|comme|après|encore|entre|sans)\b/gi,
      /\b(résumé|étude|méthode|résultats|conclusion|objectif|patients|traitement|effet|l'effet|d'une|qu'il)\b/gi,
    ],
    threshold: 6
  },
  {
    lang: 'german',
    patterns: [
      /\b(der|die|das|ein|eine|und|ist|sind|im|mit|für|auf|von|zu|bei|nach|über|aus|wie|oder|aber|wenn|als|auch|noch|nur|werden|kann|haben|sein)\b/gi,
      /\b(zusammenfassung|studie|methode|ergebnisse|schlussfolgerung|patienten|behandlung|wirkung)\b/gi,
    ],
    threshold: 6
  },
  {
    lang: 'spanish',
    patterns: [
      /\b(el|la|los|las|un|una|de|en|y|que|es|son|por|con|para|del|al|como|más|pero|sus|ya|sin|sobre|entre|muy|así|todos)\b/gi,
      /\b(resumen|estudio|método|resultados|conclusión|objetivo|pacientes|tratamiento|efecto)\b/gi,
    ],
    threshold: 6
  },
  {
    lang: 'portuguese',
    patterns: [
      /\b(o|a|os|as|um|uma|de|em|e|que|é|são|por|com|para|do|da|ao|como|mais|mas|seus|sua|já|sem|sobre|entre|muito|assim|todos)\b/gi,
      /\b(resumo|estudo|método|resultados|conclusão|objetivo|pacientes|tratamento|efeito)\b/gi,
    ],
    threshold: 6
  },
  {
    lang: 'italian',
    patterns: [
      /\b(il|lo|la|i|gli|le|un|uno|una|di|in|e|che|è|sono|per|con|non|si|da|del|della|al|come|più|ma|suo|sua|senza|tra|molto|così|tutti)\b/gi,
      /\b(riassunto|studio|metodo|risultati|conclusione|obiettivo|pazienti|trattamento|effetto)\b/gi,
    ],
    threshold: 6
  },
  {
    lang: 'chinese',
    patterns: [/[\u4e00-\u9fff]/g],
    threshold: 10
  },
  {
    lang: 'japanese',
    patterns: [/[\u3040-\u309f\u30a0-\u30ff]/g],
    threshold: 5
  },
  {
    lang: 'korean',
    patterns: [/[\uac00-\ud7af]/g],
    threshold: 5
  },
  {
    lang: 'russian',
    patterns: [/[\u0400-\u04ff]/g],
    threshold: 10
  },
  {
    lang: 'arabic',
    patterns: [/[\u0600-\u06ff]/g],
    threshold: 10
  },
];

// Check if text is likely English based on common English words
function isLikelyEnglish(text: string): boolean {
  const englishPatterns = /\b(the|and|of|to|in|for|with|on|that|this|from|by|as|an|be|are|is|was|were|been|have|has|had|will|would|could|should|may|might|can|study|treatment|patients|clinical|trial|effect|results)\b/gi;
  const matches = text.match(englishPatterns) || [];
  return matches.length >= 5;
}

export function detectLanguage(text: string, title?: string): LanguageResult {
  if (!text || text.length < 20) {
    return { language: 'english', confidence: 50, isEnglish: true };
  }

  // If title is clearly English, require MUCH stronger abstract evidence
  const titleIsEnglish = !title || isLikelyEnglish(title);

  const sample = text.slice(0, 1000);
  let detectedLang = 'english';
  let maxScore = 0;

  for (const { lang, patterns, threshold } of LANGUAGE_PATTERNS) {
    let score = 0;
    for (const pattern of patterns) {
      const matches = sample.match(pattern);
      if (matches) {
        score += matches.length;
      }
    }

    // Use higher threshold if title is clearly English (reduce false positives)
    const effectiveThreshold = titleIsEnglish ? Math.max(threshold, 12) : threshold;

    if (score >= effectiveThreshold && score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  return {
    language: detectedLang,
    confidence: Math.min(maxScore * 5, 100),
    isEnglish: detectedLang === 'english'
  };
}
