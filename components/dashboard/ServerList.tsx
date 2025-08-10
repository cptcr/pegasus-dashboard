'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  ExternalLink, 
  Settings,
  CheckCircle,
  XCircle,
  ChevronRight,
  Crown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getBotInviteUrl } from "@/lib/env";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  hasBot: boolean;
  features: string[];
}

interface ServerListProps {
  guilds: Guild[];
  compact?: boolean;
}

export function ServerList({ guilds, compact = false }: ServerListProps) {

  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
      {guilds.map((guild) => (
        <Card 
          key={guild.id} 
          className={`glass ${guild.hasBot ? 'border-green-500/20 hover:border-green-500/40' : 'border-gray-500/20 hover:border-gray-500/40 opacity-75'} hover:scale-105 transition-all duration-300`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {guild.icon ? (
                  <Image
                    src={guild.icon}
                    alt={guild.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{guild.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {guild.owner && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Crown className="h-3 w-3" />
                        Owner
                      </Badge>
                    )}
                    {guild.hasBot ? (
                      <Badge variant="outline" className="text-xs gap-1 text-green-400 border-green-400/50">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs gap-1 text-gray-400 border-gray-400/50">
                        <XCircle className="h-3 w-3" />
                        Not Added
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {guild.features.length > 0 && !compact && (
              <div className="flex flex-wrap gap-1 mb-3">
                {guild.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature.replace(/_/g, ' ').toLowerCase()}
                  </Badge>
                ))}
                {guild.features.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{guild.features.length - 3}
                  </Badge>
                )}
              </div>
            )}
            <div className="flex gap-2">
              {guild.hasBot ? (
                <>
                  <Link href={`/dashboard/${guild.id}`} className="flex-1">
                    <Button className="w-full gap-2" size="sm">
                      <Settings className="h-4 w-4" />
                      Manage
                    </Button>
                  </Link>
                  <Link href={`/dashboard/${guild.id}`}>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <Link 
                  href={getBotInviteUrl(guild.id)} 
                  target="_blank"
                  className="flex-1"
                >
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Invite Bot
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}