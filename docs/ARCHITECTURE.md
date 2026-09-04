# FIDEON architecture · localhost phase

## Truth model
- **Notion** preserves durable product decisions and continuation context.
- **GitHub `main`** is implementation truth after reviewed local changes are merged.
- **Localhost** is the only runtime target authorized for this phase.

## Runtime
The site is dependency-light HTML, CSS and JavaScript. It runs with Python's built-in static server and does not require accounts, API keys, package installation, a database, or cloud hosting.

```bash
python3 -m http.server 4173
```

## Local persistence
The browser stores:
- saved property IDs
- lead form submissions
- owner-created or edited preview properties
- preview media as browser data URLs

Keys are namespaced under `fideon.*.v1`.

## Product entities represented in the UI
- properties
- property media
- leads
- lead stages
- viewings
- saved properties
- private-collection requests
- seller briefs
- buyer concierge briefs
- referral briefs
- journal content
- site settings

## Property truth model
Status and visibility remain separate concepts so a future backend can be added without redesigning the product.

Status: Draft, Available, Reserved, Sold, Rented, Archived.

Visibility: Public, Teaser, Private, Hidden.

## Localhost safety boundary
This phase intentionally does **not** provide remote authentication or shared persistence. `/admin/` is an owner preview console and must stay on localhost. Sample inventory is labeled and indexing is blocked.

## Future infrastructure
A cloud/backend phase can be designed later if the owner explicitly authorizes it. No provider is selected or required by the localhost v1.
