# CBD Knowledge Base

Evidence-based CBD information website built with Next.js, Supabase, and Vercel.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS
- **Content:** Markdown with react-markdown

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings → API
3. Run the migration in `supabase/migrations/001_initial_schema.sql`:
   - Go to SQL Editor in Supabase Dashboard
   - Paste the contents of the migration file
   - Click "Run"

### 2. Create GitHub Repository

```bash
cd cbd-knowledge-base
git init
git add .
git commit -m "Initial commit: CBD Knowledge Base setup"

# Create repo on GitHub, then:
git remote add origin git@github.com:YOUR_USERNAME/cbd-knowledge-base.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import the GitHub repository
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `NEXT_PUBLIC_SITE_URL` - Your Vercel deployment URL
3. Deploy!

### 4. Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables

- **articles** - Main content with markdown body, SEO metadata, status
- **categories** - Topic organisation
- **citations** - Academic/research references for articles
- **tags** - Flexible tagging system

### Article Status Flow

1. `draft` - Work in progress
2. `pending_review` - Ready for review
3. `published` - Live on site

## Adding Content

### Via Supabase Dashboard

1. Go to Table Editor → articles
2. Click "Insert row"
3. Fill in: title, slug, content (markdown), category_id, status

### Via Claude Code (Your Workflow)

Use Claude Code to:
1. Research topics and find citations
2. Write article content in markdown
3. Insert directly into Supabase using the SQL Editor or API

Example insert:
```sql
INSERT INTO articles (title, slug, excerpt, content, category_id, status)
VALUES (
  'CBD and Sleep: What the Research Says',
  'cbd-and-sleep-research',
  'A comprehensive look at clinical studies examining CBD''s effects on sleep quality.',
  '## Introduction\n\nSleep disorders affect millions worldwide...',
  (SELECT id FROM categories WHERE slug = 'health-wellness'),
  'published'
);
```

## Project Structure

```
cbd-knowledge-base/
├── src/
│   ├── app/
│   │   ├── articles/
│   │   │   ├── [slug]/page.tsx  # Individual article
│   │   │   └── page.tsx         # Article listing
│   │   ├── categories/
│   │   ├── layout.tsx           # Root layout with nav/footer
│   │   ├── page.tsx             # Homepage
│   │   └── globals.css
│   ├── components/
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts        # Browser client
│       │   └── server.ts        # Server client
│       └── database.types.ts    # TypeScript types
├── supabase/
│   └── migrations/
├── public/
└── package.json
```

## SEO Features

- Automatic meta tags from article content
- OpenGraph and Twitter cards
- Sitemap generation (add later)
- Semantic HTML structure
- Fast page loads via static generation

## Future Enhancements

- [ ] Automated content generation via Claude API
- [ ] Full-text search
- [ ] Newsletter signup
- [ ] Admin dashboard
- [ ] Image optimisation pipeline
- [ ] Sitemap.xml generation
- [ ] RSS feed

## Licence

Private - All rights reserved
