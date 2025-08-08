'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="glass rounded-xl p-8 max-w-md w-full border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <h2 className="text-2xl font-bold text-red-400">Something went wrong!</h2>
        </div>
        <p className="text-gray-400 mb-6">
          {error.message || 'An unexpected error occurred while loading the dashboard.'}
        </p>
        <Button
          onClick={reset}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}