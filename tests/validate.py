from pathlib import Path
from html.parser import HTMLParser
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
warnings = []

EXPECTED = [
    "index.html",
    "properties/index.html",
    "properties/view/index.html",
    "private/index.html",
    "sell/index.html",
    "find/index.html",
    "referrals/index.html",
    "about/index.html",
    "journal/index.html",
    "contact/index.html",
    "saved/index.html",
    "admin/index.html",
    "privacy.html",
    "terms.html",
    "404.html",
    "assets/styles-base.css",
    "assets/styles-components-a.css",
    "assets/styles-components-b.css",
    "assets/styles-admin-responsive.css",
    "assets/v2.css",
    "assets/portfolio-polish.css",
    "assets/real-listing.css",
    "assets/app.js",
    "assets/admin.js",
    "assets/data.js",
    "assets/real-listing-detail.js",
    "assets/fideon-mark.svg",
    "assets/asiyan-exterior.svg",
    "assets/asiyan-reel-preview.svg",
]

for rel in EXPECTED:
    if not (ROOT / rel).exists():
        errors.append(f"missing required file: {rel}")

class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        for key in ("href","src"):
            v = attrs.get(key)
            if v:
                self.refs.append((tag,key,v))

html_files = [p for p in ROOT.rglob("*.html") if "dist" not in p.parts]
for path in html_files:
    text = path.read_text(encoding="utf-8")
    lower = text.lower()
    if "lorem ipsum" in lower:
        errors.append(f"lorem ipsum found: {path.relative_to(ROOT)}")
    if "wa.me/" in lower or "whatsapp.com/send" in lower:
        errors.append(f"hard-coded WhatsApp deep link found in HTML: {path.relative_to(ROOT)}")
    if path.name != "404.html" and "<main" not in lower and "admin/index.html" not in str(path):
        warnings.append(f"no <main> landmark: {path.relative_to(ROOT)}")
    parser = Collector()
    parser.feed(text)
    for tag,key,ref in parser.refs:
        if ref.startswith(("/", "./", "../")) and not ref.startswith("//"):
            clean = ref.split("#")[0].split("?")[0]
            if not clean or clean == "/":
                continue
            if clean.startswith("/"):
                target = ROOT / clean.lstrip("/")
            else:
                target = (path.parent / clean).resolve()
            if clean.endswith("/"):
                target = target / "index.html"
            elif target.suffix == "":
                dir_index = target / "index.html"
                if dir_index.exists():
                    target = dir_index
            if not target.exists():
                errors.append(f"broken local {key}: {path.relative_to(ROOT)} -> {ref}")

robots = (ROOT/"robots.txt").read_text()
if "Disallow: /" not in robots:
    errors.append("preview robots.txt must block indexing")

all_html = "\n".join(p.read_text(encoding="utf-8") for p in html_files)
if "/assets/backend.js" in all_html or "/assets/runtime-config.js" in all_html:
    errors.append("localhost-only build must not load cloud provider/runtime scripts")
for cloud_marker in ("supabase.co", "createClient(", "@supabase/"):
    if cloud_marker.lower() in all_html.lower():
        errors.append(f"localhost-only HTML unexpectedly activates cloud runtime: {cloud_marker}")
if "fideon.official@gmail.com" not in all_html:
    errors.append("verified public email missing from site")
if "+90 501 357 56 35" not in all_html:
    errors.append("verified public phone missing from site")

data = (ROOT/"assets/data.js").read_text(encoding="utf-8")
if 'whatsapp: "905013575635"' not in data:
    errors.append("verified WhatsApp number missing from central config")
if "asiyan-konaklari-adnan-kahveci-3-1" not in data:
    errors.append("real Aşiyan Konakları listing missing from inventory")
for obsolete in ("skyline-residence", "waterfront-house", "desert-retreat", "aurora-palm-villa"):
    if obsolete in data:
        errors.append(f"obsolete sample listing still present in active inventory: {obsolete}")

css = "\n".join((ROOT/f"assets/{name}").read_text() for name in ["styles-base.css","styles-components-a.css","styles-components-b.css","styles-admin-responsive.css","v2.css","real-listing.css","portfolio-polish.css"])
if "prefers-reduced-motion" not in css:
    errors.append("reduced-motion handling missing")
if "overflow-x" not in css and "overflow:hidden" not in css:
    warnings.append("review horizontal overflow handling")

print(f"Validated {len(html_files)} HTML files.")
for w in warnings:
    print("WARN:", w)
for e in errors:
    print("ERROR:", e)
if errors:
    sys.exit(1)
print("PASS: structural preview checks")
