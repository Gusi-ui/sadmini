import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { holidaySchema, type HolidayFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type Holiday = Database['public']['Tables']['holidays']['Row']

interface HolidayFormProps {
  holiday?: Holiday | null
  onSubmit: (data: HolidayFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function HolidayForm({ holiday, onSubmit, onCancel, isLoading = false }: HolidayFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: holiday ? {
      date: holiday.date,
      name: holiday.name,
      type: holiday.type as 'nacional' | 'autonomico' | 'local',
      municipality: holiday.municipality
    } : {
      date: new Date().toISOString().split('T')[0],
      name: '',
      type: 'nacional',
      municipality: 'Mataró'
    }
  })

  const watchedType = watch('type')

  const handleFormSubmit = (data: HolidayFormData) => {
    onSubmit(data)
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertDescription>
            Por favor, corrija los errores en el formulario antes de continuar.
          </AlertDescription>
        </Alert>
      )}

      {/* Fecha */}
      <div className="space-y-2">
        <Label htmlFor="date">Fecha del Festivo *</Label>
        <Input
          id="date"
          type="date"
          {...register('date')}
          className={errors.date ? 'border-red-500' : ''}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Festivo *</Label>
        <Input
          id="name"
          placeholder="Día de la Constitución"
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Tipo */}
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de Festivo *</Label>
        <Select
          value={watchedType}
          onValueChange={(value) => setValue('type', value as 'nacional' | 'autonomico' | 'local')}
        >
          <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecciona el tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nacional">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Nacional
              </div>
            </SelectItem>
            <SelectItem value="autonomico">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                Autonómico (Cataluña)
              </div>
            </SelectItem>
            <SelectItem value="local">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Local
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
        <p className="text-xs text-gray-500">
          {watchedType === 'nacional' && 'Festivos que se celebran en toda España'}
          {watchedType === 'autonomico' && 'Festivos específicos de la Comunidad Autónoma de Cataluña'}
          {watchedType === 'local' && 'Festivos locales del municipio'}
        </p>
      </div>

      {/* Municipio */}
      <div className="space-y-2">
        <Label htmlFor="municipality">Municipio</Label>
        <Input
          id="municipality"
          placeholder="Mataró"
          {...register('municipality')}
          className={errors.municipality ? 'border-red-500' : ''}
        />
        {errors.municipality && (
          <p className="text-sm text-red-500">{errors.municipality.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Solo necesario para festivos locales. Por defecto: Mataró
        </p>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Información Importante</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Los festivos se usan para el cálculo automático de horarios</li>
          <li>• Un día festivo en semana se considera como "festivo"</li>
          <li>• Los festivos en fin de semana se consideran como "fin de semana"</li>
          <li>• Esto afecta a los tramos horarios asignados por tipo de día</li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {holiday ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            holiday ? 'Actualizar Festivo' : 'Crear Festivo'
          )}
        </Button>
      </div>
    </form>
  )
}
