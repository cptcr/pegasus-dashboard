'use client';

import { useState } from 'react';
import { 
  Shield, TrendingUp, ChartColumn, Ticket, Lock, Gift, 
  Users, Settings, BarChart3, MessageSquare, Star, Zap,
  CheckCircle, ArrowRight
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay: string;
  badge?: string;
  features?: string[];
}

interface FeatureCardProps extends Feature {
  index: number;
}

function FeatureCard({ icon: Icon, title, description, gradient, delay, badge, features }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card
      className="group glass rounded-2xl p-8 border border-white/10 hover-lift animate-slide-up relative overflow-hidden transition-all duration-300 hover:border-purple-500/30"
      style={{ animationDelay: delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setShowDetails(!showDetails)}
      role="article"
      aria-label={`${title} feature`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setShowDetails(!showDetails);
        }
      }}
    >
      {/* Background gradient on hover */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} 
        aria-hidden="true"
      />
      
      {/* Badge */}
      {badge && (
        <Badge 
          className="absolute top-4 right-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30"
          aria-label={badge}
        >
          {badge}
        </Badge>
      )}

      {/* Icon */}
      <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} mb-6 transform transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
        <Icon className="h-8 w-8 text-white" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-semibold mb-3 text-white group-hover:gradient-text transition-all">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors mb-4">
        {description}
      </p>

      {/* Feature list (expandable) */}
      {features && features.length > 0 && (
        <div className={`overflow-hidden transition-all duration-300 ${showDetails ? 'max-h-48' : 'max-h-0'}`}>
          <ul className="space-y-2 mt-4 pt-4 border-t border-white/10">
            {features.map((feature, _idx) => (
              <li key={_idx} className="flex items-start gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Learn more indicator */}
      <div className="mt-4 flex items-center gap-2 text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Click to {showDetails ? 'hide' : 'view'} details</span>
        <ArrowRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} aria-hidden="true" />
      </div>
    </Card>
  );
}

function FeaturesContent() {
  const mainFeatures: Feature[] = [
    { 
      icon: Shield, 
      title: 'Advanced Moderation', 
      description: 'Comprehensive warning system with automated actions, detailed audit logs, and intelligent anti-spam protection.',
      gradient: 'from-purple-500 to-indigo-500',
      delay: '0s',
      badge: 'Popular',
      features: [
        'Automated warning thresholds',
        'Custom moderation rules',
        'Detailed audit trails',
        'Anti-spam & raid protection'
      ]
    },
    { 
      icon: TrendingUp, 
      title: 'XP & Leveling', 
      description: 'Engage your community with a fully customizable XP system, role rewards, and leaderboards.',
      gradient: 'from-pink-500 to-rose-500',
      delay: '0.1s',
      features: [
        'Custom XP rates per channel',
        'Role-based multipliers',
        'Level-up rewards',
        'Public leaderboards'
      ]
    },
    { 
      icon: ChartColumn, 
      title: 'Economy System', 
      description: 'Virtual currency management with custom shop items, gambling features, and transaction tracking.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: '0.2s',
      badge: 'Enhanced',
      features: [
        'Custom currency',
        'Shop management',
        'Gambling games',
        'Transaction history'
      ]
    },
    { 
      icon: Ticket, 
      title: 'Ticket System', 
      description: 'Professional support ticket management with transcripts, categories, and staff assignments.',
      gradient: 'from-green-500 to-emerald-500',
      delay: '0.3s',
      features: [
        'Custom ticket panels',
        'Auto-transcripts',
        'Staff assignments',
        'Category organization'
      ]
    },
    { 
      icon: Lock, 
      title: 'Security Center', 
      description: 'Advanced security features including blacklist management, security logs, and API protection.',
      gradient: 'from-orange-500 to-red-500',
      delay: '0.4s',
      badge: 'Secure',
      features: [
        'User blacklisting',
        'Security event logs',
        'API key management',
        'Rate limit protection'
      ]
    },
    { 
      icon: Gift, 
      title: 'Giveaways', 
      description: 'Create engaging giveaways with requirements, multiple winners, and bonus entries.',
      gradient: 'from-yellow-500 to-amber-500',
      delay: '0.5s',
      features: [
        'Multiple winner support',
        'Entry requirements',
        'Bonus entry system',
        'Public giveaway pages'
      ]
    }
  ];

  const additionalFeatures: Feature[] = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Comprehensive member tracking and management tools.',
      gradient: 'from-violet-500 to-purple-500',
      delay: '0.6s'
    },
    {
      icon: Settings,
      title: 'Auto-Configuration',
      description: 'Smart bot configuration with preset templates.',
      gradient: 'from-teal-500 to-green-500',
      delay: '0.7s'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Detailed server analytics and growth tracking.',
      gradient: 'from-indigo-500 to-blue-500',
      delay: '0.8s'
    },
    {
      icon: MessageSquare,
      title: 'Auto-Response',
      description: 'Custom automated responses and welcome messages.',
      gradient: 'from-rose-500 to-pink-500',
      delay: '0.9s'
    },
    {
      icon: Star,
      title: 'Reputation System',
      description: 'Member reputation tracking and rewards.',
      gradient: 'from-amber-500 to-orange-500',
      delay: '1s'
    },
    {
      icon: Zap,
      title: 'Quick Actions',
      description: 'One-click moderation and management actions.',
      gradient: 'from-lime-500 to-green-500',
      delay: '1.1s'
    }
  ];

  return (
    <section className="relative container mx-auto px-4 py-20" role="region" aria-label="Feature highlights">
      {/* Section header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4 animate-slide-up">
          Powerful Features
        </h2>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Everything you need to manage your Discord server like a pro. 
          From moderation to engagement, we've got you covered.
        </p>
      </div>
      
      {/* Main features grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {mainFeatures.map((feature, _index) => (
          <FeatureCard
            key={_index}
            index={_index}
            {...feature}
          />
        ))}
      </div>

      {/* Additional features - smaller cards */}
      <div className="mt-16">
        <h3 className="text-2xl font-semibold text-center text-gray-300 mb-8">
          And Much More...
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {additionalFeatures.map((feature, _index) => (
            <Card
              key={_index}
              className="glass rounded-xl p-4 border border-white/10 hover-lift animate-slide-up text-center group"
              style={{ animationDelay: feature.delay }}
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} mb-3 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
              <p className="text-xs text-gray-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature comparison or highlight */}
      <div className="mt-16 p-8 glass rounded-3xl border border-purple-500/20 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Why Choose Pegasus Bot?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div>
            <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
            <p className="text-gray-400">Uptime Guaranteed</p>
          </div>
          <div>
            <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
            <p className="text-gray-400">Support Available</p>
          </div>
          <div>
            <div className="text-4xl font-bold gradient-text mb-2">0</div>
            <p className="text-gray-400">Setup Complexity</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureErrorFallback(_error?: Error, retry?: () => void): ReactNode {
  return (
    <section className="relative container mx-auto px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-400 mb-4">Features Section</h2>
        <p className="text-gray-500 mb-6">{_error?.message || 'Unable to load features'}</p>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </section>
  );
}

export function FeatureHighlights() {
  return (
    <ErrorBoundary fallback={FeatureErrorFallback}>
      <FeaturesContent />
    </ErrorBoundary>
  );
}