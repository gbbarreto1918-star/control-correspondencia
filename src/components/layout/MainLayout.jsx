import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
