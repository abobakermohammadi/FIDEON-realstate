from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

viewer_js = (ROOT / "assets/portfolio-viewer.js").read_text(encoding="utf-8")
viewer_css = (ROOT / "assets/portfolio-viewer.css").read_text(encoding="utf-8")
detail_html = (ROOT / "properties/view/index.html").read_text(encoding="utf-8")
admin_html = (ROOT / "admin/index.html").read_text(encoding="utf-8")
admin_hygiene = (ROOT / "assets/admin-hygiene.js").read_text(encoding="utf-8")
neo_live_js = (ROOT / "assets/neo-live.js").read_text(encoding="utf-8")
neo_live_css = (ROOT / "assets/neo-live.css").read_text(encoding="utf-8")
whatsapp = (ROOT / "assets/whatsapp-forms.js").read_text(encoding="utf-8")
manifest = (ROOT / "manifest.webmanifest").read_text(encoding="utf-8")
reading_css = (ROOT / "assets/reading-polish.css").read_text(encoding="utf-8")
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

for required in ("/assets/portfolio-viewer.css", "/assets/portfolio-viewer.js"):
    if required not in detail_html:
        errors.append(f"property detail does not load viewer asset: {required}")

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

for required in (
    "trapMobileMenuFocus",
    "autoGrowTextarea",
    "MutationObserver",
    "installHeadPolish",
    "manifest.webmanifest",
    "apple-mobile-web-app-title",
    "markActiveNavigation",
    "navigationChanged",
    "guardImages",
    "property-placeholder.svg",
):
    if required not in neo_live_js:
        errors.append(f"live mobile/form/browser refinement missing: {required}")
for required in ("mask-image:url", ".mobile-contact-dock .dock-link>span"):
    if required not in neo_live_css:
        errors.append(f"precision mobile dock icon treatment missing: {required}")

for required in ("function openHandoff", "popup.opener = null", "location.assign(url)"):
    if required not in whatsapp:
        errors.append(f"WhatsApp handoff reliability missing: {required}")
if 'window.open(url, "_blank", "noopener,noreferrer")' in whatsapp:
    errors.append("ambiguous popup return path can cause duplicate WhatsApp navigation")

for required in ('"name":"FIDEON Gayrimenkul"', '"lang":"tr"', '"background_color":"#f4f3ef"', '"theme_color":"#f4f3ef"', '"src":"/assets/fideon-mark.svg"'):
    if required not in manifest:
        errors.append(f"install identity detail missing: {required}")

for required in (".legal-page .page-copy", "counter-reset:legal-section", "backdrop-filter", "FIDEON"):
    if required not in reading_css:
        errors.append(f"legal reading polish missing: {required}")
for rel, text in (("privacy.html", privacy), ("terms.html", terms)):
    if 'class="legal-page"' not in text or '/assets/reading-polish.css' not in text:
        errors.append(f"forgotten legal page lost crafted reading surface: {rel}")

if 'href="/">Ana sayfa</a>' not in not_found:
    errors.append("404 primary recovery no longer returns to useful homepage")

for rel in ("saved/index.html", "journal/index.html", "referrals/index.html"):
    text = (ROOT / rel).read_text(encoding="utf-8")
    if '<meta name="theme-color" content="#f4f3ef">' not in text or 'background:#f4f3ef' not in text:
        errors.append(f"retired route can flash the old dark theme: {rel}")
    if 'class="glass"' not in text or '#9f8cff' not in text or '#68d7e6' not in text:
        errors.append(f"retired route no longer matches neo glass handoff language: {rel}")

if (ROOT / "assets/property-palm.svg").exists():
    errors.append("retired property-palm artwork must stay deleted")

if errors:
    for error in errors:
        print("ERROR:", error)
    sys.exit(1)

print("PASS: obsessive portfolio, admin, browser, legal, retired-route, mobile and WhatsApp detail checks")