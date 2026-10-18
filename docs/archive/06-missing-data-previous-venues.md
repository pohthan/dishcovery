# Venues With Missing Data, and What They Serve

Compiled 2026-10-06. Demo data has been removed: the app now serves only real venues, MUIS halal stalls, the official Toast Box drinks panel, and the dishes below. A dish without HPB numbers has **no nutrients**, so the app excludes it for anyone with an active limit ("Not enough nutrient data").

## How to fill in the HPB numbers

1. Open `data/hpb/hpb-foods.csv` in Excel. Each row is one food to look up. `key` and `search_term` are filled in. The last column says which venues use it.
2. Search `search_term` in SG FoodID. Pick the closest item and fill in: `hpb_item_name`, `serving_description` (for example "1 plate"), `serving_g`, and every nutrient column SG FoodID shows (energy, carbs, sugar, fibre, sodium, potassium, phosphorus).
3. Set `hpb_source_type` to `lab`, `database` or `recipe`, matching the "source of data" SG FoodID shows. Put its last-updated date in `hpb_last_updated`.
4. Leave a nutrient cell **blank** if SG FoodID does not show it. Blank means unknown. Do not enter 0.
5. Save as CSV (UTF-8). Tell me, and I will load it. A half-filled row (item name but no serving or no numbers) makes the app refuse to start, on purpose, so mistakes cannot slip through.

Rows marked OPTIONAL are for venues whose menu is not confirmed yet (sandwiches, salads, Pad Thai).

## Venues and the dishes they serve

"Evidence" says how sure I am the dish is on the menu: **Official** (the restaurant's own site), **Page** (a third-party page I read), **Name only** (inferred from the stall name, so not imported).

### Halal-certified stalls (MUIS, checked 2026-10-05)

| Venue | Dishes | Evidence | HPB keys | Still missing |
|---|---|---|---|---|
| Ipoh Hainanese Chicken Rice (Lau Pa Sat, S14) | Chicken rice (steamed or roasted); shredded chicken and prawn Ipoh hor fun. Also listed: chicken curry, chicken soup, vegetable sides | Page | `chicken-rice`, `hor-fun-with-gravy` | Sides and curry not imported |
| Thunder Tea Rice X Thunder Spize (Lau Pa Sat, S54) | Thunder tea rice (lei cha). A blog also mentions chicken katsu, noodles, fried rice | Page (lei cha); vague (others) | `lei-cha-rice` | Real menu, other dishes |
| Hong Kong Street Live BBQ Seafood (Lau Pa Sat, S51-53) | Chilli crab, black pepper crab, cereal prawn, sambal stingray, salted egg squid, deep fried bee hoon with shrimp. Also on the brand page: chilli crab with bun, butter mantis prawn, steamed scallops with vermicelli, dried prawn French bean | Page (brand site, not this outlet) | `chilli-crab`, `black-pepper-crab`, `cereal-prawn`, `sambal-stingray`, `salted-egg-squid`, `bee-hoon-fried-shrimp` | Outlet menu; portion sizes vary (by weight) |
| BBQ Chicken Wing & Western Cuisine (Lau Pa Sat, S69) | BBQ chicken wings. A listing also mentions pizza, soups, salads, spaghetti, Texas fried chicken, hot dogs | Page (wings only) | `chicken-wings-bbq` | Everything except the wings |
| Munchi Pancakes (Lau Pa Sat, S61) | Min jiang kueh (original, charcoal, green tea skins; red bean, peanut, Biscoff, black sesame). Munchi pancake (Thai milk tea, strawberry cheese, Oreo cheese). Mini Munchi | Page (other outlets' prices) | `min-jiang-kueh-red-bean`, `min-jiang-kueh-peanut` | Pancake sandwiches, Mini Munchi |
| Creme & Cone (Lau Pa Sat) | Gelato (16 flavours, for example pistachio, butter kopi), cones (Milo crunch, bandung), waffle pops | Page (dated 2020) | `gelato` | Flavour-level data (sugar varies a lot) |
| Ming Yen BBQ & Seafood (Lau Pa Sat, S67-68) | Seafood (crab, prawns, clams, fish, squid) with fried rice, mee goreng, bee hoon, satay, soup or vegetables | Listing only | none | **Needs menu photo** |
| Manna (Amoy Street, S71) | Build-your-own grain bowl: base, 4 sides, protein, dressing | Page (concept only) | none | **Needs ingredient list**; cannot map to one HPB food |
| Fortune Popiah (Maxwell, S101) | Popiah | **Official** | `popiah` | Other items (kueh pie tee is a company product, not confirmed at the stall) |

### Chains

| Venue | Dishes | Evidence | HPB keys | Still missing |
|---|---|---|---|---|
| Toast Box (Phillip St, Cheang Wan Seng Pl) | Kaya toast set, laksa, nasi lemak set. **Drinks: done** from the official nutrition panel (23 drinks) | Page (food) | `kaya-toast`, `soft-boiled-egg`, `kopi`, `laksa`, `nasi-lemak` | Full food menu; what a set contains |
| Ya Kun Kaya Toast (Telegraph St, Chulia St) | Kaya toast set A (toast, 2 soft-boiled eggs, kopi) | Page | `kaya-toast`, `soft-boiled-egg`, `kopi` | Everything else on the menu |
| SaladStop! (Market Street) | Salads, wraps, protein bowls, warm bowls, create-your-own, smoothies, acai bowls. Items seen: Hail Caesar (413 kcal), Tuna San (375 kcal) | Page (categories, 2 items) | OPTIONAL `caesar-salad-chicken`, `tuna-salad` | Item list, sodium and carbs (site shows calories only) |

### Food centres (no dish data yet)

| Venue | What is known | Still missing |
|---|---|---|
| Lau Pa Sat | 7 halal stalls above. A blog also lists halal satay and mee soto stalls that MUIS search did not return | Every other stall's menu |
| Amoy Street Food Centre | 1 halal stall (Manna) | Every other stall |
| Maxwell Food Centre | 1 halal stall (Fortune Popiah). A guide lists halal Pakistani Dum Biryani (#01-69) and Sultan Kebab (#01-86), not returned by my MUIS search | Those two need verifying; every other stall |
| Market Street Hawker Centre | Nothing | All stalls |

Food-centre venues stay "halal unverified": only individual stalls are certified.

## Conflicts I found (the newer, official source wins)

- **Hong Kong Street** and **Creme & Cone**: blogs say not halal-certified, but MUIS lists both (certificates from 2024 and 2025). Blogs are older. MUIS is used.
- **Thunder Tea Rice** stall number: a blog says #25, MUIS says Stall 54. MUIS is used.
- The MUIS search is **not exhaustive** (see Maxwell and Lau Pa Sat above), so "halal unverified" does not mean "not halal".

## What I need to do next with your data

Once the CSV has numbers, I load it (no code changes needed) and confirm which dishes now show nutrient figures. Any dish whose keys are still blank stays excluded for users with limits.
