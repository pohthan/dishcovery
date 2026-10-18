# Where to Upload Menus and Nutrition

## The one file

**`data/upload/dishes.csv`**. Open it in Excel, fill it in, save it as CSV (UTF-8), and restart the API (or redeploy). That is the only file you need to edit.

One row per dish. The nutrients go on the same row as the dish. Rows for the places below are already in the file.

## What is in the sheet now

Exactly 10 dishes, one row each, across the stalls near SMU.

| Place | Dish | Numbers | Where the dish name comes from |
|---|---|---|---|
| Prince Noodles | Signature noodles, soup | filled | Eatbook SMU guide |
| Prince Noodles | Signature noodles, dry | filled | Eatbook SMU guide |
| Pasta Express | Pasta with tomato sauce | filled | Eatbook SMU guide |
| Pasta Express | Pasta with cream sauce | filled | Eatbook SMU guide |
| Pasta Express | Pasta aglio olio | filled | Eatbook SMU guide |
| Open Kitchen by Prata Alley | Egg prata | **needed** | Prata Alley brand menu page (prata-alley.com). Marked unverified because the SMU stall's own menu is not confirmed |
| Indo Express Punggol | Nasi uduk | **needed** | halalboleh listing (brand menu from other outlets) |
| Supergreen | Teriyaki chicken bowl | **needed** | Eatbook SMU guide, SMU outlet #01-06 |
| Haus Ban Mian & Fish Soup | Ban mian, soup | **needed** | **Inferred from the stall's registered name.** No menu page found for this outlet |
| Selesa Enak Chicken Rice | Hainanese chicken rice | **needed** | A listing names this dish for the Koufu chicken rice stalls including SMU. This stall's own menu is not confirmed |

### The 5 HPB searches still to do

| Row | Search SG FoodID for |
|---|---|
| Egg prata | Roti prata, egg |
| Nasi uduk | Nasi uduk or coconut rice |
| Teriyaki chicken bowl | Teriyaki chicken rice / chicken rice bowl |
| Ban mian, soup | Ban mian, soup (you already used this for Prince Noodles) |
| Hainanese chicken rice | Chicken rice |

### Not in the sheet

King Kong Curry and Ying Thai have no row: I could not confirm a dish for either from a page I could read. A listing for another Thai stall (Thailand Street Food) shows up at Ying Thai's unit, so I did not use its dishes. Supergreen's second bowl (Smoked Duck Bowl) and Open Kitchen's other items were left out to stay at 10.

The sheet is limited to **10 dishes in total**, so adding a dish means removing one. The app refuses to start with an 11th and says how many to remove (`MAX_DISHES` in `src/backend/scripts/dish-sheet.ts`). Removed so far: `data/archive/upload/dropped-dishes.csv`.

## Adding a dish for a place that has no row

Copy a row, then set `venue_id` and `venue_name` to **exactly** one of these (the app checks they match):

| venue_id | venue_name | Where |
|---|---|---|
| `smu-king-kong-curry` | King Kong Curry | SMU Connexion #01-04 |
| `smu-ying-thai` | Ying Thai | SMU Connexion #01-05 |

Any other place already has a row in the sheet: copy that row. The food courts themselves (Koufu, SMU Connexion Food Court) take no dishes.

## What to fill in

| Column | What to put | Required |
|---|---|---|
| `venue_id`, `venue_name` | Already filled. **Do not edit them**: the app checks they match and refuses to start if not | already done |
| `dish_name` | The dish as the stall names it. **Leave blank to skip the row.** To add a dish, copy a row for that place and change this | yes |
| `vegetarian` | `yes`, `no`, or blank if unsure | no |
| `menu_source` | `restaurant` if it comes from the stall's own menu board or site, `third_party` if from a blog or listing | yes |
| `menu_source_url` | A link if you have one | no |
| `serving_description` | For example "1 bowl" | no |
| `serving_g` | Weight of one serving in grams | **yes, if any nutrient is filled** |
| `energy_kcal`, `carbs_g`, `sugar_g`, `fiber_g`, `sodium_mg`, `potassium_mg`, `phosphorus_mg` | The numbers for one serving. **Leave blank if unknown. Never enter 0 for unknown** | no |
| `nutrient_source` | `SGFoodID` is fine. Better: `hpb_lab`, `hpb_database` or `hpb_recipe` (the "source of data" SG FoodID shows on the item), which records a higher confidence in the data. Or `restaurant` if the stall published the numbers | **yes, if any nutrient is filled** |
| `hpb_item_name` | The SG FoodID item you used, for the record | **yes, for HPB sources** |
| `notes` | Anything else | no |

How the app uses it:

- A dish with no nutrients stays on screen as "cannot be checked yet" and is never matched or called close.
- The website no longer shows a confidence label on dishes. `nutrient_source` is still recorded, so the confidence can be shown again later.
- A dish only counts as vegetarian if you wrote `yes`.

## Mistakes stop the app starting, and say which row

For example: a misspelt `venue_id`, a dish on a food court, a nutrient with no `serving_g`, HPB numbers with no `hpb_item_name`, a number that isn't a number, or the same dish twice at one place. Fix the row it names and restart.

## One thing not to rename

One demo coupon points at a specific dish: "Signature handmade noodles, dry (ban mian, you mian or mee hoon kueh)" at Prince Noodles. If you rename that dish, the coupons demo page shows an error (the search still works). Tell me and I will update the coupon.

## Not covered (for later)

SMU's directory lists more outlets (Subway, Snappy Bowls, Nature Café and others). I left them out to keep this to 10 places or fewer. Subway has official nutrition numbers already (`docs/05-chain-data-findings.md`), so it is the easiest to add if you want a 10th.

Earlier files are archived in `data/archive/`: the old HPB keyed sheet and menu file (nothing in them was filled in).
