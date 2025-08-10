'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, Settings, ShoppingCart, TrendingUp, Plus, 
  Edit, Trash2, Save, DollarSign 
} from 'lucide-react';
import type { 
  EconomySettings, 
  EconomyShopItem, 
  EconomyBalance 
} from '@/lib/db/economy';

interface EconomyData {
  settings: EconomySettings;
  shopItems: EconomyShopItem[];
  topBalances: EconomyBalance[];
}

export default function EconomyPage() {
  const params = useParams();
  const serverId = params['serverId'] as string;
  
  const [data, setData] = useState<EconomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<Partial<EconomySettings>>({});
  const [shopItems, setShopItems] = useState<EconomyShopItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 100,
    type: 'custom' as const,
    stock: -1,
  });
  const [editingItem, setEditingItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/guilds/${serverId}/economy`);
        if (!response.ok) {
          throw new Error('Failed to fetch economy data');
        }
        
        const economyData = await response.json();
        setData(economyData);
        
        if (economyData.settings) {
          setSettings(economyData.settings);
        }
        if (economyData.shopItems) {
          setShopItems(economyData.shopItems);
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
      
      const response = await fetch(`/api/guilds/${serverId}/economy/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      alert('Settings saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch(`/api/guilds/${serverId}/economy/shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          guildId: serverId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const item = await response.json();
      setShopItems([...shopItems, item]);
      setNewItem({
        name: '',
        description: '',
        price: 100,
        type: 'custom',
        stock: -1,
      });
      alert('Item added successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<EconomyShopItem>) => {
    try {
      const response = await fetch(`/api/guilds/${serverId}/economy/shop/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();
      setShopItems(shopItems.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      setEditingItem(null);
      alert('Item updated successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/guilds/${serverId}/economy/shop/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setShopItems(shopItems.filter(item => item.id !== itemId));
      alert('Item deleted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete item');
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Coins className="h-6 w-6" />
          Economy Management
        </h1>
        <Button 
          onClick={() => window.open(`/eco/${serverId}`, '_blank')}
          variant="outline"
        >
          View Public Leaderboard
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="shop">Shop Items</TabsTrigger>
          <TabsTrigger value="balances">Top Balances</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Economy Settings
              </CardTitle>
              <CardDescription>
                Configure currency, amounts, and cooldowns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currency Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium">Currency</h3>
                  <div>
                    <label className="text-sm font-medium">Symbol</label>
                    <Input
                      value={settings.currencySymbol || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, currencySymbol: e.target.value }))}
                      placeholder="💰"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={settings.currencyName || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, currencyName: e.target.value }))}
                      placeholder="coins"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Starting Balance</label>
                    <Input
                      type="number"
                      value={settings.startingBalance || 100}
                      onChange={(e) => setSettings(prev => ({ ...prev, startingBalance: parseInt(e.target.value) || 100 }))}
                    />
                  </div>
                </div>

                {/* Daily Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium">Daily Rewards</h3>
                  <div>
                    <label className="text-sm font-medium">Daily Amount</label>
                    <Input
                      type="number"
                      value={settings.dailyAmount || 100}
                      onChange={(e) => setSettings(prev => ({ ...prev, dailyAmount: parseInt(e.target.value) || 100 }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Daily Streak</label>
                    <Switch
                      checked={settings.dailyStreak ?? false}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dailyStreak: checked }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Streak Bonus</label>
                    <Input
                      type="number"
                      value={settings.dailyStreakBonus || 10}
                      onChange={(e) => setSettings(prev => ({ ...prev, dailyStreakBonus: parseInt(e.target.value) || 10 }))}
                      disabled={!settings.dailyStreak}
                    />
                  </div>
                </div>

                {/* Work Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium">Work Command</h3>
                  <div>
                    <label className="text-sm font-medium">Min Amount</label>
                    <Input
                      type="number"
                      value={settings.workMinAmount || 50}
                      onChange={(e) => setSettings(prev => ({ ...prev, workMinAmount: parseInt(e.target.value) || 50 }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Amount</label>
                    <Input
                      type="number"
                      value={settings.workMaxAmount || 200}
                      onChange={(e) => setSettings(prev => ({ ...prev, workMaxAmount: parseInt(e.target.value) || 200 }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cooldown (seconds)</label>
                    <Input
                      type="number"
                      value={settings.workCooldown || 3600}
                      onChange={(e) => setSettings(prev => ({ ...prev, workCooldown: parseInt(e.target.value) || 3600 }))}
                    />
                  </div>
                </div>

                {/* Gambling Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium">Gambling</h3>
                  <div>
                    <label className="text-sm font-medium">Min Bet</label>
                    <Input
                      type="number"
                      value={settings.minBet || 10}
                      onChange={(e) => setSettings(prev => ({ ...prev, minBet: parseInt(e.target.value) || 10 }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Bet</label>
                    <Input
                      type="number"
                      value={settings.maxBet || 10000}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxBet: parseInt(e.target.value) || 10000 }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shop Items Tab */}
        <TabsContent value="shop">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shop Items
              </CardTitle>
              <CardDescription>
                Manage items available for purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Item */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium">Add New Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: parseInt(e.target.value) || 100 }))}
                  />
                </div>
                <textarea
                  placeholder="Item description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as any }))}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="custom">Custom</option>
                    <option value="protection">Protection</option>
                    <option value="booster">Booster</option>
                    <option value="role">Role</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Stock (-1 for unlimited)"
                    value={newItem.stock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, stock: parseInt(e.target.value) || -1 }))}
                  />
                </div>
                <Button onClick={handleAddItem} disabled={!newItem.name || !newItem.description}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {shopItems.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    {editingItem === item.id ? (
                      <div className="space-y-3">
                        <Input
                          value={item.name}
                          onChange={(e) => setShopItems(items => 
                            items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                          )}
                        />
                        <textarea
                          value={item.description}
                          onChange={(e) => setShopItems(items => 
                            items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i)
                          )}
                          className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateItem(item.id, item)}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingItem(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge variant="secondary">{item.type}</Badge>
                            {item.enabled ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="destructive">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {item.price}
                            </span>
                            <span>Stock: {item.stock === -1 ? 'Unlimited' : item.stock}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setEditingItem(item.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {shopItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No shop items yet</p>
                    <p className="text-sm mt-2">Add items for users to purchase</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Balances Tab */}
        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Balances
              </CardTitle>
              <CardDescription>
                Richest users in the server
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.topBalances && data.topBalances.length > 0 ? (
                <div className="space-y-3">
                  {data.topBalances.map((balance, index) => (
                    <div key={balance.userId} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">User ID: {balance.userId}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">
                              {settings.currencySymbol} {balance.balance}
                            </Badge>
                            <Badge variant="outline">
                              Bank: {settings.currencySymbol} {balance.bankBalance}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Earned: {balance.totalEarned}</div>
                        <div>Spent: {balance.totalSpent}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No economy data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}