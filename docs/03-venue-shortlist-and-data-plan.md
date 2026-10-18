# Revised Data Plan and Venue Shortlist

## 1. Nutrient data plan (SG FoodID cannot be downloaded)

**Decision:** build our nutrient base from **USDA FoodData Central (FDC)**, which is public domain (CC0), downloadable in bulk, and lists sodium, potassium, phosphorus, carbohydrate and sugar for ingredients.

Pipeline for each dish:

1. An LLM breaks the dish into ingredients with estimated gram weights (a "recipe decomposition"). A person reviews it.
2. We match each ingredient to an FDC entry and sum the nutrients.
3. The result is stored as `value + unit + provenance: "estimated-from-ingredients" + confidence`.
4. Every dish with an active user limit shows "estimated".

**Validation (the real test of the spike):** hand-look-up about 20 dishes in SG FoodID (viewing only, nothing copied or stored) and compare against our estimates. This gives a measured error rate per nutrient, which tells us whether the approach is good enough and what to disclose in the UI.

**Known weaknesses:** FDC is US ingredient data, and gravies, sauces and cooking oil dominate sodium in local dishes. Expect larger errors on sodium than on carbohydrate. Potassium and phosphorus are the weakest, which is another reason those rules only run when the user enters limits.

**Parallel track:** a short email to HPB asking about permitted reuse of SG FoodID data. If they say yes, SG FoodID becomes the preferred source and FDC the fallback. Draft below.

### Draft email to HPB (for you to send)

> Subject: Enquiry on reuse of SG FoodID nutrient data in a non-commercial dietary app prototype
>
> Hello,
>
> We are building a prototype web app for working adults with kidney disease, diabetes or hypertension, to help them find nearby meals within their dietary limits. We would like to use SG FoodID values for sodium, potassium, phosphorus, carbohydrate and sugar for common Singapore dishes, with HPB credited as the source.
>
> Could you advise whether (1) the data may be reused in an app, (2) a bulk export or API is available, and (3) any attribution or licensing requirements apply?
>
> Thank you.

## 2. Venue shortlist (proposal, needs verification)

I compiled this from general knowledge and search results, and I have **not** verified that each venue exists, is open, or has the halal status marked. The "Halal" column is deliberately empty: every entry must be checked against the MUIS directory before it is shown as verified.

Selection rule: spread across cuisines and price points, mostly within walking distance of Raffles Place and Bras Basah/SMU, and include places where healthy-limit choices realistically exist.

### Tier A: chains with online menus (data via the web, no site visit)

| # | Venue | Area | Why | Halal |
|---|---|---|---|---|
| 1 | SaladStop! | Raffles Place / CBD | Publishes calories; many low-sodium and low-carb options | check |
| 2 | The Soup Spoon | CBD / City Hall | Soups and set meals, nutrition possibly published | check |
| 3 | Subway | CBD / Bugis | Build-your-own, ingredient-level data | check |
| 4 | Collin's | CBD | Western set meals, higher sodium contrast | check |
| 5 | Toast Box or Ya Kun | CBD / Bugis | Local breakfast and kopi, very common for workers | check |
| 6 | Pastamania | CBD / Bugis | Pasta, tests carbohydrate-heavy dishes | check |
| 7 | A yong tau foo chain | CBD / Bugis | Customisable broth-based meals | check |
| 8 | A Korean or Japanese rice-bowl chain | CBD | Cuisine variety, sodium-heavy sauces | check |

### Tier B: CBD food centres (menus from your photos; 2 to 3 stalls each)

| # | Venue | Stalls to pick on site |
|---|---|---|
| 9 | Lau Pa Sat | A chicken rice stall, a fish soup stall, a Indian or Malay stall |
| 10 | Amoy Street Food Centre | A noodle stall, a mixed-rice (cai png) stall |
| 11 | Market Street Hawker Centre | A mixed-rice stall, a soup stall |
| 12 | Maxwell Food Centre | A chicken rice stall, a porridge stall |

### Tier C: SMU / Bras Basah / Bugis area

| # | Venue | Why |
|---|---|---|
| 13 | SMU campus food outlets | Closest to the stated focus area |
| 14 | Bugis Junction food court | Variety in one place |
| 15 | Albert Centre Market & Food Centre | Hawker food near SMU |
| 16 | A Muslim-owned or MUIS-certified outlet in the area | Gives halal verification a real positive case |

That is 16 venues (8 chains, 4 food centres with about 9 stalls, 4 in the SMU area). Edit the list freely.

## 3. What you need to do

| # | Task | When | Effort |
|---|---|---|---|
| 1 | Send the HPB email above (optional but recommended) | Now | 5 min |
| 2 | Approve downloading the USDA FoodData Central bulk CSV (public domain, a few tens of MB; I will state the exact file and size before downloading) | Now | 1 reply |
| 3 | Edit the venue list: delete, add, swap | Now | 10 min |
| 4 | Look up about 20 listed dishes in SG FoodID and record sodium, carbohydrate, sugar (I will give you the dish list and a table to fill in) | After step 2 | 30 min |
| 5 | Photograph menus (and prices) for the Tier B stalls you choose | Before data entry | One lunch trip |

**Things I will do:** run the MUIS halal check for each venue, decompose and estimate dishes for 5 venues, and write the spike results and error rates.

The Anthropic API key for LLM parsing will only be needed at build time. It comes out of your $100 credit and goes in a local `.env` file that I will never commit.
