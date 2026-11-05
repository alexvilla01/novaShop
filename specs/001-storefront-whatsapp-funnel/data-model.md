# Data Model: MVP Storefront con Embudo de WhatsApp

Estilo (constitución §4): nomenclatura kebab-case para rutas/archivos, camelCase para atributos, PascalCase para entidades/clases; DTOs como Records. Dinero siempre en centavos enteros (sin flotantes).

## Entidades

### ProductEntity → Producto

Representa un ítem del catálogo; cada landing corresponde a un producto activo.

| Atributo | Tipo | Reglas de validación |
|----------|------|----------------------|
| id | Long (PK) | generada por secuencia |
| slug | String 120 | UNIQUE; kebab-case; patrón `[a-z0-9-]+`; obligatorio |
| name | String 140 | obligatorio, no vacío |
| description | String 2000 | obligatorio |
| priceCents | Integer | > 0 |
| stock | Integer | ≥ 0 |
| origin | Enum | `PROPIO` o `DROPSHIPPING` (oculto al cliente en MVP: la compra es idéntica) |
| isActive | Boolean | control de baja lógica (default `true`) |
| imageUrls | List<String> ≤ 5 | cada URL http(s) válida; vacío permitido (placeholder) |
| categoryId | Long (FK) | categoría existente; obligatoria |
| createdAt / updatedAt | timestamptz UTC | auditoría automática |

Transición de estado: `activo ⇄ inactivo (baja lógica)` solo por parte del admin. Eliminar con DELETE nunca borra físicamente la fila mientras existan órdenes asociadas (auditoría).

Índices: UNIQUE(slug); índice (category_id, is_active); índice (created_at DESC) en órdenes.

Regla de negocio: los cambios de precio/stock se reflejan de inmediato en la disponibilidad de compra (FR-007).

### CategoryEntity → Categoría

| Atributo | Tipo | Reglas |
|----------|------|--------|
| id | Long (PK) | |
| name | String 80 | obligatorio; único |
| slug | String 90 | UNIQUE; kebab-case |

Sembradas en demo: 4–5 categorías. Sin jerarquía en MVP.

### OrderEntity → Orden preliminar

Registro auditado de la intención de compra generada al pulsar Comprar. No implica pago ni movimientos de inventario.

| Atributo | Tipo | Reglas |
|----------|------|--------|
| id | Long (PK) | |
| productId | Long (FK) | producto existente en el momento de compra |
| productName | String 140 | snapshot del nombre (auditoría si el producto cambia) |
| unitPriceCents | Integer | snapshot del precio vigente al generarse el payload |
| quantity | Integer | fijo = 1 en MVP |
| channel | Enum | `WHATSAPP` (único canal por constitución) |
| createdAt | timestamptz UTC | ordenado desc para admin (FR-011) |

Índice: (created_at DESC). Retención: sin borrado en MVP.

### Administrador (sin tabla)

Credencial administrativa única por configuración (`NS_ADMIN_USER` + hash BCrypt). No hay entidad de usuario; sesiones en memoria firmada httpOnly.

## Diagrama de relaciones

```text
Categoria 1 ──── n Producto 1 ──── n OrdenPreliminar
```

## Notas de cumplimiento

- Consultas JPA parametrizadas/derivadas (CC-003): `findBySlug`, `findByCategorySlugAndIsActiveTrue`, `findAllByOrderByCreatedAtDesc`.
- Ninguna consulta construye SQL por concatenación; valores por parámetros.
- Unicidad: slug de producto/categoría; conflicto → 400 en admin con mensaje claro.
