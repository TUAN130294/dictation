import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todayExercises: number;
  weekData: Array<{
    date: string;
    exercises_count: number;
    minutes: number;
  }>;
}

export interface UserXP {
  totalXP: number;
  currentLevel: number;
  nextLevelXP: number;
  currentLevelXP: number;
  progressPercent: number;
}

export interface UserAchievement {
  id: string;
  badge_id: string;
  unlocked_at: string;
}

// XP thresholds for each level
export const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000];

/**
 * Calculate current streak by counting consecutive days from today backwards
 */
function calculateStreak(streakRecords: Array<{ date: string }>): number {
  if (streakRecords.length === 0) return 0;

  // Sort by date descending
  const sorted = [...streakRecords].sort((a, b) =>
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

/**
 * Calculate longest streak from historical data
 */
function calculateLongestStreak(streakRecords: Array<{ date: string }>): number {
  if (streakRecords.length === 0) return 0;

  // Sort by date ascending
  const sorted = [...streakRecords].sort((a, b) =>
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

/**
 * Get streak data for a user
 */
export async function getStreakData(userId: string): Promise<StreakData> {
  const supabase = createClient();

  // Get all streak records for the user
  const { data: streakRecords, error } = await supabase
    .from('streaks')
    .select('date, exercises_count, minutes')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching streak data:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      todayExercises: 0,
      weekData: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Get today's exercises
  const todayRecord = streakRecords.find(r => r.date === todayStr);
  const todayExercises = todayRecord?.exercises_count || 0;

  // Get last 7 days of data
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const record = streakRecords.find(r => r.date === dateStr);
    weekData.push({
      date: dateStr,
      exercises_count: record?.exercises_count || 0,
      minutes: record?.minutes || 0,
    });
  }

  return {
    currentStreak: calculateStreak(streakRecords),
    longestStreak: calculateLongestStreak(streakRecords),
    todayExercises,
    weekData,
  };
}

/**
 * Get user XP and level information
 */
export async function getUserXP(userId: string): Promise<UserXP> {
  const supabase = createClient();

  // Sum all XP from attempts
  const { data: attempts, error } = await supabase
    .from('attempts')
    .select('xp')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user XP:', error);
    return {
      totalXP: 0,
      currentLevel: 0,
      nextLevelXP: XP_THRESHOLDS[1],
      currentLevelXP: 0,
      progressPercent: 0,
    };
  }

  const totalXP = attempts.reduce((sum, attempt) => sum + (attempt.xp || 0), 0);

  // Find current level
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
  const progressPercent = (xpInLevel / xpNeeded) * 100;

  return {
    totalXP,
    currentLevel,
    nextLevelXP,
    currentLevelXP,
    progressPercent: Math.min(100, progressPercent),
  };
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('achievements')
    .select('id, badge_id, unlocked_at')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return data || [];
}
