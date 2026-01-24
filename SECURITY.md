# Security Configuration Guide

## Required Environment Variables

Set these in your Vercel Dashboard (Settings > Environment Variables):

### Required for Production

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret) | Supabase Dashboard > Settings > API |
| `ADMIN_PASSWORD` | Admin panel password | Choose a strong password (12+ chars) |
| `ANTHROPIC_API_KEY` | Claude API key | console.anthropic.com |

### Optional

| Variable | Description |
|----------|-------------|
| `CRON_SECRET` | Secret for Vercel cron jobs |
| `NEXT_PUBLIC_SITE_URL` | Production URL for SEO |

## Rotating Secrets

If you believe secrets have been compromised:

### 1. Supabase Keys
1. Go to Supabase Dashboard > Settings > API
2. Click "Roll secret" next to the service role key
3. Update the new key in Vercel environment variables
4. Redeploy

### 2. Anthropic API Key
1. Go to console.anthropic.com > API Keys
2. Create a new key
3. Delete the old key
4. Update Vercel environment variables

### 3. Admin Password
1. Choose a new strong password (12+ characters, mix of letters, numbers, symbols)
2. Update `ADMIN_PASSWORD` in Vercel environment variables
3. Redeploy

## Admin Authentication

The admin panel uses password authentication:

1. Set `ADMIN_PASSWORD` in Vercel (e.g., `MyStr0ng!Passw0rd`)
2. Enter this password when logging into `/admin`
3. The password is validated server-side on every API request

## Security Headers

The following headers are set automatically via middleware:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (configured in middleware)
- `Strict-Transport-Security` (HSTS)

## Reporting Security Issues

If you discover a security vulnerability, please email security@[your-domain].
