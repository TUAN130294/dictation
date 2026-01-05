'use client';

import { Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { XP_THRESHOLDS } from '@/lib/queries/gamification';

interface XPProgressProps {
  totalXP: number;
  currentLevel: number;
  nextLevelXP: number;
  currentLevelXP: number;
  progressPercent: number;
  showDetails?: boolean;
  className?: string;
}

export function XPProgress({
  totalXP,
  currentLevel,
  nextLevelXP,
  currentLevelXP,
  progressPercent,
  showDetails = true,
  className,
}: XPProgressProps) {
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const isMaxLevel = currentLevel >= XP_THRESHOLDS.length - 1;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Level Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <div>
            <div className="font-bold text-lg">
              Level {currentLevel}
            </div>
            {showDetails && (
              <div className="text-sm text-gray-600">
                {totalXP.toLocaleString()} total XP
              </div>
            )}
          </div>
        </div>

        {!isMaxLevel && (
          <div className="text-sm text-gray-600">
            Level {currentLevel + 1}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!isMaxLevel ? (
        <>
          <Progress
            value={progressPercent}
            size="lg"
            variant="default"
            className="w-full"
          />

          {showDetails && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>{xpInLevel.toLocaleString()} XP</span>
              <span>{xpNeeded.toLocaleString()} XP to next level</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-600 italic">
          Maximum level reached!
        </div>
      )}
    </div>
  );
}
