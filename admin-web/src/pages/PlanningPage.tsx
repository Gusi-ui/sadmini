import React, { useState, useMemo, useCallback } from 'react'
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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isWeekend, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns'
import { es } from 'date-fns/locale'
import { useAssignments } from '@/hooks/useAssignments'
import { useWorkers } from '@/hooks/useWorkers'
import { useUsers } from '@/hooks/useUsers'
import { useHolidays } from '@/hooks/useHolidays'

export default function PlanningPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedWorker, setSelectedWorker] = useState<string>('all')
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
  
  // Generar calendario completo (incluyendo días de meses anteriores/siguientes)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Lunes como primer día
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Función para obtener el tipo de día
  const getDayType = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isHoliday = holidays?.some(h => h.date === dateStr && h.is_active)
    
    if (isHoliday) return 'festivo'
    if (isWeekend(date)) return 'fin_semana'
    return 'laborable'
  }
  
  // Función para obtener asignaciones de un día específico
  const getAssignmentsForDay = (date: Date) => {
    return filteredAssignments?.filter(assignment => {
      const startDate = new Date(assignment.start_date)
      const endDate = assignment.end_date ? new Date(assignment.end_date) : null
      
      return startDate <= date && (!endDate || endDate >= date) && assignment.is_active
    }) || []
  }
  
  // Función para obtener el festivo de un día específico
  const getHolidayForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return holidays?.find(h => h.date === dateStr && h.is_active)
  }

  // Filtrar asignaciones por trabajador seleccionado
  const filteredAssignments = useMemo(() => {
    if (!assignments) return []
    
    return assignments.filter(assignment => {
      const assignmentDate = new Date(assignment.start_date)
      const isInMonth = assignmentDate.getMonth() === selectedMonth.getMonth() && 
                       assignmentDate.getFullYear() === selectedMonth.getFullYear()
      
      if (!isInMonth) return false
      
      if (selectedWorker === 'all') return true
      return assignment.worker_id === selectedWorker
    })
  }, [assignments, selectedMonth, selectedWorker])

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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[200px] text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {format(selectedMonth, 'MMMM yyyy', { locale: es })}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Trabajadora
            </label>
            <Select value={selectedWorker || 'all'} onValueChange={(value) => setSelectedWorker(value === 'all' ? 'all' : value)}>
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
            <div className="space-y-4">
              {/* Encabezados de días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Días del calendario */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dayAssignments = getAssignmentsForDay(day)
                  const holiday = getHolidayForDay(day)
                  const dayType = getDayType(day)
                  const isCurrentMonth = isSameMonth(day, selectedMonth)
                  const isToday = isSameDay(day, new Date())
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        min-h-[120px] p-2 border rounded-lg transition-colors
                        ${
                          isCurrentMonth
                            ? 'bg-white border-gray-200'
                            : 'bg-gray-50 border-gray-100 text-gray-400'
                        }
                        ${
                          isToday
                            ? 'ring-2 ring-blue-500 bg-blue-50'
                            : ''
                        }
                        ${
                          dayType === 'festivo'
                            ? 'bg-red-50 border-red-200'
                            : dayType === 'fin_semana'
                            ? 'bg-gray-100 border-gray-200'
                            : ''
                        }
                      `}
                    >
                      {/* Número del día */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`
                          text-sm font-medium
                          ${
                            isToday
                              ? 'text-blue-600'
                              : isCurrentMonth
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }
                        `}>
                          {format(day, 'd')}
                        </span>
                        
                        {/* Indicadores de tipo de día */}
                        <div className="flex space-x-1">
                          {dayType === 'festivo' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" title="Festivo" />
                          )}
                          {dayType === 'fin_semana' && (
                            <div className="w-2 h-2 bg-gray-500 rounded-full" title="Fin de semana" />
                          )}
                        </div>
                      </div>
                      
                      {/* Festivo */}
                      {holiday && isCurrentMonth && (
                        <div className="mb-1">
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            {holiday.name.length > 15 ? holiday.name.substring(0, 15) + '...' : holiday.name}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Asignaciones */}
                      {isCurrentMonth && dayAssignments.length > 0 && (
                        <div className="space-y-1">
                          {dayAssignments.slice(0, 2).map((assignment) => {
                            const worker = workers?.find(w => w.id === assignment.worker_id)
                            const user = users?.find(u => u.id === assignment.user_id)
                            
                            return (
                              <div
                                key={assignment.id}
                                className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                                title={`${worker?.full_name} → ${user?.full_name}`}
                              >
                                {worker?.full_name?.split(' ')[0]} → {user?.full_name?.split(' ')[0]}
                              </div>
                            )
                          })}
                          
                          {dayAssignments.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayAssignments.length - 2} más
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Leyenda */}
              <div className="flex items-center justify-center space-x-6 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Festivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Fin de semana</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Asignación</span>
                </div>
              </div>
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
                        <p><strong>Usuario:</strong> {user?.full_name}</p>
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
