import React, { useState } from 'react'
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
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Gift,
  Flag,
  MapPin,
  Upload
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Database } from '@/lib/supabase'

type Holiday = Database['public']['Tables']['holidays']['Row']

export default function HolidaysPage() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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
    console.log('Delete holiday:', holiday.id)
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
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar festivos por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

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
