# FIDEON Real Estate

Minimal, mobile-first localhost website and owner admin for FIDEON in Istanbul.

## Current product rule

**See the property → understand the essentials → WhatsApp or call FIDEON.**

The public site is Turkish-first, Istanbul-wide and intentionally quiet. Private/off-market requests exist only as a secondary path.

## Mode locked by owner

**Localhost only for now.** No Supabase, no cloud database, no deployment, no production publishing.

The browser is the preview data layer. Owner-created properties, uploaded preview media and leads use `localStorage`, so the site can run without external services or credentials.

## Real inventory

The included public listing is the real FIDEON Aşiyan Konakları property:

- Adnan Kahveci · Beylikdüzü · İstanbul
- 3+1
- reference `FIDEON-AK-001`
- real supplied media
- direct WhatsApp and phone actions

No fake property inventory is used. If an owner-created listing has no photo, the UI shows a neutral FIDEON placeholder rather than synthetic property art.

## Public experience

- minimal homepage
- current listings
- real listing detail with real media
- direct WhatsApp and call actions
- short buyer brief
- short seller brief
- secondary private/off-market request
- minimal About, Contact and Turkish legal drafts
- retired Journal, Saved and Referrals routes redirect to active paths

## Owner admin

`/admin/` is a localhost-only owner console with:

- listing create/edit/delete
- phone camera/photo-library input
- browser-local image previews
- lead list and stage updates
- contact/settings truth state

The common listing fields stay visible. Advanced fields are collapsed under **Diğer detaylar** so the main workflow stays simple.

## Important local-only truth

This is a complete localhost product, not a production backend. There is intentionally no remote authentication, multi-device database, hosted media storage, automated outbound messaging or deployment.

The admin route must not be published publicly in this mode.

## Run locally

```bash
python3 -m http.server 4173
```

Open:

- `http://localhost:4173/`
- `http://localhost:4173/properties/`
- `http://localhost:4173/admin/`

## Validate

```bash
npm run check
```

`npm run check` runs structural validation, localhost route smoke tests, static safety checks, JavaScript syntax checks and the static localhost build. GitHub Actions runs the same gate on `main`.

The canonical durable context is maintained in Notion under **🏛️ FIDEON Real Estate — Canonical Build Vault**. Live GitHub `main` remains implementation truth.
