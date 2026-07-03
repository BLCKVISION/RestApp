# AcopioRed – Contexto completo para MVP

## 1. Visión general del proyecto

AcopioRed es una herramienta ligera de **gestión operativa de comidas** para un esquema de ayuda tras el terremoto en Venezuela.

El objetivo ya NO es coordinar decenas de centros de acopio, sino aliviar la carga diaria de un equipo pequeño que:
- Atiende actualmente **2 centros de acopio**.
- Recibe solicitudes de comida **a diario** por WhatsApp/notas de voz.
- Ya lleva el inventario "de forma ordenada" y tiene historial de entregas, pero está **saturado** procesando entradas y salidas de comidas a mano.

AcopioRed debe convertirse en la "mente fría" que registra, cuenta y resume las comidas que entran y salen, para que el equipo deje de estar pegado al teléfono contando perro, gato, adulto, niño, etc. y pueda tomar decisiones rápidas.

## 2. Puntos de dolor detectados

A partir del formulario de descubrimiento que respondieron:

### Operación actual
- Centros de acopio atendidos: **2**.
- Frecuencia de solicitudes: **Diariamente**.
- Canal de solicitud: **WhatsApp, nota de voz, mensajería**.
- Personas clave en consolidar/decidir despacho: **Yoberlyn, Alejandro, Ricardo, Rodymar, Yosymar**.

### Herramientas actuales
- WhatsApp.
- Excel o Google Sheets.
- Papel o cuaderno.
- Control de inventario: **"Sí, de forma ordenada"**.
- Historial de entregas: **"Sí"**.

### Dolor real
- "Ahorita lo que nos está generando más conflicto es la **entrada y salida de las comidas**, ya que es una broma que uno tiene que estar pegado todo el día en el teléfono contando cuántas comidas tienen que salir".
- Parte más difícil o lenta: **Procesar las comidas**.
- Errores frecuentes: problemas en **procesamiento de comidas o recibimiento de donaciones**, sumado a **pocos voluntarios**.

### Qué necesita ver el jefe
- Comidas solicitadas.
- Comidas entregadas.
- Inventario.

### Qué quieren dejar de hacer manual
- **Registro de las salidas de comida**.

### Perspectiva de crecimiento
- "Seguiremos con 2 por ahora".

**Conclusión directiva**: el dolor no está en que el sistema de centros de acopio sea complejo, sino en que el registro y conteo de comidas es manual, repetitivo y consume demasiado tiempo de un equipo con pocos recursos humanos.

## 3. Objetivo del MVP

Construir un MVP **mínimo pero sólido** que:

1. Permita registrar de forma sencilla:
   - Entradas de comida (donaciones / producción).
   - Salidas de comida hacia cada centro.
2. Muestre en un solo panel, entendible en 10 segundos:
   - Comidas solicitadas hoy.
   - Comidas entregadas hoy.
   - Inventario actual.
3. Reduzca drásticamente el tiempo que el equipo pasa:
   - Contando y anotando comidas a mano.
   - Reconciliando entradas y salidas en papel/WhatsApp.
4. Genere un historial claro y confiable de movimientos, sin añadir burocracia.

No buscamos resolver todo de golpe, sino atacar el **cuello de botella real**: procesamiento y registro de comidas.

## 4. Arquitectura base (NestJS + Angular monorepo)

Usaremos la arquitectura que el equipo ya viene utilizando en proyectos colaborativos.

### Monorepo

```text
acopio-red/
├── backend/                  # NestJS API Backend
│   ├── src/
│   │   ├── centros-acopio/   # Módulo de centros (existente o a crear)
│   │   ├── comidas/          # NUEVO: Módulo para entradas/salidas de comida
│   │   ├── common/           # Utilidades compartidas (paginación, etc.)
│   │   ├── database/         # Módulo de conexión a DB
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env                  # Variables de entorno
│   ├── package.json
│   └── tsconfig.json
└── frontend/                 # Angular 19 SPA
    ├── src/
    │   ├── app/              # Componentes principales
    │   ├── index.html
    │   └── main.ts
    ├── package.json
    └── tsconfig.json
```

### Backend
- **Framework**: NestJS v10.
- **DB**: PostgreSQL en Supabase.
- **ORM**: TypeORM con `autoLoadEntities` y `synchronize` (solo en dev).
- **Patterns**: módulos por feature (controller, service, entity, DTOs), paginación estándar, ValidationPipe global.

### Frontend
- **Framework**: Angular 19.
- **Styling**: SCSS.
- **Tipografía**: Plus Jakarta Sans.
- **Branding**: paleta AcopioRed (azul #1e88e5 y amarillo #f5a623). 

## 5. Modelo de datos para el MVP

El MVP necesita modelar **comidas** y **movimientos de inventario**, no toda una logística nacional.

### Entidades principales (propuesta)

1. `CentroDeAcopio` (si no existe ya)
   - `id` (uuid).
   - `nombre`.
   - `ubicacion` (texto simple).
   - `activo` (boolean).

2. `TipoComida`
   - `id` (uuid).
   - `nombre` (ej: "adulto", "niño", "especial").
   - `descripcion` opcional.

3. `MovimientoComida`
   - `id` (uuid).
   - `tipo` (enum: `ENTRADA` | `SALIDA`).
   - `centroId` (nullable para ENTRADA general, obligatorio para SALIDA).
   - `tipoComidaId`.
   - `cantidad` (number).
   - `fecha` (timestamp).
   - `origen` (texto opcional para entradas: donación, producción, etc.).
   - `nota` (texto opcional).
   - `registradoPor` (usuario o nombre libre).

4. `SolicitudComida` (opcional en MVP, o se maneja como nota ligada a WhatsApp)
   - `id` (uuid).
   - `centroId`.
   - `fecha`.
   - `detalle` (texto libre o JSON con tipos/cantidades).
   - `estado` (enum: REGISTRADA | ATENDIDA | PARCIAL).

### Lógica básica

- Inventario actual por `tipoComida` se calcula como:
  - suma de ENTRADAS − suma de SALIDAS.
- Entregas del día: filtrar `MovimientoComida` tipo SALIDA por `fecha = hoy`.
- Comidas solicitadas: si se usa `SolicitudComida`, se muestra el total por centro para la fecha seleccionada.

El MVP puede iniciar sin `SolicitudComida`, usando solo movimientos de inventario y copiando manualmente el resumen de solicitudes desde WhatsApp.

## 6. Módulos backend para el MVP

### 6.1. Módulo `centros-acopio`

Si ya existe, se reutiliza. Si no, crear:
- `centros-acopio.controller.ts`
- `centros-acopio.service.ts`
- `centro-acopio.entity.ts`
- DTOs de creación/actualización.

Endpoints típicos:
- `GET /centros-acopio` – listar.
- `POST /centros-acopio` – crear.

### 6.2. Módulo `tipos-comida`

Para gestionar categorías base de comida.

### 6.3. Módulo `movimientos-comida`

Núcleo del MVP.

Endpoints sugeridos:
- `POST /movimientos` – registrar entrada o salida.
- `GET /movimientos` – listar con filtros (fecha, tipo, centro).
- `GET /inventario/resumen` – devolver resumen para dashboard:
  - inventario actual por tipo.
  - total entregado hoy.
  - total solicitado hoy (si se modela).

Paginación y DTOs deben seguir el patrón que ya tienen en `common/pagination` y `common/dto`.

## 7. Interfaz frontend (Angular) – MVP

### 7.1. Pantallas mínimas

1. **Dashboard**
   - Cards con:
     - "Inventario actual" (por tipo de comida).
     - "Comidas solicitadas hoy" (si se modela).
     - "Comidas entregadas hoy".
   - Tabla o lista con últimos movimientos.

2. **Registrar entrada**
   - Form:
     - Tipo de comida.
     - Cantidad.
     - Origen (donación, producción, etc.).
     - Fecha (por defecto hoy).
     - Nota opcional.

3. **Registrar salida**
   - Form:
     - Centro de acopio.
     - Tipo(s) de comida.
     - Cantidad.
     - Fecha.
     - Nota.
   - Validaciones simples (no dejar salir más que lo disponible si se aplica).

### 7.2. Estilo

- Layout limpio tipo dashboard.
- Tipografía Plus Jakarta Sans.
- Paleta:
  - Azul #1e88e5 como primario.
  - Amarillo #f5a623 como acento.
- No hace falta mapa en este MVP.

## 8. Principios de diseño del sistema

1. **Atacar el cuello de botella**: priorizar entradas/salidas antes que cualquier otra cosa.
2. **No sobre-diseñar** para solo 2 centros: módulo ligero, pero extensible si crecen.
3. **Mantener la consistencia** con el stack actual (NestJS + Angular + TypeORM + Supabase).
4. **Evitar complejidad innecesaria**: nada de routing avanzado de deliveries, ni multi-tenant, ni roles supercomplejos en el MVP.
5. **Dejar puertas abiertas**: que el diseño de entidades permita crecer a más centros sin refactorizar todo.

## 9. Roadmap de evolución (más allá del MVP)

Una vez validado el MVP, las extensiones naturales serían:

1. Modelo formal de **solicitudes** (para dejar de depender de WhatsApp).
2. Roles y permisos (ej. usuario centro vs usuario empresa).
3. Reportes agregados (semanales/mensuales) para justificar donaciones.
4. Integraciones ligeras con OmniRed/SomosUno si tiene sentido.
