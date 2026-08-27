from typing import Dict, List, Tuple, Any
import math


def validate_chart_input(chart: Dict) -> List[str]:
    required = ["dob", "tob", "pob", "ayanamsa", "house_system"]
    missing = [k for k in required if chart.get(k) is None]
    return missing


SIGNS = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
]


RULERS = {
    "Aries": "Mars",
    "Taurus": "Venus",
    "Gemini": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Virgo": "Mercury",
    "Libra": "Venus",
    "Scorpio": "Mars",
    "Sagittarius": "Jupiter",
    "Capricorn": "Saturn",
    "Aquarius": "Saturn",
    "Pisces": "Jupiter",
}


def sign_to_base_longitude(sign: str) -> float:
    try:
        idx = SIGNS.index(sign)
        return idx * 30.0
    except ValueError:
        raise ValueError(f"Unknown sign: {sign}")


def normalize_angle(angle: float) -> float:
    a = angle % 360.0
    if a < 0:
        a += 360.0
    return a


def get_longitude_from_entry(entry: Dict[str, Any]) -> float:
    """
    Accepts either:
    - entry['longitude'] as float degrees (0-360)
    - or entry['sign'] and entry['degree'] (0-30) to compute longitude
    """
    if entry is None:
        raise ValueError("Empty planet entry")
    if "longitude" in entry and entry["longitude"] is not None:
        return normalize_angle(float(entry["longitude"]))
    if "sign" in entry and "degree" in entry:
        base = sign_to_base_longitude(entry["sign"])
        return normalize_angle(base + float(entry["degree"]))
    raise ValueError("Planet entry must contain 'longitude' or ('sign' and 'degree')")


ASPECT_MAP = {
    # planet: list of aspect degrees relative to planet longitude (Vedic displacement)
    "Jupiter": [120, 180, 240],  # 5th(120), 7th(180), 9th(240)
    "Saturn": [60, 180, 270],    # 3rd(60), 7th(180), 10th(270)
    "Mars": [90, 180, 210],      # 4th(90), 7th(180), 8th(210)
    # Others have standard 7th (opposition)
}


def angular_distance(a: float, b: float) -> float:
    d = abs(a - b) % 360.0
    return min(d, 360.0 - d)


def compute_conjunctions(planets: Dict[str, Dict[str, Any]], max_deg: float = 6.0) -> List[Dict]:
    """Detect conjunctions within max_deg degrees (default 6°)."""
    names = list(planets.keys())
    conj = []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            p1 = names[i]
            p2 = names[j]
            try:
                lon1 = get_longitude_from_entry(planets[p1])
                lon2 = get_longitude_from_entry(planets[p2])
            except Exception:
                continue
            diff = angular_distance(lon1, lon2)
            if diff <= max_deg:
                conj.append({"pair": (p1, p2), "deg_diff": round(diff, 3), "lon1": lon1, "lon2": lon2})
    return conj


def compute_aspects(planets: Dict[str, Dict[str, Any]]) -> List[Dict]:
    """Compute which planets aspect which other planets based on classical rules."""
    aspect_results = []
    for pname, pdata in planets.items():
        try:
            lon = get_longitude_from_entry(pdata)
        except Exception:
            continue
        if pname in ASPECT_MAP:
            degs = ASPECT_MAP[pname]
            for d in degs:
                target_lon = normalize_angle(lon + d)
                # find planets within small orb (3 degrees) of target_lon
                for other, odata in planets.items():
                    if other == pname:
                        continue
                    try:
                        olon = get_longitude_from_entry(odata)
                    except Exception:
                        continue
                    if angular_distance(olon, target_lon) <= 3.0:
                        aspect_results.append({"from": pname, "to": other, "type_deg": d, "orb": round(angular_distance(olon, target_lon), 2)})
        else:
            # default 7th aspect (180°)
            target_lon = normalize_angle(lon + 180.0)
            for other, odata in planets.items():
                if other == pname:
                    continue
                try:
                    olon = get_longitude_from_entry(odata)
                except Exception:
                    continue
                if angular_distance(olon, target_lon) <= 3.0:
                    aspect_results.append({"from": pname, "to": other, "type_deg": 180, "orb": round(angular_distance(olon, target_lon), 2)})
    return aspect_results


EXALTATION = {
    "Sun": ("Aries", 0),
    "Moon": ("Taurus", 3),
    "Mars": ("Capricorn", 28),
    "Mercury": ("Virgo", 15),
    "Jupiter": ("Cancer", 5),
    "Venus": ("Pisces", 27),
    "Saturn": ("Libra", 20),
}


def compute_dignities(planets: Dict[str, Dict[str, Any]]) -> List[Dict]:
    """Check exaltation/debilitation and basic dignity from sign placement."""
    results = []
    for pname, pdata in planets.items():
        try:
            if "sign" in pdata and "degree" in pdata:
                sign = pdata["sign"]
                deg = float(pdata["degree"])
            else:
                # derive from longitude
                lon = get_longitude_from_entry(pdata)
                sign_idx = int(lon // 30)
                sign = SIGNS[sign_idx]
                deg = lon - sign_idx * 30
        except Exception:
            continue
        status = "Neutral"
        ex = EXALTATION.get(pname)
        if ex and ex[0] == sign:
            status = "Exalted"
        # Simple debilitation detection: opposite sign of exaltation
        if ex:
            exalt_idx = SIGNS.index(ex[0])
            deb_idx = (exalt_idx + 6) % 12
            if SIGNS[deb_idx] == sign:
                status = "Debilitated"
        results.append({"planet": pname, "sign": sign, "degree": round(deg, 3), "status": status})
    return results


def compute_house_positions(planets: Dict[str, Dict[str, Any]], lagna: Any = None, house_system: str = 'Whole') -> Dict[str, Dict[str, Any]]:
    """Compute house number (1-12) for each planet usingWhole Sign house system.
    `lagna` may be a sign string (e.g., 'Aries') or an object with 'sign' key.
    Returns mapping planet -> {house:int, sign:str, degree:float}
    """
    out = {}
    if not lagna:
        return {p: {"house": None} for p in planets.keys()}

    if isinstance(lagna, str):
        lagna_sign = lagna
    elif isinstance(lagna, dict) and "sign" in lagna:
        lagna_sign = lagna["sign"]
    else:
        lagna_sign = None

    if lagna_sign not in SIGNS:
        return {p: {"house": None} for p in planets.keys()}

    lagna_idx = SIGNS.index(lagna_sign)
    for p, data in planets.items():
        try:
            lon = get_longitude_from_entry(data)
            sign_idx = int(lon // 30) % 12
            house = ((sign_idx - lagna_idx) % 12) + 1
            deg = lon - sign_idx * 30
            out[p] = {"house": house, "sign": SIGNS[sign_idx], "degree": round(deg, 3)}
        except Exception:
            out[p] = {"house": None}
    return out


def house_number_to_sign(lagna_sign: str, house_number: int) -> str:
    if lagna_sign not in SIGNS:
        raise ValueError("Unknown lagna sign")
    lagna_idx = SIGNS.index(lagna_sign)
    sign_idx = (lagna_idx + house_number - 1) % 12
    return SIGNS[sign_idx]


def compute_bhava_lords(lagna: Any, planets: Dict[str, Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
    """Return bhava lords for houses 1..12 based on `lagna` sign.
    Output: {house_number: {"sign": sign, "ruler": planet_name}}
    """
    out = {}
    if not lagna:
        return {i: {"sign": None, "ruler": None} for i in range(1, 13)}
    if isinstance(lagna, dict) and "sign" in lagna:
        lagna_sign = lagna["sign"]
    elif isinstance(lagna, str):
        lagna_sign = lagna
    else:
        return {i: {"sign": None, "ruler": None} for i in range(1, 13)}

    for h in range(1, 13):
        try:
            sign = house_number_to_sign(lagna_sign, h)
            ruler = RULERS.get(sign)
            out[h] = {"sign": sign, "ruler": ruler}
        except Exception:
            out[h] = {"sign": None, "ruler": None}
    return out


def compute_house_strengths(houses: Dict[str, Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
    """Count planets per house and list occupants.
    Returns {house_number: {"count": int, "planets": [..]}}
    """
    out = {i: {"count": 0, "planets": []} for i in range(1, 13)}
    for p, info in (houses or {}).items():
        h = info.get("house")
        if isinstance(h, int) and 1 <= h <= 12:
            out[h]["count"] += 1
            out[h]["planets"].append(p)
    return out


def detect_raja_yoga(lagna: Any, houses: Dict[str, Dict[str, Any]]) -> List[Dict]:
    """Simple conservative Raja yoga detection based on kendra/trikona lord placement.
    - If a kendra lord is placed in a trikona (1,5,9) or vice versa, mark as candidate.
    """
    yogas = []
    if not lagna or not houses:
        return yogas
    # compute bhava lords
    bhava_lords = compute_bhava_lords(lagna, {})
    # gather kendra and trikona house numbers
    kendras = [1, 4, 7, 10]
    trikonas = [1, 5, 9]

    # map planet -> its house
    planet_house = {p: info.get("house") for p, info in houses.items()}

    # collect lords
    kendra_lords = set()
    trikona_lords = set()
    for h in kendras:
        lord = bhava_lords.get(h, {}).get("ruler")
        if lord:
            kendra_lords.add(lord)
    for h in trikonas:
        lord = bhava_lords.get(h, {}).get("ruler")
        if lord:
            trikona_lords.add(lord)

    # check placements
    for lord in kendra_lords:
        loc = planet_house.get(lord)
        if loc in trikonas:
            yogas.append({"name": "Raja Yoga Candidate", "evidence": {"lord": lord, "from": "kendra", "placed_in": loc}})
    for lord in trikona_lords:
        loc = planet_house.get(lord)
        if loc in kendras:
            yogas.append({"name": "Raja Yoga Candidate", "evidence": {"lord": lord, "from": "trikona", "placed_in": loc}})

    return yogas


def compute_basic_aspects(planets: Dict, lagna: Any = None, house_system: str = 'Whole') -> Dict:
    """Top-level convenience function returning conjunctions, aspects, dignities, houses, and other metrics."""
    conj = compute_conjunctions(planets)
    aspects = compute_aspects(planets)
    dign = compute_dignities(planets)
    graha_yuddha = compute_graha_yuddha(planets)
    shadbala = compute_shadbala(planets)
    houses = compute_house_positions(planets, lagna, house_system)
    candidate_yogas = compute_candidate_yogas(planets, conj, dign, houses)

    # Bhava lords and house strength metrics
    bhava_lords = compute_bhava_lords(lagna, planets)
    house_strengths = compute_house_strengths(houses)

    # Additional house-based yogas (e.g., Raja yoga candidates)
    raja_yogas = detect_raja_yoga(lagna, houses)

    return {
        "conjunctions": conj,
        "aspects": aspects,
        "dignities": dign,
        "graha_yuddha": graha_yuddha,
        "shadbala": shadbala,
        "houses": houses,
        "bhava_lords": bhava_lords,
        "house_strengths": house_strengths,
        "candidate_yogas": candidate_yogas,
        "raja_yogas": raja_yogas,
    }


def compute_graha_yuddha(planets: Dict[str, Dict[str, Any]], max_deg: float = 1.0) -> List[Dict]:
    """Detect Graha Yuddha (planetary war) when two planets are within max_deg degrees.
    Returns list of {pair, deg_diff, stronger, weaker} by degree distance (closer to exact conj considered stronger).
    """
    names = list(planets.keys())
    wars = []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            p1 = names[i]
            p2 = names[j]
            try:
                lon1 = get_longitude_from_entry(planets[p1])
                lon2 = get_longitude_from_entry(planets[p2])
            except Exception:
                continue
            diff = angular_distance(lon1, lon2)
            if diff <= max_deg:
                # closer to exact longitude is stronger
                if diff == 0:
                    stronger = p1
                    weaker = p2
                else:
                    stronger = p1 if diff < (max_deg/2) else p2
                    weaker = p2 if stronger == p1 else p1
                wars.append({"pair": (p1, p2), "deg_diff": round(diff, 4), "stronger": stronger, "weaker": weaker})
    return wars


def compute_shadbala(planets: Dict[str, Dict[str, Any]]) -> Dict[str, float]:
    """Simplified Shadbala approximation: sum small scores based on dignity status.
    Returns a map planet -> shadbala_score (arbitrary units).
    """
    scores = {}
    for p, data in planets.items():
        score = 0.0
        try:
            digns = compute_dignities({p: data})
            status = digns[0]["status"]
            if status == "Exalted":
                score += 2.0
            elif status == "Debilitated":
                score -= 2.0
            else:
                score += 0.5
            # slight bonus for exact degree numeric input (assumed stronger)
            if "degree" in data:
                score += 0.1
        except Exception:
            score = 0.0
        scores[p] = round(score, 3)
    return scores


def compute_candidate_yogas(planets: Dict[str, Dict[str, Any]], conjunctions: List[Dict], dignities: List[Dict], houses: Dict[str, Dict[str, Any]] = None) -> List[Dict]:
    """Detect a rich set of classical Vedic yogas based on planetary placements, conjunctions, dignities, and houses."""
    yogas = []
    
    # 1. Conjunction-based Yogas
    for c in conjunctions:
        a, b = c["pair"]
        pair_set = set([a, b])
        if pair_set == set(["Sun", "Mercury"]):
            yogas.append({
                "name": "Budhaditya Yoga (Sun-Mercury Conjunction)",
                "evidence": c,
                "note": "Enhances intelligence, analytical abilities, and leadership skills."
            })
        elif pair_set == set(["Sun", "Mars"]):
            yogas.append({
                "name": "Surya-Mangala Conjunction",
                "evidence": c,
                "note": "Gives ambition, high drive, and leadership potential."
            })
        elif pair_set == set(["Moon", "Jupiter"]):
            yogas.append({
                "name": "Gajakesari Yoga (Moon-Jupiter Conjunction)",
                "evidence": c,
                "note": "Brings wisdom, honor, prosperity, and magnetic reputation."
            })
        elif pair_set == set(["Venus", "Jupiter"]):
            yogas.append({
                "name": "Benefic Venus-Jupiter Conjunction",
                "evidence": c,
                "note": "Blesses with luxury, spirituality, wisdom, and creative talent."
            })
        elif pair_set == set(["Mercury", "Venus"]):
            yogas.append({
                "name": "Laksmi-Narayan Conjunction (Mercury-Venus)",
                "evidence": c,
                "note": "Brings refined aesthetic sense, eloquence, wealth, and artistic achievement."
            })

    # 2. House and Kendra/Trikona Based Yogas
    if houses:
        # Gajakesari Yoga by house distance (Moon & Jupiter in kendra to each other: 1, 4, 7, 10 houses apart)
        if "Moon" in planets and "Jupiter" in planets:
            h_m = houses.get("Moon", {}).get("house")
            h_j = houses.get("Jupiter", {}).get("house")
            if h_m and h_j:
                diff_h = (h_j - h_m) % 12
                if diff_h in [0, 3, 6, 9]:
                    if not any(y["name"].startswith("Gajakesari") for y in yogas):
                        yogas.append({
                            "name": "Gajakesari Yoga (Jupiter in Kendra from Moon)",
                            "evidence": {"moon_house": h_m, "jupiter_house": h_j},
                            "note": "Confers wisdom, public popularity, and long-lasting fame."
                        })

        # Pancha Mahapurusha Yogas (Mars, Mercury, Jupiter, Venus, Saturn in Own/Exalted sign & Kendra 1,4,7,10)
        p_rules = {
            "Mars": (["Aries", "Scorpio", "Capricorn"], "Ruchaka Yoga", "Bestows courage, leadership, power, and physical strength."),
            "Mercury": (["Gemini", "Virgo"], "Bhadra Yoga", "Grants high intellect, eloquence, scientific mindset, and longevity."),
            "Jupiter": (["Sagittarius", "Pisces", "Cancer"], "Hamsa Yoga", "Grants righteous nature, spiritual wisdom, grace, and noble status."),
            "Venus": (["Taurus", "Libra", "Pisces"], "Malavya Yoga", "Brings romantic fulfillment, artistic grace, luxury, and magnetic charisma."),
            "Saturn": (["Capricorn", "Aquarius", "Libra"], "Sasa Yoga", "Grants executive authority, perseverance, political wisdom, and disciplined success.")
        }

        for p_name, (valid_signs, yoga_name, desc) in p_rules.items():
            if p_name in planets and p_name in houses:
                h_num = houses[p_name].get("house")
                s_name = houses[p_name].get("sign")
                if h_num in [1, 4, 7, 10] and s_name in valid_signs:
                    yogas.append({
                        "name": f"Pancha Mahapurusha - {yoga_name}",
                        "evidence": {"planet": p_name, "house": h_num, "sign": s_name},
                        "note": desc
                    })

    return yogas

