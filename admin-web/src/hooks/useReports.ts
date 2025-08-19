import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, type Database } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isWeekend, 
  getDay,
  getDaysInMonth
} from 'date-fns'
import { es } from 'date-fns/locale'

type User = Database['public']['Tables']['users']['Row']
type Worker = Database['public']['Tables']['workers']['Row']
type Assignment = Database['public']['Tables']['assignments']['Row']
type TimeSlot = Database['public']['Tables']['assignment_time_slots']['Row']
type Holiday = Database['public']['Tables']['holidays']['Row']
type MonthlyReport = Database['public']['Tables']['monthly_reports']['Row']

interface AssignmentWithDetails extends Assignment {
  worker: Worker
  user: User
  time_slots: TimeSlot[]
}

export interface MonthlyReportData {
  id: string
  user_id: string
  worker_id: string
  year: number
  month: number
  assigned_hours: number
  calculated_hours: number
  excess_deficit_hours: number
  working_days: number
  holiday_days: number
  weekend_days: number
  report_data: {
    user: User
    worker: Worker
    assignment: Assignment
    daily_breakdown: DailyBreakdown[]
    summary: {
      total_days: number
      working_days: number
      weekend_days: number
      holiday_days: number
      hours_by_day_type: {
        laborable: number
        fin_semana: number
        festivo: number
      }
    }
  }
  generated_at: string
}

interface DailyBreakdown {
  date: string
  day_of_week: number
  day_type: 'laborable' | 'fin_semana' | 'festivo'
  is_holiday: boolean
  holiday_name?: string
  scheduled_hours: number
  time_slots_used: TimeSlot[]
}

interface ReportFilters {
  year: number
  month: number
  user_id?: string
  worker_id?: string
}

interface GenerateReportRequest {
  year: number
  month: number
  user_id?: string
  worker_id?: string
}

// Hook para obtener reportes existentes
export function useMonthlyReports(filters?: Partial<ReportFilters>) {
  return useQuery({
    queryKey: ['monthly-reports', filters],
    queryFn: async () => {
      let query = supabase.from('monthly_reports').select('*')
      
      if (filters?.year) query = query.eq('year', filters.year)
      if (filters?.month) query = query.eq('month', filters.month)
      if (filters?.user_id) query = query.eq('user_id', filters.user_id)
      if (filters?.worker_id) query = query.eq('worker_id', filters.worker_id)
      
      const { data, error } = await query.order('generated_at', { ascending: false })
      
      if (error) {
        throw new Error(`Error al obtener reportes: ${error.message}`)
      }
      
      return data as MonthlyReport[]
    }
  })
}

// Hook para generar un reporte mensual
export function useGenerateMonthlyReport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (request: GenerateReportRequest) => {
      const { year, month, user_id, worker_id } = request
      
      // Obtener datos necesarios
      const [assignmentsResult, holidaysResult] = await Promise.all([
        supabase
          .from('assignments')
          .select(`
            *,
            worker:workers(*),
            user:users(*),
            time_slots:assignment_time_slots(*)
          `)
          .eq('is_active', true),
        supabase
          .from('holidays')
          .select('*')
          .eq('is_active', true)
          .gte('date', `${year}-${month.toString().padStart(2, '0')}-01`)
          .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)
      ])
      
      if (assignmentsResult.error) throw assignmentsResult.error
      if (holidaysResult.error) throw holidaysResult.error
      
      const allAssignments = assignmentsResult.data as AssignmentWithDetails[]
      const holidays = holidaysResult.data as Holiday[]
      
      // Filtrar asignaciones por criterios
      let assignments = allAssignments.filter(assignment => {
        const startDate = new Date(assignment.start_date)
        const endDate = assignment.end_date ? new Date(assignment.end_date) : null
        const reportMonth = new Date(year, month - 1)
        const reportMonthEnd = endOfMonth(reportMonth)
        
        // La asignacion debe estar activa durante el mes del reporte
        return startDate <= reportMonthEnd && (!endDate || endDate >= reportMonth)
      })
      
      if (user_id) {
        assignments = assignments.filter(a => a.user_id === user_id)
      }
      
      if (worker_id) {
        assignments = assignments.filter(a => a.worker_id === worker_id)
      }
      
      // Generar reportes para cada asignacion
      const reports: MonthlyReportData[] = []
      
      for (const assignment of assignments) {
        const reportData = await calculateMonthlyHours(
          assignment,
          year,
          month,
          holidays
        )
        
        reports.push(reportData)
        
        // Guardar en la base de datos
        const { error: insertError } = await supabase
          .from('monthly_reports')
          .upsert({
            id: reportData.id,
            user_id: reportData.user_id,
            worker_id: reportData.worker_id,
            year: reportData.year,
            month: reportData.month,
            assigned_hours: reportData.assigned_hours,
            calculated_hours: reportData.calculated_hours,
            excess_deficit_hours: reportData.excess_deficit_hours,
            working_days: reportData.working_days,
            holiday_days: reportData.holiday_days,
            weekend_days: reportData.weekend_days,
            report_data: reportData.report_data,
            generated_at: reportData.generated_at
          }, { 
            onConflict: 'user_id,worker_id,year,month',
            ignoreDuplicates: false 
          })
        
        if (insertError) {
          throw new Error(`Error al guardar reporte: ${insertError.message}`)
        }
      }
      
      return reports
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-reports'] })
      toast.success('Reportes mensuales generados correctamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al generar reportes: ${error.message}`)
    }
  })
}

// Funcion principal para calcular horas mensuales
async function calculateMonthlyHours(
  assignment: AssignmentWithDetails,
  year: number,
  month: number,
  holidays: Holiday[]
): Promise<MonthlyReportData> {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = endOfMonth(monthStart)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Crear un mapa de festivos
  const holidayMap = new Map(holidays.map(h => [h.date, h]))
  
  const dailyBreakdown: DailyBreakdown[] = []
  let totalCalculatedHours = 0
  let workingDays = 0
  let holidayDays = 0
  let weekendDays = 0
  
  const hoursByDayType = {
    laborable: 0,
    fin_semana: 0,
    festivo: 0
  }
  
  // Procesar cada dia del mes
  for (const date of daysInMonth) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayOfWeek = getDay(date) === 0 ? 7 : getDay(date) // Convertir domingo de 0 a 7
    const isHoliday = holidayMap.has(dateStr)
    const isWeekendDay = isWeekend(date)
    
    // Determinar el tipo de dia
    let dayType: 'laborable' | 'fin_semana' | 'festivo'
    if (isHoliday) {
      dayType = 'festivo'
      holidayDays++
    } else if (isWeekendDay) {
      dayType = 'fin_semana'
      weekendDays++
    } else {
      dayType = 'laborable'
      workingDays++
    }
    
    // Buscar tramos horarios que coincidan con este dia
    const applicableTimeSlots = (assignment.time_slots || []).filter(slot => 
      slot.day_of_week === dayOfWeek && 
      slot.day_type === dayType &&
      slot.is_active
    )
    
    // Calcular horas para este dia
    let dayHours = 0
    applicableTimeSlots.forEach(slot => {
      const startMinutes = timeToMinutes(slot.start_time)
      const endMinutes = timeToMinutes(slot.end_time)
      const slotHours = (endMinutes - startMinutes) / 60
      dayHours += slotHours
    })
    
    totalCalculatedHours += dayHours
    hoursByDayType[dayType] += dayHours
    
    dailyBreakdown.push({
      date: dateStr,
      day_of_week: dayOfWeek,
      day_type: dayType,
      is_holiday: isHoliday,
      holiday_name: isHoliday ? holidayMap.get(dateStr)?.name : undefined,
      scheduled_hours: dayHours,
      time_slots_used: applicableTimeSlots
    })
  }
  
  // Calcular exceso o deficit
  const assignedHours = assignment.user.monthly_hours
  const excessDeficitHours = totalCalculatedHours - assignedHours
  
  const reportData: MonthlyReportData = {
    id: `${assignment.user_id}-${assignment.worker_id}-${year}-${month}`,
    user_id: assignment.user_id,
    worker_id: assignment.worker_id,
    year,
    month,
    assigned_hours: assignedHours,
    calculated_hours: Math.round(totalCalculatedHours * 100) / 100, // Redondear a 2 decimales
    excess_deficit_hours: Math.round(excessDeficitHours * 100) / 100,
    working_days: workingDays,
    holiday_days: holidayDays,
    weekend_days: weekendDays,
    report_data: {
      user: assignment.user,
      worker: assignment.worker,
      assignment: assignment,
      daily_breakdown: dailyBreakdown,
      summary: {
        total_days: daysInMonth.length,
        working_days: workingDays,
        weekend_days: weekendDays,
        holiday_days: holidayDays,
        hours_by_day_type: {
          laborable: Math.round(hoursByDayType.laborable * 100) / 100,
          fin_semana: Math.round(hoursByDayType.fin_semana * 100) / 100,
          festivo: Math.round(hoursByDayType.festivo * 100) / 100
        }
      }
    },
    generated_at: new Date().toISOString()
  }
  
  return reportData
}

// Hook para exportar reportes
export function useExportMonthlyReport() {
  return useMutation({
    mutationFn: async ({
      reports,
      format: exportFormat,
      filename
    }: {
      reports: MonthlyReportData[]
      format: 'pdf' | 'excel'
      filename: string
    }) => {
      if (exportFormat === 'excel') {
        return await exportToExcel(reports, filename)
      } else {
        return await exportToPDF(reports, filename)
      }
    },
    onSuccess: () => {
      toast.success('Reporte exportado correctamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al exportar reporte: ${error.message}`)
    }
  })
}

// Funciones auxiliares
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Funcion para exportar a Excel (simulada)
async function exportToExcel(reports: MonthlyReportData[], filename: string) {
  // Aqui iria la logica real de exportacion a Excel usando una libreria como xlsx
  // Por ahora retornamos una simulacion
  const data = reports.map(report => ({
    'Cliente': report.report_data.user.full_name,
    'Trabajadora': report.report_data.worker.full_name,
    'Mes/Año': `${report.month}/${report.year}`,
    'Horas Contratadas': report.assigned_hours,
    'Horas Calculadas': report.calculated_hours,
    'Exceso/Deficit': report.excess_deficit_hours,
    'Dias Laborables': report.working_days,
    'Festivos': report.holiday_days,
    'Fines de Semana': report.weekend_days
  }))
  
  // Simular descarga
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.json` // En implementacion real seria .xlsx
  a.click()
  URL.revokeObjectURL(url)
}

// Funcion para exportar a PDF (simulada)
async function exportToPDF(reports: MonthlyReportData[], filename: string) {
  // Aqui iria la logica real de exportacion a PDF usando una libreria como jsPDF
  // Por ahora retornamos una simulacion
  const htmlContent = generatePDFContent(reports)
  
  // Simular descarga
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.html` // En implementacion real seria .pdf
  a.click()
  URL.revokeObjectURL(url)
}

function generatePDFContent(reports: MonthlyReportData[]): string {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte Mensual de Horas</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reporte Mensual de Horas</h1>
        <p>Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
      </div>
      
      ${reports.map(report => `
        <div class="summary">
          <h2>${report.report_data.user.full_name}</h2>
          <p><strong>Trabajadora:</strong> ${report.report_data.worker.full_name}</p>
          <p><strong>Periodo:</strong> ${report.month}/${report.year}</p>
          <p><strong>Horas Contratadas:</strong> ${report.assigned_hours}h</p>
          <p><strong>Horas Calculadas:</strong> ${report.calculated_hours}h</p>
          <p><strong>Exceso/Deficit:</strong> ${report.excess_deficit_hours > 0 ? '+' : ''}${report.excess_deficit_hours}h</p>
        </div>
        
        <table>
          <tr>
            <th>Tipo de Dia</th>
            <th>Cantidad</th>
            <th>Horas Totales</th>
          </tr>
          <tr>
            <td>Dias Laborables</td>
            <td>${report.working_days}</td>
            <td>${report.report_data.summary.hours_by_day_type.laborable}h</td>
          </tr>
          <tr>
            <td>Fines de Semana</td>
            <td>${report.weekend_days}</td>
            <td>${report.report_data.summary.hours_by_day_type.fin_semana}h</td>
          </tr>
          <tr>
            <td>Festivos</td>
            <td>${report.holiday_days}</td>
            <td>${report.report_data.summary.hours_by_day_type.festivo}h</td>
          </tr>
        </table>
      `).join('')}
    </body>
    </html>
  `
  
  return html
}
