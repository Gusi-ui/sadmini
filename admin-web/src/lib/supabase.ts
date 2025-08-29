import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const isDev = import.meta.env.VITE_DEV_MODE === 'true'

console.log('🔍 Variables de entorno:', {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined',
  VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
  isDev
})

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas correctamente')
  throw new Error('Variables de entorno de Supabase no configuradas. Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local')
}

// Crear cliente de Supabase real
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Crear cliente de administrador para operaciones que requieren permisos elevados
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

console.log('✅ Cliente de Supabase creado correctamente')
if (supabaseAdmin) {
  console.log('✅ Cliente de administrador de Supabase creado correctamente')
} else {
  console.warn('⚠️ Cliente de administrador no disponible - falta VITE_SUPABASE_SERVICE_ROLE_KEY')
}

// Código comentado del cliente mock
/*
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('tu-proyecto') || supabaseAnonKey.includes('example')) {
  if (isDev) {
    console.warn('🔧 Modo desarrollo: Usando cliente mock de Supabase')
    console.log('Variables de entorno:', { supabaseUrl, supabaseAnonKey, isDev })
    
    // Estado mock para simular autenticación
    let mockUser: any = null
    let mockSession: any = null
    const authListeners: Array<(event: string, session: any) => void> = []
    
    // Cliente mock para desarrollo
    supabase = {
      auth: {
         signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
           // Simular login exitoso para credenciales de prueba
           if (email === 'admin@sadmini.com' && password === 'admin123') {
             mockUser = {
               id: 'mock-admin-id',
               email: 'admin@sadmini.com',
               user_metadata: { full_name: 'Administrador del Sistema' }
             }
             mockSession = { 
               access_token: 'mock-admin-token',
               user: mockUser
             }
             
             // Notificar a los listeners
             setTimeout(() => {
               authListeners.forEach(listener => {
                 listener('SIGNED_IN', mockSession)
               })
             }, 100)
             
             return {
               data: {
                 user: mockUser,
                 session: mockSession
               },
               error: null
             }
           } else if (email === 'trabajadora@sadmini.com' && password === 'worker123') {
             mockUser = {
               id: 'mock-worker-id',
               email: 'trabajadora@sadmini.com',
               user_metadata: { full_name: 'María García López' }
             }
             mockSession = { 
               access_token: 'mock-worker-token',
               user: mockUser
             }
             
             // Notificar a los listeners
             setTimeout(() => {
               authListeners.forEach(listener => {
                 listener('SIGNED_IN', mockSession)
               })
             }, 100)
             
             return {
               data: {
                 user: mockUser,
                 session: mockSession
               },
               error: null
             }
           } else {
             return {
               data: { user: null, session: null },
               error: { message: 'Credenciales incorrectas. Use: admin@sadmini.com/admin123 o trabajadora@sadmini.com/worker123' }
             }
           }
         },
         signOut: async () => {
           mockUser = null
           mockSession = null
           
           // Notificar a los listeners
           setTimeout(() => {
             authListeners.forEach(listener => {
               listener('SIGNED_OUT', null)
             })
           }, 100)
           
           return { error: null }
         },
         getSession: async () => ({ data: { session: mockSession }, error: null }),
         getUser: async () => ({ data: { user: mockUser }, error: null }),
         onAuthStateChange: (callback: (event: string, session: any) => void) => {
           authListeners.push(callback)
           return { 
             data: { 
               subscription: { 
                 unsubscribe: () => {
                   const index = authListeners.indexOf(callback)
                   if (index > -1) {
                     authListeners.splice(index, 1)
                   }
                 }
               }
             }
           }
         }
       },
      from: (table: string) => {
        // Datos de ejemplo para modo mock
        const mockData = {
          workers: [
            {
              id: 'worker-1',
              employee_id: 'EMP001',
              dni: '12345678A',
              full_name: 'María García López',
              email: 'maria.garcia@example.com',
              phone: '+34600123456',
              address: 'Calle Mayor 123, Mataró',
              emergency_contact: 'Juan García',
              emergency_phone: '+34600654321',
              hire_date: '2023-01-15',
              is_active: true,
              notes: 'Trabajadora experimentada con más de 5 años en el sector',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'worker-2',
              employee_id: 'EMP002',
              dni: '87654321B',
              full_name: 'Carmen Rodríguez Martín',
              email: 'carmen.rodriguez@example.com',
              phone: '+34600789012',
              address: 'Avenida Barcelona 45, Mataró',
              emergency_contact: 'Pedro Rodríguez',
              emergency_phone: '+34600210987',
              hire_date: '2023-03-20',
              is_active: true,
              notes: 'Especializada en cuidados geriátricos',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'worker-3',
              employee_id: 'EMP003',
              dni: '11223344C',
              full_name: 'Ana Fernández Silva',
              email: 'ana.fernandez@example.com',
              phone: '+34600345678',
              address: 'Plaza España 12, Mataró',
              emergency_contact: 'Luis Fernández',
              emergency_phone: '+34600876543',
              hire_date: '2023-06-10',
              is_active: true,
              notes: 'Trabajadora joven con formación en auxiliar de enfermería',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          users: [
            {
              id: 'user-1',
              full_name: 'José Martínez Pérez',
              dni: '98765432D',
              email: 'jose.martinez@example.com',
              phone: '+34600111222',
              address: 'Calle Rosario 78, Mataró',
              emergency_contact: 'María Martínez',
              emergency_phone: '+34600333444',
              medical_notes: 'Diabetes tipo 2, hipertensión. Medicación diaria.',
              monthly_hours: 60,
              is_active: true,
              birth_date: '1945-03-15',
              gender: 'Masculino',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'user-2',
              full_name: 'Dolores Sánchez García',
              dni: '55667788E',
              email: 'dolores.sanchez@example.com',
              phone: '+34600555666',
              address: 'Calle Sant Pere 34, Mataró',
              emergency_contact: 'Carlos Sánchez',
              emergency_phone: '+34600777888',
              medical_notes: 'Alzheimer inicial, necesita supervisión para medicación.',
              monthly_hours: 80,
              is_active: true,
              birth_date: '1938-11-22',
              gender: 'Femenino',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'user-3',
              full_name: 'Francisco López Ruiz',
              dni: '99887766F',
              email: 'francisco.lopez@example.com',
              phone: '+34600999000',
              address: 'Avenida Maresme 156, Mataró',
              emergency_contact: 'Isabel López',
              emergency_phone: '+34600111000',
              medical_notes: 'Movilidad reducida, usa silla de ruedas.',
              monthly_hours: 40,
              is_active: true,
              birth_date: '1950-07-08',
              gender: 'Masculino',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          assignments: [],
          monthly_reports: [],
          holidays: [
            {
              id: 'holiday-1',
              name: 'Año Nuevo',
              date: '2024-01-01',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'holiday-2',
              name: 'Reyes Magos',
              date: '2024-01-06',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'holiday-3',
              name: 'Viernes Santo',
              date: '2024-03-29',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        }
         
         // Agregar asignaciones después de definir mockData
         mockData.assignments = [
           {
             id: 'assignment-1',
             worker_id: 'worker-1',
             user_id: 'user-1',
             start_date: '2024-01-01',
             end_date: null,
             notes: 'Cuidados básicos y administración de medicación',
             is_active: true,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString(),
             worker: mockData.workers[0],
             user: mockData.users[0],
             time_slots: []
           },
           {
             id: 'assignment-2',
             worker_id: 'worker-2',
             user_id: 'user-2',
             start_date: '2024-01-15',
             end_date: null,
             notes: 'Supervisión y acompañamiento, control de medicación',
             is_active: true,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString(),
             worker: mockData.workers[1],
             user: mockData.users[1],
             time_slots: []
           },
           {
             id: 'assignment-3',
             worker_id: 'worker-3',
             user_id: 'user-3',
             start_date: '2024-02-01',
             end_date: null,
             notes: 'Ayuda con movilidad y cuidados personales',
             is_active: true,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString(),
             worker: mockData.workers[2],
             user: mockData.users[2],
             time_slots: []
           }
         ]
         
         // Agregar reportes mensuales de ejemplo
         mockData.monthly_reports = [
           {
             id: 'report-1',
             user_id: 'user-1',
             worker_id: 'worker-1',
             year: 2024,
             month: 1,
             assigned_hours: 60,
             calculated_hours: 58.5,
             excess_deficit_hours: -1.5,
             working_days: 22,
             holiday_days: 2,
             weekend_days: 8,
             report_data: {
               user: mockData.users[0],
               worker: mockData.workers[0],
               assignment: mockData.assignments[0],
               daily_breakdown: [],
               summary: {
                 total_days: 31,
                 working_days: 22,
                 weekend_days: 8,
                 holiday_days: 2,
                 hours_by_day_type: {
                   laborable: 50,
                   fin_semana: 6,
                   festivo: 2.5
                 }
               }
             },
             generated_at: new Date().toISOString()
           },
           {
             id: 'report-2',
             user_id: 'user-2',
             worker_id: 'worker-2',
             year: 2024,
             month: 1,
             assigned_hours: 80,
             calculated_hours: 82,
             excess_deficit_hours: 2,
             working_days: 22,
             holiday_days: 2,
             weekend_days: 8,
             report_data: {
               user: mockData.users[1],
               worker: mockData.workers[1],
               assignment: mockData.assignments[1],
               daily_breakdown: [],
               summary: {
                 total_days: 31,
                 working_days: 22,
                 weekend_days: 8,
                 holiday_days: 2,
                 hours_by_day_type: {
                   laborable: 65,
                   fin_semana: 12,
                   festivo: 5
                 }
               }
             },
             generated_at: new Date().toISOString()
           },
           {
             id: 'report-3',
             user_id: 'user-3',
             worker_id: 'worker-3',
             year: 2024,
             month: 2,
             assigned_hours: 40,
             calculated_hours: 39,
             excess_deficit_hours: -1,
             working_days: 20,
             holiday_days: 1,
             weekend_days: 8,
             report_data: {
               user: mockData.users[2],
               worker: mockData.workers[2],
               assignment: mockData.assignments[2],
               daily_breakdown: [],
               summary: {
                 total_days: 29,
                 working_days: 20,
                 weekend_days: 8,
                 holiday_days: 1,
                 hours_by_day_type: {
                   laborable: 32,
                   fin_semana: 6,
                   festivo: 1
                 }
               }
             },
             generated_at: new Date().toISOString()
           }
         ]
         
         return {
          select: (fields?: string) => {
            console.log(`🔍 Mock query: SELECT ${fields || '*'} FROM ${table}`)
            const selectQuery = {
              eq: (column: string, value: any) => ({
                 maybeSingle: async () => {
                   const data = mockData[table as keyof typeof mockData] || []
                   const result = Array.isArray(data) ? data.find((item: any) => item[column] === value) : null
                   console.log(`📊 Mock result for ${table}.${column} = ${value}:`, result)
                   return { data: result || null, error: null }
                 },
                 single: async () => {
                   const data = mockData[table as keyof typeof mockData] || []
                   const result = Array.isArray(data) ? data.find((item: any) => item[column] === value) : null
                   console.log(`📊 Mock result for ${table}.${column} = ${value}:`, result)
                   return { data: result || null, error: null }
                 },
                 order: (orderColumn: string, options?: any) => ({
                   then: async () => {
                     const data = mockData[table as keyof typeof mockData] || []
                     const filtered = Array.isArray(data) ? data.filter((item: any) => item[column] === value) : []
                     console.log(`📊 Mock filtered result for ${table}:`, filtered)
                     return { data: filtered, error: null }
                   }
                 }),
                 then: async () => {
                   const data = mockData[table as keyof typeof mockData] || []
                   const filtered = Array.isArray(data) ? data.filter((item: any) => item[column] === value) : []
                   console.log(`📊 Mock filtered result for ${table}:`, filtered)
                   return { data: filtered, error: null }
                 }
               }),
              order: (column: string, options?: any) => ({
                then: async () => {
                  const data = mockData[table as keyof typeof mockData] || []
                  console.log(`📊 Mock ordered result for ${table}:`, data)
                  return { data: Array.isArray(data) ? data : [], error: null }
                }
              }),
              then: async () => {
                const data = mockData[table as keyof typeof mockData] || []
                console.log(`📊 Mock result for ${table}:`, data)
                return { data: Array.isArray(data) ? data : [], error: null }
              }
            }
            
            // Agregar método order directamente al objeto select para compatibilidad
            selectQuery.order = (column: string, options?: any) => ({
              then: async () => {
                const data = mockData[table as keyof typeof mockData] || []
                return { data: Array.isArray(data) ? data : [], error: null }
              }
            })
            
            return selectQuery
          },
          insert: (data: any) => ({
            select: () => ({
              single: async () => {
                const newItem = { ...data, id: `${table}-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
                return { data: newItem, error: null }
              }
            })
          }),
          update: (data: any) => ({
            eq: (column: string, value: any) => ({
              select: () => ({
                single: async () => {
                  const tableData = mockData[table as keyof typeof mockData] || []
                  const existing = Array.isArray(tableData) ? tableData.find((item: any) => item[column] === value) : null
                  const updated = existing ? { ...existing, ...data, updated_at: new Date().toISOString() } : null
                  return { data: updated, error: null }
                }
              })
            })
          }),
          upsert: (data: any) => ({
            select: () => ({
              single: async () => {
                const newItem = { ...data, id: data.id || `${table}-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
                return { data: newItem, error: null }
              }
            })
          }),
          delete: () => ({
            eq: (column: string, value: any) => ({
              then: async () => ({ data: null, error: null })
            })
          })
        }
      }
    }
  } else {
    throw new Error(
      'Missing or invalid Supabase environment variables. Please check your .env.local file.'
    )
  }
}
*/

export { supabase, supabaseAdmin }

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
