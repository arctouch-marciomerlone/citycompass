# Content seed report — A3

**Role:** Seeder  
**Command:** `pnpm hygraph:seed`  
**Auth:** `HYGRAPH_CONTENT_API_URL` + `HYGRAPH_MANAGEMENT_TOKEN` (Content API mutations). No MCP writes.

## Records

| Kind                       | Count | Notes                                                                           |
| -------------------------- | ----: | ------------------------------------------------------------------------------- |
| Assets created (first run) |    11 | Idempotent by `fileName`                                                        |
| Assets reused (second run) |    11 | No duplicate assets                                                             |
| Categories published       |     3 | `food-and-drink`, `culture`, `outdoors`                                         |
| Cities published           |     3 | `florianopolis`, `araucaria`, `san-francisco`                                   |
| Neighborhoods published    |     6 | Two per city                                                                    |
| Places published           |     6 | Two per city                                                                    |
| Places left draft          |     2 | `floripa-mirante-rascunho` (draft only) and `floripa-cafe-agendado` (scheduled) |

Locales on City and core Places: `en_US`, `pt_BR`, `zh_CN`.

`googlePlaceId` omitted. `openingHours` omitted.

Each city `pageSections` includes HeroBlock, RichTextBlock, FeaturedPlacesBlock, WeatherBlock, MapBlock, and CallToActionBlock.

## Draft

- Slug: `floripa-mirante-rascunho`
- Created with upsert. Not passed to `publishPlace`.

## Scheduled publish

- First run: `schedulePublishPlace` succeeded
- Place: `floripa-cafe-agendado`
- releaseAt: `2026-09-07T21:12:02.263Z`
- operation id: `cmtm0t9pmvbos07n4c8tpw61h`
- Second run: already-present (`scheduledIn` on DRAFT). No second operation created.

Official docs still mark the feature as Enterprise: https://hygraph.com/docs/developer-guides/content/scheduled-publishing  
This project accepted the Content API mutation. Studio screenshot `evidence/scheduled-publishing.png` was not created.

## Asset credits

| Fixture id           | fileName                             | Source                                                                                         | License                                         | Attribution                  |
| -------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------- |
| `florianopolis-hero` | `citycompass-florianopolis-hero.jpg` | https://unsplash.com/photos/a-palm-tree-on-a-beach-next-to-the-ocean-KMn4VEeEhk8               | Unsplash License (https://unsplash.com/license) | Sean Oulashin / Unsplash     |
| `araucaria-hero`     | `citycompass-araucaria-hero.jpg`     | https://unsplash.com/photos/high-rise-buildings-nyal9ds80ny                                    | Unsplash License (https://unsplash.com/license) | Pedro Lastra / Unsplash      |
| `san-francisco-hero` | `citycompass-san-francisco-hero.jpg` | https://unsplash.com/photos/golden-gate-bridge-california-us-qX9Ie7ieb1E                       | Unsplash License (https://unsplash.com/license) | Rich Wood / Unsplash         |
| `floripa-mercado`    | `citycompass-floripa-mercado.jpg`    | https://unsplash.com/photos/meat-with-lettuce-on-white-ceramic-plate-zcUgjyqEwe8               | Unsplash License (https://unsplash.com/license) | Joseph Gonzalez / Unsplash   |
| `floripa-lagoa`      | `citycompass-floripa-lagoa.jpg`      | https://unsplash.com/photos/body-of-water-near-trees-and-mountain-75715CESdJc                  | Unsplash License (https://unsplash.com/license) | Ken Cheung / Unsplash        |
| `araucaria-praca`    | `citycompass-araucaria-praca.jpg`    | https://unsplash.com/photos/green-trees-on-park-R0y_bEUjiOM                                    | Unsplash License (https://unsplash.com/license) | Jan Kahánek / Unsplash       |
| `araucaria-cafe`     | `citycompass-araucaria-cafe.jpg`     | https://unsplash.com/photos/white-ceramic-teacup-on-saucer-near-two-books-on-table-71vEirNScfI | Unsplash License (https://unsplash.com/license) | Mike Kenneally / Unsplash    |
| `sf-ferry`           | `citycompass-sf-ferry.jpg`           | https://unsplash.com/photos/bridge-near-body-of-water-tCICLJ5ktBE                              | Unsplash License (https://unsplash.com/license) | Joseph Barrientos / Unsplash |
| `sf-crissy`          | `citycompass-sf-crissy.jpg`          | https://unsplash.com/photos/forest-heat-by-sunbeam-T5pL1uBGsTg                                 | Unsplash License (https://unsplash.com/license) | Casey Horner / Unsplash      |
| `floripa-draft`      | `citycompass-floripa-draft.jpg`      | https://unsplash.com/photos/landscape-photography-of-mountain-hit-by-sun-rays-E616t6l4OD4      | Unsplash License (https://unsplash.com/license) | David Marcu / Unsplash       |
| `floripa-scheduled`  | `citycompass-floripa-scheduled.jpg`  | https://unsplash.com/photos/cooked-dish-on-gray-bowl--G_dtn2lRPE                               | Unsplash License (https://unsplash.com/license) | Jay Wennington / Unsplash    |

Upload used official `createAsset(data: { uploadUrl, fileName })` then `publishAsset`. Docs: https://hygraph.com/docs/api-reference/assets/uploading-assets

## Idempotency

Re-run upserts by slug. Second run reused 11 assets by `fileName` and did not create a second scheduled operation.

## Secrets

None. This file does not record tokens or endpoint credentials.
