import os
import sys
from pathlib import Path

# Ensure repository root is on sys.path for direct test runs
ROOT = str(Path(__file__).resolve().parents[2])
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from backend.astrology.utils import compute_bhava_lords, compute_house_positions, compute_house_strengths, detect_raja_yoga, compute_basic_aspects


def test_bhava_lords_basic():
    bh = compute_bhava_lords("Aries", {})
    assert isinstance(bh, dict)
    assert bh[1]["ruler"] == "Mars"
    assert bh[5]["ruler"] == "Sun"


def test_house_positions_and_strengths():
    planets = {
        'Sun': {'sign': 'Aries', 'degree': 10},
        'Moon': {'sign': 'Taurus', 'degree': 3},
        'Mars': {'sign': 'Capricorn', 'degree': 28},
        'Saturn': {'longitude': 180}
    }
    houses = compute_house_positions(planets, {'sign': 'Aries'}, 'Whole')
    strengths = compute_house_strengths(houses)
    assert houses['Sun']['house'] == 1
    assert strengths[1]['count'] == 1


def test_detect_raja_yoga_via_basic_aspects():
    planets = {
        'Sun': {'sign': 'Aries', 'degree': 10},
        'Moon': {'sign': 'Taurus', 'degree': 3},
        'Mars': {'sign': 'Capricorn', 'degree': 28},
        'Saturn': {'longitude': 180}
    }
    computed = compute_basic_aspects(planets, {'sign': 'Aries'}, 'Whole')
    # Expect raja_yogas key to be present and contain candidates
    assert 'raja_yogas' in computed
    assert isinstance(computed['raja_yogas'], list)


if __name__ == '__main__':
    test_bhava_lords_basic()
    test_house_positions_and_strengths()
    test_detect_raja_yoga_via_basic_aspects()
    print('OK')
