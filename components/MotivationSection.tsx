"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Trophy, 
  Award, 
  Crown, 
  Star, 
  Sparkles, 
  TrendingUp, 
  Plus, 
  Search, 
  Share2, 
  CheckCircle, 
  Clock, 
  Shield, 
  Heart, 
  Laptop, 
  BookOpen, 
  Users, 
  Check, 
  X, 
  Loader2, 
  Filter, 
  Trash2, 
  Phone,
  ArrowUpRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { BADGE_TIERS, calculateBadges } from '@/src/lib/motivation';

interface MotivationDomain {
  id: number;
  title: string;
  description: string | null;
  points: number;
  category: string;
  icon: string | null;
  createdAt: string;
}

interface TeacherPointsProfile {
  id: number;
  name: string;
  phone: string;
  nationalId?: string;
  specialty?: string;
  jobTitle?: string;
  level?: string;
  points: number;
  portalToken?: string;
  avatarUrl?: string | null;
  rank: number;
  earnedBadges: any[];
  highestBadge: any;
  nextBadge: any;
  pointsToNext: number;
  progressPercent: number;
  hasProgress: boolean;
  hasExcellence: boolean;
  hasStardom: boolean;
}

interface MotivationLog {
  id: number;
  teacherId: number;
  domainId: number | null;
  domainTitle: string;
  points: number;
  notes: string | null;
  grantedBy: string;
  createdAt: string;
  teacherName: string;
  teacherPhone: string;
  teacherSpecialty?: string;
}

interface MotivationSectionProps {
  getToken: () => Promise<string | null>;
  allTeachers: any[];
}

export default function MotivationSection({ getToken, allTeachers }: MotivationSectionProps) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [domains, setDomains] = useState<MotivationDomain[]>([]);
  const [rankedTeachers, setRankedTeachers] = useState<TeacherPointsProfile[]>([]);
  const [logs, setLogs] = useState<MotivationLog[]>([]);
  const [summary, setSummary] = useState<any>({
    totalTeachers: 0,
    totalPointsAwarded: 0,
    progressBadgesCount: 0,
    excellenceBadgesCount: 0,
    stardomBadgesCount: 0,
  });

  // UI Tabs & Filters
  const [activeSubTab, setActiveSubTab] = useState<'leaderboard' | 'domains' | 'logs'>('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'stardom' | 'excellence' | 'progress'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [customDomainTitle, setCustomDomainTitle] = useState<string>('');
  const [pointsInput, setPointsInput] = useState<number>(20);
  const [notesInput, setNotesInput] = useState<string>('');
  const [sendWhatsAppAlert, setSendWhatsAppAlert] = useState<boolean>(true);

  // Add Domain Modal
  const [isCreateDomainOpen, setIsCreateDomainOpen] = useState(false);
  const [newDomainTitle, setNewDomainTitle] = useState('');
  const [newDomainPoints, setNewDomainPoints] = useState(25);
  const [newDomainCategory, setNewDomainCategory] = useState('تعليمي وتدريس');
  const [newDomainDesc, setNewDomainDesc] = useState('');

  // Celebration Modal
  const [unlockedCelebration, setUnlockedCelebration] = useState<{
    teacherName: string;
    teacherPhone: string;
    badgeName: string;
    points: number;
  } | null>(null);

  // Selected Teacher Logs Detail Drawer/Modal
  const [viewingTeacherLogs, setViewingTeacherLogs] = useState<TeacherPointsProfile | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/motivation', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDomains(data.domains || []);
        setRankedTeachers(data.teachers || []);
        setLogs(data.logs || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error('Error fetching motivation data:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const token = await getToken();
        const res = await fetch('/api/motivation', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setDomains(data.domains || []);
          setRankedTeachers(data.teachers || []);
          setLogs(data.logs || []);
          setSummary(data.summary || {});
        }
      } catch (err) {
        console.error('Error loading motivation data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  // Handle Domain Selection in Grant Modal
  const handleDomainChange = (domainId: string) => {
    setSelectedDomainId(domainId);
    if (domainId) {
      const found = domains.find(d => String(d.id) === String(domainId));
      if (found) {
        setPointsInput(found.points);
        setCustomDomainTitle(found.title);
      }
    }
  };

  // Open Grant Points Modal for specific teacher or domain
  const openGrantForTeacher = (teacher: any) => {
    setSelectedTeacherId(String(teacher.id));
    if (domains.length > 0) {
      setSelectedDomainId(String(domains[0].id));
      setPointsInput(domains[0].points);
      setCustomDomainTitle(domains[0].title);
    }
    setNotesInput('');
    setIsGrantModalOpen(true);
  };

  const openGrantForDomain = (domain: MotivationDomain) => {
    setSelectedDomainId(String(domain.id));
    setPointsInput(domain.points);
    setCustomDomainTitle(domain.title);
    setNotesInput('');
    setIsGrantModalOpen(true);
  };

  // Submit Grant Points
  const handleGrantPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      alert('يرجى اختيار الموظف أولاً');
      return;
    }
    if (!pointsInput || pointsInput <= 0) {
      alert('يرجى تحديد عدد نقاط صحيح');
      return;
    }

    const domainTitle = customDomainTitle || (selectedDomainId ? domains.find(d => String(d.id) === String(selectedDomainId))?.title : 'إنجاز متميز') || 'إنجاز متميز';
    const targetTeacher = allTeachers.find(t => String(t.id) === String(selectedTeacherId)) || rankedTeachers.find(t => String(t.id) === String(selectedTeacherId));

    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/motivation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          teacherId: Number(selectedTeacherId),
          domainId: selectedDomainId ? Number(selectedDomainId) : null,
          domainTitle,
          points: Number(pointsInput),
          notes: notesInput.trim() || null,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        setIsGrantModalOpen(false);

        // Check if unlocked new badge
        if (resData.newlyUnlockedBadge && targetTeacher) {
          setUnlockedCelebration({
            teacherName: targetTeacher.name,
            teacherPhone: targetTeacher.phone,
            badgeName: resData.newlyUnlockedBadge,
            points: resData.teacher.points,
          });
        }

        // WhatsApp notification
        if (sendWhatsAppAlert && targetTeacher) {
          sendMotivationWhatsApp(targetTeacher, domainTitle, pointsInput, resData.teacher.points, resData.newlyUnlockedBadge);
        }

        // Reset form
        setSelectedTeacherId('');
        setSelectedDomainId('');
        setCustomDomainTitle('');
        setNotesInput('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'حدث خطأ أثناء منح النقاط');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالخادم لمنح النقاط');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Create Domain
  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainTitle.trim() || !newDomainPoints) {
      alert('يرجى إدخال اسم المجال والنقاط');
      return;
    }

    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/motivation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          action: 'create_domain',
          title: newDomainTitle.trim(),
          description: newDomainDesc.trim(),
          points: Number(newDomainPoints),
          category: newDomainCategory,
        }),
      });

      if (res.ok) {
        setIsCreateDomainOpen(false);
        setNewDomainTitle('');
        setNewDomainDesc('');
        setNewDomainPoints(25);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل إضافة المجال');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالخادم لإضافة المجال');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Domain
  const handleDeleteDomain = async (domainId: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المجال من المنظومة؟')) return;
    try {
      const token = await getToken();
      const res = await fetch('/api/motivation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          action: 'delete_domain',
          domainId,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // WhatsApp helper for motivation & badges
  const sendMotivationWhatsApp = (
    teacher: any, 
    domainTitle: string, 
    grantedPts: number, 
    totalPts: number, 
    newBadge?: string | null
  ) => {
    const portalUrl = teacher.portalToken ? `https://shreeah2026.ai.studio/teacher/${teacher.id}/${teacher.portalToken}` : `https://shreeah2026.ai.studio`;

    let badgeText = '';
    if (newBadge) {
      badgeText = `\n🎖️ *مبارك! لقد ارتقيتم إلى استحقاق:* *[${newBadge}]* بمجموع نقاطكم المميزة!`;
    } else if (totalPts >= 300) {
      badgeText = `\n👑 *حامل وسام النجومية* (300+ نقطة)`;
    } else if (totalPts >= 200) {
      badgeText = `\n🥈 *حامل وسام المثالية* (200+ نقطة)`;
    } else if (totalPts >= 100) {
      badgeText = `\n🥉 *حامل وسام التقدم* (100+ نقطة)`;
    }

    const msg = `*مجمع الشريعة التعليمي - إشعار التكريم والتحفيز*

المكرم أ. ${teacher.name} المحترم،
السلام عليكم ورحمة الله وبركاته،،

يسر إدارة مجمع الشريعة التعليمي أن تتقدم لكم بجزيل الشكر والتقدير لإنجازكم المتميز في:
✨ *المجال:* ${domainTitle}
➕ *النقاط الممنوحة:* +${grantedPts} نقطة
🏆 *رصيد نقاطكم التراكمي الآن:* ${totalPts} نقطة${badgeText}

يرجى التكرم بالدخول على رابط المنصة الإلكترونية للمعاينة والاعتماد ومتابعة أوسمتكم الشرفية وسجل التكريم:
🔗 رابط المنصة الإلكترونية للمعاينة والاعتماد:
https://shreeah2026.ai.studio

(أو عبر رابطكم المباشر السريع: ${portalUrl})

سائلين الله لكم دوام التوفيق والتألق والريادة.`;

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

  // Filtered teachers for Leaderboard
  const filteredTeachers = useMemo(() => {
    return rankedTeachers.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.specialty && t.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.level && t.level.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (badgeFilter === 'stardom') return t.hasStardom;
      if (badgeFilter === 'excellence') return t.hasExcellence;
      if (badgeFilter === 'progress') return t.hasProgress;
      return true;
    });
  }, [rankedTeachers, searchQuery, badgeFilter]);

  // Filtered domains
  const filteredDomains = useMemo(() => {
    return domains.filter(d => {
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
      return true;
    });
  }, [domains, categoryFilter]);

  const domainCategories = useMemo(() => {
    const set = new Set(domains.map(d => d.category).filter(Boolean));
    return Array.from(set);
  }, [domains]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-black mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>منظومة التحفيز والأوسمة المؤسسية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>التكريم والتحفيز</span>
              <Trophy className="w-7 h-7 text-amber-400" />
            </h2>
            <p className="text-emerald-100/90 text-sm mt-2 max-w-2xl leading-relaxed">
              احتساب نقاط الإنجاز التراكمية في حساب الموظف ومنح أوسمة التميز: 
              <strong className="text-sky-300 mr-1">وسام التقدم (100)</strong>، 
              <strong className="text-purple-300 mr-1">وسام المثالية (200)</strong>، 
              و<strong className="text-amber-300 mr-1">وسام النجومية (300)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setSelectedTeacherId('');
                if (domains.length > 0) {
                  setSelectedDomainId(String(domains[0].id));
                  setPointsInput(domains[0].points);
                  setCustomDomainTitle(domains[0].title);
                }
                setNotesInput('');
                setIsGrantModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>منح نقاط تكريم لموظف</span>
            </button>

            <button
              onClick={() => setIsCreateDomainOpen(true)}
              className="flex-1 sm:flex-none px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>إضافة مجال إنجاز</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Medals Explanation & Stats Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Medal 1: وسام التقدم (100 نقطة) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-sky-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-sky-50 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span className="text-xs font-black text-sky-700 tracking-wider">المستوى الأول (100 نقطة)</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                <span>وسام التقدم</span>
                <TrendingUp className="w-5 h-5 text-sky-600" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                يُمنح عند جمع 100 نقطة تقديراً للمثابرة والانضباط والتقدم المستمر في الأداء التعليمي والإداري.
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 shadow-inner">
              <TrendingUp className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-500 font-medium">الحاصلون على الوسام:</span>
            <span className="px-3 py-1 bg-sky-100/70 text-sky-800 font-black rounded-full text-xs font-mono">
              {summary.progressBadgesCount || 0} موظف
            </span>
          </div>
        </div>

        {/* Medal 2: وسام المثالية (200 نقطة) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-purple-50 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-xs font-black text-purple-700 tracking-wider">المستوى الثاني (200 نقطة)</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                <span>وسام المثالية</span>
                <Award className="w-5 h-5 text-purple-600" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                يُمنح عند جمع 200 نقطة تكريماً للأداء النموذجي والإشراف والتعاون المثمر والمبادرات النوعية.
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 shadow-inner">
              <Award className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-500 font-medium">الحاصلون على الوسام:</span>
            <span className="px-3 py-1 bg-purple-100/70 text-purple-800 font-black rounded-full text-xs font-mono">
              {summary.excellenceBadgesCount || 0} موظف
            </span>
          </div>
        </div>

        {/* Medal 3: وسام النجومية (300 نقطة) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-amber-50 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-xs font-black text-amber-700 tracking-wider">الوسام الأعلى (300 نقطة)</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                <span>وسام النجومية</span>
                <Crown className="w-5 h-5 text-amber-600" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                وسام القمة والريادة بالمجمع، يُمنح عند بلوغ 300 نقطة تقديراً للصدارة والإبداع والابتكار الاستثنائي.
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
              <Crown className="w-7 h-7" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-500 font-medium">الحاصلون على الوسام:</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-black rounded-full text-xs font-mono">
              {summary.stardomBadgesCount || 0} موظف
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === 'leaderboard'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>لوحة صدارة الموظفين والأوسمة</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/20 text-white font-mono">
              {rankedTeachers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('domains')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === 'domains'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>مجالات التكريم والنقاط</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/20 text-white font-mono">
              {domains.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === 'logs'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-slate-300" />
            <span>سجل عمليات المنح الأخيرة</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/20 text-white font-mono">
              {logs.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 px-2 font-medium">
          <span>إجمالي النقاط الممنوحة بالمجمع:</span>
          <span className="text-emerald-800 font-mono font-black text-sm bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
            {summary.totalPointsAwarded || 0} نقطة
          </span>
        </div>
      </div>

      {/* Tab 1: Leaderboard & Teachers' Points */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو التخصص أو المرحلة..."
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Badge Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              <span className="text-xs text-slate-500 font-bold ml-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                تصفية بالأوسمة:
              </span>

              <button
                onClick={() => setBadgeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  badgeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل
              </button>

              <button
                onClick={() => setBadgeFilter('stardom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  badgeFilter === 'stardom'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                وسام النجومية (300+)
              </button>

              <button
                onClick={() => setBadgeFilter('excellence')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  badgeFilter === 'excellence'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                وسام المثالية (200+)
              </button>

              <button
                onClick={() => setBadgeFilter('progress')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  badgeFilter === 'progress'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                وسام التقدم (100+)
              </button>
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4 text-center w-16">الترتيب</th>
                    <th className="px-6 py-4 text-right">الموظف</th>
                    <th className="px-6 py-4 text-center">الرصيد التراكمي</th>
                    <th className="px-6 py-4 text-center">الأوسمة المحققة</th>
                    <th className="px-6 py-4 text-right">التقدم نحو الوسام القادم</th>
                    <th className="px-6 py-4 text-center">الإجراءات والتحفيز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                        <span>جارٍ تحميل بيانات النقاط والأوسمة...</span>
                      </td>
                    </tr>
                  ) : filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        لا يوجد موظفون مطابقون لخيارات البحث أو التصفية الحالية.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher, index) => {
                      const pts = teacher.points || 0;

                      return (
                        <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Rank */}
                          <td className="px-6 py-4 text-center font-bold">
                            {index === 0 ? (
                              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 inline-flex items-center justify-center font-black shadow-xs">
                                🥇
                              </span>
                            ) : index === 1 ? (
                              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 inline-flex items-center justify-center font-black shadow-xs">
                                🥈
                              </span>
                            ) : index === 2 ? (
                              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-900 inline-flex items-center justify-center font-black shadow-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400 font-bold">
                                #{index + 1}
                              </span>
                            )}
                          </td>

                          {/* Teacher Name & Specialty */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden shadow-2xs">
                                {teacher.avatarUrl ? (
                                  <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
                                ) : (
                                  teacher.name[0]
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block text-sm">
                                  {teacher.name}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                  <span>{teacher.jobTitle || 'موظف'}</span>
                                  {teacher.specialty && (
                                    <>
                                      <span>•</span>
                                      <span>{teacher.specialty}</span>
                                    </>
                                  )}
                                  {teacher.level && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-700 font-medium">{teacher.level}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Points Counter */}
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200/80 shadow-xs">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-black text-base font-mono">{pts}</span>
                              <span className="text-xs font-bold text-emerald-700">نقطة</span>
                            </div>
                          </td>

                          {/* Earned Badges Badges */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* وسام النجومية (300) */}
                              <span
                                title="وسام النجومية (300 نقطة)"
                                className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                                  teacher.hasStardom
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs ring-2 ring-amber-400/20'
                                    : 'bg-slate-100 text-slate-300 border border-slate-200 opacity-40 grayscale'
                                }`}
                              >
                                <Crown className="w-3.5 h-3.5 text-amber-600" />
                                <span>النجومية</span>
                              </span>

                              {/* وسام المثالية (200) */}
                              <span
                                title="وسام المثالية (200 نقطة)"
                                className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                                  teacher.hasExcellence
                                    ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-xs ring-2 ring-purple-400/20'
                                    : 'bg-slate-100 text-slate-300 border border-slate-200 opacity-40 grayscale'
                                }`}
                              >
                                <Award className="w-3.5 h-3.5 text-purple-600" />
                                <span>المثالية</span>
                              </span>

                              {/* وسام التقدم (100) */}
                              <span
                                title="وسام التقدم (100 نقطة)"
                                className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                                  teacher.hasProgress
                                    ? 'bg-sky-100 text-sky-900 border border-sky-300 shadow-xs ring-2 ring-sky-400/20'
                                    : 'bg-slate-100 text-slate-300 border border-slate-200 opacity-40 grayscale'
                                }`}
                              >
                                <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                                <span>التقدم</span>
                              </span>
                            </div>
                          </td>

                          {/* Progress to Next Badge */}
                          <td className="px-6 py-4">
                            <div className="w-48 max-w-full">
                              <div className="flex justify-between items-center text-xs mb-1 font-bold">
                                {teacher.nextBadge ? (
                                  <>
                                    <span className="text-slate-600">نحو {teacher.nextBadge.name}</span>
                                    <span className="text-slate-400 text-[11px] font-mono">
                                      متبقي {teacher.pointsToNext} نقطة
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-amber-600 flex items-center gap-1 text-[11px]">
                                    <Crown className="w-3 h-3" />
                                    حقق جميع الأوسمة بجدارة!
                                  </span>
                                )}
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-l from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                                  style={{ width: `${teacher.progressPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Grant points button */}
                              <button
                                onClick={() => openGrantForTeacher(teacher)}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95"
                                title="منح نقاط تكريم لهذا الموظف"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>منح نقاط</span>
                              </button>

                              {/* WhatsApp Share Card */}
                              <button
                                onClick={() => sendMotivationWhatsApp(teacher, 'مجموع نقاط التكريم والتحفيز', 0, pts)}
                                className="p-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl transition-all"
                                title="إرسال بطاقة رصيد النقاط والأوسمة عبر الواتس آب"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* View detail logs */}
                              <button
                                onClick={() => setViewingTeacherLogs(teacher)}
                                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
                                title="عرض سجل إنجازات ونقاط الموظف"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Motivation Domains */}
      {activeSubTab === 'domains' && (
        <div className="space-y-6">
          {/* Domains Header & Category Filter */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">مجالات التميز والإنجاز المعتمدة</h3>
              <p className="text-xs text-slate-500 mt-1">
                لكل مجال عدد نقاط محدد يضاف إلى رصيد الموظف التراكمي عند إنجازه
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-bold">التصنيف:</span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({domains.length})
              </button>
              {domainCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-emerald-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}

              <button
                onClick={() => setIsCreateDomainOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs mr-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مجال جديد</span>
              </button>
            </div>
          </div>

          {/* Domains Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDomains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600">
                      {domain.category}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-black font-mono flex items-center gap-1 border border-emerald-200">
                      <Sparkles className="w-3 h-3 text-emerald-700" />
                      +{domain.points} نقطة
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 mb-2 group-hover:text-emerald-800 transition-colors">
                    {domain.title}
                  </h4>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[38px]">
                    {domain.description || 'إنجاز متطلبات ومعايير هذا المجال والارتقاء بالأداء المهني.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openGrantForDomain(domain)}
                    className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-700" />
                    <span>منح هذا المجال لموظف</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="حذف المجال"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Recent Granted Points Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">سجل عمليات التكريم الممنوحة</h3>
              <p className="text-xs text-slate-500 mt-0.5">توثيق زمني للنقاط الممنوحة للموظفين واعتمادات الإدارة</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border">
              {logs.length} عملية مسجلة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs font-bold">
                <tr>
                  <th className="px-6 py-4 text-right">الموظف</th>
                  <th className="px-6 py-4 text-right">المجال المنجز</th>
                  <th className="px-6 py-4 text-center">النقاط الممنوحة</th>
                  <th className="px-6 py-4 text-right">ملاحظات الاعتماد</th>
                  <th className="px-6 py-4 text-right">التاريخ</th>
                  <th className="px-6 py-4 text-center">مشاركة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      لا توجد عمليات منح سابقة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{log.teacherName}</span>
                        <span className="text-xs text-slate-400">{log.teacherSpecialty || 'موظف'}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {log.domainTitle}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-black text-xs rounded-full">
                          +{log.points} نقطة
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">
                        {log.notes || 'اعتماد رسمي مباشر'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            const t = allTeachers.find(x => x.id === log.teacherId) || { name: log.teacherName, phone: log.teacherPhone };
                            sendMotivationWhatsApp(t, log.domainTitle, log.points, 0);
                          }}
                          className="p-2 text-[#128C7E] hover:bg-emerald-50 rounded-xl transition-all"
                          title="إعادة إرسال إشعار التكريم عبر الواتس آب"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Modal: Grant Points to Teacher --- */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">منح نقاط تكريم وتحفيز</h3>
                  <p className="text-xs text-slate-500 mt-0.5">إضافة نقاط في رصيد الموظف التراكمي وتحديث أوسمته</p>
                </div>
              </div>
              <button 
                onClick={() => setIsGrantModalOpen(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantPoints} className="space-y-5">
              {/* Select Teacher */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">الموظف المكرم *</label>
                <select
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-medium"
                >
                  <option value="">اختر الموظف...</option>
                  {(allTeachers.length > 0 ? allTeachers : rankedTeachers).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty || t.level || 'موظف'})
                    </option>
                  ))}
                </select>

                {/* Selected teacher points summary if available */}
                {selectedTeacherId && (() => {
                  const curr = rankedTeachers.find(t => String(t.id) === String(selectedTeacherId));
                  if (!curr) return null;
                  return (
                    <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">الرصيد الحالي:</span>
                        <span className="font-bold font-mono text-emerald-800 text-sm">{curr.points || 0} نقطة</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {curr.hasStardom && <span className="text-amber-600 font-bold">👑 وسام النجومية</span>}
                        {!curr.hasStardom && curr.hasExcellence && <span className="text-purple-600 font-bold">🥈 وسام المثالية</span>}
                        {!curr.hasStardom && !curr.hasExcellence && curr.hasProgress && <span className="text-sky-600 font-bold">🥉 وسام التقدم</span>}
                        {!curr.hasProgress && <span className="text-slate-400">قيد التقدم</span>}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Select Domain */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">مجال الإنجاز *</label>
                <select
                  value={selectedDomainId}
                  onChange={e => handleDomainChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
                >
                  <option value="">اختر من المجالات المعتمدة...</option>
                  {domains.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} (+{d.points} نقطة) - {d.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title / Points Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">مسمى الإنجاز / الموضوع</label>
                  <input
                    type="text"
                    value={customDomainTitle}
                    onChange={e => setCustomDomainTitle(e.target.value)}
                    required
                    placeholder="مثال: الانضباط والالتزام بالدوام والحصص"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">النقاط الممنوحة</label>
                  <input
                    type="number"
                    value={pointsInput}
                    onChange={e => setPointsInput(Number(e.target.value))}
                    min={1}
                    max={100}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">ملاحظات أو مناسبة التكريم (اختياري)</label>
                <textarea
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  rows={2}
                  placeholder="مثال: تقديراً للأداء النوعي والمبادرة خلال الفصل الدراسي..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-slate-800"
                />
              </div>

              {/* Send WhatsApp Checkbox */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendWhatsAppAlert}
                    onChange={e => setSendWhatsAppAlert(e.target.checked)}
                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      إرسال إشعار تهنئة وبطاقة رصيد فوري عبر الواتس آب للموظف
                    </span>
                    <span className="text-[11px] text-slate-500">
                      فتح تطبيق الواتس آب برسالة تهنئة رسمية تتضمن النقاط المضافة ورابط بوابته
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>اعتماد ومنح النقاط</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Add New Domain --- */}
      {isCreateDomainOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">إضافة مجال إنجاز جديد</h3>
                  <p className="text-xs text-slate-500 mt-0.5">تحديد معيار تكريم ونقاطه المخصصة</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateDomainOpen(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDomain} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">عنوان المجال *</label>
                <input
                  type="text"
                  value={newDomainTitle}
                  onChange={e => setNewDomainTitle(e.target.value)}
                  required
                  placeholder="مثال: الإشراف التام على الأنشطة المدرسية"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">النقاط المحددة *</label>
                  <input
                    type="number"
                    value={newDomainPoints}
                    onChange={e => setNewDomainPoints(Number(e.target.value))}
                    min={1}
                    max={100}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">التصنيف</label>
                  <select
                    value={newDomainCategory}
                    onChange={e => setNewDomainCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="تعليمي وتدريس">تعليمي وتدريس</option>
                    <option value="انضباط ودوام">انضباط ودوام</option>
                    <option value="أنشطة ومبادرات">أنشطة ومبادرات</option>
                    <option value="تطوير مهني">تطوير مهني</option>
                    <option value="إداري وتنظيمي">إداري وتنظيمي</option>
                    <option value="إشراف ومناوبة">إشراف ومناوبة</option>
                    <option value="شراكة مجتمعية">شراكة مجتمعية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">وصف متطلبات الإنجاز</label>
                <textarea
                  value={newDomainDesc}
                  onChange={e => setNewDomainDesc(e.target.value)}
                  rows={3}
                  placeholder="وصف مختصر لما هو مطلوب لتحقيق نقاط هذا المجال..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateDomainOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>حفظ المجال</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Celebration Modal: Badge Unlocked --- */}
      {unlockedCelebration && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-b from-white to-amber-50/50 rounded-3xl max-w-md w-full p-8 shadow-2xl border-2 border-amber-300 text-center relative overflow-hidden">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-xl mb-4">
              <Crown className="w-10 h-10 animate-bounce" />
            </div>

            <span className="px-3.5 py-1 bg-amber-200/80 text-amber-950 rounded-full text-xs font-black inline-block mb-3">
              🎉 مبارك استحقاق وسام جديد!
            </span>

            <h3 className="text-2xl font-black text-slate-900 mb-1">
              {unlockedCelebration.teacherName}
            </h3>

            <p className="text-base font-black text-amber-800 mb-4">
              نال بجدارة واستحقاق: {unlockedCelebration.badgeName}
            </p>

            <p className="text-xs text-slate-600 leading-relaxed mb-6 bg-white/80 p-4 rounded-2xl border border-amber-200/60 shadow-xs">
              بلغ رصيد نقاط الموظف التراكمي <strong>{unlockedCelebration.points} نقطة</strong>، متوجاً عطاءه المتميز في مسيرة مجمع الشريعة التعليمي.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const t = { name: unlockedCelebration.teacherName, phone: unlockedCelebration.teacherPhone };
                  sendMotivationWhatsApp(t, 'ترقية وسام استثنائي', 0, unlockedCelebration.points, unlockedCelebration.badgeName);
                  setUnlockedCelebration(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-emerald-200" />
                <span>إرسال بطاقة التهنئة بالوسام عبر الواتس آب</span>
              </button>

              <button
                onClick={() => setUnlockedCelebration(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal / Drawer: Viewing Teacher Logs Detail --- */}
      {viewingTeacherLogs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewingTeacherLogs.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سجل إنجازات ونقاط الموظف التراكمية ({viewingTeacherLogs.points} نقطة)
                </p>
              </div>
              <button
                onClick={() => setViewingTeacherLogs(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badges overview */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className={`p-3 rounded-2xl border text-center ${
                viewingTeacherLogs.hasProgress ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200 opacity-40'
              }`}>
                <TrendingUp className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold block text-slate-800">وسام التقدم</span>
                <span className="text-[10px] text-slate-400">100 نقطة</span>
              </div>

              <div className={`p-3 rounded-2xl border text-center ${
                viewingTeacherLogs.hasExcellence ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200 opacity-40'
              }`}>
                <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold block text-slate-800">وسام المثالية</span>
                <span className="text-[10px] text-slate-400">200 نقطة</span>
              </div>

              <div className={`p-3 rounded-2xl border text-center ${
                viewingTeacherLogs.hasStardom ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-40'
              }`}>
                <Crown className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold block text-slate-800">وسام النجومية</span>
                <span className="text-[10px] text-slate-400">300 نقطة</span>
              </div>
            </div>

            {/* Logs List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 mb-2">العمليات والمجالات المنجزة:</h4>
              {logs.filter(l => l.teacherId === viewingTeacherLogs.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  لا توجد عمليات مسجلة لهذا الموظف بعد.
                </p>
              ) : (
                logs
                  .filter(l => l.teacherId === viewingTeacherLogs.id)
                  .map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{log.domainTitle}</span>
                        {log.notes && <span className="text-slate-500 text-[11px] block mt-0.5">{log.notes}</span>}
                        <span className="text-slate-400 text-[10px] block mt-0.5">
                          {new Date(log.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold rounded-lg shrink-0">
                        +{log.points}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  setViewingTeacherLogs(null);
                  openGrantForTeacher(viewingTeacherLogs);
                }}
                className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>منح نقاط إضافية</span>
              </button>

              <button
                onClick={() => setViewingTeacherLogs(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
