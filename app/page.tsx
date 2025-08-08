'use client';

import { Shield, Server, Users, TrendingUp, Zap, ChartColumn, Ticket, Lock, Gift, Sparkles, Rocket, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [stats, setStats] = useState({
    servers: 0,
    users: 0,
    uptime: 0,
    commands: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Animate stats on mount
    const animateValue = (start: number, end: number, duration: number, key: keyof typeof stats) => {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        setStats(prev => ({ ...prev, [key]: value }));
        if (progress === 1) clearInterval(timer);
      }, 50);
    };

    setTimeout(() => {
      setIsLoading(false);
      animateValue(0, 523, 2000, 'servers');
      animateValue(0, 125789, 2500, 'users');
      animateValue(0, 99, 1500, 'uptime');
      animateValue(0, 1250000, 3000, 'commands');
    }, 500);

    // Fetch real stats from API (optional)
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStats(data);
        }
      })
      .catch(() => {
        // Use default animated values
      });
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative glass border-b border-white/10 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-slide-up">
              <div className="relative">
                <Shield className="h-10 w-10 text-purple-400 animate-pulse-glow" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
              <span className="text-3xl font-bold gradient-text">Pegasus Bot</span>
            </div>
            <div className="flex items-center space-x-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/docs">
                <Button variant="ghost" className="hover:bg-purple-500/20 hover:text-purple-400 transition-all">
                  <Star className="mr-2 h-4 w-4" />
                  Documentation
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 transition-all animate-pulse-glow">
                  <Rocket className="mr-2 h-4 w-4" />
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block animate-bounce-in mb-4">
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold">
              ✨ The Ultimate Discord Bot Experience
            </span>
          </div>
          <h1 className="text-7xl font-bold mb-6 animate-slide-up">
            <span className="gradient-text">Powerful Discord Bot</span>
            <br />
            <span className="text-white">Management Made</span>{' '}
            <span className="neon-purple">Fun</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Take control of your Discord server with advanced moderation, economy, XP systems, 
            and more - all wrapped in a beautiful, intuitive dashboard.
          </p>
          <div className="flex gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-6 shadow-2xl hover:shadow-purple-500/25 transition-all hover-lift rainbow-border">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Now
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all hover-lift">
                <Gift className="mr-2 h-5 w-5 text-purple-400" />
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Server, label: 'Active Servers', value: stats.servers.toLocaleString() + '+', color: 'purple', delay: '0s' },
            { icon: Users, label: 'Total Users', value: stats.users.toLocaleString() + '+', color: 'pink', delay: '0.1s' },
            { icon: TrendingUp, label: 'Uptime', value: stats.uptime + '.9%', color: 'blue', delay: '0.2s' },
            { icon: Zap, label: 'Commands Run', value: stats.commands.toLocaleString() + '+', color: 'green', delay: '0.3s' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="glass rounded-2xl p-6 border border-white/10 hover-lift animate-slide-up"
              style={{ animationDelay: stat.delay }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 mb-4`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
              </div>
              <h3 className="text-4xl font-bold mb-2 text-white">
                {isLoading ? (
                  <span className="inline-block w-24 h-8 bg-gray-700 rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </h3>
              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative container mx-auto px-4 py-20">
        <h2 className="text-5xl font-bold text-center mb-4 gradient-text animate-slide-up">
          Core Features
        </h2>
        <p className="text-center text-gray-400 mb-12 text-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Everything you need to manage your Discord server like a pro
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { 
              icon: Shield, 
              title: 'Advanced Moderation', 
              desc: 'Comprehensive warning system, auto-moderation, and detailed audit logs.',
              gradient: 'from-purple-500 to-indigo-500',
              delay: '0s'
            },
            { 
              icon: TrendingUp, 
              title: 'XP & Leveling', 
              desc: 'Engage your community with customizable XP systems and rewards.',
              gradient: 'from-pink-500 to-rose-500',
              delay: '0.1s'
            },
            { 
              icon: ChartColumn, 
              title: 'Economy System', 
              desc: 'Virtual currency, custom shop items, and transaction tracking.',
              gradient: 'from-blue-500 to-cyan-500',
              delay: '0.2s'
            },
            { 
              icon: Ticket, 
              title: 'Ticket System', 
              desc: 'Professional support ticket management with transcripts.',
              gradient: 'from-green-500 to-emerald-500',
              delay: '0.3s'
            },
            { 
              icon: Lock, 
              title: 'Security Center', 
              desc: 'Blacklist management, security logs, and protection features.',
              gradient: 'from-orange-500 to-red-500',
              delay: '0.4s'
            },
            { 
              icon: Gift, 
              title: 'Giveaways', 
              desc: 'Create engaging giveaways with requirements and bonuses.',
              gradient: 'from-yellow-500 to-amber-500',
              delay: '0.5s'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group glass rounded-2xl p-8 border border-white/10 hover-lift animate-slide-up relative overflow-hidden"
              style={{ animationDelay: feature.delay }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white group-hover:gradient-text transition-all">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="glass rounded-3xl p-12 text-center border border-purple-500/20 animate-slide-up rainbow-border">
          <h2 className="text-5xl font-bold mb-4 gradient-text">
            Ready to Transform Your Server?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of server owners who trust Pegasus Bot to manage their communities
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white text-lg px-10 py-6 shadow-2xl hover:shadow-purple-500/25 transition-all animate-gradient hover-lift">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative glass border-t border-white/10 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-purple-400" />
              <span className="text-lg font-semibold gradient-text">Pegasus Bot</span>
            </div>
            <div className="flex space-x-6">
              <Link className="text-gray-400 hover:text-purple-400 transition-colors" href="/docs">
                Documentation
              </Link>
              <Link className="text-gray-400 hover:text-purple-400 transition-colors" href="/dashboard">
                Dashboard
              </Link>
              <Link className="text-gray-400 hover:text-purple-400 transition-colors" href="/login">
                Login
              </Link>
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-gray-500">
            © 2024 Pegasus Bot. Made with 💜 for Discord communities.
          </div>
        </div>
      </footer>
    </div>
  );
}