'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  Shield, 
  UserPlus,
  MessageSquare,
  Gift,
  TrendingUp,
  DollarSign,
  Clock
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'moderation' | 'member' | 'message' | 'giveaway' | 'xp' | 'economy';
  action: string;
  user?: string;
  target?: string;
  timestamp: string;
  details?: string;
}

interface RecentActivityProps {
  serverId: string;
}

export function RecentActivity({ serverId }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching recent activity
    // In production, this would fetch from your API
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'moderation',
        action: 'User Warned',
        user: 'Moderator#1234',
        target: 'User#5678',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        details: 'Reason: Spamming'
      },
      {
        id: '2',
        type: 'member',
        action: 'Member Joined',
        user: 'NewUser#9012',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        id: '3',
        type: 'xp',
        action: 'Level Up',
        user: 'ActiveUser#3456',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        details: 'Reached Level 10'
      },
      {
        id: '4',
        type: 'economy',
        action: 'Purchase Made',
        user: 'RichUser#7890',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        details: 'Bought: VIP Role'
      },
      {
        id: '5',
        type: 'giveaway',
        action: 'Giveaway Ended',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        details: 'Winner: LuckyUser#1111'
      }
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, [serverId]);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'moderation':
        return Shield;
      case 'member':
        return UserPlus;
      case 'message':
        return MessageSquare;
      case 'giveaway':
        return Gift;
      case 'xp':
        return TrendingUp;
      case 'economy':
        return DollarSign;
      default:
        return Activity;
    }
  };

  const getTypeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'moderation':
        return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'member':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      case 'message':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/50';
      case 'giveaway':
        return 'text-pink-400 bg-pink-500/20 border-pink-500/50';
      case 'xp':
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'economy':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="glass border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                  <div className={`p-2 rounded-full ${getTypeColor(activity.type)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                    {activity.user && (
                      <p className="text-xs text-gray-400">
                        By: <span className="text-gray-300">{activity.user}</span>
                        {activity.target && (
                          <> → <span className="text-gray-300">{activity.target}</span></>
                        )}
                      </p>
                    )}
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">Activity will appear here as it happens</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}