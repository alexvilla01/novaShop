# Quickstart: Validación end-to-end del MVP

Guía de ejecución y verificación de los tres escenarios de usuario (US1–US3 de spec.md).

## Prerrequisitos

- JDK 21 (`java -version`), Node 22 LTS (`node -v`), Docker (para DB local) o credenciales de Supabase.
- Repo: `backend/` (Spring Boot) y `frontend/` (Vite) en la raíz.

## Variables de entorno (mínimo)

```bash
# backend
export NS_DB_URL="jdbc:postgresql://localhost:5432/novashop"
export NS_DB_USER="novashop"
export NS_DB_PASSWORD="novashop"
export NS_WA_PHONE="5215500000000"          # número comercial demo
export NS_ADMIN_USER="admin"
export NS_ADMIN_PASSWORD_HASH="<bcrypt-hash>"
export NS_PUBLIC_URL="http://localhost:5173" # para payload De: <landing>
export NS_CORS_ORIGINS="http://localhost:5173"
```

DB local con seed demo:

```bash
docker run -d --name novashop-pg -e POSTGRES_DB=novashop \
  -e POSTGRES_USER=novashop -e POSTGRES_PASSWORD=novashop -p 5432:5432 postgres:16
# backend activa seed demo con flag de perfil demo (R-009)
```

## Arranque

```bash
# 1) Backend (terminal A) — puerto 8080
cd backend && ./mvnw spring-boot:run

# 2) Frontend (terminal B) — puerto 5173
cd frontend && VITE_API_URL=http://localhost:8080 npm run dev
```

## Escenario 1 — Compra vía WhatsApp (P1 · SC-001/SC-002/SC-007)

1. Abrir `http://localhost:5173/p/<slug-de-producto-activo>` (ver slug con `curl localhost:8080/api/products | head`).
2. Pulsar **Comprar**.
3. **Esperado**: se abre WhatsApp (web/app) con mensaje: nombre, precio MXN, "Cantidad: 1", y la URL de la landing como origen. En el backend, `curl -s localhost:8080/api/admin/orders -b cookie` (tras login) muestra la orden preliminar recién creada.

## Escenario 2 — Exploración de catálogo (P2 · SC-004)

1. Abrir `http://localhost:5173/` → catálogo con productos demo.
2. Filtrar por categoría (chips) → solo productos de esa categoría; estado vacío en categoría sin productos.
3. Abrir un producto → landing correspondiente. Verificar flujo con producto sin imágenes (placeholder) y con stock 0 (botón deshabilitado + "No Disponible").

## Escenario 3 — Administración (P3 · SC-005/SC-007)

1. Abrir `http://localhost:5173/admin` → login con `NS_ADMIN_USER` / password en claro cuyo hash es `NS_ADMIN_PASSWORD_HASH`.
2. Crear producto (nombre, precio, categoría, imagen opcional) → visible en catálogo; el slug se genera/valida.
3. Editar stock a 0 → landing muestra "No Disponible"; restablecer.
4. Ver órdenes → listado reciente-primero con la orden del Escenario 1.
5. Logout → recarga protegida devuelve 401 y redirige a login.

## Verificaciones de errores (FR-012)

- `curl -i localhost:8080/api/products/no-existe` → **404** con `problem+json` amigable.
- `curl -i -X POST localhost:8080/api/orders -H 'Content-Type: application/json' -d '{}'` → **400**.
- `curl -i localhost:8080/api/admin/products` (sin sesión) → **401**.
- Cualquier error reforzado del panel/frontend muestra mensaje amigable (nada de stack traces).

## Suite automatizada

```bash
cd backend && ./mvnw test        # contratos + unidad (JUnit 5)
cd frontend && npm run test      # unitaria (Vitest)
cd frontend && npx playwright test   # E2E journey P1
```

**Criterio de salida**: los 3 escenarios manuales en verde + suites automatizadas en verde = MVP listo para demo.
