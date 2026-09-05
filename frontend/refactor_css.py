import os
import re

src_dir = r'c:\Users\himes\Desktop\prototype\frontend\src'
styles_dir = os.path.join(src_dir, 'styles')

def parse_css(css_content):
    """
    Parses CSS into a list of tuples: (is_media_query, media_query_text, selector_text, block_text)
    This is a basic parser assuming standard formatting.
    """
    rules = []
    
    # We will use a character-by-character parser to handle nested braces (like @media)
    buffer = ""
    in_media = False
    media_text = ""
    brace_depth = 0
    selector = ""
    
    i = 0
    while i < len(css_content):
        c = css_content[i]
        buffer += c
        
        if c == '{':
            brace_depth += 1
            if brace_depth == 1:
                selector = buffer[:-1].strip()
                if selector.startswith('@media'):
                    in_media = True
                    media_text = selector
                    buffer = ""
                    selector = ""
                else:
                    buffer = "{"
            elif brace_depth == 2 and in_media:
                selector = buffer[:-1].strip()
                buffer = "{"
        elif c == '}':
            brace_depth -= 1
            if brace_depth == 1 and in_media:
                rules.append((True, media_text, selector, buffer))
                buffer = ""
                selector = ""
            elif brace_depth == 0:
                if in_media:
                    in_media = False
                    media_text = ""
                    buffer = ""
                else:
                    rules.append((False, "", selector, buffer))
                    buffer = ""
                    selector = ""
        i += 1
        
    return rules

with open(os.path.join(src_dir, 'index.css'), 'r', encoding='utf-8') as f:
    css = f.read()
    
# Clean out @import, :root, basic tags which don't have classes (except maybe body)
# We will do this by identifying rules.

rules = parse_css(css)

# Define mapping: prefix/exact -> (target_file, new_prefix)
mappings = {
    'layout': {
        'classes': ['.app-shell', '.sidebar', '.workspace', '.brand', '.nav-', '.user-', '.avatar', '.topbar', '.page'],
        'prefix': '.ns-layout',
        'file': 'layout.css'
    },
    'components': {
        'classes': ['.btn', '.badge', '.status-', '.dot-', '.skeleton', '.form-', '.field-'],
        'prefix': '.ns', # custom handling later
        'file': 'components.css'
    },
    'dashboard': {
        'classes': ['.bento', '.metric', '.stat-card', '.action-tile', '.feed-item', '.surface', '.panel', '.toolbar', '.callout'],
        'prefix': '.ns-dashboard',
        'file': 'dashboard.css'
    },
    'tables': {
        'classes': ['.table'],
        'prefix': '.ns-data-table',
        'file': 'components.css' # we will copy this later to specific files
    },
    'modal': {
        'classes': ['.modal'],
        'prefix': '.ns-modal',
        'file': 'none'
    }
}

# The modal template
modal_template_rules = []

extracted = {k: [] for k in mappings}
leftover_rules = []

for is_mq, mq_text, sel, block in rules:
    matched = False
    
    if sel.startswith('@import') or sel.startswith(':root') or sel == '*' or sel.startswith('html') or sel.startswith('::'):
        leftover_rules.append((is_mq, mq_text, sel, block))
        continue
    
    if not sel.startswith('.'):
        leftover_rules.append((is_mq, mq_text, sel, block))
        continue

    # Determine which category it belongs to
    for cat, data in mappings.items():
        for cls in data['classes']:
            if sel.startswith(cls) or (' ' + cls) in sel or (':' + cls) in sel or (',' + cls) in sel:
                extracted[cat].append((is_mq, mq_text, sel, block))
                matched = True
                break
        if matched:
            break
            
    if not matched:
        leftover_rules.append((is_mq, mq_text, sel, block))

# Keep modal rules for generating templates later
modal_rules = extracted['modal']

# Now build the CSS files
files_content = {
    'layout.css': [],
    'dashboard.css': [],
    'components.css': []
}

def format_rule(is_mq, mq_text, sel, block):
    res = f"{sel} {block}\n"
    if is_mq:
        return f"{mq_text} {{\n  {res}}}\n"
    return res + "\n"

def rename_class(sel, block, old_c, new_c):
    # simple replace
    return sel.replace(old_c, new_c), block

# We will manually handle renaming during the stringification
for cat, rule_list in extracted.items():
    if cat == 'modal': continue
    if cat == 'tables': continue
    
    cat_data = mappings[cat]
    
    for is_mq, mq_text, sel, block in rule_list:
        new_sel = sel
        # layout
        if cat == 'layout':
            new_sel = new_sel.replace('.app-shell', '.ns-layout-shell')
            new_sel = new_sel.replace('.sidebar', '.ns-layout-sidebar')
            new_sel = new_sel.replace('.workspace', '.ns-layout-main')
            new_sel = new_sel.replace('.brand', '.ns-layout-brand')
            new_sel = new_sel.replace('.nav-section', '.ns-layout-nav-section')
            new_sel = new_sel.replace('.nav-label', '.ns-layout-nav-label')
            new_sel = new_sel.replace('.nav-link', '.ns-layout-nav-link')
            new_sel = new_sel.replace('.user-chip', '.ns-layout-user-chip')
            new_sel = new_sel.replace('.user-meta', '.ns-layout-user-meta')
            new_sel = new_sel.replace('.user-name', '.ns-layout-user-name')
            new_sel = new_sel.replace('.user-role', '.ns-layout-user-role')
            new_sel = new_sel.replace('.avatar', '.ns-layout-avatar')
            new_sel = new_sel.replace('.topbar', '.ns-layout-topbar')
            new_sel = new_sel.replace('.page', '.ns-layout-page')
            
        elif cat == 'dashboard':
            new_sel = new_sel.replace('.bento', '.ns-dashboard-bento')
            new_sel = new_sel.replace('.metric', '.ns-dashboard-metric')
            new_sel = new_sel.replace('.stat-card', '.ns-dashboard-stat-card')
            new_sel = new_sel.replace('.action-tile', '.ns-dashboard-action-tile')
            new_sel = new_sel.replace('.feed-item', '.ns-dashboard-feed-item')
            new_sel = new_sel.replace('.surface', '.ns-dashboard-surface')
            new_sel = new_sel.replace('.panel', '.ns-dashboard-panel')
            new_sel = new_sel.replace('.toolbar', '.ns-dashboard-toolbar')
            new_sel = new_sel.replace('.callout', '.ns-dashboard-callout')
            
        elif cat == 'components':
            new_sel = new_sel.replace('.btn', '.ns-button')
            new_sel = new_sel.replace('.badge', '.ns-badge')
            new_sel = new_sel.replace('.status-dot', '.ns-status-dot')
            new_sel = new_sel.replace('.dot-', '.ns-status-dot-')
            new_sel = new_sel.replace('.skeleton', '.ns-skeleton')
            new_sel = new_sel.replace('.form-', '.ns-form-')
            new_sel = new_sel.replace('.field-grid', '.ns-form-field-grid')

        files_content[cat_data['file']].append(format_rule(is_mq, mq_text, new_sel, block))

# Table is special. We want to duplicate it for cases, audit, court, forensic, admin
table_targets = {
    'cases.css': '.ns-cases-table',
    'audit.css': '.ns-audit-table',
    'court.css': '.ns-court-table',
    'forensic.css': '.ns-forensic-table',
    'admin.css': '.ns-admin-table',
}

for t_file, t_prefix in table_targets.items():
    if t_file not in files_content:
        files_content[t_file] = []
    for is_mq, mq_text, sel, block in extracted['tables']:
        new_sel = sel.replace('.table', t_prefix)
        files_content[t_file].append(format_rule(is_mq, mq_text, new_sel, block))

# Modal is special. We want to duplicate it for upload, judgment, custody, court, forensic, audit
modal_targets = {
    'document.css': '.ns-upload',
    'court.css': '.ns-judgment', # wait, also .ns-court for DocumentRequestModal
    'forensic.css': '.ns-custody',
    'audit.css': '.ns-audit',
    'admin.css': '.ns-admin-modal'
}

# we'll add the modal rules to these files
for t_file, t_prefix in modal_targets.items():
    if t_file not in files_content:
        files_content[t_file] = []
    for is_mq, mq_text, sel, block in extracted['modal']:
        new_sel = sel.replace('.modal-backdrop', f'{t_prefix}-backdrop')
        new_sel = new_sel.replace('.modal-wide', f'{t_prefix}-modal-wide')
        new_sel = new_sel.replace('.modal-header', f'{t_prefix}-header')
        new_sel = new_sel.replace('.modal-title', f'{t_prefix}-title')
        new_sel = new_sel.replace('.modal-eyebrow', f'{t_prefix}-eyebrow')
        new_sel = new_sel.replace('.modal-close', f'{t_prefix}-close')
        new_sel = new_sel.replace('.modal-body', f'{t_prefix}-body')
        new_sel = new_sel.replace('.modal-footer', f'{t_prefix}-footer')
        new_sel = new_sel.replace('.modal', f'{t_prefix}-modal')
        files_content[t_file].append(format_rule(is_mq, mq_text, new_sel, block))
        
# specifically add .ns-court and .ns-forensic modals since court/forensic have 2 modals each
extra_modals = {
    'court.css': '.ns-court',
    'forensic.css': '.ns-forensic'
}
for t_file, t_prefix in extra_modals.items():
    for is_mq, mq_text, sel, block in extracted['modal']:
        new_sel = sel.replace('.modal-backdrop', f'{t_prefix}-backdrop')
        new_sel = new_sel.replace('.modal-wide', f'{t_prefix}-modal-wide')
        new_sel = new_sel.replace('.modal-header', f'{t_prefix}-header')
        new_sel = new_sel.replace('.modal-title', f'{t_prefix}-title')
        new_sel = new_sel.replace('.modal-eyebrow', f'{t_prefix}-eyebrow')
        new_sel = new_sel.replace('.modal-close', f'{t_prefix}-close')
        new_sel = new_sel.replace('.modal-body', f'{t_prefix}-body')
        new_sel = new_sel.replace('.modal-footer', f'{t_prefix}-footer')
        new_sel = new_sel.replace('.modal', f'{t_prefix}-modal')
        files_content[t_file].append(format_rule(is_mq, mq_text, new_sel, block))


# Write to files
for f_name, content_list in files_content.items():
    with open(os.path.join(styles_dir, f_name), 'w', encoding='utf-8') as f:
        f.write("".join(content_list))

# Write leftover to index.css
with open(os.path.join(src_dir, 'index.css'), 'w', encoding='utf-8') as f:
    # First we'll preserve @import, :root, etc, but we lost anything outside rules.
    # Actually, we can just dump the leftover_rules.
    # Let's get the top level text from original css that didn't match anything.
    pass

# We should better rewrite leftover_rules to index.css
with open(os.path.join(src_dir, 'index.css'), 'w', encoding='utf-8') as f:
    f.write('@import url("https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap");\n')
    f.write('@import "tailwindcss";\n\n')
    for is_mq, mq_text, sel, block in leftover_rules:
        if sel.startswith('@import'): continue
        f.write(format_rule(is_mq, mq_text, sel, block))

print("CSS Extracted successfully!")
