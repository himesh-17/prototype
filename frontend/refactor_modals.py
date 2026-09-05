import os
import re

src_dir = r'c:\Users\himes\Desktop\prototype\frontend\src'
styles_dir = os.path.join(src_dir, 'styles')

modal_mapping = {
    'DocumentUploadModal.jsx': ('ns-upload', 'document.css'),
    'JudgmentUploadModal.jsx': ('ns-judgment', 'court.css'),
    'ChainOfCustodyModal.jsx': ('ns-custody', 'forensic.css'),
    'DocumentRequestModal.jsx': ('ns-court', 'court.css'),
    'EvidenceIntakeModal.jsx': ('ns-forensic', 'forensic.css'),
    'ForensicReportModal.jsx': ('ns-forensic', 'forensic.css'),
    'HashChainModal.jsx': ('ns-audit', 'audit.css'),
}

# Generic modal CSS template
modal_css_template = '''
.{prefix}-backdrop {{
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 80;
  animation: fadeIn 200ms ease forwards;
}}
.{prefix}-modal {{
  background: var(--bg-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 0;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  animation: modalIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}}
.{prefix}-modal-wide {{
  max-width: 700px;
}}
.{prefix}-header {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-inset);
  position: sticky;
  top: 0;
  z-index: 10;
}}
.{prefix}-title {{
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}}
.{prefix}-eyebrow {{
  font-size: 0.7rem;
  font-family: var(--font-mono);
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 0.2rem;
}}
.{prefix}-close {{
  color: var(--text-tertiary);
  padding: 0.35rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 150ms ease;
}}
.{prefix}-close:hover {{
  color: var(--text-primary);
  background: var(--bg-overlay);
}}
.{prefix}-body {{
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}}
.{prefix}-footer {{
  padding: 1.25rem 2rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}}
'''

appended = set()

for root, dirs, files in os.walk(src_dir):
    for filename in files:
        if filename in modal_mapping:
            filepath = os.path.join(root, filename)
            prefix, css_file = modal_mapping[filename]
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            orig_content = content
            
            content = re.sub(r'(?<=[\"\'\s])modal-backdrop(?=[\"\'\s])', f'{prefix}-backdrop', content)
            content = re.sub(r'(?<=[\"\'\s])modal-header(?=[\"\'\s])', f'{prefix}-header', content)
            content = re.sub(r'(?<=[\"\'\s])modal-title(?=[\"\'\s])', f'{prefix}-title', content)
            content = re.sub(r'(?<=[\"\'\s])modal-eyebrow(?=[\"\'\s])', f'{prefix}-eyebrow', content)
            content = re.sub(r'(?<=[\"\'\s])modal-close(?=[\"\'\s])', f'{prefix}-close', content)
            content = re.sub(r'(?<=[\"\'\s])modal-body(?=[\"\'\s])', f'{prefix}-body', content)
            content = re.sub(r'(?<=[\"\'\s])modal-footer(?=[\"\'\s])', f'{prefix}-footer', content)
            content = re.sub(r'(?<=[\"\'\s])modal-wide(?=[\"\'\s])', f'{prefix}-modal-wide', content)
            content = re.sub(r'(?<=[\"\'\s])modal(?=[\"\'\s])', f'{prefix}-modal', content)
            
            if content != orig_content:
                if f"import" not in content and css_file:
                    pass # user might add imports manually, or we let them be
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated {filename}')
                
                css_path = os.path.join(styles_dir, css_file)
                mode = 'a' if os.path.exists(css_path) else 'w'
                
                if prefix not in appended:
                    with open(css_path, mode, encoding='utf-8') as f:
                        f.write(modal_css_template.format(prefix=prefix))
                    appended.add(prefix)
                    print(f'Added CSS template to {css_file}')
