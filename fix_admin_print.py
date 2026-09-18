import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">',
    '<div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto" id="certificate-modal-container">'
)

content = content.replace(
    'body > *:not(#certificate-modal-container) { display: none !important; }',
    '''body > *:not(#certificate-modal-container) { display: none !important; }
                    #certificate-modal-container { position: static; background: none; padding: 0; display: block; }
                    #certificate-modal-container > div { max-width: none; margin: 0; }
                    #certificate-modal-container button { display: none !important; }'''
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
