Using this Devcontainer
----------------------

This devcontainer uses the repository's `docker-compose.yml` to start the backend and frontend services inside your development container and mounts the host Docker socket so you can run Docker commands from inside the container.

How to use:

1. Open this repository in VS Code.
2. When prompted to "Reopen in Container", choose that option. If not prompted, open the Command Palette (F1) and run "Dev Containers: Reopen in Container".
3. The devcontainer will start the `backend` and `frontend` services as defined in `docker-compose.yml`.

Notes:
- The devcontainer mounts `/var/run/docker.sock` from the host; this allows the VS Code container to control Docker on the host. This is a common developer convenience but be aware it gives the container elevated control of the host.
- By default the backend runs with `OPENAI_API_KEY=test-key` for deterministic test stubs. To use a real API key, set it in your devcontainer settings or export the variable before starting.
