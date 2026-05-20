import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import PinLogin from './features/auth/PinLogin'
import ProtectedRoute from './features/auth/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './features/dashboard/Dashboard'
import CorrespondenciaList from './features/correspondencia/CorrespondenciaList'
import CorrespondenciaForm from './features/correspondencia/CorrespondenciaForm'
import CorrespondenciaDetail from './features/correspondencia/CorrespondenciaDetail'
import Reportes from './features/reportes/Reportes'
import Configuracion from './features/configuracion/Configuracion'
import ManualUsuario from './features/manual/ManualUsuario'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública: Login */}
          <Route path="/login" element={<PinLogin />} />

          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="correspondencia" element={<CorrespondenciaList />} />
            <Route path="correspondencia/nueva/:tipo" element={<CorrespondenciaForm />} />
            <Route path="correspondencia/editar/:id" element={<CorrespondenciaForm />} />
            <Route path="correspondencia/:id" element={<CorrespondenciaDetail />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="manual" element={<ManualUsuario />} />
          </Route>

          {/* Redirigir rutas desconocidas */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
