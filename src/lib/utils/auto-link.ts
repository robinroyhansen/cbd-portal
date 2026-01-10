/**
 * Utility to auto-link first mentions of external review platforms in text
 */

interface AutoLinkOptions {
  brandName: string;
  trustpilotUrl?: string | null;
  websiteDomain?: string | null; // Used to construct Trustpilot URL if trustpilotUrl is null
}

/**
 * Auto-links first mention of "Trustpilot" and "Google Reviews" in markdown text
 * Returns the modified text with standard markdown links
 * Note: ReactMarkdown handles target="_blank" for external links automatically
 */
export function autoLinkReviewPlatforms(text: string, options: AutoLinkOptions): string {
  const { brandName, trustpilotUrl, websiteDomain } = options;
  let result = text;

  // Determine Trustpilot URL - use provided URL or construct from domain
  let finalTrustpilotUrl = trustpilotUrl;
  if (!finalTrustpilotUrl && websiteDomain) {
    // Construct Trustpilot URL from website domain
    const cleanDomain = websiteDomain.replace(/^www\./, '');
    finalTrustpilotUrl = `https://www.trustpilot.com/review/${cleanDomain}`;
  }

  // Auto-link first mention of "Trustpilot"
  if (finalTrustpilotUrl) {
    // Match "Trustpilot" that's not already in a link (not preceded by [ or followed by ])
    const trustpilotRegex = /(?<!\[)Trustpilot(?!\])/i;
    result = result.replace(trustpilotRegex, (match) => {
      return `[${match} ↗](${finalTrustpilotUrl})`;
    });
  }

  // Auto-link first mention of "Google Reviews" or "Google reviews"
  const googleReviewsRegex = /(?<!\[)Google [Rr]eviews?(?!\])/;
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(brandName + ' reviews')}`;
  result = result.replace(googleReviewsRegex, (match) => {
    return `[${match} ↗](${googleSearchUrl})`;
  });

  return result;
}

/**
 * React component version - processes text and returns JSX with links
 * For use in non-markdown contexts
 */
export function processTextWithLinks(
  text: string,
  options: AutoLinkOptions
): { text: string; hasLinks: boolean } {
  const { brandName, trustpilotUrl } = options;
  let result = text;
  let hasLinks = false;

  // Track if we've already linked each platform
  let trustpilotLinked = false;
  let googleLinked = false;

  // Process Trustpilot mentions
  if (trustpilotUrl && !trustpilotLinked) {
    const trustpilotRegex = /Trustpilot/i;
    if (trustpilotRegex.test(result)) {
      result = result.replace(trustpilotRegex, (match) => {
        trustpilotLinked = true;
        hasLinks = true;
        return `<a href="${trustpilotUrl}" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:text-green-700 underline">${match} ↗</a>`;
      });
    }
  }

  // Process Google Reviews mentions
  if (!googleLinked) {
    const googleReviewsRegex = /Google [Rr]eviews?/;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(brandName + ' reviews')}`;
    if (googleReviewsRegex.test(result)) {
      result = result.replace(googleReviewsRegex, (match) => {
        googleLinked = true;
        hasLinks = true;
        return `<a href="${googleSearchUrl}" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:text-green-700 underline">${match} ↗</a>`;
      });
    }
  }

  return { text: result, hasLinks };
}
