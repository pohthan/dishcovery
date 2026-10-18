"""Parse the Toast Box Dec 2023 nutrition PDF (beverages) by table position.

Usage: python toastbox.py  -> writes ../published/toastbox-beverages.json
Every table is validated: per-serving must equal serving_ml * per_100ml / 100 (within rounding).
A mismatch raises, so a mis-assigned row can never be written out silently.
"""
import json
import re
from pathlib import Path

import pymupdf

HERE = Path(__file__).resolve().parent
PDF = HERE.parent / "raw" / "chains" / "toastbox-nip-2023-12.pdf"
OUT = HERE.parent / "published" / "toastbox-beverages.json"

LABELS = {
    "Energy": "energy_kcal",
    "Carbohydrate": "carbs_g",
    "Total Sugar": "sugar_g",
    "Dietary Fibre": "fiber_g",
    "Sodium": "sodium_mg",
}
TITLE = re.compile(r"^(?P<name>.+?) \((?P<size>10oz|Cold)\)$")
NUM = re.compile(r"^\d+(\.\d+)?$")


def titles(page):
    found = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = "".join(s["text"] for s in line["spans"]).strip()
            m = TITLE.match(text)
            if m:
                x0, y0 = line["bbox"][0], line["bbox"][1]
                found.append((x0, y0, m["name"], m["size"]))
    return found


def table_words(words, x0, y0, next_y):
    return [w for w in words if x0 - 15 <= w[0] < x0 + 520 and y0 <= w[1] < next_y]


def row_numbers(words, label_words):
    """Numbers to the right of a label on the same text line, left to right."""
    y = label_words[0][1]
    right = max(w[2] for w in label_words)
    row = [w for w in words if abs(w[1] - y) < 4 and w[0] > right and NUM.match(w[4])]
    return [float(w[4]) for w in sorted(row, key=lambda w: w[0])]


def find_label(words, label):
    parts = label.split()
    for i, w in enumerate(words):
        if w[4] == parts[0] and [x[4] for x in words[i : i + len(parts)]] == parts:
            return words[i : i + len(parts)]
    return None


def parse_table(words, name, size):
    serving_ml = float(re.search(r"Serving Size: (\d+(?:\.\d+)?) ml", " ".join(w[4] for w in words))[1])
    per_serving, per_100 = {}, {}
    for label, key in LABELS.items():
        found = find_label(words, label)
        if found is None:
            raise ValueError(f"{name}: label {label!r} not found")
        nums = row_numbers(words, found)
        if len(nums) != 2:
            raise ValueError(f"{name}: expected 2 numbers for {label}, got {nums}")
        per_serving[key], per_100[key] = nums
    return {"name": f"{name} ({size})", "serving_ml": serving_ml, "per_serving": per_serving, "per_100ml": per_100}


def validate(item):
    for key, per_100 in item["per_100ml"].items():
        expected = item["serving_ml"] * per_100 / 100
        actual = item["per_serving"][key]
        tolerance = max(0.06 * max(expected, actual), 3 if key == "sodium_mg" else 1.0)
        if abs(expected - actual) > tolerance:
            raise ValueError(f"{item['name']} {key}: serving {actual} vs {expected:.1f} from per-100ml")


def main():
    doc = pymupdf.open(PDF)
    items = []
    for page in doc:
        ts = sorted(titles(page), key=lambda t: (t[1], t[0]))
        words = page.get_text("words")
        for x0, y0, name, size in ts:
            below = [t[1] for t in ts if t[1] > y0 + 50 and abs(t[0] - x0) < 100]
            next_y = min(below) - 5 if below else page.rect.height
            item = parse_table(table_words(words, x0, y0, next_y), name, size)
            validate(item)
            items.append(item)
    OUT.write_text(json.dumps({
        "source": "Toast Box Nutrition Information Panel, December 2023 (toastbox.com.sg, retrieved via web.archive.org 2026-10-05)",
        "scope": "Beverages only",
        "items": items,
    }, indent=1), encoding="utf-8")
    print(f"wrote {len(items)} beverages")


if __name__ == "__main__":
    main()
