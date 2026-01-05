'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  showLongest?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  showLongest = false,
  size = 'md',
  className,
}: StreakCounterProps) {
  const sizeClasses = {
    sm: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      subtext: 'text-xs',
    },
    md: {
      icon: 'w-6 h-6',
      text: 'text-lg',
      subtext: 'text-sm',
    },
    lg: {
      icon: 'w-8 h-8',
      text: 'text-2xl',
      subtext: 'text-base',
    },
  };

  const isActive = currentStreak > 0;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-2">
        <Flame
          className={cn(
            sizeClasses[size].icon,
            isActive ? 'text-orange-500 fill-orange-500' : 'text-gray-400'
          )}
        />
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className={cn('font-bold', sizeClasses[size].text)}>
              {currentStreak}
            </span>
            <span className={cn('text-gray-600', sizeClasses[size].subtext)}>
              day{currentStreak !== 1 ? 's' : ''}
            </span>
          </div>
          {showLongest && longestStreak !== undefined && (
            <span className={cn('text-gray-500', sizeClasses[size].subtext)}>
              Longest: {longestStreak}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
