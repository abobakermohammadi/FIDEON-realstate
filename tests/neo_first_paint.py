from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    "index.html",
    "properties/index.html",
    "properties/view/index.html",
    "private/index.html",
    "sell/index.html",
    "find/index.html",
    "about/index.html",
    "contact/index.html",
    "privacy.html",
    "terms.html",
    "404.html",
]

errors = []
for rel in PAGES:
    text = (ROOT / rel).read_text(encoding="utf-8")
    if '<meta name="theme-color" content="#061c16">' not in text:
        errors.append(f"browser chrome does not match signature forest theme: {rel}")
    if '/assets/signature.css' not in text:
        errors.append(f"signature first-paint stylesheet missing: {rel}")
    if any(asset in text for asset in ("/assets/neo.css", "/assets/neo-live.css", "/assets/mobile-home-fix.css")):
        errors.append(f"retired first-paint stylesheet loaded: {rel}")

app = (ROOT / "assets/app.js").read_text(encoding="utf-8")
for asset in ("/assets/signature.css", "/assets/signature.js"):
    if asset not in app:
        errors.append(f"central runtime signature fallback missing: {asset}")

signature_css = (ROOT / "assets/signature.css").read_text(encoding="utf-8")
for required in ("#061c16", ".signature-hero", ".site-header", "prefers-reduced-motion"):
    if required not in signature_css:
        errors.append(f"signature first-paint detail missing: {required}")

signature_js = (ROOT / "assets/signature.js").read_text(encoding="utf-8")
for required in ("requestAnimationFrame", "prefers-reduced-motion", "brand-sculpture", "brand-plaque"):
    if required not in signature_js:
        errors.append(f"signature runtime primitive missing: {required}")

if any(asset in app for asset in ("/assets/neo.css", "/assets/neo-live.css", "/assets/neo-live.js", "/assets/mobile-home-fix.css")):
    errors.append("central runtime must not load retired neo/mobile assets")

if errors:
    for error in errors:
        print("ERROR:", error)
    sys.exit(1)

print(f"PASS: {len(PAGES)} public pages ship the signature forest first paint")
