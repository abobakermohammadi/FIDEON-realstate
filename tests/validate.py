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
    "assets/minimal.css",
    "assets/portfolio-polish.css",
    "assets/real-listing.css",
    "assets/app.js",
    "assets/admin.js",
    "assets/data.js",
    "assets/real-listing-detail.js",
    "assets/whatsapp-forms.js",
    "assets/public-polish.js",
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

# Product-truth regression gates: no old Dubai/global/template positioning anywhere in HTML.
for stale in ("Dubai · Global", "Global Referrals", "Private development preview", "sample inventory"):
    if stale.lower() in all_html.lower():
        errors.append(f"stale global/template positioning found in HTML: {stale}")

# Active public surfaces stay Turkish/Istanbul-first and use the minimal shell.
public_truth_paths = [
    "index.html", "properties/index.html", "properties/view/index.html",
    "private/index.html", "sell/index.html", "find/index.html",
    "about/index.html", "contact/index.html", "404.html"
]
public_truth = "\n".join((ROOT/p).read_text(encoding="utf-8") for p in public_truth_paths)
if "İstanbul" not in public_truth:
    errors.append("Istanbul positioning missing from active public surfaces")

# Lead forms that remain should hand visitors straight to WhatsApp.
for rel in ("find/index.html", "sell/index.html", "private/index.html"):
    text = (ROOT/rel).read_text(encoding="utf-8")
    if "data-whatsapp-form" not in text:
        errors.append(f"direct WhatsApp form handoff missing: {rel}")
    if "/assets/whatsapp-forms.js" not in text:
        errors.append(f"WhatsApp form runtime missing: {rel}")

# Contact is intentionally form-free in the minimal design but must expose direct actions.
contact = (ROOT/"contact/index.html").read_text(encoding="utf-8")
if "data-whatsapp" not in contact:
    errors.append("direct WhatsApp action missing: contact/index.html")
if "tel:+905013575635" not in contact:
    errors.append("direct phone action missing: contact/index.html")

# Property cards use the final direct-contact polish and do not surface the old saved-list detour.
for rel in ("index.html", "properties/index.html"):
    text = (ROOT/rel).read_text(encoding="utf-8")
    if "/assets/public-polish.js" not in text:
        errors.append(f"public card polish missing: {rel}")
saved = (ROOT/"saved/index.html").read_text(encoding="utf-8")
if "url=/properties/" not in saved:
    errors.append("saved route should return visitors to active listings in minimal mode")

# Admin is intentionally isolated from public app behavior and must preserve an explicit empty local inventory.
admin = (ROOT/"admin/index.html").read_text(encoding="utf-8")
if "/assets/app.js" in admin:
    errors.append("admin must not load public app runtime")
if "fideon.properties.v2" not in admin or "saved.length === 0" not in admin:
    errors.append("admin empty-inventory guard missing")

data = (ROOT/"assets/data.js").read_text(encoding="utf-8")
if 'whatsapp: "905013575635"' not in data:
    errors.append("verified WhatsApp number missing from central config")
if "asiyan-konaklari-adnan-kahveci-3-1" not in data:
    errors.append("real Aşiyan Konakları listing missing from inventory")
for obsolete in ("skyline-residence", "waterfront-house", "desert-retreat", "aurora-palm-villa"):
    if obsolete in data:
        errors.append(f"obsolete sample listing still present in active inventory: {obsolete}")

css = "\n".join((ROOT/f"assets/{name}").read_text() for name in ["styles-base.css","styles-components-a.css","styles-components-b.css","styles-admin-responsive.css","v2.css","minimal.css","real-listing.css","portfolio-polish.css"])
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
