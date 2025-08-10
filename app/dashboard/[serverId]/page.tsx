'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Server, 
  Shield, 
  Settings,
  ExternalLink,
  Activity,
  TrendingUp,
  DollarSign,
  Ticket,
  Gift,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  LogOut,
  Crown,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ServerOverview } from "@/components/dashboard/ServerOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

interface GuildData {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  description: string | null;
  owner_id: string;
  member_count: number;
  presence_count: number;
  features: string[];
  premium_tier: number;
  premium_subscription_count: number;
  preferred_locale: string;
  verification_level: number;
  explicit_content_filter: number;
  mfa_level: number;
  has_bot: boolean;
}

export default function ServerDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params['serverId'] as string;
  
  const [guild, setGuild] = useState<GuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGuildData = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/guilds/${serverId}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('You do not have admin access to this server');
        } else if (response.status === 404) {
          setError('Server not found');
        } else {
          setError('Failed to load server data');
        }
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setGuild(data.data);
      }
    } catch (err) {
      console.error('Error fetching guild:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuildData();
    // Refresh data every 60 seconds
    const interval = setInterval(fetchGuildData, 60000);
    return () => clearInterval(interval);
  }, [serverId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGuildData();
  };

  const handleLeaveServer = async () => {
    if (!confirm('Are you sure you want the bot to leave this server?')) return;
    
    try {
      const response = await fetch(`/api/guilds/${serverId}/leave`, {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/dashboard/servers');
      } else {
        alert('Failed to leave server');
      }
    } catch (err) {
      console.error('Error leaving server:', err);
      alert('Failed to leave server');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-48 w-full mb-6" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 w-full mb-6" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass border-red-500/20">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Server</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/dashboard/servers')}>
                  Back to Servers
                </Button>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!guild) return null;

  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${process.env['NEXT_PUBLIC_DISCORD_CLIENT_ID'] || process.env['DISCORD_CLIENT_ID'] || ''}&permissions=8&scope=bot%20applications.commands&guild_id=${serverId}`;

  return (
    <div className="min-h-screen p-8">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          >
            <Sparkles className="text-purple-500/10 w-6 h-6" />
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {guild.icon ? (
              <Image
                src={guild.icon}
                alt={guild.name}
                width={64}
                height={64}
                className="rounded-full ring-2 ring-purple-500/20"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Server className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold gradient-text animate-gradient">
                {guild.name}
              </h1>
              {guild.description && (
                <p className="text-gray-400 mt-1">{guild.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {guild.has_bot ? (
                  <Badge className="gap-1 bg-green-500/20 text-green-400 border-green-500/50">
                    <Activity className="h-3 w-3" />
                    Bot Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Bot Not Added
                  </Badge>
                )}
                {guild.premium_tier > 0 && (
                  <Badge className="gap-1 bg-purple-500/20 text-purple-400 border-purple-500/50">
                    <Crown className="h-3 w-3" />
                    Boost Level {guild.premium_tier}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className={refreshing ? 'animate-spin' : ''}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {!guild.has_bot && (
              <Link href={inviteUrl} target="_blank">
                <Button className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Add Bot
                </Button>
              </Link>
            )}
          </div>
        </div>

        {!guild.has_bot ? (
          // Bot not added state
          <Card className="glass border-yellow-500/20 mb-6">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Bot Not Added to This Server</h2>
              <p className="text-gray-400 mb-6">
                Pegasus needs to be added to this server before you can manage it.
              </p>
              <Link href={inviteUrl} target="_blank">
                <Button size="lg" className="gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Add Pegasus to {guild.name}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          // Bot is added - show full dashboard
          <>
            {/* Server Stats */}
            <ServerOverview guild={guild} />

            {/* Quick Actions */}
            <QuickActions serverId={serverId} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Feature Modules */}
                <Card className="glass border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-400" />
                      Server Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href={`/dashboard/${serverId}/moderation`}>
                        <Card className="glass border-purple-500/10 hover:border-purple-500/30 hover:scale-105 transition-all cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-3">
                            <Shield className="h-8 w-8 text-purple-400" />
                            <div>
                              <p className="font-semibold">Moderation</p>
                              <p className="text-sm text-gray-400">Manage warns, bans & filters</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                          </CardContent>
                        </Card>
                      </Link>
                      
                      <Link href={`/dashboard/${serverId}/economy`}>
                        <Card className="glass border-yellow-500/10 hover:border-yellow-500/30 hover:scale-105 transition-all cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-3">
                            <DollarSign className="h-8 w-8 text-yellow-400" />
                            <div>
                              <p className="font-semibold">Economy</p>
                              <p className="text-sm text-gray-400">Shop, currency & rewards</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                          </CardContent>
                        </Card>
                      </Link>
                      
                      <Link href={`/dashboard/${serverId}/tickets`}>
                        <Card className="glass border-blue-500/10 hover:border-blue-500/30 hover:scale-105 transition-all cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-3">
                            <Ticket className="h-8 w-8 text-blue-400" />
                            <div>
                              <p className="font-semibold">Tickets</p>
                              <p className="text-sm text-gray-400">Support ticket system</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                          </CardContent>
                        </Card>
                      </Link>
                      
                      <Link href={`/dashboard/${serverId}/xp`}>
                        <Card className="glass border-green-500/10 hover:border-green-500/30 hover:scale-105 transition-all cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-green-400" />
                            <div>
                              <p className="font-semibold">XP System</p>
                              <p className="text-sm text-gray-400">Levels, ranks & rewards</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                          </CardContent>
                        </Card>
                      </Link>
                      
                      <Link href={`/dashboard/${serverId}/giveaways`}>
                        <Card className="glass border-pink-500/10 hover:border-pink-500/30 hover:scale-105 transition-all cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-3">
                            <Gift className="h-8 w-8 text-pink-400" />
                            <div>
                              <p className="font-semibold">Giveaways</p>
                              <p className="text-sm text-gray-400">Manage active giveaways</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <RecentActivity serverId={serverId} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Server Info */}
                <Card className="glass border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Server Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Server ID</span>
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded">{guild.id}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Verification</span>
                      <Badge variant="outline" className="text-xs">
                        Level {guild.verification_level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">2FA Required</span>
                      <Badge variant={guild.mfa_level === 1 ? "default" : "outline"} className="text-xs">
                        {guild.mfa_level === 1 ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Boost Tier</span>
                      <Badge className="text-xs bg-purple-500/20 text-purple-400">
                        Level {guild.premium_tier}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Boosts</span>
                      <span className="text-sm font-medium">{guild.premium_subscription_count || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="glass border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-400">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={handleLeaveServer}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Make Bot Leave Server
                    </Button>
                    <p className="text-xs text-gray-400 text-center">
                      This action will remove Pegasus from {guild.name}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}