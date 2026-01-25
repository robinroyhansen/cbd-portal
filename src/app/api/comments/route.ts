import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { commentCreateSchema, validate } from '@/lib/validations';

// Spam detection configuration
const SPAM_PATTERNS = [
  // Pharmaceutical spam
  /\b(viagra|cialis|levitra|pharmacy|pills?|medication|prescription|drug store)\b/i,
  // Casino/gambling
  /\b(casino|poker|gambling|bet(ting)?|slot machine|jackpot|blackjack|roulette)\b/i,
  // Adult content
  /\b(porn|xxx|sex|adult|nude|naked|escort|dating|hookup|singles)\b/i,
  // Money scams
  /\b(lottery|winner|congratulations|million|billion|inheritance|prince|nigeria)\b/i,
  // Marketing spam
  /\b(click here|buy now|order now|limited time|act now|free trial|discount|cheap)\b/i,
  // Crypto scams
  /\b(bitcoin|crypto|ethereum|nft|investment opportunity|guaranteed returns|passive income)\b/i,
  // SEO spam
  /\b(seo|backlink|page rank|website traffic|guest post)\b/i,
  // Typical spam phrases
  /\b(work from home|make money|earn \$|weight loss|lose weight fast)\b/i,
];

const SPAM_EMAIL_DOMAINS = [
  'tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com',
  'temp-mail.org', '10minutemail.com', 'trashmail.com', 'fakeinbox.com',
  'yopmail.com', 'sharklasers.com', 'getairmail.com', 'dispostable.com',
];

/**
 * Detect if a comment is likely spam
 */
function detectSpam(text: string, email: string, name: string): boolean {
  // Check spam patterns in text
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) return true;
  }

  // Check for spam email domains
  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (emailDomain && SPAM_EMAIL_DOMAINS.includes(emailDomain)) return true;

  // Too many URLs (more than 2 links is suspicious)
  const urlCount = (text.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount > 2) return true;

  // All caps detection (more than 50% caps in text over 20 chars)
  if (text.length > 20) {
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && capsCount / letterCount > 0.5) return true;
  }

  // Repeated characters (e.g., "aaaaaaaa" or "!!!!!!")
  if (/(.)\1{5,}/.test(text)) return true;

  // Name is a URL or contains suspicious patterns
  if (/https?:\/\//.test(name) || SPAM_PATTERNS.some(p => p.test(name))) return true;

  // Very short generic names that are often used by bots
  const suspiciousNames = ['admin', 'user', 'guest', 'test', 'webmaster', 'info'];
  if (suspiciousNames.includes(name.toLowerCase())) return true;

  return false;
}

/**
 * Get detailed spam signals for review
 */
function getSpamSignals(text: string, email: string, name: string): string[] {
  const signals: string[] = [];

  // Check each spam pattern
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) signals.push(`Contains: "${match[0]}"`);
    }
  }

  // URL count
  const urlCount = (text.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount > 0) signals.push(`Contains ${urlCount} URL(s)`);

  // Caps detection
  if (text.length > 20) {
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && capsCount / letterCount > 0.3) {
      signals.push(`High caps ratio: ${Math.round(capsCount / letterCount * 100)}%`);
    }
  }

  // Email domain check
  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (emailDomain && SPAM_EMAIL_DOMAINS.includes(emailDomain)) {
    signals.push(`Disposable email domain: ${emailDomain}`);
  }

  // Repeated characters
  const repeatedMatch = text.match(/(.)\1{4,}/);
  if (repeatedMatch) {
    signals.push(`Repeated chars: "${repeatedMatch[0]}"`);
  }

  return signals;
}

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

    // Comprehensive spam detection
    const isSpam = detectSpam(comment_text, author_email, author_name);

    // Additional spam signals tracking for review
    const spamSignals = getSpamSignals(comment_text, author_email, author_name);

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
        status: isSpam ? 'spam' : 'pending',
        spam_signals: spamSignals.length > 0 ? spamSignals : null
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
