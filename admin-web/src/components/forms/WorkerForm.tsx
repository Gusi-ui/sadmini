import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workerSchema, type WorkerFormData } from '@/lib/validations'
import { generateEmployeeCode, generateTemporaryPassword } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RefreshCw, Eye, EyeOff } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type Worker = Database['public']['Tables']['workers']['Row']

interface WorkerFormProps {
  worker?: Worker | null
  onSubmit: (data: WorkerFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function WorkerForm({ worker, onSubmit, onCancel, isLoading = false }: WorkerFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: worker ? {
      employee_id: worker.employee_id,
      dni: worker.dni,
      full_name: worker.full_name,
      email: worker.email,
      phone: worker.phone,
      address: worker.address || '',
      emergency_contact: worker.emergency_contact || '',
      emergency_phone: worker.emergency_phone || '',
      hire_date: worker.hire_date,
      notes: worker.notes || '',
      temporary_password: ''
    } : {
      employee_id: '',
      dni: '',
      full_name: '',
      email: '',
      phone: '',
      address: '',
      emergency_contact: '',
      emergency_phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      notes: '',
      temporary_password: generateTemporaryPassword()
    }
  })

  // Generar código de empleado automáticamente para nuevas trabajadoras
  useEffect(() => {
    if (!worker) {
      const generateCode = async () => {
        try {
          const newCode = await generateEmployeeCode()
          setValue('employee_id', newCode)
        } catch (error) {
          console.error('Error al generar código de empleado:', error)
        }
      }
      generateCode()
    }
  }, [])

  const handleGeneratePassword = () => {
    const newPassword = generateTemporaryPassword()
    setValue('temporary_password', newPassword)
  }

  const handleFormSubmit = (data: WorkerFormData) => {
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

      {/* Datos Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Datos Básicos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">
              Código de Empleado {!worker && '(Generado automáticamente)'}
            </Label>
            <Input
              id="employee_id"
              placeholder="EMP001"
              {...register('employee_id')}
              className={errors.employee_id ? 'border-red-500' : ''}
              readOnly={!worker}
            />
            {errors.employee_id && (
              <p className="text-sm text-red-500">{errors.employee_id.message}</p>
            )}
            {!worker && (
              <p className="text-xs text-gray-500">
                El código se genera automáticamente al crear una nueva trabajadora.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI *</Label>
            <Input
              id="dni"
              placeholder="12345678A"
              {...register('dni')}
              className={errors.dni ? 'border-red-500' : ''}
            />
            {errors.dni && (
              <p className="text-sm text-red-500">{errors.dni.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre Completo *</Label>
          <Input
            id="full_name"
            placeholder="María García López"
            {...register('full_name')}
            className={errors.full_name ? 'border-red-500' : ''}
          />
          {errors.full_name && (
            <p className="text-sm text-red-500">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hire_date">Fecha de Contratación *</Label>
          <Input
            id="hire_date"
            type="date"
            {...register('hire_date')}
            className={errors.hire_date ? 'border-red-500' : ''}
          />
          {errors.hire_date && (
            <p className="text-sm text-red-500">{errors.hire_date.message}</p>
          )}
        </div>
      </div>

      {/* Datos de Contacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Datos de Contacto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="maria@ejemplo.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              placeholder="+34 600 000 000"
              {...register('phone')}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Textarea
            id="address"
            placeholder="Calle Mayor 1, Mataró"
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
              placeholder="Juan García"
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
              placeholder="+34 600 000 000"
              {...register('emergency_phone')}
              className={errors.emergency_phone ? 'border-red-500' : ''}
            />
            {errors.emergency_phone && (
              <p className="text-sm text-red-500">{errors.emergency_phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Notas Adicionales</h3>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Observaciones</Label>
          <Textarea
            id="notes"
            placeholder="Información adicional sobre la trabajadora..."
            rows={4}
            {...register('notes')}
            className={errors.notes ? 'border-red-500' : ''}
          />
          {errors.notes && (
            <p className="text-sm text-red-500">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Contraseña Temporal - Solo para nuevas trabajadoras */}
      {!worker && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Acceso al Sistema</h3>
          
          <div className="space-y-2">
            <Label htmlFor="temporary_password">Contraseña Temporal *</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="temporary_password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña temporal"
                  {...register('temporary_password')}
                  className={errors.temporary_password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
                className="px-3"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {errors.temporary_password && (
              <p className="text-sm text-red-500">{errors.temporary_password.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Esta contraseña será utilizada por la trabajadora para su primer acceso al sistema.
              Se recomienda que la cambie después del primer inicio de sesión.
            </p>
          </div>
        </div>
      )}

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
              {worker ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            worker ? 'Actualizar Trabajadora' : 'Crear Trabajadora'
          )}
        </Button>
      </div>
    </form>
  )
}
