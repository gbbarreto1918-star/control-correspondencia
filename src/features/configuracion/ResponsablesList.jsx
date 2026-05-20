import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Power, AlertTriangle, Loader2, Save, X } from 'lucide-react'
import { formatDate } from '../../lib/utils'

export default function ResponsablesList() {
  const [responsables, setResponsables] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResponsable, setEditingResponsable] = useState(null)
  const [nombreInput, setNombreInput] = useState('')
  const [modalError, setModalError] = useState(null)

  // Cargar responsables
  const loadResponsables = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('responsables')
        .select('*')
        .order('nombre')

      if (fetchError) throw fetchError
      setResponsables(data || [])
    } catch (err) {
      console.error(err)
      setError('Error al cargar la lista de responsables.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResponsables()
  }, [loadResponsables])

  // Abrir Modal Crear/Editar
  const handleOpenModal = (resp = null) => {
    setEditingResponsable(resp)
    setNombreInput(resp ? resp.nombre : '')
    setModalError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingResponsable(null)
    setNombreInput('')
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
      if (editingResponsable) {
        // Editar
        const { error: updateError } = await supabase
          .from('responsables')
          .update({ nombre: nombreInput.trim() })
          .eq('id', editingResponsable.id)

        if (updateError) throw updateError
      } else {
        // Crear
        const { error: insertError } = await supabase
          .from('responsables')
          .insert([{ nombre: nombreInput.trim(), activo: true }])

        if (insertError) throw insertError
      }

      handleCloseModal()
      await loadResponsables()
    } catch (err) {
      console.error(err)
      setModalError(err.message || 'Error al guardar el registro')
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle Activo/Inactivo
  const handleToggleActivo = async (resp) => {
    setActionLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('responsables')
        .update({ activo: !resp.activo })
        .eq('id', resp.id)

      if (updateError) throw updateError
      await loadResponsables()
    } catch (err) {
      console.error(err)
      alert('Error al actualizar el estado del responsable.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Cabecera de la sección */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <h3 className="text-base font-bold text-slate-200">Catálogo de Responsables</h3>
          <p className="text-xs text-slate-500 mt-0.5">Asignación de destinatarios/remitentes internos en la correspondencia</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary py-1.5 px-3 text-xs">
          <Plus className="w-3.5 h-3.5" />
          Agregar Responsable
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs border border-red-500/20 bg-red-500/10 text-red-300 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de Responsables */}
      <div className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Estatus</th>
                <th className="px-4 py-3">Fecha de Creación</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="table-row">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="h-4 rounded bg-white/5 shimmer w-1/3" />
                    </td>
                  </tr>
                ))
              ) : responsables.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">
                    No se han registrado responsables en el sistema.
                  </td>
                </tr>
              ) : (
                responsables.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3 font-semibold text-slate-200">{r.nombre}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${r.activo ? 'badge-cerrado' : 'badge-vencido'}`}>
                        {r.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(r.created_at?.split('T')[0])}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleOpenModal(r)}
                          className="btn-ghost p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-slate-200"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleActivo(r)}
                          className={`btn-ghost p-1.5 rounded hover:bg-white/5 ${r.activo ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                          title={r.activo ? 'Desactivar' : 'Activar'}
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
                {editingResponsable ? 'Editar Responsable' : 'Agregar Responsable'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  className={`glass-input ${modalError ? 'border-red-500/50' : ''}`}
                  placeholder="Ej. Abg. María Pérez..."
                  value={nombreInput}
                  onChange={(e) => setNombreInput(e.target.value)}
                  autoFocus
                />
                {modalError && <p className="text-xs text-red-400 mt-1">{modalError}</p>}
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
