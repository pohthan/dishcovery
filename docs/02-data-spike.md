# Data Spike: Findings So Far

Goal: find out whether we can get usable, labelled nutrient and halal data for 15-30 restaurants around the Singapore CBD and SMU.

## Status

**Partially complete.** Source research is done. The hands-on test (parse 5 real menus, estimate nutrients, check by hand) is **not** done, because it is blocked on the item marked BLOCKER below.

## Findings

### 1. Nutrient database: SG FoodID (HPB)
- FOCOS was discontinued in phases from 17 Nov 2025 and replaced by **SG FoodID** (pphtpc.hpb.gov.sg/web/sgfoodid). Any older tutorial or dataset based on FOCOS is stale.
- The site says it supports search, comparison and **download** of nutritional information. Each item records its data source (lab analysis, international database, or recipe calculation) and last-updated date. That provenance fits our confidence labelling.
- **BLOCKER (unconfirmed):** I could not confirm (a) which nutrients are present (sodium, potassium, phosphorus, carbohydrate, sugar), (b) whether there is bulk download or an API, or (c) the licensing terms. The Terms of Use link (go.gov.sg/termsofuse-hpbsgfoodid) was stuck on a redirect screen. The food-search UI is a JavaScript app that returned no content to my tools. It works best on desktop, so someone should check it by hand.
- The disclaimer says HPB does not guarantee the data is error-free. Our UI wording must reflect that.

### 2. Restaurant-published nutrition is not enough
- SaladStop shows **calories only** on its menu page (plus a carbon footprint figure, and a separate nutrition calculator). No sodium, carbohydrate, potassium or phosphorus were visible.
- This confirms we must estimate nutrients for most dishes. Two other chain sites (The Soup Spoon, Collin's) could not be fetched (network and certificate errors), so they are not evaluated.

### 3. Halal verification
- The official list is the MUIS e-service (halal.muis.gov.sg/halal/establishments). I found no documented API or bulk download, and the page did not load for my fetch tool.
- Third-party mirrors exist (for example HalalBoleh, which says it sources from MUIS), but they are not authoritative.
- For 15-30 restaurants, checking each outlet by hand against the official MUIS search is feasible and keeps "verified" honest.

### 4. Where CBD workers actually eat
- Lunch is dominated by hawker centres (Lau Pa Sat, Amoy Street Food Centre, Market Street) and food courts, not sit-down chains.
- Stall menus are rarely online, so menu data would come from site visits or photos, parsed by an LLM with vision.
- Hawker dishes (chicken rice, laksa, char kway teow) map directly onto SG FoodID entries. A "dish archetype with per-stall overrides" data model looks like the right fit.

## Decisions this suggests (to confirm in the spec)

1. Data model: `Dish -> archetype -> nutrients (value, unit, provenance, confidence)`.
2. Restaurant discovery: OpenStreetMap, plus manual curation of the first 15-30 venues.
3. Menu intake: manual collection (photos and websites) with LLM-assisted parsing, reviewed by a person before it goes live.
4. Halal: manual check against MUIS for each venue.

## Needed from you

1. **Open SG FoodID by hand** in a desktop browser. Tell me which nutrients show per item, whether there is a download button, and what the Terms of Use say about reuse. If reuse is not allowed, we write to HPB or build a smaller hand-keyed dataset from published research.
2. A first list of target venues (or I propose 15-30 and you edit).
3. Whether you want me to continue the spike on 5 venues once the database question is settled.
