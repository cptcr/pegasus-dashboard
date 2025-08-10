'use client';

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Shield,
  DollarSign,
  Ticket,
  TrendingUp,
  Gift,
  Settings,
  Users,
  Bell,
  FileText,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Server
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  serverId: string;
  serverName?: string;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
}

export function DashboardLayout({ children, serverId, serverName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      title: "Overview",
      href: `/dashboard/${serverId}`,
      icon: Home,
      description: "Server dashboard"
    },
    {
      title: "Moderation",
      href: `/dashboard/${serverId}/moderation`,
      icon: Shield,
      description: "Warns, bans & filters"
    },
    {
      title: "Economy",
      href: `/dashboard/${serverId}/economy`,
      icon: DollarSign,
      description: "Shop & currency"
    },
    {
      title: "Tickets",
      href: `/dashboard/${serverId}/tickets`,
      icon: Ticket,
      description: "Support system"
    },
    {
      title: "XP System",
      href: `/dashboard/${serverId}/xp`,
      icon: TrendingUp,
      description: "Levels & rewards"
    },
    {
      title: "Giveaways",
      href: `/dashboard/${serverId}/giveaways`,
      icon: Gift,
      description: "Manage giveaways"
    },
    {
      title: "Members",
      href: `/dashboard/${serverId}/members`,
      icon: Users,
      description: "Member management"
    },
    {
      title: "Settings",
      href: `/dashboard/${serverId}/settings`,
      icon: Settings,
      description: "Bot configuration"
    },
    {
      title: "Notifications",
      href: `/dashboard/${serverId}/notifications`,
      icon: Bell,
      description: "Alert settings"
    },
    {
      title: "Audit Logs",
      href: `/dashboard/${serverId}/logs`,
      icon: FileText,
      description: "Server logs"
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative flex flex-col h-full bg-card border-r transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Server Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Link 
              href={`/dashboard/${serverId}`}
              className={cn(
                "flex items-center gap-2 hover:opacity-80 transition-opacity",
                collapsed && "justify-center"
              )}
            >
              <Server className="h-6 w-6 text-purple-400 flex-shrink-0" />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {serverName || 'Server Dashboard'}
                  </p>
                  <p className="text-xs text-gray-400">ID: {serverId}</p>
                </div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn("hidden md:flex", collapsed && "ml-0")}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground font-medium",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-sm truncate">{item.title}</p>
                    {item.description && !isActive && (
                      <p className="text-xs text-gray-400 truncate">{item.description}</p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to Servers */}
        <div className="p-3 border-t">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-2",
                collapsed && "justify-center px-2"
              )}
            >
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>Back to Servers</span>}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}