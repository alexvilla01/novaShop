# Research: MVP Storefront con Embudo de WhatsApp

Fecha: 2026-11-03 · Alcance: resolver decisiones técnicas e integraciones del plan.

## R-001 Despliegue y hosting del frontend

- **Decision**: Vercel con preview por PR; dominio propio vía Cloudflare.
- **Rationale**: deploy automático de Vite con build estándar; los previews permiten validar la landing antes de publicar; el free tier es suficiente para tráfico bootstrap.
- **Alternatives considered**: Cloudflare Pages (equivalente válido, fallback); hosting estático en OCI (requiere gestionar TLS/CDN propio, más toil).

## R-002 Hosting de base de datos

- **Decision**: PostgreSQL 15+ administrado (Supabase free tier como primario; OCI nativo como alternativa).
- **Rationale**: operación sin servidor de base de datos propio; backups incluidos; migraciones vía Flyway versionadas.
- **Alternatives considered**: PostgreSQL en VM OCI (más control, más operación); SQLite (no cumple la constitución).

## R-003 Imágenes de producto en MVP

- **Decision**: Imágenes por URL externa (Supabase Storage público u hosting externo) administradas manualmente; placeholder del sistema ante falta o fallo de carga.
- **Rationale**: la spec no exige uploader en el MVP; elimina almacenamiento y procesamiento de archivos en el backend; hasta 5 URLs por producto.
- **Alternatives considered**: uploader con almacenamiento en VM OCI (persistencia frágil entre despliegues, más complejidad); imágenes embebidas en base de datos (sobreingeniería).

## R-004 Generación del deep link de WhatsApp

- **Decision**: El backend genera la URL `https://wa.me/<numero>?text=<payload-url-encoded>` en `POST /api/orders`, leyendo el número comercial de la configuración del entorno; el frontend solo llama a la API y abre el enlace devuelto. El número no queda expuesto en el bundle del frontend.
- **Rationale**: centraliza la configuración del canal; permite rotar el número comercial sin redeploy del frontend; el registro de la orden y el link se generan en una única llamada atómica.
- **Payload**: "Hola, me interesa *{productName}* (${price} MXN).\nCantidad: 1\nDe: {landingUrl}".
- **Alternatives considered**: armar el link en el frontend (expone el número y duplica la regla de negocio); API oficial de WhatsApp Business (fuera del MVP, requiere aprobación del canal).

## R-005 Autenticación de administrador

- **Decision**: `POST /api/admin/session` valida contra credencial configurada (usuario y hash BCrypt en variables de entorno) y emite cookie de sesión httpOnly; los endpoints de administración responden 401 sin sesión válida.
- **Rationale**: la constitución define un perfil admin único gestionado por configuración; evita módulo de usuarios y roles (sobreingeniería); cumple 401 semántico (CC-004).
- **Alternatives considered**: JWT en localStorage (mayor exposición XSS; innecesario para un operador); OAuth externo (dependencia y costo de gestión).

## R-006 ¿Mantener Spring Boot 4.1.2 o degradar a 3.5.x? — ADVISORY, requiere decisión

- **Contexto**: la constitución indica "Spring Boot 3.x"; el scaffold de start.spring.io entrega 4.1.2 (Java 21, virtual threads soportados).
- **Opción A (recomendada)**: mantener 4.1.2 y enmendar la constitución a "Spring Boot 3.x o superior". Conserva versiones soportadas y evita el trabajo de downgrade.
- **Opción B**: degradar el pom a spring-boot-starter-parent 3.5.x. Cumplimiento literal, con costo de revisión de incompatibilidades.
- **Estado**: pendiente de decisión del usuario; no bloquea la generación de tareas si se decide ahora.

## R-007 Hilos virtuales

- **Decision**: `spring.threads.virtual.enabled=true` en application.yml; sin cambios en la lógica de servicios (carga IO-bound: base de datos y generación de link).
- **Rationale**: requisito de la constitución para concurrencia; soportado nativamente en el stack elegido.
- **Alternatives considered**: WebFlux reactivo (sobreingeniería para el volumen del MVP; contradice la regla de evitar sobreingeniería).

## R-008 Configuración por entorno

- **Decision**: `application.yml` único + variables: `NS_DB_URL`, `NS_DB_USER`, `NS_DB_PASSWORD`, `NS_WA_PHONE` (número comercial), `NS_ADMIN_USER`, `NS_ADMIN_PASSWORD_HASH`, `NS_PUBLIC_URL` (URL del frontend para armado de payload), `NS_CORS_ORIGINS`.
- **Rationale**: patrón 12-factor; los valores se inyectan en OCI/Vercel; los secretos viven fuera del repositorio.
- **Alternatives considered**: perfiles de Spring por entorno (más artefactos de configuración que aún no se necesitan).

## R-009 Migraciones y datos sembrados

- **Decision**: Flyway con `V1__schema.sql` (tablas producto/categoria/orden) y `V2__seed_demo.sql` (5–10 productos, 4–5 categorías) activable solo por flag de demo.
- **Rationale**: quickstart reproducible sin creación ad-hoc de datos; el seed versionado queda separado del esquema productivo.
- **Alternatives considered**: seed por `ApplicationRunner` (menos auditable que SQL versionado).

## R-010 Estrategia de pruebas

- **Decision**: Backend: pruebas de contrato con MockMvc por endpoint de api.md (incluye 400/401/404) y unitarias de Service con Mockito; base real con Testcontainers cuando esté disponible. Frontend: Vitest para apiClient y componentes críticos (BuyButton, ProductCard); Playwright para el journey principal (landing, comprar, payload correcto).
- **Rationale**: cubre el gate de errores semánticos (FR-012) y el payload de WhatsApp (SC-002) sin una suite excesiva para el alcance.

## R-011 SEO y compartición en redes de las landings

- **Decision**: metadata por producto (título, descripción, og:image) en la landing; `sitemap.xml` y `robots.txt` generados del catálogo; pre-render para bots de redes como mejora en fase de tareas (nested behind a task, no requisito nuevo).
- **Rationale**: el tráfico entra por redes; el snapshot de OpenGraph determina el CTR con costo mínimo en el frontend.
- **Alternatives considered**: SSR completo (contradice la elección SPA + Vite del stack); no hacer nada (degrada el CTR).

## R-012 CORS y cookies

- **Decision**: CORS del backend restringido al dominio del frontend configurado; cookie de admin SameSite=Lax y httpOnly.
- **Rationale**: la API pública es de solo lectura para clientes; las mutaciones del panel provienen únicamente del origen autorizado.

## Hallazgos menores

- El enlace wa.me funciona sin app instalada en la mayoría de los casos: en escritorio abre WhatsApp Web (edge case definido en la spec).
- El free tier de Supabase pausa proyectos inactivos: si la tienda queda inactiva tras la demo, operar con OCI nativo (nota operativa, no bloqueante).
