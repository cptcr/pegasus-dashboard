'use client';

import { Shield, Sparkles, Rocket, Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReactNode } from 'react';

function HeroErrorFallback(error?: Error, retry?: () => void): ReactNode {
  return (
    <section className="relative container mx-auto px-4 py-20">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 text-gray-300">
          Loading Hero Section...
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          {error?.message || 'Unable to load hero content'}
        </p>
        {retry && (
          <Button onClick={retry} variant="outline" size="lg">
            Retry
          </Button>
        )}
      </div>
    </section>
  );
}

function HeroContent() {
  return (
    <section className="relative container mx-auto px-4 py-20" role="banner">
      <div className="text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div 
          className="inline-block animate-bounce-in mb-4"
          aria-label="Featured badge"
        >
          <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold">
            <Sparkles className="inline-block w-4 h-4 mr-1" aria-hidden="true" />
            The Ultimate Discord Bot Experience
          </span>
        </div>

        {/* Main Heading */}
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up"
          id="hero-title"
        >
          <span className="gradient-text">Powerful Discord Bot</span>
          <br />
          <span className="text-white">Management Made</span>{' '}
          <span className="neon-purple">Simple</span>
        </h1>

        {/* Description */}
        <p 
          className="text-lg md:text-xl text-gray-400 mb-8 animate-slide-up max-w-3xl mx-auto" 
          style={{ animationDelay: '0.2s' }}
        >
          Take control of your Discord server with advanced moderation, economy systems, 
          XP tracking, and more — all through a beautiful, intuitive dashboard designed 
          for administrators who demand excellence.
        </p>

        {/* CTA Buttons */}
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" 
          style={{ animationDelay: '0.4s' }}
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-6 shadow-2xl hover:shadow-purple-500/25 transition-all hover-lift rainbow-border group"
              aria-label="Get started with Pegasus Bot"
            >
              <Rocket className="mr-2 h-5 w-5 group-hover:animate-pulse" aria-hidden="true" />
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/docs" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-lg px-8 py-6 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all hover-lift group"
              aria-label="Explore Pegasus Bot features"
            >
              <Gift className="mr-2 h-5 w-5 text-purple-400 group-hover:animate-bounce" aria-hidden="true" />
              Explore Features
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div 
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 animate-fade-in"
          style={{ animationDelay: '0.6s' }}
        >
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-400" aria-hidden="true" />
            Secure & Reliable
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            24/7 Uptime
          </span>
          <span className="flex items-center gap-1">
            <Rocket className="w-4 h-4 text-blue-400" aria-hidden="true" />
            Lightning Fast
          </span>
        </div>
      </div>
    </section>
  );
}

export function HeroSection() {
  return (
    <ErrorBoundary fallback={HeroErrorFallback}>
      <HeroContent />
    </ErrorBoundary>
  );
}