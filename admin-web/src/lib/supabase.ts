import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for the database
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'worker'
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: 'admin' | 'worker'
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'worker'
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: string
          profile_id: string | null
          employee_id: string
          dni: string
          full_name: string
          email: string
          phone: string
          address: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          hire_date: string
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          employee_id: string
          dni: string
          full_name: string
          email: string
          phone: string
          address?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          hire_date: string
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          employee_id?: string
          dni?: string
          full_name?: string
          email?: string
          phone?: string
          address?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          hire_date?: string
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string
          dni: string
          email: string | null
          phone: string | null
          address: string
          emergency_contact: string | null
          emergency_phone: string | null
          medical_notes: string | null
          monthly_hours: number
          is_active: boolean
          birth_date: string | null
          gender: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          dni: string
          email?: string | null
          phone?: string | null
          address: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          medical_notes?: string | null
          monthly_hours?: number
          is_active?: boolean
          birth_date?: string | null
          gender?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          dni?: string
          email?: string | null
          phone?: string | null
          address?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          medical_notes?: string | null
          monthly_hours?: number
          is_active?: boolean
          birth_date?: string | null
          gender?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          worker_id: string
          user_id: string
          start_date: string
          end_date: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          user_id: string
          start_date: string
          end_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          user_id?: string
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assignment_time_slots: {
        Row: {
          id: string
          assignment_id: string
          day_of_week: number
          day_type: 'laborable' | 'festivo' | 'fin_semana'
          start_time: string
          end_time: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          day_of_week: number
          day_type: 'laborable' | 'festivo' | 'fin_semana'
          start_time: string
          end_time: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          day_of_week?: number
          day_type?: 'laborable' | 'festivo' | 'fin_semana'
          start_time?: string
          end_time?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      holidays: {
        Row: {
          id: string
          date: string
          name: string
          type: 'nacional' | 'autonomico' | 'local'
          municipality: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          name: string
          type: 'nacional' | 'autonomico' | 'local'
          municipality?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          name?: string
          type?: 'nacional' | 'autonomico' | 'local'
          municipality?: string
          is_active?: boolean
          created_at?: string
        }
      }
      monthly_reports: {
        Row: {
          id: string
          user_id: string
          worker_id: string
          year: number
          month: number
          assigned_hours: number
          calculated_hours: number
          excess_deficit_hours: number
          working_days: number
          holiday_days: number
          weekend_days: number
          report_data: any
          generated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          worker_id: string
          year: number
          month: number
          assigned_hours: number
          calculated_hours: number
          excess_deficit_hours: number
          working_days: number
          holiday_days: number
          weekend_days: number
          report_data?: any
          generated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          worker_id?: string
          year?: number
          month?: number
          assigned_hours?: number
          calculated_hours?: number
          excess_deficit_hours?: number
          working_days?: number
          holiday_days?: number
          weekend_days?: number
          report_data?: any
          generated_at?: string
        }
      }
    }
  }
}
