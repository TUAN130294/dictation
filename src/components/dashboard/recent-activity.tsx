"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatTime } from "@/lib/audio-utils";
import type { CEFRLevel } from "@/types/database";

interface AttemptContent {
  title: string;
  level: CEFRLevel;
  duration: number;
}

interface Attempt {
  id: string;
  content_id: string;
  accuracy: number;
  xp: number;
  created_at: string;
  content: AttemptContent | null;
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
              {attempt.content && (
                <>
                  <Badge variant={attempt.content.level}>
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
                </>
              )}
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
