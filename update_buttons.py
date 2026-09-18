import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_btn = """                          <button 
                            onClick={() => handleShareAccountability(doc)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="إرسال عبر واتساب"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>"""

new_btn = """                          <button 
                            onClick={() => handleShareAccountability(doc)}
                            className="flex items-center gap-2 mx-auto px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-lg transition-all text-xs font-bold"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            إرسال واتساب
                          </button>"""

content = content.replace(old_btn, new_btn)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
