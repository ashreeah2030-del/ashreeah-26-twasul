'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Crown, 
  Award, 
  TrendingUp, 
  Sparkles, 
  Trophy, 
  ChevronLeft, 
  Users, 
  MessageCircle, 
  ArrowUpRight,
  PieChart as PieChartIcon,
  Medal,
  CheckCircle2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
} from 'recharts';

interface Teacher {
  id: string | number;
  name: string;
  phone: string;
  specialty?: string;
  jobTitle?: string;
  discipline?: string;
  level?: string;
  points?: number;
  avatarUrl?: string | null;
  portalToken?: string;
}

interface BadgeStatisticsSectionProps {
  teachers: Teacher[];
  onNavigateToMotivation?: () => void;
  onSelectTeacher?: (teacher: Teacher) => void;
}

// Color constants for badges
const BADGE_CONFIG = {
  stardom: {
    id: 'stardom',
    name: 'وسام النجومية',
    minPoints: 300,
    color: '#d97706', // amber-600
    hoverColor: '#b45309',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    badgeBorder: 'border-amber-300',
    text: 'text-amber-800',
    accentText: 'text-amber-600',
    icon: Crown,
    gradient: 'from-amber-500 to-amber-600',
    description: 'الوسام الأرفع تكريماً للصدارة والريادة الاستثنائية بالمجمع (300+ نقطة)',
    tierLabel: '300+ نقطة'
  },
  excellence: {
    id: 'excellence',
    name: 'وسام المثالية',
    minPoints: 200,
    color: '#7c3aed', // violet-600
    hoverColor: '#6d28d9',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    badgeBorder: 'border-purple-300',
    text: 'text-purple-800',
    accentText: 'text-purple-600',
    icon: Award,
    gradient: 'from-purple-500 to-purple-600',
    description: 'يُمنح تقديراً للأداء النموذجي والانضباط والمبادرة التعليمية العالية (200-299 نقطة)',
    tierLabel: '200+ نقطة'
  },
  progress: {
    id: 'progress',
    name: 'وسام التقدم',
    minPoints: 100,
    color: '#0284c7', // sky-600
    hoverColor: '#0369a1',
    lightBg: 'bg-sky-50',
    border: 'border-sky-200',
    badgeBorder: 'border-sky-300',
    text: 'text-sky-800',
    accentText: 'text-sky-600',
    icon: TrendingUp,
    gradient: 'from-sky-500 to-sky-600',
    description: 'يُمنح عند تحقيق 100 نقطة تقديراً للمثابرة والعطاء والتقدم الملموس (100-199 نقطة)',
    tierLabel: '100+ نقطة'
  },
  inProgress: {
    id: 'inProgress',
    name: 'قيد جمع النقاط',
    minPoints: 0,
    color: '#94a3b8', // slate-400
    hoverColor: '#64748b',
    lightBg: 'bg-slate-50',
    border: 'border-slate-200',
    badgeBorder: 'border-slate-300',
    text: 'text-slate-700',
    accentText: 'text-slate-500',
    icon: Sparkles,
    gradient: 'from-slate-400 to-slate-500',
    description: 'منسوبون في طور مراكمة الإنجازات والتقدم نحو استحقاق وسام التقدم الأول (< 100 نقطة)',
    tierLabel: 'أقل من 100'
  }
};

// Custom Chart Tooltip defined outside component to prevent re-creation during render
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.isPlaceholder) return null;
    return (
      <div className="bg-slate-900/95 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-medium space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-bold">{data.name}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-slate-300">
          <span>عدد الحاصلين:</span>
          <span className="font-bold text-white font-mono">{data.count} موظف</span>
        </div>
        {data.percent !== undefined && (
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>النسبة:</span>
            <span className="font-bold text-emerald-400 font-mono">{data.percent}%</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function BadgeStatisticsSection({
  teachers = [],
  onNavigateToMotivation,
}: BadgeStatisticsSectionProps) {
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<'all' | 'stardom' | 'excellence' | 'progress'>('all');
  const [activeChartMode, setActiveChartMode] = useState<'granted' | 'all_staff'>('granted');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  // Compute statistics
  const stats = useMemo(() => {
    const totalTeachers = teachers.length;
    
    // Group teachers by their highest attained badge
    const stardomTeachers = teachers.filter(t => (t.points || 0) >= 300);
    const excellenceTeachers = teachers.filter(t => (t.points || 0) >= 200 && (t.points || 0) < 300);
    const progressTeachers = teachers.filter(t => (t.points || 0) >= 100 && (t.points || 0) < 200);
    const inProgressTeachers = teachers.filter(t => (t.points || 0) < 100);

    // Cumulative recipients
    const cumulativeStardom = stardomTeachers.length;
    const cumulativeExcellence = teachers.filter(t => (t.points || 0) >= 200).length;
    const cumulativeProgress = teachers.filter(t => (t.points || 0) >= 100).length;

    const totalAwarded = stardomTeachers.length + excellenceTeachers.length + progressTeachers.length;
    const totalPoints = teachers.reduce((sum, t) => sum + (t.points || 0), 0);

    return {
      totalTeachers,
      totalAwarded,
      totalPoints,
      stardom: {
        count: stardomTeachers.length,
        cumulative: cumulativeStardom,
        teachers: stardomTeachers,
        percentageOfStaff: totalTeachers > 0 ? Math.round((stardomTeachers.length / totalTeachers) * 100) : 0,
        percentageOfBadges: totalAwarded > 0 ? Math.round((stardomTeachers.length / totalAwarded) * 100) : 0,
      },
      excellence: {
        count: excellenceTeachers.length,
        cumulative: cumulativeExcellence,
        teachers: excellenceTeachers,
        percentageOfStaff: totalTeachers > 0 ? Math.round((excellenceTeachers.length / totalTeachers) * 100) : 0,
        percentageOfBadges: totalAwarded > 0 ? Math.round((excellenceTeachers.length / totalAwarded) * 100) : 0,
      },
      progress: {
        count: progressTeachers.length,
        cumulative: cumulativeProgress,
        teachers: progressTeachers,
        percentageOfStaff: totalTeachers > 0 ? Math.round((progressTeachers.length / totalTeachers) * 100) : 0,
        percentageOfBadges: totalAwarded > 0 ? Math.round((progressTeachers.length / totalAwarded) * 100) : 0,
      },
      inProgress: {
        count: inProgressTeachers.length,
        teachers: inProgressTeachers,
        percentageOfStaff: totalTeachers > 0 ? Math.round((inProgressTeachers.length / totalTeachers) * 100) : 0,
      }
    };
  }, [teachers]);

  // Data for Chart 1: Breakdown of granted badges only
  const grantedBadgesData = useMemo(() => {
    if (stats.totalAwarded === 0) {
      return [
        { name: 'لا توجد أوسمة ممنوحة بعد', value: 1, color: '#e2e8f0', count: 0, isPlaceholder: true }
      ];
    }
    const data = [];
    if (stats.stardom.count > 0) {
      data.push({
        id: 'stardom',
        name: BADGE_CONFIG.stardom.name,
        value: stats.stardom.count,
        color: BADGE_CONFIG.stardom.color,
        count: stats.stardom.count,
        percent: stats.stardom.percentageOfBadges,
        tier: '300+ نقطة'
      });
    }
    if (stats.excellence.count > 0) {
      data.push({
        id: 'excellence',
        name: BADGE_CONFIG.excellence.name,
        value: stats.excellence.count,
        color: BADGE_CONFIG.excellence.color,
        count: stats.excellence.count,
        percent: stats.excellence.percentageOfBadges,
        tier: '200-299 نقطة'
      });
    }
    if (stats.progress.count > 0) {
      data.push({
        id: 'progress',
        name: BADGE_CONFIG.progress.name,
        value: stats.progress.count,
        color: BADGE_CONFIG.progress.color,
        count: stats.progress.count,
        percent: stats.progress.percentageOfBadges,
        tier: '100-199 نقطة'
      });
    }
    return data;
  }, [stats]);

  // Data for Chart 2: Full Staff Penetration
  const fullStaffData = useMemo(() => {
    if (stats.totalTeachers === 0) {
      return [{ name: 'لا توجد بيانات', value: 1, color: '#e2e8f0', count: 0, isPlaceholder: true }];
    }
    return [
      {
        id: 'stardom',
        name: 'وسام النجومية (300+)',
        value: stats.stardom.count,
        color: BADGE_CONFIG.stardom.color,
        count: stats.stardom.count,
        percent: stats.stardom.percentageOfStaff,
      },
      {
        id: 'excellence',
        name: 'وسام المثالية (200-299)',
        value: stats.excellence.count,
        color: BADGE_CONFIG.excellence.color,
        count: stats.excellence.count,
        percent: stats.excellence.percentageOfStaff,
      },
      {
        id: 'progress',
        name: 'وسام التقدم (100-199)',
        value: stats.progress.count,
        color: BADGE_CONFIG.progress.color,
        count: stats.progress.count,
        percent: stats.progress.percentageOfStaff,
      },
      {
        id: 'inProgress',
        name: 'قيد التأهيل (< 100)',
        value: stats.inProgress.count,
        color: '#cbd5e1',
        count: stats.inProgress.count,
        percent: stats.inProgress.percentageOfStaff,
      }
    ].filter(item => item.value > 0);
  }, [stats]);

  // Filtered teachers list to showcase
  const displayedTeachers = useMemo(() => {
    let list: (Teacher & { badgeTier: 'stardom' | 'excellence' | 'progress' })[] = [];
    if (selectedBadgeFilter === 'all' || selectedBadgeFilter === 'stardom') {
      list = list.concat(stats.stardom.teachers.map(t => ({ ...t, badgeTier: 'stardom' as const })));
    }
    if (selectedBadgeFilter === 'all' || selectedBadgeFilter === 'excellence') {
      list = list.concat(stats.excellence.teachers.map(t => ({ ...t, badgeTier: 'excellence' as const })));
    }
    if (selectedBadgeFilter === 'all' || selectedBadgeFilter === 'progress') {
      list = list.concat(stats.progress.teachers.map(t => ({ ...t, badgeTier: 'progress' as const })));
    }
    return list.sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [stats, selectedBadgeFilter]);

  // Send WhatsApp appreciation
  const handleSendWhatsAppCongrats = (teacher: Teacher, badgeName: string) => {
    const pts = teacher.points || 0;
    const msg = `السلام عليكم ورحمة الله وبركاته،
المكرم الأستاذ/ ${teacher.name} المحترم،

🎖️ يسر إدارة مجمع الشريعة التعليمي أن ترفع لكم أسمى آيات التهاني والتبريكات بمناسبة استحقاقكم:
⭐ [${badgeName}] ⭐
برصيد نقاط تراكمي مميز: (${pts} نقطة).

شاكرين لكم إخلاصكم وتفانيكم في أداء رسالتكم السامية، ودمتم للمجمع منارة تميز وريادة.

إدارة مجمع الشريعة التعليمي`;

    let phone = (teacher.phone || '').replace(/[^0-9]/g, '');
    if (phone.startsWith('00966')) {
      phone = phone.substring(2);
    } else if (phone.startsWith('0')) {
      phone = '966' + phone.substring(1);
    } else if (!phone.startsWith('966')) {
      phone = '966' + phone;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section id="badge-statistics-section" className="bg-white rounded-3xl shadow-sm border border-slate-150 overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-emerald-900 via-emerald-850 to-teal-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-black tracking-tight">إحصائيات الأوسمة الممنوحة حالياً</h3>
              <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-sm">
                نظام التحفيز المؤسسي
              </span>
            </div>
            <p className="text-emerald-100/80 text-xs mt-1">
              بيان تحليلي دقيق لعدد الحاصلين على وسام التقدم والمثالية والنجومية ونسب التكريم بالمجمع
            </p>
          </div>
        </div>

        {onNavigateToMotivation && (
          <button
            onClick={onNavigateToMotivation}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-emerald-100 rounded-xl border border-white/15 text-xs font-bold transition-all hover:scale-[1.02]"
          >
            <span>لوحة التحفيز والصدارة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8 space-y-8">
        {/* Row 1: Badges Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: وسام النجومية (300+ نقطة) */}
          <div 
            onClick={() => setSelectedBadgeFilter(selectedBadgeFilter === 'stardom' ? 'all' : 'stardom')}
            className={`rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
              selectedBadgeFilter === 'stardom' 
                ? 'ring-2 ring-amber-500 shadow-md bg-amber-50/70 border-amber-300' 
                : 'bg-gradient-to-b from-amber-50/40 to-white border-amber-100 hover:border-amber-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm group-hover:scale-105 transition-transform">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-amber-700 block tracking-wide">الوسام الأعلى • 300+ نقطة</span>
                  <h4 className="font-bold text-slate-900 text-base">وسام النجومية</h4>
                </div>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                {stats.stardom.percentageOfBadges}% من الأوسمة
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-100/80 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-amber-700 font-mono">{stats.stardom.count}</span>
                <span className="text-xs text-slate-500 font-medium mr-1.5">حاصل على الوسام</span>
              </div>
              <span className="text-xs text-slate-500">
                من إجمالي {stats.totalTeachers} موظف ({stats.stardom.percentageOfStaff}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
              {BADGE_CONFIG.stardom.description}
            </p>
          </div>

          {/* Card 2: وسام المثالية (200+ نقطة) */}
          <div 
            onClick={() => setSelectedBadgeFilter(selectedBadgeFilter === 'excellence' ? 'all' : 'excellence')}
            className={`rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
              selectedBadgeFilter === 'excellence' 
                ? 'ring-2 ring-purple-500 shadow-md bg-purple-50/70 border-purple-300' 
                : 'bg-gradient-to-b from-purple-50/40 to-white border-purple-100 hover:border-purple-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-sm group-hover:scale-105 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-purple-700 block tracking-wide">الوسام النموذجي • 200+ نقطة</span>
                  <h4 className="font-bold text-slate-900 text-base">وسام المثالية</h4>
                </div>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md border border-purple-200">
                {stats.excellence.percentageOfBadges}% من الأوسمة
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-100/80 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-purple-700 font-mono">{stats.excellence.count}</span>
                <span className="text-xs text-slate-500 font-medium mr-1.5">حاصل على الوسام</span>
              </div>
              <span className="text-xs text-slate-500">
                من إجمالي {stats.totalTeachers} موظف ({stats.excellence.percentageOfStaff}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
              {BADGE_CONFIG.excellence.description}
            </p>
          </div>

          {/* Card 3: وسام التقدم (100+ نقطة) */}
          <div 
            onClick={() => setSelectedBadgeFilter(selectedBadgeFilter === 'progress' ? 'all' : 'progress')}
            className={`rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
              selectedBadgeFilter === 'progress' 
                ? 'ring-2 ring-sky-500 shadow-md bg-sky-50/70 border-sky-300' 
                : 'bg-gradient-to-b from-sky-50/40 to-white border-sky-100 hover:border-sky-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shadow-sm group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-sky-700 block tracking-wide">وسام البداية • 100+ نقطة</span>
                  <h4 className="font-bold text-slate-900 text-base">وسام التقدم</h4>
                </div>
              </div>
              <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-md border border-sky-200">
                {stats.progress.percentageOfBadges}% من الأوسمة
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-100/80 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-sky-700 font-mono">{stats.progress.count}</span>
                <span className="text-xs text-slate-500 font-medium mr-1.5">حاصل على الوسام</span>
              </div>
              <span className="text-xs text-slate-500">
                من إجمالي {stats.totalTeachers} موظف ({stats.progress.percentageOfStaff}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
              {BADGE_CONFIG.progress.description}
            </p>
          </div>
        </div>

        {/* Row 2: Charts & Visual Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Circular Chart Container (Col span 7) */}
          <div className="lg:col-span-7 bg-slate-50/60 rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between">
            {/* Chart Mode Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-850 flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">الرسم البياني الدائري للأوسمة</h4>
                  <p className="text-[11px] text-slate-500">تمثيل بصري تفاعلي لنسب استحقاق الأوسمة</p>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveChartMode('granted')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeChartMode === 'granted'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الأوسمة الممنوحة ({stats.totalAwarded})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartMode('all_staff')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeChartMode === 'all_staff'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  شامل المنسوبين ({stats.totalTeachers})
                </button>
              </div>
            </div>

            {/* Circular Pie Chart Graphic */}
            <div className="relative h-64 w-full flex items-center justify-center my-2">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={activeChartMode === 'granted' ? grantedBadgesData : fullStaffData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={96}
                      paddingAngle={stats.totalAwarded > 1 ? 4 : 0}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {(activeChartMode === 'granted' ? grantedBadgesData : fullStaffData).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          className="cursor-pointer transition-opacity hover:opacity-85"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              )}

              {/* Central Donut Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {activeChartMode === 'granted' ? (
                  <>
                    <span className="text-3xl font-black text-slate-900 font-mono tracking-tight leading-none">
                      {stats.totalAwarded}
                    </span>
                    <span className="text-xs font-bold text-slate-500 mt-1">
                      وسام ممنوح
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-black text-emerald-800 font-mono tracking-tight leading-none">
                      {stats.totalTeachers > 0 ? Math.round((stats.totalAwarded / stats.totalTeachers) * 100) : 0}%
                    </span>
                    <span className="text-xs font-bold text-slate-500 mt-1">
                      نسبة التكريم
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Custom Interactive Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-200/80">
              {/* Legend Item: Stardom */}
              <button
                type="button"
                onClick={() => setSelectedBadgeFilter(selectedBadgeFilter === 'stardom' ? 'all' : 'stardom')}
                className={`p-2.5 rounded-xl border text-right transition-all ${
                  selectedBadgeFilter === 'stardom' ? 'bg-amber-100/70 border-amber-300 ring-1 ring-amber-400' : 'bg-white border-slate-200/90 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">وسام النجومية</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black text-amber-700 font-mono">{stats.stardom.count}</span>
                  <span className="text-[11px] text-slate-500 font-medium">({stats.stardom.percentageOfBadges}%)</span>
                </div>
              </button>

              {/* Legend Item: Excellence */}
              <button
                type="button"
                onClick={() => setSelectedBadgeFilter(selectedBadgeFilter === 'excellence' ? 'all' : 'excellence')}
                className={`p-2.5 rounded-xl border text-right transition-all ${
                  selectedBadgeFilter === 'excellence' ? 'bg-purple-100/70 border-purple-300 ring-1 ring-purple-400' : 'bg-white border-slate-200/90 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">وسام المثالية</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black text-purple-700 font-mono">{stats.excellence.count}</span>
                  <span className="text-[11px] text-slate-500 font-medium">({stats.excellence.percentageOfBadges}%)</span>
                </div>
              </button>

              {/* Legend Item: Progress */}
              <button
                type="button"
                onClick={() => setSelectedBadgeFilter(selectedBadgeFilter === 'progress' ? 'all' : 'progress')}
                className={`p-2.5 rounded-xl border text-right transition-all ${
                  selectedBadgeFilter === 'progress' ? 'bg-sky-100/70 border-sky-300 ring-1 ring-sky-400' : 'bg-white border-slate-200/90 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">وسام التقدم</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black text-sky-700 font-mono">{stats.progress.count}</span>
                  <span className="text-[11px] text-slate-500 font-medium">({stats.progress.percentageOfBadges}%)</span>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Summary & Milestones (Col span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Cumulative Thresholds Box */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Medal className="w-4 h-4 text-emerald-700" />
                  <h5 className="font-bold text-slate-900 text-sm">التراكمي ومستويات الاستحقاق</h5>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {stats.totalAwarded} من {stats.totalTeachers} موظف
                </span>
              </div>

              {/* Progress Bar 1: Stardom */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-800 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    استحقاق وسام النجومية (300+ نقطة)
                  </span>
                  <span className="text-slate-800 font-mono">{stats.stardom.cumulative} موظف</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-700" 
                    style={{ width: `${stats.totalTeachers > 0 ? (stats.stardom.cumulative / stats.totalTeachers) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Progress Bar 2: Excellence */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-purple-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    استحقاق وسام المثالية (200+ نقطة)
                  </span>
                  <span className="text-slate-800 font-mono">{stats.excellence.cumulative} موظف</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-700" 
                    style={{ width: `${stats.totalTeachers > 0 ? (stats.excellence.cumulative / stats.totalTeachers) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Progress Bar 3: Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-sky-800 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                    استحقاق وسام التقدم (100+ نقطة)
                  </span>
                  <span className="text-slate-800 font-mono">{stats.progress.cumulative} موظف</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-700" 
                    style={{ width: `${stats.totalTeachers > 0 ? (stats.progress.cumulative / stats.totalTeachers) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* School Motivation Impact Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-2xl p-5 border border-emerald-200/70 text-emerald-950 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">مجموع نقاط التحفيز بالمجمع</span>
                <span className="text-lg font-black text-emerald-900 font-mono">
                  {stats.totalPoints.toLocaleString('ar-SA')} نقطة
                </span>
              </div>
              <p className="text-xs text-emerald-800/90 leading-relaxed">
                يتم منح النقاط وفق 12 مجالاً معتمداً تشمل الانضباط المدرسي، المبادرات النوعية، وتفعيل التقنيات التعليمية.
              </p>
              {onNavigateToMotivation && (
                <button
                  type="button"
                  onClick={onNavigateToMotivation}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>إدارة ومنح نقاط التحفيز للأوسمة</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Filterable Recipients Showcase */}
        <div className="pt-6 border-t border-slate-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>قائمة الحاصلين على الأوسمة</span>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {displayedTeachers.length} موظف
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                استعراض أسماء المكرّمين ورصيد نقاطهم مع إمكانية إرسال بطاقة تهنئة فورية
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedBadgeFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedBadgeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({stats.totalAwarded})
              </button>
              <button
                type="button"
                onClick={() => setSelectedBadgeFilter('stardom')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  selectedBadgeFilter === 'stardom'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-800 hover:bg-amber-100/50'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>النجومية ({stats.stardom.count})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBadgeFilter('excellence')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  selectedBadgeFilter === 'excellence'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-800 hover:bg-purple-100/50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>المثالية ({stats.excellence.count})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBadgeFilter('progress')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  selectedBadgeFilter === 'progress'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-sky-800 hover:bg-sky-100/50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>التقدم ({stats.progress.count})</span>
              </button>
            </div>
          </div>

          {/* Grid of recipients */}
          {displayedTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
              {displayedTeachers.map(teacher => {
                const badgeCfg = BADGE_CONFIG[teacher.badgeTier];
                const IconComp = badgeCfg.icon;

                return (
                  <div 
                    key={teacher.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badgeCfg.lightBg} ${badgeCfg.border}`}>
                        <IconComp className={`w-5 h-5 ${badgeCfg.accentText}`} />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-900 text-sm truncate">{teacher.name}</h5>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="truncate">{teacher.specialty || teacher.discipline || 'معلم'}</span>
                          <span>•</span>
                          <span className="font-bold font-mono text-emerald-700">{teacher.points || 0} نقطة</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${badgeCfg.lightBg} ${badgeCfg.border} ${badgeCfg.text}`}>
                        {badgeCfg.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSendWhatsAppCongrats(teacher, badgeCfg.name)}
                        title="إرسال بطاقة تهنئة بالوسام عبر الواتساب"
                        className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">لا يوجد موظفون في هذا الوسام حالياً</p>
              <p className="text-xs text-slate-500 mt-1">
                يمكنك منح نقاط التكريم والتحفيز من خلال لوحة التحفيز لترقية الموظفين إلى هذا الوسام.
              </p>
              {onNavigateToMotivation && (
                <button
                  type="button"
                  onClick={onNavigateToMotivation}
                  className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 hover:bg-emerald-900 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  <span>الانتقال لمنح نقاط التحفيز</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
