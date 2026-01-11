/**
 * Extract sample size and type from study text (title, abstract, summary)
 * Distinguishes between human and animal studies
 */

export interface SampleSizeResult {
  size: number;
  type: 'human' | 'animal' | 'unknown';
}

/**
 * Extract sample size and classify study type
 * Priority: Check title for animal keywords first (most reliable)
 */
export function extractSampleSize(
  title: string | null,
  abstract: string | null,
  summary: string | null
): SampleSizeResult | null {
  const titleLower = (title || '').toLowerCase();
  const abstractLower = (abstract || '').toLowerCase();
  const summaryLower = (summary || '').toLowerCase();
  const text = `${titleLower} ${summaryLower} ${abstractLower}`;

  if (!text.trim()) return null;

  // Strong animal indicators in title (most reliable)
  const titleAnimalKeywords = /\b(mice|mouse|rat|rats|murine|rodent|rodents|in vivo|animal model|preclinical|C57BL|Sprague.?Dawley|Wistar)\b/i;

  // If title contains animal keywords, it's an animal study
  if (titleAnimalKeywords.test(titleLower)) {
    const size = extractAnimalSampleSize(text);
    return { size, type: 'animal' };
  }

  // Check abstract/summary for strong animal indicators (without human context)
  const animalIndicators = /\b(mice|mouse|rat|rats|murine|rodent|C57BL|Sprague.?Dawley|Wistar)\b/i;
  const humanIndicators = /\b(patients?|participants?|volunteers?|clinical trial|randomized controlled|double.?blind|placebo.?controlled)\b/i;

  const hasAnimalInText = animalIndicators.test(text);
  const hasHumanInText = humanIndicators.test(text);

  // Animal study if animal indicators present and no strong human indicators
  if (hasAnimalInText && !hasHumanInText) {
    const size = extractAnimalSampleSize(text);
    return { size, type: 'animal' };
  }

  // Human study - try to extract participant count
  if (hasHumanInText || !hasAnimalInText) {
    const size = extractHumanSampleSize(text);
    if (size > 0) {
      return { size, type: 'human' };
    }
  }

  // Mixed or unclear - try generic extraction
  const genericSize = extractGenericSampleSize(text);
  if (genericSize > 0) {
    // Default to human if we found a number but couldn't classify
    return { size: genericSize, type: 'unknown' };
  }

  return null;
}

/**
 * Extract sample size for animal studies
 */
function extractAnimalSampleSize(text: string): number {
  const patterns = [
    /(\d+)\s*(?:mice|mouse)/i,
    /(\d+)\s*(?:rats?)/i,
    /(\d+)\s*(?:rodents?)/i,
    /(\d+)\s*(?:animals?)/i,
    /(?:mice|rats?|animals?|rodents?)\s*\(?n\s*=\s*(\d+)\)?/i,
    /\(?n\s*=\s*(\d+)\)?/i,  // Generic n= in animal context
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseInt(match[1] || match[2], 10);
      if (num > 0 && num <= 10000) {
        return num;
      }
    }
  }

  return 0; // Animal study but no clear sample size
}

/**
 * Extract sample size for human studies
 */
function extractHumanSampleSize(text: string): number {
  const patterns = [
    /\(?n\s*=\s*(\d+)\)?/i,
    /enrolled\s*(?:a\s*total\s*of\s*)?(\d+)/i,
    /recruited\s*(\d+)/i,
    /randomized\s*(\d+)/i,
    /(\d+)\s*(?:participants?|patients?|volunteers?)/i,
    /(\d+)\s*(?:adults?|children|humans?|people|individuals?)/i,
    /(\d+)\s*(?:men|women)/i,
    /sample\s*(?:size\s*)?(?:of\s*)?(\d+)/i,
    /study\s*(?:of|with)\s*(\d+)/i,
    /included\s*(\d+)\s*(?:participants?|patients?|subjects?)/i,
    /total\s*of\s*(\d+)\s*(?:participants?|patients?|subjects?|adults?|people)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > 0 && num <= 100000) {
        return num;
      }
    }
  }

  return 0;
}

/**
 * Generic sample size extraction
 */
function extractGenericSampleSize(text: string): number {
  const match = text.match(/(\d+)\s*(?:subjects?)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > 0 && num <= 100000) {
      return num;
    }
  }
  return 0;
}

// Backward compatible function - returns just the number
export function extractSampleSizeNumber(
  title: string | null,
  abstract: string | null,
  summary: string | null
): number | null {
  const result = extractSampleSize(title, abstract, summary);
  return result?.size || null;
}
