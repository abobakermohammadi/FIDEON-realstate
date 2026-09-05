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

for rel in ("index.html", "properties/index.html"):
    text = (ROOT / rel).read_text(encoding="utf-8")
    if "/assets/public-polish.js" not in text:
        errors.append(f"direct property-card polish missing: {rel}")

whatsapp = (ROOT / "assets/whatsapp-forms.js").read_text(encoding="utf-8")
if "Bu mesaj FIDEON web sitesinden hazırlandı" in whatsapp:
    errors.append("robotic WhatsApp footer returned")

readme = (ROOT / "README.md").read_text(encoding="utf-8")
for stale in ("four clearly labeled sample", "global referral flow", "sample inventory is labeled"):
    if stale.lower() in readme.lower():
        errors.append(f"stale project truth returned to README: {stale}")

if errors:
    for error in errors:
        print("ERROR:", error)
    sys.exit(1)

print("PASS: minimal content truth checks")
