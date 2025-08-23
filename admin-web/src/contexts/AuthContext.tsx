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

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error loading profile:', error)
        if (error.code !== 'PGRST116') {
          toast.error('Error al cargar el perfil de usuario')
        }
        setProfile(null)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error loading profile (catch):', error)
      
      // Crear un perfil temporal basado en el usuario
      const tempProfile = {
        id: userId,
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || 'Usuario',
        role: user?.user_metadata?.role || 'admin',
        phone: null,
        address: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setProfile(tempProfile)
    }
  }, [user])

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          await loadProfile(user.id)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
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
        await loadProfile(data.user.id)
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
      await loadProfile(user.id)
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
