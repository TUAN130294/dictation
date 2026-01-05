"use client";

import { Trophy, Star, RotateCcw, ArrowRight } from "lucide-react";
import { Button, Card, Progress } from "@/components/ui";
import { getGradeColor, getGradeMessage, type Score } from "@/lib/scoring";

interface ScoringPanelProps {
  score: Score;
  onRetry: () => void;
  onNext?: () => void;
}

export function ScoringPanel({ score, onRetry, onNext }: ScoringPanelProps) {
  return (
    <Card className="text-center">
      {/* Grade icon */}
      <div className="mb-4">
        {score.grade === "perfect" || score.grade === "excellent" ? (
          <Trophy className={`h-16 w-16 mx-auto ${getGradeColor(score.grade)}`} />
        ) : (
          <Star className={`h-16 w-16 mx-auto ${getGradeColor(score.grade)}`} />
        )}
      </div>

      {/* Accuracy */}
      <div className="mb-4">
        <span className={`text-5xl font-bold ${getGradeColor(score.grade)}`}>
          {score.accuracy}%
        </span>
        <p className="text-gray-600 mt-2">{getGradeMessage(score.grade)}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6 px-8">
        <Progress
          value={score.accuracy}
          variant={
            score.accuracy >= 90
              ? "success"
              : score.accuracy >= 70
              ? "default"
              : score.accuracy >= 50
              ? "warning"
              : "error"
          }
          size="lg"
        />
      </div>

      {/* XP earned */}
      <div className="bg-primary/10 rounded-lg py-3 px-6 inline-block mb-6">
        <span className="text-primary font-bold text-lg">+{score.xp} XP</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-gray-500 block">Word Error Rate</span>
          <span className="font-mono font-bold">
            {(score.wer * 100).toFixed(1)}%
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-gray-500 block">Grade</span>
          <span className={`font-bold capitalize ${getGradeColor(score.grade)}`}>
            {score.grade}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={onRetry}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        {onNext && (
          <Button onClick={onNext}>
            Next Exercise
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  );
}
