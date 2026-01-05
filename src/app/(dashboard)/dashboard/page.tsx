import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StreakCounter } from "@/components/gamification/streak-counter";
import { ContributionGraph } from "@/components/gamification/contribution-graph";
import { XPProgress } from "@/components/gamification/xp-progress";
import { BadgeGrid } from "@/components/gamification/badge-grid";
import { Card } from "@/components/ui";
import { XP_THRESHOLDS } from "@/lib/queries/gamification";

// Helper to calculate streak from server
function calculateStreak(records: Array<{ date: string }>): number {
  if (records.length === 0) return 0;
  const sorted = [...records].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < sorted.length; i++) {
    const recordDate = new Date(sorted[i].date);
    recordDate.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);
    if (recordDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calculateLongestStreak(records: Array<{ date: string }>): number {
  if (records.length === 0) return 0;
  const sorted = [...records].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let longestStreak = 0;
  let currentStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);
    const dayDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayDiff === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  return Math.max(longestStreak, currentStreak);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all data in parallel
  const [streaksResult, attemptsResult, recentAttemptsResult, achievementsResult] = await Promise.all([
    supabase
      .from("streaks")
      .select("date, exercises_count, minutes")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
    supabase
      .from("attempts")
      .select("accuracy, xp")
      .eq("user_id", user.id),
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
      .from("achievements")
      .select("id, badge_id, unlocked_at")
      .eq("user_id", user.id),
  ]);

  const streakRecords = streaksResult.data || [];
  const allAttempts = attemptsResult.data || [];
  const recentAttempts = recentAttemptsResult.data || [];
  const achievements = achievementsResult.data || [];

  // Calculate stats
  const totalExercises = allAttempts.length;
  const averageAccuracy =
    totalExercises > 0
      ? Math.round(allAttempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / totalExercises)
      : 0;
  const totalXP = allAttempts.reduce((sum, a) => sum + (a.xp || 0), 0);

  // Calculate streaks
  const currentStreak = calculateStreak(streakRecords);
  const longestStreak = calculateLongestStreak(streakRecords);

  // Total minutes (estimate 3 min per exercise)
  const totalMinutes = streakRecords.reduce((sum, d) => sum + (d.minutes || d.exercises_count * 3), 0);

  // Calculate XP level
  let currentLevel = 0;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= XP_THRESHOLDS[i]) {
      currentLevel = i;
      break;
    }
  }
  const currentLevelXP = XP_THRESHOLDS[currentLevel];
  const nextLevelXP = XP_THRESHOLDS[currentLevel + 1] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(100, (xpInLevel / xpNeeded) * 100);

  // Build heatmap data (last 365 days)
  const heatmapData: Array<{ date: string; count: number }> = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const record = streakRecords.find((r) => r.date === dateStr);
    heatmapData.push({
      date: dateStr,
      count: record?.exercises_count || 0,
    });
  }

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
        currentStreak={currentStreak}
      />

      {/* XP Progress */}
      <Card>
        <XPProgress
          totalXP={totalXP}
          currentLevel={currentLevel}
          nextLevelXP={nextLevelXP}
          currentLevelXP={currentLevelXP}
          progressPercent={progressPercent}
        />
      </Card>

      {/* Two columns: Streak + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak section */}
        <Card className="lg:col-span-1">
          <h2 className="font-display font-semibold mb-4">Your Streak</h2>
          <StreakCounter
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            showLongest
            size="lg"
          />
        </Card>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity attempts={recentAttempts as any} />
        </div>
      </div>

      {/* Contribution Graph */}
      <Card>
        <h2 className="font-display font-semibold mb-4">Activity Heatmap</h2>
        <ContributionGraph data={heatmapData} />
      </Card>

      {/* Badges */}
      <Card>
        <h2 className="font-display font-semibold mb-4">Achievements</h2>
        <BadgeGrid unlockedBadgeIds={achievements.map((a) => a.badge_id)} />
      </Card>
    </div>
  );
}
