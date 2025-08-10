'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { TrendingUp, Settings, RefreshCw, Users, Save } from 'lucide-react';
import type { XpSettings, UserXp, XpReward } from '@/lib/db/schema';

interface XpData {
  settings: XpSettings;
  topUsers: UserXp[];
  rewards: XpReward[];
}

export default function XpSystemPage() {
  const params = useParams();
  const serverId = params['serverId'] as string;
  
  const [data, setData] = useState<XpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<Partial<XpSettings>>({});
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/guilds/${serverId}/xp`);
        if (!response.ok) {
          throw new Error('Failed to fetch XP data');
        }
        
        const xpData = await response.json();
        setData(xpData);
        
        if (xpData.settings) {
          setSettings(xpData.settings);
          setSelectedChannels(JSON.parse(xpData.settings.ignoredChannels || '[]'));
          setSelectedRoles(JSON.parse(xpData.settings.ignoredRoles || '[]'));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serverId]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/guilds/${serverId}/xp/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          ignoredChannels: JSON.stringify(selectedChannels),
          ignoredRoles: JSON.stringify(selectedRoles),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      alert('Settings saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetUser = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s XP? This action cannot be undone.')) {
      return;
    }

    try {
      setResetting(userId);
      
      const response = await fetch(`/api/guilds/${serverId}/xp/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset user XP');
      }

      // Update local state
      if (data) {
        setData({
          ...data,
          topUsers: data.topUsers.filter(u => u.userId !== userId),
        });
      }
      
      alert('User XP reset successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset user XP');
    } finally {
      setResetting(null);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('Are you sure you want to reset ALL XP data for this server? This action cannot be undone!')) {
      return;
    }

    if (!confirm('This will delete ALL XP data. Type "CONFIRM" to proceed.')) {
      return;
    }

    try {
      setResetting('all');
      
      const response = await fetch(`/api/guilds/${serverId}/xp/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetAll: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset all XP');
      }

      // Update local state
      if (data) {
        setData({
          ...data,
          topUsers: [],
        });
      }
      
      alert('All XP data reset successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset all XP');
    } finally {
      setResetting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                XP System Settings
              </CardTitle>
              <CardDescription>
                Configure XP gain, multipliers, and channel settings
              </CardDescription>
            </div>
            <Button 
              onClick={() => window.open(`/xp/${serverId}`, '_blank')}
              variant="outline"
            >
              View Public Leaderboard
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level Up Rewards */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Level Up Rewards</h3>
              <p className="text-sm text-muted-foreground">Enable role rewards for leveling up</p>
            </div>
            <Switch
              checked={settings.levelUpRewardsEnabled ?? false}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, levelUpRewardsEnabled: checked }))}
            />
          </div>

          {/* Stack Role Rewards */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Stack Role Rewards</h3>
              <p className="text-sm text-muted-foreground">Keep previous level roles when leveling up</p>
            </div>
            <Switch
              checked={settings.stackRoleRewards ?? false}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, stackRoleRewards: checked }))}
            />
          </div>

          {/* Channel Selectors */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Ignored Channels</h3>
              <p className="text-sm text-muted-foreground mb-3">Channels where XP gain is disabled</p>
              <Input
                placeholder="Enter channel IDs separated by commas"
                value={selectedChannels.join(', ')}
                onChange={(e) => setSelectedChannels(e.target.value.split(',').map(id => id.trim()).filter(Boolean))}
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">Ignored Roles</h3>
              <p className="text-sm text-muted-foreground mb-3">Roles that don't gain XP</p>
              <Input
                placeholder="Enter role IDs separated by commas"
                value={selectedRoles.join(', ')}
                onChange={(e) => setSelectedRoles(e.target.value.split(',').map(id => id.trim()).filter(Boolean))}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Users
          </CardTitle>
          <CardDescription>
            Manage XP for individual users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.topUsers && data.topUsers.length > 0 ? (
            <div className="space-y-3">
              {data.topUsers.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">User ID: {user.userId}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">Level {user.level}</Badge>
                        <Badge variant="outline">{user.xp} XP</Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleResetUser(user.userId)}
                    disabled={resetting === user.userId}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset XP
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users with XP yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset All XP */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for XP management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleResetAll}
            disabled={resetting === 'all'}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All Server XP
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}