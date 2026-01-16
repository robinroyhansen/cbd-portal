import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      api_working: true,
      environment: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV || 'local',
      method: 'pages-router',
      env_vars_check: {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    };

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}