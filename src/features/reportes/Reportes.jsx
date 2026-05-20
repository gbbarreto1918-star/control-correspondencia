import { useState, useEffect, useCallback } from 'react'
import Header from '../../components/layout/Header'
import CorrespondenciaFilters from '../correspondencia/CorrespondenciaFilters'
import { useCorrespondencia } from '../correspondencia/useCorrespondencia'
import { usePdfExport } from './usePdfExport'
import { supabase } from '../../lib/supabase'
import {
  calcularEstado,
  formatDate,
  getEstadoBadgeClass,
  getTipoBadgeClass,
  truncate
} from '../../lib/utils'
import { FileDown, Eye, FileText, AlertTriangle, Loader2 } from 'lucide-react'

const INITIAL_FILTERS = {
  search: '',
  tipo: '',
  estado: '',
  enviada_por: '',
  fecha_desde: '',
  fecha_hasta: '',
  responsable_id: '',
}

export default function Reportes() {
  const { fetchCorrespondencia, fetchById, loading } = useCorrespondencia()
  const { exportListado, exportDetalle, exportAmbos } = usePdfExport()

  // State
  const [data, setData] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [selectedRecordId, setSelectedRecordId] = useState('')
  const [orgName, setOrgName] = useState('Organización')
  const [exportType, setExportType] = useState('listado') // 'listado', 'detalle', 'ambos'
  const [exportLoading, setExportLoading] = useState(false)

  // Cargar nombre de la organización
  useEffect(() => {
    async function loadOrgConfig() {
      try {
        const { data: config } = await supabase
          .from('configuracion')
          .select('nombre_organizacion')
          .eq('id', 1)
          .single()
        
        if (config) {
          setOrgName(config.nombre_organizacion)
        }
      } catch (err) {
        console.error('Error cargando organización:', err)
      }
    }
    loadOrgConfig()
  }, [])

  // Cargar datos filtrados
  const loadData = useCallback(async () => {
    const activeFilters = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value) activeFilters[key] = value
    })
    const result = await fetchCorrespondencia(activeFilters)
    setData(result)
    
    // Auto-seleccionar primer elemento si cambia la lista
    if (result.length > 0) {
      setSelectedRecordId(result[0].id)
    } else {
      setSelectedRecordId('')
    }
  }, [filters, fetchCorrespondencia])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS)
  }

  // Ejecutar exportación a PDF
  const handleExport = async () => {
    setExportLoading(true)
    try {
      if (exportType === 'listado') {
        exportListado(data, filters, orgName)
      } else if (exportType === 'detalle') {
        if (!selectedRecordId) {
          alert('Por favor seleccione un registro del listado para exportar su detalle.')
          return
        }
        const recordDetails = await fetchById(selectedRecordId)
        if (recordDetails) {
          exportDetalle(recordDetails, orgName)
        }
      } else if (exportType === 'ambos') {
        if (!selectedRecordId) {
          alert('Por favor seleccione un registro del listado para el reporte combinado.')
          return
        }
        const recordDetails = await fetchById(selectedRecordId)
        exportAmbos(data, recordDetails, filters, orgName)
      }
    } catch (err) {
      console.error(err)
      alert('Ocurrió un error al generar el PDF.')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Generador de Reportes"
        subtitle="Filtre los datos y genere reportes oficiales en formato PDF listos para imprimir"
      />

      <div className="px-8 space-y-6">
        {/* Controles de Configuración de Exportación */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tarjeta: Opciones de Exportación */}
          <div className="glass-card-static p-6 space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">
              Parámetros de Exportación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radio options */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tipo de Reporte
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      value="listado"
                      checked={exportType === 'listado'}
                      onChange={() => setExportType('listado')}
                      className="text-blue-500 focus:ring-0 focus:ring-offset-0 bg-transparent"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-200">Listado General Filtrado</span>
                      <p className="text-xs text-slate-500 mt-0.5">Tabla resumida en formato horizontal (Landscape)</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      value="detalle"
                      checked={exportType === 'detalle'}
                      onChange={() => setExportType('detalle')}
                      className="text-blue-500 focus:ring-0 focus:ring-offset-0 bg-transparent"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-200">Detalle de Registro Individual</span>
                      <p className="text-xs text-slate-500 mt-0.5">Ficha técnica completa de correspondencia elegida (Vertical)</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="exportType"
                      value="ambos"
                      checked={exportType === 'ambos'}
                      onChange={() => setExportType('ambos')}
                      className="text-blue-500 focus:ring-0 focus:ring-offset-0 bg-transparent"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-200">Reporte Combinado (Ambos)</span>
                      <p className="text-xs text-slate-500 mt-0.5">Genera tanto el listado como la ficha detallada</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Registro Seleccionado (solo si requiere detalle) */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Selección para Ficha Técnica
                  </label>
                  <select
                    disabled={exportType === 'listado'}
                    value={selectedRecordId}
                    onChange={(e) => setSelectedRecordId(e.target.value)}
                    className="glass-input cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccione correspondencia...</option>
                    {data.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.numero_correlativo} - {truncate(item.asunto, 25)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {exportType === 'listado'
                      ? 'No requerido para el listado general.'
                      : 'Elegido para la exportación de ficha técnica.'}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleExport}
                    disabled={exportLoading || data.length === 0}
                    className="w-full btn-primary py-3 justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generando PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>Exportar a PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta: Información Organizacional */}
          <div className="glass-card-static p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">
                Pie de Firma / Membrete
              </h3>
              <div className="space-y-3 mt-4">
                <div>
                  <span className="text-xs text-slate-500 block uppercase tracking-wider">Organización Emisora</span>
                  <span className="text-sm font-bold text-slate-200 mt-0.5 block">{orgName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase tracking-wider">Formato de Exportación</span>
                  <span className="text-xs text-slate-400 mt-0.5 block">Documento PDF / Grilla Oficial</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2 text-slate-500 text-xs leading-normal bg-white/[0.01] border border-white/5 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>Los filtros activos en la barra inferior afectarán directamente a los registros incluidos en el PDF.</span>
            </div>
          </div>
        </div>

        {/* Filtros Activos */}
        <CorrespondenciaFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Vista Previa */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
            Vista Previa de Registros ({data.length})
          </h4>
          <div className="glass-card-static overflow-hidden">
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-left sticky top-0">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Asunto</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Remitente / Destinatario</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Responsable</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencimiento</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="table-row">
                        {[...Array(7)].map((__, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-4 rounded bg-white/5 shimmer w-2/3" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                        No hay registros que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => {
                      const estadoCalculado = calcularEstado(item.fecha_vencimiento, item.estado)
                      const isSelected = selectedRecordId === item.id
                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            if (exportType !== 'listado') {
                              setSelectedRecordId(item.id)
                            }
                          }}
                          className={`table-row cursor-pointer transition-all ${isSelected && exportType !== 'listado' ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''}`}
                        >
                          <td className="px-4 py-3 font-mono text-xs">{item.numero_correlativo}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${getTipoBadgeClass(item.tipo)}`}>
                              {item.tipo === 'entrante' ? 'Entrante' : 'Saliente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-200">{truncate(item.asunto, 30)}</td>
                          <td className="px-4 py-3 text-slate-400">
                            {item.tipo === 'entrante' ? item.enviada_por : item.dirigida_a}
                          </td>
                          <td className="px-4 py-3 text-slate-400">{item.responsable_nombre}</td>
                          <td className="px-4 py-3 text-slate-400">{formatDate(item.fecha_vencimiento)}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${getEstadoBadgeClass(estadoCalculado)}`}>
                              {estadoCalculado}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
