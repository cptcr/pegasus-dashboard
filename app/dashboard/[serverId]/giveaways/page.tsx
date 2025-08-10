'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Edit, ExternalLink, Gift, Clock, Users, Trophy } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { Giveaway, GiveawayEntry } from '@/lib/db/schema';

interface GiveawayWithEntries extends Giveaway {
  entryDetails: GiveawayEntry[];
}

export default function GiveawaysPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params['serverId'] as string;
  
  const [giveaways, setGiveaways] = useState<GiveawayWithEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGiveaways = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/guilds/${serverId}/giveaways`);
      if (!response.ok) {
        throw new Error('Failed to fetch giveaways');
      }
      
      const data = await response.json();
      setGiveaways(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchGiveaways();
  }, [fetchGiveaways]);

  const handleDelete = async (giveawayId: string) => {
    if (!confirm('Are you sure you want to delete this giveaway?')) {
      return;
    }

    try {
      setDeletingId(giveawayId);
      const response = await fetch(`/api/guilds/${serverId}/giveaways/${giveawayId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete giveaway');
      }

      setGiveaways(prev => prev.filter(g => g.giveawayId !== giveawayId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete giveaway');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'ended':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
              <Skeleton key={i} className="h-32 w-full" />
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
        <CardContent>
          <Button onClick={fetchGiveaways}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Giveaways Management
              </CardTitle>
              <CardDescription>
                Manage and monitor all giveaways for this server
              </CardDescription>
            </div>
            <Badge variant="outline">
              {giveaways.filter(g => g.status === 'active').length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {giveaways.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No giveaways found for this server</p>
              <p className="text-sm mt-2">Giveaways can only be created through Discord commands</p>
            </div>
          ) : (
            <div className="space-y-4">
              {giveaways.map(giveaway => (
                <Card key={giveaway.giveawayId} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{giveaway.prize}</h3>
                          <Badge className={getStatusColor(giveaway.status)}>
                            {giveaway.status}
                          </Badge>
                        </div>
                        
                        {giveaway.description && (
                          <p className="text-sm text-muted-foreground">{giveaway.description}</p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{giveaway.entries} entries</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            <span>{giveaway.winnerCount} winner(s)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {giveaway.status === 'active' 
                                ? `Ends ${formatDistanceToNow(new Date(giveaway.endTime), { addSuffix: true })}`
                                : `Ended ${format(new Date(giveaway.endedAt || giveaway.endTime), 'PPp')}`
                              }
                            </span>
                          </div>
                        </div>

                        {giveaway.winners && (
                          <div className="mt-2">
                            <span className="text-sm font-medium">Winners: </span>
                            <span className="text-sm text-muted-foreground">
                              {String(giveaway.winners 
                                ? Array.isArray(giveaway.winners) 
                                  ? (giveaway.winners as string[]).join(', ')
                                  : typeof giveaway.winners === 'string'
                                    ? giveaway.winners
                                    : 'None selected yet'
                                : 'None selected yet'
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(`/g/${serverId}/${giveaway.giveawayId}`, '_blank')}
                          title="View public page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/dashboard/${serverId}/giveaways/${giveaway.giveawayId}/edit`)}
                          title="Edit giveaway"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(giveaway.giveawayId)}
                          disabled={deletingId === giveaway.giveawayId}
                          title="Delete giveaway"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}