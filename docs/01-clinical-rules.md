# Clinical Rules (DRAFT: needs dietitian review before any public release)

Scope for v1: **chronic kidney disease (CKD), diabetes, hypertension**, plus **halal** and **vegetarian** filters.
Food allergies are explicitly **out of scope** and the app must say so.

## 1. Principle: the app only applies limits it can source

The guidelines checked in this pass do **not** set universal numeric limits for every nutrient we care about. Potassium, phosphorus and per-meal carbohydrate are individualised by a clinician. So:

| Nutrient | Guideline-backed preset? | Behaviour in app |
|---|---|---|
| Sodium | Yes | Preset available, user can override |
| Potassium (CKD) | No: individualised to serum levels | **No preset.** User enters limit from their care team, otherwise the rule is off |
| Phosphorus (CKD) | No: individualised to serum levels | **No preset.** Same as above |
| Carbohydrate / sugar (diabetes) | No per-meal number found | **No preset.** User enters a per-meal target, otherwise the rule is off |
| Halal | n/a | Verified status from MUIS certification |
| Vegetarian | n/a | Based on dish ingredients, labelled with confidence |

This changes the earlier kickoff answer ("presets with editable override"). Presets exist only where a source supports them.

## 2. Verified sources (found in this pass)

| Claim | Source |
|---|---|
| Singapore recommended sodium limit is 2,000 mg/day (aligned with WHO) | HealthHub / SNDA joint position statement on Singapore's sodium reduction strategy |
| Adults with CKD stages 3-5 / 5D: limit sodium to under 2.3 g/day (100 mmol/day) | KDOQI Clinical Practice Guideline for Nutrition in CKD, 2020 update |
| Potassium and phosphorus for CKD: adjust to keep serum levels in normal range, individualised, no fixed absolute target | KDOQI 2020 update |
| People with diabetes: limit sodium to under 2,300 mg/day; individualised nutrition therapy via a registered dietitian | ADA Standards of Care (nutrition therapy section) |

Links are in the research notes of the chat session; re-verify each against the primary document before the dietitian review.

## 3. Derived values (our arithmetic, NOT a guideline)

For a lunch-sized meal we treat roughly one third of the daily budget as the per-meal ceiling:

- Sodium, Singapore preset: 2,000 mg/day, so about **667 mg per meal**.
- Sodium, ADA/KDOQI ceiling: 2,300 mg/day, so about **767 mg per meal**.

These are marked "derived" in code and UI. The dietitian should confirm or replace them.

## 4. Matching and wording rules

1. Never use the word "safe". Use "matches your limits" or "within your limits (estimated)".
2. ~~Every nutrient figure shows its provenance and confidence.~~ **Changed 2026-10-18 at the project owner's request:** the website no longer shows a confidence or source label on dishes. The data still records provenance and confidence for each value (in the API and the sheet). The page-level note that figures are estimates and not medical advice remains.
3. A dish is excluded when a nutrient the user has an active limit on is unknown. The UI says why it was excluded.
4. Nutrient figures are shown with a "~" and are described as estimates in the page-level disclaimer; they are never presented as exact. (Per-dish "Estimate" labels were removed, see rule 2.)
5. Halal is shown as verified only when the outlet appears in the MUIS certified list; otherwise it is "unverified".
6. A non-dismissible note says the app does not replace advice from the user's care team and does not cover food allergies.
7. Coupons never affect ranking or inclusion.

## 5. Open items for the dietitian

- Confirm or replace the derived per-meal sodium ceilings.
- Advise on a sensible default or guidance text for per-meal carbohydrate (diabetes).
- Advise whether potassium/phosphorus rules should be restricted to users who enter limits.
- Review wording, exclusion behaviour and disclaimers.
- Advise how to treat sugary drinks and sauces/gravy, which dominate sodium and sugar in local dishes.
