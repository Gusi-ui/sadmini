import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import { format, parseISO, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface Assignment {
  id: string
  title: string
  description: string
  user_id: string
  start_date: string
  end_date: string | null
  status: string
  users: {
    name: string
    address: string
  }
  assignments_time_slots: {
    day_of_week: number
    start_time: string
    end_time: string
  }[]
}

interface HorariosPageProps {
  onNavigate: (page: 'dashboard' | 'horarios' | 'reportes') => void
}

export default function HorariosPage({ onNavigate }: HorariosPageProps) {
  const { worker } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchAssignments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          users:user_id(
            name,
            address
          ),
          assignments_time_slots(
            day_of_week,
            start_time,
            end_time
          )
        `)
        .eq('worker_id', worker.id)
        .eq('status', 'active')

      if (error) throw error

      setAssignments(data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }, [worker])

  useEffect(() => {
    if (worker) {
      fetchAssignments()
    }
  }, [worker, fetchAssignments])

  const getTodaySchedule = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()

    const todayAssignments = assignments.filter(assignment => {
      const startDate = parseISO(assignment.start_date)
      const endDate = assignment.end_date ? parseISO(assignment.end_date) : null
      const isInRange = today >= startDate && (!endDate || today <= endDate)
      const hasTimeSlot = assignment.assignments_time_slots.some(
        slot => slot.day_of_week === dayOfWeek
      )
      return isInRange && hasTimeSlot
    })

    return todayAssignments.map(assignment => {
      const timeSlots = assignment.assignments_time_slots.filter(
        slot => slot.day_of_week === dayOfWeek
      )
      return { ...assignment, todayTimeSlots: timeSlots }
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const todaySchedule = getTodaySchedule()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" size="sm" className="mr-4" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Mis Horarios
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Horarios de hoy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios de Hoy
            </CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin horarios hoy
                </h3>
                <p className="text-gray-600">
                  No tienes asignaciones programadas para hoy.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySchedule.map((assignment) =>
                  assignment.todayTimeSlots.map((slot, index) => (
                    <div key={`${assignment.id}-${index}`} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <User className="h-4 w-4 mr-1" />
                            {assignment.users.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {assignment.users.address}
                          </p>
                        </div>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status === 'active' ? 'Activa' : assignment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </span>
                      </div>
                      {assignment.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {assignment.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Todas las asignaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Todas las Asignaciones Activas</CardTitle>
            <CardDescription>
              Tus asignaciones de trabajo actuales
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin asignaciones
                </h3>
                <p className="text-gray-600">
                  No tienes asignaciones activas en este momento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {assignment.title}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <User className="h-4 w-4 mr-1" />
                          {assignment.users.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {assignment.users.address}
                        </p>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status === 'active' ? 'Activa' : assignment.status}
                      </Badge>
                    </div>
                    
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {assignment.description}
                      </p>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Período:</strong>{' '}
                      {format(parseISO(assignment.start_date), 'dd/MM/yyyy')} -{' '}
                      {assignment.end_date
                        ? format(parseISO(assignment.end_date), 'dd/MM/yyyy')
                        : 'Indefinido'}
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-900">
                        Horarios semanales:
                      </h5>
                      {assignment.assignments_time_slots.map((slot, index) => {
                        const days = [
                          'Domingo', 'Lunes', 'Martes', 'Miércoles',
                          'Jueves', 'Viernes', 'Sábado'
                        ]
                        return (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <span className="w-20">{days[slot.day_of_week]}:</span>
                            <span>
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}