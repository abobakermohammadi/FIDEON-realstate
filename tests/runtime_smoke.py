from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from urllib.request import urlopen
import os

ROOT = Path(__file__).resolve().parents[1]
ROUTES = [
    "/", "/properties/", "/properties/view/", "/private/", "/sell/", "/find/",
    "/referrals/", "/about/", "/journal/", "/contact/", "/saved/",
    "/admin/", "/privacy.html", "/terms.html", "/404.html",
    "/assets/styles-base.css", "/assets/styles-components-a.css", "/assets/styles-components-b.css", "/assets/styles-admin-responsive.css",
    "/assets/v2.css", "/assets/portfolio-polish.css", "/assets/real-listing.css", "/assets/minimal.css", "/assets/delight.css", "/assets/immersive.css",
    "/assets/neo.css", "/assets/neo-live.css", "/assets/portfolio-viewer.css", "/assets/admin-polish.css", "/assets/reading-polish.css",
    "/assets/data.js", "/assets/app.js", "/assets/admin.js", "/assets/admin-hygiene.js", "/assets/whatsapp-forms.js", "/assets/delight.js", "/assets/immersive.js", "/assets/neo-live.js", "/assets/portfolio-viewer.js",
    "/assets/fideon-mark.svg", "/assets/fideon-logo.svg", "/assets/fideon-wordmark.svg", "/assets/property-placeholder.svg",
]

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

os.chdir(ROOT)
server = ThreadingHTTPServer(("127.0.0.1", 0), Quiet)
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
port = server.server_address[1]

errors = []
try:
    for route in ROUTES:
        with urlopen(f"http://127.0.0.1:{port}{route}", timeout=3) as response:
            body = response.read()
            if response.status != 200:
                errors.append(f"{route}: HTTP {response.status}")
            if not body:
                errors.append(f"{route}: empty response")
finally:
    server.shutdown()
    server.server_close()

if errors:
    for error in errors:
        print("ERROR:", error)
    raise SystemExit(1)

print(f"PASS: {len(ROUTES)} localhost routes served successfully")
