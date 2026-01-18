import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This is a one-time migration endpoint - delete after running
export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results: string[] = [];

  try {
    // Try to add view_count column via SQL
    // Supabase doesn't allow DDL via REST API, so we check if column exists
    // and if not, provide instructions

    // First, let's see if the column exists by trying to query it
    const { data, error } = await supabase
      .from('kb_glossary')
      .select('id, view_count')
      .limit(1);

    if (error) {
      if (error.message.includes('view_count') || error.code === '42703') {
        results.push('Column view_count does not exist yet');
        results.push('Please run this SQL in Supabase Dashboard:');
        results.push('ALTER TABLE kb_glossary ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;');
        return NextResponse.json({
          success: false,
          message: 'Column needs to be added via SQL Editor',
          results
        });
      }
      throw error;
    }

    results.push('Column view_count already exists!');

    // Initialize null values to 0
    const { error: updateError } = await supabase
      .from('kb_glossary')
      .update({ view_count: 0 })
      .is('view_count', null);

    if (updateError) {
      results.push(`Warning: Could not update null values: ${updateError.message}`);
    } else {
      results.push('Initialized null view_counts to 0');
    }

    // Get current stats
    const { data: stats } = await supabase
      .from('kb_glossary')
      .select('term, view_count')
      .order('view_count', { ascending: false })
      .limit(5);

    results.push('Top 5 terms: ' + JSON.stringify(stats));

    return NextResponse.json({
      success: true,
      message: 'Migration complete',
      results
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 });
  }
}
