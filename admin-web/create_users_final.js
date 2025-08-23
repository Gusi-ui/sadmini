// =====================================================
// CREAR USUARIOS FINAL - CON API DE SUPABASE
// =====================================================

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = 'https://gkmjnhumsbiscpkbyihv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here'

// Crear cliente de Supabase con service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUsersFinal() {
  console.log('🚀 Creando usuarios final...')

  try {
    // 1. Verificar usuarios existentes
    console.log('📊 Verificando usuarios existentes...')
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listando usuarios:', listError.message)
      return
    }

    const adminExists = existingUsers.users.find(u => u.email === 'admin@sadmini.com')
    const workerExists = existingUsers.users.find(u => u.email === 'trabajadora@sadmini.com')

    console.log(`📊 Usuarios existentes: ${existingUsers.users.length}`)
    console.log(`   - admin@sadmini.com: ${adminExists ? '✅' : '❌'}`)
    console.log(`   - trabajadora@sadmini.com: ${workerExists ? '✅' : '❌'}`)

    // 2. Crear usuario administrador si no existe
    if (!adminExists) {
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
    } else {
      console.log('✅ Administrador ya existe')
    }

    // 3. Crear usuario trabajadora si no existe
    if (!workerExists) {
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
    } else {
      console.log('✅ Trabajadora ya existe')
    }

    // 4. Verificar usuarios después de la creación
    console.log('🔍 Verificando usuarios después de la creación...')
    const { data: finalUsers, error: finalListError } = await supabase.auth.admin.listUsers()
    
    if (finalListError) {
      console.error('❌ Error listando usuarios finales:', finalListError.message)
    } else {
      const targetUsers = finalUsers.users.filter(u => 
        u.email === 'admin@sadmini.com' || u.email === 'trabajadora@sadmini.com'
      )
      console.log(`✅ Usuarios finales: ${targetUsers.length}`)
      targetUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.user_metadata?.role || 'sin rol'})`)
      })
    }

    // 5. Verificar perfiles
    console.log('🔍 Verificando perfiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', ['admin@sadmini.com', 'trabajadora@sadmini.com'])

    if (profilesError) {
      console.error('❌ Error verificando perfiles:', profilesError.message)
    } else {
      console.log(`✅ Perfiles encontrados: ${profiles.length}`)
      profiles.forEach(profile => {
        console.log(`   - ${profile.email} (${profile.role})`)
      })
    }

    console.log('\n🎉 PROCESO COMPLETADO!')
    console.log('📋 CREDENCIALES DE ACCESO:')
    console.log('👤 Administrador: admin@sadmini.com / admin123')
    console.log('👤 Trabajadora: trabajadora@sadmini.com / worker123')
    console.log('\n🚀 Prueba el login ahora en http://localhost:5173')

  } catch (error) {
    console.error('💥 Error general:', error.message)
  }
}

// Ejecutar la función
createUsersFinal()
