"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  ExternalLink, 
  Settings, 
  Shield, 
  Lock,
  Server,
  Crown,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  Users,
  Zap,
  TrendingUp,
  Cpu,
  HardDrive,
  Wifi,
  BarChart3,
  Clock,
  Globe
} from "lucide-react";
import { getBotInviteUrl } from "@/lib/discord-api";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  hasBot: boolean;
  isAdmin: boolean;
}

interface BotStats {
  status: string;
  uptime: number;
  started_at: string;
  guilds: {
    total: number;
    large: number;
    voice_active: number;
  };
  users: {
    total: number;
    unique: number;
    active_today: number;
  };
  commands: {
    total_executed: number;
    today: number;
    this_hour: number;
    most_used: Array<{ name: string; count: number }>;
  };
  system: {
    memory_usage: number;
    memory_total: number;
    cpu_usage: number;
    latency: number;
    shard_count: number;
  };
  features: Record<string, boolean>;
  version: string;
}

export default function DashboardPage() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserGuilds();
    fetchBotStats();
  }, []);

  const fetchBotStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/bot/stats");
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBotStats(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bot stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const formatUptime = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const fetchUserGuilds = async () => {
    try {
      console.log('[Dashboard] Fetching guilds...');
      const response = await fetch("/api/guilds");
      
      console.log('[Dashboard] Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('[Dashboard] Unauthorized, redirecting to login');
          router.push("/login");
          return;
        }
        const errorText = await response.text();
        console.error('[Dashboard] Error response:', errorText);
        throw new Error("Failed to fetch guilds");
      }
      
      const data = await response.json();
      console.log('[Dashboard] Response data:', data);
      
      if (data.success && data.data) {
        console.log(`[Dashboard] Setting ${data.data.guilds?.length || 0} guilds`);
        setGuilds(data.data.guilds || []);
      } else {
        console.error('[Dashboard] Invalid response structure:', data);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching guilds:', err);
      setError(err instanceof Error ? err.message : "Failed to load servers");
    } finally {
      setLoading(false);
    }
  };

  const handleBotInvite = (guildId: string) => {
    const inviteUrl = getBotInviteUrl(guildId);
    window.open(inviteUrl, "_blank");
  };

  const getGuildIcon = (guild: Guild) => {
    if (guild.icon) {
      // guild.icon is already the full URL from the API
      if (guild.icon.startsWith('http')) {
        return guild.icon;
      }
      // Fallback to constructing URL if needed
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
    }
    // Default Discord icon
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(guild.id) % 5}.png`;
  };

  const getServerStatus = (guild: Guild) => {
    // Get Discord permissions first
    const hasDiscordPerms = guild.owner || hasManagePermission(guild.permissions);
    
    // Check conditions as specified in dashboard.md
    
    // Case 1: User has Discord admin/owner permissions
    if (hasDiscordPerms) {
      // Sub-case 1a: Bot IS in server - MANAGEABLE (not grey)
      if (guild.hasBot) {
        return {
          type: 'ready',
          message: null,
          canManage: true,
          showInvite: false,
          isGrey: false // Full color - can manage
        };
      }
      // Sub-case 1b: Bot NOT in server - NEED INVITE (grey)
      else {
        return {
          type: 'no-bot',
          message: 'Bot is not in this server. Invite it by clicking on this button',
          canManage: false,
          showInvite: true,
          isGrey: true // Grey - need bot
        };
      }
    }
    
    // Case 2: User does NOT have Discord admin/owner permissions
    // These are always grey regardless of bot status
    return {
      type: 'no-admin',
      message: 'You are not an admin within this server',
      canManage: false,
      showInvite: false,
      isGrey: true // Grey - no permissions
    };
  };
  
  // Helper function for permission checking
  const hasManagePermission = (permissions: string): boolean => {
    try {
      const perms = BigInt(permissions);
      const ADMINISTRATOR = BigInt(0x8);
      const MANAGE_GUILD = BigInt(0x20);
      return (
        (perms & ADMINISTRATOR) === ADMINISTRATOR ||
        (perms & MANAGE_GUILD) === MANAGE_GUILD
      );
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Your Discord Servers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Servers</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (guilds.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Discord Servers Found</CardTitle>
            <CardDescription>
              You don't appear to be in any Discord servers. Join a server first, then refresh this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Sort servers: manageable ones first, then need invite, then no permission
  const sortedGuilds = [...guilds].sort((a, b) => {
    const statusA = getServerStatus(a);
    const statusB = getServerStatus(b);
    
    // Manageable servers (bot + admin) come first
    if (statusA.canManage && !statusB.canManage) return -1;
    if (!statusA.canManage && statusB.canManage) return 1;
    
    // Then servers that need bot invite
    if (statusA.showInvite && !statusB.showInvite) return -1;
    if (!statusA.showInvite && statusB.showInvite) return 1;
    
    // Finally alphabetical by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="container mx-auto p-6">
      {/* Bot Statistics Section */}
      {!statsLoading && botStats && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-6 w-6 text-green-500" />
            Bot Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xl font-bold capitalize">{botStats.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uptime: {formatUptime(botStats.uptime)}
                </p>
              </CardContent>
            </Card>

            {/* Servers Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Servers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{botStats.guilds.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {botStats.guilds.voice_active} with active voice
                </p>
              </CardContent>
            </Card>

            {/* Users Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{botStats.users.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {botStats.users.active_today.toLocaleString()} active today
                </p>
              </CardContent>
            </Card>

            {/* Commands Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Commands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{botStats.commands.today.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {botStats.commands.this_hour.toLocaleString()} this hour
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Performance Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      CPU Usage
                    </span>
                    <span>{botStats.system.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={botStats.system.cpu_usage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      Memory
                    </span>
                    <span>{botStats.system.memory_usage.toFixed(0)} / {botStats.system.memory_total.toFixed(0)} MB</span>
                  </div>
                  <Progress 
                    value={(botStats.system.memory_usage / botStats.system.memory_total) * 100} 
                    className="h-2" 
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Latency
                  </span>
                  <span className="text-green-400">{botStats.system.latency}ms</span>
                </div>
              </CardContent>
            </Card>

            {/* Most Used Commands */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Popular Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {botStats.commands.most_used.slice(0, 5).map((cmd, index) => (
                    <div key={cmd.name} className="flex justify-between items-center">
                      <span className="text-sm">
                        <span className="text-muted-foreground mr-2">#{index + 1}</span>
                        {cmd.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {cmd.count.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Features */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(botStats.features).slice(0, 8).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center gap-1">
                      {enabled ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-gray-500" />
                      )}
                      <span className="text-xs capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Version: {botStats.version}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Discord Servers</h1>
        <p className="text-muted-foreground">
          Select a server to manage with Pegasus Bot
        </p>
        
        {/* Quick stats */}
        <div className="flex gap-4 mt-4 text-sm">
          <span className="text-green-400">
            ✓ {guilds.filter(g => g.hasBot && g.isAdmin).length} Manageable
          </span>
          <span className="text-yellow-400">
            ⚠ {guilds.filter(g => !g.hasBot).length} Need Bot Invite
          </span>
          <span className="text-gray-400">
            🔒 {guilds.filter(g => g.hasBot && !g.isAdmin).length} No Admin Access
          </span>
        </div>
      </div>

      {/* Display ALL servers in a single grid, sorted */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedGuilds.map((guild) => {
          const status = getServerStatus(guild);
          
          return (
            <Card 
              key={guild.id} 
              className={`overflow-hidden transition-all ${
                status.isGrey ? 'opacity-60 border-gray-500/20' : 'hover:shadow-lg border-green-500/20'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <img
                    src={getGuildIcon(guild)}
                    alt={guild.name}
                    className={`h-16 w-16 rounded-full ${status.isGrey ? 'grayscale' : ''}`}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{guild.name}</CardTitle>
                    
                    {/* Status badges */}
                    <div className="flex items-center gap-2 mt-2">
                      {guild.owner && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      )}
                      
                      {guild.hasBot ? (
                        <Badge className={`text-xs ${guild.isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          <Bot className="h-3 w-3 mr-1" />
                          Bot {guild.isAdmin ? 'Active' : 'Present'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500/50">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Bot Not Added
                        </Badge>
                      )}
                    </div>

                    {/* Status message */}
                    {status.message && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {status.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {status.canManage ? (
                  <Link href={`/dashboard/${guild.id}`}>
                    <Button className="w-full" variant="default">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Server
                    </Button>
                  </Link>
                ) : status.showInvite ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleBotInvite(guild.id)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Invite Pegasus Bot
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="ghost"
                    disabled
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    No Admin Access
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}