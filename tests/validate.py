from pathlib import Path
from html.parser import HTMLParser
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
warnings = []

EXPECTED = [
    "index.html", "properties/index.html", "properties/view/index.html",
    "private/index.html", "sell/index.html", "find/index.html", "referrals/index.html",
    "about/index.html", "journal/index.html", "contact/index.html", "saved/index.html",
    "admin/index.html", "privacy.html", "terms.html", "404.html",
    "assets/styles-base.css", "assets/styles-components-a.css", "assets/styles-components-b.css",
    "assets/styles-admin-responsive.css", "assets/v2.css", "assets/minimal.css", "assets/signature.css",
    "assets/portfolio-polish.css", "assets/real-listing.css", "assets/app.js",
    "assets/admin.js", "assets/data.js", "assets/whatsapp-forms.js", "assets/signature.js",
    "assets/fideon-mark.svg", "assets/fideon-logo.svg", "assets/fideon-wordmark.svg", "assets/property-placeholder.svg",
]
for rel in EXPECTED:
    if not (ROOT / rel).exists():
        errors.append(f"missing required file: {rel}")

RETIRED = [
    "assets/asiyan-exterior.svg", "assets/asiyan-reel-preview.svg", "assets/real-listing-detail.js",
    "assets/hero-villa.svg", "assets/property-desert.svg", "assets/property-skyline.svg", "assets/property-waterfront.svg",
    "assets/property-palm.svg",
]
for rel in RETIRED:
    if (ROOT / rel).exists():
        errors.append(f"retired asset still present: {rel}")

class Collector(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        for key in ("href","src"):
            value=attrs.get(key)
            if value: self.refs.append((key,value))

html_files=[ROOT / rel for rel in EXPECTED if rel.endswith(".html")]
for path in html_files:
    text=path.read_text(encoding="utf-8")
    lower=text.lower()
    if "lorem ipsum" in lower:
        errors.append(f"lorem ipsum found: {path.relative_to(ROOT)}")
    if "wa.me/" in lower or "whatsapp.com/send" in lower:
        errors.append(f"hard-coded WhatsApp deep link found in HTML: {path.relative_to(ROOT)}")
    if path.name != "404.html" and "<main" not in lower and "admin/index.html" not in str(path):
        warnings.append(f"no <main> landmark: {path.relative_to(ROOT)}")
    parser=Collector(); parser.feed(text)
    for key,ref in parser.refs:
        if ref.startswith(("/","./","../")) and not ref.startswith("//"):
            clean=ref.split("#")[0].split("?")[0]
            if not clean or clean=="/": continue
            target=(ROOT/clean.lstrip("/")) if clean.startswith("/") else (path.parent/clean).resolve()
            if clean.endswith("/"): target=target/"index.html"
            elif target.suffix=="" and (target/"index.html").exists(): target=target/"index.html"
            if not target.exists(): errors.append(f"broken local {key}: {path.relative_to(ROOT)} -> {ref}")

robots=(ROOT/"robots.txt").read_text()
if "Disallow: /" not in robots:
    errors.append("preview robots.txt must block indexing")

all_html="\n".join(p.read_text(encoding="utf-8") for p in html_files)
if "/assets/backend.js" in all_html or "/assets/runtime-config.js" in all_html:
    errors.append("localhost-only build must not load cloud runtime scripts")
for marker in ("supabase.co","createClient(","@supabase/"):
    if marker.lower() in all_html.lower(): errors.append(f"localhost-only HTML unexpectedly activates cloud runtime: {marker}")
if "fideon.official@gmail.com" not in all_html: errors.append("verified public email missing from site")
if "+90 501 357 56 35" not in all_html: errors.append("verified public phone missing from site")

for stale in ("Dubai · Global","Global Referrals","Private development preview","sample inventory"):
    if stale.lower() in all_html.lower(): errors.append(f"stale global/template positioning found in HTML: {stale}")

for rel in ("find/index.html","sell/index.html","private/index.html"):
    text=(ROOT/rel).read_text(encoding="utf-8")
    if "data-whatsapp-form" not in text: errors.append(f"direct WhatsApp form handoff missing: {rel}")
    if "/assets/whatsapp-forms.js" not in text: errors.append(f"WhatsApp form runtime missing: {rel}")

contact=(ROOT/"contact/index.html").read_text(encoding="utf-8")
if "data-whatsapp" not in contact: errors.append("direct WhatsApp action missing: contact/index.html")
if "tel:+905013575635" not in contact: errors.append("direct phone action missing: contact/index.html")
if "/properties/" not in contact: errors.append("portfolio path missing from contact navigation")

for rel in ("index.html","properties/index.html"):
    text=(ROOT/rel).read_text(encoding="utf-8")
    if "/assets/app.js" not in text: errors.append(f"public runtime missing: {rel}")
    if "/assets/public-polish.js" in text: errors.append(f"obsolete public patch runtime still loaded: {rel}")

app=(ROOT/"assets/app.js").read_text(encoding="utf-8")
for required in ('"/assets/signature.css"', '"/assets/signature.js"'):
    if required not in app:
        errors.append(f"public pages must receive signature asset through central runtime: {required}")
if "/assets/property-placeholder.svg" not in app:
    errors.append("truthful property placeholder missing from public runtime")
if "/assets/property-palm.svg" in app:
    errors.append("obsolete property placeholder returned to public runtime")

admin=(ROOT/"admin/index.html").read_text(encoding="utf-8")
admin_js=(ROOT/"assets/admin.js").read_text(encoding="utf-8")
if "/assets/app.js" in admin: errors.append("admin must not load public app runtime")
if "/assets/admin.js" not in admin: errors.append("admin runtime missing")
if "/assets/signature.css" in admin: errors.append("admin must not load the public signature stylesheet")
if 'if (Array.isArray(currentProps)) propertyState = currentProps;' not in admin_js:
    errors.append("admin must preserve an explicitly empty current inventory")

data=(ROOT/"assets/data.js").read_text(encoding="utf-8")
if 'whatsapp: "905013575635"' not in data: errors.append("verified WhatsApp number missing from central config")
if "window.FIDEON.sampleProperties = [];" not in data: errors.append("seeded inventory must be empty after listing removal")
if 'retired = new Set(["asiyan-konaklari-adnan-kahveci-3-1"])' not in data:
    errors.append("existing localhost data must purge the retired listing")

index=(ROOT/"index.html").read_text(encoding="utf-8")
if "/assets/asiyan-" in index or "Aşiyan" in index: errors.append("retired listing returned to homepage")
if "WhatsApp" not in index or "tel:+905013575635" not in index: errors.append("homepage must expose immediate WhatsApp and call actions")
if "/properties/" not in index or "Portföy" not in index: errors.append("homepage must expose FIDEON portfolio as a first-class path")

for rel in ("assets/fideon-mark.svg","assets/fideon-logo.svg","assets/fideon-wordmark.svg"):
    text=(ROOT/rel).read_text(encoding="utf-8")
    if "#C9A66B" not in text or "fill-rule=\"evenodd\"" not in text:
        errors.append(f"uploaded FIDEON vector identity incomplete: {rel}")

css=(ROOT/"assets/signature.css").read_text(encoding="utf-8")
if "prefers-reduced-motion" not in css: errors.append("reduced-motion handling missing")
if "#061c16" not in css: errors.append("signature forest theme missing")

print(f"Validated {len(html_files)} HTML files.")
for warning in warnings: print("WARN:", warning)
for error in errors: print("ERROR:", error)
if errors: sys.exit(1)
print("PASS: structural preview checks")
