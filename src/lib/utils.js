/**
 * Utilidades generales del sistema
 * Zona horaria: America/Caracas (UTC-4)
 * Formato fecha: DD/MM/YYYY
 * Formato hora: HH:MM:ss
 */

// Obtener la fecha actual en zona horaria de Venezuela
export function getVenezuelaDate() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Caracas' }))
}

// Formatear fecha a DD/MM/YYYY
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T12:00:00')
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Formatear hora a HH:MM:ss
export function formatTime(date) {
  if (!date) date = getVenezuelaDate()
  if (typeof date === 'string') date = new Date(date)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// Formatear fecha y hora completa
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return `${formatDate(dateStr.split('T')[0])} ${formatTime(date)}`
}

// Obtener fecha de hoy en formato ISO (YYYY-MM-DD) para Supabase
export function getTodayISO() {
  const now = getVenezuelaDate()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Calcular el estado basado en fecha de vencimiento
export function calcularEstado(fechaVencimiento, estadoActual) {
  if (estadoActual === 'Cerrado') return 'Cerrado'
  const hoy = new Date(getTodayISO())
  const vencimiento = new Date(fechaVencimiento)
  if (vencimiento < hoy) return 'Vencido'
  return 'Pendiente'
}

// Obtener clase CSS del badge según estado
export function getEstadoBadgeClass(estado) {
  switch (estado) {
    case 'Pendiente': return 'badge-pendiente'
    case 'Vencido': return 'badge-vencido'
    case 'Cerrado': return 'badge-cerrado'
    default: return 'badge-pendiente'
  }
}

// Obtener clase CSS del badge según tipo
export function getTipoBadgeClass(tipo) {
  return tipo === 'entrante' ? 'badge-entrante' : 'badge-saliente'
}

// Calcular días hasta vencimiento
export function diasHastaVencimiento(fechaVencimiento) {
  const hoy = new Date(getTodayISO())
  const vencimiento = new Date(fechaVencimiento)
  const diffTime = vencimiento - hoy
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Truncar texto
export function truncate(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Generar iniciales de un nombre
export function getInitials(name) {
  if (!name) return '??'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Formatear tamaño de archivo
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Debounce utility
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Clase para mensajes de error
export function getErrorMessage(error) {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  return 'Ha ocurrido un error inesperado'
}
