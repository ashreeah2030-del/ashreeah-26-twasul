import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_msg = """    const msg = `*مجمع الشريعة التعليمي - إشعار مساءلة*

المكرم أ. ${t.name}

نأمل منكم الدخول للبوابة للاطلاع على ورقة المساءلة بعنوان: "${doc.title}" والرد عليها عبر الرابط التالي:

${url}`;"""

new_msg = """    const msg = `*مجمع الشريعة التعليمي - إشعار مساءلة*

المكرم أ. ${t.name}

نأمل منكم الدخول للبوابة للاطلاع على ورقة المساءلة بعنوان: "${doc.title}"، وتوقيع الاستلام والرد عليها عبر الرابط التالي:

${url}`;"""

content = content.replace(old_msg, new_msg)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
