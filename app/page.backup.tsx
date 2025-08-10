'use client';

import { Shield, Sparkles, Rocket, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsPreview } from '@/components/landing/StatsPreview';
import { FeatureHighlights } from '@/components/landing/FeatureHighlights';
import { CallToAction } from '@/components/landing/CallToAction';
import { ReactNode, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading components
function NavigationSkeleton() {
  return (
    <nav className="relative glass border-b border-white/10 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Skeleton width={200} height={40} />
          <div className="flex items-center space-x-4">
            <Skeleton width={120} height={36} />
            <Skeleton width={150} height={36} />
          </div>
        </div>
      </div>
    </nav>
  );
}

// Main error boundary fallback
function MainErrorFallback(error?: Error, retry?: () => void): ReactNode {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Something Went Wrong
        </h1>
        <p className="text-gray-400 mb-6">
          {error?.message || 'An unexpected error occurred while loading the page.'}
        </p>
        {retry && (
          <Button
            onClick={retry}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

function PageContent() {

  return (
    <div className="relative min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <Suspense fallback={<NavigationSkeleton />}>
        <nav className="relative glass border-b border-white/10 z-50" role="navigation">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center space-x-3 animate-slide-up hover:opacity-90 transition-opacity"
                aria-label="Pegasus Bot Home"
              >
                <div className="relative">
                  <Shield className="h-10 w-10 text-purple-400 animate-pulse-glow" aria-hidden="true" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" aria-hidden="true" />
                </div>
                <span className="text-2xl md:text-3xl font-bold gradient-text">Pegasus Bot</span>
              </Link>
              <div className="flex items-center space-x-2 md:space-x-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link href="/docs">
                  <Button 
                    variant="ghost" 
                    className="hover:bg-purple-500/20 hover:text-purple-400 transition-all"
                    aria-label="View documentation"
                  >
                    <Star className="mr-0 md:mr-2 h-4 w-4" aria-hidden="true" />
                    <span className="hidden md:inline">Documentation</span>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 transition-all animate-pulse-glow"
                    aria-label="Login to dashboard"
                  >
                    <Rocket className="mr-0 md:mr-2 h-4 w-4" aria-hidden="true" />
                    <span className="hidden md:inline">Login to Dashboard</span>
                    <span className="md:hidden">Login</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </Suspense>

      {/* Hero Section */}
      <HeroSection />

      {/* Live Stats Section */}
      <StatsPreview />

      {/* Features Grid */}
      <FeatureHighlights />

      {/* CTA Section */}
      <CallToAction />

      {/* Footer */}
      <footer className="relative glass border-t border-white/10 mt-20" role="contentinfo">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-purple-400" aria-hidden="true" />
              <span className="text-lg font-semibold gradient-text">Pegasus Bot</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-4 md:gap-6" aria-label="Footer navigation">
              <Link 
                className="text-gray-400 hover:text-purple-400 transition-colors" 
                href="/docs"
                aria-label="Documentation"
              >
                Documentation
              </Link>
              <Link 
                className="text-gray-400 hover:text-purple-400 transition-colors" 
                href="/dashboard"
                aria-label="Dashboard"
              >
                Dashboard
              </Link>
              <Link 
                className="text-gray-400 hover:text-purple-400 transition-colors" 
                href="/privacy"
                aria-label="Privacy Policy"
              >
                Privacy
              </Link>
              <Link 
                className="text-gray-400 hover:text-purple-400 transition-colors" 
                href="/terms"
                aria-label="Terms of Service"
              >
                Terms
              </Link>
              <Link 
                className="text-gray-400 hover:text-purple-400 transition-colors" 
                href="/login"
                aria-label="Login"
              >
                Login
              </Link>
            </nav>
          </div>
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>© 2024 Pegasus Bot. All rights reserved.</p>
            <p className="mt-1">Made with <span className="text-purple-400" aria-label="love">💜</span> for Discord communities worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <ErrorBoundary fallback={MainErrorFallback}>
      <PageContent />
    </ErrorBoundary>
  );
}