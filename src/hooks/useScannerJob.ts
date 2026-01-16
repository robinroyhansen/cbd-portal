'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types - matches actual kb_scan_jobs table schema
export interface ScannerJob {
  id: string;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'cancelling' | 'paused';
  sources: string[];
  search_terms: string[] | null;
  date_range_start: string | null;
  date_range_end: string | null;
  current_source: string | null;
  current_source_index: number;
  items_found: number;
  items_added: number;
  items_skipped: number;
  items_rejected: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobProgress {
  percent: number;
  currentSource: string | null;
  sourcesCompleted: number;
  sourcesTotal: number;
  estimatedSecondsRemaining: number | null;
}

export interface ProcessResult {
  jobId: string;
  status: string;
  source: string;
  processed: number;
  added: number;
  skipped: number;
  rejected: number;
  hasMore: boolean;
  elapsedMs: number;
  progress: {
    sourceIndex: number;
    totalSources: number;
    nextSource: string | null;
  };
  totals: {
    found: number;
    added: number;
    skipped: number;
    rejected: number;
  };
}

export interface CreateJobParams {
  sources: string[];
  searchTerms?: string[];
  dateRangeStart?: string | null;
  dateRangeEnd?: string | null;
}

interface UseScannerJobReturn {
  // State
  job: ScannerJob | null;
  jobs: ScannerJob[];
  progress: JobProgress | null;
  isLoading: boolean;
  isProcessing: boolean;
  isCancelling: boolean;
  isPausing: boolean;
  error: string | null;
  lastActivity: Date | null;

  // Actions
  createJob: (params: CreateJobParams) => Promise<ScannerJob | null>;
  cancelJob: () => Promise<boolean>;
  pauseJob: () => Promise<boolean>;
  resumeJob: (jobId: string) => Promise<boolean>;
  refreshJobs: () => Promise<void>;
  clearError: () => void;
}

export function useScannerJob(): UseScannerJobReturn {
  const [job, setJob] = useState<ScannerJob | null>(null);
  const [jobs, setJobs] = useState<ScannerJob[]>([]);
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  const processingRef = useRef(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const processLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all jobs
  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scanner/jobs?limit=20');
      const data = await response.json();

      if (data.jobs) {
        setJobs(data.jobs);

        // Find active job (pending, queued, running, or cancelling)
        const activeJob = data.jobs.find((j: ScannerJob) =>
          ['pending', 'queued', 'running', 'cancelling'].includes(j.status)
        );

        if (activeJob) {
          setJob(activeJob);
          updateProgress(activeJob);
        } else {
          setJob(null);
          setProgress(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single job details
  const fetchJobDetails = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/scanner/jobs/${jobId}`);
      const data = await response.json();

      if (data.job) {
        setJob(data.job);
        updateProgress(data.job);
        setLastActivity(new Date());

        // Update in jobs list
        setJobs(prev => prev.map(j => j.id === jobId ? data.job : j));

        return data.job;
      }
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    }
    return null;
  }, []);

  // Update progress from job
  const updateProgress = (jobData: ScannerJob) => {
    const sourcesTotal = jobData.sources?.length || 0;
    const sourcesCompleted = jobData.current_source_index || 0;
    const percent = sourcesTotal > 0
      ? Math.round((sourcesCompleted / sourcesTotal) * 100)
      : 0;

    setProgress({
      percent: Math.min(percent, 100),
      currentSource: jobData.current_source || jobData.sources?.[jobData.current_source_index] || null,
      sourcesCompleted,
      sourcesTotal,
      estimatedSecondsRemaining: null,
    });
  };

  // Process one chunk
  const processChunk = useCallback(async (): Promise<ProcessResult | null> => {
    if (processingRef.current) return null;
    processingRef.current = true;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/admin/scanner/process', { method: 'POST' });
      const data = await response.json();

      setLastActivity(new Date());

      if (data.jobId) {
        // Update job state from process response
        await fetchJobDetails(data.jobId);
      }

      return data as ProcessResult;
    } catch (err) {
      console.error('Process chunk failed:', err);
      setError(err instanceof Error ? err.message : 'Processing failed');
      return null;
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [fetchJobDetails]);

  // Auto-processing loop
  const startProcessingLoop = useCallback(() => {
    if (processLoopRef.current) return;

    const loop = async () => {
      const result = await processChunk();

      // Continue if there's more work and job is still running
      if (result?.hasMore && result?.status === 'running') {
        processLoopRef.current = setTimeout(loop, 2000); // 2 second delay between chunks
      } else {
        processLoopRef.current = null;
        // Refresh jobs to get final state
        await fetchJobs();
      }
    };

    loop();
  }, [processChunk, fetchJobs]);

  // Stop processing loop
  const stopProcessingLoop = useCallback(() => {
    if (processLoopRef.current) {
      clearTimeout(processLoopRef.current);
      processLoopRef.current = null;
    }
  }, []);

  // Create new job
  const createJob = useCallback(async (params: CreateJobParams): Promise<ScannerJob | null> => {
    setError(null);

    try {
      const response = await fetch('/api/admin/scanner/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: params.sources,
          searchTerms: params.searchTerms || ['CBD', 'cannabidiol', 'cannabis', 'cannabinoid'],
          dateRangeStart: params.dateRangeStart,
          dateRangeEnd: params.dateRangeEnd,
        }),
      });

      const data = await response.json();

      if (data.error) {
        if (data.existingJobId) {
          setError(`A job is already ${data.existingStatus}. Wait for it to complete or cancel it.`);
          await fetchJobDetails(data.existingJobId);
        } else {
          setError(data.error);
        }
        return null;
      }

      if (data.job) {
        setJob(data.job);
        setJobs(prev => [data.job, ...prev]);
        updateProgress(data.job);

        // Start auto-processing
        startProcessingLoop();

        return data.job;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      return null;
    }
  }, [fetchJobDetails, startProcessingLoop]);

  // Cancel job
  const cancelJob = useCallback(async (): Promise<boolean> => {
    if (!job) return false;

    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/scanner/jobs/${job.id}/cancel`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return false;
      }

      if (data.job) {
        setJob(data.job);
        // Stop the processing loop
        stopProcessingLoop();
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job');
      return false;
    } finally {
      setIsCancelling(false);
    }
  }, [job, stopProcessingLoop]);

  // Pause job (can be resumed later)
  const pauseJob = useCallback(async (): Promise<boolean> => {
    if (!job) return false;

    setIsPausing(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/scanner/jobs/${job.id}/pause`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return false;
      }

      if (data.job) {
        setJob(data.job);
        // Stop the processing loop
        stopProcessingLoop();
        // Update jobs list
        setJobs(prev => prev.map(j => j.id === job.id ? data.job : j));
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause job');
      return false;
    } finally {
      setIsPausing(false);
    }
  }, [job, stopProcessingLoop]);

  // Resume job
  const resumeJob = useCallback(async (jobId: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/admin/scanner/jobs/${jobId}/resume`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return false;
      }

      if (data.job) {
        setJob(data.job);
        updateProgress(data.job);

        // Start auto-processing
        startProcessingLoop();

        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume job');
      return false;
    }
  }, [startProcessingLoop]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Polling for job status updates when job is active
  useEffect(() => {
    if (!job || !['pending', 'queued', 'running'].includes(job.status)) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Poll every 2 seconds
    pollingRef.current = setInterval(() => {
      fetchJobDetails(job.id);
    }, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [job?.id, job?.status, fetchJobDetails]);

  // Start processing loop when there's a pending/queued job
  useEffect(() => {
    if ((job?.status === 'pending' || job?.status === 'queued') && !processLoopRef.current) {
      startProcessingLoop();
    }
  }, [job?.status, startProcessingLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProcessingLoop();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [stopProcessingLoop]);

  return {
    job,
    jobs,
    progress,
    isLoading,
    isProcessing,
    isCancelling,
    isPausing,
    error,
    lastActivity,
    createJob,
    cancelJob,
    pauseJob,
    resumeJob,
    refreshJobs: fetchJobs,
    clearError,
  };
}

// Utility hook for elapsed time
export function useElapsedTime(startedAt: string | null): string {
  const [elapsed, setElapsed] = useState('0s');

  useEffect(() => {
    if (!startedAt) {
      setElapsed('0s');
      return;
    }

    const updateElapsed = () => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const seconds = Math.floor((now - start) / 1000);

      if (seconds < 60) {
        setElapsed(`${seconds}s`);
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setElapsed(`${minutes}m ${secs}s`);
      } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        setElapsed(`${hours}h ${minutes}m`);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return elapsed;
}

// Utility hook for time since last activity
export function useTimeSince(date: Date | null): string {
  const [timeSince, setTimeSince] = useState('never');

  useEffect(() => {
    if (!date) {
      setTimeSince('never');
      return;
    }

    const updateTime = () => {
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

      if (seconds < 5) {
        setTimeSince('just now');
      } else if (seconds < 60) {
        setTimeSince(`${seconds} seconds ago`);
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeSince(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      } else {
        const hours = Math.floor(seconds / 3600);
        setTimeSince(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return timeSince;
}
