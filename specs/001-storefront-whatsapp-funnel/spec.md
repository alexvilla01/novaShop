# Feature Specification: MVP Storefront de novaShop con Embudo de WhatsApp

**Feature Branch**: `001-storefront-whatsapp-funnel`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "MVP de la tienda novaShop conforme a la constitución: página general, landing pages por producto, catálogo por categorías, botón de compra que genera payload estructurado hacia WhatsApp asistido por IA, y panel mínimo de administración de catálogo/stock con registro inicial de órdenes. Excluye carrito multi-producto y pasarela de pago."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compra directa desde la Landing por WhatsApp (Priority: P1)

Un visitante llega desde una red social a la landing page de un producto. Explora nombre, fotos, precio y descripción, y pulsa el botón "Comprar". El sistema abre WhatsApp con un mensaje estructurado (producto, cantidad por defecto 1, precio unitario y URL de la landing de origen) para continuar la conversación con el asistente de ventas automatizado. De forma silenciosa, el sistema registra una orden preliminar con la intención de compra.

**Why this priority**: es el núcleo de negocio del MVP (conversión del embudo). Sin este flujo el producto no tiene valor comercial.

**Independent Test**: puede probarse accediendo a una landing disponible y pulsando "Comprar": debe abrirse WhatsApp con mensaje correcto y crearse la orden preliminar. No requiere catálogo completo ni panel de administración.

**Acceptance Scenarios**:

1. **Given** un producto visible con stock disponible, **When** el visitante pulsa "Comprar", **Then** se abre WhatsApp con un mensaje que contiene nombre del producto, cantidad (1 por defecto), precio unitario y URL de origen.
2. **Given** un producto visible con stock disponible, **When** se genera el payload de compra, **Then** se registra una orden preliminar persistente (fecha-hora, producto, cantidad, precio unitario, canal WhatsApp).
3. **Given** un visitante en dispositivo móvil, **When** abre la landing desde redes sociales, **Then** percibe la página completa y funcional sin exposición de errores técnicos.

---

### User Story 2 - Explorador de Catálogo en la Página General (Priority: P2)

Un visitante llega a la página general de novaShop, ve el catálogo de productos activos y navega por categorías. Puede abrir cualquier producto para ver su landing. Los productos agotados o dados de baja no se presentan como comprables.

**Why this priority**: habilita la navegación y descubrimiento para tráfico orgánico y directo; sostiene el paso hacia la landing (Historia 1). El valor comercial existe incluso si se implementa después de la Historia 1.

**Independent Test**: puede probarse realizando la navegación en la página general: ver listado, filtrar por categoría y abrir un producto. No depende del embudo ni del panel de administración (basta con datos sembrados de demo).

**Acceptance Scenarios**:

1. **Given** productos activos cargados, **When** el visitante navega la página general, **Then** ve el catálogo con nombre, precio, categoría e indicador de disponibilidad de cada producto.
2. **Given** el visitante en la página general, **When** selecciona una categoría, **Then** solo ve los productos correspondientes a dicha categoría.
3. **Given** un producto activo, **When** el visitante hace clic sobre él, **Then** accede a su landing page.

---

### User Story 3 - Administración de Catálogo y Órdenes (Priority: P3)

Un administrador autenticado gestiona el catálogo: crear, actualizar (nombre, fotos, precio, categoría, descripción) y dar de baja productos (baja lógica), así como cambiar el estado de stock indicando si es stock propio o dropshipping. También consulta los registros iniciales de órdenes preliminares generadas desde el botón de compra.

**Why this priority**: es necesario para operar la tienda, pero el valor comercial (Historias 1 y 2) puede existir sin él (datos demo). La administración alimenta la operación diaria y la auditoría.

**Independent Test**: puede probarse accediendo al panel con credenciales admin: crear un producto y confirmarlo en el catálogo; cambiar stock/origen y verificar la disponibilidad resultante; revisar listado de órdenes.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** crea un producto con datos válidos, **Then** el producto queda guardado y visible en catálogo (o no disponible si su stock es 0).
2. **Given** un producto existente, **When** el administrador cambia stock u origen (propio/dropshipping), **Then** el cambio se refleja en catálogo y en la disponibilidad de compra.
3. **Given** órdenes preliminares registradas, **When** el administrador consulta la pantalla de órdenes, **Then** ve el listado (fecha-hora, producto, cantidad, precio, canal) del más reciente al más antiguo.

### Edge Cases

- Producto que se agota o desactiva entre que el visitante abrió el catálogo y pulsó "Comprar": se muestra estado "No Disponible" y el botón queda deshabilitado; no se genera payload ni orden.
- Producto dado de baja por el administrador con órdenes preliminares previas: las órdenes históricas permanecen visibles en administración (auditoría); el producto desaparece del catálogo público.
- Visitante sin WhatsApp instalado (escritorio sin app): el botón usa un enlace universal de WhatsApp con alternativa web; nunca se rompe el flujo.
- Producto sin imágenes o con carga de imagen fallida: se muestra una imagen placeholder del sistema; el descubrimiento del producto no falla.
- Datos inválidos del administrador (precio negativo o cero, nombre vacío, stock negativo): se muestran mensajes de validación claros y nada inconsistente se persiste.
- Error interno del servidor durante el flujo del cliente: mensaje amigable ("servicio temporalmente no disponible") sin stack traces ni códigos técnicos expuestos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página general de novaShop MUST mostrar el catálogo de productos activos con nombre, precio, categoría, indicador de disponibilidad e imagen (placeholder en caso de ausencia).
- **FR-002**: El sistema MUST permitir filtrar el catálogo por categoría, con estado vacío comunicado ("Sin productos en esta categoría").
- **FR-003**: Cada producto activo MUST tener una landing page accesible por URL directa (compartible, para campañas de redes sociales) con nombre, imagen, precio, descripción y disponibilidad.
- **FR-004**: La landing MUST presentar el botón "Comprar" prominentemente.
- **FR-005**: El botón "Comprar" MUST generar un payload estructurado para WhatsApp con: nombre del producto, precio unitario, cantidad (1 por defecto, no editable en este MVP) y URL de la landing de origen; y MUST abrir el canal (deep link universal).
- **FR-006**: Cada generación exitosa del payload MUST registrar una orden preliminar persistente (fecha-hora, producto, cantidad, precio unitario vigente, canal WhatsApp) para auditoría del embudo.
- **FR-007**: Productos con stock 0, inactivos o dados de baja MUST NO mostrar botón "Comprar" activo y MUST mostrar estado "No Disponible".
- **FR-008**: El sistema MUST distinguir internamente el origen del producto (propio vs dropshipping); para el cliente MVP ambas modalidades son idénticas.
- **FR-009**: El sistema MUST excluir en esta versión el carrito multi-producto y las pasarelas de pago web transaccionales; ningún flujo de cliente presenta alternativas de checkout fuera de WhatsApp.
- **FR-010**: Un administrador autenticado (credencial única administrativa) MUST poder crear, actualizar, dar de baja (lógica) y reactivar productos, definiendo stock, precio, categoría, descripción, imágenes y origen (propio/dropshipping), con validación de campos obligatorios y valores razonables (precio > 0, stock ≥ 0).
- **FR-011**: El administrador MUST poder consultar el registro inicial de órdenes preliminares ordenado del más reciente al más antiguo (fecha-hora, producto, cantidad, precio, canal).
- **FR-012**: Todo error técnico MUST traducirse a mensaje de interfaz amigable sin exponer stack traces ni códigos internos, y el backend MUST responder siempre con códigos HTTP semánticos (400, 401, 404, 500).
- **FR-013**: El sistema MUST operar sin registro/login para clientes (navegación y compra anónimas); la autenticación aplica únicamente al perfil de Administrador.

### Key Entities *(include if feature involves data)*

- **Producto**: ítem del catálogo con nombre, descripción, precio, categoría, imágenes (hasta 5), estado (activo/inactivo), stock (≥0) y origen (propio/dropshipping). Cada landing page corresponde a un producto activo.
- **Categoría**: clasificación de productos para la navegación del catálogo; gestionada por administración, con mínimo pedido de asignación manual por producto.
- **Orden preliminar**: registro auditado de la intención de compra generada al pulsar Comprar (fecha-hora, producto, cantidad, precio unitario vigente, canal WhatsApp). No implica pagos ni movimientos de inventario.
- **Administrador**: perfil interno único autenticado para gestión de catálogo y consulta de órdenes. No existen clientes registrados en MVP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante proveniente de red social completa la acción "Comprar" desde una landing en menos de 30 segundos desde su entrada, en flujo normal.
- **SC-002**: Al menos el 95% de las pulsaciones del botón "Comprar" abren WhatsApp con el mensaje estructurado correcto (producto, cantidad, precio y URL de origen) sin errores.
- **SC-003**: Una landing cargada en terminal móvil queda percibida como operativa en menos de 3 segundos sobre una conexión móvil típica.
- **SC-004**: Un visitante puede llegar a cualquier producto visible en 2 clics o menos desde la página general.
- **SC-005**: Un administrador crea o actualiza un producto completo en menos de 2 minutos sin errores de validación.
- **SC-006**: 0 mensajes de error técnico (stack traces, códigos HTTP crudos, detalles de servidor) expuestos a visitantes finales durante los flujos normales.
- **SC-007**: El 100% de las órdenes preliminares generadas desde el embudo persiste y es visible al administrador en menos de 1 minuto.

## Assumptions

- El número/cuenta del canal WhatsApp de ventas es configuración del sistema (administración/despliegue); el asistente de IA sobre WhatsApp es una pieza externa al MVP que consume ese canal.
- La integración programática automática con Dropi o Shopify queda fuera del MVP; el origen (propio/dropshipping) se marca manualmente desde administración.
- No hay historial de compras asociado a un cliente identificable (compra anónima).
- La autenticación del administrador en MVP es simple: credenciales administrativas gestionadas por configuración del proyecto, suficientes para un operador único.
- Hasta 5 imágenes por producto gestionables en el MVP.
- El payload de compra es texto estructurado dentro del mensaje de WhatsApp (deep link); no requiere API oficial de WhatsApp Business en el MVP. Evolution API y IA corresponden a fases posteriores de automatización del cierre.
- Un set de demo de 5–10 productos en 4–5 categorías basta para validar los flujos y realizar demos.
