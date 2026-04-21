import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface SectorRisk {
  sector: string;
  score: number;
  incident_count: number;
  last_updated: string;
}

export function useSectors() {
  const [sectors, setSectors] = useState<SectorRisk[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  const fetchSectors = useCallback(async () => {
    try {
      setLoading(true);
      const [riskRes, historyRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/api/sectors/risk`, { withCredentials: true }),
        axios.get(`${apiBaseUrl}/api/sectors/risk/history?days=7`, { withCredentials: true })
      ]);

      if (riskRes.data.success) {
        setSectors(riskRes.data.data);
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.data);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sector data');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return { sectors, history, loading, error, refresh: fetchSectors };
}
