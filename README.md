# Wine Journal

A small demo for first-time agentic engineering, built with Vue 3 and TypeScript, FastAPI, and MySQL 8. The current app has two screens: **sign in** and **welcome**. Wines, regions, tastings, and notes are ideas for later iterations; they are not implemented yet.

## Local database

These are the development database commands. `CREATE` corrects the typo in the original example. Run the user and grant statements with a MySQL administrator account if they have not already been run:

```sql
CREATE DATABASE wines;
CREATE USER 'wines'@'localhost' IDENTIFIED BY 'wines';
GRANT ALL PRIVILEGES ON wines.* TO 'wines'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

The `wines` password is a **local development example**. Use a different credential outside local development. The application does not use this database credential as a sign-in password. In this workspace, the `wines` user and grant already existed; the database was missing and was created before the migration ran.

## Start the demo

Requirements: Node.js 22, npm, Python 3.12, uv, and a reachable MySQL 8 server. The [example environment file](.env.example) uses the local database credentials above. The commands below copy it and generate a unique session secret. In one terminal, from the repository root:

```bash
cp .env.example .env
sed -i "s/^APP_SESSION_SECRET=.*/APP_SESSION_SECRET=$(openssl rand -hex 32)/" .env
set -a
. ./.env
set +a
cd server
uv sync
uv run alembic upgrade head
uv run python -m app.create_user demo
uv run uvicorn app.main:app --reload
```

Choose a password of at least eight characters when prompted by `create_user`. Keep `APP_SESSION_SECRET` stable while developing so existing sign-in sessions remain valid. Set `APP_COOKIE_SECURE=true` when serving over HTTPS. `.env` is ignored by Git; `.env.example` contains development-only sample values.

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. Vite proxies `/api` to the local FastAPI development server. FastAPI's API docs are at `http://127.0.0.1:8000/docs`.

## Checks and API types

The server's OpenAPI schema is the source for the client API types. After changing an endpoint, regenerate the contract:

```bash
cd server
APP_ENV=test uv run python export_openapi.py
cd ../client
npm run generate:api
```

Run `npm run lint`, `npm run lint:css`, `npm run format:check`, `npm run type-check`, `npm run test`, and `npm run build` in `client/`. Run `uv run ruff check .`, `uv run ruff format --check .`, `uv run pyright`, and `uv run pytest` in `server/`.

## Project guide

- [Agent instructions](AGENTS.md), [client instructions](client/AGENTS.md), and [server instructions](server/AGENTS.md)
- [Domain glossary](GLOSSARY.md)
- [Screen design](docs/design/design.md) and [design principles](docs/design/design-principles.md)
- [Server guide](server/README.md)
