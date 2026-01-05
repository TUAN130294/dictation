'use client';

import { Flame, Star, BookOpen, Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BADGES, type Badge, type BadgeCategory } from '@/constants/badges';

interface BadgeGridProps {
  unlockedBadgeIds: string[];
  category?: BadgeCategory;
  columns?: 2 | 3 | 4;
  showLocked?: boolean;
  className?: string;
}

const iconMap = {
  flame: Flame,
  star: Star,
  'book-open': BookOpen,
  award: Award,
};

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
}

function BadgeCard({ badge, isUnlocked }: BadgeCardProps) {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Award;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
        isUnlocked
          ? 'bg-white border-gray-300 shadow-sm hover:shadow-md'
          : 'bg-gray-50 border-gray-200 opacity-60'
      )}
    >
      {/* Lock overlay for locked badges */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Badge icon */}
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          isUnlocked ? getCategoryBgColor(badge.category) : 'bg-gray-200'
        )}
      >
        <IconComponent
          className={cn(
            'w-8 h-8',
            isUnlocked ? getCategoryIconColor(badge.category) : 'text-gray-400'
          )}
        />
      </div>

      {/* Badge name */}
      <div className="text-center">
        <h3 className={cn('font-semibold text-sm', isUnlocked ? 'text-gray-900' : 'text-gray-500')}>
          {badge.name}
        </h3>
        <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
        <p className="text-xs text-gray-500 mt-1 italic">{badge.requirementText}</p>
      </div>
    </div>
  );
}

function getCategoryBgColor(category: BadgeCategory): string {
  switch (category) {
    case 'streak':
      return 'bg-orange-100';
    case 'accuracy':
      return 'bg-yellow-100';
    case 'exercise':
      return 'bg-blue-100';
    case 'level':
      return 'bg-purple-100';
    default:
      return 'bg-gray-100';
  }
}

function getCategoryIconColor(category: BadgeCategory): string {
  switch (category) {
    case 'streak':
      return 'text-orange-500';
    case 'accuracy':
      return 'text-yellow-500';
    case 'exercise':
      return 'text-blue-500';
    case 'level':
      return 'text-purple-500';
    default:
      return 'text-gray-500';
  }
}

export function BadgeGrid({
  unlockedBadgeIds,
  category,
  columns = 3,
  showLocked = true,
  className,
}: BadgeGridProps) {
  // Filter badges by category if specified
  const filteredBadges = category
    ? BADGES.filter(badge => badge.category === category)
    : BADGES;

  // Filter out locked badges if showLocked is false
  const displayBadges = showLocked
    ? filteredBadges
    : filteredBadges.filter(badge => unlockedBadgeIds.includes(badge.id));

  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">
            {unlockedBadgeIds.length}
          </span>
          {' / '}
          {filteredBadges.length} badges unlocked
        </div>
      </div>

      {/* Badge grid */}
      <div className={cn('grid gap-4', gridColsClass[columns])}>
        {displayBadges.map(badge => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            isUnlocked={unlockedBadgeIds.includes(badge.id)}
          />
        ))}
      </div>

      {/* Empty state */}
      {displayBadges.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">No badges to display</p>
        </div>
      )}
    </div>
  );
}
