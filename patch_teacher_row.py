with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

btn_str = """                          <button 
                            onClick={() => handleShareTeacherPortal(teacher)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="إرسال رابط البوابة عبر واتساب"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeletingTeacher(teacher)}"""

content = content.replace("                          <button \n                            onClick={() => setDeletingTeacher(teacher)}", btn_str)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
