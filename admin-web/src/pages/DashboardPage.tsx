import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Activity,
  Bell
} from 'lucide-react'
import { useWorkers, useWorkerStats } from '@/hooks/useWorkers'
import { useUsers, useUserStats } from '@/hooks/useUsers'
import { useAssignments, useAssignmentStats } from '@/hooks/useAssignments'
import { useAlerts, useAlertCounts } from '@/hooks/useAlerts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const { data: workers, isLoading: workersLoading } = useWorkers()
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: assignments, isLoading: assignmentsLoading } = useAssignments()
  const { data: workerStats } = useWorkerStats()
  const { data: userStats } = useUserStats()
  const { data: assignmentStats } = useAssignmentStats()
  const { data: alerts, isLoading: alertsLoading } = useAlerts()
  const alertCounts = useAlertCounts()

  const isLoading = workersLoading || usersLoading || assignmentsLoading

  // Obtener asignaciones del dia de hoy
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAssignments = assignments?.filter(assignment => {
    const startDate = new Date(assignment.start_date)
    const endDate = assignment.end_date ? new Date(assignment.end_date) : null
    const todayDate = new Date(today)
    return startDate <= todayDate && (!endDate || endDate >= todayDate)
  }) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Resumen general del sistema de gestion de ayuda domiciliaria
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trabajadoras Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workerStats?.active || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats?.active || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Asignaciones del Dia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayAssignments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alertCounts?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Sistema de Alertas
              </div>
              {alertCounts && alertCounts.total > 0 && (
                <Badge variant="destructive">
                  {alertCounts.total} alerta{alertCounts.total !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.slice(0, 5).map((alert) => (
                  <Alert 
                    key={alert.id} 
                    variant={alert.type === 'critical' ? 'destructive' : 'default'}
                    className={`
                      ${alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
                      ${alert.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
                    `}
                  >
                    {alert.type === 'critical' && <AlertTriangle className="h-4 w-4" />}
                    {alert.type === 'warning' && <Clock className="h-4 w-4 text-yellow-600" />}
                    {alert.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-gray-600">{alert.description}</div>
                        {alert.suggestion && (
                          <div className="text-xs text-gray-500 italic">
                            Sugerencia: {alert.suggestion}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                {alerts.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      Ver todas las alertas ({alerts.length - 5} mas)
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Todo en orden
                </h3>
                <p className="text-gray-600">
                  No hay alertas activas en el sistema.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadisticas Rapidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estadisticas Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trabajadoras */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Trabajadoras</span>
                <span className="text-sm text-gray-900">
                  {workerStats?.active || 0} activas / {workerStats?.total || 0} total
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ 
                    width: workerStats?.total ? `${(workerStats.active / workerStats.total) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>

            {/* Clientes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Clientes</span>
                <span className="text-sm text-gray-900">
                  {userStats?.active || 0} activos / {userStats?.total || 0} total
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: userStats?.total ? `${(userStats.active / userStats.total) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>

            {/* Asignaciones */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Asignaciones</span>
                <span className="text-sm text-gray-900">
                  {assignmentStats?.active || 0} activas / {assignmentStats?.total || 0} total
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ 
                    width: assignmentStats?.total ? `${(assignmentStats.active / assignmentStats.total) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>

            {/* Alertas por tipo */}
            {alertCounts && alertCounts.total > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-600">Distribucion de Alertas</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">{alertCounts.critical}</div>
                    <div className="text-xs text-red-600">Criticas</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-bold text-yellow-600">{alertCounts.warning}</div>
                    <div className="text-xs text-yellow-600">Advertencias</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{alertCounts.info}</div>
                    <div className="text-xs text-blue-600">Informativas</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Asignaciones del Dia de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAssignments.length > 0 ? (
            <div className="space-y-3">
              {todayAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {(assignment as any).worker?.full_name} → {(assignment as any).user?.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {(assignment as any).user?.address}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                      {assignment.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
              ))}
              {todayAssignments.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    Ver todas las asignaciones de hoy ({todayAssignments.length - 5} mas)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay asignaciones programadas</h3>
              <p>No hay servicios programados para el dia de hoy.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
