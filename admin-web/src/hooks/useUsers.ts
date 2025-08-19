import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, type Database } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import type { UserFormData } from '@/lib/validations'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

// Hook para obtener todos los usuarios
export function useUsers(includeInactive = false) {
  return useQuery({
    queryKey: ['users', includeInactive],
    queryFn: async () => {
      let query = supabase.from('users').select('*')
      
      if (!includeInactive) {
        query = query.eq('is_active', true)
      }
      
      const { data, error } = await query.order('full_name')
      
      if (error) {
        throw new Error(`Error al obtener usuarios: ${error.message}`)
      }
      
      return data as User[]
    }
  })
}

// Hook para obtener un usuario por ID
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error) {
        throw new Error(`Error al obtener usuario: ${error.message}`)
      }
      
      return data as User | null
    },
    enabled: !!id
  })
}

// Hook para crear un usuario
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UserFormData) => {
      const userData: UserInsert = {
        full_name: data.full_name,
        dni: data.dni,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        emergency_contact: data.emergency_contact || null,
        emergency_phone: data.emergency_phone || null,
        medical_notes: data.medical_notes || null,
        monthly_hours: data.monthly_hours,
        birth_date: data.birth_date || null,
        gender: data.gender || null,
        is_active: true
      }
      
      const { data: result, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al crear usuario: ${error.message}`)
      }
      
      return result as User
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario creado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para actualizar un usuario
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      const updateData: UserUpdate = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        emergency_contact: data.emergency_contact || null,
        emergency_phone: data.emergency_phone || null,
        medical_notes: data.medical_notes || null,
        birth_date: data.birth_date || null,
        gender: data.gender || null,
        updated_at: new Date().toISOString()
      }
      
      const { data: result, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al actualizar usuario: ${error.message}`)
      }
      
      return result as User
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', result.id] })
      toast.success('Usuario actualizado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para desactivar/activar un usuario
export function useToggleUserStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data: result, error } = await supabase
        .from('users')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al ${is_active ? 'activar' : 'desactivar'} usuario: ${error.message}`)
      }
      
      return result as User
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', result.id] })
      toast.success(`Usuario ${result.is_active ? 'activado' : 'desactivado'} correctamente`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para eliminar un usuario (soft delete)
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar que no tenga asignaciones activas
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('id')
        .eq('user_id', id)
        .eq('is_active', true)
      
      if (assignmentsError) {
        throw new Error(`Error al verificar asignaciones: ${assignmentsError.message}`)
      }
      
      if (assignments && assignments.length > 0) {
        throw new Error('No se puede eliminar un usuario con asignaciones activas')
      }
      
      // Desactivar en lugar de eliminar
      const { data: result, error } = await supabase
        .from('users')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al eliminar usuario: ${error.message}`)
      }
      
      return result as User
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario eliminado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para obtener usuarios activos para selectores
export function useActiveUsers() {
  return useQuery({
    queryKey: ['active-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, monthly_hours')
        .eq('is_active', true)
        .order('full_name')
      
      if (error) {
        throw new Error(`Error al obtener usuarios activos: ${error.message}`)
      }
      
      return data
    }
  })
}

// Hook para obtener estadísticas de usuarios
export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data: users, error } = await supabase
        .from('users')
        .select('is_active, monthly_hours')
      
      if (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`)
      }
      
      const active = users.filter(u => u.is_active).length
      const inactive = users.filter(u => !u.is_active).length
      const total = users.length
      const totalMonthlyHours = users
        .filter(u => u.is_active)
        .reduce((sum, u) => sum + u.monthly_hours, 0)
      
      return {
        total,
        active,
        inactive,
        totalMonthlyHours
      }
    }
  })
}
