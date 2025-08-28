// =====================================================
// CREAR USUARIOS REALES EN SUPABASE AUTH
// Script para configuración de producción
// =====================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno desde .env
dotenv.config()

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno faltantes')
  console.error('Asegúrate de configurar:')
  console.error('- SUPABASE_URL o VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Crear cliente de Supabase con service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createRealUsers() {
  console.log('🚀 Creando usuarios reales en Supabase Auth...')

  try {
    // 1. Crear usuario administrador
    console.log('📝 Creando usuario administrador...')
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@mataro.cat',
      password: 'AdminMataro2024!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador Mataró',
        role: 'admin'
      }
    })

    if (adminError) {
      console.error('❌ Error creando administrador:', adminError.message)
    } else {
      console.log('✅ Administrador creado:', adminUser.user.email)
    }

    // 2. Crear usuario trabajadora de ejemplo
    console.log('📝 Creando usuario trabajadora de ejemplo...')
    const { data: workerUser, error: workerError } = await supabase.auth.admin.createUser({
      email: 'trabajadora@mataro.cat',
      password: 'TrabajadoraMataro2024!',
      email_confirm: true,
      user_metadata: {
        full_name: 'María García López',
        role: 'worker'
      }
    })

    if (workerError) {
      console.error('❌ Error creando trabajadora:', workerError.message)
    } else {
      console.log('✅ Trabajadora creada:', workerUser.user.email)
    }

    // 3. Verificar usuarios creados
    console.log('🔍 Verificando usuarios creados...')
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listando usuarios:', listError.message)
    } else {
      console.log('📊 Usuarios en el sistema:')
      users.users.forEach(user => {
        console.log(`  - ${user.email} (${user.user_metadata?.role || 'sin rol'})`)
      })
    }

    console.log('🎉 Proceso completado!')
    console.log('📋 Próximos pasos:')
    console.log('  1. Ejecuta setup_production_auth.sql en Supabase')
    console.log('  2. Actualiza AuthContext.tsx para usar autenticación real')
    console.log('  3. Prueba el login con las credenciales reales')

  } catch (error) {
    console.error('💥 Error general:', error.message)
  }
}

// Ejecutar la función
createRealUsers()
