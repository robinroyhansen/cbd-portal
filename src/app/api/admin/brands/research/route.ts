import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { getCountryCode } from '@/lib/utils/brand-helpers';

interface BrandResearchResult {
  success: boolean;
  data?: {
    headquarters_country: string | null; // ISO code
    founded_year: number | null;
    short_description: string | null;
  };
  error?: string;
}

const SYSTEM_PROMPT = `You are a research assistant extracting company information from website content.

Your task is to extract specific details about CBD/hemp brands from their website content.

EXTRACT THE FOLLOWING (return null if not found):
1. headquarters_country: Where the company is based. Return the ISO 3166-1 alpha-2 country code (e.g., "US", "GB", "DE", "CA", "AU", "NL", "CH")
2. founded_year: The year the company was founded (just the 4-digit year, e.g., 2014)
3. short_description: A 2-3 sentence description of what the company does and what makes them unique (max 250 characters)

RULES:
- Only extract information that is explicitly stated or very clearly implied
- For country codes: US (United States), GB (United Kingdom), CA (Canada), DE (Germany), AU (Australia), NL (Netherlands), CH (Switzerland), FR (France), etc.
- For founded_year, only include if a specific year is mentioned
- For description, focus on: what products they sell, their unique value proposition, certifications
- Be concise and factual
- If information is not found, return null for that field

Return ONLY valid JSON in this exact format, no other text:
{
  "headquarters_country": "US" or null,
  "founded_year": 2014 or null,
  "short_description": "Brief company description" or null
}`;

async function fetchWebsiteContent(url: string): Promise<string | null> {
  try {
    const urls = [
      url,
      url.replace(/\/$/, '') + '/about',
      url.replace(/\/$/, '') + '/about-us',
      url.replace(/\/$/, '') + '/our-story',
    ];

    let combinedContent = '';

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
          // Extract text content, removing scripts and styles
          const textContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 15000); // Limit content size

          combinedContent += `\n\n--- Content from ${pageUrl} ---\n${textContent}`;
        }
      } catch {
        // Continue to next URL if one fails
      }
    }

    return combinedContent || null;
  } catch (error) {
    console.error('Error fetching website:', error);
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<BrandResearchResult>> {
  try {
    const body = await request.json();
    const { name, websiteUrl } = body;

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
    const websiteContent = await fetchWebsiteContent(websiteUrl);

    if (!websiteContent) {
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

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback: return empty result if no API key
      console.warn('ANTHROPIC_API_KEY not configured, returning empty result');
      return NextResponse.json({
        success: true,
        data: {
          headquarters_country: null,
          founded_year: null,
          short_description: null
        }
      });
    }

    // Call Claude Haiku to extract information
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Extract company information for "${name || 'this brand'}" from this website content:\n\n${websiteContent.slice(0, 12000)}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      // Return empty result on API error
      return NextResponse.json({
        success: true,
        data: {
          headquarters_country: null,
          founded_year: null,
          short_description: null
        }
      });
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text?.trim();

    if (!responseText) {
      return NextResponse.json({
        success: true,
        data: {
          headquarters_country: null,
          founded_year: null,
          short_description: null
        }
      });
    }

    // Parse the JSON response
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const extracted = JSON.parse(jsonMatch[0]);

      // Validate and normalize the country code
      let countryCode = extracted.headquarters_country;
      if (countryCode && typeof countryCode === 'string') {
        // If it's already a 2-letter code, use it; otherwise try to convert
        if (countryCode.length === 2) {
          countryCode = countryCode.toUpperCase();
        } else {
          // Try to get ISO code from full name
          countryCode = getCountryCode(countryCode);
        }
      }

      // Validate founded year
      let foundedYear = extracted.founded_year;
      if (foundedYear) {
        foundedYear = parseInt(String(foundedYear));
        const currentYear = new Date().getFullYear();
        if (isNaN(foundedYear) || foundedYear < 1900 || foundedYear > currentYear) {
          foundedYear = null;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          headquarters_country: countryCode || null,
          founded_year: foundedYear || null,
          short_description: extracted.short_description?.slice(0, 500) || null
        }
      });
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError, responseText);
      return NextResponse.json({
        success: true,
        data: {
          headquarters_country: null,
          founded_year: null,
          short_description: null
        }
      });
    }

  } catch (error) {
    console.error('Brand research error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
