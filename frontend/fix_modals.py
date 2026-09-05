import os
import re

TARGET_DIRS = [
    'c:/Users/himes/Desktop/prototype/frontend/src/pages',
    'c:/Users/himes/Desktop/prototype/frontend/src/components/common'
]

for directory in TARGET_DIRS:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if 'Modal' in file and file.endswith('.jsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                original = content
                
                # replace body
                content = re.sub(r'className="p-6 space-y-\d+"', 'className="modal-body"', content)
                content = re.sub(r'className="p-8 space-y-\d+"', 'className="modal-body"', content)
                
                # replace footer
                content = re.sub(r'className="flex items-center justify-end gap-3 pt-\d+( mt-\d+)? border-t border-\[var\(--border-subtle\)\]"', 'className="modal-footer"', content)
                content = re.sub(r'className="flex justify-end gap-3 pt-6 border-t border-\[var\(--border-subtle\)\]"', 'className="modal-footer"', content)
                
                if content != original:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'Updated {path}')
