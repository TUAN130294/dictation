# Phase 07: Gamification

## Parallelization
- **Wave:** 3
- **Can parallel with:** Phase 05 (Browser), Phase 06 (Dictation Core)
- **Depends on:** Phase 02 (DB/Auth)
- **Blocks:** Phase 08

## File Ownership (Exclusive)
```
src/
├── components/
│   └── gamification/
│       ├── streak-counter.tsx      # Current streak display
│       ├── contribution-graph.tsx  # GitHub-style heatmap
│       ├── xp-progress.tsx         # Level/XP bar
│       ├── badge-grid.tsx          # Achievement badges
│       └── index.ts
├── lib/
│   └── queries/
│       └── gamification.ts         # Streak/achievement queries
└── constants/
    └── badges.ts                   # Badge definitions
```

## Conflict Prevention
- All gamification in `components/gamification/`
- No overlap with dashboard pages (Phase 08)
- Badge definitions in constants, not in components

## Tasks

### 1. Badge Definitions (20min)
```typescript
// src/constants/badges.ts
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;  // emoji or lucide icon name
  requirement: {
    type: "streak" | "accuracy" | "exercises" | "level" | "xp";
    value: number;
    level?: string;
  };
}

export const BADGES: Badge[] = [
  // Streak badges
  {
    id: "streak-3",
    name: "Getting Started",
    description: "Practice 3 days in a row",
    icon: "flame",
    requirement: { type: "streak", value: 3 },
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Practice 7 days in a row",
    icon: "flame",
    requirement: { type: "streak", value: 7 },
  },
  {
    id: "streak-30",
    name: "Monthly Master",
    description: "Practice 30 days in a row",
    icon: "flame",
    requirement: { type: "streak", value: 30 },
  },

  // Accuracy badges
  {
    id: "perfect-1",
    name: "Perfect Score",
    description: "Get 100% accuracy on any exercise",
    icon: "trophy",
    requirement: { type: "accuracy", value: 100 },
  },
  {
    id: "perfect-10",
    name: "Perfectionist",
    description: "Get 100% accuracy on 10 exercises",
    icon: "trophy",
    requirement: { type: "accuracy", value: 100 },
  },

  // Exercise count badges
  {
    id: "exercises-10",
    name: "Dedicated Learner",
    description: "Complete 10 exercises",
    icon: "book-open",
    requirement: { type: "exercises", value: 10 },
  },
  {
    id: "exercises-50",
    name: "Practice Pro",
    description: "Complete 50 exercises",
    icon: "book-open",
    requirement: { type: "exercises", value: 50 },
  },
  {
    id: "exercises-100",
    name: "Century Club",
    description: "Complete 100 exercises",
    icon: "book-open",
    requirement: { type: "exercises", value: 100 },
  },

  // Level badges
  {
    id: "level-a1",
    name: "A1 Explorer",
    description: "Complete 5 A1 exercises",
    icon: "award",
    requirement: { type: "level", value: 5, level: "A1" },
  },
  {
    id: "level-b2",
    name: "B2 Achiever",
    description: "Complete 5 B2 exercises",
    icon: "award",
    requirement: { type: "level", value: 5, level: "B2" },
  },
  {
    id: "level-c2",
    name: "C2 Master",
    description: "Complete 5 C2 exercises",
    icon: "award",
    requirement: { type: "level", value: 5, level: "C2" },
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
```

### 2. Gamification Queries (30min)
```typescript
// src/lib/queries/gamification.ts
import { createClient } from "@/lib/supabase/server";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  heatmapData: Array<{ date: string; count: number }>;
}

export async function getStreakData(userId: string): Promise<StreakData> {
  const supabase = await createClient();

  // Get last 365 days of streak data
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const { data: streaks } = await supabase
    .from("streaks")
    .select("date, exercises_count")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  const heatmapData = (streaks || []).map((s) => ({
    date: s.date,
    count: s.exercises_count,
  }));

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split("T")[0];
  const sortedDates = (streaks || [])
    .map((s) => s.date)
    .sort()
    .reverse();

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expected = expectedDate.toISOString().split("T")[0];

    if (sortedDates[i] === expected) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const s of streaks || []) {
    const date = new Date(s.date);
    if (lastDate) {
      const diff = Math.floor(
        (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    lastDate = date;
  }

  return {
    currentStreak,
    longestStreak,
    totalDays: streaks?.length || 0,
    heatmapData,
  };
}

export async function getUserXP(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("attempts")
    .select("xp")
    .eq("user_id", userId);

  return (data || []).reduce((sum, a) => sum + (a.xp || 0), 0);
}

export async function getUserAchievements(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("achievements")
    .select("badge_id, unlocked_at")
    .eq("user_id", userId);

  return data || [];
}
```

### 3. Streak Counter Component (25min)
```typescript
// src/components/gamification/streak-counter.tsx
"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  size?: "sm" | "md" | "lg";
  showLongest?: boolean;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  size = "md",
  showLongest = false,
}: StreakCounterProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  const isActive = currentStreak > 0;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <Flame
          className={cn(
            iconSizes[size],
            isActive ? "text-warning animate-pulse" : "text-gray-300"
          )}
        />
        <span
          className={cn(
            sizeClasses[size],
            "font-bold font-display",
            isActive ? "text-gray-900" : "text-gray-400"
          )}
        >
          {currentStreak}
        </span>
      </div>
      <span className="text-sm text-gray-500">
        day{currentStreak !== 1 ? "s" : ""} streak
      </span>
      {showLongest && longestStreak !== undefined && longestStreak > 0 && (
        <span className="text-xs text-gray-400 mt-1">
          Longest: {longestStreak} days
        </span>
      )}
    </div>
  );
}
```

### 4. Contribution Graph Component (45min)
```typescript
// src/components/gamification/contribution-graph.tsx
"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ContributionGraphProps {
  data: Array<{ date: string; count: number }>;
  className?: string;
}

const CELL_SIZE = 12;
const CELL_GAP = 3;
const WEEKS = 52;
const DAYS = 7;

const LEVELS = [
  { min: 0, color: "bg-gray-200" },
  { min: 1, color: "bg-green-200" },
  { min: 3, color: "bg-green-300" },
  { min: 6, color: "bg-green-400" },
  { min: 10, color: "bg-green-500" },
];

function getLevel(count: number): string {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (count >= LEVELS[i].min) return LEVELS[i].color;
  }
  return LEVELS[0].color;
}

export function ContributionGraph({ data, className }: ContributionGraphProps) {
  const cells = useMemo(() => {
    const dataMap = new Map(data.map((d) => [d.date, d.count]));
    const today = new Date();
    const cells: Array<{ date: string; count: number; dayOfWeek: number; week: number }> = [];

    // Go back 364 days (52 weeks)
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();
      const week = Math.floor((364 - i + ((today.getDay() + 1) % 7)) / 7);

      cells.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
        dayOfWeek,
        week,
      });
    }

    return cells;
  }, [data]);

  const months = useMemo(() => {
    const months: Array<{ label: string; week: number }> = [];
    let lastMonth = -1;

    cells.forEach((cell) => {
      const month = new Date(cell.date).getMonth();
      if (month !== lastMonth && cell.dayOfWeek === 0) {
        months.push({
          label: new Date(cell.date).toLocaleDateString("en-US", { month: "short" }),
          week: cell.week,
        });
        lastMonth = month;
      }
    });

    return months;
  }, [cells]);

  return (
    <div className={cn("overflow-x-auto", className)}>
      {/* Month labels */}
      <div
        className="flex text-xs text-gray-400 mb-1"
        style={{ marginLeft: 20, gap: CELL_GAP }}
      >
        {months.map((m, i) => (
          <span
            key={i}
            style={{ marginLeft: m.week * (CELL_SIZE + CELL_GAP) - (i > 0 ? months[i - 1].week * (CELL_SIZE + CELL_GAP) : 0) }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col text-xs text-gray-400 mr-1" style={{ gap: CELL_GAP }}>
          <span style={{ height: CELL_SIZE }}></span>
          <span style={{ height: CELL_SIZE }}>Mon</span>
          <span style={{ height: CELL_SIZE }}></span>
          <span style={{ height: CELL_SIZE }}>Wed</span>
          <span style={{ height: CELL_SIZE }}></span>
          <span style={{ height: CELL_SIZE }}>Fri</span>
          <span style={{ height: CELL_SIZE }}></span>
        </div>

        {/* Grid */}
        <div
          className="grid"
          style={{
            gridTemplateRows: `repeat(${DAYS}, ${CELL_SIZE}px)`,
            gridAutoFlow: "column",
            gap: CELL_GAP,
          }}
        >
          {cells.map((cell, i) => (
            <div
              key={i}
              className={cn("rounded-sm", getLevel(cell.count))}
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
              title={`${cell.date}: ${cell.count} exercise${cell.count !== 1 ? "s" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2 text-xs text-gray-400">
        <span>Less</span>
        {LEVELS.map((level, i) => (
          <div
            key={i}
            className={cn("rounded-sm", level.color)}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
```

### 5. XP Progress Component (25min)
```typescript
// src/components/gamification/xp-progress.tsx
"use client";

import { Star } from "lucide-react";
import { Progress } from "@/components/ui";

interface XPProgressProps {
  totalXP: number;
}

// XP required per level: 100, 250, 500, 1000, 2000, 5000...
function getLevel(xp: number): { level: number; current: number; next: number } {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000];

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) {
      return {
        level: i + 1,
        current: thresholds[i],
        next: thresholds[i + 1] || thresholds[i] * 2,
      };
    }
  }

  return { level: 1, current: 0, next: 100 };
}

export function XPProgress({ totalXP }: XPProgressProps) {
  const { level, current, next } = getLevel(totalXP);
  const progress = ((totalXP - current) / (next - current)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-full p-2">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-display font-bold text-lg">Level {level}</span>
            <span className="text-gray-500 text-sm ml-2">{totalXP.toLocaleString()} XP</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {next - totalXP} XP to next level
        </span>
      </div>
      <Progress value={progress} size="md" />
    </div>
  );
}
```

### 6. Badge Grid Component (30min)
```typescript
// src/components/gamification/badge-grid.tsx
"use client";

import { Flame, Trophy, BookOpen, Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { BADGES, type Badge } from "@/constants/badges";

interface BadgeGridProps {
  unlockedBadges: string[];
  className?: string;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  trophy: Trophy,
  "book-open": BookOpen,
  award: Award,
};

export function BadgeGrid({ unlockedBadges, className }: BadgeGridProps) {
  const unlockedSet = new Set(unlockedBadges);

  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4", className)}>
      {BADGES.map((badge) => {
        const isUnlocked = unlockedSet.has(badge.id);
        const Icon = ICONS[badge.icon] || Award;

        return (
          <div
            key={badge.id}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg transition-all",
              isUnlocked
                ? "bg-white shadow-sm border border-gray-100"
                : "bg-gray-100 opacity-50"
            )}
            title={badge.description}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                isUnlocked ? "bg-primary/10" : "bg-gray-200"
              )}
            >
              {isUnlocked ? (
                <Icon className="h-6 w-6 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium text-center",
                isUnlocked ? "text-gray-900" : "text-gray-400"
              )}
            >
              {badge.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

### 7. Export Index (5min)
```typescript
// src/components/gamification/index.ts
export { StreakCounter } from "./streak-counter";
export { ContributionGraph } from "./contribution-graph";
export { XPProgress } from "./xp-progress";
export { BadgeGrid } from "./badge-grid";
```

## Acceptance Criteria
- [ ] Current streak calculated correctly
- [ ] Contribution graph shows last 52 weeks
- [ ] Heatmap cells colored by activity level
- [ ] XP progress shows level and progress bar
- [ ] Badge grid shows locked/unlocked states
- [ ] Tooltips on hover (date, exercise count)
- [ ] Responsive layout (scrollable on mobile)

## Effort: 4h
