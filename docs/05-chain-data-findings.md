# Chain Nutrition Data: What Is Published and What We Used

Checked 2026-10-05. "Official" means published by the chain itself.

| Chain | Official data? | Status |
|---|---|---|
| Toast Box | Yes: Nutrition Information Panel, Dec 2023, **beverages only** (23 drinks incl. sodium, carbs, sugar) | **Imported** to `data/published/toastbox-beverages.json`, attached to both Toast Box venues |
| Subway | Yes: monthly PDF product guides per promo range, with sodium, carbs, sugar. The Signature Series guide (Dec 2024) covers 4 subs x 3 bases | **Imported** to `data/published/subway-signature.json`. Not shown in the app yet: we have no Subway venue location |
| McDonald's | Yes, but only as an interactive nutrition calculator on mcdonalds.com.sg | Not extracted. Would need a look at what the calculator loads |
| BreadTalk | No official source found. Only third-party, user-entered sites | **Not used** |
| The Soup Spoon | No official source found. Third-party figures look rounded (800, 750, 850 mg), so probably estimates | **Not used** |
| Dabba Street | No official nutrition published | **Not used** |
| Din Tai Fung, Yoshinoya, PastaMania | Only third-party sites | **Not used** |
| SaladStop! | Calories only on the menu page, no sodium or carbs | Not used (cannot check sodium or carb limits) |

## How the data was checked

- **Toast Box:** the PDF text layer is scrambled (labels and values come out in the wrong order), so the parser reads table positions, then checks each value against its own per-100ml column. All 23 drinks pass. The first four were also compared by eye against the rendered page.
- **Subway:** the text layout interleaves names and rows, so the 12 rows were transcribed and each is checked against the per-100g table (serving weight x per-100g value must equal the per-serving value). All 12 pass.
- Search-engine summaries of these chains showed numbers (for example Toast Box food items such as laksa at 1,200 mg sodium) that do not appear in the official PDF. Those came from aggregator sites and were ignored.

## Gaps this leaves

- **Toast Box food** (kaya toast, set meals) is not covered by the PDF. The venue cards say "Drinks only so far".
- **Subway standard menu** (as opposed to promotional ranges) was not found as a published guide.
- **Potassium and phosphorus** appear in none of these sources, so kidney-disease users who set those limits will see these dishes excluded. That is the intended behaviour.
- Each chain's panel also lists protein and fat, which we do not store.

## Licensing

These are facts printed by the restaurants, with the source recorded on every file. That is fine for a demo, but we should get permission before a public launch. Part of the restaurant outreach for coupons can cover this.

## Reproducing

```bash
python data/ingest/toastbox.py          # needs data/raw/chains/toastbox-nip-2023-12.pdf and pymupdf
python data/ingest/subway_signature.py
```

The Toast Box PDF was retrieved through web.archive.org because toastbox.com.sg was showing a maintenance page. The raw PDFs stay in `data/raw/` (gitignored).

## Halal status (added 2026-10-05)

Source: the official MUIS Halal Establishments e-service, searched by name in a browser. Saved in `data/published/muis-halal.json` with certificate numbers.

| Venue | MUIS result |
|---|---|
| Lau Pa Sat | 7 certified establishments (stalls 14, 51-53, 54, 61, 67-68, 69, plus Creme & Cone) |
| Amoy Street Food Centre | 1: Manna (stall 71) |
| Maxwell Food Centre | 1: Fortune Popiah (stall 101) |
| Toast Box, Ya Kun, SaladStop!, Market Street Hawker Centre | No result |

- A food centre is never marked halal itself. Only the certified stalls are, so halal-only users see those stalls, not the whole centre.
- "No result" means MUIS returned nothing for that search text. The search matches names or addresses, so it is a strong signal but not proof that no certified stall exists.
- Stall coordinates are placed on a small spiral near their food centre (within about 40 m), because MUIS gives addresses, not coordinates.
- The result lists are a snapshot from 2026-10-05; certification changes.

## Menus (what could not be found)

No official, machine-readable menu was reachable for any of the venues:

- Toast Box: the site was on a maintenance page.
- Ya Kun: the official menu URL returned 404, and the rest were JavaScript-only or aggregator pages.
- SaladStop!: menu loads by JavaScript from an ordering site.
- Hawker stalls: no official menus exist online.

Third-party listing sites show dish names and prices (for example Ipoh Hainanese Chicken Rice at Lau Pa Sat offers chicken rice sets, Ipoh curry chicken noodles and shredded chicken prawn hor fun), but prices vary by source and outlet, so these were **not imported**. Reliable menus need one of: menu photos from you, restaurant cooperation (which the coupon outreach can include), or an ordering platform we have permission to read.

## Unverified menus (added 2026-10-05, option 2)

`data/menus/unverified-menus.json` lists 11 dishes across 6 venues, taken from third-party listing pages with their source URLs recorded. Rules:

- Dish **names only**, no prices (sources disagree).
- Nutrition is **estimated** by ingredient decomposition (`data/menus/decompositions.json`, USDA FoodData Central), low confidence.
- Every dish carries `menuSource: third_party`, and the app labels it "Unverified menu: confirm at the stall".
- Stall numbers on the blogs disagree with MUIS (Thunder Tea Rice is #25 on one blog and Stall 54 on MUIS). MUIS is treated as correct.
- Google Maps was opened for the Ipoh stall: it confirmed hours and that the stall sells poached and roasted chicken, but photos did not show a menu board. Nothing from Maps is stored (its terms prohibit scraping, and photos are users' content).
- I did not import "curry chicken noodles" for Ipoh because I could only trace it to a search-result summary, not to a page I read.
- The MUIS search is not exhaustive: a blog lists other halal Lau Pa Sat stalls (satay, Warong Pak Sapari) that did not appear in my MUIS searches. They are probably listed under different address text.
