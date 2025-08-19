import React, { useState } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useToggleUserStatus } from '@/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import UserForm from '@/components/forms/UserForm'
import type { Database } from '@/lib/supabase'

type User = Database['public']['Tables']['users']['Row']

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { data: users, isLoading } = useUsers()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const toggleStatusMutation = useToggleUserStatus()

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = users?.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.address.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleCreateUser = async (data: any) => {
    try {
      await createUserMutation.mutateAsync(data)
      setIsFormOpen(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return
    
    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        data
      })
      setIsFormOpen(false)
      setSelectedUser(null)
      setIsEditing(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: user.id,
        is_active: !user.is_active
      })
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const openCreateForm = () => {
    setSelectedUser(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const openEditForm = (user: User) => {
    setSelectedUser(user)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            Administra los beneficiarios del servicio de ayuda domiciliaria
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {isLoading ? '...' : users?.filter(u => u.is_active).length || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuarios</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {isLoading ? '...' : users?.length || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Mensuales</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {isLoading ? '...' : users?.filter(u => u.is_active).reduce((sum, u) => sum + u.monthly_hours, 0) || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
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

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        isLoading={isLoading}
        onEdit={openEditForm}
        onToggleStatus={handleToggleStatus}
        calculateAge={calculateAge}
      />

      {/* Dialog del formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del usuario. Los campos marcados con * son obligatorios.'
                : 'Completa los datos del nuevo usuario. Los campos marcados con * son obligatorios.'
              }
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSubmit={isEditing ? handleUpdateUser : handleCreateUser}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createUserMutation.isPending || updateUserMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente para la tabla de usuarios
interface UsersTableProps {
  users: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  onToggleStatus: (user: User) => void
  calculateAge: (birthDate: string | null) => number | null
}

function UsersTable({ users, isLoading, onEdit, onToggleStatus, calculateAge }: UsersTableProps) {
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

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay usuarios registrados
            </h3>
            <p className="text-gray-600">
              Añade tu primer usuario para comenzar a gestionar el servicio.
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
              <TableHead>Usuario</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Horas Mensuales</TableHead>
              <TableHead>Información Médica</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const age = calculateAge(user.birth_date)
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-600">
                        {user.dni}
                        {age && ` • ${age} años`}
                        {user.gender && ` • ${user.gender}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[200px]">{user.address}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="font-medium">{user.monthly_hours}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.medical_notes ? (
                      <div className="max-w-[200px]">
                        <p className="text-sm text-gray-600 truncate" title={user.medical_notes}>
                          {user.medical_notes}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin notas</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_active ? 'default' : 'secondary'}
                      className={user.is_active ? 'bg-green-100 text-green-800' : ''}
                    >
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant={user.is_active ? 'destructive' : 'outline'}
                            size="sm"
                          >
                            {user.is_active ? (
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
                              {user.is_active ? 'Desactivar' : 'Activar'} Usuario
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.is_active ? (
                                <>
                                  ¿Estás seguro de que deseas desactivar a {user.full_name}?
                                  El usuario no aparecerá en las listas activas.
                                </>
                              ) : (
                                <>
                                  ¿Estás seguro de que deseas activar a {user.full_name}?
                                  El usuario volverá a aparecer en las listas activas.
                                </>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onToggleStatus(user)}>
                              {user.is_active ? 'Desactivar' : 'Activar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
