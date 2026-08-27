import json
import sys
from pathlib import Path

ROOT = str(Path(__file__).resolve().parents[2])
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from backend.astrology.utils import compute_basic_aspects


def test_compute_basic_aspects():
    planets = {
        'Sun': {'sign': 'Aries', 'degree': 10},
        'Moon': {'sign': 'Taurus', 'degree': 3},
        'Mars': {'sign': 'Capricorn', 'degree': 28},
        'Saturn': {'longitude': 180}
    }

    res = compute_basic_aspects(planets, lagna={"sign": "Aries"})
    assert res is not None
    assert "conjunctions" in res
    assert "aspects" in res
    assert "dignities" in res
    assert "houses" in res
    assert "candidate_yogas" in res

