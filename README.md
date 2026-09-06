# FIDEON Real Estate

Minimal, mobile-first public website and localhost owner admin for FIDEON in Istanbul.

## Current product rule

## Signature rebuild · September 2026

The public pages use one shared forest-green, antique-gold and ivory design in
`assets/signature.css`. The homepage presents the supplied FIDEON artwork with
CSS perspective, a subtle light sweep and optional pointer tilt. Reduced-motion
preferences disable motion. Public text is always visible without animations.

The buyer and seller paths remain simple WhatsApp handoffs. Local owner edits
are browser-local previews, not a way to publish inventory to every visitor.
No listings, business statistics or customer testimonials are fabricated.

**Understand FIDEON → choose what you need → WhatsApp or call.**

The public site is Turkish-first, Istanbul-wide and intentionally quiet. No seeded property is currently published. Private/off-market requests remain a secondary path.

## Mode locked by owner

The public experience is a lightweight static Site. No Supabase, cloud database,
remote authentication or hosted media is required. The owner console is available
at /admin/, while its records remain isolated to the browser that created them.

The browser is the preview data layer. Owner-created properties, uploaded preview media and leads use `localStorage`, so the site can run without external services or credentials.

## Current inventory truth

The previously seeded Aşiyan Konakları listing and its media have been retired from the repository and from the public runtime.

Fresh localhost sessions start with an empty public inventory. The owner can add future listings from `/admin/`. If a listing has no photo, the UI shows a neutral FIDEON placeholder rather than synthetic property art.

## Brand

The FIDEON favicon/monogram and full logo lockup are code-based SVG vectors traced from the owner-supplied reference artwork:

- `assets/fideon-mark.svg`
- `assets/fideon-logo.svg`
- `assets/fideon-logo-reference.jpg`

Core identity colors are deep green and warm antique gold.

## Public experience

- minimal brand-first homepage
- direct buyer path
- direct seller/landlord path
- WhatsApp and call always easy to reach
- listings surface that stays empty until the owner adds inventory
- generic listing detail route for future owner-created listings
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

## Important architecture truth

The public Site is static and intentionally has no remote authentication, multi-device database, hosted media storage or automated outbound messaging.

The admin route is a browser-local console, not a shared or server-authenticated CMS.

## Run locally

```bash
python3 -m http.server 4173
```

Open:

- `http://localhost:4173/`
- `http://localhost:4173/find/`
- `http://localhost:4173/sell/`
- `http://localhost:4173/admin/`

## Validate

```bash
npm run check
```

`npm run check` runs structural validation, localhost route smoke tests, static safety checks, JavaScript syntax checks and the static localhost build. GitHub Actions runs the same gate on `main`.

The canonical durable context is maintained in Notion under **🏛️ FIDEON Real Estate — Canonical Build Vault**. Live GitHub `main` remains implementation truth.
