# Server instructions

Applies to the Python backend, together with the root AGENTS.md.
Stack: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.x, MySQL 8.x,
Alembic, pytest, Ruff, Pyright, and uv.

Supporting guidance: [FastAPI Best Practices for AI Agents](https://github.com/zhanymkanov/fastapi-best-practices/blob/master/AGENTS.md).
Project-specific instructions take precedence over this external guide.
Its examples are not mandatory implementation requirements; select practices
that fit the requested change and the application's established behavior.

## Scope and change discipline

- These instructions guide future changes; they do not authorize a
  repository-wide compliance rewrite.
- Inspect relevant code, callers, tests, configuration, the domain glossary,
  and applicable ADRs before editing. Use repository evidence, not assumed
  product features or infrastructure.
- Change only code necessary for the requested task. Reuse established patterns
  unless they cause a concrete problem.
- Do not rename or move packages, introduce layers, migrate sync to async,
  split settings, replace libraries, or change database naming solely to match
  the external guide.
- Preserve APIs, database schema, migration history, authentication,
  authorization, and runtime behavior unless the task explicitly requires changes.
- Propose substantial architectural changes separately, explaining their benefit
  and scope before implementation.
- Avoid unrelated cleanup, mass formatting, dependency upgrades, and test rewrites.
- Do not install or upgrade dependencies, run production operations, deploy,
  push, merge, or commit unless explicitly requested. When dependency changes are
  authorized, use uv and keep the dependency manifest and uv.lock aligned.
- Respect unrelated working-tree changes; review the final diff and status.

## Organization and responsibilities

- Organize by business domain or capability, following existing package conventions.
  Keep related validation, workflows, queries, revisions, and lifecycle rules
  within their owning domain. Make cross-domain dependencies and ownership explicit.
- HTTP handlers handle request parsing, dependency injection, response headers,
  status codes, and orchestration. Keep reusable business rules in services.
- API schemas define validated request and response contracts; keep them distinct
  from ORM models, which describe persisted state, relationships, and constraints.
- Business services own use cases, authorization rules, and coordinated writes.
  Persistence code handles queries and storage, not HTTP responses or workflows.
- Shared infrastructure supports configuration, security, sessions, and other
  genuinely shared concerns; keep domain rules out of infrastructure.
- Keep dependencies explicit through established interfaces. Avoid circular
  dependencies; shared infrastructure must not depend on domain services.
- Small domains may remain simple. Do not require every domain to have every
  layer or file, or extract repositories and abstractions without a concrete need.

## Contracts, validation, and security

- Use typed Python; avoid Any when a precise type is practical. Follow existing
  naming and formatting conventions and reuse utilities and dependencies.
- Use explicit Pydantic v2 request and response models, with separate create and
  update contracts where useful. Preserve omitted-versus-null update semantics.
- Prefer built-in field constraints and types for input validation; use custom
  validators for meaningful domain rules. Check database-dependent invariants
  in services and enforce integrity with database constraints.
- Where API client generation is configured, treat FastAPI OpenAPI as its source
  of truth. Update generated clients through the existing workflow; do not
  introduce a generation pipeline unless requested.
- Use FastAPI dependencies for shared request-scoped concerns. Enforce server-side
  authorization and resource ownership consistently, including read visibility.
  Dependency checks must not leave alternate service entry points unprotected;
  protect reusable operations through service rules or an explicit checked context.
- Return deliberate status codes and sanitized errors. Catch specific expected
  failures; do not conceal unexpected exceptions or expose internal details.
- Keep configuration centralized and validated using established mechanisms;
  avoid scattered environment reads. Never generate missing encryption keys
  automatically or expose credentials in responses, logs, or validation errors.
- Never commit secrets, local environment files, virtual environments, or caches.
  Keep example configuration free of secrets and maintain the dependency lockfile.
- Add comments or docstrings where business intent, constraints, or non-obvious
  behavior need explanation. Use glossary terminology; avoid restating the code.

## Execution and transactions

- Preserve the established synchronous SQLAlchemy session and route approach.
  Use async execution only where appropriate to the task and existing conventions.
  Never perform blocking database, network, or file I/O on the event loop;
  use established synchronous execution or explicitly offload blocking work.
- Use request-scoped sessions for HTTP operations and explicit session lifetimes
  for workers and other entry points. Close sessions reliably; do not share a
  session across concurrent work or beyond its owning scope.
- The coordinating service owns commit and rollback. Nested services participate
  in that transaction rather than committing independently. Repositories must
  not commit or roll back independently; they may flush when necessary.
- Keep multi-step writes atomic. Preserve optimistic concurrency, row-version
  checks, ETag/If-Match contracts, locks, and conflict responses where applicable.
- Preserve revision history, publication rules, and database integrity; do not
  bypass them through alternate write paths.

## ORM and migrations

- Use SQLAlchemy 2.x typed mappings with the shared declarative base and metadata.
  Maintain complete ORM model discovery: register every model before application
  startup or Alembic consumes metadata, including models added or moved by a task.
- New persisted entity tables must include non-null created_at and updated_at
  timestamps. Follow established timestamp conventions and ensure updated_at
  changes on updates. Do not retrofit existing tables unless requested.
- Use Alembic for every schema change. Do not create or alter production schema
  at startup or bypass migrations with ad hoc SQL.
- Review generated migrations for constraints, indexes, nullability, defaults,
  MySQL compatibility, and data preservation before applying them.
- Do not rewrite applied migrations or reset migration history without an explicit
  request. Verify relevant upgrades and supported downgrades on isolated MySQL 8.x,
  keeping ORM metadata and schema aligned.

## Development and validation

Run commands from the server working directory using the configured uv environment.
For local API development, use hot reload:

```bash
uv run uvicorn app.main:app --reload
```

For Python/backend changes, run all checks after the final change:

```bash
uv run ruff check .
uv run ruff format --check .
uv run pyright
uv run pytest
```

- Apply Ruff fixes and formatting only to files affected by the task.
  Review the diff and rerun checks; do not mass-format unrelated code.
- Add focused pytest regression tests for behavior changes. Cover applicable
  API contracts, validation, permissions, service entry points, errors,
  concurrency, transaction rollback, and revision behavior.
- Reuse existing test patterns and FastAPI dependency overrides where appropriate;
  restore overrides after tests. Unit tests may isolate collaborators, but mocks
  do not validate database behavior.
- Use real MySQL 8.x for database integration tests and MySQL-dependent behavior;
  do not substitute SQLite. Use an isolated test database with a name ending in
  `_test`. Run shared-database reset tests
  sequentially, never against the development application database or production.
- For schema changes, verify migrations against that isolated database. For
  structural changes, also verify application import/startup, router registration,
  and Alembic model discovery.
- Documentation-only changes require checking referenced commands and contracts
  against project configuration; application suites are not required. Do not
  invent commands or install tools merely to satisfy documentation.
- Fix failures introduced by the change and rerun checks. Distinguish unrelated
  pre-existing failures without expanding into an unrelated refactor.
- Report exact commands executed and actual PASS/FAIL results. Report skipped or
  blocked checks and their reasons; never claim unexecuted checks passed or that
  validation is complete while required checks remain failed or blocked.
