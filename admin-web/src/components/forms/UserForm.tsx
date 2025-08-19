import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, type UserFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type User = Database['public']['Tables']['users']['Row']

interface UserFormProps {
  user?: User | null
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function UserForm({ user, onSubmit, onCancel, isLoading = false }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      full_name: user.full_name,
      dni: user.dni,
      email: user.email || '',
      phone: user.phone || '',
      address: user.address,
      emergency_contact: user.emergency_contact || '',
      emergency_phone: user.emergency_phone || '',
      medical_notes: user.medical_notes || '',
      monthly_hours: user.monthly_hours,
      birth_date: user.birth_date || '',
      gender: user.gender as 'hombre' | 'mujer' | 'otro' | undefined
    } : {
      full_name: '',
      dni: '',
      email: '',
      phone: '',
      address: '',
      emergency_contact: '',
      emergency_phone: '',
      medical_notes: '',
      monthly_hours: 40,
      birth_date: '',
      gender: undefined
    }
  })

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data)
  }

  const hasErrors = Object.keys(errors).length > 0
  const watchedGender = watch('gender')

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertDescription>
            Por favor, corrija los errores en el formulario antes de continuar.
          </AlertDescription>
        </Alert>
      )}

      {/* Datos Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Datos Básicos</h3>
        
        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre Completo *</Label>
          <Input
            id="full_name"
            placeholder="Dolores Pérez Vidal"
            {...register('full_name')}
            className={errors.full_name ? 'border-red-500' : ''}
          />
          {errors.full_name && (
            <p className="text-sm text-red-500">{errors.full_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI *</Label>
            <Input
              id="dni"
              placeholder="87654321Z"
              {...register('dni')}
              className={errors.dni ? 'border-red-500' : ''}
            />
            {errors.dni && (
              <p className="text-sm text-red-500">{errors.dni.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_hours">Horas Mensuales Asignadas *</Label>
            <Input
              id="monthly_hours"
              type="number"
              min="1"
              max="200"
              {...register('monthly_hours', { valueAsNumber: true })}
              className={errors.monthly_hours ? 'border-red-500' : ''}
            />
            {errors.monthly_hours && (
              <p className="text-sm text-red-500">{errors.monthly_hours.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
            <Input
              id="birth_date"
              type="date"
              {...register('birth_date')}
              className={errors.birth_date ? 'border-red-500' : ''}
            />
            {errors.birth_date && (
              <p className="text-sm text-red-500">{errors.birth_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select
              value={watchedGender || ''}
              onValueChange={(value) => setValue('gender', value as 'hombre' | 'mujer' | 'otro')}
            >
              <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hombre">Hombre</SelectItem>
                <SelectItem value="mujer">Mujer</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Datos de Contacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Datos de Contacto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="dolores@ejemplo.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              placeholder="+34 700 000 000"
              {...register('phone')}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección Completa *</Label>
          <Textarea
            id="address"
            placeholder="Carrer de la Riera 45, 08301 Mataró, Barcelona"
            rows={2}
            {...register('address')}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Contacto de Emergencia</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Nombre del Contacto</Label>
            <Input
              id="emergency_contact"
              placeholder="José Pérez (hijo)"
              {...register('emergency_contact')}
              className={errors.emergency_contact ? 'border-red-500' : ''}
            />
            {errors.emergency_contact && (
              <p className="text-sm text-red-500">{errors.emergency_contact.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_phone">Teléfono de Emergencia</Label>
            <Input
              id="emergency_phone"
              placeholder="+34 700 000 000"
              {...register('emergency_phone')}
              className={errors.emergency_phone ? 'border-red-500' : ''}
            />
            {errors.emergency_phone && (
              <p className="text-sm text-red-500">{errors.emergency_phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Información Médica */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Información Médica y Cuidados</h3>
        
        <div className="space-y-2">
          <Label htmlFor="medical_notes">Notas Médicas y de Cuidado</Label>
          <Textarea
            id="medical_notes"
            placeholder="Diabetes tipo 2. Medicación: Metformina 850mg cada 12h. Movilidad reducida. Requiere ayuda para las actividades básicas diarias..."
            rows={4}
            {...register('medical_notes')}
            className={errors.medical_notes ? 'border-red-500' : ''}
          />
          {errors.medical_notes && (
            <p className="text-sm text-red-500">{errors.medical_notes.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Incluya información sobre medicación, restricciones, necesidades especiales, movilidad, etc.
          </p>
        </div>
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
              {user ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            user ? 'Actualizar Usuario' : 'Crear Usuario'
          )}
        </Button>
      </div>
    </form>
  )
}
