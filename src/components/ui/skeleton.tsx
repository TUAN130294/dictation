import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

// Preset skeletons
export function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-100">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-6 w-2/3 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}
