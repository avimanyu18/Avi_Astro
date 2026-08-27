from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import httpx
import json
import os

from astrology.engine import (
    calculate_natal_chart,
    calculate_shodashavarga,
    check_doshas,
    calculate_transits,
    get_sign_info,
    get_nakshatra_info
)
from llm.agent import analyze_with_llm, chat_with_astrologer

app = FastAPI(title="Avimanyu Astro AI Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BirthDetailsInput(BaseModel):
    name: Optional[str] = "Avimanyu Seeker"
    dob: str = "1992-04-14"
    tob: str = "07:30"
    city: Optional[str] = "New Delhi, India"
    lat: Optional[float] = 28.6139
    lon: Optional[float] = 77.2090
    tz_offset: Optional[float] = 5.5


class ChatRequest(BaseModel):
    question: str
    chart: Dict[str, Any]
    computed_facts: Optional[Dict[str, Any]] = None


@app.get("/health")
def health():
    return {"status": "ok", "app": "Avimanyu Astro AI Engine", "ephemeris": "PyEphem + Lahiri Ayanamsha"}


@app.get("/api/geocoding/search")
async def search_city(q: str = Query(..., min_length=2)):
    """Online Geocoding API search via OpenStreetMap Nominatim for any city worldwide."""
    try:
        url = f"https://nominatim.openstreetmap.org/search?format=json&q={q}&limit=5"
        headers = {"User-Agent": "AvimanyuAstroAI/1.0"}
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                results = resp.json()
                formatted = []
                for item in results:
                    lat = float(item.get("lat", 0))
                    lon = float(item.get("lon", 0))
                    # Estimate timezone offset based on longitude (approx 15 deg per hour)
                    approx_tz = round(lon / 15.0 * 2) / 2.0
                    formatted.append({
                        "display_name": item.get("display_name", ""),
                        "lat": lat,
                        "lon": lon,
                        "tz_offset": approx_tz
                    })
                return {"query": q, "results": formatted}
    except Exception as e:
        print("Geocoding search error:", e)
    return {"query": q, "results": []}


@app.post("/api/horoscope/calculate")
def calculate_horoscope(input_data: BirthDetailsInput):
    """Calculates 100% precision Janam Kundli with Shodashavargas, Doshas, and Transits."""
    try:
        raw_longs = calculate_natal_chart(
            dob_str=input_data.dob,
            tob_str=input_data.tob,
            lat=input_data.lat or 28.6139,
            lon=input_data.lon or 77.2090,
            tz_offset=input_data.tz_offset or 5.5
        )

        vargas = calculate_shodashavarga(raw_longs)
        doshas = check_doshas(raw_longs)
        transits = calculate_transits(raw_longs)

        lagna_info = get_sign_info(raw_longs["Lagna"])
        moon_info = get_sign_info(raw_longs["Moon"])
        nak_info = get_nakshatra_info(raw_longs["Moon"])

        avakhada = {
            "varna": "Kshatriya" if lagna_info["sign_id"] in [1, 5, 9] else "Vaishya",
            "vashya": "Chatushpada",
            "yoni": nak_info["yoni"],
            "gana": nak_info["gana"],
            "nadi": nak_info["nadi"],
            "sign_lord": moon_info["sign_name"],
            "nakshatra_lord": nak_info["lord"]
        }

        formatted_d1 = {}
        for p, long in raw_longs.items():
            if p == "Lagna": continue
            s_info = get_sign_info(long)
            formatted_d1[p] = {
                "sign": s_info["sign_name"],
                "degree": s_info["degree"],
                "longitude": s_info["total_longitude"]
            }

        return {
            "profile": {
                "name": input_data.name,
                "dob": input_data.dob,
                "tob": input_data.tob,
                "city": input_data.city,
                "lagna": lagna_info,
                "moon_sign": moon_info,
                "nakshatra": nak_info
            },
            "avakhada_chakra": avakhada,
            "d1_planets": formatted_d1,
            "raw_longitudes": raw_longs,
            "shodashavargas": vargas,
            "doshas": doshas,
            "live_transits": transits
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
def chat_astrologer(req: ChatRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    chart_dict = req.chart
    computed = req.computed_facts or {}
    
    reply = chat_with_astrologer(req.question, chart_dict, computed)
    return {"reply": reply}
