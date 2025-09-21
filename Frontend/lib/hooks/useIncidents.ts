/**
 * React hook for managing incidents data
 */
"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, Incident, IncidentStats } from '../api';

export interface UseIncidentsFilters {
  source?: string;
  severity?: string;
  category?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  limit?: number;
  page?: number;
}

export interface UseIncidentsReturn {
  incidents: Incident[];
  stats: IncidentStats | null;
  loading: boolean;
  collecting: boolean;
  error: string | null;
  filters: UseIncidentsFilters;
  setFilters: (filters: UseIncidentsFilters) => void;
  refreshIncidents: () => Promise<void>;
  collectData: () => Promise<void>;
  totalCount: number;
}

export function useIncidents(initialFilters: UseIncidentsFilters = {}): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseIncidentsFilters>(initialFilters);
  const [totalCount, setTotalCount] = useState(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchIncidents = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const [incidentsResponse, statsResponse] = await Promise.all([
        api.getIncidents(currentFilters),
        api.getStats()
      ]);

      setIncidents(incidentsResponse.data);
      setStats(statsResponse.data);
      setTotalCount(incidentsResponse.count || incidentsResponse.data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch incidents';
      setError(errorMessage);
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshIncidents = useCallback(async () => {
    await fetchIncidents();
  }, [fetchIncidents]);

  const collectData = useCallback(async () => {
    try {
      setCollecting(true);
      setError(null);
      
      console.log('Starting data collection...');
      const result = await api.collectData(['news', 'cert-in'], true);
      
      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from data collection API');
      }
      
      const incidentsCollected = result.incidents_collected || 0;
      const sourcesProcessed = Array.isArray(result.sources_processed) 
        ? result.sources_processed 
        : [];
      
      console.log(`Data collection completed: ${incidentsCollected} incidents collected from ${sourcesProcessed.join(', ')}`);
      
      // Wait a moment for data to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data after collection
      console.log('Refreshing incidents data...');
      await fetchIncidents();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to collect data';
      setError(errorMessage);
      console.error('Error collecting data:', err);
    } finally {
      setCollecting(false);
    }
  }, [fetchIncidents]);

  const handleSetFilters = useCallback((newFilters: UseIncidentsFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch data on initial load
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Fetch data when filters change (with debouncing)
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced fetch
    debounceTimeoutRef.current = setTimeout(() => {
      fetchIncidents(filters);
    }, 300); // 300ms debounce
    
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters, fetchIncidents]);

  return {
    incidents,
    stats,
    loading,
    collecting,
    error,
    filters,
    setFilters: handleSetFilters,
    refreshIncidents,
    collectData,
    totalCount,
  };
}
