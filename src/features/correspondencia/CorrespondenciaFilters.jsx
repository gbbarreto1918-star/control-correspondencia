import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, X } from 'lucide-react'

/**
 * Barra de filtros para la lista de correspondencia
 * Incluye búsqueda, tipo, estado, rango de fechas, remitente y responsable
 */
export default function CorrespondenciaFilters({ filters, onFilterChange, onClear }) {
  const [responsables, setResponsables] = useState([])

  // Cargar lista de responsables al montar
  useEffect(() => {
    async function loadResponsables() {
      const { data } = await supabase
        .from('responsables')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre')

      if (data) setResponsables(data)
    }
    loadResponsables()
  }, [])

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== '' && v !== null && v !== undefined
  )

  return (
    <div className="glass-card-static p-4">
      <div className="grid grid-cols-4 gap-3">
        {/* Búsqueda general */}
        <div className="relative">
          <label className="block text-sm text-slate-400 mb-1">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              className="glass-input pl-9"
              placeholder="Buscar por asunto o correlativo..."
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Tipo</label>
          <select
            className="glass-input appearance-none cursor-pointer"
            value={filters.tipo || ''}
            onChange={(e) => handleChange('tipo', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="entrante">Entrante</option>
            <option value="saliente">Saliente</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Estado</label>
          <select
            className="glass-input appearance-none cursor-pointer"
            value={filters.estado || ''}
            onChange={(e) => handleChange('estado', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Vencido">Vencido</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>

        {/* Enviada por */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Enviada por</label>
          <input
            type="text"
            className="glass-input"
            placeholder="Nombre del remitente..."
            value={filters.enviada_por || ''}
            onChange={(e) => handleChange('enviada_por', e.target.value)}
          />
        </div>

        {/* Fecha desde */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Desde</label>
          <input
            type="date"
            className="glass-input"
            value={filters.fecha_desde || ''}
            onChange={(e) => handleChange('fecha_desde', e.target.value)}
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Hasta</label>
          <input
            type="date"
            className="glass-input"
            value={filters.fecha_hasta || ''}
            onChange={(e) => handleChange('fecha_hasta', e.target.value)}
          />
        </div>

        {/* Responsable */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Responsable</label>
          <select
            className="glass-input appearance-none cursor-pointer"
            value={filters.responsable_id || ''}
            onChange={(e) => handleChange('responsable_id', e.target.value)}
          >
            <option value="">Todos</option>
            {responsables.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Botón limpiar filtros */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="btn-ghost text-slate-400 hover:text-red-400 transition-colors"
              title="Limpiar filtros"
            >
              <X className="w-4 h-4" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
