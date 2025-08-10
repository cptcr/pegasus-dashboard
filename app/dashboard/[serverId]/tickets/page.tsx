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
  Ticket, Plus, Settings, BarChart3, Send, 
  Edit, Trash2, Clock, Archive 
} from 'lucide-react';
import type { TicketPanel, Ticket as TicketType } from '@/lib/db/schema';

interface TicketData {
  panels: TicketPanel[];
  tickets: TicketType[];
  stats: {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    averageResponseTime: number;
  };
}

export default function TicketsPage() {
  const params = useParams();
  const serverId = params['serverId'] as string;
  
  const [data, setData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newPanel, setNewPanel] = useState({
    title: '',
    description: '',
    categoryId: '',
    buttonLabel: 'Create Ticket',
    buttonEmoji: '🎫',
  });
  const [editingPanel, setEditingPanel] = useState<string | null>(null);
  const [sendingPanel, setSendingPanel] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/guilds/${serverId}/tickets`);
        if (!response.ok) {
          throw new Error('Failed to fetch ticket data');
        }
        
        const ticketData = await response.json();
        setData(ticketData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serverId]);

  const handleCreatePanel = async () => {
    try {
      const response = await fetch(`/api/guilds/${serverId}/tickets/panels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPanel,
          guildId: serverId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create panel');
      }

      const panel = await response.json();
      if (data) {
        setData({
          ...data,
          panels: [...data.panels, panel],
        });
      }
      
      setNewPanel({
        title: '',
        description: '',
        categoryId: '',
        buttonLabel: 'Create Ticket',
        buttonEmoji: '🎫',
      });
      
      alert('Panel created successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create panel');
    }
  };

  const handleUpdatePanel = async (panelId: string, updates: Partial<TicketPanel>) => {
    try {
      const response = await fetch(`/api/guilds/${serverId}/tickets/panels/${panelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update panel');
      }

      const updatedPanel = await response.json();
      if (data) {
        setData({
          ...data,
          panels: data.panels.map(p => p.id === panelId ? updatedPanel : p),
        });
      }
      
      setEditingPanel(null);
      alert('Panel updated successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update panel');
    }
  };

  const handleSendPanel = async (panelId: string, channelId: string) => {
    try {
      const response = await fetch(`/api/guilds/${serverId}/tickets/panels/${panelId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send panel');
      }

      setSendingPanel(null);
      alert('Panel sent to channel successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send panel');
    }
  };

  const handleDeletePanel = async (panelId: string) => {
    if (!confirm('Are you sure you want to delete this panel?')) {
      return;
    }

    try {
      const response = await fetch(`/api/guilds/${serverId}/tickets/panels/${panelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete panel');
      }

      if (data) {
        setData({
          ...data,
          panels: data.panels.filter(p => p.id !== panelId),
        });
      }
      
      alert('Panel deleted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete panel');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'claimed':
        return 'bg-blue-500';
      case 'closed':
        return 'bg-gray-500';
      case 'locked':
        return 'bg-red-500';
      case 'frozen':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Ticket className="h-6 w-6" />
        Ticket System Management
      </h1>

      <Tabs defaultValue="panels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="panels">Ticket Panels</TabsTrigger>
          <TabsTrigger value="tickets">Active Tickets</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Panels Tab */}
        <TabsContent value="panels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ticket Panels
              </CardTitle>
              <CardDescription>
                Create and manage ticket creation panels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create New Panel */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium">Create New Panel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Panel title"
                    value={newPanel.title}
                    onChange={(e) => setNewPanel(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Input
                    placeholder="Category ID"
                    value={newPanel.categoryId}
                    onChange={(e) => setNewPanel(prev => ({ ...prev, categoryId: e.target.value }))}
                  />
                </div>
                <textarea
                  placeholder="Panel description"
                  value={newPanel.description}
                  onChange={(e) => setNewPanel(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Button label"
                    value={newPanel.buttonLabel}
                    onChange={(e) => setNewPanel(prev => ({ ...prev, buttonLabel: e.target.value }))}
                  />
                  <Input
                    placeholder="Button emoji"
                    value={newPanel.buttonEmoji}
                    onChange={(e) => setNewPanel(prev => ({ ...prev, buttonEmoji: e.target.value }))}
                    maxLength={2}
                  />
                </div>
                <Button onClick={handleCreatePanel} disabled={!newPanel.title || !newPanel.description || !newPanel.categoryId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Panel
                </Button>
              </div>

              {/* Panels List */}
              <div className="space-y-3">
                {data?.panels.map(panel => (
                  <div key={panel.id} className="p-4 border rounded-lg">
                    {editingPanel === panel.id ? (
                      <div className="space-y-3">
                        <Input
                          value={panel.title}
                          onChange={(e) => {
                            if (data) {
                              setData({
                                ...data,
                                panels: data.panels.map(p => 
                                  p.id === panel.id ? { ...p, title: e.target.value } : p
                                ),
                              });
                            }
                          }}
                        />
                        <textarea
                          value={panel.description || ''}
                          onChange={(e) => {
                            if (data) {
                              setData({
                                ...data,
                                panels: data.panels.map(p => 
                                  p.id === panel.id ? { ...p, description: e.target.value } : p
                                ),
                              });
                            }
                          }}
                          className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleUpdatePanel(panel.id, panel)}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingPanel(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : sendingPanel === panel.id ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Enter channel ID to send panel:</p>
                        <Input
                          placeholder="Channel ID"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              handleSendPanel(panel.id, e.currentTarget.value);
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setSendingPanel(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{panel.title}</h4>
                            {panel.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="destructive">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{panel.description}</p>
                          <div className="flex gap-4 text-sm">
                            <span>Category: {panel.categoryId}</span>
                            <span>Button: {panel.buttonLabel}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setSendingPanel(panel.id)}
                            title="Send to channel"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setEditingPanel(panel.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeletePanel(panel.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(!data?.panels || data.panels.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No ticket panels yet</p>
                    <p className="text-sm mt-2">Create panels for users to open tickets</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Tickets Tab */}
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Active Tickets
              </CardTitle>
              <CardDescription>
                View and manage currently open tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.tickets && data.tickets.length > 0 ? (
                <div className="space-y-3">
                  {data.tickets.map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <div>
                          <p className="font-medium">Ticket #{ticket.ticketNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            User: {ticket.userId} | Channel: {ticket.channelId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        {ticket.claimedBy && (
                          <div>Claimed by: {ticket.claimedBy}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active tickets</p>
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
                Ticket Statistics
              </CardTitle>
              <CardDescription>
                Overview of ticket system performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{data.stats.totalTickets}</div>
                      <p className="text-sm text-muted-foreground">Total Tickets</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-500">{data.stats.openTickets}</div>
                      <p className="text-sm text-muted-foreground">Open Tickets</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-gray-500">{data.stats.closedTickets}</div>
                      <p className="text-sm text-muted-foreground">Closed Tickets</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {Math.round(data.stats.averageResponseTime / 60)}m
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
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