'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Activity,
  Globe,
  Zap
} from "lucide-react";

interface GuildData {
  id: string;
  name: string;
  member_count: number;
  presence_count: number;
  features: string[];
  premium_tier: number;
  preferred_locale: string;
  has_bot: boolean;
}

interface ServerOverviewProps {
  guild: GuildData;
}

export function ServerOverview({ guild }: ServerOverviewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getActivityPercentage = () => {
    if (!guild.member_count) return 0;
    return Math.round((guild.presence_count / guild.member_count) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="glass border-blue-500/20 hover:scale-105 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">
            {formatNumber(guild.member_count || 0)}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {guild.presence_count || 0} online now
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-green-500/20 hover:scale-105 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity Rate</CardTitle>
          <Activity className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">
            {getActivityPercentage()}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getActivityPercentage()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-purple-500/20 hover:scale-105 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Server Boost</CardTitle>
          <Zap className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-400">
            Level {guild.premium_tier}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {3 - guild.premium_tier > 0 ? `${3 - guild.premium_tier} levels to max` : 'Max level reached!'}
          </p>
        </CardContent>
      </Card>

      <Card className="glass border-yellow-500/20 hover:scale-105 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Region</CardTitle>
          <Globe className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-400">
            {guild.preferred_locale?.toUpperCase() || 'EN-US'}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Preferred locale
          </p>
        </CardContent>
      </Card>
    </div>
  );
}