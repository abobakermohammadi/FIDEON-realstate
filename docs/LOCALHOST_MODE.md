# FIDEON localhost mode

This phase intentionally uses no backend service.

## Persistence
- Properties: `localStorage` key `fideon.properties.v1`
- Leads: `localStorage` key `fideon.leads.v1`
- Saved listings: browser-local saved-property key managed by `assets/app.js`

## Admin safety
`/admin/` is a local owner console. It is not production-authenticated and must not be exposed on a public internet deployment in this phase.

## Demo data
The included inventory is sample content only. The UI labels it so visitors are not misled.

## Future upgrade path
When the owner later authorizes cloud infrastructure, the local repository can be migrated to authenticated server persistence without changing the product information architecture. That work is explicitly outside this localhost-only phase.
