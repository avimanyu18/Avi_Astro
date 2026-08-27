Vedic Astrology Frontend

Run with:

```bash
cd frontend
npm install
npm run dev
```

This minimal UI accepts chart JSON (paste or upload) and sends it to `http://localhost:8000/analyze`.
# Frontend

To run the frontend UI (Vite + React):

Install dependencies:

```bash
cd frontend
npm install
```

Start dev server:

```bash
npm run dev
```

## Windows desktop application

The desktop build is an Electron wrapper around the Vite frontend. It requires an online FastAPI backend and will remain unavailable when the backend health endpoint cannot be reached.

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_URL` to the deployed backend URL, for example `https://api.example.com`.
3. Build the installer:

```powershell
npm install
npm run desktop:build
```

The unsigned installer is written to `release\Avimanyu Astro AI Setup 0.1.0.exe`.

For a local smoke test, set `VITE_API_URL=http://localhost:8000` and run:

```powershell
npm run desktop:dev
```
