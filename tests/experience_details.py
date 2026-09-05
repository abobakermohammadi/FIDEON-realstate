from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

viewer_js = (ROOT / "assets/portfolio-viewer.js").read_text(encoding="utf-8")
viewer_css = (ROOT / "assets/portfolio-viewer.css").read_text(encoding="utf-8")
detail_html = (ROOT / "properties/view/index.html").read_text(encoding="utf-8")
index_html = (ROOT / "index.html").read_text(encoding="utf-8")
admin_html = (ROOT / "admin/index.html").read_text(encoding="utf-8")
admin_hygiene = (ROOT / "assets/admin-hygiene.js").read_text(encoding="utf-8")
signature_css = (ROOT / "assets/signature.css").read_text(encoding="utf-8")
signature_js = (ROOT / "assets/signature.js").read_text(encoding="utf-8")
whatsapp = (ROOT / "assets/whatsapp-forms.js").read_text(encoding="utf-8")
manifest = (ROOT / "manifest.webmanifest").read_text(encoding="utf-8")
privacy = (ROOT / "privacy.html").read_text(encoding="utf-8")
terms = (ROOT / "terms.html").read_text(encoding="utf-8")
not_found = (ROOT / "404.html").read_text(encoding="utf-8")

for required in (
    "aria-modal",
    "ArrowLeft",
    "ArrowRight",
    "pointerStartX",
    "prefers-reduced-motion",
    "property-placeholder.svg",
    "Fotoğrafları tam ekran aç",
    "navigator.share",
    "navigator.clipboard",
    "Bağlantı kopyalandı ✓",
    "Fotoğraflar ·",
):
    if required not in viewer_js:
        errors.append(f"portfolio viewer detail missing: {required}")

for required in (
    ".portfolio-viewer",
    "backdrop-filter",
    ".real-listing-expand",
    ".real-listing-share",
    "env(safe-area-inset-top)",
    "prefers-reduced-motion",
):
    if required not in viewer_css:
        errors.append(f"portfolio viewer styling missing: {required}")

if "/assets/portfolio-viewer.js" not in detail_html or "/assets/portfolio-viewer.css" not in signature_css:
    errors.append("property detail must load viewer JS and imported viewer CSS")

if "/assets/signature.css" not in index_html:
    errors.append("homepage does not load the signature stylesheet")
for forbidden in ("/assets/mobile-home-fix.css", "/assets/neo.css", "/assets/neo-live.css"):
    if forbidden in index_html:
        errors.append(f"homepage loads retired style asset: {forbidden}")

for required in ('name="roomPlanManual"', "/assets/admin-hygiene.js", "/assets/admin-polish.css"):
    if required not in admin_html:
        errors.append(f"admin detail polish missing: {required}")

for required in (
    "RETIRED_PLACEHOLDERS",
    "property-placeholder.svg",
    "patchSavedRoomPlan",
    "roomPlanManual",
    "Sitede aç",
    "Kaydedildi ✓",
    "if (!id) return",
    "polishAdminLanguage",
):
    if required not in admin_hygiene:
        errors.append(f"admin hygiene behavior missing: {required}")
if "if (!id || !manual) return" in admin_hygiene:
    errors.append("admin room plan cannot be cleared")

for required in ("prefers-reduced-motion", "brand-sculpture", "brand-plaque", "requestAnimationFrame"):
    if required not in signature_js:
        errors.append(f"signature interaction runtime missing: {required}")
for required in ("#061c16", ".signature-hero", ".mobile-contact-dock", "prefers-reduced-motion"):
    if required not in signature_css:
        errors.append(f"signature responsive styling missing: {required}")

for required in ("function openHandoff", "popup.opener = null", "location.assign(url)"):
    if required not in whatsapp:
        errors.append(f"WhatsApp handoff reliability missing: {required}")
if 'window.open(url, "_blank", "noopener,noreferrer")' in whatsapp:
    errors.append("ambiguous popup return path can cause duplicate WhatsApp navigation")

for required in ('"name":"FIDEON Gayrimenkul"', '"lang":"tr"', '"background_color":"#061c16"', '"theme_color":"#061c16"', '"src":"/assets/fideon-mark.svg"'):
    if required not in manifest:
        errors.append(f"install identity detail missing: {required}")

for rel, text in (("privacy.html", privacy), ("terms.html", terms)):
    if 'class="legal-page"' not in text or '/assets/signature.css' not in text:
        errors.append(f"legal page lost signature reading surface: {rel}")

if 'href="/">Ana sayfa</a>' not in not_found:
    errors.append("404 primary recovery no longer returns to useful homepage")

for rel in ("saved/index.html", "journal/index.html", "referrals/index.html"):
    text = (ROOT / rel).read_text(encoding="utf-8")
    if '<meta name="theme-color" content="#061c16">' not in text or '/assets/signature.css' not in text:
        errors.append(f"retired route does not use signature first paint: {rel}")
    if any(old in text for old in ('#f4f3ef', '#9f8cff', '#68d7e6')):
        errors.append(f"retired route contains obsolete visual copy: {rel}")

if (ROOT / "assets/property-palm.svg").exists():
    errors.append("retired property-palm artwork must stay deleted")

if errors:
    for error in errors:
        print("ERROR:", error)
    sys.exit(1)

print("PASS: portfolio, admin, legal, motion and WhatsApp source safeguards")
