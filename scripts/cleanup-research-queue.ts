/**
 * Standalone script to clean existing records in kb_research_queue
 *
 * Usage: npx ts-node scripts/cleanup-research-queue.ts [--dry-run]
 * Or: npx tsx scripts/cleanup-research-queue.ts [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local manually
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public'
    }
  }
);

// HTML entity map for common entities
const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&ndash;': '\u2013',
  '&mdash;': '\u2014',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&hellip;': '...',
  '&copy;': '(c)',
  '&reg;': '(R)',
  '&trade;': '(TM)',
  '&deg;': ' degrees',
  '&plusmn;': '+/-',
  '&times;': 'x',
  '&divide;': '/',
  '&frac12;': '1/2',
  '&frac14;': '1/4',
  '&frac34;': '3/4',
  '&alpha;': 'alpha',
  '&beta;': 'beta',
  '&gamma;': 'gamma',
  '&delta;': 'delta',
  '&epsilon;': 'epsilon',
  '&micro;': 'micro',
  '&pi;': 'pi',
  '&sigma;': 'sigma',
  '&omega;': 'omega',
  '&Prime;': '"',
  '&prime;': "'",
  '&le;': '<=',
  '&ge;': '>=',
  '&ne;': '!=',
  '&asymp;': '~=',
  '&infin;': 'infinity',
  '&sum;': 'sum',
  '&prod;': 'product',
  '&radic;': 'sqrt',
  '&part;': 'partial',
  '&int;': 'integral',
  '&forall;': 'for all',
  '&exist;': 'exists',
  '&empty;': 'empty',
  '&isin;': 'in',
  '&notin;': 'not in',
  '&sub;': 'subset',
  '&sup;': 'superset',
  '&and;': 'and',
  '&or;': 'or',
  '&cap;': 'intersection',
  '&cup;': 'union',
};

function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  let result = text;
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    result = result.replace(new RegExp(entity, 'gi'), char);
  }
  result = result.replace(/&#(\d+);/g, (_, code) => {
    const num = parseInt(code, 10);
    return num > 0 && num < 65536 ? String.fromCharCode(num) : '';
  });
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
    const num = parseInt(code, 16);
    return num > 0 && num < 65536 ? String.fromCharCode(num) : '';
  });
  return result;
}

function stripHtmlTags(text: string): string {
  if (!text) return text;
  let result = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '');
  return result;
}

function normalizeWhitespace(text: string): string {
  if (!text) return text;
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

function cleanText(text: string | null | undefined): string | null {
  if (!text) return null;
  let result = text;
  result = decodeHtmlEntities(result);
  result = decodeHtmlEntities(result);
  result = stripHtmlTags(result);
  result = normalizeWhitespace(result);
  return result.length > 0 ? result : null;
}

function cleanTitle(title: string | null | undefined): string | null {
  if (!title) return null;
  let result = cleanText(title);
  if (!result) return null;
  result = result.replace(/\n/g, ' ');
  result = result.replace(/\s+/g, ' ').trim();
  result = result.replace(/\.{2,}$/, '.');
  return result;
}

function cleanAbstract(abstract: string | null | undefined): string | null {
  if (!abstract) return null;
  let result = cleanText(abstract);
  if (!result) return null;
  result = result
    .split('\n\n')
    .map(para => para.replace(/\n/g, ' '))
    .join('\n\n');
  result = result.replace(/  +/g, ' ');
  return result;
}

function extractYearFromDoi(doi: string | null | undefined): number | null {
  if (!doi) return null;
  const patterns = [
    /[._-](20[0-2]\d)[._-]/,
    /[._-](19[89]\d)[._-]/,
    /\.(20[0-2]\d)\./,
    /_(20[0-2]\d)_/,
    /-(20[0-2]\d)-/,
  ];
  for (const pattern of patterns) {
    const match = doi.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      const currentYear = new Date().getFullYear();
      if (year >= 1900 && year <= currentYear + 1) {
        return year;
      }
    }
  }
  return null;
}

function validateYear(
  reportedYear: number | null | undefined,
  doi: string | null | undefined,
): number | null {
  const currentYear = new Date().getFullYear();
  const doiYear = extractYearFromDoi(doi);

  if (reportedYear) {
    if (reportedYear > currentYear + 1) {
      return doiYear || null;
    }
    if (doiYear && Math.abs(reportedYear - doiYear) > 1) {
      return doiYear;
    }
    return reportedYear;
  }
  return doiYear || null;
}

interface ResearchQueueRecord {
  id: string;
  title: string;
  abstract: string | null;
  authors: string | null;
  publication: string | null;
  year: number | null;
  doi: string | null;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const batchSize = 100;

  console.log('='.repeat(60));
  console.log('Research Queue Cleanup Script');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (will update database)'}`);
  console.log('');

  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Failed to get count:', countError.message);
    process.exit(1);
  }

  console.log(`Total records to process: ${totalCount}`);
  console.log('');

  let processed = 0;
  let updated = 0;
  let offset = 0;
  const changesByField: Record<string, number> = {};
  const sampleChanges: Array<{
    id: string;
    field: string;
    before: string | number | null;
    after: string | number | null;
  }> = [];

  while (true) {
    const { data: records, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, authors, publication, year, doi')
      .range(offset, offset + batchSize - 1)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Failed to fetch records: ${error.message}`);
      break;
    }

    if (!records || records.length === 0) {
      break;
    }

    for (const record of records as ResearchQueueRecord[]) {
      processed++;

      const cleanedTitle = cleanTitle(record.title);
      const cleanedAbstract = cleanAbstract(record.abstract);
      const cleanedAuthors = cleanText(record.authors);
      const cleanedPublication = cleanText(record.publication);
      const validatedYear = validateYear(record.year, record.doi);

      const updates: Record<string, string | number | null> = {};

      if (cleanedTitle !== record.title && cleanedTitle !== null) {
        changesByField['title'] = (changesByField['title'] || 0) + 1;
        if (sampleChanges.length < 10) {
          sampleChanges.push({
            id: record.id,
            field: 'title',
            before: record.title?.substring(0, 80) || null,
            after: cleanedTitle?.substring(0, 80) || null
          });
        }
        updates.title = cleanedTitle;
      }

      if (cleanedAbstract !== record.abstract) {
        if (record.abstract && cleanedAbstract && record.abstract !== cleanedAbstract) {
          changesByField['abstract'] = (changesByField['abstract'] || 0) + 1;
        }
        updates.abstract = cleanedAbstract;
      }

      if (cleanedAuthors !== record.authors) {
        if (record.authors && cleanedAuthors && record.authors !== cleanedAuthors) {
          changesByField['authors'] = (changesByField['authors'] || 0) + 1;
        }
        updates.authors = cleanedAuthors;
      }

      if (cleanedPublication !== record.publication) {
        if (record.publication && cleanedPublication && record.publication !== cleanedPublication) {
          changesByField['publication'] = (changesByField['publication'] || 0) + 1;
        }
        updates.publication = cleanedPublication;
      }

      if (validatedYear !== record.year) {
        changesByField['year'] = (changesByField['year'] || 0) + 1;
        if (sampleChanges.length < 20) {
          sampleChanges.push({
            id: record.id,
            field: 'year',
            before: record.year,
            after: validatedYear
          });
        }
        updates.year = validatedYear;
      }

      if (Object.keys(updates).length > 0) {
        updated++;

        if (!dryRun) {
          const { error: updateError } = await supabase
            .from('kb_research_queue')
            .update(updates)
            .eq('id', record.id);

          if (updateError) {
            console.error(`Failed to update record ${record.id}:`, updateError.message);
          }
        }
      }
    }

    // Progress update
    const progress = Math.round((processed / (totalCount || 1)) * 100);
    process.stdout.write(`\rProcessed: ${processed}/${totalCount} (${progress}%) - Updates: ${updated}`);

    offset += batchSize;

    if (offset > (totalCount || 0) + batchSize) {
      break;
    }
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log(`Records processed: ${processed}`);
  console.log(`Records ${dryRun ? 'that would be' : ''} updated: ${updated}`);
  console.log('');
  console.log('Changes by field:');
  for (const [field, count] of Object.entries(changesByField)) {
    console.log(`  ${field}: ${count}`);
  }
  console.log('');

  if (sampleChanges.length > 0) {
    console.log('Sample changes:');
    for (const change of sampleChanges) {
      console.log(`  [${change.field}]`);
      console.log(`    Before: ${change.before}`);
      console.log(`    After:  ${change.after}`);
      console.log('');
    }
  }

  if (dryRun) {
    console.log('This was a DRY RUN. No changes were made to the database.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('Cleanup complete!');
  }
}

main().catch(console.error);
