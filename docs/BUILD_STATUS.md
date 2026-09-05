# Build status

## 2026-09-05 · Minimal localhost finish pass

### Owner constraint
- public static Site for the visitor experience
- no Supabase or cloud backend
- owner console remains localhost-only
- Turkish-first, Istanbul-wide
- minimum effort to browse, understand and contact FIDEON

### Proven in repository
- portfolio is intentionally empty until the owner adds current inventory
- verified contact is preserved: `+90 501 357 56 35`
- homepage and listings are reduced to the essential visitor journey
- buyer, seller and private request forms hand directly to WhatsApp
- buyer/seller forms do not ask for redundant name/phone fields before WhatsApp
- Contact is intentionally form-free and exposes WhatsApp, call and email immediately
- listing cards use the listing-specific WhatsApp message when available
- saved-list UI is retired from the minimal public flow
- stale Dubai/global positioning, sample routes and unused synthetic property art are removed
- missing-photo fallback is a neutral FIDEON placeholder
- public inventory now has one shared visibility rule: Private, Hidden, Taslak/Draft and Arşiv/Archived records cannot leak through the homepage, listings or direct detail URLs
- property details read the current browser-local inventory, so owner edits and deletions are not silently replaced by stale seed data
- owner admin is isolated from the public runtime
- admin common listing fields are visible while advanced fields are collapsed
- admin “Yayında” count follows the same publishability rules as the public site
- explicit empty local inventory remains empty instead of resurrecting seed data
- admin phone-photo uploads are resized to a maximum 1280 px edge and converted to compressed WebP before local storage, reducing the chance that normal camera photos overflow browser storage
- local preview storage failures cannot block a visitor from opening the WhatsApp handoff
- Turkish privacy and terms drafts exist
- indexing is blocked for localhost
- `npm run check` is the repository gate
- GitHub Actions runs validation, visibility regressions, JavaScript syntax checks and the static build on `main`

### Intentional architecture limitations
- data is browser/device-local
- clearing browser storage clears local properties and leads
- admin has no production authentication and remains local; the public bundle omits it
- uploaded admin media is browser-local preview media rather than hosted production media
- no production notifications, analytics or external persistence

### Remaining evidence boundary
Automated structural, runtime-smoke, visibility, syntax, safety and build checks are proven in GitHub Actions. A final pixel-level desktop/mobile browser review still requires an environment capable of rendering and inspecting the actual localhost UI with the repository files present.

### Definition of done for this phase
The repository must remain coherent, minimal and runnable with direct contact flows, honest local persistence, green automated checks and no knowingly unresolved code/content defects. The public Site must omit the localhost-only owner console.
