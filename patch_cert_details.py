import re

files = ['app/page.tsx', 'app/teacher/[id]/[token]/page.tsx']

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace Header
    header_pattern = re.compile(
        r'<div className="relative z-10 w-full max-w-4xl flex flex-col items-center h-full">\s*'
        r'<div className="flex items-center justify-center gap-6 mb-4 w-full">\s*'
        r'<div className="h-px bg-amber-200 flex-1"></div>\s*'
        r'<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">\s*'
        r'<Award className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />\s*'
        r'</div>\s*'
        r'<div className="h-px bg-amber-200 flex-1"></div>\s*'
        r'</div>\s*'
        r'<h2 className="text-4xl sm:text-5xl font-black text-amber-900 mb-2 tracking-tight">شهادة شكر وتقدير</h2>\s*'
        r'<h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-6">مجمع الشريعة التعليمي - الإدارة العامة للتعليم بجازان</h3>'
    )
    
    new_header = """<div className="relative z-10 w-full max-w-4xl flex flex-col items-center h-full">
                      {/* Header Row */}
                      <div className="w-full flex justify-between items-start mb-6 px-4">
                        {/* Right Header */}
                        <div className="text-right text-slate-800 font-bold text-sm sm:text-lg leading-relaxed">
                          <p>المملكة العربية السعودية</p>
                          <p>وزارة التعليم</p>
                          <p>إدارة التعليم بجازان</p>
                          <p>مجمع الشريعة التعليمي</p>
                        </div>
                        
                        {/* Center Logo/Icon */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 mt-2">
                          <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
                        </div>
                        
                        {/* Left Logo */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-start justify-end shrink-0">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/ar/thumb/8/87/Ministry_of_Education_%28Saudi_Arabia%29_Logo.svg/1024px-Ministry_of_Education_%28Saudi_Arabia%29_Logo.svg.png" 
                            alt="وزارة التعليم" 
                            className="w-full h-auto object-contain mix-blend-multiply opacity-90"
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>
                      
                      <h2 className="text-4xl sm:text-5xl font-black text-amber-900 mb-6 tracking-tight mt-4">شهادة شكر وتقدير</h2>"""

    content, n = header_pattern.subn(new_header, content)
    print(f"Header replaced {n} times in {path}")

    # Replace Footer
    footer_pattern = re.compile(
        r'<div className="text-center w-40 md:w-48">\s*'
        r'<div className="h-px bg-slate-300 w-full mb-3 relative">\s*'
        r'<div className="absolute -top-10 left-1/2 -translate-x-1/2 font-serif text-2xl md:text-3xl text-blue-900/40 -rotate-6 whitespace-nowrap">\s*'
        r'يعتمد،\s*'
        r'</div>\s*'
        r'</div>\s*'
        r'<p className="text-slate-500 text-base md:text-lg font-bold">مدير المجمع</p>\s*'
        r'</div>'
    )

    new_footer = """<div className="text-center w-40 md:w-56">
                        <div className="h-px bg-slate-300 w-full mb-3 relative">
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 font-serif text-2xl md:text-3xl text-blue-900/40 -rotate-6 whitespace-nowrap">
                            يعتمد،
                          </div>
                        </div>
                        <p className="text-slate-500 text-base md:text-lg font-bold mb-1">مدير المجمع</p>
                        <p className="text-slate-800 font-bold text-lg md:text-xl">أ/ حمود بن علي نهاري</p>
                      </div>"""

    content, n = footer_pattern.subn(new_footer, content)
    print(f"Footer replaced {n} times in {path}")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

