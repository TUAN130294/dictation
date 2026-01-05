import { SkeletonCard } from "@/components/ui";

export default function ExercisesLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-9 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-64 bg-gray-200 rounded mb-4" />
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-12 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
