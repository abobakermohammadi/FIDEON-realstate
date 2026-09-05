from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

retired_art = [
    "assets/hero-villa.svg",
    "assets/property-desert.svg",
    "assets/property-skyline.svg",
    "assets/property-waterfront.svg",
]
for rel in retired_art:
    if (ROOT / rel).exists():
        errors.append(f"retired synthetic art returned: {rel}")

placeholder = (ROOT / "assets/property-palm.svg").read_text(encoding="utf-8")
if "Fotoğraf henüz eklenmedi" not in placeholder:
    errors.append("neutral missing-photo placeholder copy missing")
if "Palm villa" in placeholder or "luxury property illustration" in placeholder:
    errors.append("synthetic villa fallback returned")

for rel in ("find/index.html", "sell/index.html", "private/index.html"):
    text = (ROOT / rel).read_text(encoding="utf-8")
    if 'name="name"' in text or 'name="phone"' in text:
        errors.append(f"redundant identity fields returned to WhatsApp-first flow: {rel}")

app = (ROOT / "assets/app.js").read_text(encoding="utf-8")
if "property.whatsappMessage" not in app:
    errors.append("property-specific WhatsApp message is not used by public runtime")
if "İlanı Gör" not in app:
    errors.append("direct property detail CTA missing from public runtime")
if "data-save" in app or "fideon.saved" in app:
    errors.append("saved-list detour returned to minimal public runtime")
if "sample-note" in app:
    errors.append("sample-listing UI returned to public runtime")
if "isPublicProperty" not in app:
    errors.append("public visibility guard missing from app runtime")

for rel in ("index.html", "properties/index.html"):
    text = (ROOT / rel).read_text(encoding="utf-8")
    if "/assets/public-polish.js" in text:
        errors.append(f"obsolete public polish shim still loaded: {rel}")

minimal_css = (ROOT / "assets/minimal.css").read_text(encoding="utf-8")
if ".page-hero{padding-block:" not in minimal_css or "color:var(--ink-950)" not in minimal_css:
    errors.append("interior page hero contrast regression returned")
if ".home-property-grid .property-card:only-child .property-image{min-width:0;width:100%;aspect-ratio:auto}" not in minimal_css:
    errors.append("single-listing desktop card can clip its content again")

reel_preview = (ROOT / "assets/asiyan-reel-preview.svg").read_text(encoding="utf-8")
if "Aşiyan Konakları salon görüntüsü" not in reel_preview:
    errors.append("real interior preview is missing")
if "animation:fade" in reel_preview:
    errors.append("obsolete corrupted animated reel preview returned")

admin_html = (ROOT / "admin/index.html").read_text(encoding="utf-8")
admin_js = (ROOT / "assets/admin.js").read_text(encoding="utf-8")
if 'type="reset">Temizle' in admin_html:
    errors.append("native reset button can leave the admin editing target stale")
if "data-clear-property" not in admin_html or "[data-clear-property]" not in admin_js:
    errors.append("explicit admin editor clear action missing")
if "addEventListener(\"reset\"" in admin_js:
    errors.append("admin editor should not depend on recursive reset-event handling")
if 'canvas.toDataURL("image/webp", .72)' not in admin_js or "maxEdge = 1280" not in admin_js:
    errors.append("admin photo compaction missing; phone photos can overflow localhost storage")
if "isPublishedProperty" not in admin_js:
    errors.append("admin published metric can drift from public visibility rules")

whatsapp = (ROOT / "assets/whatsapp-forms.js").read_text(encoding="utf-8")
if "Bu mesaj FIDEON web sitesinden hazırlandı" in whatsapp:
    errors.append("robotic WhatsApp footer returned")
if "Array.isArray(stored)" not in whatsapp or "Local preview storage must never stand between a visitor and FIDEON" not in whatsapp:
    errors.append("local lead storage can block or corrupt WhatsApp-first contact")

real_detail = (ROOT / "assets/real-listing-detail.js").read_text(encoding="utf-8")
if "F.store?.getProperties?.()" not in real_detail:
    errors.append("real Aşiyan detail is not synced with current browser-local inventory")
if "F.store?.isPublicProperty" not in real_detail:
    errors.append("real Aşiyan detail bypasses public visibility guard")
if "İç mekandan" not in real_detail or "Salon görüntüsü" not in real_detail:
    errors.append("listing interior media copy drifted from the real static preview")

readme = (ROOT / "README.md").read_text(encoding="utf-8")
for stale in ("four clearly labeled sample", "global referral flow", "sample inventory is labeled"):
    if stale.lower() in readme.lower():
        errors.append(f"stale project truth returned to README: {stale}")

if errors:
    for error in errors:
        print("ERROR:", error)
    sys.exit(1)

print("PASS: minimal content truth checks")