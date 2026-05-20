import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  FileText,
  LayoutDashboard,
  Mail,
  ArrowDownLeft,
  ArrowUpRight,
  FileBarChart,
  Settings,
  BookOpen,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'

const navItems = [
  {
    section: 'principal',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/correspondencia', label: 'Correspondencia', icon: Mail }
    ]
  },
  {
    section: 'nueva',
    items: [
      { to: '/correspondencia/nueva/entrante', label: 'Nueva Entrante', icon: ArrowDownLeft },
      { to: '/correspondencia/nueva/saliente', label: 'Nueva Saliente', icon: ArrowUpRight }
    ]
  },
  {
    section: 'herramientas',
    items: [
      { to: '/reportes', label: 'Reportes', icon: FileBarChart },
      { to: '/configuracion', label: 'Configuración', icon: Settings },
      { to: '/manual', label: 'Manual de Usuario', icon: BookOpen }
    ]
  }
]

function formatDateTime(date) {
  return date.toLocaleDateString('es-VE', {
    timeZone: 'America/Caracas',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' — ' + date.toLocaleTimeString('es-VE', {
    timeZone: 'America/Caracas',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

export default function Sidebar() {
  const { logout } = useAuth()
  const [dateTime, setDateTime] = useState(formatDateTime(new Date()))

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(formatDateTime(new Date()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-40">
      {/* Header / Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-50 leading-tight truncate">
              Control de
            </h1>
            <h1 className="text-sm font-bold text-gradient leading-tight truncate">
              Correspondencia
            </h1>
          </div>
        </div>
      </div>

      <hr className="border-white/5 mx-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((section, sectionIndex) => (
          <div key={section.section}>
            {sectionIndex > 0 && <hr className="border-white/5 my-3 mx-1" />}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/correspondencia'}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <hr className="border-white/5 mx-4" />

        {/* Date & Time */}
        <div className="px-5 py-3">
          <p className="text-[11px] text-slate-500 font-mono text-center tracking-wide">
            {dateTime}
          </p>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={logout}
            className="sidebar-item w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
