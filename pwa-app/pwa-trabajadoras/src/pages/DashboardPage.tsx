import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User, Calendar, FileText, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DashboardPageProps {
  onNavigate: (page: 'dashboard' | 'horarios' | 'reportes') => void
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { worker, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {worker?.name || 'Trabajadora'}
                </h1>
                <p className="text-sm text-gray-600">
                  {worker?.email}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mi Perfil
              </CardTitle>
              <CardDescription>
                Información personal y especialidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Teléfono</p>
                  <p className="text-sm text-gray-600">
                    {worker?.phone || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Tarifa por hora</p>
                  <p className="text-sm text-gray-600">
                    €{worker?.hourly_rate || 0}/hora
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-1">
                    {worker?.specializations?.map((spec: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">Sin especialidades</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horarios de Hoy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Horarios de Hoy
              </CardTitle>
              <CardDescription>
                Tus asignaciones para hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No hay horarios programados para hoy
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => onNavigate('horarios')}>
                  Ver todos los horarios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reportes Mensuales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mi Reporte Mensual
              </CardTitle>
              <CardDescription>
                Resumen de horas trabajadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-xs text-gray-600">Horas este mes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">€0</p>
                    <p className="text-xs text-gray-600">Ingresos estimados</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => onNavigate('reportes')}>
                  Ver reporte detallado
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}