# FIDEON localhost mode

This phase intentionally uses no backend service.

## Persistence
- Properties: `localStorage` key `fideon.properties.v2`
- Leads: `localStorage` key `fideon.leads.v2`
- Uploaded preview media is stored inside browser-local property records as data URLs

Legacy `v1` keys are migration-only. Once a current `v2` property store exists, an explicit empty inventory must stay empty.

## Admin safety
`/admin/` is a local owner console. It is not production-authenticated and must not be exposed on a public internet deployment in this phase.

The admin does not load the public app runtime. This keeps public navigation, contact docks and public-only styles out of the owner interface.

## Inventory truth
The included Aşiyan Konakları listing is real supplied FIDEON inventory, not sample content. Unknown facts are left unknown. Owner-created listings without photos receive a neutral FIDEON placeholder instead of synthetic real-estate art.

## Contact
Public WhatsApp actions use the verified number `+90 501 357 56 35`. Buyer, seller and private request forms build a WhatsApp message locally and open WhatsApp for the visitor to review before sending.

## Future upgrade path
When the owner later authorizes external infrastructure, the local repository can be migrated to authenticated shared persistence. That work is explicitly outside the localhost-only phase.
