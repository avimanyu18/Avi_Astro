import os
from typing import Dict, Any
import json
import time
import hashlib

# Simple in-memory cache: key -> (timestamp, response)
_LLM_CACHE: Dict[str, Any] = {}
_CACHE_TTL = 60 * 5  # 5 minutes


SYSTEM_PROMPT = (
    "You are an expert practitioner of classical Vedic Jyotisha. Use Classical Parashari Jyotisha as the primary framework; use a clearly labeled classical Jaimini technique only when the rule and required data are present. Stay strictly within traditional Jyotisha. Do not use Western, tropical, psychological, scientific, sociological, self-help, or personality frameworks.\n"
    "Respond ONLY with a single JSON object matching the EXACT schema described below. Do NOT add explanatory text outside the JSON.\n"
    "DATA FIREWALL: Treat only the supplied `chart` and `computed_facts` as authoritative raw data. Verify user-provided conclusions rather than accepting them as facts. Never invent degrees, houses, signs, nakshatras, vargas, arudhas, dasha dates, transits, yogas, strength scores, or timing. If a fact or calculation is unavailable, say so in `warnings` and do not use it as evidence.\n"
    "METHOD: First define the event being judged from the question, distinguishing occurrence, possibility, initiation, continuation, commitment, marriage, reconciliation, separation, visibility, and timing when relevant. Establish the D1/Rashi promise before considering Vargas, Arudhas, Dashas, or transits. Then examine only event-relevant houses, lords, planets, dignity, classical aspects, dispositors, nakshatra lords, genuine yogas, relevant Varga confirmation, relevant Arudha/UL/A7/AL manifestation, Dasha activation, and transit activation.\n"
    "EVIDENCE: Never judge a major event from one placement, Yoga, Varga, Dasha, or transit. Check broadly but apply selectively. Separate SUPPORTING, MODIFYING, CONTRADICTORY, and BACKGROUND evidence. Distinguish independent mechanisms from corroboration and repeated expressions of the same planetary relationship; do not double-count them. Dasha and transit activate or time an existing natal promise and cannot manufacture one.\n"
    "DISCIPLINE: Apply the hierarchy verified data, D1 promise, event-specific factors, relevant classical combinations, relevant Varga, Arudha manifestation, Dasha, then transit. Resolve conflicts explicitly: identify whether opposition affects occurrence, form, intensity, timing, duration, or visibility. Use conclusions such as supported but delayed, conditionally expressed, activated but obstructed, mixed, or indeterminate when warranted. Do not manufacture numerical probabilities or day-level precision. Stop when further techniques cannot change the judgment.\n"
    "For every candidate Yoga, include its condition and chart evidence; do not list unsupported or irrelevant Yogas. Use D9, D10, D7, D2, D4, or another Varga only when the question and supplied data justify it, and use it to refine rather than replace D1. Use UL/A7 for relationship manifestation and AL for public/material manifestation only when reliably calculable.\n"
    "If the data is insufficient, identify whether it is sufficient, partially sufficient, or insufficient in `warnings`; give the strongest defensible conclusion rather than guessing.\n"
    "Schema: {\n"
    "  summary: string,\n"
    "  dignities: [ {planet: string, status: string, detail: string} ],\n"
    "  conjunctions: [ {pair: [string,string], deg_diff: number, detail: string} ],\n"
    "  aspects: [ {from: string, to: string, type_deg: number, orb: number} ],\n"
    "  graha_yuddha: [ {pair: [string,string], deg_diff: number, stronger: string, weaker: string} ],\n"
    "  shadbala: { planet_strengths: { [planet:string]: number } },\n"
    "  bhava_lords: { [house_number: string]: { sign: string, ruler: string } },\n"
    "  house_strengths: { [house_number: string]: { count: number, planets: [string] } },\n"
    "  candidate_yogas: [ {name: string, evidence: object, note: string} ],\n"
    "  raja_yogas: [ {name: string, evidence: object } ],\n"
    "  recommendations: [string],\n"
    "  warnings: [string]\n"
    "}\n"
)


def parse_json_response(text: str) -> Any:
    try:
        return json.loads(text)
    except Exception:
        # attempt to extract JSON block
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end+1])
            except Exception:
                return {"error": "invalid_json", "raw": text}
        return {"error": "invalid_json", "raw": text}


LLM_OUTPUT_SCHEMA = {
    "type": "object",
    "required": [
        "summary",
        "dignities",
        "conjunctions",
        "aspects",
        "graha_yuddha",
        "shadbala",
        "bhava_lords",
        "house_strengths",
        "candidate_yogas",
        "raja_yogas",
        "recommendations",
        "warnings",
    ],
    "properties": {
        "summary": {"type": "string"},
        "dignities": {"type": "array"},
        "conjunctions": {"type": "array"},
        "aspects": {"type": "array"},
        "graha_yuddha": {"type": "array"},
        "shadbala": {"type": "object"},
        "bhava_lords": {"type": "object"},
        "house_strengths": {"type": "object"},
        "candidate_yogas": {"type": "array"},
        "raja_yogas": {"type": "array"},
        "recommendations": {"type": "array"},
        "warnings": {"type": "array"},
    },
}


def _cache_key_for_payload(payload: Dict[str, Any]) -> str:
    s = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def _get_cached(key: str):
    ent = _LLM_CACHE.get(key)
    if not ent:
        return None
    ts, resp = ent
    if time.time() - ts > _CACHE_TTL:
        del _LLM_CACHE[key]
        return None
    return resp


def _set_cached(key: str, resp: Any):
    _LLM_CACHE[key] = (time.time(), resp)


def _validate_schema(obj: Any) -> tuple[bool, Any]:
    try:
        import jsonschema

        jsonschema.validate(instance=obj, schema=LLM_OUTPUT_SCHEMA)
        return True, None
    except Exception as e:
        # fallback minimal checks
        if not isinstance(obj, dict):
            return False, "not_object"
        for k in ["summary", "dignities", "conjunctions", "aspects", "graha_yuddha", "shadbala", "candidate_yogas", "recommendations", "warnings"]:
            if k not in obj:
                return False, f"missing_{k}"
        return True, None


def analyze_with_llm(payload: Dict[str, Any]) -> Dict[str, Any]:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {"error": "Missing OPENAI_API_KEY"}

    # Enforce strict no-assumptions: check required fields
    required = ["chart", "computed_facts"]
    missing = [k for k in required if k not in payload]
    if missing:
        return {"error": "Missing required payload fields", "missing": missing}

    # For test environments (no real key), return deterministic stub
    cache_key = _cache_key_for_payload(payload)
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    if api_key == "test-key":
        computed = payload.get("computed_facts", {})
        facts_count = 0
        if isinstance(computed, dict):
            for v in computed.values():
                if isinstance(v, list):
                    facts_count += len(v)
        elif isinstance(computed, list):
            facts_count = len(computed)
        stub = {
            "analysis_summary": "Structured factual output (stub)",
            "confidence": 0.0,
            "facts_count": facts_count,
            "facts": computed,
            "note": "Test-mode stub: no network call was made.",
        }
        _set_cached(cache_key, stub)
        return stub

    # Configure OpenAI client (import lazily to avoid hard dependency during tests)
    try:
        import openai
    except ImportError:
        return {"error": "openai_not_installed", "message": "Please install openai package or set OPENAI_API_KEY to test-key for local testing."}

    openai.api_key = api_key
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    user_content = {
        "instruction": "Analyze the following computed facts and chart using strict classical Vedic rules. Produce JSON matching the schema.",
        "chart": payload.get("chart"),
        "computed_facts": payload.get("computed_facts"),
    }

    # perform call with retries and exponential backoff
    attempt = 0
    max_attempts = 3
    backoff = 1.0
    last_exc = None
    while attempt < max_attempts:
        attempt += 1
        try:
            resp = openai.ChatCompletion.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": json.dumps(user_content)},
                ],
                temperature=0.0,
                max_tokens=1500,
            )
            text = resp["choices"][0]["message"]["content"]
            parsed = parse_json_response(text)
            valid, reason = _validate_schema(parsed)
            if not valid:
                return {"error": "schema_validation_failed", "reason": reason, "raw": parsed}
            result = {"analysis_summary": parsed}
            _set_cached(cache_key, result)
            return result
        except Exception as e:
            last_exc = e
            # exponential backoff for transient errors
            time.sleep(backoff)
            backoff *= 2

    return {"error": "llm_call_failed", "message": str(last_exc)}


CHAT_SYSTEM_PROMPT = (
    "You are an expert practitioner of classical Vedic Jyotisha. Use Classical Parashari Jyotisha first and use classical Jaimini only as a separately labeled, materially relevant technique with sufficient data. Interpret strictly through the supplied `chart` and `computed_facts`; never invent or silently assume chart data, calculations, dates, Vargas, Arudhas, Dashas, transits, Yogas, or degrees. If an advanced layer cannot be reliably determined, state that limitation.\n"
    "Define the user's event before judging it. Establish the D1/Rashi natal promise first, then examine only relevant event houses, lords, planets, dignity, classical aspects, genuine Yogas, dispositors, nakshatra networks, relevant Varga confirmation, relevant UL/A7/AL manifestation, Dasha activation, and transit activation. A Varga, Dasha, or transit may refine, delay, modify, manifest, or time a D1 promise; it cannot create a major event absent from D1.\n"
    "Never make a major conclusion from one placement, Yoga, Varga, Dasha, or transit. Separate independent support from corroboration and repeated expressions of the same factor. Explicitly address important contradiction, delay, obstruction, conditionality, and whether it changes occurrence, form, timing, duration, or visibility. Do not use Western, tropical, psychological, scientific, sociological, self-help, or personality frameworks, and do not fabricate probabilities or false timing precision.\n"
    "Structure substantial answers as: Data Sufficiency; Event Definition; D1 Natal Promise; Event-Specific Network; Relevant Varga; Arudha/UL/A7/AL; Nakshatra/Dispositor Network; Dasha Activation; Transit Activation; Convergence; Contradictions/Modifiers; Timing; Final Judgment; Confidence. Keep only materially relevant evidence. Use confidence terms Definitive, Strong, Moderate, Weak, Mixed/Conditional, or Indeterminate, proportional to the evidence. Traditional remedies may be offered only when relevant and supported by the chart; do not present them as guaranteed outcomes. Maintain a precise, dignified tone."
)


def chat_with_astrologer(question: str, chart: Dict[str, Any], computed_facts: Dict[str, Any]) -> str:
    """Answers user's freeform questions using Vedic astrology rules and chart facts."""
    api_key = os.environ.get("OPENAI_API_KEY")

    # If in test mode or no API key, return a deterministic high-quality astrological interpretation stub
    if not api_key or api_key == "test-key":
        lagna = (chart.get("lagna") or {}).get("sign") if isinstance(chart.get("lagna"), dict) else chart.get("lagna")
        planets = chart.get("planets", {})
        yogas = (computed_facts or {}).get("candidate_yogas", [])
        yoga_names = [y.get("name") for y in yogas] if yogas else ["Classical Kendra-Trikona Alignments"]

        q_lower = question.lower()
        if "career" in q_lower or "job" in q_lower or "work" in q_lower or "profession" in q_lower:
            topic = "Career & Professional Path"
            insight = f"With {lagna or 'your'} Ascendant, your 10th house of career and 10th lord play a pivotal role. The presence of {', '.join(list(planets.keys())[:3])} provides key momentum. Active Yogas: {', '.join(yoga_names)}."
            advice = "Focus on leadership opportunities, analytical precision, and continuous learning over the next 6-12 months."
            remedy = "Offer water to the rising Sun every morning and recite 'Om Suryaya Namah' 108 times."
        elif "marriage" in q_lower or "love" in q_lower or "relationship" in q_lower or "spouse" in q_lower:
            topic = "Relationships & Marriage Prospects"
            insight = f"Your 7th house of partnerships and Venus placement indicate your relationship dynamics. Your planetary dignities support meaningful long-term bonds."
            advice = "Patience and transparent communication will foster harmony and mutual understanding."
            remedy = "Chant 'Om Shukraya Namah' on Fridays and respect partners & elders."
        elif "wealth" in q_lower or "money" in q_lower or "finance" in q_lower or "business" in q_lower:
            topic = "Wealth & Financial Growth"
            insight = f"The 2nd house (Accumulated Wealth) and 11th house (Gains) show strong promise. Yogas detected: {', '.join(yoga_names)}."
            advice = "Diversify investments in long-term stable assets and avoid impulsive speculative ventures."
            remedy = "Keep your home pristine and worship Goddess Lakshmi on Friday evenings."
        else:
            topic = "General Vedic Life Guidance"
            insight = f"Your chart with {lagna or 'Aries'} Lagna exhibits a unique blend of planetary energies. Yogas identified: {', '.join(yoga_names)}."
            advice = "Align your efforts with your core planetary strengths for optimal growth."
            remedy = "Practice daily meditation, respect parents, and chant the Gayatri Mantra."

        return (
            f"### 🪐 Astrological Insight: {topic}\n\n"
            f"**Analysis of Your Chart:**\n{insight}\n\n"
            f"**Astrologer's Guidance:**\n{advice}\n\n"
            f"**Vedic Remedy Recommendations:**\n- {remedy}\n\n"
            f"*(Note: Powered by Vedic Astrology AI)*"
        )

    # Real LLM call if valid API key is present
    try:
        import openai
        openai.api_key = api_key
        model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

        context = {
            "question": question,
            "chart": chart,
            "computed_facts": computed_facts
        }

        resp = openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": CHAT_SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps(context)}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return resp["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Astrological Chat Error: {str(e)}"

