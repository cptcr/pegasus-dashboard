'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Users, Shield, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

function Testimonial({ quote, author, role, rating }: TestimonialProps) {
  return (
    <Card className="glass p-6 rounded-xl border border-white/10">
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-gray-300 mb-4 italic">"{quote}"</p>
      <div>
        <p className="text-white font-semibold">{author}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </Card>
  );
}

function CTAContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isHovered) {
        const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect();
        if (rect) {
          setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      }
    };

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
    
    return;
  }, [isHovered]);

  const testimonials: TestimonialProps[] = [
    {
      quote: "Pegasus Bot transformed how we manage our 10k+ member server. The automation features alone saved us hours daily.",
      author: "Alex Chen",
      role: "Community Manager",
      rating: 5
    },
    {
      quote: "The most intuitive Discord bot dashboard I've ever used. Setup took minutes, not hours.",
      author: "Sarah Williams",
      role: "Server Owner",
      rating: 5
    },
    {
      quote: "Exceptional uptime and performance. Our community engagement increased by 300% after implementing the XP system.",
      author: "Mike Johnson",
      role: "Gaming Community Lead",
      rating: 5
    }
  ];

  return (
    <section className="relative container mx-auto px-4 py-20" role="region" aria-label="Call to action">
      {/* Testimonials */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center gradient-text mb-8">
          Trusted by Server Owners
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, _index) => (
            <div
              key={_index}
              className="animate-slide-up"
              style={{ animationDelay: `${_index * 0.1}s` }}
            >
              <Testimonial {...testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Main CTA */}
      <div
        className="relative glass rounded-3xl p-12 text-center border border-purple-500/20 animate-slide-up rainbow-border overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="banner"
      >
        {/* Interactive background effect */}
        {isHovered && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: mousePosition.x - 150,
              top: mousePosition.y - 150,
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.3s',
            }}
            aria-hidden="true"
          />
        )}

        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Users className="absolute top-10 left-10 w-8 h-8 text-purple-400/20 animate-float" />
          <Shield className="absolute top-20 right-20 w-10 h-10 text-pink-400/20 animate-float" style={{ animationDelay: '2s' }} />
          <Zap className="absolute bottom-10 left-1/3 w-6 h-6 text-blue-400/20 animate-float" style={{ animationDelay: '4s' }} />
          <Star className="absolute bottom-20 right-10 w-8 h-8 text-yellow-400/20 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Limited Time Offer - Get Started Free
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Ready to Transform Your Server?
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of server owners who trust Pegasus Bot to manage their communities. 
            Start your journey today with our comprehensive feature set.
          </p>

          {/* Benefits list */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <span className="flex items-center gap-2 text-gray-300">
              <Shield className="w-4 h-4 text-green-400" aria-hidden="true" />
              No credit card required
            </span>
            <span className="flex items-center gap-2 text-gray-300">
              <Zap className="w-4 h-4 text-yellow-400" aria-hidden="true" />
              Instant setup
            </span>
            <span className="flex items-center gap-2 text-gray-300">
              <Users className="w-4 h-4 text-blue-400" aria-hidden="true" />
              Unlimited servers
            </span>
          </div>

          {/* CTA Button */}
          <Link href="/login">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white text-lg px-10 py-6 shadow-2xl hover:shadow-purple-500/25 transition-all animate-gradient hover-lift group"
              aria-label="Start your journey with Pegasus Bot"
            >
              <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" aria-hidden="true" />
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
          </Link>

          {/* Trust indicator */}
          <p className="mt-6 text-sm text-gray-500">
            Trusted by over 500+ Discord servers worldwide
          </p>
        </div>
      </div>

      {/* FAQ Preview */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass p-6 rounded-xl border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-2">
            How quickly can I get started?
          </h4>
          <p className="text-gray-400">
            Setup takes less than 5 minutes. Simply login with Discord, add the bot to your server, 
            and start configuring through our intuitive dashboard.
          </p>
        </Card>
        <Card className="glass p-6 rounded-xl border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-2">
            What support do you offer?
          </h4>
          <p className="text-gray-400">
            We provide 24/7 support through our Discord server, comprehensive documentation, 
            and video tutorials to help you make the most of Pegasus Bot.
          </p>
        </Card>
      </div>

      {/* Stats bar */}
      <div className="mt-16 p-8 glass rounded-2xl border border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-1">24/7</div>
            <p className="text-gray-400 text-sm">Support Available</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-400 mb-1">5 min</div>
            <p className="text-gray-400 text-sm">Setup Time</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-1">100%</div>
            <p className="text-gray-400 text-sm">Free to Start</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-1">500+</div>
            <p className="text-gray-400 text-sm">Active Servers</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTAErrorFallback(_error?: Error, retry?: () => void): ReactNode {
  return (
    <section className="relative container mx-auto px-4 py-20">
      <div className="glass rounded-3xl p-12 text-center border border-white/10">
        <h2 className="text-3xl font-bold text-gray-400 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-500 mb-6">
          {_error?.message || 'Unable to load this section'}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Get Started
            </Button>
          </Link>
          {retry && (
            <Button onClick={retry} variant="outline" size="lg">
              Retry
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export function CallToAction() {
  return (
    <ErrorBoundary fallback={CTAErrorFallback}>
      <CTAContent />
    </ErrorBoundary>
  );
}