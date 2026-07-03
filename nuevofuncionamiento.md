# Nuevo funcionamiento propuesto de AcopioRed

## 1. Propósito real del sistema

AcopioRed ya no debe entenderse solo como un sistema genérico de inventario para centros de acopio, sino como una herramienta operativa para **gestionar pedidos, producción, entradas, salidas y control diario de comidas** en un flujo de ayuda que hoy se reparte entre WhatsApp, listas escritas, Word y Excel [cite:101].

El rediseño es necesario porque el dolor principal detectado no es simplemente “ver el stock”, sino **reducir la carga manual de registrar, aprobar, reconfirmar y despachar comidas** durante la mañana y el mediodía, que es cuando el equipo siente mayor presión operativa. El sistema debe existir para quitarles trabajo repetitivo, no para añadir otra capa administrativa [cite:101].

## 2. Cambio de enfoque del producto

La lógica anterior del dashboard estaba pensada como un centro de mando de inventario y distribución hacia centros de acopio, con énfasis en entradas, salidas, stock, variedades y flujo de inventario [cite:101]. Esa lógica sigue siendo útil como base, pero hoy se queda corta porque el proceso real incluye más pasos previos al despacho: recepción del pedido, validación de inventario, confirmación con la persona solicitante, preparación para cocina y registro final [cite:101].

Por eso, el producto debe pasar de “dashboard de inventario” a **dashboard de operación diaria**. El objetivo ya no es solo ver qué entra y qué sale, sino permitir que el equipo entienda rápidamente qué pedidos están pendientes, cuáles fueron aprobados, qué salidas están programadas para hoy, cuánto inventario queda y qué movimientos ya fueron completados [cite:101].

## 3. Nueva lógica del sistema

### 3.1. Primer bloque: solicitudes de comida

El sistema debe empezar por una entidad nueva: la **solicitud de comida**. Hoy los pedidos entran por WhatsApp, cada persona escribe como quiere y luego el equipo debe interpretar cantidades, hora, destino y prioridad manualmente; por eso conviene convertir ese primer paso en un formulario o en un registro estructurado dentro del sistema [cite:101].

Cada solicitud debería guardar como mínimo:

- Fecha solicitada de entrega.
- Destino.
- Cantidad solicitada.
- Hora o rango de retiro/entrega.
- Responsable o contacto.
- Observaciones.
- Estado del pedido: pendiente, aprobado, rechazado, reconfirmado, entregado.

### 3.2. Segundo bloque: aprobación operativa

Después de que entra una solicitud, el sistema debe permitir una fase de **revisión y aprobación**. Esto existe hoy de forma manual entre varias personas que revisan inventario de insumos y deciden si aceptan o no el pedido; por lo tanto, la app debe volver visible ese momento de decisión [cite:101].

La lógica debe permitir:

- Ver solicitudes pendientes del día siguiente.
- Aprobar o rechazar según disponibilidad.
- Añadir notas internas.
- Marcar si el pedido fue reconfirmado al día siguiente.

Esto es importante porque evita que la aprobación viva solo en chats y memoria humana.

### 3.3. Tercer bloque: producción y preparación

El sistema también debe reflejar que el flujo real no salta de “pedido” a “salida”: antes hay una etapa de cocina y empaque. Aunque no hace falta construir un módulo industrial complejo, sí conviene que exista un estado intermedio tipo **programado / en preparación / listo para despacho**, para que el dashboard muestre en qué etapa va cada lote [cite:101].

El motivo es operativo: si el equipo siente la carga más fuerte en la mañana y parte del mediodía, el sistema debe ayudar justo en esa franja crítica mostrando claramente qué hay que cocinar, qué ya está en empaque y qué ya está listo para salir.

### 3.4. Cuarto bloque: salidas de comida

Este es el núcleo del MVP. El equipo ya dijo que lo que más quiere dejar de hacer manualmente son las **entradas y salidas de comida**, especialmente las salidas [cite:101]. Por eso, el registro de salida no debe ser un simple formulario genérico, sino una acción central del sistema.

Cada salida debe registrar:

- Solicitud relacionada (si existe).
- Destino.
- Tipo de comida.
- Cantidad.
- Responsable que entrega.
- Hora de salida.
- Estado: pendiente, salida confirmada, entregada.
- Observaciones.

La razón de esto es doble: primero, descuenta inventario automáticamente; segundo, deja trazabilidad inmediata sin necesidad de pasar luego la información otra vez a Excel o Word [cite:101].

### 3.5. Quinto bloque: entradas de comida

Las entradas no son solo “nuevo stock”. En el flujo real existen al menos dos tipos de entrada: **donaciones** y **producción**, y ambas se registran hoy con soporte físico y luego se pasan a inventario [cite:101]. Por eso, la lógica de entrada debe contemplar más contexto que solo cantidad.

Cada entrada debería permitir:

- Tipo de entrada: donación, producción, otro.
- Tipo de comida o insumo.
- Cantidad.
- Unidad si aplica.
- Origen o proveedor.
- Responsable que registró.
- Observaciones.

Esto permite que el inventario tenga más valor administrativo y no solo operativo.

## 4. Nueva lógica del dashboard

El dashboard actual es visualmente fuerte, pero funcionalmente debe reordenarse para responder al flujo real de trabajo [cite:101]. Debe mostrar primero lo que el equipo necesita para actuar hoy, no solo lo que se ve bien en una demo.

### 4.1. Qué debe mostrar arriba

Las tarjetas superiores deberían priorizar:

- **Pedidos pendientes de aprobación**.
- **Pedidos programados para hoy**.
- **Salidas realizadas hoy**.
- **Inventario actual**.

Esto cambia el foco del dashboard porque hoy el verdadero cuello de botella no es conocer “variedades”, sino gestionar el ciclo diario de pedidos, aprobación y despacho [cite:101]. Si el jefe o el operador entra al sistema, debe entender en segundos cuánto tiene pendiente y qué ya salió.

### 4.2. Qué debe mostrar en el bloque central

El bloque central no debería quedarse solo en una gráfica de entradas vs salidas. Sería más útil un módulo mixto con:

- Resumen de operaciones del día.
- Lista de pedidos programados.
- Estado de cada uno: pendiente, aprobado, en preparación, listo, entregado.

La gráfica de inventario puede quedarse, pero como apoyo analítico, no como centro absoluto de la pantalla. Lo operativo diario debe tener prioridad porque esa es la necesidad real detectada [cite:101].

### 4.3. Qué debe mostrar el panel lateral

El panel lateral derecho debería convertirse en una zona de **alertas y resumen ejecutivo**:

- Inventario crítico.
- Pedidos que faltan por reconfirmar.
- Salidas retrasadas.
- Resumen rápido: solicitadas hoy, entregadas hoy, restantes por despachar.

Ese panel es importante porque resume presión operativa, no solo disponibilidad estética.

## 5. Pantallas que el sistema debe tener ahora

Con base en el funcionamiento actual y los dolores detectados, el sistema debería quedar estructurado así:

### 5.1. Login

Se mantiene como puerta de acceso segura. No cambia su razón de existir [cite:101].

### 5.2. Dashboard de operación diaria

Debe sustituir la idea de “centro de mando de inventario” por una vista de operación viva. Su objetivo es responder estas preguntas:

- ¿Qué pedidos hay pendientes?
- ¿Qué ya fue aprobado?
- ¿Qué está programado para hoy?
- ¿Qué ya salió?
- ¿Cuánto inventario queda?

### 5.3. Solicitudes / pedidos

Nueva pantalla obligatoria. Debe listar todas las solicitudes y permitir crearlas desde formulario, revisarlas, aprobarlas y cambiar su estado.

### 5.4. Registrar entrada

Se mantiene, pero debe ampliarse para soportar donaciones y producción con mejor contexto [cite:101].

### 5.5. Registrar salida / despacho

Se mantiene, pero debe conectarse con solicitudes aprobadas y con el inventario real. No debe ser un formulario aislado, sino el paso final del flujo operativo [cite:101].

### 5.6. Historial / movimientos

Debe seguir existiendo como libro contable, pero idealmente unificado con filtros por fecha, tipo, destino, responsable y estado. Su propósito es trazabilidad y auditoría [cite:101].

### 5.7. Reportes

Debe consolidar la operación diaria, semanal o mensual en formatos exportables. Esto sigue siendo útil porque hoy ellos todavía dependen de documentos y resúmenes manuales [cite:101].

## 6. Por qué esta lógica es mejor

Esta nueva lógica es mejor porque deja de diseñar la app desde una abstracción de inventario y empieza a diseñarla desde el **trabajo real del equipo**. El sistema propuesto refleja el flujo verdadero: llega un pedido, se evalúa, se confirma, se cocina, se empaca, se despacha y se registra; el producto debe seguir exactamente esa secuencia [cite:101].

Además, este enfoque permite construir un MVP más preciso. En vez de gastar tiempo en módulos secundarios o visualizaciones demasiado aspiracionales, se concentra el esfuerzo en lo que hoy genera desgaste: pedidos desordenados, entradas/salidas manuales, reconfirmación y resumen diario. Esa es la razón por la que el rediseño tiene sentido estratégico y no solo visual [cite:101].

## 7. Qué hacer después de este documento

A partir de este rediseño, lo siguiente debería ser:

1. Ajustar el modelo de datos para incluir `solicitud`, `movimiento`, `destino`, `estado` y `responsable`.
2. Rediseñar el dashboard con prioridad operativa.
3. Crear la pantalla de solicitudes como primer módulo nuevo.
4. Conectar entradas y salidas al inventario real.
5. Definir con backend los estados oficiales del flujo.

Ese orden importa porque primero se resuelve la lógica y luego la interfaz. Si se hace al revés, el sistema corre el riesgo de verse bien pero no calzar con la realidad operativa del equipo [cite:101].
