import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add viewingAward state
if "const [viewingAward" not in content:
    content = content.replace(
        "const [awards, setAwards] = useState<any[]>([]);",
        "const [awards, setAwards] = useState<any[]>([]);\n  const [viewingAward, setViewingAward] = useState<any>(null);"
    )

# 2. Update the buttons in the row
old_buttons = """                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleShareAward(award)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="إرسال عبر واتساب"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </td>"""

new_buttons = """                        <td className="px-6 py-4 text-center">
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
                        </td>"""
content = content.replace(old_buttons, new_buttons)

# 3. Add the modal
modal_code = """
        {/* --- View Certificate Modal --- */}
        {viewingAward && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-4xl animate-in zoom-in-95 duration-500">
              {/* Close Button */}
              <button 
                onClick={() => setViewingAward(null)} 
                className="absolute -top-12 sm:-top-4 -right-4 sm:-right-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Certificate Canvas */}
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-2xl overflow-hidden relative" id="certificate-canvas">
                <div className="border-[8px] sm:border-[12px] border-double border-amber-300/80 p-2 sm:p-3 relative bg-amber-50/30">
                  <div className="border border-amber-300 relative bg-white px-6 py-12 sm:px-16 sm:py-20 text-center overflow-hidden">
                    
                    <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100 rounded-br-full opacity-50 blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-100 rounded-tl-full opacity-50 blur-2xl"></div>
                    
                    <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400 opacity-60"></div>
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400 opacity-60"></div>
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400 opacity-60"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400 opacity-60"></div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-300/40 mb-6">
                        <Award className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md" />
                      </div>
                      
                      <h2 className="text-3xl sm:text-5xl font-black text-amber-900 mb-3 tracking-tight">شهادة شكر وتقدير</h2>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-10">مجمع الشريعة التعليمي - الإدارة العامة للتعليم بجازان</h3>

                      <p className="text-slate-600 text-base sm:text-lg mb-6 leading-relaxed max-w-2xl">
                        تتقدم إدارة المجمع بخالص الشكر وعظيم التقدير للمكرم الأستاذ /
                      </p>
                      
                      <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-600 mb-8 border-b-2 border-amber-200 pb-4 inline-block px-12">
                        {viewingAward.teacherName || 'المعلم'}
                      </h1>

                      <p className="text-slate-700 text-lg sm:text-xl font-medium mb-12 max-w-3xl leading-relaxed">
                        وذلك نظير جهوده المتميزة وتفانيه في العمل، وتقديراً لـ:
                        <br/>
                        <span className="block mt-4 text-amber-800 font-bold bg-amber-50 py-3 px-6 rounded-xl border border-amber-100">{viewingAward.reason}</span>
                      </p>

                      <div className="w-full flex justify-between items-end mt-8 pt-8 border-t border-slate-100">
                        <div className="text-center">
                          <p className="text-slate-500 text-sm font-bold mb-2">تاريخ الإصدار</p>
                          <p className="text-slate-800 font-mono font-medium">{new Date(viewingAward.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500 text-sm font-bold mb-4">مدير المجمع</p>
                          <div className="font-serif text-2xl text-blue-900/60 -rotate-3 border-b border-blue-900/20 inline-block px-4">
                            يعتمد،
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
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
"""

content = content.replace("{/* --- Create Award Modal --- */}", modal_code + "\n        {/* --- Create Award Modal --- */}")

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

