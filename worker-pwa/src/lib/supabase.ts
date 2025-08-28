import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isDev = import.meta.env.VITE_DEV_MODE === 'true'

// Force debug all environment variables
console.log('🚨 PRODUCTION TEST - ALL ENV VARS:', import.meta.env)
console.log('🚨 PRODUCTION TEST - VITE_DEV_MODE raw value:', import.meta.env.VITE_DEV_MODE)
console.log('🚨 PRODUCTION TEST - SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('🚨 PRODUCTION TEST - isDev calculation:', import.meta.env.VITE_DEV_MODE, '=== true =', isDev)

console.log('🔍 Variables de entorno:', {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined',
  VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
  VITE_DEV_MODE_TYPE: typeof import.meta.env.VITE_DEV_MODE,
  isDev,
  NODE_ENV: import.meta.env.NODE_ENV
})

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas correctamente')
  throw new Error('Variables de entorno de Supabase no configuradas. Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local')
}

// Determinar si usar cliente mock o real
let supabase: any

// Usar cliente mock si las variables contienen valores de ejemplo o en modo desarrollo
console.log('🔍 Verificando condiciones para cliente mock:', {
  supabaseUrl,
  supabaseAnonKey,
  isDev,
  includesTuProyecto: supabaseUrl.includes('tu-proyecto'),
  includesExample: supabaseAnonKey.includes('example')
})

// Force production mode - mock client disabled
// if (supabaseUrl.includes('tu-proyecto') || supabaseAnonKey.includes('example') || isDev) {
  console.warn('🔧 Modo desarrollo: Usando cliente mock de Supabase')
  console.log('Variables de entorno:', { supabaseUrl, supabaseAnonKey, isDev })
    
    // Estado mock para simular autenticación con persistencia
    let mockUser: any = null
    let mockSession: any = null
    const authListeners: Array<(event: string, session: any) => void> = []
    
    // Cargar sesión persistida del localStorage
    const loadPersistedSession = () => {
      try {
        const persistedSession = localStorage.getItem('mock-supabase-session')
        console.log('🔍 Checking localStorage for session:', !!persistedSession)
        if (persistedSession) {
          const parsed = JSON.parse(persistedSession)
          mockUser = parsed.user
          mockSession = parsed.session
          console.log('🔄 Sesión mock restaurada desde localStorage:', mockUser?.email)
          console.log('🔄 Full user object:', mockUser)
        } else {
          console.log('🔍 No persisted session found in localStorage')
        }
      } catch (error) {
        console.warn('Error cargando sesión persistida:', error)
      }
    }
    
    // Persistir sesión en localStorage
    const persistSession = (user: any, session: any) => {
      try {
        localStorage.setItem('mock-supabase-session', JSON.stringify({ user, session }))
      } catch (error) {
        console.warn('Error persistiendo sesión:', error)
      }
    }
    
    // Limpiar sesión persistida
    const clearPersistedSession = () => {
      try {
        localStorage.removeItem('mock-supabase-session')
      } catch (error) {
        console.warn('Error limpiando sesión persistida:', error)
      }
    }
    
    // Cargar sesión al inicializar
     loadPersistedSession()
    
    // Función para limpiar sesión (para debugging)
    if (typeof window !== 'undefined') {
      (window as any).clearMockSession = () => {
        clearPersistedSession()
        mockUser = null
        mockSession = null
        console.log('🧹 Sesión mock limpiada')
        window.location.reload()
      }
      
      // Limpiar automáticamente si hay una sesión con email incorrecto
      const checkAndClearInvalidSession = () => {
        try {
          const persistedSession = localStorage.getItem('mock-supabase-session')
          if (persistedSession) {
            const parsed = JSON.parse(persistedSession)
            const email = parsed.user?.email
            if (email && email !== 'worker@example.com' && email !== 'admin@sadmini.com') {
              console.log('🧹 Limpiando sesión con email inválido:', email)
              clearPersistedSession()
              mockUser = null
              mockSession = null
            }
          }
        } catch (error) {
          console.warn('Error verificando sesión:', error)
        }
      }
      
      checkAndClearInvalidSession()
    }
    
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
             
             // Persistir sesión
             persistSession(mockUser, mockSession)
             
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
           } else if (email === 'worker@example.com' && password === 'worker123') {
             mockUser = {
               id: 'mock-worker-id',
               email: 'worker@example.com',
               user_metadata: { full_name: 'María García López' }
             }
             mockSession = { 
               access_token: 'mock-worker-token',
               user: mockUser
             }
             
             // Persistir sesión
             persistSession(mockUser, mockSession)
             
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
               error: { message: 'Credenciales incorrectas. Use: admin@sadmini.com/admin123 o worker@example.com/worker123' }
             }
           }
         },
         signOut: async () => {
           mockUser = null
           mockSession = null
           
           // Limpiar sesión persistida
           clearPersistedSession()
           
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
              email: 'worker@example.com',
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
          assignments: [
            {
              id: 'assignment-1',
              worker_id: 'worker-1',
              user_id: 'user-1',
              start_date: new Date().toISOString().split('T')[0], // Hoy
              end_date: new Date().toISOString().split('T')[0], // Hoy
              start_time: '09:00',
              end_time: '13:00',
              status: 'active',
              notes: 'Cuidados básicos y administración de medicación',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              time_slots: []
            },
            {
              id: 'assignment-2',
              worker_id: 'worker-1',
              user_id: 'user-2',
              start_date: new Date().toISOString().split('T')[0], // Hoy
              end_date: new Date().toISOString().split('T')[0], // Hoy
              start_time: '15:00',
              end_time: '18:00',
              status: 'active',
              notes: 'Supervisión y acompañamiento, control de medicación',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              time_slots: []
            },
            {
              id: 'assignment-3',
              worker_id: 'worker-1',
              user_id: 'user-3',
              start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
              end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
              start_time: '10:00',
              end_time: '14:00',
              status: 'active',
              notes: 'Ayuda con movilidad y cuidados personales',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              time_slots: []
            },
            {
              id: 'assignment-4',
              worker_id: 'worker-1',
              user_id: 'user-1',
              start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
              end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
              start_time: '08:30',
              end_time: '12:30',
              status: 'active',
              notes: 'Cuidados matutinos y medicación',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              time_slots: []
            },
            {
              id: 'assignment-5',
              worker_id: 'worker-1',
              user_id: 'user-2',
              start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Pasado mañana
              end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Pasado mañana
              start_time: '16:00',
              end_time: '20:00',
              status: 'active',
              notes: 'Cuidados vespertinos',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              time_slots: []
            }
          ],
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
          ],
          monthly_reports: [
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
        }
         
        return {
          select: (fields?: string) => {
            console.log(`🔍 Mock query: SELECT ${fields || '*'} FROM ${table}`)
            console.log(`🔍 Available tables in mockData:`, Object.keys(mockData))
            const createFilteredQuery = (filters: Array<{column: string, value: any, operator?: string}> = []) => {
              const applyFilters = (data: any[]) => {
                return filters.reduce((filtered, filter) => {
                  return filtered.filter((item: any) => {
                    const itemValue = item[filter.column]
                    const filterValue = filter.value
                    
                    switch (filter.operator) {
                      case 'gte':
                        return itemValue >= filterValue
                      case 'lte':
                        return itemValue <= filterValue
                      case 'gt':
                        return itemValue > filterValue
                      case 'lt':
                        return itemValue < filterValue
                      default:
                        return itemValue === filterValue
                    }
                  })
                }, data)
              }
              
              const executeQuery = async () => {
                const data = mockData[table as keyof typeof mockData] || []
                let filtered = Array.isArray(data) ? applyFilters(data) : []
                
                // Simular joins para assignments - incluir datos del usuario
                if (table === 'assignments') {
                  filtered = filtered.map((assignment: any) => {
                    const user = mockData.users?.find((u: any) => u.id === assignment.user_id)
                    return {
                      ...assignment,
                      // Para consultas con join explícito (users!inner)
                      users: user ? {
                        id: user.id,
                        full_name: user.full_name,
                        address: user.address,
                        phone: user.phone,
                        email: user.email,
                        medical_notes: user.medical_notes,
                        emergency_contact: user.emergency_contact,
                        created_at: user.created_at
                      } : {
                        id: assignment.user_id,
                        full_name: 'Usuario no encontrado',
                        address: 'Dirección no disponible',
                        phone: 'Teléfono no disponible',
                        email: 'email@example.com',
                        medical_notes: null,
                        emergency_contact: null,
                        created_at: new Date().toISOString()
                      },
                      // Para consultas simples sin join explícito
                      user: user ? {
                        id: user.id,
                        full_name: user.full_name,
                        address: user.address,
                        phone: user.phone,
                        email: user.email,
                        medical_notes: user.medical_notes,
                        emergency_contact: user.emergency_contact,
                        created_at: user.created_at
                      } : {
                        id: assignment.user_id,
                        full_name: 'Usuario no encontrado',
                        address: 'Dirección no disponible',
                        phone: 'Teléfono no disponible',
                        email: 'email@example.com',
                        medical_notes: null,
                        emergency_contact: null,
                        created_at: new Date().toISOString()
                      }
                    }
                  })
                }
                
                console.log(`📊 Mock filtered result for ${table}:`, filtered)
                return { data: filtered, error: null }
              }
              
              const queryObject: any = {
                eq: (column: string, value: any) => {
                  console.log(`🔗 Chaining eq: ${column} = ${value}`, 'current filters:', filters)
                  const newQuery = createFilteredQuery([...filters, {column, value}])
                  console.log(`🔗 New query object created with eq method:`, typeof newQuery.eq)
                  return newQuery
                },
                gte: (column: string, value: any) => {
                  console.log(`🔗 Chaining gte: ${column} >= ${value}`, 'current filters:', filters)
                  return createFilteredQuery([...filters, {column, value, operator: 'gte'}])
                },
                lte: (column: string, value: any) => {
                  console.log(`🔗 Chaining lte: ${column} <= ${value}`, 'current filters:', filters)
                  return createFilteredQuery([...filters, {column, value, operator: 'lte'}])
                },
                gt: (column: string, value: any) => {
                  console.log(`🔗 Chaining gt: ${column} > ${value}`, 'current filters:', filters)
                  return createFilteredQuery([...filters, {column, value, operator: 'gt'}])
                },
                lt: (column: string, value: any) => {
                  console.log(`🔗 Chaining lt: ${column} < ${value}`, 'current filters:', filters)
                  return createFilteredQuery([...filters, {column, value, operator: 'lt'}])
                },
                or: (conditions: string) => {
                  console.log(`🔗 Chaining or: ${conditions}`, 'current filters:', filters)
                  // For mock purposes, we'll just return the same query object
                  // In a real implementation, this would handle OR logic
                  return createFilteredQuery(filters)
                },
                maybeSingle: async () => {
                  const data = mockData[table as keyof typeof mockData] || []
                  const filtered = Array.isArray(data) ? applyFilters(data) : []
                  const result = filtered[0] || null
                  console.log(`📊 Mock result for ${table} with filters:`, filters, 'result:', result)
                  return { data: result, error: null }
                },
                single: async () => {
                  const data = mockData[table as keyof typeof mockData] || []
                  const filtered = Array.isArray(data) ? applyFilters(data) : []
                  const result = filtered[0] || null
                  console.log(`📊 Mock result for ${table} with filters:`, filters, 'result:', result)
                  return { data: result, error: null }
                },
                order: (orderColumn: string, options?: any) => {
                  console.log(`🔗 Chaining order: ${orderColumn}`, 'current filters:', filters)
                  return createFilteredQuery(filters)
                },
                then: async (callback?: (result: any) => any) => {
                  const result = await executeQuery()
                  return callback ? callback(result) : result
                }
              }
              
              console.log(`🔍 Created query object for filters:`, filters, 'methods:', Object.keys(queryObject))
              return queryObject
            }
            
            return createFilteredQuery([])
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
// } else {
//   console.log('✅ PRODUCTION MODE - Cliente de Supabase real creado correctamente - TIMESTAMP:', Date.now())
//   console.log('✅ PRODUCTION MODE - Using URL:', supabaseUrl)
//   console.log('✅ PRODUCTION MODE - Using Key:', supabaseAnonKey.substring(0, 20) + '...')
//   supabase = createClient(supabaseUrl, supabaseAnonKey)
//   console.log('✅ PRODUCTION MODE - Real client created successfully')
// }

// Create real Supabase client
console.log('✅ PRODUCTION MODE - Cliente de Supabase real creado correctamente - TIMESTAMP:', Date.now())
console.log('✅ PRODUCTION MODE - Using URL:', supabaseUrl)
console.log('✅ PRODUCTION MODE - Using Key:', supabaseAnonKey.substring(0, 20) + '...')
supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ PRODUCTION MODE - Real client created successfully')

export { supabase }

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
