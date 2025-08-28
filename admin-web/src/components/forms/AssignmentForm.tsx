import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { assignmentSchema, timeSlotSchema, type AssignmentFormData, type TimeSlotFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  User,
  MapPin
} from 'lucide-react'
import { useWorkers } from '@/hooks/useWorkers'
import { useUsers } from '@/hooks/useUsers'
import { checkScheduleConflicts } from '@/hooks/useAssignments'
import type { Database } from '@/lib/supabase'

type Assignment = Database['public']['Tables']['assignments']['Row']
type TimeSlot = Database['public']['Tables']['assignment_time_slots']['Row']

interface AssignmentFormProps {
  assignment?: Assignment | null
  timeSlots?: TimeSlot[]
  onSubmit: (data: { assignment: AssignmentFormData; timeSlots: TimeSlotFormData[] }) => void
  onCancel: () => void
  isLoading?: boolean
}

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAY_TYPES = [
  { value: 'laborable', label: 'Laborable', color: 'bg-blue-100 text-blue-800' },
  { value: 'festivo', label: 'Festivo', color: 'bg-red-100 text-red-800' },
  { value: 'fin_semana', label: 'Fin de Semana', color: 'bg-purple-100 text-purple-800' }
] as const

export default function AssignmentForm({ assignment, timeSlots, onSubmit, onCancel, isLoading = false }: AssignmentFormProps) {
  const [conflicts, setConflicts] = useState<string[]>([])
  const [checkingConflicts, setCheckingConflicts] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  const { data: workers } = useWorkers()
  const { data: users } = useUsers()
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: assignment ? {
      worker_id: assignment.worker_id,
      user_id: assignment.user_id,
      start_date: assignment.start_date,
      end_date: assignment.end_date || '',
      notes: assignment.notes || ''
    } : {
      worker_id: undefined,
      user_id: undefined,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: ''
    }
  })
  
  const [timeSlotsData, setTimeSlotsData] = useState<TimeSlotFormData[]>(
    timeSlots ? timeSlots.map(slot => ({
      assignment_id: slot.assignment_id,
      day_of_week: slot.day_of_week,
      day_type: slot.day_type as 'laborable' | 'festivo' | 'fin_semana',
      start_time: slot.start_time,
      end_time: slot.end_time
    })) : []
  )
  
  const watchedWorkerId = watch('worker_id')
  const watchedStartDate = watch('start_date')
  const watchedEndDate = watch('end_date')
  
  // Verificar conflictos cuando cambian los datos
  useEffect(() => {
    const checkConflicts = async () => {
      if (watchedWorkerId && watchedStartDate && timeSlotsData.length > 0) {
        setCheckingConflicts(true)
        try {
          const result = await checkScheduleConflicts(
            watchedWorkerId,
            watchedStartDate,
            watchedEndDate || null,
            timeSlotsData,
            assignment?.id
          )
          setConflicts(result.conflicts)
        } catch (error) {
          console.error('Error checking conflicts:', error)
        } finally {
          setCheckingConflicts(false)
        }
      }
    }
    
    checkConflicts()
  }, [watchedWorkerId, watchedStartDate, watchedEndDate, timeSlotsData, assignment?.id])
  
  const addTimeSlot = () => {
    setTimeSlotsData(prev => [...prev, {
      assignment_id: undefined,
      day_of_week: 1,
      day_type: 'laborable',
      start_time: '09:00',
      end_time: '12:00'
    }])
  }
  
  const removeTimeSlot = (index: number) => {
    setTimeSlotsData(prev => prev.filter((_, i) => i !== index))
  }
  
  const updateTimeSlot = (index: number, field: keyof TimeSlotFormData, value: any) => {
    setTimeSlotsData(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ))
  }
  
  const handleFormSubmit = (data: AssignmentFormData) => {
    if (conflicts.length > 0) {
      return // No enviar si hay conflictos
    }
    onSubmit({ assignment: data, timeSlots: timeSlotsData })
  }
  
  const selectedWorker = workers?.find(w => w.id === watchedWorkerId)
  const selectedUser = users?.find(u => u.id === watch('user_id'))
  
  const hasErrors = Object.keys(errors).length > 0 || conflicts.length > 0
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {conflicts.length > 0 
              ? 'Se han detectado conflictos de horarios. Por favor, revísalos antes de continuar.'
              : 'Por favor, corrija los errores en el formulario antes de continuar.'
            }
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Datos Básicos</TabsTrigger>
          <TabsTrigger value="schedule">Horarios</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Asignación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="worker_id">Trabajadora *</Label>
                  <Controller
                    name="worker_id"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger className={errors.worker_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar trabajadora" />
                        </SelectTrigger>
                        <SelectContent>
                          {workers?.filter(w => w.is_active).map(worker => (
                            <SelectItem key={worker.id} value={worker.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{worker.full_name}</span>
                                <span className="text-sm text-gray-500">({worker.employee_id})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.worker_id && (
                    <p className="text-sm text-red-500">{errors.worker_id.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user_id">Usuario *</Label>
                  <Controller
                    name="user_id"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger className={errors.user_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.filter(u => u.is_active).map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              <div>
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-sm text-gray-500">{user.address}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.user_id && (
                    <p className="text-sm text-red-500">{errors.user_id.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha de Inicio *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register('start_date')}
                    className={errors.start_date ? 'border-red-500' : ''}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">{errors.start_date.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha de Fin (Opcional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...register('end_date')}
                    className={errors.end_date ? 'border-red-500' : ''}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-500">{errors.end_date.message}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Dejar vacío para asignación indefinida
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Observaciones adicionales sobre la asignación..."
                  {...register('notes')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Configuración de Horarios</span>
                <Button type="button" onClick={addTimeSlot} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Horario
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSlotsData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No hay horarios configurados</h3>
                  <p className="mb-4">Agrega al menos un tramo horario para completar la asignación.</p>
                  <Button type="button" onClick={addTimeSlot}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Horario
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeSlotsData.map((slot, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Horario #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTimeSlot(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Día de la Semana</Label>
                            <Select
                              value={slot.day_of_week.toString()}
                              onValueChange={(value) => updateTimeSlot(index, 'day_of_week', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAY_NAMES.slice(1).map((day, dayIndex) => (
                                  <SelectItem key={dayIndex + 1} value={(dayIndex + 1).toString()}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Tipo de Día</Label>
                            <Select
                              value={slot.day_type}
                              onValueChange={(value) => updateTimeSlot(index, 'day_type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAY_TYPES.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <Badge className={type.color}>
                                      {type.label}
                                    </Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Hora de Inicio</Label>
                            <Input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Hora de Fin</Label>
                            <Input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          {DAY_NAMES[slot.day_of_week]} ({slot.day_type}) de {slot.start_time} a {slot.end_time}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Alertas de conflictos */}
          {checkingConflicts && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Verificando conflictos de horarios...
              </AlertDescription>
            </Alert>
          )}
          
          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Conflictos de horarios detectados:</div>
                <ul className="list-disc list-inside space-y-1">
                  {conflicts.map((conflict, index) => (
                    <li key={index} className="text-sm">{conflict}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la Asignación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedWorker && selectedUser ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Trabajadora
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium">{selectedWorker.full_name}</div>
                        <div className="text-sm text-gray-600">{selectedWorker.employee_id}</div>
                        <div className="text-sm text-gray-600">{selectedWorker.email}</div>
                        <div className="text-sm text-gray-600">{selectedWorker.phone}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Usuario
                      </h4>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-medium">{selectedUser.full_name}</div>
                        <div className="text-sm text-gray-600">{selectedUser.address}</div>
                        <div className="text-sm text-gray-600">{selectedUser.phone}</div>
                        <div className="text-sm text-gray-600">
                          Horas mensuales: {selectedUser.monthly_hours}h
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Período
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div>Inicio: {watchedStartDate}</div>
                      <div>Fin: {watchedEndDate || 'Indefinido'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horarios Configurados ({timeSlotsData.length})
                    </h4>
                    <div className="space-y-2">
                      {timeSlotsData.map((slot, index) => {
                        const dayType = DAY_TYPES.find(t => t.value === slot.day_type)
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge className={dayType?.color}>
                                {DAY_NAMES[slot.day_of_week]}
                              </Badge>
                              <span className="text-sm">{slot.start_time} - {slot.end_time}</span>
                            </div>
                            <Badge variant="outline">
                              {dayType?.label}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {conflicts.length === 0 && timeSlotsData.length > 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        La asignación está lista para ser creada. No se han detectado conflictos.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Información Incompleta</h3>
                  <p>Complete los datos básicos para ver el resumen de la asignación.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        
        <div className="flex items-center space-x-2">
          {activeTab !== 'preview' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabs = ['basic', 'schedule', 'preview']
                const currentIndex = tabs.indexOf(activeTab)
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1])
                }
              }}
            >
              Siguiente
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isLoading || conflicts.length > 0 || timeSlotsData.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {assignment ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              assignment ? 'Actualizar Asignación' : 'Crear Asignación'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
