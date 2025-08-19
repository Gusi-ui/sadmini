import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import HorariosPage from './pages/HorariosPage'
import ReportesPage from './pages/ReportesPage'
import { Toaster } from '@/components/ui/sonner'

type Page = 'dashboard' | 'horarios' | 'reportes'

function App() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    )
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'horarios':
        return <HorariosPage onNavigate={setCurrentPage} />
      case 'reportes':
        return <ReportesPage onNavigate={setCurrentPage} />
      default:
        return <DashboardPage onNavigate={setCurrentPage} />
    }
  }

  return (
    <>
      {renderCurrentPage()}
      <Toaster />
    </>
  )
}

export default App