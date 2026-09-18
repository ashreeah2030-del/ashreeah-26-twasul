"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import ManagerSignature from '@/components/ManagerSignature';
import { useParams } from 'next/navigation';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  PenTool, 
  Download, 
  ArrowLeft,
  Loader2,
  Clock,
  User,
  ShieldCheck,
  Award,
  Trophy,
  Crown,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export default function TeacherInterface() {
  const params = useParams();
  const { id, token } = params;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [activeAward, setActiveAward] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const sigPad = useRef<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher-access?id=${id}&token=${token}`);
      const result = await res.json();
      if (result.error) setError(result.error);
      else setData(result);
    } catch {
      setError('تعذر تحميل البيانات. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (active) {
        await fetchData();
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [fetchData]);

  const handleConfirmCircular = async (circularId: number) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token, action: 'confirm_circular', targetId: circularId })
      });
      if (res.ok) {
        alert('تم تأكيد الاطلاع بنجاح');
        fetchData();
      }
    } catch (err) {
      alert('حدث خطأ أثناء التأكيد');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignDoc = async () => {
    if (sigPad.current.isEmpty()) {
      alert('يرجى وضع التوقيع أولاً');
      return;
    }

    setSubmitting(true);
    try {
      const signatureUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
      const res = await fetch('/api/teacher-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          token, 
          action: 'sign_accountability', 
          targetId: activeDoc.id,
          responseText,
          signatureUrl
        })
      });
      if (res.ok) {
        alert('تم التوقيع بنجاح');
        setActiveDoc(null);
        setResponseText('');
        fetchData();
      }
    } catch (err) {
      alert('حدث خطأ أثناء التوقيع');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      <p className="text-slate-600 font-medium">جاري تأمين الاتصال بالمنصة...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">رابط غير صالح</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-bold">إعادة المحاولة</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 border-b border-emerald-800/50 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg border border-emerald-400/20">
                <Image 
                  src="/logo-moe-1448.png?v=3" 
                  alt="وزارة التعليم"
                  width={60}
                  height={60}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <div className="text-right">
                <p className="text-[10px] text-emerald-300 font-bold mb-1">الإدارة العامة للتعليم بجازان</p>
                <h2 className="text-lg font-bold leading-tight">مجمع الشريعة التعليمي</h2>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left sm:text-right">
              <div>
                <h1 className="text-2xl font-bold">{data.teacher.name}</h1>
                <p className="text-emerald-300 opacity-90">
                  {data.teacher.jobTitle || '---'} - {data.teacher.specialty}
                  {data.teacher.discipline && ` (${data.teacher.discipline})`}
                </p>
                <p className="text-xs text-emerald-400 mt-1">{data.teacher.level}</p>
              </div>
              <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center text-emerald-900 shadow-lg overflow-hidden border-2 border-white/40 shrink-0">
                {data.teacher.avatarUrl ? (
                  <img src={data.teacher.avatarUrl} alt={data.teacher.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-800/50 p-4 rounded-2xl border border-emerald-700/50">
              <p className="text-emerald-400 text-xs mb-1">التخصص</p>
              <p className="font-bold">{data.teacher.employeeId || 'غير مسجل'}</p>
            </div>
            <div className="bg-emerald-800/50 p-4 rounded-2xl border border-emerald-700/50">
              <p className="text-emerald-400 text-xs mb-1">حالة الحساب</p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <p className="font-bold">موثق وآمن</p>
              </div>
            </div>
          </div>
        </header>

        {/* Motivation & Honoring Badges Section */}
        {data.motivation && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>منظومة التكريم والتحفيز</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">رصيد النقاط التراكمي وسجل الأوسمة الشرفية المستحقة</p>
                </div>
              </div>

              {/* Total Points Badge */}
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 rounded-2xl">
                <div className="text-right">
                  <span className="text-[11px] text-emerald-700 font-bold block">رصيدك التراكمي</span>
                  <span className="text-2xl font-black font-mono text-emerald-900 leading-tight">
                    {data.motivation.points || 0}
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-700">نقطة</span>
              </div>
            </div>

            {/* The 3 Medals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* وسام التقدم (100) */}
              <div className={`p-4 rounded-2xl border transition-all ${
                data.motivation.hasProgress 
                  ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-400/20 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                    100 نقطة
                  </span>
                  {data.motivation.hasProgress ? (
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">قيد التقدم</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    data.motivation.hasProgress ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">وسام التقدم</h4>
                    <span className="text-[11px] text-slate-500 block">
                      {data.motivation.hasProgress ? 'تم تحقيقه بجدارة' : `${Math.max(0, 100 - (data.motivation.points || 0))} نقطة متبقية`}
                    </span>
                  </div>
                </div>
              </div>

              {/* وسام المثالية (200) */}
              <div className={`p-4 rounded-2xl border transition-all ${
                data.motivation.hasExcellence 
                  ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-400/20 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                    200 نقطة
                  </span>
                  {data.motivation.hasExcellence ? (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">قيد التقدم</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    data.motivation.hasExcellence ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">وسام المثالية</h4>
                    <span className="text-[11px] text-slate-500 block">
                      {data.motivation.hasExcellence ? 'تم تحقيقه بجدارة' : `${Math.max(0, 200 - (data.motivation.points || 0))} نقطة متبقية`}
                    </span>
                  </div>
                </div>
              </div>

              {/* وسام النجومية (300) */}
              <div className={`p-4 rounded-2xl border transition-all ${
                data.motivation.hasStardom 
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                    300 نقطة
                  </span>
                  {data.motivation.hasStardom ? (
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">قيد التقدم</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    data.motivation.hasStardom ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">وسام النجومية</h4>
                    <span className="text-[11px] text-slate-500 block">
                      {data.motivation.hasStardom ? 'أعلى أوسمة التميز بالمجمع' : `${Math.max(0, 300 - (data.motivation.points || 0))} نقطة متبقية`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress to Next Badge Bar */}
            {data.motivation.nextBadge && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span>الهدف القادم:</span>
                    <strong className="text-emerald-800">{data.motivation.nextBadge.name}</strong>
                  </span>
                  <span className="text-emerald-700 font-mono text-[11px]">
                    متبقي {data.motivation.pointsToNext} نقطة فقط!
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-l from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${data.motivation.progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* History of Granted Points */}
            {data.motivation.logs && data.motivation.logs.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>سجل الإنجازات والنقاط المكتسبة:</span>
                </h4>
                <div className="space-y-2">
                  {data.motivation.logs.map((log: any) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{log.domainTitle}</span>
                        {log.notes && <span className="text-slate-500 text-[11px] block mt-0.5">{log.notes}</span>}
                        <span className="text-slate-400 text-[10px] block mt-0.5 font-mono">
                          {new Date(log.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold rounded-lg shrink-0">
                        +{log.points} نقطة
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Accountability Docs */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">أوراق المساءلة المعلقة</h3>
          </div>
          <div className="space-y-4">
            {data.accountability.filter((d: any) => d.status !== 'signed').length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 italic">
                لا توجد مساءلات معلقة حالياً.
              </div>
            ) : (
              data.accountability.filter((d: any) => d.status !== 'signed').map((doc: any) => (
                <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 mb-1">{doc.title}</h4>
                      <p className="text-slate-500 text-sm">{doc.subject}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">بانتظار الرد</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 mb-6 leading-relaxed">
                    {doc.details}
                  </div>
                  <button 
                    onClick={() => setActiveDoc(doc)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    <PenTool className="w-4 h-4" />
                    الرد والتوقيع إلكترونياً
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Circulars */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900">التعاميم الجديدة</h3>
          </div>
          <div className="space-y-4">
            {data.circulars.map((c: any) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {c.category || 'عام'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                        {c.targetLevel || 'كامل المجمع'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{c.title}</h4>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(c.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="text-slate-600 text-sm mb-6 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  {c.content}
                </div>
                <div className="flex gap-3">
                  {c.isConfirmed ? (
                    <div className="flex-1 py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span>تم الاطلاع وتوقيع العلم إلكترونياً</span>
                      </div>
                      {c.confirmedAt && (
                        <span className="text-xs font-normal text-emerald-700 font-mono">
                          {new Date(c.confirmedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} - {new Date(c.confirmedAt).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleConfirmCircular(c.id)}
                      disabled={submitting}
                      className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-[0.99]"
                    >
                      <CheckCircle className="w-5 h-5" />
                      الاطلاع والتوقيع بالعلم (إلكترونياً)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">شهادات التحفيز وخطابات الشكر</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.awards.map((award: any) => (
                <div key={award.id} 
                     onClick={() => setActiveAward(award)}
                     className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-200/50 rounded-full blur-2xl group-hover:bg-amber-300/50 transition-all"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-amber-700/70 bg-amber-100/50 px-2 py-1 rounded-lg">
                      {new Date(award.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-amber-900 mb-2 relative z-10">خطاب شكر وتقدير</h4>
                  <p className="text-amber-800/80 text-sm leading-relaxed relative z-10 line-clamp-2">
                    {award.reason}
                  </p>
                  <div className="mt-4 pt-4 border-t border-amber-200/50 flex justify-between items-center relative z-10">
                    <span className="text-xs font-bold text-amber-700">اضغط لعرض الشهادة</span>
                    <Award className="w-4 h-4 text-amber-600 group-hover:scale-125 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>للاستفسارات والدعم الفني، يرجى التواصل عبر رقم جوال المجمع:</p>
          <p className="font-bold font-mono mt-1 text-emerald-700" dir="ltr">+966 50 920 5097</p>
        </footer>
      </div>

      {/* Signature Modal */}
      {activeDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-xl">الاطلاع والرد على المساءلة</h3>
              <button onClick={() => setActiveDoc(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">إفادة الموظف / الرد</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  placeholder="اكتب ردك هنا بالتفصيل..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">التوقيع الإلكتروني</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden relative">
                  <SignatureCanvas 
                    ref={sigPad}
                    penColor='black'
                    canvasProps={{width: 500, height: 200, className: 'w-full h-40 cursor-crosshair'}}
                  />
                  <button 
                    onClick={() => sigPad.current.clear()}
                    className="absolute bottom-2 left-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-rose-500 hover:bg-rose-50 font-bold"
                  >
                    مسح التوقيع
                  </button>
                </div>
                <p className="mt-3 text-center text-xs font-bold text-slate-500">بالتوقيع هنا، أنت تقر باستلامك لهذه المساءلة واطلاعك عليها، وبصحة البيانات الواردة في إفادتك.</p>
              </div>

              <button 
                onClick={handleSignDoc}
                disabled={submitting}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
                توقيع الاستلام وإرسال الرد
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Certificate Modal */}
      {activeAward && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" id="certificate-modal-container">
          <div className="relative w-full max-w-3xl lg:max-w-4xl animate-in zoom-in-95 duration-300 my-auto flex flex-col items-center">
            {/* Close Button */}
            <button 
              onClick={() => setActiveAward(null)} 
              className="absolute -top-10 sm:-top-3 -right-2 sm:-right-10 p-2 sm:p-2.5 bg-white/15 hover:bg-white/25 rounded-full text-white backdrop-blur-md transition-all z-20 shadow-lg"
              title="إغلاق"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
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
                      {data.teacher.name}
                    </h1>

                    <p className="text-slate-700 text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-4 leading-relaxed max-w-2xl px-2">
                      وذلك نظير جهوده المتميزة وتفانيه في العمل، وتقديراً لـ:
                      <br/>
                      <span className="block mt-1 sm:mt-2 text-amber-800 font-bold bg-amber-100/60 py-1 sm:py-1.5 px-4 sm:px-6 rounded-xl border border-amber-200/60 inline-block shadow-xs text-xs sm:text-sm">
                        {activeAward.reason}
                      </span>
                    </p>

                    {/* Footer Row */}
                    <div className="w-full flex justify-between items-end mt-auto px-4 sm:px-8 relative">
                      {/* Date */}
                      <div className="text-center w-28 sm:w-36">
                        <div className="h-px bg-slate-300 w-full mb-1 sm:mb-2"></div>
                        <p className="text-slate-500 text-[10px] sm:text-xs font-bold mb-0.5">التاريخ</p>
                        <p className="text-slate-800 font-mono font-medium text-xs sm:text-sm">
                          {new Date(activeAward.createdAt).toLocaleDateString('ar-SA')}
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
    </div>
  );
}
