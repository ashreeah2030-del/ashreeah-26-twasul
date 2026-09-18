import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Modals code
modals_code = """
        {/* --- Create Accountability Modal --- */}
        {isCreateAccountabilityOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">إصدار ورقة مساءلة</h3>
                </div>
                <button onClick={() => setIsCreateAccountabilityOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleCreateAccountability} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">الموظف</label>
                  <select 
                    value={newAccTeacherId} 
                    onChange={e => setNewAccTeacherId(e.target.value)} 
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">عنوان المساءلة</label>
                  <input 
                    type="text" 
                    value={newAccTitle}
                    onChange={e => setNewAccTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="مثال: غياب بدون عذر"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">الموضوع</label>
                  <input 
                    type="text" 
                    value={newAccSubject}
                    onChange={e => setNewAccSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="موضوع المساءلة (اختياري)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">التفاصيل</label>
                  <textarea 
                    value={newAccDetails}
                    onChange={e => setNewAccDetails(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="تفاصيل المساءلة..."
                  />
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreateAccountabilityOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
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
"""

content = content.replace("        {/* --- Create Circular Modal --- */}", modals_code + "\n        {/* --- Create Circular Modal --- */}")

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

