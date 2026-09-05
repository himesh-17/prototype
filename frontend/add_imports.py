import os

src_dir = r'c:\Users\himes\Desktop\prototype\frontend\src'

imports = {
    'Dashboard.jsx': 'dashboard.css',
    'CaseList.jsx': 'cases.css',
    'CaseDetail.jsx': 'cases.css',
    'AuditTrail.jsx': 'audit.css',
    'ForensicWorkstation.jsx': 'forensic.css',
    'CourtCaseDocuments.jsx': 'court.css',
    'UserManagement.jsx': 'admin.css',
    'Layout.jsx': 'layout.css',
    'DocumentUploadModal.jsx': 'document.css',
    'JudgmentUploadModal.jsx': 'court.css',
    'ChainOfCustodyModal.jsx': 'forensic.css',
    'DocumentRequestModal.jsx': 'court.css',
    'EvidenceIntakeModal.jsx': 'forensic.css',
    'ForensicReportModal.jsx': 'forensic.css',
    'HashChainModal.jsx': 'audit.css',
}

for root, dirs, files in os.walk(src_dir):
    for filename in files:
        if filename in imports:
            css_file = imports[filename]
            filepath = os.path.join(root, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if f'/{css_file}' not in content:
                # Calculate relative path to src/styles/
                file_depth = len(root.split(os.sep)) - len(src_dir.split(os.sep))
                prefix = '../' * file_depth if file_depth > 0 else './'
                import_stmt = f'import "{prefix}styles/{css_file}";\n'
                
                # Insert after last import, or at beginning
                lines = content.split('\n')
                last_import_idx = -1
                for i, line in enumerate(lines):
                    if line.startswith('import '):
                        last_import_idx = i
                        
                if last_import_idx != -1:
                    lines.insert(last_import_idx + 1, import_stmt.strip())
                else:
                    lines.insert(0, import_stmt.strip())
                    
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(lines))
                print(f'Added import to {filename}')
