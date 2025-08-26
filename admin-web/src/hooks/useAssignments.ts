import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, type Database } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import type { AssignmentFormData, TimeSlotFormData } from '@/lib/validations'

type Assignment = Database['public']['Tables']['assignments']['Row']
type AssignmentInsert = Database['public']['Tables']['assignments']['Insert']
type AssignmentUpdate = Database['public']['Tables']['assignments']['Update']
type TimeSlot = Database['public']['Tables']['assignment_time_slots']['Row']
type TimeSlotInsert = Database['public']['Tables']['assignment_time_slots']['Insert']

interface AssignmentWithDetails extends Assignment {
  worker?: Database['public']['Tables']['workers']['Row']
  user?: Database['public']['Tables']['users']['Row']
  time_slots?: TimeSlot[]
}

interface CreateAssignmentData {
  assignment: AssignmentFormData
  timeSlots: TimeSlotFormData[]
}

// Hook para obtener todas las asignaciones
export function useAssignments(includeInactive = false) {
  return useQuery({
    queryKey: ['assignments', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          worker:workers(*),
          user:users(*),
          time_slots:assignment_time_slots(*)
        `)
      
      if (!includeInactive) {
        query = query.eq('is_active', true)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        throw new Error(`Error al obtener asignaciones: ${error.message}`)
      }
      
      return data as AssignmentWithDetails[]
    }
  })
}

// Hook para obtener una asignación específica
export function useAssignment(id: string) {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          worker:workers(*),
          user:users(*),
          time_slots:assignment_time_slots(*)
        `)
        .eq('id', id)
        .maybeSingle()
      
      if (error) {
        throw new Error(`Error al obtener asignación: ${error.message}`)
      }
      
      return data as AssignmentWithDetails | null
    },
    enabled: !!id
  })
}

// Hook para crear una asignación con tramos horarios
export function useCreateAssignment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ assignment, timeSlots }: CreateAssignmentData) => {
      // Verificar conflictos antes de crear
      const conflictCheck = await checkScheduleConflicts(
        assignment.worker_id,
        assignment.start_date,
        assignment.end_date || null,
        timeSlots
      )
      
      if (conflictCheck.hasConflicts) {
        throw new Error(`Conflictos detectados: ${conflictCheck.conflicts.join(', ')}`)
      }
      
      // Crear la asignación
      const assignmentData: AssignmentInsert = {
        worker_id: assignment.worker_id,
        user_id: assignment.user_id,
        start_date: assignment.start_date,
        end_date: assignment.end_date || null,
        notes: assignment.notes,
        is_active: true
      }
      
      const { data: newAssignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert(assignmentData)
        .select()
        .single()
      
      if (assignmentError) {
        throw new Error(`Error al crear asignación: ${assignmentError.message}`)
      }
      
      // Crear los tramos horarios
      if (timeSlots.length > 0) {
        const timeSlotsData: TimeSlotInsert[] = timeSlots.map(slot => ({
          assignment_id: newAssignment.id,
          day_of_week: slot.day_of_week,
          day_type: slot.day_type,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_active: true
        }))
        
        const { error: slotsError } = await supabase
          .from('assignment_time_slots')
          .insert(timeSlotsData)
        
        if (slotsError) {
          // Si falla, eliminar la asignación creada
          await supabase.from('assignments').delete().eq('id', newAssignment.id)
          throw new Error(`Error al crear horarios: ${slotsError.message}`)
        }
      }
      
      return newAssignment as Assignment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Asignación creada correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para actualizar una asignación
export function useUpdateAssignment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      assignment, 
      timeSlots 
    }: { 
      id: string 
      assignment: Partial<AssignmentFormData>
      timeSlots?: TimeSlotFormData[] 
    }) => {
      // Actualizar la asignación
      const updateData: AssignmentUpdate = {
        ...assignment,
        end_date: assignment.end_date || null,
        updated_at: new Date().toISOString()
      }
      
      const { data: updatedAssignment, error: assignmentError } = await supabase
        .from('assignments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (assignmentError) {
        throw new Error(`Error al actualizar asignación: ${assignmentError.message}`)
      }
      
      // Actualizar tramos horarios si se proporcionan
      if (timeSlots) {
        // Eliminar tramos horarios existentes
        await supabase
          .from('assignment_time_slots')
          .delete()
          .eq('assignment_id', id)
        
        // Crear nuevos tramos horarios
        if (timeSlots.length > 0) {
          const timeSlotsData: TimeSlotInsert[] = timeSlots.map(slot => ({
            assignment_id: id,
            day_of_week: slot.day_of_week,
            day_type: slot.day_type,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: true
          }))
          
          const { error: slotsError } = await supabase
            .from('assignment_time_slots')
            .insert(timeSlotsData)
          
          if (slotsError) {
            throw new Error(`Error al actualizar horarios: ${slotsError.message}`)
          }
        }
      }
      
      return updatedAssignment as Assignment
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['assignment', result.id] })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Asignación actualizada correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para toggle del estado de una asignación
export function useToggleAssignmentStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data: result, error } = await supabase
        .from('assignments')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al ${is_active ? 'activar' : 'desactivar'} asignación: ${error.message}`)
      }
      
      return result as Assignment
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['assignment', result.id] })
      toast.success(`Asignación ${result.is_active ? 'activada' : 'desactivada'} correctamente`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para eliminar una asignación
export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Eliminar tramos horarios primero
      await supabase
        .from('assignment_time_slots')
        .delete()
        .eq('assignment_id', id)
      
      // Eliminar la asignación
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw new Error(`Error al eliminar asignación: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Asignación eliminada correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Función para verificar conflictos de horarios
export async function checkScheduleConflicts(
  workerId: string,
  startDate: string,
  endDate: string | null,
  newTimeSlots: TimeSlotFormData[],
  excludeAssignmentId?: string
) {
  let query = supabase
    .from('assignments')
    .select(`
      id,
      start_date,
      end_date,
      time_slots:assignment_time_slots(*)
    `)
    .eq('worker_id', workerId)
    .eq('is_active', true)
  
  // Solo agregar el filtro de exclusión si se proporciona un ID válido
  if (excludeAssignmentId) {
    query = query.neq('id', excludeAssignmentId)
  }
  
  const { data: existingAssignments, error } = await query
  
  if (error) {
    throw new Error(`Error al verificar conflictos: ${error.message}`)
  }
  
  const conflicts: string[] = []
  
  for (const assignment of existingAssignments) {
    // Verificar si las fechas se solapan
    const assignmentStart = new Date(assignment.start_date)
    const assignmentEnd = assignment.end_date ? new Date(assignment.end_date) : null
    const newStart = new Date(startDate)
    const newEnd = endDate ? new Date(endDate) : null
    
    const datesOverlap = (
      (!assignmentEnd || assignmentStart <= (newEnd || new Date('2099-12-31'))) &&
      (!newEnd || (assignmentEnd || new Date('2099-12-31')) >= newStart)
    )
    
    if (datesOverlap) {
      // Verificar conflictos de horarios
      for (const newSlot of newTimeSlots) {
        for (const existingSlot of (assignment as any).time_slots || []) {
          if (
            newSlot.day_of_week === existingSlot.day_of_week &&
            newSlot.day_type === existingSlot.day_type
          ) {
            const newStart = timeToMinutes(newSlot.start_time)
            const newEnd = timeToMinutes(newSlot.end_time)
            const existingStart = timeToMinutes(existingSlot.start_time)
            const existingEnd = timeToMinutes(existingSlot.end_time)
            
            if (
              (newStart < existingEnd && newEnd > existingStart)
            ) {
              const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
              conflicts.push(
                `${dayNames[newSlot.day_of_week]} ${newSlot.start_time}-${newSlot.end_time} (${newSlot.day_type}) se solapa con ${existingSlot.start_time}-${existingSlot.end_time}`
              )
            }
          }
        }
      }
    }
  }
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  }
}

// Función auxiliar para convertir tiempo a minutos
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Hook para obtener estadísticas de asignaciones
export function useAssignmentStats() {
  return useQuery({
    queryKey: ['assignment-stats'],
    queryFn: async () => {
      const { data: assignments, error } = await supabase
        .from('assignments')
        .select('is_active')
      
      if (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`)
      }
      
      const active = assignments.filter(a => a.is_active).length
      const inactive = assignments.filter(a => !a.is_active).length
      const total = assignments.length
      
      return {
        total,
        active,
        inactive
      }
    }
  })
}
