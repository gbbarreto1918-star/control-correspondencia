import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, File, Trash2, AlertTriangle, Check, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useCorrespondencia } from './useCorrespondencia'
import { getTodayISO, formatDate } from '../../lib/utils'

export default function CorrespondenciaForm() {
  const { id, tipo: routeTipo } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const {
    createCorrespondencia,
    updateCorrespondencia,
    fetchById,
    checkCorrelativo,
    loading: crudLoading,
    error: crudError
  } = useCorrespondencia()

  // State
  const [loading, setLoading] = useState(false)
  const [responsables, setResponsables] = useState([])
  const [entidades, setEntidades] = useState([])
  const [correlativoExists, setCorrelativoExists] = useState(false)
  const [checkingCorrelativo, setCheckingCorrelativo] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [validationErrors, setValidationErrors] = useState({})
  
  const [formData, setFormData] = useState({
    tipo: routeTipo || 'entrante',
    fecha_elaboracion: getTodayISO(),
    fecha_recepcion: getTodayISO(),
    enviada_por: '',
    dirigida_a: '',
    numero_correlativo: '',
    asunto: '',
    descripcion: '',
    responsable_id: '',
    responsable_nombre: '',
    fecha_vencimiento: '',
    estado: 'Pendiente',
    tiene_anexo: false
  })

  const fileInputRef = useRef(null)

  // Cargar catálogos iniciales
  useEffect(() => {
    async function loadCatalogs() {
      try {
        // Cargar responsables activos
        const { data: respData } = await supabase
          .from('responsables')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre')
        
        if (respData) setResponsables(respData)

        // Cargar entidades activas
        const { data: entData } = await supabase
          .from('entidades')
          .select('nombre, tipo')
          .eq('activa', true)
          .order('nombre')

        if (entData) setEntidades(entData)
      } catch (err) {
        console.error('Error cargando catálogos:', err)
      }
    }

    loadCatalogs()
  }, [])

  // Cargar datos en modo edición
  useEffect(() => {
    if (isEditMode) {
      async function loadRecord() {
        setLoading(true)
        const record = await fetchById(id)
        if (record) {
          setFormData({
            tipo: record.tipo,
            fecha_elaboracion: record.fecha_elaboracion,
            fecha_recepcion: record.fecha_recepcion,
            enviada_por: record.enviada_por,
            dirigida_a: record.dirigida_a,
            numero_correlativo: record.numero_correlativo,
            asunto: record.asunto,
            descripcion: record.descripcion,
            responsable_id: record.responsable_id || '',
            responsable_nombre: record.responsable_nombre || '',
            fecha_vencimiento: record.fecha_vencimiento,
            estado: record.estado,
            tiene_anexo: record.tiene_anexo
          })
          // Nota: En modo edición los adjuntos existentes se muestran en detalle o se eliminan por separado
        } else {
          navigate('/correspondencia')
        }
        setLoading(false)
      }
      loadRecord()
    }
  }, [id, isEditMode, fetchById, navigate])

  // Verificación de número correlativo en tiempo real
  useEffect(() => {
    if (!formData.numero_correlativo) {
      setCorrelativoExists(false)
      return
    }

    const timer = setTimeout(async () => {
      setCheckingCorrelativo(true)
      const exists = await checkCorrelativo(formData.numero_correlativo, id)
      setCorrelativoExists(exists)
      setCheckingCorrelativo(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.numero_correlativo, checkCorrelativo, id])

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Si cambia el responsable, actualizar su nombre en el record
      if (field === 'responsable_id') {
        const selected = responsables.find(r => r.id === value)
        updated.responsable_nombre = selected ? selected.nombre : ''
      }
      
      return updated
    })

    // Limpiar error de validación
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  // Manejo de adjuntos
  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      // Validar tipo y tamaño
      const validFiles = newFiles.filter(file => {
        const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
        const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
        return isValidType && isValidSize
      })

      if (validFiles.length !== newFiles.length) {
        alert('Algunos archivos fueron omitidos por no cumplir el formato (PDF/Imágenes) o exceder el tamaño límite de 10MB.')
      }

      setSelectedFiles(prev => [...prev, ...validFiles])
      handleInputChange('tiene_anexo', true)
    }
  }

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        handleInputChange('tiene_anexo', false)
      }
      return updated
    })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      const validFiles = droppedFiles.filter(file => {
        const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
        const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
        return isValidType && isValidSize
      })

      if (validFiles.length !== droppedFiles.length) {
        alert('Algunos archivos fueron omitidos por formato incorrecto o por superar los 10MB.')
      }

      setSelectedFiles(prev => [...prev, ...validFiles])
      handleInputChange('tiene_anexo', true)
    }
  }

  // Guardar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar requeridos
    const errors = {}
    const requiredFields = [
      'numero_correlativo',
      'fecha_elaboracion',
      'fecha_recepcion',
      'enviada_por',
      'dirigida_a',
      'asunto',
      'descripcion'
    ]

    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'Este campo es requerido'
      }
    })

    if (correlativoExists) {
      errors.numero_correlativo = 'Este número correlativo ya está registrado'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      // Scroll al primer error
      const firstErrorKey = Object.keys(errors)[0]
      const element = document.getElementsByName(firstErrorKey)[0]
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)

    // Preparar datos sanitizados (enviar nulo en lugar de cadenas vacías para campos opcionales)
    const payload = { ...formData }
    if (!payload.responsable_id || payload.responsable_id === '') {
      payload.responsable_id = null
      payload.responsable_nombre = null
    }
    if (!payload.fecha_vencimiento || payload.fecha_vencimiento === '') {
      payload.fecha_vencimiento = null
    }

    try {
      let result
      if (isEditMode) {
        result = await updateCorrespondencia(id, payload)
      } else {
        result = await createCorrespondencia(payload, selectedFiles)
      }

      if (result) {
        navigate('/correspondencia')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Cargando datos de la correspondencia...</p>
      </div>
    )
  }

  // Filtrar entidades para datalists
  const remitentesDatalist = entidades.filter(e => e.tipo === 'remitente' || e.tipo === 'ambos')
  const destinatariosDatalist = entidades.filter(e => e.tipo === 'destinatario' || e.tipo === 'ambos')

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Header & Back Link */}
      <div className="flex items-center gap-4">
        <Link
          to="/correspondencia"
          className="btn-ghost p-2 rounded-lg text-slate-400 hover:text-slate-200"
          title="Regresar a la lista"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {isEditMode ? 'Editar Correspondencia' : `Nueva Correspondencia ${formData.tipo === 'entrante' ? 'Entrante' : 'Saliente'}`}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isEditMode ? 'Actualice la información del registro existente' : 'Complete todos los campos requeridos para el nuevo registro'}
          </p>
        </div>
      </div>

      {(crudError || Object.keys(validationErrors).length > 0) && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Error en el formulario</h4>
            <p className="text-xs text-red-300 mt-0.5">
              {crudError || 'Por favor, revise los campos marcados en rojo antes de guardar.'}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección: Información General */}
        <div className="glass-card-static p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 border-b border-white/5 pb-2">Información General</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Tipo de Correspondencia</label>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold capitalize bg-white/5 border border-white/10 text-slate-200`}>
                {formData.tipo === 'entrante' ? '📬 Entrante' : '📤 Saliente'}
              </span>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Número Correlativo *</label>
              <div className="relative">
                <input
                  type="text"
                  name="numero_correlativo"
                  className={`glass-input pr-10 ${validationErrors.numero_correlativo ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  placeholder="Ingrese código de correspondencia..."
                  value={formData.numero_correlativo}
                  onChange={(e) => handleInputChange('numero_correlativo', e.target.value)}
                  disabled={isEditMode} // No permitir editar correlativo
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  {checkingCorrelativo && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                  {!checkingCorrelativo && correlativoExists && <AlertTriangle className="w-4 h-4 text-red-400" title="Correlativo duplicado" />}
                  {!checkingCorrelativo && formData.numero_correlativo && !correlativoExists && <Check className="w-4 h-4 text-green-400" />}
                </div>
              </div>
              {validationErrors.numero_correlativo && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.numero_correlativo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Fecha de Elaboración *</label>
              <input
                type="date"
                name="fecha_elaboracion"
                className={`glass-input ${validationErrors.fecha_elaboracion ? 'border-red-500/50' : ''}`}
                value={formData.fecha_elaboracion}
                onChange={(e) => handleInputChange('fecha_elaboracion', e.target.value)}
              />
              {validationErrors.fecha_elaboracion && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.fecha_elaboracion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Fecha de Recepción / Envío *</label>
              <input
                type="date"
                name="fecha_recepcion"
                className={`glass-input ${validationErrors.fecha_recepcion ? 'border-red-500/50' : ''}`}
                value={formData.fecha_recepcion}
                onChange={(e) => handleInputChange('fecha_recepcion', e.target.value)}
              />
              {validationErrors.fecha_recepcion && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.fecha_recepcion}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Remitente y Destinatario */}
        <div className="glass-card-static p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 border-b border-white/5 pb-2">Remitente y Destinatario</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Enviada por (Remitente) *</label>
              <input
                type="text"
                name="enviada_por"
                list="remitentes"
                className={`glass-input ${validationErrors.enviada_por ? 'border-red-500/50' : ''}`}
                placeholder="Nombre del remitente..."
                value={formData.enviada_por}
                onChange={(e) => handleInputChange('enviada_por', e.target.value)}
              />
              <datalist id="remitentes">
                {remitentesDatalist.map((item, idx) => (
                  <option key={idx} value={item.nombre} />
                ))}
              </datalist>
              {validationErrors.enviada_por && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.enviada_por}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Dirigida a (Destinatario) *</label>
              <input
                type="text"
                name="dirigida_a"
                list="destinatarios"
                className={`glass-input ${validationErrors.dirigida_a ? 'border-red-500/50' : ''}`}
                placeholder="Nombre del destinatario..."
                value={formData.dirigida_a}
                onChange={(e) => handleInputChange('dirigida_a', e.target.value)}
              />
              <datalist id="destinatarios">
                {destinatariosDatalist.map((item, idx) => (
                  <option key={idx} value={item.nombre} />
                ))}
              </datalist>
              {validationErrors.dirigida_a && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.dirigida_a}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Detalle */}
        <div className="glass-card-static p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 border-b border-white/5 pb-2">Detalle del Asunto</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Asunto *</label>
              <input
                type="text"
                name="asunto"
                className={`glass-input ${validationErrors.asunto ? 'border-red-500/50' : ''}`}
                placeholder="Breve resumen del asunto..."
                value={formData.asunto}
                onChange={(e) => handleInputChange('asunto', e.target.value)}
              />
              {validationErrors.asunto && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.asunto}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Descripción / Notas *</label>
              <textarea
                name="descripcion"
                rows={3}
                className={`glass-input py-2.5 resize-none ${validationErrors.descripcion ? 'border-red-500/50' : ''}`}
                placeholder="Contenido descriptivo, notas u observaciones..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
              />
              {validationErrors.descripcion && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.descripcion}</p>
              )}
            </div>
          </div>
        </div>


        {/* Sección: Asignación y Vencimiento */}
        <div className="glass-card-static p-6 space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-lg font-semibold text-slate-200">Asignación y Control</h3>
            <p className="text-xs text-blue-400 mt-1 font-medium">
              Aunque estos campos NO SON OBLIGATORIOS, es importante llenarlos para efectos de las Estadisticas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Responsable Asignado</label>
              <select
                name="responsable_id"
                className={`glass-input cursor-pointer ${validationErrors.responsable_id ? 'border-red-500/50' : ''}`}
                value={formData.responsable_id}
                onChange={(e) => handleInputChange('responsable_id', e.target.value)}
              >
                <option value="">Seleccione un responsable...</option>
                {responsables.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
              {validationErrors.responsable_id && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.responsable_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Fecha de Vencimiento</label>
              <input
                type="date"
                name="fecha_vencimiento"
                className={`glass-input ${validationErrors.fecha_vencimiento ? 'border-red-500/50' : ''}`}
                value={formData.fecha_vencimiento || ''}
                onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
              />
              {validationErrors.fecha_vencimiento && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.fecha_vencimiento}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Anexos (Solo en modo creación para simplificar adjuntos) */}
        {!isEditMode && (
          <div className="glass-card-static p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-lg font-semibold text-slate-200">Anexos / Adjuntos</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.tiene_anexo}
                  onChange={(e) => handleInputChange('tiene_anexo', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-slate-50 peer-checked:after:border-slate-50"></div>
              </label>
            </div>

            {formData.tiene_anexo && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 bg-white/[0.01] hover:bg-white/[0.02] transition-all"
                >
                  <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-medium">
                    Arrastra tus archivos aquí o haz clic para buscar
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Solo PDF o Imágenes (Máx. 10MB por archivo)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept="application/pdf,image/*"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Archivos seleccionados ({selectedFiles.length})</p>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <File className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                              <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/correspondencia')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary min-w-[120px]"
            disabled={loading || checkingCorrelativo}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              'Guardar Registro'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
