import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Rate limiting - strict for newsletter (3 requests per 5 minutes)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`newsletter:${clientIp}`, RATE_LIMITS.newsletter);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many subscription attempts. Please wait before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': rateLimit.resetIn.toString() },
      }
    );
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Re-subscribe
        await supabase
          .from('newsletter_subscribers')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been re-subscribed.'
        });
      }
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!'
      });
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        status: 'active',
        source: 'homepage',
      });

    if (error) {
      console.error('Newsletter subscription error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing!'
    });

  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
