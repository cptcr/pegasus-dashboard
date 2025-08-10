import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, Users, Trophy, Calendar, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/database';
import { giveaways, giveawayEntries, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface PageProps {
  params: {
    serverId: string;
    giveawayId: string;
  };
}

export default async function PublicGiveawayPage({ params }: PageProps) {
  const { serverId, giveawayId } = params;

  // Fetch giveaway data
  const giveaway = await db
    .select()
    .from(giveaways)
    .where(and(
      eq(giveaways.guildId, serverId),
      eq(giveaways.giveawayId, giveawayId)
    ))
    .limit(1);

  const giveawayData = giveaway[0];
  
  if (!giveawayData) {
    notFound();
  }

  // Fetch entries with user details
  const entries = await db
    .select({
      userId: giveawayEntries.userId,
      entries: giveawayEntries.entries,
      joinedAt: giveawayEntries.joinedAt,
      username: users.username,
      discriminator: users.discriminator,
    })
    .from(giveawayEntries)
    .leftJoin(users, eq(giveawayEntries.userId, users.id))
    .where(eq(giveawayEntries.giveawayId, giveawayId));

  // Fetch host details
  const host = await db
    .select({
      username: users.username,
      discriminator: users.discriminator,
    })
    .from(users)
    .where(eq(users.id, giveawayData.hostedBy))
    .limit(1);

  const hostName = host[0] ? `${host[0].username}#${host[0].discriminator}` : 'Unknown';

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

  const requirements = giveawayData.requirements as any || {};
  const bonusEntries = giveawayData.bonusEntries as any || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Gift className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">{giveawayData.prize}</CardTitle>
            {giveawayData.description && (
              <CardDescription className="text-lg">{giveawayData.description}</CardDescription>
            )}
            <Badge className={`${getStatusColor(giveawayData.status)} text-white px-3 py-1`}>
              {giveawayData.status.toUpperCase()}
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Giveaway Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">End Time</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {giveawayData.status === 'active' 
                      ? `Ends ${formatDistanceToNow(new Date(giveawayData.endTime), { addSuffix: true })}`
                      : `Ended ${format(new Date(giveawayData.endedAt || giveawayData.endTime), 'PPp')}`
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Total Entries</span>
                  </div>
                  <p className="text-2xl font-bold">{giveawayData.entries}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Winners</span>
                  </div>
                  <p className="text-2xl font-bold">{giveawayData.winnerCount}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Hosted By</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{hostName}</p>
                </CardContent>
              </Card>
            </div>

            {/* Requirements */}
            {requirements && Object.keys(requirements).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Entry Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {requirements.minLevel && (
                      <li className="text-sm">Minimum Level: {requirements.minLevel}</li>
                    )}
                    {requirements.requiredRoles && requirements.requiredRoles.length > 0 && (
                      <li className="text-sm">Required Roles: {requirements.requiredRoles.join(', ')}</li>
                    )}
                    {requirements.minMessages && (
                      <li className="text-sm">Minimum Messages: {requirements.minMessages}</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Bonus Entries */}
            {bonusEntries && Object.keys(bonusEntries).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bonus Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {bonusEntries && Object.entries(bonusEntries).map(([role, multiplier]) => (
                      <li key={role} className="text-sm">
                        Role {role}: {String(multiplier)}x entries
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Winners */}
            {giveawayData.winners && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Winners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(giveawayData.winners) && (giveawayData.winners as string[]).map((winnerId, index) => (
                      <div key={winnerId} className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Winner #{index + 1}: {winnerId}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Participants ({entries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No entries yet
                  </p>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {entries.map((entry) => (
                      <div key={entry.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {entry.username ? `${entry.username}#${entry.discriminator}` : 'Unknown User'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{entry.entries} entries</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.joinedAt), 'PPp')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Started Date */}
            <div className="text-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-2" />
              Started {format(new Date(giveawayData.createdAt), 'PPPp')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}