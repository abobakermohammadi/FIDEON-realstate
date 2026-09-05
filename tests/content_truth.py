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
):
    if (ROOT / rel).exists():
        errors.append(f"retired listing/template asset returned: {rel}")

placeholder = (ROOT / "assets/property-palm.svg").read_text(encoding="utf-8")
if "Fotoğraf henüz eklenmedi" not in placeholder:
    errors.append("neutral missing-photo placeholder copy missing")

for rel in ("find/index.html", "sell/index.html", "private/index.html"):
    text = (ROOT / rel).read_text(encoding="utf-8")
    if 'name="name"' in text or 'name="phone"' in text:
        errors.append(f"redundant identity fields returned to WhatsApp-first flow: {rel}")

app = (ROOT / "assets/app.js").read_text(encoding="utf-8")
for required in ("property.whatsappMessage", "İlanı Gör", "isPublicProperty", "RETIRED", "WhatsApp'tan Yaz"):
    if required not in app:
        errors.append(f"public runtime truth missing: {required}")
if "data-save" in app or "fideon.saved" in app:
    errors.append("saved-list detour returned to public runtime")
if "asiyan-konaklari-adnan-kahveci-3-1" not in app:
    errors.append("retired listing migration guard missing")
for required in ('"/assets/delight.css"', '"/assets/immersive.css"', '"/assets/delight.js"', '"/assets/immersive.js"'):
    if required not in app:
        errors.append(f"public runtime does not load experience asset: {required}")

index = (ROOT / "index.html").read_text(encoding="utf-8")
if "/assets/asiyan-" in index or "Aşiyan" in index:
    errors.append("retired listing returned to homepage")
for required in ("Evi bulun.", "WhatsApp'tan Yaz", "tel:+905013575635", "/find/", "/sell/"):
    if required not in index:
        errors.append(f"homepage zero-effort path missing: {required}")

minimal_css = (ROOT / "assets/minimal.css").read_text(encoding="utf-8")
for required in ("--gold-500:#c9a66b", "--forest-950:#061d14", ".reveal{opacity:1!important", ".v2-home .hero", ".page-hero"):
    if required not in minimal_css:
        errors.append(f"minimal brand system missing: {required}")

delight_css = (ROOT / "assets/delight.css").read_text(encoding="utf-8")
for required in (".fx-curtain", ".fx-ripple", ".fx-reveal", ".fx-magnetic", ".action-choice::before", ".flow-panel::before", "prefers-reduced-motion"):
    if required not in delight_css:
        errors.append(f"crafted interaction detail missing: {required}")

delight_js = (ROOT / "assets/delight.js").read_text(encoding="utf-8")
for required in ("prefers-reduced-motion", "IntersectionObserver", "MutationObserver", "navigateWithCurtain", "bindMagnetic", "pulseForms"):
    if required not in delight_js:
        errors.append(f"progressive interaction runtime missing: {required}")

immersive_css = (ROOT / "assets/immersive.css").read_text(encoding="utf-8")
for required in (".fx-depth-scene", ".fx-orbit-stage", ".fx-live-meta", ".fx-form-meter", ".fx-depth-card", "prefers-reduced-motion"):
    if required not in immersive_css:
        errors.append(f"immersive visual layer missing: {required}")

immersive_js = (ROOT / "assets/immersive.js").read_text(encoding="utf-8")
for required in ("installScenes", "Europe/Istanbul", "bindDepthCards", "installFormMeters", "MutationObserver", "prefers-reduced-motion"):
    if required not in immersive_js:
        errors.append(f"immersive runtime missing: {required}")

if "fx-reveal" in index or "opacity:0" in index:
    errors.append("homepage must not depend on JS-created reveal state for readable content")

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
for required in ("/assets/delight.css", "/assets/delight.js", "/assets/immersive.css", "/assets/immersive.js"):
    if required not in admin_html:
        errors.append(f"admin is missing experience asset: {required}")

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

print("PASS: minimal surface + crafted layered experience truth checks")
