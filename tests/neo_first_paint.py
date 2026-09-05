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
    for asset in ("/assets/neo.css", "/assets/neo-live.css"):
        marker = f'<link rel="stylesheet" href="{asset}">'
        if marker not in text:
            errors.append(f"neo first-paint stylesheet missing: {rel} -> {asset}")
    if '<meta name="theme-color" content="#f4f3ef">' not in text:
        errors.append(f"browser chrome does not match light neo canvas: {rel}")

app = (ROOT / "assets/app.js").read_text(encoding="utf-8")
for asset in ("/assets/neo.css", "/assets/neo-live.css", "/assets/neo-live.js"):
    if asset not in app:
        errors.append(f"central runtime fallback missing: {asset}")

live_css = (ROOT / "assets/neo-live.css").read_text(encoding="utf-8")
for required in (".neo-reactive", "backdrop-filter", "neo-live-drift", "prefers-reduced-motion"):
    if required not in live_css:
        errors.append(f"live glass detail missing: {required}")

live_js = (ROOT / "assets/neo-live.js").read_text(encoding="utf-8")
for required in ("requestAnimationFrame", "MutationObserver", "prefers-reduced-motion", "neo-pressed"):
    if required not in live_js:
        errors.append(f"live glass runtime primitive missing: {required}")

if errors:
    for error in errors:
        print("ERROR:", error)
    sys.exit(1)

print(f"PASS: {len(PAGES)} public pages ship the neo glass first paint")
