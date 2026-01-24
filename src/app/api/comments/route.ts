import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { commentCreateSchema, validate } from '@/lib/validations';

// GET approved comments for an article
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('article_id');
    const articleSlug = searchParams.get('slug');

    if (!articleId && !articleSlug) {
      return NextResponse.json({ error: 'Article ID or slug required' }, { status: 400 });
    }

    let query = supabase
      .from('kb_comments')
      .select('id, author_name, comment_text, created_at, parent_id')
      .eq('status', 'approved')
      .order('created_at', { ascending: true }); // Oldest first for conversation flow

    if (articleId) {
      query = query.eq('article_id', articleId);
    } else if (articleSlug) {
      // Get article ID from slug first
      const { data: article } = await supabase
        .from('kb_articles')
        .select('id')
        .eq('slug', articleSlug)
        .single();

      if (!article) {
        return NextResponse.json({ comments: [] });
      }
      query = query.eq('article_id', article.id);
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST new comment
export async function POST(request: NextRequest) {
  // Rate limiting - strict for comment posting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`comments:${clientIp}`, RATE_LIMITS.comments);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many comments. Please wait before posting again.' },
      {
        status: 429,
        headers: { 'Retry-After': rateLimit.resetIn.toString() },
      }
    );
  }

  try {
    const supabase = await createClient();
    const body = await request.json();

    // Honeypot check - if filled, it's a bot
    if (body.honeypot) {
      // Silently accept but don't save (fool the bot)
      return NextResponse.json({ success: true, message: 'Comment submitted for moderation' });
    }

    // Validate input with zod schema
    const validation = validate(commentCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors?.[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const { article_id, author_name, author_email, comment_text, parent_id } = validation.data!;

    // Get IP and user agent from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const author_ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || null;
    const user_agent = request.headers.get('user-agent') || null;

    // Basic spam detection
    const spamPatterns = [
      /\b(viagra|cialis|casino|porn|xxx|sex|lottery|winner|congratulations|click here|buy now)\b/i,
      /https?:\/\/[^\s]+/g, // URLs in comments are suspicious
    ];

    let isSpam = false;
    for (const pattern of spamPatterns) {
      if (pattern.test(comment_text)) {
        isSpam = true;
        break;
      }
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('kb_comments')
      .insert({
        article_id,
        author_name: author_name.trim(),
        author_email: author_email.trim().toLowerCase(),
        comment_text: comment_text.trim(),
        parent_id: parent_id || null,
        author_ip,
        user_agent,
        status: isSpam ? 'spam' : 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Comment submitted for moderation',
      id: comment?.id
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
