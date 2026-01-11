import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { studyId } = await request.json();

    if (!studyId) {
      return NextResponse.json({ error: 'Missing studyId' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const supabase = createServiceClient();

    // Get the study
    const { data: study, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, detected_language, original_title, original_abstract')
      .eq('id', studyId)
      .single();

    if (error || !study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    // If already translated (has original_title), return cached
    if (study.original_title) {
      return NextResponse.json({
        success: true,
        cached: true,
        translated_title: study.title,
        translated_abstract: study.abstract,
        original_title: study.original_title,
        original_abstract: study.original_abstract
      });
    }

    // If English, nothing to translate
    if (!study.detected_language || study.detected_language === 'english') {
      return NextResponse.json({
        success: true,
        message: 'Study is already in English'
      });
    }

    // Translate using Claude Haiku via direct API call
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `Translate the following ${study.detected_language} scientific text to English.
Preserve all scientific/medical terminology accurately.
Respond with JSON only, no other text:
{"title": "translated title", "abstract": "translated abstract"}

Title: ${study.title}

Abstract: ${study.abstract || 'N/A'}`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Translation API error:', response.status, errorData);
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text?.trim() || '';

    // Parse JSON response
    let translated;
    try {
      // Handle potential markdown code blocks
      const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
      translated = JSON.parse(jsonStr);
    } catch {
      // Fallback: try to extract title and abstract manually
      console.error('JSON parse error, using fallback extraction');
      translated = {
        title: responseText.slice(0, 500),
        abstract: ''
      };
    }

    // Store original, update with translated
    const { error: updateError } = await supabase
      .from('kb_research_queue')
      .update({
        original_title: study.title,
        original_abstract: study.abstract,
        title: translated.title || study.title,
        abstract: translated.abstract || study.abstract
      })
      .eq('id', studyId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      translated_title: translated.title,
      translated_abstract: translated.abstract,
      original_title: study.title,
      original_abstract: study.original_abstract
    });

  } catch (error: unknown) {
    console.error('Translation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Translation failed',
      details: message
    }, { status: 500 });
  }
}
