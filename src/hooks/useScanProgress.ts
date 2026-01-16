'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ScanJob {
  id: string;
  status: string;
  sources: string[];
  current_source: string | null;
  current_source_index: number;
  items_found: number;
  items_added: number;
  items_skipped: number;
  started_at: string | null;
  created_at: string;
}

export function useActiveScanJobs() {
  const [jobs, setJobs] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchActiveJobs() {
      try {
        const { data, error } = await supabase
          .from('kb_scan_jobs')
          .select('*')
          .in('status', ['queued', 'running', 'paused'])
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        console.error('Failed to fetch active scan jobs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveJobs();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchActiveJobs, 5000);

    return () => clearInterval(interval);
  }, [supabase]);

  return { jobs, loading };
}

export function useScanProgress(jobId: string | null) {
  const [job, setJob] = useState<ScanJob | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }

    async function fetchJob() {
      try {
        const { data, error } = await supabase
          .from('kb_scan_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (err) {
        console.error('Failed to fetch scan job:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();

    // Poll for updates every 2 seconds while job is active
    const interval = setInterval(() => {
      if (job && ['queued', 'running'].includes(job.status)) {
        fetchJob();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, job?.status, supabase]);

  return { job, loading };
}
