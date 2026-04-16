// src/components/Skeletons.tsx
import { AlertTriangle, Globe } from 'lucide-react';

export const FeedSkeleton = () => (
  <div className="telos-panel border telos-border p-5 md:p-6 rounded shadow-lg flex flex-col gap-3 animate-pulse">
    <div className="flex justify-between border-b telos-border pb-3">
      <div className="flex gap-3">
        <div className="h-6 w-20 bg-gray-600/30 rounded"></div>
        <div className="h-6 w-24 bg-gray-600/30 rounded"></div>
      </div>
      <div className="h-4 w-32 bg-gray-600/30 rounded mt-1"></div>
    </div>
    <div className="h-6 w-3/4 bg-gray-600/30 rounded mt-2"></div>
    <div className="space-y-2 mt-2">
      <div className="h-4 w-full bg-gray-600/30 rounded"></div>
      <div className="h-4 w-full bg-gray-600/30 rounded"></div>
      <div className="h-4 w-4/5 bg-gray-600/30 rounded"></div>
    </div>
  </div>
);

export const LaunchSkeleton = () => (
  <div className="relative telos-panel border telos-border p-4 rounded animate-pulse">
    <div className="h-4 w-3/4 bg-gray-600/30 rounded mb-2"></div>
    <div className="h-3 w-1/2 bg-cyan-900/30 rounded mt-2"></div>
  </div>
);
