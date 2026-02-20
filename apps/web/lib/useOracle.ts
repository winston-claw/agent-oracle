import { useEffect, useState, useCallback } from 'react';

interface OracleStats {
  totalRequests: number;
  completedRequests: number;
  totalSubmissions: number;
  totalValue: number;
  consensusRate: number;
  activeAgents: number;
}

interface OracleRequest {
  id: string;
  query: string;
  dataType: string;
  status: string;
  consensusValue?: number;
  createdAt: number;
  completedAt?: number;
  submissions: Array<{
    agentId: string;
    agentName: string;
    value: number;
    source: string;
    timestamp: number;
    responseTime: number;
    isConsensus?: boolean;
  }>;
}

// Get stats from API
export function useOracleStats() {
  const [stats, setStats] = useState<OracleStats>({
    totalRequests: 0,
    completedRequests: 0,
    totalSubmissions: 0,
    totalValue: 0,
    consensusRate: 0,
    activeAgents: 5,
  });

  useEffect(() => {
    fetch('/api/oracle/stats')
      .then(res => res.json())
      .then(data => {
        if (data.totalRequests !== undefined) {
          setStats(data);
        }
      })
      .catch(console.error);
  }, []);

  return stats;
}

// Get recent requests
export function useRecentRequests(limit = 10) {
  const [requests, setRequests] = useState<OracleRequest[]>([]);

  useEffect(() => {
    // Poll for updates
    const interval = setInterval(() => {
      fetch('/api/oracle/stats')
        .then(res => res.json())
        .catch(console.error);
    }, 3000);

    // Also fetch individual requests if we have any
    return () => clearInterval(interval);
  }, []);

  return requests;
}

// Get single request
export function useRequest(requestId: string | null) {
  const [data, setData] = useState<{ request: OracleRequest } | null>(null);

  useEffect(() => {
    if (!requestId) return;

    const interval = setInterval(() => {
      fetch(`/api/oracle?requestId=${requestId}`)
        .then(res => res.json())
        .then(result => {
          if (result.request) {
            setData(result);
          }
        })
        .catch(console.error);
    }, 2000);

    return () => clearInterval(interval);
  }, [requestId]);

  return data;
}

// Create a new oracle request
export function useCreateRequest() {
  const [loading, setLoading] = useState(false);

  const createRequest = useCallback(async (query: string, dataType: string, params: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/oracle/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, dataType, params }),
      });
      const data = await res.json();
      return data.requestId;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createRequest, loading };
}

// Hook that polls for request updates
export function useRequestPolling(requestIds: string[]) {
  const [requests, setRequests] = useState<Map<string, OracleRequest>>(new Map());

  useEffect(() => {
    if (requestIds.length === 0) return;

    const fetchRequests = async () => {
      const newRequests = new Map<string, OracleRequest>();
      for (const id of requestIds) {
        try {
          const res = await fetch(`/api/oracle?requestId=${id}`);
          const data = await res.json();
          if (data.request) {
            newRequests.set(id, data.request);
          }
        } catch {}
      }
      setRequests(newRequests);
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, [requestIds.join(',')]);

  return requests;
}
