from pathlib import Path
import re, sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
client_files = list((ROOT/'assets').glob('*.js')) + [p for p in ROOT.rglob('*.html') if 'dist' not in p.parts]

for p in client_files:
    text = p.read_text(encoding='utf-8')
    if re.search(r'(?i)(sk_live_|sb_secret_|service_role\s*[:=]\s*["\'][A-Za-z0-9._-]{20,})', text):
        errors.append(f'possible secret embedded in client: {p.relative_to(ROOT)}')

all_html = '\n'.join(p.read_text(encoding='utf-8') for p in client_files if p.suffix == '.html')
for forbidden in ['/assets/backend.js', '/assets/runtime-config.js']:
    if forbidden in all_html:
        errors.append(f'localhost build unexpectedly loads cloud runtime: {forbidden}')

admin = (ROOT/'admin/index.html').read_text(encoding='utf-8').lower()
if 'noindex,nofollow' not in admin:
    errors.append('admin must remain noindex in localhost phase')
if '/admin/' in (ROOT/'robots.txt').read_text(encoding='utf-8'):
    pass

if errors:
    for e in errors:
        print('ERROR:', e)
    sys.exit(1)
print('PASS: localhost static safety checks')
