import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  Server, 
  TrendingUp, 
  Zap, 
  Lock,
  BarChart3,
  Ticket
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Pegasus Bot</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/docs">
                <Button variant="ghost">Documentation</Button>
              </Link>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Powerful Discord Bot Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Take control of your Discord server with advanced moderation, economy, XP systems, and more.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg p-6 border">
            <Server className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-3xl font-bold mb-2">500+</h3>
            <p className="text-muted-foreground">Active Servers</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <Users className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-3xl font-bold mb-2">100K+</h3>
            <p className="text-muted-foreground">Total Users</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <TrendingUp className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-3xl font-bold mb-2">99.9%</h3>
            <p className="text-muted-foreground">Uptime</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <Zap className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-3xl font-bold mb-2">24/7</h3>
            <p className="text-muted-foreground">Support</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg p-6 border hover:shadow-lg transition-shadow">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Advanced Moderation</h3>
            <p className="text-muted-foreground">
              Comprehensive warning system, auto-moderation, and detailed audit logs to keep your server safe.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border hover:shadow-lg transition-shadow">
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">XP & Leveling</h3>
            <p className="text-muted-foreground">
              Engage your community with customizable XP systems, level rewards, and leaderboards.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border hover:shadow-lg transition-shadow">
            <BarChart3 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Economy System</h3>
            <p className="text-muted-foreground">
              Virtual currency, custom shop items, and transaction tracking for your server economy.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border hover:shadow-lg transition-shadow">
            <Ticket className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ticket System</h3>
            <p className="text-muted-foreground">
              Professional support ticket management with transcripts and customizable panels.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border hover:shadow-lg transition-shadow">
            <Lock className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Security Center</h3>
            <p className="text-muted-foreground">
              Blacklist management, security logs, and advanced protection features.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border hover:shadow-lg transition-shadow">
            <Server className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Server Management</h3>
            <p className="text-muted-foreground">
              Centralized dashboard to manage all your Discord servers in one place.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Pegasus Bot</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/docs" className="text-muted-foreground hover:text-primary">
                Documentation
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
                Dashboard
              </Link>
              <Link href="/login" className="text-muted-foreground hover:text-primary">
                Login
              </Link>
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-muted-foreground">
            © 2024 Pegasus Bot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}