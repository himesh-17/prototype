import os
import re

src_dir = r'c:\Users\himes\Desktop\prototype\frontend\src'

mappings = {
    # Layout
    'app-shell': 'ns-layout-shell',
    'sidebar': 'ns-layout-sidebar',
    'workspace': 'ns-layout-main',
    'topbar': 'ns-layout-topbar',
    'brand': 'ns-layout-brand',
    'brand-mark': 'ns-layout-brand-mark',
    'brand-text': 'ns-layout-brand-text',
    'brand-title': 'ns-layout-brand-title',
    'brand-subtitle': 'ns-layout-brand-subtitle',
    'nav-section': 'ns-layout-nav-section',
    'nav-label': 'ns-layout-nav-label',
    'nav-link': 'ns-layout-nav-link',
    'sidebar-footer': 'ns-layout-sidebar-footer',
    'user-chip': 'ns-layout-user-chip',
    'avatar': 'ns-layout-avatar',
    'user-meta': 'ns-layout-user-meta',
    'user-name': 'ns-layout-user-name',
    'user-role': 'ns-layout-user-role',
    'topbar-meta': 'ns-layout-topbar-meta',
    'topbar-title': 'ns-layout-topbar-title',
    'topbar-subtitle': 'ns-layout-topbar-subtitle',
    'topbar-actions': 'ns-layout-topbar-actions',
    'page': 'ns-layout-page',
    'page-header': 'ns-layout-page-header',
    'page-heading': 'ns-layout-page-heading',
    'page-eyebrow': 'ns-layout-page-eyebrow',
    'page-title': 'ns-layout-page-title',
    'page-description': 'ns-layout-page-description',
    'page-actions': 'ns-layout-page-actions',

    # Dashboard
    'bento': 'ns-dashboard-bento',
    'bento-triple': 'ns-dashboard-bento-triple',
    'metric': 'ns-dashboard-metric',
    'metric-label': 'ns-dashboard-metric-label',
    'metric-value': 'ns-dashboard-metric-value',
    'metric-hint': 'ns-dashboard-metric-hint',
    'stat-card': 'ns-dashboard-stat-card',
    'metric-bar': 'ns-dashboard-metric-bar',
    'metric-bar-fill': 'ns-dashboard-metric-bar-fill',
    'metric-bar-value': 'ns-dashboard-metric-bar-value',
    'action-tile': 'ns-dashboard-action-tile',
    'feed-item': 'ns-dashboard-feed-item',
    'surface': 'ns-dashboard-surface',
    'surface-elevated': 'ns-dashboard-surface-elevated',
    'surface-padded': 'ns-dashboard-surface-padded',
    'panel': 'ns-dashboard-panel',
    'panel-head': 'ns-dashboard-panel-head',
    'panel-title': 'ns-dashboard-panel-title',
    'panel-link': 'ns-dashboard-panel-link',
    'panel-body': 'ns-dashboard-panel-body',
    'toolbar': 'ns-dashboard-toolbar',
    'callout': 'ns-dashboard-callout',
    'callout-accent': 'ns-dashboard-callout-accent',
    'callout-warn': 'ns-dashboard-callout-warn',
    'callout-danger': 'ns-dashboard-callout-danger',

    # Components
    'btn': 'ns-button',
    'btn-primary': 'ns-button-primary',
    'btn-secondary': 'ns-button-secondary',
    'btn-ghost': 'ns-button-ghost',
    'btn-danger': 'ns-button-danger',
    'btn-sm': 'ns-button-sm',
    'badge': 'ns-badge',
    'badge-accent': 'ns-badge-accent',
    'badge-warn': 'ns-badge-warn',
    'badge-danger': 'ns-badge-danger',
    'badge-info': 'ns-badge-info',
    'status-dot': 'ns-status-dot',
    'dot-active': 'ns-status-dot-active',
    'dot-warn': 'ns-status-dot-warn',
    'dot-danger': 'ns-status-dot-danger',
    'dot-muted': 'ns-status-dot-muted',
    'skeleton': 'ns-skeleton',
    'skeleton-line': 'ns-skeleton-line',
    'skeleton-block': 'ns-skeleton-block',
    'field-grid': 'ns-form-field-grid',
    'form-actions': 'ns-form-actions',
}

# Modals
modal_mappings = {
    'DocumentUploadModal.jsx': 'ns-upload',
    'JudgmentUploadModal.jsx': 'ns-judgment',
    'ChainOfCustodyModal.jsx': 'ns-custody',
    'DocumentRequestModal.jsx': 'ns-court',
    'EvidenceIntakeModal.jsx': 'ns-forensic',
    'ForensicReportModal.jsx': 'ns-forensic',
    'HashChainModal.jsx': 'ns-audit',
    'UserManagement.jsx': 'ns-admin', # UserManagement has Add User modal
}

# Table 
table_mappings = {
    'CaseList.jsx': 'ns-cases-table',
    'Dashboard.jsx': 'ns-dashboard-table', # Wait, dashboard has table too? Or use ns-cases-table?
    'AuditTrail.jsx': 'ns-audit-table',
    'CourtCaseDocuments.jsx': 'ns-court-table',
    'ForensicWorkstation.jsx': 'ns-forensic-table',
    'UserManagement.jsx': 'ns-admin-table',
}

# Dashboard table should probably just be ns-cases-table if it shows cases, but let's use ns-dashboard-table.
# I will create a regex that strictly matches the class name surrounded by quotes or spaces.
def replace_classes(content, mapping):
    for old, new in sorted(mapping.items(), key=lambda x: -len(x[0])): # Replace longest first!
        pattern = r'(?<=[\"\'\s])' + re.escape(old) + r'(?=[\"\'\s])'
        content = re.sub(pattern, new, content)
    return content

def get_modal_mapping(prefix):
    return {
        'modal-backdrop': f'{prefix}-backdrop',
        'modal': f'{prefix}-modal',
        'modal-wide': f'{prefix}-modal-wide',
        'modal-header': f'{prefix}-header',
        'modal-title': f'{prefix}-title',
        'modal-eyebrow': f'{prefix}-eyebrow',
        'modal-close': f'{prefix}-close',
        'modal-body': f'{prefix}-body',
        'modal-footer': f'{prefix}-footer',
    }

for root, dirs, files in os.walk(src_dir):
    for filename in files:
        if filename.endswith('.jsx'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            orig_content = content
            
            # Global replacements
            content = replace_classes(content, mappings)
            
            # Table replacements
            if filename in table_mappings:
                content = replace_classes(content, {'table': table_mappings[filename]})
            elif 'table' in content: # fallback
                content = replace_classes(content, {'table': 'ns-data-table'})
                
            # Modal replacements
            if filename in modal_mappings:
                content = replace_classes(content, get_modal_mapping(modal_mappings[filename]))
                
            if content != orig_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated {filename}')
                
print("JSX classes updated.")
