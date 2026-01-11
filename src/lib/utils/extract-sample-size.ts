/**
 * Extract sample size and type from study text (title, abstract, summary)
 * Distinguishes between human and animal studies
 */

export interface SampleSizeResult {
  size: number;
  type: 'human' | 'animal' | 'unknown';
}

// Number words to digits
const wordToNumber: Record<string, number> = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
  'seventy': 70, 'eighty': 80, 'ninety': 90, 'hundred': 100,
};

export function extractSampleSize(
  title: string | null,
  abstract: string | null,
  summary: string | null
): SampleSizeResult | null {
  const text = `${title || ''} ${summary || ''} ${abstract || ''}`.toLowerCase();

  if (!text.trim()) return null;

  // Detect animal study indicators
  const animalIndicators = /\b(mice|mouse|rat|rats|rodent|rodents|animal|animals|dog|dogs|cat|cats|rabbit|rabbits|monkey|monkeys|primate|primates|pig|pigs|in vivo|murine|canine|feline|bovine|C57BL|Sprague.?Dawley|Wistar)\b/i;
  const isAnimalStudy = animalIndicators.test(text);

  // Detect human study indicators
  const humanIndicators = /\b(patients?|participants?|volunteers?|adults?|children|humans?|men|women|subjects?|individuals?|people|clinical trial|randomized|placebo|double.?blind)\b/i;
  const isHumanStudy = humanIndicators.test(text);

  // Animal sample patterns
  const animalPatterns = [
    /(\d+)\s*(?:mice|mouse)/i,
    /(\d+)\s*(?:rats?|rodents?)/i,
    /(\d+)\s*(?:animals?)/i,
    /(?:mice|rats?|animals?)\s*\(?n\s*=\s*(\d+)\)?/i,
  ];

  // Human sample patterns (ordered by reliability)
  const humanPatterns = [
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

  // If clearly an animal study (and not also human), use animal patterns
  if (isAnimalStudy && !isHumanStudy) {
    for (const pattern of animalPatterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseInt(match[1] || match[2], 10);
        if (num > 0 && num <= 10000) {
          return { size: num, type: 'animal' };
        }
      }
    }
    // Fall back to general n= pattern for animals
    const nMatch = text.match(/\(?n\s*=\s*(\d+)\)?/i);
    if (nMatch) {
      const num = parseInt(nMatch[1], 10);
      if (num > 0 && num <= 10000) {
        return { size: num, type: 'animal' };
      }
    }
  }

  // If human study or unclear (prefer human classification), use human patterns
  if (isHumanStudy || !isAnimalStudy) {
    for (const pattern of humanPatterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > 0 && num <= 100000) {
          return { size: num, type: 'human' };
        }
      }
    }
  }

  // If we found numbers but couldn't classify clearly
  const genericMatch = text.match(/(\d+)\s*(?:subjects?)/i);
  if (genericMatch) {
    const num = parseInt(genericMatch[1], 10);
    if (num > 0 && num <= 100000) {
      return { size: num, type: 'unknown' };
    }
  }

  return null;
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
