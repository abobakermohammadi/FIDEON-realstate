# MAMELAT — Deployment, DNS & Backend Developer Guide

This document contains everything needed to connect the domain, configure DNS, deploy the static production site, and optionally connect a backend database or CRM.

---

## 1. Quick Start (Instant Static Deployment)

The folder `build/` is a **pure, zero-dependency, ultra-fast static website**. It requires no Node.js runtime in production and can be served by any static host or web server.

### Supported Hosting Options:
- **Cloudflare Pages / Vercel / Netlify**: Drag-and-drop or connect the GitHub repo (`build/` folder).
- **Nginx / Apache / Caddy**: Point `root` to the static directory.
- **AWS S3 + CloudFront / Google Cloud Storage / DigitalOcean App Platform**: Deploy as static site.

---

## 2. Domain & DNS Configuration

If the client owns `mamelat.com` (or similar domain):

### DNS Records (Cloudflare, Namecheap, GoDaddy, etc.)
| Type | Name / Host | Target / Value | TTL | Note |
|---|---|---|---|---|
| **A** | `@` (root) | `<Server IP>` (or provider IP) | Auto | Points apex domain |
| **CNAME** | `www` | `mamelat.com` (or provider alias) | Auto | Redirects www to apex |
| **TXT** | `@` | (SSL verification if required) | Auto | SSL certificate |

### SSL / HTTPS:
- Enforce **HTTPS** with automatic HTTP -> HTTPS redirection.
- Enable TLS 1.3 and HSTS for security and SEO score.

---

## 3. Web Server Configurations

### Nginx Configuration (`/etc/nginx/sites-available/mamelat.conf`)
```nginx
server {
    listen 80;
    server_name mamelat.com www.mamelat.com;
    return 301 https://mamelat.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.mamelat.com;
    # SSL cert paths...
    return 301 https://mamelat.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mamelat.com;

    root /var/www/mamelat/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Clean URL handling (folder/ -> folder/index.html)
    location / {
        try_files $uri $uri/ $uri/index.html /404.html;
    }

    # Static assets caching (1 year)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Custom 404 page
    error_page 404 /404.html;
}
```

### Apache (`.htaccess`)
```apache
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Clean directory index
DirectoryIndex index.html

# Custom 404
ErrorDocument 404 /404.html

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 4. Brand & Verified Contact Constants

These verified communication details are embedded in `assets/data.js` and all page actions:

- **Brand Name**: MAMELAT (Official Option A architectural wordmark)
- **WhatsApp**: `905013575635` (Formats to `https://wa.me/905013575635?text=...`)
- **Phone**: `+90 501 357 56 35` (`tel:+905013575635`)
- **Email**: `fideon.official@gmail.com`
- **Location**: İstanbul, Türkiye

---

## 5. Connecting a Real Backend (Database, CRM, Leads)

The website is designed with clean decoupling so you can hook up any backend (Supabase, Firebase, Node/Express, Python/FastAPI, PostgreSQL, Strapi CMS) without rewriting the frontend.

### A. Dynamic Property Listings
Currently, listings are configured in `assets/data.js`. The array `window.FIDEON.sampleProperties` is currently set to `[]` (truthful empty inventory).

To fetch listings from a real API or Supabase, open `assets/app.js` inside `getProperties()`:
```javascript
// Example: replace local array with an API fetch
async function fetchPropertiesFromBackend() {
  try {
    const res = await fetch('https://api.mamelat.com/v1/properties');
    const data = await res.json();
    return data; // Array of property objects
  } catch (err) {
    console.error('Failed to load listings:', err);
    return [];
  }
}
```

#### Property Object Schema:
```json
{
  "id": "bebek-bosphorus-villa",
  "title": "Bebek Boğaz Manzaralı Özel Villa",
  "type": "satilik",
  "category": "villa",
  "price": 125000000,
  "currency": "TRY",
  "location": "Bebek, Beşiktaş",
  "rooms": "5+2",
  "area": 580,
  "images": [
    "/assets/properties/bebek-1.jpg",
    "/assets/properties/bebek-2.jpg"
  ],
  "summary": "Boğaz hattında müstakil bahçeli ve rıhtımlı yalı.",
  "amenities": ["Boğaz Manzarası", "Özel Otopark", "Müstakil Bahçe", "Güvenlik"],
  "whatsappMessage": "Merhaba MAMELAT, Bebek Boğaz Manzaralı Villa hakkında görüşmek istiyorum."
}
```

### B. Lead Capture & Form Submissions (`/find/` & `/sell/`)
Currently, forms hand off directly to WhatsApp via `assets/whatsapp-forms.js`.

If you want to save leads into a CRM or database before opening WhatsApp:
In `assets/whatsapp-forms.js`, locate `openHandoff(url, meta)` and add your asynchronous backend call:
```javascript
// Send lead to your webhook / API
fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    source: form.getAttribute('data-whatsapp-form') || 'general',
    submittedAt: new Date().toISOString(),
    fields: data
  })
}).catch(err => console.warn('Lead logging error:', err));
```

---

## 6. Important Security Note on `/admin/`

The source repository contains an `/admin/` folder. This was built as a browser-local prototype using `localStorage`. 

- **Static Build Exclusion**: It has been intentionally **excluded** from the static `build/` directory so that unauthenticated visitors cannot access it on a public static host.
- **If You Deploy the Admin Panel**: You **MUST** protect `/admin/` with proper server authentication (e.g., Nginx `auth_basic`, Cloudflare Zero Trust / Access, JWT, OAuth, or server-side session cookies) before serving it on the public domain.

---

## 7. Package Contents

Inside this archive:
- `build/`: Ready-to-deploy static website (includes HTML, CSS, SVG logos, Open Graph cards, sitemap, manifest).
- `assets/mamelat-wordmark.svg`: Official Option A vector wordmark.
- `assets/mamelat-og.jpg`: High-res (1200x630) social sharing preview card.
- `DEPLOYMENT_AND_BACKEND_GUIDE.md`: This guide.
