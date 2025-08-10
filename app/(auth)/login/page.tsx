"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "OAuthCallback":
          setError("Authentication failed. Please ensure cookies are enabled and try again.");
          break;
        case "OAuthSignin":
          setError("Error starting sign in. Please try again.");
          break;
        case "OAuthAccountNotLinked":
          setError("This Discord account is already linked to another user.");
          break;
        case "Configuration":
          setError("Authentication is not properly configured. Please contact support.");
          break;
        default:
          setError("An error occurred during authentication. Please try again.");
      }
    }
  }, [searchParams]);

  const handleSignIn = () => {
    setIsLoading(true);
    // Use standard NextAuth signIn with explicit callback URL
    signIn("discord", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 pointer-events-none" />
      
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          >
            <Sparkles className="text-purple-500/20 w-6 h-6" />
          </div>
        ))}
      </div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="glass rounded-2xl shadow-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse">
              <Shield className="h-12 w-12 text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-center mb-2 gradient-text animate-gradient">
            Welcome Back
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Sign in to access the Pegasus Bot Dashboard
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25 hover:shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Redirecting to Discord...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Sign in with Discord
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-400">
            <p className="mb-2">Login with your Discord account</p>
            <p className="text-xs">Manage servers where you have permissions</p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}