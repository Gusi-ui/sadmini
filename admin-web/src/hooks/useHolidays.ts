import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, type Database } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import type { HolidayFormData } from '@/lib/validations'

type Holiday = Database['public']['Tables']['holidays']['Row']
type HolidayInsert = Database['public']['Tables']['holidays']['Insert']
type HolidayUpdate = Database['public']['Tables']['holidays']['Update']

// Hook para obtener todos los festivos
export function useHolidays(year?: number, municipality = 'Mataró') {
  return useQuery({
    queryKey: ['holidays', year, municipality],
    queryFn: async () => {
      let query = supabase
        .from('holidays')
        .select('*')
        .eq('municipality', municipality)
        .eq('is_active', true)
      
      if (year) {
        query = query
          .gte('date', `${year}-01-01`)
          .lte('date', `${year}-12-31`)
      }
      
      const { data, error } = await query.order('date')
      
      if (error) {
        throw new Error(`Error al obtener festivos: ${error.message}`)
      }
      
      return data as Holiday[]
    }
  })
}

// Hook para obtener un festivo por ID
export function useHoliday(id: string) {
  return useQuery({
    queryKey: ['holiday', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error) {
        throw new Error(`Error al obtener festivo: ${error.message}`)
      }
      
      return data as Holiday | null
    },
    enabled: !!id
  })
}

// Hook para crear un festivo
export function useCreateHoliday() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: HolidayFormData) => {
      // Verificar que no exista ya un festivo en esa fecha
      const { data: existingHoliday } = await supabase
        .from('holidays')
        .select('id')
        .eq('date', data.date)
        .eq('municipality', data.municipality)
        .maybeSingle()
      
      if (existingHoliday) {
        throw new Error('Ya existe un festivo registrado para esta fecha')
      }
      
      const holidayData: HolidayInsert = {
        date: data.date,
        name: data.name,
        type: data.type,
        municipality: data.municipality,
        is_active: true
      }
      
      const { data: result, error } = await supabase
        .from('holidays')
        .insert(holidayData)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al crear festivo: ${error.message}`)
      }
      
      return result as Holiday
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      toast.success('Festivo creado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para actualizar un festivo
export function useUpdateHoliday() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HolidayFormData> }) => {
      const updateData: HolidayUpdate = data
      
      const { data: result, error } = await supabase
        .from('holidays')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al actualizar festivo: ${error.message}`)
      }
      
      return result as Holiday
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      queryClient.invalidateQueries({ queryKey: ['holiday', result.id] })
      toast.success('Festivo actualizado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para eliminar un festivo
export function useDeleteHoliday() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('holidays')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Error al eliminar festivo: ${error.message}`)
      }
      
      return result as Holiday
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      toast.success('Festivo eliminado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para importar festivos masivamente
export function useImportHolidays() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (holidays: HolidayFormData[]) => {
      const holidaysData: HolidayInsert[] = holidays.map(holiday => ({
        date: holiday.date,
        name: holiday.name,
        type: holiday.type,
        municipality: holiday.municipality,
        is_active: true
      }))
      
      const { data: result, error } = await supabase
        .from('holidays')
        .upsert(holidaysData, { onConflict: 'date,municipality' })
        .select()
      
      if (error) {
        throw new Error(`Error al importar festivos: ${error.message}`)
      }
      
      return result as Holiday[]
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      toast.success(`${result.length} festivos importados correctamente`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Hook para obtener estadísticas de festivos
export function useHolidayStats(year: number) {
  return useQuery({
    queryKey: ['holiday-stats', year],
    queryFn: async () => {
      const { data: holidays, error } = await supabase
        .from('holidays')
        .select('type')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`)
        .eq('is_active', true)
      
      if (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`)
      }
      
      const nacional = holidays.filter(h => h.type === 'nacional').length
      const autonomico = holidays.filter(h => h.type === 'autonomico').length
      const local = holidays.filter(h => h.type === 'local').length
      const total = holidays.length
      
      return {
        total,
        nacional,
        autonomico,
        local
      }
    }
  })
}

// Hook para verificar si una fecha es festiva
export function useIsHoliday(date: string, municipality = 'Mataró') {
  return useQuery({
    queryKey: ['is-holiday', date, municipality],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .eq('date', date)
        .eq('municipality', municipality)
        .eq('is_active', true)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Error al verificar festivo: ${error.message}`)
      }
      
      return data as Holiday | null
    },
    enabled: !!date
  })
}
