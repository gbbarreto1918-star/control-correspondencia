import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Calendar
} from 'lucide-react'
import { useDashboardData } from './useDashboardData'
import Header from '../../components/layout/Header'
import { diasHastaVencimiento, formatDate } from '../../lib/utils'
import { Link } from 'react-router-dom'

// Registrar módulos de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Dashboard() {
  const { data, loading, error } = useDashboardData()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Cargando métricas ejecutivas...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-200">Error al cargar dashboard</h3>
        <p className="text-slate-400 text-sm">{error || 'No se pudieron recuperar las métricas'}</p>
      </div>
    )
  }

  // --- CONFIGURACIÓN DE GRÁFICOS ---
  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          stepSize: 1
        }
      }
    }
  }

  // Line Chart 1: Recibidas
  const dataRecibidasLine = {
    labels: data.recibidaPorFecha.map(item => item.fecha),
    datasets: [
      {
        fill: true,
        label: 'Recibidas',
        data: data.recibidaPorFecha.map(item => item.count),
        borderColor: '#3b82f6',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 220)
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)')
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
          return gradient
        },
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  }

  // Line Chart 2: Enviadas
  const dataEnviadasLine = {
    labels: data.enviadaPorFecha.map(item => item.fecha),
    datasets: [
      {
        fill: true,
        label: 'Enviadas',
        data: data.enviadaPorFecha.map(item => item.count),
        borderColor: '#a855f7',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 220)
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.25)')
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0)')
          return gradient
        },
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  }

  // Bar Chart: Correspondencia por responsable
  const dataResponsablesBar = {
    labels: data.porResponsable.map(item => item.nombre),
    datasets: [
      {
        label: 'Asignados',
        data: data.porResponsable.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.65)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  const optionsResponsablesBar = {
    ...chartOptionsBase,
    indexAxis: 'y',
    plugins: {
      ...chartOptionsBase.plugins,
      legend: { display: false }
    }
  }

  // Bar Chart: Top 5 Responsables (vertical)
  const dataTop5Bar = {
    labels: data.top5Responsables.map(item => item.nombre),
    datasets: [
      {
        label: 'Correspondencias',
        data: data.top5Responsables.map(item => item.count),
        backgroundColor: 'rgba(168, 85, 247, 0.65)',
        borderColor: '#a855f7',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  // Doughnut: Enviadas no respondidas / cerradas
  const dataEnviadasDoughnut = {
    labels: ['Cerrado', 'Pendiente/Vencido'],
    datasets: [
      {
        data: [data.totalEnviada - data.noRespondidaEnviada, data.noRespondidaEnviada],
        backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'],
        borderColor: ['#22c55e', '#ef4444'],
        borderWidth: 1
      }
    ]
  }

  // Doughnut: Recibidas no respondidas / cerradas
  const dataRecibidasDoughnut = {
    labels: ['Cerrado', 'Pendiente/Vencido'],
    datasets: [
      {
        data: [data.totalRecibida - data.noRespondidaRecibida, data.noRespondidaRecibida],
        backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(245, 158, 11, 0.6)'],
        borderColor: ['#22c55e', '#f59e0b'],
        borderWidth: 1
      }
    ]
  }

  const optionsDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 10 },
          boxWidth: 12
        }
      }
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Dashboard Ejecutivo"
        subtitle="Monitoreo de correspondencia, trazabilidad y control de vencimientos"
      />

      <div className="px-8 space-y-6">
        {/* Grilla de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card: Total Recibida */}
          <div className="stat-card" style={{ '--stat-color': 'rgba(59, 130, 246, 0.15)' }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-bold text-slate-100">{data.totalRecibida}</span>
                <p className="text-sm font-medium text-slate-400 mt-1">Total Recibidas</p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Mail className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card: Total Enviada */}
          <div className="stat-card" style={{ '--stat-color': 'rgba(168, 85, 247, 0.15)' }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-bold text-slate-100">{data.totalEnviada}</span>
                <p className="text-sm font-medium text-slate-400 mt-1">Total Enviadas</p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                <Send className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card: Pendientes */}
          <div className="stat-card" style={{ '--stat-color': 'rgba(245, 158, 11, 0.15)' }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-bold text-slate-100">{data.totalPendientes}</span>
                <p className="text-sm font-medium text-slate-400 mt-1">Pendientes de Respuesta</p>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card: Vencidas */}
          <div className="stat-card" style={{ '--stat-color': 'rgba(239, 68, 68, 0.15)' }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-bold text-slate-100">{data.totalVencidos}</span>
                <p className="text-sm font-medium text-slate-400 mt-1">Vencidas sin Responder</p>
              </div>
              <div className={`p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 ${data.totalVencidos > 0 ? 'animate-pulse' : ''}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card: Cerradas */}
          <div className="stat-card" style={{ '--stat-color': 'rgba(34, 197, 94, 0.15)' }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-bold text-slate-100">{data.totalCerrados}</span>
                <p className="text-sm font-medium text-slate-400 mt-1">Trámites Cerrados</p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card: Próximos a Vencer */}
          <div className="stat-card" style={{ '--stat-color': 'rgba(249, 115, 22, 0.15)' }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-bold text-slate-100">{data.proximosVencer.length}</span>
                <p className="text-sm font-medium text-slate-400 mt-1">Próximos a vencer</p>
                <span className="text-xs text-orange-400">(En los próximos 3 días)</span>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Gráficos: Fila 1 - Líneas Temporales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-static p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Correspondencia Recibida (Últimos 30 días)</h3>
            <div className="h-[250px] relative">
              <Line data={dataRecibidasLine} options={chartOptionsBase} />
            </div>
          </div>

          <div className="glass-card-static p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Correspondencia Enviada (Últimos 30 días)</h3>
            <div className="h-[250px] relative">
              <Line data={dataEnviadasLine} options={chartOptionsBase} />
            </div>
          </div>
        </div>

        {/* Sección de Gráficos: Fila 2 - Distribución y No Respondidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asignación por responsable */}
          <div className="glass-card-static p-6 space-y-4 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Distribución por Responsable</h3>
            <div className="h-[250px] relative">
              {data.porResponsable.length > 0 ? (
                <Bar data={dataResponsablesBar} options={optionsResponsablesBar} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">Sin datos de responsables</div>
              )}
            </div>
          </div>

          {/* Recibidas: Estado de respuesta */}
          <div className="glass-card-static p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Estatus Recibidas (Remitentes)</h3>
            <div className="h-[220px] relative">
              {data.totalRecibida > 0 ? (
                <Doughnut data={dataRecibidasDoughnut} options={optionsDoughnut} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">Sin correspondencia recibida</div>
              )}
            </div>
          </div>

          {/* Enviadas: Estado de respuesta */}
          <div className="glass-card-static p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Estatus Enviadas (Destinatarios)</h3>
            <div className="h-[220px] relative">
              {data.totalEnviada > 0 ? (
                <Doughnut data={dataEnviadasDoughnut} options={optionsDoughnut} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">Sin correspondencia enviada</div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Gráficos: Fila 3 - Top 5 Responsables */}
        <div className="grid grid-cols-1 gap-6">
          <div className="glass-card-static p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Top 5 Responsables con Mayor Asignación</h3>
            <div className="h-[250px] relative">
              {data.top5Responsables.length > 0 ? (
                <Bar data={dataTop5Bar} options={chartOptionsBase} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">Sin asignaciones de responsables</div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de Alertas de Vencimiento */}
        <div className="glass-card-static p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-slate-200">Alertas de Vencimiento Cercano</h3>
          </div>

          {data.proximosVencer.length > 0 ? (
            <div className="divide-y divide-white/5">
              {data.proximosVencer.map((item) => {
                const dias = diasHastaVencimiento(item.fecha_vencimiento)
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between flex-wrap gap-2 hover:bg-white/[0.01] px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                        #{item.numero_correlativo}
                      </span>
                      <div>
                        <Link to={`/correspondencia/${item.id}`} className="text-sm font-medium text-slate-200 hover:text-blue-400 transition-colors">
                          {item.asunto}
                        </Link>
                        <p className="text-xs text-slate-400">
                          Responsable: <span className="text-slate-300 font-semibold">{item.responsable_nombre}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">Vence: {formatDate(item.fecha_vencimiento)}</span>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${dias === 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {dias === 0 ? '¡VENCE HOY!' : `Quedan ${dias} día(s)`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-green-400">
              <CheckCircle2 className="w-8 h-8" />
              <p className="text-sm font-semibold text-slate-300">Sin alertas de vencimiento pendientes</p>
              <p className="text-xs text-slate-500">Todas las correspondencias se encuentran al día.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
