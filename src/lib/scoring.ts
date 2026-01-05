import type { DiffResult } from "./diff-utils";

export interface Score {
  wer: number;          // Word Error Rate (0-1)
  accuracy: number;     // Percentage (0-100)
  xp: number;           // Experience points
  grade: "perfect" | "excellent" | "good" | "fair" | "poor";
}

export function calculateScore(
  diffResult: DiffResult,
  referenceWordCount: number
): Score {
  const { substitutions, deletions, insertions } = diffResult;
  const errors = substitutions + deletions + insertions;

  // WER = (S + D + I) / N
  const wer = referenceWordCount > 0 ? errors / referenceWordCount : 1;
  const accuracy = Math.max(0, Math.round((1 - wer) * 100));

  // Grade based on accuracy
  let grade: Score["grade"];
  if (accuracy >= 100) grade = "perfect";
  else if (accuracy >= 90) grade = "excellent";
  else if (accuracy >= 75) grade = "good";
  else if (accuracy >= 60) grade = "fair";
  else grade = "poor";

  // XP calculation
  const baseXP = 10;
  const accuracyBonus = Math.floor(accuracy / 10);
  const perfectBonus = accuracy === 100 ? 20 : 0;
  const xp = baseXP + accuracyBonus + perfectBonus;

  return { wer, accuracy, xp, grade };
}

export function getGradeColor(grade: Score["grade"]): string {
  const colors = {
    perfect: "text-success",
    excellent: "text-success",
    good: "text-primary",
    fair: "text-warning",
    poor: "text-error",
  };
  return colors[grade];
}

export function getGradeMessage(grade: Score["grade"]): string {
  const messages = {
    perfect: "Perfect! Flawless transcription!",
    excellent: "Excellent work! Almost perfect!",
    good: "Good job! Keep practicing!",
    fair: "Not bad! Try listening more carefully.",
    poor: "Keep trying! Practice makes perfect.",
  };
  return messages[grade];
}
