# Vedic Astrology Chatbot

This repository contains a prototype Vedic astrology chatbot: a FastAPI backend that computes deterministic astrological facts and an LLM orchestration layer, and a Vite + React + Tailwind frontend with interactive chart UI and Playwright E2E tests.

Quick start (Docker Compose)

- Build and run services (backend + static frontend):

```powershell
# from repository root
docker-compose up --build
```

- Backend: `http://localhost:8000`
- Static frontend (nginx): `http://localhost:3000`

Devcontainer (VS Code)

- Open this workspace in VS Code and choose "Reopen in Container" to start the provided devcontainer which runs `docker-compose` automatically.

Local development (no Docker)

- Backend (Python 3.11+):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --reload --port 8000
```

- Frontend (Node.js 18+):

```powershell
cd frontend
npm install
npm run dev
```

Run tests

- Backend unit tests (pytest):

```powershell
cd backend
python -m pytest -q
```

- Frontend Playwright E2E (requires Node + Playwright):

```powershell
cd frontend
npm install
npx playwright install --with-deps
npx playwright test
```

CI notes

- The GitHub Actions workflow runs backend unit tests, builds the frontend, starts a preview server and backend, then runs Playwright E2E tests. Playwright HTML reports and `test-results` are uploaded as CI artifacts for debugging. The workflow now packages artifacts into a zip/tar and uploads it so screenshots, videos and traces are preserved.

Docker image publish

- A separate workflow `./github/workflows/docker-publish.yml` builds and pushes the backend and frontend Docker images to GitHub Container Registry.
- It uses `ghcr.io/${{ github.repository_owner }}/vedic-astrology-backend` and `ghcr.io/${{ github.repository_owner }}/vedic-astrology-frontend`.
- This workflow runs on `main` pushes and can be triggered manually via `workflow_dispatch`.
- To deploy published images locally, use `docker-compose.prod.yml`:

```powershell
$env:GHCR_OWNER = "<your-github-username-or-org>"
$env:OPENAI_API_KEY = "your-real-api-key"
docker-compose -f docker-compose.prod.yml up
```

Production deployment workflow

- A workflow `./github/workflows/deploy.yml` builds and pushes images, then deploys them to a remote host over SSH.
- Required repository secrets:
  - `GHCR_USERNAME`
  - `GHCR_TOKEN`
  - `GHCR_OWNER`
  - `SSH_PRIVATE_KEY`
  - `SSH_USER`
  - `SSH_HOST`
  - `OPENAI_API_KEY`

- The workflow uses the remote host to login to GHCR, pull the latest images, and run `docker-compose`.

Mobile APK (Capacitor)

- The frontend now supports Capacitor and PWA packaging. Configure a remote backend API URL with `VITE_API_BASE_URL` for release builds.
- To generate an Android APK:

```powershell
cd frontend
npm install
npx cap init vedic-astrology-chatbot com.example.vedicastrology --web-dir=dist
npm run build
npx cap copy android
npx cap open android
```

- In Android Studio, build a signed release APK using a production signing key. This is required to avoid Android warnings and allow Play Protect verification.
- Use minimal permissions and HTTPS backend endpoints. Do not distribute debug APKs.

Security notes for Android

- Sign the APK with a release key before installation.
- Keep `android:debuggable="false"` in the Android manifest for release builds.
- Use HTTPS for API endpoints via `VITE_API_BASE_URL=https://your-secure-backend.example.com`.
- Avoid requesting unnecessary permissions; the app only needs network access.

Using a real LLM

- The repository supports a deterministic `OPENAI_API_KEY=test-key` stub for local development. To enable real LLM calls, set the `OPENAI_API_KEY` environment variable to a valid OpenAI or Gemini key before starting the backend.

Security

- Do not commit secrets. Use repository secrets for CI or environment variables in your deployment.

If you want me to add deployment automation (publish Docker images, Helm charts, or GitHub Pages), tell me which registry or platform to target and I'll add workflows and secrets placeholders.
