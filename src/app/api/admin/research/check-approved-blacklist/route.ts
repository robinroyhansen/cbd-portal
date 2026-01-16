import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface BlacklistTerm {
  term: string;
  match_type: 'contains' | 'exact' | 'regex';
  case_sensitive: boolean;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesBlacklist(text: string, blacklist: BlacklistTerm[]): string | null {
  for (const bl of blacklist) {
    const searchText = bl.case_sensitive ? text : text.toLowerCase();
    const searchTerm = bl.case_sensitive ? bl.term : bl.term.toLowerCase();

    let matches = false;

    if (bl.match_type === 'contains') {
      matches = searchText.includes(searchTerm);
    } else if (bl.match_type === 'exact') {
      const regex = new RegExp(`\\b${escapeRegex(searchTerm)}\\b`, bl.case_sensitive ? '' : 'i');
      matches = regex.test(text);
    } else if (bl.match_type === 'regex') {
      try {
        const regex = new RegExp(bl.term, bl.case_sensitive ? '' : 'i');
        matches = regex.test(text);
      } catch {
        continue;
      }
    }

    if (matches) {
      return bl.term;
    }
  }

  return null;
}

export async function POST() {
  try {
    const supabase = createServiceClient();

    // Get blacklist terms
    const { data: blacklist, error: blacklistError } = await supabase
      .from('research_blacklist')
      .select('term, match_type, case_sensitive');

    if (blacklistError) {
      console.error('Error fetching blacklist:', blacklistError);
      return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 });
    }

    if (!blacklist || blacklist.length === 0) {
      return NextResponse.json({ found: 0, checked: 0, flaggedStudies: [], message: 'No blacklist terms configured' });
    }

    // Get approved studies
    const { data: studies, error: studiesError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract')
      .eq('status', 'approved');

    if (studiesError) {
      console.error('Error fetching studies:', studiesError);
      return NextResponse.json({ error: 'Failed to fetch studies' }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({ found: 0, checked: 0, flaggedStudies: [], message: 'No approved studies to check' });
    }

    const flaggedStudies: { id: string; title: string; matchedTerm: string }[] = [];

    for (const study of studies) {
      const textToCheck = `${study.title || ''} ${study.abstract || ''}`;
      const matchedTerm = matchesBlacklist(textToCheck, blacklist as BlacklistTerm[]);

      if (matchedTerm) {
        flaggedStudies.push({
          id: study.id,
          title: study.title?.slice(0, 100) || 'Untitled',
          matchedTerm
        });
      }
    }

    // Flag matched studies in database (optional - add columns if needed)
    // For now, just return the results without modifying the database

    return NextResponse.json({
      found: flaggedStudies.length,
      checked: studies.length,
      flaggedStudies: flaggedStudies.slice(0, 20), // Return first 20 for preview
      message: `Found ${flaggedStudies.length} approved studies matching blacklist terms`
    });
  } catch (error) {
    console.error('Error checking approved studies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
