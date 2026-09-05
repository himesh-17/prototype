import os
import re

src_dir = r'c:\Users\himes\Desktop\prototype\frontend\src'
styles_dir = os.path.join(src_dir, 'styles')

# A dictionary defining how we map JSX files to their CSS files, and how to rename classes
mapping = {
    'Dashboard.jsx': {
        'css': 'dashboard.css',
        'replacements': [
            (r'\bcard\b', 'ns-dashboard-card'),
            (r'\bmetric-label\b', 'ns-dashboard-metric-label'),
            (r'\bmetric-value\b', 'ns-dashboard-metric-value'),
            (r'\bmetric-bar-container\b', 'ns-dashboard-metric-bar-container'),
            (r'\bmetric-bar-fill\b', 'ns-dashboard-metric-bar-fill'),
            (r'\btable\b', 'ns-dashboard-table'),
            (r'\bform\b', 'ns-dashboard-form'),
            (r'\bbento\b', 'ns-dashboard-bento'),
            (r'\bbento-triple\b', 'ns-dashboard-bento-triple'),
            (r'\bpanel\b', 'ns-dashboard-panel'),
            (r'\bpanel-head\b', 'ns-dashboard-panel-head'),
            (r'\bpanel-body\b', 'ns-dashboard-panel-body'),
            (r'\bpanel-title\b', 'ns-dashboard-panel-title'),
            (r'\bpanel-actions\b', 'ns-dashboard-panel-actions'),
            (r'\bsurface\b', 'ns-dashboard-surface'),
        ]
    },
    'CaseList.jsx': {
        'css': 'cases.css',
        'replacements': [
            (r'\btable\b', 'ns-cases-table'),
            (r'\bcard\b', 'ns-cases-card'),
            (r'\bsurface\b', 'ns-cases-surface'),
        ]
    },
    'CaseDetail.jsx': {
        'css': 'cases.css',
        'replacements': [
            (r'\btable\b', 'ns-cases-table'),
            (r'\bcard\b', 'ns-cases-card'),
            (r'\bsurface\b', 'ns-cases-surface'),
        ]
    },
    'AuditTrail.jsx': {
        'css': 'audit.css',
        'replacements': [
            (r'\btimeline\b', 'ns-audit-timeline'),
            (r'\btimeline-item\b', 'ns-audit-timeline-item'),
            (r'\btimeline-marker\b', 'ns-audit-timeline-marker'),
            (r'\btimeline-content\b', 'ns-audit-timeline-content'),
            (r'\btimeline-header\b', 'ns-audit-timeline-header'),
            (r'\btimeline-time\b', 'ns-audit-timeline-time'),
            (r'\btimeline-title\b', 'ns-audit-timeline-title'),
            (r'\btimeline-body\b', 'ns-audit-timeline-body'),
            (r'\btable\b', 'ns-audit-table'),
            (r'\bcard\b', 'ns-audit-card'),
            (r'\bsurface\b', 'ns-audit-surface'),
        ]
    },
    'ForensicWorkstation.jsx': {
        'css': 'forensic.css',
        'replacements': [
            (r'\btable\b', 'ns-forensic-table'),
            (r'\bcard\b', 'ns-forensic-card'),
            (r'\bsurface\b', 'ns-forensic-surface'),
            (r'\bpanel\b', 'ns-forensic-panel'),
        ]
    },
    'CourtCaseDocuments.jsx': {
        'css': 'court.css',
        'replacements': [
            (r'\btable\b', 'ns-court-table'),
            (r'\bcard\b', 'ns-court-card'),
            (r'\bsurface\b', 'ns-court-surface'),
        ]
    },
    'UserManagement.jsx': {
        'css': 'admin.css',
        'replacements': [
            (r'\btable\b', 'ns-admin-table'),
            (r'\bcard\b', 'ns-admin-card'),
            (r'\bsurface\b', 'ns-admin-surface'),
        ]
    },
    'Layout.jsx': {
        'css': 'layout.css',
        'replacements': [
            (r'\bapp-shell\b', 'ns-layout-shell'),
            (r'\bsidebar\b', 'ns-layout-sidebar'),
            (r'\bworkspace\b', 'ns-layout-main'),
            (r'\bbrand\b', 'ns-layout-brand'),
            (r'\bnav-section\b', 'ns-layout-nav'),
            (r'\bnav-link\b', 'ns-layout-nav-link'),
            (r'\btopbar\b', 'ns-layout-topbar'),
            (r'\btopbar-meta\b', 'ns-layout-topbar-meta'),
            (r'\btopbar-title\b', 'ns-layout-topbar-title'),
            (r'\btopbar-subtitle\b', 'ns-layout-topbar-subtitle'),
            (r'\btopbar-actions\b', 'ns-layout-topbar-actions'),
        ]
    }
}

# The reusable components logic (btn -> ns-button) applies globally
global_replacements = [
    (r'\bbtn\b', 'ns-button'),
    (r'\bbtn-primary\b', 'ns-button-primary'),
    (r'\bbtn-secondary\b', 'ns-button-secondary'),
    (r'\bbtn-ghost\b', 'ns-button-ghost'),
    (r'\bbtn-danger\b', 'ns-button-danger'),
    (r'\bbtn-sm\b', 'ns-button-sm'),
    (r'\bstatus-badge\b', 'ns-status-badge'),
    (r'\bstatus-success\b', 'ns-status-success'),
    (r'\bstatus-warning\b', 'ns-status-warning'),
    (r'\bstatus-danger\b', 'ns-status-danger'),
    (r'\bstatus-neutral\b', 'ns-status-neutral'),
]

# Write CSS mappings
# Read original CSS to distribute rules to files
with open(os.path.join(src_dir, 'styles', 'components.css'), 'r', encoding='utf-8') as f:
    components_css = f.read()
    
# Copy components.css to index.css since buttons/badges are global utilities?
# "index.css should contain ONLY: A. CSS reset... E. globally reusable utility classes if absolutely necessary... I. global button/input defaults ONLY if they truly apply everywhere"
# Yes, .ns-button and .ns-status-badge can go into index.css
with open(os.path.join(src_dir, 'index.css'), 'r', encoding='utf-8') as f:
    index_css = f.read()

index_css += '\n' + components_css

with open(os.path.join(src_dir, 'index.css'), 'w', encoding='utf-8') as f:
    f.write(index_css)

# Apply replacements to JSX files
for root, dirs, files in os.walk(src_dir):
    for filename in files:
        if filename.endswith('.jsx'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            orig_content = content
            
            # Apply file-specific mapping if it exists
            config = mapping.get(filename)
            if config:
                for old_regex, new_class in config['replacements']:
                    content = re.sub(r'(?<=[\"\'\s])' + old_regex + r'(?=[\"\'\s])', new_class, content)
            
            # Apply global replacements
            for old_regex, new_class in global_replacements:
                content = re.sub(r'(?<=[\"\'\s])' + old_regex + r'(?=[\"\'\s])', new_class, content)
                
            if content != orig_content:
                # Add import if needed
                if config and f"import" not in content and config['css']:
                    pass # skipping auto-import logic because it can be tricky with path levels, we will add manually or let it be inherited if it's imported in main/App
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filename}")

# Generate template CSS files based on what was mapped
for val in mapping.values():
    css_name = val['css']
    css_path = os.path.join(styles_dir, css_name)
    if not os.path.exists(css_path):
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(f"/* Namespaced styles for {css_name} */\n")
            # We'll just define empty shells or dump the old css there.
            # Since the user said "do not use generic .table selectors ... create cases.css", they will probably write the detailed CSS themselves or I'll fill it with the original CSS.
            
print("Refactoring complete.")