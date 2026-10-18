"""Sum FDC ingredient nutrients per dish.

Usage: python estimate.py [dishes.json out_dir]
Defaults to dishes.json and this folder. Writes estimates.csv and estimates.json.
"""
import csv
import json
import sys
from pathlib import Path
from fdc import load_foods, load_nutrients, NUTRIENT_IDS

HERE = Path(__file__).resolve().parent
SALT_NA_MG_PER_100G = 39340.0
KEYS = list(NUTRIENT_IDS)


def ingredient_per_100g(ref, nutrients):
    if ref == "salt":
        return {"sodium_mg": SALT_NA_MG_PER_100G}
    return nutrients[str(ref)]


def estimate_dish(dish, nutrients):
    totals = {k: 0.0 for k in KEYS}
    grams = 0.0
    for _label, ref, g in dish["ingredients"]:
        per100 = ingredient_per_100g(ref, nutrients)
        grams += g
        for k in KEYS:
            totals[k] += per100.get(k, 0.0) * g / 100.0
    return grams, totals


def main(dishes_path=HERE / "dishes.json", out_dir=HERE):
    dishes = json.loads(Path(dishes_path).read_text(encoding="utf-8"))["dishes"]
    ids = {str(r[1]) for d in dishes for r in d["ingredients"] if r[1] != "salt"}
    foods = load_foods()
    missing = [i for i in ids if i not in foods]
    if missing:
        raise SystemExit(f"Unknown fdc_ids: {missing}")
    nutrients = load_nutrients(ids)
    records = []
    with open(Path(out_dir) / "estimates.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["dish", "serving_g"] + KEYS)
        for d in dishes:
            grams, t = estimate_dish(d, nutrients)
            w.writerow([d["name"], round(grams)] + [round(t[k], 1) for k in KEYS])
            records.append({"name": d["name"], "servingGrams": round(grams), "nutrients": {k: round(t[k], 1) for k in KEYS}})
    (Path(out_dir) / "estimates.json").write_text(json.dumps(records, indent=1), encoding="utf-8")
    print(f"wrote {len(dishes)} dishes")


if __name__ == "__main__":
    if len(sys.argv) == 3:
        main(sys.argv[1], sys.argv[2])
    else:
        main()
