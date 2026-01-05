export type BadgeCategory = 'streak' | 'accuracy' | 'exercise' | 'level';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  requirement: number;
  requirementText: string;
}

export const BADGES: Badge[] = [
  // Streak badges
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Practice for 3 consecutive days',
    category: 'streak',
    icon: 'flame',
    requirement: 3,
    requirementText: '3 consecutive days',
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Practice for 7 consecutive days',
    category: 'streak',
    icon: 'flame',
    requirement: 7,
    requirementText: '7 consecutive days',
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Practice for 30 consecutive days',
    category: 'streak',
    icon: 'flame',
    requirement: 30,
    requirementText: '30 consecutive days',
  },
  {
    id: 'streak-100',
    name: 'Century Champion',
    description: 'Practice for 100 consecutive days',
    category: 'streak',
    icon: 'flame',
    requirement: 100,
    requirementText: '100 consecutive days',
  },

  // Accuracy badges
  {
    id: 'accuracy-80',
    name: 'Precise Listener',
    description: 'Achieve 80% accuracy in an exercise',
    category: 'accuracy',
    icon: 'star',
    requirement: 80,
    requirementText: '80% accuracy',
  },
  {
    id: 'accuracy-90',
    name: 'Sharp Ear',
    description: 'Achieve 90% accuracy in an exercise',
    category: 'accuracy',
    icon: 'star',
    requirement: 90,
    requirementText: '90% accuracy',
  },
  {
    id: 'accuracy-95',
    name: 'Near Perfect',
    description: 'Achieve 95% accuracy in an exercise',
    category: 'accuracy',
    icon: 'star',
    requirement: 95,
    requirementText: '95% accuracy',
  },
  {
    id: 'accuracy-100',
    name: 'Flawless',
    description: 'Achieve 100% accuracy in an exercise',
    category: 'accuracy',
    icon: 'star',
    requirement: 100,
    requirementText: '100% accuracy',
  },

  // Exercise badges
  {
    id: 'exercises-10',
    name: 'Getting Started',
    description: 'Complete 10 exercises',
    category: 'exercise',
    icon: 'book-open',
    requirement: 10,
    requirementText: '10 exercises',
  },
  {
    id: 'exercises-50',
    name: 'Dedicated Learner',
    description: 'Complete 50 exercises',
    category: 'exercise',
    icon: 'book-open',
    requirement: 50,
    requirementText: '50 exercises',
  },
  {
    id: 'exercises-100',
    name: 'Centurion',
    description: 'Complete 100 exercises',
    category: 'exercise',
    icon: 'book-open',
    requirement: 100,
    requirementText: '100 exercises',
  },
  {
    id: 'exercises-500',
    name: 'Practice Legend',
    description: 'Complete 500 exercises',
    category: 'exercise',
    icon: 'book-open',
    requirement: 500,
    requirementText: '500 exercises',
  },

  // Level badges
  {
    id: 'level-a1',
    name: 'A1 Beginner',
    description: 'Complete 10 A1 exercises',
    category: 'level',
    icon: 'award',
    requirement: 10,
    requirementText: '10 A1 exercises',
  },
  {
    id: 'level-a2',
    name: 'A2 Elementary',
    description: 'Complete 10 A2 exercises',
    category: 'level',
    icon: 'award',
    requirement: 10,
    requirementText: '10 A2 exercises',
  },
  {
    id: 'level-b1',
    name: 'B1 Intermediate',
    description: 'Complete 10 B1 exercises',
    category: 'level',
    icon: 'award',
    requirement: 10,
    requirementText: '10 B1 exercises',
  },
  {
    id: 'level-b2',
    name: 'B2 Upper Intermediate',
    description: 'Complete 10 B2 exercises',
    category: 'level',
    icon: 'award',
    requirement: 10,
    requirementText: '10 B2 exercises',
  },
  {
    id: 'level-c1',
    name: 'C1 Advanced',
    description: 'Complete 10 C1 exercises',
    category: 'level',
    icon: 'award',
    requirement: 10,
    requirementText: '10 C1 exercises',
  },
  {
    id: 'level-c2',
    name: 'C2 Proficient',
    description: 'Complete 10 C2 exercises',
    category: 'level',
    icon: 'award',
    requirement: 10,
    requirementText: '10 C2 exercises',
  },
];
