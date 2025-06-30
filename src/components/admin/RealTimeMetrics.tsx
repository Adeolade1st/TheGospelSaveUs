import React from 'react';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  Cpu, 
  HardDrive, 
  Zap, 
  Eye,
  Play,
  DollarSign,
  Percent,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useRealTimeAnalytics } from '../../hooks/useRealTimeAnalytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color: string;
  suffix?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  suffix = '',
  loading = false 
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp size={14} className={change < 0 ? 'rotate-180' : ''} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex items-baseline space-x-1">
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-900">
                {formatValue(value)}
              </span>
              {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  activity: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details?: string;
  };
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('registration')) return <Users size={16} className="text-blue-500" />;
    if (action.includes('donation')) return <DollarSign size={16} className="text-green-500" />;
    if (action.includes('played') || action.includes('content')) return <Play size={16} className="text-purple-500" />;
    if (action.includes('subscription')) return <Eye size={16} className="text-orange-500" />;
    return <Activity size={16} className="text-gray-500" />;
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        {getActivityIcon(activity.action)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {activity.action}
        </p>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{activity.user}</span>
          {activity.details && (
            <>
              <span>•</span>
              <span>{activity.details}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-400">
        {getTimeAgo(activity.timestamp)}
      </div>
    </div>
  );
};

const RealTimeMetrics: React.FC = () => {
  const { data, lastUpdate, isLoading, error, isConnected, refreshData } = useRealTimeAnalytics({
    enabled: true,
    updateInterval: 5000
  });

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Connection Status Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="text-green-500" size={20} />
              ) : (
                <WifiOff className="text-red-500" size={20} />
              )}
              <span className={`font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                {isConnected ? 'Real-time Connected' : 'Offline Mode'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>Last update: {formatLastUpdate(lastUpdate)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {error && (
              <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                {error}
              </span>
            )}
            
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Activity Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Users"
            value={data.userActivity.activeUsers}
            change={5.2}
            icon={Users}
            color="bg-blue-500"
            loading={isLoading}
          />
          <MetricCard
            title="New Registrations"
            value={data.userActivity.newRegistrations}
            change={12.8}
            icon={TrendingUp}
            color="bg-green-500"
            suffix="today"
            loading={isLoading}
          />
          <MetricCard
            title="Total Sessions"
            value={data.userActivity.totalSessions}
            change={-2.1}
            icon={Activity}
            color="bg-purple-500"
            loading={isLoading}
          />
          <MetricCard
            title="Avg Session Duration"
            value={Math.floor(data.userActivity.averageSessionDuration / 60)}
            icon={Clock}
            color="bg-orange-500"
            suffix="min"
            loading={isLoading}
          />
        </div>
      </div>

      {/* System Performance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="CPU Usage"
            value={data.systemPerformance.cpuUsage}
            icon={Cpu}
            color="bg-red-500"
            suffix="%"
            loading={isLoading}
          />
          <MetricCard
            title="Memory Usage"
            value={data.systemPerformance.memoryUsage}
            icon={HardDrive}
            color="bg-yellow-500"
            suffix="%"
            loading={isLoading}
          />
          <MetricCard
            title="Response Time"
            value={data.systemPerformance.responseTime}
            icon={Zap}
            color="bg-indigo-500"
            suffix="ms"
            loading={isLoading}
          />
          <MetricCard
            title="Uptime"
            value={data.systemPerformance.uptime.toFixed(2)}
            icon={TrendingUp}
            color="bg-emerald-500"
            suffix="%"
            loading={isLoading}
          />
        </div>
      </div>

      {/* Content Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Views"
            value={data.contentMetrics.totalViews}
            change={8.4}
            icon={Eye}
            color="bg-cyan-500"
            loading={isLoading}
          />
          <MetricCard
            title="Audio Plays"
            value={data.contentMetrics.audioPlays}
            change={15.2}
            icon={Play}
            color="bg-pink-500"
            loading={isLoading}
          />
          <MetricCard
            title="Donations"
            value={data.contentMetrics.donations}
            change={22.7}
            icon={DollarSign}
            color="bg-green-600"
            loading={isLoading}
          />
          <MetricCard
            title="Conversion Rate"
            value={data.contentMetrics.conversionRate.toFixed(1)}
            change={3.1}
            icon={Percent}
            color="bg-violet-500"
            suffix="%"
            loading={isLoading}
          />
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live</span>
          </div>
        </div>
        
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-12 h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            data.recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeMetrics;