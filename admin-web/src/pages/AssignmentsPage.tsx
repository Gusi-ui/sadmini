import React, { useState } from 'react'
import { useAssignments, useCreateAssignment, useUpdateAssignment, useToggleAssignmentStatus, useDeleteAssignment } from '@/hooks/useAssignments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  User,
  MapPin,
  Calendar,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AssignmentForm from '@/components/forms/AssignmentForm'
import type { Database } from '@/lib/supabase'
import type { AssignmentFormData, TimeSlotFormData } from '@/lib/validations'

type Assignment = Database['public']['Tables']['assignments']['Row']
type TimeSlot = Database['public']['Tables']['assignment_time_slots']['Row']

interface AssignmentWithDetails {
  id: string
  worker_id: string
  user_id: string
  start_date: string
  end_date: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
  worker?: Database['public']['Tables']['workers']['Row']
  user?: Database['public']['Tables']['users']['Row']
  time_slots?: TimeSlot[]
}

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
const DAY_TYPE_COLORS = {
  laborable: 'bg-blue-100 text-blue-800',
  festivo: 'bg-red-100 text-red-800',
  fin_semana: 'bg-purple-100 text-purple-800'
}

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithDetails | null>(null)
  const [viewingAssignment, setViewingAssignment] = useState<AssignmentWithDetails | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { data: activeAssignments, isLoading: activeLoading } = useAssignments(false)
  const { data: allAssignments, isLoading: allLoading } = useAssignments(true)
  const createAssignmentMutation = useCreateAssignment()
  const updateAssignmentMutation = useUpdateAssignment()
  const toggleStatusMutation = useToggleAssignmentStatus()
  const deleteAssignmentMutation = useDeleteAssignment()

  const inactiveAssignments = allAssignments?.filter(assignment => !assignment.is_active) || []
  
  const currentAssignments = activeTab === 'active' ? activeAssignments : inactiveAssignments
  const isLoading = activeTab === 'active' ? activeLoading : allLoading

  const filteredAssignments = currentAssignments?.filter(assignment => {
    const searchLower = searchTerm.toLowerCase()
    return (
      assignment.worker?.full_name.toLowerCase().includes(searchLower) ||
      assignment.user?.full_name.toLowerCase().includes(searchLower) ||
      assignment.user?.address.toLowerCase().includes(searchLower) ||
      assignment.worker?.employee_id.toLowerCase().includes(searchLower)
    )
  }) || []

  const handleCreateAssignment = async (data: { assignment: AssignmentFormData; timeSlots: TimeSlotFormData[] }) => {
    try {
      await createAssignmentMutation.mutateAsync(data)
      setIsFormOpen(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleUpdateAssignment = async (data: { assignment: AssignmentFormData; timeSlots: TimeSlotFormData[] }) => {
    if (!selectedAssignment) return
    
    try {
      await updateAssignmentMutation.mutateAsync({
        id: selectedAssignment.id,
        assignment: data.assignment,
        timeSlots: data.timeSlots
      })
      setIsFormOpen(false)
      setSelectedAssignment(null)
      setIsEditing(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleToggleStatus = async (assignment: AssignmentWithDetails) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: assignment.id,
        is_active: !assignment.is_active
      })
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await deleteAssignmentMutation.mutateAsync(assignmentId)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const openCreateForm = () => {
    setSelectedAssignment(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const openEditForm = (assignment: AssignmentWithDetails) => {
    setSelectedAssignment(assignment)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const openViewDetails = (assignment: AssignmentWithDetails) => {
    setViewingAssignment(assignment)
    setIsViewOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
          <p className="text-gray-600">
            Gestiona las asignaciones de trabajadoras a clientes
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Asignacion
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <ToggleRight className="h-4 w-4" />
            Asignaciones Activas
            {activeAssignments && (
              <Badge variant="secondary">{activeAssignments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" />
            Asignaciones Inactivas
            {inactiveAssignments && (
              <Badge variant="outline">{inactiveAssignments.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por trabajadora, cliente, direccion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          <AssignmentsTable
            assignments={filteredAssignments}
            isLoading={isLoading}
            onEdit={openEditForm}
            onView={openViewDetails}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteAssignment}
            showActivateButton={false}
          />
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5" />
                Asignaciones Inactivas
              </CardTitle>
              <p className="text-sm text-gray-600">
                Asignaciones desactivadas que pueden ser reactivadas
              </p>
            </CardHeader>
            <CardContent>
              <AssignmentsTable
                assignments={filteredAssignments}
                isLoading={isLoading}
                onEdit={openEditForm}
                onView={openViewDetails}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteAssignment}
                showActivateButton={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Asignacion' : 'Nueva Asignacion'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos de la asignacion y sus horarios.'
                : 'Crea una nueva asignacion configurando trabajadora, cliente y horarios.'
              }
            </DialogDescription>
          </DialogHeader>
          <AssignmentForm
            assignment={selectedAssignment as Assignment}
            timeSlots={selectedAssignment?.time_slots}
            onSubmit={isEditing ? handleUpdateAssignment : handleCreateAssignment}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Asignacion</DialogTitle>
          </DialogHeader>
          {viewingAssignment && (
            <AssignmentDetails assignment={viewingAssignment} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Assignment Table Component - simplified for now
interface AssignmentsTableProps {
  assignments: AssignmentWithDetails[]
  isLoading: boolean
  onEdit: (assignment: AssignmentWithDetails) => void
  onView: (assignment: AssignmentWithDetails) => void
  onToggleStatus: (assignment: AssignmentWithDetails) => void
  onDelete: (assignmentId: string) => void
  showActivateButton: boolean
}

function AssignmentsTable({ 
  assignments, 
  isLoading, 
  onEdit, 
  onView,
  onToggleStatus, 
  onDelete, 
  showActivateButton 
}: AssignmentsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showActivateButton ? 'No hay asignaciones inactivas' : 'No hay asignaciones activas'}
            </h3>
            <p className="text-gray-600">
              {showActivateButton
                ? 'Todas las asignaciones estan actualmente activas.'
                : 'Crea tu primera asignacion para comenzar.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajadora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead>Horarios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {assignment.worker?.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {assignment.worker?.employee_id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {assignment.user?.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {assignment.user?.address}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{format(new Date(assignment.start_date), 'dd/MM/yyyy')}</div>
                    <div className="text-gray-600">
                      {assignment.end_date 
                        ? `hasta ${format(new Date(assignment.end_date), 'dd/MM/yyyy')}` 
                        : 'Indefinido'
                      }
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {assignment.time_slots?.slice(0, 2).map((slot, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {DAY_NAMES[slot.day_of_week]} {slot.start_time}-{slot.end_time}
                      </Badge>
                    ))}
                    {assignment.time_slots && assignment.time_slots.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{assignment.time_slots.length - 2} mas
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={assignment.is_active ? 'default' : 'secondary'}
                    className="flex items-center gap-1 w-fit"
                  >
                    {assignment.is_active ? (
                      <ToggleRight className="h-3 w-3" />
                    ) : (
                      <ToggleLeft className="h-3 w-3" />
                    )}
                    {assignment.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => onView(assignment)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(assignment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onToggleStatus(assignment)}>
                      {assignment.is_active ? (
                        <ToggleLeft className="h-4 w-4" />
                      ) : (
                        <ToggleRight className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar Asignacion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Estas seguro de que deseas eliminar esta asignacion?
                            Esta accion no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(assignment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Assignment Details Component
function AssignmentDetails({ assignment }: { assignment: AssignmentWithDetails }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Trabajadora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{assignment.worker?.full_name}</div>
              <div className="text-sm text-gray-600">{assignment.worker?.employee_id}</div>
              <div className="text-sm text-gray-600">{assignment.worker?.email}</div>
              <div className="text-sm text-gray-600">{assignment.worker?.phone}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{assignment.user?.full_name}</div>
              <div className="text-sm text-gray-600">{assignment.user?.address}</div>
              <div className="text-sm text-gray-600">{assignment.user?.phone}</div>
              <div className="text-sm text-gray-600">
                Horas mensuales: {assignment.user?.monthly_hours}h
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Periodo de Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Fecha de inicio</div>
              <div className="font-medium">
                {format(new Date(assignment.start_date), 'dd MMM yyyy', { locale: es })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Fecha de fin</div>
              <div className="font-medium">
                {assignment.end_date 
                  ? format(new Date(assignment.end_date), 'dd MMM yyyy', { locale: es })
                  : 'Indefinido'
                }
              </div>
            </div>
            <div>
              <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                {assignment.is_active ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignment.time_slots && assignment.time_slots.length > 0 ? (
            <div className="space-y-3">
              {assignment.time_slots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800">
                      {DAY_NAMES[slot.day_of_week]}
                    </Badge>
                    <span className="font-medium">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                  <Badge 
                    className={DAY_TYPE_COLORS[slot.day_type as keyof typeof DAY_TYPE_COLORS]}
                  >
                    {slot.day_type === 'laborable' ? 'Laborable' : 
                     slot.day_type === 'festivo' ? 'Festivo' : 'Fin de Semana'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No hay horarios configurados</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {assignment.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{assignment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
