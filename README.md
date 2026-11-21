# Soulsborne Master Encyclopedia — PS5-Playable Scope (V2)

A fresh Android-first PWA built from the user's master specification, with a PS5-playable platform boundary.

## Platform scope
- **Demon's Souls:** native PS5 remake only. Original PS3 version is excluded.
- **Elden Ring:** native PS5 version.
- **Dark Souls Remastered, Dark Souls II: Scholar of the First Sin, Bloodborne, Dark Souls III, Sekiro:** PS4 application editions played on PS5 through backward compatibility. These are not represented as native PS5 ports.

Official PlayStation product/support references are linked in the catalog. PS5 backward compatibility applies to the overwhelming majority of PS4 titles; some PS4 features can be absent on PS5.

## Included expansion chapters
- Demon's Souls: no traditional paid story expansion.
- Dark Souls Remastered: Artorias of the Abyss (included in Remastered).
- Dark Souls II: Crown of the Sunken King, Crown of the Old Iron King, Crown of the Ivory King (included in Scholar of the First Sin).
- Bloodborne: The Old Hunters.
- Dark Souls III: Ashes of Ariandel and The Ringed City.
- Sekiro: no paid story expansion. Its Game of the Year bonus content includes Reflections of Strength, Gauntlets of Strength, Remnants and cosmetic skins; these are update/bonus modes, not a separate story DLC.
- Elden Ring: Shadow of the Erdtree.

## What's working in this build
- Seven-game selector with edition and platform scope.
- 604 seeded index records: 188 area records, 256 boss/miniboss records and 160 notable NPC records.
- DLC tagging and filters, including a separate DLC summary for each game.
- Independent checklists and favorites for each game and every stable record ID.
- Search and type filters; show-incomplete filter.
- Record detail modal with research source link and mark-complete action.
- Independent per-game notes and build allocation notes.
- JSON backup/restore that merges each game's progress/favorites without wiping other game namespaces.
- Selected-game reset.
- PWA manifest and service-worker cache of app shell and catalog.
- Responsive mobile-first dark fantasy interface.

## Important completeness status
**This is a sourced starter catalog, not a finished exhaustive encyclopedia.** The 604 records are index-level seeds assembled from the sources linked in `catalog.js`. Most individual records still need detailed route/acquisition instructions, missability, drops/rewards, weaknesses, exact quest steps and cross-links.

Not yet populated as complete catalogs:
- Every individual weapon, armor piece, shield, ring, spell, consumable, crafting/upgrade item, key item and collectible.
- Full NPC questline step sequences and fail conditions.
- Complete all-enemy bestiary and every encounter variant/repeat spawn.
- Exact PSN trophy lists and trophy conditions for each title.
- Fully verified maps/routes, detailed walk-through steps and complete area loot checklists.
- Full game-specific stat caps, formulas and derived-stat calculator validation.

The dashboard therefore labels the content percentage as **Tracked Content**, meaning checked records among currently loaded index records only. It does not claim overall game completion. Trophy and Collection percentages remain unavailable until their actual records are added.

## Data and privacy
Canonical catalog data is stored in `catalog.js`; personal progress lives separately in localStorage under `soulsborne-v2`. All personal states are namespaced by game ID. If the earlier starter build's `soulsborne-v1` key exists on the same site origin, its saved per-game notes/builds/progress are migrated. Import merges matching records and game namespaces.

## Run and deploy
Open `index.html` for a basic browser preview. Service worker, offline caching and installability require HTTPS or localhost.

Free phone-friendly route:
1. Create a public GitHub repository.
2. Upload the files in this folder to the repository root.
3. In Settings → Pages, deploy from the main branch and root folder.
4. Open the HTTPS URL in Chrome on Android and choose Install app / Add to Home screen.

No billing is needed for the basic GitHub Pages route. Provider terms and UI may change over time.
