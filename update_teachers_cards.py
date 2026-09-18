import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update lucide imports
old_import = "} from 'lucide-react';"
new_import = """,
  LayoutGrid,
  List,
  Phone,
  GraduationCap,
  Building2,
  CreditCard
} from 'lucide-react';"""
content = content.replace(old_import, new_import, 1)

# 2. Add state variables
state_needle = "const [viewingAward, setViewingAward] = useState<any>(null);"
state_addition = """const [viewingAward, setViewingAward] = useState<any>(null);
  const [teachersViewMode, setTeachersViewMode] = useState<'cards' | 'table'>('cards');
  const [teacherLevelFilter, setTeacherLevelFilter] = useState<string>('all');"""
content = content.replace(state_needle, state_addition, 1)

# 3. Update filteredTeachers
filter_needle = """  // Filter teachers based on search
  const filteredTeachers = (teachers || []).filter(t => 
    t.name.includes(searchTerm) || t.phone.includes(searchTerm)
  );"""

filter_replacement = """  // Filter teachers based on search and level
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
  });"""
content = content.replace(filter_needle, filter_replacement, 1)

# 4. Replace teachers section in activeTab === 'teachers'
teachers_section_pattern = re.compile(
    r"\{activeTab === 'teachers' && \(\s*<div className=\"space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500\">.*?</div>\s*\)\}\s*\{activeTab === 'add_teacher'",
    re.DOTALL
)

new_teachers_section = """{activeTab === 'teachers' && (
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
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 font-bold text-base flex items-center justify-center shadow-inner shrink-0">
                                {initial}
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
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                              {teacher.name[0]}
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
        {activeTab === 'add_teacher'"""

content, count = teachers_section_pattern.subn(new_teachers_section, content)
print(f"Substituted teachers section: {count} times")

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

