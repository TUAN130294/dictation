# Phase 08: Dashboard & Polish

## Parallelization
- **Wave:** 4 (Final integration)
- **Can parallel with:** None
- **Depends on:** Phases 05, 06, 07 (all Wave 3)
- **Blocks:** None (final phase)

## File Ownership (Exclusive)
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── page.tsx              # Landing page (finalize)
│   └── layout.tsx            # Root layout (finalize)
├── components/
│   └── dashboard/
│       ├── stats-cards.tsx
│       ├── recent-activity.tsx
│       └── index.ts
└── app/
    └── not-found.tsx
```

## Conflict Prevention
- Dashboard pages in `(dashboard)` route group
- Final touches to root layout.tsx (add providers, fonts)
- Landing page built from existing components

## Tasks

### 1. Dashboard Stats Cards (25min)
```typescript
// src/components/dashboard/stats-cards.tsx
import { Clock, Target, Zap, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui";

interface StatsCardsProps {
  totalExercises: number;
  totalMinutes: number;
  averageAccuracy: number;
  currentStreak: number;
}

export function StatsCards({
  totalExercises,
  totalMinutes,
  averageAccuracy,
  currentStreak,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Exercises",
      value: totalExercises,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Practice Time",
      value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      icon: Clock,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Avg. Accuracy",
      value: `${averageAccuracy}%`,
      icon: TrendingUp,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Current Streak",
      value: `${currentStreak} days`,
      icon: Zap,
      color: "text-error",
      bgColor: "bg-error/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${stat.bgColor}`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold font-display">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### 2. Recent Activity Component (30min)
```typescript
// src/components/dashboard/recent-activity.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatTime } from "@/lib/audio-utils";

interface Attempt {
  id: string;
  content_id: string;
  accuracy: number;
  xp: number;
  created_at: string;
  content: {
    title: string;
    level: string;
    duration: number;
  };
}

interface RecentActivityProps {
  attempts: Attempt[];
}

export function RecentActivity({ attempts }: RecentActivityProps) {
  if (attempts.length === 0) {
    return (
      <Card>
        <h2 className="font-display font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-center py-8">
          No activity yet. Start practicing!
        </p>
        <Link
          href="/exercises"
          className="flex items-center justify-center gap-1 text-primary hover:underline"
        >
          Browse exercises
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold">Recent Activity</h2>
        <Link
          href="/exercises"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {attempts.map((attempt) => (
          <Link
            key={attempt.id}
            href={`/exercises/${attempt.content_id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Badge variant={attempt.content.level as any}>
                {attempt.content.level}
              </Badge>
              <div>
                <p className="font-medium line-clamp-1">
                  {attempt.content.title}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(attempt.created_at).toLocaleDateString()} •{" "}
                  {formatTime(attempt.content.duration)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`font-bold ${
                  attempt.accuracy >= 90
                    ? "text-success"
                    : attempt.accuracy >= 70
                    ? "text-warning"
                    : "text-error"
                }`}
              >
                {attempt.accuracy}%
              </span>
              <p className="text-sm text-gray-500">+{attempt.xp} XP</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
```

### 3. Dashboard Page (45min)
```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStreakData, getUserXP, getUserAchievements } from "@/lib/queries/gamification";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StreakCounter } from "@/components/gamification/streak-counter";
import { ContributionGraph } from "@/components/gamification/contribution-graph";
import { XPProgress } from "@/components/gamification/xp-progress";
import { BadgeGrid } from "@/components/gamification/badge-grid";
import { Card } from "@/components/ui";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all data in parallel
  const [streakData, totalXP, achievements, attemptsResult, statsResult] = await Promise.all([
    getStreakData(user.id),
    getUserXP(user.id),
    getUserAchievements(user.id),
    supabase
      .from("attempts")
      .select(`
        id,
        content_id,
        accuracy,
        xp,
        created_at,
        content:content_id (title, level, duration)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("attempts")
      .select("accuracy")
      .eq("user_id", user.id),
  ]);

  const attempts = attemptsResult.data || [];
  const allAttempts = statsResult.data || [];

  const totalExercises = allAttempts.length;
  const averageAccuracy =
    totalExercises > 0
      ? Math.round(allAttempts.reduce((sum, a) => sum + a.accuracy, 0) / totalExercises)
      : 0;
  const totalMinutes = streakData.heatmapData.reduce((sum, d) => sum + d.count * 3, 0); // Estimate 3 min/exercise

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-gray-600">Track your progress and achievements</p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalExercises={totalExercises}
        totalMinutes={totalMinutes}
        averageAccuracy={averageAccuracy}
        currentStreak={streakData.currentStreak}
      />

      {/* XP Progress */}
      <Card>
        <XPProgress totalXP={totalXP} />
      </Card>

      {/* Two columns: Streak + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak section */}
        <Card className="lg:col-span-1">
          <h2 className="font-display font-semibold mb-4">Your Streak</h2>
          <StreakCounter
            currentStreak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
            showLongest
            size="lg"
          />
        </Card>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity attempts={attempts as any} />
        </div>
      </div>

      {/* Contribution Graph */}
      <Card>
        <h2 className="font-display font-semibold mb-4">Activity Heatmap</h2>
        <ContributionGraph data={streakData.heatmapData} />
      </Card>

      {/* Badges */}
      <Card>
        <h2 className="font-display font-semibold mb-4">Achievements</h2>
        <BadgeGrid unlockedBadges={achievements.map((a) => a.badge_id)} />
      </Card>
    </div>
  );
}
```

### 4. Dashboard Layout (15min)
```typescript
// src/app/(dashboard)/layout.tsx
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

### 5. Dashboard Loading State (15min)
```typescript
// src/app/(dashboard)/dashboard/loading.tsx
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
    </div>
  );
}
```

### 6. Landing Page (30min)
```typescript
// src/app/page.tsx
import Link from "next/link";
import { ArrowRight, Headphones, Target, Trophy } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const features = [
    {
      icon: Headphones,
      title: "Audio Dictation",
      description: "Practice listening with CEFR-leveled content and adjustable playback speed",
    },
    {
      icon: Target,
      title: "Instant Feedback",
      description: "See your accuracy score and word-by-word diff immediately",
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Build streaks, earn XP, and unlock achievements as you improve",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-display font-bold text-gray-900 mb-6">
          Master English Listening
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Improve your English comprehension through daily dictation practice.
          Listen, type, and see your accuracy in real-time.
        </p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/exercises">
                <Button variant="secondary" size="lg">
                  Start Practicing
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Card className="bg-primary text-white">
          <h2 className="text-2xl font-display font-bold mb-4">
            Ready to improve your English?
          </h2>
          <p className="mb-6 text-primary-tint/80">
            Join thousands of learners practicing daily. Free forever.
          </p>
          <Link href={user ? "/exercises" : "/signup"}>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
              {user ? "Start Practicing" : "Create Free Account"}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
```

### 7. Finalize Root Layout (20min)
```typescript
// src/app/layout.tsx (update)
import type { Metadata, Viewport } from "next";
import { Inter, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-display" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Dictation Practice - Master English Listening",
    template: "%s | Dictation Practice",
  },
  description: "Improve your English listening skills with daily dictation exercises. Practice with CEFR-leveled content, track your progress, and earn achievements.",
  keywords: ["english", "dictation", "listening", "practice", "CEFR", "learning"],
  authors: [{ name: "Dictation Practice" }],
  openGraph: {
    type: "website",
    title: "Dictation Practice",
    description: "Master English listening with daily dictation practice",
    siteName: "Dictation Practice",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A56DB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

### 8. 404 Page (10min)
```typescript
// src/app/not-found.tsx
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-gray-300 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-display font-semibold mb-2">
          Page not found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

### 9. Export Index (5min)
```typescript
// src/components/dashboard/index.ts
export { StatsCards } from "./stats-cards";
export { RecentActivity } from "./recent-activity";
```

### 10. Final Polish Checklist (30min)
- [ ] Test all routes work (/, /login, /signup, /exercises, /practice/[id], /dashboard)
- [ ] Verify auth redirects correctly
- [ ] Check responsive layouts on mobile
- [ ] Validate accessibility (keyboard nav, focus states)
- [ ] Run `npm run build` - fix any type errors
- [ ] Test WaveSurfer loads without hydration errors
- [ ] Verify Supabase RLS policies work
- [ ] Add sample content to database for testing

## Acceptance Criteria
- [ ] Dashboard shows stats, streak, XP, activity, badges
- [ ] Landing page renders for both auth/unauth users
- [ ] All pages have loading states
- [ ] 404 page displays for invalid routes
- [ ] Root layout has correct metadata (title, description, OG)
- [ ] Mobile responsive (all breakpoints)
- [ ] No TypeScript errors on build
- [ ] All pages accessible via keyboard

## Effort: 4h
