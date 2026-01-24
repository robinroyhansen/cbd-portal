import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createServiceClient();
    const currentYear = new Date().getFullYear();

    // Find studies with future years
    const { data: futureStudies, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, year')
      .gt('year', currentYear);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      found: futureStudies?.length || 0,
      currentYear,
      studies: futureStudies || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createServiceClient();
    const currentYear = new Date().getFullYear();

    // Find studies with future years first
    const { data: futureStudies, error: findError } = await supabase
      .from('kb_research_queue')
      .select('id, title, year')
      .gt('year', currentYear);

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!futureStudies || futureStudies.length === 0) {
      return NextResponse.json({ fixed: 0, message: 'No studies with future years found' });
    }

    // Set year to NULL for future-dated studies
    const { error: updateError } = await supabase
      .from('kb_research_queue')
      .update({ year: null })
      .gt('year', currentYear);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      fixed: futureStudies.length,
      studies: futureStudies.map(s => ({ id: s.id, title: s.title?.slice(0, 80), oldYear: s.year })),
      message: `Set year to NULL for ${futureStudies.length} studies with future years`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
