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

        // 2. Verificar si ya existe un usuario con este email
        if (!supabaseAdmin) {
          throw new Error('Cliente de administrador no disponible. Verifica la configuración de VITE_SUPABASE_SERVICE_ROLE_KEY')
        }

        // Verificar si el email ya existe en la tabla workers
        const { data: existingWorker } = await supabase
          .from('workers')
          .select('email')
          .eq('email', data.email)
          .single()

        if (existingWorker) {
          throw new Error('Ya existe una trabajadora registrada con este email')
        }

        // 3. Crear usuario en Supabase Auth con la contraseña temporal
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
          // Si el error es por email duplicado, verificar si es un usuario huérfano
          if (authError.message.includes('already been registered')) {
            // Verificar si existe en la tabla workers
            const { data: existingWorkerByEmail } = await supabase
              .from('workers')
              .select('id')
              .eq('email', data.email)
              .single()
            
            if (!existingWorkerByEmail) {
              throw new Error(`Este email ya está registrado en Auth pero no como trabajadora. Esto indica un usuario huérfano. Ve a la sección de "Limpiar Usuarios Huérfanos" e introduce el email: ${data.email} para eliminarlo y poder crear la trabajadora correctamente.`)
            } else {
              throw new Error('Ya existe una trabajadora registrada con este email')
            }
          }
          throw new Error(`Error al crear usuario: ${authError.message}`)
        }

        // 4. Crear registro en la tabla workers
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

// Hook para limpiar usuarios huérfanos (existen en Auth pero no en workers)
export function useCleanOrphanUsers() {
  return useMutation<{ deletedUserId: string; email: string }, Error, string>({
    mutationFn: async (email: string) => {
      try {
        if (!supabaseAdmin) {
          throw new Error('Cliente de administrador no disponible')
        }

        console.log('🔍 Buscando usuario huérfano con email:', email)

        // Buscar el usuario en Supabase Auth por email
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) {
          console.error('❌ Error al listar usuarios:', listError)
          throw new Error(`Error al buscar usuarios: ${listError.message}`)
        }

        console.log('📋 Total de usuarios en Auth:', authUsers.users.length)

        const orphanUser = authUsers.users.find((user: any) => user.email === email)
        
        if (!orphanUser) {
          throw new Error('No se encontró ningún usuario con este email en Auth')
        }

        console.log('👤 Usuario encontrado:', {
          id: orphanUser.id,
          email: orphanUser.email,
          created_at: orphanUser.created_at
        })

        const userEmail = orphanUser.email || email

        // Verificar que no existe en la tabla workers
        const { data: workerExists, error: workerCheckError } = await supabase
          .from('workers')
          .select('id')
          .eq('id', orphanUser.id)
          .single()

        if (workerCheckError && workerCheckError.code !== 'PGRST116') {
          console.error('❌ Error al verificar trabajadora:', workerCheckError)
          throw new Error(`Error al verificar trabajadora: ${workerCheckError.message}`)
        }

        if (workerExists) {
          throw new Error('Este usuario ya existe en la tabla de trabajadoras')
        }

        console.log('✅ Confirmado: Usuario huérfano (no existe en workers)')

        // Eliminar manualmente todas las referencias para evitar problemas de restricciones
        console.log('🧹 Eliminando todas las referencias manualmente...')

        // 1. Primero obtener el worker_id si existe
        const { data: workerData } = await supabase
          .from('workers')
          .select('id')
          .eq('profile_id', orphanUser.id)
          .single()
        
        const workerId = workerData?.id
        console.log('🔍 Worker ID encontrado:', workerId)

        // 2. Eliminar assignment_time_slots (a través de assignments)
        if (workerId) {
          // Primero obtener los assignment IDs
          const { data: assignmentIds } = await supabase
            .from('assignments')
            .select('id')
            .eq('worker_id', workerId)
          
          if (assignmentIds && assignmentIds.length > 0) {
            const { error: timeSlotsDeleteError } = await supabase
              .from('assignment_time_slots')
              .delete()
              .in('assignment_id', assignmentIds.map(a => a.id))
            
            if (timeSlotsDeleteError) {
              console.warn('⚠️ Error al eliminar assignment_time_slots:', timeSlotsDeleteError.message)
            } else {
              console.log('✅ Assignment time slots eliminados correctamente')
            }
          }
        }

        // 3. Eliminar system_alerts (solo por resolved_by)
        const { error: alertsDeleteError } = await supabase
          .from('system_alerts')
          .delete()
          .eq('resolved_by', orphanUser.id)
        
        if (alertsDeleteError) {
          console.warn('⚠️ Error al eliminar system_alerts:', alertsDeleteError.message)
        } else {
          console.log('✅ System alerts eliminados correctamente')
        }

        // 4. Eliminar system_alerts por related_entity_id si es el worker
        if (workerId) {
          const { error: alertsWorkerDeleteError } = await supabase
            .from('system_alerts')
            .delete()
            .eq('related_entity_id', workerId)
          
          if (alertsWorkerDeleteError) {
            console.warn('⚠️ Error al eliminar system_alerts por worker:', alertsWorkerDeleteError.message)
          } else {
            console.log('✅ System alerts por worker eliminados correctamente')
          }
        }

        // 5. Eliminar assignments relacionadas con este usuario
        if (workerId) {
          const { error: assignmentsByWorkerError } = await supabase
            .from('assignments')
            .delete()
            .eq('worker_id', workerId)
          
          if (assignmentsByWorkerError) {
            console.warn('⚠️ Error al eliminar assignments por worker_id:', assignmentsByWorkerError.message)
          } else {
            console.log('✅ Assignments por worker_id eliminadas correctamente')
          }
        }

        const { error: assignmentsByUserError } = await supabase
          .from('assignments')
          .delete()
          .eq('user_id', orphanUser.id)
        
        if (assignmentsByUserError) {
          console.warn('⚠️ Error al eliminar assignments por user_id:', assignmentsByUserError.message)
        } else {
          console.log('✅ Assignments por user_id eliminadas correctamente')
        }

        // 6. Eliminar monthly_reports
        if (workerId) {
          const { error: monthlyReportsByWorkerError } = await supabase
            .from('monthly_reports')
            .delete()
            .eq('worker_id', workerId)
          
          if (monthlyReportsByWorkerError) {
            console.warn('⚠️ Error al eliminar monthly_reports por worker_id:', monthlyReportsByWorkerError.message)
          } else {
            console.log('✅ Monthly reports por worker_id eliminados correctamente')
          }
        }

        const { error: monthlyReportsByUserError } = await supabase
          .from('monthly_reports')
          .delete()
          .eq('user_id', orphanUser.id)
        
        if (monthlyReportsByUserError) {
          console.warn('⚠️ Error al eliminar monthly_reports por user_id:', monthlyReportsByUserError.message)
        } else {
          console.log('✅ Monthly reports por user_id eliminados correctamente')
        }

        // 7. Eliminar work_hours
        if (workerId) {
          const { error: workHoursDeleteError } = await supabase
            .from('work_hours')
            .delete()
            .eq('worker_id', workerId)
          
          if (workHoursDeleteError) {
            console.warn('⚠️ Error al eliminar work_hours:', workHoursDeleteError.message)
          } else {
            console.log('✅ Work hours eliminadas correctamente')
          }
        }

        // 8. Eliminar holidays
        if (workerId) {
          const { error: holidaysDeleteError } = await supabase
            .from('holidays')
            .delete()
            .eq('worker_id', workerId)
          
          if (holidaysDeleteError) {
            console.warn('⚠️ Error al eliminar holidays:', holidaysDeleteError.message)
          } else {
            console.log('✅ Holidays eliminados correctamente')
          }
        }

        // 9. Eliminar de workers
        if (workerId) {
          const { error: workerDeleteError } = await supabase
            .from('workers')
            .delete()
            .eq('id', workerId)
          
          if (workerDeleteError) {
            console.warn('⚠️ Error al eliminar worker:', workerDeleteError.message)
          } else {
            console.log('✅ Worker eliminado correctamente')
          }
        }

        // 10. Eliminar de la tabla profiles
        console.log('🗑️ Eliminando perfil...')
        const { error: profileDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', orphanUser.id)
        
        if (profileDeleteError) {
          console.warn('⚠️ Error al eliminar perfil:', profileDeleteError.message)
        } else {
          console.log('✅ Perfil eliminado correctamente')
        }

        // 11. Intentar eliminar el usuario huérfano de Auth
        console.log('🗑️ Eliminando usuario de Auth...')
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(orphanUser.id)
        
        if (deleteError) {
          console.error('❌ Error detallado al eliminar usuario:', {
            message: deleteError.message,
            status: deleteError.status
          })
          
          // Proporcionar mensajes de error más específicos
          if (deleteError.message.includes('Database error')) {
            throw new Error('Error de base de datos: Aún existen referencias que impiden la eliminación. Es posible que necesites contactar al administrador del sistema.')
          } else if (deleteError.message.includes('User not found')) {
            throw new Error('El usuario ya no existe en el sistema de autenticación.')
          } else {
            throw new Error(`Error al eliminar usuario huérfano: ${deleteError.message}`)
          }
        }

        console.log('✅ Usuario eliminado correctamente')

        return {
          deletedUserId: orphanUser.id,
          email: userEmail
        }
      } catch (error) {
        console.error('Error en useCleanOrphanUsers:', error)
        throw error
      }
    },
    onSuccess: (result) => {
      toast.success(
        `Usuario huérfano eliminado correctamente`,
        {
          description: `Email: ${result.email}. Ahora puedes crear la trabajadora nuevamente.`
        }
      )
    },
    onError: (error: Error) => {
      toast.error(`Error al limpiar usuario huérfano: ${error.message}`)
    }
  })
}
