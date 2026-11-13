# novaShop — estado del proyecto

## Flujo Git (GitFlow)
- `develop` (default): integración, PR obligatoria + CI.
- `feature/*`/`fix/*` → PR a `develop`; `release/*` y `hotfix/*` → PR a `main` + tag `vX.Y.Z`.
- `main` protegida (PR + CI, sin bypass admin); deploy automático al empujar tag `v*` (se omite si faltan secrets SSH).
- Plan completo: `docs/GITFLOW.md`.

## Stack
Monorepo: `frontend` (React 19 + Vite 8 + Tailwind v4) y `backend` (Spring Boot 4.1.2 + PostgreSQL 18). Fundamentales:
- JDK: `export JAVA_HOME=~/.local/opt/jdk-21` antes de `./mvnw`.
- Tests backend (MockMvc standalone): clases/paquetes necesitan `public`; MVC lneces pasan.
- PostgreSQL local: `pg_ctl -D ~/.local/opt/pg/bin start` (user/db `novashop`/`novashop`).
- Env demo backend: `/tmp/opencode/env.novashop` (borra por WSL restart; password admin `nova-admin-2026` bcrypt).
- Frontend dev: `npm run dev -- --port 5173 --strictPort` (desde Windows npm; proxy /api → 8080 con Playwright).
- E2E mocked: `frontend/tests/e2e/{buy,admin}.spec.ts`; **e2e real (backend+Postgres)**: `frontend/tests/e2e/admin-real.spec.ts`.
- Cada test Vitest necesita `import "@testing-library/jest-dom/vitest"`; tsconfig.app types `["vite/client","vitest/globals"]`.
- Sitemap placeholder `https://store.novashop.mx` (pendiente dominio real).

## Estado del MVP
- tasks.md 38/38 + rate-limit en POST /api/orders.
- CI verde (`alexvilla01/novaShop`, rama `main`).

## Deploy (pendiente de VPS + dominio)
- `deploy/docker-compose.yml` (postgres + backend + caddy web auto-HTTPS), Dockerfiles en backend/frontend, `deploy/.env.example`, `deploy/README.md` (pasos 1-6: provisión VPS, .env, DNS A, origen arranque, SSH secrets en gh, rollback).
- `.github/workflows/deploy.yml` en `workflow_dispatch`; activar `push:[main]` cuando exista VPS + secrets SSH_*/PROJECT_DIR.

## Última sesión (7 nov 2026)
- Rediseño dark conversion-first de la tienda pública: tokens Cosmic Slate + glassmorphism (`theme.css`), fuentes Space Grotesk/Inter, header sticky con búsqueda (`/?q=`), banner flash con countdown, grid 2/4 cols, tarjetas glass.
- Landing de producto con `ProductLayout` (sin menú, ruta `/p/:slug` fuera de `PublicLayout`): carrusel, above-the-fold (stock, rating, H1, precio, CTA WhatsApp), beneficios, reseñas, cómo funciona y sticky CTA móvil.
- Admin conserva tema claro vía scope `.theme-light`.
- Build OK 91 kB gzip; Vitest 4/4; Playwright 6/6 (buy.spec usa `.first()` por precio duplicado hero/sticky). Sin commit aún.
- Anterior: E2E admin real + fixes summary (commit `982cbef`); deploy compose listo (`ac1055b`); plan 002 admin launch (`a0f4f5a`).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `graphify` skill via the Skill tool before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.

## Skills y comandos disponibles (Claude Code)

Skills activos (invocar con `/skill-name` o via Skill tool):
- `/graphify` — grafo de conocimiento del codebase
- `/speckit-baseline`, `/speckit-clarify`, `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-checklist`, `/speckit-constitution`, `/speckit-converge` — flujo Spec Kit
- `/code-review`, `/security-review`, `/tdd`, `/accessibility`, `/docker-containerization`
- `/tailwind-v4-shadcn`, `/java-springboot`, `/fastify-best-practices`, `/nodejs-backend-patterns`
- `/git-commit`, `/git-workflow-and-versioning`, `/domain-driven-design`

Comandos slash del proyecto (`.claude/commands/`):
- `/speckit.analyze`, `/speckit.checklist`, `/speckit.clarify`, `/speckit.constitution`
- `/speckit.converge`, `/speckit.implement`, `/speckit.plan`, `/speckit.specify`, `/speckit.tasks`
