import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Sun,
  Moon,
  Coffee,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Database } from '@/lib/supabase'

type TimeSlot = Database['public']['Tables']['assignment_time_slots']['Row']
type Assignment = Database['public']['Tables']['assignments']['Row']

interface AssignmentWithDetails extends Assignment {
  worker?: Database['public']['Tables']['workers']['Row']
  user?: Database['public']['Tables']['users']['Row']
  time_slots?: TimeSlot[]
}

interface TimeSlotManagerProps {
  assignment: AssignmentWithDetails
  onClose: () => void
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes', short: 'L' },
  { id: 2, name: 'Martes', short: 'M' },
  { id: 3, name: 'Miércoles', short: 'X' },
  { id: 4, name: 'Jueves', short: 'J' },
  { id: 5, name: 'Viernes', short: 'V' },
  { id: 6, name: 'Sábado', short: 'S' },
  { id: 7, name: 'Domingo', short: 'D' }
]

const DAY_TYPES = [
  { id: 'laborable', name: 'Laborable', icon: Sun, color: 'text-blue-600 bg-blue-50' },
  { id: 'festivo', name: 'Festivo', icon: Coffee, color: 'text-orange-600 bg-orange-50' },
  { id: 'fin_semana', name: 'Fin de Semana', icon: Moon, color: 'text-purple-600 bg-purple-50' }
]

export default function TimeSlotManager({ assignment, onClose }: TimeSlotManagerProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1)
  const [selectedDayType, setSelectedDayType] = useState<'laborable' | 'festivo' | 'fin_semana'>('laborable')

  // Usar los time slots del assignment directamente
  const timeSlots = assignment.time_slots || []
  const isLoading = false

  // Agrupar tramos por día y tipo
  const groupedTimeSlots = timeSlots.reduce((groups, slot) => {
    const key = `${slot.day_of_week}-${slot.day_type}`
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(slot)
    return groups
  }, {} as Record<string, TimeSlot[]>)

  const handleCreateTimeSlot = async (data: any) => {
    console.log('Create time slot:', data)
  }

  const handleUpdateTimeSlot = async (data: any) => {
    console.log('Update time slot:', data)
  }

  const handleDeleteTimeSlot = async (id: string) => {
    console.log('Delete time slot:', id)
  }

  const openCreateForm = () => {
    setSelectedTimeSlot(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const openEditForm = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.id === dayOfWeek)?.name || ''
  }

  const getDayTypeName = (dayType: string) => {
    return DAY_TYPES.find(type => type.id === dayType)?.name || ''
  }

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'HH:mm')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Tramos Horarios</h2>
          <p className="text-sm text-gray-600">
            Asignación: {assignment.worker?.full_name} → {assignment.user?.full_name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Tramo
          </Button>
        </div>
      </div>

      {/* Vista de tramos horarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DAYS_OF_WEEK.map(day => (
          <Card key={day.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                {day.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {DAY_TYPES.map(dayType => {
                const key = `${day.id}-${dayType.id}`
                const slots = groupedTimeSlots[key] || []
                
                return (
                  <div key={dayType.id} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <dayType.icon className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">{dayType.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {slots.length} tramo{slots.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {slots.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No hay tramos configurados</p>
                    ) : (
                      <div className="space-y-2">
                        {slots.map(slot => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditForm(slot)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Eliminar Tramo Horario</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      ¿Estás seguro de que deseas eliminar este tramo horario?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTimeSlot(slot.id)}>
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog del formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Tramo Horario' : 'Nuevo Tramo Horario'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del tramo horario.'
                : 'Añade un nuevo tramo horario para esta asignación.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>Formulario de tramos horarios</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
