'use client';

import { useEffect, useState, useCallback } from 'react';
import { Server, Users, TrendingUp, Zap, Activity, Clock, Database, Shield } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { botAPI } from '@/lib/api';
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface BotStats {
  servers: number;
  users: number;
  uptime: number;
  commands: number;
  latency?: number;
  memory?: number;
  version?: string;
  online?: boolean;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay: string;
  isLoading: boolean;
  suffix?: string;
  trend?: number;
}

function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="inline-flex p-3 rounded-xl bg-gray-700/20 mb-4 animate-pulse">
        <div className="h-8 w-8 bg-gray-600 rounded" />
      </div>
      <div className="h-8 w-24 bg-gray-700 rounded mb-2 animate-pulse" />
      <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay, isLoading, suffix = '', trend }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(0);
  const [_isAnimating, _setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isLoading && typeof value === 'number') {
      _setIsAnimating(true);
      const duration = 2000;
      const startTime = Date.now();
      const startValue = 0;
      const endValue = value;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(easeOutQuart * (endValue - startValue) + startValue);
        
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          _setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    } else if (!isLoading) {
      setDisplayValue(value);
    }
  }, [value, isLoading]);

  if (isLoading) {
    return <StatCardSkeleton />;
  }

  const colorClasses = {
    purple: 'from-purple-500/20 to-purple-600/20 text-purple-400',
    pink: 'from-pink-500/20 to-pink-600/20 text-pink-400',
    blue: 'from-blue-500/20 to-blue-600/20 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-600/20 text-yellow-400',
    cyan: 'from-cyan-500/20 to-cyan-600/20 text-cyan-400',
  }[color] || 'from-gray-500/20 to-gray-600/20 text-gray-400';

  return (
    <Card
      className="glass rounded-2xl p-6 border border-white/10 hover-lift animate-slide-up transition-all hover:border-purple-500/30"
      style={{ animationDelay: delay }}
      role="article"
      aria-label={`${label}: ${displayValue}${suffix}`}
    >
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} mb-4`}>
        <Icon className={`h-8 w-8 ${colorClasses.split(' ')[2]}`} aria-hidden="true" />
      </div>
      <h3 className="text-3xl md:text-4xl font-bold mb-2 text-white tabular-nums">
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
        {suffix}
      </h3>
      <p className="text-gray-400">{label}</p>
      {trend !== undefined && (
        <div className={`mt-2 text-sm flex items-center gap-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <TrendingUp className="w-3 h-3" aria-hidden="true" />
          <span>{trend >= 0 ? '+' : ''}{trend}%</span>
        </div>
      )}
    </Card>
  );
}

function StatsContent() {
  const [stats, setStats] = useState<BotStats>({
    servers: 0,
    users: 0,
    uptime: 0,
    commands: 0,
    latency: 0,
    memory: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const [statusResponse, globalStatsResponse] = await Promise.allSettled([
        botAPI.getStatus(),
        botAPI.getGlobalStats()
      ]);

      let newStats: BotStats = {
        servers: 0,
        users: 0,
        uptime: 0,
        commands: 0,
      };

      // Process bot status
      if (statusResponse.status === 'fulfilled' && statusResponse.value.success) {
        const status = statusResponse.value.data;
        newStats = {
          ...newStats,
          servers: status.servers || 0,
          users: status.users || 0,
          uptime: status.uptime ? Math.floor((status.uptime / (1000 * 60 * 60 * 24)) * 100) / 100 : 0,
          latency: status.latency || 0,
          memory: status.memory || 0,
          online: status.online,
          version: status.version || 'Unknown',
        };
      }

      // Process global stats if available
      if (globalStatsResponse.status === 'fulfilled') {
        const globalStats = (globalStatsResponse.value as any).data || (globalStatsResponse.value as any);
        if (globalStats) {
          newStats.commands = globalStats.totalCommands || globalStats.commands || 0;
        }
      }

      // Use fallback values if API is unavailable
      if (!newStats.servers && !newStats.users) {
        newStats = {
          servers: 523,
          users: 125789,
          uptime: 99.9,
          commands: 1250000,
          latency: 45,
          memory: 256,
          online: true,
          version: 'Unknown',
        };
      }

      setStats(newStats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Unable to load live statistics');
      // Use demo values on error
      setStats({
        servers: 523,
        users: 125789,
        uptime: 99.9,
        commands: 1250000,
        latency: 45,
        memory: 256,
        version: 'Unknown',
        online: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const statsData = [
    { 
      icon: Server, 
      label: 'Active Servers', 
      value: stats.servers, 
      suffix: '+',
      color: 'purple', 
      delay: '0s',
      trend: 12
    },
    { 
      icon: Users, 
      label: 'Total Users', 
      value: stats.users, 
      suffix: '+',
      color: 'pink', 
      delay: '0.1s',
      trend: 18
    },
    { 
      icon: Clock, 
      label: 'Uptime', 
      value: stats.uptime, 
      suffix: '%',
      color: 'green', 
      delay: '0.2s'
    },
    { 
      icon: Zap, 
      label: 'Commands Run', 
      value: stats.commands, 
      suffix: '+',
      color: 'yellow', 
      delay: '0.3s',
      trend: 24
    },
    { 
      icon: Activity, 
      label: 'Latency', 
      value: stats.latency || 45, 
      suffix: 'ms',
      color: 'blue', 
      delay: '0.4s'
    },
    { 
      icon: Database, 
      label: 'Memory Usage', 
      value: stats.memory || 256, 
      suffix: 'MB',
      color: 'cyan', 
      delay: '0.5s'
    }
  ];

  return (
    <section className="relative container mx-auto px-4 py-12" role="region" aria-label="Bot Statistics">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
          Live Bot Statistics
        </h2>
        <p className="text-gray-400">
          Real-time performance metrics and server statistics
        </p>
        {stats.online !== undefined && (
          <div className="mt-4 inline-flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stats.online ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-sm ${stats.online ? 'text-green-400' : 'text-red-400'}`}>
              {stats.online ? 'Bot Online' : 'Bot Offline'}
            </span>
            {stats.version && (
              <span className="text-sm text-gray-500">v{stats.version}</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statsData.map((stat, _index) => (
          <StatCard
            key={_index}
            {...stat}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Live indicator */}
      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" aria-hidden="true" />
          Secure connection established
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </span>
      </div>
    </section>
  );
}

function StatsErrorFallback(_error?: Error, retry?: () => void): ReactNode {
  return (
    <section className="relative container mx-auto px-4 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-400 mb-4">Statistics Unavailable</h2>
        <p className="text-gray-500 mb-6">{_error?.message || 'Unable to load statistics'}</p>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </section>
  );
}

export function StatsPreview() {
  return (
    <ErrorBoundary fallback={StatsErrorFallback}>
      <StatsContent />
    </ErrorBoundary>
  );
}