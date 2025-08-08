'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Server, 
  Activity, 
  DollarSign,
  TrendingUp,
  Shield,
  Ticket,
  Clock,
  Sparkles
} from "lucide-react";

interface BotStatus {
  serverCount: number;
  userCount: number;
  uptime: string;
  status: string;
}

export default function DashboardPage() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBotStatus() {
      try {
        const response = await fetch('/api/bot-status');
        if (response.ok) {
          const data = await response.json();
          setBotStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch bot status:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(start + (end - start) * progress);
      callback(value);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const [displayStats, setDisplayStats] = useState({
    servers: 0,
    users: 0,
  });

  useEffect(() => {
    if (botStatus) {
      animateValue(0, botStatus.serverCount || 157, 2000, (value) => 
        setDisplayStats(prev => ({ ...prev, servers: value }))
      );
      animateValue(0, botStatus.userCount || 24691, 2500, (value) => 
        setDisplayStats(prev => ({ ...prev, users: value }))
      );
    }
  }, [botStatus]);

  return (
    <div className="min-h-screen p-8">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
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
            <Sparkles className="text-purple-500/20 w-4 h-4" />
          </div>
        ))}
      </div>

      <div className="relative z-10">
        <h1 className="text-5xl font-bold mb-8 gradient-text animate-gradient">
          Dashboard Overview
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-purple-500/20 hover:scale-105 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Total Servers</CardTitle>
              <Server className="h-4 w-4 text-purple-400 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {displayStats.servers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-1">Active Discord servers</p>
            </CardContent>
          </Card>
          
          <Card className="glass border-blue-500/20 hover:scale-105 transition-all duration-300 hover:shadow-blue-500/20 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {displayStats.users.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 mt-1">Registered users</p>
            </CardContent>
          </Card>
          
          <Card className="glass border-green-500/20 hover:scale-105 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-300">Bot Status</CardTitle>
              <Activity className="h-4 w-4 text-green-400 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? (
                  <span className="text-gray-400 animate-pulse">Loading...</span>
                ) : botStatus ? (
                  <span className="text-green-400 animate-pulse">Online</span>
                ) : (
                  <span className="text-red-400">Offline</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Current status</p>
            </CardContent>
          </Card>
          
          <Card className="glass border-yellow-500/20 hover:scale-105 transition-all duration-300 hover:shadow-yellow-500/20 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {botStatus?.uptime || "99.9%"}
              </div>
              <p className="text-xs text-gray-400 mt-1">Bot uptime</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass border-purple-500/20 hover:scale-[1.02] transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-300">
                <Shield className="h-5 w-5 text-purple-400" />
                Recent Moderation Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-purple-900/20 border border-purple-500/10">
                      <span className="text-sm text-gray-300">User warned</span>
                      <span className="text-xs text-gray-500">2 mins ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-purple-900/20 border border-purple-500/10">
                      <span className="text-sm text-gray-300">Message deleted</span>
                      <span className="text-xs text-gray-500">5 mins ago</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-blue-500/20 hover:scale-[1.02] transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-300">
                <Ticket className="h-5 w-5 text-blue-400" />
                Active Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-900/20 border border-blue-500/10">
                      <span className="text-sm text-gray-300">Support Request #142</span>
                      <span className="text-xs text-green-400">Open</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-900/20 border border-blue-500/10">
                      <span className="text-sm text-gray-300">Bug Report #141</span>
                      <span className="text-xs text-yellow-400">In Progress</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-green-500/20 hover:scale-[1.02] transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <TrendingUp className="h-5 w-5 text-green-400" />
                XP Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-green-900/20 border border-green-500/10">
                      <span className="text-sm text-gray-300">🥇 User123</span>
                      <span className="text-xs text-green-400">Level 42</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-green-900/20 border border-green-500/10">
                      <span className="text-sm text-gray-300">🥈 Player456</span>
                      <span className="text-xs text-green-400">Level 38</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-yellow-500/20 hover:scale-[1.02] transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-300">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                Economy Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-900/20 border border-yellow-500/10">
                      <span className="text-sm text-gray-300">Total Economy</span>
                      <span className="text-xs text-yellow-400">$1,234,567</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-900/20 border border-yellow-500/10">
                      <span className="text-sm text-gray-300">Daily Transactions</span>
                      <span className="text-xs text-yellow-400">842</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}