# Implementation Plan: Lanzamiento de Productos (Admin)

**Branch**: `002-admin-product-launch` | **Date**: 2026-11-07 | **Spec base**: [001/spec.md](../001-storefront-whatsapp-funnel/spec.md) (US3 extendida)

## Summary

Interfaz de administración dedicada para **crear y lanzar productos** con un flujo guiado: datos → imágenes (subida de archivos) → revisión → publicar. Los productos nuevos nacen como **borrador** (`isActive=false`) y se publican explícitamente; se añade previsualización de la tarjeta del catálogo y de la landing antes de lanzar. Las imágenes se suben al servidor (disco) y se sirven vía API, eliminando la dependencia de URLs externas.

## Decisiones clave (confirmadas con el usuario)

| # | Decisión | Implicación |
|---|----------|-------------|
| D1 | Subida de archivos al servidor | `POST /api/admin/products/images` (multipart) + almacenamiento en `NS_UPLOADS_DIR` + `GET /api/uploads/{file}` |
| D2 | Borrador → Publicar | Crear con `isActive=false`; endpoints `POST /{id}/publish` y `POST /{id}/unpublish` |
| D3 | Página dedicada | Ruta `/admin/productos/nuevo`; la tabla queda para listar/editar/desactivar |

## Technical Context

- **Backend**: Java 21, Spring Boot 4.1.2, JPA/Flyway existentes. Sin cambio de esquema: `producto_imagen` ya persiste URLs; se guardará la ruta relativa (`/api/uploads/{uuid}.{ext}`).
- **Frontend**: React 19 + React Router + Tailwind v4. Nueva página en `frontend/src/admin/ProductNewPage.tsx`, lazy-loaded como el resto del admin.
- **Storage**: directorio local `NS_UPLOADS_DIR` (dev: `./uploads`; prod: volumen Docker `/data/uploads`). Servido por controller con cache headers.
- **Auth**: el `AdminSessionFilter` ya protege `/api/admin/**`; uploads de lectura (`/api/uploads/*`) son públicos (son imágenes de catálogo).
- **Testing**: JUnit + MockMvc (standalone, clases `public`) para uploads/publicar; Vitest para validación y slug; Playwright mocked + extensión del E2E real.

## Contratos (nuevos)

```text
POST   /api/admin/products/images         multipart file(s) → { urls: ["/api/uploads/uuid.jpg"] }
GET    /api/uploads/{filename}            imagen (público, cache 30 días, immutable)
POST   /api/products                      body AdminProductRequest + isActive (default false)
POST   /api/admin/products/{id}/publish   → 200 producto publicado (isActive=true)
POST   /api/admin/products/{id}/unpublish → 200 producto como borrador (isActive=false)
```

Reglas del upload:
- MIME permitidos: `image/jpeg`, `image/png`, `image/webp` (validación por magic bytes, no solo header).
- Tamaño máx. 5 MB/archivo; máx. 5 imágenes por request/producto.
- Nombre destino: UUID + extensión derivada del tipo real (nunca el nombre original) → evita path traversal.
- Errores ProblemDetail 400/413 amigables.

## Cambios por módulo

### Backend
| Archivo | Cambio |
|---------|--------|
| `product/api/UploadController.java` (nuevo) | POST upload (admin) y GET imagen (público) |
| `product/app/ImageStorageService.java` (nuevo) | Validación tipo/tamaño, guardado atómico, lectura |
| `product/api/AdminProductController.java` | endpoints publish/unpublish; create respeta `isActive` |
| `product/app/AdminCatalogService.java` | `publish(id)` / `unpublish(id)`; create default borrador |
| `shared/NovaConfig.java` | bean `ImageStorageService`, propiedad `NS_UPLOADS_DIR` |
| `resources/application.yml` | `novashop.uploads-dir: ${NS_UPLOADS_DIR:./uploads}` |
| tests | `UploadContractTest` (auth, tipo inválido, tamaño, path traversal), `AdminProductPublishTest` |

### Frontend
| Archivo | Cambio |
|---------|--------|
| `admin/ProductNewPage.tsx` (nuevo) | Formulario guiado: Datos → Imágenes → Revisión; preview de tarjeta; guardar borrador / publicar |
| `admin/ImageUploader.tsx` (nuevo) | Drag & drop + file picker, thumbnails, eliminar, límites 5 archivos/5 MB |
| `admin/ProductsAdminPage.tsx` | Botón "Nuevo producto" navega a la página; acciones Publicar/Despublicar en tabla; columna Estado contempla borrador |
| `app/main.tsx` | Ruta `productos/nuevo` dentro del admin (lazy) |
| `lib/slug.ts` (nuevo) | Generación kebab-case desde nombre (acentos/mayúsculas) + validación |
| `lib/types.ts` | `isDraft`/`isActive` en payloads; `ImageUploadResponse` |
| tests | `slug.test.ts`, `productNew.test.tsx` (validaciones); E2E `admin-create.spec.ts` mocked + extensión real |

### Infra
| Archivo | Cambio |
|---------|--------|
| `deploy/docker-compose.yml` | volumen `uploads:/data/uploads` + `NS_UPLOADS_DIR=/data/uploads` en backend |
| `deploy/.env.example` / `deploy/README.md` | variable documentada |
| `AGENTS.md` | actualización de estado al cerrar |

## UX del flujo (página dedicada)

1. **Datos**: nombre → slug auto (editable), categoría, precio MXN, stock, origen, descripción. Validación espejo del backend con mensajes inline.
2. **Imágenes**: subir hasta 5 (drag & drop o selector), reordenar por primera = portada, eliminar.
3. **Revisión**: preview de la tarjeta (componente real `ProductCard`) y bloque resumen; aviso "se guardará como borrador".
4. **Acciones**: `Guardar borrador` (isActive=false, permanece en página con confirmación) y `Publicar ahora` (crear + publish → redirige a la tabla resaltando el producto).

## Seguridad
- Uploads protegidos por el filtro admin; MIME real por magic bytes; sin nombres originales; escritura en directorio dedicado.
- GET de imágenes: solo `[a-f0-9-]{36}\.(jpg|png|webp)`, sin `..`, served con `Content-Type` fijo y `X-Content-Type-Options: nosniff`.
- Publish/unpublish requieren sesión admin (mismo filtro).
- Sin secretos nuevos; `NS_UPLOADS_DIR` va por env.

## Plan de tareas (orden de ejecución)

- [ ] **F1 — Backend storage**: `ImageStorageService` + `UploadController` + config + tests de contrato (auth, tipo, tamaño, traversal).
- [ ] **F2 — Backend publicación**: `isActive` en create (default false) + publish/unpublish + tests de contrato.
- [ ] **F3 — Frontend base**: `slug.ts` + `ImageUploader` + `ProductNewPage` con validaciones y preview.
- [ ] **F4 — Integración admin**: ruta nueva, botón "Nuevo producto", acciones Publicar/Despublicar y estado Borrador en tabla.
- [ ] **F5 — E2E**: mocked `admin-create.spec.ts` (subir imagen fake, borrador no visible en catálogo, publicar → visible) + extensión del E2E real.
- [ ] **F6 — Infra/docs**: volumen Docker + env + README + AGENTS.md; verificación completa (backend 20+, Vitest, Playwright 6+, CI verde).

## Criterios de aceptación
1. Desde la UI puedo crear un producto con hasta 5 imágenes subidas y verlo como **borrador** (no aparece en catálogo público).
2. Un clic en **Publicar** lo hace visible en catálogo y landing, con imágenes servidas desde el backend.
3. **Despublicar** lo retira del catálogo sin borrar datos.
4. Uploads rechazan archivos > 5 MB o que no sean imagen real (magic bytes), con error amigable.
5. Sin sesión admin, `/api/admin/products/images` y publish/unpublish responden 401.
6. Suites verdes: backend tests, Vitest, Playwright (mocked + real) y CI.

## Fuera de alcance
- Variantes/SKUs múltiples, precios por mayoreo, programación de lanzamientos, editor rich-text, edición de imágenes (crop), CDN de imágenes.
- Reemplazo del formulario de edición inline existente (se mantiene).
