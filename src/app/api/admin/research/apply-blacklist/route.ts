import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

interface BlacklistTerm {
  term: string;
  match_type: 'contains' | 'exact' | 'regex';
  case_sensitive: boolean;
}

function matchesBlacklist(text: string, blacklist: BlacklistTerm[]): string | null {
  for (const bl of blacklist) {
    const searchText = bl.case_sensitive ? text : text.toLowerCase();
    const searchTerm = bl.case_sensitive ? bl.term : bl.term.toLowerCase();

    let matches = false;

    if (bl.match_type === 'contains') {
      matches = searchText.includes(searchTerm);
    } else if (bl.match_type === 'exact') {
      // Match whole word only
      const regex = new RegExp(`\\b${escapeRegex(searchTerm)}\\b`, bl.case_sensitive ? '' : 'i');
      matches = regex.test(text);
    } else if (bl.match_type === 'regex') {
      try {
        const regex = new RegExp(bl.term, bl.case_sensitive ? '' : 'i');
        matches = regex.test(text);
      } catch {
        // Invalid regex, skip
        continue;
      }
    }

    if (matches) {
      return bl.term;
    }
  }

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
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
      return NextResponse.json({ rejected: 0, checked: 0, message: 'No blacklist terms configured' });
    }

    // Get pending studies
    const { data: studies, error: studiesError } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract')
      .eq('status', 'pending');

    if (studiesError) {
      console.error('Error fetching studies:', studiesError);
      return NextResponse.json({ error: 'Failed to fetch studies' }, { status: 500 });
    }

    if (!studies || studies.length === 0) {
      return NextResponse.json({ rejected: 0, checked: 0, message: 'No pending studies to check' });
    }

    const rejectedIds: string[] = [];
    const rejectionReasons: Record<string, string> = {};

    for (const study of studies) {
      const textToCheck = `${study.title || ''} ${study.abstract || ''}`;
      const matchedTerm = matchesBlacklist(textToCheck, blacklist as BlacklistTerm[]);

      if (matchedTerm) {
        rejectedIds.push(study.id);
        rejectionReasons[study.id] = `Blacklist: "${matchedTerm}"`;
      }
    }

    // Bulk reject matched studies
    if (rejectedIds.length > 0) {
      // Update in batches to avoid issues with large sets
      const batchSize = 50;
      for (let i = 0; i < rejectedIds.length; i += batchSize) {
        const batch = rejectedIds.slice(i, i + batchSize);
        const { error: updateError } = await supabase
          .from('kb_research_queue')
          .update({
            status: 'rejected',
            rejection_reason: 'Matched blacklist term',
            reviewed_at: new Date().toISOString(),
          })
          .in('id', batch);

        if (updateError) {
          console.error('Error updating batch:', updateError);
        }
      }
    }

    return NextResponse.json({
      rejected: rejectedIds.length,
      checked: studies.length,
      message: `Rejected ${rejectedIds.length} of ${studies.length} pending studies`,
    });
  } catch (error) {
    console.error('Error applying blacklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
