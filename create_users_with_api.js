// =====================================================
// CREAR USUARIOS CON API DE SUPABASE
// Script para configuración de producción
// =====================================================

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = 'https://gkmjnhumsbiscpkbyihv.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWpuaHVtc2Jpc2Nwa2J5aWh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxNDA5MiwiZXhwIjoyMDcxMTkwMDkyfQ._kRrKuZUSrkXY3NIenH4UZZe3l2MVmhqFa8apVTjra8'

// Crear cliente de Supabase con service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUsersWithAPI() {
  console.log('🚀 Creando usuarios con API de Supabase...')

  try {
    // 1. Crear usuario administrador
    console.log('📝 Creando usuario administrador...')
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@sadmini.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador del Sistema',
        role: 'admin'
      }
    })

    if (adminError) {
      console.error('❌ Error creando administrador:', adminError.message)
    } else {
      console.log('✅ Administrador creado:', adminUser.user.email)
    }

    // 2. Crear usuario trabajadora
    console.log('📝 Creando usuario trabajadora...')
    const { data: workerUser, error: workerError } = await supabase.auth.admin.createUser({
      email: 'trabajadora@sadmini.com',
      password: 'worker123',
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

    // 3. Crear perfiles para los usuarios
    console.log('📝 Creando perfiles...')
    
    // Obtener usuarios creados
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listando usuarios:', listError.message)
    } else {
      for (const user of users.users) {
        if (user.email === 'admin@sadmini.com' || user.email === 'trabajadora@sadmini.com') {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              role: user.user_metadata?.role || 'user',
              phone: user.email === 'admin@sadmini.com' ? '+34600000001' : '+34600000002',
              address: user.email === 'admin@sadmini.com' 
                ? 'Calle Principal 123, Mataró' 
                : 'Calle Secundaria 456, Mataró'
            })

          if (profileError) {
            console.error(`❌ Error creando perfil para ${user.email}:`, profileError.message)
          } else {
            console.log(`✅ Perfil creado para ${user.email}`)
          }
        }
      }
    }

    // 4. Verificar configuración final
    console.log('🔍 Verificando configuración...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', ['admin@sadmini.com', 'trabajadora@sadmini.com'])

    if (profilesError) {
      console.error('❌ Error verificando perfiles:', profilesError.message)
    } else {
      console.log('📊 Perfiles creados:')
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.role})`)
      })
    }

    console.log('🎉 Proceso completado!')
    console.log('📋 Próximos pasos:')
    console.log('  1. Prueba el login con las credenciales reales')
    console.log('  2. Verifica que RLS funciona correctamente')
    console.log('  3. Comprueba que los datos se cargan en el Dashboard')

  } catch (error) {
    console.error('💥 Error general:', error.message)
  }
}

// Ejecutar la función
createUsersWithAPI()
