import { NextRequest, NextResponse } from 'next/server';
import { getCountryCode, getDomainFromUrl } from '@/lib/utils/brand-helpers';

interface BrandResearchResult {
  success: boolean;
  data?: {
    headquarters_country: string | null; // ISO code
    founded_year: number | null;
    short_description: string | null;
  };
  error?: string;
}

// Common country names to look for
const COUNTRIES = [
  'United States', 'USA', 'U.S.A.', 'U.S.', 'United Kingdom', 'UK', 'U.K.',
  'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'Switzerland',
  'Ireland', 'Spain', 'Italy', 'Sweden', 'Denmark', 'Norway', 'Belgium',
  'Austria', 'Poland', 'Czech Republic', 'New Zealand'
];

// US state abbreviations that suggest USA
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
  'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
  'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY', 'DC'
];

async function fetchWebsiteContent(url: string): Promise<{ html: string; text: string } | null> {
  try {
    const urls = [
      url,
      url.replace(/\/$/, '') + '/about',
      url.replace(/\/$/, '') + '/about-us',
    ];

    let combinedHtml = '';
    let combinedText = '';

    for (const pageUrl of urls) {
      try {
        const response = await fetch(pageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CBDPortal/1.0; +https://cbd-portal.vercel.app)',
            'Accept': 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const html = await response.text();
          combinedHtml += html;

          // Extract text content
          const textContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          combinedText += ' ' + textContent;
        }
      } catch {
        // Continue to next URL if one fails
      }
    }

    return combinedHtml ? { html: combinedHtml, text: combinedText } : null;
  } catch (error) {
    console.error('Error fetching website:', error);
    return null;
  }
}

function extractMetaDescription(html: string): string | null {
  // Try various meta description patterns
  const patterns = [
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i,
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const description = match[1].trim();
      // Filter out generic descriptions
      if (description.length > 20 && description.length < 500) {
        return description;
      }
    }
  }

  return null;
}

function extractFoundedYear(text: string): number | null {
  const currentYear = new Date().getFullYear();
  const minYear = 1900;

  // Patterns to match founded year
  const patterns = [
    /founded\s+(?:in\s+)?(\d{4})/i,
    /since\s+(\d{4})/i,
    /established\s+(?:in\s+)?(\d{4})/i,
    /est\.?\s*(\d{4})/i,
    /started\s+(?:in\s+)?(\d{4})/i,
    /began\s+(?:in\s+)?(\d{4})/i,
    /©\s*(\d{4})\s*[-–]\s*\d{4}/i, // © 2014-2024 format (use first year)
    /copyright\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const year = parseInt(match[1], 10);
      if (year >= minYear && year <= currentYear) {
        return year;
      }
    }
  }

  return null;
}

function extractCountry(text: string, html: string): string | null {
  // First, try to find country in footer area (usually contains address)
  const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
  const footerText = footerMatch ? footerMatch[1].replace(/<[^>]+>/g, ' ') : '';

  // Also look for contact sections
  const contactMatch = html.match(/<(?:div|section)[^>]*(?:class|id)=["'][^"']*(?:contact|address|location)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/i);
  const contactText = contactMatch ? contactMatch[1].replace(/<[^>]+>/g, ' ') : '';

  const searchText = `${footerText} ${contactText} ${text}`.toLowerCase();

  // Check for US state abbreviations in address-like patterns (e.g., "Boulder, CO 80301")
  const statePattern = /,\s*([A-Z]{2})\s+\d{5}/g;
  const stateMatches = `${footerText} ${contactText}`.match(statePattern);
  if (stateMatches) {
    for (const match of stateMatches) {
      const stateMatch = match.match(/,\s*([A-Z]{2})\s+\d{5}/);
      if (stateMatch && US_STATES.includes(stateMatch[1])) {
        return 'US'; // Return ISO code
      }
    }
  }

  // Check for country names and return ISO codes
  for (const country of COUNTRIES) {
    if (searchText.includes(country.toLowerCase())) {
      // Use the helper to get ISO code
      const isoCode = getCountryCode(country);
      if (isoCode) return isoCode;
    }
  }

  // Check for .co.uk domain suggesting UK
  if (html.includes('.co.uk')) {
    return 'GB';
  }

  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse<BrandResearchResult>> {
  try {
    const body = await request.json();
    const { websiteUrl } = body;

    if (!websiteUrl) {
      return NextResponse.json({
        success: false,
        error: 'Website URL is required'
      }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(websiteUrl);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid website URL'
      }, { status: 400 });
    }

    // Fetch website content
    const content = await fetchWebsiteContent(websiteUrl);

    if (!content) {
      // Return empty result if fetch failed
      return NextResponse.json({
        success: true,
        data: {
          headquarters_country: null,
          founded_year: null,
          short_description: null
        }
      });
    }

    // Extract data using pattern matching
    const short_description = extractMetaDescription(content.html);
    const founded_year = extractFoundedYear(content.text);
    const headquarters_country = extractCountry(content.text, content.html);

    return NextResponse.json({
      success: true,
      data: {
        headquarters_country,
        founded_year,
        short_description
      }
    });

  } catch (error) {
    console.error('Brand research error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
