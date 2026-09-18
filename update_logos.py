with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block_page = """                        {/* Left Logo */}
                        <div className="w-24 h-24 sm:w-40 sm:h-32 flex items-start justify-end shrink-0">
                          <img 
                            src="https://ai-studio-4ef407c5-d276-4220-b22b-6c387915aefa.storage.googleapis.com/uploads/1726478938992_logo.png" 
                            alt="وزارة التعليم" 
                            className="w-full h-auto max-h-full object-contain mix-blend-multiply opacity-95"
                            crossOrigin="anonymous"
                          />
                        </div>"""

new_block = """                        {/* Left Logo */}
                        <div className="w-28 sm:w-48 flex items-center justify-end shrink-0">
                          <Image 
                            src="/logo-hd.png" 
                            alt="وزارة التعليم" 
                            width={220}
                            height={110}
                            className="w-auto h-20 sm:h-24 object-contain"
                            priority
                            unoptimized
                          />
                        </div>"""

if old_block_page in content:
    content = content.replace(old_block_page, new_block)
    with open('app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated app/page.tsx")
else:
    print("Failed to find old_block in app/page.tsx")

with open('app/teacher/[id]/[token]/page.tsx', 'r', encoding='utf-8') as f:
    teacher_content = f.read()

if old_block_page in teacher_content:
    teacher_content = teacher_content.replace(old_block_page, new_block)
    with open('app/teacher/[id]/[token]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(teacher_content)
    print("Updated app/teacher/[id]/[token]/page.tsx")
else:
    print("Failed to find old_block in app/teacher/[id]/[token]/page.tsx")

