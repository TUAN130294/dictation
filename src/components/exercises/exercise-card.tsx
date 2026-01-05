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
