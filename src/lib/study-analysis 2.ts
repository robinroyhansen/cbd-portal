/**
 * Study Analysis Utilities
 *
 * Functions for extracting study information from titles and abstracts.
 * Used by both the research list and individual study pages.
 */

// Subject types for sample size
export type SubjectType = 'humans' | 'mice' | 'rats' | 'dogs' | 'cats' | 'animals' | 'cells';

export interface SampleInfo {
  size: number;
  subjectType: SubjectType;
  label: string;
}

/**
 * Extract sample size and subject type from study text
 */
export function extractSampleInfo(text: string, studyType?: string): SampleInfo | null {
  const lowerText = text.toLowerCase();

  // Check for in vitro / cell studies first
  if (lowerText.includes('in vitro') || lowerText.includes('cell line') || lowerText.includes('cell culture') ||
      lowerText.includes('cultured cells') || lowerText.includes('hela cells') || lowerText.includes('cell viability')) {
    return { size: 0, subjectType: 'cells', label: 'In vitro' };
  }

  // Subject type detection patterns
  const subjectPatterns: { type: SubjectType; patterns: RegExp[]; label: string }[] = [
    {
      type: 'humans',
      patterns: [
        /(\d+)\s*(?:patient|patients)/gi,
        /(?:patient|patients)\s*(?:\()?n\s*=\s*(\d+)/gi,
        /(\d+)\s*(?:participant|participants|subject|subjects|volunteer|volunteers|adult|adults|individual|individuals|people|person|persons)/gi,
        /(\d+)\s*(?:healthy|human)\s+(?:volunteer|subject|participant|adult)/gi,
        /(?:enrolled|recruited|randomized|included)\s+(\d+)\s*(?:participant|subject|patient|adult|individual|volunteer)/gi,
        /(?:participant|subject|volunteer|adult|individual)s?\s*(?:\()?n\s*=\s*(\d+)/gi,
        /(?:will|to)\s+(?:enroll|recruit|include|randomize)\s+(?:up\s+to\s+)?(\d+)/gi,
        /(?:up\s+to|approximately|about|target|targeting)\s+(\d+)\s*(?:patient|participant|subject|volunteer|adult|individual)/gi,
        /enroll(?:ment|ing)?\s+(?:of\s+)?(?:up\s+to\s+)?(\d+)/gi,
        /sample\s+size\s+(?:of\s+)?(\d+)/gi,
      ],
      label: 'humans'
    },
    {
      type: 'mice',
      patterns: [
        /(\d+)\s*(?:mice|mouse)/gi,
        /(?:mice|mouse)\s*(?:\()?n\s*=\s*(\d+)/gi,
        /(\d+)\s*(?:c57bl|balb\/c|cd-1|nude mice|transgenic mice)/gi,
      ],
      label: 'mice'
    },
    {
      type: 'rats',
      patterns: [
        /(\d+)\s*(?:rats?|wistar|sprague[- ]dawley)/gi,
        /(?:rat|rats)\s*(?:\()?n\s*=\s*(\d+)/gi,
      ],
      label: 'rats'
    },
    {
      type: 'dogs',
      patterns: [
        /(\d+)\s*(?:dogs?|canines?|beagles?)/gi,
        /(?:dog|dogs|canine)\s*(?:\()?n\s*=\s*(\d+)/gi,
      ],
      label: 'dogs'
    },
    {
      type: 'cats',
      patterns: [
        /(\d+)\s*(?:cats?|felines?)/gi,
        /(?:cat|cats|feline)\s*(?:\()?n\s*=\s*(\d+)/gi,
      ],
      label: 'cats'
    },
    {
      type: 'animals',
      patterns: [
        /(\d+)\s*(?:animal|animals|rabbits?|guinea pigs?|primates?|monkeys?|pigs?|piglets?)/gi,
        /(?:animal|rabbit|guinea pig)\s*(?:\()?n\s*=\s*(\d+)/gi,
      ],
      label: 'animals'
    },
  ];

  // Try to match subject-specific patterns first
  for (const { type, patterns, label } of subjectPatterns) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const num = parseInt(match[1] || match[2]);
        if (num >= 5 && num < 50000) {
          return { size: num, subjectType: type, label: `${num} ${label}` };
        }
      }
    }
  }

  // Fallback: generic n= patterns
  const genericPatterns = [
    /\bn\s*=\s*(\d+)/gi,
    /\bN\s*=\s*(\d+)/gi,
    /(?:total of|sample of|population of)\s+(\d+)/gi,
    /(\d+)\s+(?:were|was)\s+(?:enrolled|recruited|included|randomized)/gi,
  ];

  let maxSize = 0;
  for (const pattern of genericPatterns) {
    pattern.lastIndex = 0;
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const num = parseInt(match[1]);
      if (num > maxSize && num < 50000 && num >= 5) maxSize = num;
    }
  }

  if (maxSize > 0) {
    // Try to infer subject type from context
    if (lowerText.includes('mice') || lowerText.includes('mouse') || lowerText.includes('murine')) {
      return { size: maxSize, subjectType: 'mice', label: `${maxSize} mice` };
    }
    if (lowerText.includes('rats') || lowerText.includes('rat ') || lowerText.includes('wistar') || lowerText.includes('sprague')) {
      return { size: maxSize, subjectType: 'rats', label: `${maxSize} rats` };
    }
    if (/\b(dogs?|canines?|beagles?)\b/i.test(lowerText)) {
      return { size: maxSize, subjectType: 'dogs', label: `${maxSize} dogs` };
    }
    if (/\b(cats?|felines?)\b/i.test(lowerText)) {
      return { size: maxSize, subjectType: 'cats', label: `${maxSize} cats` };
    }
    if (lowerText.includes('animal') || lowerText.includes('preclinical')) {
      return { size: maxSize, subjectType: 'animals', label: `${maxSize} animals` };
    }
    // Default to humans for clinical studies
    return { size: maxSize, subjectType: 'humans', label: `${maxSize} humans` };
  }

  return null;
}

/**
 * Extract study status from text and URL
 */
export function extractStudyStatus(text: string, url: string): 'completed' | 'ongoing' | 'recruiting' | null {
  const lowerText = text.toLowerCase();
  const lowerUrl = url?.toLowerCase() || '';

  // Check URL first for clinical trials
  if (lowerUrl.includes('clinicaltrials.gov')) {
    if (lowerText.includes('recruiting') && !lowerText.includes('not recruiting')) {
      return 'recruiting';
    }
    if (lowerText.includes('active') || lowerText.includes('enrolling')) {
      return 'ongoing';
    }
  }

  // Check text content
  if (lowerText.includes('completed study') || lowerText.includes('study was completed') ||
      lowerText.includes('trial completed') || lowerText.includes('results show') ||
      lowerText.includes('we found') || lowerText.includes('our results') ||
      lowerText.includes('in conclusion') || lowerText.includes('data suggest')) {
    return 'completed';
  }

  if (lowerText.includes('currently recruiting') || lowerText.includes('now recruiting') ||
      lowerText.includes('seeking participants')) {
    return 'recruiting';
  }

  if (lowerText.includes('ongoing') || lowerText.includes('in progress') ||
      lowerText.includes('currently underway')) {
    return 'ongoing';
  }

  // Default to completed for published studies
  return 'completed';
}

/**
 * Extract treatment/intervention from text
 */
export function extractTreatment(text: string): string | null {
  const lowerText = text.toLowerCase();

  // Helper to normalize CBD terminology
  const normalizeCBD = (str: string): string => {
    return str
      .replace(/cannabidiol/gi, 'CBD')
      .replace(/\bcbd\b/gi, 'CBD')
      .replace(/CBD\s+oil/gi, 'CBD Oil')
      .replace(/CBD\s+extract/gi, 'CBD Extract')
      .replace(/CBD\s+isolate/gi, 'CBD Isolate')
      .replace(/oral\s+CBD/gi, 'Oral CBD')
      .replace(/sublingual\s+CBD/gi, 'Sublingual CBD')
      .replace(/topical\s+CBD/gi, 'Topical CBD')
      .replace(/full[- ]spectrum/gi, 'Full-Spectrum')
      .replace(/broad[- ]spectrum/gi, 'Broad-Spectrum')
      .trim();
  };

  // CBD-specific patterns
  const cbdPatterns = [
    /(?:oral|sublingual|topical)?\s*(?:cbd|cannabidiol)\s*(?:\d+\s*mg)?/gi,
    /(?:epidiolex|sativex|nabiximols)/gi,
    /(?:cbd|cannabidiol)\s*(?:oil|extract|isolate|tincture|capsule)/gi,
    /(?:full|broad)[- ]spectrum\s*(?:cbd|hemp|cannabis)/gi,
  ];

  for (const pattern of cbdPatterns) {
    const match = text.match(pattern);
    if (match) {
      let treatment = match[0].trim();
      if (treatment.toLowerCase().includes('epidiolex')) return 'Epidiolex (CBD)';
      if (treatment.toLowerCase().includes('sativex')) return 'Sativex (THC:CBD)';
      if (treatment.toLowerCase().includes('nabiximols')) return 'Nabiximols (THC:CBD)';
      return normalizeCBD(treatment);
    }
  }

  // Dose patterns
  const dosePattern = /(\d+)\s*(?:mg|milligram)s?\s*(?:of\s*)?(?:cbd|cannabidiol)/gi;
  const doseMatch = text.match(dosePattern);
  if (doseMatch) {
    return normalizeCBD(doseMatch[0].replace(/\s+/g, ' ').trim());
  }

  // Generic intervention patterns
  if (lowerText.includes('placebo-controlled') || lowerText.includes('placebo controlled')) {
    if (lowerText.includes('cbd') || lowerText.includes('cannabidiol')) {
      return 'CBD vs Placebo';
    }
  }

  return null;
}

/**
 * Get subject type icon
 */
export function getSubjectIcon(subjectType: SubjectType): string {
  switch (subjectType) {
    case 'humans': return '👥';
    case 'mice': return '🐁';
    case 'rats': return '🐀';
    case 'dogs': return '🐕';
    case 'cats': return '🐈';
    case 'animals': return '🐾';
    case 'cells': return '🧫';
    default: return '👥';
  }
}

/**
 * Get study status info
 */
export function getStudyStatusInfo(status: 'completed' | 'ongoing' | 'recruiting' | null): { label: string; icon: string; color: string } {
  switch (status) {
    case 'completed':
      return { label: 'Completed', icon: '✓', color: 'bg-green-100 text-green-700' };
    case 'ongoing':
      return { label: 'In Progress', icon: '⏳', color: 'bg-blue-100 text-blue-700' };
    case 'recruiting':
      return { label: 'Recruiting', icon: '📢', color: 'bg-purple-100 text-purple-700' };
    default:
      return { label: 'Completed', icon: '✓', color: 'bg-green-100 text-green-700' };
  }
}
