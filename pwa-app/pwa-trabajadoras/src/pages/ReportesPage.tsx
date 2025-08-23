import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, ArrowLeft, Calendar, TrendingUp, Euro, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, parseISO, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

interface Assignment {
  id: string
  title: string
  start_date: string
  end_date: string | null
  status: string
  users: {
    name: string
  }
  assignments_time_slots: {
    day_of_week: number
    start_time: string
    end_time: string
  }[]
}

interface MonthlyReport {
  month: string
  totalHours: number
  totalEarnings: number
  activeAssignments: number
  averageHoursPerWeek: number
  assignmentDetails: {
    title: string
    userName: string
    weeklyHours: number
    monthlyHours: number
    monthlyEarnings: number
  }[]
}

interface ReportesPageProps {
  onNavigate: (page: 'dashboard' | 'horarios' | 'reportes') => void
}

export default function ReportesPage({ onNavigate }: ReportesPageProps) {
  const { worker } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null)

  const fetchAssignments = useCallback(async () => {
    try {
      const monthStart = startOfMonth(selectedMonth)
      const monthEnd = endOfMonth(selectedMonth)

      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          users:user_id(
            name
          ),
          assignments_time_slots(
            day_of_week,
            start_time,
            end_time
          )
        `)
        .eq('worker_id', worker.id)
        .lte('start_date', monthEnd.toISOString())
        .or(`end_date.is.null,end_date.gte.${monthStart.toISOString()}`)

      if (error) throw error

      setAssignments(data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }, [worker, selectedMonth])

  const generateMonthlyReport = useCallback(() => {
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)
    const daysInMonth = monthEnd.getDate()

    let totalMonthlyHours = 0
    const assignmentDetails: MonthlyReport['assignmentDetails'] = []

    assignments.forEach(assignment => {
      const assignmentStart = parseISO(assignment.start_date)
      const assignmentEnd = assignment.end_date ? parseISO(assignment.end_date) : new Date()
      
      // Calcular horas semanales para esta asignación
      let weeklyHours = 0
      assignment.assignments_time_slots.forEach(slot => {
        const minutes = differenceInMinutes(
          new Date(`2000-01-01T${slot.end_time}`),
          new Date(`2000-01-01T${slot.start_time}`)
        )
        weeklyHours += minutes / 60
      })

      // Determinar cuántas semanas de este mes cubre la asignación
      const effectiveStart = assignmentStart > monthStart ? assignmentStart : monthStart
      const effectiveEnd = assignmentEnd < monthEnd ? assignmentEnd : monthEnd
      
      if (effectiveStart <= effectiveEnd) {
        // Aproximación: asumir 4.33 semanas por mes
        const weeksInMonth = 4.33
        const monthlyHours = weeklyHours * weeksInMonth
        const monthlyEarnings = monthlyHours * (worker?.hourly_rate || 0)

        totalMonthlyHours += monthlyHours
        
        assignmentDetails.push({
          title: assignment.title,
          userName: assignment.users.name,
          weeklyHours,
          monthlyHours,
          monthlyEarnings
        })
      }
    })

    const totalEarnings = totalMonthlyHours * (worker?.hourly_rate || 0)
    const averageHoursPerWeek = totalMonthlyHours / 4.33

    setMonthlyReport({
      month: format(selectedMonth, 'MMMM yyyy', { locale: es }),
      totalHours: Math.round(totalMonthlyHours * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      activeAssignments: assignments.filter(a => a.status === 'active').length,
      averageHoursPerWeek: Math.round(averageHoursPerWeek * 100) / 100,
      assignmentDetails
    })
  }, [selectedMonth, assignments, worker])

  useEffect(() => {
    if (worker) {
      fetchAssignments()
    }
  }, [worker, fetchAssignments])

  useEffect(() => {
    if (assignments.length > 0) {
      generateMonthlyReport()
    }
  }, [assignments, generateMonthlyReport])

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setSelectedMonth(newMonth)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Mis Reportes
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selector de mes */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => changeMonth('prev')}
            size="sm"
          >
            ← Mes anterior
          </Button>
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {monthlyReport?.month}
          </h2>
          <Button 
            variant="outline" 
            onClick={() => changeMonth('next')}
            size="sm"
            disabled={selectedMonth >= new Date()}
          >
            Mes siguiente →
          </Button>
        </div>

        {monthlyReport && (
          <>
            {/* Resumen mensual */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Horas Totales
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyReport.totalHours}h
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {monthlyReport.averageHoursPerWeek}h promedio/semana
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingresos Totales
                  </CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    €{monthlyReport.totalEarnings}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    €{worker?.hourly_rate || 0}/hora
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Asignaciones Activas
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyReport.activeAssignments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trabajos activos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Eficiencia
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((monthlyReport.totalHours / (monthlyReport.activeAssignments * 40)) * 100) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utilización estimada
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detalle por asignación */}
            <Card>
              <CardHeader>
                <CardTitle>Detalle por Asignación</CardTitle>
                <CardDescription>
                  Desglose de horas e ingresos por cada trabajo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyReport.assignmentDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sin datos para este mes
                    </h3>
                    <p className="text-gray-600">
                      No hay asignaciones registradas para el mes seleccionado.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {monthlyReport.assignmentDetails.map((assignment, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {assignment.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Cliente: {assignment.userName}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            €{assignment.monthlyEarnings.toFixed(2)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Horas semanales:</span>
                            <span className="ml-2 font-medium">{assignment.weeklyHours}h</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Horas mensuales:</span>
                            <span className="ml-2 font-medium">{assignment.monthlyHours.toFixed(1)}h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}