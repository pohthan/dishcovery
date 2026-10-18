"""Load USDA FoodData Central SR Legacy and look up per-100g nutrients."""
import csv
from pathlib import Path

SR_DIR = (Path(__file__).resolve().parent.parent / "raw" / "fdc"
          / "FoodData_Central_sr_legacy_food_csv_2018-04"
          / "FoodData_Central_sr_legacy_food_csv_2018-04")

NUTRIENT_IDS = {
    "energy_kcal": "1008",
    "carbs_g": "1005",
    "sugar_g": "2000",
    "fiber_g": "1079",
    "sodium_mg": "1093",
    "potassium_mg": "1092",
    "phosphorus_mg": "1091",
}
_ID_TO_KEY = {v: k for k, v in NUTRIENT_IDS.items()}


def load_foods():
    with open(SR_DIR / "food.csv", newline="", encoding="utf-8") as f:
        return {r["fdc_id"]: r["description"] for r in csv.DictReader(f)}


def load_nutrients(fdc_ids=None):
    """Return {fdc_id: {nutrient_key: amount_per_100g}} for the tracked nutrients."""
    out = {}
    with open(SR_DIR / "food_nutrient.csv", newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            key = _ID_TO_KEY.get(r["nutrient_id"])
            if key is None or (fdc_ids is not None and r["fdc_id"] not in fdc_ids):
                continue
            out.setdefault(r["fdc_id"], {})[key] = float(r["amount"])
    return out


def search(foods, *words):
    words = [w.lower() for w in words]
    return [(i, d) for i, d in foods.items() if all(w in d.lower() for w in words)]
