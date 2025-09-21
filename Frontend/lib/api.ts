/**
 * API service for connecting to the cyber incident backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface Incident {
  _id: string;
  title: string;
  description: string;
  url?: string;
  published_date: string;
  source: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical' | 'Unknown';
  location: string;
  hash: string;
  tags?: string[];
  is_verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentStats {
  total: number;
  today: number;
  bySource: Array<{ source: string; count: number }>;
  bySeverity: Array<{ severity: string; count: number }>;
  recent: number;
}

export interface GeminiAnalysis {
  riskAssessment: string;
  affectedSectors: string;
  recommendedActions: string;
  threatLevel: string;
  keyInsights: string;
  fullAnalysis: string;
}

export interface ThreatSummary {
  threatLandscape: string;
  trendingThreats: string;
  sectorAnalysis: string;
  recommendations: string;
  futureOutlook: string;
  fullSummary: string;
}

export interface IncidentInsights {
  patternAnalysis: string;
  riskCorrelation: string;
  impactPrediction: string;
  mitigationStrategies: string;
  intelligenceSummary: string;
  fullInsights: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new ApiError(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0
    );
  }
}

export const api = {
  /**
   * Get incidents with optional filters
   */
  async getIncidents(filters?: {
    source?: string;
    severity?: string;
    category?: string;
    from_date?: string;
    to_date?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<Incident[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/api/incidents${queryString ? `?${queryString}` : ''}`;
    
    return fetchApi<ApiResponse<Incident[]>>(endpoint);
  },

  /**
   * Get incident statistics
   */
  async getStats(): Promise<ApiResponse<IncidentStats>> {
    return fetchApi<ApiResponse<IncidentStats>>('/api/stats');
  },

  /**
   * Trigger manual data collection from Python microservice
   */
  async collectData(sources?: string[], forceRefresh?: boolean): Promise<{
    success: boolean;
    message: string;
    incidents_collected: number;
    sources_processed: string[];
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/collection/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sources: sources || ['news', 'cert-in'],
        force_refresh: forceRefresh || false,
      }),
    });
    
    if (!response.ok) {
      throw new ApiError(`Data collection failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract data from python_response if it exists
    if (data.python_response) {
      return {
        success: data.success,
        message: data.message,
        incidents_collected: data.python_response.incidents_collected || 0,
        sources_processed: data.python_response.sources_processed || [],
        timestamp: data.timestamp
      };
    }
    
    // Fallback to direct response if python_response doesn't exist
    return {
      success: data.success,
      message: data.message,
      incidents_collected: data.incidents_collected || 0,
      sources_processed: data.sources_processed || [],
      timestamp: data.timestamp
    };
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return fetchApi<{ status: string; timestamp: string }>('/health');
  },

  /**
   * Get AI-powered incident analysis
   */
  async analyzeIncident(incidentId: string): Promise<{
    success: boolean;
    incident: Incident;
    analysis: GeminiAnalysis;
    timestamp: string;
  }> {
    return fetchApi<{
      success: boolean;
      incident: Incident;
      analysis: GeminiAnalysis;
      timestamp: string;
    }>(`/api/analysis/incident/${incidentId}`);
  },

  /**
   * Get AI-powered threat summary
   */
  async getThreatSummary(days?: number, limit?: number): Promise<{
    success: boolean;
    incidentCount: number;
    timeRange: string;
    summary: ThreatSummary;
    timestamp: string;
  }> {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/analysis/threat-summary${queryString ? `?${queryString}` : ''}`;
    
    return fetchApi<{
      success: boolean;
      incidentCount: number;
      timeRange: string;
      summary: ThreatSummary;
      timestamp: string;
    }>(endpoint);
  },

  /**
   * Get AI-powered insights for dashboard
   */
  async getInsights(limit?: number): Promise<{
    success: boolean;
    insights: IncidentInsights;
    stats: IncidentStats;
    timestamp: string;
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/analysis/insights${queryString ? `?${queryString}` : ''}`;
    
    return fetchApi<{
      success: boolean;
      insights: IncidentInsights;
      stats: IncidentStats;
      timestamp: string;
    }>(endpoint);
  },

  /**
   * Check AI service status
   */
  async getAIServiceStatus(): Promise<{
    success: boolean;
    available: boolean;
    service: string;
    timestamp: string;
  }> {
    return fetchApi<{
      success: boolean;
      available: boolean;
      service: string;
      timestamp: string;
    }>('/api/analysis/status');
  },

  // Data Collection API (Python Microservice)
  /**
   * Trigger data collection via Python microservice
   */
  async triggerDataCollection(sources?: string[], forceRefresh?: boolean): Promise<{
    success: boolean;
    message: string;
    python_response: any;
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/collection/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sources: sources || ['cert-in', 'news', 'test'],
        force_refresh: forceRefresh || false,
      }),
    });
    if (!response.ok) {
      throw new ApiError(`Data collection trigger failed: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get collection status from Python microservice
   */
  async getCollectionStatus(): Promise<{
    success: boolean;
    status: any;
    timestamp: string;
  }> {
    return fetchApi<{
      success: boolean;
      status: any;
      timestamp: string;
    }>('/api/collection/status');
  },

  /**
   * Get available scraping sources
   */
  async getCollectionSources(): Promise<{
    success: boolean;
    sources: Array<{
      id: string;
      name: string;
      description: string;
      enabled: boolean;
    }>;
    timestamp: string;
  }> {
    return fetchApi<{
      success: boolean;
      sources: Array<{
        id: string;
        name: string;
        description: string;
        enabled: boolean;
      }>;
      timestamp: string;
    }>('/api/collection/sources');
  },
};

export default api;
