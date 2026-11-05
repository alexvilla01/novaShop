# novaShop Store Constitution

## 1. Naturaleza del Proyecto

Este es un software web para la comercialización de productos propios y bajo la
modalidad de dropshipping (integración con Dropi y Shopify) operando bajo un
modelo de bajo presupuesto (bootstrap). Su propósito es captar tráfico desde
redes sociales hacia una página general y Landing Pages individuales por
producto, permitiendo a los clientes explorar el catálogo y culminar la venta
mediante un embudo automatizado en WhatsApp asistido por Inteligencia
Artificial.

## 2. Stack Tecnológico (Reglas de Implementación)

- **Frontend / UI:** React 19 con Vite y Tailwind CSS para los estilos.
  Node.js 22 LTS como entorno de ejecución y gestión de dependencias.
  Desplegado en Vercel o Cloudflare Pages (Free Tier).
- **Backend:** Java 21 LTS con Spring Boot 3.x o superior, habilitando hilos virtuales
  (Virtual Threads) para alta concurrencia. Desplegado en Oracle Cloud
  Infrastructure (OCI) Always Free Tier.
- **Base de Datos:** PostgreSQL 15+ (hospedado en Supabase Free Tier o nativo
  en OCI). Uso estricto de Spring Data JPA con consultas parametrizadas.
- **CI/CD y Control de Versiones:** GitHub + GitHub Actions para automatización
  continua de compilación y despliegue.
- **Automatización Comercial:** Evolution API (WhatsApp autohospedado)
  conectada a modelos de IA (Groq / OpenAI) para el cierre de ventas.

## 3. Reglas de Dominio y Lógica de Negocio

Estas reglas son inmutables. El agente de IA debe respetarlas estrictamente:

### Tipos de Usuarios

El sistema contempla perfiles de **Cliente** (navegación pública y redirección
a WhatsApp) y **Administrador** (gestión de catálogo de productos y registro de
pedidos).

### Acciones del Cliente

El cliente puede navegar por la página general de novaShop, explorar
categorías, acceder a las Landing Pages específicas de cada producto
provenientes de redes sociales, y hacer clic en el botón de compra para
generar un payload estructurado hacia el canal de WhatsApp automatizado con IA.

### Acciones del Administrador

El administrador puede gestionar el catálogo de productos (crear, actualizar,
eliminar, cambiar estado de stock propio vs dropshipping) y revisar los
registros iniciales de órdenes en la base de datos.

### Alcance del MVP (Restricción de Dominio)

En esta primera versión se **excluyen explícitamente** el carrito de compras
multi-producto complejo y las pasarelas de pago web transaccionales directas;
toda la conversión se canaliza **exclusivamente** por el embudo de WhatsApp.

## 4. Estructura y Estilo de Código

- **Estructura Desacoplada:** Repositorio estructurado en carpetas
  independientes `/backend` (Spring Boot en capas: Controller, Service,
  Repository, Model) y `/frontend` (React con componentes modulares y diseño
  basado en el sistema visual de novaShop).
- **Estilo:** Programación funcional y componentes funcionales con Hooks en
  React. En Java, uso limpio de Records y patrones modernos de Java 21,
  evitando sobreingeniería o patrones monolíticos obsoletos.
- **Nomenclatura:** camelCase para variables y funciones, PascalCase para
  Clases, Interfaces y Componentes de React, kebab-case para rutas de
  archivos/URLs.

## 5. Manejo de Errores y Validaciones

- **UI:** Nunca exponer errores crudos o stack traces al usuario final. Todo
  fallo técnico debe traducirse a un mensaje de interfaz claro y amigable.
- **Backend:** Retornar siempre códigos de estado HTTP semánticos (400 petición
  inválida, 401 no autenticado, 404 recurso no encontrado, 500 error interno
  del servidor). Validar entradas mediante Bean Validation en Spring Boot y
  esquemas estrictos en el frontend.

## 6. Comportamiento del Agente de IA (Reglas SDD)

- **Cero Código Sombra (Shadow Code):** Construir estrictamente lo documentado
  en el alcance del MVP. No añadir funcionalidades no solicitadas (no pasarelas
  de pago web, no carritos complejos, no módulos avanzados fuera de spec).
- **Fuente de la Verdad:** Si una instrucción del usuario contradice esta
  constitución o si se detecta una falla lógica de diseño, el agente debe
  detenerse inmediatamente, advertir el problema y solicitar la actualización
  de la especificación antes de escribir o modificar código fuente.

## Versionado de la Constitución

| Versión | Fecha      | Estado           |
|---------|------------|------------------|
| 1.0.0   | 2026-11-03 | Aprobada (v1) |
| 1.0.1   | 2026-11-04 | Enmienda: backend admite "Spring Boot 3.x o superior" (scaffold inicial con Boot 4.1.2) |
