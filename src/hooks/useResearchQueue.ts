'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// Database row type (snake_case)
interface ResearchItemDB {
  id: string;
  title: string;
  authors: string | null;
  publication: string | null;
  year: number | null;
  abstract: string | null;
  url: string;
  doi: string | null;
  source_site: string;
  status: 'pending' | 'approved' | 'rejected';
  relevance_score: number | null;
  relevance_signals: string[] | null;
  relevant_topics: string[] | null;
  detected_language: string | null;
  search_term_matched: string | null;
  study_subject: string | null;
  discovered_at: string | null;
  created_at: string;
}

// Transformed type for components (camelCase)
export interface ResearchItem {
  id: string;
  title: string;
  authors: string | null;
  publication: string | null;
  year: number | null;
  abstract: string | null;
  url: string;
  doi: string | null;
  sourceSite: string;
  status: 'pending' | 'approved' | 'rejected';
  relevanceScore: number;
  relevanceSignals: string[];
  relevantTopics: string[];
  detectedLanguage: string | null;
  searchTermMatched: string | null;
  studySubject: string | null;
  createdAt: string;
}

// Transform DB row to component format
function transformItem(item: ResearchItemDB): ResearchItem {
  return {
    id: item.id,
    title: item.title,
    authors: item.authors,
    publication: item.publication,
    year: item.year,
    abstract: item.abstract,
    url: item.url,
    doi: item.doi,
    sourceSite: item.source_site,
    status: item.status,
    relevanceScore: item.relevance_score ?? 0,
    relevanceSignals: item.relevance_signals ?? [],
    relevantTopics: item.relevant_topics ?? [],
    detectedLanguage: item.detected_language,
    searchTermMatched: item.search_term_matched,
    studySubject: item.study_subject,
    createdAt: item.discovered_at || item.created_at,
  };
}

interface UseResearchQueueFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  sourceSite?: string;
  category?: string;
  minRelevanceScore?: number;
  includeAnimalStudies?: boolean;
}

interface UseResearchQueueOptions {
  limit?: number;
  offset?: number;
}

export function useResearchQueue(
  filters: UseResearchQueueFilters = {},
  options: UseResearchQueueOptions = {}
) {
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastAdded, setLastAdded] = useState<ResearchItem | null>(null);

  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('kb_research_queue')
        .select('*', { count: 'exact' });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.sourceSite) {
        query = query.eq('source_site', filters.sourceSite);
      }
      if (filters.minRelevanceScore) {
        query = query.gte('relevance_score', filters.minRelevanceScore);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      // Transform database rows to component format
      const transformedItems = (data || []).map(transformItem);
      setItems(transformedItems);
      setTotalCount(count || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research items');
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.sourceSite, filters.minRelevanceScore, options.limit, options.offset, supabase]);

  const updateItemStatus = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('kb_research_queue')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      // Remove the item from the list (since status changed, it no longer matches current filter)
      setItems(prev => prev.filter(item => item.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to update item status:', err);
    }
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('research_queue_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'kb_research_queue'
      }, (payload) => {
        const newItem = transformItem(payload.new as ResearchItemDB);
        setLastAdded(newItem);
        setItems(prev => [newItem, ...prev].slice(0, options.limit || 50));
        setTotalCount(prev => prev + 1);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, options.limit]);

  return {
    items,
    totalCount,
    loading,
    error,
    isConnected,
    lastAdded,
    updateItemStatus,
    refetch: fetchItems
  };
}

export function useQueueStats() {
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    todayAdded: 0,
    avgRelevanceScore: 0,
    topSources: [] as { source: string; count: number }[],
    topTopics: [] as { topic: string; count: number }[]
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get counts by status
        const { count: pendingCount } = await supabase
          .from('kb_research_queue')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: approvedCount } = await supabase
          .from('kb_research_queue')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        const { count: rejectedCount } = await supabase
          .from('kb_research_queue')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected');

        const { count: totalItems } = await supabase
          .from('kb_research_queue')
          .select('*', { count: 'exact', head: true });

        // Get today's additions
        const today = new Date().toISOString().split('T')[0];
        const { count: todayAdded } = await supabase
          .from('kb_research_queue')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today);

        // Get average relevance score
        const { data: avgData } = await supabase
          .from('kb_research_queue')
          .select('relevance_score')
          .not('relevance_score', 'is', null)
          .limit(100);

        const avgRelevanceScore = avgData && avgData.length > 0
          ? Math.round(avgData.reduce((sum, r) => sum + (r.relevance_score || 0), 0) / avgData.length)
          : 0;

        setStats({
          totalItems: totalItems || 0,
          pendingCount: pendingCount || 0,
          approvedCount: approvedCount || 0,
          rejectedCount: rejectedCount || 0,
          todayAdded: todayAdded || 0,
          avgRelevanceScore,
          topSources: [],
          topTopics: []
        });
      } catch (err) {
        console.error('Failed to fetch queue stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  return { ...stats, loading };
}
