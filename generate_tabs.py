import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

tabs_code = """
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
                          <button 
                            onClick={() => handleShareAccountability(doc)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="إرسال عبر واتساب"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
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
                          <button 
                            onClick={() => handleShareAward(award)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="إرسال عبر واتساب"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
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
"""

# Inject before modals
content = content.replace("        {/* --- Create Circular Modal --- */}", tabs_code + "\n        {/* --- Create Circular Modal --- */}")

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

