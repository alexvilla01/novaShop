# Implementation Plan: MVP Storefront con Embudo de WhatsApp

**Branch**: `001-storefront-whatsapp-funnel` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-storefront-whatsapp-funnel/spec.md`

## Summary

Tienda pública de novaShop: catálogo por categorías, landing por producto y conversión exclusiva vía WhatsApp (deep link con payload estructurado) con registro de orden preliminar. Panel de administración mínimo para catálogo (stock propio/dropshipping) y consulta de órdenes. Implementación web de dos módulos desacoplados: frontend React 19 (Vite) y API Spring Boot sobre PostgreSQL.

## Technical Context

**Language/Version**:
- Backend: Java 21 LTS, Spring Boot 4.1.2 (constitución enmendada a "3.x o superior", v1.0.1)
- Frontend: TypeScript + React 19.3 (Vite 8.3); Node 22 LTS como objetivo (entorno local v26 declarado como desviación operativa)

**Primary Dependencies**:
- Backend: spring-boot-starter-web, starter-data-jpa, starter-validation, driver PostgreSQL, Flyway (migraciones)
- Frontend: react-router (rutas públicas + admin), Tailwind CSS v4 vía @tailwindcss/vite, fetch nativo (estado por hooks; sin librería global de estado)

**Storage**: PostgreSQL 15+ (Supabase free tier u OCI; credenciales por variables de entorno)

**Testing**: Backend: JUnit 5 + MockMvc (contratos) y Mockito (unidad) con `mvnw test`. Frontend: Vitest + React Testing Library (`npm run test`); E2E del flujo P1 con Playwright. Validación manual según `quickstart.md`.

**Target Platform**: Web responsive mobile-first. Frontend en Vercel/Cloudflare Pages (free tier); backend en OCI Always Free (jar ejecutable); base de datos administrada externa.

**Project Type**: Web application — SPA + API REST desacopladas.

**Performance Goals**: Landing operativa en menos de 3 segundos en móvil típica (SC-003); API p95 menor a 300 ms por operación simple en LatAm (soporta SC-001/SC-002).

**Constraints**:
- Bootstrap: solo free tiers, costo fijo cero.
- Sin carrito ni pasarela de pago (FR-009): única conversión = deep link de WhatsApp.
- Nunca exponer errores técnicos al usuario final (FR-012).
- 1 producto por orden preliminar; cantidad fija = 1 en MVP (FR-005).
- Hasta 5 imágenes por producto (supuesto de spec); imágenes por URL externa (sin uploader en MVP).

**Scale/Scope**: 1 operador admin; catálogo inicial de 5 a 10 productos y 4 a 5 categorías; tráfico bajo/medio (miles de visitas por mes); aproximadamente 6 pantallas públicas y 4 de administración.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| ID | Principio (constitución) | Estado | Evidencia |
|----|--------------------------|--------|-----------|
| CC-001 | Frontend React 19 + Vite + Tailwind; estructura /frontend | PASS | frontend/ con Vite 8.3, React 19.3 y Tailwind v4 |
| CC-002 | Backend Java 21 + Spring Boot 3.x o superior; virtual threads | PASS (enmendado v1.0.1) | Java 21 confirmado; Boot 4.1.2 cabe en la constitución enmendada; `spring.threads.virtual.enabled=true` (R-007) |
| CC-003 | PostgreSQL 15+ con JPA parametrizado | PASS | starter-data-jpa + driver PostgreSQL; consultas derivadas/JPQL en contratos, sin SQL concatenado |
| CC-004 | Errores UI amigables + HTTP semánticos (400/401/404/500) | PASS | api.md documenta esos códigos; diseño UI con error boundary y fallbacks (FR-012) |
| CC-005 | Sin carrito multi-producto ni pasarela (MVP) | PASS | Contratos no exponen endpoints de checkout/carrito; órdenes preliminares no implican pago |
| CC-006 | Conversión exclusiva por WhatsApp | PASS | POST /orders devuelve deep-link wa.me; Evolution API/IA quedan fuera de fase |
| CC-007 | Nomenclatura camelCase/PascalCase/kebab-case; React functional con hooks; Records en Java | PASS | Reglas reflejadas en data-model.md y a incluir en tasks.md |
| CC-008 | Cero shadow code | PASS | Especificación acotada; Dropi/Shopify/Evolution/IA explícitamente fuera del MVP |

## Project Structure

### Documentation (this feature)

```text
specs/001-storefront-whatsapp-funnel/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   └── api.md           # Contrato REST pública + admin
└── tasks.md             # Fase 2 (/speckit.tasks; NO se crea aquí)
```

### Source Code (repository root)

```text
backend/                          # Spring Boot (mx.novashop.store)
├── src/main/java/mx/novashop/store/
│   ├── NovaShopStoreApplication.java
│   ├── product/                  # Capas: api/ app/ domain/ repo/
│   │   ├── api/                  # ProductController, AdminProductController
│   │   ├── app/                  # ProductService (reglas de catálogo y stock)
│   │   ├── domain/               # ProductDTO (record), ProductEntity, CategoryEntity
│   │   └── repo/                 # Repositorios Spring Data JPA
│   ├── order/                    # Orden preliminar: api/ app/ domain/ repo/
│   ├── wa/                       # Generación de deep-link WhatsApp (config)
│   ├── admin/                    # Autenticación simple por credencial configurada
│   └── shared/                   # Manejo de errores amigables, config, utilidades
├── src/main/resources/
│   ├── application.yml           # Config por entorno: DB, WhatsApp, admin, CORS
│   └── db/migration/             # Flyway: V1 esquema
└── src/test/java/                # Pruebas unitarias y de contrato

frontend/                         # React 19 + Vite
├── src/
│   ├── app/                      # Router + layouts público/admin
│   ├── pages/                    # Home, Landing (por slug), Category, NotFound
│   ├── admin/                    # Login, ProductsAdmin, OrdersAdmin
│   ├── components/               # ProductCard, BuyButton, CategoryChips, EmptyState, ErrorFallback
│   ├── lib/                      # apiClient (fetch + errores), formatters
│   └── styles/                   # Tema visual novaShop (Tailwind)
└── tests/                        # Vitest (unidad) + Playwright (E2E)
```

**Structure Decision**: Estructura web application (frontend + backend desacoplados) exigida por la constitución (sección 4). Backend organizado en capas por feature vertical (product/order/wa/admin/shared) con Controller/Service/Repository/Model; DTOs declarados como Records (estilo Java moderno requerido en sección 4).

## Complexity Tracking

> Sin violaciones. Resolución de la única desviación detectada (CC-002): constitución enmendada a v1.0.1 ("Spring Boot 3.x o superior"), Boot 4.1.2 confirmado. Desviación residual ambiental: Node local v26 (se ancla Node 22 en CI y campo engines; no afecta diseño).
