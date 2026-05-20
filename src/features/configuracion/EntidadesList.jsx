import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Power, AlertTriangle, Loader2, Save, X } from 'lucide-react'
import { formatDate } from '../../lib/utils'

export default function EntidadesList() {
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntidad, setEditingEntidad] = useState(null)
  const [nombreInput, setNombreInput] = useState('')
  const [tipoInput, setTipoInput] = useState('ambos')
  const [modalError, setModalError] = useState(null)

  // Cargar entidades
  const loadEntidades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('entidades')
        .select('*')
        .order('nombre')

      if (fetchError) throw fetchError
      setEntidades(data || [])
    } catch (err) {
      console.error(err)
      setError('Error al cargar la lista de entidades.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEntidades()
  }, [loadEntidades])

  // Abrir Modal Crear/Editar
  const handleOpenModal = (ent = null) => {
    setEditingEntidad(ent)
    setNombreInput(ent ? ent.nombre : '')
    setTipoInput(ent ? ent.tipo : 'ambos')
    setModalError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEntidad(null)
    setNombreInput('')
    setTipoInput('ambos')
    setModalError(null)
  }

  // Guardar (Crear o Editar)
  const handleSave = async (e) => {
    e.preventDefault()
    if (!nombreInput.trim()) {
      setModalError('El nombre es requerido')
      return
    }

    setActionLoading(true)
    setModalError(null)
    try {
      if (editingEntidad) {
        // Editar
        const { error: updateError } = await supabase
          .from('entidades')
          .update({
            nombre: nombreInput.trim(),
            tipo: tipoInput
          })
          .eq('id', editingEntidad.id)

        if (updateError) throw updateError
      } else {
        // Crear
        const { error: insertError } = await supabase
          .from('entidades')
          .insert([{
            nombre: nombreInput.trim(),
            tipo: tipoInput,
            activa: true
          }])

        if (insertError) throw insertError
      }

      handleCloseModal()
      await loadEntidades()
    } catch (err) {
      console.error(err)
      setModalError(err.message || 'Error al guardar el registro')
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle Activa/Inactiva
  const handleToggleActiva = async (ent) => {
    setActionLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('entidades')
        .update({ activa: !ent.activa })
        .eq('id', ent.id)

      if (updateError) throw updateError
      await loadEntidades()
    } catch (err) {
      console.error(err)
      alert('Error al actualizar el estado de la entidad.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Cabecera de la sección */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <h3 className="text-base font-bold text-slate-200">Catálogo de Entidades Frecuentes</h3>
          <p className="text-xs text-slate-500 mt-0.5">Entidades, organismos o personas externas recurrentes</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary py-1.5 px-3 text-xs">
          <Plus className="w-3.5 h-3.5" />
          Agregar Entidad
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs border border-red-500/20 bg-red-500/10 text-red-300 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de Entidades */}
      <div className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estatus</th>
                <th className="px-4 py-3">Fecha de Creación</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="table-row">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="h-4 rounded bg-white/5 shimmer w-1/3" />
                    </td>
                  </tr>
                ))
              ) : entidades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
                    No se han registrado entidades frecuentes.
                  </td>
                </tr>
              ) : (
                entidades.map((e) => (
                  <tr key={e.id} className="table-row">
                    <td className="px-4 py-3 font-semibold text-slate-200">{e.nombre}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${e.tipo === 'remitente' ? 'badge-entrante' : e.tipo === 'destinatario' ? 'badge-saliente' : 'badge-pendiente'}`}>
                        {e.tipo === 'remitente' ? 'Remitente' : e.tipo === 'destinatario' ? 'Destinatario' : 'Ambos'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${e.activa ? 'badge-cerrado' : 'badge-vencido'}`}>
                        {e.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(e.created_at?.split('T')[0])}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleOpenModal(e)}
                          className="btn-ghost p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-slate-200"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleActiva(e)}
                          className={`btn-ghost p-1.5 rounded hover:bg-white/5 ${e.activa ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                          title={e.activa ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar/Editar */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm w-full">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                {editingEntidad ? 'Editar Entidad' : 'Agregar Entidad'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre / Razón Social *</label>
                <input
                  type="text"
                  className={`glass-input ${modalError ? 'border-red-500/50' : ''}`}
                  placeholder="Ej. Ministerio de Finanzas..."
                  value={nombreInput}
                  onChange={(e) => setNombreInput(e.target.value)}
                  autoFocus
                />
                {modalError && <p className="text-xs text-red-400 mt-1">{modalError}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tipo de Relación *</label>
                <select
                  className="glass-input cursor-pointer"
                  value={tipoInput}
                  onChange={(e) => setTipoInput(e.target.value)}
                >
                  <option value="remitente">Remitente (Solo Recibidas)</option>
                  <option value="destinatario">Destinatario (Solo Enviadas)</option>
                  <option value="ambos">Ambos (Doble Propósito)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button type="button" onClick={handleCloseModal} className="btn-secondary py-1.5 text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={actionLoading} className="btn-primary py-1.5 text-xs px-4">
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
