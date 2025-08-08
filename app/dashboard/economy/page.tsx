import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, Dice1 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function EconomyPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Economy Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">Server economy total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shop Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gambled</CardTitle>
            <Dice1 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Shop Items</CardTitle>
              <Button>Add Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Available item types:</p>
              <ul className="text-sm space-y-1">
                <li>• <strong>Role Items</strong> - Grant Discord roles</li>
                <li>• <strong>Boost Items</strong> - XP/Work/Luck boosts</li>
                <li>• <strong>Protection</strong> - Rob protection</li>
                <li>• <strong>Special Access</strong> - Bank access, custom perks</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">No items configured yet.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gambling Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Slots</p>
                <p className="text-xs text-muted-foreground">Played: 0 | Won: 0</p>
              </div>
              <div>
                <p className="text-sm font-medium">Blackjack</p>
                <p className="text-xs text-muted-foreground">Played: 0 | Won: 0</p>
              </div>
              <div>
                <p className="text-sm font-medium">Dice</p>
                <p className="text-xs text-muted-foreground">Played: 0 | Won: 0</p>
              </div>
              <div>
                <p className="text-sm font-medium">Coinflip</p>
                <p className="text-xs text-muted-foreground">Played: 0 | Won: 0</p>
              </div>
              <div>
                <p className="text-sm font-medium">Roulette</p>
                <p className="text-xs text-muted-foreground">Played: 0 | Won: 0</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Profit</p>
                <p className="text-xs text-muted-foreground">$0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Economy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Currency Symbol</label>
                <p className="text-sm text-muted-foreground">$</p>
              </div>
              <div>
                <label className="text-sm font-medium">Currency Name</label>
                <p className="text-sm text-muted-foreground">Coins</p>
              </div>
              <div>
                <label className="text-sm font-medium">Starting Balance</label>
                <p className="text-sm text-muted-foreground">Wallet: $100 | Bank: $0</p>
              </div>
              <div>
                <label className="text-sm font-medium">Daily Reward</label>
                <p className="text-sm text-muted-foreground">Base: $100-500 | Streak Bonus: +10%/day</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Work Rewards</label>
                <p className="text-sm text-muted-foreground">$100-1000 per work</p>
              </div>
              <div>
                <label className="text-sm font-medium">Work Cooldown</label>
                <p className="text-sm text-muted-foreground">30 minutes</p>
              </div>
              <div>
                <label className="text-sm font-medium">Rob Settings</label>
                <p className="text-sm text-muted-foreground">Min: $500 | Success: 30-70%</p>
              </div>
              <div>
                <label className="text-sm font-medium">Rob Protection Cost</label>
                <p className="text-sm text-muted-foreground">$5000 for 24 hours</p>
              </div>
            </div>
          </div>
          <Button className="mt-4" variant="outline">Edit Settings</Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent transactions. Transaction history will appear here.</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Earners</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No users with balances yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}