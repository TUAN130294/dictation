# Phase 05: Exercise Browser

## Parallelization
- **Wave:** 3
- **Can parallel with:** Phase 06 (Dictation Core), Phase 07 (Gamification)
- **Depends on:** Phase 02 (DB/Auth), Phase 03 (UI)
- **Blocks:** Phase 08 (partial)

## File Ownership (Exclusive)
```
src/
├── app/
│   └── (browse)/
│       ├── layout.tsx
│       ├── page.tsx              # /browse (redirect or list)
│       └── exercises/
│           ├── page.tsx          # Exercise list
│           ├── loading.tsx       # Streaming fallback
│           └── [id]/
│               └── page.tsx      # Exercise detail/start
├── components/
│   └── exercises/
│       ├── exercise-card.tsx
│       ├── exercise-grid.tsx
│       ├── level-filter.tsx
│       └── search-bar.tsx
└── lib/
    └── queries/
        └── exercises.ts          # Supabase queries
```

## Conflict Prevention
- Browse pages in `(browse)` route group
- Exercise components in `components/exercises/`
- No overlap with practice/dictation pages (Phase 06)

## Tasks

### 1. Exercise Queries (20min)
```typescript
// src/lib/queries/exercises.ts
import { createClient } from "@/lib/supabase/server";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Exercise {
  id: string;
  level: CEFRLevel;
  title: string;
  audio_url: string;
  transcript: string;
  duration: number;
  created_at: string;
}

export async function getExercises(level?: CEFRLevel) {
  const supabase = await createClient();

  let query = supabase
    .from("content")
    .select("*")
    .order("created_at", { ascending: false });

  if (level) {
    query = query.eq("level", level);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Exercise[];
}

export async function getExerciseById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Exercise;
}

export async function getUserAttempts(userId: string, contentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
}
```

### 2. Level Filter Component (25min)
```typescript
// src/components/exercises/level-filter.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui";
import type { CEFRLevel } from "@/lib/queries/exercises";

const LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function LevelFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLevel = searchParams.get("level") as CEFRLevel | null;

  const handleLevelChange = (level: CEFRLevel | null) => {
    const params = new URLSearchParams(searchParams);
    if (level) {
      params.set("level", level);
    } else {
      params.delete("level");
    }
    router.push(`/exercises?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleLevelChange(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !currentLevel
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {LEVELS.map((level) => (
        <button
          key={level}
          onClick={() => handleLevelChange(level)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            currentLevel === level
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}
```

### 3. Exercise Card Component (30min)
```typescript
// src/components/exercises/exercise-card.tsx
import Link from "next/link";
import { Clock, Play } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatTime } from "@/lib/audio-utils";
import type { Exercise } from "@/lib/queries/exercises";

interface ExerciseCardProps {
  exercise: Exercise;
  completedCount?: number;
  bestAccuracy?: number;
}

export function ExerciseCard({ exercise, completedCount, bestAccuracy }: ExerciseCardProps) {
  return (
    <Link href={`/exercises/${exercise.id}`}>
      <Card hover className="h-full">
        <div className="flex items-start justify-between mb-3">
          <Badge variant={exercise.level}>{exercise.level}</Badge>
          {completedCount !== undefined && completedCount > 0 && (
            <span className="text-xs text-gray-500">
              {completedCount}x completed
            </span>
          )}
        </div>

        <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2">
          {exercise.title}
        </h3>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {exercise.transcript.slice(0, 100)}...
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatTime(exercise.duration)}</span>
          </div>

          {bestAccuracy !== undefined && (
            <span className={`text-sm font-medium ${
              bestAccuracy >= 90 ? "text-success" :
              bestAccuracy >= 70 ? "text-warning" : "text-gray-500"
            }`}>
              Best: {bestAccuracy}%
            </span>
          )}

          <div className="flex items-center gap-1 text-primary text-sm font-medium">
            <Play className="h-4 w-4" />
            Start
          </div>
        </div>
      </Card>
    </Link>
  );
}
```

### 4. Exercise Grid Component (20min)
```typescript
// src/components/exercises/exercise-grid.tsx
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
```

### 5. Browse Layout (15min)
```typescript
// src/app/(browse)/layout.tsx
import { Header } from "@/components/layout/header";

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

### 6. Exercises List Page (35min)
```typescript
// src/app/(browse)/exercises/page.tsx
import { Suspense } from "react";
import { getExercises, type CEFRLevel } from "@/lib/queries/exercises";
import { createClient } from "@/lib/supabase/server";
import { LevelFilter } from "@/components/exercises/level-filter";
import { ExerciseGrid } from "@/components/exercises/exercise-grid";
import { SkeletonCard } from "@/components/ui";

interface Props {
  searchParams: { level?: string };
}

export default async function ExercisesPage({ searchParams }: Props) {
  const level = searchParams.level as CEFRLevel | undefined;
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
```

### 7. Loading State (10min)
```typescript
// src/app/(browse)/exercises/loading.tsx
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
```

### 8. Exercise Detail Page (30min)
```typescript
// src/app/(browse)/exercises/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getExerciseById, getUserAttempts } from "@/lib/queries/exercises";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge, Card } from "@/components/ui";
import { formatTime } from "@/lib/audio-utils";

interface Props {
  params: { id: string };
}

export default async function ExerciseDetailPage({ params }: Props) {
  const exercise = await getExerciseById(params.id).catch(() => null);
  if (!exercise) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const attempts = user ? await getUserAttempts(user.id, exercise.id) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/exercises"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to exercises
      </Link>

      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <Badge variant={exercise.level} className="text-sm">
            {exercise.level}
          </Badge>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatTime(exercise.duration)}</span>
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold mb-4">{exercise.title}</h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Listen to the audio and type what you hear. You can replay as many times
          as needed, adjust the speed, and see your accuracy score when done.
        </p>

        <Link href={`/practice/${exercise.id}`}>
          <Button size="lg" className="w-full sm:w-auto">
            Start Dictation
          </Button>
        </Link>
      </Card>

      {/* Previous attempts */}
      {attempts.length > 0 && (
        <Card>
          <h2 className="font-display font-semibold mb-4">Your Attempts</h2>
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-500">
                  {new Date(attempt.created_at).toLocaleDateString()}
                </span>
                <span className={`font-medium ${
                  attempt.accuracy >= 90 ? "text-success" :
                  attempt.accuracy >= 70 ? "text-warning" : "text-error"
                }`}>
                  {attempt.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
```

## Acceptance Criteria
- [x] Exercise list loads with level filtering
- [x] URL updates when changing levels (shareable links)
- [x] Exercise cards show level, title, duration
- [x] User progress shows (completed count, best accuracy)
- [x] Detail page shows exercise info and past attempts
- [x] "Start Dictation" links to practice page
- [x] Loading skeletons during data fetch
- [x] Empty state when no exercises match filter

## Effort: 4h

## Implementation Status: COMPLETED ✓
**Completed**: 2026-01-05
**Report**: D:\dictation\plans\260105-parallel-impl\reports\phase-05-implementation-report.md
