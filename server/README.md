# Wine Journal API

The current server implements sign-in for one or more locally created demo accounts. It uses FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, and MySQL 8.

## Current endpoints

| Method and path | Purpose |
| --- | --- |
| `POST /api/auth/login` | Check username and password; set a signed session cookie. |
| `GET /api/auth/me` | Return the account name for a valid session; otherwise return 401. |
| `POST /api/auth/logout` | Clear the session cookie and return 204. |

The login body has `username` and `password` strings. Invalid credentials return 401 with a generic message. An unconfigured database returns 503. There is no public account registration. The `users` table is created by the initial Alembic migration; the `app.create_user` command prompts for the first account password. The password is hashed with PBKDF2-HMAC-SHA256 and a random salt.

See the [root README](../README.md) for MySQL setup and development commands. Set `DATABASE_URL` and `APP_SESSION_SECRET` in the server process environment; no production secrets are stored in the repository. `APP_COOKIE_SECURE=true` enables HTTPS-only session cookies. The application does not create or change schema during startup.

The future Wine, Region, Tasting, and Tasting note concepts are defined in [GLOSSARY.md](../GLOSSARY.md). They have no current database tables or endpoints.
