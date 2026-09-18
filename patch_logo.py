import re

files = ['app/page.tsx', 'app/teacher/[id]/[token]/page.tsx']

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the old logo URL with the new one
    old_logo_html = """                        {/* Left Logo */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-start justify-end shrink-0">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/ar/thumb/8/87/Ministry_of_Education_%28Saudi_Arabia%29_Logo.svg/1024px-Ministry_of_Education_%28Saudi_Arabia%29_Logo.svg.png" 
                            alt="وزارة التعليم" 
                            className="w-full h-auto object-contain mix-blend-multiply opacity-90"
                            crossOrigin="anonymous"
                          />
                        </div>"""

    new_logo_html = """                        {/* Left Logo */}
                        <div className="w-24 h-24 sm:w-40 sm:h-32 flex items-start justify-end shrink-0">
                          <img 
                            src="https://ai-studio-4ef407c5-d276-4220-b22b-6c387915aefa.storage.googleapis.com/uploads/1726478938992_logo.png" 
                            alt="وزارة التعليم" 
                            className="w-full h-auto max-h-full object-contain mix-blend-multiply opacity-95"
                            crossOrigin="anonymous"
                          />
                        </div>"""

    content = content.replace(old_logo_html, new_logo_html)
    
    # Check if we need to use a simpler pattern just in case
    if old_logo_html not in content and 'https://upload.wikimedia.org' in content:
        content = content.replace('https://upload.wikimedia.org/wikipedia/ar/thumb/8/87/Ministry_of_Education_%28Saudi_Arabia%29_Logo.svg/1024px-Ministry_of_Education_%28Saudi_Arabia%29_Logo.svg.png', 'https://ai-studio-4ef407c5-d276-4220-b22b-6c387915aefa.storage.googleapis.com/uploads/1726478938992_logo.png')
        content = content.replace('sm:w-32 sm:h-32', 'sm:w-40 sm:h-32')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
