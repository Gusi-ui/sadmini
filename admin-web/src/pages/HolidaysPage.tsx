import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Calendar,
  Search,
  Edit,
  Trash2,
  Flag,
  MapPin,
  Upload
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useHolidays, useDeleteHoliday, useImportHolidays, useHolidayStats } from '@/hooks/useHolidays'
import HolidayForm from '@/components/forms/HolidayForm'
import type { Database } from '@/lib/supabase'

type Holiday = Database['public']['Tables']['holidays']['Row']

export default function HolidaysPage() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { data: holidays, isLoading } = useHolidays(selectedYear)
  const { data: stats } = useHolidayStats(selectedYear)
  const deleteHolidayMutation = useDeleteHoliday()
  const importHolidaysMutation = useImportHolidays()

  const openCreateForm = () => {
    setSelectedHoliday(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const openEditForm = (holiday: Holiday) => {
    setSelectedHoliday(holiday)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const handleDeleteHoliday = async (holiday: Holiday) => {
    try {
      await deleteHolidayMutation.mutateAsync(holiday.id)
    } catch (error) {
      console.error('Error deleting holiday:', error)
    }
  }

  // Filtrar festivos por término de búsqueda
  const filteredHolidays = useMemo(() => {
    if (!holidays) return []
    
    return holidays.filter(holiday => 
      holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holiday.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [holidays, searchTerm])

  // Función para importar festivos de Mataró 2025
  const importMataro2025Holidays = async () => {
    const mataro2025Holidays = [
      { date: '2025-01-01', name: 'Cap d\'Any', type: 'nacional' as const, municipality: 'Mataró' },
      { date: '2025-01-06', name: 'Reis', type: 'nacional' as const, municipality: 'Mataró' },
      { date: '2025-04-18', name: 'Divendres Sant', type: 'nacional' as const, municipality: 'Mataró' },
      { date: '2025-04-21', name: 'Dilluns de Pasqua Florida', type: 'autonomico' as const, municipality: 'Mataró' },
      { date: '2025-05-01', name: 'Festa del Treball', type: 'nacional' as const, municipality: 'Mataró' },
      { date: '2025-06-09', name: 'Fira a Mataró', type: 'local' as const, municipality: 'Mataró' },
      { date: '2025-06-24', name: 'Sant Joan', type: 'autonomico' as const, municipality: 'Mataró' },
      { date: '2025-07-28', name: 'Festa major de Les Santes', type: 'local' as const, municipality: 'Mataró' },
      { date: '2025-08-15', name: 'L\'Assumpció', type: 'nacional' as const, municipality: 'Mataró' },
      { date: '2025-09-11', name: 'Diada Nacional de Catalunya', type: 'autonomico' as const, municipality: 'Mataró' },
      { date: '2025-11-01', name: 'Tots Sants', type: 'nacional' as const, municipality: 'Mataró' },
      { date: '2025-12-06', name: 'Dia de la Constitució', type: 'nacional' as const, municipality: 'Mataró' },
      { date: '2025-12-08', name: 'La Immaculada', type: 'nacional' as const, municipality: 'Mataró' },
      { date: '2025-12-25', name: 'Nadal', type: 'nacional' as const, municipality: 'Mataró' },
      { date: '2025-12-26', name: 'Sant Esteve', type: 'autonomico' as const, municipality: 'Mataró' }
    ]
    
    try {
      await importHolidaysMutation.mutateAsync(mataro2025Holidays)
    } catch (error) {
      console.error('Error importing holidays:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nacional':
        return <Flag className="h-4 w-4 text-red-600" />
      case 'autonomico':
        return <Flag className="h-4 w-4 text-yellow-600" />
      case 'local':
        return <MapPin className="h-4 w-4 text-blue-600" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nacional':
        return 'bg-red-100 text-red-800'
      case 'autonomico':
        return 'bg-yellow-100 text-yellow-800'
      case 'local':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Festivos</h1>
          <p className="text-gray-600">
            Administra los días festivos para el cálculo preciso de horarios
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Festivo
          </Button>
        </div>
      </div>

      {/* Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Año Seleccionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Año:</label>
              <Input
                type="number"
                min="2020"
                max="2030"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar festivos por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedYear === 2025 && (
          <Button
            variant="outline"
            onClick={importMataro2025Holidays}
            disabled={importHolidaysMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Festivos Mataró 2025
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Festivos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Flag className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nacionales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.nacional}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Flag className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Autonómicos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.autonomico}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Locales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.local}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Festivos */}
      <Card>
        <CardHeader>
          <CardTitle>Festivos {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredHolidays.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay festivos</h3>
              <p>No se encontraron festivos para el año {selectedYear}.</p>
              {selectedYear === 2025 && (
                <Button
                  className="mt-4"
                  onClick={importMataro2025Holidays}
                  disabled={importHolidaysMutation.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Festivos Mataró 2025
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getTypeIcon(holiday.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(holiday.date), 'EEEE, d MMMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(holiday.type)}>
                      {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditForm(holiday)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar festivo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará el festivo "{holiday.name}" del {format(new Date(holiday.date), 'd MMMM yyyy', { locale: es })}.
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteHoliday(holiday)}
                            className="bg-red-600 hover:bg-red-700"
                          >
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
        </CardContent>
      </Card>

      {/* Dialog del formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Festivo' : 'Nuevo Festivo'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del festivo.'
                : 'Añade un nuevo día festivo al calendario.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>Formulario de festivos</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
