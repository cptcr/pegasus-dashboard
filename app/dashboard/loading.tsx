import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-300">Loading Dashboard...</h2>
        <p className="text-gray-500 mt-2">Please wait while we fetch your data</p>
      </div>
    </div>
  );
}