import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Plus, ArrowDownLeft, ArrowUpRight, Inbox } from 'lucide-react'
import { useCorrespondencia } from './useCorrespondencia'
import CorrespondenciaFilters from './CorrespondenciaFilters'
import {
  calcularEstado,
  formatDate,
  getEstadoBadgeClass,
  getTipoBadgeClass,
  truncate,
  diasHastaVencimiento,
} from '../../lib/utils'

const INITIAL_FILTERS = {
  search: '',
  tipo: '',
  estado: '',
  enviada_por: '',
  fecha_desde: '',
  fecha_hasta: '',
  responsable_id: '',
}

/**
 * Lista principal de correspondencia con filtros, tabla y acciones
 */
export default function CorrespondenciaList() {
  const { fetchCorrespondencia, loading } = useCorrespondencia()
  const [data, setData] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  const loadData = useCallback(async () => {
    // Limpiar filtros vacíos antes de enviar
    const activeFilters = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value) activeFilters[key] = value
    })
    const result = await fetchCorrespondencia(activeFilters)
    setData(result)
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

  // Badge de días restantes para vencimiento
  const renderDiasRestantes = (fechaVencimiento, estado) => {
    if (!fechaVencimiento) return <span className="text-slate-500">—</span>
    if (estado === 'Cerrado') return null

    const dias = diasHastaVencimiento(fechaVencimiento)

    if (dias < 0) {
      return (
        <span className="text-xs text-red-400 font-medium ml-2">
          ({Math.abs(dias)}d vencido)
        </span>
      )
    }
    if (dias === 0) {
      return (
        <span className="text-xs text-amber-400 font-medium ml-2">
          (Hoy)
        </span>
      )
    }
    if (dias <= 3) {
      return (
        <span className="text-xs text-amber-400 font-medium ml-2">
          ({dias}d restantes)
        </span>
      )
    }
    return (
      <span className="text-xs text-slate-500 font-medium ml-2">
        ({dias}d restantes)
      </span>
    )
  }

  // Filas skeleton para estado de carga
  const renderSkeletonRows = () => (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="table-row">
          {[...Array(8)].map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-white/5 shimmer" style={{ width: `${60 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Correspondencia</h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestión de correspondencia entrante y saliente
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/correspondencia/nueva/entrante" className="btn-primary">
            <ArrowDownLeft className="w-4 h-4" />
            Nueva Entrante
          </Link>
          <Link to="/correspondencia/nueva/saliente" className="btn-primary">
            <ArrowUpRight className="w-4 h-4" />
            Nueva Saliente
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <CorrespondenciaFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Tabla */}
      <div className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Asunto</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">De / Para</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Responsable</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencimiento</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                renderSkeletonRows()
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Inbox className="w-12 h-12 text-slate-600" />
                      <p className="text-slate-400 text-base">
                        No se encontró correspondencia
                      </p>
                      <p className="text-slate-500 text-sm">
                        Intenta ajustar los filtros o crea un nuevo registro
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const estadoCalculado = calcularEstado(item.fecha_vencimiento, item.estado)
                  return (
                    <tr key={item.id} className="table-row">
                      {/* Correlativo */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-slate-300">
                          {item.numero_correlativo}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="px-4 py-3">
                        <span className={`badge ${getTipoBadgeClass(item.tipo)}`}>
                          {item.tipo === 'entrante' ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {item.tipo === 'entrante' ? 'Entrante' : 'Saliente'}
                        </span>
                      </td>

                      {/* Asunto */}
                      <td className="px-4 py-3">
                        <span className="text-slate-200" title={item.asunto}>
                          {truncate(item.asunto, 40)}
                        </span>
                      </td>

                      {/* De / Para */}
                      <td className="px-4 py-3 text-slate-300">
                        {item.tipo === 'entrante'
                          ? item.enviada_por || '—'
                          : item.dirigida_a || '—'}
                      </td>

                      {/* Responsable */}
                      <td className="px-4 py-3 text-slate-300">
                        {item.responsable_nombre || '—'}
                      </td>

                      {/* Vencimiento */}
                      <td className="px-4 py-3">
                        <span className="text-slate-300">
                          {formatDate(item.fecha_vencimiento)}
                        </span>
                        {renderDiasRestantes(item.fecha_vencimiento, estadoCalculado)}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3">
                        <span className={`badge ${getEstadoBadgeClass(estadoCalculado)}`}>
                          {estadoCalculado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/correspondencia/${item.id}`}
                            className="btn-ghost p-2 rounded-lg hover:bg-white/5"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/correspondencia/editar/${item.id}`}
                            className="btn-ghost p-2 rounded-lg hover:bg-white/5"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </div>
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
  )
}
