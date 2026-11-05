# novaShop

Tienda storefront con venta directa por WhatsApp (sin carrito ni pasarela).
Monorepo SDD: especificación en `specs/001-storefront-whatsapp-funnel/`, constitución en `.specify/memory/constitution.md`.

## Stack
- **Backend**: Java 21 · Spring Boot 4.x (`backend/`) · paquete `mx.novashop.store` · PostgreSQL 15+ · Flyway
- **Frontend**: React 19 · Vite · Tailwind v4 · TypeScript (`frontend/`) CI: Node 22 · JDK 21

## Estructura
```
backend/  src/main/java/mx/novashop/store/{product,order,wa,admin,shared}
frontend/ src/{app,pages,admin,components,lib,styles}
```

## Quickstart
```bash
# Backend (requiere PostgreSQL y env NS_DB_URL / NS_DB_USER / NS_DB_PASSWORD,
# NS_WA_PHONE, NS_ADMIN_USER, NS_ADMIN_PASSWORD_HASH, NS_ADMIN_SECRET,
# NS_PUBLIC_URL, NS_CORS_ORIGINS)
cd backend && ./mvnw spring-boot:run

# Frontend (proxy /api → localhost:8080)
cd frontend && npm install && npm run dev
```

## Comandos de verificación
```bash
cd backend  && ./mvnw test          # pruebas de contrato admin/orden/catálogo
cd frontend && npm run test         # Vitest unitarias
cd frontend && npx playwright test  # E2E compra/admin (mocks incluidos)
```

## Flujo comercial
Landing `/p/{slug}` → botón **Comprar** → `POST /api/orders` crea orden preliminar y devuelve deep link → WhatsApp abre con nombre, precio MXN, cantidad y origen. Panel `/admin` (login por cookie httpOnly) gestiona catálogo y consulta órdenes.
