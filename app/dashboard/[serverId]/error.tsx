'use client';

import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ServerDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Server dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="glass border-red-500/20 max-w-md w-full">
        <CardContent className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
          <p className="text-gray-400 mb-6">
            {error.message || 'An unexpected error occurred while loading the server dashboard.'}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 mb-6">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/dashboard/servers">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Back to Servers
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}