import re
from pathlib import Path

BASE = Path(__file__).resolve().parents[2]
BACKEND = BASE / 'backend'
FRONTEND_PUBLIC = BASE / 'frontend' / 'public'

text = (BACKEND / 'blog' / 'image_assets.py').read_text(encoding='utf-8')
urls = re.findall(r'"(/images/course1/[^"]+)"', text)

missing = []
for u in urls:
    p = FRONTEND_PUBLIC / u.lstrip('/')
    if not p.exists():
        missing.append(str(p))

print('Checked', len(urls), 'course1 urls')
if missing:
    print('Missing files:')
    for m in missing:
        print(' -', m)
else:
    print('All course1 image files present')
