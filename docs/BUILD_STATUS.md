# Build status

## 2026-09-05 · Minimal localhost finish pass

### Owner constraint
- localhost only
- no Supabase or cloud backend
- no deployment or publishing
- Turkish-first, Istanbul-wide
- minimum effort to browse, understand and contact FIDEON

### Proven in repository
- real Aşiyan Konakları listing and supplied media are active
- verified contact is preserved: `+90 501 357 56 35`
- homepage and listings were reduced to the essential visitor journey
- buyer, seller and private request forms hand directly to WhatsApp
- buyer/seller forms no longer ask for redundant name/phone fields before WhatsApp
- Contact is intentionally form-free and exposes WhatsApp, call and email immediately
- listing cards use the listing-specific WhatsApp message when available
- saved-list UI was retired from the minimal public flow
- stale Dubai/global 404 and old global/template positioning were removed
- synthetic sample property routes and unused synthetic property art were removed
- missing-photo fallback is now a neutral FIDEON placeholder
- owner admin is isolated from the public runtime
- admin common listing fields are visible while advanced fields are collapsed
- explicit empty local inventory remains empty instead of resurrecting seed data
- Turkish privacy and terms drafts exist
- indexing is blocked for localhost
- `npm run check` is the repository gate
- GitHub Actions runs validation and static build on `main`

### Intentional localhost limitations
- data is browser/device-local
- clearing browser storage clears local properties and leads
- admin has no production authentication and must remain local
- uploaded admin media is stored as browser data URLs
- no production notifications, analytics or external persistence

### Remaining evidence boundary
Automated structural, runtime-smoke, syntax, safety and build checks can be proven in GitHub Actions. A final pixel-level desktop/mobile browser review still requires an environment capable of rendering and inspecting the actual localhost UI.

### Definition of done for this phase
The repository must remain coherent, minimal and runnable on localhost with the real listing, direct contact flows, honest local persistence, green automated checks and no knowingly unresolved code/content defects. Production infrastructure is a separate future phase requiring owner approval.
