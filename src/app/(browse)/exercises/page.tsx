import { Suspense } from "react";
import { getExercises, type CEFRLevel } from "@/lib/queries/exercises";
import { createClient } from "@/lib/supabase/server";
import { LevelFilter } from "@/components/exercises/level-filter";
import { ExerciseGrid } from "@/components/exercises/exercise-grid";

interface Props {
  searchParams: Promise<{ level?: string }>;
}

export default async function ExercisesPage({ searchParams }: Props) {
  const params = await searchParams;
  const level = params.level as CEFRLevel | undefined;
  const exercises = await getExercises(level);

  // Get user progress
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProgress: Record<string, { count: number; best: number }> = {};

  if (user) {
    const { data: attempts } = await supabase
      .from("attempts")
      .select("content_id, accuracy")
      .eq("user_id", user.id);

    if (attempts) {
      userProgress = attempts.reduce((acc, attempt) => {
        const existing = acc[attempt.content_id] || { count: 0, best: 0 };
        return {
          ...acc,
          [attempt.content_id]: {
            count: existing.count + 1,
            best: Math.max(existing.best, attempt.accuracy),
          },
        };
      }, {} as typeof userProgress);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Exercises</h1>
        <p className="text-gray-600 mb-4">
          Choose your level and start practicing
        </p>
        <Suspense fallback={<div className="h-10" />}>
          <LevelFilter />
        </Suspense>
      </div>

      <ExerciseGrid exercises={exercises} userProgress={userProgress} />
    </div>
  );
}
