import React, { useState } from 'react'
import { useMonthlyReports, useGenerateMonthlyReport, useExportMonthlyReport, type MonthlyReportData } from '@/hooks/useReports'
import { useWorkers } from '@/hooks/useWorkers'
import { useUsers } from '@/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  FileText,
  Download,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Clock,
  User,
  FileSpreadsheet,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - 2 + i
  return { value: year, label: year.toString() }
})

export default function ReportsPage() {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('all')
  const [viewingReport, setViewingReport] = useState<MonthlyReportData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data: workers } = useWorkers()
  const { data: users } = useUsers()
  const { data: reports, isLoading: reportsLoading, refetch } = useMonthlyReports({
    year: selectedYear,
    month: selectedMonth,
    user_id: selectedUserId === 'all' ? undefined : selectedUserId,
    worker_id: selectedWorkerId === 'all' ? undefined : selectedWorkerId
  })
  
  const generateReportMutation = useGenerateMonthlyReport()
  const exportReportMutation = useExportMonthlyReport()

  const handleGenerateReports = async () => {
    await generateReportMutation.mutateAsync({
      year: selectedYear,
      month: selectedMonth,
      user_id: selectedUserId === 'all' ? undefined : selectedUserId,
      worker_id: selectedWorkerId === 'all' ? undefined : selectedWorkerId
    })
    refetch()
  }

  const handleExportReports = async (format: 'pdf' | 'excel') => {
    if (!reports || reports.length === 0) return
    
    const filename = `reporte-mensual-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
    
    // Convertir reports a MonthlyReportData
    const reportData: MonthlyReportData[] = reports.map(report => ({
      id: `${report.user_id}-${report.worker_id}-${report.year}-${report.month}`,
      user_id: report.user_id,
      worker_id: report.worker_id,
      year: report.year,
      month: report.month,
      assigned_hours: report.assigned_hours,
      calculated_hours: report.calculated_hours,
      excess_deficit_hours: report.excess_deficit_hours,
      working_days: report.working_days,
      holiday_days: report.holiday_days,
      weekend_days: report.weekend_days,
      report_data: report.report_data as any,
      generated_at: report.generated_at
    }))
    
    await exportReportMutation.mutateAsync({
      reports: reportData,
      format,
      filename
    })
  }

  const viewReportDetails = (report: any) => {
    const reportData: MonthlyReportData = {
      id: `${report.user_id}-${report.worker_id}-${report.year}-${report.month}`,
      user_id: report.user_id,
      worker_id: report.worker_id,
      year: report.year,
      month: report.month,
      assigned_hours: report.assigned_hours,
      calculated_hours: report.calculated_hours,
      excess_deficit_hours: report.excess_deficit_hours,
      working_days: report.working_days,
      holiday_days: report.holiday_days,
      weekend_days: report.weekend_days,
      report_data: report.report_data as any,
      generated_at: report.generated_at
    }
    setViewingReport(reportData)
    setIsDetailOpen(true)
  }

  // Calcular estadisticas generales
  const stats = reports ? {
    totalReports: reports.length,
    totalAssignedHours: reports.reduce((sum, r) => sum + r.assigned_hours, 0),
    totalCalculatedHours: reports.reduce((sum, r) => sum + r.calculated_hours, 0),
    totalExcess: reports.reduce((sum, r) => sum + Math.max(0, r.excess_deficit_hours), 0),
    totalDeficit: reports.reduce((sum, r) => sum + Math.min(0, r.excess_deficit_hours), 0)
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes Mensuales</h1>
          <p className="text-gray-600">
            Analisis detallado de horas trabajadas vs horas contratadas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {reports && reports.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => handleExportReports('excel')}
                disabled={exportReportMutation.isPending}
              >
                {exportReportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                Exportar Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportReports('pdf')}
                disabled={exportReportMutation.isPending}
              >
                {exportReportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Exportar PDF
              </Button>
            </>
          )}
          <Button 
            onClick={handleGenerateReports}
            disabled={generateReportMutation.isPending}
          >
            {generateReportMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Generar Reportes
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Año
              </label>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(year => (
                    <SelectItem key={year.value} value={year.value.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Mes
              </label>
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Cliente (Opcional)
              </label>
              <Select value={selectedUserId} onValueChange={(value) => setSelectedUserId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {users?.filter(u => u.is_active).map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Trabajadora (Opcional)
              </label>
              <Select value={selectedWorkerId} onValueChange={(value) => setSelectedWorkerId(value)}>
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Estadisticas generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reportes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Horas Contratadas</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalAssignedHours)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Horas Calculadas</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalCalculatedHours)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Exceso Total</p>
                  <p className="text-2xl font-bold text-green-600">+{Math.round(stats.totalExcess)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Deficit Total</p>
                  <p className="text-2xl font-bold text-red-600">{Math.round(stats.totalDeficit)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de reportes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reportes del Periodo: {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Trabajadora</TableHead>
                  <TableHead>Horas Contratadas</TableHead>
                  <TableHead>Horas Calculadas</TableHead>
                  <TableHead>Diferencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const user = report.report_data?.user
                  const worker = report.report_data?.worker
                  const isExcess = report.excess_deficit_hours > 0
                  const isDeficit = report.excess_deficit_hours < 0
                  
                  return (
                    <TableRow key={`${report.user_id}-${report.worker_id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user?.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user?.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {worker?.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {worker?.employee_id}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {report.assigned_hours}h
                      </TableCell>
                      <TableCell className="font-mono">
                        {report.calculated_hours}h
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono ${
                          isExcess ? 'text-green-600' : 
                          isDeficit ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {report.excess_deficit_hours > 0 ? '+' : ''}{report.excess_deficit_hours}h
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={isExcess ? 'default' : isDeficit ? 'destructive' : 'secondary'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {isExcess && <TrendingUp className="h-3 w-3" />}
                          {isDeficit && <TrendingDown className="h-3 w-3" />}
                          {!isExcess && !isDeficit && <BarChart3 className="h-3 w-3" />}
                          {isExcess ? 'Exceso' : isDeficit ? 'Deficit' : 'Equilibrado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewReportDetails(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay reportes disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                Genera reportes para el periodo seleccionado para ver los datos.
              </p>
              <Button onClick={handleGenerateReports}>
                <Plus className="h-4 w-4 mr-2" />
                Generar Reportes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalles del reporte */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Reporte Mensual</DialogTitle>
            <DialogDescription>
              Desglose completo de horas y distribucion por tipo de dia
            </DialogDescription>
          </DialogHeader>
          {viewingReport && (
            <ReportDetails report={viewingReport} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente para mostrar detalles del reporte
function ReportDetails({ report }: { report: MonthlyReportData }) {
  const { user, worker, summary, daily_breakdown } = report.report_data
  
  return (
    <div className="space-y-6">
      {/* Header del reporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{user.full_name}</div>
              <div className="text-sm text-gray-600">{user.address}</div>
              <div className="text-sm text-gray-600">Horas mensuales: {user.monthly_hours}h</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Trabajadora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{worker.full_name}</div>
              <div className="text-sm text-gray-600">{worker.employee_id}</div>
              <div className="text-sm text-gray-600">{worker.email}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Resumen de horas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen de Horas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{report.assigned_hours}h</div>
              <div className="text-sm text-blue-600">Contratadas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{report.calculated_hours}h</div>
              <div className="text-sm text-green-600">Calculadas</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              report.excess_deficit_hours > 0 ? 'bg-green-50' :
              report.excess_deficit_hours < 0 ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              <div className={`text-2xl font-bold ${
                report.excess_deficit_hours > 0 ? 'text-green-600' :
                report.excess_deficit_hours < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {report.excess_deficit_hours > 0 ? '+' : ''}{report.excess_deficit_hours}h
              </div>
              <div className={`text-sm ${
                report.excess_deficit_hours > 0 ? 'text-green-600' :
                report.excess_deficit_hours < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                Diferencia
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{summary.total_days}</div>
              <div className="text-sm text-purple-600">Dias Totales</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Desglose por tipo de dia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desglose por Tipo de Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-900">Dias Laborables</span>
                <Badge className="bg-blue-200 text-blue-800">{report.working_days} dias</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {summary.hours_by_day_type.laborable}h
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-900">Fines de Semana</span>
                <Badge className="bg-purple-200 text-purple-800">{report.weekend_days} dias</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {summary.hours_by_day_type.fin_semana}h
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-red-900">Festivos</span>
                <Badge className="bg-red-200 text-red-800">{report.holiday_days} dias</Badge>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {summary.hours_by_day_type.festivo}h
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Informacion de generacion */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Reporte generado el:</span>
            <span>{format(new Date(report.generated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
