'use client';

import { Card, CardContent } from "@/components/ui/card";
import { 
  Settings, 
  Shield, 
  Users,
  ExternalLink,
  Bell,
  FileText
} from "lucide-react";
import Link from "next/link";
import { getBotInviteUrl } from "@/lib/env";

interface QuickActionsProps {
  serverId: string;
}

export function QuickActions({ serverId }: QuickActionsProps) {
  const actions = [
    {
      title: "Server Settings",
      description: "Configure bot settings",
      icon: Settings,
      href: `/dashboard/${serverId}/settings`,
      color: "purple"
    },
    {
      title: "Moderation",
      description: "Manage moderation",
      icon: Shield,
      href: `/dashboard/${serverId}/moderation`,
      color: "red"
    },
    {
      title: "Member Management",
      description: "View & manage members",
      icon: Users,
      href: `/dashboard/${serverId}/members`,
      color: "blue"
    },
    {
      title: "Notifications",
      description: "Configure alerts",
      icon: Bell,
      href: `/dashboard/${serverId}/notifications`,
      color: "yellow"
    },
    {
      title: "Audit Logs",
      description: "View server logs",
      icon: FileText,
      href: `/dashboard/${serverId}/logs`,
      color: "green"
    },
    {
      title: "Bot Invite",
      description: "Re-invite the bot",
      icon: ExternalLink,
      href: getBotInviteUrl(serverId),
      external: true,
      color: "pink"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: "border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/20",
      red: "border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/20",
      blue: "border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/20",
      yellow: "border-yellow-500/20 hover:border-yellow-500/40 hover:shadow-yellow-500/20",
      green: "border-green-500/20 hover:border-green-500/40 hover:shadow-green-500/20",
      pink: "border-pink-500/20 hover:border-pink-500/40 hover:shadow-pink-500/20"
    };
    return colors[color] || colors['purple'];
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      purple: "text-purple-400",
      red: "text-red-400",
      blue: "text-blue-400",
      yellow: "text-yellow-400",
      green: "text-green-400",
      pink: "text-pink-400"
    };
    return colors[color] || "text-purple-400";
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <Card className={`glass ${getColorClasses(action.color)} hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-xl`}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${getIconColor(action.color)}`} />
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-gray-400 mt-1">{action.description}</p>
              </CardContent>
            </Card>
          );

          if (action.external) {
            return (
              <Link key={action.title} href={action.href} target="_blank">
                {content}
              </Link>
            );
          }

          return (
            <Link key={action.title} href={action.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}