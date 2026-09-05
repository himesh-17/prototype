import os

src_dir = r'c:\Users\himes\Desktop\prototype\frontend\src'

for root, dirs, files in os.walk(src_dir):
    for filename in files:
        if filename.endswith('.jsx'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            new_lines = []
            extracted_imports = []
            for line in lines:
                if 'import "../styles/' in line or 'import "../../styles/' in line or 'import "./styles/' in line:
                    extracted_imports.append(line)
                else:
                    new_lines.append(line)
                    
            if extracted_imports:
                new_lines = extracted_imports + new_lines
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
                print(f'Fixed imports in {filename}')
