import { BookOpen, Printer, ArrowDown, HelpCircle } from 'lucide-react'

export default function ManualUsuario() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 pb-16">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 no-print">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Manual de Usuario</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Guía de uso oficial para la administración y control de la correspondencia institucional.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="btn-primary no-print self-start sm:self-center"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Índice - Menú de Navegación Lateral (solo pantalla, oculto en impresión) */}
        <aside className="lg:col-span-1 space-y-3 no-print sticky top-6 self-start">
          <div className="glass-card-static p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Índice
            </h3>
            <a href="#acceso" className="block text-sm text-slate-300 hover:text-blue-400 transition-colors py-1">
              1. Acceso al Sistema
            </a>
            <a href="#dashboard" className="block text-sm text-slate-300 hover:text-blue-400 transition-colors py-1">
              2. Panel (Dashboard)
            </a>
            <a href="#registro" className="block text-sm text-slate-300 hover:text-blue-400 transition-colors py-1">
              3. Carga de Folios
            </a>
            <a href="#seguimiento" className="block text-sm text-slate-300 hover:text-blue-400 transition-colors py-1">
              4. Consulta y Estatus
            </a>
            <a href="#reportes" className="block text-sm text-slate-300 hover:text-blue-400 transition-colors py-1">
              5. Generar PDF
            </a>
            <a href="#catalogos" className="block text-sm text-slate-300 hover:text-blue-400 transition-colors py-1">
              6. Configuración
            </a>
          </div>
        </aside>

        {/* Contenido del Manual */}
        <div className="lg:col-span-3 space-y-10 print-content bg-slate-900/30 p-6 md:p-8 rounded-xl border border-white/5 print:border-none print:bg-transparent print:p-0">
          
          {/* Introducción en impresión */}
          <div className="hidden print:block mb-8 border-b border-slate-300 pb-4">
            <h1 className="text-3xl font-bold text-slate-900">Manual de Usuario</h1>
            <p className="text-slate-600 text-sm mt-1">
              Sistema de Control de Correspondencia General
            </p>
          </div>

          {/* Sección 1: Acceso */}
          <section id="acceso" className="space-y-4 scroll-mt-6">
            <h2 className="text-xl font-semibold text-slate-100 border-b border-white/5 pb-2 flex items-center gap-2 print:text-slate-900 print:border-slate-300">
              <span className="text-blue-400 font-mono print:text-slate-800">1.</span> Acceso al Sistema
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700">
              El ingreso a la plataforma está protegido mediante un mecanismo de seguridad simplificado basado en un <strong>PIN de 6 dígitos</strong>. Esto evita el uso de formularios de inicio de sesión complejos y resguarda la información de usuarios no autorizados en el navegador.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="bg-slate-950/60 p-4 rounded-lg border border-white/5 font-mono text-xs text-slate-400 space-y-1 print:border-slate-300 print:text-slate-800 print:bg-slate-100">
                <p className="text-center font-bold text-slate-300 print:text-slate-900 border-b border-white/5 pb-2 mb-2">DIAGRAMA DEL TECLADO</p>
                <p className="text-center">[ * ] [ * ] [ * ] [ * ] [ * ] [ * ]</p>
                <p className="text-center mt-2">  [ 1 ]    [ 2 ]    [ 3 ]  </p>
                <p className="text-center">  [ 4 ]    [ 5 ]    [ 6 ]  </p>
                <p className="text-center">  [ 7 ]    [ 8 ]    [ 9 ]  </p>
                <p className="text-center">           [ 0 ]    [ C ]  </p>
              </div>
              <div className="space-y-2 text-sm text-slate-300 print:text-slate-700">
                <p><strong>Pasos para ingresar:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Escribe el PIN de seguridad asignado (PIN inicial de prueba: <code className="bg-white/10 px-1 rounded text-blue-300 font-mono print:bg-slate-200 print:text-slate-900">250261</code>).</li>
                  <li>Si cometes un error de marcado, presiona la tecla <strong>C</strong> (borrar) para limpiar los dígitos e iniciar de nuevo.</li>
                  <li>El sistema validará el PIN automáticamente. Al ser correcto, el acceso se guardará en tu navegador de forma segura para no solicitarlo en cada recarga.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 2: Dashboard */}
          <section id="dashboard" className="space-y-4 scroll-mt-6">
            <h2 className="text-xl font-semibold text-slate-100 border-b border-white/5 pb-2 flex items-center gap-2 print:text-slate-900 print:border-slate-300">
              <span className="text-blue-400 font-mono print:text-slate-800">2.</span> Panel Ejecutivo (Dashboard)
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700">
              El panel principal proporciona una visión integral e inmediata del estado operativo de la correspondencia recibida y emitida de la organización:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 print:border-slate-300 print:bg-slate-100">
                <h4 className="font-semibold text-slate-200 mb-2 print:text-slate-900">Métricas Principales</h4>
                <ul className="space-y-2 text-slate-400 print:text-slate-700 list-disc list-inside">
                  <li><strong className="text-slate-200 print:text-slate-900">Total Recibida/Enviada:</strong> Conteo de folios por tipo.</li>
                  <li><strong className="text-slate-200 print:text-slate-900">Pendientes/Vencidos:</strong> Casos abiertos ordenados por fecha de vencimiento legal.</li>
                  <li><strong className="text-slate-200 print:text-slate-900">Tasa de Efectividad:</strong> Relación porcentual de correspondencia cerrada a tiempo.</li>
                </ul>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 print:border-slate-300 print:bg-slate-100">
                <h4 className="font-semibold text-slate-200 mb-2 print:text-slate-900">Alertas de Vencimiento</h4>
                <p className="text-slate-400 print:text-slate-700 text-xs">
                  Ubicadas en la zona inferior derecha, listan en orden crítico todos los folios <strong>Vencidos</strong> o <strong>Próximos a vencer (en los siguientes 3 días)</strong> con el fin de evitar retrasos administrativos o pérdidas de plazos.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 3: Registro */}
          <section id="registro" className="space-y-4 scroll-mt-6">
            <h2 className="text-xl font-semibold text-slate-100 border-b border-white/5 pb-2 flex items-center gap-2 print:text-slate-900 print:border-slate-300">
              <span className="text-blue-400 font-mono print:text-slate-800">3.</span> Registro de Correspondencia
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700">
              Para agregar folios a la base de datos, ingresa a <strong>"Nueva Entrante"</strong> o <strong>"Nueva Saliente"</strong> desde la barra lateral.
            </p>
            <div className="space-y-3 text-sm text-slate-300 print:text-slate-700">
              <div className="space-y-1">
                <p className="font-medium text-slate-200 print:text-slate-900">Campos Obligatorios de Carga:</p>
                <ul className="list-decimal list-inside ml-2 space-y-1 text-slate-400 print:text-slate-700">
                  <li><strong>Número Correlativo:</strong> Código del oficio. Se valida automáticamente en tiempo real para descartar duplicados.</li>
                  <li><strong>Fecha de Elaboración y Recepción/Envío:</strong> Fechas que marcan el ciclo de vida inicial.</li>
                  <li><strong>Remitente ("Enviada por") / Destinatario ("Dirigida a"):</strong> Datos de origen y destino del oficio. El sistema despliega sugerencias de búsqueda con base en las entidades frecuentemente creadas.</li>
                  <li><strong>Asunto y Descripción:</strong> Explicación resumida de la comunicación.</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-1 print:bg-slate-100 print:border-slate-300">
                <p className="font-semibold text-blue-400 print:text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> Asignación y Control (Campos No Obligatorios)
                </p>
                <p className="text-xs text-slate-400 print:text-slate-700">
                  Los campos <strong>Responsable Asignado</strong> y <strong>Fecha de Vencimiento</strong> no son estrictamente obligatorios para poder registrar y almacenar la correspondencia. Sin embargo, <strong>es altamente recomendable llenarlos</strong> para que aparezcan en los reportes de vencimiento, alertas del panel de control y estadísticas del Dashboard.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-slate-200 print:text-slate-900">Anexar Documentos Digitales:</p>
                <p className="text-slate-400 print:text-slate-700 text-xs">
                  Para respaldar físicamente la comunicación en la nube, active el botón <strong>"Tiene Anexo"</strong>. Se habilitará un área para soltar archivos donde podrá arrastrar fotos (.png, .jpg, .gif) o documentos PDF de hasta 10 megabytes.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 4: Consulta */}
          <section id="seguimiento" className="space-y-4 scroll-mt-6">
            <h2 className="text-xl font-semibold text-slate-100 border-b border-white/5 pb-2 flex items-center gap-2 print:text-slate-900 print:border-slate-300">
              <span className="text-blue-400 font-mono print:text-slate-800">4.</span> Consulta, Auditoría y Seguimiento
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700">
              La sección <strong>"Correspondencia"</strong> contiene la tabla central de datos. Desde esta vista, puede buscar registros en tiempo real y filtrar la correspondencia por su tipo (Entrante/Saliente), estado actual (Pendiente, Cerrado, Vencido) o rango de fechas de recepción.
            </p>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 text-sm space-y-3 print:border-slate-300 print:bg-slate-100">
              <p className="font-semibold text-slate-200 print:text-slate-900">Acción: Doble Clic en Fila</p>
              <p className="text-slate-400 print:text-slate-700 text-xs">
                Hacer doble clic sobre cualquier fila del listado abre el panel de detalles del expediente. Desde allí podrá:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-400 print:text-slate-700 space-y-1 ml-2">
                <li>Visualizar y descargar los anexos y oficios escaneados.</li>
                <li>Hacer clic en <strong>"Marcar como Cerrado"</strong> para registrar que la respuesta del oficio fue completada con éxito.</li>
                <li>Si necesita volver a auditar el oficio, puede regresarlo a estatus <strong>"Marcar como Pendiente"</strong> en cualquier momento.</li>
              </ul>
            </div>
          </section>

          {/* Sección 5: Reportes */}
          <section id="reportes" className="space-y-4 scroll-mt-6">
            <h2 className="text-xl font-semibold text-slate-100 border-b border-white/5 pb-2 flex items-center gap-2 print:text-slate-900 print:border-slate-300">
              <span className="text-blue-400 font-mono print:text-slate-800">5.</span> Generación de Reportes PDF
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700">
              El módulo de <strong>"Reportes"</strong> permite estructurar los datos del sistema para archivado formal en papel o PDF descargable.
            </p>
            <div className="space-y-2 text-sm text-slate-300 print:text-slate-700">
              <p><strong>Tipos de reportes disponibles:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-slate-400 print:text-slate-700 text-xs">
                <li><strong className="text-slate-200 print:text-slate-900">Listado General (Horizontal):</strong> Una grilla completa con la correspondencia que cumple con los filtros activos de búsqueda.</li>
                <li><strong className="text-slate-200 print:text-slate-900">Ficha Individual (Vertical):</strong> Una hoja de detalle de un único folio específico seleccionado.</li>
                <li><strong className="text-slate-200 print:text-slate-900">Reporte Combinado:</strong> Genera en un solo archivo PDF el listado general seguido de la ficha de detalle.</li>
              </ul>
              <p className="text-xs text-slate-400 print:text-slate-700 mt-2">
                * Nota: Los filtros de búsqueda en la parte inferior del panel actúan de forma reactiva en el reporte PDF. Solo los folios visibles en la vista previa del listado aparecerán en el archivo generado.
              </p>
            </div>
          </section>

          {/* Sección 6: Configuración */}
          <section id="catalogos" className="space-y-6 scroll-mt-6">
            <h2 className="text-xl font-semibold text-slate-100 border-b border-white/5 pb-2 flex items-center gap-2 print:text-slate-900 print:border-slate-300">
              <span className="text-blue-400 font-mono print:text-slate-800">6.</span> Configuración y Administración
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-md font-semibold text-slate-200 print:text-slate-900">6.1. Registro de Funcionarios Responsables</h3>
                <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700">
                  En la pestaña <strong>"Responsables"</strong> se gestiona la nómina interna a la que se le delegan tareas:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 print:text-slate-700 space-y-1 ml-2">
                  <li>Escribe el nombre y cargo en el cuadro de texto y haz clic en <strong>Agregar</strong>.</li>
                  <li>Si un funcionario ya no debe recibir tareas, haz clic en el interruptor de la grilla para cambiarlo a <strong>Inactivo</strong>. Esto evitará que aparezca al registrar nuevos folios, pero no modificará su historial de folios antiguos.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-md font-semibold text-slate-200 print:text-slate-900">6.2. Registro de Entidades Frecuentes</h3>
                <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700">
                  En la pestaña <strong>"Entidades Frecuentes"</strong> se registran las instituciones y ministerios externos habituales:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 print:text-slate-700 space-y-1 ml-2">
                  <li>Escribe el nombre del organismo público, selecciona si actúa como Remitente, Destinatario o Ambos, y haz clic en <strong>Agregar</strong>.</li>
                  <li>Esto mantendrá las sugerencias activas en los inputs del formulario de registro de correspondencia.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-md font-semibold text-slate-200 print:text-slate-900">6.3. Cambio del PIN de Acceso y Nombre Institucional</h3>
                <p className="text-slate-300 text-sm leading-relaxed print:text-slate-700">
                  En la pestaña <strong>"Ajustes"</strong> se gestionan los parámetros de seguridad y cabecera de la aplicación:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 print:text-slate-700 space-y-1 ml-2">
                  <li><strong>Nombre de la Organización:</strong> Modifica este campo para actualizar instantáneamente las etiquetas superiores en la interfaz del sistema y en los membretes oficiales de todos los reportes PDF.</li>
                  <li><strong>PIN de Acceso:</strong> Modifica los 6 dígitos numéricos de seguridad de acceso y haz clic en <strong>Guardar Cambios</strong>.</li>
                </ul>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-xs text-red-400 print:text-slate-950 print:bg-slate-100 print:border-slate-300 mt-2">
                  <strong>IMPORTANTE:</strong> Asegúrate de guardar el nuevo PIN en un lugar seguro. Si guardas un nuevo código, la sesión se actualizará y la próxima vez que ingreses desde cualquier computadora se requerirá el nuevo código que acabas de definir.
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
