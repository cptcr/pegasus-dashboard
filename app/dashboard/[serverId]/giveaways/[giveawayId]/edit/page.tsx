'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';
import type { Giveaway } from '@/lib/db/schema';

export default function EditGiveawayPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params['serverId'] as string;
  const giveawayId = params['giveawayId'] as string;
  
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    prize: '',
    description: '',
    winnerCount: 1,
    endTime: '',
  });

  useEffect(() => {
    const fetchGiveaway = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/guilds/${serverId}/giveaways/${giveawayId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch giveaway');
        }
        
        const data = await response.json();
        setGiveaway(data);
        setFormData({
          prize: data.prize,
          description: data.description || '',
          winnerCount: data.winnerCount,
          endTime: new Date(data.endTime).toISOString().slice(0, 16),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGiveaway();
  }, [serverId, giveawayId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/guilds/${serverId}/giveaways/${giveawayId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prize: formData.prize,
          description: formData.description || null,
          winnerCount: formData.winnerCount,
          endTime: new Date(formData.endTime).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update giveaway');
      }

      router.push(`/dashboard/${serverId}/giveaways`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update giveaway');
    } finally {
      setSaving(false);
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
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !giveaway) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  if (!giveaway) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Giveaway</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giveaway Details</CardTitle>
          <CardDescription>
            Modify the giveaway settings. Note that changes will be reflected immediately in Discord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prize" className="block text-sm font-medium mb-2">
                Prize
              </label>
              <Input
                id="prize"
                value={formData.prize}
                onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                placeholder="Enter the prize"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter a description"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="winnerCount" className="block text-sm font-medium mb-2">
                Number of Winners
              </label>
              <Input
                id="winnerCount"
                type="number"
                min="1"
                max="20"
                value={formData.winnerCount}
                onChange={(e) => setFormData(prev => ({ ...prev, winnerCount: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium mb-2">
                End Time
              </label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
                required
                disabled={giveaway.status !== 'active'}
              />
              {giveaway.status !== 'active' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Cannot change end time for {giveaway.status} giveaways
                </p>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}