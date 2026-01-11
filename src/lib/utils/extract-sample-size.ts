/**
 * Extract sample size from study text (title, abstract, summary)
 * Returns the number of participants/subjects in the study
 */

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
): number | null {
  const text = `${title || ''} ${summary || ''} ${abstract || ''}`.toLowerCase();

  if (!text.trim()) return null;

  // Patterns ordered by reliability (most specific first)
  const patterns = [
    // "n=50" or "n = 50" or "(n=50)"
    /\(?n\s*=\s*(\d+)\)?/i,
    // "sample size of 120" or "sample of 120"
    /sample\s*(?:size\s*)?(?:of\s*)?(\d+)/i,
    // "enrolled 85" or "enrolled a total of 85"
    /enrolled\s*(?:a\s*total\s*of\s*)?(\d+)/i,
    // "recruited 200"
    /recruited\s*(\d+)/i,
    // "randomized 150 patients"
    /randomized\s*(\d+)/i,
    // "included 75 participants"
    /included\s*(\d+)\s*(?:participants?|patients?|subjects?)/i,
    // "study of 200 patients"
    /study\s*of\s*(\d+)\s*(?:participants?|patients?|subjects?|adults?|people)/i,
    // "total of 300 participants"
    /total\s*of\s*(\d+)\s*(?:participants?|patients?|subjects?|adults?|people)/i,
    // "50 participants/patients/subjects/adults/volunteers/humans"
    /(\d+)\s*(?:participants?|patients?|subjects?|adults?|volunteers?|humans?|people|individuals?|men|women|children)/i,
    // "twenty participants" (word numbers)
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\s+(?:participants?|patients?|subjects?|adults?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = match[1];

      // Check if it's a word number
      const wordNum = wordToNumber[value.toLowerCase()];
      if (wordNum) return wordNum;

      // Parse as integer
      const num = parseInt(value, 10);

      // Sanity check: between 1 and 100,000
      if (num > 0 && num <= 100000) {
        return num;
      }
    }
  }

  return null;
}
