import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * Hook para operaciones CRUD de correspondencia
 * Incluye manejo de adjuntos vía Supabase Storage
 */
export function useCorrespondencia() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Obtener lista de correspondencia con filtros opcionales
   */
  const fetchCorrespondencia = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('correspondencia')
        .select('*')
        .order('created_at', { ascending: false })

      // Filtro por tipo
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      // Filtro por estado
      if (filters.estado) {
        query = query.eq('estado', filters.estado)
      }

      // Filtro por responsable
      if (filters.responsable_id) {
        query = query.eq('responsable_id', filters.responsable_id)
      }

      // Filtro por remitente (búsqueda parcial)
      if (filters.enviada_por) {
        query = query.ilike('enviada_por', `%${filters.enviada_por}%`)
      }

      // Filtro por rango de fechas (fecha_recepcion)
      if (filters.fecha_desde) {
        query = query.gte('fecha_recepcion', filters.fecha_desde)
      }
      if (filters.fecha_hasta) {
        query = query.lte('fecha_recepcion', filters.fecha_hasta)
      }

      // Búsqueda general (asunto o correlativo)
      if (filters.search) {
        query = query.or(
          `asunto.ilike.%${filters.search}%,numero_correlativo.ilike.%${filters.search}%`
        )
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      const message = err?.message || 'Error al cargar la correspondencia'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Obtener un registro por ID con sus adjuntos
   */
  const fetchById = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      // Obtener correspondencia
      const { data: correspondencia, error: corrError } = await supabase
        .from('correspondencia')
        .select('*')
        .eq('id', id)
        .single()

      if (corrError) throw corrError

      // Obtener adjuntos asociados
      const { data: adjuntos, error: adjError } = await supabase
        .from('adjuntos')
        .select('*')
        .eq('correspondencia_id', id)
        .order('created_at', { ascending: true })

      if (adjError) throw adjError

      return { ...correspondencia, adjuntos: adjuntos || [] }
    } catch (err) {
      const message = err?.message || 'Error al cargar el registro'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Crear nueva correspondencia con adjuntos opcionales
   */
  const createCorrespondencia = useCallback(async (data, files = []) => {
    setLoading(true)
    setError(null)

    try {
      // Insertar correspondencia
      const { data: created, error: insertError } = await supabase
        .from('correspondencia')
        .insert([data])
        .select()
        .single()

      if (insertError) throw insertError

      // Subir archivos adjuntos si existen
      if (files.length > 0) {
        const adjuntosRecords = []

        for (const file of files) {
          const filePath = `${created.id}/${file.name}`

          const { error: uploadError } = await supabase.storage
            .from('correspondencia-adjuntos')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from('correspondencia-adjuntos')
            .getPublicUrl(filePath)

          adjuntosRecords.push({
            correspondencia_id: created.id,
            nombre_archivo: file.name,
            url: urlData.publicUrl,
            tipo_archivo: file.type,
            tamano: file.size,
          })
        }

        // Insertar registros de adjuntos
        if (adjuntosRecords.length > 0) {
          const { error: adjError } = await supabase
            .from('adjuntos')
            .insert(adjuntosRecords)

          if (adjError) throw adjError
        }
      }

      return created
    } catch (err) {
      const message = err?.message || 'Error al crear la correspondencia'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Actualizar correspondencia existente
   */
  const updateCorrespondencia = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)

    try {
      const { data: updated, error: updateError } = await supabase
        .from('correspondencia')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return updated
    } catch (err) {
      const message = err?.message || 'Error al actualizar la correspondencia'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Eliminar correspondencia (adjuntos se eliminan en cascada por FK)
   */
  const deleteCorrespondencia = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      // Primero eliminar archivos del storage
      const { data: adjuntos } = await supabase
        .from('adjuntos')
        .select('nombre_archivo')
        .eq('correspondencia_id', id)

      if (adjuntos && adjuntos.length > 0) {
        const filePaths = adjuntos.map((a) => `${id}/${a.nombre_archivo}`)
        await supabase.storage
          .from('correspondencia-adjuntos')
          .remove(filePaths)
      }

      // Eliminar registro (adjuntos en cascada por FK)
      const { error: deleteError } = await supabase
        .from('correspondencia')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      const message = err?.message || 'Error al eliminar la correspondencia'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Verificar si un número correlativo ya existe
   * @returns {boolean} true si ya existe
   */
  const checkCorrelativo = useCallback(async (numero, excludeId = null) => {
    try {
      let query = supabase
        .from('correspondencia')
        .select('id', { count: 'exact', head: true })
        .eq('numero_correlativo', numero)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { count, error: checkError } = await query

      if (checkError) throw checkError
      return count > 0
    } catch {
      return false
    }
  }, [])

  return {
    loading,
    error,
    fetchCorrespondencia,
    fetchById,
    createCorrespondencia,
    updateCorrespondencia,
    deleteCorrespondencia,
    checkCorrelativo,
  }
}
