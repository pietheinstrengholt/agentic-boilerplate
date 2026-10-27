# AGENTS.md

## Project

This is a greenfield web application with a Vue and TypeScript client, a Python API, and a MySQL database. Build only what the product requirements call for; do not assume product features, domain rules, or existing infrastructure that are not present in the repository.

## Technology Stack

### Client

* Vue 3, TypeScript, and Vite.
* Vitest for tests, ESLint for TypeScript and Vue templates, and Stylelint for CSS and Vue Single File Component styles.
* Type-check Vue and TypeScript code with the project's configured TypeScript checker, such as `vue-tsc --noEmit`.

### Server

* Python with FastAPI and Pydantic v2.
* SQLAlchemy 2.x for persistence and Alembic for database migrations.
* MySQL 8.x is the supported database.
* uv for dependency/environment management, Pytest for tests, Ruff for linting and formatting, and Pyright for type checking.

Use FastAPI's OpenAPI schema as the source for generated TypeScript API clients. Avoid maintaining duplicate handwritten client types for server request and response schemas.

## Architecture

### Client

* Adhere to the design principles and guidelines as documented in docs/design/design-principles.md.
* Keep UI and interaction in Vue components; put reusable reactive behavior in composables and non-visual API logic in client services when useful.
* Keep components focused. Do not extract code solely to reduce file length.
* Preserve accessible names, semantic controls, keyboard operation, and visible focus states.
* Consider narrow and wide viewports and both light and dark themes when changing user-facing UI.

### UI & Styling
* Use theme.css as the single source of truth for shared design tokens: colors, typography, spacing, borders, radii, shadows and transitions.
* Never hard-code recurring visual values in Vue components; use CSS variables from theme.css.
* Before adding a new token, style or component, check whether an existing one can be reused.
* Keep component CSS limited to component-specific layout and behavior; move reusable styling to shared styles/components.
* Prefer reusable Vue components for recurring UI patterns such as cards, badges, buttons, filters and metadata.
* Follow the current product design guidance in `docs/design/` and preserve responsive and accessible patterns.

### Server and API

* Keep HTTP routing, application behavior, and persistence concerns understandable and appropriately separated; follow the structure established by the project rather than adding layers by default.
* Use Pydantic v2 models to validate and document API inputs and outputs. Treat the OpenAPI schema and API behavior as client-facing contracts.
* Keep route handlers focused on HTTP concerns and orchestration. Put reusable business rules in the appropriate application or domain layer.
* Use FastAPI dependencies for shared request-scoped concerns where appropriate, such as database sessions and authentication.
* Return deliberate HTTP status codes and error responses. Do not expose internal exception details or secrets.
* Enforce authorization and resource ownership on the server for every operation that requires it; client-side checks are not authorization.

### Persistence and migrations

* Use SQLAlchemy 2.x consistently with typed mappings and explicit transaction boundaries.
* All models and newly created tables must end with non-null `created_at` and `updated_at` columns, automatically initialized on creation with `updated_at` automatically refreshed on updates.
* Use Alembic for every schema change. Do not create or alter production schema at application startup or bypass migrations with ad hoc SQL.
* Review generated migrations before applying them. Confirm constraints, indexes, nullability, defaults, and data-preservation implications against the intended change.
* Use MySQL 8.x for database integration tests. Do not substitute SQLite for MySQL-specific behavior.
* Run migration and database-reset tests only against development, never against production data.

## Code Style

* Follow existing naming, formatting, and module conventions. Keep changes small and avoid unrelated refactoring.
* Prefer clear, typed Python and TypeScript. Avoid `Any`/`any` when a precise type is practical.
* Reuse existing utilities and dependencies. Add a dependency only when the current stack cannot reasonably meet the requirement.
* Add comments for non-obvious decisions or domain rules, not to narrate straightforward code.
* Never commit credentials, tokens, private keys, or environment-specific secrets.
* Add business-readable comments throughout the code. Every small function or distinct code section should have at least one concise comment explaining its purpose in business or functional terms; larger or more complex functions should contain multiple comments that explain the main steps, decisions, and business rules.
* Write comments for a developer who is new to the application and its domain. Explain what the code is trying to achieve and why it matters rather than restating the implementation or syntax; prefer domain language from `GLOSSARY.md` and avoid unnecessarily technical wording.

## Commands

Run commands in the configured project environments and use repository scripts. The client package should provide the listed npm scripts; do not assume globally installed tools.

```bash
cd client && npm run lint && npm run lint:css && npm run type-check && npm run test && npm run build
```

```bash
cd server && uv run ruff check . && uv run ruff format --check . && uv run pyright && uv run pytest
```

### Local development

Use the development servers with hot reload enabled. Do not start the client or server in production mode for local development.

#### Client

Start the Vue/Vite development server with:

```bash
cd client && npm run dev
```

#### Server

Start the FastAPI development server with:

```bash
cd server && uv run uvicorn app.main:app --reload
```

## Testing and Validation

* Add focused regression tests for behavior changes. Use Pytest for server tests and Vitest for client tests.
* Use an isolated MySQL test database for tests that access the database. Keep database-resetting test runs sequential when they share that database.
* For migration changes, run the relevant tests and verify the Alembic migration workflow against an isolated MySQL database.
* Run the full relevant test, lint, type-check, and build commands after the final change. Fix failures caused by the change and rerun the checks.
* If a required check cannot run, state the blocker and do not claim the change is fully validated.
* For documentation-only changes, verify the referenced commands and contracts; application test suites are not required.

## Mandatory Validation

All coding agents MUST validate their changes before considering an implementation
complete. Validation is part of implementation, not an optional follow-up.

### Frontend changes

For frontend changes, run all of the following from `client/` and report each
command's actual PASS/FAIL status. Also run `npm run build` after the final change.
Fix linting, TypeScript, and test errors caused by the implementation. Do not
declare completion while newly introduced failures remain. For files supported
by Prettier, also run `npm run format:check`; use `npm run format` to format them.

```bash
npm run lint
npm run lint:css
npm run type-check
npm run test
```

### Backend changes

When Python/backend code is modified, run from `server/`:

```bash
uv run ruff check .
uv run ruff format --check .
uv run pyright
uv run pytest
```

Fix linting, formatting, typing, and test errors caused by the implementation.
Use `uv run ruff check . --fix` for safe lint fixes and `uv run ruff format .`
for formatting. Keep dependencies and `uv.lock` aligned through uv.

### Full-stack changes and contextual validation

Run both validation sets when frontend and backend code are modified. Normally,
frontend-only work does not need backend validation and backend-only work does
not need frontend validation. Documentation-only changes need referenced commands
and contracts checked, not entire application test suites.

### UI and UX changes

For changes affecting Vue templates, CSS, components, layouts, or other rendered
UI, Playwright validation is also mandatory:

* Open the affected page in the running development application and validate the rendered result.
* Where a reference design exists under `docs/design/`, capture and visually inspect Playwright screenshots and compare the implementation against that reference. Do not overwrite reference designs.
* Validate applicable layout and positioning, spacing and alignment, typography, colors, borders and border radius, shadows, and responsive behavior.
* Validate page rendering, navigation, and interaction behavior, including applicable forms and dialogs; hover, focus, and disabled states; and loading, empty, and error states. Include affected narrow and wide viewports and light and dark themes.
* Report the pages, reference designs, viewport sizes, and states checked, along with any remaining differences or blockers. If browser or screenshot inspection is unavailable, report the blocker rather than claiming visual validation passed.

Passing ESLint, Stylelint, and `vue-tsc` does not prove that the UI is visually
correct. For UI changes, the rendered browser result is the final validation
source.

### API changes

When endpoints, request/response schemas, persistence behavior, or database models
change, run backend tests and validate affected endpoints, request and response
models, and error handling. Verify migrations when the database schema changes.

### Database changes

When SQLAlchemy models or the schema change, create/update the necessary Alembic
migration, verify it can be applied to an isolated MySQL test database, and ensure
ORM models remain aligned with the schema. Run backend validation. Never run
database-resetting tests against development application or production data.

### Existing failures

Do not hide or silently ignore validation failures. If a failure clearly existed
before the implementation and is unrelated:

1. Do not perform an unrelated large refactor solely to fix it.
2. Clearly distinguish it from failures introduced by the current work.
3. Verify the implementation introduces no additional failures.

### Completion report

Report the exact validation commands actually executed and their outcomes.
Only report PASS when the command was executed successfully; never claim a
check ran when it did not. Report blocked checks and their reasons explicitly.
For example, include only applicable, actually executed checks:

```text
Validation:
- npm run lint: PASS
- npm run lint:css: PASS
- npm run format:check: PASS
- npm run type-check: PASS
- npm run test: PASS
- npm run build: PASS
- uv run ruff check .: PASS
- uv run ruff format --check .: PASS
- uv run pyright: PASS
- uv run pytest: PASS
- Playwright UI validation: PASS
```

## Working Rules

* Inspect relevant code, callers, tests, configuration, and nearby patterns before editing.
* Prefer repository evidence over assumptions. Do not invent routes, schemas, models, constraints, or product requirements.
* Preserve behavior outside the requested scope. Reuse existing patterns and avoid speculative abstractions or defensive code without a demonstrated need.
* Do not combine requested work with unrelated formatting, cleanup, renaming, or file moves.
* Do not install or upgrade dependencies, run production operations, deploy, push, or merge unless explicitly requested.
* Do not commit changes unless explicitly asked.
* The primary branch is `main`. When the user says `master`, interpret it as `main`, including commit, push, and merge requests; do not target the legacy `master` branch.
* Before finishing, review the diff and worktree status when Git metadata is available; confirm only expected files changed.

## Domain Language and Glossary
* The domain language in `GLOSSARY.md` gives names to good seams;
* Read the project's domain glossary (`GLOSSARY.md`) and any ADRs in the area you're touching first.
* Use names from the current product glossary for modules and workflows.
* **Naming a deepened module after a concept not in `GLOSSARY.md`?** Add the term to `GLOSSARY.md`. Create the file lazily if it doesn't exist.
* **Sharpening a fuzzy term during the conversation?** Update `GLOSSARY.md` right there.
