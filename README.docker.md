Docker usage
------------

Quick instructions to run the full app with Docker (backend + frontend):

1. Build and start services (requires Docker & docker-compose):

```bash
docker-compose up --build
```

This will:
- build the backend image and run the FastAPI server on port `8000` (mapped)
- build the frontend static site and serve it via nginx on port `3000` (mapped)

2. Open the frontend at: http://localhost:3000

Notes:
- By default the backend `OPENAI_API_KEY` is set to `test-key` inside the container so the LLM step uses deterministic stubs for local development. To use a real API key, set the environment variable when running docker-compose:

```bash
OPENAI_API_KEY=sk-... docker-compose up --build
```

- If you want to develop against the running backend, the backend service mounts `./backend` into the container so code changes will take effect when the server restarts.

Frontend development (interactive):

- The repository includes a `frontend-dev` service that runs a Node/Vite dev server and mounts your local `./frontend` directory. It exposes Vite's default port `5173`.

To run the interactive frontend dev server (Vite):

```bash
docker-compose up --build frontend-dev
```

Open the dev server at: http://localhost:5173

