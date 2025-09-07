/**
 * React hook for managing incidents data
 */
"use client"

import { useState, useEffect, useCallback } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseIncidentsFilters>(initialFilters);
  const [totalCount, setTotalCount] = useState(0);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [incidentsResponse, statsResponse] = await Promise.all([
        api.getIncidents(filters),
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
  }, [filters]);

  const refreshIncidents = useCallback(async () => {
    await fetchIncidents();
  }, [fetchIncidents]);

  const collectData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await api.collectData();
      
      // Refresh data after collection
      await fetchIncidents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to collect data';
      setError(errorMessage);
      console.error('Error collecting data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchIncidents]);

  const handleSetFilters = useCallback((newFilters: UseIncidentsFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    stats,
    loading,
    error,
    filters,
    setFilters: handleSetFilters,
    refreshIncidents,
    collectData,
    totalCount,
  };
}
