import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface AnalyticsData {
  userActivity: {
    activeUsers: number;
    newRegistrations: number;
    totalSessions: number;
    averageSessionDuration: number;
  };
  systemPerformance: {
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    uptime: number;
  };
  contentMetrics: {
    totalViews: number;
    audioPlays: number;
    donations: number;
    conversionRate: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details?: string;
  }>;
}

interface UseRealTimeAnalyticsOptions {
  enabled?: boolean;
  updateInterval?: number;
  wsUrl?: string;
}

export const useRealTimeAnalytics = (options: UseRealTimeAnalyticsOptions = {}) => {
  const {
    enabled = true,
    updateInterval = 5000,
    wsUrl = 'wss://your-websocket-endpoint.com/analytics'
  } = options;

  const [data, setData] = useState<AnalyticsData>({
    userActivity: {
      activeUsers: 0,
      newRegistrations: 0,
      totalSessions: 0,
      averageSessionDuration: 0
    },
    systemPerformance: {
      cpuUsage: 0,
      memoryUsage: 0,
      responseTime: 0,
      uptime: 0
    },
    contentMetrics: {
      totalViews: 0,
      audioPlays: 0,
      donations: 0,
      conversionRate: 0
    },
    recentActivity: []
  });

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data generator for demonstration
  const generateMockData = useCallback((): AnalyticsData => {
    const now = new Date();
    const baseData = {
      userActivity: {
        activeUsers: Math.floor(Math.random() * 50) + 800,
        newRegistrations: Math.floor(Math.random() * 10) + 5,
        totalSessions: Math.floor(Math.random() * 100) + 1200,
        averageSessionDuration: Math.floor(Math.random() * 300) + 180
      },
      systemPerformance: {
        cpuUsage: Math.floor(Math.random() * 30) + 20,
        memoryUsage: Math.floor(Math.random() * 40) + 30,
        responseTime: Math.floor(Math.random() * 100) + 50,
        uptime: 99.8 + Math.random() * 0.2
      },
      contentMetrics: {
        totalViews: Math.floor(Math.random() * 1000) + 45000,
        audioPlays: Math.floor(Math.random() * 500) + 2800,
        donations: Math.floor(Math.random() * 50) + 150,
        conversionRate: (Math.random() * 5) + 2.5
      },
      recentActivity: [
        {
          id: '1',
          action: 'New user registration',
          user: 'John Doe',
          timestamp: new Date(now.getTime() - Math.random() * 300000).toISOString(),
          details: 'Signed up via email'
        },
        {
          id: '2',
          action: 'Audio content played',
          user: 'Mary Smith',
          timestamp: new Date(now.getTime() - Math.random() * 600000).toISOString(),
          details: 'Yoruba spoken word'
        },
        {
          id: '3',
          action: 'Donation received',
          user: 'David Johnson',
          timestamp: new Date(now.getTime() - Math.random() * 900000).toISOString(),
          details: '$25.00'
        },
        {
          id: '4',
          action: 'Newsletter subscription',
          user: 'Sarah Wilson',
          timestamp: new Date(now.getTime() - Math.random() * 1200000).toISOString()
        },
        {
          id: '5',
          action: 'Contact form submitted',
          user: 'Michael Brown',
          timestamp: new Date(now.getTime() - Math.random() * 1500000).toISOString(),
          details: 'Prayer request'
        }
      ]
    };

    return baseData;
  }, []);

  // WebSocket connection for real-time updates
  const { isConnected, lastMessage, error: wsError } = useWebSocket({
    url: wsUrl,
    onMessage: (event) => {
      try {
        const newData = JSON.parse(event.data);
        setData(newData);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    },
    onError: () => {
      setError('WebSocket connection failed');
    },
    reconnectAttempts: 3,
    reconnectInterval: 5000
  });

  // Fallback to polling if WebSocket is not available
  useEffect(() => {
    if (!enabled) return;

    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        const mockData = generateMockData();
        
        setData(mockData);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling if WebSocket is not connected
    if (!isConnected) {
      intervalId = setInterval(fetchData, updateInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enabled, updateInterval, isConnected, generateMockData]);

  // Update loading state when WebSocket connects
  useEffect(() => {
    if (isConnected && isLoading) {
      setIsLoading(false);
    }
  }, [isConnected, isLoading]);

  const refreshData = useCallback(async () => {
    const mockData = generateMockData();
    setData(mockData);
    setLastUpdate(new Date());
  }, [generateMockData]);

  return {
    data,
    lastUpdate,
    isLoading,
    error: error || wsError,
    isConnected,
    refreshData
  };
};