import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const xLanguage = headersList.get('x-language');
  const host = headersList.get('host');
  const urlLang = request.nextUrl.searchParams.get('lang');

  return NextResponse.json({
    detectedLanguage: xLanguage,
    host,
    urlLangParam: urlLang,
    allHeaders: Object.fromEntries(headersList.entries()),
  });
}
