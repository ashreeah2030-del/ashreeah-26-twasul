"use client";

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import ManagerSignature from '@/components/ManagerSignature';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Plus, 
  Filter,
  Download,
  Upload,
  MessageSquare,
  Award,
  Bell,
  MoreVertical,
  ChevronLeft,
  Settings,
  LogOut,
  Pencil,
  Trash2,
  X,
  Loader2,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Eye,
  FileCheck,
  Send,
  Share2,
  Tag,
  CheckCheck,
  Check,
  Menu
,
  LayoutGrid,
  List,
  Phone,
  GraduationCap,
  Building2,
  CreditCard,
  Trophy,
  User,
  LogIn,
  ExternalLink,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MotivationSection from '@/components/MotivationSection';
import BadgeStatisticsSection from '@/components/BadgeStatisticsSection';

// --- Helper Functions ---
const compressImage = (file: File, maxDim = 400, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Types ---
interface Teacher {
  id: string | number;
  name: string;
  phone: string;
  nationalId?: string;
  specialty: string; // Functional Category
  jobTitle?: string;
  discipline?: string; // Specialty
  level: string; // Stage
  employeeId?: string;
  status: 'active' | 'suspended';
  points?: number;
  portalToken?: string;
  avatarUrl?: string | null;
}

interface Circular {
  id: number;
  title: string;
  content: string;
  category: string;
  targetLevel?: string;
  status: 'sent' | 'draft';
  createdAt: string;
  stats?: {
    totalTarget: number;
    viewed: number;
    confirmed: number;
  };
}

interface CircularTemplate {
  id: string;
  category: string;
  label: string;
  icon: any;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  tagColor: string;
  description: string;
  defaultTitle: string;
  defaultContent: string;
}

const CIRCULAR_TEMPLATES: CircularTemplate[] = [
  {
    id: 'discipline',
    category: 'انضباط ودوام',
    label: 'انضباط ودوام',
    icon: Clock,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    tagColor: 'bg-amber-100 text-amber-800',
    description: 'تنظيم الحضور الصباحي، الانصراف، ومتابعة الغياب والإجازات',
    defaultTitle: 'تعميم التقيد بأوقات الدوام الرسمي والالتزام بالحضور الصباحي',
    defaultContent: `المكرمون منسوبو مجمع الشريعة التعليمي (الهيئة التعليمية والإدارية) المحترمون،
السلام عليكم ورحمة الله وبركاته،،

انطلاقاً من الحرص على انضباط العملية التعليمية والتربوية، وتأكيداً على اللوائح الوزارية المنظمة للدوام المدرسي:

1. التأكيد على التواجد قبل بدء الاصطفاف الصباحي في تمام الساعة 6:45 صباحاً.
2. تسجيل الحضور والانصراف عبر البصمة الإلكترونية والنظام المعتمد بدقة ومسؤولية.
3. الالتزام بالحصص الدراسية والمناوبة اليومية وفق الجدول المدرسي المعتمد.
4. تقديم الإجازات والأعذار الطبية فور حدوثها عبر منصة فارس خلال المدة النظامية المحددة.

شاكرين لكم عظيم استشعاركم للمسؤولية وحرصكم الدائم على مصلحة أبنائنا الطلاب.

إدارة مجمع الشريعة التعليمي`
  },
  {
    id: 'supervision',
    category: 'إشراف ومناوبة',
    label: 'إشراف ومناوبة',
    icon: Eye,
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    tagColor: 'bg-blue-100 text-blue-800',
    description: 'تنظيم مهام الإشراف اليومي والمناوبة وتأمين سلامة الطلاب',
    defaultTitle: 'تعميم تنظيم الإشراف اليومي والمناوبة المدرسية وضمان سلامة الطلاب',
    defaultContent: `المكرمون المعلمون القائمون على الإشراف والمناوبة بمجمع الشريعة التعليمي المحترمون،
السلام عليكم ورحمة الله وبركاته،،

نظراً للأهمية البالغة للإشراف اليومي والمناوبة في حفظ أمن وسلامة الطلاب وسير اليوم الدراسي بانسيابية:

1. التواجد في نقاط الإشراف المحددة (الساحات، الممرات، المقصف، دورات المياه) قبل الاصطفاف الصباحي وخلال الفسحة المدرسية.
2. التزام المشرفين بالمناوبة حتى خروج آخر طالب من المدرسة والتأكد من صعود الطلاب لوسائل النقل بأمان.
3. المتابعة الدقيقة ومنع التجمعات في الأماكن غير المخصصة والتعامل الفوري والتربوي مع أي ملاحظات.
4. توثيق تقرير المناوبة اليومي لدى وكيل شؤون الطلاب بنهاية اليوم.

تقبلوا خالص التقدير لجهودكم المخلصة في رعاية أبنائنا.

لجنة الإشراف والمناوبة - مجمع الشريعة التعليمي`
  },
  {
    id: 'educational_noor',
    category: 'شؤون تعليمية ونور',
    label: 'شؤون تعليمية ونور',
    icon: BookOpen,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    tagColor: 'bg-indigo-100 text-indigo-800',
    description: 'رصد المهارات والدرجات بنظام نور وتحديث سجلات التقويم',
    defaultTitle: 'تعميم استكمال رصد الدرجات والمهارات في نظام نور وتحديث سجلات التقويم',
    defaultContent: `المكرمون معلمو المراحل التعليمية بالمجمع المحترمون،
السلام عليكم ورحمة الله وبركاته،،

حرصاً على انتظام التقويم المستمر وسرعة إطلاع أولياء الأمور على مستويات أبنائهم عبر منصة مدرستي ونظام نور:

1. رصد درجات المشاركات والواجبات والمهمات الأدائية والاختبارات القصيرة أولاً بأول في نظام نور.
2. مطابقة الكشوف الورقية بسجلات النظام للتأكد من عدم وجود أي درجات معلقة أو مفقودة.
3. تسليم كشوف الرصد المعتمدة موقعة لوكيل الشؤون التعليمية قبل موعد إغلاق الفترات التقويمية.
4. تفعيل خطط الدعم والتعزيز للطلاب المتعثرين والتواصل مع الموجه الطلابي لمعالجة الفجوات التعليمية.

شاكرين لكم دقة الإنجاز وسرعة التجاوب المعهود.

وكيل الشؤون التعليمية والمدرسية - مجمع الشريعة التعليمي`
  },
  {
    id: 'exams_control',
    category: 'اختبارات وكنترول',
    label: 'اختبارات وكنترول',
    icon: FileCheck,
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    tagColor: 'bg-purple-100 text-purple-800',
    description: 'تعليمات وضوابط أعمال الاختبارات ولجان الكنترول والرصد',
    defaultTitle: 'تعميم تعليمات وضوابط أعمال الاختبارات ولجان الكنترول والرصد النهائي',
    defaultContent: `المكرمون منسوبو المجمع وأعضاء لجان الاختبارات والكنترول المحترمون،
السلام عليكم ورحمة الله وبركاته،،

مع انطلاق الاستعدادات لفترة الاختبارات، نؤكد على الالتزام التام بالأدلة واللوائح الوزارية المنظمة:

1. إعداد الأسئلة وفق جدول المواصفات والنماذج الإرشادية مع نموذج إجابة مفصل يوضح توزيع الدرجات بدقة.
2. تسليم أظرف الأسئلة مغلقة ومختومة وموقعة لإدارة الكنترول في الموعد المحدد مع حفظ سريتها التامة.
3. التواجد في قاعات الاختبارات قبل موعد بدء الجلسة بـ 15 دقيقة والتأكد من مطابقة أوراق الطلاب.
4. إجراء التصحيح والمراجعة الفورية داخل غرفة الكنترول وعدم مغادرتها قبل اكتمال الرصد والتدقيق.

سائلين الله التوفيق والسداد لأبنائنا الطلاب ولكم دوام العطاء.

لجنة الاختبارات والكنترول - مجمع الشريعة التعليمي`
  },
  {
    id: 'safety_security',
    category: 'أمن وسلامة',
    label: 'أمن وسلامة',
    icon: ShieldAlert,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    tagColor: 'bg-rose-100 text-rose-800',
    description: 'خطط الإخلاء الافتراضية، وسائل السلامة، ومخارج الطوارئ',
    defaultTitle: 'تعميم خطة الطوارئ وتطبيق معايير الأمن والسلامة المدرسية بمجمع الشريعة',
    defaultContent: `المكرمون منسوبو مجمع الشريعة التعليمي (معلمون وإداريون) المحترمون،
السلام عليكم ورحمة الله وبركاته،،

حرصاً على توفير بيئة مدرسية آمنة وصحية لجميع الطلاب والمنسوبين وتطبيقاً لاشتراطات الأمن والسلامة:

1. التأكد من خلو ممرات الطوارئ والمخارج والسلالم من أي عوائق بصفة دائمة.
2. جاهزية وتفقد طفايات الحريق وخراطيم الإطفاء وأجهزة الإنذار في كافة الأدوار والمرافق.
3. توعية الطلاب بمخارج الطوارئ وتوجيههم لنقاط التجمع الآمنة في الفناء الخارجي عند سماع صافرة الإنذار.
4. الإبلاغ الفوري لإدارة المجمع أو منسق السلامة عن أي خلل فني أو مصدر خطر محتمل.

حفظ الله الجميع من كل مكروه وبارك في جهودكم.

منسق الأمن والسلامة المدرسية - مجمع الشريعة التعليمي`
  },
  {
    id: 'activities_events',
    category: 'أنشطة وفعاليات',
    label: 'أنشطة وفعاليات',
    icon: Sparkles,
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    tagColor: 'bg-emerald-100 text-emerald-800',
    description: 'برامج النشاط الطلابي، الإذاعة الصباحية، والفعاليات اللاصفية',
    defaultTitle: 'تعميم خطة البرامج والأنشطة الطلابية والفعاليات اللاصفية',
    defaultContent: `المكرمون رواد الفصول ومعلمو الأنشطة بالمجمع المحترمون،
السلام عليكم ورحمة الله وبركاته،،

انطلاقاً من الأهداف التربوية للأنشطة الطلابية في بناء شخصية الطالب واكتشاف مواهبه وصقل قدراته:

1. تفعيل حصص وبرامج النشاط والبرامج اللاصفية بما يخدم ميول الطلاب وقدراتهم.
2. الإشراف المباشر على الإذاعة المدرسية وتشجيع كافة الطلاب على المشاركة الإيجابية والهادفة.
3. حصر الطلاب الموهوبين في المجالات العلمية، الرياضية، الثقافية، وتأهيلهم للمسابقات الوزارية.
4. التنسيق مع رائد النشاط لتوثيق الفعاليات ورفع تقارير الأنشطة في نهاية كل أسبوع.

شاكرين لكم تفاعلكم البناء في إثراء البيئة المدرسية.

رائد النشاط الطلابي - مجمع الشريعة التعليمي`
  },
  {
    id: 'general',
    category: 'عام',
    label: 'عام',
    icon: FileText,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    tagColor: 'bg-slate-200 text-slate-800',
    description: 'توجيهات إدارية عامة، تهنئات، ومذكرات إدارية رسمية',
    defaultTitle: 'تعميم إداري عام لمنسوبي مجمع الشريعة التعليمي',
    defaultContent: `المكرمون منسوبو مجمع الشريعة التعليمي المحترمون،
السلام عليكم ورحمة الله وبركاته،،

يسر إدارة مجمع الشريعة التعليمي أن تتوجه لكم بخالص الشكر والتقدير على جهودكم المتميزة في خدمة العملية التعليمية.
نود التأكيد على ما يلي:

1. متابعة الرسائل والتعاميم الصادرة عبر المنصة بصفة دورية والاطلاع عليها وتأكيد القراءة إلكترونياً.
2. التعاون المستمر بين الكوادر التعليمية والإدارية بما يضمن تكامل منظومة العمل الميداني.
3. التواصل الدائم مع إدارة المجمع لطرح المبادرات التطويرية والملاحظات الهادفة لتحسين الأداء.

نسأل الله للجميع مزيداً من التوفيق والتميز.

مدير مجمع الشريعة التعليمي`
  }
];

function getCategoryBadgeInfo(category: string) {
  const match = CIRCULAR_TEMPLATES.find(t => t.category === category);
  if (match) {
    return {
      icon: match.icon,
      badgeBg: match.badgeBg,
      badgeText: match.badgeText,
      badgeBorder: match.badgeBorder,
      tagColor: match.tagColor,
      label: match.label
    };
  }
  return {
    icon: FileText,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    tagColor: 'bg-slate-100 text-slate-700',
    label: category || 'عام'
  };
}

interface Stats {
  totalTeachers: number;
  circulars: {
    sent: number;
    viewed: number;
    pending: number;
  };
  accountability: {
    sent: number;
    signed: number;
    pending: number;
  };
  appreciationLetters: number;
  badges?: {
    progress: number;
    excellence: number;
    stardom: number;
    inProgress: number;
    totalAwarded: number;
    cumulativeProgress?: number;
    cumulativeExcellence?: number;
    cumulativeStardom?: number;
  };
}

// --- Components ---

import { useAuth } from '@/src/lib/auth-context';

const StatCard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      {subText && <p className="text-xs text-slate-400 mt-2">{subText}</p>}
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user, loading: authLoading, login, logout, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // --- Photo Upload State ---
  const teacherFileInputRef = useRef<HTMLInputElement>(null);
  const headerFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTeacherId, setUploadingTeacherId] = useState<string | number | null>(null);
  const [, setIsUploadingPhoto] = useState(false);
  const [adminAvatar, setAdminAvatar] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shreeah_admin_avatar');
    }
    return null;
  });

  const triggerEmployeePhotoUpload = (teacherId: string | number) => {
    setUploadingTeacherId(teacherId);
    if (teacherFileInputRef.current) {
      teacherFileInputRef.current.value = '';
      teacherFileInputRef.current.click();
    }
  };

  const handleTeacherPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingTeacherId) return;

    if (!file.type.startsWith('image/')) {
      setNotificationMsg({ text: 'يرجى اختيار ملف صورة صالح (JPG أو PNG أو WEBP)', type: 'error' });
      setTimeout(() => setNotificationMsg(null), 3500);
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const compressedDataUrl = await compressImage(file, 400, 0.85);
      const token = await getToken();
      const res = await fetch(`/api/teachers/${uploadingTeacherId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl: compressedDataUrl })
      });

      if (res.ok) {
        setTeachers(prev => prev.map(t => String(t.id) === String(uploadingTeacherId) ? { ...t, avatarUrl: compressedDataUrl } : t));
        if (editingTeacher && String(editingTeacher.id) === String(uploadingTeacherId)) {
          setEditingTeacher(prev => prev ? { ...prev, avatarUrl: compressedDataUrl } : null);
        }
        setNotificationMsg({ text: 'تم تحميل وتحديث صورة الموظف بنجاح', type: 'success' });
        setTimeout(() => setNotificationMsg(null), 3500);
      } else {
        setNotificationMsg({ text: 'تعذر حفظ صورة الموظف في الخادم', type: 'error' });
        setTimeout(() => setNotificationMsg(null), 3500);
      }
    } catch (err) {
      console.error('Error uploading employee photo:', err);
      setNotificationMsg({ text: 'حدث خطأ أثناء معالجة الصورة', type: 'error' });
      setTimeout(() => setNotificationMsg(null), 3500);
    } finally {
      setIsUploadingPhoto(false);
      setUploadingTeacherId(null);
    }
  };

  const handleRemoveTeacherPhoto = async (teacherId: string | number) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl: null })
      });
      if (res.ok) {
        setTeachers(prev => prev.map(t => String(t.id) === String(teacherId) ? { ...t, avatarUrl: null } : t));
        if (editingTeacher && String(editingTeacher.id) === String(teacherId)) {
          setEditingTeacher(prev => prev ? { ...prev, avatarUrl: null } : null);
        }
        setNotificationMsg({ text: 'تم حذف صورة الموظف بنجاح', type: 'success' });
        setTimeout(() => setNotificationMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error removing photo:', err);
    }
  };

  const handleAdminPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotificationMsg({ text: 'يرجى اختيار ملف صورة صالح', type: 'error' });
      setTimeout(() => setNotificationMsg(null), 3500);
      return;
    }
    try {
      const compressed = await compressImage(file, 400, 0.85);
      setAdminAvatar(compressed);
      if (typeof window !== 'undefined') {
        localStorage.setItem('shreeah_admin_avatar', compressed);
      }
      setNotificationMsg({ text: 'تم تحديث صورتك الشخصية بنجاح', type: 'success' });
      setTimeout(() => setNotificationMsg(null), 3500);
    } catch {
      setNotificationMsg({ text: 'تعذر تحديث الصورة', type: 'error' });
      setTimeout(() => setNotificationMsg(null), 3500);
    }
  };

  // --- Circulars State ---
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [circularSearch, setCircularSearch] = useState<string>('');
  const [isCreateCircularOpen, setIsCreateCircularOpen] = useState(false);
  const [viewingCircular, setViewingCircular] = useState<Circular | null>(null);
  const [deletingCircular, setDeletingCircular] = useState<Circular | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [accountabilityDocs, setAccountabilityDocs] = useState<any[]>([]);
  const [viewingAccountabilityDoc, setViewingAccountabilityDoc] = useState<any>(null);
  const [isCreateAccountabilityOpen, setIsCreateAccountabilityOpen] = useState(false);
  const [newAccTeacherId, setNewAccTeacherId] = useState<string>('');
  const [newAccTitle, setNewAccTitle] = useState<string>('');
  const [newAccSubject, setNewAccSubject] = useState<string>('');
  const [newAccDetails, setNewAccDetails] = useState<string>('');
  const [newAccSendWhatsApp, setNewAccSendWhatsApp] = useState<boolean>(true);

  const [awards, setAwards] = useState<any[]>([]);
  const [viewingAward, setViewingAward] = useState<any>(null);
  const [teachersViewMode, setTeachersViewMode] = useState<'cards' | 'table'>('cards');
  const [teacherLevelFilter, setTeacherLevelFilter] = useState<string>('all');
  const [isCreateAwardOpen, setIsCreateAwardOpen] = useState(false);
  const [newAwardTeacherId, setNewAwardTeacherId] = useState<string>('');
  const [newAwardReason, setNewAwardReason] = useState<string>('');
  const [newAwardSendWhatsApp, setNewAwardSendWhatsApp] = useState<boolean>(true);

  // Form fields for new circular
  const [newCircularCategory, setNewCircularCategory] = useState<string>('انضباط ودوام');
  const [newCircularTitle, setNewCircularTitle] = useState<string>('');
  const [newCircularContent, setNewCircularContent] = useState<string>('');
  const [newCircularTargetLevel, setNewCircularTargetLevel] = useState<string>('كامل المجمع');
  const [newCircularStatus, setNewCircularStatus] = useState<'sent' | 'draft'>('sent');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Teacher portal direct lookup on https://shreeah2026.ai.studio
  const [activeLoginMode, setActiveLoginMode] = useState<'teacher' | 'admin'>('teacher');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const handleTeacherLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    if (!lookupQuery.trim()) {
      setLookupError('يرجى إدخال رقم الجوال أو السجل المدني');
      return;
    }
    setLookupLoading(true);
    try {
      const res = await fetch('/api/teacher-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: lookupQuery.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || 'لم يتم العثور على سجل مطابق');
        return;
      }
      window.location.href = data.portalPath;
    } catch {
      setLookupError('حدث خطأ أثناء محاولة الدخول، يرجى المحاولة لاحقاً');
    } finally {
      setLookupLoading(false);
    }
  };

  const syncUser = async () => {
    const token = await getToken();
    await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  };

  const fetchData = async () => {
    const token = await getToken();
    setDataLoading(true);
    try {
      const [statsRes, teachersRes, circularsRes, accRes, awardsRes] = await Promise.all([
        fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/teachers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/circulars', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/accountability', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/awards', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      const teachersData = await teachersRes.json();
      const circularsData = await circularsRes.json();
      const accData = await accRes.json();
      const awardsData = await awardsRes.json();
      
      if (!statsData.error) setStats(statsData);
      if (!teachersData.error) setTeachers(teachersData);
      if (!circularsData.error) setCirculars(circularsData);
      if (!accData.error) setAccountabilityDocs(accData);
      if (!awardsData.error) setAwards(awardsData);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (user) {
      void syncUser();
      const load = async () => {
        const token = await getToken();
        if (!active) return;
        setDataLoading(true);
        try {
          const [statsRes, teachersRes, circularsRes, accRes, awardsRes] = await Promise.all([
            fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/teachers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/circulars', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/accountability', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/awards', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      const teachersData = await teachersRes.json();
      const circularsData = await circularsRes.json();
      const accData = await accRes.json();
      const awardsData = await awardsRes.json();
      
      if (!statsData.error) setStats(statsData);
      if (!teachersData.error) setTeachers(teachersData);
      if (!circularsData.error) setCirculars(circularsData);
      if (!accData.error) setAccountabilityDocs(accData);
      if (!awardsData.error) setAwards(awardsData);
        } catch (err) {
          console.error("Fetch failed", err);
        } finally {
          if (active) setDataLoading(false);
        }
      };
      load();
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">جاري التحميل...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 p-4 sm:p-6" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-800/30">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white text-center relative">
            <div className="w-20 h-20 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3 border border-emerald-400/20">
              <Image 
                src="/logo-moe-1448.png?v=3" 
                alt="وزارة التعليم"
                width={70}
                height={70}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <p className="text-emerald-300 font-bold text-xs tracking-wide">الإدارة العامة للتعليم بمنطقة جازان</p>
            <h1 className="text-2xl font-black mt-1">مجمع الشريعة التعليمي</h1>
            <p className="text-emerald-100/80 text-xs mt-1">المنصة الإلكترونية للمعاينة والاعتماد</p>

            {/* Official Link Badge */}
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-black/30 border border-emerald-400/30 rounded-full text-[11px] font-mono text-emerald-200">
              <span>https://shreeah2026.ai.studio</span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="p-6 pb-2">
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => { setActiveLoginMode('teacher'); setLookupError(''); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeLoginMode === 'teacher'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>المعلمين والموظفين</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveLoginMode('admin'); setLookupError(''); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeLoginMode === 'admin'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>إدارة المجمع</span>
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="p-6 pt-3">
            {activeLoginMode === 'teacher' ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="text-center">
                  <h2 className="text-base font-bold text-slate-900">بوابة الموظف (للمعاينة والاعتماد)</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    أدخل رقم الجوال أو السجل المدني المسجل بالمجمع للاطلاع على التعاميم واعتماد أوراق المساءلة وشهادات الشكر
                  </p>
                </div>

                <form onSubmit={handleTeacherLookupSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      رقم الجوال أو السجل المدني:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={lookupQuery}
                        onChange={(e) => setLookupQuery(e.target.value)}
                        placeholder="مثال: 0501234567 أو 10XXXXXXXX"
                        className="w-full py-3.5 px-4 pr-11 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-mono text-left"
                        dir="ltr"
                        autoFocus
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {lookupError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{lookupError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-60 cursor-pointer"
                  >
                    {lookupLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التحقق والفتح...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>الدخول للمعاينة والاعتماد</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center border-t border-slate-100">
                  <p className="text-[11px] text-slate-400">
                    يمكنكم دائماً استخدام الرابط المرسل إليكم عبر الواتساب للدخول الفوري لبوابتكم
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center animate-in fade-in duration-300 py-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">دخول الإدارة المدرسية</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    تسجيل الدخول مخصص لقيادة وإدارة مجمع الشريعة التعليمي
                  </p>
                </div>

                <button 
                  onClick={login}
                  className="w-full py-4 bg-emerald-700 text-white rounded-2xl font-bold text-base hover:bg-emerald-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 cursor-pointer"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0">
                    <span className="text-emerald-700 font-black text-xs">G</span>
                  </div>
                  <span>تسجيل الدخول عبر Google</span>
                </button>

                <p className="text-xs text-slate-400">
                  تتطلب هذه البوابة صلاحيات إدارية معتمدة
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filter teachers based on search and level
  const filteredTeachers = (teachers || []).filter(t => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || 
      t.name.toLowerCase().includes(term) || 
      t.phone.includes(term) ||
      (t.nationalId && t.nationalId.includes(term)) ||
      (t.specialty && t.specialty.toLowerCase().includes(term)) ||
      (t.jobTitle && t.jobTitle.toLowerCase().includes(term)) ||
      (t.discipline && t.discipline.toLowerCase().includes(term));
    
    const matchesLevel = teacherLevelFilter === 'all' || 
      t.level === teacherLevelFilter ||
      (teacherLevelFilter === 'ابتدائي' && (t.level?.includes('ابتدائ') || false)) ||
      (teacherLevelFilter === 'متوسط' && (t.level?.includes('متوسط') || false)) ||
      (teacherLevelFilter === 'ثانوي' && (t.level?.includes('ثانوي') || false));

    return matchesSearch && matchesLevel;
  });

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newTeacher = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      nationalId: formData.get('nationalId'),
      specialty: formData.get('specialty'),
      jobTitle: formData.get('jobTitle'),
      discipline: formData.get('discipline'),
      level: formData.get('level'),
      status: 'active'
    };

    const token = await getToken();
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTeacher)
    });

    if (res.ok) {
      fetchData();
      setActiveTab('teachers');
      setNotificationMsg({ text: 'تمت إضافة الموظف بنجاح', type: 'success' });
      setTimeout(() => setNotificationMsg(null), 3500);
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setActionLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatedData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        nationalId: formData.get('nationalId'),
        specialty: formData.get('specialty'),
        jobTitle: formData.get('jobTitle'),
        discipline: formData.get('discipline'),
        level: formData.get('level'),
        status: formData.get('status') || 'active',
        avatarUrl: editingTeacher.avatarUrl !== undefined ? editingTeacher.avatarUrl : null
      };

      const token = await getToken();
      const res = await fetch(`/api/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        setEditingTeacher(null);
        await fetchData();
        setNotificationMsg({ text: 'تم تحديث بيانات الموظف بنجاح', type: 'success' });
        setTimeout(() => setNotificationMsg(null), 3500);
      } else {
        const data = await res.json();
        alert(data.error || 'فشل تحديث بيانات الموظف');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تحديث بيانات الموظف');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deletingTeacher) return;
    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/teachers/${deletingTeacher.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setDeletingTeacher(null);
        await fetchData();
        setNotificationMsg({ text: 'تم حذف الموظف بنجاح', type: 'success' });
        setTimeout(() => setNotificationMsg(null), 3500);
      } else {
        const data = await res.json();
        alert(data.error || 'فشل حذف الموظف');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حذف الموظف');
    } finally {
      setActionLoading(false);
    }
  };

  const getWhatsAppLink = async (teacherId: string | number) => {
    const token = await getToken();
    const res = await fetch(`/api/teachers/${teacherId}/link`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.link;
  };

  const sendWhatsApp = async (teacher: Teacher) => {
    const link = getTeacherPortalUrl(teacher);
    const msg = `*مجمع الشريعة التعليمي - الإدارة المدرسية*

المكرم أ. ${teacher.name} المحترم،
السلام عليكم ورحمة الله وبركاته،،

يرجى التكرم بالدخول على رابط المنصة الإلكترونية للمعاينة والاعتماد والاطلاع على التعاميم وأوراق المساءلة وشهادات الشكر والتحفيز:
🔗 رابط المنصة الإلكترونية:
https://shreeah2026.ai.studio

(أو عبر رابطكم المباشر السريع: ${link})

مع أطيب تحيات إدارة مجمع الشريعة التعليمي.`;
    
    let phone = teacher.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('00966')) {
      phone = phone.substring(2);
    } else if (phone.startsWith('0')) {
      phone = '966' + phone.substring(1);
    } else if (!phone.startsWith('966')) {
      phone = '966' + phone;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- Circular Handlers & Templates ---
  const applyTemplate = (template: CircularTemplate) => {
    setSelectedTemplateId(template.id);
    setNewCircularCategory(template.category);
    setNewCircularTitle(template.defaultTitle);
    setNewCircularContent(template.defaultContent);
  };

  const handleOpenCreateCircular = (template?: CircularTemplate) => {
    if (template) {
      applyTemplate(template);
    } else {
      setSelectedTemplateId(null);
      setNewCircularCategory('عام');
      setNewCircularTitle('');
      setNewCircularContent('');
    }
    setNewCircularTargetLevel('كامل المجمع');
    setNewCircularStatus('sent');
    setIsCreateCircularOpen(true);
  };

  const handleCreateCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/circulars', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newCircularTitle,
          content: newCircularContent,
          category: newCircularCategory,
          targetLevel: newCircularTargetLevel,
          status: newCircularStatus
        })
      });

      if (res.ok) {
        setIsCreateCircularOpen(false);
        setNewCircularTitle('');
        setNewCircularContent('');
        setSelectedTemplateId(null);
        await fetchData();
        setNotificationMsg({ text: 'تم إصدار التعميم ونشره بنجاح', type: 'success' });
        setTimeout(() => setNotificationMsg(null), 3500);
      } else {
        const data = await res.json();
        alert(data.error || 'فشل إصدار التعميم');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إصدار التعميم');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCircular = async () => {
    if (!deletingCircular) return;
    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/circulars/${deletingCircular.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setDeletingCircular(null);
        await fetchData();
        setNotificationMsg({ text: 'تم حذف التعميم بنجاح', type: 'success' });
        setTimeout(() => setNotificationMsg(null), 3500);
      } else {
        const data = await res.json();
        alert(data.error || 'فشل حذف التعميم');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حذف التعميم');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAccountability = async (e?: React.FormEvent, forceWhatsApp?: boolean) => {
    if (e) e.preventDefault();
    if (!newAccTeacherId) {
      alert('يرجى اختيار الموظف أولاً');
      return;
    }
    if (!newAccTitle.trim()) {
      alert('يرجى كتابة عنوان المساءلة');
      return;
    }

    const shouldSendWA = forceWhatsApp !== undefined ? forceWhatsApp : newAccSendWhatsApp;
    const targetTeacher = teachers.find(t => String(t.id) === String(newAccTeacherId));

    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/accountability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          teacherId: newAccTeacherId,
          title: newAccTitle.trim(),
          subject: newAccSubject.trim(),
          details: newAccDetails.trim()
        })
      });
      if (res.ok) {
        const createdDoc = await res.json();
        
        // Success notification
        setNotificationMsg({ 
          text: shouldSendWA 
            ? 'تم إصدار ورقة المساءلة بنجاح وجارٍ فتح إشعار الواتس آب...' 
            : 'تم إصدار ورقة المساءلة وحفظها بنجاح', 
          type: 'success' 
        });
        setTimeout(() => setNotificationMsg(null), 4000);

        // Open WhatsApp if enabled
        if (shouldSendWA && targetTeacher) {
          handleShareAccountability({
            ...createdDoc,
            teacherId: targetTeacher.id,
            title: newAccTitle.trim(),
            subject: newAccSubject.trim(),
            details: newAccDetails.trim()
          });
        }

        setIsCreateAccountabilityOpen(false);
        setNewAccTeacherId(''); 
        setNewAccTitle(''); 
        setNewAccSubject(''); 
        setNewAccDetails('');
        setNewAccSendWhatsApp(true);
        await fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'فشل إصدار ورقة المساءلة');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إصدار المساءلة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAwardTeacherId) return;
    const targetTeacher = teachers.find(t => String(t.id) === String(newAwardTeacherId));
    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          teacherId: newAwardTeacherId,
          reason: newAwardReason
        })
      });
      if (res.ok) {
        const createdAward = await res.json();
        if (newAwardSendWhatsApp && targetTeacher) {
          handleShareAward({
            ...createdAward,
            teacherId: targetTeacher.id,
            reason: newAwardReason
          });
        }
        setIsCreateAwardOpen(false);
        setNewAwardTeacherId(''); 
        setNewAwardReason('');
        setNewAwardSendWhatsApp(true);
        fetchData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getTeacherPortalUrl = (t: Teacher) => {
    return `https://shreeah2026.ai.studio/teacher/${t.id}/${t.portalToken}`;
  };

  const handleShareTeacherPortal = (t: Teacher) => {
    const url = getTeacherPortalUrl(t);
    const msg = `*مجمع الشريعة التعليمي - بوابة الموظف الإلكترونية*

المكرم أ. ${t.name} المحترم،
السلام عليكم ورحمة الله وبركاته،،

يمكنكم الآن الدخول على رابط المنصة الإلكترونية للمعاينة والاعتماد والاطلاع على التعاميم وأوراق المساءلة وشهادات الشكر والتحفيز الخاصة بكم:

🔗 رابط المنصة الإلكترونية للمعاينة والاعتماد:
https://shreeah2026.ai.studio

(أو عبر رابطكم المباشر السريع: ${url})

مع أطيب تحيات إدارة مجمع الشريعة التعليمي.`;

    let phone = t.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('00966')) {
      phone = phone.substring(2);
    } else if (phone.startsWith('0')) {
      phone = '966' + phone.substring(1);
    } else if (!phone.startsWith('966')) {
      phone = '966' + phone;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareAccountability = (doc: any) => {
    const t = teachers.find(x => String(x.id) === String(doc.teacherId));
    if (!t) return;
    const url = getTeacherPortalUrl(t);
    const msg = `*مجمع الشريعة التعليمي - إشعار مساءلة إدارية*

المكرم أ. ${t.name} المحترم،
السلام عليكم ورحمة الله وبركاته،،

تود إدارة مجمع الشريعة التعليمي إشعاركم بصدور ورقة مساءلة رسمية:
📌 *الموضوع:* ${doc.title}${doc.subject ? `\n📝 *الملاحظة:* ${doc.subject}` : ''}

يرجى التكرم بالدخول على رابط المنصة الإلكترونية للمعاينة والاعتماد وتقديم الإفادة وتوقيع الاستلام إلكترونياً:
🔗 رابط المنصة الإلكترونية للمعاينة والاعتماد:
https://shreeah2026.ai.studio

(أو عبر رابطكم المباشر السريع: ${url})

شاكرين ومقدرين حسن تعاونكم الدائم.`;

    let phone = t.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('00966')) {
      phone = phone.substring(2);
    } else if (phone.startsWith('0')) {
      phone = '966' + phone.substring(1);
    } else if (!phone.startsWith('966')) {
      phone = '966' + phone;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareAward = (award: any) => {
    const t = teachers.find(x => String(x.id) === String(award.teacherId));
    if (!t) return;
    const url = getTeacherPortalUrl(t);
    const reasonText = award.reason ? `\n📌 *سبب التكريم:* ${award.reason}` : '';
    const msg = `*مجمع الشريعة التعليمي - شهادة شكر وتقدير رسمية*

المكرم أ. ${t.name} المحترم،
السلام عليكم ورحمة الله وبركاته،،

يسر إدارة مجمع الشريعة التعليمي أن تتقدم لكم بخالص الشكر والتقدير لجهودكم المتميزة وعطائكم المثمر.${reasonText}
تم إصدار شهادة شكر وتقدير رسمية لكم، يرجى التكرم بالدخول على رابط المنصة الإلكترونية للمعاينة والاعتماد:

🔗 رابط المنصة الإلكترونية للمعاينة والاعتماد:
https://shreeah2026.ai.studio

(أو عبر رابطكم المباشر السريع: ${url})

مع تمنياتنا لكم بدوام التوفيق والتألق والريادة.`;

    let phone = t.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('00966')) {
      phone = phone.substring(2);
    } else if (phone.startsWith('0')) {
      phone = '966' + phone.substring(1);
    } else if (!phone.startsWith('966')) {
      phone = '966' + phone;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareCircularWhatsApp = (c: Circular, targetTeacher?: Teacher) => {
    const directLink = targetTeacher ? `\n(أو عبر رابطكم المباشر: ${getTeacherPortalUrl(targetTeacher)})` : '';
    const teacherSalutation = targetTeacher ? `المكرم أ. ${targetTeacher.name} المحترم،\n` : '';
    const msg = `*مجمع الشريعة التعليمي - الإدارة العامة للتعليم بجازان*
📢 *إشعار صدور تعميم رسمي جديد*
${teacherSalutation}
📌 *الموضوع:* ${c.title}
📂 *التصنيف:* ${c.category}
🏫 *المرحلة المستهدفة:* ${c.targetLevel || 'كامل المجمع'}

📝 *مقتطف من نص التعميم:*
${c.content.slice(0, 160)}...

يرجى التكرم بالدخول على رابط المنصة الإلكترونية للمعاينة والاعتماد وتأكيد الاطلاع إلكترونياً:
🔗 رابط المنصة الإلكترونية للمعاينة والاعتماد:
https://shreeah2026.ai.studio${directLink}

شاكرين ومقدرين حسن تعاونكم الدائم.`;

    if (targetTeacher) {
      let phone = targetTeacher.phone.replace(/[^0-9]/g, '');
      if (phone.startsWith('00966')) {
        phone = phone.substring(2);
      } else if (phone.startsWith('0')) {
        phone = '966' + phone.substring(1);
      } else if (!phone.startsWith('966')) {
        phone = '966' + phone;
      }
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const filteredCirculars = circulars.filter(c => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = !circularSearch || 
      c.title.toLowerCase().includes(circularSearch.toLowerCase()) || 
      c.content.toLowerCase().includes(circularSearch.toLowerCase()) ||
      (c.category && c.category.includes(circularSearch));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`w-72 bg-emerald-900 text-white flex flex-col fixed h-full shadow-xl z-30 right-0 top-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-emerald-800/50">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-20 h-20 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-400/20">
              <Image 
                src="/logo-moe-1448.png?v=3" 
                alt="وزارة التعليم"
                width={60}
                height={60}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div>
              <p className="text-[10px] text-emerald-300 font-bold mb-1">الإدارة العامة للتعليم بجازان</p>
              <h1 className="text-lg font-bold leading-tight">مجمع الشريعة التعليمي</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <NavItem 
            icon={Plus} 
            label="لوحة التحكم" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={Users} 
            label="إدارة الموظفين" 
            active={activeTab === 'teachers'} 
            onClick={() => setActiveTab('teachers')} 
          />
          <NavItem 
            icon={FileText} 
            label="التعاميم الإلكترونية" 
            active={activeTab === 'circulars'} 
            onClick={() => setActiveTab('circulars')} 
          />
          <NavItem 
            icon={AlertCircle} 
            label="أوراق المساءلة" 
            active={activeTab === 'accountability'} 
            onClick={() => setActiveTab('accountability')} 
          />
          <NavItem 
            icon={Award} 
            label="خطابات الشكر" 
            active={activeTab === 'awards'} 
            onClick={() => setActiveTab('awards')} 
          />
          <NavItem 
            icon={Trophy} 
            label="التكريم والتحفيز" 
            active={activeTab === 'motivation'} 
            onClick={() => setActiveTab('motivation')} 
          />
          <NavItem 
            icon={Bell} 
            label="الإشعارات" 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
          />
        </nav>

        <div className="p-4 border-t border-emerald-800/50 space-y-2">
          <div className="px-4 py-2 text-xs text-emerald-400 truncate">{user?.email}</div>
          <div className="px-4 py-1 text-[11px] text-emerald-400/70 font-mono">
            رقم جوال المجمع: 966509205097
          </div>
          <NavItem icon={Settings} label="الإعدادات" onClick={() => {}} />
          <NavItem icon={LogOut} label="تسجيل الخروج" className="text-rose-300" onClick={logout} />
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 p-4 md:p-8 h-screen overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'md:mr-72' : 'mr-0'}`}
      >
        <header className="flex flex-col gap-4 md:gap-6 mb-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center w-full gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto overflow-hidden">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors shrink-0"
                title="إظهار / إخفاء القائمة"
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </button>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 whitespace-nowrap truncate">
                  أهلاً بك، {user?.displayName || 'سعادة المدير'}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 truncate">إليك ملخص شامل للعمليات الإدارية اليوم</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <button 
                onClick={() => setActiveTab('notifications')}
                className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors relative"
                title="التنبيهات"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              
              {/* Clickable Header User Avatar */}
              <div 
                id="header-user-avatar"
                onClick={() => headerFileInputRef.current?.click()}
                className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center justify-center border border-emerald-200 cursor-pointer overflow-hidden relative group transition-all shrink-0 shadow-xs" 
                title="اضغط لتحميل أو تغيير صورتك الشخصية"
              >
                {adminAvatar ? (
                  <img src={adminAvatar} alt="صورة الحساب" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-emerald-700 font-bold">{user?.displayName?.[0] || 'مد'}</span>
                )}
                <div className="absolute inset-0 bg-emerald-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>

              <button
                id="header-logout-button"
                onClick={logout}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 border border-rose-200/80 rounded-xl text-xs sm:text-sm font-bold transition-all hover:shadow-sm cursor-pointer"
                title="تسجيل الخروج من المنصة"
              >
                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                <span>خروج</span>
              </button>

              {/* Hidden File Inputs for Direct Click Uploads */}
              <input 
                type="file"
                ref={headerFileInputRef}
                onChange={handleAdminPhotoChange}
                accept="image/*"
                className="hidden"
              />
              <input 
                type="file"
                ref={teacherFileInputRef}
                onChange={handleTeacherPhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="relative w-full max-w-2xl">
            <input 
              type="text" 
              placeholder="بحث عن موظف بالاسم أو النوع..." 
              className="pr-10 pl-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 w-full text-sm outline-none transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-5 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </header>

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="إجمالي الموظفين" 
                value={stats.totalTeachers} 
                icon={Users} 
                colorClass="bg-blue-500" 
                subText="قاعدة بيانات نشطة"
              />
              <StatCard 
                title="التعاميم المرسلة" 
                value={stats.circulars.sent} 
                icon={FileText} 
                colorClass="bg-emerald-500" 
                subText={`${stats.circulars.viewed} تم الاطلاع عليها`}
              />
              <StatCard 
                title="أوراق المساءلة" 
                value={stats.accountability.sent} 
                icon={AlertCircle} 
                colorClass="bg-amber-500" 
                subText={`${stats.accountability.signed} مكتملة`}
              />
              <StatCard 
                title="خطابات الشكر" 
                value={stats.appreciationLetters} 
                icon={Award} 
                colorClass="bg-purple-500" 
                subText="تصاميم رسمية فاخرة"
              />
            </div>

            {/* Motivation Quick Action & Banner */}
            <div 
              onClick={() => setActiveTab('motivation')}
              className="bg-gradient-to-l from-emerald-900 to-teal-850 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group border border-emerald-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <span>منظومة التكريم والتحفيز المؤسسي</span>
                    <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">نظام الأوسمة</span>
                  </h4>
                  <p className="text-emerald-200/90 text-xs mt-0.5">
                    وسام التقدم (100 نقطة) • وسام المثالية (200 نقطة) • وسام النجومية (300 نقطة) ومجالات التميز
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  لوحة الصدارة ومجالات التكريم
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Badge Statistics & Circular Charts Section */}
            <BadgeStatisticsSection 
              teachers={teachers}
              onNavigateToMotivation={() => setActiveTab('motivation')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg">أحدث العمليات</h3>
                  <button className="text-emerald-600 text-sm font-medium hover:underline">عرض الكل</button>
                </div>
                <div className="divide-y divide-slate-50">
                  <ActivityItem 
                    title="توقيع إفادة" 
                    desc="قام المعلم أحمد المحمدي بتوقيع ورقة المساءلة رقم #12" 
                    time="منذ 10 دقائق" 
                    type="success"
                  />
                  <ActivityItem 
                    title="اطلاع على تعميم" 
                    desc="اطلع خالد العتيبي على تعميم 'إجراءات الاختبارات الفصلية'" 
                    time="منذ ساعة" 
                    type="info"
                  />
                  <ActivityItem 
                    title="فشل إرسال" 
                    desc="تعذر إرسال إشعار واتساب للمعلم محمد القحطاني" 
                    time="منذ ساعتين" 
                    type="error"
                  />
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-6">حالة الاستجابة</h3>
                <div className="space-y-6">
                  <ProgressCircle label="التعاميم (تم الاطلاع)" percent={85} color="bg-emerald-500" />
                  <ProgressCircle label="المساءلات (تم التوقيع)" percent={60} color="bg-amber-500" />
                  <ProgressCircle label="الرسائل (تم التسليم)" percent={92} color="bg-blue-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notificationMsg && (
          <div className={`fixed bottom-6 left-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-5 text-white font-medium text-sm ${
            notificationMsg.type === 'success' ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-rose-600 shadow-rose-600/30'
          }`}>
            <CheckCircle className="w-5 h-5 text-white" />
            <span>{notificationMsg.text}</span>
          </div>
        )}

        {/* Edit Teacher Modal */}
        {editingTeacher && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">تعديل بيانات الموظف</h3>
                    <p className="text-xs text-slate-500">{editingTeacher.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingTeacher(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateTeacher} className="space-y-5 mt-6">
                {/* Employee Photo Section with Click to Upload */}
                <div className="flex items-center gap-4 p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl">
                  <div 
                    onClick={() => triggerEmployeePhotoUpload(editingTeacher.id)}
                    className="relative group/modalAvatar cursor-pointer shrink-0"
                    title="اضغط لتحميل أو تغيير الصورة"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-emerald-300 flex items-center justify-center overflow-hidden shadow-xs">
                      {editingTeacher.avatarUrl ? (
                        <img src={editingTeacher.avatarUrl} alt={editingTeacher.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-emerald-700">{editingTeacher.name[0] || 'م'}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-emerald-950/70 rounded-2xl opacity-0 group-hover/modalAvatar:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">صورة الموظف الرسمية</h4>
                    <p className="text-xs text-slate-500 mt-0.5">انقر على الصورة مباشرة لتحميلها من جهازك أو تغييرها</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => triggerEmployeePhotoUpload(editingTeacher.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{editingTeacher.avatarUrl ? 'تغيير الصورة' : 'تحميل صورة'}</span>
                      </button>
                      {editingTeacher.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTeacherPhoto(editingTeacher.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                    <input 
                      name="name" 
                      required 
                      defaultValue={editingTeacher.name}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">رقم الجوال (مع المفتاح الدولي)</label>
                    <input 
                      name="phone" 
                      required 
                      defaultValue={editingTeacher.phone}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm" 
                      dir="ltr" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">السجل المدني</label>
                    <input 
                      name="nationalId" 
                      required 
                      maxLength={10} 
                      defaultValue={editingTeacher.nationalId || ''}
                      placeholder="10XXXXXXXX" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm" 
                      dir="ltr" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">الفئة الوظيفية</label>
                    <select 
                      name="specialty" 
                      defaultValue={editingTeacher.specialty}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    >
                      <option value="معلم">معلم</option>
                      <option value="مدير">مدير</option>
                      <option value="وكيل شؤون طلاب">وكيل شؤون طلاب</option>
                      <option value="وكيل شؤون معلمين">وكيل شؤون معلمين</option>
                      <option value="محضر حاسب">محضر حاسب</option>
                      <option value="محضر مختبر">محضر مختبر</option>
                      <option value="موجه طلابي">موجه طلابي</option>
                      <option value="رائد نشاط">رائد نشاط</option>
                      <option value="مراسل">مراسل</option>
                      <option value="مساعد إداري">مساعد إداري</option>
                      <option value="سكرتير">سكرتير</option>
                      <option value="حارس">حارس</option>
                      <option value="مستخدم">مستخدم</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">المسمى الوظيفي</label>
                    <input 
                      name="jobTitle" 
                      defaultValue={editingTeacher.jobTitle || ''}
                      placeholder="مثال: معلم ممارس" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">التخصص</label>
                    <input 
                      name="discipline" 
                      defaultValue={editingTeacher.discipline || ''}
                      placeholder="مثال: لغة عربية" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">المرحلة الدراسية</label>
                    <select 
                      name="level" 
                      defaultValue={editingTeacher.level}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    >
                      <option value="كامل المجمع">كامل المجمع</option>
                      <option value="الابتدائية">الابتدائية</option>
                      <option value="المتوسطة">المتوسطة</option>
                      <option value="الثانوية">الثانوية</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">الحالة</label>
                    <select 
                      name="status" 
                      defaultValue={editingTeacher.status || 'active'}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    >
                      <option value="active">نشط</option>
                      <option value="suspended">متوقف</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    حفظ التعديلات
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingTeacher(null)}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Teacher Modal */}
        {deletingTeacher && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">تأكيد حذف الموظف</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف الموظف <span className="font-bold text-slate-800">«{deletingTeacher.name}»</span>؟ سيتم مسح كافة البيانات والسجلات الخاصة به نهائياً.
                </p>
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  onClick={handleDeleteTeacher}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  تأكيد الحذف
                </button>
                <button 
                  onClick={() => setDeletingTeacher(null)}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  تراجع
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'teachers' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>قائمة الموظفين</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                      {filteredTeachers.length} موظف
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">إدارة ومتابعة المعلمين والإداريين وإرسال الروابط الخاصة بهم</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                  <button
                    onClick={() => setTeachersViewMode('cards')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      teachersViewMode === 'cards'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>بطاقات</span>
                  </button>
                  <button
                    onClick={() => setTeachersViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      teachersViewMode === 'table'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>جدول</span>
                  </button>
                </div>

                <button 
                  onClick={() => setActiveTab('add_teacher')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  إضافة موظف جديد
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 ml-2">تصفية حسب المرحلة:</span>
              {[
                { id: 'all', label: 'جميع المراحل' },
                { id: 'ابتدائي', label: 'المرحلة الابتدائية' },
                { id: 'متوسط', label: 'المرحلة المتوسطة' },
                { id: 'ثانوي', label: 'المرحلة الثانوية' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTeacherLevelFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    teacherLevelFilter === f.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Content: Cards or Table */}
            {teachersViewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredTeachers.map((teacher) => {
                  const initial = teacher.name ? teacher.name.trim()[0] : 'م';
                  return (
                    <div
                      key={teacher.id}
                      className="bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Top Accent Stripe */}
                      <div className={`h-1.5 w-full ${
                        teacher.status === 'active'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-slate-300'
                      }`} />

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        {/* Card Header */}
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              {/* Clickable Employee Avatar for Instant Photo Upload */}
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerEmployeePhotoUpload(teacher.id);
                                }}
                                className="relative group/avatar cursor-pointer shrink-0"
                                title="اضغط لتحميل أو تغيير صورة الموظف"
                              >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 font-bold text-base flex items-center justify-center shadow-inner overflow-hidden">
                                  {teacher.avatarUrl ? (
                                    <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
                                  ) : (
                                    initial
                                  )}
                                </div>
                                <div className="absolute inset-0 bg-emerald-950/75 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity shadow-md">
                                  <Camera className="w-4 h-4 text-white" />
                                  <span className="text-[9px] font-bold leading-none mt-0.5">تغيير</span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">
                                  {teacher.name}
                                </h4>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                                  {teacher.jobTitle || teacher.specialty || 'موظف'}
                                </span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                              teacher.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                teacher.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`} />
                              {teacher.status === 'active' ? 'نشط' : 'متوقف'}
                            </span>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] text-slate-400 block leading-none mb-0.5">المرحلة</span>
                                <span className="font-semibold text-slate-800 text-xs truncate block">{teacher.level || 'غير محدد'}</span>
                              </div>
                            </div>

                            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] text-slate-400 block leading-none mb-0.5">التخصص</span>
                                <span className="font-semibold text-slate-800 text-xs truncate block">{teacher.discipline || teacher.specialty || 'عام'}</span>
                              </div>
                            </div>

                            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] text-slate-400 block leading-none mb-0.5">السجل المدني</span>
                                <span className="font-mono text-slate-800 text-[11px] truncate block" dir="ltr">
                                  {teacher.nationalId ? `******${teacher.nationalId.slice(-4)}` : '---'}
                                </span>
                              </div>
                            </div>

                            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] text-slate-400 block leading-none mb-0.5">رقم الجوال</span>
                                <span className="font-mono text-slate-800 text-[11px] truncate block" dir="ltr">{teacher.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => handleShareTeacherPortal(teacher)}
                            className="flex-1 py-2 px-3 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                            title="إرسال رابط بوابة الموظف عبر واتساب"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>إرسال البوابة</span>
                          </button>

                          <button
                            onClick={() => sendWhatsApp(teacher)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-slate-200"
                            title="إرسال رابط المنصة عبر واتساب"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEditingTeacher(teacher)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200"
                            title="تعديل بيانات الموظف"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingTeacher(teacher)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200"
                            title="حذف الموظف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-right">الاسم</th>
                      <th className="px-6 py-4 font-semibold text-right">السجل المدني</th>
                      <th className="px-6 py-4 font-semibold text-right">الفئة</th>
                      <th className="px-6 py-4 font-semibold text-right">المسمى الوظيفي</th>
                      <th className="px-6 py-4 font-semibold text-right">التخصص</th>
                      <th className="px-6 py-4 font-semibold text-right">رقم الجوال</th>
                      <th className="px-6 py-4 font-semibold text-right">المرحلة</th>
                      <th className="px-6 py-4 font-semibold text-right">الحالة</th>
                      <th className="px-6 py-4 font-semibold text-right text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerEmployeePhotoUpload(teacher.id);
                              }}
                              className="relative group/avatar cursor-pointer w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs"
                              title="اضغط لتحميل أو تغيير صورة الموظف"
                            >
                              {teacher.avatarUrl ? (
                                <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-slate-600">{teacher.name[0]}</span>
                              )}
                              <div className="absolute inset-0 bg-emerald-950/70 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                            <span className="font-medium text-slate-900">{teacher.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono tracking-tighter" dir="ltr">
                          {teacher.nationalId ? `******${teacher.nationalId.slice(-4)}` : '---'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{teacher.specialty}</td>
                        <td className="px-6 py-4 text-slate-600">{teacher.jobTitle || '---'}</td>
                        <td className="px-6 py-4 text-slate-600">{teacher.discipline || '---'}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono tracking-tighter" dir="ltr">{teacher.phone}</td>
                        <td className="px-6 py-4 text-slate-600">{teacher.level}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            teacher.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {teacher.status === 'active' ? 'نشط' : 'متوقف'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-1.5">
                            <button 
                              onClick={() => handleShareTeacherPortal(teacher)}
                              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="إرسال رابط البوابة عبر واتساب"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => sendWhatsApp(teacher)}
                              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="إرسال رابط المنصة عبر واتساب"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingTeacher(teacher)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="تعديل بيانات الموظف"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setDeletingTeacher(teacher)}
                              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="حذف الموظف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredTeachers.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700 mb-1">لا يوجد موظفون مطابقون</h4>
                <p className="text-xs text-slate-400">جرب تعديل كلمة البحث أو تصفية المراحل</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'add_teacher' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">إضافة موظف جديد</h3>
              <button onClick={() => setActiveTab('teachers')} className="text-slate-400 hover:text-slate-600"><ChevronLeft className="rotate-180" /></button>
            </div>
            <form onSubmit={handleAddTeacher} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                  <input name="name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم الجوال (مع مفتاح الدولة)</label>
                  <input name="phone" required placeholder="+966..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono" dir="ltr" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">السجل المدني</label>
                  <input name="nationalId" required maxLength={10} placeholder="10XXXXXXXX" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الفئة الوظيفية</label>
                  <select name="specialty" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                    <option value="معلم">معلم</option>
                    <option value="مدير">مدير</option>
                    <option value="وكيل شؤون طلاب">وكيل شؤون طلاب</option>
                    <option value="وكيل شؤون معلمين">وكيل شؤون معلمين</option>
                    <option value="محضر حاسب">محضر حاسب</option>
                    <option value="محضر مختبر">محضر مختبر</option>
                    <option value="موجه طلابي">موجه طلابي</option>
                    <option value="رائد نشاط">رائد نشاط</option>
                    <option value="مراسل">مراسل</option>
                    <option value="مساعد إداري">مساعد إداري</option>
                    <option value="سكرتير">سكرتير</option>
                    <option value="حارس">حارس</option>
                    <option value="مستخدم">مستخدم</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المسمى الوظيفي</label>
                  <input name="jobTitle" placeholder="مثال: معلم ممارس" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">التخصص</label>
                  <input name="discipline" placeholder="مثال: لغة عربية" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المرحلة الدراسية</label>
                <select name="level" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                  <option value="كامل المجمع">كامل المجمع</option>
                  <option value="الابتدائية">الابتدائية</option>
                  <option value="المتوسطة">المتوسطة</option>
                  <option value="الثانوية">الثانوية</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">حفظ الموظف</button>
                <button type="button" onClick={() => setActiveTab('teachers')} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        )}

        {/* --- Circulars Tab --- */}
        {activeTab === 'circulars' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Primary Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">التعاميم والتعليمات المدرسية</h3>
                    <p className="text-xs text-slate-500 mt-0.5">إصدار وإدارة التعاميم المعتمدة مع توثيق قراءة وتأكيد المعلمين إلكترونياً</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleOpenCreateCircular()}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all font-bold shadow-md shadow-emerald-700/20 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  إصدار تعميم جديد
                </button>
              </div>
            </div>

            {/* Ready-to-use Circular Templates Section */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-base text-white">قوالب التعاميم المدرسية الجاهزة</h4>
                  </div>
                  <span className="text-xs text-emerald-200">اختر قالباً لتعبئة النموذج المعتمد فوراً بنقرة واحدة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                  {CIRCULAR_TEMPLATES.map((tpl) => {
                    const IconComp = tpl.icon;
                    return (
                      <div 
                        key={tpl.id}
                        onClick={() => handleOpenCreateCircular(tpl)}
                        className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-emerald-400/50 rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between group hover:shadow-lg"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-emerald-200">
                              قالب معتمد
                            </span>
                          </div>
                          <h5 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors mb-1">
                            {tpl.label}
                          </h5>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                            {tpl.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-300 font-medium">
                          <span>استخدام القالب</span>
                          <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filtering and Search Controls */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={circularSearch}
                    onChange={(e) => setCircularSearch(e.target.value)}
                    placeholder="البحث في موضوع أو نص التعميم..."
                    className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm"
                  />
                  {circularSearch && (
                    <button 
                      onClick={() => setCircularSearch('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Counter of Circulars */}
                <div className="text-xs text-slate-500 font-medium px-3 py-2 bg-slate-100 rounded-xl flex items-center gap-2 self-start md:self-auto">
                  <span>إجمالي التعاميم:</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{filteredCirculars.length}</span>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-xs flex items-center gap-2 ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>كافة التصنيفات</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {circulars.length}
                  </span>
                </button>

                {CIRCULAR_TEMPLATES.map((tpl) => {
                  const countForCat = circulars.filter(c => c.category === tpl.category).length;
                  const isSelected = selectedCategory === tpl.category;
                  const IconComp = tpl.icon;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedCategory(tpl.category)}
                      className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-xs flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{tpl.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {countForCat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Circulars Grid */}
            {filteredCirculars.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base mb-1">لا توجد تعاميم مطابقة</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {circularSearch ? 'جرب البحث بكلمات أخرى أو تغيير التصنيف المختار' : 'لم يتم إصدار تعاميم في هذا التصنيف بعد، يمكنك البدء باختيار أحد القوالب الجاهزة أعلاه.'}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenCreateCircular()}
                  className="px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-all shadow-md shadow-emerald-700/20 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء تعميم جديد الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCirculars.map((c) => {
                  const badge = getCategoryBadgeInfo(c.category);
                  const IconComp = badge.icon;
                  const totalTarget = c.stats?.totalTarget || (stats?.totalTeachers || 1);
                  const confirmedCount = c.stats?.confirmed || 0;
                  const viewedCount = c.stats?.viewed || 0;
                  const confirmedPercent = totalTarget > 0 ? Math.round((confirmedCount / totalTarget) * 100) : 0;

                  return (
                    <div 
                      key={c.id} 
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      <div className="p-5 space-y-3.5">
                        {/* Top Metadata Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${badge.badgeBg} ${badge.badgeText} ${badge.badgeBorder}`}>
                            <IconComp className="w-3.5 h-3.5" />
                            <span>{c.category}</span>
                          </div>
                          
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                            {c.targetLevel || 'كامل المجمع'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
                          {c.title}
                        </h4>

                        {/* Excerpt */}
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 whitespace-pre-line">
                          {c.content}
                        </p>

                        {/* Confirmation Progress Bar */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              تأكيد القراءة:
                            </span>
                            <span className="font-bold text-slate-800 font-mono">
                              {confirmedCount} / {totalTarget} ({confirmedPercent}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(confirmedPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button 
                          onClick={() => setViewingCircular(c)}
                          className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors py-1 px-2 rounded-lg hover:bg-slate-200/60"
                          title="قراءة نص التعميم كاملاً"
                        >
                          <Eye className="w-4 h-4 text-emerald-600" />
                          <span>عرض النص</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleShareCircularWhatsApp(c)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="مشاركة التعميم عبر واتساب"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeletingCircular(c)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="حذف التعميم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* --- Create Accountability Modal --- */}
        {isCreateAccountabilityOpen && (() => {
          const selectedTeacherForAcc = teachers.find(t => String(t.id) === String(newAccTeacherId));

          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">إصدار ورقة مساءلة</h3>
                      <p className="text-xs text-slate-500 mt-0.5">إصدار مساءلة إدارية وتوجيه إشعار رسمي للموظف</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCreateAccountabilityOpen(false)} 
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    title="إغلاق"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={(e) => handleCreateAccountability(e)} className="space-y-5">
                  {/* Select Teacher */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">الموظف المعني بالمساءلة *</label>
                    <select 
                      value={newAccTeacherId} 
                      onChange={e => setNewAccTeacherId(e.target.value)} 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                    >
                      <option value="">اختر الموظف...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.specialty || t.level || 'معلم'})</option>
                      ))}
                    </select>

                    {/* Employee Selected Quick Info */}
                    {selectedTeacherForAcc && (
                      <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">الموظف:</span>
                          <span className="font-bold text-slate-900">{selectedTeacherForAcc.name}</span>
                          {selectedTeacherForAcc.level && (
                            <span className="px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md text-[11px]">
                              {selectedTeacherForAcc.level}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="dir-ltr font-mono">{selectedTeacherForAcc.phone}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accountability Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">عنوان المساءلة *</label>
                    <input 
                      type="text" 
                      value={newAccTitle}
                      onChange={e => setNewAccTitle(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800 font-medium"
                      placeholder="مثال: غياب يوم الأربعاء بدون عذر مسبق"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">الموضوع / التصنيف (اختياري)</label>
                    <input 
                      type="text" 
                      value={newAccSubject}
                      onChange={e => setNewAccSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800"
                      placeholder="مثال: انضباط الدوام المدرسي"
                    />
                  </div>

                  {/* Details */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">نص وتفاصيل المساءلة</label>
                    <textarea 
                      value={newAccDetails}
                      onChange={e => setNewAccDetails(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-slate-800 leading-relaxed"
                      placeholder="نأمل منكم التكرم بتقديم إفادتكم الخطية حول أسباب الغياب / التأخر..."
                    />
                  </div>

                  {/* WhatsApp Sending Configuration Card */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    newAccSendWhatsApp 
                      ? 'bg-emerald-50/60 border-emerald-200/90 shadow-xs' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={newAccSendWhatsApp} 
                        onChange={e => setNewAccSendWhatsApp(e.target.checked)} 
                        className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            إرسال عن طريق الواتس آب (WhatsApp)
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#25D366]/20 text-[#128C7E] rounded-full flex items-center gap-1">
                            <Share2 className="w-3 h-3 text-[#25D366]" />
                            إشعار فوري
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          فتح تطبيق الواتس آب تلقائياً بعد الاعتماد وتجهيز رسالة إشعار رسمية تتضمن رابط المساءلة المباشر لسرعة التوقيع والرد.
                        </p>

                        {/* WhatsApp Message Preview when Checked */}
                        {newAccSendWhatsApp && (
                          <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200/80 shadow-xs text-xs space-y-2">
                            <div className="flex items-center justify-between text-slate-500 border-b border-slate-100 pb-1.5">
                              <span className="font-semibold text-slate-700">معاينة إشعار الواتس آب:</span>
                              {selectedTeacherForAcc ? (
                                <span className="text-emerald-700 font-mono font-bold dir-ltr">
                                  إلى: {selectedTeacherForAcc.phone}
                                </span>
                              ) : (
                                <span className="text-amber-600 italic">حدد موظفاً لعرض الرقم</span>
                              )}
                            </div>
                            <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-slate-700 font-sans leading-relaxed text-[11px] whitespace-pre-line">
                              {`*مجمع الشريعة التعليمي - إشعار مساءلة إدارية*

المكرم أ. ${selectedTeacherForAcc ? selectedTeacherForAcc.name : '[اسم الموظف]'} المحترم،
السلام عليكم ورحمة الله وبركاته،،

تود إدارة مجمع الشريعة التعليمي إشعاركم بصدور ورقة مساءلة رسمية:
📌 الموضوع: ${newAccTitle.trim() || '[عنوان المساءلة]'}

يرجى التكرم بالدخول على رابط المنصة الإلكترونية للمعاينة والاعتماد وتقديم الإفادة وتوقيع الاستلام إلكترونياً:
🔗 رابط المنصة الإلكترونية للمعاينة والاعتماد:
https://shreeah2026.ai.studio
(أو عبر رابطكم المباشر السريع)`}
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsCreateAccountabilityOpen(false)} 
                      disabled={actionLoading}
                      className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      إلغاء
                    </button>

                    <div className="flex items-center gap-2.5">
                      {newAccSendWhatsApp && (
                        <button 
                          type="button" 
                          onClick={() => handleCreateAccountability(undefined, false)}
                          disabled={actionLoading}
                          className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
                          title="حفظ وإصدار المساءلة بالنظام دون إرسال إشعار واتساب"
                        >
                          إصدار وحفظ فقط
                        </button>
                      )}

                      <button 
                        type="submit" 
                        disabled={actionLoading} 
                        className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-sm disabled:opacity-70 flex items-center gap-2 ${
                          newAccSendWhatsApp 
                            ? 'bg-[#128C7E] hover:bg-[#0f776a] shadow-emerald-700/20' 
                            : 'bg-emerald-700 hover:bg-emerald-800'
                        }`}
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : newAccSendWhatsApp ? (
                          <Share2 className="w-4 h-4 text-emerald-300" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>
                          {newAccSendWhatsApp ? 'إصدار وإرسال عن طريق الواتس آب' : 'إصدار وحفظ'}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        
        
        {/* --- View Certificate Modal --- */}
        {viewingAward && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" id="certificate-modal-container">
            <div className="relative w-full max-w-3xl lg:max-w-4xl animate-in zoom-in-95 duration-300 my-auto flex flex-col items-center">
              {/* Close Button */}
              <button 
                onClick={() => setViewingAward(null)} 
                className="absolute -top-10 sm:-top-3 -right-2 sm:-right-10 p-2 sm:p-2.5 bg-white/15 hover:bg-white/25 rounded-full text-white backdrop-blur-md transition-all z-20 shadow-lg"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Certificate Canvas (Landscape) */}
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative aspect-[1.414/1] w-full flex flex-col border border-amber-200/50" id="certificate-canvas">
                {/* Print styles */}
                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    @page { size: A4 landscape; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    #certificate-canvas { width: 100vw !important; height: 100vh !important; max-width: none !important; max-height: none !important; border-radius: 0 !important; box-shadow: none !important; }
                    body > *:not(#certificate-modal-container) { display: none !important; }
                    #certificate-modal-container { position: static !important; background: none !important; padding: 0 !important; display: block !important; }
                    #certificate-modal-container > div { max-width: none !important; margin: 0 !important; width: 100% !important; }
                    #certificate-modal-container button { display: none !important; }
                  }
                `}} />
                
                {/* Outer Border */}
                <div className="flex-1 border-[8px] sm:border-[12px] border-amber-500/25 p-1.5 sm:p-3 bg-amber-50/70 flex">
                  {/* Inner Content Area */}
                  <div className="flex-1 border-2 sm:border-4 border-amber-600/30 bg-white relative flex flex-col justify-between items-center text-center p-4 sm:p-6 md:p-8 overflow-hidden">
                    
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/40 rounded-bl-full opacity-40 blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-100/40 rounded-tr-full opacity-40 blur-2xl pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-24 bg-amber-50/40 rotate-[-15deg] blur-xl pointer-events-none"></div>

                    {/* Corner Ornaments */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-amber-400/70 rounded-tr-xl pointer-events-none"></div>
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-amber-400/70 rounded-tl-xl pointer-events-none"></div>
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-amber-400/70 rounded-br-xl pointer-events-none"></div>
                    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-amber-400/70 rounded-bl-xl pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-3xl flex flex-col items-center justify-between h-full">
                      {/* Header Row */}
                      <div className="w-full flex justify-between items-center mb-2 sm:mb-3 px-2 sm:px-4">
                        {/* Right Header */}
                        <div className="text-right text-slate-800 font-bold text-[10px] sm:text-xs md:text-sm leading-tight sm:leading-relaxed">
                          <p>المملكة العربية السعودية</p>
                          <p>وزارة التعليم</p>
                          <p>إدارة التعليم بجازان</p>
                          <p>مجمع الشريعة التعليمي</p>
                        </div>
                        
                        {/* Center Logo/Icon */}
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 mx-2">
                          <Award className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                        </div>
                        
                        {/* Left Logo */}
                        <div className="w-20 sm:w-36 flex items-center justify-end shrink-0">
                          <Image 
                            src="/logo-moe-1448.png?v=3" 
                            alt="وزارة التعليم" 
                            width={160} 
                            height={80} 
                            className="w-auto h-10 sm:h-16 object-contain"
                            priority 
                            unoptimized 
                          />
                        </div>
                      </div>
                      
                      {/* Certificate Title */}
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-900 mb-1 sm:mb-2 tracking-tight">
                        شهادة شكر وتقدير
                      </h2>

                      <p className="text-slate-600 text-xs sm:text-sm md:text-base mb-1 leading-snug">
                        تتقدم إدارة المجمع بخالص الشكر وعظيم التقدير للمكرم الأستاذ /
                      </p>
                      
                      {/* Teacher Name */}
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-600 mb-1.5 sm:mb-3 py-1 px-8 sm:px-12 bg-gradient-to-r from-transparent via-amber-50 to-transparent">
                        {viewingAward.teacherName || 'المعلم'}
                      </h1>

                      <p className="text-slate-700 text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-4 leading-relaxed max-w-2xl px-2">
                        وذلك نظير جهوده المتميزة وتفانيه في العمل، وتقديراً لـ:
                        <br/>
                        <span className="block mt-1 sm:mt-2 text-amber-800 font-bold bg-amber-100/60 py-1 sm:py-1.5 px-4 sm:px-6 rounded-xl border border-amber-200/60 inline-block shadow-xs text-xs sm:text-sm">
                          {viewingAward.reason}
                        </span>
                      </p>

                      {/* Footer Row */}
                      <div className="w-full flex justify-between items-end mt-auto px-4 sm:px-8 relative">
                        {/* Date */}
                        <div className="text-center w-28 sm:w-36">
                          <div className="h-px bg-slate-300 w-full mb-1 sm:mb-2"></div>
                          <p className="text-slate-500 text-[10px] sm:text-xs font-bold mb-0.5">التاريخ</p>
                          <p className="text-slate-800 font-mono font-medium text-xs sm:text-sm">
                            {new Date(viewingAward.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        
                        {/* Subtle Center Watermark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                          <Award className="w-36 h-36 sm:w-48 sm:h-48 text-amber-900" />
                        </div>

                        {/* Manager Signature */}
                        <div className="text-center w-32 sm:w-48 relative">
                          <div className="h-10 sm:h-14 flex items-center justify-center relative -mb-2">
                            <div className="absolute font-serif text-sm sm:text-lg text-blue-900/40 -rotate-6 -top-1 right-2 pointer-events-none">
                              يعتمد،
                            </div>
                            <ManagerSignature className="h-12 sm:h-16 w-28 sm:w-40 text-[#1d4ed8] -rotate-3" />
                          </div>
                          <div className="h-px bg-slate-400 w-full mb-1"></div>
                          <p className="text-slate-500 text-[10px] sm:text-xs font-bold">مدير المجمع</p>
                          <p className="text-slate-900 font-extrabold text-xs sm:text-sm md:text-base">أ/ حمود بن علي نهاري</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="flex justify-center gap-4 mt-4 mb-2">
                <button 
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-white text-slate-800 rounded-xl font-bold shadow-md hover:bg-slate-50 hover:scale-105 transition-all flex items-center gap-2 text-xs sm:text-sm border border-slate-200/60"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  طباعة / حفظ كـ PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- View Accountability Doc Modal --- */}
        {viewingAccountabilityDoc && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto" id="accountability-modal-container">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-100 my-8 relative">
              {/* Print styles */}
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  @page { size: A4 portrait; margin: 15mm; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  body > *:not(#accountability-modal-container) { display: none !important; }
                  #accountability-modal-container { position: static; background: none; padding: 0; display: block; }
                  #accountability-modal-container > div { max-width: none; margin: 0; box-shadow: none; border: none; }
                  #accountability-modal-container button { display: none !important; }
                }
              `}} />

              {/* Close Button */}
              <button 
                onClick={() => setViewingAccountabilityDoc(null)} 
                className="absolute top-6 left-6 p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Official Header */}
              <div className="border-b-2 border-emerald-800/20 pb-5 mb-6 flex justify-between items-center">
                <div className="text-right text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                  <p>المملكة العربية السعودية</p>
                  <p>وزارة التعليم</p>
                  <p>إدارة التعليم بجازان</p>
                  <p>مجمع الشريعة التعليمي</p>
                </div>
                <div className="w-24 sm:w-32 flex items-center justify-center">
                  <Image 
                    src="/logo-moe-1448.png?v=3" 
                    alt="وزارة التعليم" 
                    width={120} 
                    height={60} 
                    className="w-auto h-16 object-contain"
                    priority 
                    unoptimized 
                  />
                </div>
                <div className="text-left text-xs text-slate-500 font-mono">
                  <p>التاريخ: {new Date(viewingAccountabilityDoc.createdAt).toLocaleDateString('ar-SA')}</p>
                  <p>الرقم: {viewingAccountabilityDoc.id?.toString().padStart(4, '0')}</p>
                  <p>المرفقات: لا يوجد</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-6">
                <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-900 rounded-full text-sm font-black mb-2">
                  ورقة مساءلة إدارية رسمية
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  الموضوع: {viewingAccountabilityDoc.title}
                </h3>
              </div>

              {/* Directed To */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6 text-sm">
                <p className="text-slate-800 font-bold mb-1">
                  المكرم الأستاذ / <span className="text-emerald-800 text-base">{viewingAccountabilityDoc.teacherName}</span> المحترم
                </p>
                <p className="text-slate-600 text-xs">
                  السلام عليكم ورحمة الله وبركاته،، وبعد:
                </p>
              </div>

              {/* Details Body */}
              <div className="space-y-4 mb-6 text-sm leading-relaxed text-slate-800">
                <div className="p-5 bg-slate-50/60 rounded-2xl border border-slate-100 whitespace-pre-line">
                  {viewingAccountabilityDoc.details || viewingAccountabilityDoc.subject || 'نأمل توضيح أسباب ذلك وتقديم إفادتكم خطياً.'}
                </div>
              </div>

              {/* Principal Signature Block */}
              <div className="flex justify-end mb-8">
                <div className="text-center w-52">
                  <p className="text-xs text-slate-500 font-bold mb-1">مدير مجمع الشريعة التعليمي</p>
                  <p className="text-sm font-bold text-slate-900">أ/ حمود بن علي نهاري</p>
                  <div className="h-14 flex items-center justify-center -my-2 relative">
                    <ManagerSignature className="h-16 w-36 text-[#1d4ed8] -rotate-2" />
                  </div>
                  <div className="h-px bg-slate-400 w-full mb-1"></div>
                  <span className="text-[10px] text-slate-400">الختم والاعتماد الرسمي</span>
                </div>
              </div>

              {/* Employee Response Section */}
              <div className="border-t-2 border-dashed border-slate-200 pt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>إفادة وتوقيع الموظف:</span>
                </h4>
                
                {viewingAccountabilityDoc.status === 'signed' ? (
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                    <p className="text-xs text-slate-500 font-bold mb-2">نص الإفادة:</p>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-slate-800 text-sm leading-relaxed whitespace-pre-line mb-4">
                      {viewingAccountabilityDoc.response || 'تم تأكيد الاستلام والرد.'}
                    </div>
                    <div className="flex justify-between items-end text-xs">
                      <div className="text-slate-500">
                        <span>تاريخ التوقيع: </span>
                        <span className="font-mono font-bold text-slate-800">
                          {viewingAccountabilityDoc.signedAt ? new Date(viewingAccountabilityDoc.signedAt).toLocaleString('ar-SA') : '---'}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-slate-500 mb-1">توقيع الموظف الإلكتروني</span>
                        {viewingAccountabilityDoc.signatureData ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={viewingAccountabilityDoc.signatureData} 
                            alt="توقيع الموظف" 
                            className="h-12 max-w-[150px] object-contain mx-auto" 
                          />
                        ) : (
                          <span className="text-emerald-700 font-bold">تم التوقيع إلكترونياً</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center text-amber-800 text-xs font-bold">
                    بانتظار اطلاع الموظف وتوقيعه على الإفادة عبر بوابته الخاصة.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    طباعة / حفظ PDF
                  </button>
                  <button
                    onClick={() => handleShareAccountability(viewingAccountabilityDoc)}
                    className="px-4 py-2.5 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    title="إرسال إشعار المساءلة عبر الواتس آب للموظف"
                  >
                    <Share2 className="w-4 h-4 text-[#25D366]" />
                    إرسال عن طريق الواتس آب
                  </button>
                </div>
                <button
                  onClick={() => setViewingAccountabilityDoc(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Create Award Modal --- */}
        {isCreateAwardOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">إصدار خطاب شكر</h3>
                </div>
                <button onClick={() => setIsCreateAwardOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleCreateAward} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">الموظف</label>
                  <select 
                    value={newAwardTeacherId} 
                    onChange={e => setNewAwardTeacherId(e.target.value)} 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="">اختر الموظف...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">سبب الشكر والتحفيز</label>
                  <textarea 
                    value={newAwardReason}
                    onChange={e => setNewAwardReason(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="مثال: جهوده المتميزة في الانضباط والمواظبة..."
                  />
                </div>

                {/* WhatsApp Notification Option */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={newAwardSendWhatsApp}
                      onChange={(e) => setNewAwardSendWhatsApp(e.target.checked)}
                      className="w-5 h-5 text-emerald-600 rounded-lg border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                        <Share2 className="w-4 h-4 text-emerald-600" />
                        <span>إرسال إشعار للموظف عبر الواتس آب فور الإصدار</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        يتضمن رابط المنصة الإلكترونية للمعاينة والاعتماد: <span className="font-mono text-emerald-700 font-bold dir-ltr">https://shreeah2026.ai.studio</span>
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreateAwardOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    إلغاء
                  </button>
                  <button type="submit" disabled={actionLoading} className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    إصدار وحفظ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* --- Accountability Tab --- */}
        {activeTab === 'accountability' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">أوراق المساءلة</h3>
                <p className="text-sm text-slate-500 mt-1">إدارة وإصدار أوراق المساءلة للموظفين</p>
              </div>
              <button 
                onClick={() => setIsCreateAccountabilityOpen(true)}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                إصدار ورقة مساءلة
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-600">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-right">الموظف</th>
                      <th className="px-6 py-4 font-semibold text-right">الموضوع</th>
                      <th className="px-6 py-4 font-semibold text-right">التاريخ</th>
                      <th className="px-6 py-4 font-semibold text-right">الحالة</th>
                      <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accountabilityDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{doc.teacherName || 'غير معروف'}</td>
                        <td className="px-6 py-4 text-slate-700">{doc.title}</td>
                        <td className="px-6 py-4">{new Date(doc.createdAt).toLocaleDateString('ar-SA')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${doc.status === 'signed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {doc.status === 'signed' ? 'تم الرد' : 'بانتظار الرد'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setViewingAccountabilityDoc(doc)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition-all text-xs font-bold"
                              title="عرض ورقة المساءلة وطباعتها"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              عرض / طباعة
                            </button>
                            <button 
                              onClick={() => handleShareAccountability(doc)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-lg transition-all text-xs font-bold"
                              title="إرسال رابط المساءلة عبر واتساب"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              واتساب
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {accountabilityDocs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          لا توجد أوراق مساءلة حالياً.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Awards Tab --- */}
        {activeTab === 'awards' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">شهادات التحفيز والشكر</h3>
                <p className="text-sm text-slate-500 mt-1">إصدار خطابات الشكر للموظفين المتميزين</p>
              </div>
              <button 
                onClick={() => setIsCreateAwardOpen(true)}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                إصدار خطاب شكر
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-600">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-right">الموظف</th>
                      <th className="px-6 py-4 font-semibold text-right">سبب الشكر</th>
                      <th className="px-6 py-4 font-semibold text-right">التاريخ</th>
                      <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {awards.map((award) => (
                      <tr key={award.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{award.teacherName || 'غير معروف'}</td>
                        <td className="px-6 py-4 text-slate-700">{award.reason}</td>
                        <td className="px-6 py-4">{new Date(award.createdAt).toLocaleDateString('ar-SA')}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setViewingAward(award)}
                              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="عرض الشهادة"
                            >
                              <Award className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleShareAward(award)}
                              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="إرسال عبر واتساب"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {awards.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          لا توجد خطابات شكر حالياً.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Motivation & Honoring Tab (التكريم والتحفيز) --- */}
        {activeTab === 'motivation' && (
          <MotivationSection getToken={getToken} allTeachers={teachers} />
        )}

        {/* --- Create Circular Modal --- */}
        {isCreateCircularOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">إصدار تعميم مدرسي جديد</h3>
                    <p className="text-xs text-slate-500">اختر قالباً معتمداً أو قم بملء الحقول وتعديلها يدوياً</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCreateCircularOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Template Picker Bar inside Modal */}
              <div className="mt-5 space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  اختيار قالب التعميم السريع:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CIRCULAR_TEMPLATES.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id || newCircularCategory === tpl.category;
                    const IconComp = tpl.icon;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 text-xs font-bold ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-600/20 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500'}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{tpl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleCreateCircular} className="space-y-5 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      تصنيف التعميم <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      value={newCircularCategory} 
                      onChange={(e) => {
                        setNewCircularCategory(e.target.value);
                        const match = CIRCULAR_TEMPLATES.find(t => t.category === e.target.value);
                        if (match && (!newCircularTitle || !newCircularContent)) {
                          applyTemplate(match);
                        }
                      }}
                      required 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium"
                    >
                      <option value="انضباط ودوام">انضباط ودوام</option>
                      <option value="إشراف ومناوبة">إشراف ومناوبة</option>
                      <option value="شؤون تعليمية ونور">شؤون تعليمية ونور</option>
                      <option value="اختبارات وكنترول">اختبارات وكنترول</option>
                      <option value="أمن وسلامة">أمن وسلامة</option>
                      <option value="أنشطة وفعاليات">أنشطة وفعاليات</option>
                      <option value="عام">عام</option>
                    </select>
                  </div>

                  {/* Target Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      المرحلة المستهدفة <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      value={newCircularTargetLevel} 
                      onChange={(e) => setNewCircularTargetLevel(e.target.value)}
                      required 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium"
                    >
                      <option value="كامل المجمع">كامل المجمع (جميع المعلمين والإداريين)</option>
                      <option value="الابتدائية">المرحلة الابتدائية فقط</option>
                      <option value="المتوسطة">المرحلة المتوسطة فقط</option>
                      <option value="الثانوية">المرحلة الثانوية فقط</option>
                      <option value="المتوسطة والثانوية">المرحلة المتوسطة والثانوية</option>
                    </select>
                  </div>
                </div>

                {/* Circular Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    عنوان / موضوع التعميم <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={newCircularTitle} 
                    onChange={(e) => setNewCircularTitle(e.target.value)}
                    required 
                    placeholder="مثال: تعميم بشأن التقيد بالدوام الرسمي والاصطفاف الصباحي"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium"
                  />
                </div>

                {/* Circular Content */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    نص التعميم الرسمي <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    rows={8}
                    value={newCircularContent} 
                    onChange={(e) => setNewCircularContent(e.target.value)}
                    required 
                    placeholder="اكتب التوجيهات والبنود المطلوب الالتزام بها من قبل المنسوبين..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm leading-relaxed"
                  />
                </div>

                {/* Publication Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">حالة النشر</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1">
                      <input 
                        type="radio" 
                        name="status" 
                        value="sent" 
                        checked={newCircularStatus === 'sent'} 
                        onChange={() => setNewCircularStatus('sent')}
                        className="text-emerald-600 focus:ring-emerald-500" 
                      />
                      <span>نشر فوري وإتاحته لتأكيد المعلمين</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1">
                      <input 
                        type="radio" 
                        name="status" 
                        value="draft" 
                        checked={newCircularStatus === 'draft'} 
                        onChange={() => setNewCircularStatus('draft')}
                        className="text-emerald-600 focus:ring-emerald-500" 
                      />
                      <span>حفظ كمسودة للمراجعة لاحقاً</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-3 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    إصدار واعتماد التعميم
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsCreateCircularOpen(false)}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- View Circular Details Modal --- */}
        {viewingCircular && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
              {/* Official School Letterhead */}
              <div className="border-b-2 border-emerald-800/20 pb-5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
                      <Image 
                        src="/logo-moe-1448.png?v=3" 
                        alt="وزارة التعليم"
                        width={48}
                        height={48}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-emerald-800">المملكة العربية السعودية - وزارة التعليم</p>
                      <p className="text-[11px] text-slate-600">الإدارة العامة للتعليم بمنطقة جازان</p>
                      <h4 className="text-base font-bold text-slate-900">مجمع الشريعة التعليمي</h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => setViewingCircular(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                  {(() => {
                    const badge = getCategoryBadgeInfo(viewingCircular.category);
                    const IconComp = badge.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-semibold ${badge.badgeBg} ${badge.badgeText} ${badge.badgeBorder}`}>
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{viewingCircular.category}</span>
                      </span>
                    );
                  })()}
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                    المستهدف: {viewingCircular.targetLevel || 'كامل المجمع'}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] mr-auto">
                    {new Date(viewingCircular.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  {viewingCircular.title}
                </h3>
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 text-slate-800 text-sm leading-relaxed whitespace-pre-line font-normal">
                  {viewingCircular.content}
                </div>
              </div>

              {/* Response Stats */}
              <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-800 font-bold mb-0.5">مؤشرات الاطلاع والتأكيد الإلكتروني</p>
                  <p className="text-xs text-slate-600">
                    تم التأكيد من قبل <span className="font-bold text-emerald-700 font-mono">{viewingCircular.stats?.confirmed || 0}</span> موظف من أصل <span className="font-bold text-slate-800 font-mono">{viewingCircular.stats?.totalTarget || (stats?.totalTeachers || 1)}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleShareCircularWhatsApp(viewingCircular)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  مشاركة عبر واتساب
                </button>
              </div>

              {/* Principal Signature & Endorsement */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-end">
                <div className="text-xs text-slate-400">
                  <p>الإدارة العامة للتعليم بمنطقة جازان</p>
                  <p>مجمع الشريعة التعليمي - الإدارة المدرسية</p>
                </div>
                <div className="text-center w-48">
                  <p className="text-xs text-slate-500 font-bold mb-0.5">مدير مجمع الشريعة التعليمي</p>
                  <p className="text-sm font-extrabold text-slate-900">أ/ حمود بن علي نهاري</p>
                  <div className="h-14 flex items-center justify-center -my-2 relative">
                    <ManagerSignature className="h-16 w-36 text-[#1d4ed8] -rotate-2" />
                  </div>
                  <div className="h-px bg-slate-300 w-full"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setViewingCircular(null)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Delete Circular Confirmation Modal --- */}
        {deletingCircular && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">تأكيد حذف التعميم</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف التعميم: <br />
                  <span className="font-bold text-slate-800">«{deletingCircular.title}»</span>؟ <br />
                  لن يتمكن المعلمون من الاطلاع عليه بعد الحذف.
                </p>
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  onClick={handleDeleteCircular}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  تأكيد الحذف
                </button>
                <button 
                  onClick={() => setDeletingCircular(null)}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                >
                  تراجع
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Internal Helper Components ---

function NavItem({ icon: Icon, label, active, onClick, className = "" }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-amber-400 text-emerald-900 font-bold shadow-lg shadow-emerald-950/50' 
          : 'text-emerald-100 hover:bg-emerald-800/50'
      } ${className}`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-emerald-900' : 'text-emerald-300'}`} />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function ActivityItem({ title, desc, time, type }: any) {
  const colors: any = {
    success: 'bg-emerald-100 text-emerald-600',
    info: 'bg-blue-100 text-blue-600',
    error: 'bg-rose-100 text-rose-600'
  };
  
  return (
    <div className="p-6 flex items-start gap-4">
      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${type === 'success' ? 'bg-emerald-500' : type === 'info' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-sm text-slate-900">{title}</h4>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ProgressCircle({ label, percent, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
