import re

with open('app/teacher/[id]/[token]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

awards_section = """
        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">شهادات التحفيز وخطابات الشكر</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.awards.map((award: any) => (
                <div key={award.id} className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
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
                  <p className="text-amber-800/80 text-sm leading-relaxed relative z-10">
                    {award.reason}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
"""

# Include Award icon import
content = content.replace("  ShieldCheck", "  ShieldCheck,\n  Award")

# Inject awards section before footer
content = content.replace("        {/* Footer */}", awards_section + "\n        {/* Footer */}")

with open('app/teacher/[id]/[token]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
