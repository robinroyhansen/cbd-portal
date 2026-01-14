import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ScanJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_source: string | null;
  sources_completed: string[];
  sources_total: string[];
  items_found: number;
  items_added: number;
  items_skipped: number;
  items_rejected: number;
  scan_depth: string;
  search_terms: string[] | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useActiveScanJobs() {
  const [jobs, setJobs] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('kb_scan_jobs')
        .select('*')
        .in('status', ['pending', 'running'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        throw fetchError;
      }

      setJobs(data || []);
      setError(null);
    } catch (err) {
      console.error('[useScanProgress] Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scan jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();

    // Set up realtime subscription for scan job updates
    const supabase = createClient();

    const channel = supabase
      .channel('scan-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kb_scan_jobs'
        },
        () => {
          // Refetch on any change
          fetchJobs();
        }
      )
      .subscribe();

    // Poll every 5 seconds as backup
    const interval = setInterval(fetchJobs, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}

export function useScanJob(jobId: string | null) {
  const [job, setJob] = useState<ScanJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('kb_scan_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setJob(data);
      setError(null);
    } catch (err) {
      console.error('[useScanJob] Error fetching job:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scan job');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();

    if (!jobId) return;

    // Set up realtime subscription for this specific job
    const supabase = createClient();

    const channel = supabase
      .channel(`scan-job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kb_scan_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          if (payload.new) {
            setJob(payload.new as ScanJob);
          }
        }
      )
      .subscribe();

    // Poll every 2 seconds for active jobs
    const interval = setInterval(() => {
      if (job?.status === 'running' || job?.status === 'pending') {
        fetchJob();
      }
    }, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [jobId, fetchJob, job?.status]);

  return { job, loading, error, refetch: fetchJob };
}

export function useScanHistory(limit = 20) {
  const [jobs, setJobs] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from('kb_scan_jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fetchError) {
          throw fetchError;
        }

        setJobs(data || []);
        setError(null);
      } catch (err) {
        console.error('[useScanHistory] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch scan history');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [limit]);

  return { jobs, loading, error };
}
