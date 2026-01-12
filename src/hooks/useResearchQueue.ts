'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ResearchItem {
  id: string;
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  abstract?: string;
  url: string;
  doi?: string;
  sourceSite: string;
  searchTermMatched?: string;
  relevanceScore: number;
  relevantTopics: string[];
  status: 'pending' | 'approved' | 'rejected';
  studySubject?: 'human' | 'animal' | 'in_vitro' | 'review' | null;
  createdAt: string;
  discoveredAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ResearchQueueState {
  items: ResearchItem[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastAdded?: ResearchItem;
}

export interface QueueFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  sourceSite?: string;
  category?: string;
  minRelevanceScore?: number;
  includeAnimalStudies?: boolean;
}

export interface QueuePagination {
  limit: number;
  offset: number;
}

/**
 * Hook for real-time research queue management
 * Subscribes to queue updates and provides filtering/pagination
 */
export function useResearchQueue(
  filters: QueueFilters = {},
  pagination: QueuePagination = { limit: 20, offset: 0 }
): ResearchQueueState & {
  refetch: () => void;
  updateItemStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
} {
  const [state, setState] = useState<ResearchQueueState>({
    items: [],
    totalCount: 0,
    loading: true,
    error: null,
    isConnected: false
  });

  // Function to build query based on filters
  const buildQuery = (supabase: any, countOnly = false) => {
    let query = supabase
      .from('kb_research_queue')
      .select(
        countOnly
          ? '*'
          : `
            id,
            title,
            authors,
            publication,
            year,
            abstract,
            url,
            doi,
            source_site,
            search_term_matched,
            relevance_score,
            relevant_topics,
            status,
            study_subject,
            created_at,
            discovered_at,
            reviewed_at,
            reviewed_by
          `,
        countOnly ? { count: 'exact', head: true } : {}
      );

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.sourceSite) {
      query = query.eq('source_site', filters.sourceSite);
    }

    if (filters.category) {
      query = query.contains('relevant_topics', [filters.category]);
    }

    if (filters.minRelevanceScore) {
      query = query.gte('relevance_score', filters.minRelevanceScore);
    }

    // Filter by study subject - default to human studies and reviews only
    // Use in() filter which is simpler and more reliable
    if (!filters.includeAnimalStudies) {
      query = query.in('study_subject', ['human', 'review']);
    }

    if (!countOnly) {
      query = query
        .order('created_at', { ascending: false })
        .range(pagination.offset, pagination.offset + pagination.limit - 1);
    }

    return query;
  };

  // Function to transform database items to interface format
  const transformItem = (item: any): ResearchItem => ({
    id: item.id,
    title: item.title,
    authors: item.authors,
    publication: item.publication,
    year: item.year,
    abstract: item.abstract,
    url: item.url,
    doi: item.doi,
    sourceSite: item.source_site,
    searchTermMatched: item.search_term_matched,
    relevanceScore: item.relevance_score || 0,
    relevantTopics: item.relevant_topics || [],
    status: item.status,
    studySubject: item.study_subject,
    createdAt: item.created_at,
    discoveredAt: item.discovered_at,
    reviewedAt: item.reviewed_at,
    reviewedBy: item.reviewed_by
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const supabase = createClient();

      // Fetch items and total count in parallel
      const [itemsResponse, countResponse] = await Promise.all([
        buildQuery(supabase, false),
        buildQuery(supabase, true)
      ]);

      if (itemsResponse.error) {
        console.error('Items query error:', itemsResponse.error);
        throw new Error(`Items query failed: ${itemsResponse.error.message} (code: ${itemsResponse.error.code})`);
      }

      if (countResponse.error) {
        console.error('Count query error:', countResponse.error);
        throw new Error(`Count query failed: ${countResponse.error.message} (code: ${countResponse.error.code})`);
      }

      const transformedItems = itemsResponse.data.map(transformItem);

      setState(prev => ({
        ...prev,
        items: transformedItems,
        totalCount: countResponse.count || 0,
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error fetching research queue:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load research queue'
      }));
    }
  };

  // Update item status
  const updateItemStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('kb_research_queue')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin-user' // TODO: Get from auth when available
        })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state immediately for better UX
      setState(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === id
            ? { ...item, status, reviewedAt: new Date().toISOString() }
            : item
        )
      }));

    } catch (error) {
      console.error('Error updating item status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();

    const supabase = createClient();

    // Set up real-time subscription for new items
    const channel = supabase
      .channel('research_queue_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kb_research_queue'
        },
        (payload) => {
          console.log('New research item added:', payload.new);

          const newItem = transformItem(payload.new);

          // Only add if it matches current filters
          let shouldAdd = true;

          if (filters.status && filters.status !== 'all' && newItem.status !== filters.status) {
            shouldAdd = false;
          }

          if (filters.sourceSite && newItem.sourceSite !== filters.sourceSite) {
            shouldAdd = false;
          }

          if (filters.category && !newItem.relevantTopics.includes(filters.category)) {
            shouldAdd = false;
          }

          if (filters.minRelevanceScore && newItem.relevanceScore < filters.minRelevanceScore) {
            shouldAdd = false;
          }

          // Filter by study subject for real-time updates
          if (!filters.includeAnimalStudies) {
            const allowedTypes = ['human', 'review'];
            if (!allowedTypes.includes(newItem.studySubject as string)) {
              shouldAdd = false;
            }
          }

          if (shouldAdd) {
            setState(prev => ({
              ...prev,
              items: [newItem, ...prev.items].slice(0, pagination.limit), // Keep within pagination limit
              totalCount: prev.totalCount + 1,
              lastAdded: newItem
            }));
          } else {
            // Still update total count even if not showing in current view
            setState(prev => ({
              ...prev,
              totalCount: prev.totalCount + 1,
              lastAdded: newItem
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'kb_research_queue'
        },
        (payload) => {
          console.log('Research item updated:', payload.new);

          const updatedItem = transformItem(payload.new);

          setState(prev => ({
            ...prev,
            items: prev.items.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            )
          }));
        }
      )
      .subscribe((status) => {
        console.log('Research queue subscription status:', status);
        setState(prev => ({ ...prev, isConnected: status === 'SUBSCRIBED' }));
      });

    // Cleanup function
    return () => {
      channel.unsubscribe();
    };

  }, [
    filters.status,
    filters.sourceSite,
    filters.category,
    filters.minRelevanceScore,
    filters.includeAnimalStudies,
    pagination.limit,
    pagination.offset
  ]);

  return {
    ...state,
    refetch: fetchData,
    updateItemStatus
  };
}

/**
 * Hook for tracking queue statistics in real-time
 * Useful for dashboard displays
 */
export function useQueueStats(): {
  totalItems: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  todayAdded: number;
  loading: boolean;
  error: string | null;
} {
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    todayAdded: 0,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];

        // Fetch all statistics in parallel
        const [
          totalResponse,
          pendingResponse,
          approvedResponse,
          rejectedResponse,
          todayResponse
        ] = await Promise.all([
          supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }),
          supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
          supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`)
        ]);

        setStats({
          totalItems: totalResponse.count || 0,
          pendingCount: pendingResponse.count || 0,
          approvedCount: approvedResponse.count || 0,
          rejectedCount: rejectedResponse.count || 0,
          todayAdded: todayResponse.count || 0,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching queue stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load stats'
        }));
      }
    };

    fetchStats();

    const supabase = createClient();

    // Subscribe to changes for real-time stats updates
    const channel = supabase
      .channel('queue_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kb_research_queue'
        },
        () => {
          // Refetch stats when any item changes
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return stats;
}