import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-border/40 ${className}`} />
);

export const StatSkeletonGrid = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div key={idx} className="card p-4">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-6 w-16" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-32" />
    {Array.from({ length: 5 }).map((_, idx) => (
      <Skeleton key={idx} className="h-8 w-full" />
    ))}
  </div>
);

