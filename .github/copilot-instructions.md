# Vedic Astrology Chatbot Workspace Instructions

This workspace is structured into two main parts:
1. `/backend` - FastAPI Python server that handles astronomical logic, PDF/image parsing, transit calculations, and LLM orchestration (OpenAI / Gemini).
2. `/frontend` - Vite + React + Tailwind CSS client with custom SVGs for North & South Indian charts, dropzone for raw text/PDF/image uploads, and interactive chat interface.

## Dev Guidelines
- Avoid manual calculations of degrees/planets from scratch in Python unless necessary; accept calculated planetary tables from users and focus on expert-level synthesis.
- Use Whole Sign house system as the default for Vedic interpretations.
- Verify D-1 Rashi placements in D-9 Navamsha to establish authentic planetary strength.
- Cross-reference current Dasha with active 5-year Gochar (transits) from `/backend/data/transits.json`.
- Adhere strictly to BPHS and Jaimini Sutras rules. Never hallucinate.
