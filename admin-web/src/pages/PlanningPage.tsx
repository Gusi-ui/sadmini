import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Calendar,
  CalendarDays,
  Clock,
  Users,
  CheckCircle
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAssignments } from '@/hooks/useAssignments'
import { useWorkers } from '@/hooks/useWorkers'
import { useUsers } from '@/hooks/useUsers'
import { useHolidays } from '@/hooks/useHolidays'

export default function PlanningPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar')

  const { data: assignments, isLoading: assignmentsLoading } = useAssignments()
  const { data: workers, isLoading: workersLoading } = useWorkers()
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: holidays } = useHolidays()

  const isLoading = assignmentsLoading || workersLoading || usersLoading

  // Generar días del mes seleccionado
  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Función para obtener el tipo de día
  const getDayType = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isHoliday = holidays?.some(h => h.date === dateStr && h.is_active)
    
    if (isHoliday) return 'festivo'
    if (isWeekend(date)) return 'fin_semana'
    return 'laborable'
  }

  // Filtrar asignaciones por trabajadora seleccionada
  const filteredAssignments = selectedWorker
    ? assignments?.filter(a => a.worker_id === selectedWorker)
    : assignments

  // Calcular estadísticas del mes
  const monthStats = {
    totalAssignments: filteredAssignments?.length || 0,
    activeWorkers: workers?.filter(w => w.is_active).length || 0,
    workingDays: daysInMonth.filter(day => getDayType(day) === 'laborable').length,
    holidays: daysInMonth.filter(day => getDayType(day) === 'festivo').length,
    weekends: daysInMonth.filter(day => getDayType(day) === 'fin_semana').length
  }

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
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planificación</h1>
          <p className="text-gray-600">
            Vista general de la planificación mensual
          </p>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Mes y Año
            </label>
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Trabajadora
            </label>
            <Select value={selectedWorker || 'all'} onValueChange={(value) => setSelectedWorker(value === 'all' ? null : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las trabajadoras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las trabajadoras</SelectItem>
                {workers?.filter(w => w.is_active).map(worker => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button
            variant={viewType === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('list')}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {/* Estadísticas del mes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Asignaciones</p>
                <p className="text-2xl font-bold text-gray-900">{monthStats.totalAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trabajadoras</p>
                <p className="text-2xl font-bold text-gray-900">{monthStats.activeWorkers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Días Laborables</p>
                <p className="text-2xl font-bold text-gray-900">{monthStats.workingDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Festivos</p>
                <p className="text-2xl font-bold text-gray-900">{monthStats.holidays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CalendarDays className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fines de Semana</p>
                <p className="text-2xl font-bold text-gray-900">{monthStats.weekends}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planificación de {format(selectedMonth, 'MMMM yyyy', { locale: es })}
            {selectedWorker && (
              <Badge variant="outline">
                {workers?.find(w => w.id === selectedWorker)?.full_name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewType === 'calendar' ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Vista de Calendario</h3>
              <p>La implementación completa del calendario estará disponible en la próxima actualización.</p>
              <p className="text-sm mt-2">Por ahora, utiliza la vista de lista para ver las asignaciones.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments && filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => {
                  const worker = workers?.find(w => w.id === assignment.worker_id)
                  const user = users?.find(u => u.id === assignment.user_id)
                  return (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {worker?.full_name}
                        </h3>
                        <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                          {assignment.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Cliente:</strong> {user?.full_name}</p>
                        <p><strong>Dirección:</strong> {user?.address}</p>
                        <p><strong>Período:</strong> {format(new Date(assignment.start_date), 'dd/MM/yyyy')} - {assignment.end_date ? format(new Date(assignment.end_date), 'dd/MM/yyyy') : 'Indefinido'}</p>
                        {assignment.notes && (
                          <p><strong>Notas:</strong> {assignment.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay asignaciones</h3>
                  <p>No se encontraron asignaciones para el período seleccionado.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
