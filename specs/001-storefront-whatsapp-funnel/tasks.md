---
description: "Task list for MVP Storefront con Embudo de WhatsApp"
---

# Tasks: MVP Storefront con Embudo de WhatsApp

**Input**: Design documents from `/specs/001-storefront-whatsapp-funnel/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: incluidos (contrato MockMvc + unitarios Vitest + E2E Playwright) según research.md R-010 y quickstart.md.

**Organization**: agrupadas por historia de usuario para implementación y prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralelizable (archivos distintos, sin dependencias)
- **[Story]**: US1, US2, US3 según spec.md
- Rutas de archivos exactas en cada tarea

## Path Conventions

- Web app: `backend/src/` (Spring Boot, paquete `mx.novashop.store`), `frontend/src/` (Vite SPA)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inicializar estructura del monorepo y configuración base

- [x] T001 [P] Limpiar template demo de Vite y crear estructura `frontend/src/{app,pages,admin,components,lib,styles}` según plan.md
- [x] T002 [P] Configurar `backend/src/main/resources/application.yml`: props `NS_DB_*`, `NS_WA_PHONE`, `NS_ADMIN_*`, `NS_PUBLIC_URL`, `NS_CORS_ORIGINS` (research R-008) y `spring.threads.virtual.enabled=true` (R-007)
- [x] T003 [P] Crear tema Tailwind novaShop en `frontend/src/styles/theme.css` (paleta de marca, radio, tipografía) e importar en main
- [x] T004 [P] Crear `.github/workflows/ci.yml` (JDK 21 + Node 22 matrix, `./mvnw test`, `npm ci && npm run build/test`) y anclar `"engines": {"node": ">=22 <23"}` en `frontend/package.json`
- [x] T005 [P] Copiar `img/logonovaShop.jpg` a `frontend/public/` y definir título/idioma es en `frontend/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: entidades, esquema, manejo de errores e infraestructura común que bloquean todas las historias

**⚠️ CRITICAL**: ninguna historia empieza antes de completar esta fase

- [x] T006 Implementar `CategoryEntity` y `ProductEntity` (reglas textuales de data-model.md: slug único kebab-case `[a-z0-9-]+`, priceCents > 0, stock ≥ 0, origin enum PROPIO/DROPSHIPPING, isActive default true, imageUrls ≤ URLs válidas ≤ 5, createdAt/updatedAt timestamptz) en `backend/src/main/java/mx/novashop/store/product/domain/`
- [x] T007 Implementar `OrderEntity` (productId FK, productName snapshot, unitPriceCents snapshot, quantity fijo 1, channel enum WHATSAPP, createdAt) y repositorios Spring Data (`findBySlug`, `findByCategorySlugAndIsActiveTrue`, `findAllByOrderByCreatedAtDesc`) en `backend/src/main/java/mx/novashop/store/order/domain/` y `repo/`
- [x] T008 Crear migraciones Flyway `backend/src/main/resources/db/migration/V1__schema.sql` (tablas categoria/producto/orden + índices UNIQUE(slug), (category_id, is_active), (created_at DESC)) y `V2__seed_demo.sql` (5–10 productos, 4–5 categorías, flag demo)
- [x] T009 Implementar manejo global de errores amigable `shared/ApiExceptionHandler.java` (ProblemDetail RFC 7807 en español; 400/401/404/500 sin stack traces) y `GET /api/health` en `shared/`
- [x] T010 [P] Implementar `frontend/src/lib/apiClient.ts` (fetch wrapper: URL base por env `VITE_API_URL`, MAPEO de códigos a mensajes amigables, cookies credentials para admin) y formatters (precio MXN desde centavos) en `frontend/src/lib/format.ts`
- [x] T011 [P] Configurar router base con layouts en `frontend/src/app/`: rutas `/`, `/p/:slug`, `/c/:slug`, `/admin` con layouts Público y Admin vacíos y `ErrorFallback` global
- [x] T012 [P] Implementar generador de deep-link WhatsApp `backend/src/main/java/mx/novashop/store/wa/WaLinkGenerator.java` (wa.me + payload "Hola, me interesa *{name}* (${price} MXN).\nCantidad: 1\nDe: {landing}", URL-encode, número desde config)

**Checkpoint**: fundación lista — las 3 historias pueden implementarse en paralelo

---

## Phase 3: User Story 1 - Compra directa desde la Landing por WhatsApp (Priority: P1) 🎯 MVP

**Goal**: visitante en landing pulsa Comprar → WhatsApp abre con payload estructurado + orden preliminar registrada (FR-004/005/006, SC-001/002/007)

**Independent Test**: abrir landing de producto activo → pulsar Comprar → WhatsApp URL correcta + orden visible en admin; no requiere catálogo ni panel

### Tests for User Story 1

- [x] T013 [P] [US1] Prueba de contrato `POST /api/orders` (201 con whatsappUrl wa.me correcto; 404 producto inexistente/inactivo; 409 sin stock; 400 cuerpo inválido) en `backend/src/test/java/mx/novashop/store/order/OrderContractTest.java`
- [x] T014 [P] [US1] Test E2E Playwright del journey P1 (landing → Comprar → URL de WhatsApp con producto/precio/origen) en `frontend/tests/e2e/buy.spec.ts`

### Implementation for User Story 1

- [x] T015 [US1] Implementar `OrderService` (valida disponibilidad según FR-007, snapshot de precio/nombre, persiste orden) y endpoint `POST /api/orders` en `backend/src/main/java/mx/novashop/store/order/` (contract contracts/api.md)
- [x] T016 [P] [US1] Implementar página Landing `frontend/src/pages/LandingPage.tsx` (mobile-first: fetch por slug, gallery con placeholder de componente propio cuando imageUrls esté vacío o falle la imagen, precio MXN, estado "No Disponible" si !available, metatags de producto)
- [x] T017 [US1] Implementar `frontend/src/components/BuyButton.tsx` (POST /orders → `window.location.href = whatsappUrl`; fallback web WhatsApp si popup bloqueado; estado "Agregado" 1.5s; deshabilitado si no disponible)
- [x] T018 [US1] Wire US1 completo: conectar LandingPage + BuyButton + orden preliminar (posición del botón prominente FR-004) y verificar SC-001 manual

**Checkpoint**: US1 demoable de forma independiente (venta por WhatsApp completa)

---

## Phase 4: User Story 2 - Explorador de Catálogo en la Página General (Priority: P2)

**Goal**: navegación catálogo con filtro por categoría y acceso ≤ 2 clics a cualquier landing (FR-001/002/003, SC-004)

**Independent Test**: abrir `/` → grid de productos; filtrar categoría; abrir producto → landing; con datos demo no depende de US1 ni US3

### Tests for User Story 2

- [x] T019 [P] [US2] Pruebas de contrato públicos `GET /api/products?category=`, `GET /api/products/{slug}`, `GET /api/categories` (200 sumarios con available; 404 slug inexistente/inactivo; estado vacío de categoría) en `backend/src/test/java/mx/novashop/store/product/ProductContractTest.java`
- [x] T020 [P] [US2] Tests Vitest de `ProductCard` (precio formateado, estado No Disponible, placeholder de imagen) y componente `CategoryChips` en `frontend/src/lib/__tests__/`

### Implementation for User Story 2

- [x] T021 [US2] Implementar `ProductService` + endpoints públicos list/detail/categories con consultas JPA derivadas en `backend/src/main/java/mx/novashop/store/product/` (contract contracts/api.md)
- [x] T022 [P] [US2] Implementar `frontend/src/components/ProductCard.tsx` (imagen con fallback placeholder, nombre, precio MXN, chip de categoría, indicador de disponibilidad) y `frontend/src/components/EmptyState.tsx` (mensaje "Sin productos en esta categoría" según FR-002)
- [x] T023 [US2] Implementar Home `frontend/src/pages/HomePage.tsx` (grid responsive de ProductCards con fetch apiClient) y Category `frontend/src/pages/CategoryPage.tsx` (filtrado por slug de categoría)
- [x] T024 [US2] Implementar `frontend/src/pages/NotFoundPage.tsx` (404 amigable siempre, sin mensajes crudos) y estados de carga skeleton en grid y landing
- [x] T025 [US2] Implementar metadata SEO (R-011): título/description/og:image por producto en `LandingPage.tsx`, además de `robots.txt` y `sitemap.xml` del catálogo en `frontend/public/`
- [x] T026 [US2] Verificar SC-004 manual/E2E: barra de navegación sólida a producto en ≤ 2 clics desde la página general

**Checkpoint**: US1 + US2 independientes y funcionales

---

## Phase 5: User Story 3 - Administración de Catálogo y Órdenes (Priority: P3)

**Goal**: admin autenticado gestiona productos (CRUD + baja lógica + stock/origen) y consulta órdenes preliminares (FR-010/011, SC-005/SC-007)

**Independent Test**: login con credencial configurada → crear/editar/desactivar producto y reflejar en métricas públicas — el catálogo público refleja los órdenes registrados; consultas de órdenes con lo generado en US1

### Tests for User Story 3

- [x] T027 [P] [US3] Pruebas de contratos admin en `backend/src/test/java/mx/novashop/store/admin/AdminContractTest.java`: session 200/401, POST/PUT productos con validaciones 400 (priceCents > 0, stock ≥ 0, ≤ 5 imágenes, slug único), DELETE baja lógica idempotente 204, GET /api/admin/orders orden reciente-primero, 401 sin sesión
- [x] T028 [P] [US3] Test E2E Playwright del flujo admin (login → crear producto → visible en catálogo; editar stock a 0 → "No Disponible") en `frontend/tests/e2e/admin.spec.ts`

### Implementation for User Story 3

- [x] T029 [US3] Implementar autenticación admin `backend/src/main/java/mx/novashop/store/admin/`: filtro de sesión (cookie httpOnly SameSite=Lax firmada), `POST/GET/DELETE /api/admin/session` con credenciales BCrypt desde config (R-005), 401 semántico
- [x] T030 [US3] Implementar `AdminProductController` (lista con inactivos + origin/stock, CREATE/PUT validaciones de data-model, DELETE baja lógica idempotente) en `backend/src/main/java/mx/novashop/store/product/api/`
- [x] T031 [P] [US3] Implementar `GET /api/admin/orders` (listado reciente-primero) en `backend/src/main/java/mx/novashop/store/order/api/AdminOrderController.java`
- [x] T032 [P] [US3] Implementar `frontend/src/admin/LoginPage.tsx` + guard de layout Admin (session check → redirect a login si 401)
- [x] T033 [US3] Implementar `frontend/src/admin/ProductsAdminPage.tsx` (tabla con estado/origin/stock, formulario Create/Edit con validaciones frontend espejo de backend: precio > 0, stock ≥ 0, ≤ 5 URLs, campos obligatorios; acciones desactivar/reactivar) en `frontend/src/admin/`
- [x] T034 [US3] Implementar `frontend/src/admin/OrdersAdminPage.tsx` (tabla fecha-hora ISO local, producto, cantidad, precio MXN, canal) y verificar SC-007 con la orden generada en US1

**Checkpoint**: 3 historias independientes y funcionales (demo completa)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: mejoras transversales y cierre de validación

- [x] T035 [P] Actualizar README raíz (stack, comandos de quickstart.md resumidos, estructura del monorepo)
- [x] T036 [P] Security hardening: revisar headers de respuesta, alcance CORS, cookies de sesión, constants de mensajes sin leaks (skill security-review)
- [x] T037 Performance check: Lighthouse móvil landing ≥ 85 (SC-003), lazy a imágenes si hace falta, bundle < 200KB gzip en cambio virtual
- [x] T038 Ejecutar validación completa manual de quickstart.md (3 escenarios) + suites automatizadas (`./mvnw test`, `npm run test`, `npx playwright test`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; T001–T005 todos [P] en paralelo
- **Foundational (Phase 2)**: depende de Setup; T006→T007 (FK orden→producto); T008 depende de T006/T007; T009/T010/T011/T012 [P]; **BLOQUEA todas las historias**
- **US1 (Phase 3)**: requiere Foundational; primero tests T013/T014 → luego T015 → T016/T017 (paralelizable T016) → T018
- **US2 (Phase 4)**: requiere Foundational; independiente de US1; T021 tras T019; UI T022–T024 paralelizable
- **US3 (Phase 5)**: requiere Foundational; la verificación de órdenes con US1 (T034) — no dependencia de implementación, solo de datos demo o flujo US1
- **Polish (Phase 6)**: depende de las historias incluidas

### Within Each User Story

1. Tests de contrato primero (deben FALLAR)
2. Service/endpoint
3. UI/componentes [P]
4. Integración + verificación del checkpoint

### Parallel Opportunities

- Setup: T001–T005 (5 en paralelo)
- Foundational: T009–T012 en paralelo
- Entre historias: US1/US2/US3 pueden implementarse en paralelo por distintos desarrolladores tras Phase 2
- Dentro de cada historia: tests [P] al inicio; UI components [P] al final

---

## Implementation Strategy

### MVP First (solo User Story 1)

1. Phase 1 Setup
2. Phase 2 Foundational (crítico)
3. Phase 3 US1 → STOP → validar independiente (quickstart Escenario 1)
4. Demo de venta por WhatsApp ya funcional

### Incremental Delivery

1. Setup + Foundational → fundación
2. US1 → validar → demo (MVP!)
3. US2 → validar → demo (catálogo navegado)
4. US3 → validar → demo completa con administración
5. Phase 6 Polish → release

---

## Notes

- Cada tarea cierra con commit atómico (skill git-commit)
- Respetar reglas constitucionales: camelCase/PascalCase/kebab-case, Records Java, sin carrito/pagos, errores amigables en todo punto
- Cero código sombra: si surge necesidad fuera de spec → detener y actualizar spec (regla 6 de constitución)
