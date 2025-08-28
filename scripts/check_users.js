import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: './admin-web/.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en Supabase Auth...')
    
    // Verificar usuarios en auth.users (requiere service role key)
    console.log('\n📋 Verificando perfiles en la tabla profiles:')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.error('❌ Error obteniendo perfiles:', profilesError)
    } else {
      console.log('✅ Perfiles encontrados:', profiles.length)
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.role})`)
      })
    }
    
    console.log('\n📋 Verificando trabajadores en la tabla workers:')
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
    
    if (workersError) {
      console.error('❌ Error obteniendo trabajadores:', workersError)
    } else {
      console.log('✅ Trabajadores encontrados:', workers.length)
      workers.forEach(worker => {
        console.log(`  - ${worker.email} (${worker.full_name}) - Activo: ${worker.is_active}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkUsers()