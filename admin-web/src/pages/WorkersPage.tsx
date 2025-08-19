import React, { useState } from 'react'
import { useWorkers, useCreateWorker, useUpdateWorker, useToggleWorkerStatus } from '@/hooks/useWorkers'
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
  DialogTitle,
  DialogTrigger
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
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import WorkerForm from '@/components/forms/WorkerForm'
import type { Database } from '@/lib/supabase'

type Worker = Database['public']['Tables']['workers']['Row']

export default function WorkersPage() {
  const [activeTab, setActiveTab] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { data: activeWorkers, isLoading: activeLoading } = useWorkers(false)
  const { data: allWorkers, isLoading: allLoading } = useWorkers(true)
  const createWorkerMutation = useCreateWorker()
  const updateWorkerMutation = useUpdateWorker()
  const toggleStatusMutation = useToggleWorkerStatus()

  const inactiveWorkers = allWorkers?.filter(worker => !worker.is_active) || []
  
  const currentWorkers = activeTab === 'active' ? activeWorkers : inactiveWorkers
  const isLoading = activeTab === 'active' ? activeLoading : allLoading

  // Filtrar trabajadoras por término de búsqueda
  const filteredWorkers = currentWorkers?.filter(worker =>
    worker.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleCreateWorker = async (data: any) => {
    try {
      await createWorkerMutation.mutateAsync(data)
      setIsFormOpen(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleUpdateWorker = async (data: any) => {
    if (!selectedWorker) return
    
    try {
      await updateWorkerMutation.mutateAsync({
        id: selectedWorker.id,
        data
      })
      setIsFormOpen(false)
      setSelectedWorker(null)
      setIsEditing(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleToggleStatus = async (worker: Worker) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: worker.id,
        is_active: !worker.is_active
      })
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const openCreateForm = () => {
    setSelectedWorker(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const openEditForm = (worker: Worker) => {
    setSelectedWorker(worker)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Trabajadoras</h1>
          <p className="text-gray-600">
            Administra el personal de ayuda domiciliaria
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Trabajadora
        </Button>
      </div>

      {/* Tabs para activas e inactivas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Trabajadoras Activas
            {activeWorkers && (
              <Badge variant="secondary">{activeWorkers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Trabajadoras Inactivas
            {inactiveWorkers && (
              <Badge variant="outline">{inactiveWorkers.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Barra de búsqueda */}
        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, DNI, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          <WorkersTable
            workers={filteredWorkers}
            isLoading={isLoading}
            onEdit={openEditForm}
            onToggleStatus={handleToggleStatus}
            showActivateButton={false}
          />
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sección de Reactivación
              </CardTitle>
              <p className="text-sm text-gray-600">
                Trabajadoras inactivas que pueden ser reactivadas en el sistema
              </p>
            </CardHeader>
            <CardContent>
              <WorkersTable
                workers={filteredWorkers}
                isLoading={isLoading}
                onEdit={openEditForm}
                onToggleStatus={handleToggleStatus}
                showActivateButton={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog del formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Trabajadora' : 'Nueva Trabajadora'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos de la trabajadora. Los campos marcados con * son obligatorios.'
                : 'Completa los datos de la nueva trabajadora. Los campos marcados con * son obligatorios.'
              }
            </DialogDescription>
          </DialogHeader>
          <WorkerForm
            worker={selectedWorker}
            onSubmit={isEditing ? handleUpdateWorker : handleCreateWorker}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createWorkerMutation.isPending || updateWorkerMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente para la tabla de trabajadoras
interface WorkersTableProps {
  workers: Worker[]
  isLoading: boolean
  onEdit: (worker: Worker) => void
  onToggleStatus: (worker: Worker) => void
  showActivateButton: boolean
}

function WorkersTable({ workers, isLoading, onEdit, onToggleStatus, showActivateButton }: WorkersTableProps) {
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

  if (workers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showActivateButton ? 'No hay trabajadoras inactivas' : 'No hay trabajadoras activas'}
            </h3>
            <p className="text-gray-600">
              {showActivateButton
                ? 'Todas las trabajadoras están actualmente activas.'
                : 'Añade tu primera trabajadora para comenzar.'
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
              <TableHead>Código</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Fecha de Alta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{worker.full_name}</div>
                    <div className="text-sm text-gray-600">{worker.dni}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{worker.employee_id}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-1" />
                      {worker.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-3 w-3 mr-1" />
                      {worker.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(worker.hire_date), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={worker.is_active ? 'default' : 'secondary'}
                    className={worker.is_active ? 'bg-green-100 text-green-800' : ''}
                  >
                    {worker.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(worker)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {showActivateButton && !worker.is_active ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reactivar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reactivar Trabajadora</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que deseas reactivar a {worker.full_name}?
                              Podrá volver a recibir nuevas asignaciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onToggleStatus(worker)}>
                              Reactivar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant={worker.is_active ? 'destructive' : 'outline'}
                            size="sm"
                          >
                            {worker.is_active ? (
                              <>
                                <UserX className="h-4 w-4 mr-1" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activar
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {worker.is_active ? 'Desactivar' : 'Activar'} Trabajadora
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {worker.is_active ? (
                                <>
                                  ¿Estás seguro de que deseas desactivar a {worker.full_name}?
                                  No podrá recibir nuevas asignaciones.
                                </>
                              ) : (
                                <>
                                  ¿Estás seguro de que deseas activar a {worker.full_name}?
                                  Podrá volver a recibir asignaciones.
                                </>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onToggleStatus(worker)}>
                              {worker.is_active ? 'Desactivar' : 'Activar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
