# novaShop — estado del proyecto

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
