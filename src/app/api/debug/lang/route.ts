import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const cookieStore = await cookies();

  const xLanguage = headersList.get('x-language');
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const host = headersList.get('host');
  const urlLang = request.nextUrl.searchParams.get('lang');

  // Determine effective language (same logic as getLanguage)
  const effectiveLanguage = localeCookie || xLanguage || 'en';

  return NextResponse.json({
    effectiveLanguage,
    localeCookie,
    xLanguageHeader: xLanguage,
    host,
    urlLangParam: urlLang,
  });
}
