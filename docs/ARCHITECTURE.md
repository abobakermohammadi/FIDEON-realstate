# FIDEON architecture · localhost phase

## Truth model
- **Notion** preserves durable product decisions and continuation context.
- **GitHub `main`** is implementation truth.
+ **ChatGPT Sites** serves the public static experience and browser-local owner console.

## Runtime
The site is dependency-light HTML, CSS and JavaScript. It runs with Python's built-in static server and does not require accounts, API keys, a database or remote runtime services.

```bash
python3 -m http.server 4173
```

`npm run check` runs the automated validation and static build gate used by GitHub Actions.

## Local persistence
The browser-local keys are:
- properties: `fideon.properties.v2`
- leads: `fideon.leads.v2`
- legacy keys are migration-only and must not override an explicit current empty inventory

Admin-uploaded preview media is stored as browser data URLs inside local property records.

## Public information architecture
Primary paths:
- `/` homepage
- `/properties/` listings
- `/properties/view/?slug=...` detail
- `/find/` buyer brief
- `/sell/` seller brief
- `/about/`
- `/contact/`

Secondary path:
- `/private/` private/off-market request

Retired routes such as Saved, Journal and Referrals redirect into the active minimal flow.

## Product rule
The public journey is deliberately short:

**property → essentials → WhatsApp/call**

No fake property inventory is active. The included Aşiyan Konakları record is real supplied inventory, and unknown listing facts are not invented.

## Admin
`/admin/` is a browser-local owner console. It is intentionally isolated from the public `app.js` runtime so public navigation/dock styles and behaviors do not leak into the admin interface.

The default editor exposes only common listing fields. Advanced metadata and optional details live under a collapsed section.

## Localhost safety boundary
The owner console at `/admin/` stores data only in the current browser. It is not a shared or server-authenticated CMS. Indexing remains blocked until a public SEO launch is explicitly prepared.

## Future infrastructure
A backend/cloud phase can be designed later only if the owner explicitly authorizes it. No provider is selected or required by the current localhost product.
