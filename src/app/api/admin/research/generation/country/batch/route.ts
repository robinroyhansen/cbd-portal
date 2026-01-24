import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

interface CountryUpdate {
  studyId: string;
  country: string;
}

// POST: Save country for multiple studies at once
export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const { updates } = await request.json() as { updates: CountryUpdate[] };

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'updates array is required' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent timeout
    const safeBatch = updates.slice(0, 100);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results: Array<{ studyId: string; status: 'success' | 'error'; error?: string }> = [];
    const saved: string[] = [];

    // Process updates sequentially to avoid overwhelming the database
    for (const update of safeBatch) {
      try {
        const { error } = await supabase
          .from('kb_research_queue')
          .update({ country: update.country })
          .eq('id', update.studyId);

        if (error) {
          results.push({ studyId: update.studyId, status: 'error', error: error.message });
        } else {
          results.push({ studyId: update.studyId, status: 'success' });
          saved.push(update.studyId);
        }
      } catch (err) {
        results.push({
          studyId: update.studyId,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      processed: results.length,
      successful: successCount,
      failed: errorCount,
      saved,
      results,
    });
  } catch (error) {
    console.error('[CountryBatchAPI] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
