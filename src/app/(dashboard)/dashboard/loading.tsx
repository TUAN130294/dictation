import { Skeleton, SkeletonCard } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* XP Progress */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
