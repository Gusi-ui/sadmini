import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL y clave anónima deben estar configuradas en las variables de entorno')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Tipos de base de datos
export interface Database {
  public: {
    Tables: {
      workers: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          specializations: string[] | null
          hourly_rate: number
          availability: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          specializations?: string[] | null
          hourly_rate: number
          availability?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          specializations?: string[] | null
          hourly_rate?: number
          availability?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          care_requirements: string[] | null
          emergency_contact: any | null
          created_at: string
          updated_at: string
        }
      }
      assignments: {
        Row: {
          id: string
          worker_id: string
          user_id: string
          title: string
          description: string | null
          care_type: string
          status: 'active' | 'completed' | 'cancelled'
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
        }
      }
      assignments_time_slots: {
        Row: {
          id: string
          assignment_id: string
          day_of_week: number
          start_time: string
          end_time: string
          created_at: string
        }
      }
    }
  }
}