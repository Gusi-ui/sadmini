import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseAdmin, type Database } from '@/lib/supabase'
import { generateEmployeeCode } from '@/lib/utils'
import { toast } from 'sonner'
import type { WorkerFormData } from '@/lib/validations'

type Worker = Database['public']['Tables']['workers']['Row']
type WorkerInsert = Database['public']['Tables']['workers']['Insert']
type WorkerUpdate = Database['public']['Tables']['workers']['Update']

// Hook para obtener todas las trabajadoras
export function useWorkers(includeInactive = false) {
  return useQuery({
    queryKey: ['workers', includeInactive],
    queryFn: async () => {
      let query = supabase.from('workers').select('*')
      
      if (!includeInactive) {
        query = query.eq('is_active', true)
      }
      
      const { data, error } = await query.order('full_name')
      
      if (error) {
        throw new Error(`Error al obtener trabajadoras: ${error.message}`)
      }
      
      return data as Worker[]
    }
  })
}

// Hook para obtener una trabajadora por ID
export function useWorker(id: string) {
  return useQuery({
    queryKey: ['worker', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error) {
        throw new Error(`Error al obtener trabajadora: ${error.message}`)
      }
      
      return data as Worker | null
    },
    enabled: !!id
  })
}

// Hook para crear una trabajadora
export function useCreateWorker() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: WorkerFormData) => {
      try {
        // 1. Generar código de empleado si no se proporciona
        let employeeId = data.employee_id
        if (!employeeId) {
          employeeId = await generateEmployeeCode()
        }

        // 2. Crear usuario en Supabase Auth con la contraseña temporal
        if (!supabaseAdmin) {
          throw new Error('Cliente de administrador no disponible. Verifica la configuración de VITE_SUPABASE_SERVICE_ROLE_KEY')
        }

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: data.temporary_password!,
          email_confirm: true,
          user_metadata: {
            full_name: data.full_name,
            role: 'worker',
            phone: data.phone,
            address: data.address,
            employee_id: employeeId
          }
        })

        if (authError) {
          throw new Error(`Error al crear usuario: ${authError.message}`)
        }

        // 3. Crear registro en la tabla workers
        const workerData: WorkerInsert = {
          id: authUser.user.id, // Usar el mismo ID del usuario Auth
          employee_id: employeeId,
          dni: data.dni,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          emergency_contact: data.emergency_contact,
          emergency_phone: data.emergency_phone,
          hire_date: data.hire_date,
          notes: data.notes,
          is_active: true
        }
        
        const { data: result, error: workerError } = await supabase
          .from('workers')
          .insert(workerData)
          .select()
          .single()
        
        if (workerError) {
          // Si falla la creación del worker, intentar eliminar el usuario Auth
          if (supabaseAdmin) {
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
          }
          throw new Error(`Error al crear registro de trabajadora: ${workerError.message}`)
        }
        
        return {
          worker: result as Worker,
          authUser: authUser.user,
          temporaryPassword: data.temporary_password
        }
      } catch (error) {
        console.error('Error en useCreateWorker:', error)
        throw error
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      toast.success(
        `Trabajadora creada correctamente. Código: ${result.worker.employee_id}`,
        {
          description: 'Se ha enviado un email con las credenciales de acceso.'
        }
      )
    },
    onError: (error: Error) => {
      toast.error(`Error al crear trabajadora: ${error.message}`)
    }
  })
}

// Hook para actualizar una trabajadora
export function useUpdateWorker() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkerFormData> }) => {
      const updateData: WorkerUpdate = {
        ...data,
        updated_at: new Date().toISOString()
      }
      
      const { data: result, error } = await supabase
        .from('workers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al actualizar trabajadora: ${error.message}`)
      }
      
      return result as Worker
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['worker', result.id] })
      toast.success('Trabajadora actualizada correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para desactivar/activar una trabajadora
export function useToggleWorkerStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data: result, error } = await supabase
        .from('workers')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al ${is_active ? 'activar' : 'desactivar'} trabajadora: ${error.message}`)
      }
      
      return result as Worker
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['worker', result.id] })
      toast.success(`Trabajadora ${result.is_active ? 'activada' : 'desactivada'} correctamente`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para eliminar una trabajadora (soft delete)
export function useDeleteWorker() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar que no tenga asignaciones activas
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('id')
        .eq('worker_id', id)
        .eq('is_active', true)
      
      if (assignmentsError) {
        throw new Error(`Error al verificar asignaciones: ${assignmentsError.message}`)
      }
      
      if (assignments && assignments.length > 0) {
        throw new Error('No se puede eliminar una trabajadora con asignaciones activas')
      }
      
      // Desactivar en lugar de eliminar
      const { data: result, error } = await supabase
        .from('workers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al eliminar trabajadora: ${error.message}`)
      }
      
      return result as Worker
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      toast.success('Trabajadora eliminada correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para obtener trabajadoras activas para selectores
export function useActiveWorkers() {
  return useQuery({
    queryKey: ['active-workers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('id, full_name, employee_id')
        .eq('is_active', true)
        .order('full_name')
      
      if (error) {
        throw new Error(`Error al obtener trabajadoras activas: ${error.message}`)
      }
      
      return data
    }
  })
}

// Hook para resetear contraseña de una trabajadora
export function useResetWorkerPassword() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ workerId, newPassword }: { workerId: string; newPassword: string }) => {
      try {
        // Actualizar contraseña en Supabase Auth
        if (!supabaseAdmin) {
          throw new Error('Cliente de administrador no disponible. Verifica la configuración de VITE_SUPABASE_SERVICE_ROLE_KEY')
        }

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          workerId,
          { password: newPassword }
        )

        if (authError) {
          throw new Error(`Error al actualizar contraseña: ${authError.message}`)
        }

        return {
          user: authUser.user,
          newPassword
        }
      } catch (error) {
        console.error('Error en useResetWorkerPassword:', error)
        throw error
      }
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al resetear contraseña: ${error.message}`)
    }
  })
}

// Hook para obtener estadísticas de trabajadoras
export function useWorkerStats() {
  return useQuery({
    queryKey: ['worker-stats'],
    queryFn: async () => {
      const { data: workers, error } = await supabase
        .from('workers')
        .select('is_active')
      
      if (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`)
      }
      
      const active = workers.filter(w => w.is_active).length
      const inactive = workers.filter(w => !w.is_active).length
      const total = workers.length
      
      return {
        total,
        active,
        inactive
      }
    }
  })
}
