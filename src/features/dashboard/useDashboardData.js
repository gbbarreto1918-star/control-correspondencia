import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { getTodayISO } from '../../lib/utils'

/**
 * Hook para obtener métricas del dashboard.
 * Calcula totales, agrupaciones por fecha/responsable,
 * y alertas de vencimiento próximo.
 */
export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: records, error: fetchError } = await supabase
        .from('correspondencia')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const today = getTodayISO()
      const todayDate = new Date(today)

      // --- Totales ---
      const totalRecibida = records.filter(r => r.tipo === 'entrante').length
      const totalEnviada = records.filter(r => r.tipo === 'saliente').length

      const totalPendientes = records.filter(
        r => r.estado !== 'Cerrado' && r.fecha_vencimiento && new Date(r.fecha_vencimiento) >= todayDate
      ).length

      const totalVencidos = records.filter(
        r => r.estado !== 'Cerrado' && r.fecha_vencimiento && new Date(r.fecha_vencimiento) < todayDate
      ).length

      const totalCerrados = records.filter(r => r.estado === 'Cerrado').length

      // Próximos a vencer (hoy + 3 días)
      const tresDias = new Date(todayDate)
      tresDias.setDate(tresDias.getDate() + 3)

      const proximosVencer = records.filter(r => {
        if (r.estado === 'Cerrado' || !r.fecha_vencimiento) return false
        const fv = new Date(r.fecha_vencimiento)
        return fv >= todayDate && fv <= tresDias
      })

      // No respondida
      const noRespondidaEnviada = records.filter(
        r => r.tipo === 'saliente' && r.estado !== 'Cerrado'
      ).length

      const noRespondidaRecibida = records.filter(
        r => r.tipo === 'entrante' && r.estado !== 'Cerrado'
      ).length

      // --- Chart Data: últimos 30 días ---
      const hace30 = new Date(todayDate)
      hace30.setDate(hace30.getDate() - 30)

      // Helper: agrupar por fecha, devolver array de { fecha, count }
      const agruparPorFecha = (items, campo) => {
        const mapa = {}
        items.forEach(item => {
          const f = item[campo]
          if (!f) return
          const fd = new Date(f)
          if (fd < hace30) return
          const key = f // ISO date string
          mapa[key] = (mapa[key] || 0) + 1
        })
        // Rellenar los 30 días
        const result = []
        for (let i = 30; i >= 0; i--) {
          const d = new Date(todayDate)
          d.setDate(d.getDate() - i)
          const iso = d.toISOString().split('T')[0]
          const dd = String(d.getDate()).padStart(2, '0')
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          result.push({
            fecha: `${dd}/${mm}`,
            count: mapa[iso] || 0,
          })
        }
        return result
      }

      const recibidaPorFecha = agruparPorFecha(
        records.filter(r => r.tipo === 'entrante'),
        'fecha_recepcion'
      )

      const enviadaPorFecha = agruparPorFecha(
        records.filter(r => r.tipo === 'saliente'),
        'fecha_elaboracion'
      )

      // Por responsable
      const mapaResp = {}
      records.forEach(r => {
        const nombre = r.responsable_nombre || 'Sin asignar'
        mapaResp[nombre] = (mapaResp[nombre] || 0) + 1
      })
      const porResponsable = Object.entries(mapaResp)
        .map(([nombre, count]) => ({ nombre, count }))
        .sort((a, b) => b.count - a.count)

      const top5Responsables = porResponsable.slice(0, 5)

      setData({
        totalRecibida,
        totalEnviada,
        totalPendientes,
        totalVencidos,
        totalCerrados,
        proximosVencer,
        noRespondidaEnviada,
        noRespondidaRecibida,
        recibidaPorFecha,
        enviadaPorFecha,
        porResponsable,
        top5Responsables,
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Error al cargar datos del dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
