import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import type { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'worker') => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const createProfile = useCallback(async (userId: string, currentUser?: User) => {
    console.log('📝 Creando nuevo perfil para usuario:', userId)
    try {
      const newProfile = {
        id: userId,
        email: currentUser?.email || '',
        full_name: currentUser?.user_metadata?.full_name || 'Usuario',
        role: (currentUser?.user_metadata?.role as 'admin' | 'worker') || 'admin',
        phone: null,
        address: null
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creando perfil:', error)
        toast.error('Error al crear el perfil de usuario')
        return
      }

      console.log('✅ Perfil creado exitosamente:', data)
      setProfile(data)
      toast.success('Perfil creado exitosamente')
    } catch (error) {
      console.error('❌ Error en createProfile:', error)
    }
  }, [])

  const loadProfile = useCallback(async (userId: string, currentUser?: User) => {
    console.log('📋 Iniciando carga de perfil para usuario:', userId)
    try {

      console.log('🔍 Consultando perfil en Supabase...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('❌ Error loading profile:', error)
        if (error.code === 'PGRST116') {
          // Perfil no encontrado, crear uno nuevo
          console.log('📝 Perfil no encontrado, creando nuevo perfil...')
          await createProfile(userId, currentUser)
        } else {
          toast.error('Error al cargar el perfil de usuario')
          setProfile(null)
        }
        return
      }

      console.log('📋 Perfil obtenido de Supabase:', data)
      setProfile(data)
    } catch (error) {
      console.error('❌ Error loading profile (catch):', error)
      
      console.log('🔧 Intentando crear perfil...')
      await createProfile(userId, currentUser)
    }
  }, [createProfile])

  // Load user on mount
  useEffect(() => {
    let isMounted = true
    
    async function loadUser() {
      console.log('🔄 Iniciando carga de usuario...')
      
      // Timeout de seguridad más corto
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Timeout: Forzando fin de loading después de 5 segundos')
        if (isMounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }, 5000)
      
      try {
        console.log('📡 Verificando variables de entorno...')
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Variables de entorno de Supabase no configuradas')
        }
        
        console.log('📡 Obteniendo usuario de Supabase...')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (!isMounted) return
        
        if (error) {
          // Solo mostrar error si no es el esperado "Auth session missing"
          if (error.message !== 'Auth session missing!') {
            console.error('❌ Error al obtener usuario:', error)
          } else {
            console.log('ℹ️ No hay sesión activa (normal al iniciar)')
          }
          setUser(null)
          setProfile(null)
        } else {
          console.log('👤 Usuario obtenido:', user ? `${user.email} (${user.id})` : 'No hay usuario')
          setUser(user)
          
          if (user) {
            console.log('📋 Cargando perfil del usuario...')
            await loadProfile(user.id, user)
            console.log('✅ Perfil cargado correctamente')
          }
        }
      } catch (error) {
        console.error('❌ Error loading user:', error)
        if (isMounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        clearTimeout(timeoutId)
        if (isMounted) {
          console.log('🏁 Finalizando carga de usuario, estableciendo loading = false')
          setLoading(false)
        }
      }
    }
    
    loadUser()
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          await loadProfile(session.user.id, session.user)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      if (data.user) {
        setUser(data.user)
        await loadProfile(data.user.id, data.user)
        toast.success('Sesión iniciada correctamente')
      }
    } catch (error: any) {
      console.error('Error signing in:', error)
      toast.error(error.message || 'Error al iniciar sesión')
      throw error
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      setUser(null)
      setProfile(null)
      toast.success('Sesión cerrada correctamente')
    } catch (error: any) {
      console.error('Error signing out:', error)
      toast.error(error.message || 'Error al cerrar sesión')
      throw error
    }
  }

  async function signUp(email: string, password: string, fullName: string, role: 'admin' | 'worker') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create profile manually if not created by trigger
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            role
          })

        if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
          console.error('Error creating profile:', profileError)
        }
      }

      toast.success('Cuenta creada correctamente')
    } catch (error: any) {
      console.error('Error signing up:', error)
      toast.error(error.message || 'Error al crear cuenta')
      throw error
    }
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id, user)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    signUp,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth }
