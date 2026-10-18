"""CLI: python search.py word [word...]  -> matching FDC ids and descriptions."""
import sys
from fdc import load_foods, search

if __name__ == "__main__":
    for fdc_id, desc in search(load_foods(), *sys.argv[1:])[:25]:
        print(fdc_id, desc)
