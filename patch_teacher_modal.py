import re

with open('app/teacher/[id]/[token]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_modal_header = '<h3 className="font-bold text-xl">الرد على المساءلة</h3>'
new_modal_header = '<h3 className="font-bold text-xl">الاطلاع والرد على المساءلة</h3>'

old_disclaimer = '<p className="mt-2 text-center text-[10px] text-slate-400">بالتوقيع هنا، أنت تقر بصحة البيانات الواردة في إفادتك.</p>'
new_disclaimer = '<p className="mt-3 text-center text-xs font-bold text-slate-500">بالتوقيع هنا، أنت تقر باستلامك لهذه المساءلة واطلاعك عليها، وبصحة البيانات الواردة في إفادتك.</p>'

old_submit = 'إرسال الرد النهائي'
new_submit = 'توقيع الاستلام وإرسال الرد'

content = content.replace(old_modal_header, new_modal_header)
content = content.replace(old_disclaimer, new_disclaimer)
content = content.replace(old_submit, new_submit)

with open('app/teacher/[id]/[token]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
