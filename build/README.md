# FIDEON Real Estate

Premium, mobile-first localhost website and owner admin experience for FIDEON.

## Mode locked by owner

**Localhost only for now.** No Supabase, no cloud database, no deployment, no production publishing.

The browser itself is the preview data layer. Property edits, saved properties, and leads use `localStorage`, so the site can be run and demonstrated without external services or credentials.

## Implemented

- FIDEON brand system derived from the supplied Instagram reference
- premium responsive homepage
- property discovery, filtering and sorting
- four clearly labeled sample property-detail routes
- saved-property shortlist stored in the browser
- Private Collection request flow
- seller brief / list-your-property flow
- buyer concierge / find-me-a-property flow
- global referral flow
- contact flow
- About and Journal experiences
- responsive owner admin command center
- property create/edit/delete workflow stored locally
- phone camera/photo-library image input for local preview
- lead CRM with stage updates stored locally
- viewing, journal and settings truth states
- privacy and terms drafts that are clearly marked for review
- development-only noindex/robots blocking
- structural and localhost smoke tests

## Important local-only truth

This build is complete as a **local product preview**, not as a production SaaS backend. Because the owner explicitly chose localhost-only mode, there is intentionally no real authentication, remote multi-device database, hosted media storage, outbound WhatsApp automation, or live deployment.

The admin route must not be published publicly in this mode.

## Run locally

From the repository root:

```bash
python3 -m http.server 4173
```

Open:

- `http://localhost:4173/`
- `http://localhost:4173/properties/`
- `http://localhost:4173/admin/`

## Validate

```bash
python3 tests/validate.py
python3 tests/runtime_smoke.py
node --check assets/data.js
node --check assets/app.js
node --check assets/admin.js
```

The canonical durable context is maintained in Notion under **🏛️ FIDEON Real Estate — Canonical Build Vault**. Live GitHub code is implementation truth.
