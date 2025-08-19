import { useQuery } from '@tanstack/react-query'
import { supabase, type Database } from '@/lib/supabase'
import { format, isToday, isTomorrow, addDays, differenceInHours } from 'date-fns'
import { es } from 'date-fns/locale'

type Assignment = Database['public']['Tables']['assignments']['Row']
type Worker = Database['public']['Tables']['workers']['Row']
type User = Database['public']['Tables']['users']['Row']
type TimeSlot = Database['public']['Tables']['assignment_time_slots']['Row']
type Holiday = Database['public']['Tables']['holidays']['Row']

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  category: 'conflict' | 'missing' | 'reminder' | 'system'
  title: string
  description: string
  suggestion?: string
  data?: any
  created_at: string
}

interface AssignmentWithDetails extends Assignment {
  worker: Worker
  user: User
  time_slots: TimeSlot[]
}

// Hook para obtener todas las alertas
export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const alerts: Alert[] = []
      
      // Obtener datos necesarios
      const [assignmentsResult, workersResult, usersResult, holidaysResult] = await Promise.all([
        supabase
          .from('assignments')
          .select(`
            *,
            worker:workers(*),
            user:users(*),
            time_slots:assignment_time_slots(*)
          `)
          .eq('is_active', true),
        supabase.from('workers').select('*'),
        supabase.from('users').select('*'),
        supabase.from('holidays').select('*').eq('is_active', true)
      ])
      
      if (assignmentsResult.error) throw assignmentsResult.error
      if (workersResult.error) throw workersResult.error
      if (usersResult.error) throw usersResult.error
      if (holidaysResult.error) throw holidaysResult.error
      
      const assignments = assignmentsResult.data as AssignmentWithDetails[]
      const workers = workersResult.data
      const users = usersResult.data
      const holidays = holidaysResult.data
      
      // 1. Detectar conflictos de horarios
      const scheduleConflicts = detectScheduleConflicts(assignments)
      alerts.push(...scheduleConflicts)
      
      // 2. Detectar trabajadoras sin asignaciones
      const workersWithoutAssignments = detectWorkersWithoutAssignments(workers, assignments)
      alerts.push(...workersWithoutAssignments)
      
      // 3. Detectar clientes sin trabajadora asignada
      const usersWithoutWorkers = detectUsersWithoutWorkers(users, assignments)
      alerts.push(...usersWithoutWorkers)
      
      // 4. Recordatorios de festivos
      const holidayReminders = detectHolidayReminders(holidays)
      alerts.push(...holidayReminders)
      
      // 5. Alertas de sobrecarga de trabajo
      const workloadAlerts = detectWorkloadAlerts(assignments)
      alerts.push(...workloadAlerts)
      
      // 6. Asignaciones que terminan pronto
      const endingAssignments = detectEndingAssignments(assignments)
      alerts.push(...endingAssignments)
      
      // Ordenar por prioridad
      return alerts.sort((a, b) => {
        const priorityOrder = { critical: 3, warning: 2, info: 1 }
        if (priorityOrder[a.type] !== priorityOrder[b.type]) {
          return priorityOrder[b.type] - priorityOrder[a.type]
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    },
    refetchInterval: 5 * 60 * 1000 // Actualizar cada 5 minutos
  })
}

// Hook para obtener contadores de alertas
export function useAlertCounts() {
  const { data: alerts } = useAlerts()
  
  if (!alerts) return null
  
  const critical = alerts.filter(a => a.type === 'critical').length
  const warning = alerts.filter(a => a.type === 'warning').length
  const info = alerts.filter(a => a.type === 'info').length
  const total = alerts.length
  
  return { critical, warning, info, total }
}

// Funciones de deteccion de alertas
function detectScheduleConflicts(assignments: AssignmentWithDetails[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()
  
  // Agrupar por trabajadora
  const workerAssignments = new Map<string, AssignmentWithDetails[]>()
  
  assignments.forEach(assignment => {
    const workerId = assignment.worker_id
    if (!workerAssignments.has(workerId)) {
      workerAssignments.set(workerId, [])
    }
    workerAssignments.get(workerId)!.push(assignment)
  })
  
  // Verificar conflictos para cada trabajadora
  workerAssignments.forEach((workerAssignments, workerId) => {
    for (let i = 0; i < workerAssignments.length; i++) {
      for (let j = i + 1; j < workerAssignments.length; j++) {
        const assignment1 = workerAssignments[i]
        const assignment2 = workerAssignments[j]
        
        // Verificar si las fechas se solapan
        const start1 = new Date(assignment1.start_date)
        const end1 = assignment1.end_date ? new Date(assignment1.end_date) : null
        const start2 = new Date(assignment2.start_date)
        const end2 = assignment2.end_date ? new Date(assignment2.end_date) : null
        
        const datesOverlap = (
          (!end1 || start1 <= (end2 || new Date('2099-12-31'))) &&
          (!end2 || (end1 || new Date('2099-12-31')) >= start2)
        )
        
        if (datesOverlap) {
          // Verificar conflictos de horarios
          const timeConflicts = findTimeSlotConflicts(
            assignment1.time_slots || [], 
            assignment2.time_slots || []
          )
          
          if (timeConflicts.length > 0) {
            alerts.push({
              id: `conflict-${assignment1.id}-${assignment2.id}`,
              type: 'critical',
              category: 'conflict',
              title: `Conflicto de horarios - ${assignment1.worker.full_name}`,
              description: `Solapamiento entre ${assignment1.user.full_name} y ${assignment2.user.full_name}`,
              suggestion: 'Revisa y ajusta los horarios para evitar el conflicto.',
              data: {
                workerId: assignment1.worker_id,
                workerName: assignment1.worker.full_name,
                assignment1Id: assignment1.id,
                assignment2Id: assignment2.id,
                conflicts: timeConflicts
              },
              created_at: now.toISOString()
            })
          }
        }
      }
    }
  })
  
  return alerts
}

function findTimeSlotConflicts(slots1: TimeSlot[], slots2: TimeSlot[]): string[] {
  const conflicts: string[] = []
  const dayNames = ['', 'L', 'M', 'X', 'J', 'V', 'S', 'D']
  
  slots1.forEach(slot1 => {
    slots2.forEach(slot2 => {
      if (slot1.day_of_week === slot2.day_of_week && slot1.day_type === slot2.day_type) {
        const start1 = timeToMinutes(slot1.start_time)
        const end1 = timeToMinutes(slot1.end_time)
        const start2 = timeToMinutes(slot2.start_time)
        const end2 = timeToMinutes(slot2.end_time)
        
        if (start1 < end2 && end1 > start2) {
          conflicts.push(`${dayNames[slot1.day_of_week]} ${slot1.start_time}-${slot1.end_time}`)
        }
      }
    })
  })
  
  return conflicts
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function detectWorkersWithoutAssignments(workers: Worker[], assignments: AssignmentWithDetails[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()
  
  const activeWorkers = workers.filter(w => w.is_active)
  const assignedWorkerIds = new Set(assignments.map(a => a.worker_id))
  
  activeWorkers.forEach(worker => {
    if (!assignedWorkerIds.has(worker.id)) {
      alerts.push({
        id: `unassigned-worker-${worker.id}`,
        type: 'warning',
        category: 'missing',
        title: `Trabajadora sin asignaciones - ${worker.full_name}`,
        description: `${worker.full_name} no tiene asignaciones activas.`,
        suggestion: 'Considera asignar esta trabajadora a un cliente.',
        data: {
          workerId: worker.id,
          workerName: worker.full_name,
          employeeId: worker.employee_id
        },
        created_at: now.toISOString()
      })
    }
  })
  
  return alerts
}

function detectUsersWithoutWorkers(users: User[], assignments: AssignmentWithDetails[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()
  
  const activeUsers = users.filter(u => u.is_active)
  const assignedUserIds = new Set(assignments.map(a => a.user_id))
  
  activeUsers.forEach(user => {
    if (!assignedUserIds.has(user.id)) {
      alerts.push({
        id: `unassigned-user-${user.id}`,
        type: 'critical',
        category: 'missing',
        title: `Cliente sin trabajadora - ${user.full_name}`,
        description: `${user.full_name} no tiene una trabajadora asignada.`,
        suggestion: 'Asigna una trabajadora disponible a este cliente.',
        data: {
          userId: user.id,
          userName: user.full_name,
          address: user.address,
          monthlyHours: user.monthly_hours
        },
        created_at: now.toISOString()
      })
    }
  })
  
  return alerts
}

function detectHolidayReminders(holidays: Holiday[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const tomorrow = format(addDays(now, 1), 'yyyy-MM-dd')
  const nextWeek = format(addDays(now, 7), 'yyyy-MM-dd')
  
  holidays.forEach(holiday => {
    if (holiday.date === tomorrow) {
      alerts.push({
        id: `holiday-tomorrow-${holiday.id}`,
        type: 'info',
        category: 'reminder',
        title: `Festivo manana - ${holiday.name}`,
        description: `Manana es ${holiday.name}. Los horarios pueden verse afectados.`,
        suggestion: 'Verifica que las trabajadoras esten informadas.',
        data: {
          holidayId: holiday.id,
          holidayName: holiday.name,
          date: holiday.date,
          type: holiday.type
        },
        created_at: now.toISOString()
      })
    } else if (holiday.date <= nextWeek && holiday.date > today) {
      alerts.push({
        id: `holiday-upcoming-${holiday.id}`,
        type: 'info',
        category: 'reminder',
        title: `Festivo proximo - ${holiday.name}`,
        description: `${holiday.name} el ${format(new Date(holiday.date), 'dd MMM', { locale: es })}.`,
        suggestion: 'Planifica los horarios especiales para este dia festivo.',
        data: {
          holidayId: holiday.id,
          holidayName: holiday.name,
          date: holiday.date,
          type: holiday.type
        },
        created_at: now.toISOString()
      })
    }
  })
  
  return alerts
}

function detectWorkloadAlerts(assignments: AssignmentWithDetails[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()
  
  // Agrupar por trabajadora
  const workerWorkload = new Map<string, { worker: Worker, totalHours: number, assignments: number }>()
  
  assignments.forEach(assignment => {
    const workerId = assignment.worker_id
    if (!workerWorkload.has(workerId)) {
      workerWorkload.set(workerId, {
        worker: assignment.worker,
        totalHours: 0,
        assignments: 0
      })
    }
    
    const workload = workerWorkload.get(workerId)!
    workload.assignments++
    
    // Calcular horas semanales aproximadas
    const weeklyHours = (assignment.time_slots || []).reduce((total, slot) => {
      const duration = timeToMinutes(slot.end_time) - timeToMinutes(slot.start_time)
      return total + (duration / 60)
    }, 0)
    
    workload.totalHours += weeklyHours
  })
  
  // Verificar sobrecarga
  workerWorkload.forEach(({ worker, totalHours, assignments }) => {
    if (totalHours > 40) {
      alerts.push({
        id: `overload-${worker.id}`,
        type: 'warning',
        category: 'system',
        title: `Sobrecarga de trabajo - ${worker.full_name}`,
        description: `${worker.full_name} tiene ${Math.round(totalHours)}h semanales.`,
        suggestion: 'Considera redistribuir algunas asignaciones.',
        data: {
          workerId: worker.id,
          workerName: worker.full_name,
          totalHours: Math.round(totalHours),
          assignments: assignments
        },
        created_at: now.toISOString()
      })
    }
  })
  
  return alerts
}

function detectEndingAssignments(assignments: AssignmentWithDetails[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()
  const nextWeek = addDays(now, 7)
  const nextMonth = addDays(now, 30)
  
  assignments.forEach(assignment => {
    if (assignment.end_date) {
      const endDate = new Date(assignment.end_date)
      
      if (endDate <= nextWeek && endDate >= now) {
        alerts.push({
          id: `ending-soon-${assignment.id}`,
          type: 'warning',
          category: 'reminder',
          title: `Asignacion termina pronto - ${assignment.user.full_name}`,
          description: `La asignacion termina el ${format(endDate, 'dd/MM/yyyy')}.`,
          suggestion: 'Contacta con el cliente para confirmar renovacion.',
          data: {
            assignmentId: assignment.id,
            workerName: assignment.worker.full_name,
            userName: assignment.user.full_name,
            endDate: assignment.end_date
          },
          created_at: now.toISOString()
        })
      } else if (endDate <= nextMonth && endDate > nextWeek) {
        alerts.push({
          id: `ending-month-${assignment.id}`,
          type: 'info',
          category: 'reminder',
          title: `Asignacion termina proximamente - ${assignment.user.full_name}`,
          description: `La asignacion termina el ${format(endDate, 'dd/MM/yyyy')}.`,
          suggestion: 'Programa una reunion para revisar la renovacion.',
          data: {
            assignmentId: assignment.id,
            workerName: assignment.worker.full_name,
            userName: assignment.user.full_name,
            endDate: assignment.end_date
          },
          created_at: now.toISOString()
        })
      }
    }
  })
  
  return alerts
}
