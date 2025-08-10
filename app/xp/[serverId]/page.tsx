import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy, Award, Star } from 'lucide-react';
import { db } from '@/lib/database';
import { userXp, xpSettings, users, guilds } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

interface PageProps {
  params: {
    serverId: string;
  };
}

export default async function PublicXpLeaderboard({ params }: PageProps) {
  const serverId = params['serverId'];

  // Fetch guild info
  const guild = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, serverId))
    .limit(1);

  if (!guild || guild.length === 0) {
    notFound();
  }

  const guildData = guild[0]!;

  // Fetch XP settings
  const settings = await db
    .select()
    .from(xpSettings)
    .where(eq(xpSettings.guildId, serverId))
    .limit(1);

  const xpConfig = settings[0] || {
    levelUpRewardsEnabled: true,
    stackRoleRewards: false,
  };

  // Fetch top users with XP
  const topUsers = await db
    .select({
      userId: userXp.userId,
      xp: userXp.xp,
      level: userXp.level,
      username: users.username,
      discriminator: users.discriminator,
      avatarUrl: users.image,
    })
    .from(userXp)
    .leftJoin(users, eq(userXp.userId, users.id))
    .where(eq(userXp.guildId, serverId))
    .orderBy(desc(userXp.xp))
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

  const calculateXpForNextLevel = (level: number) => {
    return level * 100 + 50;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <TrendingUp className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">{(guildData as any)?.name || 'Server'} XP Leaderboard</CardTitle>
            <CardDescription className="text-lg">
              Top {topUsers.length} members by experience points
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Configuration Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              XP System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium">Level Up Rewards</span>
                <Badge variant={xpConfig.levelUpRewardsEnabled ? 'default' : 'secondary'}>
                  {xpConfig.levelUpRewardsEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium">Stack Role Rewards</span>
                <Badge variant={xpConfig.stackRoleRewards ? 'default' : 'secondary'}>
                  {xpConfig.stackRoleRewards ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No users with XP yet</p>
                <p className="text-sm mt-2">Start chatting to earn XP!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topUsers.map((user, index) => {
                  const position = index + 1;
                  const nextLevelXp = calculateXpForNextLevel(user.level);
                  const currentLevelXp = user.level > 0 ? calculateXpForNextLevel(user.level - 1) : 0;
                  const progressXp = user.xp - currentLevelXp;
                  const progressPercent = Math.min((progressXp / (nextLevelXp - currentLevelXp)) * 100, 100);

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
                                  {position === 1 ? 'Champion' : position === 2 ? 'Runner-up' : 'Third Place'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="secondary">Level {user.level}</Badge>
                              <span className="text-sm text-muted-foreground">{user.xp} XP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* XP Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress to Level {user.level + 1}</span>
                          <span>{progressXp} / {nextLevelXp - currentLevelXp}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}