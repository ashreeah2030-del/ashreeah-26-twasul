"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { Award, Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface LetterProps {
  teacherName: string;
  reason: string;
  date: string;
}

export default function AppreciationLetter({ teacherName, reason, date }: LetterProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`خطاب_شكر_${teacherName}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3 mb-4">
        <button 
          onClick={downloadPDF}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          <Download className="w-4 h-4" />
          تحميل كـ PDF
        </button>
        <button className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
          <Printer className="w-4 h-4" />
          طباعة فورية
        </button>
      </div>

      {/* Certificate Design */}
      <div 
        ref={certificateRef}
        className="aspect-[1.414/1] w-full bg-white p-12 border-[20px] border-emerald-900 shadow-2xl relative overflow-hidden"
        dir="rtl"
        style={{ fontFamily: 'var(--font-geist-sans)' }}
      >
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        {/* Inner Border */}
        <div className="h-full w-full border-4 border-amber-400 p-8 flex flex-col items-center justify-between text-center relative z-10">
          
          <header className="flex justify-between w-full mb-8">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400">المملكة العربية السعودية</p>
              <p className="text-xs font-bold text-slate-400">وزارة التعليم</p>
              <p className="text-xs font-bold text-emerald-700">الإدارة العامة للتعليم بجازان</p>
              <p className="text-xs font-bold text-emerald-900">مجمع الشريعة التعليمي</p>
            </div>
            <div className="w-16 h-16 bg-white p-2 rounded-xl flex items-center justify-center shadow-md border border-slate-100">
              <Image 
                src="/logo-moe-1448.png?v=3" 
                alt="وزارة التعليم"
                width={50}
                height={50}
                className="object-contain w-full h-full"
              />
            </div>
          </header>

          <div className="space-y-8 flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-black text-emerald-900 tracking-widest">شهادة شكر وتقدير</h1>
            
            <div className="space-y-4">
              <p className="text-xl text-slate-600">يسر إدارة مجمع الشريعة التعليمي أن تتقدم بوافر الشكر للزميل:</p>
              <h2 className="text-4xl font-bold text-amber-600 underline decoration-amber-200 underline-offset-8">{teacherName}</h2>
            </div>

            <p className="text-lg text-slate-700 leading-loose max-w-2xl mx-auto">
              وذلك لقاء جهوده المتميزة وتفانيه في {reason}، متمنين له مزيداً من التوفيق والنجاح في مسيرته التربوية والتعليمية.
            </p>
          </div>

          <footer className="w-full flex justify-between items-end mt-12">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">التاريخ</p>
              <p className="font-bold text-slate-800">{date}</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-900 font-bold text-lg mb-2">مدير المجمع</p>
              <div className="h-px w-32 bg-slate-200 mx-auto mb-2"></div>
              <p className="text-slate-400 text-xs">ختم المجمع الرسمي</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
