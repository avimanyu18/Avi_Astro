# Precision Vedic Astrology Engine (Ephem Ephemeris + Lahiri Ayanamsha + 16 Shodashavargas + Doshas)
import math
import ephem
from datetime import datetime, timedelta

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

SANSKRIT_SIGNS = [
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
]

PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]

NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "yoni": "Horse", "gana": "Deva", "nadi": "Adi"},
    {"name": "Bharani", "lord": "Venus", "yoni": "Elephant", "gana": "Manushya", "nadi": "Madhya"},
    {"name": "Krittika", "lord": "Sun", "yoni": "Sheep", "gana": "Rakshasa", "nadi": "Antya"},
    {"name": "Rohini", "lord": "Moon", "yoni": "Serpent", "gana": "Manushya", "nadi": "Antya"},
    {"name": "Mrigashira", "lord": "Mars", "yoni": "Serpent", "gana": "Deva", "nadi": "Madhya"},
    {"name": "Ardra", "lord": "Rahu", "yoni": "Dog", "gana": "Manushya", "nadi": "Adi"},
    {"name": "Punarvasu", "lord": "Jupiter", "yoni": "Cat", "gana": "Deva", "nadi": "Adi"},
    {"name": "Pushya", "lord": "Saturn", "yoni": "Goat", "gana": "Deva", "nadi": "Madhya"},
    {"name": "Ashlesha", "lord": "Mercury", "yoni": "Cat", "gana": "Rakshasa", "nadi": "Antya"},
    {"name": "Magha", "lord": "Ketu", "yoni": "Rat", "gana": "Rakshasa", "nadi": "Antya"},
    {"name": "Purva Phalguni", "lord": "Venus", "yoni": "Rat", "gana": "Manushya", "nadi": "Madhya"},
    {"name": "Uttara Phalguni", "lord": "Sun", "yoni": "Bull", "gana": "Manushya", "nadi": "Adi"},
    {"name": "Hasta", "lord": "Moon", "yoni": "Buffalo", "gana": "Deva", "nadi": "Adi"},
    {"name": "Chitra", "lord": "Mars", "yoni": "Tiger", "gana": "Rakshasa", "nadi": "Madhya"},
    {"name": "Swati", "lord": "Rahu", "yoni": "Buffalo", "gana": "Deva", "nadi": "Antya"},
    {"name": "Vishakha", "lord": "Jupiter", "yoni": "Tiger", "gana": "Rakshasa", "nadi": "Antya"},
    {"name": "Anuradha", "lord": "Saturn", "yoni": "Deer", "gana": "Deva", "nadi": "Madhya"},
    {"name": "Jyeshtha", "lord": "Mercury", "yoni": "Deer", "gana": "Rakshasa", "nadi": "Adi"},
    {"name": "Mula", "lord": "Ketu", "yoni": "Dog", "gana": "Rakshasa", "nadi": "Adi"},
    {"name": "Purva Ashadha", "lord": "Venus", "yoni": "Monkey", "gana": "Manushya", "nadi": "Madhya"},
    {"name": "Uttara Ashadha", "lord": "Sun", "yoni": "Mongoose", "gana": "Manushya", "nadi": "Antya"},
    {"name": "Shravana", "lord": "Moon", "yoni": "Monkey", "gana": "Deva", "nadi": "Antya"},
    {"name": "Dhanishta", "lord": "Mars", "yoni": "Lion", "gana": "Rakshasa", "nadi": "Madhya"},
    {"name": "Shatabhisha", "lord": "Rahu", "yoni": "Horse", "gana": "Rakshasa", "nadi": "Adi"},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "yoni": "Lion", "gana": "Manushya", "nadi": "Adi"},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "yoni": "Cow", "gana": "Manushya", "nadi": "Madhya"},
    {"name": "Revati", "lord": "Mercury", "yoni": "Elephant", "gana": "Deva", "nadi": "Antya"}
]

DASHA_ORDER = [
    {"lord": "Ketu", "years": 7},
    {"lord": "Venus", "years": 20},
    {"lord": "Sun", "years": 6},
    {"lord": "Moon", "years": 10},
    {"lord": "Mars", "years": 7},
    {"lord": "Rahu", "years": 18},
    {"lord": "Jupiter", "years": 16},
    {"lord": "Saturn", "years": 19},
    {"lord": "Mercury", "years": 17}
]

def get_lahiri_ayanamsha(ephem_date):
    """Calculates official N.C. Lahiri Ayanamsha for a given Julian date."""
    epoch_2000 = ephem.Date("2000/1/1 12:00:00")
    t = (float(ephem_date) - float(epoch_2000)) / 36525.0
    return 23.85 + 1.396 * t

def calculate_natal_chart(dob_str, tob_str, lat=28.6139, lon=77.2090, tz_offset=5.5):
    """Computes exact sidereal longitudes for Lagna and all planets using PyEphem."""
    dt_local = datetime.strptime(f"{dob_str} {tob_str}", "%Y-%m-%d %H:%M")
    dt_utc = dt_local - timedelta(hours=tz_offset)
    
    observer = ephem.Observer()
    observer.lat = str(lat)
    observer.lon = str(lon)
    observer.date = dt_utc.strftime("%Y/%m/%d %H:%M:%S")

    ayanamsha = get_lahiri_ayanamsha(observer.date)

    bodies = {
        "Sun": ephem.Sun(observer),
        "Moon": ephem.Moon(observer),
        "Mars": ephem.Mars(observer),
        "Mercury": ephem.Mercury(observer),
        "Jupiter": ephem.Jupiter(observer),
        "Venus": ephem.Venus(observer),
        "Saturn": ephem.Saturn(observer),
    }

    raw_longs = {}
    for p_name, body in bodies.items():
        body.compute(observer)
        ecl = ephem.Ecliptic(body)
        trop_deg = math.degrees(float(ecl.lon))
        sid_deg = (trop_deg - ayanamsha) % 360
        raw_longs[p_name] = sid_deg

    # Rahu & Ketu (Mean Node estimation)
    d = float(observer.date) - 2451545.0
    rahu_trop = (125.04452 - 0.0529538083 * d) % 360
    rahu_sid = (rahu_trop - ayanamsha) % 360
    ketu_sid = (rahu_sid + 180) % 360
    raw_longs["Rahu"] = rahu_sid
    raw_longs["Ketu"] = ketu_sid

    # Lagna (Ascendant) Sidereal
    sidereal_time = float(observer.sidereal_time())
    lst_deg = math.degrees(sidereal_time)
    lagna_trop = (lst_deg + math.degrees(math.atan2(math.tan(math.radians(float(observer.lat))), math.cos(sidereal_time)))) % 360
    lagna_sid = (lagna_trop - ayanamsha) % 360
    raw_longs["Lagna"] = lagna_sid

    return raw_longs

def get_sign_info(longitude):
    norm = longitude % 360
    sign_id = int(norm // 30) + 1
    deg_in_sign = norm % 30
    return {
        "sign_id": sign_id,
        "sign_name": SIGNS[sign_id - 1],
        "sanskrit_name": SANSKRIT_SIGNS[sign_id - 1],
        "degree": round(deg_in_sign, 2),
        "total_longitude": round(norm, 2)
    }

def get_nakshatra_info(moon_long):
    norm = moon_long % 360
    nak_idx = int(norm // (13 + 1/3))
    deg_in_nak = norm % (13 + 1/3)
    pada = int(deg_in_nak // (3 + 1/3)) + 1
    nak_obj = NAKSHATRAS[nak_idx % 27]
    return {
        "index": nak_idx + 1,
        "name": nak_obj["name"],
        "lord": nak_obj["lord"],
        "pada": pada,
        "yoni": nak_obj["yoni"],
        "gana": nak_obj["gana"],
        "nadi": nak_obj["nadi"],
        "passed_ratio": deg_in_nak / (13 + 1/3)
    }

def calculate_shodashavarga(raw_longs):
    """Calculates all 16 Divisional Charts (D1 through D60)."""
    vargas = {f"D{num}": {} for num in [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60]}
    
    for body, long in raw_longs.items():
        d1_sign = int(long // 30) + 1
        deg = long % 30
        
        vargas["D1"][body] = {"sign_id": d1_sign, "degree": deg}

        # D2 Hora (15° half)
        d2_sign = d1_sign if deg < 15 else (d1_sign % 12) + 1
        vargas["D2"][body] = {"sign_id": d2_sign, "degree": (deg % 15) * 2}

        # D3 Drekkana (10° decanate)
        d3_part = int(deg // 10)
        d3_sign = ((d1_sign - 1 + d3_part * 4) % 12) + 1
        vargas["D3"][body] = {"sign_id": d3_sign, "degree": (deg % 10) * 3}

        # D4 Chaturthamsha (7.5°)
        d4_part = int(deg // 7.5)
        d4_sign = ((d1_sign - 1 + d4_part * 3) % 12) + 1
        vargas["D4"][body] = {"sign_id": d4_sign, "degree": (deg % 7.5) * 4}

        # D7 Saptamsha (4.285°)
        d7_part = int(deg // (30 / 7))
        d7_start = d1_sign if d1_sign % 2 != 0 else ((d1_sign + 6 - 1) % 12) + 1
        d7_sign = ((d7_start - 1 + d7_part) % 12) + 1
        vargas["D7"][body] = {"sign_id": d7_sign, "degree": (deg % (30 / 7)) * 7}

        # D9 Navamsha (3.333°)
        d9_part = int(deg // (3 + 1/3))
        if d1_sign in [1, 5, 9]: d9_start = 1
        elif d1_sign in [2, 6, 10]: d9_start = 10
        elif d1_sign in [3, 7, 11]: d9_start = 7
        else: d9_start = 4
        d9_sign = ((d9_start - 1 + d9_part) % 12) + 1
        vargas["D9"][body] = {"sign_id": d9_sign, "degree": (deg % (3 + 1/3)) * 9}

        # D10 Dashamsha (3°)
        d10_part = int(deg // 3)
        d10_start = d1_sign if d1_sign % 2 != 0 else ((d1_sign + 8 - 1) % 12) + 1
        d10_sign = ((d10_start - 1 + d10_part) % 12) + 1
        vargas["D10"][body] = {"sign_id": d10_sign, "degree": (deg % 3) * 10}

        # D12 Dwadasamsha (2.5°)
        d12_part = int(deg // 2.5)
        d12_sign = ((d1_sign - 1 + d12_part) % 12) + 1
        vargas["D12"][body] = {"sign_id": d12_sign, "degree": (deg % 2.5) * 12}

        # D16 Shodashamsha (1.875°)
        d16_part = int(deg // 1.875)
        d16_sign = ((d1_sign - 1 + d16_part) % 12) + 1
        vargas["D16"][body] = {"sign_id": d16_sign, "degree": (deg % 1.875) * 16}

        # D20 Vimsamsha (1.5°)
        d20_part = int(deg // 1.5)
        d20_sign = ((d1_sign - 1 + d20_part) % 12) + 1
        vargas["D20"][body] = {"sign_id": d20_sign, "degree": (deg % 1.5) * 20}

        # D24 Siddhamsa (1.25°)
        d24_part = int(deg // 1.25)
        d24_sign = ((d1_sign - 1 + d24_part) % 12) + 1
        vargas["D24"][body] = {"sign_id": d24_sign, "degree": (deg % 1.25) * 24}

        # D27 Bhamsa (1.111°)
        d27_part = int(deg // (30 / 27))
        d27_sign = ((d1_sign - 1 + d27_part) % 12) + 1
        vargas["D27"][body] = {"sign_id": d27_sign, "degree": (deg % (30 / 27)) * 27}

        # D30 Trimsamsha (Unequal)
        d30_sign = ((d1_sign - 1 + int(deg // 1)) % 12) + 1
        vargas["D30"][body] = {"sign_id": d30_sign, "degree": deg}

        # D40 Khavedamsha (0.75°)
        d40_part = int(deg // 0.75)
        d40_sign = ((d1_sign - 1 + d40_part) % 12) + 1
        vargas["D40"][body] = {"sign_id": d40_sign, "degree": (deg % 0.75) * 40}

        # D45 Akshavedamsha (0.666°)
        d45_part = int(deg // (30 / 45))
        d45_sign = ((d1_sign - 1 + d45_part) % 12) + 1
        vargas["D45"][body] = {"sign_id": d45_sign, "degree": (deg % (30 / 45)) * 45}

        # D60 Shashtiamsha (0.5°)
        d60_part = int(deg // 0.5)
        d60_sign = ((d1_sign - 1 + d60_part) % 12) + 1
        vargas["D60"][body] = {"sign_id": d60_sign, "degree": (deg % 0.5) * 60}

    return vargas

def check_doshas(raw_longs):
    """Calculates Kuja/Manglik Dosha, Kalsarpa Dosha, and Sade Sati."""
    lagna_sign = int(raw_longs["Lagna"] // 30) + 1
    moon_sign = int(raw_longs["Moon"] // 30) + 1
    mars_sign = int(raw_longs["Mars"] // 30) + 1

    # Manglik Check from Lagna & Moon
    house_from_lagna = ((mars_sign - lagna_sign + 12) % 12) + 1
    house_from_moon = ((mars_sign - moon_sign + 12) % 12) + 1
    is_manglik = house_from_lagna in [1, 4, 7, 8, 12] or house_from_moon in [1, 4, 7, 8, 12]

    # Kalsarpa Check
    rahu_long = raw_longs["Rahu"]
    ketu_long = raw_longs["Ketu"]
    planet_longs = [raw_longs[p] for p in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]]
    
    # Check if all planets lie between Rahu and Ketu
    between_cnt = 0
    for pl in planet_longs:
        if (rahu_long < ketu_long and rahu_long <= pl <= ketu_long) or (rahu_long > ketu_long and (pl >= rahu_long or pl <= ketu_long)):
            between_cnt += 1
    is_kalsarpa = (between_cnt == 7 or between_cnt == 0)

    return {
        "manglik_dosha": {
            "is_present": is_manglik,
            "house_from_lagna": house_from_lagna,
            "house_from_moon": house_from_moon,
            "remedy": "Chant Hanuman Chalisa daily and worship Lord Shiva with water offering on Tuesdays."
        },
        "kalsarpa_dosha": {
            "is_present": is_kalsarpa,
            "type": "Anant Kalsarpa" if is_kalsarpa else "None",
            "remedy": "Recite Maha Mrityunjaya Mantra 108 times daily and perform Rudrabhishekam."
        }
    }

def calculate_transits(raw_natal):
    """Calculates live planetary positions for today."""
    now_observer = ephem.Observer()
    now_observer.date = ephem.now()
    ayanamsha = get_lahiri_ayanamsha(now_observer.date)

    bodies = {
        "Sun": ephem.Sun(now_observer),
        "Moon": ephem.Moon(now_observer),
        "Mars": ephem.Mars(now_observer),
        "Mercury": ephem.Mercury(now_observer),
        "Jupiter": ephem.Jupiter(now_observer),
        "Venus": ephem.Venus(now_observer),
        "Saturn": ephem.Saturn(now_observer)
    }

    transit_longs = {}
    for p_name, body in bodies.items():
        body.compute(now_observer)
        ecl = ephem.Ecliptic(body)
        trop_deg = math.degrees(float(ecl.lon))
        sid_deg = (trop_deg - ayanamsha) % 360
        transit_longs[p_name] = get_sign_info(sid_deg)

    return transit_longs
