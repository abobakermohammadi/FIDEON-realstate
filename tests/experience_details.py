from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

viewer_js = (ROOT / "assets/portfolio-viewer.js").read_text(encoding="utf-8")
viewer_css = (ROOT / "assets/portfolio-viewer.css").read_text(encoding="utf-8")
detail_html = (ROOT / "properties/view/index.html").read_text(encoding="utf-8")
admin_html = (ROOT / "admin/index.html").read_text(encoding="utf-8")
admin_hygiene = (ROOT / "assets/admin-hygiene.js").read_text(encoding="utf-8")

for required in (
    "aria-modal",
    "ArrowLeft",
    "ArrowRight",
    "pointerStartX",
    "prefers-reduced-motion",
    "property-placeholder.svg",
    "Fotoğrafları tam ekran aç",
):
    if required not in viewer_js:
        errors.append(f"portfolio viewer detail missing: {required}")

for required in (
    ".portfolio-viewer",
    "backdrop-filter",
    ".real-listing-expand",
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
):
    if required not in admin_hygiene:
        errors.append(f"admin hygiene behavior missing: {required}")

if (ROOT / "assets/property-palm.svg").exists():
    errors.append("retired property-palm artwork must stay deleted")

if errors:
    for error in errors:
        print("ERROR:", error)
    sys.exit(1)

print("PASS: obsessive portfolio viewer + admin detail checks")
