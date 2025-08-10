'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, AlertTriangle, BarChart3, Plus, 
  Edit, Trash2, User, Clock, Gavel, Bot
} from 'lucide-react';
import { format } from 'date-fns';
import type { Warning, WarningAutomation, ModCase } from '@/lib/db/schema';

interface ModerationData {
  warnings: Warning[];
  automations: WarningAutomation[];
  recentCases: ModCase[];
  stats: {
    totalWarnings: number;
    totalBans: number;
    totalMutes: number;
    totalKicks: number;
    activeAutomations: number;
  };
}

export default function ModerationPage() {
  const params = useParams();
  const serverId = params['serverId'] as string;
  
  const [data, setData] = useState<ModerationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newAutomation, setNewAutomation] = useState({
    warningCount: 3,
    action: 'mute',
    duration: 3600,
    reason: 'Automated action for reaching warning threshold',
  });
  const [editingAutomation, setEditingAutomation] = useState<string | null>(null);
  const [editingWarning, setEditingWarning] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/guilds/${serverId}/moderation`);
        if (!response.ok) {
          throw new Error('Failed to fetch moderation data');
        }
        
        const modData = await response.json();
        setData(modData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serverId]);

  const handleCreateAutomation = async () => {
    try {
      const response = await fetch(`/api/guilds/${serverId}/moderation/automations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAutomation,
          guildId: serverId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create automation');
      }

      const automation = await response.json();
      if (data) {
        setData({
          ...data,
          automations: [...data.automations, automation],
          stats: {
            ...data.stats,
            activeAutomations: data.stats.activeAutomations + 1,
          },
        });
      }
      
      setNewAutomation({
        warningCount: 3,
        action: 'mute',
        duration: 3600,
        reason: 'Automated action for reaching warning threshold',
      });
      
      alert('Automation created successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create automation');
    }
  };

  const handleUpdateAutomation = async (automationId: string, updates: Partial<WarningAutomation>) => {
    try {
      const response = await fetch(`/api/guilds/${serverId}/moderation/automations/${automationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update automation');
      }

      const updatedAutomation = await response.json();
      if (data) {
        setData({
          ...data,
          automations: data.automations.map(a => a.id.toString() === automationId ? updatedAutomation : a),
        });
      }
      
      setEditingAutomation(null);
      alert('Automation updated successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update automation');
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/guilds/${serverId}/moderation/automations/${automationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete automation');
      }

      if (data) {
        setData({
          ...data,
          automations: data.automations.filter(a => a.id.toString() !== automationId),
          stats: {
            ...data.stats,
            activeAutomations: Math.max(0, data.stats.activeAutomations - 1),
          },
        });
      }
      
      alert('Automation deleted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete automation');
    }
  };

  const handleUpdateWarning = async (warningId: string, updates: Partial<Warning>) => {
    try {
      const response = await fetch(`/api/guilds/${serverId}/moderation/warnings/${warningId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update warning');
      }

      const updatedWarning = await response.json();
      if (data) {
        setData({
          ...data,
          warnings: data.warnings.map(w => w.id.toString() === warningId ? updatedWarning : w),
        });
      }
      
      setEditingWarning(null);
      alert('Warning updated successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update warning');
    }
  };

  const handleDeleteWarning = async (warningId: string) => {
    if (!confirm('Are you sure you want to delete this warning?')) {
      return;
    }

    try {
      const response = await fetch(`/api/guilds/${serverId}/moderation/warnings/${warningId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete warning');
      }

      if (data) {
        setData({
          ...data,
          warnings: data.warnings.filter(w => w.id.toString() !== warningId),
          stats: {
            ...data.stats,
            totalWarnings: Math.max(0, data.stats.totalWarnings - 1),
          },
        });
      }
      
      alert('Warning deleted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete warning');
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

  const getActionColor = (action: string) => {
    switch (action) {
      case 'warn':
        return 'bg-yellow-500';
      case 'mute':
      case 'timeout':
        return 'bg-orange-500';
      case 'kick':
        return 'bg-purple-500';
      case 'ban':
        return 'bg-red-500';
      case 'unban':
      case 'untimeout':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6" />
        Moderation Management
      </h1>

      <Tabs defaultValue="warnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="warnings">Warnings</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="cases">Recent Cases</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Warnings Tab */}
        <TabsContent value="warnings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Warnings
              </CardTitle>
              <CardDescription>
                View and manage user warnings. Warnings cannot be created manually - use Discord commands.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.warnings && data.warnings.length > 0 ? (
                <div className="space-y-3">
                  {data.warnings.map(warning => (
                    <div key={warning.id} className="p-4 border rounded-lg">
                      {editingWarning === warning.id.toString() ? (
                        <div className="space-y-3">
                          <textarea
                            value={warning.description || ''}
                            onChange={(e) => {
                              if (data) {
                                setData({
                                  ...data,
                                  warnings: data.warnings.map(w => 
                                    w.id === warning.id ? { ...w, description: e.target.value } : w
                                  ),
                                });
                              }
                            }}
                            className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateWarning(warning.id.toString(), { description: warning.description })}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingWarning(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">User ID: {warning.userId}</span>
                              {warning.active && (
                                <Badge variant="destructive">Active</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{warning.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Warned by: {warning.moderatorId}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(warning.createdAt), 'PPp')}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setEditingWarning(warning.id.toString())}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDeleteWarning(warning.id.toString())}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active warnings</p>
                  <p className="text-sm mt-2">Warnings are created through Discord commands</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Warning Automations
              </CardTitle>
              <CardDescription>
                Configure automatic actions based on warning counts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create New Automation */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium">Create New Automation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Warning Count Threshold</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newAutomation.warningCount}
                      onChange={(e) => setNewAutomation(prev => ({ 
                        ...prev, 
                        warningCount: parseInt(e.target.value) || 3 
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Action</label>
                    <select
                      value={newAutomation.action}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, action: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="mute">Mute</option>
                      <option value="kick">Kick</option>
                      <option value="ban">Ban</option>
                      <option value="timeout">Timeout</option>
                    </select>
                  </div>
                </div>
                {(newAutomation.action === 'mute' || newAutomation.action === 'timeout') && (
                  <div>
                    <label className="text-sm font-medium">Duration (seconds)</label>
                    <Input
                      type="number"
                      min="60"
                      value={newAutomation.duration}
                      onChange={(e) => setNewAutomation(prev => ({ 
                        ...prev, 
                        duration: parseInt(e.target.value) || 3600 
                      }))}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <Input
                    value={newAutomation.reason}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Reason for automated action"
                  />
                </div>
                <Button onClick={handleCreateAutomation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Automation
                </Button>
              </div>

              {/* Automations List */}
              <div className="space-y-3">
                {data?.automations.map(automation => (
                  <div key={automation.id} className="p-4 border rounded-lg">
                    {editingAutomation === automation.id.toString() ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={automation.triggerValue}
                            onChange={(e) => {
                              if (data) {
                                setData({
                                  ...data,
                                  automations: data.automations.map(a => 
                                    a.id === automation.id ? { ...a, triggerValue: parseInt(e.target.value) || 3 } : a
                                  ),
                                });
                              }
                            }}
                          />
                          <select
                            value={Array.isArray(automation.actions) && automation.actions.length > 0 ? (automation.actions[0] as any)?.type || 'mute' : 'mute'}
                            onChange={(e) => {
                              if (data) {
                                setData({
                                  ...data,
                                  automations: data.automations.map(a => 
                                    a.id === automation.id ? { ...a, actions: [{ type: e.target.value, duration: 3600 }] } : a
                                  ),
                                });
                              }
                            }}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="mute">Mute</option>
                            <option value="kick">Kick</option>
                            <option value="ban">Ban</option>
                            <option value="timeout">Timeout</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateAutomation(automation.id.toString(), automation)}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingAutomation(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{automation.triggerValue} warnings</Badge>
                            <Badge className={getActionColor(Array.isArray(automation.actions) && automation.actions.length > 0 ? (automation.actions[0] as any)?.type || 'mute' : 'mute')}>
                              {Array.isArray(automation.actions) && automation.actions.length > 0 ? (automation.actions[0] as any)?.type || 'mute' : 'mute'}
                            </Badge>
                            {automation.enabled ? (
                              <Badge variant="default">Enabled</Badge>
                            ) : (
                              <Badge variant="secondary">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{automation.description}</p>
                          {Array.isArray(automation.actions) && automation.actions.length > 0 && (automation.actions[0] as any)?.duration && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Duration: {Math.round(((automation.actions[0] as any)?.duration || 0) / 60)} minutes
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setEditingAutomation(automation.id.toString())}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteAutomation(automation.id.toString())}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(!data?.automations || data.automations.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No automations configured</p>
                    <p className="text-sm mt-2">Create automations to automatically action users</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Cases Tab */}
        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Recent Moderation Cases
              </CardTitle>
              <CardDescription>
                Latest moderation actions taken
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.recentCases && data.recentCases.length > 0 ? (
                <div className="space-y-3">
                  {data.recentCases.map(modCase => (
                    <div key={modCase.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Badge className={getActionColor(modCase.type)}>
                          {modCase.type}
                        </Badge>
                        <div>
                          <p className="font-medium">Case #{modCase.id}</p>
                          <p className="text-sm text-muted-foreground">
                            User: {modCase.userId} | Mod: {modCase.moderatorId}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{modCase.reason}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {format(new Date(modCase.createdAt), 'PPp')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No moderation cases yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Moderation Statistics
              </CardTitle>
              <CardDescription>
                Overview of moderation activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-yellow-500">{data.stats.totalWarnings}</div>
                      <p className="text-sm text-muted-foreground">Total Warnings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-orange-500">{data.stats.totalMutes}</div>
                      <p className="text-sm text-muted-foreground">Total Mutes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-purple-500">{data.stats.totalKicks}</div>
                      <p className="text-sm text-muted-foreground">Total Kicks</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-500">{data.stats.totalBans}</div>
                      <p className="text-sm text-muted-foreground">Total Bans</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-500">{data.stats.activeAutomations}</div>
                      <p className="text-sm text-muted-foreground">Active Automations</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No statistics available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}