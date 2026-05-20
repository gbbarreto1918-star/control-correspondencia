import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Header from '../../components/layout/Header'
import ResponsablesList from './ResponsablesList'
import EntidadesList from './EntidadesList'
import { Settings, Users, Building, ShieldAlert, Save, Loader2, Check } from 'lucide-react'

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState('responsables')
  
  // Settings State
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [orgName, setOrgName] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [settingsError, setSettingsError] = useState('')

  // Cargar configuración de la organización
  useEffect(() => {
    async function loadConfig() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('configuracion')
          .select('*')
          .eq('id', 1)
          .single()

        if (data) {
          setOrgName(data.nombre_organizacion || 'Organización')
          setPin(data.pin_secretaria || '250261')
          setPinConfirm(data.pin_secretaria || '250261')
        }
      } catch (err) {
        console.error('Error cargando configuración:', err)
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSettingsError('')
    setSuccessMsg('')

    if (!orgName.trim()) {
      setSettingsError('El nombre de la organización es requerido')
      return
    }

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setSettingsError('El PIN debe tener exactamente 6 dígitos numéricos')
      return
    }

    if (pin !== pinConfirm) {
      setSettingsError('Los códigos PIN ingresados no coinciden')
      return
    }

    setSaveLoading(true)
    try {
      const { error } = await supabase
        .from('configuracion')
        .update({
          nombre_organizacion: orgName.trim(),
          pin_secretaria: pin
        })
        .eq('id', 1)

      if (error) throw error

      setSuccessMsg('Configuración general actualizada exitosamente')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error(err)
      setSettingsError(err.message || 'Error al guardar la configuración')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Configuración del Sistema"
        subtitle="Administre los parámetros de la organización, PIN de acceso y catálogos"
      />

      <div className="px-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Barra lateral de opciones / pestañas */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('responsables')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${activeTab === 'responsables' ? 'bg-blue-600/10 border-blue-500/30 text-blue-300' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5'}`}
          >
            <Users className="w-4 h-4" />
            <span>Responsables</span>
          </button>

          <button
            onClick={() => setActiveTab('entidades')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${activeTab === 'entidades' ? 'bg-blue-600/10 border-blue-500/30 text-blue-300' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5'}`}
          >
            <Building className="w-4 h-4" />
            <span>Entidades Frecuentes</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${activeTab === 'general' ? 'bg-blue-600/10 border-blue-500/30 text-blue-300' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5'}`}
          >
            <Settings className="w-4 h-4" />
            <span>General / Seguridad</span>
          </button>
        </div>

        {/* Panel de Contenido Principal */}
        <div className="lg:col-span-3">
          <div className="glass-card-static p-6">
            {activeTab === 'responsables' && <ResponsablesList />}
            {activeTab === 'entidades' && <EntidadesList />}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-200 border-b border-white/5 pb-2">Configuración General</h3>
                  <p className="text-xs text-slate-500 mt-1">Defina los datos primarios de la aplicación y la clave de acceso</p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
                    {/* Mensajes de feedback */}
                    {successMsg && (
                      <div className="p-3 text-xs border border-green-500/20 bg-green-500/10 text-green-300 rounded-lg flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>{successMsg}</span>
                      </div>
                    )}
                    {settingsError && (
                      <div className="p-3 text-xs border border-red-500/20 bg-red-500/10 text-red-300 rounded-lg flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>{settingsError}</span>
                      </div>
                    )}

                    {/* Campo: Nombre Organización */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nombre de la Organización *</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="Ej. Alcaldía del Municipio..."
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                      />
                    </div>

                    {/* Campos: PIN y Confirmación */}
                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Nuevo PIN de Acceso (6 dígitos) *</label>
                        <input
                          type="password"
                          maxLength={6}
                          className="glass-input text-center font-mono font-bold tracking-widest text-lg"
                          placeholder="******"
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Confirmar Nuevo PIN *</label>
                        <input
                          type="password"
                          maxLength={6}
                          className="glass-input text-center font-mono font-bold tracking-widest text-lg"
                          placeholder="******"
                          value={pinConfirm}
                          onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="btn-primary py-2 px-4 text-xs font-semibold"
                      >
                        {saveLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Guardar Cambios</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
