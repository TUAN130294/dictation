"use client";

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
      value: totalExercises.toString(),
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
      color: "text-orange-500",
      bgColor: "bg-orange-100",
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
