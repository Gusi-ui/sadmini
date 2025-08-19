import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import LoginPage from '@/pages/LoginPage'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import DashboardPage from '@/pages/DashboardPage'
import WorkersPage from '@/pages/WorkersPage'
import UsersPage from '@/pages/UsersPage'
import AssignmentsPage from '@/pages/AssignmentsPage'
import PlanningPage from '@/pages/PlanningPage'
import HolidaysPage from '@/pages/HolidaysPage'
import ReportsPage from '@/pages/ReportsPage'

function App() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, mostrar login
  if (!user || !profile) {
    return <LoginPage />
  }

  // Solo administradores pueden acceder a la aplicación admin
  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Acceso Denegado</strong>
            <span className="block sm:inline"> No tienes permisos para acceder a esta aplicación.</span>
          </div>
          <p className="text-gray-600 mb-4">
            Esta aplicación está reservada para administradores del sistema.
          </p>
          <button
            onClick={() => window.location.href = import.meta.env.VITE_PWA_URL || '/'}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Ir a la Aplicación de Trabajadoras
          </button>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="trabajadoras" element={<WorkersPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="asignaciones" element={<AssignmentsPage />} />
        <Route path="planificacion" element={<PlanningPage />} />
        <Route path="festivos" element={<HolidaysPage />} />
        <Route path="reportes" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
