export interface BadgeInfo {
  id: 'progress' | 'excellence' | 'stardom';
  name: string;
  pointsRequired: number;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

export const BADGE_TIERS: BadgeInfo[] = [
  {
    id: 'progress',
    name: 'وسام التقدم',
    pointsRequired: 100,
    icon: 'TrendingUp',
    color: '#0284c7',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-300',
    description: 'يُمنح للموظف عند تحقيق 100 نقطة تقديراً لمواصلة العطاء والتقدم الملحوظ.',
  },
  {
    id: 'excellence',
    name: 'وسام المثالية',
    pointsRequired: 200,
    icon: 'Award',
    color: '#7c3aed',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    description: 'يُمنح للموظف عند بلوغ 200 نقطة تقديراً للأداء النموذجي والالتزام العالي.',
  },
  {
    id: 'stardom',
    name: 'وسام النجومية',
    pointsRequired: 300,
    icon: 'Crown',
    color: '#d97706',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
    description: 'وسام القمة والريادة، يُمنح عند تحقيق 300 نقطة تكريماً للنجومية والصدارة المتميزة.',
  },
];

export function calculateBadges(points: number = 0) {
  const currentPoints = Number(points) || 0;
  const earnedBadges = BADGE_TIERS.filter(b => currentPoints >= b.pointsRequired);
  const highestBadge = earnedBadges.length > 0 ? earnedBadges[earnedBadges.length - 1] : null;
  const nextBadge = BADGE_TIERS.find(b => currentPoints < b.pointsRequired) || null;
  
  const pointsToNext = nextBadge ? Math.max(0, nextBadge.pointsRequired - currentPoints) : 0;
  
  // Base progress percentage
  let progressPercent = 0;
  if (!nextBadge) {
    progressPercent = 100;
  } else if (nextBadge.pointsRequired === 100) {
    progressPercent = Math.min(100, Math.round((currentPoints / 100) * 100));
  } else if (nextBadge.pointsRequired === 200) {
    progressPercent = Math.min(100, Math.round(((currentPoints - 100) / 100) * 100));
  } else if (nextBadge.pointsRequired === 300) {
    progressPercent = Math.min(100, Math.round(((currentPoints - 200) / 100) * 100));
  }

  return {
    points: currentPoints,
    earnedBadges,
    highestBadge,
    nextBadge,
    pointsToNext,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    hasProgress: currentPoints >= 100,
    hasExcellence: currentPoints >= 200,
    hasStardom: currentPoints >= 300,
  };
}
