"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Shield,
  LayoutDashboard,
  Server,
  Users,
  TrendingUp,
  DollarSign,
  Ticket,
  Lock,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Gift,
  Menu,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Servers",
    href: "/dashboard/servers",
    icon: Server,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Moderation",
    href: "/dashboard/moderation",
    icon: Shield,
  },
  {
    title: "XP System",
    href: "/dashboard/xp",
    icon: TrendingUp,
  },
  {
    title: "Economy",
    href: "/dashboard/economy",
    icon: DollarSign,
  },
  {
    title: "Giveaways",
    href: "/dashboard/giveaways",
    icon: Gift,
  },
  {
    title: "Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
  },
  {
    title: "Security",
    href: "/dashboard/security",
    icon: Lock,
  },
  {
    title: "Documentation",
    href: "/docs",
    icon: FileText,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:relative flex flex-col h-full bg-card border-r transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center space-x-2",
            collapsed && "justify-center"
          )}>
            <Shield className="h-8 w-8 text-primary flex-shrink-0" />
            {!collapsed && <span className="text-xl font-bold">Pegasus</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(collapsed && "ml-0")}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            collapsed && "justify-center px-2"
          )}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5 mr-2 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
      </div>
    </>
  );
}