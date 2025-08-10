import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
  width,
  height,
  ...props
}: SkeletonProps) {
  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }[animation];

  const variantClass = {
    default: 'rounded-md',
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  }[variant];

  return (
    <div
      className={cn(
        'bg-gray-800/50 relative overflow-hidden',
        animationClass,
        variantClass,
        className
      )}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
      {...props}
    >
      {animation === 'wave' && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
      )}
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className,
  ...props
}: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-800 p-4 space-y-3',
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton height={16} width="50%" />
          <Skeleton height={12} width="30%" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton height={32} width={80} />
        <Skeleton height={32} width={80} />
      </div>
    </div>
  );
}