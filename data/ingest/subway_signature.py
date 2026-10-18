"""Subway Singapore Signature Series (Dec 2024 product guide), transcribed from the official PDF.

Source: subwayisfresh.com.sg SG-Signature-Series-2025-Product-Guide.pdf
Columns: serving_g, kcal, carbs_g, sugar_g, sodium_mg (per serving), then per-100g kcal, carbs, sugar, sodium
used only to cross-check the transcription. A mismatch raises.
Usage: python subway_signature.py -> ../published/subway-signature.json
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "published" / "subway-signature.json"

# name, base, (serving_g, kcal, carbs, fibre, sugar, sodium), (kcal100, carbs100, sugar100, sodium100)
ROWS = [
    ("Beef & Mushroom Melt", "6-inch, shallot bread", (240, 513, 49.1, 3.4, 8.9, 1262), (214, 20.5, 3.7, 526)),
    ("Chicken & Mushroom Melt", "6-inch, shallot bread", (244, 477, 47.5, 3.2, 8.7, 1365), (196, 19.5, 3.6, 560)),
    ("Smoky BBQ Beef", "6-inch, shallot bread", (251, 517, 53.0, 4.0, 14.2, 1107), (206, 21.1, 5.6, 440)),
    ("Spicy Mexican Chicken", "6-inch, parmesan oregano bread", (282, 460, 48.5, 4.2, 10.1, 1290), (163, 17.2, 3.6, 458)),
    ("Beef & Mushroom Melt", "multigrain wrap", (231, 497, 38.3, 5.9, 8.0, 1267), (215, 16.6, 3.4, 549)),
    ("Chicken & Mushroom Melt", "multigrain wrap", (235, 462, 36.6, 5.7, 7.8, 1370), (197, 15.6, 3.3, 583)),
    ("Smoky BBQ Beef", "multigrain wrap", (242, 501, 42.1, 6.6, 13.3, 1112), (207, 17.4, 5.5, 459)),
    ("Spicy Mexican Chicken", "multigrain wrap", (275, 456, 39.6, 6.6, 10.2, 1334), (166, 14.4, 3.7, 484)),
    ("Beef & Mushroom Melt", "flatbread", (253, 542, 50.9, 2.9, 7.2, 1261), (214, 20.1, 2.9, 499)),
    ("Chicken & Mushroom Melt", "flatbread", (257, 507, 49.3, 2.7, 7.1, 1363), (197, 19.2, 2.8, 531)),
    ("Smoky BBQ Beef", "flatbread", (264, 546, 54.8, 3.6, 12.5, 1105), (207, 20.7, 4.7, 418)),
    ("Spicy Mexican Chicken", "flatbread", (297, 501, 52.3, 3.7, 9.5, 1327), (169, 17.6, 3.2, 446)),
]


def check(name, base, serving, per100):
    g, kcal, carbs, _fibre, sugar, sodium = serving
    k100, c100, s100, n100 = per100
    for label, got, per in (("kcal", kcal, k100), ("carbs", carbs, c100), ("sugar", sugar, s100), ("sodium", sodium, n100)):
        expected = g * per / 100
        if abs(expected - got) > max(0.05 * got, 2):
            raise ValueError(f"{name} ({base}) {label}: {got} vs {expected:.1f} from per-100g")


def main():
    items = []
    for name, base, serving, per100 in ROWS:
        check(name, base, serving, per100)
        g, kcal, carbs, fibre, sugar, sodium = serving
        items.append({
            "name": f"{name} ({base})",
            "serving_g": g,
            "per_serving": {"energy_kcal": kcal, "carbs_g": carbs, "fiber_g": fibre, "sugar_g": sugar, "sodium_mg": sodium},
            "vegetarian": False,
        })
    OUT.write_text(json.dumps({
        "source": "Subway Singapore Dec 2024 Product Guide, Signature Series (subwayisfresh.com.sg)",
        "scope": "Signature Series promotional subs only, as built in the guide; not the standard menu",
        "items": items,
    }, indent=1), encoding="utf-8")
    print(f"wrote {len(items)} subs, all rows consistent with per-100g values")


if __name__ == "__main__":
    main()
