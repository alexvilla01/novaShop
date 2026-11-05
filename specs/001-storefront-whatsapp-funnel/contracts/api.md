# Contrato REST API: MVP Storefront

Base URL: `https://api.<dominio>` (backend OCI) · Autenticación admin por cookie de sesión httpOnly (`ns_admin_session`).

Formato de error estándar (todos los códigos según FR-012): `application/problem+json` con `{ "title": "mensaje amigable en español", "detail": "opcional", "status": <http> }`. Nunca stack traces ni detalles internos.

## Público (clientes anónimos)

### GET /api/health
- 200: `{ "status": "UP" }` — probe de despliegue.

### GET /api/categories
- 200: `[ { "id": 1, "name": "Electrónica", "slug": "electronica" } ]` — lista completa de categorías activas (para chips de navegación).

### GET /api/products?category={slug}&page=0&size=24
- 200: `{ "content": [ <ProductSummary> ], "totalElements": n, "page": 0 }`
  - ProductSummary: `{ id, slug, name, priceCents, imageUrl | null, categoryName, categorySlug, available }`
  - Solo productos `isActive=true` (catálogo público).
  - `available` = stock > 0 y activo.
- 404: categoría con slug inexistente.

### GET /api/products/{slug}
- 200: ProductDetail `{ id, slug, name, description, priceCents, imageUrls[], categoryName, categorySlug, stock, available }`
- 404: producto inexistente o inactivo (el catálogo público nunca revela inactivos).

### POST /api/orders
Genera orden preliminar y deep link de WhatsApp (uso del botón Comprar).

Request: `{ "productSlug": "auriculares-pro-x" }`

- 201: `{ "orderId": <id>, "whatsappUrl": "https://wa.me/<numero>?text=..." }`
- 400: cuerpo inválido.
- 404: producto no encontrado / inactivo.
- 409: producto sin stock (`title: "Producto no disponible"`).

Reglas (R-004): el número comercial vive en config backend; `quantity` implícita = 1; el payload del mensaje incluye nombre, precio formateado en MXN, cantidad y URL de la landing (`NS_PUBLIC_URL` + `/p/{slug}`).

## Administración (requiere sesión)

### POST /api/admin/session
Request: `{ "username": "...", "password": "..." }`
- 200: `{ "username": "..." }` + Set-Cookie httpOnly.
- 401: credenciales inválidas (mensaje genérico).

### GET /api/admin/session
- 200: sesión vigente. 401: sin sesión.

### DELETE /api/admin/session
- 204: cierra sesión (logout).

### GET /api/admin/products?page=0&size=50
- 200: lista completa (incluye inactivos): ProductSummary + `{ stock, origin: "PROPIO"|"DROPSHIPPING", isActive }`.
- 401: sin sesión.

### POST /api/admin/products
Request: `{ slug, name, description, priceCents > 0, stock ≥ 0, origin, imageUrls[] ≤ 5, categorySlug }`
- 201 con ProductDetail. 400: validaciones (precio, stock, slug duplicado o formato, categoría inexistente, más de 5 imágenes).

### PUT /api/admin/products/{id}
- 200 con ProductDetail. 400 validaciones. 404: id inexistente. 401 sin sesión.

### DELETE /api/admin/products/{id}
Baja lógica (isActive=false). Idempotente: si ya está inactivo responde 204.
- 204. 404: id inexistente. 401 sin sesión.

### GET /api/admin/orders?limit=50
- 200: `[ { id, createdAt, productSlug, productName, unitPriceCents, quantity, channel } ]` — más reciente primero (FR-011).
- 401 sin sesión.

## Convenciones

- Nombres JSON camelCase; dinero en centavos (entero); fechas ISO 8601 UTC.
- Solo los `GET` públicos requieren CORS de lectura; las mutaciones del admin solo aceptan peticiones desde el origen autorizado (`NS_CORS_ORIGINS`).
- Las respuestas de admin usan arrays directos en MVP (catálogo demo, volumen bajo); se dejan `page/size` para compatibilidad futura.
