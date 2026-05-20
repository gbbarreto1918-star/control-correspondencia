# Manual de Usuario: Sistema de Control de Correspondencia General

Bienvenido al **Manual de Usuario** del Sistema de Control de Correspondencia General. Esta plataforma web ha sido diseñada especialmente para la gestión, seguimiento, control de vencimientos y auditoría de la correspondencia entrante y saliente de la organización.

---

## Índice

1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Panel Ejecutivo (Dashboard)](#2-panel-ejecutivo-dashboard)
3. [Registro de Correspondencia](#3-registro-de-correspondencia)
4. [Consulta y Seguimiento](#4-consulta-y-seguimiento)
5. [Generación de Reportes PDF](#5-generación-de-reportes-pdf)
6. [Configuración y Administración](#6-configuración-y-administración)
   - [Gestión de Responsables](#61-gestión-de-responsables)
   - [Gestión de Entidades Frecuentes](#62-gestión-de-entidades-frecuentes)
   - [Configuración de Seguridad y Organización](#63-configuración-de-seguridad-y-organización)

---

## 1. Acceso al Sistema

El sistema cuenta con un control de acceso simplificado basado en un **PIN de seguridad de 6 dígitos** para proteger la integridad de los datos.

```
+------------------------------------------+
|          INGRESO DE SECRETARÍA           |
|                                          |
|            [ * ] [ * ] [ * ]             |
|                                          |
|          [ 1 ]   [ 2 ]   [ 3 ]           |
|          [ 4 ]   [ 5 ]   [ 6 ]           |
|          [ 7 ]   [ 8 ]   [ 9 ]           |
|                  [ 0 ]   [ C ]           |
+------------------------------------------+
```

### Pasos para Ingresar:
1. Al cargar la aplicación por primera vez, se mostrará una pantalla de bloqueo con un teclado numérico.
2. Ingresa el PIN por defecto: **`250261`**.
3. El sistema validará el código inmediatamente. Si es correcto, te redirigirá al panel principal de forma automática.
4. Si ingresas un dígito incorrecto, presiona el botón **`C`** (Clear) en el teclado en pantalla para borrar y volver a intentar.

> [!TIP]
> Por motivos de comodidad, una vez que ingresas con éxito, tu sesión permanecerá guardada en el navegador para que no tengas que escribir el PIN cada vez que refresques la página.

---

## 2. Panel Ejecutivo (Dashboard)

El **Dashboard** es la pantalla de inicio del sistema. Ofrece una vista gerencial rápida de la salud operativa de la correspondencia mediante métricas e indicadores visuales dinámicos.

### Elementos Clave:
* **Tarjetas de Métricas:** En la parte superior verás 6 indicadores principales:
  1. **Total Recibida:** Cantidad acumulada de correspondencia entrante.
  2. **Total Enviada:** Cantidad acumulada de correspondencia saliente.
  3. **Pendientes:** Correspondencia activa que aún no ha recibido respuesta y cuya fecha de vencimiento no ha pasado.
  4. **Vencidas:** Correspondencia que superó su fecha límite sin ser cerrada (marcada en color rojo de alerta).
  5. **Cerradas:** Documentos que ya fueron respondidos o finalizados.
  6. **Efectividad:** Porcentaje de correspondencia cerrada sobre el total recibido/enviado.
* **Gráficos Estadísticos Interactivos:**
  * **Flujo Temporal:** Línea de tiempo que contrasta la cantidad de correspondencia cargada día a día durante los últimos 30 días.
  * **Estatus de Respuesta:** Gráfico circular (dona) que ilustra la proporción de folios Pendientes vs. Cerrados vs. Vencidos.
  * **Carga por Responsable:** Gráfico de barra que muestra qué volumen de correspondencia tiene asignada cada funcionario.
  * **Top 5 Responsables:** Ranking visual de los funcionarios con mayor cantidad de asignaciones activas.
* **Alertas de Vencimiento Próximo:** Un panel inferior derecho que lista de forma prioritaria los folios que están **vencidos** o **a menos de 3 días de vencer**, detallando el número correlativo, el asunto y el responsable, permitiendo tomar acciones oportunas.

---

## 3. Registro de Correspondencia

El registro de correspondencia está unificado en un formulario inteligente que se adapta dependiendo de si estás cargando un documento recibido (**Entrante**) o enviado (**Saliente**).

```
                      NUEVO REGISTRO
+---------------------------------------------------------+
|  [ Informacion General ]                                |
|  Tipo: [📬 Entrante]  |  Nº Correlativo: [____________] |
|  Elaboración: [DD/MM/AAAA]  | Recepción: [DD/MM/AAAA]   |
+---------------------------------------------------------+
|  [ Remitente y Destinatario ]                           |
|  Enviada por: [_______________________________________] |
|  Dirigida a:  [_______________________________________] |
+---------------------------------------------------------+
|  [ Detalle del Asunto ]                                 |
|  Asunto: [____________________________________________] |
|  Notas:  [____________________________________________] |
+---------------------------------------------------------+
|  [ Asignación y Control ] (Campos Opcionales)           |
|  Responsable: [Seleccione...] | Vencimiento: [DD/MM/AA] |
+---------------------------------------------------------+
|  [ Anexos / Adjuntos ]                                  |
|  ¿Tiene Anexo? [ O ] (Activar switch para subir)        |
+---------------------------------------------------------+
```

### Pasos para Registrar un Folio:
1. Haz clic en **Nueva Entrante** o **Nueva Saliente** desde la barra lateral o el listado general.
2. **Número Correlativo (Obligatorio):** Escribe el código oficial identificador del oficio de forma manual. El sistema validará en tiempo real que este código no exista previamente en la base de datos para evitar duplicados.
3. **Fechas (Obligatorio):** Define la fecha de elaboración del oficio y la fecha en que fue recibido o enviado.
4. **Remitente y Destinatario (Obligatorio):** Ingresa quién envía y a quién va dirigido. Al hacer clic en estos campos, se desplegará una lista de sugerencias con las **Entidades Frecuentes** registradas en el sistema para agilizar la escritura.
5. **Asunto y Descripción (Obligatorio):** Resume de qué trata la comunicación de forma concisa y añade notas de soporte en el cuadro de descripción.
6. **Asignación y Control (Opcional):**
   * *Responsable Asignado:* Selecciona de la lista qué funcionario debe dar respuesta o hacer seguimiento al oficio.
   * *Fecha de Vencimiento:* Indica la fecha límite para responder a la comunicación.
   * > [!IMPORTANT]
     > Aunque estos campos **no son obligatorios** para guardar el registro, es de suma importancia completarlos para que el sistema alimente las estadísticas del Dashboard, calcule las tasas de efectividad y dispare las alertas de vencimiento.
7. **Carga de Anexos (Opcional):**
   * Activa el interruptor **"Tiene Anexo"**.
   * Se habilitará una zona de arrastre. Puedes arrastrar tus archivos PDF o imágenes (JPG, PNG, WEBP, GIF) directamente allí, o hacer clic en la zona para abrir el explorador de archivos de tu computadora.
   * El límite de tamaño por archivo es de **10 MB**. Puedes subir múltiples archivos adjuntos en un mismo registro.
8. Haz clic en **Guardar Registro**.

---

## 4. Consulta y Seguimiento

La sección **Correspondencia** es la base de datos operativa donde se puede consultar, filtrar e inspeccionar el estado de todos los oficios registrados.

### Funcionalidades del Listado:
* **Búsqueda Rápida:** Escribe palabras clave en la barra de búsqueda para filtrar instantáneamente por número correlativo o texto del asunto.
* **Filtros Avanzados:** Puedes segmentar la lista por:
  * **Tipo:** Todos, Entrante o Saliente.
  * **Estado:** Todos, Pendiente, Vencido o Cerrado.
  * **Rango de Fechas:** Desde una fecha de inicio hasta una de fin.
  * **Responsable:** Filtrar solo los folios asignados a un funcionario específico.
* **Vista de Detalles (Doble Clic):**
  * Haz **doble clic** sobre cualquier fila del listado para abrir el expediente detallado del oficio.
  * En esta ventana emergente verás toda la información registrada, la lista de archivos anexos con enlaces directos para visualizarlos o descargarlos, y un botón para **Cambiar Estatus**.
  * Si el folio se encuentra *Pendiente* o *Vencido*, puedes hacer clic en **Marcar como Cerrado** una vez que se le haya dado respuesta al documento. Si necesitas reabrir un caso, puedes hacer clic en **Marcar como Pendiente**.
* **Eliminar Registros:** Si eres el usuario administrador, puedes eliminar registros erróneos haciendo clic en el botón de papelera del listado (esto removerá también los archivos adjuntos almacenados en la nube).

---

## 5. Generación de Reportes PDF

El módulo de **Reportes** permite estructurar y descargar documentos oficiales listos para imprimir o archivar en formato físico.

```
                       REPORTES
+------------------+  +-----------------------------------+
| Tipo de Reporte  |  | Filtros del Listado (Reactivos)   |
| ( ) Listado      |  | Buscar: [___________]             |
| ( ) Ficha Indiv. |  | Tipo:   [Todos     v]             |
| ( ) Combinado    |  | Estado: [Todos     v]             |
+------------------+  +-----------------------------------+
| [ Exportar PDF ] |  | Vista previa en tiempo real...    |
+------------------+  +-----------------------------------+
```

### Opciones de Exportación:
1. **Listado General Filtrado (Horizontal/Landscape):** Genera una tabla resumida con todas las columnas operativas principales (Correlativo, Asunto, Remitente, Destinatario, Responsable, Vencimiento y Estado).
2. **Detalle de Registro Individual (Vertical/Portrait):** Genera una ficha técnica limpia y detallada del folio seleccionado en el menú desplegable "Selección para Ficha Técnica".
3. **Reporte Combinado (Ambos):** Descarga consecutivamente tanto la tabla consolidada como la ficha de detalle individual.

### Pasos para Generar un Reporte:
1. Entra a **Reportes** en el menú lateral.
2. Selecciona qué tipo de reporte deseas generar en el panel izquierdo.
3. Si elegiste *Detalle de Registro Individual*, selecciona el número correlativo correspondiente del menú desplegable central.
4. **IMPORTANTE:** Usa la barra de filtros inferior (Buscar, Tipo, Estado, Responsable, Fechas) para depurar la lista. La grilla inferior te mostrará una **vista previa en tiempo real** de qué registros se incluirán en el documento PDF final.
5. Presiona el botón azul **Exportar a PDF**. El archivo se generará e iniciará su descarga automáticamente en tu navegador.

---

## 6. Configuración y Administración

El módulo de **Configuración** es el cerebro administrativo del sistema. Permite gestionar los catálogos de datos y ajustar las opciones de seguridad del sistema.

### 6.1. Gestión de Responsables
Los responsables son los funcionarios internos que reciben las asignaciones de correspondencia.

* **Cómo Crear un Responsable:**
  1. Ve a la pestaña **Responsables**.
  2. En el campo *"Nombre del Responsable"*, escribe el nombre completo y cargo del funcionario (ej: `Abg. Carlos Mendoza - Consultoría Jurídica`).
  3. Haz clic en el botón **Agregar**. El responsable aparecerá listado abajo inmediatamente y estará disponible para seleccionarse en nuevos registros de correspondencia.
* **Desactivar Responsables:**
  * Si un funcionario ya no trabaja en la institución o no debe recibir nuevas asignaciones, haz clic en el interruptor de estado en la fila correspondiente para cambiarlo a **Inactivo**. Esto evitará que aparezca en el formulario de registro, pero conservará su historial intacto para no dañar las estadísticas de registros pasados.

### 6.2. Gestión de Entidades Frecuentes
Este catálogo almacena los entes públicos, empresas o personas recurrentes con las que se tiene correspondencia, evitando tener que escribir sus nombres manualmente en cada carga.

* **Cómo Crear una Entidad:**
  1. Ve a la pestaña **Entidades Frecuentes**.
  2. Escribe el nombre de la entidad en el campo de texto (ej: `Ministerio de Finanzas`, `Alcaldía del Municipio`).
  3. Selecciona el **Tipo de Entidad**:
     * **Remitente:** Si solo suele enviarnos correspondencia.
     * **Destinatario:** Si solo solemos enviarle correspondencia.
     * **Ambos:** Si la correspondencia es bidireccional.
  4. Haz clic en **Agregar**. El ente se guardará y aparecerá en las sugerencias del formulario de registro.
* **Editar y Eliminar Entidades:**
  * Puedes desactivar las entidades temporalmente o borrarlas del catálogo usando los botones de acción en la grilla derecha.

### 6.3. Configuración de Seguridad y Organización
En esta pestaña administras el nombre de la institución y cambias las credenciales de acceso.

* **Actualizar Nombre de la Organización:**
  1. Ve a la pestaña **Ajustes**.
  2. Modifica el campo *"Nombre de la Organización"*.
  3. Presiona el botón **Guardar Cambios**. Este nombre se actualizará en la barra lateral y en los membretes superiores de todos los reportes PDF.
* **Cómo Cambiar el PIN de Acceso:**
  1. Ve a la pestaña **Ajustes**.
  2. Ubica la sección de **Seguridad**.
  3. Escribe el nuevo código numérico de 6 dígitos en el campo *"PIN de Acceso (6 dígitos)"*.
  4. Haz clic en **Guardar Cambios**. El PIN se actualizará en la base de datos de manera inmediata.
