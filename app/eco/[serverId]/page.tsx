import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Trophy, TrendingUp, DollarSign, PiggyBank, ShoppingCart } from 'lucide-react';
import { db } from '@/lib/database';
import { economyBalances, economySettings, users, guilds } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

interface PageProps {
  params: {
    serverId: string;
  };
}

export default async function PublicEconomyLeaderboard({ params }: PageProps) {
  const { serverId } = params;

  // Fetch guild info
  const guild = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, serverId))
    .limit(1);

  const guildData = guild[0];
  
  if (!guildData) {
    notFound();
  }

  // Fetch economy settings
  const settings = await db
    .select()
    .from(economySettings)
    .where(eq(economySettings.guildId, serverId))
    .limit(1);

  const economyConfig = settings[0] || {
    currencySymbol: '💰',
    currencyName: 'coins',
    dailyAmount: 100,
    workMinAmount: 50,
    workMaxAmount: 200,
  };

  // Fetch top balances with user details
  const topBalances = await db
    .select({
      userId: economyBalances.userId,
      balance: economyBalances.balance,
      bankBalance: economyBalances.bankBalance,
      totalEarned: economyBalances.totalEarned,
      totalSpent: economyBalances.totalSpent,
      totalGambled: economyBalances.totalGambled,
      username: users.username,
      discriminator: users.discriminator,
      avatarUrl: users.image,
    })
    .from(economyBalances)
    .leftJoin(users, eq(economyBalances.userId, users.id))
    .where(eq(economyBalances.guildId, serverId))
    .orderBy(desc(economyBalances.balance))
    .limit(100);

  const getTrophyIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      default:
        return 'bg-muted';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const totalWealth = topBalances.reduce((acc, user) => 
    acc + Number(user.balance) + Number(user.bankBalance), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Coins className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Economy Leaderboard</CardTitle>
            <CardDescription className="text-lg">
              Top {topBalances.length} richest members
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Economy Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Currency</span>
              </div>
              <p className="text-2xl font-bold">
                {economyConfig.currencySymbol} {economyConfig.currencyName}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Total Wealth</span>
              </div>
              <p className="text-2xl font-bold">
                {economyConfig.currencySymbol} {formatCurrency(totalWealth)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Daily Reward</span>
              </div>
              <p className="text-2xl font-bold">
                {economyConfig.currencySymbol} {economyConfig.dailyAmount}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Wealth Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topBalances.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Coins className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No economy data yet</p>
                <p className="text-sm mt-2">Start earning {economyConfig.currencyName}!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topBalances.map((user, index) => {
                  const position = index + 1;
                  const totalBalance = Number(user.balance) + Number(user.bankBalance);

                  return (
                    <div
                      key={user.userId}
                      className={`relative p-4 rounded-lg border ${
                        position <= 3 ? 'border-2' : ''
                      } ${
                        position === 1 ? 'border-yellow-500' :
                        position === 2 ? 'border-gray-400' :
                        position === 3 ? 'border-orange-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${getRankColor(position)}`}>
                            {getTrophyIcon(position) || position}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">
                                {user.username ? `${user.username}#${user.discriminator}` : 'Unknown User'}
                              </p>
                              {position <= 3 && (
                                <Badge variant="outline" className="text-xs">
                                  {position === 1 ? 'Richest' : position === 2 ? 'Second' : 'Third'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <Coins className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {economyConfig.currencySymbol} {formatCurrency(Number(user.balance))}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <PiggyBank className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  Bank: {economyConfig.currencySymbol} {formatCurrency(Number(user.bankBalance))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {economyConfig.currencySymbol} {formatCurrency(totalBalance)}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Wealth</p>
                        </div>
                      </div>
                      
                      {/* Stats Bar */}
                      <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Earned:</span>
                          <span className="ml-1 font-medium">{formatCurrency(Number(user.totalEarned))}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Spent:</span>
                          <span className="ml-1 font-medium">{formatCurrency(Number(user.totalSpent))}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gambled:</span>
                          <span className="ml-1 font-medium">{formatCurrency(Number(user.totalGambled))}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShoppingCart className="h-4 w-4" />
              <span>Visit the shop to spend your {economyConfig.currencyName}!</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}