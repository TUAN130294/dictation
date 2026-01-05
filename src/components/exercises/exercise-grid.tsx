import { ExerciseCard } from "./exercise-card";
import type { Exercise } from "@/lib/queries/exercises";

interface ExerciseGridProps {
  exercises: Exercise[];
  userProgress?: Record<string, { count: number; best: number }>;
}

export function ExerciseGrid({ exercises, userProgress }: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No exercises found for this level.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          completedCount={userProgress?.[exercise.id]?.count}
          bestAccuracy={userProgress?.[exercise.id]?.best}
        />
      ))}
    </div>
  );
}
