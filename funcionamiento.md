# Funcionamiento de la Aplicación (RestApp / AcopioRed)

## 1. ¿Qué es la aplicación?
Esta aplicación es un **Sistema de Gestión y Logística de Inventarios**, diseñado específicamente para administrar la distribución de raciones (comida/almuerzos) hacia diferentes Centros de Acopio. 

Su propósito principal es centralizar el control del stock (saber qué entra, qué sale y cuánto queda), facilitando a los operadores y administradores el monitoreo en tiempo real de los suministros para asegurar una operación de ayuda o logística sin interrupciones. Todo esto se maneja desde una interfaz web moderna, limpia y altamente visual.

---

## 2. Flujo de la Aplicación (Vistas y Navegación)

El flujo del sistema se divide en distintas pantallas a las que se accede a través del menú lateral (sidebar). A continuación se detalla qué hace cada parte:

### 2.1. Pantalla de Autenticación (Login)
Es la puerta de entrada al sistema. Para garantizar la seguridad de los datos de inventario, el usuario debe ingresar un nombre de usuario y contraseña válidos. Si no está autenticado, no puede ver absolutamente nada del funcionamiento interno. Una vez logueado, es redirigido al centro de mando.

### 2.2. Inicio / Centro de Mando (Dashboard)
Es la vista principal. Su objetivo es que el administrador entienda la salud de la operación en 5 segundos. Está compuesto por varias secciones:

1. **Tarjetas de Indicadores Clave (4 Cards superiores):**
   - **Entradas Hoy:** Cantidad exacta de raciones o suministros que han ingresado al sistema durante el día actual.
   - **Salidas Hoy:** Cantidad de raciones que han sido despachadas o entregadas.
   - **Variedades:** Cuántos tipos diferentes de comida (menús o insumos) existen registrados actualmente en el sistema.
   - **Stock General:** La sumatoria total de raciones guardadas o disponibles para distribuir.

2. **Gráfico de Flujo de Inventario:**
   - Una gráfica de barras que compara visualmente cuánta mercancía ha entrado frente a cuánta ha salido. Permite filtrar los datos de forma Semanal, Mensual o Anual.

3. **Centros de Acopio Activos:**
   - Muestra una lista de los almacenes o sedes logísticas que están operando actualmente, junto al operador responsable de cada uno. Desde aquí se puede acceder rápidamente a registrar una salida hacia ellos.

4. **Estado de Suministros y Disponibilidad:**
   - (Sección lateral derecha) Informa qué tan cerca está el inventario de cumplir la meta mensual. Muestra visualmente (con colores y barras) cuántas raciones específicas quedan de cada "Variedad" de comida (ej: pollo, carne, vegetariano, etc.).

5. **Últimos Pedidos / Entregas (Movimientos Recientes):**
   - Una lista rápida que muestra las últimas 4 transacciones realizadas en vivo (ej: "Entraron 50 unidades", "Salieron 20 unidades").

### 2.3. Registrar Entrada (Ícono de camión entrante)
Es el formulario logístico donde se le avisa al sistema que llegó nuevo suministro. El usuario ingresa el tipo de comida, la cantidad y confirma. Automáticamente, esta acción suma unidades al *Stock General* y queda registrada en el historial.

### 2.4. Registrar Salida / Despacho (Ícono de camión saliente)
La contraparte de las entradas. Cuando se envía un lote de raciones a un centro de acopio o se consume, el operador usa esta pantalla. Al registrar una salida, se restan unidades del *Stock General*. Si no hay suficiente inventario, el sistema arrojaría una alerta.

### 2.5. Analítica y Movimientos (Ícono de reloj/historial)
Es el libro contable de la aplicación. Aquí se encuentra una tabla detallada con el historial absoluto de todo lo que ha pasado en el sistema. Detalla qué ocurrió, si fue una Entrada o Salida, qué cantidad se movió, a qué hora exacta y qué usuario fue el responsable de registrar ese movimiento. Asegura la trazabilidad.

### 2.6. Informes / Reportes (Ícono de documento)
Es la sección ejecutiva. Permite generar documentos (como PDFs o archivos de Excel) que consolidan los datos de las operaciones (flujos de entrada y salida) para poder imprimirlos, enviarlos por correo o presentarlos en reuniones administrativas.

### 2.7. Perfil y Configuración de Usuario (Menú superior derecho)
Haciendo clic en la inicial o avatar del usuario (esquina superior derecha), se despliega un pequeño submenú. 
- **Mi Perfil:** Lleva a una pantalla personal donde el usuario puede ver su información (nombre, rol, correo electrónico) y cuenta con formularios para actualizar sus datos o cambiar su contraseña de seguridad.
- **Cerrar Sesión:** Destruye la sesión activa y devuelve al usuario a la pantalla de Login, protegiendo la información si se aleja de la computadora.
