import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Calendar, FileText, User, UserCheck, AlertTriangle, Eye, Download } from 'lucide-react'
import { useCorrespondencia } from './useCorrespondencia'
import {
  calcularEstado,
  formatDate,
  getEstadoBadgeClass,
  getTipoBadgeClass,
  formatFileSize
} from '../../lib/utils'

export default function CorrespondenciaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchById, updateCorrespondencia, deleteCorrespondencia, loading, error } = useCorrespondencia()
  const [record, setRecord] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Cargar registro al montar
  useEffect(() => {
    async function loadRecord() {
      const data = await fetchById(id)
      if (data) {
        setRecord(data)
      } else {
        navigate('/correspondencia')
      }
    }
    loadRecord()
  }, [id, fetchById, navigate])

  // Cambiar estado del registro (Pendiente/Cerrado)
  const handleStatusChange = async (newStatus) => {
    if (!record) return
    setUpdatingStatus(true)
    const updated = await updateCorrespondencia(record.id, { estado: newStatus })
    if (updated) {
      setRecord(prev => ({ ...prev, estado: updated.estado }))
    }
    setUpdatingStatus(false)
  }

  // Eliminar registro
  const handleDelete = async () => {
    if (!record) return
    const success = await deleteCorrespondencia(record.id)
    if (success) {
      navigate('/correspondencia')
    }
  }

  if (loading && !record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Cargando detalles de la correspondencia...</p>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-200">Error al cargar</h3>
        <p className="text-slate-400 text-sm">{error || 'El registro no existe'}</p>
        <Link to="/correspondencia" className="btn-secondary inline-flex">
          Regresar a Correspondencia
        </Link>
      </div>
    )
  }

  const estadoCalculado = calcularEstado(record.fecha_vencimiento, record.estado)

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-4">
          <Link
            to="/correspondencia"
            className="btn-ghost p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xl font-bold text-slate-100">
                #{record.numero_correlativo}
              </span>
              <span className={`badge ${getTipoBadgeClass(record.tipo)}`}>
                {record.tipo === 'entrante' ? 'Entrante' : 'Saliente'}
              </span>
              <span className={`badge ${getEstadoBadgeClass(estadoCalculado)}`}>
                {estadoCalculado}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Detalle y trazabilidad del registro
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <Link to={`/correspondencia/editar/${record.id}`} className="btn-primary flex items-center gap-1.5">
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-ghost text-slate-400 hover:text-red-400 p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-white/5"
            title="Eliminar registro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid de campos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Ficha Técnica */}
        <div className="md:col-span-2 space-y-6">
          {/* Tarjeta de Información General */}
          <div className="glass-card-static p-6 space-y-6">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Asunto</span>
              <h2 className="text-lg font-bold text-slate-100 leading-snug">{record.asunto}</h2>
            </div>

            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Descripción / Notas</span>
              <p className="text-sm text-slate-300 whitespace-pre-line bg-white/[0.02] border border-white/5 p-4 rounded-xl leading-relaxed">
                {record.descripcion || 'Sin descripción adicional.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Enviado Por (Remitente)</span>
                <p className="text-sm font-semibold text-slate-200">{record.enviada_por || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Dirigido A (Destinatario)</span>
                <p className="text-sm font-semibold text-slate-200">{record.dirigida_a || '—'}</p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Adjuntos */}
          <div className="glass-card-static p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-200 border-b border-white/5 pb-2">Archivos Adjuntos (Anexos)</h3>
            {record.adjuntos && record.adjuntos.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {record.adjuntos.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{file.nombre_archivo}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.tamano)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200"
                        title="Ver en nueva pestaña"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={file.url}
                        download={file.nombre_archivo}
                        className="btn-ghost p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No hay archivos adjuntos en esta correspondencia.</p>
            )}
          </div>
        </div>

        {/* Panel Derecho: Fechas, Asignación y Estado */}
        <div className="space-y-6">
          {/* Control de Estado */}
          <div className="glass-card-static p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-200">Control de Flujo</h3>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-2">Estado del Trámite</span>
              <div className="flex flex-col gap-2">
                <button
                  disabled={updatingStatus || record.estado === 'Pendiente'}
                  onClick={() => handleStatusChange('Pendiente')}
                  className={`btn-ghost justify-center py-2 text-xs font-semibold ${record.estado === 'Pendiente' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'text-slate-400 hover:bg-white/5 border border-white/5'}`}
                >
                  Cambiar a Pendiente
                </button>
                <button
                  disabled={updatingStatus || record.estado === 'Cerrado'}
                  onClick={() => handleStatusChange('Cerrado')}
                  className={`btn-ghost justify-center py-2 text-xs font-semibold ${record.estado === 'Cerrado' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'text-slate-400 hover:bg-white/5 border border-white/5'}`}
                >
                  Cerrar Correspondencia
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta de Trazabilidad */}
          <div className="glass-card-static p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-200 border-b border-white/5 pb-2">Trazabilidad</h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 block">Fecha de Elaboración</span>
                  <span className="text-sm font-medium text-slate-200">{formatDate(record.fecha_elaboracion)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 block">Fecha de Recepción</span>
                  <span className="text-sm font-medium text-slate-200">{formatDate(record.fecha_recepcion)}</span>
                </div>
              </div>

              <div className="flex gap-3 border-t border-white/5 pt-4">
                <Calendar className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 block">Fecha de Vencimiento</span>
                  <span className="text-sm font-medium text-red-200">{formatDate(record.fecha_vencimiento)}</span>
                </div>
              </div>

              <div className="flex gap-3 border-t border-white/5 pt-4">
                <User className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 block">Responsable</span>
                  <span className="text-sm font-medium text-slate-200">{record.responsable_nombre || 'No asignado'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md w-full">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">¿Eliminar registro?</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Esta acción eliminará de forma permanente la correspondencia correlativo <span className="font-mono text-slate-300">#{record.numero_correlativo}</span> y todos sus archivos adjuntos. No se puede deshacer.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-ghost flex-1 py-2.5 text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 font-semibold"
                >
                  Eliminar permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
