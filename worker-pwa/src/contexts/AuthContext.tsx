import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Worker {
  id: string;
  employee_id: string;
  dni: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  hire_date: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  worker: Worker | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  refreshWorkerData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWorkerData = async (userEmail: string) => {
    try {
      console.log('🔍 AuthContext: Loading worker data for email:', userEmail);
      console.log('🔍 AuthContext: Current loading state:', loading);
      
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('email', userEmail)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ AuthContext: Error loading worker data:', error);
        setWorker(null);
        return;
      }

      console.log('✅ AuthContext: Worker data loaded successfully:', data);
      setWorker(data);
    } catch (error) {
      console.error('❌ AuthContext: Exception in loadWorkerData:', error);
      setWorker(null);
    }
  };

  const refreshWorkerData = async () => {
    if (user?.email) {
      await loadWorkerData(user.email);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user?.email) {
        // Intentar cargar datos del worker
        const { data: workerData, error: workerError } = await supabase
          .from('workers')
          .select('*')
          .eq('email', data.user.email)
          .eq('is_active', true)
          .single();

        if (workerError || !workerData) {
          // Si no se encuentran datos del worker, cerrar sesión y devolver error
          await supabase.auth.signOut();
          return { 
            error: { 
              message: 'No se encontraron datos de trabajador para este usuario. Contacte al administrador para que configure su perfil de trabajador.' 
            } 
          };
        }

        setWorker(workerData);
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setWorker(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🚀 AuthContext: Starting initial session check...');
        console.log('🚀 AuthContext: Initial loading state:', loading);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthContext: Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('🔍 AuthContext: Session found:', !!session, 'Email:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.email) {
          console.log('🔄 AuthContext: Loading worker data for:', session.user.email);
          await loadWorkerData(session.user.email);
          console.log('✅ AuthContext: Worker data loading completed');
        } else {
          console.log('ℹ️ AuthContext: No session found, user needs to login');
        }
      } catch (error) {
        console.error('❌ AuthContext: Exception in getInitialSession:', error);
      } finally {
        console.log('🏁 AuthContext: Setting loading to false - initial session check complete');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthContext: Auth state changed:', event, 'Email:', session?.user?.email);
        console.log('🔄 AuthContext: Current loading state before change:', loading);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user?.email) {
          console.log('✅ AuthContext: User signed in, loading worker data...');
          await loadWorkerData(session.user.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 AuthContext: User signed out, clearing worker data');
          setWorker(null);
        }

        console.log('🏁 AuthContext: Setting loading to false after auth state change');
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    worker,
    session,
    loading,
    signIn,
    signOut,
    refreshWorkerData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};