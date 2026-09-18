import re

with open('app/teacher/[id]/[token]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "{/* Certificate Modal */}"

if start_marker in content:
    before = content.split(start_marker)[0]
    
    new_modal = """      {/* Certificate Modal */}
      {activeAward && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto" id="certificate-modal-container">
          <div className="relative w-full max-w-5xl animate-in zoom-in-95 duration-500 mt-10">
            {/* Close Button */}
            <button 
              onClick={() => setActiveAward(null)} 
              className="absolute -top-12 sm:-top-4 -right-4 sm:-right-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all z-10"
            >
              <ArrowLeft className="w-6 h-6 rotate-180" />
            </button>
            
            {/* Certificate Canvas (Landscape) */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative aspect-[1.414/1] flex flex-col" id="certificate-canvas">
              {/* Print styles */}
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  @page { size: A4 landscape; margin: 0; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  #certificate-canvas { width: 100%; height: 100vh; max-width: none; border-radius: 0; box-shadow: none; }
                  /* Hide everything else when printing */
                  body > *:not(#certificate-modal-container) { display: none !important; }
                  #certificate-modal-container { position: static; background: none; padding: 0; display: block; }
                  #certificate-modal-container > div { max-width: none; margin: 0; }
                  #certificate-modal-container button { display: none !important; }
                }
              `}} />
              
              {/* Outer Border */}
              <div className="flex-1 border-[16px] border-amber-500/20 p-2 sm:p-4 bg-amber-50 flex">
                {/* Inner Content Area */}
                <div className="flex-1 border-4 border-amber-600/30 bg-white relative flex flex-col justify-center items-center text-center p-8 sm:p-12 md:p-16 overflow-hidden">
                  
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-bl-full opacity-50 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/50 rounded-tr-full opacity-50 blur-3xl"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-amber-50/50 rotate-[-15deg] blur-2xl"></div>

                  {/* Corner Ornaments */}
                  <div className="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 border-amber-400/60 rounded-tr-2xl"></div>
                  <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-amber-400/60 rounded-tl-2xl"></div>
                  <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-amber-400/60 rounded-br-2xl"></div>
                  <div className="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 border-amber-400/60 rounded-bl-2xl"></div>

                  <div className="relative z-10 w-full max-w-4xl flex flex-col items-center h-full">
                    <div className="flex items-center justify-center gap-6 mb-4 w-full">
                      <div className="h-px bg-amber-200 flex-1"></div>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                        <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
                      </div>
                      <div className="h-px bg-amber-200 flex-1"></div>
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl font-black text-amber-900 mb-2 tracking-tight">شهادة شكر وتقدير</h2>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-6">مجمع الشريعة التعليمي - الإدارة العامة للتعليم بجازان</h3>

                    <p className="text-slate-600 text-lg sm:text-xl mb-4 leading-relaxed">
                      تتقدم إدارة المجمع بخالص الشكر وعظيم التقدير للمكرم الأستاذ /
                    </p>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-amber-600 mb-6 py-2 px-16 bg-gradient-to-r from-transparent via-amber-50 to-transparent">
                      {data.teacher.name}
                    </h1>

                    <p className="text-slate-700 text-lg sm:text-xl md:text-2xl font-medium mb-8 leading-relaxed max-w-3xl">
                      وذلك نظير جهوده المتميزة وتفانيه في العمل، وتقديراً لـ:
                      <br/>
                      <span className="block mt-4 text-amber-800 font-bold bg-amber-100/50 py-3 px-8 rounded-2xl border border-amber-200/50 inline-block shadow-sm">
                        {activeAward.reason}
                      </span>
                    </p>

                    <div className="w-full flex justify-between items-end mt-auto px-8 md:px-16 relative">
                      <div className="text-center w-40 md:w-48">
                        <div className="h-px bg-slate-300 w-full mb-3"></div>
                        <p className="text-slate-500 text-base md:text-lg font-bold mb-1">التاريخ</p>
                        <p className="text-slate-800 font-mono font-medium">{new Date(activeAward.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                      
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none -mt-10">
                        <Award className="w-64 h-64 text-amber-900" />
                      </div>

                      <div className="text-center w-40 md:w-48">
                        <div className="h-px bg-slate-300 w-full mb-3 relative">
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 font-serif text-2xl md:text-3xl text-blue-900/40 -rotate-6 whitespace-nowrap">
                            يعتمد،
                          </div>
                        </div>
                        <p className="text-slate-500 text-base md:text-lg font-bold">مدير المجمع</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-6 mb-10">
              <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-white text-slate-800 rounded-xl font-bold shadow-lg hover:bg-slate-50 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                طباعة / حفظ كـ PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"""
    
    with open('app/teacher/[id]/[token]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(before + new_modal)

