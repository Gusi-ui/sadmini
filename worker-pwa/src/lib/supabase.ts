import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Variables de entorno:', {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined',
  NODE_ENV: import.meta.env.NODE_ENV
})

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas correctamente')
  throw new Error('Variables de entorno de Supabase no configuradas. Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local')
}

// Crear cliente de Supabase
console.log('✅ Creando cliente de Supabase real')
console.log('✅ Using URL:', supabaseUrl)
console.log('✅ Using Key:', supabaseAnonKey.substring(0, 20) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Cliente de Supabase creado correctamente')

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
    }
  }
}
