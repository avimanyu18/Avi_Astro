import os
import sys
from pathlib import Path

ROOT = str(Path(__file__).resolve().parents[2])
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

os.environ.setdefault("OPENAI_API_KEY", "test-key")

from backend.main import calculate_horoscope, chat_astrologer, BirthDetailsInput, ChatRequest


def test_calculate_horoscope_and_chat():
    inp = BirthDetailsInput(
        name="Test Avimanyu",
        dob="1992-04-14",
        tob="07:30",
        city="New Delhi, India",
        lat=28.6139,
        lon=77.2090,
        tz_offset=5.5
    )

    res = calculate_horoscope(inp)
    assert res is not None
    assert "profile" in res
    assert "d1_planets" in res
    assert "shodashavargas" in res
    assert "doshas" in res
    assert "live_transits" in res

    # Verify Shodashavargas presence (D1-D60)
    for v in ["D1", "D9", "D10", "D60"]:
        assert v in res["shodashavargas"]

    chat_req = ChatRequest(
        question="How is my career path looking in D10?",
        chart=res["d1_planets"],
        computed_facts=res["doshas"]
    )
    chat_res = chat_astrologer(chat_req)
    assert chat_res is not None
    assert "reply" in chat_res
    assert len(chat_res["reply"]) > 0
