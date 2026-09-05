from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

for rel in (
    "assets/asiyan-exterior.svg",
    "assets/asiyan-reel-preview.svg",
    "assets/real-listing-detail.js",
    "assets/hero-villa.svg",
    "assets/property-desert.svg",
    "assets/property-skyline.svg",
    "assets/property-waterfront.svg",
    "assets/property-palm.svg",
):
    if (ROOT / rel).exists():
        errors.append(f"retired listing/template asset returned: {rel}")

placeholder = (ROOT / "assets/property-placeholder.svg").read_text(encoding="utf-8")
if "FIDEON portföy görseli" not in placeholder or "Fotoğraf bulunmadığında" not in placeholder:
    errors.append("truthful architectural missing-photo placeholder is incomplete")

for rel in ("find/index.html", "sell/index.html", "private/index.html"):
    text = (ROOT / rel).read_text(encoding="utf-8")
    if 'name="name"' in text or 'name="phone"' in text:
        errors.append(f"redundant identity fields returned to WhatsApp-first flow: {rel}")

app = (ROOT / "assets/app.js").read_text(encoding="utf-8")
for required in ("property.whatsappMessage", "İlanı Gör", "isPublicProperty", "RETIRED", "FIDEON PORTFÖYÜ", "property-placeholder.svg"):
    if required not in app:
        errors.append(f"public runtime truth missing: {required}")
if "data-save" in app or "fideon.saved" in app:
    errors.append("saved-list detour returned to public runtime")
if "asiyan-konaklari-adnan-kahveci-3-1" not in app:
    errors.append("retired listing migration guard missing")
for required in ('"/assets/signature.css"', '"/assets/signature.js"'):
    if required not in app:
        errors.append(f"public runtime does not load signature asset: {required}")

index = (ROOT / "index.html").read_text(encoding="utf-8")
if "/assets/asiyan-" in index or "Aşiyan" in index:
    errors.append("retired listing returned to homepage")
for required in ("Yeni bir adres.", "/properties/", "WhatsApp", "tel:+905013575635", "/find/", "/sell/"):
    if required not in index:
        errors.append(f"homepage zero-effort path missing: {required}")

properties = (ROOT / "properties/index.html").read_text(encoding="utf-8")
if "Portföy" not in properties or "FIDEON" not in properties:
    errors.append("FIDEON-owned portfolio positioning missing")

signature_css = (ROOT / "assets/signature.css").read_text(encoding="utf-8")
for required in ("--gold-500:#c9a66b", "--forest-950:#061c16", ".signature-hero", ".page-hero", "prefers-reduced-motion"):
    if required not in signature_css:
        errors.append(f"signature brand system missing: {required}")

if "neo" in app.lower() or "immersive" in app.lower() or "delight" in app.lower():
    errors.append("public runtime must not load retired experience assets")

for rel in ("assets/fideon-mark.svg", "assets/fideon-logo.svg", "assets/fideon-wordmark.svg"):
    text = (ROOT / rel).read_text(encoding="utf-8")
    if "#C9A66B" not in text or "fill-rule=\"evenodd\"" not in text:
        errors.append(f"traced FIDEON vector is incomplete: {rel}")

admin_html = (ROOT / "admin/index.html").read_text(encoding="utf-8")
admin_js = (ROOT / "assets/admin.js").read_text(encoding="utf-8")
if 'type="reset">Temizle' in admin_html:
    errors.append("native reset button can leave admin editing target stale")
if "data-clear-property" not in admin_html or "[data-clear-property]" not in admin_js:
    errors.append("explicit admin editor clear action missing")
if 'canvas.toDataURL("image/webp", .72)' not in admin_js or "maxEdge = 1280" not in admin_js:
    errors.append("admin phone-photo compaction missing")
if "/assets/signature.css" in admin_html:
    errors.append("admin must not load the public signature stylesheet")

whatsapp = (ROOT / "assets/whatsapp-forms.js").read_text(encoding="utf-8")
if "Bu mesaj FIDEON web sitesinden hazırlandı" in whatsapp:
    errors.append("robotic WhatsApp footer returned")
if "Array.isArray(stored)" not in whatsapp:
    errors.append("local lead storage guard missing")

data = (ROOT / "assets/data.js").read_text(encoding="utf-8")
if "window.FIDEON.sampleProperties = [];" not in data:
    errors.append("seeded inventory is not empty")
if 'retired = new Set(["asiyan-konaklari-adnan-kahveci-3-1"])' not in data:
    errors.append("retired listing is not purged from existing localhost storage")
if "FIDEON-AK-001" in data or "Aşiyan Konakları'nda" in data:
    errors.append("retired listing content returned to seeded data")

if errors:
    for error in errors:
        print("ERROR:", error)
    sys.exit(1)

print("PASS: simple surface + calm layered precision truth checks")
