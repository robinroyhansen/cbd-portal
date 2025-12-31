import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('kb_articles')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // For now, return a simple response as puppeteer requires additional setup
  // In production, this would use puppeteer to generate PDFs
  return NextResponse.json({
    message: 'PDF generation not available in this environment. Please use the print function instead.'
  }, { status: 501 });

  /*
  // Future implementation with puppeteer:
  const puppeteer = require('puppeteer');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Georgia, serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 24pt; margin-bottom: 10px; }
        .meta { color: #666; font-size: 10pt; margin-bottom: 20px; }
        .content { font-size: 11pt; }
        .disclaimer { font-size: 9pt; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; }
        .author { background: #f5f5f5; padding: 15px; margin-top: 30px; }
        h2 { font-size: 16pt; margin-top: 24px; }
        h3 { font-size: 14pt; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>${article.title}</h1>
      <div class="meta">
        By Robin Roy Krigslund-Hansen | Last updated: ${new Date(article.updated_at).toLocaleDateString('en-GB')}
      </div>
      <div class="content">${article.content}</div>
      <div class="author">
        <strong>About the Author</strong><br>
        Robin Roy Krigslund-Hansen is an independent CBD researcher with 12+ years of industry experience.
      </div>
      <div class="disclaimer">
        <strong>Medical Disclaimer:</strong> This article is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional before starting any new supplement regimen.
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
  });

  await browser.close();

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${params.slug}.pdf"`
    }
  });
  */
}